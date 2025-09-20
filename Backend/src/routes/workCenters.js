import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE']),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;
    console.log('Query params:', req.query);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [workCenters, total] = await Promise.all([
      prisma.workCenter.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          operations: {
            select: {
              id: true,
              name: true,
              sequence: true
            },
            orderBy: { sequence: 'asc' }
          }
        }
      }),
      prisma.workCenter.count({ where })
    ]);

    const workCentersWithUtilization = workCenters.map(wc => {
      return {
        ...wc,
        utilization: 0, // Default utilization since we don't have workOrders relation
        activeWorkOrders: 0
      };
    });

    res.json({
      success: true,
      data: {
        workCenters: workCentersWithUtilization,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
('Get work centers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work centers'
    });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      include: {
        operations: {
          include: {
            bom: {
              select: {
                id: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          },
          orderBy: { sequence: 'asc' }
        },
        workOrders: {
          include: {
            manufacturingOrder: {
              select: {
                id: true,
                orderNumber: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        error: 'Work center not found'
      });
    }

    const activeWorkOrders = 0; // Default since we don't have workOrders relation
    const utilization = 0; // Default utilization

    res.json({
      success: true,
      data: {
        ...workCenter,
        utilization: utilization,
        activeWorkOrders
      }
    });
  } catch (error) {
('Get work center error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work center'
    });
  }
});

// @route   POST /api/work-centers
// @desc    Create new work center
// @access  Private
router.post('/', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().custom((value) => {
    if (value === null || value === undefined) return true;
    return typeof value === 'string';
  }).withMessage('Description must be a string'),
  body('hourlyRate').isNumeric().withMessage('Hourly rate must be numeric').custom((value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      throw new Error('Hourly rate must be non-negative');
    }
    return true;
  }),
  body('capacity').isNumeric().withMessage('Capacity must be numeric').custom((value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) {
      throw new Error('Capacity must be a positive integer');
    }
    return true;
  }),
  body('status').optional().isIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
], async (req, res) => {
  try {
    console.log('Work center creation request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name,
      description,
      hourlyRate,
      capacity,
      status = 'ACTIVE'
    } = req.body;

    // Handle null/undefined description
    const cleanDescription = description === null || description === undefined ? null : description;

    const workCenter = await prisma.workCenter.create({
      data: {
        name,
        description: cleanDescription,
        hourlyRate,
        capacity,
        status
      }
    });

    res.status(201).json({
      success: true,
      message: 'Work center created successfully',
      data: workCenter
    });
  } catch (error) {
('Create work center error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create work center'
    });
  }
});

// @route   PUT /api/work-centers/:id
// @desc    Update work center
// @access  Private
router.put('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('name').optional().isString(),
  body('description').optional().custom((value) => {
    if (value === null || value === undefined) return true;
    return typeof value === 'string';
  }).withMessage('Description must be a string'),
  body('hourlyRate').optional().isFloat({ min: 0 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;

    const workCenter = await prisma.workCenter.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Work center updated successfully',
      data: workCenter
    });
  } catch (error) {
('Update work center error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work center not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update work center'
    });
  }
});

// @route   DELETE /api/work-centers/:id
// @desc    Delete work center
// @access  Private
router.delete('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if work center has active work orders
    const activeWorkOrders = await prisma.workOrder.count({
      where: {
        workCenterId: id,
        status: { in: ['PENDING', 'IN_PROGRESS', 'PAUSED'] }
      }
    });

    if (activeWorkOrders > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete work center with active work orders'
      });
    }

    await prisma.workCenter.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Work center deleted successfully'
    });
  } catch (error) {
('Delete work center error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work center not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete work center'
    });
  }
});

// @route   GET /api/work-centers/:id/utilization
// @desc    Get work center utilization data
// @access  Private
router.get('/:id/utilization', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      select: { id: true, name: true, capacity: true }
    });

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        error: 'Work center not found'
      });
    }

    // Get work orders for the period
    const workOrders = await prisma.workOrder.findMany({
      where: {
        workCenterId: id,
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        estimatedTimeMinutes: true,
        actualTimeMinutes: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate daily utilization
    const dailyUtilization = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayWorkOrders = workOrders.filter(wo => {
        const woDate = new Date(wo.createdAt);
        return woDate >= date && woDate < nextDate;
      });

      const activeWorkOrders = dayWorkOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
      const utilization = workCenter.capacity > 0 ? (activeWorkOrders / workCenter.capacity) * 100 : 0;

      dailyUtilization.push({
        date: date.toISOString().split('T')[0],
        utilization: Math.round(utilization * 100) / 100,
        activeWorkOrders,
        totalWorkOrders: dayWorkOrders.length
      });
    }

    // Calculate overall statistics
    const totalWorkOrders = workOrders.length;
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    const avgUtilization = dailyUtilization.reduce((sum, day) => sum + day.utilization, 0) / dailyUtilization.length;

    res.json({
      success: true,
      data: {
        workCenter: {
          id: workCenter.id,
          name: workCenter.name,
          capacity: workCenter.capacity
        },
        period: `${days} days`,
        dailyUtilization,
        statistics: {
          totalWorkOrders,
          completedWorkOrders,
          completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
          avgUtilization: Math.round(avgUtilization * 100) / 100
        }
      }
    });
  } catch (error) {
('Get work center utilization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work center utilization'
    });
  }
});

// @route   GET /api/work-centers/:id/schedule
// @desc    Get work center schedule
// @access  Private
router.get('/:id/schedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to next 7 days

    const workOrders = await prisma.workOrder.findMany({
      where: {
        workCenterId: id,
        OR: [
          {
            startedAt: {
              gte: start,
              lte: end
            }
          },
          {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        ]
      },
      include: {
        manufacturingOrder: {
          select: {
            id: true,
            orderNumber: true,
            product: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { sequence: 'asc' }
    });

    res.json({
      success: true,
      data: {
        workCenterId: id,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        workOrders
      }
    });
  } catch (error) {
('Get work center schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work center schedule'
    });
  }
});

export default router;

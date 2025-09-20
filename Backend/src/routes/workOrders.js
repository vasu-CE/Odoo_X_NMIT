import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/work-orders
// @desc    Get all work orders
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'SKIPPED']),
  query('workCenterId').optional().isString(),
  query('assignedToId').optional().isString(),
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
      workCenterId,
      assignedToId,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (workCenterId) where.workCenterId = workCenterId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { operationName: { contains: search, mode: 'insensitive' } },
        { manufacturingOrder: { orderNumber: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
          workCenter: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.workOrder.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        workOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work orders'
    });
  }
});

// @route   GET /api/work-orders/shop-floor
// @desc    Get work orders for shop floor operator (assigned to them)
// @access  Private (SHOP_FLOOR_OPERATOR only)
router.get('/shop-floor', authenticate, authorize('SHOP_FLOOR_OPERATOR' , 'MANUFACTURING_MANAGER'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {
      assignedToId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
          workCenter: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      }),
      prisma.workOrder.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        workOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get shop floor work orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work orders'
    });
  }
});

// @route   GET /api/work-orders/my-assignments
// @desc    Get work orders assigned to current user
// @access  Private
router.get('/my-assignments', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {
      assignedToId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
          workCenter: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      }),
      prisma.workOrder.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        workOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned work orders'
    });
  }
});

// @route   GET /api/work-orders/:id
// @desc    Get single work order
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        manufacturingOrder: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                type: true
              }
            }
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            hourlyRate: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        error: 'Work order not found'
      });
    }

    res.json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work order'
    });
  }
});

// @route   POST /api/work-orders
// @desc    Create new work order
// @access  Private
router.post('/', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('manufacturingOrderId').notEmpty().withMessage('Manufacturing order ID is required'),
  body('operationName').notEmpty().withMessage('Operation name is required'),
  body('sequence').isInt({ min: 1 }).withMessage('Sequence must be positive'),
  body('workCenterId').notEmpty().withMessage('Work center ID is required'),
  body('assignedToId').optional().isString(),
  body('estimatedTimeMinutes').isInt({ min: 1 }).withMessage('Estimated time must be positive'),
  body('comments').optional().isString()
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
      manufacturingOrderId,
      operationName,
      sequence,
      workCenterId,
      assignedToId,
      estimatedTimeMinutes,
      comments
    } = req.body;

    // Verify manufacturing order exists
    const manufacturingOrder = await prisma.manufacturingOrder.findUnique({
      where: { id: manufacturingOrderId }
    });

    if (!manufacturingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found'
      });
    }

    // Verify work center exists
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: workCenterId }
    });

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        error: 'Work center not found'
      });
    }

    // Verify assigned user exists if provided
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId }
      });

      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        manufacturingOrderId,
        operationName,
        sequence,
        workCenterId,
        assignedToId,
        estimatedTimeMinutes,
        comments
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
        workCenter: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create work order'
    });
  }
});

// @route   PUT /api/work-orders/:id
// @desc    Update work order
// @access  Private
router.put('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('operationName').optional().isString(),
  body('sequence').optional().isInt({ min: 1 }),
  body('workCenterId').optional().isString(),
  body('assignedToId').optional().isString(),
  body('estimatedTimeMinutes').optional().isInt({ min: 1 }),
  body('actualTimeMinutes').optional().isInt({ min: 0 }),
  body('comments').optional().isString()
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
    delete updateData.manufacturingOrderId;
    delete updateData.status;
    delete updateData.startedAt;
    delete updateData.pausedAt;
    delete updateData.completedAt;
    delete updateData.createdAt;

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
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
        workCenter: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Work order updated successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Update work order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work order not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update work order'
    });
  }
});

// @route   PATCH /api/work-orders/:id/start
// @desc    Start work order
// @access  Private (SHOP_FLOOR_OPERATOR only)
router.patch('/:id/start', authenticate, authorize('SHOP_FLOOR_OPERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.update({
      where: { 
        id,
        status: 'PENDING'
      },
      data: { 
        status: 'IN_PROGRESS',
        startTime: new Date()
      },
      include: {
        manufacturingOrder: {
          select: {
            orderNumber: true,
            product: { select: { name: true } }
          }
        },
        workCenter: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Work order started successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Start work order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work order not found or cannot be started'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to start work order'
    });
  }
});

// @route   PATCH /api/work-orders/:id/pause
// @desc    Pause work order
// @access  Private (SHOP_FLOOR_OPERATOR only)
router.patch('/:id/pause', authenticate, authorize('SHOP_FLOOR_OPERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get current work order to calculate paused duration
    const currentWorkOrder = await prisma.workOrder.findUnique({
      where: { id }
    });

    if (!currentWorkOrder) {
      return res.status(404).json({
        success: false,
        error: 'Work order not found'
      });
    }

    if (currentWorkOrder.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        error: 'Work order must be in progress to pause'
      });
    }

    const now = new Date();
    const pausedAt = currentWorkOrder.pausedAt || currentWorkOrder.startTime;
    const currentPausedDuration = currentWorkOrder.pausedDuration || 0;
    
    // Calculate additional paused time if resuming from a previous pause
    let additionalPausedTime = 0;
    if (currentWorkOrder.pausedAt) {
      additionalPausedTime = Math.floor((now - currentWorkOrder.pausedAt) / (1000 * 60)); // minutes
    }

    const workOrder = await prisma.workOrder.update({
      where: { 
        id,
        status: 'IN_PROGRESS'
      },
      data: { 
        status: 'PAUSED',
        pausedAt: now,
        pausedDuration: currentPausedDuration + additionalPausedTime
      },
      include: {
        manufacturingOrder: {
          select: {
            orderNumber: true,
            product: { select: { name: true } }
          }
        },
        workCenter: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Work order paused successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Pause work order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work order not found or cannot be paused'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to pause work order'
    });
  }
});

// @route   POST /api/work-orders/:id/resume
// @desc    Resume work order
// @access  Private
router.post('/:id/resume', authenticate, authorize('SHOP_FLOOR_OPERATOR', 'MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.update({
      where: { 
        id,
        status: 'PAUSED'
      },
      data: { 
        status: 'IN_PROGRESS',
        pausedAt: null
      },
      include: {
        manufacturingOrder: {
          select: {
            orderNumber: true,
            product: { select: { name: true } }
          }
        },
        workCenter: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Work order resumed successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Resume work order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work order not found or cannot be resumed'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to resume work order'
    });
  }
});

// @route   PATCH /api/work-orders/:id/done
// @desc    Complete work order
// @access  Private (SHOP_FLOOR_OPERATOR only)
router.patch('/:id/done', authenticate, authorize('SHOP_FLOOR_OPERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get current work order to calculate real duration
    const currentWorkOrder = await prisma.workOrder.findUnique({
      where: { id }
    });

    if (!currentWorkOrder) {
      return res.status(404).json({
        success: false,
        error: 'Work order not found'
      });
    }

    if (!['IN_PROGRESS', 'PAUSED'].includes(currentWorkOrder.status)) {
      return res.status(400).json({
        success: false,
        error: 'Work order must be in progress or paused to complete'
      });
    }

    const now = new Date();
    const startTime = currentWorkOrder.startTime;
    const pausedDuration = currentWorkOrder.pausedDuration || 0;
    
    // Calculate real duration (endTime - startTime - pausedDuration)
    let realDuration = 0;
    if (startTime) {
      const totalDuration = Math.floor((now - startTime) / (1000 * 60)); // minutes
      realDuration = totalDuration - pausedDuration;
    }

    const workOrder = await prisma.workOrder.update({
      where: { 
        id,
        status: { in: ['IN_PROGRESS', 'PAUSED'] }
      },
      data: { 
        status: 'COMPLETED',
        endTime: now,
        completedAt: now,
        realDuration: realDuration
      },
      include: {
        manufacturingOrder: {
          select: {
            orderNumber: true,
            product: { select: { name: true } }
          }
        },
        workCenter: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Work order completed successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Complete work order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work order not found or cannot be completed'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to complete work order'
    });
  }
});

// @route   PATCH /api/work-orders/:id/cancel
// @desc    Cancel work order
// @access  Private (SHOP_FLOOR_OPERATOR only)
router.patch('/:id/cancel', authenticate, authorize('SHOP_FLOOR_OPERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.update({
      where: { 
        id,
        status: { in: ['PENDING', 'IN_PROGRESS', 'PAUSED'] }
      },
      data: { 
        status: 'SKIPPED',
        endTime: new Date()
      },
      include: {
        manufacturingOrder: {
          select: {
            orderNumber: true,
            product: { select: { name: true } }
          }
        },
        workCenter: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Work order cancelled successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Cancel work order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Work order not found or cannot be cancelled'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to cancel work order'
    });
  }
});

export default router;

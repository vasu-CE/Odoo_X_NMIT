import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Generate order number
const generateOrderNumber = async () => {
  const count = await prisma.manufacturingOrder.count();
  return `MO-${String(count + 1).padStart(4, '0')}`;
};

// @route   GET /api/manufacturing-orders
// @desc    Get all manufacturing orders
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'QUALITY_HOLD', 'COMPLETED', 'CANCELED']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
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
      priority,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.manufacturingOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              currentStock: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          bom: {
            select: {
              id: true,
              version: true
            }
          },
          workOrders: {
            select: {
              id: true,
              status: true,
              operationName: true,
              sequence: true
            },
            orderBy: { sequence: 'asc' }
          }
        }
      }),
      prisma.manufacturingOrder.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get manufacturing orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manufacturing orders'
    });
  }
});

// @route   GET /api/manufacturing-orders/:id
// @desc    Get single manufacturing order
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            currentStock: true,
            salesPrice: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        bom: {
          include: {
            components: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    currentStock: true,
                    unit: true
                  }
                }
              }
            },
            operations: {
              include: {
                workCenter: {
                  select: {
                    id: true,
                    name: true,
                    status: true
                  }
                }
              },
              orderBy: { sequence: 'asc' }
            }
          }
        },
        workOrders: {
          include: {
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
          },
          orderBy: { sequence: 'asc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get manufacturing order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manufacturing order'
    });
  }
});

// @route   POST /api/manufacturing-orders
// @desc    Create new manufacturing order
// @access  Private
router.post('/', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('assignedToId').optional().isString(),
  body('bomId').optional().isString(),
  body('notes').optional().isString()
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
      productId,
      quantity,
      priority = 'MEDIUM',
      scheduledDate,
      assignedToId,
      bomId,
      notes
    } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create manufacturing order
    const order = await prisma.manufacturingOrder.create({
      data: {
        orderNumber,
        productId,
        quantity,
        priority,
        scheduledDate: new Date(scheduledDate),
        assignedToId,
        bomId,
        notes
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true
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
      message: 'Manufacturing order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create manufacturing order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manufacturing order'
    });
  }
});

// @route   PUT /api/manufacturing-orders/:id
// @desc    Update manufacturing order
// @access  Private
router.put('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('quantity').optional().isInt({ min: 1 }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('scheduledDate').optional().isISO8601(),
  body('assignedToId').optional().isString(),
  body('notes').optional().isString()
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
    delete updateData.orderNumber;
    delete updateData.productId;
    delete updateData.status;
    delete updateData.createdAt;

    // Convert scheduledDate to Date if provided
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }

    const order = await prisma.manufacturingOrder.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true
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
      message: 'Manufacturing order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update manufacturing order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update manufacturing order'
    });
  }
});

// @route   DELETE /api/manufacturing-orders/:id
// @desc    Delete manufacturing order
// @access  Private
router.delete('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order can be deleted (only planned orders)
    const order = await prisma.manufacturingOrder.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found'
      });
    }

    if (order.status !== 'PLANNED') {
      return res.status(400).json({
        success: false,
        error: 'Only planned orders can be deleted'
      });
    }

    await prisma.manufacturingOrder.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Manufacturing order deleted successfully'
    });
  } catch (error) {
    console.error('Delete manufacturing order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete manufacturing order'
    });
  }
});

// @route   POST /api/manufacturing-orders/:id/confirm
// @desc    Confirm manufacturing order
// @access  Private
router.post('/:id/confirm', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.update({
      where: { 
        id,
        status: 'PLANNED'
      },
      data: { status: 'CONFIRMED' },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Manufacturing order confirmed successfully',
      data: order
    });
  } catch (error) {
    console.error('Confirm manufacturing order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found or cannot be confirmed'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to confirm manufacturing order'
    });
  }
});

// @route   POST /api/manufacturing-orders/:id/start
// @desc    Start manufacturing order
// @access  Private
router.post('/:id/start', authenticate, authorize('MANUFACTURING_MANAGER', 'SHOP_FLOOR_OPERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.update({
      where: { 
        id,
        status: { in: ['PLANNED', 'CONFIRMED'] }
      },
      data: { 
        status: 'IN_PROGRESS',
        startedAt: new Date()
      },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Manufacturing order started successfully',
      data: order
    });
  } catch (error) {
    console.error('Start manufacturing order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found or cannot be started'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to start manufacturing order'
    });
  }
});

// @route   POST /api/manufacturing-orders/:id/complete
// @desc    Complete manufacturing order
// @access  Private
router.post('/:id/complete', authenticate, authorize('MANUFACTURING_MANAGER', 'SHOP_FLOOR_OPERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.update({
      where: { 
        id,
        status: 'IN_PROGRESS'
      },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Manufacturing order completed successfully',
      data: order
    });
  } catch (error) {
    console.error('Complete manufacturing order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found or cannot be completed'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to complete manufacturing order'
    });
  }
});

// @route   POST /api/manufacturing-orders/:id/cancel
// @desc    Cancel manufacturing order
// @access  Private
router.post('/:id/cancel', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.update({
      where: { 
        id,
        status: { in: ['PLANNED', 'CONFIRMED', 'IN_PROGRESS'] }
      },
      data: { status: 'CANCELED' },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Manufacturing order canceled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel manufacturing order error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Manufacturing order not found or cannot be canceled'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to cancel manufacturing order'
    });
  }
});

// @route   GET /api/manufacturing-orders/:id/work-orders
// @desc    Get work orders for manufacturing order
// @access  Private
router.get('/:id/work-orders', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const workOrders = await prisma.workOrder.findMany({
      where: { manufacturingOrderId: id },
      include: {
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
      },
      orderBy: { sequence: 'asc' }
    });

    res.json({
      success: true,
      data: workOrders
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work orders'
    });
  }
});

export default router;

import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('productId').optional().isString(),
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
      productId,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (productId) where.productId = productId;
    if (search) {
      where.OR = [
        { finished_product: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { version: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [boms, total] = await Promise.all([
      prisma.bOM.findMany({
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
              description: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          components: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  currentStock: true
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
      }),
      prisma.bOM.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        boms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
('Get BOMs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch BOMs'
    });
  }
});

// @route   GET /api/boms/:id
// @desc    Get single BOM
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const bom = await prisma.bOM.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            unit: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        components: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
                currentStock: true,
                purchasePrice: true
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
                description: true,
                status: true,
                hourlyRate: true
              }
            }
          },
          orderBy: { sequence: 'asc' }
        }
      }
    });

    if (!bom) {
      return res.status(404).json({
        success: false,
        error: 'BOM not found'
      });
    }

    res.json({
      success: true,
      data: bom
    });
  } catch (error) {
('Get BOM error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch BOM'
    });
  }
});

// @route   POST /api/boms
// @desc    Create new BOM
// @access  Private
router.post('/', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('finished_product').notEmpty().withMessage('Finished product name is required'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
  body('reference').optional().isString(),
  body('components').isArray().withMessage('Components must be an array'),
  body('components.*.product_id').notEmpty().withMessage('Component product ID is required'),
  body('components.*.quantity').isFloat({ min: 0.01 }).withMessage('Component quantity must be positive'),
  body('components.*.unit').optional().isString(),
  body('workOrders').optional().isArray().withMessage('Work orders must be an array'),
  body('workOrders.*.operation').optional().notEmpty().withMessage('Operation name is required'),
  body('workOrders.*.work_center_id').optional().notEmpty().withMessage('Work center ID is required'),
  body('workOrders.*.expected_duration').optional().isFloat({ min: 0 }).withMessage('Expected duration must be non-negative')
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
      finished_product,
      quantity,
      reference = '',
      components = [],
      workOrders = []
    } = req.body;

    // Verify all component products exist
    const componentProductIds = components.map(c => c.product_id);
    const componentProducts = await prisma.product.findMany({
      where: { id: { in: componentProductIds } }
    });

    if (componentProducts.length !== componentProductIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more component products not found'
      });
    }

    // Verify all work centers exist (only if work orders exist)
    if (workOrders && workOrders.length > 0) {
      const workCenterIds = workOrders.map(wo => wo.work_center_id);
      console.log('Work center IDs received:', workCenterIds);
      console.log('Work orders received:', workOrders);
      
      const workCenters = await prisma.workCenter.findMany({
        where: { id: { in: workCenterIds } }
      });
      
      console.log('Work centers found in database:', workCenters.map(wc => wc.id));
      console.log('Expected work center IDs:', workCenterIds);
      console.log('Found work centers count:', workCenters.length);
      console.log('Expected work centers count:', workCenterIds.length);

      if (workCenters.length !== workCenterIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more work centers not found',
          details: {
            received: workCenterIds,
            found: workCenters.map(wc => wc.id),
            missing: workCenterIds.filter(id => !workCenters.find(wc => wc.id === id))
          }
        });
      }
    } else {
      console.log('No work orders provided, skipping work center validation');
    }

    // Create BOM with components and work orders
    const bom = await prisma.bOM.create({
      data: {
        finished_product,
        quantity,
        reference,
        isActive: true, // Set to active by default
        createdById: req.user.id,
        components: {
          create: components.map(comp => ({
            productId: comp.product_id,
            quantity: comp.quantity,
            unit: comp.unit || 'PCS',
            wastage: 0
          }))
        },
        operations: workOrders && workOrders.length > 0 ? {
          create: workOrders.map((wo, index) => ({
            sequence: index + 1,
            name: wo.operation,
            description: '',
            timeMinutes: Math.round(wo.expected_duration),
            workCenterId: wo.work_center_id
          }))
        } : undefined
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        components: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
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
    });

    res.status(201).json({
      success: true,
      message: 'BOM created successfully',
      data: {
        ...bom,
        finished_product: bom.finished_product,
        quantity: bom.quantity,
        reference: bom.reference
      }
    });
  } catch (error) {
('Create BOM error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create BOM'
    });
  }
});

// @route   PUT /api/boms/:id
// @desc    Update BOM
// @access  Private
router.put('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), [
  body('version').optional().isString(),
  body('components').optional().isArray(),
  body('operations').optional().isArray()
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
    const { version, components, operations } = req.body;

    // Check if BOM exists
    const existingBom = await prisma.bOM.findUnique({
      where: { id }
    });

    if (!existingBom) {
      return res.status(404).json({
        success: false,
        error: 'BOM not found'
      });
    }

    // Update BOM
    const updateData = {};
    if (version) updateData.version = version;

    // If components are provided, replace them
    if (components) {
      // Delete existing components
      await prisma.bOMComponent.deleteMany({
        where: { bomId: id }
      });
    }

    // If operations are provided, replace them
    if (operations) {
      // Delete existing operations
      await prisma.bOMOperation.deleteMany({
        where: { bomId: id }
      });
    }

    const bom = await prisma.bOM.update({
      where: { id },
      data: {
        ...updateData,
        ...(components && {
          components: {
            create: components.map(comp => ({
              productId: comp.productId,
              quantity: comp.quantity,
              unit: comp.unit || 'PCS',
              wastage: comp.wastage || 0
            }))
          }
        }),
        ...(operations && {
          operations: {
            create: operations.map(op => ({
              sequence: op.sequence,
              name: op.name,
              description: op.description,
              timeMinutes: op.timeMinutes,
              workCenterId: op.workCenterId
            }))
          }
        })
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        components: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
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
    });

    res.json({
      success: true,
      message: 'BOM updated successfully',
      data: bom
    });
  } catch (error) {
('Update BOM error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update BOM'
    });
  }
});

// @route   DELETE /api/boms/:id
// @desc    Delete BOM
// @access  Private
router.delete('/:id', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if BOM is being used by any manufacturing orders
    const manufacturingOrders = await prisma.manufacturingOrder.findMany({
      where: { bomId: id },
      select: { id: true, orderNumber: true }
    });

    if (manufacturingOrders.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete BOM that is being used by manufacturing orders',
        details: manufacturingOrders
      });
    }

    await prisma.bOM.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'BOM deleted successfully'
    });
  } catch (error) {
('Delete BOM error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'BOM not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete BOM'
    });
  }
});

// @route   POST /api/boms/:id/activate
// @desc    Activate BOM (deactivate others for same product)
// @access  Private
router.post('/:id/activate', authenticate, authorize('MANUFACTURING_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the BOM to find its product
    const bom = await prisma.bOM.findUnique({
      where: { id },
      select: { productId: true }
    });

    if (!bom) {
      return res.status(404).json({
        success: false,
        error: 'BOM not found'
      });
    }

    // Deactivate all BOMs for this product
    await prisma.bOM.updateMany({
      where: { productId: bom.productId },
      data: { isActive: false }
    });

    // Activate this BOM
    const activatedBom = await prisma.bOM.update({
      where: { id },
      data: { isActive: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'BOM activated successfully',
      data: activatedBom
    });
  } catch (error) {
('Activate BOM error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate BOM'
    });
  }
});

// @route   GET /api/boms/product/:productId
// @desc    Get BOMs for a specific product
// @access  Private
router.get('/product/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const boms = await prisma.bOM.findMany({
      where: { productId },
      orderBy: [
        { isActive: 'desc' },
        { version: 'desc' }
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        components: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
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
    });

    res.json({
      success: true,
      data: boms
    });
  } catch (error) {
('Get BOMs by product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch BOMs for product'
    });
  }
});

export default router;

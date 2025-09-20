import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stock-movements
// @desc    Get all stock movements
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('productId').optional().isString(),
  query('movementType').optional().isIn(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
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
      movementType,
      startDate,
      endDate,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            type: true
          }
        }
      }
    });

    res.json(stockMovements);
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock movements'
    });
  }
});

// @route   POST /api/stock-movements
// @desc    Create new stock movement
// @access  Private
router.post('/', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('movementType').isIn(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']).withMessage('Invalid movement type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('unitCost').optional().isFloat({ min: 0 }),
  body('reference').optional().isString(),
  body('referenceId').optional().isString(),
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
      movementType,
      quantity,
      unitCost,
      reference,
      referenceId,
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

    // Calculate new stock level
    let newStock = product.currentStock;
    if (movementType === 'IN') {
      newStock += quantity;
    } else if (movementType === 'OUT') {
      newStock -= quantity;
    } else if (movementType === 'ADJUSTMENT') {
      newStock = quantity;
    }

    // Check if stock would go negative (except for adjustments)
    if (newStock < 0 && movementType !== 'ADJUSTMENT') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock for this operation'
      });
    }

    // Calculate total value
    const totalValue = unitCost ? quantity * unitCost : null;

    // Create stock movement and update product in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId,
          movementType,
          quantity,
          unitCost,
          totalValue,
          reference,
          referenceId,
          notes
        }
      });

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      return { stockMovement, updatedProduct };
    });

    res.status(201).json({
      success: true,
      message: 'Stock movement created successfully',
      data: result.stockMovement
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stock movement'
    });
  }
});

// @route   GET /api/stock-movements/product/:productId
// @desc    Get stock movements for a specific product
// @access  Private
router.get('/product/:productId', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('movementType').optional().isIn(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
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

    const { productId } = req.params;
    const {
      page = 1,
      limit = 20,
      movementType,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { productId };
    if (movementType) where.movementType = movementType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [stockMovements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        stockMovements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get product stock movements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product stock movements'
    });
  }
});

// @route   GET /api/inventory/summary
// @desc    Get inventory summary
// @access  Private
router.get('/inventory/summary', authenticate, async (req, res) => {
  try {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      recentMovements
    ] = await Promise.all([
      // Total active products
      prisma.product.count({
        where: { isActive: true }
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          isActive: true,
          currentStock: {
            lte: prisma.product.fields.reorderPoint
          },
          currentStock: { gt: 0 }
        },
        select: {
          id: true,
          name: true,
          currentStock: true,
          reorderPoint: true,
          unit: true
        }
      }),
      
      // Out of stock products
      prisma.product.findMany({
        where: {
          isActive: true,
          currentStock: 0
        },
        select: {
          id: true,
          name: true,
          unit: true
        }
      }),
      
      // Total inventory value
      prisma.product.aggregate({
        where: {
          isActive: true,
          salesPrice: { not: null }
        },
        _sum: {
          currentStock: true
        }
      }),
      
      // Recent stock movements
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true
            }
          }
        }
      })
    ]);

    // Calculate inventory value
    const inventoryValue = await prisma.product.aggregate({
      where: {
        isActive: true,
        salesPrice: { not: null }
      },
      _sum: {
        currentStock: true
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          totalValue: inventoryValue._sum.currentStock || 0
        },
        lowStockProducts,
        outOfStockProducts,
        recentMovements
      }
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory summary'
    });
  }
});

// @route   GET /api/inventory/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/inventory/low-stock', authenticate, async (req, res) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        currentStock: {
          lte: prisma.product.fields.reorderPoint
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        currentStock: true,
        reorderPoint: true,
        unit: true,
        type: true,
        category: true,
        salesPrice: true,
        purchasePrice: true
      },
      orderBy: [
        { currentStock: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock products'
    });
  }
});

export default router;

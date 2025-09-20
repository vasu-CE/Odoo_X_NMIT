import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE']),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('lowStock').optional().isBoolean()
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
      type,
      category,
      search,
      lowStock
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { hsnCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (lowStock === 'true') {
      where.currentStock = {
        lte: prisma.product.fields.reorderPoint
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          stockMovements: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              movementType: true,
              quantity: true,
              createdAt: true,
              reference: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            movementType: true,
            quantity: true,
            unitCost: true,
            totalValue: true,
            reference: true,
            referenceId: true,
            notes: true,
            createdAt: true
          }
        },
        boms: {
          where: { isActive: true },
          select: {
            id: true,
            version: true,
            createdAt: true
          }
        },
        manufacturingOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            quantity: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE']).withMessage('Invalid product type'),
  body('description').optional().isString(),
  body('unit').optional().isString(),
  body('salesPrice').optional().isFloat({ min: 0 }),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('currentStock').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('hsnCode').optional().isString(),
  body('category').optional().isString()
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
      name,
      type,
      description,
      unit = 'PCS',
      salesPrice,
      purchasePrice,
      currentStock = 0,
      reorderPoint = 0,
      hsnCode,
      category
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        type,
        description,
        unit,
        salesPrice,
        purchasePrice,
        currentStock,
        reorderPoint,
        hsnCode,
        category
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('name').optional().isString(),
  body('type').optional().isIn(['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE']),
  body('description').optional().isString(),
  body('unit').optional().isString(),
  body('salesPrice').optional().isFloat({ min: 0 }),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('hsnCode').optional().isString(),
  body('category').optional().isString(),
  body('isActive').optional().isBoolean()
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
    delete updateData.currentStock;
    delete updateData.createdAt;

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private
router.delete('/:id', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product is being used by any manufacturing orders
    const manufacturingOrders = await prisma.manufacturingOrder.findMany({
      where: { productId: id },
      select: { id: true, orderNumber: true }
    });

    if (manufacturingOrders.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete product that is being used by manufacturing orders',
        details: manufacturingOrders
      });
    }

    // Soft delete by setting isActive to false
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// @route   GET /api/products/:id/stock
// @desc    Get product stock information
// @access  Private
router.get('/:id/stock', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        currentStock: true,
        reorderPoint: true,
        unit: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get stock movements for the period
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        productId: id,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        movementType: true,
        quantity: true,
        unitCost: true,
        totalValue: true,
        reference: true,
        referenceId: true,
        notes: true,
        createdAt: true
      }
    });

    // Calculate stock statistics
    const totalIn = stockMovements
      .filter(m => m.movementType === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalOut = stockMovements
      .filter(m => m.movementType === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);

    const avgUnitCost = stockMovements
      .filter(m => m.unitCost && m.unitCost > 0)
      .reduce((sum, m) => sum + m.unitCost, 0) / 
      stockMovements.filter(m => m.unitCost && m.unitCost > 0).length || 0;

    res.json({
      success: true,
      data: {
        product,
        period: `${days} days`,
        stockMovements,
        statistics: {
          totalIn,
          totalOut,
          netMovement: totalIn - totalOut,
          avgUnitCost: Math.round(avgUnitCost * 100) / 100,
          stockValue: product.currentStock * avgUnitCost
        }
      }
    });
  } catch (error) {
    console.error('Get product stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product stock information'
    });
  }
});

// @route   POST /api/products/:id/stock-adjustment
// @desc    Adjust product stock
// @access  Private
router.post('/:id/stock-adjustment', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('quantity').isInt().withMessage('Quantity is required'),
  body('movementType').isIn(['IN', 'OUT', 'ADJUSTMENT']).withMessage('Invalid movement type'),
  body('unitCost').optional().isFloat({ min: 0 }),
  body('notes').optional().isString(),
  body('reference').optional().isString(),
  body('referenceId').optional().isString()
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
    const {
      quantity,
      movementType,
      unitCost,
      notes,
      reference,
      referenceId
    } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id }
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

    // Check if stock would go negative
    if (newStock < 0) {
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
          productId: id,
          movementType,
          quantity: Math.abs(quantity),
          unitCost,
          totalValue,
          reference,
          referenceId,
          notes
        }
      });

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock }
      });

      return { stockMovement, updatedProduct };
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        stockMovement: result.stockMovement,
        product: result.updatedProduct
      }
    });
  } catch (error) {
    console.error('Stock adjustment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adjust stock'
    });
  }
});

export default router;

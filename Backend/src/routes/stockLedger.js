import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stock-ledger/products
// @desc    Get products for stock ledger (raw materials from BOM + finished products)
// @access  Private
router.get('/products', authenticate, [
  query('type').optional().isIn(['raw_material', 'finished_good', 'all']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { type = 'all', search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      isActive: true
    };

    // Filter by product type
    if (type === 'raw_material') {
      where.type = 'RAW_MATERIAL';
    } else if (type === 'finished_good') {
      where.type = 'FINISHED_GOOD';
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          unit: true,
          salesPrice: true,
          purchasePrice: true,
          currentStock: true,
          reorderPoint: true,
          category: true,
          hsnCode: true,
          createdAt: true,
          // Include BOM information for raw materials
          bomComponents: {
            select: {
              bom: {
                select: {
                  id: true,
                  version: true,
                  isActive: true
                }
              }
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Add stock aggregation data
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        // Get recent stock movements for aggregation
        const recentMovements = await prisma.stockMovement.findMany({
          where: { productId: product.id },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        // Calculate stock metrics
        const incoming = recentMovements
          .filter(m => m.movementType === 'IN')
          .reduce((sum, m) => sum + m.quantity, 0);
        
        const outgoing = recentMovements
          .filter(m => m.movementType === 'OUT')
          .reduce((sum, m) => sum + m.quantity, 0);

        const freeToUse = Math.max(0, product.currentStock - product.reorderPoint);
        const totalValue = product.currentStock * (product.purchasePrice || 0);

        return {
          ...product,
          stockMetrics: {
            onHand: product.currentStock,
            freeToUse,
            totalValue,
            incoming,
            outgoing,
            avgUnitCost: product.purchasePrice || 0
          },
          isRawMaterial: product.type === 'RAW_MATERIAL',
          isFinishedGood: product.type === 'FINISHED_GOOD',
          hasBOM: product.bomComponents.length > 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        products: productsWithStock,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get stock ledger products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// @route   GET /api/stock-ledger/aggregation
// @desc    Get stock aggregation summary
// @access  Private
router.get('/aggregation', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        currentStock: true,
        purchasePrice: true,
        reorderPoint: true
      }
    });

    // Calculate summary metrics
    const summary = {
      totalProducts: products.length,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      byType: {
        raw_material: 0,
        finished_good: 0,
        wip: 0,
        consumable: 0
      }
    };

    const productAggregations = products.map(product => {
      const totalValue = product.currentStock * (product.purchasePrice || 0);
      summary.totalValue += totalValue;

      // Count by type
      if (product.type === 'RAW_MATERIAL') summary.byType.raw_material++;
      else if (product.type === 'FINISHED_GOOD') summary.byType.finished_good++;
      else if (product.type === 'WIP') summary.byType.wip++;
      else if (product.type === 'CONSUMABLE') summary.byType.consumable++;

      // Count stock status
      if (product.currentStock === 0) summary.outOfStock++;
      else if (product.currentStock <= product.reorderPoint) summary.lowStock++;

      return {
        productId: product.id,
        onHand: product.currentStock,
        freeToUse: Math.max(0, product.currentStock - product.reorderPoint),
        totalValue,
        avgUnitCost: product.purchasePrice || 0,
        incoming: 0, // Will be calculated from recent movements
        outgoing: 0  // Will be calculated from recent movements
      };
    });

    res.json({
      success: true,
      data: {
        summary,
        products: productAggregations
      }
    });
  } catch (error) {
    console.error('Get stock aggregation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock aggregation'
    });
  }
});

// @route   POST /api/stock-ledger/products
// @desc    Create new product for stock ledger
// @access  Private
router.post('/products', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('type').isIn(['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE']).withMessage('Invalid product type'),
  body('unit').optional().isString(),
  body('description').optional().isString(),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('salesPrice').optional().isFloat({ min: 0 }),
  body('initialStock').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('category').optional().isString(),
  body('hsnCode').optional().isString()
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
      unit = 'PCS',
      description,
      purchasePrice,
      salesPrice,
      initialStock = 0,
      reorderPoint = 0,
      category,
      hsnCode
    } = req.body;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        type,
        unit,
        description,
        purchasePrice,
        salesPrice,
        currentStock: initialStock,
        reorderPoint,
        category,
        hsnCode
      }
    });

    // If initial stock is provided, create initial stock movement
    if (initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          movementType: 'IN',
          quantity: initialStock,
          unitCost: purchasePrice || 0,
          totalValue: initialStock * (purchasePrice || 0),
          reference: 'INITIAL_STOCK',
          notes: 'Initial stock entry'
        }
      });
    }

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// @route   PUT /api/stock-ledger/products/:id
// @desc    Update product
// @access  Private
router.put('/products/:id', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('name').optional().isString(),
  body('type').optional().isIn(['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE']),
  body('unit').optional().isString(),
  body('description').optional().isString(),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('salesPrice').optional().isFloat({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('category').optional().isString(),
  body('hsnCode').optional().isString()
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

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// @route   POST /api/stock-ledger/movements
// @desc    Create stock movement (incoming/outgoing/adjustment)
// @access  Private
router.post('/movements', authenticate, authorize('INVENTORY_MANAGER', 'ADMIN'), [
  body('productId').optional().isString(),
  body('productName').optional().isString(),
  body('movementType').isIn(['IN', 'OUT', 'ADJUSTMENT']).withMessage('Invalid movement type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('unitCost').optional().isFloat({ min: 0 }),
  body('unit').optional().isString(),
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
      productName,
      movementType,
      quantity,
      unitCost,
      unit,
      reference,
      referenceId,
      notes
    } = req.body;

    let product;
    let actualProductId = productId;

    if (productId) {
      // Verify product exists by ID
      product = await prisma.product.findUnique({
        where: { id: productId }
      });
    } else if (productName) {
      // Find or create product by name
      product = await prisma.product.findFirst({
        where: { 
          name: { 
            equals: productName, 
            mode: 'insensitive' 
          } 
        }
      });

      if (!product) {
        // Create new product
        product = await prisma.product.create({
          data: {
            name: productName,
            type: 'FINISHED_GOOD',
            unit: unit || 'PCS',
            purchasePrice: unitCost || 0,
            currentStock: 0,
            reorderPoint: 0,
            category: 'Stock Entry'
          }
        });
      }
      actualProductId = product.id;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either productId or productName is required'
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Allow any stock movement - no constraints
    // Note: In production, you might want to add business logic constraints here

    // Calculate new stock level - allow negative stock
    let newStock = product.currentStock;
    if (movementType === 'IN') {
      newStock += quantity;
    } else if (movementType === 'OUT') {
      newStock -= quantity; // Allow negative stock
    } else if (movementType === 'ADJUSTMENT') {
      newStock = quantity; // Direct adjustment - can be any value
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId: actualProductId,
          movementType,
          quantity,
          unitCost,
          totalValue: quantity * (unitCost || 0),
          reference,
          referenceId,
          notes
        }
      });

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: actualProductId },
        data: { currentStock: newStock }
      });

      return { stockMovement, updatedProduct };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Stock movement created successfully'
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stock movement'
    });
  }
});

// @route   POST /api/stock-ledger/auto-update
// @desc    Auto-update stock after work order completion
// @access  Private
router.post('/auto-update', authenticate, async (req, res) => {
  try {
    const { workOrderId, manufacturingOrderId } = req.body;

    if (!workOrderId && !manufacturingOrderId) {
      return res.status(400).json({
        success: false,
        error: 'Work order ID or manufacturing order ID is required'
      });
    }

    let workOrders = [];

    if (workOrderId) {
      // Get specific work order
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
          manufacturingOrder: {
            include: {
              product: true,
              requiredMaterials: {
                include: {
                  product: true
                }
              }
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

      workOrders = [workOrder];
    } else {
      // Get all work orders for manufacturing order
      workOrders = await prisma.workOrder.findMany({
        where: { manufacturingOrderId },
        include: {
          manufacturingOrder: {
            include: {
              product: true,
              requiredMaterials: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });
    }

    const stockMovements = [];

    for (const workOrder of workOrders) {
      const { manufacturingOrder } = workOrder;

      // If work order is completed, update stock
      if (workOrder.status === 'COMPLETED') {
        // Consume raw materials (OUT movement)
        for (const material of manufacturingOrder.requiredMaterials) {
          const consumedQuantity = material.consumedQuantity || material.requiredQuantity;
          
          if (consumedQuantity > 0) {
            const movement = await prisma.stockMovement.create({
              data: {
                productId: material.productId,
                movementType: 'OUT',
                quantity: consumedQuantity,
                unitCost: material.product.purchasePrice || 0,
                totalValue: consumedQuantity * (material.product.purchasePrice || 0),
                reference: 'WORK_ORDER_CONSUMPTION',
                referenceId: workOrder.id,
                notes: `Consumed for work order: ${workOrder.operationName}`
              }
            });

            stockMovements.push(movement);

            // Update product stock
            await prisma.product.update({
              where: { id: material.productId },
              data: {
                currentStock: {
                  decrement: consumedQuantity
                }
              }
            });
          }
        }

        // If this is the final work order, produce finished goods (IN movement)
        const allWorkOrders = await prisma.workOrder.findMany({
          where: { manufacturingOrderId: manufacturingOrder.id }
        });

        const isLastWorkOrder = allWorkOrders.every(wo => 
          wo.id === workOrder.id || wo.status === 'COMPLETED'
        );

        if (isLastWorkOrder) {
          const finishedGoodMovement = await prisma.stockMovement.create({
            data: {
              productId: manufacturingOrder.productId,
              movementType: 'IN',
              quantity: manufacturingOrder.quantity,
              unitCost: manufacturingOrder.product.purchasePrice || 0,
              totalValue: manufacturingOrder.quantity * (manufacturingOrder.product.purchasePrice || 0),
              reference: 'MANUFACTURING_COMPLETION',
              referenceId: manufacturingOrder.id,
              notes: `Produced from manufacturing order: ${manufacturingOrder.orderNumber}`
            }
          });

          stockMovements.push(finishedGoodMovement);

          // Update finished product stock
          await prisma.product.update({
            where: { id: manufacturingOrder.productId },
            data: {
              currentStock: {
                increment: manufacturingOrder.quantity
              }
            }
          });
        }
      }
    }

    res.json({
      success: true,
      data: { stockMovements },
      message: 'Stock updated automatically'
    });
  } catch (error) {
    console.error('Auto-update stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-update stock'
    });
  }
});

// @route   GET /api/stock-ledger/movements/:productId
// @desc    Get stock movements for a specific product
// @access  Private
router.get('/movements/:productId', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
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
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { productId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: parseInt(limit),
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
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        movements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get product movements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product movements'
    });
  }
});

export default router;

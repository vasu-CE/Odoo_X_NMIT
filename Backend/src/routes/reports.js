import express from "express";
import { query, body, validationResult } from "express-validator";
import { prisma } from "../config/database.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/reports/production-summary
// @desc    Get production summary report
// @access  Private
router.get(
  "/production-summary",
  authenticate,
  [
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("productId").optional().isString(),
    query("status")
      .optional()
      .isIn([
        "DRAFT",
        "CONFIRMED",
        "IN_PROGRESS",
        "QUALITY_HOLD",
        "DONE",
        "CANCELLED",
      ]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { startDate, endDate, productId, status } = req.query;

      // Build where clause
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (productId) where.productId = productId;
      if (status) where.status = status;

      const [
        ordersByStatus,
        ordersByPriority,
        ordersByProduct,
        totalOrders,
        completedOrders,
        avgCompletionTime,
        topProducts,
      ] = await Promise.all([
        // Orders by status
        prisma.manufacturingOrder.groupBy({
          by: ["status"],
          _count: { status: true },
          where,
        }),

        // Orders by priority
        prisma.manufacturingOrder.groupBy({
          by: ["priority"],
          _count: { priority: true },
          where,
        }),

        // Orders by product
        prisma.manufacturingOrder.groupBy({
          by: ["productId"],
          _count: { productId: true },
          _sum: { quantity: true },
          where,
          orderBy: { _count: { productId: "desc" } },
          take: 10,
        }),

        // Total orders
        prisma.manufacturingOrder.count({ where }),

        // Completed orders
        prisma.manufacturingOrder.count({
          where: { ...where, status: "DONE" },
        }),

        // Average completion time
        prisma.manufacturingOrder.aggregate({
          where: {
            ...where,
            status: "DONE",
            startedAt: { not: null },
            completedAt: { not: null },
          },
          _avg: {
            // This would need a computed field for completion time
          },
        }),

        // Top products by quantity
        prisma.manufacturingOrder.groupBy({
          by: ["productId"],
          _sum: { quantity: true },
          where,
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
      ]);

      // Get product details for top products
      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, type: true },
          });
          return {
            ...item,
            product,
          };
        })
      );

      // Get product details for orders by product
      const ordersByProductWithDetails = await Promise.all(
        ordersByProduct.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, type: true },
          });
          return {
            ...item,
            product,
          };
        })
      );

      res.json({
        success: true,
        data: {
          summary: {
            totalOrders,
            completedOrders,
            completionRate:
              totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          },
          ordersByStatus,
          ordersByPriority,
          ordersByProduct: ordersByProductWithDetails,
          topProducts: topProductsWithDetails,
        },
      });
    } catch (error) {
      console.error("Production summary report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate production summary report",
      });
    }
  }
);

// @route   GET /api/reports/resource-utilization
// @desc    Get resource utilization report
// @access  Private
router.get(
  "/resource-utilization",
  authenticate,
  [
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("workCenterId").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { startDate, endDate, workCenterId } = req.query;

      // Build where clause for work orders
      const workOrderWhere = {};
      if (startDate || endDate) {
        workOrderWhere.createdAt = {};
        if (startDate) workOrderWhere.createdAt.gte = new Date(startDate);
        if (endDate) workOrderWhere.createdAt.lte = new Date(endDate);
      }
      if (workCenterId) workOrderWhere.workCenterId = workCenterId;

      const [workCenters, workOrderStats, userUtilization] = await Promise.all([
        // Work centers with utilization
        prisma.workCenter.findMany({
          include: {
            workOrders: {
              where: workOrderWhere,
              select: {
                id: true,
                status: true,
                estimatedTimeMinutes: true,
                actualTimeMinutes: true,
                startedAt: true,
                completedAt: true,
              },
            },
          },
        }),

        // Work order statistics
        prisma.workOrder.groupBy({
          by: ["status"],
          _count: { status: true },
          where: workOrderWhere,
        }),

        // User utilization
        prisma.workOrder.groupBy({
          by: ["assignedToId"],
          _count: { assignedToId: true },
          _sum: { actualTimeMinutes: true },
          where: {
            ...workOrderWhere,
            assignedToId: { not: null },
          },
          orderBy: { _count: { assignedToId: "desc" } },
          take: 10,
        }),
      ]);

      // Calculate utilization for each work center
      const workCentersWithUtilization = workCenters.map((wc) => {
        const activeWorkOrders = wc.workOrders.filter(
          (wo) => wo.status === "IN_PROGRESS"
        ).length;
        const completedWorkOrders = wc.workOrders.filter(
          (wo) => wo.status === "DONE"
        ).length;
        const utilization =
          wc.capacity > 0 ? (activeWorkOrders / wc.capacity) * 100 : 0;

        const totalEstimatedTime = wc.workOrders.reduce(
          (sum, wo) => sum + (wo.estimatedTimeMinutes || 0),
          0
        );
        const totalActualTime = wc.workOrders.reduce(
          (sum, wo) => sum + (wo.actualTimeMinutes || 0),
          0
        );
        const efficiency =
          totalEstimatedTime > 0
            ? (totalActualTime / totalEstimatedTime) * 100
            : 0;

        return {
          ...wc,
          utilization: Math.round(utilization * 100) / 100,
          activeWorkOrders,
          completedWorkOrders,
          totalWorkOrders: wc.workOrders.length,
          efficiency: Math.round(efficiency * 100) / 100,
        };
      });

      // Get user details for utilization
      const userUtilizationWithDetails = await Promise.all(
        userUtilization.map(async (item) => {
          const user = await prisma.user.findUnique({
            where: { id: item.assignedToId },
            select: { id: true, name: true, email: true, role: true },
          });
          return {
            ...item,
            user,
          };
        })
      );

      res.json({
        success: true,
        data: {
          workCenters: workCentersWithUtilization,
          workOrderStats,
          userUtilization: userUtilizationWithDetails,
        },
      });
    } catch (error) {
      console.error("Resource utilization report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate resource utilization report",
      });
    }
  }
);

// @route   GET /api/reports/inventory-valuation
// @desc    Get inventory valuation report
// @access  Private
router.get(
  "/inventory-valuation",
  authenticate,
  [
    query("category").optional().isString(),
    query("type")
      .optional()
      .isIn(["RAW_MATERIAL", "WIP", "FINISHED_GOOD", "CONSUMABLE"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { category, type } = req.query;

      // Build where clause
      const where = { isActive: true };
      if (category) where.category = category;
      if (type) where.type = type;

      const [products, categorySummary, typeSummary, totalValue] =
        await Promise.all([
          // All products with stock
          prisma.product.findMany({
            where,
            select: {
              id: true,
              name: true,
              type: true,
              category: true,
              currentStock: true,
              unit: true,
              salesPrice: true,
              purchasePrice: true,
              reorderPoint: true,
            },
            orderBy: { name: "asc" },
          }),

          // Summary by category
          prisma.product.groupBy({
            by: ["category"],
            _sum: { currentStock: true },
            _count: { category: true },
            where,
          }),

          // Summary by type
          prisma.product.groupBy({
            by: ["type"],
            _sum: { currentStock: true },
            _count: { type: true },
            where,
          }),

          // Total inventory value
          prisma.product.aggregate({
            where,
            _sum: { currentStock: true },
          }),
        ]);

      // Calculate values for each product
      const productsWithValues = products.map((product) => {
        const stockValue = product.salesPrice
          ? product.currentStock * product.salesPrice
          : 0;
        const costValue = product.purchasePrice
          ? product.currentStock * product.purchasePrice
          : 0;
        const isLowStock = product.currentStock <= product.reorderPoint;

        return {
          ...product,
          stockValue: Math.round(stockValue * 100) / 100,
          costValue: Math.round(costValue * 100) / 100,
          isLowStock,
        };
      });

      // Calculate total values
      const totalStockValue = productsWithValues.reduce(
        (sum, p) => sum + p.stockValue,
        0
      );
      const totalCostValue = productsWithValues.reduce(
        (sum, p) => sum + p.costValue,
        0
      );
      const lowStockCount = productsWithValues.filter(
        (p) => p.isLowStock
      ).length;

      res.json({
        success: true,
        data: {
          products: productsWithValues,
          summary: {
            totalProducts: products.length,
            totalStockValue: Math.round(totalStockValue * 100) / 100,
            totalCostValue: Math.round(totalCostValue * 100) / 100,
            lowStockCount,
          },
          categorySummary,
          typeSummary,
        },
      });
    } catch (error) {
      console.error("Inventory valuation report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate inventory valuation report",
      });
    }
  }
);

// @route   GET /api/reports/work-order-performance
// @desc    Get work order performance report
// @access  Private
router.get(
  "/work-order-performance",
  authenticate,
  [
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("workCenterId").optional().isString(),
    query("assignedToId").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { startDate, endDate, workCenterId, assignedToId } = req.query;

      // Build where clause
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (workCenterId) where.workCenterId = workCenterId;
      if (assignedToId) where.assignedToId = assignedToId;

      const [
        workOrders,
        performanceByWorkCenter,
        performanceByUser,
        statusSummary,
      ] = await Promise.all([
        // Work orders with details
        prisma.workOrder.findMany({
          where,
          include: {
            manufacturingOrder: {
              select: {
                id: true,
                orderNumber: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            },
            workCenter: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        // Performance by work center
        prisma.workOrder.groupBy({
          by: ["workCenterId"],
          _count: { workCenterId: true },
          _sum: {
            estimatedTimeMinutes: true,
            actualTimeMinutes: true,
          },
          where,
        }),

        // Performance by user
        prisma.workOrder.groupBy({
          by: ["assignedToId"],
          _count: { assignedToId: true },
          _sum: {
            estimatedTimeMinutes: true,
            actualTimeMinutes: true,
          },
          where: {
            ...where,
            assignedToId: { not: null },
          },
        }),

        // Status summary
        prisma.workOrder.groupBy({
          by: ["status"],
          _count: { status: true },
          where,
        }),
      ]);

      // Get work center details
      const performanceByWorkCenterWithDetails = await Promise.all(
        performanceByWorkCenter.map(async (item) => {
          const workCenter = await prisma.workCenter.findUnique({
            where: { id: item.workCenterId },
            select: { id: true, name: true },
          });
          const efficiency =
            item._sum.estimatedTimeMinutes > 0
              ? (item._sum.actualTimeMinutes / item._sum.estimatedTimeMinutes) *
                100
              : 0;

          return {
            ...item,
            workCenter,
            efficiency: Math.round(efficiency * 100) / 100,
          };
        })
      );

      // Get user details
      const performanceByUserWithDetails = await Promise.all(
        performanceByUser.map(async (item) => {
          const user = await prisma.user.findUnique({
            where: { id: item.assignedToId },
            select: { id: true, name: true, email: true, role: true },
          });
          const efficiency =
            item._sum.estimatedTimeMinutes > 0
              ? (item._sum.actualTimeMinutes / item._sum.estimatedTimeMinutes) *
                100
              : 0;

          return {
            ...item,
            user,
            efficiency: Math.round(efficiency * 100) / 100,
          };
        })
      );

      // Calculate overall performance metrics
      const totalWorkOrders = workOrders.length;
      const completedWorkOrders = workOrders.filter(
        (wo) => wo.status === "DONE"
      ).length;
      const avgEfficiency =
        workOrders
          .filter((wo) => wo.estimatedTimeMinutes && wo.actualTimeMinutes)
          .reduce((sum, wo) => {
            const efficiency =
              (wo.actualTimeMinutes / wo.estimatedTimeMinutes) * 100;
            return sum + efficiency;
          }, 0) /
          workOrders.filter(
            (wo) => wo.estimatedTimeMinutes && wo.actualTimeMinutes
          ).length || 0;

      res.json({
        success: true,
        data: {
          workOrders,
          summary: {
            totalWorkOrders,
            completedWorkOrders,
            completionRate:
              totalWorkOrders > 0
                ? (completedWorkOrders / totalWorkOrders) * 100
                : 0,
            avgEfficiency: Math.round(avgEfficiency * 100) / 100,
          },
          performanceByWorkCenter: performanceByWorkCenterWithDetails,
          performanceByUser: performanceByUserWithDetails,
          statusSummary,
        },
      });
    } catch (error) {
      console.error("Work order performance report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate work order performance report",
      });
    }
  }
);

// @route   GET /api/reports/work-order-analysis
// @desc    Get work order analysis with detailed filtering
// @access  Private
router.get(
  "/work-order-analysis",
  authenticate,
  [
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("operation").optional().isString(),
    query("workCenterId").optional().isString(),
    query("status")
      .optional()
      .isIn(["TO_DO", "IN_PROGRESS", "DONE", "CANCELLED"]),
    query("assignedToId").optional().isString(),
    query("search").optional().isString(),
    query("limit").optional().isInt({ min: 1, max: 1000 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const {
        startDate,
        endDate,
        operation,
        workCenterId,
        status,
        assignedToId,
        search,
        limit = 100,
        offset = 0,
      } = req.query;

      // Build where clause
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (workCenterId) where.workCenterId = workCenterId;
      if (status) where.status = status;
      if (assignedToId) where.assignedToId = assignedToId;
      if (operation) {
        where.operationName = {
          contains: operation,
          mode: "insensitive",
        };
      }
      if (search) {
        where.OR = [
          { operationName: { contains: search, mode: "insensitive" } },
          { workCenter: { name: { contains: search, mode: "insensitive" } } },
          {
            manufacturingOrder: {
              product: { name: { contains: search, mode: "insensitive" } },
            },
          },
        ];
      }

      // Get work orders with all related data
      const [workOrders, totalCount] = await Promise.all([
        prisma.workOrder.findMany({
          where,
          include: {
            manufacturingOrder: {
              select: {
                id: true,
                orderNumber: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    unit: true,
                  },
                },
              },
            },
            workCenter: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: parseInt(limit),
          skip: parseInt(offset),
        }),
        prisma.workOrder.count({ where }),
      ]);

      // Transform data for frontend
      const analysisData = workOrders.map((wo) => {
        const expectedDuration = wo.estimatedTimeMinutes || 0;
        const actualDuration = wo.actualTimeMinutes || 0;
        const efficiency =
          expectedDuration > 0 ? (actualDuration / expectedDuration) * 100 : 0;

        // Calculate duration in hours:minutes format
        const formatDuration = (minutes) => {
          if (!minutes || minutes === 0) return "00:00";
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}`;
        };

        return {
          id: wo.id,
          operationName: wo.operationName || "N/A",
          workCenterName: wo.workCenter?.name || "N/A",
          productName: wo.manufacturingOrder?.product?.name || "N/A",
          quantity: wo.quantity || 0,
          expectedDuration: formatDuration(expectedDuration),
          realDuration: formatDuration(actualDuration),
          status: wo.status?.toLowerCase().replace("_", " ") || "unknown",
          efficiency: Math.round(efficiency * 100) / 100,
          assignedTo: wo.assignedTo?.name || "Unassigned",
          startedAt: wo.startedAt,
          completedAt: wo.completedAt,
          createdAt: wo.createdAt,
          manufacturingOrderNumber: wo.manufacturingOrder?.orderNumber || "N/A",
        };
      });

      // Get summary statistics
      const summary = {
        totalWorkOrders: totalCount,
        completedWorkOrders: workOrders.filter((wo) => wo.status === "DONE")
          .length,
        inProgressWorkOrders: workOrders.filter(
          (wo) => wo.status === "IN_PROGRESS"
        ).length,
        pendingWorkOrders: workOrders.filter((wo) => wo.status === "TO_DO")
          .length,
        cancelledWorkOrders: workOrders.filter(
          (wo) => wo.status === "CANCELLED"
        ).length,
        avgEfficiency:
          workOrders.length > 0
            ? workOrders
                .filter((wo) => wo.estimatedTimeMinutes && wo.actualTimeMinutes)
                .reduce((sum, wo) => {
                  const efficiency =
                    (wo.actualTimeMinutes / wo.estimatedTimeMinutes) * 100;
                  return sum + efficiency;
                }, 0) /
                workOrders.filter(
                  (wo) => wo.estimatedTimeMinutes && wo.actualTimeMinutes
                ).length || 0
            : 0,
      };

      res.json({
        success: true,
        data: {
          workOrders: analysisData,
          summary,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < totalCount,
          },
        },
      });
    } catch (error) {
      console.error("Work order analysis report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate work order analysis report",
      });
    }
  }
);

// @route   POST /api/reports/export
// @desc    Export report data
// @access  Private
router.post(
  "/export",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("reportType")
      .isIn([
        "production-summary",
        "resource-utilization",
        "inventory-valuation",
        "work-order-performance",
        "work-order-analysis",
      ])
      .withMessage("Invalid report type"),
    body("format").isIn(["json", "csv"]).withMessage("Invalid export format"),
    body("filters").optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { reportType, format, filters = {} } = req.body;

      // For now, just return JSON data
      // In a real application, you would generate CSV/Excel files here
      res.json({
        success: true,
        message: "Export functionality would be implemented here",
        data: {
          reportType,
          format,
          filters,
          note: "This would return the actual exported data in the requested format",
        },
      });
    } catch (error) {
      console.error("Export report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to export report",
      });
    }
  }
);

export default router;

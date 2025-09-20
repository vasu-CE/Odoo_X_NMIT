import express from 'express';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', authenticate, async (req, res) => {
  try {
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalProducts,
      lowStockProducts,
      totalWorkCenters,
      activeWorkCenters,
      recentOrders,
      recentMovements
    ] = await Promise.all([
      prisma.manufacturingOrder.count(),
      
      prisma.manufacturingOrder.count({
        where: {
          status: {
            in: ['PLANNED', 'CONFIRMED', 'IN_PROGRESS']
          }
        }
      }),
      
      prisma.manufacturingOrder.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      
      prisma.product.count({
        where: { isActive: true }
      }),
      
      prisma.product.count({
        where: {
          isActive: true,
          currentStock: {
            lte: prisma.product.fields.reorderPoint
          }
        }
      }),
      
      prisma.workCenter.count(),
      
      prisma.workCenter.count({
        where: { status: 'ACTIVE' }
      }),
      
      prisma.manufacturingOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { name: true }
          },
          assignedTo: {
            select: { name: true }
          }
        }
      }),
      
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { name: true }
          }
        }
      })
    ]);

    // Calculate completion rate
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Calculate work center utilization
    const workCenterUtilization = totalWorkCenters > 0 ? (activeWorkCenters / totalWorkCenters) * 100 : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalOrders,
          activeOrders,
          completedOrders,
          completionRate: Math.round(completionRate * 100) / 100,
          totalProducts,
          lowStockProducts,
          totalWorkCenters,
          activeWorkCenters,
          workCenterUtilization: Math.round(workCenterUtilization * 100) / 100
        },
        recentOrders,
        recentMovements
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

router.get('/kpis', authenticate, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      ordersByStatus,
      ordersByPriority,
      productionEfficiency,
      stockValue,
      workOrderStatus
    ] = await Promise.all([
      // Orders by status
      prisma.manufacturingOrder.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      prisma.manufacturingOrder.groupBy({
        by: ['priority'],
        _count: { priority: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.manufacturingOrder.aggregate({
        _avg: {
          actualCost: true,
          estimatedCost: true
        },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
          actualCost: { not: null },
          estimatedCost: { not: null }
        }
      }),
      
      // Total stock value
      prisma.product.aggregate({
        _sum: {
          currentStock: true
        },
        where: {
          isActive: true,
          salesPrice: { not: null }
        }
      }),
      
      // Work order status
      prisma.workOrder.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        ordersByStatus,
        ordersByPriority,
        productionEfficiency,
        stockValue,
        workOrderStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KPI data'
    });
  }
});

router.get('/recent-orders', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await prisma.manufacturingOrder.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, type: true }
        },
        assignedTo: {
          select: { name: true }
        },
        workOrders: {
          select: {
            id: true,
            status: true,
            operationName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent orders'
    });
  }
});

router.get('/alerts', authenticate, async (req, res) => {
  try {
    const [
      lowStockAlerts,
      overdueOrders,
      maintenanceWorkCenters,
      pendingWorkOrders
    ] = await Promise.all([
      // Low stock alerts
      prisma.product.findMany({
        where: {
          isActive: true,
          currentStock: {
            lte: prisma.product.fields.reorderPoint
          }
        },
        select: {
          id: true,
          name: true,
          currentStock: true,
          reorderPoint: true
        }
      }),
      
      // Overdue orders
      prisma.manufacturingOrder.findMany({
        where: {
          status: { in: ['PLANNED', 'CONFIRMED', 'IN_PROGRESS'] },
          scheduledDate: { lt: new Date() }
        },
        select: {
          id: true,
          orderNumber: true,
          product: { select: { name: true } },
          scheduledDate: true
        }
      }),
      
      // Work centers in maintenance
      prisma.workCenter.findMany({
        where: { status: 'MAINTENANCE' },
        select: {
          id: true,
          name: true,
          status: true
        }
      }),
      
      // Pending work orders
      prisma.workOrder.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          operationName: true,
          workCenter: { select: { name: true } },
          manufacturingOrder: {
            select: {
              orderNumber: true,
              product: { select: { name: true } }
            }
          }
        }
      })
    ]);

    const alerts = [];

    // Add low stock alerts
    lowStockAlerts.forEach(product => {
      alerts.push({
        type: 'low_stock',
        severity: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} is below reorder point (${product.currentStock}/${product.reorderPoint})`,
        data: product
      });
    });

    // Add overdue order alerts
    overdueOrders.forEach(order => {
      alerts.push({
        type: 'overdue_order',
        severity: 'error',
        title: 'Overdue Order',
        message: `Order ${order.orderNumber} for ${order.product.name} is overdue`,
        data: order
      });
    });

    // Add maintenance alerts
    maintenanceWorkCenters.forEach(workCenter => {
      alerts.push({
        type: 'maintenance',
        severity: 'info',
        title: 'Work Center Maintenance',
        message: `${workCenter.name} is under maintenance`,
        data: workCenter
      });
    });

    // Add pending work order alerts
    if (pendingWorkOrders.length > 0) {
      alerts.push({
        type: 'pending_work_orders',
        severity: 'info',
        title: 'Pending Work Orders',
        message: `${pendingWorkOrders.length} work orders are pending`,
        data: pendingWorkOrders
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

export default router;

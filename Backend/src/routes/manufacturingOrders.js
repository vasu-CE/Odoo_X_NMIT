import express from "express";
import { body, validationResult, query } from "express-validator";
import { prisma } from "../config/database.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

const generateOrderNumber = async () => {
  const lastOrder = await prisma.manufacturingOrder.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return "MO-000001";
  }

  const lastNumber = parseInt(lastOrder.orderNumber.split("-")[1]);
  const nextNumber = lastNumber + 1;
  return `MO-${String(nextNumber).padStart(6, "0")}`;
};

router.get("/next-number", authenticate, async (req, res) => {
  try {
    const orderNumber = await generateOrderNumber();
    res.json({
      success: true,
      data: { orderNumber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate order number",
    });
  }
});

router.get(
  "/",
  authenticate,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn([
        "DRAFT",
        "CONFIRMED",
        "IN_PROGRESS",
        "TO_CLOSE",
        "DONE",
        "CANCELLED",
      ]),
    query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    query("search").optional().isString(),
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

      const { page = 1, limit = 20, status, priority, search } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { finishedProduct: { contains: search, mode: "insensitive" } },
          { product: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.manufacturingOrder.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            bom: {
              select: {
                id: true,
                version: true,
              },
            },
            components: {
              select: {
                id: true,
                componentName: true,
                availability: true,
                toConsume: true,
                consumed: true,
                units: true,
              },
            },
            workOrders: {
              select: {
                id: true,
                status: true,
                operationName: true,
                workCenterName: true,
                plannedDuration: true,
                realDuration: true,
                assignedToId: true,
              },
            },
          },
        }),
        prisma.manufacturingOrder.count({ where }),
      ]);

      // Calculate component status for each order
      const ordersWithComponentStatus = orders.map((order) => {
        let componentStatus = "Available";

        if (order.components && order.components.length > 0) {
          const unavailableComponents = order.components.filter(
            (comp) => comp.availability < comp.toConsume
          );

          if (unavailableComponents.length > 0) {
            componentStatus = "Not Available";
          } else if (order.components.length === 0) {
            componentStatus = "No Components";
          }
        } else {
          componentStatus = "No Components";
        }

        return {
          ...order,
          component_status: componentStatus,
        };
      });

      res.json({
        success: true,
        data: {
          orders: ordersWithComponentStatus,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch manufacturing orders",
      });
    }
  }
);

router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    const order = await prisma.manufacturingOrder.findUnique({
      where: { id: orderId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            currentStock: true,
            unit: true,
          },
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
                    unit: true,
                  },
                },
              },
            },
            operations: {
              include: {
                workCenter: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                },
              },
              orderBy: { sequence: "asc" },
            },
          },
        },
        components: {
          select: {
            id: true,
            componentName: true,
            availability: true,
            toConsume: true,
            consumed: true,
            units: true,
          },
        },
        workOrders: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            workCenter: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Manufacturing order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch manufacturing order",
    });
  }
});

router.post(
  "/",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("finishedProduct")
      .notEmpty()
      .withMessage("Finished product is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("units").optional().isString(),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    body("scheduleDate")
      .isISO8601()
      .withMessage("Valid schedule date is required"),
    body("assigneeId").optional().isString(),
    body("bomId").optional().isString(),
    body("productId").optional().isString(),
    body("assignedWorkOrders").optional().isArray(),
    body("notes").optional().isString(),
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
        finishedProduct,
        quantity,
        units = "PCS",
        priority = "MEDIUM",
        scheduleDate,
        assigneeId,
        bomId,
        productId,
        assignedWorkOrders = [],
        notes,
      } = req.body;

      // Generate order number
      const orderNumber = await generateOrderNumber();

      // Create manufacturing order with BOM auto-population
      const order = await prisma.$transaction(async (tx) => {
        // Create the manufacturing order
        const newOrder = await tx.manufacturingOrder.create({
          data: {
            orderNumber,
            finishedProduct,
            productId,
            quantity,
            units,
            priority,
            scheduleDate: new Date(scheduleDate),
            assigneeId,
            bomId,
            notes,
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        // If BOM is provided, auto-populate work orders and required materials
        if (bomId) {
          // Get BOM with components and operations
          const bom = await tx.bOM.findUnique({
            where: { id: bomId },
            include: {
              components: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      currentStock: true,
                      unit: true,
                    },
                  },
                },
              },
              operations: {
                include: {
                  workCenter: {
                    select: {
                      id: true,
                      name: true,
                      hourlyRate: true,
                    },
                  },
                },
              },
            },
          });

          if (bom) {
            // Create work orders from BOM operations
            const workOrders = [];
            for (const operation of bom.operations) {
              const workOrder = await tx.workOrder.create({
                data: {
                  manufacturingOrderId: newOrder.id,
                  operationName: operation.name,
                  workCenterName: operation.workCenter.name,
                  workCenterId: operation.workCenter.id,
                  plannedDuration: operation.timeMinutes,
                  estimatedTimeMinutes: operation.timeMinutes,
                  status: "PENDING",
                },
              });
              workOrders.push(workOrder);
            }

            // Create components from BOM components
            const components = [];
            for (const component of bom.components) {
              const requiredQty = component.quantity * quantity;
              const componentRecord = await tx.component.create({
                data: {
                  manufacturingOrderId: newOrder.id,
                  componentName: component.product.name,
                  availability: component.product.currentStock,
                  toConsume: requiredQty,
                  consumed: 0,
                  units: component.unit,
                },
              });
              components.push(componentRecord);
            }

            // Add work orders and components to the response
            newOrder.workOrders = workOrders;
            newOrder.components = components;
          } else {
          }
        }

        // If assignedWorkOrders is provided, create work orders from the payload
        if (assignedWorkOrders && assignedWorkOrders.length > 0) {
          const customWorkOrders = [];
          
          for (const workOrderData of assignedWorkOrders) {
            // Validate required fields
            if (!workOrderData.operationName || !workOrderData.workCenterName || !workOrderData.estimatedTimeMinutes) {
              throw new Error(`Invalid work order data: missing required fields`);
            }

            const workOrder = await tx.workOrder.create({
              data: {
                manufacturingOrderId: newOrder.id,
                operationName: workOrderData.operationName,
                workCenterName: workOrderData.workCenterName,
                workCenterId: workOrderData.workCenterId || null,
                plannedDuration: workOrderData.estimatedTimeMinutes,
                estimatedTimeMinutes: workOrderData.estimatedTimeMinutes,
                assignedToId: workOrderData.assignedToId || null,
                status: "PENDING",
                comments: workOrderData.comments || null,
              },
            });
            customWorkOrders.push(workOrder);
          }
          
          // Add custom work orders to the response
          newOrder.workOrders = [...(newOrder.workOrders || []), ...customWorkOrders];
        } else if (!bomId) {
          // If no BOM and no assignedWorkOrders, create a default work order
          const defaultWorkOrder = await tx.workOrder.create({
            data: {
              manufacturingOrderId: newOrder.id,
              operationName: "General Assembly",
              workCenterName: "General Work Center",
              workCenterId: null,
              plannedDuration: 60, // 1 hour default
              estimatedTimeMinutes: 60,
              assignedToId: null,
              status: "PENDING",
              comments: "Default work order created automatically",
            },
          });
          newOrder.workOrders = [defaultWorkOrder];
        }

        return newOrder;
      });

      // Fetch the complete order with work orders for the response
      const completeOrder = await prisma.manufacturingOrder.findUnique({
        where: { id: order.id },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          bom: {
            select: {
              id: true,
              version: true,
            },
          },
          components: {
            select: {
              id: true,
              componentName: true,
              availability: true,
              toConsume: true,
              consumed: true,
              units: true,
            },
          },
          workOrders: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              workCenter: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Manufacturing order created successfully",
        data: completeOrder,
      });
    } catch (error) {
("Create manufacturing order error:", error);
("Error details:", error.message);
("Stack trace:", error.stack);
      res.status(500).json({
        success: false,
        error: "Failed to create manufacturing order",
        details: error.message,
      });
    }
  }
);

router.put(
  "/:id",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("finishedProduct").optional().isString(),
    body("quantity").optional().isInt({ min: 1 }),
    body("units").optional().isString(),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    body("scheduleDate").optional().isISO8601(),
    body("assigneeId").optional().isString(),
    body("notes").optional().isString(),
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

      const { id } = req.params;
      const orderId = Number(id);
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.orderNumber;
      delete updateData.status;
      delete updateData.createdAt;

      // Convert scheduleDate to Date if provided
      if (updateData.scheduleDate) {
        updateData.scheduleDate = new Date(updateData.scheduleDate);
      }

      const order = await prisma.manufacturingOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Manufacturing order updated successfully",
        data: order,
      });
    } catch (error) {
("Update manufacturing order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update manufacturing order",
      });
    }
  }
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("status")
      .isIn([
        "DRAFT",
        "CONFIRMED",
        "IN_PROGRESS",
        "TO_CLOSE",
        "DONE",
        "CANCELLED",
      ])
      .withMessage("Invalid status"),
    body("notes").optional().isString(),
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

      const { id } = req.params;
      const orderId = Number(id);
      const { status, notes } = req.body;

      // Get current order
      const existingOrder = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        include: {
          workOrders: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      // Define valid state transitions based on mockup
      const validTransitions = {
        DRAFT: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["TO_CLOSE", "CANCELLED"],
        TO_CLOSE: ["DONE", "CANCELLED"],
        DONE: [], // Terminal state
        CANCELLED: [], // Terminal state
      };

      const currentStatus = existingOrder.status;
      const newStatus = status;

      // Check if transition is valid
      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid state transition from ${currentStatus} to ${newStatus}`,
          validTransitions: validTransitions[currentStatus] || [],
        });
      }

      // Prepare update data
      const updateData = { status };

      // Set timestamps based on status changes
      if (newStatus === "IN_PROGRESS" && currentStatus !== "IN_PROGRESS") {
        updateData.startedAt = new Date();
      }

      if (newStatus === "DONE" && currentStatus !== "DONE") {
        updateData.completedAt = new Date();
      }

      // Add notes if provided
      if (notes) {
        updateData.notes = notes;
      }

      // Use transaction to update order and related work orders
      const result = await prisma.$transaction(async (tx) => {
        // Update manufacturing order
        const updatedOrder = await tx.manufacturingOrder.update({
          where: { id: orderId },
          data: updateData,
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            components: {
              select: {
                id: true,
                componentName: true,
                availability: true,
                toConsume: true,
                consumed: true,
                units: true,
              },
            },
            workOrders: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        // Update related work orders based on manufacturing order status
        if (newStatus === "IN_PROGRESS") {
          // Start all PENDING work orders
          await tx.workOrder.updateMany({
            where: {
              manufacturingOrderId: orderId,
              status: "PENDING",
            },
            data: {
              status: "IN_PROGRESS",
              startTime: new Date(),
            },
          });
        } else if (newStatus === "DONE") {
          // Complete all in-progress work orders
          await tx.workOrder.updateMany({
            where: {
              manufacturingOrderId: orderId,
              status: "IN_PROGRESS",
            },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });
        } else if (newStatus === "CANCELLED") {
          // Cancel all PENDING and in-progress work orders
          await tx.workOrder.updateMany({
            where: {
              manufacturingOrderId: orderId,
              status: { in: ["PENDING", "IN_PROGRESS"] },
            },
            data: {
              status: "CANCELLED",
              completedAt: new Date(),
            },
          });
        }

        return updatedOrder;
      });

      res.json({
        success: true,
        message: `Manufacturing order status updated to ${newStatus}`,
        data: result,
      });
    } catch (error) {
("Update manufacturing order status error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update manufacturing order status",
      });
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const orderId = Number(id);

      // Check if order can be deleted (only planned orders)
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      if (order.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: "Only draft orders can be deleted",
        });
      }

      await prisma.manufacturingOrder.delete({
        where: { id: orderId },
      });

      res.json({
        success: true,
        message: "Manufacturing order deleted successfully",
      });
    } catch (error) {
("Delete manufacturing order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete manufacturing order",
      });
    }
  }
);

router.post(
  "/:id/confirm",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const orderId = Number(id);

      const order = await prisma.manufacturingOrder.update({
        where: {
          id: orderId,
          status: "DRAFT",
        },
        data: { status: "CONFIRMED" },
        include: {
          assignee: {
            select: { name: true },
          },
        },
      });

      res.json({
        success: true,
        message: "Manufacturing order confirmed successfully",
        data: order,
      });
    } catch (error) {
("Confirm manufacturing order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found or cannot be confirmed",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to confirm manufacturing order",
      });
    }
  }
);

router.post(
  "/:id/start",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "SHOP_FLOOR_OPERATOR"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const orderId = Number(id);

      const order = await prisma.manufacturingOrder.update({
        where: {
          id: orderId,
          status: { in: ["DRAFT", "CONFIRMED"] },
        },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        include: {
          assignee: {
            select: { name: true },
          },
        },
      });

      res.json({
        success: true,
        message: "Manufacturing order started successfully",
        data: order,
      });
    } catch (error) {
("Start manufacturing order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found or cannot be started",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to start manufacturing order",
      });
    }
  }
);

router.post(
  "/:id/complete",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "SHOP_FLOOR_OPERATOR"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const orderId = Number(id);

      const order = await prisma.manufacturingOrder.update({
        where: {
          id: orderId,
          status: "IN_PROGRESS",
        },
        data: {
          status: "DONE",
          completedAt: new Date(),
        },
        include: {
          assignee: {
            select: { name: true },
          },
        },
      });

      res.json({
        success: true,
        message: "Manufacturing order completed successfully",
        data: order,
      });
    } catch (error) {
("Complete manufacturing order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found or cannot be completed",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to complete manufacturing order",
      });
    }
  }
);

router.post(
  "/:id/cancel",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const orderId = Number(id);

      const order = await prisma.manufacturingOrder.update({
        where: {
          id: orderId,
          status: { in: ["DRAFT", "CONFIRMED", "IN_PROGRESS"] },
        },
        data: { status: "CANCELLED" },
        include: {
          assignee: {
            select: { name: true },
          },
        },
      });

      res.json({
        success: true,
        message: "Manufacturing order canceled successfully",
        data: order,
      });
    } catch (error) {
("Cancel manufacturing order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found or cannot be canceled",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to cancel manufacturing order",
      });
    }
  }
);

router.get("/:id/work-orders", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    const workOrders = await prisma.workOrder.findMany({
      where: { manufacturingOrderId: orderId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: workOrders,
    });
  } catch (error) {
("Get work orders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch work orders",
    });
  }
});

router.post(
  "/:id/components",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("componentName").notEmpty().withMessage("Component name is required"),
    body("availability")
      .isFloat({ min: 0 })
      .withMessage("Availability must be a positive number"),
    body("toConsume")
      .isFloat({ min: 0 })
      .withMessage("To consume must be a positive number"),
    body("units").optional().isString(),
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

      const { id } = req.params;
      const orderId = Number(id);
      const {
        componentName,
        availability,
        toConsume,
        units = "PCS",
      } = req.body;

      // Check if manufacturing order exists and is in draft state
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      if (order.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: "Components can only be added to draft orders",
        });
      }

      const component = await prisma.component.create({
        data: {
          manufacturingOrderId: orderId,
          componentName,
          availability,
          toConsume,
          units,
        },
      });

      res.status(201).json({
        success: true,
        message: "Component added successfully",
        data: component,
      });
    } catch (error) {
("Add component error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add component",
      });
    }
  }
);

router.put(
  "/:id/components/:componentId",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("componentName").optional().isString(),
    body("availability").optional().isFloat({ min: 0 }),
    body("toConsume").optional().isFloat({ min: 0 }),
    body("consumed").optional().isFloat({ min: 0 }),
    body("units").optional().isString(),
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

      const { id, componentId } = req.params;
      const orderId = Number(id);
      const componentIdNum = Number(componentId);
      const updateData = req.body;

      // Check if manufacturing order exists
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      const component = await prisma.component.update({
        where: {
          id: componentIdNum,
          manufacturingOrderId: orderId,
        },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Component updated successfully",
        data: component,
      });
    } catch (error) {
("Update component error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Component not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update component",
      });
    }
  }
);

router.delete(
  "/:id/components/:componentId",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const { id, componentId } = req.params;
      const orderId = Number(id);
      const componentIdNum = Number(componentId);

      // Check if manufacturing order exists and is in draft state
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      if (order.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: "Components can only be deleted from draft orders",
        });
      }

      await prisma.component.delete({
        where: {
          id: componentIdNum,
          manufacturingOrderId: orderId,
        },
      });

      res.json({
        success: true,
        message: "Component deleted successfully",
      });
    } catch (error) {
("Delete component error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Component not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to delete component",
      });
    }
  }
);

router.post(
  "/:id/work-orders",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("operationName").notEmpty().withMessage("Operation name is required"),
    body("workCenterName")
      .notEmpty()
      .withMessage("Work center name is required"),
    body("plannedDuration")
      .isInt({ min: 1 })
      .withMessage("Planned duration must be a positive integer"),
    body("estimatedTimeMinutes")
      .isInt({ min: 1 })
      .withMessage("Estimated time minutes must be a positive integer"),
    body("assignedToId").optional().isString(),
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

      const { id } = req.params;
      const orderId = Number(id);
      const { operationName, workCenterName, plannedDuration, estimatedTimeMinutes, assignedToId } =
        req.body;

      // Check if manufacturing order exists and is in draft state
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      if (order.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: "Work orders can only be added to draft orders",
        });
      }

      const workOrder = await prisma.workOrder.create({
        data: {
          manufacturingOrderId: orderId,
          operationName,
          workCenterName,
          plannedDuration,
          estimatedTimeMinutes,
          assignedToId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Work order added successfully",
        data: workOrder,
      });
    } catch (error) {
("Add work order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add work order",
      });
    }
  }
);

router.put(
  "/:id/work-orders/:workOrderId",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  [
    body("operationName").optional().isString(),
    body("workCenterName").optional().isString(),
    body("plannedDuration").optional().isInt({ min: 1 }),
    body("realDuration").optional().isInt({ min: 0 }),
    body("status")
      .optional()
      .isIn(["TO_DO", "IN_PROGRESS", "DONE", "CANCELLED"]),
    body("assignedToId").optional().isString(),
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

      const { id, workOrderId } = req.params;
      const orderId = Number(id);
      const workOrderIdNum = Number(workOrderId);
      const updateData = req.body;

      // Check if manufacturing order exists
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      const workOrder = await prisma.workOrder.update({
        where: {
          id: workOrderIdNum,
          manufacturingOrderId: orderId,
        },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Work order updated successfully",
        data: workOrder,
      });
    } catch (error) {
("Update work order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Work order not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update work order",
      });
    }
  }
);

router.delete(
  "/:id/work-orders/:workOrderId",
  authenticate,
  authorize("MANUFACTURING_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const { id, workOrderId } = req.params;
      const orderId = Number(id);
      const workOrderIdNum = Number(workOrderId);

      // Check if manufacturing order exists and is in draft state
      const order = await prisma.manufacturingOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Manufacturing order not found",
        });
      }

      if (order.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: "Work orders can only be deleted from draft orders",
        });
      }

      await prisma.workOrder.delete({
        where: {
          id: workOrderIdNum,
          manufacturingOrderId: orderId,
        },
      });

      res.json({
        success: true,
        message: "Work order deleted successfully",
      });
    } catch (error) {
("Delete work order error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Work order not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to delete work order",
      });
    }
  }
);

export default router;

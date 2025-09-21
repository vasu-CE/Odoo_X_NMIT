import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Generate order number in format MO-000001, MO-000002, etc.
const generateOrderNumber = async () => {
  // Find the highest existing order number to ensure sequential numbering
  const lastOrder = await prisma.manufacturingOrder.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return "MO-000001";
  }

  // Extract the number part and increment it
  const lastNumber = parseInt(lastOrder.orderNumber.split("-")[1]);
  const nextNumber = lastNumber + 1;
  return `MO-${String(nextNumber).padStart(6, "0")}`;
};

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Check if users already exist to avoid duplicates
  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: [
          "admin@manufacturing.com",
          "manager@manufacturing.com", 
          "operator@manufacturing.com",
          "inventory@manufacturing.com"
        ]
      }
    }
  });

  const users = [];
  
  if (existingUsers.length === 0) {
    // Create users if none exist
    const newUsers = await Promise.all([
      prisma.user.create({
        data: {
          loginId: "admin",
          email: "admin@manufacturing.com",
          name: "Admin User",
          password: hashedPassword,
          role: "ADMIN",
        },
      }),
      prisma.user.create({
        data: {
          loginId: "manager",
          email: "manager@manufacturing.com",
          name: "Manufacturing Manager",
          password: hashedPassword,
          role: "MANUFACTURING_MANAGER",
        },
      }),
      prisma.user.create({
        data: {
          loginId: "operator",
          email: "operator@manufacturing.com",
          name: "Shop Floor Operator",
          password: hashedPassword,
          role: "SHOP_FLOOR_OPERATOR",
        },
      }),
      prisma.user.create({
        data: {
          loginId: "inventory",
          email: "inventory@manufacturing.com",
          name: "Inventory Manager",
          password: hashedPassword,
          role: "INVENTORY_MANAGER",
        },
      }),
    ]);
    users.push(...newUsers);
  } else {
    // Use existing users
    users.push(...existingUsers);
  }

  console.log("✅ Users created");

  // Create work centers
  const workCenters = await Promise.all([
    prisma.workCenter.create({
      data: {
        name: "Assembly Line 1",
        description: "Main assembly line for finished goods",
        hourlyRate: 25.0,
        capacity: 100,
        status: "ACTIVE",
      },
    }),
    prisma.workCenter.create({
      data: {
        name: "Quality Control Station",
        description: "Quality inspection and testing",
        hourlyRate: 30.0,
        capacity: 50,
        status: "ACTIVE",
      },
    }),
    prisma.workCenter.create({
      data: {
        name: "Packaging Station",
        description: "Final packaging and labeling",
        hourlyRate: 20.0,
        capacity: 200,
        status: "ACTIVE",
      },
    }),
    prisma.workCenter.create({
      data: {
        name: "Maintenance Bay",
        description: "Equipment maintenance and repair",
        hourlyRate: 35.0,
        capacity: 10,
        status: "MAINTENANCE",
      },
    }),
  ]);

  console.log("✅ Work centers created");

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Widget A",
        description: "High-quality widget A",
        type: "FINISHED_GOOD",
        unit: "PCS",
        salesPrice: 25.0,
        purchasePrice: 15.0,
        currentStock: 150,
        reorderPoint: 50,
        hsnCode: "8473.30.10",
        category: "Widgets",
      },
    }),
    prisma.product.create({
      data: {
        name: "Widget B",
        description: "Standard widget B",
        type: "FINISHED_GOOD",
        unit: "PCS",
        salesPrice: 15.0,
        purchasePrice: 10.0,
        currentStock: 75,
        reorderPoint: 30,
        hsnCode: "8473.30.20",
        category: "Widgets",
      },
    }),
    prisma.product.create({
      data: {
        name: "Raw Material 1",
        description: "Base raw material",
        type: "RAW_MATERIAL",
        unit: "KG",
        salesPrice: 5.0,
        purchasePrice: 3.0,
        currentStock: 500,
        reorderPoint: 100,
        hsnCode: "7208.10.00",
        category: "Raw Materials",
      },
    }),
    prisma.product.create({
      data: {
        name: "Raw Material 2",
        description: "Secondary raw material",
        type: "RAW_MATERIAL",
        unit: "PCS",
        salesPrice: 2.0,
        purchasePrice: 1.5,
        currentStock: 200,
        reorderPoint: 50,
        hsnCode: "7208.20.00",
        category: "Raw Materials",
      },
    }),
    prisma.product.create({
      data: {
        name: "Component A",
        description: "Pre-fabricated component",
        type: "WIP",
        unit: "PCS",
        salesPrice: 8.0,
        purchasePrice: 5.0,
        currentStock: 100,
        reorderPoint: 25,
        hsnCode: "8473.30.30",
        category: "Components",
      },
    }),
  ]);

  console.log("✅ Products created");

  // Create BOMs
  const bom1 = await prisma.bOM.create({
    data: {
      productId: products[0].id, // Widget A
      finished_product: "Widget A",
      quantity: 1.0,
      version: "1.0",
      isActive: true,
      createdById: users[1].id,
    },
  });

  const bom2 = await prisma.bOM.create({
    data: {
      productId: products[1].id, // Widget B
      finished_product: "Widget B",
      quantity: 1.0,
      version: "1.0",
      isActive: true,
      createdById: users[1].id,
    },
  });

  // Create BOM components
  await Promise.all([
    prisma.bOMComponent.create({
      data: {
        bomId: bom1.id,
        productId: products[2].id, // Raw Material 1
        quantity: 2.0,
        unit: "KG",
        wastage: 0.1,
      },
    }),
    prisma.bOMComponent.create({
      data: {
        bomId: bom1.id,
        productId: products[3].id, // Raw Material 2
        quantity: 1.0,
        unit: "PCS",
        wastage: 0.05,
      },
    }),
    prisma.bOMComponent.create({
      data: {
        bomId: bom2.id,
        productId: products[2].id, // Raw Material 1
        quantity: 1.0,
        unit: "KG",
        wastage: 0.1,
      },
    }),
  ]);

  // Create BOM operations
  await Promise.all([
    prisma.bOMOperation.create({
      data: {
        bomId: bom1.id,
        sequence: 1,
        name: "Assembly",
        description: "Assemble components",
        timeMinutes: 30,
        workCenterId: workCenters[0].id, // Assembly Line 1
      },
    }),
    prisma.bOMOperation.create({
      data: {
        bomId: bom1.id,
        sequence: 2,
        name: "Quality Check",
        description: "Inspect finished product",
        timeMinutes: 10,
        workCenterId: workCenters[1].id, // Quality Control Station
      },
    }),
    prisma.bOMOperation.create({
      data: {
        bomId: bom1.id,
        sequence: 3,
        name: "Packaging",
        description: "Package for shipping",
        timeMinutes: 5,
        workCenterId: workCenters[2].id, // Packaging Station
      },
    }),
    prisma.bOMOperation.create({
      data: {
        bomId: bom2.id,
        sequence: 1,
        name: "Assembly",
        description: "Assemble components",
        timeMinutes: 20,
        workCenterId: workCenters[0].id, // Assembly Line 1
      },
    }),
    prisma.bOMOperation.create({
      data: {
        bomId: bom2.id,
        sequence: 2,
        name: "Packaging",
        description: "Package for shipping",
        timeMinutes: 5,
        workCenterId: workCenters[2].id, // Packaging Station
      },
    }),
  ]);

  console.log("✅ BOMs created");

  // Create manufacturing orders sequentially to avoid order number conflicts
  const manufacturingOrders = [];
  
  const order1 = await prisma.manufacturingOrder.create({
    data: {
      orderNumber: await generateOrderNumber(),
      finishedProduct: "Widget A - Premium Model",
      quantity: 100,
      units: "PCS",
      status: "IN_PROGRESS",
      priority: "HIGH",
      scheduleDate: new Date("2024-01-15T08:00:00.000Z"),
      startedAt: new Date("2024-01-15T08:30:00.000Z"),
      assigneeId: users[2].id,
      createdById: users[1].id, 
      bomId: bom1.id,
      estimatedCost: 1500.0,
      notes: "Priority order for customer ABC",
    },
  });
  manufacturingOrders.push(order1);

  const order2 = await prisma.manufacturingOrder.create({
    data: {
      orderNumber: await generateOrderNumber(),
      finishedProduct: "Widget B - Standard Model",
      quantity: 50,
      units: "PCS",
      status: "DRAFT",
      priority: "MEDIUM",
      scheduleDate: new Date("2024-01-22T08:00:00.000Z"),
      assigneeId: users[2].id,
      createdById: users[1].id, // Created by Manufacturing Manager
      bomId: bom2.id,
      estimatedCost: 800.0,
      notes: "Standard production order",
    },
  });
  manufacturingOrders.push(order2);

  const order3 = await prisma.manufacturingOrder.create({
    data: {
      orderNumber: await generateOrderNumber(),
      finishedProduct: "Widget A - Premium Model",
      quantity: 200,
      units: "PCS",
      status: "DONE",
      priority: "LOW",
      scheduleDate: new Date("2024-01-10T08:00:00.000Z"),
      startedAt: new Date("2024-01-10T08:00:00.000Z"),
      completedAt: new Date("2024-01-12T16:30:00.000Z"),
      assigneeId: users[2].id,
      createdById: users[0].id, // Created by Admin
      bomId: bom1.id,
      estimatedCost: 2000.0,
      actualCost: 1950.0,
      notes: "Completed ahead of schedule",
    },
  });
  manufacturingOrders.push(order3);

  const order4 = await prisma.manufacturingOrder.create({
    data: {
      orderNumber: await generateOrderNumber(),
      finishedProduct: "Custom Widget C",
      quantity: 25,
      units: "PCS",
      status: "CONFIRMED",
      priority: "URGENT",
      scheduleDate: new Date("2024-01-25T10:00:00.000Z"),
      assigneeId: users[2].id,
      createdById: users[3].id, // Created by Inventory Manager
      estimatedCost: 500.0,
      notes: "Custom order for special customer",
    },
  });
  manufacturingOrders.push(order4);


  console.log("✅ Manufacturing orders created");

  // Create components for manufacturing orders
  await Promise.all([
    // Components for MO-000001 (Widget A - 100 units)
    prisma.component.create({
      data: {
        manufacturingOrderId: manufacturingOrders[0].id,
        componentName: "Raw Material 1",
        availability: 500.0,
        toConsume: 200.0, // 2 KG per unit * 100 units
        consumed: 50.0,
        units: "KG",
      },
    }),
    prisma.component.create({
      data: {
        manufacturingOrderId: manufacturingOrders[0].id,
        componentName: "Raw Material 2",
        availability: 200.0,
        toConsume: 100.0, // 1 PCS per unit * 100 units
        consumed: 25.0,
        units: "PCS",
      },
    }),
    // Components for MO-000002 (Widget B - 50 units)
    prisma.component.create({
      data: {
        manufacturingOrderId: manufacturingOrders[1].id,
        componentName: "Raw Material 1",
        availability: 500.0,
        toConsume: 50.0, // 1 KG per unit * 50 units
        consumed: 0.0,
        units: "KG",
      },
    }),
    // Components for MO-000003 (Widget A - 200 units)
    prisma.component.create({
      data: {
        manufacturingOrderId: manufacturingOrders[2].id,
        componentName: "Raw Material 1",
        availability: 500.0,
        toConsume: 400.0, // 2 KG per unit * 200 units
        consumed: 400.0,
        units: "KG",
      },
    }),
    prisma.component.create({
      data: {
        manufacturingOrderId: manufacturingOrders[2].id,
        componentName: "Raw Material 2",
        availability: 200.0,
        toConsume: 200.0, // 1 PCS per unit * 200 units
        consumed: 200.0,
        units: "PCS",
      },
    }),
    // Components for MO-000004 (Custom Widget C - 25 units)
    prisma.component.create({
      data: {
        manufacturingOrderId: manufacturingOrders[3].id,
        componentName: "Component A",
        availability: 100.0,
        toConsume: 25.0,
        consumed: 0.0,
        units: "PCS",
      },
    }),
  ]);

  console.log("✅ Components created");

  // Create work orders
  await Promise.all([
    // Work orders for MO-000001 (In Progress)
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[0].id,
        operationName: "Assembly",
        workCenterName: "Assembly Line 1",
        plannedDuration: 30, // 30 minutes per unit
        realDuration: 15, // 15 minutes completed
        estimatedTimeMinutes: 30,
        status: "IN_PROGRESS",
        assignedToId: users[2].id,
        startTime: new Date("2024-01-15T08:30:00Z"),
        comments: "Assembly in progress - 50% complete",
      },
    }),
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[0].id,
        operationName: "Quality Check",
        workCenterName: "Quality Control Station",
        plannedDuration: 10, // 10 minutes per unit
        estimatedTimeMinutes: 10,
        status: "PENDING",
        assignedToId: users[2].id,
        comments: "Waiting for assembly completion",
      },
    }),
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[0].id,
        operationName: "Packaging",
        workCenterName: "Packaging Station",
        plannedDuration: 5, // 5 minutes per unit
        estimatedTimeMinutes: 5,
        status: "PENDING",
        assignedToId: users[2].id,
        comments: "Final packaging step",
      },
    }),
    // Work orders for MO-000002 (Draft)
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[1].id,
        operationName: "Assembly",
        workCenterName: "Assembly Line 1",
        plannedDuration: 20, // 20 minutes per unit
        estimatedTimeMinutes: 20,
        status: "PENDING",
        assignedToId: users[2].id,
        comments: "Ready to start",
      },
    }),
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[1].id,
        operationName: "Packaging",
        workCenterName: "Packaging Station",
        plannedDuration: 5, // 5 minutes per unit
        estimatedTimeMinutes: 5,
        status: "PENDING",
        assignedToId: users[2].id,
        comments: "Final packaging step",
      },
    }),
    // Work orders for MO-000003 (Done)
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[2].id,
        operationName: "Assembly",
        workCenterName: "Assembly Line 1",
        plannedDuration: 30, // 30 minutes per unit
        realDuration: 28, // 28 minutes actual
        estimatedTimeMinutes: 30,
        status: "COMPLETED",
        assignedToId: users[2].id,
        startTime: new Date("2024-01-10T08:00:00Z"),
        endTime: new Date("2024-01-11T18:00:00Z"),
        comments: "Assembly completed successfully",
      },
    }),
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[2].id,
        operationName: "Quality Check",
        workCenterName: "Quality Control Station",
        plannedDuration: 10, // 10 minutes per unit
        realDuration: 9, // 9 minutes actual
        estimatedTimeMinutes: 10,
        status: "COMPLETED",
        assignedToId: users[2].id,
        startTime: new Date("2024-01-11T18:00:00Z"),
        endTime: new Date("2024-01-12T10:00:00Z"),
        comments: "Quality check passed",
      },
    }),
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[2].id,
        operationName: "Packaging",
        workCenterName: "Packaging Station",
        plannedDuration: 5, // 5 minutes per unit
        realDuration: 4, // 4 minutes actual
        estimatedTimeMinutes: 5,
        status: "COMPLETED",
        assignedToId: users[2].id,
        startTime: new Date("2024-01-12T10:00:00Z"),
        completedAt: new Date("2024-01-12T16:30:00Z"),
        realDuration: 950, // Add real duration for completed work order
        comments: "Packaging completed",
      },
    }),
    // Work orders for MO-000004 (Confirmed)
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[3].id,
        operationName: "Custom Assembly",
        workCenterName: "Assembly Line 1",
        plannedDuration: 45, // 45 minutes per unit
        estimatedTimeMinutes: 45,
        status: "PENDING",
        assignedToId: users[1].id,
        comments: "Custom assembly process",
      },
    }),
    prisma.workOrder.create({
      data: {
        manufacturingOrderId: manufacturingOrders[3].id,
        operationName: "Special Testing",
        workCenterName: "Quality Control Station",
        plannedDuration: 15, // 15 minutes per unit
        estimatedTimeMinutes: 15,
        status: "PENDING",
        assignedToId: users[1].id,
        comments: "Special testing for custom widget",
      },
    }),
  ]);

  console.log("✅ Work orders created");

  // Create stock movements
  await Promise.all([
    prisma.stockMovement.create({
      data: {
        productId: products[0].id, // Widget A
        movementType: "IN",
        quantity: 200,
        unitCost: 15.0,
        totalValue: 3000.0,
        reference: "MO-003",
        referenceId: manufacturingOrders[2].id.toString(),
        notes: "Production completion",
      },
    }),
    prisma.stockMovement.create({
      data: {
        productId: products[2].id, // Raw Material 1
        movementType: "OUT",
        quantity: 400,
        unitCost: 3.0,
        totalValue: 1200.0,
        reference: "MO-003",
        referenceId: manufacturingOrders[2].id.toString(),
        notes: "Material consumption for production",
      },
    }),
    prisma.stockMovement.create({
      data: {
        productId: products[3].id, // Raw Material 2
        movementType: "OUT",
        quantity: 200,
        unitCost: 1.5,
        totalValue: 300.0,
        reference: "MO-003",
        referenceId: manufacturingOrders[2].id.toString(),
        notes: "Material consumption for production",
      },
    }),
    prisma.stockMovement.create({
      data: {
        productId: products[2].id, // Raw Material 1
        movementType: "IN",
        quantity: 1000,
        unitCost: 3.0,
        totalValue: 3000.0,
        reference: "PUR-001",
        notes: "Raw material purchase",
      },
    }),
    prisma.stockMovement.create({
      data: {
        productId: products[3].id, // Raw Material 2
        movementType: "IN",
        quantity: 500,
        unitCost: 1.5,
        totalValue: 750.0,
        reference: "PUR-002",
        notes: "Raw material purchase",
      },
    }),
  ]);

  console.log("✅ Stock movements created");

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Sample Data Summary:");
  console.log(`- Users: ${users.length}`);
  console.log(`- Work Centers: ${workCenters.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- BOMs: 2`);
  console.log(`- Manufacturing Orders: ${manufacturingOrders.length}`);
  console.log(`- Components: 6`);
  console.log(`- Work Orders: 10`);
  console.log(`- Stock Movements: 5`);

  console.log("\n🔑 Login Credentials:");
  console.log("Admin: admin@manufacturing.com / password123");
  console.log("Manager: manager@manufacturing.com / password123");
  console.log("Operator: operator@manufacturing.com / password123");
  console.log("Inventory: inventory@manufacturing.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

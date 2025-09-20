// Entity classes for data management
// These are mock implementations for the frontend

class BaseEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static async list(orderBy = "-created_date", limit = 50) {
    // Mock data - in a real app, this would make API calls
    return [];
  }

  static async get(id) {
    // Mock implementation
    return null;
  }

  static async create(data) {
    // Mock implementation
    console.log("Creating entity:", data);
    return { id: Date.now(), ...data };
  }

  static async update(id, data) {
    // Mock implementation
    console.log("Updating entity:", id, data);
    return { id, ...data };
  }

  static async delete(id) {
    // Mock implementation
    console.log("Deleting entity:", id);
    return true;
  }
}

export class ManufacturingOrder extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    // Mock manufacturing orders data
    return [
      {
        id: 1,
        order_number: "MO-001",
        product_name: "Widget A",
        quantity: 100,
        status: "in_progress",
        priority: "high",
        scheduled_start: "2024-01-15T08:00:00Z",
        scheduled_end: "2024-01-20T17:00:00Z",
        actual_start: "2024-01-15T08:30:00Z",
        created_date: "2024-01-15T08:00:00Z",
        assignee_name: "John Smith",
        total_cost: 1500.0,
        required_materials: [
          {
            product_name: "Raw Material 1",
            required_qty: 50,
            consumed_qty: 25,
            unit: "kg",
          },
          {
            product_name: "Raw Material 2",
            required_qty: 20,
            consumed_qty: 10,
            unit: "pieces",
          },
        ],
      },
      {
        id: 2,
        order_number: "MO-002",
        product_name: "Widget B",
        quantity: 50,
        status: "planned",
        priority: "medium",
        scheduled_start: "2024-01-22T08:00:00Z",
        scheduled_end: "2024-01-25T17:00:00Z",
        created_date: "2024-01-20T10:00:00Z",
        assignee_name: "Jane Doe",
        total_cost: 800.0,
        required_materials: [
          {
            product_name: "Raw Material 1",
            required_qty: 25,
            consumed_qty: 0,
            unit: "kg",
          },
        ],
      },
      {
        id: 3,
        order_number: "MO-003",
        product_name: "Widget C",
        quantity: 200,
        status: "completed",
        priority: "low",
        scheduled_start: "2024-01-10T08:00:00Z",
        scheduled_end: "2024-01-12T17:00:00Z",
        actual_start: "2024-01-10T08:00:00Z",
        actual_end: "2024-01-12T16:30:00Z",
        created_date: "2024-01-08T09:00:00Z",
        assignee_name: "Bob Johnson",
        total_cost: 2000.0,
        required_materials: [
          {
            product_name: "Raw Material 1",
            required_qty: 100,
            consumed_qty: 100,
            unit: "kg",
          },
          {
            product_name: "Raw Material 3",
            required_qty: 40,
            consumed_qty: 40,
            unit: "pieces",
          },
        ],
      },
    ];
  }
}

export class WorkOrder extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    return [
      {
        id: 1,
        work_order_number: "WO-001",
        manufacturing_order_id: 1,
        work_center_id: 1,
        operation_name: "Assembly",
        status: "in_progress",
        priority: "high",
        scheduled_start: "2024-01-15T08:00:00Z",
        scheduled_end: "2024-01-16T17:00:00Z",
        created_date: "2024-01-15T08:00:00Z",
        assignee_name: "John Smith",
      },
      {
        id: 2,
        work_order_number: "WO-002",
        manufacturing_order_id: 1,
        work_center_id: 2,
        operation_name: "Quality Check",
        status: "pending",
        priority: "medium",
        scheduled_start: "2024-01-17T08:00:00Z",
        scheduled_end: "2024-01-17T12:00:00Z",
        created_date: "2024-01-15T08:00:00Z",
        assignee_name: "Jane Doe",
      },
    ];
  }
}

export class Product extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    return [
      {
        id: 1,
        name: "Widget A",
        sku: "WID-A-001",
        description: "High-quality widget A",
        current_stock: 150,
        reorder_level: 50,
        unit_price: 25.0,
        category: "Widgets",
      },
      {
        id: 2,
        name: "Widget B",
        sku: "WID-B-001",
        description: "Standard widget B",
        current_stock: 25,
        reorder_level: 30,
        unit_price: 15.0,
        category: "Widgets",
      },
      {
        id: 3,
        name: "Raw Material 1",
        sku: "RM-001",
        description: "Base raw material",
        current_stock: 500,
        reorder_level: 100,
        unit_price: 5.0,
        category: "Raw Materials",
      },
    ];
  }
}

export class WorkCenter extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    return [
      {
        id: 1,
        name: "Assembly Line 1",
        code: "AL-001",
        status: "active",
        capacity: 100,
        utilization: 85,
        location: "Building A, Floor 1",
      },
      {
        id: 2,
        name: "Quality Control Station",
        code: "QC-001",
        status: "active",
        capacity: 50,
        utilization: 60,
        location: "Building A, Floor 2",
      },
      {
        id: 3,
        name: "Packaging Station",
        code: "PK-001",
        status: "maintenance",
        capacity: 200,
        utilization: 0,
        location: "Building B, Floor 1",
      },
    ];
  }
}

export class StockMovement extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    return [
      {
        id: 1,
        product_id: 1,
        product_name: "Widget A",
        movement_type: "in",
        quantity: 100,
        reference: "MO-001",
        date: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        product_id: 3,
        product_name: "Raw Material 1",
        movement_type: "out",
        quantity: 50,
        reference: "MO-001",
        date: "2024-01-15T09:00:00Z",
      },
    ];
  }
}

export class BOM extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    return [
      {
        id: 1,
        product_name: "Widget A",
        product_id: 1,
        components: [
          { product_name: "Raw Material 1", quantity: 2, unit: "kg" },
          { product_name: "Raw Material 2", quantity: 1, unit: "pieces" },
        ],
        version: "1.0",
      },
      {
        id: 2,
        product_name: "Widget B",
        product_id: 2,
        components: [
          { product_name: "Raw Material 1", quantity: 1, unit: "kg" },
        ],
        version: "1.0",
      },
    ];
  }
}

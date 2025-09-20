// Entity classes for data management
// These now use the real API service

import apiService from "../services/api.js";

class BaseEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static async list(orderBy = "-created_date", limit = 50) {
    // This will be overridden by each entity
    return [];
  }

  static async get(id) {
    // This will be overridden by each entity
    return null;
  }

  static async create(data) {
    // This will be overridden by each entity
    return null;
  }

  static async update(id, data) {
    // This will be overridden by each entity
    return null;
  }

  static async delete(id) {
    // This will be overridden by each entity
    return false;
  }
}

export class ManufacturingOrder extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    try {
      const response = await apiService.getManufacturingOrders({ limit });
      return response.success ? response.data.orders : [];
    } catch (error) {
      console.error("Error fetching manufacturing orders:", error);
      return [];
    }
  }

  static async get(id) {
    try {
      const response = await apiService.getManufacturingOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error fetching manufacturing order:", error);
      return null;
    }
  }

  static async create(data) {
    try {
      const response = await apiService.createManufacturingOrder(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error creating manufacturing order:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiService.updateManufacturingOrder(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error updating manufacturing order:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiService.deleteManufacturingOrder(id);
      return response.success;
    } catch (error) {
      console.error("Error deleting manufacturing order:", error);
      return false;
    }
  }

  static async confirm(id) {
    try {
      const response = await apiService.confirmManufacturingOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error confirming manufacturing order:", error);
      throw error;
    }
  }

  static async start(id) {
    try {
      const response = await apiService.startManufacturingOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error starting manufacturing order:", error);
      throw error;
    }
  }

  static async complete(id) {
    try {
      const response = await apiService.completeManufacturingOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error completing manufacturing order:", error);
      throw error;
    }
  }

  static async cancel(id) {
    try {
      const response = await apiService.cancelManufacturingOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error canceling manufacturing order:", error);
      throw error;
    }
  }
}

export class WorkOrder extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    try {
      const response = await apiService.getWorkOrders({ limit });
      return response.success ? response.data.workOrders : [];
    } catch (error) {
      console.error("Error fetching work orders:", error);
      return [];
    }
  }

  static async get(id) {
    try {
      const response = await apiService.getWorkOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error fetching work order:", error);
      return null;
    }
  }

  static async create(data) {
    try {
      const response = await apiService.createWorkOrder(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error creating work order:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiService.updateWorkOrder(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error updating work order:", error);
      throw error;
    }
  }

  static async start(id) {
    try {
      const response = await apiService.startWorkOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error starting work order:", error);
      throw error;
    }
  }

  static async pause(id) {
    try {
      const response = await apiService.pauseWorkOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error pausing work order:", error);
      throw error;
    }
  }

  static async resume(id) {
    try {
      const response = await apiService.resumeWorkOrder(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error resuming work order:", error);
      throw error;
    }
  }

  static async complete(id, data = {}) {
    try {
      const response = await apiService.completeWorkOrder(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error completing work order:", error);
      throw error;
    }
  }
}

export class Product extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    try {
      const response = await apiService.getProducts({ limit });
      return response.success ? response.data.products : [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  static async get(id) {
    try {
      const response = await apiService.getProduct(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  static async create(data) {
    try {
      const response = await apiService.createProduct(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiService.updateProduct(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiService.deleteProduct(id);
      return response.success;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }
}

export class WorkCenter extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    try {
      const response = await apiService.getWorkCenters({ limit });
      return response.success ? response.data.workCenters : [];
    } catch (error) {
      console.error("Error fetching work centers:", error);
      return [];
    }
  }

  static async get(id) {
    try {
      const response = await apiService.getWorkCenter(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error fetching work center:", error);
      return null;
    }
  }

  static async create(data) {
    try {
      const response = await apiService.createWorkCenter(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error creating work center:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiService.updateWorkCenter(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error updating work center:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiService.deleteWorkCenter(id);
      return response.success;
    } catch (error) {
      console.error("Error deleting work center:", error);
      return false;
    }
  }
}

export class StockMovement extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    try {
      const response = await apiService.getStockMovements({ limit });
      // Backend now returns stock movements array directly
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      return [];
    }
  }

  static async create(data) {
    try {
      const response = await apiService.createStockMovement(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error creating stock movement:", error);
      throw error;
    }
  }
}

export class BOM extends BaseEntity {
  static async list(orderBy = "-created_date", limit = 50) {
    try {
      const response = await apiService.getBOMs({ limit });
      return response.success ? response.data.boms : [];
    } catch (error) {
      console.error("Error fetching BOMs:", error);
      return [];
    }
  }

  static async get(id) {
    try {
      const response = await apiService.getBOM(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error fetching BOM:", error);
      return null;
    }
  }

  static async create(data) {
    try {
      const response = await apiService.createBOM(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error creating BOM:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiService.updateBOM(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error updating BOM:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiService.deleteBOM(id);
      return response.success;
    } catch (error) {
      console.error("Error deleting BOM:", error);
      return false;
    }
  }

  static async activate(id) {
    try {
      const response = await apiService.activateBOM(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error activating BOM:", error);
      throw error;
    }
  }
}

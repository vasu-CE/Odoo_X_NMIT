// API service for connecting frontend to backend
const API_BASE_URL = "http://localhost:3001/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("authToken");
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Generic GET method
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // Authentication methods
  async login(identifier, password, type = "email") {
    const payload = { identifier, password };

    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });
    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Manufacturing Orders
  async getManufacturingOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/manufacturing-orders${queryString ? `?${queryString}` : ""}`
    );
  }

  async getManufacturingOrder(id) {
    return this.request(`/manufacturing-orders/${id}`);
  }

  async createManufacturingOrder(data) {
    return this.request("/manufacturing-orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Create manufacturing order with assigned work orders
  async createManufacturingOrderWithWorkOrders(data) {
    return this.request("/manufacturing-orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateManufacturingOrder(id, data) {
    return this.request(`/manufacturing-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateManufacturingOrderStatus(id, status, notes = "") {
    return this.request(`/manufacturing-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  }

  async deleteManufacturingOrder(id) {
    return this.request(`/manufacturing-orders/${id}`, {
      method: "DELETE",
    });
  }

  async confirmManufacturingOrder(id) {
    return this.request(`/manufacturing-orders/${id}/confirm`, {
      method: "POST",
    });
  }

  async startManufacturingOrder(id) {
    return this.request(`/manufacturing-orders/${id}/start`, {
      method: "POST",
    });
  }

  async completeManufacturingOrder(id) {
    return this.request(`/manufacturing-orders/${id}/complete`, {
      method: "POST",
    });
  }

  async cancelManufacturingOrder(id) {
    return this.request(`/manufacturing-orders/${id}/cancel`, {
      method: "POST",
    });
  }

  // Components for Manufacturing Orders
  async addComponentToManufacturingOrder(manufacturingOrderId, componentData) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/components`,
      {
        method: "POST",
        body: JSON.stringify(componentData),
      }
    );
  }

  async updateComponentInManufacturingOrder(
    manufacturingOrderId,
    componentId,
    componentData
  ) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/components/${componentId}`,
      {
        method: "PUT",
        body: JSON.stringify(componentData),
      }
    );
  }

  async deleteComponentFromManufacturingOrder(
    manufacturingOrderId,
    componentId
  ) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/components/${componentId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Work Orders for Manufacturing Orders
  async addWorkOrderToManufacturingOrder(manufacturingOrderId, workOrderData) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/work-orders`,
      {
        method: "POST",
        body: JSON.stringify(workOrderData),
      }
    );
  }

  async updateWorkOrderInManufacturingOrder(
    manufacturingOrderId,
    workOrderId,
    workOrderData
  ) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/work-orders/${workOrderId}`,
      {
        method: "PUT",
        body: JSON.stringify(workOrderData),
      }
    );
  }

  async deleteWorkOrderFromManufacturingOrder(
    manufacturingOrderId,
    workOrderId
  ) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/work-orders/${workOrderId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getWorkOrdersForManufacturingOrder(manufacturingOrderId) {
    return this.request(
      `/manufacturing-orders/${manufacturingOrderId}/work-orders`
    );
  }

  // Work Orders
  async getWorkOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/work-orders${queryString ? `?${queryString}` : ""}`);
  }

  async getWorkOrder(id) {
    return this.request(`/work-orders/${id}`);
  }

  async createWorkOrder(data) {
    return this.request("/work-orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkOrder(id, data) {
    return this.request(`/work-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async startWorkOrder(id) {
    return this.request(`/work-orders/${id}/start`, {
      method: "POST",
    });
  }

  async pauseWorkOrder(id) {
    return this.request(`/work-orders/${id}/pause`, {
      method: "POST",
    });
  }

  async resumeWorkOrder(id) {
    return this.request(`/work-orders/${id}/resume`, {
      method: "POST",
    });
  }

  async completeWorkOrder(id, data = {}) {
    return this.request(`/work-orders/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async doneWorkOrder(id) {
    return this.request(`/work-orders/${id}/done`, {
      method: 'PATCH'
    });
  }

  async cancelWorkOrder(id) {
    return this.request(`/work-orders/${id}/cancel`, {
      method: 'PATCH'
    });
  }

  async getShopFloorWorkOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/work-orders/shop-floor${queryString ? `?${queryString}` : ''}`);
  }

  async getMyAssignments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/work-orders/my-assignments${queryString ? `?${queryString}` : ""}`
    );
  }

  // Get work orders by assigned user ID
  async getWorkOrdersByAssignedUser(assignedToId, params = {}) {
    const queryParams = { assignedToId, ...params };
    const queryString = new URLSearchParams(queryParams).toString();
    return this.request(`/work-orders${queryString ? `?${queryString}` : ""}`);
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ""}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async getProductStock(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/products/${id}/stock${queryString ? `?${queryString}` : ""}`
    );
  }

  async adjustProductStock(id, data) {
    return this.request(`/products/${id}/stock-adjustment`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Work Centers
  async getWorkCenters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/work-centers${queryString ? `?${queryString}` : ""}`);
  }

  async getWorkCenter(id) {
    return this.request(`/work-centers/${id}`);
  }

  async createWorkCenter(data) {
    return this.request("/work-centers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkCenter(id, data) {
    return this.request(`/work-centers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkCenter(id) {
    return this.request(`/work-centers/${id}`, {
      method: "DELETE",
    });
  }

  async getWorkCenterUtilization(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/work-centers/${id}/utilization${queryString ? `?${queryString}` : ""}`
    );
  }

  async getWorkCenterSchedule(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/work-centers/${id}/schedule${queryString ? `?${queryString}` : ""}`
    );
  }

  // BOMs
  async getBOMs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/boms${queryString ? `?${queryString}` : ""}`);
  }

  async getBOM(id) {
    return this.request(`/boms/${id}`);
  }

  async createBOM(data) {
    return this.request("/boms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBOM(id, data) {
    return this.request(`/boms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBOM(id) {
    return this.request(`/boms/${id}`, {
      method: "DELETE",
    });
  }

  async activateBOM(id) {
    return this.request(`/boms/${id}/activate`, {
      method: "POST",
    });
  }

  async getBOMsByProduct(productId) {
    return this.request(`/boms/product/${productId}`);
  }

  // Stock Movements
  async getStockMovements(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/stock-movements${queryString ? `?${queryString}` : ""}`
    );
  }

  async createStockMovement(data) {
    return this.request("/stock-movements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStockMovementsByProduct(productId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/stock-movements/product/${productId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  }

  async getInventorySummary() {
    return this.request("/inventory/summary");
  }

  async getLowStockProducts() {
    return this.request("/inventory/low-stock");
  }

  // Dashboard
  async getDashboardOverview() {
    return this.request("/dashboard/overview");
  }

  async getDashboardKPIs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/dashboard/kpis${queryString ? `?${queryString}` : ""}`
    );
  }

  async getRecentOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/dashboard/recent-orders${queryString ? `?${queryString}` : ""}`
    );
  }

  async getDashboardAlerts() {
    return this.request("/dashboard/alerts");
  }

  // Reports
  async getProductionSummary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/reports/production-summary${queryString ? `?${queryString}` : ""}`
    );
  }

  async getResourceUtilization(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/reports/resource-utilization${queryString ? `?${queryString}` : ""}`
    );
  }

  async getInventoryValuation(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/reports/inventory-valuation${queryString ? `?${queryString}` : ""}`
    );
  }

  async getWorkOrderPerformance(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/reports/work-order-performance${queryString ? `?${queryString}` : ""}`
    );
  }

  async getWorkOrderAnalysis(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/reports/work-order-analysis${queryString ? `?${queryString}` : ""}`
    );
  }

  // Users
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ""}`);
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(data) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getProfile() {
    return this.request("/users/profile");
  }

  async updateProfile(data) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(id, data) {
    return this.request(`/users/${id}/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Stock Aggregation
  async getStockAggregation(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append("category", params.category);
    if (params.type) queryParams.append("type", params.type);
    if (params.lowStock !== undefined)
      queryParams.append("lowStock", params.lowStock);
    if (params.period) queryParams.append("period", params.period);

    const response = await this.request(
      `/products/stock-aggregation?${queryParams.toString()}`
    );
    return response.data;
  }

  // Stock Ledger Methods
  async getStockLedgerProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/stock-ledger/products${queryString ? `?${queryString}` : ''}`);
  }

  async getStockLedgerAggregation() {
    return this.request('/stock-ledger/aggregation');
  }

  async createStockLedgerProduct(data) {
    return this.request('/stock-ledger/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateStockLedgerProduct(id, data) {
    return this.request(`/stock-ledger/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async createStockMovement(data) {
    return this.request('/stock-ledger/movements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getProductMovements(productId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/stock-ledger/movements/${productId}${queryString ? `?${queryString}` : ''}`);
  }

  async autoUpdateStock(data) {
    return this.request('/stock-ledger/auto-update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ManufacturingOrder, Product, BOM } from "../entities/all";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import {
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  ArrowLeft,
  Check,
  AlertCircle,
  Hash,
  Menu,
  List,
  Grid3X3,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

// Status filter configuration matching the mockup
const statusFilters = {
  all: [
    { id: "draft", label: "Draft", count: 2, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "confirmed", label: "Confirmed", count: 7, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "in_progress", label: "In-Progress", count: 1, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "to_close", label: "To Close", count: 5, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "not_assigned", label: "Not Assigned", count: 11, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "late", label: "Late", count: 11, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  ],
  my: [
    { id: "confirmed", label: "Confirmed", count: 7, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "in_progress", label: "In-Progress", count: 1, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "to_close", label: "To Close", count: 5, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { id: "late", label: "Late", count: 8, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  ]
};

export default function ManufacturingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilterGroup, setActiveFilterGroup] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("draft");
  const [viewMode, setViewMode] = useState("list"); // list or kanban
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    product_id: "",
    quantity: 1,
    scheduled_start: "",
    assigned_to_id: "",
    priority: "MEDIUM",
    notes: ""
  });

  // Mock data for demonstration - matching the mockup
  const mockOrders = [
    {
      id: "1",
      reference: "MO-000001",
      startDate: "Tomorrow",
      finishedProduct: "Dinning Table",
      componentStatus: "Not Available",
      quantity: 5.00,
      unit: "Units",
      state: "Confirmed",
      isLate: false,
      isAssigned: true,
    },
    {
      id: "2", 
      reference: "MO-000002",
      startDate: "Yesterday",
      finishedProduct: "Drawer",
      componentStatus: "Available",
      quantity: 2.00,
      unit: "Units",
      state: "In-Progress",
      isLate: true,
      isAssigned: true,
    },
    {
      id: "3",
      reference: "MO-000003", 
      startDate: "Today",
      finishedProduct: "Chair",
      componentStatus: "Available",
      quantity: 10.00,
      unit: "Units",
      state: "Draft",
      isLate: false,
      isAssigned: false,
    },
    {
      id: "4",
      reference: "MO-000004",
      startDate: "Last Week",
      finishedProduct: "Cabinet",
      componentStatus: "Not Available", 
      quantity: 3.00,
      unit: "Units",
      state: "Confirmed",
      isLate: true,
      isAssigned: false,
    },
    {
      id: "5",
      reference: "MO-000005",
      startDate: "Next Week",
      finishedProduct: "Shelf",
      componentStatus: "Available",
      quantity: 8.00,
      unit: "Units", 
      state: "To Close",
      isLate: false,
      isAssigned: true,
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load real data from API
      const ordersData = await ManufacturingOrder.list("-created_date");
      
      // Transform API data to match our UI structure
      const transformedOrders = ordersData.map(order => ({
        id: order.id,
        reference: order.order_number || `MO-${order.id.slice(-6)}`,
        startDate: order.scheduled_start ? 
          new Date(order.scheduled_start).toLocaleDateString() : 
          "Not scheduled",
        finishedProduct: order.product_name || "Unknown Product",
        componentStatus: order.component_status || "Unknown",
        quantity: order.quantity || 0,
        unit: order.unit || "Units",
        state: order.status?.replace("_", " ") || "Unknown",
        isLate: order.scheduled_start ? 
          new Date(order.scheduled_start) < new Date() && order.status === "CONFIRMED" : 
          false,
        isAssigned: !!order.assigned_to_id,
        actualStartDate: order.actual_start,
        actualEndDate: order.actual_end,
        priority: order.priority,
        notes: order.notes
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback to mock data if API fails
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts for filters
  const calculateFilterCounts = () => {
    const counts = {
      all: {
        draft: orders.filter(o => o.state === "Draft").length,
        confirmed: orders.filter(o => o.state === "Confirmed").length,
        in_progress: orders.filter(o => o.state === "In-Progress").length,
        to_close: orders.filter(o => o.state === "To Close").length,
        not_assigned: orders.filter(o => !o.isAssigned).length,
        late: orders.filter(o => o.isLate).length,
      },
      my: {
        confirmed: orders.filter(o => o.state === "Confirmed" && o.isAssigned).length,
        in_progress: orders.filter(o => o.state === "In-Progress" && o.isAssigned).length,
        to_close: orders.filter(o => o.state === "To Close" && o.isAssigned).length,
        late: orders.filter(o => o.isLate && o.isAssigned).length,
      }
    };
    return counts;
  };

  const filterCounts = calculateFilterCounts();

  // Filter orders based on search and active filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.finishedProduct?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeStatusFilter === "all" || order.state.toLowerCase().replace(" ", "_") === activeStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId, checked) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "In-Progress":
        return "bg-yellow-100 text-yellow-800";
      case "To Close":
        return "bg-purple-100 text-purple-800";
      case "Done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        ...createFormData,
        status: "PLANNED"
      };
      
      await ManufacturingOrder.create(orderData);
      await loadData(); // Reload data
      setShowCreateDialog(false);
      setCreateFormData({
        product_id: "",
        quantity: 1,
        scheduled_start: "",
        assigned_to_id: "",
        priority: "MEDIUM",
        notes: ""
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Title and Menu Bar */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Left side - Menu and Actions */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* Hamburger Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* App Logo and Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">ManufacturingOS</span>
            </div>

            {/* New Button */}
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/manufacturing-orders/new'}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Manufacturing Order
            </Button>
          </div>

          {/* Right side - Search and View Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:flex-none lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Manufacturing Orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none border-r"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="rounded-l-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Filter Section - Dashboard */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="space-y-4">
          {/* Filter Group Toggle */}
          <div className="flex gap-1">
            <Button
              variant={activeFilterGroup === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilterGroup("all")}
              className="text-sm"
            >
              All
            </Button>
            <Button
              variant={activeFilterGroup === "my" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilterGroup("my")}
              className="text-sm"
            >
              My
            </Button>
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {statusFilters[activeFilterGroup].map((filter) => (
              <Button
                key={filter.id}
                variant={activeStatusFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatusFilter(filter.id)}
                className="flex flex-col items-center py-2 px-3 h-auto"
              >
                <span className="text-lg font-semibold">{filterCounts[activeFilterGroup][filter.id] || 0}</span>
                <span className="text-xs">{filter.label}</span>
              </Button>
            ))}
          </div>

          {/* Filter Descriptions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Filter Manufacturing orders when user clicks on any of the state button, highlight the clicked button and add filter on search according to the button click</p>
            <p>• Late Filter show manufacturing order whose start date has already passed and are still in confirmed state.</p>
            <p>• Not Assigned filter shows manufacturing order which don't have any assignee.</p>
          </div>
        </div>
      </div>

      {/* Main Content - Manufacturing Orders Table */}
      <div className="px-4 lg:px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-8 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="hidden sm:block">Reference</div>
              <div className="hidden md:block">Start Date</div>
              <div className="hidden lg:block">Finished Product</div>
              <div className="hidden lg:block">Component Status</div>
              <div className="hidden md:block">Quantity</div>
              <div className="hidden sm:block">Unit</div>
              <div>State</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-8 gap-4 px-4 py-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-8 gap-4 px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked)}
                    />
                  </div>
                  <div className="font-mono text-sm text-gray-900 hidden sm:block">{order.reference}</div>
                  <div className="text-sm text-gray-700 hidden md:block">{order.startDate}</div>
                  <div className="text-sm text-gray-700 hidden lg:block">{order.finishedProduct}</div>
                  <div className="text-sm hidden lg:block">
                    <Badge 
                      variant={order.componentStatus === "Available" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {order.componentStatus}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-700 hidden md:block">{order.quantity}</div>
                  <div className="text-sm text-gray-700 hidden sm:block">{order.unit}</div>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${getStatusColor(order.state)}`}>
                      {order.state}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No manufacturing orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden mt-4 space-y-3">
          {filteredOrders.map((order) => (
            <div key={`mobile-${order.id}`} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => handleSelectOrder(order.id, checked)}
                  />
                <div>
                    <div className="font-mono text-sm font-semibold text-gray-900">{order.reference}</div>
                    <div className="text-xs text-gray-500">{order.finishedProduct}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-4 h-4" />
                </Button>
                </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <div className="font-medium">{order.startDate}</div>
                </div>
                <div>
                  <span className="text-gray-500">Quantity:</span>
                  <div className="font-medium">{order.quantity} {order.unit}</div>
                </div>
                <div>
                  <span className="text-gray-500">Component Status:</span>
                  <div>
                    <Badge 
                      variant={order.componentStatus === "Available" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {order.componentStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">State:</span>
                  <div>
                    <Badge className={`text-xs ${getStatusColor(order.state)}`}>
                      {order.state}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Order Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Create Manufacturing Order</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateDialog(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
                </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <select
                    value={createFormData.product_id}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, product_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a product</option>
                    {/* You would populate this with actual products from API */}
                    <option value="1">Dinning Table</option>
                    <option value="2">Drawer</option>
                    <option value="3">Chair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createFormData.quantity}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Start Date
                  </label>
                  <input
                    type="date"
                    value={createFormData.scheduled_start}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={createFormData.priority}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
          </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={createFormData.notes}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  ManufacturingOrder, 
  WorkOrder, 
  Product, 
  WorkCenter,
  StockMovement 
} from "../entities/all";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import {
  Package,
  Plus,
  Search,
  List,
  Grid3X3,
  ChevronDown,
  MoreVertical,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Dashboard() {
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilterGroup, setActiveFilterGroup] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("draft");
  const [viewMode, setViewMode] = useState("list");
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Status filter configuration matching the wireframe
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

  // Mock data matching the wireframe
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const ordersData = await ManufacturingOrder.list("-created_date");
      
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
      }));
      
      setManufacturingOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading data:", error);
      setManufacturingOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts for filters
  const calculateFilterCounts = () => {
    const counts = {
      all: {
        draft: manufacturingOrders.filter(o => o.state === "Draft").length,
        confirmed: manufacturingOrders.filter(o => o.state === "Confirmed").length,
        in_progress: manufacturingOrders.filter(o => o.state === "In-Progress").length,
        to_close: manufacturingOrders.filter(o => o.state === "To Close").length,
        not_assigned: manufacturingOrders.filter(o => !o.isAssigned).length,
        late: manufacturingOrders.filter(o => o.isLate).length,
      },
      my: {
        confirmed: manufacturingOrders.filter(o => o.state === "Confirmed" && o.isAssigned).length,
        in_progress: manufacturingOrders.filter(o => o.state === "In-Progress" && o.isAssigned).length,
        to_close: manufacturingOrders.filter(o => o.state === "To Close" && o.isAssigned).length,
        late: manufacturingOrders.filter(o => o.isLate && o.isAssigned).length,
      }
    };
    return counts;
  };

  const filterCounts = calculateFilterCounts();

  // Filter orders based on search and active filters
  const filteredOrders = manufacturingOrders.filter(order => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action/Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Left side - New Button */}
          <div className="flex items-center gap-4">
            <Link to="/manufacturing-orders/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors duration-200">
                <Plus className="w-4 h-4 mr-2" />
                New Manufacturing Order
              </Button>
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 cursor-text"
              />
            </div>
          </div>

          {/* Right side - View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-r-none border-r cursor-pointer transition-colors duration-200 ${
                  viewMode === "list" 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={`rounded-l-none cursor-pointer transition-colors duration-200 ${
                  viewMode === "kanban" 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="space-y-4">
          {/* Filter Group Toggle */}
          <div className="flex gap-1">
            <Button
              variant={activeFilterGroup === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilterGroup("all")}
              className={`text-sm cursor-pointer transition-all duration-200 ${
                activeFilterGroup === "all" 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              All
            </Button>
            <Button
              variant={activeFilterGroup === "my" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilterGroup("my")}
              className={`text-sm cursor-pointer transition-all duration-200 ${
                activeFilterGroup === "my" 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
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
                className={`flex flex-col items-center py-2 px-3 h-auto cursor-pointer transition-all duration-200 ${
                  activeStatusFilter === filter.id 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <span className="text-lg font-semibold">{filterCounts[activeFilterGroup][filter.id] || 0}</span>
                <span className="text-xs">{filter.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Manufacturing Orders Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-8 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </div>
              <div className="hidden sm:block">Referrence</div>
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
                      className="cursor-pointer"
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
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer hover:bg-gray-100">
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
      </div>
    </div>
  );
}
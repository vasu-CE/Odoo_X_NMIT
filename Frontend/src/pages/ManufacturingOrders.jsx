import React, { useState, useEffect } from "react";
import { ManufacturingOrder, Product, BOM } from "../entities/all";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
} from "lucide-react";

import OrderCard from "../components/manufacturing/OrderCard";
import CreateOrderDialog from "../components/manufacturing/CreateOrderDialog";
import FilterBar from "../components/manufacturing/FilterBar";

const statusConfig = {
  planned: {
    color: "bg-blue-100 text-blue-800",
    icon: Calendar,
    label: "Planned",
  },
  in_progress: {
    color: "bg-orange-100 text-orange-800",
    icon: PlayCircle,
    label: "In Progress",
  },
  completed: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function ManufacturingOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData, bomsData] = await Promise.all([
        ManufacturingOrder.list("-created_date"),
        Product.list("-created_date"),
        BOM.list("-created_date"),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setBoms(bomsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      await ManufacturingOrder.create(orderData);
      loadData();
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleUpdateOrder = async (orderId, updates) => {
    try {
      await ManufacturingOrder.update(orderId, updates);
      loadData();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group orders by status for better organization
  const groupedOrders = filteredOrders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manufacturing Orders
            </h1>
            <p className="text-gray-600">
              Manage production orders and track progress
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders by product or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50"
              />
            </div>
            <FilterBar
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/60 rounded-xl p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status-based organization */}
            {Object.entries(statusConfig).map(([status, config]) => {
              const statusOrders = groupedOrders[status] || [];
              if (statusOrders.length === 0) return null;

              return (
                <div key={status} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <config.icon className="w-5 h-5 text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {config.label} ({statusOrders.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statusOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdate={handleUpdateOrder}
                        statusConfig={statusConfig}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first manufacturing order to get started"}
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create Order Dialog */}
        <CreateOrderDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateOrder}
          products={products}
          boms={boms}
        />
      </div>
    </div>
  );
}

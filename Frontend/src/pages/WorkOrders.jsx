import React, { useState, useEffect } from "react";
import { WorkOrder, ManufacturingOrder, WorkCenter } from "../entities/all";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Plus,
  Search,
  List,
  Grid3X3,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  Factory,
  Package,
} from "lucide-react";

const statusConfig = {
  pending: {
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
    label: "Pending",
  },
  in_progress: {
    color: "bg-blue-100 text-blue-800",
    icon: PlayCircle,
    label: "In Progress",
  },
  paused: {
    color: "bg-yellow-100 text-yellow-800",
    icon: PauseCircle,
    label: "Paused",
  },
  completed: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: AlertTriangle,
    label: "Cancelled",
  },
};

const priorityConfig = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800",
};

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use mock data to avoid API rate limiting
      const mockWorkOrders = [
        {
          id: 1,
          work_order_number: "WO001",
          operation_name: "Assembly-1",
          manufacturing_order_id: 1,
          work_center_id: 1,
          status: "in_progress",
          priority: "high",
          assignee_name: "John Doe",
          scheduled_start: "2024-01-15",
          scheduled_end: "2024-01-16",
          expected_duration: "60:00",
          actual_duration: "45:30",
        },
        {
          id: 2,
          work_order_number: "WO002",
          operation_name: "Assembly-2",
          manufacturing_order_id: 2,
          work_center_id: 2,
          status: "pending",
          priority: "medium",
          assignee_name: "Jane Smith",
          scheduled_start: "2024-01-16",
          scheduled_end: "2024-01-17",
          expected_duration: "45:00",
          actual_duration: null,
        },
        {
          id: 3,
          work_order_number: "WO003",
          operation_name: "Quality Check",
          manufacturing_order_id: 1,
          work_center_id: 3,
          status: "completed",
          priority: "low",
          assignee_name: "Mike Johnson",
          scheduled_start: "2024-01-14",
          scheduled_end: "2024-01-14",
          expected_duration: "30:00",
          actual_duration: "28:15",
        },
      ];

      const mockManufacturingOrders = [
        {
          id: 1,
          order_number: "MO001",
          product_name: "Dining Table Set",
        },
        {
          id: 2,
          order_number: "MO002",
          product_name: "Office Chair",
        },
      ];

      const mockWorkCenters = [
        {
          id: 1,
          name: "Work Center-1",
        },
        {
          id: 2,
          name: "Work Center-2",
        },
        {
          id: 3,
          name: "Work Center-3",
        },
      ];

      setWorkOrders(mockWorkOrders);
      setManufacturingOrders(mockManufacturingOrders);
      setWorkCenters(mockWorkCenters);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (workOrderId, newStatus) => {
    try {
      // Mock update - in real app, this would call the API
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.id === workOrderId ? { ...wo, status: newStatus } : wo
        )
      );
    } catch (error) {
      console.error("Error updating work order:", error);
    }
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.operation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.work_center_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.finished_product?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Get manufacturing order details
  const getManufacturingOrder = (moId) => {
    return manufacturingOrders.find((mo) => mo.id === moId);
  };

  // Get work center details
  const getWorkCenter = (wcId) => {
    return workCenters.find((wc) => wc.id === wcId);
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              <Plus className="w-5 h-5 text-gray-500" />
              <button
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
                className="p-1 hover:bg-gray-100 rounded"
              >
                {viewMode === "list" ? (
                  <Grid3X3 className="w-5 h-5 text-gray-500" />
                ) : (
                  <List className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          {/* <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-medium">
            Glittering Giraffe
          </div> */}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search work order based on operation, work center, finished product, status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-300"
            />
          </div>
        </div>

        {/* Table View */}
        {viewMode === "list" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Center
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Finished Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Real Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </td>
                        </tr>
                      ))
                  ) : filteredWorkOrders.length > 0 ? (
                    filteredWorkOrders.map((workOrder) => {
                      const mo = getManufacturingOrder(
                        workOrder.manufacturing_order_id
                      );
                      const wc = getWorkCenter(workOrder.work_center_id);
                      const statusInfo =
                        statusConfig[workOrder.status] || statusConfig.pending;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={workOrder.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {workOrder.operation_name || "Assembly-1"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Factory className="w-4 h-4 mr-2 text-gray-400" />
                              {wc?.name || "Work Center-1"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Package className="w-4 h-4 mr-2 text-gray-400" />
                              {mo?.product_name ||
                                workOrder.finished_product ||
                                "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workOrder.expected_duration || "60:00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workOrder.actual_duration || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`${statusInfo.color} flex items-center gap-1 w-fit`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium mb-2">
                            No work orders found
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : "Populate all work orders added to manufacturing order"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View (fallback) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkOrders.map((workOrder) => {
              const mo = getManufacturingOrder(
                workOrder.manufacturing_order_id
              );
              const wc = getWorkCenter(workOrder.work_center_id);
              const statusInfo =
                statusConfig[workOrder.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={workOrder.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {workOrder.work_order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {workOrder.operation_name}
                      </p>
                    </div>
                    <Badge
                      className={`${statusInfo.color} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-gray-400" />
                      <span>{wc?.name || "Work Center-1"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>
                        {mo?.product_name || workOrder.finished_product || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected:</span>
                      <span>{workOrder.expected_duration || "60:00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Real:</span>
                      <span>{workOrder.actual_duration || "-"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

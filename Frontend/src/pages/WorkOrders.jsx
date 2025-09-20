import React, { useState, useEffect } from "react";
import { WorkOrder, ManufacturingOrder, WorkCenter } from "../entities/all";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
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
  Play,
  Pause,
  Check,
} from "lucide-react";

const statusConfig = {
  PENDING: {
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
    label: "Pending",
  },
  IN_PROGRESS: {
    color: "bg-blue-100 text-blue-800",
    icon: PlayCircle,
    label: "In Progress",
  },
  PAUSED: {
    color: "bg-yellow-100 text-yellow-800",
    icon: PauseCircle,
    label: "Paused",
  },
  COMPLETED: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Completed",
  },
  SKIPPED: {
    color: "bg-red-100 text-red-800",
    icon: AlertTriangle,
    label: "Skipped",
  },
};

const priorityConfig = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800",
};

export default function WorkOrders() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [elapsedTimes, setElapsedTimes] = useState({}); // Track elapsed times for in-progress orders

  const isShopFloorOperator = user?.role === 'SHOP_FLOOR_OPERATOR';

  useEffect(() => {
    loadData();
  }, []);

  // Update elapsed times every second for in-progress work orders
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const updated = { ...prev };
        workOrders.forEach(wo => {
          if (wo.status === 'IN_PROGRESS' && wo.startTime) {
            const startTime = new Date(wo.startTime);
            const now = new Date();
            const elapsed = Math.floor((now - startTime) / 1000); // seconds
            updated[wo.id] = elapsed;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [workOrders]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (isShopFloorOperator) {
        // For shop floor operators, get their assigned work orders
        const response = await apiService.getShopFloorWorkOrders();
        if (response.success) {
          setWorkOrders(response.data.workOrders);
        }
      } else {
        // For other roles, get all work orders
        const response = await apiService.getWorkOrders();
        if (response.success) {
          setWorkOrders(response.data.workOrders);
        }
      }

      // Load manufacturing orders and work centers for reference
      const [moResponse, wcResponse] = await Promise.all([
        apiService.getManufacturingOrders(),
        apiService.getWorkCenters()
      ]);

      if (moResponse.success) {
        setManufacturingOrders(moResponse.data.manufacturingOrders);
      }
      if (wcResponse.success) {
        setWorkCenters(wcResponse.data.workCenters);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkOrder = async (workOrderId) => {
    try {
      const response = await apiService.startWorkOrder(workOrderId);
      if (response.success) {
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error("Error starting work order:", error);
    }
  };

  const handlePauseWorkOrder = async (workOrderId) => {
    try {
      const response = await apiService.pauseWorkOrder(workOrderId);
      if (response.success) {
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error("Error pausing work order:", error);
    }
  };

  const handleDoneWorkOrder = async (workOrderId) => {
    try {
      const response = await apiService.doneWorkOrder(workOrderId);
      if (response.success) {
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error("Error completing work order:", error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRealDuration = (workOrder) => {
    if (workOrder.status === 'COMPLETED' && workOrder.realDuration) {
      return `${workOrder.realDuration} min`;
    }
    if (workOrder.status === 'IN_PROGRESS' && elapsedTimes[workOrder.id]) {
      return formatDuration(elapsedTimes[workOrder.id]);
    }
    return workOrder.realDuration ? `${workOrder.realDuration} min` : '-';
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.operationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.manufacturingOrder?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.workCenter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.manufacturingOrder?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
            <div className="flex items-center gap-2">
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
                    {isShopFloorOperator && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
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
                      const statusInfo =
                        statusConfig[workOrder.status] || statusConfig.PENDING;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={workOrder.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {workOrder.operationName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Factory className="w-4 h-4 mr-2 text-gray-400" />
                              {workOrder.workCenter?.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Package className="w-4 h-4 mr-2 text-gray-400" />
                              {workOrder.manufacturingOrder?.product?.name || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workOrder.estimatedTimeMinutes} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getRealDuration(workOrder)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`${statusInfo.color} flex items-center gap-1 w-fit`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </td>
                          {isShopFloorOperator && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                {workOrder.status === 'PENDING' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartWorkOrder(workOrder.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Start
                                  </Button>
                                )}
                                {workOrder.status === 'IN_PROGRESS' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handlePauseWorkOrder(workOrder.id)}
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    >
                                      <Pause className="w-3 h-3 mr-1" />
                                      Pause
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleDoneWorkOrder(workOrder.id)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Done
                                    </Button>
                                  </>
                                )}
                                {workOrder.status === 'PAUSED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleDoneWorkOrder(workOrder.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Done
                                  </Button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isShopFloorOperator ? "7" : "6"} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium mb-2">
                            No work orders found
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : isShopFloorOperator 
                                ? "No work orders assigned to you"
                                : "No work orders available"}
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
              const statusInfo =
                statusConfig[workOrder.status] || statusConfig.PENDING;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={workOrder.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {workOrder.operationName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {workOrder.manufacturingOrder?.orderNumber}
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
                      <span>{workOrder.workCenter?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>
                        {workOrder.manufacturingOrder?.product?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected:</span>
                      <span>{workOrder.estimatedTimeMinutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Real:</span>
                      <span>{getRealDuration(workOrder)}</span>
                    </div>
                  </div>

                  {isShopFloorOperator && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        {workOrder.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartWorkOrder(workOrder.id)}
                            className="bg-green-600 hover:bg-green-700 text-white w-full"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {workOrder.status === 'IN_PROGRESS' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePauseWorkOrder(workOrder.id)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1"
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDoneWorkOrder(workOrder.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Done
                            </Button>
                          </>
                        )}
                        {workOrder.status === 'PAUSED' && (
                          <Button
                            size="sm"
                            onClick={() => handleDoneWorkOrder(workOrder.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

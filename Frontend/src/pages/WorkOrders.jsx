import React, { useState, useEffect } from "react";
import { WorkOrder, ManufacturingOrder, WorkCenter } from "../entities/all";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Zap,
  Plus,
  Search,
  Clock,
  User,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  Factory,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [woData, moData, wcData] = await Promise.all([
        WorkOrder.list("-created_date"),
        ManufacturingOrder.list("-created_date"),
        WorkCenter.list("-created_date"),
      ]);
      setWorkOrders(woData);
      setManufacturingOrders(moData);
      setWorkCenters(wcData);
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
      wo.operation_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || wo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
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
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Work Orders
            </h1>
            <p className="text-gray-600">
              Manage individual work operations and tasks
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search work orders by number or operation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Orders Grid */}
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
                <Card
                  key={workOrder.id}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {workOrder.work_order_number}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
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
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Manufacturing Order Info */}
                    {mo && (
                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">
                          Manufacturing Order
                        </p>
                        <p className="text-sm text-gray-600">
                          {mo.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Order #{mo.order_number}
                        </p>
                      </div>
                    )}

                    {/* Work Center Info */}
                    {wc && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Factory className="h-4 w-4" />
                        <span>{wc.name}</span>
                      </div>
                    )}

                    {/* Assignee */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{workOrder.assignee_name || "Unassigned"}</span>
                    </div>

                    {/* Priority */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Priority</span>
                      <Badge
                        className={
                          priorityConfig[workOrder.priority] ||
                          priorityConfig.medium
                        }
                      >
                        {workOrder.priority || "medium"}
                      </Badge>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start:</span>
                        <span>
                          {workOrder.scheduled_start
                            ? new Date(
                                workOrder.scheduled_start
                              ).toLocaleDateString()
                            : "Not scheduled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End:</span>
                        <span>
                          {workOrder.scheduled_end
                            ? new Date(
                                workOrder.scheduled_end
                              ).toLocaleDateString()
                            : "Not scheduled"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {workOrder.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(workOrder.id, "in_progress")
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Start
                        </Button>
                      )}
                      {workOrder.status === "in_progress" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(workOrder.id, "paused")
                            }
                            variant="outline"
                            className="flex-1"
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(workOrder.id, "completed")
                            }
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {workOrder.status === "paused" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(workOrder.id, "in_progress")
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredWorkOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No work orders found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first work order to get started"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Work Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

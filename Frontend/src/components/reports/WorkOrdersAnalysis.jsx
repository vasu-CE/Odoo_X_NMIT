import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Search,
  Clock,
  Factory,
  Package,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  Table,
} from "lucide-react";
import apiService from "../../services/api";

export default function WorkOrdersAnalysis() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState("all");
  const [workCenterFilter, setWorkCenterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWorkOrders();
      
      if (response.success && response.data.workOrders) {
        setWorkOrders(response.data.workOrders);
      } else {
        console.error("Failed to load work orders:", response.error);
      }
    } catch (error) {
      console.error("Error loading work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "IN_PROGRESS":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "PAUSED":
        return <PauseCircle className="w-4 h-4 text-orange-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter((workOrder) => {
    const matchesSearch = 
      workOrder.operationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.workCenterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.manufacturingOrder?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = operationFilter === "all" || workOrder.operationName === operationFilter;
    const matchesWorkCenter = workCenterFilter === "all" || workOrder.workCenterName === workCenterFilter;
    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter;

    return matchesSearch && matchesOperation && matchesWorkCenter && matchesStatus;
  });

  // Calculate totals
  const totalExpectedDuration = filteredWorkOrders.reduce((sum, wo) => sum + (wo.estimatedTimeMinutes || 0), 0);
  const totalRealDuration = filteredWorkOrders.reduce((sum, wo) => sum + (wo.actualTimeMinutes || 0), 0);

  // Get unique values for filters
  const uniqueOperations = [...new Set(workOrders.map(wo => wo.operationName).filter(Boolean))];
  const uniqueWorkCenters = [...new Set(workOrders.map(wo => wo.workCenterName).filter(Boolean))];
  const uniqueStatuses = [...new Set(workOrders.map(wo => wo.status).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-6 h-6" />
            Work Orders Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Analyze work order performance and duration tracking
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg pt-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by operation, work center, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Operation Filter */}
            <select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Operations</option>
              {uniqueOperations.map((operation) => (
                <option key={operation} value={operation}>
                  {operation}
                </option>
              ))}
            </select>

            {/* Work Center Filter */}
            <select
              value={workCenterFilter}
              onChange={(e) => setWorkCenterFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Work Centers</option>
              {uniqueWorkCenters.map((workCenter) => (
                <option key={workCenter} value={workCenter}>
                  {workCenter}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Analysis Table */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Work Orders Analysis
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Operation</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Work Center</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Expected Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Real Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((workOrder) => (
                    <tr key={workOrder.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{workOrder.operationName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Factory className="w-4 h-4 text-gray-500" />
                          {workOrder.workCenterName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Package className="w-4 h-4 text-gray-500" />
                          {workOrder.manufacturingOrder?.product?.name || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-700">
                          {workOrder.manufacturingOrder?.quantity || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatDuration(workOrder.estimatedTimeMinutes)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatDuration(workOrder.actualTimeMinutes)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(workOrder.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(workOrder.status)}
                            {workOrder.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan="4" className="py-3 px-4 font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatDuration(totalExpectedDuration)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatDuration(totalRealDuration)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {filteredWorkOrders.length} orders
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>

              {filteredWorkOrders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Factory className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
                  <p className="text-gray-500">
                    {searchTerm || operationFilter !== "all" || workCenterFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "No work orders have been created yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

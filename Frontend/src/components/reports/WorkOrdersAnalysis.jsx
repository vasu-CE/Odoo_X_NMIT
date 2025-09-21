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
  Download,
  FileSpreadsheet,
} from "lucide-react";
import apiService from "../../services/api";
import { generatePDF, generateWorkOrdersPDF } from "../../utils/pdfGenerator";
import { generateWorkOrdersExcel } from "../../utils/excelGenerator";

export default function WorkOrdersAnalysis() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState("all");
  const [workCenterFilter, setWorkCenterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePrintPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Try the html2canvas method first
      const result = await generatePDF(
        "work-orders-report",
        `work-orders-analysis-${new Date().toISOString().split("T")[0]}.pdf`
      );

      if (result.success) {
        console.log("PDF generated successfully");
      } else {
        console.warn(
          "HTML2Canvas failed, falling back to custom PDF generation:",
          result.message
        );

        // Fallback to custom PDF generation
        const filters = {
          searchTerm,
          operationFilter,
          workCenterFilter,
          statusFilter,
        };

        const fallbackResult = await generateWorkOrdersPDF(
          filteredWorkOrders,
          filters,
          `work-orders-analysis-${new Date().toISOString().split("T")[0]}.pdf`
        );

        if (fallbackResult.success) {
          console.log("Fallback PDF generated successfully");
        } else {
          console.error("Both PDF generation methods failed");
          alert("Failed to generate PDF. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Try fallback method
      try {
        const filters = {
          searchTerm,
          operationFilter,
          workCenterFilter,
          statusFilter,
        };

        const fallbackResult = await generateWorkOrdersPDF(
          filteredWorkOrders,
          filters,
          `work-orders-analysis-${new Date().toISOString().split("T")[0]}.pdf`
        );

        if (fallbackResult.success) {
          console.log("Fallback PDF generated successfully");
        } else {
          alert("An error occurred while generating the PDF.");
        }
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        alert("An error occurred while generating the PDF.");
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setIsGeneratingPDF(true);

      const filters = {
        searchTerm,
        operationFilter,
        workCenterFilter,
        statusFilter,
      };

      const result = generateWorkOrdersExcel(
        filteredWorkOrders,
        filters,
        `work-orders-analysis-${new Date().toISOString().split("T")[0]}.xlsx`
      );

      if (result.success) {
        console.log("Excel file generated successfully");
      } else {
        console.error("Excel generation failed:", result.message);
        alert("Failed to generate Excel file. Please try again.");
      }
    } catch (error) {
      console.error("Error generating Excel file:", error);
      alert("An error occurred while generating the Excel file.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter((workOrder) => {
    const matchesSearch =
      workOrder.operationName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      workOrder.workCenterName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      workOrder.manufacturingOrder?.product?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesOperation =
      operationFilter === "all" || workOrder.operationName === operationFilter;
    const matchesWorkCenter =
      workCenterFilter === "all" ||
      workOrder.workCenterName === workCenterFilter;
    const matchesStatus =
      statusFilter === "all" || workOrder.status === statusFilter;

    return (
      matchesSearch && matchesOperation && matchesWorkCenter && matchesStatus
    );
  });

  // Calculate totals
  const totalExpectedDuration = filteredWorkOrders.reduce(
    (sum, wo) => sum + (wo.estimatedTimeMinutes || 0),
    0
  );
  const totalRealDuration = filteredWorkOrders.reduce(
    (sum, wo) => sum + (wo.realDuration || 0),
    0
  );

  // Get unique values for filters
  const uniqueOperations = [
    ...new Set(workOrders.map((wo) => wo.operationName).filter(Boolean)),
  ];
  const uniqueWorkCenters = [
    ...new Set(workOrders.map((wo) => wo.workCenterName).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(workOrders.map((wo) => wo.status).filter(Boolean)),
  ];

  // Calculate dynamic stats
  const stats = {
    total: filteredWorkOrders.length,
    pending: filteredWorkOrders.filter((wo) => wo.status === "PENDING").length,
    inProgress: filteredWorkOrders.filter((wo) => wo.status === "IN_PROGRESS")
      .length,
    completed: filteredWorkOrders.filter((wo) => wo.status === "COMPLETED")
      .length,
    cancelled: filteredWorkOrders.filter((wo) => wo.status === "CANCELLED")
      .length,
    totalExpectedDuration: filteredWorkOrders.reduce(
      (sum, wo) => sum + (wo.estimatedTimeMinutes || 0),
      0
    ),
    totalRealDuration: filteredWorkOrders.reduce(
      (sum, wo) => sum + (wo.realDuration || 0),
      0
    ),
    avgEfficiency:
      filteredWorkOrders.length > 0
        ? filteredWorkOrders.reduce((sum, wo) => {
            const efficiency =
              wo.estimatedTimeMinutes && wo.realDuration
                ? Math.round((wo.estimatedTimeMinutes / wo.realDuration) * 100)
                : 0;
            return sum + efficiency;
          }, 0) / filteredWorkOrders.length
        : 0,
  };

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
        <div className="flex gap-2">
          <Button
            onClick={handlePrintPDF}
            disabled={isGeneratingPDF || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? "Generating..." : "Print as PDF"}
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={isGeneratingPDF || loading}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isGeneratingPDF ? "Generating..." : "Export to Excel"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Table className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <PlayCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Efficiency
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgEfficiency.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Status Breakdown */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Duration
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDuration(stats.totalRealDuration)}
                </p>
                <p className="text-xs text-gray-500">
                  Expected: {formatDuration(stats.totalExpectedDuration)}
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

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
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Analysis Table */}
      <Card
        id="work-orders-report"
        className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg print:bg-white print:shadow-none print:border-gray-300"
      >
        <CardHeader className="pb-4 print:pb-2">
          <CardTitle className="flex items-center gap-2 print:text-lg">
            <Table className="w-5 h-5" />
            Work Orders Analysis
          </CardTitle>
        </CardHeader>

        <CardContent className="print:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full print:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 print:border-gray-400">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Operation
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Work Center
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Expected Duration
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Real Duration
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 print:py-2 print:px-2 print:text-xs">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((workOrder) => (
                    <tr
                      key={workOrder.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 print:border-gray-300 print:hover:bg-transparent"
                    >
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <div className="font-medium text-gray-900 print:text-xs">
                          {workOrder.operationName}
                        </div>
                      </td>
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <div className="flex items-center gap-2 text-gray-700 print:text-xs">
                          <Factory className="w-4 h-4 text-gray-500 print:hidden" />
                          {workOrder.workCenterName}
                        </div>
                      </td>
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <div className="flex items-center gap-2 text-gray-700 print:text-xs">
                          <Package className="w-4 h-4 text-gray-500 print:hidden" />
                          {workOrder.manufacturingOrder?.product?.name || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <div className="text-gray-700 print:text-xs">
                          {workOrder.manufacturingOrder?.quantity || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <div className="flex items-center gap-2 text-gray-700 print:text-xs">
                          <Clock className="w-4 h-4 text-gray-500 print:hidden" />
                          {formatDuration(workOrder.estimatedTimeMinutes)}
                        </div>
                      </td>
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <div className="flex items-center gap-2 text-gray-700 print:text-xs">
                          <Clock className="w-4 h-4 text-gray-500 print:hidden" />
                          {formatDuration(workOrder.realDuration)}
                        </div>
                      </td>
                      <td className="py-3 px-4 print:py-2 print:px-2">
                        <Badge
                          className={`${getStatusColor(
                            workOrder.status
                          )} print:bg-transparent print:border print:border-gray-300 print:text-gray-700`}
                        >
                          <div className="flex items-center gap-1 print:text-xs">
                            <span className="print:hidden">
                              {getStatusIcon(workOrder.status)}
                            </span>
                            {workOrder.status.replace("_", " ")}
                          </div>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 print:border-gray-400 print:bg-gray-100">
                    <td
                      colSpan="4"
                      className="py-3 px-4 font-semibold text-gray-900 print:py-2 print:px-2 print:text-xs"
                    >
                      Total
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 print:py-2 print:px-2 print:text-xs">
                      {formatDuration(totalExpectedDuration)} min
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 print:py-2 print:px-2 print:text-xs">
                      {formatDuration(totalRealDuration)} min
                    </td>
                    <td className="py-3 px-4 print:py-2 print:px-2">
                      <div className="text-sm text-gray-600 print:text-xs">
                        {filteredWorkOrders.length} orders
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>

              {filteredWorkOrders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Factory className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No work orders found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ||
                    operationFilter !== "all" ||
                    workCenterFilter !== "all" ||
                    statusFilter !== "all"
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

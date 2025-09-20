import React, { useState, useEffect } from "react";
import {
  ManufacturingOrder,
  WorkOrder,
  Product,
  WorkCenter,
  StockMovement,
} from "../entities/all";
import apiService from "../services/api";
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
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Factory,
  Archive,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Table,
} from "lucide-react";

export default function Reports() {
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [workOrderAnalysis, setWorkOrderAnalysis] = useState([]);
  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState("all");
  const [workCenterFilter, setWorkCenterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moData, woData, woAnalysisData, prodData, wcData, stockData] =
        await Promise.all([
          ManufacturingOrder.list("-created_date", 100),
          WorkOrder.list("-created_date", 100),
          apiService.getWorkOrderAnalysis({ limit: 100 }),
          Product.list("-created_date", 100),
          WorkCenter.list("-created_date", 50),
          StockMovement.list("-created_date", 200),
        ]);
      setManufacturingOrders(moData);
      setWorkOrders(woData);
      setWorkOrderAnalysis(woAnalysisData.workOrders || []);
      setProducts(prodData);
      setWorkCenters(wcData);
      setStockMovements(stockData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalOrders = manufacturingOrders.length;
  const completedOrders = manufacturingOrders.filter(
    (order) => order.status === "DONE"
  ).length;
  const activeOrders = manufacturingOrders.filter(
    (order) => order.status === "in_progress"
  ).length;
  const completionRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const totalWorkOrders = workOrders.length;
  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "DONE"
  ).length;
  const workOrderCompletionRate =
    totalWorkOrders > 0
      ? Math.round((completedWorkOrders / totalWorkOrders) * 100)
      : 0;

  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (product) => product.current_stock <= product.reorder_level
  ).length;
  const outOfStockProducts = products.filter(
    (product) => product.current_stock === 0
  ).length;

  const activeWorkCenters = workCenters.filter(
    (wc) => wc.status === "active"
  ).length;
  const avgUtilization =
    workCenters.length > 0
      ? Math.round(
          workCenters.reduce((sum, wc) => sum + (wc.utilization || 0), 0) /
            workCenters.length
        )
      : 0;

  // Mock data for charts (in real app, this would be calculated from actual data)
  const productionData = [
    { month: "Jan", planned: 120, completed: 110, efficiency: 92 },
    { month: "Feb", planned: 135, completed: 128, efficiency: 95 },
    { month: "Mar", planned: 150, completed: 142, efficiency: 95 },
    { month: "Apr", planned: 140, completed: 138, efficiency: 99 },
    { month: "May", planned: 160, completed: 155, efficiency: 97 },
    { month: "Jun", planned: 170, completed: 165, efficiency: 97 },
  ];

  const topProducts = products.slice(0, 5).map((product) => ({
    name: product.name,
    stock: product.current_stock,
    value: product.current_stock * product.unit_price,
  }));

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive insights into your manufacturing operations
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalOrders}
              </div>
              <p className="text-xs text-gray-500">Manufacturing orders</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completion Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {completionRate}%
              </div>
              <p className="text-xs text-gray-500">Orders completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Work Centers
              </CardTitle>
              <Factory className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {activeWorkCenters}/{workCenters.length}
              </div>
              <p className="text-xs text-gray-500">Active centers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Utilization
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {avgUtilization}%
              </div>
              <p className="text-xs text-gray-500">Work center efficiency</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Production Trend Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                Production Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">Planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Completed</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="space-y-3">
                  {productionData.map((data, index) => (
                    <div key={data.month} className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{data.month}</span>
                        <span>
                          {data.completed}/{data.planned} ({data.efficiency}%)
                        </span>
                      </div>
                      <div className="flex items-end gap-1 h-8">
                        <div
                          className="bg-blue-500 rounded-t flex-1 min-h-[4px]"
                          style={{ height: `${(data.planned / 200) * 100}%` }}
                        ></div>
                        <div
                          className="bg-green-500 rounded-t flex-1 min-h-[4px]"
                          style={{ height: `${(data.completed / 200) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Status */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Archive className="h-5 w-5 text-gray-600" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {totalProducts - lowStockProducts - outOfStockProducts}
                    </div>
                    <div className="text-sm text-gray-600">In Stock</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {lowStockProducts}
                    </div>
                    <div className="text-sm text-gray-600">Low Stock</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {outOfStockProducts}
                    </div>
                    <div className="text-sm text-gray-600">Out of Stock</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalProducts}
                    </div>
                    <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                </div>

                {/* Top Products by Value */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Top Products by Value
                  </h4>
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm bg-gray-50/80 rounded px-3 py-2"
                    >
                      <span className="text-gray-700">{product.name}</span>
                      <span className="font-medium">
                        ${product.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Order Status */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Work Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {workOrders.filter((wo) => wo.status === "TO_DO").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    workOrders.filter((wo) => wo.status === "in_progress")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {completedWorkOrders}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {workOrderCompletionRate}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders Analysis Table */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Table className="h-5 w-5 text-gray-600" />
                Work Orders Analysis
              </CardTitle>

              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search operations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-64"
                  />
                </div>

                <select
                  value={operationFilter}
                  onChange={(e) => setOperationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="all">All Operations</option>
                  <option value="Assembly">Assembly</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Testing">Testing</option>
                </select>

                <select
                  value={workCenterFilter}
                  onChange={(e) => setWorkCenterFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="all">All Work Centers</option>
                  {workCenters.map((wc) => (
                    <option key={wc.id} value={wc.name}>
                      {wc.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="TO_DO">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Operation
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Work Center
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Expected Duration
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Real Duration
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderAnalysis
                    .filter((wo) => {
                      const matchesSearch =
                        wo.operationName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        wo.workCenterName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        wo.productName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase());
                      const matchesOperation =
                        operationFilter === "all" ||
                        wo.operationName === operationFilter;
                      const matchesWorkCenter =
                        workCenterFilter === "all" ||
                        wo.workCenterName === workCenterFilter;
                      const matchesStatus =
                        statusFilter === "all" || wo.status === statusFilter;

                      return (
                        matchesSearch &&
                        matchesOperation &&
                        matchesWorkCenter &&
                        matchesStatus
                      );
                    })
                    .map((wo) => {
                      return (
                        <tr
                          key={wo.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50"
                        >
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {wo.operationName || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {wo.workCenterName || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {wo.productName || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {wo.quantity || 0}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {wo.expectedDuration || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {wo.realDuration || "00:00"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`text-xs ${
                                wo.status === "DONE"
                                  ? "bg-green-100 text-green-800"
                                  : wo.status === "in progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : wo.status === "TO_DO"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {wo.status?.replace("_", " ") || "Unknown"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {workOrderAnalysis.filter((wo) => {
                const matchesSearch =
                  wo.operationName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  wo.workCenterName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  wo.productName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
                const matchesOperation =
                  operationFilter === "all" ||
                  wo.operationName === operationFilter;
                const matchesWorkCenter =
                  workCenterFilter === "all" ||
                  wo.workCenterName === workCenterFilter;
                const matchesStatus =
                  statusFilter === "all" || wo.status === statusFilter;

                return (
                  matchesSearch &&
                  matchesOperation &&
                  matchesWorkCenter &&
                  matchesStatus
                );
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Table className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No work orders found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

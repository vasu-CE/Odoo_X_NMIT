import React, { useState, useEffect } from "react";
import {
  ManufacturingOrder,
  WorkOrder,
  Product,
  WorkCenter,
  StockMovement,
} from "../entities/all";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
} from "lucide-react";

export default function Reports() {
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moData, woData, prodData, wcData, stockData] = await Promise.all([
        ManufacturingOrder.list("-created_date", 100),
        WorkOrder.list("-created_date", 100),
        Product.list("-created_date", 100),
        WorkCenter.list("-created_date", 50),
        StockMovement.list("-created_date", 200),
      ]);
      setManufacturingOrders(moData);
      setWorkOrders(woData);
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
    (order) => order.status === "completed"
  ).length;
  const activeOrders = manufacturingOrders.filter(
    (order) => order.status === "in_progress"
  ).length;
  const completionRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const totalWorkOrders = workOrders.length;
  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "completed"
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
                  {workOrders.filter((wo) => wo.status === "pending").length}
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
      </div>
    </div>
  );
}

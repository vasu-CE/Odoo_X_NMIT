import React, { useState, useEffect } from "react";
import { 
  ManufacturingOrder, 
  WorkOrder, 
  Product, 
  WorkCenter,
  StockMovement 
} from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Zap,
  Factory,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import KPICard from "../components/dashboard/KPICard";
import OrdersOverview from "../components/dashboard/OrdersOverview";
import WorkCenterStatus from "../components/dashboard/WorkCenterStatus";
import StockAlerts from "../components/dashboard/StockAlerts";
import ProductionChart from "../components/dashboard/ProductionChart";

export default function Dashboard() {
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [moData, woData, prodData, wcData, stockData] = await Promise.all([
        ManufacturingOrder.list("-created_date", 50),
        WorkOrder.list("-created_date", 50),
        Product.list("-created_date", 50),
        WorkCenter.list("-created_date", 20),
        StockMovement.list("-created_date", 100)
      ]);

      setManufacturingOrders(moData);
      setWorkOrders(woData);
      setProducts(prodData);
      setWorkCenters(wcData);
      setStockMovements(stockData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalOrders = manufacturingOrders.length;
  const activeOrders = manufacturingOrders.filter(order => 
    order.status === 'in_progress' || order.status === 'planned'
  ).length;
  const completedOrders = manufacturingOrders.filter(order => 
    order.status === 'completed'
  ).length;
  const pendingWorkOrders = workOrders.filter(wo => 
    wo.status === 'pending' || wo.status === 'in_progress'
  ).length;

  // Low stock alerts
  const lowStockProducts = products.filter(product => 
    product.current_stock <= product.reorder_level
  );

  // Work center utilization
  const activeWorkCenters = workCenters.filter(wc => wc.status === 'active').length;
  const avgUtilization = workCenters.length > 0 
    ? workCenters.reduce((sum, wc) => sum + (wc.utilization || 0), 0) / workCenters.length
    : 0;

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturing Dashboard</h1>
            <p className="text-gray-600">Real-time production overview and insights</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("ManufacturingOrders")}>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                <Package className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Orders"
            value={totalOrders}
            icon={Package}
            trend="+12% this month"
            color="blue"
            loading={loading}
          />
          <KPICard
            title="Active Orders"
            value={activeOrders}
            icon={Zap}
            trend={`${activeOrders} in progress`}
            color="green"
            loading={loading}
          />
          <KPICard
            title="Pending Tasks"
            value={pendingWorkOrders}
            icon={Clock}
            trend="3 overdue"
            color="orange"
            loading={loading}
          />
          <KPICard
            title="Work Centers"
            value={`${Math.round(avgUtilization)}%`}
            icon={Factory}
            trend="Avg utilization"
            color="purple"
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Orders Overview */}
          <div className="lg:col-span-2">
            <OrdersOverview 
              orders={manufacturingOrders}
              loading={loading}
            />
          </div>

          {/* Stock Alerts */}
          <div>
            <StockAlerts
              products={lowStockProducts}
              loading={loading}
            />
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Work Center Status */}
          <WorkCenterStatus
            workCenters={workCenters}
            loading={loading}
          />

          {/* Production Chart */}
          <ProductionChart
            orders={manufacturingOrders}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
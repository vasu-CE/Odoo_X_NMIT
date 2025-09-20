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
import WorkOrdersAnalysis from "../components/reports/WorkOrdersAnalysis";
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
  User,
  Settings,
} from "lucide-react";

export default function Reports() {
  const [activeReport, setActiveReport] = useState("work-orders");
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
      setLoading(true);
      const [manufacturingOrdersRes, workOrdersRes, productsRes, workCentersRes, stockMovementsRes] = await Promise.all([
        apiService.getManufacturingOrders(),
        apiService.getWorkOrders(),
        apiService.getProducts(),
        apiService.getWorkCenters(),
        apiService.getStockMovements(),
      ]);

      if (manufacturingOrdersRes.success) {
        setManufacturingOrders(manufacturingOrdersRes.data.manufacturingOrders || []);
      }
      if (workOrdersRes.success) {
        setWorkOrders(workOrdersRes.data.workOrders || []);
      }
      if (productsRes.success) {
        setProducts(productsRes.data.products || []);
      }
      if (workCentersRes.success) {
        setWorkCenters(workCentersRes.data.workCenters || []);
      }
      if (stockMovementsRes.success) {
        setStockMovements(stockMovementsRes.data.stockMovements || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportSections = [
    { id: "work-orders", label: "Work Orders Analysis", icon: Factory },
    { id: "production", label: "Production Reports", icon: BarChart3 },
    { id: "inventory", label: "Inventory Reports", icon: Package },
    { id: "performance", label: "Performance Metrics", icon: TrendingUp },
  ];

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Setup Menu - Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Profile Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeReport === "work-orders" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveReport("work-orders")}
                >
                  <Factory className="w-4 h-4 mr-2" />
                  My Reports
                </Button>
                <Button
                  variant={activeReport === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveReport("profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Right Side */}
          <div className="lg:col-span-3">
            {activeReport === "work-orders" && <WorkOrdersAnalysis />}
            {activeReport === "profile" && (
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings</h3>
                    <p className="text-gray-500 mb-6">
                      Access your profile settings from the navigation menu
                    </p>
                    <Button onClick={() => window.location.href = '/profile'}>
                      Go to Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {activeReport === "production" && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Production Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Production Reports</h3>
                      <p className="text-gray-500">Production analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeReport === "inventory" && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Inventory Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Reports</h3>
                      <p className="text-gray-500">Inventory analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeReport === "performance" && (
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Metrics</h3>
                      <p className="text-gray-500">Performance analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
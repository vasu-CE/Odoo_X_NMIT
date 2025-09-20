import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product, StockMovement } from "../entities/all";
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
  Archive,
  Plus,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowUpDown,
  Eye,
} from "lucide-react";

const movementTypeConfig = {
  in: { color: "bg-green-100 text-green-800", icon: TrendingUp, label: "In" },
  out: { color: "bg-red-100 text-red-800", icon: TrendingDown, label: "Out" },
  transfer: {
    color: "bg-blue-100 text-blue-800",
    icon: ArrowUpDown,
    label: "Transfer",
  },
};

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [stockAggregation, setStockAggregation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("30");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, movementsData, aggregationData] = await Promise.all([
        Product.list("-created_date"),
        StockMovement.list("-created_date"),
        apiService.getStockAggregation({ period: periodFilter })
      ]);
      setProducts(productsData);
      setStockMovements(movementsData);
      setStockAggregation(aggregationData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (productId, adjustment) => {
    try {
      // Mock stock adjustment - in real app, this would call the API
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                current_stock: Math.max(0, product.current_stock + adjustment),
              }
            : product
        )
      );
    } catch (error) {
      console.error("Error adjusting stock:", error);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.current_stock <= product.reorder_level;
    } else if (stockFilter === "out") {
      matchesStock = product.current_stock === 0;
    } else if (stockFilter === "normal") {
      matchesStock = product.current_stock > product.reorder_level;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get recent movements for a product
  const getProductMovements = (productId) => {
    return stockMovements
      .filter((movement) => movement.product_id === productId)
      .slice(0, 3);
  };

  const getStockStatus = (product) => {
    if (product.current_stock === 0)
      return {
        status: "out",
        color: "bg-red-100 text-red-800",
        label: "Out of Stock",
      };
    if (product.current_stock <= product.reorder_level)
      return {
        status: "low",
        color: "bg-yellow-100 text-yellow-800",
        label: "Low Stock",
      };
    return {
      status: "normal",
      color: "bg-green-100 text-green-800",
      label: "In Stock",
    };
  };

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Stock Management
            </h1>
            <p className="text-gray-600">
              Monitor inventory levels and stock movements
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            New Movement
          </Button>
        </div>

            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-6 mb-8 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/50"
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="Widgets">Widgets</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Components">Components</option>
                  </select>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="out">Out of Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="normal">Normal Stock</option>
                  </select>
                  <select
                    value={periodFilter}
                    onChange={(e) => {
                      setPeriodFilter(e.target.value);
                      loadData(); // Reload data when period changes
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Summary */}
            {stockAggregation && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Value
                    </CardTitle>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      ${stockAggregation.summary.totalValue.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500">Inventory value</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Products
                    </CardTitle>
                    <Archive className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stockAggregation.summary.totalProducts}
                    </div>
                    <p className="text-xs text-gray-500">Active products</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Low Stock
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stockAggregation.summary.lowStock}
                    </div>
                    <p className="text-xs text-gray-500">Need reorder</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Out of Stock
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stockAggregation.summary.outOfStock}
                    </div>
                    <p className="text-xs text-gray-500">Zero inventory</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Products Grid */}
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
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const recentMovements = getProductMovements(product.id);
                  
                  // Get enhanced stock data from aggregation
                  const stockData = stockAggregation?.products?.find(
                    p => p.productId === product.id
                  );

              return (
                <Card
                  key={product.id}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Enhanced Stock Information */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">On Hand:</span>
                            <span className="font-medium text-lg">
                              {stockData?.onHand || product.current_stock}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Free to Use:</span>
                            <span className="font-medium text-green-600">
                              {stockData?.freeToUse || Math.max(0, product.current_stock - (product.reorder_level || 0))}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Value:</span>
                            <span className="font-medium text-blue-600">
                              ${stockData?.totalValue?.toLocaleString() || (product.current_stock * product.unit_price).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Unit Cost:</span>
                            <span className="text-gray-500">
                              ${stockData?.avgUnitCost || product.unit_price}
                            </span>
                          </div>
                        </div>

                        {/* Movement Summary */}
                        {stockData && (
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700">Movement Summary ({periodFilter} days):</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Incoming:</span>
                                <span className="text-green-600 font-medium">
                                  +{stockData.incoming}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Outgoing:</span>
                                <span className="text-red-600 font-medium">
                                  -{stockData.outgoing}
                                </span>
                              </div>
                            </div>
                            {stockData.turnover > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Turnover:</span>
                                <span className="text-blue-600 font-medium">
                                  {stockData.turnover.toFixed(2)}x
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                    {/* Category */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>{product.category}</span>
                    </div>

                    {/* Recent Movements */}
                    {recentMovements.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Recent Movements:
                        </p>
                        <div className="space-y-1">
                          {recentMovements.map((movement, index) => {
                            const movementInfo =
                              movementTypeConfig[movement.movement_type] ||
                              movementTypeConfig.in;
                            const MovementIcon = movementInfo.icon;

                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center text-xs bg-gray-50/80 rounded px-2 py-1"
                              >
                                <div className="flex items-center gap-1">
                                  <MovementIcon className="h-3 w-3" />
                                  <span>{movementInfo.label}</span>
                                </div>
                                <span className="font-medium">
                                  {movement.quantity}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Stock Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStockAdjustment(product.id, 10)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +10
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStockAdjustment(product.id, -5)}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrendingDown className="w-4 h-4 mr-1" />
                        -5
                      </Button>
                    </div>

                    {/* Management Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link to={`/stock-management/${product.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link to={`/stock-management/${product.id}`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || categoryFilter !== "all" || stockFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first product to get started"}
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/stock-management/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

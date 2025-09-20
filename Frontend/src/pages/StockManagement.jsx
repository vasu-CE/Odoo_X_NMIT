import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product, StockMovement } from "../entities/all";
import apiService from "../services/api";
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
  List,
  Grid3X3,
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
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailForm, setShowDetailForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use mock data to avoid API rate limiting
      const mockProducts = [
        {
          id: 1,
          name: "Dining Table",
          sku: "DT001",
          unit_price: 1200,
          current_stock: 600,
          reorder_level: 50,
          unit: "Unit",
          category: "Furniture",
        },
        {
          id: 2,
          name: "Drawer",
          sku: "DR001",
          unit_price: 100,
          current_stock: 20,
          reorder_level: 5,
          unit: "Unit",
          category: "Furniture",
        },
        {
          id: 3,
          name: "Wooden Chair",
          sku: "WC001",
          unit_price: 500,
          current_stock: 150,
          reorder_level: 20,
          unit: "Unit",
          category: "Furniture",
        },
        {
          id: 4,
          name: "Steel Rod",
          sku: "SR001",
          unit_price: 25,
          current_stock: 1000,
          reorder_level: 100,
          unit: "Kg",
          category: "Raw Materials",
        },
      ];

      const mockStockAggregation = {
        summary: {
          totalValue: 800000,
          totalProducts: 4,
          lowStock: 1,
          outOfStock: 0,
        },
        products: [
          {
            productId: 1,
            onHand: 600,
            freeToUse: 550,
            totalValue: 720000,
            avgUnitCost: 1200,
            incoming: 0,
            outgoing: 230,
            turnover: 0.38,
          },
          {
            productId: 2,
            onHand: 20,
            freeToUse: 20,
            totalValue: 2000,
            avgUnitCost: 100,
            incoming: 0,
            outgoing: 0,
            turnover: 0,
          },
          {
            productId: 3,
            onHand: 150,
            freeToUse: 130,
            totalValue: 75000,
            avgUnitCost: 500,
            incoming: 50,
            outgoing: 20,
            turnover: 0.13,
          },
          {
            productId: 4,
            onHand: 1000,
            freeToUse: 900,
            totalValue: 25000,
            avgUnitCost: 25,
            incoming: 200,
            outgoing: 100,
            turnover: 0.3,
          },
        ],
      };

      setProducts(mockProducts);
      setStockMovements([]);
      setStockAggregation(mockStockAggregation);
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
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.unit?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
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

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowDetailForm(true);
  };

  const handleBack = () => {
    setShowDetailForm(false);
    setSelectedProduct(null);
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving product:", selectedProduct);
    setShowDetailForm(false);
    setSelectedProduct(null);
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {!showDetailForm ? (
          <>
            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Stock Ledger
                </h1>
                <div className="flex items-center gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    New
                  </Button>
                  <Search className="w-5 h-5 text-gray-500" />
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
              {/* <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-medium">
                Creative Manatee
              </div> */}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Allow user to search based on Product, unit"
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
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          On Hand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Free to Use
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Incoming
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outgoing
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
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </td>
                            </tr>
                          ))
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                          const stockData = stockAggregation?.products?.find(
                            (p) => p.productId === product.id
                          );
                          const onHand =
                            stockData?.onHand || product.current_stock || 0;
                          const unitCost =
                            stockData?.avgUnitCost || product.unit_price || 0;
                          const totalValue = onHand * unitCost;
                          const freeToUse =
                            stockData?.freeToUse ||
                            Math.max(0, onHand - (product.reorder_level || 0));
                          const incoming = stockData?.incoming || 0;
                          const outgoing = stockData?.outgoing || 0;

                          return (
                            <tr
                              key={product.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleProductClick(product)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm font-medium text-gray-900">
                                  <Package className="w-4 h-4 mr-2 text-gray-400" />
                                  {product.name || "Dining Table"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {unitCost} Rs
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.unit || "Unit"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {totalValue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {onHand}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {freeToUse}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {incoming}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {outgoing}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <p className="text-lg font-medium mb-2">
                                No products found
                              </p>
                              <p className="text-sm">
                                {searchTerm
                                  ? "Try adjusting your search criteria"
                                  : "Add your first product to get started"}
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
                {filteredProducts.map((product) => {
                  const stockData = stockAggregation?.products?.find(
                    (p) => p.productId === product.id
                  );
                  const stockStatus = getStockStatus(product);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit Cost:</span>
                          <span>
                            ${stockData?.avgUnitCost || product.unit_price}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">On Hand:</span>
                          <span>
                            {stockData?.onHand || product.current_stock}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Value:</span>
                          <span>
                            $
                            {(
                              (stockData?.onHand || product.current_stock) *
                              (stockData?.avgUnitCost || product.unit_price)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Detail Form */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </Button>
              </div>
              {/* <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-medium">
                Creative Manatee
              </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <Input
                    value={selectedProduct?.name || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost
                  </label>
                  <Input
                    type="number"
                    value={selectedProduct?.unit_price || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        unit_price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={selectedProduct?.unit || "Unit"}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        unit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Kg">Kg</option>
                    <option value="Liters">Liters</option>
                    <option value="Meters">Meters</option>
                    <option value="Pieces">Pieces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Value
                  </label>
                  <Input
                    value={(
                      (selectedProduct?.current_stock || 0) *
                      (selectedProduct?.unit_price || 0)
                    ).toLocaleString()}
                    readOnly
                    className="w-full bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Readonly: on Hand * unit cost
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    On Hand
                  </label>
                  <Input
                    type="number"
                    value={selectedProduct?.current_stock || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        current_stock: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free to Use
                  </label>
                  <Input
                    type="number"
                    value={Math.max(
                      0,
                      (selectedProduct?.current_stock || 0) -
                        (selectedProduct?.reorder_level || 0)
                    )}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        free_to_use: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outgoing
                  </label>
                  <Input
                    type="number"
                    value={selectedProduct?.outgoing || 0}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        outgoing: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incoming
                  </label>
                  <Input
                    type="number"
                    value={selectedProduct?.incoming || 0}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        incoming: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

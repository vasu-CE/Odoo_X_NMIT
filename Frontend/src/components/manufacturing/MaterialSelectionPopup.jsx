import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  Search,
  Package,
  Check,
  X,
  AlertTriangle,
  Hash,
  DollarSign,
} from "lucide-react";
import apiService from "../../services/api";

export default function MaterialSelectionPopup({
  open,
  onOpenChange,
  onSelect,
  currentSelection = null,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/products");
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product) => {
    onSelect(product);
    onOpenChange(false);
  };

  const getProductTypeColor = (type) => {
    const colors = {
      RAW_MATERIAL: "bg-blue-100 text-blue-800",
      WIP: "bg-yellow-100 text-yellow-800",
      FINISHED_GOOD: "bg-green-100 text-green-800",
      CONSUMABLE: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStockStatus = (currentStock, reorderPoint) => {
    if (currentStock <= 0)
      return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (currentStock <= reorderPoint)
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Materials" },
    { value: "RAW_MATERIAL", label: "Raw Materials" },
    { value: "WIP", label: "Work in Progress" },
    { value: "FINISHED_GOOD", label: "Finished Goods" },
    { value: "CONSUMABLE", label: "Consumables" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select Material
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading materials...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">No materials found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.currentStock,
                    product.reorderPoint
                  );
                  const isSelected = currentSelection?.id === product.id;

                  return (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelect(product)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>

                          {/* Type Badge */}
                          <div>
                            <Badge
                              className={getProductTypeColor(product.type)}
                            >
                              {product.type?.replace("_", " ")}
                            </Badge>
                          </div>

                          {/* Stock Info */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Stock:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {product.currentStock} {product.unit}
                                </span>
                                {product.currentStock <=
                                  product.reorderPoint && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Status:
                              </span>
                              <Badge className={stockStatus.color}>
                                {stockStatus.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Price Info */}
                          {(product.salesPrice || product.purchasePrice) && (
                            <div className="space-y-1">
                              {product.salesPrice && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Sales Price:
                                  </span>
                                  <span className="text-sm font-medium">
                                    ${product.salesPrice}
                                  </span>
                                </div>
                              )}
                              {product.purchasePrice && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Purchase Price:
                                  </span>
                                  <span className="text-sm font-medium">
                                    ${product.purchasePrice}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="space-y-1">
                            {product.hsnCode && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  HSN: {product.hsnCode}
                                </span>
                              </div>
                            )}
                            {product.category && (
                              <div className="text-xs text-gray-500">
                                Category: {product.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

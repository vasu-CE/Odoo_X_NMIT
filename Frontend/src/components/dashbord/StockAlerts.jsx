import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, TrendingDown, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StockAlerts({ products, loading }) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Stock Alerts
          </CardTitle>
          <Link to={createPageUrl("StockManagement")}>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Manage
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors duration-200"
            >
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {product.current_stock} {product.unit} left
                </p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200">
                  Low Stock
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  Min: {product.reorder_level}
                </p>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>All stock levels are healthy!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
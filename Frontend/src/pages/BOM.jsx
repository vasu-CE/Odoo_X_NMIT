import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BOM, Product } from "../entities/all";
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
  ClipboardList,
  Plus,
  Search,
  Package,
  Settings,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export default function BOMPage() {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBOM, setSelectedBOM] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bomsData, productsData] = await Promise.all([
        BOM.list("-created_date"),
        Product.list("-created_date"),
      ]);
      setBoms(bomsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBOM = async (bomId) => {
    try {
      // Mock delete - in real app, this would call the API
      setBoms((prev) => prev.filter((bom) => bom.id !== bomId));
    } catch (error) {
      console.error("Error deleting BOM:", error);
    }
  };

  // Filter BOMs
  const filteredBOMs = boms.filter((bom) =>
    bom.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bill of Materials
            </h1>
            <p className="text-gray-600">
              Manage product components and material requirements
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Link to="/bom/new">
              <Plus className="w-4 h-4 mr-2" />
              New BOM
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-6 mb-8 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search BOMs by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/50"
            />
          </div>
        </div>

        {/* BOMs Grid */}
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
            {filteredBOMs.map((bom) => (
              <Card
                key={bom.id}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {bom.product_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Version {bom.version}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {bom.components?.length || 0} components
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Components List */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Components:
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {bom.components?.slice(0, 3).map((component, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm bg-gray-50/80 rounded px-2 py-1"
                        >
                          <span className="text-gray-700">
                            {component.product_name}
                          </span>
                          <span className="text-gray-500">
                            {component.quantity} {component.unit}
                          </span>
                        </div>
                      ))}
                      {bom.components?.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{bom.components.length - 3} more components
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/bom/${bom.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/bom/${bom.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBOM(bom.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBOMs.length === 0 && !loading && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No BOMs found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first bill of materials to get started"}
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/bom/new">
                <Plus className="w-4 h-4 mr-2" />
                Create BOM
              </Link>
            </Button>
          </div>
        )}

        {/* BOM Detail Modal */}
        {selectedBOM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedBOM.product_name} - BOM Details
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBOM(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Product:</span>
                    <p className="text-gray-600">{selectedBOM.product_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Version:</span>
                    <p className="text-gray-600">{selectedBOM.version}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Components:
                  </h3>
                  <div className="space-y-2">
                    {selectedBOM.components?.map((component, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {component.product_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {component.quantity} {component.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

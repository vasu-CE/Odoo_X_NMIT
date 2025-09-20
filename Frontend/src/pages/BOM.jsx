import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BOM, Product } from "../entities/all";
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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  ClipboardList,
  Plus,
  Search,
  Package,
  Settings,
  Edit,
  Trash2,
  Eye,
  List,
  Grid3X3,
  ArrowLeft,
  Save,
  X,
  Factory,
  Clock,
} from "lucide-react";
import AsyncDropdown from "../components/AsyncDropdown";

export default function BOMPage() {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBOM, setEditingBOM] = useState(null);
  const [formData, setFormData] = useState({
    finished_product: "",
    quantity: "1",
    reference: "",
    components: []
  });
  const [activeTab, setActiveTab] = useState("components");
  const [workOrders, setWorkOrders] = useState([]);

  // Static sample data for demonstration
  const sampleBOMs = [
    {
      id: 1,
      finished_product: "Drawer",
      reference: "[8001]",
      quantity: 1,
      status: "active",
      components: [
        { product_name: "Wood Panel", quantity: 2, unit: "pcs" },
        { product_name: "Screws", quantity: 8, unit: "pcs" },
        { product_name: "Drawer Slides", quantity: 1, unit: "set" }
      ]
    },
    {
      id: 2,
      finished_product: "Cabinet Door",
      reference: "[8002]",
      quantity: 1,
      status: "active",
      components: [
        { product_name: "Wood Panel", quantity: 1, unit: "pcs" },
        { product_name: "Hinges", quantity: 2, unit: "pcs" },
        { product_name: "Door Handle", quantity: 1, unit: "pcs" }
      ]
    },
    {
      id: 3,
      finished_product: "Table Top",
      reference: "[8003]",
      quantity: 1,
      status: "draft",
      components: [
        { product_name: "Wood Panel", quantity: 1, unit: "pcs" },
        { product_name: "Edge Banding", quantity: 4, unit: "m" }
      ]
    }
  ];

  const sampleProducts = [
    { id: 1, name: "Drawer", category: "Furniture" },
    { id: 2, name: "Cabinet Door", category: "Furniture" },
    { id: 3, name: "Table Top", category: "Furniture" },
    { id: 4, name: "Wood Panel", category: "Raw Material" },
    { id: 5, name: "Screws", category: "Hardware" },
    { id: 6, name: "Drawer Slides", category: "Hardware" },
    { id: 7, name: "Hinges", category: "Hardware" },
    { id: 8, name: "Door Handle", category: "Hardware" },
    { id: 9, name: "Edge Banding", category: "Raw Material" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const [bomsData, productsData, workCentersData] = await Promise.all([
          BOM.list("-created_date"),
          Product.list("-created_date"),
          apiService.getWorkCenters()
        ]);
        
        if (bomsData && bomsData.length > 0) {
          setBoms(bomsData);
        } else {
          // Fallback to static data if API returns empty
          setBoms(sampleBOMs);
        }
        
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        } else {
          // Fallback to static data if API returns empty
          setProducts(sampleProducts);
        }

        if (workCentersData && workCentersData.success && workCentersData.data.workCenters) {
          setWorkCenters(workCentersData.data.workCenters);
        } else {
          // Fallback to static work centers if API fails
          setWorkCenters([
            { id: 1, name: "Assembly", status: "ACTIVE" },
            { id: 2, name: "Machining", status: "ACTIVE" },
            { id: 3, name: "Packaging", status: "ACTIVE" },
            { id: 4, name: "Quality Control", status: "ACTIVE" }
          ]);
        }
      } catch (apiError) {
        console.warn("API not available, using static data:", apiError);
        // Fallback to static data if API fails
        setBoms(sampleBOMs);
        setProducts(sampleProducts);
        setWorkCenters([
          { id: 1, name: "Assembly", status: "ACTIVE" },
          { id: 2, name: "Machining", status: "ACTIVE" },
          { id: 3, name: "Packaging", status: "ACTIVE" },
          { id: 4, name: "Quality Control", status: "ACTIVE" }
        ]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Final fallback to static data
      setBoms(sampleBOMs);
      setProducts(sampleProducts);
      setWorkCenters([
        { id: 1, name: "Assembly", status: "ACTIVE" },
        { id: 2, name: "Machining", status: "ACTIVE" },
        { id: 3, name: "Packaging", status: "ACTIVE" },
        { id: 4, name: "Quality Control", status: "ACTIVE" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBOM = async (bomId) => {
    try {
      // Try API call first
      const success = await BOM.delete(bomId);
      if (success) {
        setBoms((prev) => prev.filter((bom) => bom.id !== bomId));
      } else {
        // Fallback to local state update if API fails
        setBoms((prev) => prev.filter((bom) => bom.id !== bomId));
      }
    } catch (error) {
      console.error("Error deleting BOM:", error);
      // Fallback to local state update if API fails
      setBoms((prev) => prev.filter((bom) => bom.id !== bomId));
    }
  };

  const handleNewBOM = () => {
    setFormData({
      finished_product: "",
      quantity: "1",
      reference: "",
      components: []
    });
    setShowNewForm(true);
    setShowEditForm(false);
    setEditingBOM(null);
  };

  const handleEditBOM = (bom) => {
    setFormData({
      finished_product: bom.finished_product,
      quantity: bom.quantity.toString(),
      reference: bom.reference,
      components: bom.components || []
    });
    setEditingBOM(bom);
    setShowEditForm(true);
    setShowNewForm(false);
  };

  const handleSaveBOM = async () => {
    try {
      // Map components to use product_id instead of product_name
      const mappedComponents = formData.components.map(comp => {
        // Find the product by name to get its ID
        const product = products.find(p => p.name === comp.product_name);
        return {
          product_id: product ? product.id : null,
          quantity: comp.quantity,
          unit: comp.unit || "PCS"
        };
      }).filter(comp => comp.product_id); // Filter out components without valid product_id

      // Map work orders to use work_center_id instead of work_center
      const mappedWorkOrders = workOrders.map(wo => {
        const workCenter = workCenters.find(wc => wc.name === wo.work_center);
        return {
          operation: wo.operation,
          work_center_id: workCenter ? workCenter.id : null,
          expected_duration: parseFloat(wo.expected_duration) || 0
        };
      }).filter(wo => wo.work_center_id); // Filter out work orders without valid work_center_id

      const bomData = {
        finished_product: formData.finished_product,
        quantity: parseFloat(formData.quantity),
        reference: formData.reference,
        components: mappedComponents,
        workOrders: mappedWorkOrders
      };

      let result;
      if (editingBOM) {
        // Update existing BOM
        result = await BOM.update(editingBOM.id, bomData);
        if (result) {
          setBoms(prev => prev.map(bom => 
            bom.id === editingBOM.id 
              ? { ...bom, ...result }
              : bom
          ));
        } else {
          // Fallback to local state update if API fails
          setBoms(prev => prev.map(bom => 
            bom.id === editingBOM.id 
              ? { ...bom, ...formData, quantity: parseFloat(formData.quantity) }
              : bom
          ));
        }
      } else {
        // Create new BOM
        result = await BOM.create(bomData);
        if (result) {
          setBoms(prev => [result, ...prev]);
        } else {
          // Fallback to local state update if API fails
          const newBOM = {
            id: Date.now(),
            ...formData,
            quantity: parseFloat(formData.quantity),
            status: "draft"
          };
          setBoms(prev => [newBOM, ...prev]);
        }
      }
      
      setShowNewForm(false);
      setShowEditForm(false);
      setEditingBOM(null);
    } catch (error) {
      console.error("Error saving BOM:", error);
      // Fallback to local state update if API fails
      if (editingBOM) {
        setBoms(prev => prev.map(bom => 
          bom.id === editingBOM.id 
            ? { ...bom, ...formData, quantity: parseFloat(formData.quantity) }
            : bom
        ));
      } else {
        const newBOM = {
          id: Date.now(),
          ...formData,
          quantity: parseFloat(formData.quantity),
          status: "draft"
        };
        setBoms(prev => [newBOM, ...prev]);
      }
      setShowNewForm(false);
      setShowEditForm(false);
      setEditingBOM(null);
    }
  };

  const handleAddComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, { product_name: "", quantity: 1, unit: "pcs" }]
    }));
  };

  const handleUpdateComponent = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const handleRemoveComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  const handleAddWorkOrder = () => {
    setWorkOrders(prev => [...prev, {
      id: Date.now(),
      operation: "",
      work_center: "",
      expected_duration: ""
    }]);
  };

  const handleUpdateWorkOrder = (index, field, value) => {
    setWorkOrders(prev => prev.map((wo, i) => 
      i === index ? { ...wo, [field]: value } : wo
    ));
  };

  const handleRemoveWorkOrder = (index) => {
    setWorkOrders(prev => prev.filter((_, i) => i !== index));
  };

  // Filter BOMs
  const filteredBOMs = boms.filter((bom) =>
    bom.finished_product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bills of Materials
            </h1>
            <p className="text-gray-600">
              Manage product components and material requirements
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg overflow-hidden">
          {/* Header with Search */}
          <div className="p-6 border-b border-gray-200/60">
            <div className="flex items-center justify-between mb-4">
              <Button 
                onClick={handleNewBOM}
                className="bg-blue-600 hover:bg-blue-700 text-white/90 shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Bills of Materials</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "outline" : "default"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "outline" : "default"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Large Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Allow user to search work order based on Finished Product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg w-full border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : viewMode === "list" ? (
              /* List View - Table */
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Finished Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBOMs.map((bom) => (
                      <tr key={bom.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{bom.finished_product}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">{bom.reference}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">{bom.quantity} Units</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedBOM(bom)}
                              className="h-9 w-9 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBOM(bom)}
                              className="h-9 w-9 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBOM(bom.id)}
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
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
                            {bom.finished_product}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {bom.reference}
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
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Components:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {bom.components?.slice(0, 3).map((component, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm bg-gray-50/80 rounded px-2 py-1"
                            >
                              <span className="text-gray-700">{component.product_name}</span>
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

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBOM(bom)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBOM(bom)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No BOMs found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Try adjusting your search" : "Create your first bill of materials to get started"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* New BOM Form Modal */}
        {showNewForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Bill of Materials</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSaveBOM}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">BOM-000001</div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="finished_product">Finished product</Label>
                    <Input
                      id="finished_product"
                      value={formData.finished_product}
                      onChange={(e) => setFormData(prev => ({ ...prev, finished_product: e.target.value }))}
                      placeholder="Enter finished product name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Text field for finished product name</p>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <div className="flex">
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        className="rounded-r-none"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                        Units
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                      maxLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">Text Field allow no more than 8 character</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("components")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "components"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      Components
                    </button>
                    <button
                      onClick={() => setActiveTab("workorders")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "workorders"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Factory className="w-4 h-4 inline mr-2" />
                      Work Orders
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "components" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Components</h3>
                      <Button size="sm" onClick={handleAddComponent}>
                        Add a product
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.components.map((component, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-gray-600">To consume</Label>
                              <AsyncDropdown
                                label="products"
                                value={component.product_name ? products.find(p => p.name === component.product_name) : null}
                                onChange={(selected) => handleUpdateComponent(index, "product_name", selected.name)}
                                placeholder="Select Product"
                                defaultOptions={products.slice(0, 5)}
                                fetchOptions={async (search) => {
                                  console.log("Fetching products with search:", search);
                                  
                                  const res = await apiService.getProducts({ search, limit: 10 });
                                  return res || [];
                                }}
                                getOptionLabel={(p) => p.name}
                                getOptionValue={(p) => p.id}
                                menuPortalTarget={document.body}  // render outside
                                styles={{
                                  menuPortal: base => ({ ...base, zIndex: 9999 }) // make sure it's above modal
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-gray-600">Units</Label>
                              <div className="flex">
                                <Input
                                  type="number"
                                  value={component.quantity}
                                  onChange={(e) => handleUpdateComponent(index, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="rounded-r-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="numeric field, float value >0"
                                />
                                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600 flex items-center">
                                  {component.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center pt-6">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveComponent(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {formData.components.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No components added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "workorders" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Work Orders</h3>
                      <Button size="sm" onClick={handleAddWorkOrder}>
                        Add a line
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Operations</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Work Center</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Expected Duration</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700 w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workOrders.map((workOrder, index) => (
                            <tr key={workOrder.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="py-3 px-4">
                                <Input
                                  value={workOrder.operation}
                                  onChange={(e) => handleUpdateWorkOrder(index, 'operation', e.target.value)}
                                  className="w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Operation name"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <AsyncDropdown
                                  label="workCenters"
                                  value={workCenters.find(wc => wc.name === workOrder.work_center) || null}
                                  onChange={(selected) => handleUpdateWorkOrder(index, "work_center", selected.name)}
                                  placeholder="Select Work Center"
                                  defaultOptions={workCenters.slice(0, 5)}
                                  fetchOptions={async (search) => {
                                    const res = await apiService.getWorkCenters({ search, limit: 10 });
                                    return res?.data?.workCenters || [];
                                  }}
                                  getOptionLabel={(wc) => wc.name}
                                  getOptionValue={(wc) => wc.id}
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex">
                                  <Input
                                    type="number"
                                    value={workOrder.expected_duration}
                                    onChange={(e) => handleUpdateWorkOrder(index, 'expected_duration', e.target.value)}
                                    className="rounded-r-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Duration"
                                  />
                                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600 flex items-center">
                                    min
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveWorkOrder(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {workOrders.length === 0 && (
                            <tr>
                              <td colSpan="4" className="py-8 text-center text-gray-500">
                                <Factory className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>No work orders added yet</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  On New Button, Create a template which can be used in manufacturing orders
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit BOM Form Modal */}
        {showEditForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Bill of Materials</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEditForm(false)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSaveBOM}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">MO-000001</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_finished_product">Finished product</Label>
                    <Input
                      id="edit_finished_product"
                      value={formData.finished_product}
                      onChange={(e) => setFormData(prev => ({ ...prev, finished_product: e.target.value }))}
                      placeholder="Enter finished product name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Text field for finished product name</p>
                  </div>
                  <div>
                    <Label htmlFor="edit_quantity">Quantity</Label>
                    <div className="flex">
                      <Input
                        id="edit_quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        className="rounded-r-none"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                        Units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("components")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "components"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      Components
                    </button>
                    <button
                      onClick={() => setActiveTab("workorders")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "workorders"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Factory className="w-4 h-4 inline mr-2" />
                      Work Orders
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "components" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Components</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.components.map((component, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="text-sm text-gray-600">{component.product_name}</div>
                            <div className="text-sm text-gray-600">
                              {component.quantity} {component.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                      {formData.components.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No components available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "workorders" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Work Orders</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Operations</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Work Center</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Expected Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workOrders.length > 0 ? (
                            workOrders.map((workOrder, index) => (
                              <tr key={workOrder.id} className="border-b border-gray-100">
                                <td className="py-2 px-3 text-sm text-gray-600">{workOrder.operation}</td>
                                <td className="py-2 px-3 text-sm text-gray-600">{workOrder.work_center}</td>
                                <td className="py-2 px-3 text-sm text-gray-600">{workOrder.expected_duration} min</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="py-8 text-center text-gray-500">
                                <Factory className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>No work orders available</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  All fields of bom should be populate on manufacturing order, if bom is selected on manufacturing order
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOM Detail Modal */}
        {selectedBOM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedBOM.finished_product} - BOM Details
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
                    <p className="text-gray-600">{selectedBOM.finished_product}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reference:</span>
                    <p className="text-gray-600">{selectedBOM.reference}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Components:</h3>
                  <div className="space-y-2">
                    {selectedBOM.components?.map((component, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{component.product_name}</p>
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

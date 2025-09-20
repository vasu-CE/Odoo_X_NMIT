import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { 
  Package, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Hash,
  AlertCircle,
  X
} from "lucide-react";

export default function CreateOrderDialog({ open, onOpenChange, onSubmit, products, boms }) {
  const [formData, setFormData] = useState({
    product_name: "",
    quantity: 1,
    priority: "medium",
    scheduled_start: "",
    scheduled_end: "",
    assignee_name: "",
    notes: "",
    required_materials: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedBom, setSelectedBom] = useState(null);

  const handleProductSelect = (productName) => {
    const product = products.find(p => p.name === productName);
    const productBom = boms.find(bom => bom.product_name === productName);
    
    setFormData(prev => ({
      ...prev,
      product_name: productName,
      required_materials: productBom?.components || []
    }));
    
    setSelectedBom(productBom);
  };

  const handleQuantityChange = (quantity) => {
    if (!selectedBom) return;
    
    const scaledMaterials = selectedBom.components?.map(component => ({
      ...component,
      required_qty: component.quantity * quantity,
      consumed_qty: 0
    })) || [];
    
    setFormData(prev => ({
      ...prev,
      quantity: quantity,
      required_materials: scaledMaterials
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        ...formData,
        order_number: `MO-${Date.now()}`,
        status: "planned",
        total_cost: calculateTotalCost()
      };
      
      await onSubmit(orderData);
      resetForm();
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    if (!selectedBom) return 0;
    
    const materialCost = formData.required_materials.reduce((sum, material) => {
      const product = products.find(p => p.name === material.product_name);
      return sum + (material.required_qty * (product?.purchase_price || 0));
    }, 0);
    
    const laborCost = selectedBom.operations?.reduce((sum, operation) => {
      return sum + ((operation.estimated_time || 0) / 60 * (operation.hourly_rate || 0));
    }, 0) || 0;
    
    return materialCost + laborCost;
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      quantity: 1,
      priority: "medium",
      scheduled_start: "",
      scheduled_end: "",
      assignee_name: "",
      notes: "",
      required_materials: []
    });
    setSelectedBom(null);
  };

  const finishedProducts = products.filter(p => p.type === 'finished_goods');
  const hasBom = selectedBom && selectedBom.components?.length > 0;

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-700 border-gray-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      urgent: "bg-red-100 text-red-700 border-red-200"
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <Clock className="w-3 h-3" />,
      medium: <AlertCircle className="w-3 h-3" />,
      high: <AlertTriangle className="w-3 h-3" />,
      urgent: <X className="w-3 h-3" />
    };
    return icons[priority] || icons.medium;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
        <DialogHeader className="pb-4 border-b border-gray-200/60">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-gray-900">Create Manufacturing Order</span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                Set up a new production order with materials and scheduling
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="product" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Product to Manufacture
              </Label>
              <Select value={formData.product_name} onValueChange={handleProductSelect}>
                <SelectTrigger className="h-11 bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <SelectValue placeholder="Select product to manufacture" />
                </SelectTrigger>
                <SelectContent>
                  {finishedProducts.map(product => (
                    <SelectItem key={product.id} value={product.name} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {product.sku || `SKU-${product.id}`}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-500" />
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
                className="h-11 bg-white/80 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {/* Priority and Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Priority Level
              </Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="h-11 bg-white/80 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="py-3">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon("low")}
                      <span className="font-medium">Low Priority</span>
                      <Badge className={`ml-auto text-xs ${getPriorityColor("low")}`}>
                        Normal
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="py-3">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon("medium")}
                      <span className="font-medium">Medium Priority</span>
                      <Badge className={`ml-auto text-xs ${getPriorityColor("medium")}`}>
                        Standard
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="high" className="py-3">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon("high")}
                      <span className="font-medium">High Priority</span>
                      <Badge className={`ml-auto text-xs ${getPriorityColor("high")}`}>
                        Important
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent" className="py-3">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon("urgent")}
                      <span className="font-medium">Urgent</span>
                      <Badge className={`ml-auto text-xs ${getPriorityColor("urgent")}`}>
                        Critical
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="scheduled_start" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Start Date & Time
              </Label>
              <Input
                id="scheduled_start"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                className="h-11 bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="assignee_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Assignee
              </Label>
              <Input
                id="assignee_name"
                value={formData.assignee_name}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee_name: e.target.value }))}
                placeholder="Assign to operator"
                className="h-11 bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* BoM Information */}
          {hasBom ? (
            <Card className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-green-800 text-lg">Bill of Materials Found</span>
                    <p className="text-sm text-green-600">Materials and operations automatically calculated</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      Required Materials ({formData.required_materials.length} items)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.required_materials.slice(0, 4).map((material, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-white/80 rounded-lg px-4 py-3 border border-green-100">
                          <span className="font-medium text-gray-700">{material.product_name}</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {material.required_qty} {material.unit}
                          </Badge>
                        </div>
                      ))}
                      {formData.required_materials.length > 4 && (
                        <div className="col-span-2 bg-white/60 rounded-lg px-4 py-3 border border-green-100">
                          <p className="text-sm text-gray-600 text-center">
                            +{formData.required_materials.length - 4} more materials
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedBom.operations && selectedBom.operations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        Operations ({selectedBom.operations.length} steps)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBom.operations.map((operation, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                            {operation.name} ({operation.estimated_time}min)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white/80 rounded-lg px-4 py-3 border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Estimated Total Cost
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        ${calculateTotalCost().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : formData.product_name && (
            <Card className="bg-gradient-to-r from-yellow-50/80 to-amber-50/80 border-yellow-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-yellow-800">No Bill of Materials Found</span>
                    <p className="text-sm text-yellow-600 mt-1">
                      You may need to create a BOM for this product first to automatically calculate materials and costs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special instructions, quality requirements, or notes for this manufacturing order..."
              rows={4}
              className="bg-white/80 border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200/60">
            <div className="text-sm text-gray-500">
              {formData.product_name && formData.quantity > 0 ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Ready to create order for {formData.quantity}x {formData.product_name}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Please select a product and quantity
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                className="px-6 h-11 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.product_name || !formData.quantity}
                className="px-8 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Order...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Create Order
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
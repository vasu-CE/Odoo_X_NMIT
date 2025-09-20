import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Calendar, User, AlertTriangle, CheckCircle } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Create Manufacturing Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product to Manufacture</Label>
              <Select value={formData.product_name} onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {finishedProducts.map(product => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Priority and Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_start">Start Date</Label>
              <Input
                id="scheduled_start"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_start: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee_name">Assignee</Label>
              <Input
                id="assignee_name"
                value={formData.assignee_name}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee_name: e.target.value }))}
                placeholder="Assign to operator"
              />
            </div>
          </div>

          {/* BoM Information */}
          {hasBom ? (
            <Card className="bg-green-50/50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Bill of Materials Found</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Materials:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.required_materials.slice(0, 4).map((material, index) => (
                        <div key={index} className="flex justify-between text-sm bg-white/60 rounded px-3 py-2">
                          <span>{material.product_name}</span>
                          <Badge variant="outline">{material.required_qty} {material.unit}</Badge>
                        </div>
                      ))}
                      {formData.required_materials.length > 4 && (
                        <p className="text-sm text-gray-600 col-span-2">
                          +{formData.required_materials.length - 4} more materials
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {selectedBom.operations && selectedBom.operations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Operations:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedBom.operations.map((operation, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {operation.name} ({operation.estimated_time}min)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Estimated Cost: <span className="text-green-700">${calculateTotalCost().toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : formData.product_name && (
            <Card className="bg-yellow-50/50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    No Bill of Materials found for this product. You may need to create one first.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special instructions or notes..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.product_name || !formData.quantity}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
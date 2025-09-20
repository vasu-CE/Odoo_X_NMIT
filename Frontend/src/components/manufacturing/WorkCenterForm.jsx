import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Save, X, Factory, DollarSign, Users, Settings } from "lucide-react";

export default function WorkCenterForm({ 
  workCenter = null, 
  onSave, 
  onCancel, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    name: workCenter?.name || "",
    description: workCenter?.description || "",
    hourlyRate: workCenter?.hourlyRate?.toString() || "",
    capacity: workCenter?.capacity?.toString() || "1",
    status: workCenter?.status || "ACTIVE"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "MAINTENANCE", label: "Maintenance", color: "bg-yellow-100 text-yellow-800" },
    { value: "INACTIVE", label: "Inactive", color: "bg-red-100 text-red-800" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) < 0) {
      newErrors.hourlyRate = "Hourly rate must be non-negative";
    }

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        hourlyRate: parseFloat(formData.hourlyRate),
        capacity: parseInt(formData.capacity),
        status: formData.status
      };

      await onSave(submitData);
    } catch (error) {
      console.error("Error saving work center:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            {isEditing ? "Edit Work Center" : "Add New Work Center"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter work center name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter work center description (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Capacity and Rates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Capacity & Rates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-sm font-medium">
                  Capacity *
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    placeholder="1"
                    className={`pl-10 ${errors.capacity ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.capacity && (
                  <p className="text-sm text-red-600">{errors.capacity}</p>
                )}
                <p className="text-xs text-gray-500">Number of workers this center can handle</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-sm font-medium">
                  Hourly Rate *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    placeholder="0.00"
                    className={`pl-10 ${errors.hourlyRate ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.hourlyRate && (
                  <p className="text-sm text-red-600">{errors.hourlyRate}</p>
                )}
                <p className="text-xs text-gray-500">Cost per hour for this work center</p>
              </div>
            </div>
          </div>

          {/* Status Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status Preview</Label>
            <div className="flex items-center gap-2">
              <Badge className={statusOptions.find(s => s.value === formData.status)?.color}>
                {statusOptions.find(s => s.value === formData.status)?.label}
              </Badge>
              <span className="text-sm text-gray-600">
                {formData.status === "ACTIVE" && "Ready for production"}
                {formData.status === "MAINTENANCE" && "Under maintenance"}
                {formData.status === "INACTIVE" && "Not available for use"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Update Work Center" : "Create Work Center"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

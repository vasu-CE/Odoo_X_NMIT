import React, { useState, useEffect } from "react";
import { ManufacturingOrder, Product, BOM } from "../entities/all";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  ArrowLeft,
  Check,
  AlertCircle,
  Hash,
} from "lucide-react";

import OrderCard from "../components/manufacturing/OrderCard";
import CreateOrderDialog from "../components/manufacturing/CreateOrderDialog";
import FilterBar from "../components/manufacturing/FilterBar";

const statusTabs = [
  { id: "draft", label: "Draft", color: "bg-gray-900 text-white" },
  { id: "confirmed", label: "Confirmed", color: "bg-gray-100 text-gray-800" },
  { id: "in_progress", label: "In-Progress", color: "bg-gray-100 text-gray-800" },
  { id: "to_close", label: "To Close", color: "bg-gray-100 text-gray-800" },
  { id: "done", label: "Done", color: "bg-gray-100 text-gray-800" },
];

export default function ManufacturingOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState("draft");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  
  // Form data for creating new order
  const [formData, setFormData] = useState({
    order_number: "",
    finished_product: "",
    quantity: 1,
    bom: "",
    schedule_date: "",
    assignee: "",
    components: [],
    work_orders: []
  });

  useEffect(() => {
    loadData();
    generateOrderNumber();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData, bomsData] = await Promise.all([
        ManufacturingOrder.list("-created_date"),
        Product.list("-created_date"),
        BOM.list("-created_date"),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setBoms(bomsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const orderCount = orders.length + 1;
    const paddedNumber = orderCount.toString().padStart(6, '0');
    setFormData(prev => ({ ...prev, order_number: `MO-${paddedNumber}` }));
  };

  const handleBomSelect = (bomId) => {
    const selectedBom = boms.find(bom => bom.id === bomId);
    if (selectedBom) {
      setFormData(prev => ({
        ...prev,
        bom: bomId,
        finished_product: selectedBom.product_name,
        quantity: selectedBom.quantity || 1,
        components: selectedBom.components || [],
        work_orders: selectedBom.operations || []
      }));
    }
  };

  const handleCreateOrder = async () => {
    // Basic validation
    if (!formData.finished_product) {
      alert("Please select a finished product");
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      alert("Please enter a valid quantity");
      return;
    }
    if (!formData.schedule_date) {
      alert("Please select a schedule date");
      return;
    }

    try {
      const orderData = {
        ...formData,
        status: "planned",
        created_date: new Date().toISOString()
      };
      
      await ManufacturingOrder.create(orderData);
      loadData();
      generateOrderNumber();
      resetForm();
      alert("Manufacturing order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      order_number: "",
      finished_product: "",
      quantity: 1,
      bom: "",
      schedule_date: "",
      assignee: "",
      components: [],
      work_orders: []
    });
    generateOrderNumber();
  };

  const finishedProducts = products.filter(p => p.type === 'finished_goods');

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || order.assignee_name === assigneeFilter;
    const matchesStatus = order.status === activeStatusTab;
    
    return matchesSearch && matchesPriority && matchesAssignee && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                generateOrderNumber();
                resetForm();
              }}
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm
            </Button>
          </div>
          
          {/* Status Tabs */}
          <div className="flex gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeStatusTab === tab.id
                    ? tab.color
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Input Fields Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* MO Number */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    MO-000001
                  </Label>
                  <div className="p-4 border-2 border-dashed border-red-300 rounded-md bg-red-50">
                    <span className="text-xl font-mono text-red-600 font-bold">
                      {formData.order_number}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Always auto generate, when clicked on new and number should follow the sequence
                  </p>
                </div>

                {/* Finished Product */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Finished product *
                  </Label>
                  <Select 
                    value={formData.finished_product} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, finished_product: value }))}
                  >
                    <SelectTrigger className="h-10">
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
                  <p className="text-xs text-gray-500 mt-1">
                    Drop Down, many2one field, selection should be from product master
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantity *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="h-10"
                    />
                    <span className="text-sm text-gray-500">Units</span>
                  </div>
                </div>

                {/* Bill of Material */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Bill of Material
                  </Label>
                  <Select 
                    value={formData.bom} 
                    onValueChange={handleBomSelect}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select BOM" />
                    </SelectTrigger>
                    <SelectContent>
                      {boms.map(bom => (
                        <SelectItem key={bom.id} value={bom.id}>
                          {bom.name || `BOM-${bom.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Non Mandatory field Drop Down, many2one field, selection should be from bills of materials master, 
                    if bill of material is selected first, it should auto populate the finished product, quantity, 
                    components and work orders based on bill of material selected
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Schedule Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Schedule Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.schedule_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule_date: e.target.value }))}
                    className="h-10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Open calendar to allow user to select date
                  </p>
                </div>

                {/* Assignee */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Assignee
                  </Label>
                  <Select 
                    value={formData.assignee} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">John Doe</SelectItem>
                      <SelectItem value="user2">Jane Smith</SelectItem>
                      <SelectItem value="user3">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Drop down of user for selection, many2one field
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t-2 border-red-200"></div>
          
          {/* Tabular Sections */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Components Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Components
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 grid grid-cols-4 gap-4 p-3 text-sm font-medium text-gray-700 border-b">
                    <div>Components</div>
                    <div>Availability</div>
                    <div>To Consume</div>
                    <div>Units</div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {formData.components.length > 0 ? (
                      formData.components.map((component, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 p-3 text-sm">
                          <div className="text-gray-900">{component.product_name}</div>
                          <div className="text-gray-600">{component.available_qty || 0}</div>
                          <div className="text-gray-600">{component.required_qty || 0}</div>
                          <div className="text-gray-600">{component.unit || 'pcs'}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Add a product
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Orders Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Work Orders
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 text-sm font-medium text-gray-700 border-b">
                    Operations
                  </div>
                  <div className="divide-y divide-gray-200">
                    {formData.work_orders.length > 0 ? (
                      formData.work_orders.map((workOrder, index) => (
                        <div key={index} className="p-3 text-sm">
                          <div className="text-gray-900">{workOrder.name}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            Estimated time: {workOrder.estimated_time}min
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No work orders
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

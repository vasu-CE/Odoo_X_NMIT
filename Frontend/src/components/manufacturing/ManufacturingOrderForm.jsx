import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  Clock,
  Package,
  Settings,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { ManufacturingOrder, Product, BOM, WorkOrder } from "../../entities/all";
import { toast } from "sonner";

const statusConfig = {
  DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
  CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", label: "In-Progress" },
  TO_CLOSE: { color: "bg-purple-100 text-purple-800", label: "To Close" },
  DONE: { color: "bg-green-100 text-green-800", label: "Done" },
  CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

const workOrderStatusConfig = {
  TODO: { color: "bg-gray-100 text-gray-800", label: "To Do" },
  IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", label: "In-Progress" },
  DONE: { color: "bg-green-100 text-green-800", label: "Done" },
  CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

export default function ManufacturingOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";

  const [order, setOrder] = useState({
    id: "",
    order_number: "",
    product_id: "",
    product_name: "",
    quantity: 1,
    bom_id: "",
    bom_name: "",
    scheduled_start: "",
    assigned_to_id: "",
    assigned_to_name: "",
    status: "DRAFT",
    priority: "MEDIUM",
    notes: "",
    components: [],
    work_orders: [],
  });

  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("components");
  const [timers, setTimers] = useState({});

  useEffect(() => {
    if (isNew) {
      generateOrderNumber();
    } else {
      loadOrder();
    }
    loadReferenceData();
  }, [id]);

  const generateOrderNumber = () => {
    // For new orders, we'll let the backend generate the sequential order number
    // when the order is created. For now, show a placeholder.
    setOrder(prev => ({
      ...prev,
      order_number: "MO-XXXXXX", // Placeholder until backend generates the real number
    }));
  };

  const loadOrder = async () => {
    if (isNew) return;
    
    try {
      setLoading(true);
      const orderData = await ManufacturingOrder.get(id);
      // Map backend response to frontend format
      const mappedOrder = {
        id: orderData.id,
        order_number: orderData.orderNumber,
        product_id: orderData.productId,
        product_name: orderData.product?.name || "",
        quantity: orderData.quantity,
        bom_id: orderData.bomId,
        bom_name: orderData.bom?.name || "",
        scheduled_start: orderData.scheduledDate,
        assigned_to_id: orderData.assignedToId,
        assigned_to_name: orderData.assignedTo?.name || "",
        status: orderData.status,
        priority: orderData.priority,
        notes: orderData.notes,
        components: orderData.requiredMaterials || [],
        work_orders: orderData.workOrders || [],
      };
      setOrder(mappedOrder);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load manufacturing order");
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [productsData, bomsData, usersData] = await Promise.all([
        Product.list(),
        BOM.list(),
        // Mock users for now - replace with actual API call
        Promise.resolve([
          { id: "1", name: "John Doe" },
          { id: "2", name: "Jane Smith" },
          { id: "3", name: "Mike Johnson" },
        ])
      ]);
      setProducts(productsData);
      setBoms(bomsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading reference data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setOrder(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBOMChange = async (bomId) => {
    if (!bomId) {
      setOrder(prev => ({
        ...prev,
        bom_id: "",
        bom_name: "",
        components: [],
        work_orders: [],
      }));
      return;
    }

    try {
      const bom = await BOM.get(bomId);
      setOrder(prev => ({
        ...prev,
        bom_id: bomId,
        bom_name: bom.name,
        components: bom.components || [],
        work_orders: bom.operations?.map(op => ({
          id: `wo_${Date.now()}_${Math.random()}`,
          operation_name: op.operation_name,
          work_center_id: op.work_center_id,
          work_center_name: op.work_center_name,
          expected_duration: op.expected_duration,
          real_duration: "00:00",
          status: "TODO",
          start_time: null,
          end_time: null,
        })) || [],
      }));
    } catch (error) {
      console.error("Error loading BOM:", error);
      toast.error("Failed to load Bill of Materials");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      if (isNew) {
        // Create new order - map frontend fields to backend fields
        const orderData = {
          productId: order.product_id,
          quantity: order.quantity,
          priority: order.priority,
          scheduledDate: order.scheduled_start,
          assignedToId: order.assigned_to_id,
          bomId: order.bom_id,
          notes: order.notes,
          status: newStatus,
        };
        const createdOrder = await ManufacturingOrder.create(orderData);
        // Map backend response to frontend format
        const mappedOrder = {
          id: createdOrder.id,
          order_number: createdOrder.orderNumber,
          product_id: createdOrder.productId,
          product_name: createdOrder.product?.name || "",
          quantity: createdOrder.quantity,
          bom_id: createdOrder.bomId,
          bom_name: createdOrder.bom?.name || "",
          scheduled_start: createdOrder.scheduledDate,
          assigned_to_id: createdOrder.assignedToId,
          assigned_to_name: createdOrder.assignedTo?.name || "",
          status: createdOrder.status,
          priority: createdOrder.priority,
          notes: createdOrder.notes,
          components: createdOrder.requiredMaterials || [],
          work_orders: createdOrder.workOrders || [],
        };
        setOrder(mappedOrder);
        toast.success("Manufacturing order created successfully!");
        navigate(`/manufacturing-orders/${createdOrder.id}`);
      } else {
        // Update existing order
        await ManufacturingOrder.update(order.id, { status: newStatus });
        setOrder(prev => ({ ...prev, status: newStatus }));
        toast.success(`Order status changed to ${statusConfig[newStatus]?.label}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkOrderAction = (workOrderId, action) => {
    const workOrder = order.work_orders.find(wo => wo.id === workOrderId);
    if (!workOrder) return;

    const now = new Date();
    let newStatus = workOrder.status;
    let newRealDuration = workOrder.real_duration;

    switch (action) {
      case "start":
        newStatus = "IN_PROGRESS";
        setTimers(prev => ({
          ...prev,
          [workOrderId]: {
            startTime: now,
            interval: setInterval(() => {
              updateWorkOrderDuration(workOrderId, now);
            }, 1000),
          },
        }));
        break;
      case "pause":
        if (timers[workOrderId]) {
          clearInterval(timers[workOrderId].interval);
          setTimers(prev => {
            const { [workOrderId]: removed, ...rest } = prev;
            return rest;
          });
        }
        break;
      case "done":
        newStatus = "DONE";
        if (timers[workOrderId]) {
          clearInterval(timers[workOrderId].interval);
          setTimers(prev => {
            const { [workOrderId]: removed, ...rest } = prev;
            return rest;
          });
        }
        break;
    }

    setOrder(prev => ({
      ...prev,
      work_orders: prev.work_orders.map(wo =>
        wo.id === workOrderId
          ? {
              ...wo,
              status: newStatus,
              real_duration: newRealDuration,
              start_time: action === "start" ? now : wo.start_time,
              end_time: action === "done" ? now : wo.end_time,
            }
          : wo
      ),
    }));
  };

  const updateWorkOrderDuration = (workOrderId, startTime) => {
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    const duration = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    setOrder(prev => ({
      ...prev,
      work_orders: prev.work_orders.map(wo =>
        wo.id === workOrderId ? { ...wo, real_duration: duration } : wo
      ),
    }));
  };

  const canConfirm = () => {
    return order?.product_id && order?.quantity > 0 && order?.scheduled_start;
  };

  const canStart = () => {
    return order?.status === "CONFIRMED";
  };

  const canProduce = () => {
    return order?.status === "TO_CLOSE" && order?.work_orders?.every(wo => wo.status === "DONE");
  };

  const getStatusProgress = () => {
    if (!order) return 0;
    const statuses = ["DRAFT", "CONFIRMED", "IN_PROGRESS", "TO_CLOSE", "DONE"];
    const currentIndex = statuses.indexOf(order.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const isReadOnly = order?.status === "CANCELLED";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manufacturing order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Manufacturing order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manufacturing Order
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <div className="flex gap-2">
                {order.status === "DRAFT" && (
                  <Button
                    onClick={() => handleStatusChange("CONFIRMED")}
                    disabled={!canConfirm()}
                    className={`bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-200 ${
                      !canConfirm() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                )}
                {order.status === "CONFIRMED" && (
                  <Button
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer transition-colors duration-200"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
                {order.status === "TO_CLOSE" && canProduce() && (
                  <Button
                    onClick={() => handleStatusChange("DONE")}
                    className="bg-purple-600 hover:bg-purple-700 cursor-pointer transition-colors duration-200"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Produce
                  </Button>
                )}
                {order.status !== "DONE" && order.status !== "CANCELLED" && (
                  <Button
                    onClick={() => handleStatusChange("CANCELLED")}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors duration-200"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-4">
          <div className="flex gap-1">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={order.status === status ? "default" : "outline"}
                size="sm"
                className={`cursor-pointer transition-all duration-200 ${
                  order.status === status 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isReadOnly && handleStatusChange(status)}
                disabled={isReadOnly}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Manufacturing Order Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Manufacturing Order Number
                  </Label>
                  <div className="mt-1 p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                    <span className="font-mono text-lg text-gray-600">
                      {isNew ? "MO-XXXXXX" : order.order_number}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Always auto generate, when clicked on new and number should follow the sequence.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Finished product *
                  </Label>
                  <select
                    value={order.product_id}
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      handleInputChange("product_id", e.target.value);
                      handleInputChange("product_name", product?.name || "");
                    }}
                    disabled={isReadOnly}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                      !order.product_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isReadOnly ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Drop Down, many2one field, selection should be from product master.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Quantity*
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="1"
                      value={order.quantity}
                      onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                      disabled={isReadOnly}
                      className={`flex-1 cursor-text ${
                        order.quantity <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } ${isReadOnly ? 'cursor-not-allowed bg-gray-100' : ''}`}
                      required
                    />
                    <span className="text-sm text-gray-500">Units</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Bill of Material
                  </Label>
                  <select
                    value={order.bom_id}
                    onChange={(e) => handleBOMChange(e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isReadOnly ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'
                    }`}
                  >
                    <option value="">Select a BOM</option>
                    {boms.map(bom => (
                      <option key={bom.id} value={bom.id}>
                        {bom.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Non Mandatory field Drop Down, many2one field, selection should be from bills of materials master, if bill of material is selected first, it should auto populate the finished product, quantity, components and work orders based on bill of material selected.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Schedule Date*
                  </Label>
                  <Input
                    type="date"
                    value={order.scheduled_start}
                    onChange={(e) => handleInputChange("scheduled_start", e.target.value)}
                    disabled={isReadOnly}
                    className={`mt-1 cursor-pointer ${
                      !order.scheduled_start ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isReadOnly ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Open calendar to allow user to select date.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Assignee
                  </Label>
                  <select
                    value={order.assigned_to_id}
                    onChange={(e) => {
                      const user = users.find(u => u.id === e.target.value);
                      handleInputChange("assigned_to_id", e.target.value);
                      handleInputChange("assigned_to_name", user?.name || "");
                    }}
                    disabled={isReadOnly}
                    className={`w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isReadOnly ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'
                    }`}
                  >
                    <option value="">Select an assignee</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Drop down of user for selection, many2one field.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Components and Work Orders Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Components Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Components</h3>
                {!isReadOnly && (
                  <Button size="sm" variant="outline" className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a product
                  </Button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Components</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Availability</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">To Consume</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.components.map((component, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm">{component.product_name}</td>
                        <td className="py-2">
                          <Badge
                            variant={component.available ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {component.available ? "Available" : "Not Available"}
                          </Badge>
                        </td>
                        <td className="py-2 text-sm">{component.quantity}</td>
                        <td className="py-2 text-sm">{component.unit}</td>
                      </tr>
                    ))}
                    {order.components.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                          No components added. Select a Bill of Material or add manually.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Work Orders Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Work Orders</h3>
                {!isReadOnly && (
                  <Button size="sm" variant="outline" className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a line
                  </Button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Operations</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Work Center</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Duration</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.work_orders.map((workOrder) => (
                      <tr key={workOrder.id} className="border-b">
                        <td className="py-2 text-sm">{workOrder.operation_name}</td>
                        <td className="py-2 text-sm">{workOrder.work_center_name}</td>
                        <td className="py-2 text-sm">{workOrder.expected_duration}</td>
                        <td className="py-2">
                          <Badge className={`text-xs ${workOrderStatusConfig[workOrder.status]?.color}`}>
                            {workOrderStatusConfig[workOrder.status]?.label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {order.work_orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                          No work orders added. Select a Bill of Material or add manually.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

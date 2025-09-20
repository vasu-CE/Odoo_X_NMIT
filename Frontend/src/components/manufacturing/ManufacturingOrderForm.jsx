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
    const timestamp = Date.now().toString().slice(-6);
    setOrder(prev => ({
      ...prev,
      order_number: `MO-${timestamp}`,
    }));
  };

  const loadOrder = async () => {
    if (isNew) return;
    
    try {
      setLoading(true);
      const orderData = await ManufacturingOrder.get(id);
      setOrder(orderData);
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
        // Create new order
        const orderData = {
          ...order,
          status: newStatus,
        };
        const createdOrder = await ManufacturingOrder.create(orderData);
        setOrder(createdOrder);
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
              onClick={() => navigate("/manufacturing-orders")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manufacturing Order
              </h1>
              <p className="text-gray-600">
                {isNew ? "Create new manufacturing order" : `Order ${order.order_number}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={statusConfig[order.status]?.color}>
              {statusConfig[order.status]?.label}
            </Badge>
            {!isReadOnly && (
              <div className="flex gap-2">
                {order.status === "DRAFT" && (
                  <>
                    <Button
                      onClick={() => handleStatusChange("DRAFT")}
                      variant="outline"
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={() => handleStatusChange("CONFIRMED")}
                      disabled={!canConfirm()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                  </>
                )}
                {order.status === "CONFIRMED" && (
                  <Button
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
                {order.status === "TO_CLOSE" && canProduce() && (
                  <Button
                    onClick={() => handleStatusChange("DONE")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Produce
                  </Button>
                )}
                {order.status !== "DONE" && order.status !== "CANCELLED" && (
                  <Button
                    onClick={() => handleStatusChange("CANCELLED")}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Status Progress</span>
            <span className="font-medium">{Math.round(getStatusProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStatusProgress()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Draft</span>
            <span>Confirmed</span>
            <span>In-Progress</span>
            <span>To Close</span>
            <span>Done</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Order Number *
                  </Label>
                  <Input
                    value={order.order_number}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated, cannot be changed
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Finished Product *
                  </Label>
                  <select
                    value={order.product_id}
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      handleInputChange("product_id", e.target.value);
                      handleInputChange("product_name", product?.name || "");
                    }}
                    disabled={isReadOnly}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Quantity *
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="1"
                      value={order.quantity}
                      onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                      disabled={isReadOnly}
                      className="flex-1"
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
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a BOM</option>
                    {boms.map(bom => (
                      <option key={bom.id} value={bom.id}>
                        {bom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Schedule Date
                  </Label>
                  <Input
                    type="date"
                    value={order.scheduled_start}
                    onChange={(e) => handleInputChange("scheduled_start", e.target.value)}
                    disabled={isReadOnly}
                    className="mt-1"
                  />
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
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an assignee</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <textarea
                  value={order.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Components and Work Orders Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="work_orders">Work Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="components">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Components</CardTitle>
                    {!isReadOnly && (
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add a product
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Components</th>
                          <th className="text-left py-2">Availability</th>
                          <th className="text-left py-2">To Consume</th>
                          <th className="text-left py-2">Units</th>
                          {order.status !== "DRAFT" && (
                            <>
                              <th className="text-left py-2">Consumed</th>
                              <th className="text-left py-2">Units</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {order.components.map((component, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{component.product_name}</td>
                            <td className="py-2">
                              <Badge
                                variant={component.available ? "default" : "destructive"}
                              >
                                {component.available ? "Available" : "Not Available"}
                              </Badge>
                            </td>
                            <td className="py-2">{component.quantity}</td>
                            <td className="py-2">{component.unit}</td>
                            {order.status !== "DRAFT" && (
                              <>
                                <td className="py-2">{component.consumed || 0}</td>
                                <td className="py-2">{component.unit}</td>
                              </>
                            )}
                          </tr>
                        ))}
                        {order.components.length === 0 && (
                          <tr>
                            <td colSpan={order.status !== "DRAFT" ? 6 : 4} className="text-center py-8 text-gray-500">
                              No components added. Select a Bill of Material or add manually.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work_orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Work Orders</CardTitle>
                    {!isReadOnly && (
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add a line
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Operations</th>
                          <th className="text-left py-2">Work Center</th>
                          <th className="text-left py-2">Duration</th>
                          <th className="text-left py-2">Real Duration</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.work_orders.map((workOrder) => (
                          <tr key={workOrder.id} className="border-b">
                            <td className="py-2">{workOrder.operation_name}</td>
                            <td className="py-2">{workOrder.work_center_name}</td>
                            <td className="py-2">{workOrder.expected_duration}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <span>{workOrder.real_duration}</span>
                                {workOrder.status === "IN_PROGRESS" && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                )}
                              </div>
                            </td>
                            <td className="py-2">
                              <Badge className={workOrderStatusConfig[workOrder.status]?.color}>
                                {workOrderStatusConfig[workOrder.status]?.label}
                              </Badge>
                            </td>
                            <td className="py-2">
                              <div className="flex gap-1">
                                {workOrder.status === "TODO" && !isReadOnly && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleWorkOrderAction(workOrder.id, "start")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {workOrder.status === "IN_PROGRESS" && !isReadOnly && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleWorkOrderAction(workOrder.id, "pause")}
                                      variant="outline"
                                    >
                                      <PauseCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleWorkOrderAction(workOrder.id, "done")}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {order.work_orders.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                              No work orders added. Select a Bill of Material or add manually.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

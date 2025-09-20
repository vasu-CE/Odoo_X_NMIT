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
import {
  ManufacturingOrder,
  Product,
  BOM,
  WorkOrder,
} from "../../entities/all";
import { toast } from "sonner";
import apiService from "../../services/api";

const statusConfig = {
  DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
  CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", label: "In-Progress" },
  TO_CLOSE: { color: "bg-purple-100 text-purple-800", label: "To Close" },
  DONE: { color: "bg-green-100 text-green-800", label: "Done" },
  CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

const workOrderStatusConfig = {
  TO_DO: { color: "bg-gray-100 text-gray-800", label: "To Do" },
  IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", label: "In-Progress" },
  DONE: { color: "bg-green-100 text-green-800", label: "Done" },
  CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

export default function ManufacturingOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === "new";

  const [order, setOrder] = useState({
    id: "",
    orderNumber: "",
    finishedProduct: "",
    quantity: 1,
    units: "PCS",
    bomId: "",
    scheduleDate: new Date().toISOString().split("T")[0], // Default to today's date
    assigneeId: "",
    assigneeName: "",
    status: "DRAFT",
    priority: "MEDIUM",
    notes: "",
    components: [],
    workOrders: [],
  });

  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("components");
  const [timers, setTimers] = useState({});

  // Define handleCancelOrder early to avoid hoisting issues
  const handleCancelOrder = () => {
    // Clear the temporary order number and navigate back
    setOrder((prev) => ({
      ...prev,
      orderNumber: "",
    }));
    toast.info("Order creation cancelled");
    navigate("/manufacturing-orders");
  };

  useEffect(() => {
    if (isNew) {
      generateOrderNumber();
    } else {
      loadOrder();
    }
    loadReferenceData();

    // Cleanup function for when component unmounts
    return () => {
      // If this was a new order with a temporary ID, we could clean it up here
      // For now, we'll let the temporary ID expire naturally
    };
  }, [id]);

  const generateOrderNumber = async () => {
    // For new orders, get the next order number from the backend
    try {
      const response = await apiService.get(
        "/manufacturing-orders/next-number"
      );
      const orderNumber = response.data.orderNumber;
      setOrder((prev) => ({
        ...prev,
        orderNumber: orderNumber,
      }));
    } catch (error) {
      console.error("Error generating order number:", error);
      // Fallback to a temporary number if API fails
      const tempOrderNumber = `MO-${String(Date.now()).slice(-6)}`;
      setOrder((prev) => ({
        ...prev,
        orderNumber: tempOrderNumber,
      }));
    }
  };

  const loadOrder = async () => {
    if (isNew || !id) return;

    try {
      setLoading(true);
      const response = await apiService.getManufacturingOrder(id);
      const orderData = response.data;
      // Map backend response to frontend format
      const mappedOrder = {
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        finishedProduct: orderData.finishedProduct,
        quantity: orderData.quantity,
        units: orderData.units,
        bomId: orderData.bomId,
        scheduleDate: orderData.scheduleDate,
        assigneeId: orderData.assigneeId,
        assigneeName: orderData.assignee?.name || "",
        status: orderData.status,
        priority: orderData.priority,
        notes: orderData.notes,
        components: orderData.components || [],
        workOrders: orderData.workOrders || [],
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
        apiService.getProducts(),
        apiService.getBOMs(),
        apiService.getUsers(),
      ]);
      setProducts(productsData.data?.products || []);
      setBoms(bomsData.data?.boms || []);
      setUsers(usersData.data?.users || []);
    } catch (error) {
      console.error("Error loading reference data:", error);
      // Fallback to empty arrays if API fails
      setProducts([]);
      setBoms([]);
      setUsers([]);
    }
  };

  const handleInputChange = (field, value) => {
    setOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBOMChange = async (bomId) => {
    if (!bomId) {
      setOrder((prev) => ({
        ...prev,
        bomId: "",
        components: [],
        workOrders: [],
      }));
      return;
    }

    try {
      const response = await apiService.getBOM(bomId);
      const bom = response.data;
      setOrder((prev) => ({
        ...prev,
        bomId: bomId,
        components: bom.components || [],
        workOrders:
          bom.operations?.map((op) => ({
            id: `wo_${Date.now()}_${Math.random()}`,
            operationName: op.name,
            workCenterName: op.workCenter?.name || "",
            plannedDuration: op.timeMinutes,
            realDuration: 0,
            status: "TO_DO",
            startTime: null,
            endTime: null,
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
        // For new orders, just update the local status
        setOrder((prev) => ({ ...prev, status: newStatus }));
        toast.info(
          "Order status updated locally. Click 'Save Order' to create the order."
        );
        return;
      }

      // Update existing order
      if (!order.id) {
        toast.error("Order ID is missing. Cannot update status.");
        return;
      }

      await apiService.updateManufacturingOrderStatus(order.id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success(
        `Order status changed to ${statusConfig[newStatus]?.label}`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    if (isNew) {
      try {
        setLoading(true);
        // Create new order - map frontend fields to backend fields
        const orderData = {
          finishedProduct: order.finishedProduct,
          quantity: order.quantity,
          units: order.units,
          priority: order.priority,
          scheduleDate: order.scheduleDate,
          notes: order.notes,
        };

        // Only include assigneeId and bomId if they have values
        if (order.assigneeId) {
          orderData.assigneeId = order.assigneeId;
        }
        if (order.bomId) {
          orderData.bomId = order.bomId;
        }
        const response = await apiService.createManufacturingOrder(orderData);
        const createdOrder = response.data;
        // Map backend response to frontend format
        const mappedOrder = {
          id: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          finishedProduct: createdOrder.finishedProduct,
          quantity: createdOrder.quantity,
          units: createdOrder.units,
          bomId: createdOrder.bomId,
          scheduleDate: createdOrder.scheduleDate,
          assigneeId: createdOrder.assigneeId,
          assigneeName: createdOrder.assignee?.name || "",
          status: createdOrder.status,
          priority: createdOrder.priority,
          notes: createdOrder.notes,
          components: createdOrder.components || [],
          workOrders: createdOrder.workOrders || [],
        };
        setOrder(mappedOrder);
        toast.success("Manufacturing order created successfully!");
        navigate(`/manufacturing-orders/${createdOrder.id}`);
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create manufacturing order");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleWorkOrderAction = (workOrderId, action) => {
    const workOrder = order.workOrders.find((wo) => wo.id === workOrderId);
    if (!workOrder) return;

    const now = new Date();
    let newStatus = workOrder.status;
    let newRealDuration = workOrder.realDuration;

    switch (action) {
      case "start":
        newStatus = "IN_PROGRESS";
        setTimers((prev) => ({
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
          setTimers((prev) => {
            const { [workOrderId]: removed, ...rest } = prev;
            return rest;
          });
        }
        break;
      case "done":
        newStatus = "DONE";
        if (timers[workOrderId]) {
          clearInterval(timers[workOrderId].interval);
          setTimers((prev) => {
            const { [workOrderId]: removed, ...rest } = prev;
            return rest;
          });
        }
        break;
    }

    setOrder((prev) => ({
      ...prev,
      workOrders: prev.workOrders.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              status: newStatus,
              realDuration: newRealDuration,
              startTime: action === "start" ? now : wo.startTime,
              endTime: action === "done" ? now : wo.endTime,
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
    const duration = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    setOrder((prev) => ({
      ...prev,
      workOrders: prev.workOrders.map((wo) =>
        wo.id === workOrderId ? { ...wo, realDuration: elapsed } : wo
      ),
    }));
  };

  const canConfirm = () => {
    return order?.finishedProduct && order?.quantity > 0 && order?.scheduleDate;
  };

  const canStart = () => {
    return order?.status === "CONFIRMED";
  };

  const canProduce = () => {
    return (
      order?.status === "TO_CLOSE" &&
      order?.workOrders?.every((wo) => wo.status === "DONE")
    );
  };

  const getStatusProgress = () => {
    if (!order) return 0;
    const statuses = ["DRAFT", "CONFIRMED", "IN_PROGRESS", "TO_CLOSE", "DONE"];
    const currentIndex = statuses.indexOf(order.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const isReadOnly = order?.status === "CANCELLED";

  const handleAddComponent = async () => {
    if (!order.id) {
      toast.error("Please save the order first before adding components");
      return;
    }

    const componentName = prompt("Enter component name:");
    if (!componentName) return;

    const availability = parseFloat(prompt("Enter availability:") || "0");
    const toConsume = parseFloat(prompt("Enter quantity to consume:") || "0");
    const units = prompt("Enter units (default: PCS):") || "PCS";

    try {
      const response = await apiService.addComponentToManufacturingOrder(
        order.id,
        {
          componentName,
          availability,
          toConsume,
          units,
        }
      );

      setOrder((prev) => ({
        ...prev,
        components: [...prev.components, response.data],
      }));
      toast.success("Component added successfully");
    } catch (error) {
      console.error("Error adding component:", error);
      toast.error("Failed to add component");
    }
  };

  const handleAddWorkOrder = async () => {
    if (!order.id) {
      toast.error("Please save the order first before adding work orders");
      return;
    }

    const operationName = prompt("Enter operation name:");
    if (!operationName) return;

    const workCenterName = prompt("Enter work center name:");
    if (!workCenterName) return;

    const plannedDuration = parseInt(
      prompt("Enter planned duration in minutes:") || "60"
    );

    try {
      const response = await apiService.addWorkOrderToManufacturingOrder(
        order.id,
        {
          operationName,
          workCenterName,
          plannedDuration,
        }
      );

      setOrder((prev) => ({
        ...prev,
        workOrders: [...prev.workOrders, response.data],
      }));
      toast.success("Work order added successfully");
    } catch (error) {
      console.error("Error adding work order:", error);
      toast.error("Failed to add work order");
    }
  };

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
              {order.orderNumber && (
                <p className="text-sm text-gray-600">
                  Order: {order.orderNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {/* Save and Cancel buttons for new orders */}
              {isNew && (
                <>
                  <Button
                    onClick={handleSaveOrder}
                    disabled={!canConfirm()}
                    className={`bg-green-600 hover:bg-green-700 text-white cursor-pointer transition-colors duration-200 ${
                      !canConfirm() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelOrder}
                    className="bg-gray-500 hover:bg-gray-600 text-white cursor-pointer transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {/* Status action buttons */}
              {!isReadOnly && (
                <>
                  {order.status === "DRAFT" && !isNew && (
                    <Button
                      onClick={() => handleStatusChange("CONFIRMED")}
                      disabled={!canConfirm()}
                      className={`bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors duration-200 ${
                        !canConfirm() ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                  )}

                  {order.status === "CONFIRMED" && (
                    <Button
                      onClick={() => handleStatusChange("IN_PROGRESS")}
                      className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors duration-200"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      In-Progress
                    </Button>
                  )}

                  {order.status === "IN_PROGRESS" && (
                    <Button
                      onClick={() => handleStatusChange("TO_CLOSE")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer transition-colors duration-200"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      To Close
                    </Button>
                  )}

                  {order.status === "TO_CLOSE" && canProduce() && (
                    <Button
                      onClick={() => handleStatusChange("DONE")}
                      className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors duration-200"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Done
                    </Button>
                  )}

                  {order.status !== "DONE" && order.status !== "CANCELLED" && (
                    <Button
                      onClick={() => handleStatusChange("CANCELLED")}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 cursor-pointer transition-colors duration-200"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelled
                    </Button>
                  )}
                </>
              )}
            </div>
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
                } ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isReadOnly && handleStatusChange(status)}
                disabled={isReadOnly}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Indicator and Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  order.status === "DRAFT"
                    ? "bg-gray-400"
                    : order.status === "CONFIRMED"
                    ? "bg-blue-500"
                    : order.status === "IN_PROGRESS"
                    ? "bg-orange-500"
                    : order.status === "TO_CLOSE"
                    ? "bg-yellow-500"
                    : order.status === "DONE"
                    ? "bg-green-500"
                    : order.status === "CANCELLED"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                Status: {statusConfig[order.status]?.label || order.status}
              </span>
            </div>
            {order.status !== "CANCELLED" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {order.startedAt && (
              <div className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                <span>
                  Started: {new Date(order.startedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {order.completedAt && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Completed: {new Date(order.completedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Manufacturing Order Details */}
          <div
            className={`bg-white rounded-lg border-2 p-6 mb-6 ${
              order.status === "DRAFT"
                ? "border-gray-300"
                : order.status === "CONFIRMED"
                ? "border-blue-300 bg-blue-50/30"
                : order.status === "IN_PROGRESS"
                ? "border-orange-300 bg-orange-50/30"
                : order.status === "TO_CLOSE"
                ? "border-yellow-300 bg-yellow-50/30"
                : order.status === "DONE"
                ? "border-green-300 bg-green-50/30"
                : order.status === "CANCELLED"
                ? "border-red-300 bg-red-50/30"
                : "border-gray-300"
            }`}
          >
            {/* State-specific message */}
            {order.status === "DRAFT" && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Draft Order
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This order is in draft status. Please fill in all required
                  fields and confirm to proceed.
                </p>
              </div>
            )}
            {order.status === "CONFIRMED" && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Order Confirmed
                  </span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  This order has been confirmed and is ready to start
                  production.
                </p>
              </div>
            )}
            {order.status === "IN_PROGRESS" && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Production In Progress
                  </span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  This order is currently being produced. Monitor work orders
                  and component consumption.
                </p>
              </div>
            )}
            {order.status === "TO_CLOSE" && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    Ready to Close
                  </span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  Production is complete. Review the order and mark as done.
                </p>
              </div>
            )}
            {order.status === "DONE" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Order Completed
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  This order has been successfully completed.
                </p>
              </div>
            )}
            {order.status === "CANCELLED" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Order Cancelled
                  </span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  This order has been cancelled and cannot be modified.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Manufacturing Order Number
                  </Label>
                  <div className="mt-1 p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                    <span className="font-mono text-lg text-gray-600">
                      {order.orderNumber || "Loading..."}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Always auto generate, when clicked on new and number should
                    follow the sequence.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Finished product *
                  </Label>
                  <Input
                    type="text"
                    value={order.finishedProduct}
                    onChange={(e) =>
                      handleInputChange("finishedProduct", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Enter finished product name"
                    className={`mt-1 cursor-text ${
                      !order.finishedProduct
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    } ${isReadOnly ? "cursor-not-allowed bg-gray-100" : ""}`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Text input field for finished product name.
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
                      onChange={(e) =>
                        handleInputChange(
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={isReadOnly}
                      className={`flex-1 cursor-text ${
                        order.quantity <= 0
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      } ${isReadOnly ? "cursor-not-allowed bg-gray-100" : ""}`}
                      required
                    />
                    <span className="text-sm text-gray-500">{order.units}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Bill of Material *
                  </Label>
                  <select
                    value={order.bomId}
                    onChange={(e) => handleBOMChange(e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isReadOnly
                        ? "cursor-not-allowed bg-gray-100"
                        : "cursor-pointer"
                    } ${
                      !order.bomId && order.status === "DRAFT"
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a BOM</option>
                    {Array.isArray(boms) &&
                      boms.map((bom) => (
                        <option key={bom.id} value={bom.id}>
                          {bom.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Non Mandatory field Drop Down, many2one field, selection
                    should be from bills of materials master, if bill of
                    material is selected first, it should auto populate the
                    finished product, quantity, components and work orders based
                    on bill of material selected.
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
                    value={order.scheduleDate}
                    onChange={(e) =>
                      handleInputChange("scheduleDate", e.target.value)
                    }
                    disabled={isReadOnly}
                    className={`mt-1 cursor-pointer ${
                      !order.scheduleDate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    } ${isReadOnly ? "cursor-not-allowed bg-gray-100" : ""}`}
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
                    value={order.assigneeId}
                    onChange={(e) => {
                      const user = users.find((u) => u.id === e.target.value);
                      handleInputChange("assigneeId", e.target.value);
                      handleInputChange("assigneeName", user?.name || "");
                    }}
                    disabled={isReadOnly}
                    className={`w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isReadOnly
                        ? "cursor-not-allowed bg-gray-100"
                        : "cursor-pointer"
                    }`}
                  >
                    <option value="">Select an assignee</option>
                    {Array.isArray(users) &&
                      users.map((user) => (
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Components
                </h3>
                {!isReadOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddComponent}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a product
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Components
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Availability
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        To Consume
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Consumed
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Units
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.components.map((component, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm">
                          {component.componentName}
                        </td>
                        <td className="py-2 text-sm">
                          {component.availability}
                        </td>
                        <td className="py-2 text-sm">{component.toConsume}</td>
                        <td className="py-2 text-sm">
                          {component.consumed || 0}
                        </td>
                        <td className="py-2 text-sm">{component.units}</td>
                      </tr>
                    ))}
                    {order.components.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 text-sm"
                        >
                          No components added. Select a Bill of Material or add
                          manually.
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Work Orders
                </h3>
                {!isReadOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddWorkOrder}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a line
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Operations
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Work Center
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Duration
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Real Duration
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.workOrders.map((workOrder) => (
                      <tr key={workOrder.id} className="border-b">
                        <td className="py-2 text-sm">
                          {workOrder.operationName}
                        </td>
                        <td className="py-2 text-sm">
                          {workOrder.workCenterName}
                        </td>
                        <td className="py-2 text-sm">
                          {workOrder.plannedDuration} min
                        </td>
                        <td className="py-2 text-sm">
                          {workOrder.realDuration || 0} min
                        </td>
                        <td className="py-2">
                          <Badge
                            className={`text-xs ${
                              workOrderStatusConfig[workOrder.status]?.color
                            }`}
                          >
                            {workOrderStatusConfig[workOrder.status]?.label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {order.workOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 text-sm"
                        >
                          No work orders added. Select a Bill of Material or add
                          manually.
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

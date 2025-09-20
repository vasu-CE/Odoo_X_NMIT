import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Clock,
  User,
  Calendar,
  Package,
  PlayCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { format } from "date-fns";

const priorityConfig = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800",
};

export default function OrderCard({ order, onUpdate, statusConfig }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const updates = {
        status: newStatus,
        ...(newStatus === "in_progress" &&
          !order.actual_start && {
            actual_start: new Date().toISOString(),
          }),
        ...(newStatus === "completed" && {
          actual_end: new Date().toISOString(),
        }),
      };
      await onUpdate(order.id, updates);
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  // Calculate progress based on status
  const getProgress = () => {
    switch (order.status) {
      case "planned":
        return 0;
      case "in_progress":
        return 50;
      case "completed":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <StatusIcon className="w-4 h-4 text-gray-500" />
              {order.order_number || `MO-${order.id.slice(-6)}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{order.product_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusConfig[order.status]?.color}>
              {statusConfig[order.status]?.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4" />
            <span>Qty: {order.quantity}</span>
          </div>
          {order.assignee_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="truncate">{order.assignee_name}</span>
            </div>
          )}
        </div>

        {/* Priority and Dates */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={priorityConfig[order.priority]}>
            {order.priority} priority
          </Badge>
          {order.scheduled_start && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(order.scheduled_start), "MMM dd")}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Materials Preview */}
        {order.required_materials && order.required_materials.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Materials Required:
            </p>
            <div className="space-y-1">
              {order.required_materials.slice(0, 2).map((material, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs text-gray-600 bg-gray-50/80 rounded px-2 py-1"
                >
                  <span>{material.product_name}</span>
                  <span>
                    {material.required_qty} {material.unit}
                  </span>
                </div>
              ))}
              {order.required_materials.length > 2 && (
                <p className="text-xs text-gray-500 px-2">
                  +{order.required_materials.length - 2} more materials
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {order.status === "planned" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("in_progress")}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}
          {order.status === "in_progress" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("completed")}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
          {(order.status === "planned" || order.status === "in_progress") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("cancelled")}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Timestamps */}
        <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex justify-between">
            <span>
              Created{" "}
              {order.created_date
                ? format(new Date(order.created_date), "MMM dd, HH:mm")
                : "Unknown"}
            </span>
            {order.actual_start && (
              <span>
                Started {format(new Date(order.actual_start), "MMM dd, HH:mm")}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

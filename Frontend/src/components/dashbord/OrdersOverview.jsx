import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  User,
  Calendar,
  Package,
  ExternalLink 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusConfig = {
  planned: { 
    color: "bg-blue-100 text-blue-800", 
    icon: Calendar,
    label: "Planned" 
  },
  in_progress: { 
    color: "bg-orange-100 text-orange-800", 
    icon: PlayCircle,
    label: "In Progress" 
  },
  completed: { 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle,
    label: "Completed" 
  },
  cancelled: { 
    color: "bg-red-100 text-red-800", 
    icon: XCircle,
    label: "Cancelled" 
  }
};

const priorityConfig = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800"
};

export default function OrdersOverview({ orders, loading }) {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Manufacturing Orders
          </CardTitle>
          <Link to={createPageUrl("ManufacturingOrders")}>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View All
            </Button>
          </Link>
        </div>
        
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">All</TabsTrigger>
            <TabsTrigger value="planned" className="data-[state=active]:bg-white">Planned</TabsTrigger>
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-white">Active</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredOrders.slice(0, 8).map((order) => {
            const StatusIcon = statusConfig[order.status]?.icon || Clock;
            
            return (
              <div
                key={order.id}
                className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 bg-white/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {order.order_number || `MO-${order.id.slice(-6)}`}
                      <StatusIcon className="w-4 h-4 text-gray-500" />
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.product_name} × {order.quantity}
                    </p>
                  </div>
                  <Badge className={statusConfig[order.status]?.color}>
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={priorityConfig[order.priority]}>
                    {order.priority} priority
                  </Badge>
                  {order.assignee_name && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      <User className="w-3 h-3 mr-1" />
                      {order.assignee_name}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    Created {format(new Date(order.created_date), "MMM dd, yyyy")}
                  </span>
                  {order.scheduled_start && (
                    <span>
                      Due {format(new Date(order.scheduled_start), "MMM dd")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No orders found for the selected filter.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
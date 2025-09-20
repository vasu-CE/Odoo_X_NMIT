import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Package,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

const statusConfig = {
  planned: {
    color: "bg-blue-100 text-blue-800",
    icon: Calendar,
    label: "Planned",
  },
  in_progress: {
    color: "bg-orange-100 text-orange-800",
    icon: PlayCircle,
    label: "In Progress",
  },
  completed: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Done",
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Cancelled",
  },
};

const OrdersOverview = ({ orders, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Orders
        </CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const statusInfo =
                statusConfig[order.status] || statusConfig.planned;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.product_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Order #{order.order_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={`${statusInfo.color} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {order.quantity} units
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersOverview;

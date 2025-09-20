import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, Wrench, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  active: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Active"
  },
  maintenance: {
    color: "bg-yellow-100 text-yellow-800", 
    icon: Wrench,
    label: "Maintenance"
  },
  inactive: {
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    label: "Inactive"
  }
};

export default function WorkCenterStatus({ workCenters, loading }) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
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
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Factory className="w-5 h-5 text-purple-600" />
          Work Center Status
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {workCenters.map((center) => {
            const StatusIcon = statusConfig[center.status]?.icon || Factory;
            const utilization = center.utilization || 0;
            
            return (
              <div
                key={center.id}
                className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 bg-white/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <StatusIcon className="w-4 h-4 text-gray-500" />
                      {center.name}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {center.type?.replace(/_/g, ' ')} • {center.location}
                    </p>
                  </div>
                  <Badge className={statusConfig[center.status]?.color}>
                    {statusConfig[center.status]?.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilization</span>
                    <span className="font-medium">{Math.round(utilization)}%</span>
                  </div>
                  <Progress 
                    value={utilization} 
                    className="h-2"
                  />
                </div>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <span>Capacity: {center.capacity}h/day</span>
                  <span>Rate: ${center.hourly_rate}/hour</span>
                </div>
              </div>
            );
          })}

          {workCenters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Factory className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No work centers configured yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
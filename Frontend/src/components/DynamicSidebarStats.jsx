import React from "react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import {
  Zap,
  Factory,
  Package2,
  CheckCircle,
  Clock,
  PlayCircle,
} from "lucide-react";

export default function DynamicSidebarStats() {
  const stats = useDashboardStats();

  if (stats.loading) {
    return (
      <div className="px-3 py-2 space-y-3">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Active Orders */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Active Orders</span>
          </div>
          <span className="font-bold text-orange-600">
            {stats.activeOrders}
          </span>
        </div>
        <div className="w-full bg-gray-200/60 rounded-full h-1.5 mt-2">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((stats.activeOrders / 10) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Work Centers Utilization */}
      {/* <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-gray-600">Work Centers</span>
          </div>
          <span className="font-bold text-cyan-600">
            {stats.workCentersUtilization}%
          </span>
        </div>
        <div className="w-full bg-gray-200/60 rounded-full h-1.5 mt-2">
          <div
            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.workCentersUtilization}%` }}
          ></div>
        </div>
      </div> */}

      {/* Manufacturing Orders */}
  

      {/* Work Orders Status Breakdown */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
        <div className="text-sm text-gray-600 mb-2">Work Orders Status</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-500">Completed</span>
            </div>
            <span className="text-xs font-semibold text-green-600">
              {stats.completedWorkOrders}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-500">In Progress</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {stats.inProgressWorkOrders}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-500">Pending</span>
            </div>
            <span className="text-xs font-semibold text-yellow-600">
              {stats.pendingWorkOrders}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

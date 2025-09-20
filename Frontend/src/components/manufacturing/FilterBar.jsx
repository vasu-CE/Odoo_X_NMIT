import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Filter,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function FilterBar({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) {
  const activeFiltersCount = [statusFilter, priorityFilter].filter(
    (f) => f !== "all"
  ).length;

  const getStatusIcon = (status) => {
    const icons = {
      all: <Filter className="w-4 h-4" />,
      planned: <Clock className="w-4 h-4" />,
      in_progress: <AlertCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />,
    };
    return icons[status] || icons.all;
  };

  const getStatusColor = (status) => {
    const colors = {
      all: "text-gray-500",
      planned: "text-blue-500",
      in_progress: "text-orange-500",
      completed: "text-green-500",
      cancelled: "text-red-500",
    };
    return colors[status] || colors.all;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      all: <Filter className="w-4 h-4" />,
      low: <Clock className="w-4 h-4" />,
      medium: <AlertCircle className="w-4 h-4" />,
      high: <AlertTriangle className="w-4 h-4" />,
      urgent: <X className="w-4 h-4" />,
    };
    return icons[priority] || icons.all;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      all: "text-gray-500",
      low: "text-gray-500",
      medium: "text-yellow-500",
      high: "text-orange-500",
      urgent: "text-red-500",
    };
    return colors[priority] || colors.all;
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-700 border-gray-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      urgent: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[priority] || colors.medium;
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Filter className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-700">
            Filter Orders
          </span>
          <p className="text-xs text-gray-500">Refine your search results</p>
        </div>
        {activeFiltersCount > 0 && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-1"
          >
            {activeFiltersCount} active
          </Badge>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <div className="flex-1 sm:flex-none sm:w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-3">
                  {getStatusIcon("all")}
                  <span className="font-medium">All Status</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-gray-50 text-gray-600"
                  >
                    All
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="planned">
                <div className="flex items-center gap-3">
                  {getStatusIcon("planned")}
                  <span className="font-medium">Planned</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-blue-50 text-blue-600"
                  >
                    Scheduled
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-3">
                  {getStatusIcon("in_progress")}
                  <span className="font-medium">Active</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-orange-50 text-orange-600"
                  >
                    Running
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-3">
                  {getStatusIcon("completed")}
                  <span className="font-medium">Done</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-green-50 text-green-600"
                  >
                    Done
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-3">
                  {getStatusIcon("cancelled")}
                  <span className="font-medium">Cancelled</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-red-50 text-red-600"
                  >
                    Stopped
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 sm:flex-none sm:w-40">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-3">
                  {getPriorityIcon("all")}
                  <span className="font-medium">All Priority</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-gray-50 text-gray-600"
                  >
                    All
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-3">
                  {getPriorityIcon("low")}
                  <span className="font-medium">Low</span>
                  <Badge
                    className={`ml-auto text-xs ${getPriorityBadgeColor(
                      "low"
                    )}`}
                  >
                    Normal
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-3">
                  {getPriorityIcon("medium")}
                  <span className="font-medium">Medium</span>
                  <Badge
                    className={`ml-auto text-xs ${getPriorityBadgeColor(
                      "medium"
                    )}`}
                  >
                    Standard
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-3">
                  {getPriorityIcon("high")}
                  <span className="font-medium">High</span>
                  <Badge
                    className={`ml-auto text-xs ${getPriorityBadgeColor(
                      "high"
                    )}`}
                  >
                    Important
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-3">
                  {getPriorityIcon("urgent")}
                  <span className="font-medium">Urgent</span>
                  <Badge
                    className={`ml-auto text-xs ${getPriorityBadgeColor(
                      "urgent"
                    )}`}
                  >
                    Critical
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full sm:w-auto h-10 px-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}

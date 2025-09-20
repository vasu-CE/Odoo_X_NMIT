import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function FilterBar({ 
  statusFilter, 
  setStatusFilter, 
  priorityFilter, 
  setPriorityFilter 
}) {
  const activeFiltersCount = [statusFilter, priorityFilter].filter(f => f !== "all").length;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filter by:</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-32 bg-white/50">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="planned">Planned</SelectItem>
          <SelectItem value="in_progress">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger className="w-32 bg-white/50">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}   
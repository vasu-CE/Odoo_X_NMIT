import React, { useState, useEffect } from "react";
import { WorkCenter } from "../entities/all";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  Factory,
  Plus,
  Search,
  Activity,
  AlertTriangle,
  Settings,
  Edit,
  Trash2,
  MapPin,
  Users,
} from "lucide-react";

const statusConfig = {
  active: {
    color: "bg-green-100 text-green-800",
    icon: Activity,
    label: "Active",
  },
  maintenance: {
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertTriangle,
    label: "Maintenance",
  },
  inactive: {
    color: "bg-red-100 text-red-800",
    icon: Factory,
    label: "Inactive",
  },
};

export default function WorkCenters() {
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const wcData = await WorkCenter.list("-created_date");
      setWorkCenters(wcData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (workCenterId, newStatus) => {
    try {
      // Mock update - in real app, this would call the API
      setWorkCenters((prev) =>
        prev.map((wc) =>
          wc.id === workCenterId ? { ...wc, status: newStatus } : wc
        )
      );
    } catch (error) {
      console.error("Error updating work center:", error);
    }
  };

  const handleDeleteWorkCenter = async (workCenterId) => {
    try {
      // Mock delete - in real app, this would call the API
      setWorkCenters((prev) => prev.filter((wc) => wc.id !== workCenterId));
    } catch (error) {
      console.error("Error deleting work center:", error);
    }
  };

  // Filter work centers
  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      wc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || wc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Activity className="h-3 w-3" />;
      case "maintenance":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Factory className="h-3 w-3" />;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Work Centers
            </h1>
            <p className="text-gray-600">
              Manage production work centers and their status
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            New Work Center
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search work centers by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Work Centers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/60 rounded-xl p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkCenters.map((workCenter) => (
              <Card
                key={workCenter.id}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {workCenter.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Code: {workCenter.code}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(
                        workCenter.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(workCenter.status)}
                      {workCenter.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{workCenter.location}</span>
                  </div>

                  {/* Capacity and Utilization */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium">
                        {workCenter.capacity} units
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilization</span>
                        <span className="font-medium">
                          {workCenter.utilization}%
                        </span>
                      </div>
                      <Progress
                        value={workCenter.utilization}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-2 pt-2">
                    {workCenter.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(workCenter.id, "maintenance")
                        }
                        variant="outline"
                        className="flex-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Maintenance
                      </Button>
                    )}
                    {workCenter.status === "maintenance" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(workCenter.id, "active")
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Activity className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    {workCenter.status === "inactive" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(workCenter.id, "active")
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Activity className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>

                  {/* Management Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteWorkCenter(workCenter.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredWorkCenters.length === 0 && !loading && (
          <div className="text-center py-12">
            <Factory className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No work centers found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first work center to get started"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Work Center
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

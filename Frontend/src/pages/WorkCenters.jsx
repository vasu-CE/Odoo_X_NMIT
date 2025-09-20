import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WorkCenter } from "../entities/all";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Factory,
  Plus,
  Search,
  List,
  Grid3X3,
  Activity,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
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
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use mock data to avoid API rate limiting
      const mockWorkCenters = [
        {
          id: 1,
          name: "Work Center-1",
          code: "WC001",
          location: "Building A, Floor 1",
          status: "active",
          capacity: 100,
          utilization: 75,
          hourly_cost: 50,
        },
        {
          id: 2,
          name: "Work Center-2",
          code: "WC002",
          location: "Building A, Floor 2",
          status: "maintenance",
          capacity: 80,
          utilization: 45,
          hourly_cost: 45,
        },
        {
          id: 3,
          name: "Work Center-3",
          code: "WC003",
          location: "Building B, Floor 1",
          status: "active",
          capacity: 120,
          utilization: 90,
          hourly_cost: 60,
        },
        {
          id: 4,
          name: "Work Center-4",
          code: "WC004",
          location: "Building B, Floor 2",
          status: "inactive",
          capacity: 90,
          utilization: 0,
          hourly_cost: 40,
        },
      ];

      setWorkCenters(mockWorkCenters);
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

    return matchesSearch;
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
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Work Center</h1>
            <div className="flex items-center gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                New
              </Button>
              <button
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
                className="p-1 hover:bg-gray-100 rounded"
              >
                {viewMode === "list" ? (
                  <Grid3X3 className="w-5 h-5 text-gray-500" />
                ) : (
                  <List className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          {/* <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-medium">
            Authorized Loris
          </div> */}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Allow user to search based on work center"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-300"
            />
          </div>
        </div>

        {/* Table View */}
        {viewMode === "list" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Center
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost per hour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                          </td>
                        </tr>
                      ))
                  ) : filteredWorkCenters.length > 0 ? (
                    filteredWorkCenters.map((workCenter) => {
                      const statusInfo =
                        statusConfig[workCenter.status] || statusConfig.active;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={workCenter.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <Factory className="w-4 h-4 mr-2 text-gray-400" />
                              {workCenter.name || "Work Center-1"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${workCenter.hourly_cost || 50}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`${statusInfo.color} flex items-center gap-1 w-fit`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/work-centers/${workCenter.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/work-centers/${workCenter.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium mb-2">
                            No work centers found
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : "Create your first work center to get started"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View (fallback) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkCenters.map((workCenter) => {
              const statusInfo =
                statusConfig[workCenter.status] || statusConfig.active;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={workCenter.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {workCenter.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Code: {workCenter.code}
                      </p>
                    </div>
                    <Badge
                      className={`${statusInfo.color} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per hour:</span>
                      <span>${workCenter.hourly_cost || 50}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span>{workCenter.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

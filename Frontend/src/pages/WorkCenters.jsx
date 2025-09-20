import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Plus,
  Search,
  Factory,
  Edit,
  Trash2,
  Eye,
  List,
  Grid3X3,
  Settings,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Wrench,
} from "lucide-react";
import WorkCenterForm from "../components/manufacturing/WorkCenterForm";
import apiService from "../services/api";

export default function WorkCentersPage() {
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [showForm, setShowForm] = useState(false);
  const [editingWorkCenter, setEditingWorkCenter] = useState(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState(null);

  useEffect(() => {
    loadWorkCenters();
  }, []);

  const loadWorkCenters = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWorkCenters();
      
      if (response.success && response.data.workCenters) {
        setWorkCenters(response.data.workCenters);
      } else {
        console.error("Failed to load work centers:", response.error);
      }
    } catch (error) {
      console.error("Error loading work centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkCenter = () => {
    setEditingWorkCenter(null);
    setShowForm(true);
  };

  const handleEditWorkCenter = (workCenter) => {
    setEditingWorkCenter(workCenter);
    setShowForm(true);
  };

  const handleSaveWorkCenter = async (workCenterData) => {
    try {
      console.log('Sending work center data:', workCenterData);
      let response;
      if (editingWorkCenter) {
        // Update existing work center
        response = await apiService.updateWorkCenter(editingWorkCenter.id, workCenterData);
      } else {
        // Create new work center
        response = await apiService.createWorkCenter(workCenterData);
      }

      if (response.success) {
        await loadWorkCenters(); // Reload the list
        setShowForm(false);
        setEditingWorkCenter(null);
      } else {
        console.error("Failed to save work center:", response.error);
        alert("Failed to save work center: " + response.error);
      }
    } catch (error) {
      console.error("Error saving work center:", error);
      alert("Error saving work center: " + error.message);
    }
  };

  const handleDeleteWorkCenter = async (workCenterId) => {
    if (!window.confirm("Are you sure you want to delete this work center?")) {
      return;
    }

    try {
      const response = await apiService.deleteWorkCenter(workCenterId);
      if (response.success) {
        await loadWorkCenters(); // Reload the list
      } else {
        console.error("Failed to delete work center:", response.error);
        alert("Failed to delete work center: " + response.error);
      }
    } catch (error) {
      console.error("Error deleting work center:", error);
      alert("Error deleting work center: " + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "MAINTENANCE":
        return <Wrench className="w-4 h-4 text-yellow-600" />;
      case "INACTIVE":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter work centers
  const filteredWorkCenters = workCenters.filter((workCenter) =>
    workCenter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workCenter.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="p-4 md:p-8 bg-transparent min-h-screen">
        <div className="max-w-4xl mx-auto">
          <WorkCenterForm
            workCenter={editingWorkCenter}
            onSave={handleSaveWorkCenter}
            onCancel={() => {
              setShowForm(false);
              setEditingWorkCenter(null);
            }}
            isEditing={!!editingWorkCenter}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Work Centers
            </h1>
            <p className="text-gray-600">
              Manage production work centers and their capacity
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg overflow-hidden">
          {/* Header with Search */}
          <div className="p-6 border-b border-gray-200/60">
            <div className="flex items-center justify-between mb-4">
              <Button 
                onClick={handleCreateWorkCenter}
                className="bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Work Center
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Work Centers</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "outline" : "default"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "outline" : "default"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search work centers by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg w-full border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : viewMode === "list" ? (
              /* List View - Table */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hourly Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkCenters.map((workCenter) => (
                      <tr key={workCenter.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{workCenter.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(workCenter.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(workCenter.status)}
                              {workCenter.status}
                            </div>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-4 h-4" />
                            {workCenter.capacity}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            ${workCenter.hourlyRate?.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600 max-w-xs truncate">
                            {workCenter.description || "No description"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWorkCenter(workCenter)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditWorkCenter(workCenter)}
                            >
                              <Edit className="w-4 h-4" />
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkCenters.map((workCenter) => (
                  <Card
                    key={workCenter.id}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Factory className="w-5 h-5" />
                            {workCenter.name}
                          </CardTitle>
                          <Badge className={`mt-2 ${getStatusColor(workCenter.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(workCenter.status)}
                              {workCenter.status}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">Capacity: {workCenter.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">Rate: ${workCenter.hourlyRate?.toFixed(2)}/hr</span>
                        </div>
                        {workCenter.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {workCenter.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedWorkCenter(workCenter)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditWorkCenter(workCenter)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No work centers found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Try adjusting your search" : "Create your first work center to get started"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateWorkCenter}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Work Center
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Work Center Detail Modal */}
        {selectedWorkCenter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  {selectedWorkCenter.name} - Details
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWorkCenter(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedWorkCenter.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedWorkCenter.status)}
                          {selectedWorkCenter.status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Capacity:</span>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <Users className="w-4 h-4" />
                      {selectedWorkCenter.capacity} workers
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hourly Rate:</span>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <DollarSign className="w-4 h-4" />
                      ${selectedWorkCenter.hourlyRate?.toFixed(2)}/hour
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-600 mt-1">
                      {new Date(selectedWorkCenter.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedWorkCenter.description && (
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600 mt-1">{selectedWorkCenter.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
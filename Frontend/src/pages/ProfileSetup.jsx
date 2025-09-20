import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  User,
  BarChart3,
  Settings,
  Save,
  Eye,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Factory,
  Package,
} from "lucide-react";
import apiService from "../services/api";

export default function ProfileSetup() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    loginId: "",
    role: "",
  });
  const [workOrderAnalysis, setWorkOrderAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        loginId: user.loginId || "",
        role: user.role || "",
      });
    }
    loadWorkOrderAnalysis();
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "reports") {
      setActiveTab("reports");
    }
  }, [searchParams]);

  const loadWorkOrderAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/reports/work-orders-analysis");
      setWorkOrderAnalysis(response.data?.workOrders || []);
    } catch (error) {
      console.error("Error loading work order analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiService.put("/users/profile", profileData);
      // Update user context if needed
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const exportWorkOrderAnalysis = () => {
    const csvContent = [
      [
        "Operation",
        "Work Center",
        "Product",
        "Quantity",
        "Expected Duration",
        "Real Duration",
        "Status",
      ],
      ...workOrderAnalysis.map((wo) => [
        wo.operationName || "N/A",
        wo.workCenterName || "N/A",
        wo.productName || "N/A",
        wo.quantity || 0,
        wo.expectedDuration || "00:00",
        wo.realDuration || "00:00",
        wo.status || "unknown",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-orders-analysis-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      ADMIN: "Administrator",
      MANUFACTURING_MANAGER: "Manufacturing Manager",
      SHOP_FLOOR_OPERATOR: "Shop Floor Operator",
      INVENTORY_MANAGER: "Inventory Manager",
      BUSINESS_OWNER: "Business Owner",
    };
    return roleNames[role] || role;
  };

  const getStatusColor = (status) => {
    const colors = {
      "to do": "bg-gray-100 text-gray-800",
      "in-progress": "bg-blue-100 text-blue-800",
      done: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Setup</h1>
        <p className="text-gray-600">
          Manage your profile and view your reports
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            My Reports
          </TabsTrigger>
        </TabsList>

        {/* My Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loginId">Login ID</Label>
                      <Input
                        id="loginId"
                        value={profileData.loginId}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            loginId: e.target.value,
                          })
                        }
                        placeholder="Enter your login ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={getRoleDisplayName(profileData.role)}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Role cannot be changed. Contact administrator if needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-6">
            {/* Work Orders Analysis Report */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Work Orders Analysis
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportWorkOrderAnalysis}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Analysis of your work orders with expected vs actual duration
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">
                      Loading work order analysis...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold text-blue-900">
                              {workOrderAnalysis.length}
                            </div>
                            <div className="text-sm text-blue-700">
                              Total Work Orders
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold text-green-900">
                              {
                                workOrderAnalysis.filter(
                                  (wo) => wo.status === "done"
                                ).length
                              }
                            </div>
                            <div className="text-sm text-green-700">
                              Completed
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="text-2xl font-bold text-yellow-900">
                              {
                                workOrderAnalysis.filter(
                                  (wo) => wo.status === "in-progress"
                                ).length
                              }
                            </div>
                            <div className="text-sm text-yellow-700">
                              In Progress
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {
                                workOrderAnalysis.filter(
                                  (wo) => wo.status === "to do"
                                ).length
                              }
                            </div>
                            <div className="text-sm text-gray-700">Pending</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Work Orders Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Operation
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Work Center
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Product
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Quantity
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Expected Duration
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Real Duration
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {workOrderAnalysis.length === 0 ? (
                            <tr>
                              <td
                                colSpan="7"
                                className="text-center py-8 text-gray-500"
                              >
                                No work orders found for analysis
                              </td>
                            </tr>
                          ) : (
                            workOrderAnalysis.map((wo, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-3 px-4 text-gray-900 font-medium">
                                  {wo.operationName || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {wo.workCenterName || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {wo.productName || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {wo.quantity || 0}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {wo.expectedDuration || "00:00"}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {wo.realDuration || "00:00"}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      wo.status
                                    )}`}
                                  >
                                    {wo.status || "unknown"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  User, 
  Mail, 
  Key, 
  Save, 
  Edit, 
  X, 
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import apiService from "../services/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    loginId: "",
    role: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        loginId: user.loginId || "",
        role: user.role || ""
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.loginId.trim()) {
      newErrors.loginId = "Login ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await apiService.updateProfile(formData);
      
      if (response.success) {
        updateUser(response.data);
        setMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setMessage("Failed to update profile: " + response.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await apiService.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      console.log(response);
      if (response.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error("Failed to change password: " + response.error);
        setMessage("Failed to change password: " + response.error);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "An unknown error occurred";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANUFACTURING_MANAGER":
        return "bg-blue-100 text-blue-800";
      case "SHOP_FLOOR_OPERATOR":
        return "bg-green-100 text-green-800";
      case "INVENTORY_MANAGER":
        return "bg-purple-100 text-purple-800";
      case "BUSINESS_OWNER":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "MANUFACTURING_MANAGER":
        return "Manufacturing Manager";
      case "SHOP_FLOOR_OPERATOR":
        return "Shop Floor Operator";
      case "INVENTORY_MANAGER":
        return "Inventory Manager";
      case "BUSINESS_OWNER":
        return "Business Owner";
      default:
        return role;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          loginId: user.loginId || "",
                          role: user.role || ""
                        });
                        setErrors({});
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md text-gray-900">
                    {user?.name || "Not provided"}
                  </div>
                )}
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Enter your email address"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {user?.email || "Not provided"}
                  </div>
                )}
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Login ID */}
              <div className="space-y-2">
                <Label htmlFor="loginId" className="text-sm font-medium">
                  Login ID
                </Label>
                {isEditing ? (
                  <Input
                    id="loginId"
                    value={formData.loginId}
                    onChange={(e) => handleInputChange("loginId", e.target.value)}
                    className={errors.loginId ? "border-red-500" : ""}
                    placeholder="Enter your login ID"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md text-gray-900">
                    {user?.loginId || "Not provided"}
                  </div>
                )}
                {errors.loginId && (
                  <p className="text-sm text-red-600">{errors.loginId}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <Badge className={getRoleColor(user?.role)}>
                    {getRoleLabel(user?.role)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Role cannot be changed. Contact administrator for role changes.
                </p>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Status</Label>
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className={errors.currentPassword ? "border-red-500" : ""}
                  placeholder="Enter current password"
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  className={errors.newPassword ? "border-red-500" : ""}
                  placeholder="Enter new password"
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-md flex items-center gap-2 ${
            message.includes("successfully") 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.includes("successfully") ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}


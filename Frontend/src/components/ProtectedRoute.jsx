import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Factory, Loader2 } from "lucide-react";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <Card className="w-96 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <Factory className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600 mb-4">
          Please wait while we verify your session
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-96 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. Required role:{" "}
              <strong>{requiredRole}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Your current role: <strong>{user?.role || "None"}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;

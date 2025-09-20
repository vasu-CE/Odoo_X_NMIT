import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./Layout.jsx";
import Dashboard from "./pages/dashboard";
import ManufacturingOrders from "./pages/ManufacturingOrders";
import WorkOrders from "./pages/WorkOrders";
import BOMPage from "./pages/BOM";
import WorkCenters from "./pages/WorkCenters";
import StockManagement from "./pages/StockManagement";
import Reports from "./pages/Reports";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manufacturing-orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <ManufacturingOrders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkOrders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bom"
            element={
              <ProtectedRoute>
                <Layout>
                  <BOMPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-centers"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkCenters />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-management"
            element={
              <ProtectedRoute>
                <Layout>
                  <StockManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

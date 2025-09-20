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
import ManufacturingOrderDetail from "./components/manufacturing/ManufacturingOrderDetail";
import ManufacturingOrderForm from "./components/manufacturing/ManufacturingOrderForm";
import WorkOrders from "./pages/WorkOrders";
import BOMPage from "./pages/BOM";
import BOMDetail from "./components/manufacturing/BOMDetail";
import WorkCenters from "./pages/WorkCenters";
import WorkCenterDetail from "./components/manufacturing/WorkCenterDetail";
import StockManagement from "./pages/StockManagement";
import StockLedgerDetail from "./components/manufacturing/StockLedgerDetail";
import Reports from "./pages/Reports";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";

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
            path="/manufacturing-orders/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ManufacturingOrderDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manufacturing-orders/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <ManufacturingOrderForm />
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
            path="/bom/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <BOMDetail />
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
            path="/work-centers/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkCenterDetail />
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
            path="/stock-management/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <StockLedgerDetail />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
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

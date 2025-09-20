import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
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
import apiService from "./services/api.js";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success) {
            setIsAuthenticated(true);
            setCurrentPage('dashboard');
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentPage('login');
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication pages if not logged in
  if (!isAuthenticated) {
    return (
      <div>
        <Toaster position="top-right" richColors />
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
        {currentPage === 'signup' && <SignupPage onNavigate={handleNavigate} />}
        {currentPage === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/manufacturing-orders"
            element={<ManufacturingOrders />}
          />
          <Route path="/work-orders" element={<WorkOrders />} />
          <Route path="/bom" element={<BOMPage />} />
          <Route path="/work-centers" element={<WorkCenters />} />
          <Route path="/stock-management" element={<StockManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

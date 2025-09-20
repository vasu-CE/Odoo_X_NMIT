import React, { useState } from "react";
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
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

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

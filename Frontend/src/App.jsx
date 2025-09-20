import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Dashboard from "./pages/dashboard";
import ManufacturingOrders from "./pages/ManufacturingOrders";
import WorkOrders from "./pages/WorkOrders";
import BOMPage from "./pages/BOM";
import WorkCenters from "./pages/WorkCenters";
import StockManagement from "./pages/StockManagement";
import Reports from "./pages/Reports";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
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

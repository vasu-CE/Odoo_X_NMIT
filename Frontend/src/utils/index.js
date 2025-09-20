// Utility functions for the application

export const createPageUrl = (pageName) => {
  const pageMap = {
    Dashboard: "/",
    ManufacturingOrders: "/manufacturing-orders",
    WorkOrders: "/work-orders",
    BOM: "/bom",
    WorkCenters: "/work-centers",
    StockManagement: "/stock-management",
    Reports: "/reports",
  };

  return pageMap[pageName] || "/";
};

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

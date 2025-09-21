import { useState, useEffect } from "react";
import apiService from "../services/api";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    workCentersUtilization: 0,
    totalWorkOrders: 0,
    completedWorkOrders: 0,
    pendingWorkOrders: 0,
    inProgressWorkOrders: 0,
    manufacturingOrders: 0,
    products: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        // Fetch work orders
        const workOrdersResponse = await apiService.getWorkOrders();
        const workOrders = workOrdersResponse.success
          ? workOrdersResponse.data.workOrders
          : [];

        // Fetch manufacturing orders
        const manufacturingOrdersResponse =
          await apiService.getManufacturingOrders();
        const manufacturingOrders = manufacturingOrdersResponse.success
          ? manufacturingOrdersResponse.data.manufacturingOrders
          : [];

        // Fetch work centers
        const workCentersResponse = await apiService.getWorkCenters();
        const workCenters = workCentersResponse.success
          ? workOrdersResponse.data.workCenters
          : [];

        // Fetch products
        const productsResponse = await apiService.getProducts();
        const products = productsResponse.success
          ? productsResponse.data.products
          : [];

        // Calculate stats
        const activeOrders = workOrders.filter(
          (wo) => wo.status === "IN_PROGRESS"
        ).length;
        const completedWorkOrders = workOrders.filter(
          (wo) => wo.status === "COMPLETED"
        ).length;
        const pendingWorkOrders = workOrders.filter(
          (wo) => wo.status === "PENDING"
        ).length;
        const inProgressWorkOrders = workOrders.filter(
          (wo) => wo.status === "IN_PROGRESS"
        ).length;

        // Calculate work center utilization (simplified)
        const workCentersUtilization =
          workCenters.length > 0
            ? Math.round((activeOrders / (workCenters.length * 2)) * 100)
            : 0;

        setStats({
          activeOrders,
          workCentersUtilization: Math.min(workCentersUtilization, 100),
          totalWorkOrders: workOrders.length,
          completedWorkOrders,
          pendingWorkOrders,
          inProgressWorkOrders,
          manufacturingOrders: manufacturingOrders.length,
          products: products.length,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return stats;
};

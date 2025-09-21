import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { useAuth } from "./contexts/AuthContext";
import {
  LayoutDashboard,
  Package2,
  ClipboardList,
  Zap,
  Factory,
  Archive,
  User,
  BarChart3,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import DynamicSidebarStats from "./components/DynamicSidebarStats";
import { useDashboardStats } from "./hooks/useDashboardStats";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    roles: ["ADMIN", "MANUFACTURING_MANAGER", "SHOP_FLOOR_OPERATOR", "INVENTORY_MANAGER", "BUSINESS_OWNER"]
  },
  {
    title: "Work Orders",
    url: createPageUrl("WorkOrders"),
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    roles: ["ADMIN", "MANUFACTURING_MANAGER", "SHOP_FLOOR_OPERATOR", "BUSINESS_OWNER"]
  },
  {
    title: "Bill of Materials",
    url: createPageUrl("BOM"),
    icon: ClipboardList,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    roles: ["ADMIN", "MANUFACTURING_MANAGER", "INVENTORY_MANAGER", "BUSINESS_OWNER","SHOP_FLOOR_OPERATOR"]
  },
  {
    title: "Work Centers",
    url: createPageUrl("WorkCenters"),
    icon: Factory,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    roles: ["ADMIN", "MANUFACTURING_MANAGER", "SHOP_FLOOR_OPERATOR", "BUSINESS_OWNER"]
  },
  {
    title: "Stock Management",
    url: createPageUrl("StockManagement"),
    icon: Archive,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    roles: ["ADMIN", "INVENTORY_MANAGER", "BUSINESS_OWNER"]
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    roles: ["ADMIN", "INVENTORY_MANAGER", "BUSINESS_OWNER"]
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const stats = useDashboardStats();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const profileDropdownRef = useRef(null);

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    if (!user?.role) return [];
    return navigationItems.filter(item => item.roles.includes(user.role));
  };

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Responsive Sidebar */}
        <Sidebar className="border-r border-gray-200/60 backdrop-blur-sm bg-white/80 z-30 md:static fixed top-0 left-0 h-auto md:h-full w-full md:w-auto shadow-lg md:shadow-none">
          <SidebarHeader className="border-b border-gray-200 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="ManufacturingOS Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm md:text-lg">
                    ManufacturingOS
                  </h2>
                  <p className="text-xs text-gray-500 hidden md:block">
                    Production Management
                  </p>
                </div>
              </div>
              <SidebarTrigger className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-1 md:p-3">
            {/* Quick Search - Hidden on mobile */}
            <div className="mb-2 md:mb-6 px-2 md:px-3 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders, products..."
                  className="pl-9 bg-gray-50/80 border-gray-200/60 text-sm"
                />
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 md:px-3 md:py-2">
                Manufacturing
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible py-1 md:py-0">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem
                      key={item.title}
                      className="flex-shrink-0 md:flex-shrink"
                    >
                      <SidebarMenuButton
                        asChild
                        className={`group hover:shadow-lg transition-all duration-200 rounded-xl mb-0 md:mb-1 transform hover:scale-105 ${
                          location.pathname === item.url
                            ? `${item.bgColor} ${item.color} shadow-lg scale-105`
                            : "hover:bg-white/60 text-gray-700"
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex flex-col md:flex-row items-center md:gap-3 px-3 py-2"
                        >
                          <div
                            className={`p-1.5 md:p-2 rounded-lg transition-all duration-300 ${
                              location.pathname === item.url
                                ? item.bgColor
                                : "bg-gray-100/80 group-hover:bg-white/80"
                            }`}
                          >
                            <item.icon
                              className={`w-4 h-4 ${
                                location.pathname === item.url
                                  ? item.color
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <span className="font-medium text-xs md:text-sm mt-1 md:mt-0">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-2 md:mt-8 hidden md:block">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <DynamicSidebarStats />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* <SidebarFooter className="border-t border-gray-200/60 p-4 bg-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user?.name || "Production Manager"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace('_', ' ') || "Manage production workflows"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 text-red-600"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter> */}
        </Sidebar>

        <main className="flex-1 flex flex-col relative z-10 pt-14 md:pt-0">
          {/* Responsive Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-20 hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-center gap-2 md:gap-4">
                <SidebarTrigger className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="md:text-xl font-bold text-gray-900">
                  Manufacturing Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  {/* <Bell className="w-5 h-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" /> */}
                </Button>
                <div className="relative" ref={profileDropdownRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-white" />
                  </Button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/60 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.loginId ||
                              user?.name ||
                              "Production Manager"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {{
                              MANUFACTURING_MANAGER: "Manufacturing Manager",
                              SHOP_FLOOR_OPERATOR: "Shop Floor Operator",
                              INVENTORY_MANAGER: "Inventory Manager",
                              BUSINESS_OWNER: "Business Owner",
                            }[user?.role] || "Unknown Role"}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileDropdown(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/reports"
                          onClick={() => setShowProfileDropdown(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                        >
                          <BarChart3 className="w-4 h-4" />
                          My Reports
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content - Responsive */}
          <div className="flex-1 overflow-auto p-3 md:p-6">
            <div className="h-full">{children}</div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </SidebarProvider>
  );
}

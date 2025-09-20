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

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Work Orders",
    url: createPageUrl("WorkOrders"),
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Bill of Materials",
    url: createPageUrl("BOM"),
    icon: ClipboardList,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Work Centers",
    url: createPageUrl("WorkCenters"),
    icon: Factory,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    title: "Stock Management",
    url: createPageUrl("StockManagement"),
    icon: Archive,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

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
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Sidebar */}
        <Sidebar className="border-r border-gray-200 bg-white relative z-10">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  ManufacturingOS
                </h2>
                <p className="text-xs text-gray-500">Production Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Manufacturing
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group hover:shadow-md transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url
                            ? `${item.bgColor} ${item.color} shadow-md`
                            : "hover:bg-gray-50/80 text-gray-700"
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-3"
                        >
                          <div
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              location.pathname === item.url
                                ? item.bgColor
                                : "bg-gray-100/80 group-hover:bg-gray-200/80"
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
                          <span className="font-medium text-sm">
                            {item.title}
                          </span>
                          {item.title === "Work Orders" && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-orange-100 text-orange-700 text-xs"
                            >
                              3
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col relative z-10">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" /> */}
                <h1 className="text-xl font-bold text-gray-900">
                  App Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative" ref={profileDropdownRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-white" />
                  </Button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
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
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
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

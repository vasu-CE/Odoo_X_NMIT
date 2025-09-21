import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard,
  Package2,
  ClipboardList,
  Zap,
  Factory,
  Archive,
  User,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
} from "lucide-react";
import DynamicSidebarStats from "./components/DynamicSidebarStats";
import { useDashboardStats } from "./hooks/useDashboardStats";
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
    title: "Manufacturing Orders",
    url: createPageUrl("ManufacturingOrders"),
    icon: Package2,
    color: "text-green-600",
    bgColor: "bg-green-50",
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

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const stats = useDashboardStats();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <Sidebar className="border-r border-gray-200/60 backdrop-blur-sm bg-white/70 relative z-10">
          <SidebarHeader className="border-b border-gray-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">ChainFlow</h2>
                <p className="text-xs text-gray-500">Production Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            {/* Quick Search */}
            <div className="mb-6 px-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders, products..."
                  className="pl-9 bg-gray-50/80 border-gray-200/60 text-sm"
                />
              </div>
            </div>

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
                              {stats.loading ? "..." : stats.totalWorkOrders}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <DynamicSidebarStats />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200/60 p-4 bg-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  Production Manager
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Manage production workflows
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-200/60"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 text-red-600"
                  onClick={onLogout}
                  title="Logout"
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col relative z-10">
          {/* Mobile Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 md:hidden sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-gray-100/80 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-bold text-gray-900">ChainFlow</h1>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="h-full">{children}</div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </SidebarProvider>
  );
}

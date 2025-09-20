import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const colorVariants = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    icon: "bg-blue-100 text-blue-600",
    accent: "text-blue-600"
  },
  green: {
    bg: "from-green-500 to-green-600", 
    icon: "bg-green-100 text-green-600",
    accent: "text-green-600"
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    icon: "bg-orange-100 text-orange-600", 
    accent: "text-orange-600"
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    icon: "bg-purple-100 text-purple-600",
    accent: "text-purple-600"
  }
};

export default function KPICard({ title, value, icon: Icon, trend, color, loading }) {
  const colors = colorVariants[color] || colorVariants.blue;

  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gray-200 rounded-full opacity-10" />
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-20 mt-4" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Animated background */}
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-r ${colors.bg} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      
      <CardHeader className="p-6 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className={`w-4 h-4 mr-1 ${colors.accent}`} />
            <span className={`font-medium ${colors.accent}`}>{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
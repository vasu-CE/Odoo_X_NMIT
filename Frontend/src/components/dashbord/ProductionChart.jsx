import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, addDays } from "date-fns";

export default function ProductionChart({ orders, loading }) {
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek(new Date()), i);
      return {
        date: format(date, "EEE"),
        fullDate: date,
        planned: 0,
        completed: 0
      };
    });

    orders.forEach(order => {
      const orderDate = new Date(order.created_date);
      const dayIndex = last7Days.findIndex(day => 
        format(day.fullDate, "yyyy-MM-dd") === format(orderDate, "yyyy-MM-dd")
      );
      
      if (dayIndex !== -1) {
        if (order.status === 'completed') {
          last7Days[dayIndex].completed += 1;
        }
        last7Days[dayIndex].planned += 1;
      }
    });

    return last7Days.map(({ date, planned, completed }) => ({
      date,
      planned,
      completed
    }));
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = generateChartData();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Weekly Production
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
              />
              <Bar 
                dataKey="planned" 
                fill="#3b82f6" 
                name="Planned"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="completed" 
                fill="#10b981" 
                name="Completed"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
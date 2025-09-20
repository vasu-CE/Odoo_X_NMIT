import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

const ProductionChart = ({ orders, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Mock chart data - in a real app, this would be processed from orders
  const chartData = [
    { month: 'Jan', completed: 12, planned: 15 },
    { month: 'Feb', completed: 18, planned: 20 },
    { month: 'Mar', completed: 15, planned: 18 },
    { month: 'Apr', completed: 22, planned: 25 },
    { month: 'May', completed: 20, planned: 22 },
    { month: 'Jun', completed: 25, planned: 28 }
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.completed, d.planned)));

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          Production Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-gray-600">Planned</span>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-3">
            {chartData.map((data, index) => (
              <div key={data.month} className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{data.month}</span>
                  <span>{data.completed}/{data.planned}</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {/* Completed bar */}
                  <div 
                    className="bg-blue-500 rounded-t flex-1 min-h-[4px]"
                    style={{ height: `${(data.completed / maxValue) * 100}%` }}
                  ></div>
                  {/* Planned bar */}
                  <div 
                    className="bg-gray-300 rounded-t flex-1 min-h-[4px]"
                    style={{ height: `${(data.planned / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+12% this month</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Last 6 months</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionChart;
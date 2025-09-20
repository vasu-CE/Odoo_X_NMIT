import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Factory, Activity, AlertTriangle } from 'lucide-react';

const WorkCenterStatus = ({ workCenters, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="h-3 w-3" />;
      case 'maintenance': return <AlertTriangle className="h-3 w-3" />;
      default: return <Factory className="h-3 w-3" />;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Factory className="h-5 w-5 text-gray-600" />
          Work Centers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workCenters.length > 0 ? (
            workCenters.map((center) => (
              <div key={center.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{center.name}</p>
                    <p className="text-sm text-gray-500">{center.location}</p>
                  </div>
                  <Badge className={`${getStatusColor(center.status)} flex items-center gap-1`}>
                    {getStatusIcon(center.status)}
                    {center.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilization</span>
                    <span className="font-medium">{center.utilization}%</span>
                  </div>
                  <Progress value={center.utilization} className="h-2" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No work centers found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkCenterStatus;
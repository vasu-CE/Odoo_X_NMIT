import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkCenter, WorkOrder } from '../../entities/all';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft,
  Factory,
  DollarSign,
  Clock,
  Users,
  Activity,
  AlertTriangle,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  active: {
    color: 'bg-green-100 text-green-800',
    icon: Activity,
    label: 'Active'
  },
  maintenance: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertTriangle,
    label: 'Maintenance'
  },
  inactive: {
    color: 'bg-red-100 text-red-800',
    icon: Factory,
    label: 'Inactive'
  }
};

export default function WorkCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workCenter, setWorkCenter] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_per_hour: 0,
    status: 'active',
    capacity: 1,
    location: '',
    manager: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      loadWorkCenterDetails();
    }
  }, [id]);

  const loadWorkCenterDetails = async () => {
    try {
      setLoading(true);
      const [workCenterData, workOrdersData] = await Promise.all([
        WorkCenter.get(id),
        WorkOrder.list()
      ]);

      if (workCenterData) {
        setWorkCenter(workCenterData);
        setFormData({
          name: workCenterData.name || '',
          description: workCenterData.description || '',
          cost_per_hour: workCenterData.cost_per_hour || 0,
          status: workCenterData.status || 'active',
          capacity: workCenterData.capacity || 1,
          location: workCenterData.location || '',
          manager: workCenterData.manager || '',
          notes: workCenterData.notes || ''
        });

        // Filter work orders for this work center
        const relatedWorkOrders = workOrdersData.filter(wo => wo.work_center_id === parseInt(id));
        setWorkOrders(relatedWorkOrders);
      }
    } catch (error) {
      console.error('Error loading work center details:', error);
      toast.error('Failed to load work center details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      const result = id === 'new' 
        ? await WorkCenter.create(formData)
        : await WorkCenter.update(id, formData);

      if (result) {
        toast.success(`Work Center ${id === 'new' ? 'created' : 'updated'} successfully`);
        if (id === 'new') {
          navigate(`/work-centers/${result.id}`);
        } else {
          setIsEditing(false);
          loadWorkCenterDetails();
        }
      }
    } catch (error) {
      console.error('Error saving work center:', error);
      toast.error('Failed to save work center');
    }
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.active;
  };

  const calculateUtilization = () => {
    if (!workCenter) return 0;
    const activeWorkOrders = workOrders.filter(wo => wo.status === 'in_progress').length;
    return Math.min((activeWorkOrders / workCenter.capacity) * 100, 100);
  };

  const getRecentWorkOrders = () => {
    return workOrders
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading work center details...</p>
        </div>
      </div>
    );
  }

  if (!workCenter && id !== 'new') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Work center not found</p>
          <Button onClick={() => navigate('/work-centers')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Centers
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusConfig(formData.status);
  const StatusIcon = statusInfo.icon;
  const utilization = calculateUtilization();

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/work-centers')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id === 'new' ? 'Create New Work Center' : (workCenter?.name || 'Work Center Details')}
              </h1>
              {workCenter && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(workCenter.created_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {id !== 'new' && (
              <>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                )}
              </>
            )}
            {id === 'new' && (
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Create Work Center
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Work Center Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="w-5 h-5 text-blue-600" />
                  Work Center Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange('status')}
                      disabled={!isEditing && id !== 'new'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="cost_per_hour">Cost per Hour ($)</Label>
                    <Input
                      id="cost_per_hour"
                      type="number"
                      step="0.01"
                      value={formData.cost_per_hour}
                      onChange={handleInputChange('cost_per_hour')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleInputChange('capacity')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={handleInputChange('location')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={handleInputChange('manager')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    disabled={!isEditing && id !== 'new'}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    disabled={!isEditing && id !== 'new'}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Work Orders */}
            {workOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Recent Work Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getRecentWorkOrders().map((wo) => (
                      <div key={wo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{wo.work_order_number}</p>
                          <p className="text-sm text-gray-600">{wo.operation_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            wo.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : wo.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {wo.status?.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(wo.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Work Center Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Center Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold">{formData.capacity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost per Hour</span>
                  <span className="font-semibold">${formData.cost_per_hour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Work Orders</span>
                  <span className="font-semibold">
                    {workOrders.filter(wo => wo.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Work Orders</span>
                  <span className="font-semibold">{workOrders.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Utilization Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Utilization</span>
                    <span className="text-lg font-semibold">{utilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        utilization > 90 ? 'bg-red-500' : 
                        utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {workOrders.filter(wo => wo.status === 'in_progress').length} of {formData.capacity} slots in use
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Orders</span>
                  <span className="font-semibold">
                    {workOrders.filter(wo => wo.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold">
                    {workOrders.length > 0 
                      ? Math.round((workOrders.filter(wo => wo.status === 'completed').length / workOrders.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Duration</span>
                  <span className="font-semibold">
                    {workOrders.length > 0 
                      ? Math.round(workOrders.reduce((sum, wo) => sum + (wo.actual_duration || 0), 0) / workOrders.length)
                      : 0} min
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

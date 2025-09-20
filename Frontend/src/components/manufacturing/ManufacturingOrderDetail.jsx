import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ManufacturingOrder, WorkOrder, BOM } from '../../entities/all';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertTriangle,
  Hash,
  DollarSign,
  Factory,
  ClipboardList,
  Save,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  planned: {
    color: "bg-blue-100 text-blue-800",
    icon: Calendar,
    label: "Planned",
    actions: ['confirm', 'start', 'cancel']
  },
  in_progress: {
    color: "bg-orange-100 text-orange-800",
    icon: PlayCircle,
    label: "In Progress",
    actions: ['complete', 'cancel']
  },
  completed: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Completed",
    actions: ['print']
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Cancelled",
    actions: []
  }
};

export default function ManufacturingOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderData, workOrdersData] = await Promise.all([
        ManufacturingOrder.get(id),
        WorkOrder.list()
      ]);

      if (orderData) {
        setOrder(orderData);
        setFormData({
          order_number: orderData.order_number || '',
          product_name: orderData.product_name || '',
          quantity: orderData.quantity || 1,
          priority: orderData.priority || 'medium',
          scheduled_start: orderData.scheduled_start ? new Date(orderData.scheduled_start).toISOString().slice(0, 16) : '',
          scheduled_end: orderData.scheduled_end ? new Date(orderData.scheduled_end).toISOString().slice(0, 16) : '',
          assignee_name: orderData.assignee_name || '',
          notes: orderData.notes || '',
          status: orderData.status || 'planned'
        });

        // Load BOM if available
        if (orderData.bom_id) {
          const bomData = await BOM.get(orderData.bom_id);
          setBom(bomData);
        }

        // Filter work orders for this manufacturing order
        const relatedWorkOrders = workOrdersData.filter(wo => wo.manufacturing_order_id === parseInt(id));
        setWorkOrders(relatedWorkOrders);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
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

  const handleStatusChange = async (newStatus) => {
    try {
      let result;
      switch (newStatus) {
        case 'confirm':
          result = await ManufacturingOrder.confirm(id);
          break;
        case 'start':
          result = await ManufacturingOrder.start(id);
          break;
        case 'complete':
          result = await ManufacturingOrder.complete(id);
          break;
        case 'cancel':
          result = await ManufacturingOrder.cancel(id);
          break;
        default:
          return;
      }

      if (result) {
        toast.success(`Order ${newStatus}ed successfully`);
        loadOrderDetails(); // Reload to get updated data
      }
    } catch (error) {
      console.error(`Error ${newStatus}ing order:`, error);
      toast.error(`Failed to ${newStatus} order`);
    }
  };

  const handleSave = async () => {
    try {
      const result = await ManufacturingOrder.update(id, formData);
      if (result) {
        toast.success('Order updated successfully');
        setIsEditing(false);
        loadOrderDetails();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.planned;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
          <Button onClick={() => navigate('/manufacturing-orders')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusConfig(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/manufacturing-orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {order.order_number || 'Manufacturing Order'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusInfo.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(order.created_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={order.status === 'completed' || order.status === 'cancelled'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {statusInfo.actions.map(action => (
                  <Button
                    key={action}
                    onClick={() => handleStatusChange(action)}
                    className={
                      action === 'cancel' 
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : action === 'complete'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  >
                    {action === 'confirm' && <CheckCircle className="w-4 h-4 mr-2" />}
                    {action === 'start' && <PlayCircle className="w-4 h-4 mr-2" />}
                    {action === 'complete' && <CheckCircle className="w-4 h-4 mr-2" />}
                    {action === 'cancel' && <XCircle className="w-4 h-4 mr-2" />}
                    {action === 'print' && <Package className="w-4 h-4 mr-2" />}
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </Button>
                ))}
              </>
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
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order_number">Order Number</Label>
                    <Input
                      id="order_number"
                      value={formData.order_number}
                      onChange={handleInputChange('order_number')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_name">Product</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange('product_name')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleInputChange('quantity')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={handleInputChange('priority')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="scheduled_start">Scheduled Start</Label>
                    <Input
                      id="scheduled_start"
                      type="datetime-local"
                      value={formData.scheduled_start}
                      onChange={handleInputChange('scheduled_start')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_end">Scheduled End</Label>
                    <Input
                      id="scheduled_end"
                      type="datetime-local"
                      value={formData.scheduled_end}
                      onChange={handleInputChange('scheduled_end')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignee_name">Assignee</Label>
                    <Input
                      id="assignee_name"
                      value={formData.assignee_name}
                      onChange={handleInputChange('assignee_name')}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Required Materials */}
            {bom && bom.components && bom.components.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-green-600" />
                    Required Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Product Name</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Required Qty</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Consumed Qty</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bom.components.map((component, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 px-3 text-gray-900">{component.product_name}</td>
                            <td className="py-2 px-3 text-gray-700">{component.required_qty}</td>
                            <td className="py-2 px-3 text-gray-700">{component.consumed_qty || 0}</td>
                            <td className="py-2 px-3 text-gray-700">{component.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Orders */}
            {workOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-purple-600" />
                    Work Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Work Order No</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Operation</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Work Center</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Expected Duration</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Real Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workOrders.map((wo) => (
                          <tr key={wo.id} className="border-b border-gray-100">
                            <td className="py-2 px-3 text-gray-900 font-medium">{wo.work_order_number}</td>
                            <td className="py-2 px-3 text-gray-700">{wo.operation_name}</td>
                            <td className="py-2 px-3 text-gray-700">{wo.work_center_name}</td>
                            <td className="py-2 px-3">
                              <Badge className={
                                wo.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : wo.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }>
                                {wo.status?.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-gray-700">{formatDuration(wo.estimated_duration)}</td>
                            <td className="py-2 px-3 text-gray-700">{formatDuration(wo.actual_duration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-semibold">${order.total_cost || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold">
                    {workOrders.length > 0 
                      ? Math.round((workOrders.filter(wo => wo.status === 'completed').length / workOrders.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Work Orders</span>
                  <span className="font-semibold">{workOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials</span>
                  <span className="font-semibold">{bom?.components?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Order Created</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {order.actual_start && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Started</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.actual_start).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.actual_end && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.actual_end).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

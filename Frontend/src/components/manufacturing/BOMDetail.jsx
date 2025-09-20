import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BOM, Product, WorkCenter } from '../../entities/all';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft,
  ClipboardList,
  Package,
  Factory,
  Clock,
  DollarSign,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function BOMDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bom, setBom] = useState(null);
  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bom_number: '',
    product_name: '',
    status: 'draft',
    notes: ''
  });
  const [components, setComponents] = useState([]);
  const [operations, setOperations] = useState([]);

  useEffect(() => {
    if (id) {
      loadBOMDetails();
    }
  }, [id]);

  const loadBOMDetails = async () => {
    try {
      setLoading(true);
      const [bomData, productsData, workCentersData] = await Promise.all([
        BOM.get(id),
        Product.list(),
        WorkCenter.list()
      ]);

      if (bomData) {
        setBom(bomData);
        setFormData({
          bom_number: bomData.bom_number || '',
          product_name: bomData.product_name || '',
          status: bomData.status || 'draft',
          notes: bomData.notes || ''
        });
        setComponents(bomData.components || []);
        setOperations(bomData.operations || []);
      }
      setProducts(productsData);
      setWorkCenters(workCentersData);
    } catch (error) {
      console.error('Error loading BOM details:', error);
      toast.error('Failed to load BOM details');
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

  const handleAddComponent = () => {
    setComponents(prev => [...prev, {
      id: Date.now(),
      product_name: '',
      quantity: 1,
      unit: 'pcs',
      isNew: true
    }]);
  };

  const handleUpdateComponent = (index, field, value) => {
    setComponents(prev => prev.map((comp, i) => 
      i === index ? { ...comp, [field]: value } : comp
    ));
  };

  const handleRemoveComponent = (index) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddOperation = () => {
    setOperations(prev => [...prev, {
      id: Date.now(),
      name: '',
      work_center_id: '',
      estimated_time: 0,
      hourly_rate: 0,
      isNew: true
    }]);
  };

  const handleUpdateOperation = (index, field, value) => {
    setOperations(prev => prev.map((op, i) => 
      i === index ? { ...op, [field]: value } : op
    ));
  };

  const handleRemoveOperation = (index) => {
    setOperations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const bomData = {
        ...formData,
        components: components.filter(comp => comp.product_name),
        operations: operations.filter(op => op.name)
      };

      const result = id === 'new' 
        ? await BOM.create(bomData)
        : await BOM.update(id, bomData);

      if (result) {
        toast.success(`BOM ${id === 'new' ? 'created' : 'updated'} successfully`);
        if (id === 'new') {
          navigate(`/bom/${result.id}`);
        } else {
          setIsEditing(false);
          loadBOMDetails();
        }
      }
    } catch (error) {
      console.error('Error saving BOM:', error);
      toast.error('Failed to save BOM');
    }
  };

  const handleActivate = async () => {
    try {
      const result = await BOM.activate(id);
      if (result) {
        toast.success('BOM activated successfully');
        loadBOMDetails();
      }
    } catch (error) {
      console.error('Error activating BOM:', error);
      toast.error('Failed to activate BOM');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactive' }
    };
    return configs[status] || configs.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BOM details...</p>
        </div>
      </div>
    );
  }

  if (!bom && id !== 'new') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">BOM not found</p>
          <Button onClick={() => navigate('/bom')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to BOMs
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusConfig(formData.status);

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/bom')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id === 'new' ? 'Create New BOM' : (bom?.bom_number || 'BOM Details')}
              </h1>
              {bom && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(bom.created_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {id !== 'new' && (
              <>
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      disabled={bom?.status === 'active'}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {bom?.status === 'draft' && (
                      <Button
                        onClick={handleActivate}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    )}
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
              </>
            )}
            {id === 'new' && (
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Create BOM
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* BOM Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  BOM Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bom_number">BOM Number</Label>
                    <Input
                      id="bom_number"
                      value={formData.bom_number}
                      onChange={handleInputChange('bom_number')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_name">Product</Label>
                    <select
                      id="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange('product_name')}
                      disabled={!isEditing && id !== 'new'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </select>
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
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    disabled={!isEditing && id !== 'new'}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Materials */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Materials
                  </CardTitle>
                  {(isEditing || id === 'new') && (
                    <Button size="sm" onClick={handleAddComponent}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Material
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {components.map((component, index) => (
                    <div key={component.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Product Name</Label>
                          <select
                            value={component.product_name}
                            onChange={(e) => handleUpdateComponent(index, 'product_name', e.target.value)}
                            disabled={!isEditing && id !== 'new'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                          >
                            <option value="">Select Product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.name}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={component.quantity}
                            onChange={(e) => handleUpdateComponent(index, 'quantity', parseFloat(e.target.value) || 0)}
                            disabled={!isEditing && id !== 'new'}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <select
                            value={component.unit}
                            onChange={(e) => handleUpdateComponent(index, 'unit', e.target.value)}
                            disabled={!isEditing && id !== 'new'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                          >
                            <option value="pcs">Pieces</option>
                            <option value="kg">Kilograms</option>
                            <option value="m">Meters</option>
                            <option value="l">Liters</option>
                          </select>
                        </div>
                      </div>
                      {(isEditing || id === 'new') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveComponent(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {components.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No materials added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operations */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-purple-600" />
                    Operations
                  </CardTitle>
                  {(isEditing || id === 'new') && (
                    <Button size="sm" onClick={handleAddOperation}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Operation
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operations.map((operation, index) => (
                    <div key={operation.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label>Operation Name</Label>
                          <Input
                            value={operation.name}
                            onChange={(e) => handleUpdateOperation(index, 'name', e.target.value)}
                            disabled={!isEditing && id !== 'new'}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label>Work Center</Label>
                          <select
                            value={operation.work_center_id}
                            onChange={(e) => handleUpdateOperation(index, 'work_center_id', e.target.value)}
                            disabled={!isEditing && id !== 'new'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                          >
                            <option value="">Select Work Center</option>
                            {workCenters.map(wc => (
                              <option key={wc.id} value={wc.id}>
                                {wc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Estimated Time (min)</Label>
                          <Input
                            type="number"
                            value={operation.estimated_time}
                            onChange={(e) => handleUpdateOperation(index, 'estimated_time', parseFloat(e.target.value) || 0)}
                            disabled={!isEditing && id !== 'new'}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label>Hourly Rate ($)</Label>
                          <Input
                            type="number"
                            value={operation.hourly_rate}
                            onChange={(e) => handleUpdateOperation(index, 'hourly_rate', parseFloat(e.target.value) || 0)}
                            disabled={!isEditing && id !== 'new'}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      {(isEditing || id === 'new') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveOperation(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {operations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Factory className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No operations added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* BOM Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">BOM Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials</span>
                  <span className="font-semibold">{components.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operations</span>
                  <span className="font-semibold">{operations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Labor Cost</span>
                  <span className="font-semibold">
                    ${operations.reduce((sum, op) => sum + (op.estimated_time / 60 * op.hourly_rate), 0).toFixed(2)}
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
                  <Package className="w-4 h-4 mr-2" />
                  Use in Manufacturing Order
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Duplicate BOM
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Calculate Cost
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

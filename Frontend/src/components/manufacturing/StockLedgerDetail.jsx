import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, StockMovement } from '../../entities/all';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Save,
  Edit,
  AlertCircle,
  BarChart3,
  Calendar,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const movementTypeConfig = {
  in: {
    color: 'bg-green-100 text-green-800',
    icon: TrendingUp,
    label: 'Stock In'
  },
  out: {
    color: 'bg-red-100 text-red-800',
    icon: TrendingDown,
    label: 'Stock Out'
  },
  transfer: {
    color: 'bg-blue-100 text-blue-800',
    icon: ArrowUpDown,
    label: 'Transfer'
  },
  adjustment: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: RefreshCw,
    label: 'Adjustment'
  }
};

export default function StockLedgerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_price: 0,
    unit: 'pcs',
    category: '',
    reorder_level: 0,
    current_stock: 0,
    notes: ''
  });
  const [newMovement, setNewMovement] = useState({
    type: 'in',
    quantity: 0,
    reason: '',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const [productData, movementsData] = await Promise.all([
        Product.get(id),
        StockMovement.list()
      ]);

      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          unit_price: productData.unit_price || 0,
          unit: productData.unit || 'pcs',
          category: productData.category || '',
          reorder_level: productData.reorder_level || 0,
          current_stock: productData.current_stock || 0,
          notes: productData.notes || ''
        });

        // Filter stock movements for this product
        const relatedMovements = movementsData.filter(movement => movement.product_id === parseInt(id));
        setStockMovements(relatedMovements);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      toast.error('Failed to load product details');
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

  const handleMovementChange = (field) => (e) => {
    setNewMovement(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      const result = id === 'new' 
        ? await Product.create(formData)
        : await Product.update(id, formData);

      if (result) {
        toast.success(`Product ${id === 'new' ? 'created' : 'updated'} successfully`);
        if (id === 'new') {
          navigate(`/stock-management/${result.id}`);
        } else {
          setIsEditing(false);
          loadProductDetails();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleAddMovement = async () => {
    try {
      const movementData = {
        ...newMovement,
        product_id: parseInt(id),
        quantity: parseFloat(newMovement.quantity),
        unit_price: formData.unit_price
      };

      const result = await StockMovement.create(movementData);
      if (result) {
        toast.success('Stock movement added successfully');
        setNewMovement({
          type: 'in',
          quantity: 0,
          reason: '',
          reference: '',
          notes: ''
        });
        loadProductDetails();
      }
    } catch (error) {
      console.error('Error adding stock movement:', error);
      toast.error('Failed to add stock movement');
    }
  };

  const calculateStockValues = () => {
    const totalIn = stockMovements
      .filter(m => m.type === 'in')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalOut = stockMovements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const freeToUse = formData.current_stock;
    const incoming = stockMovements
      .filter(m => m.type === 'in' && new Date(m.created_date) > new Date())
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const outgoing = stockMovements
      .filter(m => m.type === 'out' && new Date(m.created_date) > new Date())
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalValue = formData.current_stock * formData.unit_price;

    return {
      onHand: formData.current_stock,
      freeToUse,
      incoming,
      outgoing,
      totalValue,
      totalIn,
      totalOut
    };
  };

  const getMovementConfig = (type) => {
    return movementTypeConfig[type] || movementTypeConfig.in;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product && id !== 'new') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => navigate('/stock-management')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stock Management
          </Button>
        </div>
      </div>
    );
  }

  const stockValues = calculateStockValues();

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/stock-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id === 'new' ? 'Create New Product' : (product?.name || 'Product Details')}
              </h1>
              {product && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={
                    stockValues.onHand <= formData.reorder_level 
                      ? 'bg-red-100 text-red-800'
                      : stockValues.onHand <= formData.reorder_level * 1.5
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }>
                    {stockValues.onHand <= formData.reorder_level ? 'Low Stock' : 
                     stockValues.onHand <= formData.reorder_level * 1.5 ? 'Reorder Soon' : 'In Stock'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(product.created_date).toLocaleDateString()}
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
                Create Product
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_price">Unit Price ($)</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={handleInputChange('unit_price')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={handleInputChange('unit')}
                      disabled={!isEditing && id !== 'new'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="m">Meters</option>
                      <option value="l">Liters</option>
                      <option value="box">Boxes</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="current_stock">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={handleInputChange('current_stock')}
                      disabled={!isEditing && id !== 'new'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorder_level">Reorder Level</Label>
                    <Input
                      id="reorder_level"
                      type="number"
                      value={formData.reorder_level}
                      onChange={handleInputChange('reorder_level')}
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

            {/* Stock Movement Form */}
            {id !== 'new' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-green-600" />
                    Add Stock Movement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="movement_type">Movement Type</Label>
                      <select
                        id="movement_type"
                        value={newMovement.type}
                        onChange={handleMovementChange('type')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      >
                        <option value="in">Stock In</option>
                        <option value="out">Stock Out</option>
                        <option value="transfer">Transfer</option>
                        <option value="adjustment">Adjustment</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="movement_quantity">Quantity</Label>
                      <Input
                        id="movement_quantity"
                        type="number"
                        value={newMovement.quantity}
                        onChange={handleMovementChange('quantity')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="movement_reason">Reason</Label>
                      <Input
                        id="movement_reason"
                        value={newMovement.reason}
                        onChange={handleMovementChange('reason')}
                        placeholder="e.g., Purchase, Sale, Adjustment"
                      />
                    </div>
                    <div>
                      <Label htmlFor="movement_reference">Reference</Label>
                      <Input
                        id="movement_reference"
                        value={newMovement.reference}
                        onChange={handleMovementChange('reference')}
                        placeholder="e.g., PO-12345, SO-67890"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="movement_notes">Notes</Label>
                      <Textarea
                        id="movement_notes"
                        value={newMovement.notes}
                        onChange={handleMovementChange('notes')}
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={handleAddMovement} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Movement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stock Movement History */}
            {stockMovements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Stock Movement History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockMovements
                      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                      .map((movement) => {
                        const movementInfo = getMovementConfig(movement.type);
                        const MovementIcon = movementInfo.icon;
                        
                        return (
                          <div key={movement.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${movementInfo.color}`}>
                                <MovementIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{movementInfo.label}</p>
                                <p className="text-sm text-gray-600">{movement.reason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {movement.type === 'in' ? '+' : '-'}{movement.quantity} {formData.unit}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(movement.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stock Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">On Hand</span>
                  <span className="font-semibold">{stockValues.onHand} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free to Use</span>
                  <span className="font-semibold">{stockValues.freeToUse} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Incoming</span>
                  <span className="font-semibold text-green-600">+{stockValues.incoming} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outgoing</span>
                  <span className="font-semibold text-red-600">-{stockValues.outgoing} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-semibold">${stockValues.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reorder Level</span>
                  <span className="font-semibold">{formData.reorder_level} {formData.unit}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stock Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stock In</span>
                  <span className="font-semibold text-green-600">+{stockValues.totalIn} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stock Out</span>
                  <span className="font-semibold text-red-600">-{stockValues.totalOut} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Movement</span>
                  <span className={`font-semibold ${
                    stockValues.totalIn > stockValues.totalOut ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockValues.totalIn > stockValues.totalOut ? '+' : ''}{stockValues.totalIn - stockValues.totalOut} {formData.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price</span>
                  <span className="font-semibold">${formData.unit_price}</span>
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
                  Set Reorder Alert
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/types/order';
import Image from 'next/image';

export default function ProductionDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          trackingNumber: status === 'shipped' ? trackingNumber : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast({
        title: "Order Updated",
        description: `Order status updated to ${status}.`,
      });

      // Refresh orders
      await fetchOrders();
      setTrackingNumber('');
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status.",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => order.status === 'processing');
  const shippedOrders = orders.filter(order => order.status === 'shipped');

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline mb-2">Production Dashboard</h1>
        <p className="text-muted-foreground">Manage orders and track production status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Production</p>
                <p className="text-2xl font-bold">{processingOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">{shippedOrders.length}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="processing">In Production ({processingOrders.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shippedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending orders</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                updatingOrder={updatingOrder}
                trackingNumber={trackingNumber}
                setTrackingNumber={setTrackingNumber}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {processingOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders in production</p>
              </CardContent>
            </Card>
          ) : (
            processingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                updatingOrder={updatingOrder}
                trackingNumber={trackingNumber}
                setTrackingNumber={setTrackingNumber}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="shipped" className="space-y-4">
          {shippedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shipped orders</p>
              </CardContent>
            </Card>
          ) : (
            shippedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                updatingOrder={updatingOrder}
                trackingNumber={trackingNumber}
                setTrackingNumber={setTrackingNumber}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  updatingOrder: string | null;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  getStatusIcon: (status: Order['status']) => React.ReactNode;
  getStatusColor: (status: Order['status']) => string;
  formatDate: (date: Date) => string;
}

function OrderCard({
  order,
  onUpdateStatus,
  updatingOrder,
  trackingNumber,
  setTrackingNumber,
  getStatusIcon,
  getStatusColor,
  formatDate,
}: OrderCardProps) {
  const nextStatus = order.status === 'pending' ? 'processing' : 
                   order.status === 'processing' ? 'shipped' : 'delivered';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {order.userEmail} • {formatDate(order.orderDate)}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <div className="text-sm text-muted-foreground">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Order Details</h4>
            <div className="text-sm text-muted-foreground">
              <p>Subtotal: ₹{order.subtotal.toFixed(0)}</p>
              <p>Tax: ₹{order.tax.toFixed(0)}</p>
              <p>Shipping: ₹{order.shipping.toFixed(0)}</p>
              <p className="font-semibold">Total: ₹{order.total.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Items</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded">
                <div className="relative w-12 h-12">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Size: {item.size} • Qty: {item.quantity} • ₹{item.price.toFixed(0)}
                  </p>
                  {item.printLocation && (
                    <p className="text-sm text-muted-foreground">
                      Print: {item.printLocation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.status === 'processing' && (
          <div className="space-y-2">
            <Label htmlFor={`tracking-${order.id}`}>Tracking Number</Label>
            <Input
              id={`tracking-${order.id}`}
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button
              onClick={() => onUpdateStatus(order.id, 'processing')}
              disabled={updatingOrder === order.id}
            >
              {updatingOrder === order.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Package className="mr-2 h-4 w-4" />
              )}
              Start Production
            </Button>
          )}

          {order.status === 'processing' && (
            <Button
              onClick={() => onUpdateStatus(order.id, 'shipped')}
              disabled={updatingOrder === order.id || !trackingNumber.trim()}
            >
              {updatingOrder === order.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Truck className="mr-2 h-4 w-4" />
              )}
              Mark as Shipped
            </Button>
          )}

          {order.status === 'shipped' && (
            <Button
              onClick={() => onUpdateStatus(order.id, 'delivered')}
              disabled={updatingOrder === order.id}
            >
              {updatingOrder === order.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Delivered
            </Button>
          )}

          {order.trackingNumber && (
            <Badge variant="outline">
              Tracking: {order.trackingNumber}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

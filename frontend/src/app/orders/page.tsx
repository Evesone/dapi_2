'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBag, Loader2, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/types/order';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { OrderService } from '@/lib/services/orderService';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    
    try {
      const orderData = await OrderService.getUserOrders(user.uid);
      // Transform the data to match the expected format
      const transformedOrders = orderData.map((order: any) => ({
        id: order.id,
        userId: order.userId,
        items: order.orderData.items || [],
        shippingAddress: order.orderData.shippingAddress,
        paymentInfo: order.orderData.paymentInfo,
        subtotal: order.orderData.subtotal || 0,
        tax: order.orderData.tax || 0,
        shipping: order.orderData.shipping || 0,
        total: order.orderData.total || 0,
        status: order.status,
        orderDate: order.createdAt,
        razorpayOrderId: order.razorpayOrderId,
        paymentId: order.paymentId,
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your orders.",
      });
    } finally {
      setOrdersLoading(false);
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
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline">My Orders</h1>
          <p className="text-muted-foreground">View and track all your orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start designing your custom clothing!</p>
              <Button asChild>
                <Link href="/design">Start Designing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>Size: {item.size}</span>
                              <span>Qty: {item.quantity}</span>
                              <span className="font-medium text-foreground">₹{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold mb-2">Order Summary</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between gap-8">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span>₹{order.subtotal.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span className="text-muted-foreground">Tax:</span>
                              <span>₹{order.tax.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span>₹{order.shipping.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between gap-8 font-semibold text-base pt-2 border-t">
                              <span>Total:</span>
                              <span>₹{order.total.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Shipping Address:</p>
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.address}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


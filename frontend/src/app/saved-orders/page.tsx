'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SavedOrder } from '@/lib/types/order';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { OrderService } from '@/lib/services/orderService';

export default function SavedOrdersPage() {
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [savedOrdersLoading, setSavedOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchSavedOrders();
    }
  }, [user]);

  const fetchSavedOrders = async () => {
    if (!user) return;
    
    try {
      const orders = await OrderService.getSavedOrders(user.uid);
      // Filter: Show manually saved orders and old format saves
      // Only filter out NEW auto-saves that have timestamp in notes
      const manuallySavedOrders = orders.filter((order: any) => {
        const notes = order.orderData?.notes || '';
        // New auto-saves have "Cart items saved automatically - 2024..." format
        const isNewAutoSave = notes.includes('Cart items saved automatically - 2');
        return !isNewAutoSave; // Show everything except new auto-saves
      });
      
      // Transform the data to match the expected format
      const transformedOrders = manuallySavedOrders.map((order: any) => ({
        id: order.id,
        userId: order.userId,
        items: order.orderData.items || [],
        shippingAddress: order.orderData.shippingAddress,
        paymentInfo: order.orderData.paymentInfo,
        subtotal: order.orderData.subtotal || 0,
        tax: order.orderData.tax || 0,
        shipping: order.orderData.shipping || 0,
        total: order.orderData.total || 0,
        notes: order.orderData.notes,
        savedDate: order.createdAt,
      }));
      setSavedOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching saved orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your saved orders.",
      });
    } finally {
      setSavedOrdersLoading(false);
    }
  };

  const handleRestoreToCart = (savedOrder: SavedOrder) => {
    try {
      // Add all items from the saved order back to the cart
      savedOrder.items.forEach((item) => {
        addToCart(item);
      });

      toast({
        title: "Items Restored!",
        description: `${savedOrder.items.length} item${savedOrder.items.length !== 1 ? 's' : ''} have been added to your cart.`,
      });

      // Navigate to cart
      router.push('/cart');
    } catch (error) {
      console.error('Error restoring items to cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore items to cart.",
      });
    }
  };

  const handleReorderItem = (item: any) => {
    try {
      addToCart(item);
      toast({
        title: "Item Added!",
        description: `${item.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart.",
      });
    }
  };

  const handleDeleteSavedOrder = async (savedOrderId: string) => {
    try {
      await OrderService.deleteSavedOrder(savedOrderId);
      
      toast({
        title: "Order Deleted",
        description: "Saved order has been removed.",
      });
      fetchSavedOrders(); // Refresh saved orders
    } catch (error) {
      console.error('Error deleting saved order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete saved order.",
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-4xl font-bold font-headline mb-2">Saved Orders</h1>
        <p className="text-muted-foreground">
          Your cancelled orders saved for easy re-ordering
        </p>
      </div>

      {savedOrdersLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : savedOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Saved Orders</h3>
            <p className="text-muted-foreground mb-6">
              When you cancel orders, they'll appear here for easy re-ordering.
            </p>
            <Button asChild>
              <Link href="/design">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Start Designing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {savedOrders.map((savedOrder) => (
            <Card key={savedOrder.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Saved Order #{savedOrder.id.slice(-8)}</CardTitle>
                    <CardDescription>
                      Saved on {formatDate(savedOrder.savedDate)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleRestoreToCart(savedOrder)}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Restore to Cart
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSavedOrder(savedOrder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                                         {savedOrder.items.map((item, index) => (
                       <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                         <div className="relative w-16 h-16">
                           <Image
                             src={item.imageUrl || '/placeholder.png'}
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
                             {item.printLocation && (
                               <span>Print: {item.printLocation}</span>
                             )}
                             <span>Qty: {item.quantity}</span>
                           </div>
                         </div>
                         <div className="text-right flex flex-col gap-2">
                           <p className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</p>
                           <Button 
                             size="sm" 
                             variant="outline"
                             onClick={() => handleReorderItem(item)}
                             className="text-xs"
                           >
                             <ShoppingCart className="h-3 w-3 mr-1" />
                             Reorder
                           </Button>
                         </div>
                       </div>
                     ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {savedOrder.items.length} item{savedOrder.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Subtotal: ₹{savedOrder.subtotal.toFixed(0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tax: ₹{savedOrder.tax.toFixed(0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Shipping: ₹{savedOrder.shipping.toFixed(0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{savedOrder.total.toFixed(0)}</p>
                        <Badge variant="secondary" className="mt-1">
                          Saved for Later
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {savedOrder.notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {savedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

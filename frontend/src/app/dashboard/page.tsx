'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Palette, ShoppingBag, User, Package, Truck, CheckCircle, Clock, AlertCircle, Plus, Loader2, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { Order, SavedOrder } from '@/lib/types/order';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { OrderService } from '@/lib/services/orderService';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [savedOrdersLoading, setSavedOrdersLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchSavedOrders();
      // Initialize profile data with user information
      setProfileData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      });
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

  const fetchSavedOrders = async () => {
    if (!user) return;
    
    try {
      const orders = await OrderService.getSavedOrders(user.uid);
      console.log('📦 Raw saved orders:', orders.length);
      
      // Filter: Show manually saved orders and old format saves
      // Only filter out NEW auto-saves that have timestamp in notes
      const manuallySavedOrders = orders.filter((order: any) => {
        const notes = order.orderData?.notes || '';
        // New auto-saves have "Cart items saved automatically - 2024..." format
        const isNewAutoSave = notes.includes('Cart items saved automatically - 2');
        console.log('Order notes:', notes, 'Is new auto-save:', isNewAutoSave);
        return !isNewAutoSave; // Show everything except new auto-saves
      });
      
      console.log('✅ Manually saved orders:', manuallySavedOrders.length);
      
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
      
      console.log('🎯 Transformed orders for dashboard:', transformedOrders);
      console.log('Items in first order:', transformedOrders[0]?.items);
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

  const handleSaveOrderForLater = async (order: Order) => {
    try {
      const orderData = {
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        notes: order.notes,
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/orders/save-for-later`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          userId: user!.uid,
          userEmail: user!.email,
          originalOrderId: order.id || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Order Saved!",
          description: "Your order has been saved for later.",
        });
        fetchSavedOrders(); // Refresh saved orders
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save order for later.",
      });
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

      // Optionally navigate to cart
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

  const handleSaveProfile = async () => {
    try {
      // Validate that at least display name is provided
      if (!profileData.displayName.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Display name is required.",
        });
        return;
      }

      // Here you would typically save to a user profile collection in Firestore
      // For now, we'll simulate saving and show a success message
      console.log('Saving profile data:', profileData);
      
      toast({
        title: "Profile Updated",
        description: `Profile saved successfully! Display Name: ${profileData.displayName}`,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile information.",
      });
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setIsEditing(false);
  };

  const handleOpenProfile = () => {
    // Reset form data when opening the modal
    setProfileData({
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setIsEditing(false);
    setIsProfileOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Ready to create your next custom design?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Studio
              </CardTitle>
              <CardDescription>
                Create custom apparel designs with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/design">
                  Start Designing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                My Orders
              </CardTitle>
              <CardDescription>
                View your order history and track shipments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/orders">
                  View Orders <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleOpenProfile}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  View and edit your profile information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pb-4">
                {/* Read-only information */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {user?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {user?.metadata.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'Unknown'
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Last Sign In</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {user?.metadata.lastSignInTime 
                      ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                      : 'Unknown'
                    }
                  </div>
                </div>

                {/* Editable information */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className={isEditing ? "text-primary" : ""}>
                    Display Name {isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Enter your display name"
                    className={isEditing ? "border-primary focus:ring-primary" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className={isEditing ? "text-primary" : ""}>
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className={isEditing ? "border-primary focus:ring-primary" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className={isEditing ? "text-primary" : ""}>
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                    className={isEditing ? "border-primary focus:ring-primary" : ""}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className={isEditing ? "text-primary" : ""}>
                      City
                    </Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      disabled={!isEditing}
                      placeholder="City"
                      className={isEditing ? "border-primary focus:ring-primary" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className={isEditing ? "text-primary" : ""}>
                      State
                    </Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      disabled={!isEditing}
                      placeholder="State"
                      className={isEditing ? "border-primary focus:ring-primary" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className={isEditing ? "text-primary" : ""}>
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                      disabled={!isEditing}
                      placeholder="ZIP"
                      className={isEditing ? "border-primary focus:ring-primary" : ""}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-4">
                  {!isEditing ? (
                    <>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Close
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSaveProfile} 
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 space-y-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/orders">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button asChild>
                    <Link href="/design">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Design
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                          <Image
                            src={order.items[0]?.imageUrl || '/placeholder.png'}
                            alt="Order item"
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatDate(order.orderDate)}
                          </p>
                          <p className="text-sm font-medium">₹{order.total.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                        {order.status === 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSaveOrderForLater(order)}
                          >
                            Save for Later
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Saved Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/saved-orders">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {savedOrdersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : savedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No saved orders yet</p>
                  <p className="text-sm text-muted-foreground">
                    Save your cart items to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedOrders.slice(0, 3).map((savedOrder) => (
                    <div key={savedOrder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                          <Image
                            src={savedOrder.items[0]?.imageUrl || '/placeholder.png'}
                            alt="Saved order item"
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Saved Order #{savedOrder.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {savedOrder.items.length} item{savedOrder.items.length !== 1 ? 's' : ''} • {formatDate(savedOrder.savedDate)}
                          </p>
                          <p className="text-sm font-medium">₹{savedOrder.total.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRestoreToCart(savedOrder)}
                        >
                          Restore to Cart
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteSavedOrder(savedOrder.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}

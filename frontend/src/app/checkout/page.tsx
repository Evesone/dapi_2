'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, CreditCard, Truck, IndianRupee } from 'lucide-react';
import { ShippingAddress, PaymentInfo, CreateOrderRequest } from '@/lib/types/order';
import { razorpayService } from '@/lib/razorpay';
import { calculateOrderTotals } from '@/lib/config/pricing';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
  });
  
  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cardholderName: '',
    cvc: '',
  });

  // Calculate totals using the new pricing system
  const { subtotal, tax, shipping, total } = calculateOrderTotals(cartItems);

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to place an order.",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
      });
      return;
    }

    // Basic validation
    if (!shippingData.fullName || !shippingData.address || !shippingData.city || 
        !shippingData.state || !shippingData.zipCode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all shipping information.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Razorpay order
      const razorpayOrderId = await razorpayService.createOrder(total, 'INR');

      // Open Razorpay payment modal
      const paymentResponse = await razorpayService.openPayment({
        amount: Math.round(total * 100), // Convert to paise
        currency: 'INR',
        name: 'DAPI',
        description: `Order for ${cartItems.length} item(s)`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingData.fullName,
          email: user.email || '',
          contact: shippingData.phone || '',
        },
        notes: {
          address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}`,
        },
        theme: {
          color: '#3b82f6',
        },
      });

      // Verify payment
      const isVerified = await razorpayService.verifyPayment(
        paymentResponse.razorpay_payment_id,
        razorpayOrderId,
        paymentResponse.razorpay_signature
      );

      if (!isVerified) {
        throw new Error('Payment verification failed');
      }

      // Create order in database
      const orderData: CreateOrderRequest = {
        items: cartItems,
        shippingAddress: shippingData,
        paymentInfo: {
          cardNumber: '****',
          expiryDate: '****',
          cardholderName: shippingData.fullName,
          cvc: '***',
        },
        subtotal,
        tax,
        shipping,
        total,
        notes: `Payment ID: ${paymentResponse.razorpay_payment_id}`,
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Clear cart and redirect to success page
      clearCart();
      toast({
        title: "Payment Successful!",
        description: `Your order #${result.orderId} has been placed and payment processed.`,
      });
      
      router.push(`/dashboard?orderId=${result.orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some items to your cart before checkout.</p>
          <Button onClick={() => router.push('/design')}>
            Start Designing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  value={shippingData.fullName}
                  onChange={(e) => handleShippingChange('fullName', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="123 Main St" 
                  value={shippingData.address}
                  onChange={(e) => handleShippingChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Anytown" 
                    value={shippingData.city}
                    onChange={(e) => handleShippingChange('city', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    placeholder="CA" 
                    value={shippingData.state}
                    onChange={(e) => handleShippingChange('state', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input 
                    id="zipCode" 
                    placeholder="12345" 
                    value={shippingData.zipCode}
                    onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input 
                    id="phone" 
                    placeholder="(555) 123-4567" 
                    value={shippingData.phone}
                    onChange={(e) => handleShippingChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Payment with Razorpay</h3>
                <p className="text-muted-foreground mb-4">
                  Your payment will be processed securely through Razorpay. 
                  You'll be redirected to their secure payment gateway after placing your order.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SSL Encrypted</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>PCI Compliant</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Gateway</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      {item.printLocation && (
                        <p className="text-sm text-muted-foreground">
                          Print: {item.printLocation}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <IndianRupee className="mr-2 h-4 w-4" />
                Pay with Razorpay
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

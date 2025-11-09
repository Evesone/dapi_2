
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { X, Save, Tag, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, updateSize, saveCartToSavedOrders } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 54 : 0; // ₹54 base shipping in INR
  const discount = appliedPromo?.discountAmount || 0;
  const total = subtotal + shipping - discount;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a promo code",
      });
      return;
    }

    setIsApplyingPromo(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode,
          userEmail: user?.email || null,
          orderTotal: subtotal + shipping,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedPromo({
          code: promoCode,
          discountAmount: result.discountAmount,
          message: result.message,
        });
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: result.message || "This promo code is not valid",
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast({
      title: "Promo Code Removed",
      description: "The discount has been removed from your order.",
    });
  };

  if (cartItems.length === 0) {
      return (
          <div className="container mx-auto py-10 text-center flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
              <h1 className="text-4xl font-bold font-headline mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">Looks like you haven't added any custom designs yet.</p>
              <Button asChild>
                  <Link href="/design">Start Designing</Link>
              </Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold font-headline mb-8">Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[50px] text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium align-top">
                        <p>{item.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-muted-foreground">Size:</span>
                             <Select
                              value={item.size}
                              onValueChange={(newSize) => updateSize(item.id, newSize)}
                            >
                              <SelectTrigger className="w-[70px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="S">S</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="XL">XL</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                            type="number" 
                            value={item.quantity} 
                            className="w-16"
                            min="1"
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            aria-label="Quantity"
                        />
                      </TableCell>
                      <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(0)}</TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(0)}</span>
              </div>
              
              {/* Promo Code Section */}
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Promo Code</label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{appliedPromo.code}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromoCode}
                      className="h-6 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromo}
                      variant="outline"
                    >
                      {isApplyingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              {user && cartItems.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={saveCartToSavedOrders}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Cart for Later
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

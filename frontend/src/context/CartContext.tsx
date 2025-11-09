
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { OrderService } from '@/lib/services/orderService';

export interface CartItem {
  id: string; // composite ID: imageUrl-size-printLocation
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  size: string;
  printLocation?: string;
  customPrintLocation?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSize: (id: string, newSize: string) => void;
  clearCart: () => void;
  saveCartToSavedOrders: () => Promise<void>;
  reorderItem: (item: CartItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dapi-cart-items';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cart items from localStorage on mount, then from database if user is logged in
  useEffect(() => {
    const loadCart = async () => {
      try {
        // First, load from localStorage
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        }

        // If user is logged in, try to load from database
        if (user) {
          try {
            const savedOrders = await OrderService.getSavedOrders(user.uid);
            // Find the most recent cart save (we'll mark cart saves with a specific note)
            const cartSave = savedOrders.find((order: any) => 
              order.orderData?.notes?.includes('Cart items saved')
            );
            
            if (cartSave && cartSave.orderData?.items) {
              // Merge or replace with database cart if it's more recent
              const dbCartDate = new Date(cartSave.createdAt).getTime();
              const localCartKey = localStorage.getItem(CART_STORAGE_KEY + '_timestamp');
              const localCartDate = localCartKey ? parseInt(localCartKey) : 0;
              
              if (dbCartDate > localCartDate) {
                setCartItems(cartSave.orderData.items);
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartSave.orderData.items));
              }
            }
          } catch (error) {
            console.error('Error loading cart from database:', error);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCart();
  }, [user]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        localStorage.setItem(CART_STORAGE_KEY + '_timestamp', Date.now().toString());
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isInitialized]);

  // Auto-save cart to database when user is logged in (debounced)
  useEffect(() => {
    if (!user || !isInitialized || cartItems.length === 0 || isSaving) return;

    const timeoutId = setTimeout(() => {
      saveCartToDatabase();
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [cartItems, user, isInitialized]);

  const saveCartToDatabase = async () => {
    if (!user || cartItems.length === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const orderData = {
        items: cartItems,
        shippingAddress: {
          fullName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        paymentInfo: {
          cardNumber: '',
          expiryDate: '',
          cardholderName: '',
          cvc: '',
        },
        subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        tax: 0,
        shipping: 0,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        notes: 'Cart items saved automatically - ' + new Date().toISOString(),
      };

      // Check if there's an existing cart save for this user
      const savedOrders = await OrderService.getSavedOrders(user.uid);
      const existingCartSave = savedOrders.find((order: any) => 
        order.orderData?.notes?.includes('Cart items saved automatically')
      );

      if (existingCartSave) {
        // Delete old cart save and create new one
        await OrderService.deleteSavedOrder(existingCartSave.id);
      }

      await OrderService.saveOrderForLater(orderData, user.uid, user.email || '');
      console.log('Cart auto-saved to database');
    } catch (error) {
      console.error('Error auto-saving cart to database:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
        title: "Item Removed",
        description: "The item has been removed from your cart.",
    })
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };
  
  const updateSize = (id: string, newSize: string) => {
      setCartItems((prevItems) => {
          const itemToUpdate = prevItems.find((item) => item.id === id);
          if (!itemToUpdate) return prevItems;

          // Extract print location from the current ID
          const idParts = itemToUpdate.id.split('-');
          const printLocation = idParts[idParts.length - 1];
          const newId = `${itemToUpdate.imageUrl}-${newSize}-${printLocation}`;
          const existingItemWithNewSize = prevItems.find(item => item.id === newId);

          if (existingItemWithNewSize) {
              const updatedItems = prevItems.map(item =>
                  item.id === newId
                      ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
                      : item
              );
              return updatedItems.filter(item => item.id !== id);
          } else {
              return prevItems.map(item =>
                  item.id === id
                      ? { ...item, size: newSize, id: newId }
                      : item
              );
          }
      });
      toast({
          title: "Size Updated",
          description: "The item size has been updated in your cart.",
      });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const saveCartToSavedOrders = async () => {
    if (!user || cartItems.length === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const orderData = {
        items: cartItems,
        shippingAddress: {
          fullName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        paymentInfo: {
          cardNumber: '',
          expiryDate: '',
          cardholderName: '',
          cvc: '',
        },
        subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        tax: 0,
        shipping: 0,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        notes: 'Cart saved manually by user - ' + new Date().toISOString(),
      };

      await OrderService.saveOrderForLater(orderData, user.uid, user.email || '');
      
      toast({
        title: "Cart Saved!",
        description: "Your cart items have been saved for later.",
      });
      clearCart(); // Clear cart after manual save
    } catch (error) {
      console.error('Error saving cart to saved orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save cart items.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const reorderItem = (item: CartItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      size: item.size,
      printLocation: item.printLocation,
      customPrintLocation: item.customPrintLocation,
    });
    
    toast({
      title: "Item Added!",
      description: `${item.name} has been added to your cart.`,
    });
  };


  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateSize, 
      clearCart,
      saveCartToSavedOrders,
      reorderItem
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

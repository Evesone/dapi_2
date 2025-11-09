"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { ShoppingCart, User, LogOut, Menu, Save } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function Header() {
  const { cartItems, saveCartToSavedOrders } = useCart();
  const { user, logout } = useAuth();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block font-headline">
              DAPI
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/design"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Design Studio
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Hamburger and cart button for mobile */}
        <div className="flex items-center md:hidden gap-2">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          <button
            className="flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop nav/actions */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          {user && cartItems.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={saveCartToSavedOrders}
              title="Save Cart for Later"
            >
              <Save className="h-5 w-5" />
              <span className="sr-only">Save Cart</span>
            </Button>
          )}
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/design">Start Designing</Link>
          </Button>
        </nav>

        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 w-full bg-background border-b border-border/40 shadow-lg md:hidden animate-fade-in z-50">
            <nav className="flex flex-col items-center py-4 space-y-2">
              <Link
                href="/design"
                className="w-full text-center py-2 transition-colors hover:text-foreground/80 text-foreground/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                Design Studio
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="w-full text-center py-2 transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/cart"
                className="w-full text-center py-2 flex items-center justify-center relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {totalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                    {totalItems}
                  </Badge>
                )}
              </Link>
              {user && cartItems.length > 0 && (
                <button
                  onClick={() => { saveCartToSavedOrders(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 flex items-center justify-center text-blue-600"
                >
                  <Save className="h-5 w-5 mr-2" /> Save Cart
                </button>
              )}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full text-center py-2 flex items-center justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" /> Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full text-center py-2 flex items-center justify-center text-destructive"
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-full text-center py-2 flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" /> Login
                </Link>
              )}
              <Button asChild className="w-11/12 mt-2">
                <Link href="/design" onClick={() => setMobileMenuOpen(false)}>
                  Start Designing
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

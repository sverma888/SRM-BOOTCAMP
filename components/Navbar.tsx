'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Store, LogIn, LogOut, User as UserIcon, ChevronDown, Loader2, Settings, Package } from 'lucide-react';
import { signInWithGoogle, signOutUser, onAuthStateChangedListener } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { User } from 'firebase/auth';
import { isAdmin } from '@/lib/isAdmin';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { totalCount, setIsCartDrawerOpen } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Image src="/logo.jpg" alt="Atlas Logo" width={160} height={160} className="object-cover w-14 h-14 rounded-full shadow-sm" priority />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link
                href="/"
                className="text-foreground hover:text-accent transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-muted hover:text-foreground transition-colors"
              >
                Products
              </Link>
              {currentUser && isAdmin(currentUser.email) && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-muted hover:text-accent transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Right Actions: Cart & Auth & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              {/* Cart Icon Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 rounded-lg text-foreground hover:bg-secondary transition-colors focus:outline-none"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {totalCount}
                </span>
              </button>

              {/* Google Authentication */}
              {!loading && (
                currentUser ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors focus:outline-none"
                      aria-label="User account menu"
                    >
                      {currentUser.photoURL ? (
                        <Image
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User profile'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate text-foreground">
                        {currentUser.displayName || 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted" />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl py-1 z-50 text-sm">
                        <div className="px-4 py-2.5 border-b border-border">
                          <p className="font-semibold text-foreground truncate">
                            {currentUser.displayName || 'User'}
                          </p>
                          <p className="text-xs text-muted truncate mt-0.5">
                            {currentUser.email}
                          </p>
                        </div>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-foreground hover:bg-secondary transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-error hover:bg-secondary transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </span>
                    <span className="sm:hidden">
                      {isSigningIn ? 'Signing in...' : 'Sign In'}
                    </span>
                  </button>
                )
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary transition-colors focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-foreground hover:bg-secondary transition-colors"
              >
                Products
              </Link>
              {currentUser && isAdmin(currentUser.email) && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />
    </>
  );
}

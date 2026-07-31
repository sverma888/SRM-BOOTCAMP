'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border text-foreground shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <ShoppingBag className="w-12 h-12 text-muted opacity-50" />
                <p className="text-foreground font-semibold">Your cart is empty</p>
                <p className="text-xs text-muted">Explore products and add them to your cart!</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const product = item.products;
                const imageUrl = product?.image_url || product?.image || '';
                const price = product?.price || 0;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3.5 rounded-xl bg-background border border-border items-center"
                  >
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product?.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {product?.name || 'Product Item'}
                      </h4>
                      <p className="text-xs text-muted mt-1">
                        Qty: {item.quantity} × ₹{price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded bg-secondary text-foreground hover:bg-border transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-foreground px-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded bg-secondary text-foreground hover:bg-border transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-muted hover:text-error transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Subtotal & Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-border bg-background flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted font-medium">Subtotal</span>
                <span className="text-xl font-bold text-foreground">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

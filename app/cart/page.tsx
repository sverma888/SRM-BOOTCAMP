'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-8">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-2xl text-center p-6">
            <ShoppingBag className="w-16 h-16 text-muted mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-sm text-muted mt-1 mb-6">Explore products and add them to your cart!</p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cartItems.map((item) => {
                const product = item.products;
                const imageUrl = product?.image_url || product?.image || '';
                const price = product?.price || 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary border border-border flex-shrink-0">
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

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="text-base font-bold text-foreground truncate">
                        {product?.name || 'Product Item'}
                      </h3>
                      <span className="text-sm font-bold text-foreground">
                        ₹{price.toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 p-1 rounded-lg bg-background border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded bg-secondary text-foreground hover:bg-border transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-foreground px-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded bg-secondary text-foreground hover:bg-border transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-muted hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4 bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="text-lg font-bold text-foreground pb-4 border-b border-border">
                Order Summary
              </h2>

              <div className="flex items-center justify-between text-base">
                <span className="text-muted font-medium">Subtotal</span>
                <span className="text-xl font-bold text-foreground">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

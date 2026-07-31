'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Package, Clock, CheckCircle2, Truck, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
    image_url: string;
    image?: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total_amount: number;
  order_items: OrderItem[];
}

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function MyOrdersPage() {
  const { effectiveUserId } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const activeUserId = effectiveUserId || 'guest_user';
      try {
        const res = await fetch(`/api/orders?user_id=${activeUserId}`);
        const data = await res.json();
        
        if (res.ok && data.orders) {
          setOrders(data.orders);
        } else {
          setError(data.error || 'Failed to load orders.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching your orders.');
      } finally {
        setLoading(false);
      }
    }

    if (effectiveUserId !== undefined) {
      fetchOrders();
    }
  }, [effectiveUserId]);

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex((s) => s.id === status?.toLowerCase()) ?? 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Your Orders.
          </h1>
          <p className="text-base sm:text-lg text-muted font-medium">
            Track, manage, and view your recent purchases.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-error/10 border border-error/20 text-error p-6 rounded-2xl text-center">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface border border-border rounded-[2rem] p-12 text-center flex flex-col items-center shadow-sm">
            <Package className="w-16 h-16 text-muted mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No orders found</h2>
            <p className="text-muted mb-8 max-w-sm">Looks like you haven't made any purchases yet. Discover our premium essentials.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-semibold hover:scale-105 transition-transform"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {orders.map((order, index) => {
              const currentStepIndex = getStatusIndex(order.status);
              
              return (
                <div
                  key={order.id}
                  className="bg-surface border border-border rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div>
                      <p className="text-sm text-muted font-medium mb-1">
                        Order #{order.id.split('-')[0].toUpperCase()}
                      </p>
                      <p className="text-xs text-muted">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-foreground">
                        Total: ₹{(order.total_amount || 0).toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold capitalize text-primary mt-1">
                        {order.status || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Live Tracing Timeline */}
                  <div className="py-10 sm:py-12 mb-4">
                    <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4 sm:px-8">
                      {/* Connecting Line Background */}
                      <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-border rounded-full z-0" />
                      
                      {/* Connecting Line Active */}
                      <div 
                        className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-1000 ease-in-out"
                        style={{ width: `calc(${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}% - 4rem)` }}
                      />

                      {STATUS_STEPS.map((step, stepIdx) => {
                        const isCompleted = stepIdx <= currentStepIndex;
                        const isActive = stepIdx === currentStepIndex;
                        const Icon = step.icon;
                        
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div 
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
                                isCompleted 
                                  ? 'bg-primary border-surface text-primary-foreground shadow-sm' 
                                  : 'bg-surface border-border text-muted'
                              } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider absolute -bottom-8 w-24 text-center transition-colors ${
                              isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <h4 className="text-sm font-bold text-foreground mb-4">Items in this order</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.order_items?.map((item) => {
                        const imageUrl = item.products?.image_url || item.products?.image || '';
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border/50">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border/50">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.products?.name || 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {item.products?.name || 'Unknown Product'}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted font-medium">
                                <span>Qty: {item.quantity}</span>
                                <span className="font-semibold text-foreground">
                                  ₹{(item.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, Package, MapPin, Phone, ArrowRight, ShoppingBag } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order Confirmation #${resolvedParams.id.substring(0, 8)}`,
  };
}

async function getOrderDetails(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/orders?id=${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  } catch (err) {}
  return null;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const resolvedParams = await params;
  const order = await getOrderDetails(resolvedParams.id);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-xl flex flex-col gap-8">
          {/* Header Success Badge */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3.5 rounded-full bg-success/10 text-success border border-success/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Thank You for Your Order!
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-lg">
              Your order has been placed successfully and is now being processed.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-mono font-medium mt-1">
              <span>Order ID: #{resolvedParams.id}</span>
            </div>
          </div>

          {order && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-border py-8">
              {/* Shipping Information */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>Shipping Address</span>
                </h3>
                <div className="text-sm text-muted leading-relaxed">
                  <p className="font-semibold text-foreground">{order.shipping_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}, {order.shipping_postal_code}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.shipping_phone}</span>
                  </p>
                </div>
              </div>

              {/* Order Status & Total */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-accent" />
                  <span>Order Summary</span>
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Status:</span>
                  <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase">
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Total Amount:</span>
                  <span className="text-xl font-bold text-foreground">
                    ₹{Number(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

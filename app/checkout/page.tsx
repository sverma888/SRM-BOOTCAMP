'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import {
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Loader2,
  RotateCcw,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FormErrors {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, currentUser, effectiveUserId } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingState, setLoadingState] = useState<'idle' | 'creating' | 'popup_loading' | 'verifying'>('idle');
  const [createdOrderDetails, setCreatedOrderDetails] = useState<{
    order_id: string;
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key_id: string;
  } | null>(null);

  const [paymentStatusMessage, setPaymentStatusMessage] = useState<{
    type: 'error' | 'warning' | 'success';
    text: string;
  } | null>(null);

  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    if (!value.trim()) return 'This field is required';
    switch (field) {
      case 'name':
        if (!/^[A-Za-z\s]+$/.test(value)) return 'Only alphabets are allowed';
        break;
      case 'address':
        if (!/^[A-Za-z0-9\s]+$/.test(value)) return 'No special characters allowed';
        break;
      case 'city':
        if (!/^[A-Za-z\s]+$/.test(value)) return 'Only alphabets are allowed';
        break;
      case 'postalCode':
        if (!/^\d{1,6}$/.test(value)) return 'Must be numbers, max 6 digits';
        break;
      case 'phone':
        if (!/^\d{10}$/.test(value)) return 'Must be exactly 10 digits';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const nameErr = validateField('name', formData.name);
    if (nameErr) newErrors.name = nameErr;
    const addrErr = validateField('address', formData.address);
    if (addrErr) newErrors.address = addrErr;
    const cityErr = validateField('city', formData.city);
    if (cityErr) newErrors.city = cityErr;
    const zipErr = validateField('postalCode', formData.postalCode);
    if (zipErr) newErrors.postalCode = zipErr;
    const phoneErr = validateField('phone', formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to load Razorpay Checkout SDK dynamically
  const loadRazorpaySDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Open Razorpay Popup for an order
  const openRazorpayPopup = async (
    order_id: string,
    razorpay_order_id: string,
    amount: number,
    currency: string,
    key_id: string
  ) => {
    setLoadingState('popup_loading');
    const isLoaded = await loadRazorpaySDK();

    if (!isLoaded) {
      setPaymentStatusMessage({
        type: 'error',
        text: 'Failed to load Razorpay payment gateway. Please check your internet connection.',
      });
      setLoadingState('idle');
      return;
    }

    const options = {
      key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJm53kBvVvtlPW',
      amount: amount,
      currency: currency || 'INR',
      name: 'Store',
      description: 'Order Payment',
      order_id: razorpay_order_id,
      handler: async function (response: any) {
        await handlePaymentSuccess(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
          order_id
        );
      },
      modal: {
        ondismiss: async function () {
          await handlePaymentDismissed(order_id);
        },
      },
      prefill: {
        name: formData.name,
        email: currentUser?.email || 'customer@example.com',
        contact: formData.phone,
      },
      theme: {
        color: '#4f46e5',
      },
    };

    setLoadingState('idle');
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Handle successful payment verification
  const handlePaymentSuccess = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    order_id: string
  ) => {
    setLoadingState('verifying');
    setPaymentStatusMessage(null);

    try {
      const res = await fetch('/api/verify-razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          order_id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/order-confirmation/${order_id}`);
      } else {
        setPaymentStatusMessage({
          type: 'error',
          text: data.error || 'Payment verification failed. Please try again.',
        });
        setLoadingState('idle');
      }
    } catch (err) {
      setPaymentStatusMessage({
        type: 'error',
        text: 'An error occurred while verifying your payment. Please try again.',
      });
      setLoadingState('idle');
    }
  };

  // Handle popup dismiss or payment incomplete
  const handlePaymentDismissed = async (order_id: string) => {
    try {
      const res = await fetch(`/api/order-status/${order_id}`);
      if (res.ok) {
        const statusData = await res.json();
        if (statusData.status === 'paid') {
          router.push(`/order-confirmation/${order_id}`);
          return;
        }
      }
    } catch (e) {}

    setPaymentStatusMessage({
      type: 'warning',
      text: 'Payment was not completed. You can try again.',
    });
    setLoadingState('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPaymentStatusMessage(null);

    if (!validateForm()) return;

    const activeUserId = effectiveUserId || 'guest_user';

    if (cartItems.length === 0 && !createdOrderDetails) {
      setPaymentStatusMessage({
        type: 'error',
        text: 'Your cart is empty.',
      });
      return;
    }

    if (createdOrderDetails) {
      await openRazorpayPopup(
        createdOrderDetails.order_id,
        createdOrderDetails.razorpay_order_id,
        createdOrderDetails.amount,
        createdOrderDetails.currency,
        createdOrderDetails.key_id
      );
      return;
    }

    setLoadingState('creating');

    try {
      // 1. Create Supabase order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeUserId,
          cart_items: cartItems,
          shipping_name: formData.name,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_phone: formData.phone,
          total_amount: subtotal,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.order_id) {
        setPaymentStatusMessage({
          type: 'error',
          text: orderData.error || 'Failed to create order. Please try again.',
        });
        setLoadingState('idle');
        return;
      }

      const internalOrderId = orderData.order_id;

      // 2. Create Razorpay Order
      const rzpRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: internalOrderId,
          total_amount: subtotal,
        }),
      });

      const rzpData = await rzpRes.json();

      if (!rzpRes.ok || !rzpData.razorpay_order_id) {
        setPaymentStatusMessage({
          type: 'error',
          text: rzpData.error || 'Failed to initialize Razorpay payment.',
        });
        setLoadingState('idle');
        return;
      }

      const orderDetails = {
        order_id: internalOrderId,
        razorpay_order_id: rzpData.razorpay_order_id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        key_id: rzpData.key_id,
      };

      setCreatedOrderDetails(orderDetails);

      // 3. Open Razorpay Popup
      await openRazorpayPopup(
        orderDetails.order_id,
        orderDetails.razorpay_order_id,
        orderDetails.amount,
        orderDetails.currency,
        orderDetails.key_id
      );
    } catch (err) {
      setPaymentStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
      setLoadingState('idle');
    }
  };

  const handleRetryPayment = async () => {
    if (createdOrderDetails) {
      await openRazorpayPopup(
        createdOrderDetails.order_id,
        createdOrderDetails.razorpay_order_id,
        createdOrderDetails.amount,
        createdOrderDetails.currency,
        createdOrderDetails.key_id
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-8">
          Checkout
        </h1>

        {cartItems.length === 0 && !createdOrderDetails ? (
          <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border rounded-2xl text-center p-6">
            <ShoppingBag className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-sm text-muted mt-1 mb-6">Add items to your cart before proceeding to checkout.</p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Shipping Form */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Shipping Details
              </h2>

              {/* Status & Feedback Messages */}
              {paymentStatusMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
                    paymentStatusMessage.type === 'error'
                      ? 'bg-error/10 border-error/20 text-error'
                      : paymentStatusMessage.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-success/10 border-success/20 text-success'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{paymentStatusMessage.text}</span>
                  </div>

                  {createdOrderDetails && (
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity w-fit"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                  )}
                </div>
              )}

              {/* Loading Spinner State */}
              {loadingState !== 'idle' && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  <span>
                    {loadingState === 'creating'
                      ? 'Preparing order details...'
                      : loadingState === 'popup_loading'
                      ? 'Opening Razorpay Payment Gateway...'
                      : 'Verifying payment status...'}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    disabled={Boolean(createdOrderDetails)}
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, name: val });
                      setErrors({ ...errors, name: validateField('name', val) });
                    }}
                    onBlur={(e) => {
                      setErrors({ ...errors, name: validateField('name', e.target.value) });
                    }}
                    placeholder="Jane Doe"
                    className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.name ? 'border-error' : 'border-border'
                    } ${createdOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Shipping Address *
                  </label>
                  <input
                    type="text"
                    disabled={Boolean(createdOrderDetails)}
                    value={formData.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, address: val });
                      setErrors({ ...errors, address: validateField('address', val) });
                    }}
                    onBlur={(e) => {
                      setErrors({ ...errors, address: validateField('address', e.target.value) });
                    }}
                    placeholder="123 Commerce St, Suite 400"
                    className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.address ? 'border-error' : 'border-border'
                    } ${createdOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* City & Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(createdOrderDetails)}
                      value={formData.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, city: val });
                        setErrors({ ...errors, city: validateField('city', val) });
                      }}
                      onBlur={(e) => {
                        setErrors({ ...errors, city: validateField('city', e.target.value) });
                      }}
                      placeholder="New York"
                      className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.city ? 'border-error' : 'border-border'
                      } ${createdOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      disabled={Boolean(createdOrderDetails)}
                      value={formData.postalCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, postalCode: val });
                        setErrors({ ...errors, postalCode: validateField('postalCode', val) });
                      }}
                      onBlur={(e) => {
                        setErrors({ ...errors, postalCode: validateField('postalCode', e.target.value) });
                      }}
                      placeholder="10001"
                      className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.postalCode ? 'border-error' : 'border-border'
                      } ${createdOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.postalCode}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    disabled={Boolean(createdOrderDetails)}
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, phone: val });
                      setErrors({ ...errors, phone: validateField('phone', val) });
                    }}
                    onBlur={(e) => {
                      setErrors({ ...errors, phone: validateField('phone', e.target.value) });
                    }}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.phone ? 'border-error' : 'border-border'
                    } ${createdOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingState !== 'idle'}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loadingState !== 'idle' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : createdOrderDetails ? (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      <span>Reopen Razorpay Payment</span>
                    </>
                  ) : (
                    <>
                      <span>Pay Now with Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <h2 className="text-lg font-bold text-foreground pb-4 border-b border-border">
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {cartItems.map((item) => {
                  const product = item.products;
                  const imageUrl = product?.image_url || product?.image || '';
                  const price = product?.price || 0;

                  return (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary border border-border flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product?.name || 'Item'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {product?.name || 'Item'}
                        </h4>
                        <p className="text-xs text-muted mt-0.5">
                          Qty: {item.quantity} × ₹{price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        ₹{(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-success">Free</span>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

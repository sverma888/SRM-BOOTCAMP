'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/app/api/products/[slug]/route';

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = product.image || product.image_url || '';
  const formattedPrice =
    typeof product.price === 'number'
      ? `₹${product.price.toFixed(2)}`
      : product.price;

  const handleAddToCart = async () => {
    setAdding(true);
    const success = await addToCart(product.id, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb Navigation */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Products</span>
      </Link>

      {/* Main Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-md">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Meta & Actions */}
        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider mb-3 border border-border">
                {product.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {formattedPrice}
            </p>
          </div>

          <div className="border-t border-b border-border py-4">
            <p className="text-base text-muted leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Add to Cart CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>

          {/* Features / Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border text-xs text-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent" />
              <span>Free Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-accent" />
              <span>30-Day Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

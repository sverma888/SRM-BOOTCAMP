'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export interface ProductCardProps {
  id?: string;
  image: string;
  name: string;
  price: number | string;
  slug: string;
}

export default function ProductCard({
  id,
  image,
  name,
  price,
  slug,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const formattedPrice =
    typeof price === 'number'
      ? `₹${price.toFixed(2)}`
      : price.startsWith('₹')
      ? price
      : price.startsWith('$')
      ? price.replace('$', '₹')
      : `₹${price}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id && !slug) return;

    setAdding(true);
    // Use product ID or slug if ID is not passed
    const productId = id || slug;
    const success = await addToCart(productId, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col h-[400px] sm:h-[480px] w-full bg-white rounded-[2.5rem] p-2 sm:p-3 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      {/* Inner Image Container */}
      <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-zinc-900">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-medium">
            No Image
          </div>
        )}

        {/* Top Right Floating Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 hover:scale-105 transition-all z-10 disabled:opacity-50"
          aria-label="Add to cart"
        >
          {added ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
        </button>

        {/* Bottom Dark Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        {/* Product Info - Pinned to bottom */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end">
          <Link href={`/products/${slug}`} className="block mb-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight line-clamp-1 group-hover:text-white/90 transition-colors drop-shadow-md">
              {name}
            </h3>
          </Link>
          
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <span className="text-white/70 text-sm font-medium">Premium</span>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">From</span>
              <p className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
                {formattedPrice}
              </p>
            </div>
          </div>

          <Link
            href={`/products/${slug}`}
            className="w-full flex items-center justify-center py-3.5 sm:py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-gray-50 active:scale-[0.98] transition-all shadow-lg"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Coffee } from "lucide-react";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const unavailable = !product.is_available;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow ${
        unavailable
          ? "cursor-not-allowed border-stone-200 opacity-50"
          : "cursor-pointer border-stone-200 hover:shadow-md"
      }`}
    >
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] w-full bg-stone-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Coffee className="h-10 w-10 text-stone-300" />
          </div>
        )}

        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-medium text-white">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-stone-900">{product.name}</h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <span className="text-sm font-bold text-amber-700">
            R{Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

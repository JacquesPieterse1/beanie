"use client";

import Image from "next/image";
import { Coffee } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const unavailable = !product.is_available;

  return (
    <motion.div
      whileHover={unavailable ? {} : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={unavailable ? undefined : onClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow ${
        unavailable
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:shadow-md"
      }`}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Coffee className="h-10 w-10 text-border" />
          </div>
        )}

        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/60">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-card">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <span className="text-sm font-bold text-primary">
            R{Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

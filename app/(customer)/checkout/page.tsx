"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coffee,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { placeOrder } from "@/lib/actions/place-order";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setLoading(true);

    const result = await placeOrder({ items });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearCart();
    router.push(`/order/${result.orderId}`);
  }

  if (items.length === 0 && !loading) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-border" />
          <h1 className="mt-6 font-heading text-2xl font-bold text-foreground">
            Your cart is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add some items from the menu first.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/menu"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Review Order
          </h1>
          <p className="mt-1 text-muted-foreground">
            Confirm your items before placing the order.
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => {
            const modTotal = item.modifiers.reduce(
              (s, m) => s + m.price_adjustment,
              0
            );
            const unitPrice = item.base_price + modTotal;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.product_image_url ? (
                    <Image
                      src={item.product_image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Coffee className="h-5 w-5 text-border" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.product_name}
                    </h3>
                    {item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.modifiers
                          .map((m) => m.option_label)
                          .join(", ")}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    R{(unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Order Total</span>
            <span className="text-2xl font-bold text-foreground">
              R{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Confirm */}
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="mt-6 w-full rounded-xl py-6 text-base"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </PageTransition>
  );
}

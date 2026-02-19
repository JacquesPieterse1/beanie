"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChefHat,
  Clock,
  Coffee,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion";
import type { Order, OrderItem, OrderStatus, Product } from "@/types/database";
import type { SelectedModifier } from "@/types/database";

const STATUS_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "in_progress", label: "Preparing", icon: ChefHat },
  { key: "complete", label: "Ready for Pickup", icon: PackageCheck },
];

function statusIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

interface OrderTrackerProps {
  initialOrder: Order;
  items: (OrderItem & { product: Product })[];
}

export function OrderTracker({ initialOrder, items }: OrderTrackerProps) {
  const [order, setOrder] = useState(initialOrder);
  const currentIdx = statusIndex(order.status);
  const isCancelled = order.status === "cancelled";

  // Subscribe to realtime updates on this order
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new } as Order));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg">
        {/* Pickup Code */}
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Pickup Code
          </p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4"
          >
            <span className="font-heading text-4xl font-bold tracking-[0.3em] text-primary-foreground">
              {order.pickup_code}
            </span>
          </motion.div>
          <p className="mt-3 text-sm text-muted-foreground">
            Show this code when picking up your order
          </p>
        </div>

        {/* Status Progress */}
        {isCancelled ? (
          <div className="mb-8 flex flex-col items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="font-heading text-lg font-bold text-destructive">
              Order Cancelled
            </p>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentIdx;
                const isActive = idx === currentIdx;

                return (
                  <div key={step.key} className="flex flex-1 items-center">
                    {/* Step circle */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          backgroundColor: isCompleted
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted))",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                      >
                        {isCompleted && idx < currentIdx ? (
                          <Check className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Icon
                            className={`h-5 w-5 ${
                              isCompleted
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}
                      </motion.div>
                      <span
                        className={`mt-2 text-center text-xs font-medium ${
                          isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className="mx-2 h-0.5 flex-1 self-start mt-6 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          animate={{
                            width: idx < currentIdx ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="h-full bg-primary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Order Items
          </h2>
          {items.map((item) => {
            const mods = item.selected_modifiers as SelectedModifier[];
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Coffee className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.product?.name ?? "Product"}
                  </h3>
                  {mods.length > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {mods.map((m) => m.option_label).join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    R{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    x{item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              R{Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Back to menu */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/menu">Back to Menu</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

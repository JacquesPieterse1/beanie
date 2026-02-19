"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  Clock,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { updateOrderStatus } from "@/lib/actions/update-order-status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import type { OrderStatus, SelectedModifier } from "@/types/database";
import type { OrderWithItems } from "./page";

interface OrderQueueProps {
  initialOrders: OrderWithItems[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; badgeClass: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "border-secondary bg-secondary/10",
    badgeClass: "bg-secondary text-secondary-foreground",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "border-primary bg-primary/10",
    badgeClass: "bg-primary text-primary-foreground",
    icon: ChefHat,
  },
  complete: {
    label: "Complete",
    color: "border-success bg-[hsl(var(--success))]/10",
    badgeClass: "bg-success text-white",
    icon: PackageCheck,
  },
};

const STATUS_ORDER: OrderStatus[] = ["pending", "in_progress", "complete"];

export function OrderQueue({ initialOrders }: OrderQueueProps) {
  const [orders, setOrders] = useState(initialOrders);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("staff-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          // Fetch the full order with items
          const { data } = await supabase
            .from("orders")
            .select("*, order_items(*, product:products(*))")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            setOrders((prev) => [data as OrderWithItems, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const updated = payload.new as OrderWithItems;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === updated.id ? { ...o, status: updated.status } : o
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Group by status
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    config: STATUS_CONFIG[status],
    items: orders.filter((o) => o.status === status),
  }));

  const totalActive = orders.filter(
    (o) => o.status === "pending" || o.status === "in_progress"
  ).length;

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Order Queue
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalActive} active order{totalActive !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {grouped.map(({ status, config, items }) => {
          const Icon = config.icon;
          return (
            <div key={status}>
              {/* Column header */}
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {config.label}
                </h2>
                <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>

              {/* Order cards */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      statusConfig={config}
                    />
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                    No {config.label.toLowerCase()} orders
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}

function OrderCard({
  order,
  statusConfig,
}: {
  order: OrderWithItems;
  statusConfig: (typeof STATUS_CONFIG)[string];
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(newStatus: OrderStatus) {
    setLoading(newStatus);
    await updateOrderStatus(order.id, newStatus);
    setLoading(null);
  }

  const timeAgo = getTimeAgo(order.created_at);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`rounded-2xl border-2 bg-card p-4 shadow-sm ${statusConfig.color}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-wider text-foreground">
            #{order.pickup_code}
          </span>
          <Badge className={statusConfig.badgeClass}>
            {statusConfig.label}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-2">
        {order.order_items?.map((item) => {
          const mods = item.selected_modifiers as SelectedModifier[];
          return (
            <div
              key={item.id}
              className="flex items-start justify-between text-sm"
            >
              <div>
                <span className="font-medium text-foreground">
                  {item.quantity}x {item.product?.name ?? "Item"}
                </span>
                {mods.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {mods.map((m) => m.option_label).join(", ")}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                R{(Number(item.unit_price) * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-bold text-foreground">
          R{Number(order.total).toFixed(2)}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {order.status === "pending" && (
          <Button
            onClick={() => handleStatusChange("in_progress")}
            disabled={loading !== null}
            className="flex-1 rounded-xl"
            size="sm"
          >
            {loading === "in_progress" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ChefHat className="mr-1.5 h-4 w-4" />
                Start Order
              </>
            )}
          </Button>
        )}
        {order.status === "in_progress" && (
          <Button
            onClick={() => handleStatusChange("complete")}
            disabled={loading !== null}
            className="flex-1 rounded-xl bg-success hover:bg-success/90"
            size="sm"
          >
            {loading === "complete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <PackageCheck className="mr-1.5 h-4 w-4" />
                Complete
              </>
            )}
          </Button>
        )}
        {order.status === "pending" && (
          <Button
            onClick={() => handleStatusChange("cancelled")}
            disabled={loading !== null}
            variant="outline"
            className="rounded-xl text-destructive hover:bg-destructive/10"
            size="sm"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateStr: string) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

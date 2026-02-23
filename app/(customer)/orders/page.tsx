"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Package, Receipt } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";
import { Skeleton } from "@/components/skeleton";
import type { Order, OrderItem, Product } from "@/types/database";

type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[];
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pending", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  complete: { label: "Complete", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function OrdersPage() {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(*))")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      setOrders((data as OrderWithItems[]) ?? []);
      setLoading(false);
    }

    fetchOrders();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pt-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-12 text-center text-muted-foreground">
        Please sign in to view your orders.
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6 pt-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Previous orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length === 0
              ? "You haven't placed any orders yet"
              : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Your order history will appear here
            </p>
          </div>
        ) : (
          <StaggerContainer className="space-y-3">
            {orders.map((order) => {
              const config = statusConfig[order.status] ?? statusConfig.pending;
              return (
                <StaggerItem key={order.id}>
                  <Link
                    href={`/order/${order.id}`}
                    className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant={config.variant} className="rounded-lg text-xs">
                            {config.label}
                          </Badge>
                          {order.pickup_code && (
                            <span className="text-xs font-mono font-bold text-primary">
                              #{order.pickup_code}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {order.order_items
                            .map(
                              (item) =>
                                `${item.quantity}x ${item.product?.name ?? "Item"}`
                            )
                            .join(", ")}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        R{order.total.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}

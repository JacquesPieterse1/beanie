"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import type { SelectedModifier } from "@/types/database";
import type { OrderWithItems } from "./page";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary text-primary-foreground",
  complete: "bg-success text-white",
  cancelled: "bg-destructive text-destructive-foreground",
};

interface OrderHistoryProps {
  initialOrders: OrderWithItems[];
}

export function OrderHistory({ initialOrders }: OrderHistoryProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return initialOrders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      // Date filters
      if (dateFrom) {
        const orderDate = new Date(order.created_at).toISOString().slice(0, 10);
        if (orderDate < dateFrom) return false;
      }
      if (dateTo) {
        const orderDate = new Date(order.created_at).toISOString().slice(0, 10);
        if (orderDate > dateTo) return false;
      }

      // Search by pickup code
      if (search) {
        const s = search.toLowerCase();
        if (
          !order.pickup_code?.toLowerCase().includes(s) &&
          !order.id.toLowerCase().includes(s)
        )
          return false;
      }

      return true;
    });
  }, [initialOrders, statusFilter, dateFrom, dateTo, search]);

  const totalRevenue = filtered
    .filter((o) => o.status === "complete")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <PageTransition>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Order History
        </h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          {statusFilter === "all" && totalRevenue > 0 && (
            <span className="ml-2 text-success">
              — R{totalRevenue.toFixed(2)} completed revenue
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pickup code..."
            className="rounded-xl pl-10"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-36 rounded-xl text-sm"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-36 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Desktop header */}
        <div className="hidden border-b border-border px-6 py-3 sm:grid sm:grid-cols-[100px_80px_1fr_100px_100px]">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Code
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Items
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Date
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No orders match your filters.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b border-border px-6 py-4 last:border-b-0 sm:grid sm:grid-cols-[100px_80px_1fr_100px_100px] sm:items-center"
              >
                {/* Pickup code */}
                <div>
                  <span className="font-heading text-lg font-bold text-foreground">
                    #{order.pickup_code}
                  </span>
                </div>

                {/* Status */}
                <div className="mt-1 sm:mt-0">
                  <Badge className={STATUS_BADGE[order.status] ?? ""}>
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Items summary */}
                <div className="mt-2 sm:mt-0">
                  {order.order_items?.map((item) => {
                    const mods = item.selected_modifiers as SelectedModifier[];
                    return (
                      <div key={item.id} className="text-sm">
                        <span className="text-foreground">
                          {item.quantity}x {item.product?.name ?? "Item"}
                        </span>
                        {mods.length > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({mods.map((m) => m.option_label).join(", ")})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mt-1 sm:mt-0">
                  <span className="font-semibold text-foreground">
                    R{Number(order.total).toFixed(2)}
                  </span>
                </div>

                {/* Date */}
                <div className="mt-1 sm:mt-0">
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
}

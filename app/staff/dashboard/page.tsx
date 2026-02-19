import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Order, OrderItem, Product } from "@/types/database";
import { OrderQueue } from "./order-queue";

export const revalidate = 0;

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[];
};

export default async function StaffDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .in("status", ["pending", "in_progress", "complete"])
    .order("created_at", { ascending: false });

  return (
    <OrderQueue initialOrders={(orders as OrderWithItems[]) ?? []} />
  );
}

import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Order, OrderItem, Product } from "@/types/database";
import { OrderHistory } from "./order-history";

export const revalidate = 0;

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[];
};

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .order("created_at", { ascending: false })
    .limit(200);

  return <OrderHistory initialOrders={(orders as OrderWithItems[]) ?? []} />;
}

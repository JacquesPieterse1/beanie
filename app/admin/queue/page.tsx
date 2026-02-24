import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OrderQueue } from "@/app/staff/dashboard/order-queue";
import type { OrderWithItems } from "@/app/staff/dashboard/page";

export const revalidate = 0;

export default async function AdminQueuePage() {
  const supabase = await createServerSupabaseClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .in("status", ["pending", "in_progress", "complete"])
    .order("created_at", { ascending: false });

  return <OrderQueue initialOrders={(orders as OrderWithItems[]) ?? []} />;
}

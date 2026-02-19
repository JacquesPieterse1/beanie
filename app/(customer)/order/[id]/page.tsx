import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Order, OrderItem, Product } from "@/types/database";
import { OrderTracker } from "./order-tracker";

export const revalidate = 0;

interface Props {
  params: { id: string };
}

export default async function OrderPage({ params }: Props) {
  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, product:products(*)")
    .eq("order_id", params.id);

  return (
    <OrderTracker
      initialOrder={order as Order}
      items={(orderItems as (OrderItem & { product: Product })[]) ?? []}
    />
  );
}

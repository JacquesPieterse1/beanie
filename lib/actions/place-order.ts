"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { CartItem } from "@/types/database";

function generatePickupCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

interface PlaceOrderInput {
  items: CartItem[];
}

export async function placeOrder({ items }: PlaceOrderInput) {
  if (items.length === 0) {
    return { error: "Cart is empty" };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to place an order" };
  }

  // Calculate total
  const total = items.reduce((sum, item) => {
    const modTotal = item.modifiers.reduce(
      (s, m) => s + m.price_adjustment,
      0
    );
    return sum + (item.base_price + modTotal) * item.quantity;
  }, 0);

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "pending",
      total: Math.round(total * 100) / 100,
      pickup_code: generatePickupCode(),
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order" };
  }

  // Insert order items
  const orderItems = items.map((item) => {
    const modTotal = item.modifiers.reduce(
      (s, m) => s + m.price_adjustment,
      0
    );
    return {
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: Math.round((item.base_price + modTotal) * 100) / 100,
      selected_modifiers: item.modifiers.map((m) => ({
        modifier_id: m.modifier_id,
        modifier_name: m.modifier_name,
        option_id: m.option_id,
        option_label: m.option_label,
        price_adjustment: m.price_adjustment,
      })),
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    // Attempt cleanup
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  return { orderId: order.id };
}

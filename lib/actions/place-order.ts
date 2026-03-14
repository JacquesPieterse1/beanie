"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { CartItem } from "@/types/database";

const CartItemModifierSchema = z.object({
  modifier_id: z.string().uuid(),
  modifier_name: z.string().min(1),
  option_id: z.string().uuid(),
  option_label: z.string().min(1),
  price_adjustment: z.number(),
});

const CartItemSchema = z.object({
  id: z.string(),
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  product_image_url: z.string().nullable(),
  base_price: z.number().nonnegative(),
  modifiers: z.array(CartItemModifierSchema),
  quantity: z.number().int().min(1),
});

const PlaceOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart is empty"),
});

function generatePickupCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes ambiguous 0/O, 1/I/L
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

interface PlaceOrderInput {
  items: CartItem[];
}

export async function placeOrder(input: PlaceOrderInput) {
  const parsed = PlaceOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { items } = parsed.data;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to place an order" };
  }

  // Validate that selected modifiers/options actually belong to the ordered products
  const productModifierPairs = items.flatMap((item) =>
    item.modifiers.map((m) => ({ product_id: item.product_id, modifier_id: m.modifier_id }))
  );

  if (productModifierPairs.length > 0) {
    const uniqueProductIds = [...new Set(items.map((i) => i.product_id))];
    const uniqueModifierIds = [...new Set(items.flatMap((i) => i.modifiers.map((m) => m.modifier_id)))];

    const [{ data: validProductModifiers }, { data: validOptions }] = await Promise.all([
      supabase
        .from("product_modifiers")
        .select("product_id, modifier_id")
        .in("product_id", uniqueProductIds)
        .in("modifier_id", uniqueModifierIds),
      supabase
        .from("modifier_options")
        .select("id, modifier_id")
        .in("modifier_id", uniqueModifierIds),
    ]);

    const validPairSet = new Set(
      (validProductModifiers ?? []).map((r) => `${r.product_id}:${r.modifier_id}`)
    );
    const validOptionSet = new Set(
      (validOptions ?? []).map((r) => `${r.modifier_id}:${r.id}`)
    );

    for (const item of items) {
      for (const m of item.modifiers) {
        if (!validPairSet.has(`${item.product_id}:${m.modifier_id}`)) {
          return { error: "Invalid modifier for product" };
        }
        if (!validOptionSet.has(`${m.modifier_id}:${m.option_id}`)) {
          return { error: "Invalid option for modifier" };
        }
      }
    }
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

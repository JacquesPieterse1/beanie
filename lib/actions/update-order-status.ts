"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { OrderStatus } from "@/types/database";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

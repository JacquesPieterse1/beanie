"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  status: z.enum(["pending", "in_progress", "complete", "cancelled"]),
});

export async function updateOrderStatus(
  orderId: string,
  status: z.infer<typeof UpdateOrderStatusSchema>["status"]
) {
  const parsed = UpdateOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

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

"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { AppRole } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function listUsers() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { users: data };
}

export async function updateUserRole(userId: string, newRole: AppRole) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };
  if (user.id === userId) return { error: "You cannot change your own role" };

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

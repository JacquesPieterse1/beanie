"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  newRole: z.enum(["customer", "staff", "admin"]),
});

export async function listUsers() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { users: data };
}

export async function updateUserRole(userId: string, newRole: z.infer<typeof UpdateUserRoleSchema>["newRole"]) {
  const parsed = UpdateUserRoleSchema.safeParse({ userId, newRole });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

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

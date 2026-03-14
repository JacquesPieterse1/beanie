import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";
import { UserManager } from "./user-manager";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <UserManager
      initialUsers={(users as Profile[]) ?? []}
      currentUserId={user?.id ?? ""}
    />
  );
}

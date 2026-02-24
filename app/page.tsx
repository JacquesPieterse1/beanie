/**
 * The root path `/` is fully handled by middleware role routing.
 * This component should never render for authenticated users.
 * It exists only as a fallback safety net.
 */
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { AppRole } from "@/types/database";

const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  staff: "/staff/dashboard",
  customer: "/menu",
};

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/menu");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as AppRole) ?? "customer";

  redirect(ROLE_HOME[role]);
}

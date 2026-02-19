import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Category, Modifier, Product } from "@/types/database";
import { MenuManager } from "./menu-manager";

export const revalidate = 0;

export interface ProductWithModifierIds extends Product {
  product_modifiers: { modifier_id: string }[];
}

export default async function AdminMenuPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { data: products },
    { data: categories },
    { data: modifiers },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_modifiers(modifier_id)")
      .order("name"),
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("modifiers").select("*").order("name"),
  ]);

  return (
    <MenuManager
      products={(products as ProductWithModifierIds[]) ?? []}
      categories={(categories as Category[]) ?? []}
      modifiers={(modifiers as Modifier[]) ?? []}
    />
  );
}

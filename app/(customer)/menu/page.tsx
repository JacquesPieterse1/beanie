import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Category, Product } from "@/types/database";
import { MenuGrid } from "./menu-grid";
import { PageTransition } from "@/components/motion";

export const revalidate = 0;

export default async function MenuPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("products").select("*").order("name"),
  ]);

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Our Menu
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse our selection and find your perfect pick.
        </p>
      </div>

      <MenuGrid
        categories={(categories as Category[]) ?? []}
        products={(products as Product[]) ?? []}
      />
    </PageTransition>
  );
}

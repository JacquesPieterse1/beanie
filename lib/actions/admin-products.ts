"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface ProductInput {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_available: boolean;
  modifier_ids: string[];
}

export async function createProduct(input: ProductInput) {
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description || null,
      price: input.price,
      image_url: input.image_url || null,
      category_id: input.category_id,
      is_available: input.is_available,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (input.modifier_ids.length > 0) {
    await supabase.from("product_modifiers").insert(
      input.modifier_ids.map((mid) => ({
        product_id: product.id,
        modifier_id: mid,
      }))
    );
  }

  revalidatePath("/admin/menu");
  return { success: true };
}

export async function updateProduct(id: string, input: ProductInput) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description || null,
      price: input.price,
      image_url: input.image_url || null,
      category_id: input.category_id,
      is_available: input.is_available,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Replace modifier links
  await supabase.from("product_modifiers").delete().eq("product_id", id);
  if (input.modifier_ids.length > 0) {
    await supabase.from("product_modifiers").insert(
      input.modifier_ids.map((mid) => ({
        product_id: id,
        modifier_id: mid,
      }))
    );
  }

  revalidatePath("/admin/menu");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/menu");
  return { success: true };
}

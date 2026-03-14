"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().default(""),
  price: z.number().nonnegative("Price must be 0 or greater"),
  image_url: z.string().url("Invalid image URL").or(z.literal("")).optional().default(""),
  category_id: z.string().uuid("Invalid category"),
  is_available: z.boolean(),
  modifier_ids: z.array(z.string().uuid()),
});

const UuidSchema = z.string().uuid("Invalid ID");

type ProductInput = z.infer<typeof ProductSchema>;

export async function createProduct(input: ProductInput) {
  const parsed = ProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      description: data.description || null,
      price: data.price,
      image_url: data.image_url || null,
      category_id: data.category_id,
      is_available: data.is_available,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (data.modifier_ids.length > 0) {
    await supabase.from("product_modifiers").insert(
      data.modifier_ids.map((mid) => ({
        product_id: product.id,
        modifier_id: mid,
      }))
    );
  }

  revalidatePath("/admin/menu");
  return { success: true };
}

export async function updateProduct(id: string, input: ProductInput) {
  const idCheck = UuidSchema.safeParse(id);
  if (!idCheck.success) return { error: "Invalid product ID" };

  const parsed = ProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      description: data.description || null,
      price: data.price,
      image_url: data.image_url || null,
      category_id: data.category_id,
      is_available: data.is_available,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Replace modifier links
  await supabase.from("product_modifiers").delete().eq("product_id", id);
  if (data.modifier_ids.length > 0) {
    await supabase.from("product_modifiers").insert(
      data.modifier_ids.map((mid) => ({
        product_id: id,
        modifier_id: mid,
      }))
    );
  }

  revalidatePath("/admin/menu");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const idCheck = UuidSchema.safeParse(id);
  if (!idCheck.success) return { error: "Invalid product ID" };

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/menu");
  return { success: true };
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/admin-products";
import type { Category, Modifier } from "@/types/database";
import type { ProductWithModifierIds } from "./page";
import { ProductFormDialog } from "./product-form-dialog";

interface MenuManagerProps {
  products: ProductWithModifierIds[];
  categories: Category[];
  modifiers: Modifier[];
}

export function MenuManager({
  products,
  categories,
  modifiers,
}: MenuManagerProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithModifierIds | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  function handleAdd() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function handleEdit(product: ProductWithModifierIds) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteProduct(id);
    setDeleting(null);
  }

  async function handleSubmit(data: {
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_id: string;
    is_available: boolean;
    modifier_ids: string[];
  }) {
    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, data);
      if (res.error) return res.error;
    } else {
      const res = await createProduct(data);
      if (res.error) return res.error;
    }
    setDialogOpen(false);
    return null;
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Menu Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="rounded-xl pl-10"
        />
      </div>

      {/* Product table / cards */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Desktop header */}
        <div className="hidden border-b border-border px-6 py-3 sm:grid sm:grid-cols-[1fr_120px_120px_100px_80px]">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Product
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Price
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {search ? "No products match your search." : "No products yet."}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b border-border px-6 py-4 last:border-b-0 sm:grid sm:grid-cols-[1fr_120px_120px_100px_80px] sm:items-center"
              >
                {/* Name + description */}
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  {product.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="mt-2 sm:mt-0">
                  <span className="text-sm text-muted-foreground">
                    {categoryMap[product.category_id] ?? "—"}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-1 sm:mt-0">
                  <span className="text-sm font-semibold text-foreground">
                    R{Number(product.price).toFixed(2)}
                  </span>
                </div>

                {/* Status */}
                <div className="mt-1 sm:mt-0">
                  {product.is_available ? (
                    <Badge className="bg-success text-white">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-1 sm:mt-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deleting === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        modifiers={modifiers}
        onSubmit={handleSubmit}
      />
    </PageTransition>
  );
}

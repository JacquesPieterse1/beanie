"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Modifier } from "@/types/database";
import type { ProductWithModifierIds } from "./page";
import { cn } from "@/lib/utils";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithModifierIds | null;
  categories: Category[];
  modifiers: Modifier[];
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_id: string;
    is_available: boolean;
    modifier_ids: string[];
  }) => Promise<string | null>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  modifiers,
  onSubmit,
}: ProductFormDialogProps) {
  const isEditing = !!product;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens / product changes
  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setImageUrl(product.image_url ?? "");
        setCategoryId(product.category_id);
        setIsAvailable(product.is_available);
        setSelectedModifiers(
          product.product_modifiers.map((pm) => pm.modifier_id)
        );
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setCategoryId(categories[0]?.id ?? "");
        setIsAvailable(true);
        setSelectedModifiers([]);
      }
      setError(null);
    }
  }, [open, product, categories]);

  function toggleModifier(id: string) {
    setSelectedModifiers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);

    const err = await onSubmit({
      name,
      description,
      price: parsedPrice,
      image_url: imageUrl,
      category_id: categoryId,
      is_available: isAvailable,
      modifier_ids: selectedModifiers,
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isEditing ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Flat White"
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="product-desc">Description</Label>
            <textarea
              id="product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A smooth, velvety coffee..."
              rows={3}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Price + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (R)</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45.00"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="product-image">Image URL</Label>
            <Input
              id="product-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-xl"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setIsAvailable(!isAvailable)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                isAvailable ? "bg-success" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                  isAvailable ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <Label className="cursor-pointer" onClick={() => setIsAvailable(!isAvailable)}>
              Available for ordering
            </Label>
          </div>

          {/* Modifiers */}
          {modifiers.length > 0 && (
            <div className="space-y-2">
              <Label>Modifiers</Label>
              <div className="flex flex-wrap gap-2">
                {modifiers.map((mod) => {
                  const active = selectedModifiers.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModifier(mod.id)}
                      className={cn(
                        "rounded-xl border-2 px-3 py-1.5 text-sm font-medium transition-all",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {mod.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({mod.type})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

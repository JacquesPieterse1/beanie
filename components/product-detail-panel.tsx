"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Coffee, Loader2, Minus, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Product,
  ModifierWithOptions,
  CartItemModifier,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface ProductDetailPanelProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailPanel({
  product,
  onClose,
}: ProductDetailPanelProps) {
  const { addItem } = useCart();
  const [modifiers, setModifiers] = useState<ModifierWithOptions[]>([]);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [loadingModifiers, setLoadingModifiers] = useState(false);

  // Fetch modifiers when product changes
  useEffect(() => {
    if (!product) return;
    setSelections({});
    setQuantity(1);
    setLoadingModifiers(true);

    const supabase = createClient();

    async function fetchModifiers() {
      // Get modifier IDs linked to this product
      const { data: links } = await supabase
        .from("product_modifiers")
        .select("modifier_id")
        .eq("product_id", product!.id);

      if (!links || links.length === 0) {
        setModifiers([]);
        setLoadingModifiers(false);
        return;
      }

      const modifierIds = links.map((l) => l.modifier_id);

      // Fetch modifiers with their options
      const { data } = await supabase
        .from("modifiers")
        .select("*, modifier_options(*)")
        .in("id", modifierIds);

      const mods = (data as ModifierWithOptions[]) ?? [];
      setModifiers(mods);

      // Pre-select first option for required radio modifiers
      const initial: Record<string, string[]> = {};
      mods.forEach((mod) => {
        if (mod.type === "radio" && mod.is_required && mod.modifier_options.length > 0) {
          initial[mod.id] = [mod.modifier_options[0].id];
        }
      });
      setSelections(initial);

      setLoadingModifiers(false);
    }

    fetchModifiers();
  }, [product]);

  if (!product) return null;

  // Compute selected modifiers as flat list
  const selectedModifiers: CartItemModifier[] = modifiers.flatMap((mod) => {
    const selected = selections[mod.id] ?? [];
    return mod.modifier_options
      .filter((opt) => selected.includes(opt.id))
      .map((opt) => ({
        modifier_id: mod.id,
        modifier_name: mod.name,
        option_id: opt.id,
        option_label: opt.label,
        price_adjustment: Number(opt.price_adjustment),
      }));
  });

  const modifierTotal = selectedModifiers.reduce(
    (sum, m) => sum + m.price_adjustment,
    0
  );
  const unitPrice = Number(product.price) + modifierTotal;
  const lineTotal = unitPrice * quantity;

  // Check if all required modifiers are satisfied
  const allRequiredSelected = modifiers
    .filter((m) => m.is_required)
    .every((m) => (selections[m.id] ?? []).length > 0);

  function handleRadioSelect(modifierId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, [modifierId]: [optionId] }));
  }

  function handleCheckboxToggle(modifierId: string, optionId: string) {
    setSelections((prev) => {
      const current = prev[modifierId] ?? [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [modifierId]: next };
    });
  }

  function handleAddToCart() {
    if (!product) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image_url: product.image_url,
      base_price: Number(product.price),
      modifiers: selectedModifiers,
      quantity,
    });
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
      />

          {/* Panel — slides up on mobile, slides in from right on desktop */}
          <motion.div
            key="panel"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card shadow-xl sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-l-3xl sm:rounded-tr-none sm:border-l sm:border-t-0"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Product image */}
            <div className="relative aspect-[16/10] w-full bg-muted sm:aspect-[4/3]">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Coffee className="h-16 w-16 text-border" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Header */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}
                <p className="mt-2 text-lg font-bold text-primary">
                  R{Number(product.price).toFixed(2)}
                </p>
              </div>

              {/* Modifiers */}
              {loadingModifiers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                modifiers.map((mod) => (
                  <div key={mod.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {mod.name}
                      </h3>
                      {mod.is_required && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          Required
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {mod.type === "radio"
                          ? "Pick one"
                          : "Select any"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {mod.modifier_options.map((opt) => {
                        const isSelected = (
                          selections[mod.id] ?? []
                        ).includes(opt.id);

                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              mod.type === "radio"
                                ? handleRadioSelect(mod.id, opt.id)
                                : handleCheckboxToggle(mod.id, opt.id)
                            }
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm transition-all",
                              isSelected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            )}
                          >
                            <span className="font-medium">{opt.label}</span>
                            {Number(opt.price_adjustment) !== 0 && (
                              <span className="text-xs text-primary">
                                {Number(opt.price_adjustment) > 0 ? "+" : ""}
                                R{Number(opt.price_adjustment).toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!allRequiredSelected}
                className="w-full rounded-xl py-6 text-base"
              >
                Add to Cart — R{lineTotal.toFixed(2)}
              </Button>
            </div>
          </motion.div>
    </>
  );
}

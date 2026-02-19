"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Category, Product } from "@/types/database";
import { ProductCard } from "@/components/product-card";
import { CategoryPills } from "@/components/category-pills";
import { ProductDetailPanel } from "@/components/product-detail-panel";
import { StaggerContainer, StaggerItem } from "@/components/motion";

interface MenuGridProps {
  categories: Category[];
  products: Product[];
}

export function MenuGrid({ categories, products }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const grouped = activeCategory
    ? null
    : categories
        .map((cat) => ({
          category: cat,
          items: products.filter((p) => p.category_id === cat.id),
        }))
        .filter((g) => g.items.length > 0);

  const uncategorised = activeCategory
    ? []
    : products.filter((p) => !categories.some((c) => c.id === p.category_id));

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-medium text-muted-foreground">
          No products on the menu yet.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <CategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {activeCategory ? (
          <StaggerContainer
            key={activeCategory}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="space-y-10">
            {grouped?.map(({ category, items }) => (
              <section key={category.id}>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
                  {category.name}
                </h2>
                <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            ))}

            {uncategorised.length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
                  Other
                </h2>
                <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {uncategorised.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailPanel
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

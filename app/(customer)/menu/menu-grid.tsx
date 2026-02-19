"use client";

import type { Category, Product } from "@/types/database";
import { ProductCard } from "@/components/product-card";

interface MenuGridProps {
  categories: Category[];
  products: Product[];
}

export function MenuGrid({ categories, products }: MenuGridProps) {
  // Group products by category
  const grouped = categories
    .map((category) => ({
      category,
      items: products.filter((p) => p.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);

  // Products with no matching category (safety net)
  const uncategorised = products.filter(
    (p) => !categories.some((c) => c.id === p.category_id)
  );

  if (grouped.length === 0 && uncategorised.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium text-stone-400">
          No products on the menu yet.
        </p>
        <p className="mt-1 text-sm text-stone-400">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {grouped.map(({ category, items }) => (
        <section key={category.id}>
          <h2 className="mb-4 text-xl font-bold text-stone-800">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {uncategorised.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-stone-800">Other</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uncategorised.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { Category } from "@/types/database";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryPills({
  categories,
  activeId,
  onSelect,
}: CategoryPillsProps) {
  return (
    <div className="relative -mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <PillButton
          active={activeId === null}
          onClick={() => onSelect(null)}
          label="All"
        />
        {categories.map((cat) => (
          <PillButton
            key={cat.id}
            active={activeId === cat.id}
            onClick={() => onSelect(cat.id)}
            label={cat.name}
          />
        ))}
      </div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {active && (
        <motion.span
          layoutId="activePill"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

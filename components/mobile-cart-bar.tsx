"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface MobileCartBarProps {
  onOpen: () => void;
}

export function MobileCartBar({ onOpen }: MobileCartBarProps) {
  const { itemCount, total } = useCart();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-30 p-4 sm:hidden"
        >
          <button
            onClick={onOpen}
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary">
                  {itemCount}
                </span>
              </div>
              <span className="font-medium">View Cart</span>
            </div>
            <span className="font-bold">R{total.toFixed(2)}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

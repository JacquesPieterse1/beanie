"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

// ── Page transition wrapper ────────────────────────────────
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger container + child ──────────────────────────────
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Animated button wrapper ────────────────────────────────
export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<"button"> & { className?: string }
>(function AnimatedButton(props, ref) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    />
  );
});

// ── Slide-in from right (cart / drawer) ────────────────────
export function SlideInRight({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 z-50"
    >
      {children}
    </motion.div>
  );
}

// ── Slide up from bottom (mobile modals) ───────────────────
export function SlideUp({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// ── Bounce-in from top (new order cards for staff) ─────────
export function BounceIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

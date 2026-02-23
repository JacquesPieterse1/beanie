"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Coffee, LogIn, LogOut, Receipt, ShoppingBag, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileCartBar } from "@/components/mobile-cart-bar";

export function CustomerHeader() {
  const { user, profile, loading, signOut } = useUser();
  const { itemCount } = useCart();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/menu" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              Beanie
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <AnimatedButton
              onClick={() => setCartOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </AnimatedButton>

            {!user &&loading ? (
              <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 rounded-xl text-muted-foreground"
                  >
                    <span className="max-w-[120px] truncate text-sm">
                      Hi, {profile?.full_name?.split(" ")[0] || "there"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem
                    onClick={() => router.push("/account")}
                    className="cursor-pointer gap-2 rounded-lg"
                  >
                    <UserCog className="h-4 w-4" />
                    Account details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/orders")}
                    className="cursor-pointer gap-2 rounded-lg"
                  >
                    <Receipt className="h-4 w-4" />
                    Previous orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="gap-1.5 rounded-xl">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileCartBar onOpen={() => setCartOpen(true)} />
    </>
  );
}

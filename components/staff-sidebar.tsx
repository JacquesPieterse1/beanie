"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Coffee, ClipboardList, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/staff/dashboard", label: "Order Queue", icon: ClipboardList },
];

export function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#1C1210] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Coffee className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-heading text-lg font-bold">Beanie</span>
        <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
          Staff
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/40">
          {profile?.full_name ?? "Staff"}
        </p>
        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">{sidebar}</aside>

      {/* Mobile header bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-[#1C1210] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-primary" />
          <span className="font-heading text-lg font-bold text-white">
            Beanie
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/60"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile slide-out */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 md:hidden">
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}

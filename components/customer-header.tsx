"use client";

import Link from "next/link";
import { Coffee, LogIn, LogOut, User } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

export function CustomerHeader() {
  const { user, profile, loading, signOut } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/menu" className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-amber-700" />
          <span className="text-lg font-bold text-stone-900">Beanie</span>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-stone-100" />
          ) : user ? (
            <>
              <span className="hidden text-sm text-stone-600 sm:inline">
                <User className="mr-1 inline h-4 w-4" />
                {profile?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { AppRole, Profile } from "@/types/database";

interface UseUserReturn {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean; // loading auth, not profile
  signOut: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const supabase = createClient();
  //   let cancelled = false;

  //   async function fetchProfile(userId: string) {
  //     const { data, error } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", userId)
  //       .maybeSingle(); // ✅ doesn’t throw when row doesn’t exist

  //     if (cancelled) return;

  //     if (error) {
  //       // Don’t block UI if profile fails (RLS/missing row)
  //       console.warn("Profile fetch error:", error.message);
  //       setProfile(null);
  //       return;
  //     }
  //     // 🔥 If user exists in auth but no profile row exists
  //     if (!data) {
  //       console.warn("No profile found — signing out");
  //       await supabase.auth.signOut();
  //       setUser(null);
  //       setProfile(null);
  //       return;
  //     }
  //     setProfile((data as Profile) ?? null);
  //   }

  //   async function init() {
  //     const { data } = await supabase.auth.getSession();
  //     if (cancelled) return;

  //     const u = data.session?.user ?? null;

  //     setUser(u);
  //     setLoading(false);

  //     if (u) {
  //       fetchProfile(u.id);
  //     } else {
  //       setProfile(null);
  //     }
  //   }

  //   init();

  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     async (_event, session) => {
  //       const u = session?.user ?? null;
  //       setUser(u);
  //       setLoading(false);

  //       if (u) {
  //         await fetchProfile(u.id);
  //       } else {
  //         setProfile(null);
  //       }
  //     }
  //   );

  //   return () => {
  //     cancelled = true;
  //     authListener.subscription.unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
  const supabase = createClient();
  let cancelled = false;

  async function loadAuth() {
    const { data } = await supabase.auth.getSession();

    if (cancelled) return;

    const sessionUser = data.session?.user ?? null;

    setUser(sessionUser);
    setLoading(false);

    if (!sessionUser) {
      setProfile(null);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionUser.id)
      .single();

    if (cancelled) return;

    setProfile(profileData ?? null);
  }

  loadAuth();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadAuth();
  });

  return () => {
    cancelled = true;
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
  console.log("USER:", user);
}, [user]);

useEffect(() => {
  console.log("PROFILE:", profile);
}, [profile]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signOut,
  };
}
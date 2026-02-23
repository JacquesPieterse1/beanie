"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/motion";
import { Skeleton } from "@/components/skeleton";

export default function AccountPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [fullName, setFullName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Use local state if edited, otherwise fall back to profile
  const displayName = fullName ?? profile?.full_name ?? "";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: displayName })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile", { description: error.message });
    } else {
      toast.success("Profile updated");
    }
    setSaving(false);
  }

  if (userLoading) {
    return (
      <div className="mx-auto max-w-md space-y-6 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-12 text-center text-muted-foreground">
        Please sign in to view your account.
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-md space-y-8 pt-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Account details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile information
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email ?? ""}
              disabled
              className="rounded-xl bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              value={displayName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Member since</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(profile?.created_at ?? user.created_at).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="gap-2 rounded-xl"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </form>
      </div>
    </PageTransition>
  );
}

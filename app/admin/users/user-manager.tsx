"use client";

import { useState, useTransition, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { updateUserRole } from "@/lib/actions/admin-users";
import { toast } from "sonner";
import type { AppRole, Profile } from "@/types/database";

const ROLES: AppRole[] = ["customer", "staff", "admin"];

const ROLE_BADGE: Record<AppRole, string> = {
  customer: "bg-secondary text-secondary-foreground",
  staff: "bg-primary text-primary-foreground",
  admin: "bg-destructive text-destructive-foreground",
};

const ROLE_OPTIONS: { value: AppRole | "all"; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "customer", label: "Customer" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

interface UserManagerProps {
  initialUsers: Profile[];
  currentUserId: string;
}

export function UserManager({ initialUsers, currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [pending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !u.full_name?.toLowerCase().includes(s) &&
          !u.id.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  function handleRoleChange(userId: string, newRole: AppRole) {
    setUpdatingId(userId);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success("Role updated");
      }
      setUpdatingId(null);
    });
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          User Management
        </h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="rounded-xl pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as AppRole | "all")}
          className="flex h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Desktop header */}
        <div className="hidden border-b border-border px-6 py-3 sm:grid sm:grid-cols-[1fr_120px_160px_120px]">
          {["Name", "Role", "Joined", "Change Role"].map((h) => (
            <span
              key={h}
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No users match your filters.
          </div>
        ) : (
          filtered.map((user) => {
            const isSelf = user.id === currentUserId;
            const isUpdating = updatingId === user.id;

            return (
              <div
                key={user.id}
                className="border-b border-border px-6 py-4 last:border-b-0 sm:grid sm:grid-cols-[1fr_120px_160px_120px] sm:items-center"
              >
                {/* Name */}
                <div>
                  <p className="font-medium text-foreground">
                    {user.full_name ?? "—"}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.id}</p>
                </div>

                {/* Current role badge */}
                <div className="mt-2 sm:mt-0">
                  <Badge className={ROLE_BADGE[user.role]}>
                    {user.role}
                  </Badge>
                </div>

                {/* Joined date */}
                <div className="mt-1 sm:mt-0 text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                {/* Role selector */}
                <div className="mt-2 sm:mt-0">
                  {isSelf ? (
                    <span className="text-xs text-muted-foreground">
                      Cannot change own role
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      disabled={isUpdating || (pending && isUpdating)}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as AppRole)
                      }
                      className="flex h-8 w-full rounded-lg border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
}

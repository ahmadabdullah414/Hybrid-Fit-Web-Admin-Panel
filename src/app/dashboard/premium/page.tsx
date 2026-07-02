"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import SearchBar from "@/components/SearchBar";
import UserTable from "@/components/UserTable";

export default function PremiumUsersPage() {
  const { users, loading } = useAdminData();
  const [query, setQuery] = useState("");

  const premiumUsers = useMemo(() => users.filter((u) => u.isPremium), [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return premiumUsers;
    return premiumUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [premiumUsers, query]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Premium Users</h1>
        <p className="mt-1 text-sm text-text-muted">Members with premium features unlocked — {premiumUsers.length} total.</p>
      </div>

      <div className="max-w-md">
        <SearchBar value={query} onChange={setQuery} placeholder="Search premium members…" />
      </div>

      {loading ? (
        <div className="animate-pulse rounded-2xl border border-border bg-surface/80 p-6">
          <div className="h-40 rounded-lg bg-surface-elevated" />
        </div>
      ) : filtered.length === 0 && premiumUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
          No premium members yet — they&apos;ll show up here once premium features ship.
        </div>
      ) : (
        <UserTable users={filtered} />
      )}
    </div>
  );
}

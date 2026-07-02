"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import SearchBar from "@/components/SearchBar";
import UserTable from "@/components/UserTable";

export default function UsersPage() {
  const { users, loading } = useAdminData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Users</h1>
        <p className="mt-1 text-sm text-text-muted">Every registered member — {users.length} total.</p>
      </div>

      <div className="max-w-md">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <UserTable users={filtered} />
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface/80 p-6">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-surface-elevated" />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import SearchBar from "@/components/SearchBar";
import UserTable from "@/components/UserTable";
import AddUserModal from "@/components/AddUserModal";

export default function UsersPage() {
  const { users, loading } = useAdminData();
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Users</h1>
          <p className="mt-1 text-sm text-text-muted">Every registered member — {users.length} total.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          <PlusIcon />
          Add New User
        </button>
      </div>

      <div className="max-w-md">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {loading ? <TableSkeleton /> : <UserTable users={filtered} />}

      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onCreated={() => {}} />}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
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

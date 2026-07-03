"use client";

import { useMemo } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import StatCard from "@/components/StatCard";
import UserTable from "@/components/UserTable";

export default function DashboardPage() {
  const { users, inboxEntries, loading, unreadTotal } = useAdminData();

  const premiumCount = useMemo(() => users.filter((u) => u.isPremium).length, [users]);
  const activeConversations = useMemo(() => inboxEntries.filter((e) => e.hasConversation).length, [inboxEntries]);
  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
        .slice(0, 6),
    [users],
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">Live overview of Hybrid Fit&apos;s members and conversations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={loading ? "—" : users.length} icon={<UsersGlyph />} accent href="/dashboard/users" />
        <StatCard label="Premium Users" value={loading ? "—" : premiumCount} icon={<CrownGlyph />} href="/dashboard/premium" />
        <StatCard
          label="Active Conversations"
          value={loading ? "—" : activeConversations}
          icon={<ChatGlyph />}
          href="/dashboard/inbox"
        />
        <StatCard
          label="Unread Messages"
          value={loading ? "—" : unreadTotal}
          icon={<BellGlyph />}
          href="/dashboard/inbox?filter=unread"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Newest Members</h2>
          <a href="/dashboard/users" className="text-sm font-medium text-primary hover:underline">
            View all →
          </a>
        </div>
        {loading ? (
          <div className="animate-pulse rounded-2xl border border-border bg-surface/80 p-6">
            <div className="h-40 rounded-lg bg-surface-elevated" />
          </div>
        ) : (
          <UserTable users={recentUsers} />
        )}
      </div>
    </div>
  );
}

function UsersGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.2c2.4.3 4.2 2.3 4.2 5.3" />
    </svg>
  );
}
function CrownGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8l4 3 5-6 5 6 4-3-1.6 10H4.6L3 8z" strokeLinejoin="round" />
    </svg>
  );
}
function ChatGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 12a8 8 0 10-3.5 6.6L21 20l-1.2-3.6A7.9 7.9 0 0021 12z" />
    </svg>
  );
}
function BellGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

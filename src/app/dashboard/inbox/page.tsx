"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminData } from "@/hooks/useAdminData";
import { setPinned } from "@/lib/chat";
import { MAX_PINNED } from "@/lib/inbox";
import SearchBar from "@/components/SearchBar";
import Avatar from "@/components/Avatar";
import type { AdminInboxEntry } from "@/lib/types";

function formatTime(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const { inboxEntries, loading } = useAdminData();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inboxEntries;
    return inboxEntries.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [inboxEntries, query]);

  const pinnedCount = useMemo(() => inboxEntries.filter((e) => e.pinned).length, [inboxEntries]);

  async function handleTogglePin(e: React.MouseEvent, entry: AdminInboxEntry) {
    e.stopPropagation();
    if (!entry.pinned && pinnedCount >= MAX_PINNED) {
      setToast("You can only pin up to 3 users — unpin one first.");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    await setPinned(entry.uid, !entry.pinned);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Users Inbox</h1>
        <p className="mt-1 text-sm text-text-muted">Every member&apos;s conversation with the owner.</p>
      </div>

      <div className="max-w-md">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {toast && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning">{toast}</div>
      )}

      {loading ? (
        <div className="animate-pulse rounded-2xl border border-border bg-surface/80 p-6">
          <div className="h-64 rounded-lg bg-surface-elevated" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
          {inboxEntries.length === 0 ? "Registered members will show up here." : "No matches for that search."}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((entry) => (
            <button
              key={entry.uid}
              onClick={() => router.push(`/dashboard/inbox/${entry.uid}`)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                entry.pinned
                  ? "border-warning/40 bg-warning/10"
                  : entry.unreadForAdmin > 0
                    ? "border-primary/50 bg-primary-muted"
                    : "border-border bg-surface/80 hover:bg-surface-elevated/60"
              }`}
            >
              <Avatar url={entry.photoUrl} name={entry.name || entry.email} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-semibold text-text-primary">{entry.name || "Unnamed member"}</p>
                  {entry.pinned && <PinIcon filled className="text-warning" />}
                </div>
                <p className="truncate text-xs text-text-muted">{entry.email}</p>
                <p className="mt-1 flex items-center gap-1 truncate text-sm text-text-secondary">
                  {entry.hasConversation && entry.lastMessageImportant && <StarIcon className="text-warning" />}
                  <span className={entry.hasConversation ? "" : "italic text-text-muted"}>
                    {entry.hasConversation ? entry.lastMessage : "No messages yet"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  onClick={(e) => handleTogglePin(e, entry)}
                  className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-elevated"
                  title={entry.pinned ? "Unpin" : "Pin"}
                >
                  <PinIcon filled={entry.pinned} className={entry.pinned ? "text-warning" : ""} />
                </button>
                {entry.hasConversation && <span className="text-xs text-text-muted">{formatTime(entry.lastMessageAt)}</span>}
                {entry.unreadForAdmin > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-white">
                    {entry.unreadForAdmin}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PinIcon({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 2l1.5 5.5L19 9l-5 4 1 6-5-3-5 3 1-6-5-4 5.5-1.5L12 2z" />
    </svg>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`}>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" />
    </svg>
  );
}

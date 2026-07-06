"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getLastSeenAt, markAllSeen } from "@/lib/notificationSeen";
import type { AdminNotification } from "@/lib/types";

// Same red-dot-when-unread behavior as the Home screen's bell in the app —
// opening the dropdown marks everything currently listed as seen.
export default function NotificationBell({ notifications }: { notifications: AdminNotification[] }) {
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(getLastSeenAt);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = notifications.some((n) => n.createdAt.getTime() > lastSeen);
  const sorted = [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  function handleToggle() {
    setOpen((v) => !v);
    if (!open) {
      markAllSeen();
      setLastSeen(Date.now());
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition hover:bg-surface-elevated"
        title="Notifications"
      >
        <BellIcon />
        {unread && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-30 w-80 max-h-96 overflow-y-auto rounded-2xl border border-border bg-surface-elevated shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-text-primary">Notify Users updates</p>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/notify-users");
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage →
            </button>
          </div>
          {sorted.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-muted">No updates sent yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {sorted.slice(0, 10).map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3">
                  {n.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    {n.title && <p className="truncate text-sm font-semibold text-text-primary">{n.title}</p>}
                    {n.description && <p className="line-clamp-2 text-xs text-text-secondary">{n.description}</p>}
                    <p className="mt-1 text-[10.5px] text-text-muted">
                      {n.createdAt.toLocaleDateString([], { month: "short", day: "numeric" })},{" "}
                      {n.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

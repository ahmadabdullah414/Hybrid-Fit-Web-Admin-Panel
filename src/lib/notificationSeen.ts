import type { AdminNotification } from "./types";

// Per-browser "have I seen the latest updates" state for the admin panel's
// own notification bell — mirrors NotificationLocalStore.lastSeenAt/hasUnread
// on the Flutter side, just backed by localStorage instead of Hive.
const LAST_SEEN_KEY = "hf_admin_notif_last_seen";

export function getLastSeenAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LAST_SEEN_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function markAllSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
}

export function hasUnread(notifications: AdminNotification[]): boolean {
  const lastSeen = getLastSeenAt();
  return notifications.some((n) => n.createdAt.getTime() > lastSeen);
}

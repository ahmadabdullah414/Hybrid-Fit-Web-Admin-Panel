import type { AdminInboxEntry, OwnerConversation, UserProfile } from "./types";

/**
 * Merges every member with their conversation metadata (if any) — mirrors
 * adminInboxEntriesProvider in the Flutter app: pinned threads float to the
 * top (max 3, enforced by the caller before writing), each group ordered by
 * most recent message first, members with no conversation yet sorted
 * alphabetically at the end.
 */
export function buildInboxEntries(users: UserProfile[], conversations: OwnerConversation[]): AdminInboxEntry[] {
  const conversationByUid = new Map(conversations.map((c) => [c.memberUid, c]));

  const entries: AdminInboxEntry[] = users.map((u) => {
    const conv = conversationByUid.get(u.uid);
    return {
      uid: u.uid,
      name: u.name,
      email: u.email,
      photoUrl: u.photoUrl,
      lastMessage: conv?.lastMessage ?? "",
      lastMessageAt: conv?.lastMessageAt ?? null,
      unreadForAdmin: conv?.unreadForAdmin ?? 0,
      lastMessageImportant: conv?.lastMessageImportant ?? false,
      pinned: conv?.pinnedByAdmin ?? false,
      hasConversation: conv?.lastMessageAt != null,
    };
  });

  function byRecency(a: AdminInboxEntry, b: AdminInboxEntry): number {
    const at = a.lastMessageAt?.getTime();
    const bt = b.lastMessageAt?.getTime();
    if (at == null && bt == null) return a.name.localeCompare(b.name);
    if (at == null) return 1;
    if (bt == null) return -1;
    return bt - at;
  }

  const pinned = entries.filter((e) => e.pinned).sort(byRecency);
  const rest = entries.filter((e) => !e.pinned).sort(byRecency);
  return [...pinned, ...rest];
}

export const MAX_PINNED = 3;

"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { subscribeUsers } from "@/lib/users";
import { subscribeConversations } from "@/lib/chat";
import { subscribeNotifications } from "@/lib/notifications";
import { buildInboxEntries } from "@/lib/inbox";
import type { UserProfile, OwnerConversation, AdminInboxEntry, AdminNotification } from "@/lib/types";

interface AdminDataValue {
  users: UserProfile[];
  conversations: OwnerConversation[];
  inboxEntries: AdminInboxEntry[];
  notifications: AdminNotification[];
  loading: boolean;
  unreadTotal: number;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

/** Firestore listeners (users, owner_chat, admin_notifications) shared by every dashboard page. */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [conversations, setConversations] = useState<OwnerConversation[] | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[] | null>(null);

  useEffect(() => {
    const unsubUsers = subscribeUsers(setUsers);
    const unsubConversations = subscribeConversations(setConversations);
    const unsubNotifications = subscribeNotifications(setNotifications);
    return () => {
      unsubUsers();
      unsubConversations();
      unsubNotifications();
    };
  }, []);

  const value = useMemo<AdminDataValue>(() => {
    const safeUsers = users ?? [];
    const safeConversations = conversations ?? [];
    const inboxEntries = buildInboxEntries(safeUsers, safeConversations);
    const unreadTotal = safeConversations.reduce((sum, c) => sum + c.unreadForAdmin, 0);
    return {
      users: safeUsers,
      conversations: safeConversations,
      inboxEntries,
      notifications: notifications ?? [],
      loading: users === null || conversations === null,
      unreadTotal,
    };
  }, [users, conversations, notifications]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}

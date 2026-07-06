import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AdminNotification } from "./types";

const ADMIN_NOTIFICATIONS_COLLECTION = "admin_notifications";

export interface NotificationInput {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
}

// Same epoch-millis-number `createdAt` convention as the Flutter app (see
// lib/features/home/data/admin_notification_repository.dart) — not a
// Firestore Timestamp, so both platforms sort identically.
function notificationFromDoc(d: QueryDocumentSnapshot<DocumentData>): AdminNotification {
  const data = d.data();
  return {
    id: d.id,
    title: (data.title as string) ?? null,
    description: (data.description as string) ?? null,
    imageUrl: (data.imageUrl as string) ?? null,
    linkUrl: (data.linkUrl as string) ?? null,
    createdAt: new Date((data.createdAt as number) ?? 0),
  };
}

/** Oldest first — matches the mobile admin screen's "newest at the bottom" list. */
export function subscribeNotifications(callback: (notifications: AdminNotification[]) => void): () => void {
  const q = query(collection(db, ADMIN_NOTIFICATIONS_COLLECTION), orderBy("createdAt"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(notificationFromDoc)));
}

export async function addNotification(input: NotificationInput): Promise<void> {
  await addDoc(collection(db, ADMIN_NOTIFICATIONS_COLLECTION), {
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    createdAt: Date.now(),
  });
}

export async function updateNotification(id: string, input: NotificationInput): Promise<void> {
  await updateDoc(doc(db, ADMIN_NOTIFICATIONS_COLLECTION, id), {
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, ADMIN_NOTIFICATIONS_COLLECTION, id));
}

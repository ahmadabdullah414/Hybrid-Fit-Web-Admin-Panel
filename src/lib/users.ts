import {
  collection,
  onSnapshot,
  doc,
  writeBatch,
  getDocs,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db, ADMIN_EMAIL } from "./firebase";
import type { UserProfile } from "./types";

const USERS_COLLECTION = "users";
const OWNER_CHAT_COLLECTION = "owner_chat";

function fromDoc(d: QueryDocumentSnapshot<DocumentData>): UserProfile {
  const data = d.data();
  const createdAtRaw = data.createdAt;
  return {
    uid: d.id,
    email: (data.email as string) ?? "",
    name: (data.name as string) ?? "",
    age: typeof data.age === "number" ? data.age : null,
    gender: data.gender === "female" ? "female" : "male",
    heightCm: typeof data.heightCm === "number" ? data.heightCm : null,
    weightKg: typeof data.weightKg === "number" ? data.weightKg : null,
    photoUrl: (data.photoUrl as string) ?? null,
    profileComplete: Boolean(data.profileComplete),
    createdAt: createdAtRaw instanceof Timestamp ? createdAtRaw.toDate() : null,
    isPremium: Boolean(data.isPremium),
  };
}

/** Live subscription to every member profile except the admin's own account. */
export function subscribeUsers(callback: (users: UserProfile[]) => void): () => void {
  return onSnapshot(collection(db, USERS_COLLECTION), (snap) => {
    const users = snap.docs.map(fromDoc).filter((u) => u.email.toLowerCase() !== ADMIN_EMAIL);
    callback(users);
  });
}

/**
 * Deletes a member's Firestore footprint (profile + owner-chat thread) —
 * mirrors AccountCleanupService.deleteUserData in the Flutter app exactly.
 * Note: this cannot remove their Firebase Auth login itself — that requires
 * the Admin SDK, which isn't available client-side (same limitation as the
 * mobile admin panel's delete action).
 */
export async function deleteUserData(uid: string): Promise<void> {
  const batch = writeBatch(db);
  const messagesSnap = await getDocs(collection(db, OWNER_CHAT_COLLECTION, uid, "messages"));
  messagesSnap.forEach((m) => batch.delete(m.ref));
  batch.delete(doc(db, OWNER_CHAT_COLLECTION, uid));
  batch.delete(doc(db, USERS_COLLECTION, uid));
  await batch.commit();
}

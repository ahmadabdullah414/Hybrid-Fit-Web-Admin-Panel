import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { OwnerConversation, OwnerChatMessage } from "./types";

const OWNER_CHAT_COLLECTION = "owner_chat";

function conversationFromDoc(d: QueryDocumentSnapshot<DocumentData>): OwnerConversation {
  const data = d.data();
  return {
    memberUid: d.id,
    memberName: (data.memberName as string) ?? "",
    memberEmail: (data.memberEmail as string) ?? "",
    memberPhotoUrl: (data.memberPhotoUrl as string) ?? null,
    lastMessage: (data.lastMessage as string) ?? "",
    lastMessageAt: data.lastMessageAt instanceof Timestamp ? data.lastMessageAt.toDate() : null,
    lastSenderId: (data.lastSenderId as string) ?? "",
    unreadForAdmin: typeof data.unreadForAdmin === "number" ? data.unreadForAdmin : 0,
    unreadForMember: typeof data.unreadForMember === "number" ? data.unreadForMember : 0,
    lastMessageImportant: Boolean(data.lastMessageImportant),
    pinnedByAdmin: Boolean(data.pinnedByAdmin),
  };
}

function messageFromDoc(d: QueryDocumentSnapshot<DocumentData>): OwnerChatMessage {
  const data = d.data();
  return {
    id: d.id,
    senderId: (data.senderId as string) ?? "",
    text: (data.text as string) ?? "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    isRead: Boolean(data.isRead),
    isImportant: Boolean(data.isImportant),
    isEdited: Boolean(data.isEdited),
  };
}

/** Every member conversation (including pinned-but-empty threads). */
export function subscribeConversations(callback: (conversations: OwnerConversation[]) => void): () => void {
  return onSnapshot(collection(db, OWNER_CHAT_COLLECTION), (snap) => {
    callback(snap.docs.map(conversationFromDoc));
  });
}

export function subscribeMessages(memberUid: string, callback: (messages: OwnerChatMessage[]) => void): () => void {
  const messagesRef = collection(db, OWNER_CHAT_COLLECTION, memberUid, "messages");
  return onSnapshot(messagesRef, (snap) => {
    const messages = snap.docs.map(messageFromDoc).sort((a, b) => {
      const at = a.createdAt?.getTime() ?? 0;
      const bt = b.createdAt?.getTime() ?? 0;
      return bt - at;
    });
    callback(messages);
  });
}

export interface SendMessageInput {
  memberUid: string;
  senderId: string;
  senderIsAdmin: boolean;
  text: string;
  isImportant?: boolean;
  memberName?: string | null;
  memberEmail?: string | null;
  memberPhotoUrl?: string | null;
}

export async function sendMessage(input: SendMessageInput): Promise<void> {
  const { memberUid, senderId, senderIsAdmin, text, isImportant = false, memberName, memberEmail, memberPhotoUrl } = input;
  const now = serverTimestamp();
  const messagesRef = collection(db, OWNER_CHAT_COLLECTION, memberUid, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: now,
    isRead: false,
    isImportant,
    isEdited: false,
  });

  const conversationData: Record<string, unknown> = {
    memberUid,
    lastMessage: text,
    lastMessageAt: now,
    lastMessageImportant: isImportant,
    lastSenderId: senderId,
  };
  if (memberName) conversationData.memberName = memberName;
  if (memberEmail) conversationData.memberEmail = memberEmail;
  if (memberPhotoUrl) conversationData.memberPhotoUrl = memberPhotoUrl;
  if (senderIsAdmin) conversationData.unreadForMember = increment(1);
  else conversationData.unreadForAdmin = increment(1);

  await setDoc(doc(db, OWNER_CHAT_COLLECTION, memberUid), conversationData, { merge: true });
}

/** Resets the viewer's unread counter and flips `isRead` on the other party's messages. */
export async function markRead(memberUid: string, viewerUid: string): Promise<void> {
  const isViewerMember = viewerUid === memberUid;
  const unreadField = isViewerMember ? "unreadForMember" : "unreadForAdmin";
  await setDoc(doc(db, OWNER_CHAT_COLLECTION, memberUid), { [unreadField]: 0 }, { merge: true });

  const messagesRef = collection(db, OWNER_CHAT_COLLECTION, memberUid, "messages");
  const unreadSnap = await getDocs(query(messagesRef, where("isRead", "==", false)));
  const toMark = unreadSnap.docs.filter((m) => m.data().senderId !== viewerUid);
  if (toMark.length === 0) return;

  const batch = writeBatch(db);
  toMark.forEach((m) => batch.update(m.ref, { isRead: true }));
  await batch.commit();
}

export async function editMessage(memberUid: string, messageId: string, newText: string): Promise<void> {
  await updateDoc(doc(db, OWNER_CHAT_COLLECTION, memberUid, "messages", messageId), {
    text: newText,
    isEdited: true,
  });
}

export async function deleteMessage(memberUid: string, messageId: string): Promise<void> {
  await deleteDoc(doc(db, OWNER_CHAT_COLLECTION, memberUid, "messages", messageId));
}

export async function toggleImportant(memberUid: string, messageId: string, value: boolean): Promise<void> {
  await updateDoc(doc(db, OWNER_CHAT_COLLECTION, memberUid, "messages", messageId), { isImportant: value });
}

export async function setPinned(memberUid: string, value: boolean): Promise<void> {
  await setDoc(doc(db, OWNER_CHAT_COLLECTION, memberUid), { pinnedByAdmin: value }, { merge: true });
}

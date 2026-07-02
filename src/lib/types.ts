export type Gender = "male" | "female";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number | null;
  gender: Gender;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string | null;
  profileComplete: boolean;
  createdAt: Date | null;
  isPremium: boolean;
}

export interface OwnerConversation {
  memberUid: string;
  memberName: string;
  memberEmail: string;
  memberPhotoUrl: string | null;
  lastMessage: string;
  lastMessageAt: Date | null;
  lastSenderId: string;
  unreadForAdmin: number;
  unreadForMember: number;
  lastMessageImportant: boolean;
  pinnedByAdmin: boolean;
}

export interface OwnerChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date | null;
  isRead: boolean;
  isImportant: boolean;
  isEdited: boolean;
}

export interface AdminInboxEntry {
  uid: string;
  name: string;
  email: string;
  photoUrl: string | null;
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadForAdmin: number;
  lastMessageImportant: boolean;
  pinned: boolean;
  hasConversation: boolean;
}

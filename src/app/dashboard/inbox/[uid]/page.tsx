"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { subscribeMessages, sendMessage, markRead, editMessage, deleteMessage, toggleImportant } from "@/lib/chat";
import Avatar from "@/components/Avatar";
import type { OwnerChatMessage } from "@/lib/types";

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function dateLabel(date: Date): string {
  const now = new Date();
  const diffDays = Math.round((new Date(now.toDateString()).getTime() - new Date(date.toDateString()).getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ChatThreadPage() {
  const params = useParams<{ uid: string }>();
  const memberUid = params.uid;
  const router = useRouter();
  const authState = useAdminAuth();
  const { inboxEntries } = useAdminData();

  const entry = useMemo(() => inboxEntries.find((e) => e.uid === memberUid), [inboxEntries, memberUid]);

  const [messages, setMessages] = useState<OwnerChatMessage[] | null>(null);
  const [text, setText] = useState("");
  const [pendingImportant, setPendingImportant] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeMessages(memberUid, setMessages);
    return unsub;
  }, [memberUid]);

  const adminUid = authState.status === "admin" ? authState.user.uid : null;

  useEffect(() => {
    if (!adminUid || !messages) return;
    const hasUnread = messages.some((m) => !m.isRead && m.senderId !== adminUid);
    if (hasUnread) markRead(memberUid, adminUid).catch(() => {});
  }, [messages, adminUid, memberUid]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !adminUid) return;
    setText("");
    const wasImportant = pendingImportant;
    setPendingImportant(false);
    try {
      await sendMessage({
        memberUid,
        senderId: adminUid,
        senderIsAdmin: true,
        text: trimmed,
        isImportant: wasImportant,
      });
    } catch (err) {
      console.error("Send message error", err);
    }
  }

  const timeline = useMemo(() => {
    if (!messages) return [];
    const items: (OwnerChatMessage | Date)[] = [];
    for (let i = 0; i < messages.length; i++) {
      items.push(messages[i]);
      const createdAt = messages[i].createdAt;
      if (!createdAt) continue;
      const isLast = i === messages.length - 1;
      const next = messages[i + 1]?.createdAt;
      if (isLast || !next || !isSameDay(createdAt, next)) items.push(createdAt);
    }
    return items;
  }, [messages]);

  const displayName = entry?.name || entry?.email || "Member";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 backdrop-blur">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button onClick={() => router.push("/dashboard/inbox")} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-elevated">
          <BackIcon />
        </button>
        <Avatar url={entry?.photoUrl ?? null} name={displayName} size={38} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">{displayName}</p>
          {entry?.email && <p className="truncate text-xs text-text-muted">{entry.email}</p>}
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col-reverse gap-3 overflow-y-auto px-5 py-4">
        {messages === null ? (
          <div className="m-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        ) : messages.length === 0 ? (
          <div className="m-auto flex flex-col items-center gap-3 text-center">
            <Avatar url={entry?.photoUrl ?? null} name={displayName} size={72} />
            <p className="text-lg font-bold text-text-primary">{displayName}</p>
            <p className="max-w-xs text-sm text-text-muted">Say hello — messages appear here instantly.</p>
          </div>
        ) : (
          [...timeline].reverse().map((item, i) =>
            item instanceof Date ? (
              <div key={`date-${i}`} className="my-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-text-muted">{dateLabel(item)}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            ) : (
              <MessageBubble
                key={item.id}
                message={item}
                isMe={item.senderId === adminUid}
                menuOpen={menuFor === item.id}
                onToggleMenu={() => setMenuFor(menuFor === item.id ? null : item.id)}
                isEditing={editingId === item.id}
                editText={editText}
                onEditTextChange={setEditText}
                onStartEdit={() => {
                  setEditingId(item.id);
                  setEditText(item.text);
                  setMenuFor(null);
                }}
                onSaveEdit={async () => {
                  const t = editText.trim();
                  if (t && t !== item.text) await editMessage(memberUid, item.id, t);
                  setEditingId(null);
                }}
                onCancelEdit={() => setEditingId(null)}
                onDelete={async () => {
                  setMenuFor(null);
                  await deleteMessage(memberUid, item.id);
                }}
                onToggleImportant={async () => {
                  setMenuFor(null);
                  await toggleImportant(memberUid, item.id, !item.isImportant);
                }}
              />
            ),
          )
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3.5">
        <button
          onClick={() => setPendingImportant((v) => !v)}
          className={`shrink-0 rounded-full p-2 transition ${pendingImportant ? "text-warning" : "text-text-muted hover:text-text-secondary"}`}
          title="Mark as important"
        >
          <StarIcon filled={pendingImportant} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={pendingImportant ? "Important message…" : "Type a message…"}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
        />
        <button
          onClick={handleSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white transition hover:brightness-110"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isMe,
  menuOpen,
  onToggleMenu,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggleImportant,
}: {
  message: OwnerChatMessage;
  isMe: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onToggleImportant: () => void;
}) {
  return (
    <div className={`group flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[70%] ${isMe ? "order-2" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isMe ? "rounded-br-md bg-gradient-to-br from-primary to-primary-dark text-white" : "rounded-bl-md bg-surface-elevated text-text-primary"
          } ${message.isImportant ? "ring-1.5 ring-warning" : ""}`}
        >
          {message.isImportant && (
            <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-warning">
              <StarIcon filled small />
              Important
            </div>
          )}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-white/30 bg-black/20 p-2 text-sm text-white outline-none"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button onClick={onCancelEdit} className="opacity-80 hover:opacity-100">
                  Cancel
                </button>
                <button onClick={onSaveEdit} className="font-semibold opacity-100">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          )}
          <div className={`mt-1 flex items-center gap-1 text-[11px] ${isMe ? "text-white/70" : "text-text-muted"}`}>
            {message.isEdited && <span className="italic">edited</span>}
            {message.createdAt && <span>{message.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
            {isMe && <ReadIcon read={message.isRead} />}
          </div>
        </div>

        {isMe && !isEditing && (
          <div className="absolute -top-3 right-1">
            <button
              onClick={onToggleMenu}
              className="rounded-full bg-surface p-1 text-text-muted opacity-0 shadow transition group-hover:opacity-100 hover:text-text-primary"
            >
              <DotsIcon />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-border bg-surface-elevated py-1 text-sm shadow-xl">
                <button onClick={onToggleImportant} className="flex w-full items-center gap-2 px-3 py-2 text-left text-text-primary hover:bg-surface">
                  <StarIcon filled={message.isImportant} small />
                  {message.isImportant ? "Remove Important" : "Mark Important"}
                </button>
                <button onClick={onStartEdit} className="flex w-full items-center gap-2 px-3 py-2 text-left text-text-primary hover:bg-surface">
                  <EditIcon /> Edit
                </button>
                <button onClick={onDelete} className="flex w-full items-center gap-2 px-3 py-2 text-left text-error hover:bg-surface">
                  <TrashIcon /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReadIcon({ read }: { read: boolean }) {
  return (
    <svg width="15" height="11" viewBox="0 0 24 18" fill="none" stroke={read ? "#6FD8FF" : "currentColor"} strokeWidth={2.2}>
      <path d="M1 9l5 5L14 5" />
      <path d="M10 9l5 5L23 5" />
    </svg>
  );
}
function StarIcon({ filled, small }: { filled: boolean; small?: boolean }) {
  const s = small ? 12 : 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 7h16" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
    </svg>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { addNotification, deleteNotification } from "@/lib/notifications";
import { uploadImage, CLOUDINARY_NOTIFICATION_FOLDER } from "@/lib/cloudinary";
import NotificationEditModal from "@/components/NotificationEditModal";
import type { AdminNotification } from "@/lib/types";

export default function NotifyUsersPage() {
  const { notifications, loading } = useAdminData();
  const [editing, setEditing] = useState<AdminNotification | null>(null);
  const [deleting, setDeleting] = useState<AdminNotification | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // New updates land at the bottom (oldest-first list) — keep the view
  // pinned there as they arrive, matching a chat-style compose thread.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [notifications.length]);

  function handlePickFile(f: File | null) {
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleSend() {
    const t = title.trim();
    const d = description.trim();
    const l = linkUrl.trim();
    if (!t && !d && !l && !file) {
      setError("Add a title, description, image or link before sending.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadImage(file, CLOUDINARY_NOTIFICATION_FOLDER);
      await addNotification({ title: t || null, description: d || null, imageUrl, linkUrl: l || null });
      setTitle("");
      setDescription("");
      setLinkUrl("");
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteNotification(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Notify Users</h1>
        <p className="mt-1 text-sm text-text-muted">
          Broadcast updates to every member — text, image and a link, all optional but at least one is required.
        </p>
      </div>

      <div className="flex h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 backdrop-blur">
        <div ref={listRef} className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="m-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          ) : notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-text-muted">
              No updates sent yet. Write one below and hit send.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onEdit={() => setEditing(n)} onDelete={() => setDeleting(n)} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end gap-2 border-t border-border px-4 py-3.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-text-muted transition hover:border-primary/50"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <PhotoIcon />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
          />

          <div className="flex flex-1 flex-col gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className={fieldClass}
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className={fieldClass}
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              type="url"
              placeholder="Link (optional)"
              className={fieldClass}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {sending ? <Spinner /> : <SendIcon />}
          </button>
        </div>
        {error && <p className="border-t border-error/30 bg-error/10 px-4 py-2 text-sm text-error">{error}</p>}
      </div>

      {editing && <NotificationEditModal existing={editing} onClose={() => setEditing(null)} onSaved={() => {}} />}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDeleting(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary">Delete this update?</h3>
            <p className="mt-2 text-sm text-text-muted">This removes it from every member&apos;s notification list.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated">
                Cancel
              </button>
              <button onClick={handleDelete} className="rounded-xl bg-error px-4 py-2 text-sm font-bold text-white hover:brightness-110">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary outline-none transition focus:border-primary";

function NotificationRow({
  notification,
  onEdit,
  onDelete,
}: {
  notification: AdminNotification;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3">
      {notification.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={notification.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      )}
      <div className="min-w-0 flex-1">
        {notification.title && <p className="font-semibold text-text-primary">{notification.title}</p>}
        {notification.description && <p className="mt-0.5 text-sm text-text-secondary">{notification.description}</p>}
        {notification.linkUrl && (
          <a href={notification.linkUrl} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-xs text-primary underline">
            {notification.linkUrl}
          </a>
        )}
        <p className="mt-1.5 text-[11px] text-text-muted">
          {notification.createdAt.toLocaleDateString([], { month: "short", day: "numeric" })},{" "}
          {notification.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button onClick={onEdit} className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary" title="Edit">
          <EditIcon />
        </button>
        <button onClick={onDelete} className="rounded-lg p-1.5 text-text-muted transition hover:bg-error/10 hover:text-error" title="Delete">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5.5-5.5L4 21" />
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
function Spinner() {
  return <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 7h16" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </svg>
  );
}

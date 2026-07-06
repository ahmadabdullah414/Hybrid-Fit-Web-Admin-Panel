"use client";

import { useRef, useState } from "react";
import { updateNotification } from "@/lib/notifications";
import { uploadImage, CLOUDINARY_NOTIFICATION_FOLDER } from "@/lib/cloudinary";
import type { AdminNotification } from "@/lib/types";

export default function NotificationEditModal({
  existing,
  onClose,
  onSaved,
}: {
  existing: AdminNotification;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(existing.title ?? "");
  const [description, setDescription] = useState(existing.description ?? "");
  const [linkUrl, setLinkUrl] = useState(existing.linkUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = file ? URL.createObjectURL(file) : !removeImage ? existing.imageUrl : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    const d = description.trim();
    const l = linkUrl.trim();
    const keepingImage = !removeImage && !file && !!existing.imageUrl;
    if (!t && !d && !l && !file && !keepingImage) {
      setError("Add a title, description, image or link before saving.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = removeImage ? null : existing.imageUrl;
      if (file) imageUrl = await uploadImage(file, CLOUDINARY_NOTIFICATION_FOLDER);

      await updateNotification(existing.id, {
        title: t || null,
        description: d || null,
        imageUrl,
        linkUrl: l || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Edit Update</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-background transition hover:border-primary/50"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-muted">
                <PhotoIcon />
                <span className="text-sm">Tap to add an image (optional)</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f) setRemoveImage(false);
            }}
          />
          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setRemoveImage(true);
              }}
              className="-mt-2 self-start text-xs font-medium text-error hover:underline"
            >
              Remove image
            </button>
          )}

          <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
            Title (optional)
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
            Link (optional)
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              type="url"
              className={inputClass}
              placeholder="https://example.com"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-4 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary";

function PhotoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5.5-5.5L4 21" />
    </svg>
  );
}

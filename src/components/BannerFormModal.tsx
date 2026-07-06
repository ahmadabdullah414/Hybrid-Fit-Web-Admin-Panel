"use client";

import { useRef, useState } from "react";
import { addBanner, updateBanner } from "@/lib/banners";
import { uploadImage, CLOUDINARY_BANNER_FOLDER } from "@/lib/cloudinary";
import type { HomeBanner } from "@/lib/types";

export default function BannerFormModal({
  existing,
  onClose,
  onSaved,
}: {
  existing?: HomeBanner;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [linkUrl, setLinkUrl] = useState(existing?.linkUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existing?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePickFile(f: File | null) {
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file && !existing) {
      setError("Please choose an image first.");
      return;
    }
    if (!title.trim()) {
      setError("Please give this banner a title.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = existing?.imageUrl;
      if (file) imageUrl = await uploadImage(file, CLOUDINARY_BANNER_FOLDER);

      const link = linkUrl.trim() ? linkUrl.trim() : null;
      if (existing) {
        await updateBanner(existing.id, { title: title.trim(), imageUrl: imageUrl!, linkUrl: link });
      } else {
        await addBanner({ title: title.trim(), imageUrl: imageUrl!, linkUrl: link });
      }
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
          <h2 className="text-lg font-bold text-text-primary">{existing ? "Edit Banner" : "Add Banner"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
            Title (for your reference only)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Summer Sale Promo"
            />
          </label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-background transition hover:border-primary/50"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-muted">
                <PhotoIcon />
                <span className="text-sm">Tap to choose an image</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
          />

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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5.5-5.5L4 21" />
    </svg>
  );
}

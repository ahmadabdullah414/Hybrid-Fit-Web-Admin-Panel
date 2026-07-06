"use client";

import { useEffect, useState } from "react";
import { subscribeBanners, deleteBanner } from "@/lib/banners";
import type { HomeBanner } from "@/lib/types";
import BannerFormModal from "@/components/BannerFormModal";
import HomeBannerCarouselPreview from "@/components/HomeBannerCarouselPreview";

export default function BannersPage() {
  const [banners, setBanners] = useState<HomeBanner[] | null>(null);
  const [modalFor, setModalFor] = useState<HomeBanner | "new" | null>(null);
  const [deleting, setDeleting] = useState<HomeBanner | null>(null);

  useEffect(() => subscribeBanners(setBanners), []);

  async function handleDelete() {
    if (!deleting) return;
    await deleteBanner(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Home Banners</h1>
          <p className="mt-1 text-sm text-text-muted">The image carousel every member sees on their Home screen.</p>
        </div>
        <button
          onClick={() => setModalFor("new")}
          className="shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          + Add Banner
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface/80 p-6">
        <HomeBannerCarouselPreview banners={banners ?? []} />
      </div>

      {banners === null ? (
        <div className="animate-pulse rounded-2xl border border-border bg-surface/80 p-6">
          <div className="h-40 rounded-lg bg-surface-elevated" />
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
          No banners yet. Add the first one for the Home screen slider.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {banners.map((banner) => (
            <div key={banner.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface/80 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt="" className="h-15 w-24 rounded-xl object-cover" style={{ height: 60, width: 90 }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text-primary">{banner.title}</p>
                <p className="truncate text-xs text-text-muted">{banner.linkUrl || "No link set"}</p>
              </div>
              <button
                onClick={() => setModalFor(banner)}
                className="rounded-lg p-2 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
                title="Edit"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => setDeleting(banner)}
                className="rounded-lg p-2 text-text-muted transition hover:bg-error/10 hover:text-error"
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalFor && (
        <BannerFormModal
          existing={modalFor === "new" ? undefined : modalFor}
          onClose={() => setModalFor(null)}
          onSaved={() => {}}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDeleting(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary">Delete this banner?</h3>
            <p className="mt-2 text-sm text-text-muted">This removes it from every member&apos;s Home screen.</p>
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

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 7h16" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </svg>
  );
}

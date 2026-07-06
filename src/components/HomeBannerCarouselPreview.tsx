"use client";

import { useEffect, useState } from "react";
import type { HomeBanner } from "@/lib/types";

// Sized to match the Home screen's actual carousel: ~371dp wide by ~126dp
// tall on a typical phone (a ~2.9:1 letterbox), so what admins see here is a
// true preview of how a banner will look and slide inside the app — not
// just an arbitrary rectangle. Same sharp corners, same auto-slide/arrows.
const PREVIEW_WIDTH = 380;
const ASPECT_RATIO = 2.9;

export default function HomeBannerCarouselPreview({ banners }: { banners: HomeBanner[] }) {
  const [page, setPage] = useState(0);
  const hasMultiple = banners.length > 1;
  // Clamp during render (not in an effect) so a shrinking list never reads
  // out of bounds, without needing an extra render pass to self-correct.
  const safePage = banners.length === 0 ? 0 : page % banners.length;

  useEffect(() => {
    if (!hasMultiple) return;
    const id = setInterval(() => setPage((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [hasMultiple, banners.length]);

  function go(delta: number) {
    if (!hasMultiple) return;
    setPage((p) => (p + delta + banners.length) % banners.length);
  }

  const current = banners[safePage];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative overflow-hidden border border-border bg-surface-elevated"
        style={{ width: PREVIEW_WIDTH, aspectRatio: ASPECT_RATIO, maxWidth: "100%" }}
      >
        {banners.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <ImageGlyph />
          </div>
        ) : (
          current.imageUrl && (
            <a href={current.linkUrl ?? undefined} target={current.linkUrl ? "_blank" : undefined} rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs, no next/image domain config here */}
              <img src={current.imageUrl} alt={current.title} className="h-full w-full object-cover" />
            </a>
          )
        )}

        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center bg-gradient-to-r from-black/45 to-transparent">
          <button
            onClick={() => go(-1)}
            disabled={!hasMultiple}
            className="pointer-events-auto p-1 text-primary disabled:opacity-40"
          >
            <ChevronIcon direction="left" />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-end bg-gradient-to-l from-black/45 to-transparent">
          <button
            onClick={() => go(1)}
            disabled={!hasMultiple}
            className="pointer-events-auto p-1 text-primary disabled:opacity-40"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        {banners.length > 0 && (
          <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
            {banners.map((b, i) => (
              <span
                key={b.id}
                className={`h-1.5 rounded-full transition-all ${i === safePage ? "w-4 bg-primary" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-text-muted">Live preview — same size and sliding behavior as the Home screen.</p>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function ImageGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5.5-5.5L4 21" />
    </svg>
  );
}

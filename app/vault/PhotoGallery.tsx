"use client";

import { useCallback, useEffect, useState } from "react";
import { COLORS, RADIUS } from "../components/theme";
import { IconChevronLeft, IconChevronRight, IconX } from "../components/icons";
import FavoriteButton from "./FavoriteButton";

// A real, working photo gallery: a responsive grid of thumbnails that
// opens into a fullscreen click-through viewer (prev/next, keyboard
// arrows, escape to close). Images are loaded from the same signed
// asset-download route used elsewhere in the vault - no fake data,
// no placeholder photos.
export type GalleryPhoto = {
  id: string;
  title: string;
  assetId: string;
  favorite: boolean;
};

export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);
  const showNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, showPrev, showNext]);

  if (photos.length === 0) return null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setOpenIndex(index)}
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              borderRadius: RADIUS.md,
              overflow: "hidden",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              cursor: "pointer",
            }}
          >
            <img
              src={`/api/assets/${photo.assetId}/download`}
              alt={photo.title}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "rgba(255,255,255,0.75)",
                borderRadius: RADIUS.sm,
              }}
            >
              <FavoriteButton itemId={photo.id} initialFavorite={photo.favorite} />
            </div>
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(247,247,251,0.97)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              color: COLORS.textSecondary,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {openIndex + 1} / {photos.length}
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: RADIUS.md,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              color: COLORS.textPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IconX size={18} />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                color: COLORS.textPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IconChevronLeft size={20} />
            </button>
          )}

          <img
            src={`/api/assets/${photos[openIndex].assetId}/download`}
            alt={photos[openIndex].title}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "88vw",
              maxHeight: "82vh",
              objectFit: "contain",
              borderRadius: RADIUS.md,
              boxShadow: "0 20px 60px rgba(20,20,40,0.18)",
            }}
          />

          {photos.length > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              style={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                color: COLORS.textPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IconChevronRight size={20} />
            </button>
          )}

          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              color: COLORS.textSecondary,
              fontSize: 13,
              maxWidth: "70vw",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {photos[openIndex].title}
          </div>
        </div>
      )}
    </>
  );
}

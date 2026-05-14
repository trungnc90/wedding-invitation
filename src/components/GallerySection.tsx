"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export interface GalleryPhoto {
  _id: string;
  url: string;
  thumbnailUrl: string;
  order: number;
}

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

/** Returns the next index, wrapping from last to first */
export function getNextIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

/** Returns the previous index, wrapping from first to last */
export function getPrevIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}

export default function GallerySection({ photos }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? getNextIndex(prev, sortedPhotos.length) : null
    );
  }, [sortedPhotos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? getPrevIndex(prev, sortedPhotos.length) : null
    );
  }, [sortedPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  if (sortedPhotos.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-vintage-cream">
      <div className="max-w-6xl mx-auto">
        <h2 className="vintage-heading mb-2">Thư Viện Ảnh</h2>
        <div className="section-divider mb-8 sm:mb-12" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {sortedPhotos.map((photo, index) => (
            <button
              key={photo._id || `photo-${index}`}
              onClick={() => setLightboxIndex(index)}
              className="relative aspect-[5/7] overflow-hidden rounded-lg group cursor-pointer"
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <Image
                src={photo.thumbnailUrl}
                alt={`Ảnh ${index + 1}`}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && sortedPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Lightbox ảnh"
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gray-300"
              aria-label="Đóng"
            >
              ✕
            </button>

            <button
              onClick={goPrev}
              className="absolute left-4 text-white text-4xl z-10 hover:text-gray-300"
              aria-label="Ảnh trước"
            >
              ‹
            </button>

            <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
              <Image
                src={sortedPhotos[lightboxIndex].url}
                alt={`Ảnh ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <button
              onClick={goNext}
              className="absolute right-4 text-white text-4xl z-10 hover:text-gray-300"
              aria-label="Ảnh tiếp"
            >
              ›
            </button>

            <div className="absolute bottom-4 text-white text-sm">
              {lightboxIndex + 1} / {sortedPhotos.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

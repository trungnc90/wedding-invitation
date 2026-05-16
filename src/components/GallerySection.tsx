"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

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
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % sortedPhotos.length);
  }, [sortedPhotos.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length);
  }, [sortedPhotos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  // Lightbox controls
  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
    setTimeout(() => setLightboxIndex(null), 1000);
  }, []);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => {
      const next = prev !== null ? getNextIndex(prev, sortedPhotos.length) : null;
      if (next !== null) setActiveIndex(next);
      return next;
    });
  }, [sortedPhotos.length]);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      const next = prev !== null ? getPrevIndex(prev, sortedPhotos.length) : null;
      if (next !== null) setActiveIndex(next);
      return next;
    });
  }, [sortedPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    // Lock body scroll (iOS Safari fix)
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "ArrowLeft") lightboxPrev();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, lightboxNext, lightboxPrev]);

  if (sortedPhotos.length === 0) {
    return null;
  }

  // Nearby indices for carousel
  const prevIndex = (activeIndex - 1 + sortedPhotos.length) % sortedPhotos.length;
  const nextIndex = (activeIndex + 1) % sortedPhotos.length;

  // Nearby indices for lightbox (only render 3 full-size images)
  const getLightboxNearby = (idx: number) => {
    const prev = (idx - 1 + sortedPhotos.length) % sortedPhotos.length;
    const next = (idx + 1) % sortedPhotos.length;
    return [prev, idx, next];
  };

  return (
    <section id="gallery" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-vintage-cream">
      <div className="max-w-4xl mx-auto">
        <h2 className="vintage-heading mb-2">Thư Viện Ảnh</h2>
        <div className="section-divider mb-8 sm:mb-12" />
      </div>

      {/* Carousel */}
      <div
        className="max-w-4xl mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-vintage-paper p-3 sm:p-4 md:p-5 shadow-md">
          <div className="bg-vintage-cream p-4 sm:p-6 md:p-8 overflow-hidden">
            <div className="relative flex items-center justify-center gap-2 sm:gap-4">
              {/* Left (prev) */}
              <button
                onClick={goToPrev}
                className="flex-shrink-0 w-[20%] sm:w-[25%] opacity-60 transition-all duration-500 cursor-pointer hover:opacity-80"
              >
                <div className="bg-vintage-paper p-1.5 sm:p-2 shadow-sm rotate-[-2deg]">
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                      src={sortedPhotos[prevIndex].thumbnailUrl}
                      alt="Previous"
                      fill
                      className="object-cover sepia-[8%] saturate-[90%] brightness-[1.02]"
                      sizes="200px"
                    />
                  </div>
                </div>
              </button>

              {/* Center (active) - crossfade stack */}
              <button
                onClick={() => { setLightboxIndex(activeIndex); setTimeout(() => setLightboxVisible(true), 10); }}
                className="flex-shrink-0 w-[55%] sm:w-[40%] cursor-pointer z-10"
              >
                <div className="bg-vintage-paper p-2 sm:p-2.5 shadow-lg">
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    {sortedPhotos.map((photo, index) => {
                      // Only render nearby images to avoid memory issues
                      const distance = Math.min(
                        Math.abs(index - activeIndex),
                        sortedPhotos.length - Math.abs(index - activeIndex)
                      );
                      if (distance > 1) return null;
                      return (
                        <Image
                          key={photo._id || `thumb-${index}`}
                          src={photo.thumbnailUrl}
                          alt={`Ảnh ${index + 1}`}
                          fill
                          className={`object-cover transition-opacity duration-500 ease-in-out ${
                            index === activeIndex ? "opacity-100" : "opacity-0"
                          }`}
                          sizes="400px"
                          priority={index === activeIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              </button>

              {/* Right (next) */}
              <button
                onClick={goToNext}
                className="flex-shrink-0 w-[20%] sm:w-[25%] opacity-60 transition-all duration-500 cursor-pointer hover:opacity-80"
              >
                <div className="bg-vintage-paper p-1.5 sm:p-2 shadow-sm rotate-[2deg]">
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                      src={sortedPhotos[nextIndex].thumbnailUrl}
                      alt="Next"
                      fill
                      className="object-cover sepia-[8%] saturate-[90%] brightness-[1.02]"
                      sizes="200px"
                    />
                  </div>
                </div>
              </button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {sortedPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? "bg-vintage-ink w-4" : "bg-vintage-ink/30"
                  }`}
                  aria-label={`Ảnh ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && sortedPhotos[lightboxIndex] && (
        <div
          className={`fixed inset-0 z-50 bg-black/85 flex items-center justify-center transition-opacity duration-1000 ${
            lightboxVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeLightbox}
          onTouchMove={(e) => e.preventDefault()}
          role="dialog"
          aria-label="Lightbox ảnh"
        >
          <div className="relative flex items-center justify-center w-full h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gray-300"
              aria-label="Đóng"
            >
              ✕
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              className="absolute left-4 text-white text-4xl z-10 hover:text-gray-300"
              aria-label="Ảnh trước"
            >
              ‹
            </button>

            {/* Polaroid frame - crossfade with all images, lazy load */}
            <div
              className={`bg-vintage-paper p-2 sm:p-3 shadow-xl transition-transform duration-1000 ${
                lightboxVisible ? "scale-100" : "scale-90"
              }`}
              style={{ maxHeight: '80vh', maxWidth: '85vw' }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) lightboxNext();
                  else lightboxPrev();
                }
              }}
            >
              <div className="relative">
                {sortedPhotos.map((photo, idx) => {
                  const isNearby = lightboxIndex !== null && getLightboxNearby(lightboxIndex).includes(idx);
                  if (!isNearby) return null;
                  return (
                    <Image
                      key={`lb-${idx}`}
                      src={photo.url}
                      alt={`Ảnh ${idx + 1}`}
                      width={900}
                      height={1200}
                      className={`object-contain max-h-[74vh] w-auto mx-auto transition-opacity duration-500 ease-in-out ${
                        idx === lightboxIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0"
                      }`}
                      sizes="85vw"
                      priority={idx === lightboxIndex}
                    />
                  );
                })}
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
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

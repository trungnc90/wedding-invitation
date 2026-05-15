"use client";

import { useState, useEffect, useRef } from "react";
import LandingPage from "./LandingPage";

interface WeddingPageWrapperProps {
  heroPhoto: string;
  preloadImages?: { high: string[]; low: string[] };
  children: React.ReactNode;
}

export default function WeddingPageWrapper({
  heroPhoto,
  preloadImages = { high: [], low: [] },
  children,
}: WeddingPageWrapperProps) {
  const [showLanding, setShowLanding] = useState(true);
  const [animating, setAnimating] = useState(false);
  const preloadStarted = useRef(false);

  // Preload images in background with priority levels
  useEffect(() => {
    if (preloadStarted.current) return;
    preloadStarted.current = true;

    // Build Next.js optimized image URL
    const getOptimizedUrl = (src: string, width: number) =>
      `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

    // High priority: load immediately (hero + couple)
    preloadImages.high.forEach((url, index) => {
      setTimeout(() => {
        const img = new window.Image();
        img.src = getOptimizedUrl(url, 828);
      }, index * 100);
    });

    // Low priority: load after 2s delay (gallery)
    preloadImages.low.forEach((url, index) => {
      setTimeout(() => {
        const img = new window.Image();
        // Preload both thumbnail size and full size
        img.src = getOptimizedUrl(url, 400);
        const imgFull = new window.Image();
        imgFull.src = getOptimizedUrl(url, 828);
      }, 2000 + index * 500);
    });
  }, [preloadImages]);

  const handleEnter = () => {
    setAnimating(true);
    setTimeout(() => {
      setShowLanding(false);
      setAnimating(false);
    }, 2000);
  };

  return (
    <>
      {showLanding && (
        <LandingPage
          heroPhoto={heroPhoto}
          onEnter={handleEnter}
          animating={animating}
        />
      )}
      <div className={showLanding && !animating ? "hidden" : "animate-fadeIn"}>
        {children}
      </div>
    </>
  );
}

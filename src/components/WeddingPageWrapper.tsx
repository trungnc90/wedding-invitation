"use client";

import { useState } from "react";
import LandingPage from "./LandingPage";

interface WeddingPageWrapperProps {
  heroPhoto: string;
  children: React.ReactNode;
}

export default function WeddingPageWrapper({
  heroPhoto,
  children,
}: WeddingPageWrapperProps) {
  const [showLanding, setShowLanding] = useState(true);
  const [animating, setAnimating] = useState(false);

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

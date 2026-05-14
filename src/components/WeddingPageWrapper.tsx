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

  return (
    <>
      {showLanding && (
        <LandingPage
          heroPhoto={heroPhoto}
          onEnter={() => setShowLanding(false)}
        />
      )}
      {!showLanding && <>{children}</>}
    </>
  );
}

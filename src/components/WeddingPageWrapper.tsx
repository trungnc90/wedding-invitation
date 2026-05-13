"use client";

import { useState } from "react";
import LandingPage from "./LandingPage";

interface WeddingPageWrapperProps {
  groomName: string;
  brideName: string;
  weddingDate: string;
  heroPhoto: string;
  events: Array<{
    title: string;
    date: string;
    time: string;
    venueName: string;
    venueAddress: string;
  }>;
  children: React.ReactNode;
}

export default function WeddingPageWrapper({
  groomName,
  brideName,
  weddingDate,
  heroPhoto,
  events,
  children,
}: WeddingPageWrapperProps) {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <>
      {showLanding && (
        <LandingPage
          groomName={groomName}
          brideName={brideName}
          weddingDate={weddingDate}
          heroPhoto={heroPhoto}
          events={events}
          onEnter={() => setShowLanding(false)}
        />
      )}
      <div className={showLanding ? "fixed inset-0 opacity-0 pointer-events-none -z-10 overflow-hidden" : ""}>
        {children}
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

interface LandingPageProps {
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
  onEnter: () => void;
}

export default function LandingPage({
  groomName,
  brideName,
  weddingDate,
  heroPhoto,
  events,
  onEnter,
}: LandingPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedDate = new Date(weddingDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, ".");

  const firstEvent = events[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-vintage-cream overflow-auto">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-lg mx-auto px-6 py-10 sm:py-16 flex flex-col items-center text-center">
        {/* "To: Guest" line - uppercase serif with wide tracking */}
        <p className="font-vintage text-[11px] sm:text-xs tracking-[0.35em] uppercase text-vintage-ink mb-8 sm:mb-10">
          To: My Beloved Friends
        </p>

        {/* Polaroid photo frame with overlapping text */}
        <div className="relative mb-2 sm:mb-4 mt-10 sm:mt-12">
          {/* "You're invited to our" - positioned above the photo frame */}
          <div className="absolute -top-8 sm:-top-10 left-0 right-0 z-20 text-center">
            <p className="font-script text-vintage-ink text-[28px] sm:text-[36px] leading-[1.1]">
              You&apos;re invited to our
            </p>
          </div>

          {/* Tape decoration - top right */}
          <div className="absolute -top-3 -right-4 sm:-top-4 sm:-right-6 w-14 h-6 sm:w-18 sm:h-8 bg-vintage-tape/60 rotate-[30deg] z-10 shadow-sm" />

          {/* Polaroid card */}
          <div className="relative bg-vintage-paper p-2 sm:p-3 pb-6 sm:pb-8 shadow-[4px_6px_20px_rgba(0,0,0,0.12)] rotate-[-1.5deg]">
            {/* Photo */}
            <div className="relative w-[270px] h-[360px] sm:w-[330px] sm:h-[440px] overflow-hidden">
              <Image
                src={heroPhoto}
                alt={`${groomName} & ${brideName}`}
                fill
                priority
                className={`object-cover sepia-[15%] saturate-[85%] brightness-[1.02] transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                sizes="(max-width: 640px) 280px, 360px"
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* "Wedding" + date - inside the photo, centered */}
            <div className="absolute top-1 left-0 right-0 sm:top-2 z-10 text-center">
              <p className="font-script text-vintage-ink text-[38px] sm:text-[48px] leading-[1.1] drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
                Wedding
              </p>
              <p className="font-script text-vintage-ink text-[16px] sm:text-[20px] -mt-3 italic drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Couple names - large script below the polaroid */}
        <div className="relative z-10 -mt-4 sm:-mt-6 mb-8 sm:mb-10">
          <p className="font-names text-[36px] sm:text-[48px] text-vintage-ink leading-tight">
            Cong Trung <span className="text-[28px] sm:text-[36px]">&</span> Quynh Anh
          </p>
        </div>

        {/* Event details - courier/monospace */}
        <div className="mb-8 sm:mb-10">
          <p className="font-vintage text-[11px] sm:text-sm tracking-[0.3em] uppercase text-vintage-ink mb-1">
            At 19:00
          </p>
          <p className="font-vintage text-[10px] sm:text-xs tracking-[0.25em] uppercase text-vintage-ink/70">
            Giao Xu Hanh Tri, Ninh Son, Khanh Hoa
          </p>
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="group relative px-8 py-3 sm:px-10 sm:py-3.5 border border-vintage-ink/30 text-vintage-ink/80 font-vintage text-[10px] sm:text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:bg-vintage-ink hover:text-vintage-cream hover:border-vintage-ink"
        >
          Open
        </button>
      </div>
    </div>
  );
}

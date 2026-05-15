"use client";

import Image from "next/image";
import landingConfig from "@/config/landing.json";

interface LandingPageProps {
  heroPhoto: string;
  onEnter: () => void;
  animating?: boolean;
}

export default function LandingPage({
  heroPhoto,
  onEnter,
  animating = false,
}: LandingPageProps) {

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-vintage-cream overflow-y-auto overflow-x-hidden"
      style={{
        transition: animating ? 'filter 1s ease-out, opacity 0.6s ease-out 1.2s, transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        filter: animating ? 'blur(12px)' : 'blur(0)',
        opacity: animating ? 0 : 1,
        transform: animating ? 'scale(1.3)' : 'scale(1)',
        transformOrigin: 'center 40%',
      }}
    >
      <div className="flex flex-col items-center justify-center min-h-full">
        <div className="w-full max-w-[380px] flex flex-col items-center text-center px-6 py-6 sm:py-10">

        {/* === AREA 1: Greeting === */}
        <p className="font-mono text-[11px] sm:text-xs tracking-[0.35em] uppercase text-vintage-ink mb-4 sm:mb-6">
          {landingConfig.greeting}
        </p>

        {/* === AREA 2: Image Frame === */}
        <div className="w-full max-w-[320px] sm:max-w-[380px] flex flex-col items-center mb-4 sm:mb-6">
          {/* Invite text */}
          <p className="font-names text-vintage-ink text-[9vw] sm:text-[50px] leading-[1.1] -mb-2 relative z-10">
            {landingConfig.inviteText}
          </p>

          {/* Polaroid card */}
          <div className="w-full p-2 sm:p-3 bg-vintage-paper shadow-lg rotate-[-1.5deg]">
            <div className="relative w-full aspect-[3/4]">
              <Image
                src={heroPhoto}
                alt={landingConfig.coupleName}
                fill
                priority
                className="object-cover sepia-[15%] saturate-[85%] brightness-[1.02] animate-fadeIn"
                sizes="(max-width: 640px) 80vw, 380px"
              />
              {/* Event type + date overlay */}
              <div className="absolute -top-2 left-0 right-0 z-10 text-center">
                <p className="font-names text-vintage-ink text-[10vw] sm:text-[48px] leading-[1.1] drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
                  {landingConfig.eventType}
                </p>
                <p className="font-landing text-vintage-ink text-[4vw] sm:text-[17px] -mt-2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
                  {landingConfig.date}
                </p>
              </div>
            </div>
          </div>

          {/* Couple names */}
          <p className="font-names text-[9vw] sm:text-[48px] text-vintage-ink leading-tight mt-2 sm:mt-3">
            {landingConfig.coupleName}
          </p>
        </div>

        {/* === AREA 3: Event Details === */}
        <div className="mb-4 sm:mb-6 text-center">
          <p className="font-mono text-[11px] sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-vintage-ink mb-1">
            {landingConfig.eventTime}
          </p>
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase text-vintage-ink/70 max-w-[320px] sm:max-w-[380px]">
            {landingConfig.venue}
          </p>
        </div>

        {/* === AREA 4: Button === */}
        <button
          onClick={onEnter}
          disabled={animating}
          className="px-8 py-3 sm:px-10 sm:py-3.5 border border-vintage-ink/30 text-vintage-ink/80 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-vintage-ink hover:text-vintage-cream hover:border-vintage-ink disabled:opacity-50 disabled:pointer-events-none"
        >
          {landingConfig.buttonText}
        </button>

        </div>
      </div>
    </div>
  );
}

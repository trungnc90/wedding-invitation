"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import CountdownTimer from "./CountdownTimer";

interface HeroSectionProps {
  brideName: string;
  groomName: string;
  weddingDate: string;
  heroPhoto: string;
  heroPhotoMobile?: string;
}

export default function HeroSection({
  brideName,
  groomName,
  weddingDate,
  heroPhoto,
  heroPhotoMobile,
}: HeroSectionProps) {
  const t = useTranslations("HeroSection");
  const formattedDate = new Date(weddingDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="w-full bg-vintage-cream p-2 sm:p-3 md:p-4">
      {/* White border frame */}
      <div className="relative w-full bg-vintage-paper p-2 sm:p-3 md:p-4 shadow-lg">
        {/* Photo container */}
        <div className="relative w-full aspect-[3/4] lg:aspect-[16/9] overflow-hidden">
          {/* Desktop hero (16:9) - hidden on tablet/mobile */}
          <Image
            src={heroPhoto}
            alt={`${brideName} - ${groomName}`}
            fill
            priority
            className="object-cover hidden lg:block"
            sizes="100vw"
          />
          {/* Mobile/tablet hero (3:4) - hidden on desktop */}
          <Image
            src={heroPhotoMobile || heroPhoto}
            alt={`${brideName} - ${groomName}`}
            fill
            priority
            className="object-cover lg:hidden"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Text group - bottom 1/3 of the photo, scaled to fit */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 z-10 flex items-center justify-center text-center px-4">
            <div className="flex flex-col items-center gap-1 sm:gap-2" style={{ fontSize: 'clamp(12px, min(3vw, 2vh), 20px)' }}>
              <p className="text-white/80 text-[0.6em] tracking-[0.3em] uppercase font-vintage">
                {t("gettingMarried")}
              </p>

              <h1 className="font-script text-[2.5em] text-white drop-shadow-lg whitespace-nowrap flex items-center gap-[0.15em]">
                {groomName} & {brideName}
              </h1>

              <p className="text-[0.7em] text-white/90 font-vintage tracking-wide">
                {formattedDate}
              </p>

              <div>
                <CountdownTimer weddingDate={weddingDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

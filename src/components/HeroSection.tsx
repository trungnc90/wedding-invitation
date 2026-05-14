import Image from "next/image";
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
        <div className="relative w-full aspect-[3/4] md:aspect-[16/9] overflow-hidden">
          {/* Desktop hero (16:9) - hidden on mobile */}
          <Image
            src={heroPhoto}
            alt={`${brideName} - ${groomName}`}
            fill
            priority
            className="object-cover hidden md:block"
            sizes="100vw"
          />
          {/* Mobile hero (3:4) - hidden on desktop */}
          <Image
            src={heroPhotoMobile || heroPhoto}
            alt={`${brideName} - ${groomName}`}
            fill
            priority
            className="object-cover md:hidden"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Text group - bottom 1/3 of the photo */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 z-10 flex flex-col items-center justify-center text-center px-4">
            <p className="text-white/80 text-[10px] sm:text-xs md:text-[1vw] tracking-[0.3em] uppercase font-vintage">
              Chúng tôi sắp kết hôn
            </p>

            <h1 className="font-script text-3xl sm:text-4xl md:text-[4vw] text-white drop-shadow-lg mt-2 sm:mt-3 whitespace-nowrap">
              {groomName} & {brideName}
            </h1>

            <p className="text-sm sm:text-base md:text-[1.2vw] text-white/90 font-vintage tracking-wide mt-2 sm:mt-3">
              {formattedDate}
            </p>

            <div className="mt-2 sm:mt-3">
              <CountdownTimer weddingDate={weddingDate} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

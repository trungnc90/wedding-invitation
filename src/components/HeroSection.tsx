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
    <section className="relative w-full aspect-[3/4] md:aspect-[16/9] flex flex-col items-center justify-end text-center overflow-hidden bg-black">
      {/* Desktop hero (16:9) - hidden on mobile */}
      <Image
        src={heroPhoto}
        alt={`${brideName} - ${groomName}`}
        fill
        priority
        className="object-cover hidden md:block"
        sizes="100vw"
      />
      {/* Mobile hero (9:16) - hidden on desktop */}
      <Image
        src={heroPhotoMobile || heroPhoto}
        alt={`${brideName} - ${groomName}`}
        fill
        priority
        className="object-cover md:hidden"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 pb-16 sm:pb-20 md:pb-24">
        <p className="text-white/90 text-xs sm:text-sm md:text-base tracking-widest uppercase">
          Chúng tôi sắp kết hôn
        </p>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
          {groomName} {"-"} {brideName}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/90">{formattedDate}</p>

        <div className="mt-4">
          <CountdownTimer weddingDate={weddingDate} />
        </div>
      </div>
    </section>
  );
}

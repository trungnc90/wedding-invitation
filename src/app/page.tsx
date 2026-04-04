import HeroSection from "@/components/HeroSection";
import CoupleSection from "@/components/CoupleSection";
import EventSection from "@/components/EventSection";
import GallerySection from "@/components/GallerySection";
import RSVPForm from "@/components/RSVPForm";
import WishesSection, { Wish } from "@/components/WishesSection";
import LanguageToggle from "@/components/LanguageToggle";

interface WeddingData {
  couple: {
    bride: { firstName: string; lastName: string; photo: string; bio: string };
    groom: { firstName: string; lastName: string; photo: string; bio: string };
    loveStory: string;
  };
  heroPhoto: string;
  heroPhotoMobile?: string;
  weddingDate: string;
  events: Array<{
    _id: string;
    title: string;
    date: string;
    time: string;
    venueName: string;
    venueAddress: string;
  }>;
  gallery: Array<{
    _id: string;
    url: string;
    thumbnailUrl: string;
    order: number;
  }>;
  translations?: {
    en?: Record<string, unknown>;
  };
}

async function getWeddingData(): Promise<WeddingData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/wedding`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getWishes(): Promise<Wish[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/wishes`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [wedding, wishes] = await Promise.all([
    getWeddingData(),
    getWishes(),
  ]);

  if (!wedding) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Không thể tải thông tin đám cưới. Vui lòng thử lại sau.
        </p>
      </main>
    );
  }

  const hasEnglish = !!wedding.translations?.en;

  return (
    <main className="min-h-screen">
      <LanguageToggle hasEnglish={hasEnglish} />

      <HeroSection
        brideName={wedding.couple.bride.firstName}
        groomName={wedding.couple.groom.firstName}
        weddingDate={wedding.weddingDate}
        heroPhoto={wedding.heroPhoto}
        heroPhotoMobile={wedding.heroPhotoMobile}
      />

      <CoupleSection
        bride={wedding.couple.bride}
        groom={wedding.couple.groom}
        loveStory={wedding.couple.loveStory}
      />

      <EventSection events={wedding.events} />

      <GallerySection photos={wedding.gallery} />

      {/* RSVP Section */}
      <section id="rsvp" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Xác Nhận Tham Dự</h2>
          <RSVPForm />
        </div>
      </section>

      {/* Wishes Section */}
      <section id="wishes" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Lời Chúc</h2>
          <WishesSection initialWishes={wishes} />
        </div>
      </section>
    </main>
  );
}

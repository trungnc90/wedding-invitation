import HeroSection from "@/components/HeroSection";
import CoupleSection from "@/components/CoupleSection";
import EventSection from "@/components/EventSection";
import GallerySection from "@/components/GallerySection";
import RSVPForm from "@/components/RSVPForm";
import WishesSection, { Wish } from "@/components/WishesSection";
import LanguageToggle from "@/components/LanguageToggle";
import WeddingPageWrapper from "@/components/WeddingPageWrapper";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// eslint-disable-next-line
async function getWeddingData(): Promise<any> {
  try {
    const db = await getDb();
    const wedding = await db.collection("wedding").findOne({});
    if (!wedding) return null;
    return JSON.parse(JSON.stringify(wedding));
  } catch (err) {
    console.error("[getWeddingData] error:", err);
    return null;
  }
}

async function getWishes(): Promise<Wish[]> {
  try {
    const db = await getDb();
    const wishes = await db
      .collection("wishes")
      .find({ approved: true })
      .sort({ createdAt: -1 })
      .toArray();
    return JSON.parse(JSON.stringify(wishes));
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
      <WeddingPageWrapper
        groomName={wedding.couple.groom.firstName}
        brideName={wedding.couple.bride.firstName}
        weddingDate={wedding.weddingDate}
        heroPhoto={wedding.heroPhotoMobile || wedding.heroPhoto}
        events={wedding.events}
      >
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
      </WeddingPageWrapper>
    </main>
  );
}

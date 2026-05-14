import HeroSection from "@/components/HeroSection";
import CoupleSection from "@/components/CoupleSection";
import EventSection from "@/components/EventSection";
import GallerySection from "@/components/GallerySection";
import RSVPForm from "@/components/RSVPForm";
import WishesSection, { Wish } from "@/components/WishesSection";
import LanguageToggle from "@/components/LanguageToggle";
import WeddingPageWrapper from "@/components/WeddingPageWrapper";
import ScrollReveal from "@/components/ScrollReveal";

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
    <WeddingPageWrapper
      heroPhoto={wedding.heroPhotoMobile || wedding.heroPhoto}
    >
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
        />

        <EventSection events={wedding.events} />

        <GallerySection photos={wedding.gallery} />

        {/* RSVP Section */}
        <section id="rsvp" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-vintage-cream">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="vintage-heading mb-2">Xác Nhận Tham Dự</h2>
              <div className="section-divider mb-8 sm:mb-12" />
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="bg-vintage-paper p-3 sm:p-4 md:p-5 shadow-md">
                <div className="bg-vintage-cream p-4 sm:p-5 md:p-6">
                  <RSVPForm />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Wishes Section */}
        <section id="wishes" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-vintage-cream">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="vintage-heading mb-2">Lời Chúc</h2>
              <div className="section-divider mb-8 sm:mb-12" />
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="bg-vintage-paper p-3 sm:p-4 md:p-5 shadow-md">
                <div className="bg-vintage-cream p-4 sm:p-5 md:p-6">
                  <WishesSection initialWishes={wishes} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </WeddingPageWrapper>
  );
}

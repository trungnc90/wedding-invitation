"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";

interface Person {
  firstName: string;
  lastName: string;
  christianName?: string;
}

interface WeddingPerson extends Person {
  photo: string;
  bio: string;
  father?: Person;
  mother?: Person;
}

export interface CoupleSectionProps {
  bride: WeddingPerson;
  groom: WeddingPerson;
}

function formatPersonName(person: Person): string {
  const parts = [];
  if (person.christianName) parts.push(person.christianName);
  parts.push(`${person.lastName} ${person.firstName}`);
  return parts.join(" ");
}

export default function CoupleSection({
  bride,
  groom,
}: CoupleSectionProps) {
  const t = useTranslations("CoupleSection");

  return (
    <section id="couple" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-vintage-cream">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="vintage-heading mb-2">{t("title")}</h2>
          <div className="section-divider mb-10 sm:mb-14" />
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="flex justify-center items-start">
            {/* Groom card - offset right */}
            <div className="w-[55%] sm:w-[45%] max-w-[280px] z-10">
              <PersonCard person={groom} />
            </div>
            {/* Bride card - offset left, overlapping */}
            <div className="w-[55%] sm:w-[45%] max-w-[280px] -ml-[6%] sm:-ml-[3%] mt-12 sm:mt-16 z-20">
              <PersonCard person={bride} />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PersonCard({ person }: { person: WeddingPerson }) {
  return (
    <div className="vintage-card bg-vintage-paper p-1 sm:p-2 flex flex-col items-start text-left shadow-md rounded-none">
      <div className="relative w-full aspect-[4/5] overflow-hidden mb-2">
        <Image
          src={person.photo}
          alt={`${person.lastName} ${person.firstName}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 45vw, 280px"
        />
      </div>
      {person.christianName && (
        <p className="text-[10px] sm:text-xs font-vintage tracking-wider text-vintage-ink/60 leading-tight">
          {person.christianName}
        </p>
      )}
      <h3 className="font-vintage text-[14px] sm:text-xl text-vintage-ink whitespace-nowrap uppercase leading-tight">
        {person.lastName} {person.firstName}
      </h3>
      {(person.father || person.mother) && (
        <div className="text-[10px] sm:text-xs text-vintage-ink/60 font-vintage leading-tight mt-1">
          {person.father && <p>{formatPersonName(person.father)}</p>}
          {person.mother && <p>{formatPersonName(person.mother)}</p>}
        </div>
      )}
    </div>
  );
}

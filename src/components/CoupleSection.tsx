import Image from "next/image";

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
  loveStory: string;
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
  loveStory,
}: CoupleSectionProps) {
  return (
    <section id="couple" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
          Cô Dâu &amp; Chú Rể
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-8 sm:mb-12">
          <PersonCard person={bride} />
          <PersonCard person={groom} />
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Câu Chuyện Tình Yêu</h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {loveStory}
          </p>
        </div>
      </div>
    </section>
  );
}

function PersonCard({ person }: { person: WeddingPerson }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden mb-4">
        <Image
          src={person.photo}
          alt={`${person.lastName} ${person.firstName}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px"
        />
      </div>
      {person.christianName && (
        <p className="text-sm sm:text-base font-semibold text-center">{person.christianName}</p>
      )}
      <h3 className="text-lg sm:text-xl font-semibold mb-1 text-center">{person.lastName} {person.firstName}</h3>
      {(person.father || person.mother) && (
        <div className="text-sm sm:text-base text-gray-600 mb-2 text-center">
          {person.father && <p>Cha: {formatPersonName(person.father)}</p>}
          {person.mother && <p>Mẹ: {formatPersonName(person.mother)}</p>}
        </div>
      )}
      {/* <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{person.bio}</p> */}
    </div>
  );
}

import ScrollReveal from "./ScrollReveal";

export interface EventItem {
  title: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
}

export interface EventSectionProps {
  events: EventItem[];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EventSection({ events }: EventSectionProps) {
  return (
    <section id="events" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-vintage-cream">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="vintage-heading mb-2">Sự Kiện Cưới</h2>
          <div className="section-divider mb-10 sm:mb-14" />
        </ScrollReveal>

        <div className="bg-vintage-paper p-3 sm:p-4 md:p-5 shadow-md">
          <div className="space-y-3 sm:space-y-4">
            {events.map((event, index) => (
              <ScrollReveal key={index} delay={100 + index * 100}>
                <EventCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.venueAddress)}`;

  return (
    <div className="bg-vintage-cream p-5 sm:p-6 text-center">
      <h3 className="font-script text-xl sm:text-2xl text-vintage-ink mb-2">
        {event.title}
      </h3>
      <div className="w-12 h-[1px] bg-vintage-ink/20 mx-auto mb-2" />
      <p className="text-xs sm:text-sm text-vintage-ink/60 font-vintage tracking-wide">
        {formatDate(event.date)}
      </p>
      <p className="text-2xl sm:text-3xl font-vintage font-medium text-vintage-ink my-1">
        {event.time}
      </p>
      <p className="text-sm sm:text-base text-vintage-ink/80 font-vintage">
        {event.venueName}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-gold-dark hover:text-gold text-xs sm:text-sm font-vintage transition-colors mt-1"
      >
        {event.venueAddress}
      </a>
    </div>
  );
}

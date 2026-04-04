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
    <section id="events" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Sự Kiện Cưới</h2>

        <div className="space-y-6 md:space-y-8">
          {/* First event: full width */}
          {events.length > 0 && (
            <div>
              <EventCard event={events[0]} />
            </div>
          )}
          {/* Remaining events: side by side */}
          {events.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {events.slice(1).map((event, index) => (
                <EventCard key={index + 1} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.venueAddress)}`;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{event.title}</h3>

      <div className="space-y-2 text-gray-600">
        <p className="text-xs sm:text-sm">{formatDate(event.date)}</p>
        <p className="text-base sm:text-lg font-medium text-gray-800">{event.time}</p>
        <p className="text-sm sm:text-base font-medium">{event.venueName}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:text-blue-800 underline text-xs sm:text-sm"
        >
          {event.venueAddress}
        </a>
      </div>
    </div>
  );
}

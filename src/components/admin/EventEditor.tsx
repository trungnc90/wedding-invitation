"use client";

import { useState, FormEvent } from "react";

export interface EventData {
  _id?: string;
  title: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
}

interface EventEditorProps {
  initialEvents: EventData[];
}

const emptyEvent: EventData = {
  title: "",
  date: "",
  time: "",
  venueName: "",
  venueAddress: "",
};

export default function EventEditor({ initialEvents }: EventEditorProps) {
  const [events, setEvents] = useState<EventData[]>(initialEvents || []);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function addEvent() {
    setEvents((prev) => [...prev, { ...emptyEvent }]);
  }

  function removeEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEvent(index: number, field: keyof EventData, value: string) {
    setEvents((prev) =>
      prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev))
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/wedding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });

      if (res.ok) {
        setFeedback({ type: "success", message: "Events saved successfully." });
      } else {
        const err = await res.json().catch(() => null);
        setFeedback({ type: "error", message: err?.error || "Failed to save events." });
      }
    } catch {
      setFeedback({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {feedback && (
        <div
          role="alert"
          className={`p-3 rounded-lg text-sm ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {events.map((event, index) => (
        <fieldset key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-md font-semibold text-gray-800">Event {index + 1}</legend>
            <button type="button" onClick={() => removeEvent(index)} className="text-sm text-red-500 hover:text-red-700" aria-label={`Remove event ${index + 1}`}>
              Remove
            </button>
          </div>
          <div>
            <label htmlFor={`event-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input id={`event-title-${index}`} type="text" value={event.title} onChange={(e) => updateEvent(index, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`event-date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input id={`event-date-${index}`} type="date" value={event.date} onChange={(e) => updateEvent(index, "date", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div>
              <label htmlFor={`event-time-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input id={`event-time-${index}`} type="time" value={event.time} onChange={(e) => updateEvent(index, "time", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
          </div>
          <div>
            <label htmlFor={`event-venue-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
            <input id={`event-venue-${index}`} type="text" value={event.venueName} onChange={(e) => updateEvent(index, "venueName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <div>
            <label htmlFor={`event-address-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
            <input id={`event-address-${index}`} type="text" value={event.venueAddress} onChange={(e) => updateEvent(index, "venueAddress", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
        </fieldset>
      ))}

      <div className="flex gap-3">
        <button type="button" onClick={addEvent} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          + Add Event
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saving..." : "Save Events"}
        </button>
      </div>
    </form>
  );
}

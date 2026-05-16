"use client";

import { useState, useEffect, FormEvent } from "react";
import CoupleEditor, { CoupleData } from "@/components/admin/CoupleEditor";
import EventEditor, { EventData } from "@/components/admin/EventEditor";
import GalleryManager, { GalleryPhoto } from "@/components/admin/GalleryManager";
import RSVPList from "@/components/admin/RSVPList";
import WishesManager from "@/components/admin/WishesManager";
import InvitationExporter from "@/components/admin/InvitationExporter";

type Tab = "couple" | "events" | "gallery" | "rsvps" | "wishes" | "exporter";

const tabs: { key: Tab; label: string }[] = [
  { key: "couple", label: "Couple" },
  { key: "events", label: "Events" },
  { key: "gallery", label: "Gallery" },
  { key: "rsvps", label: "RSVPs" },
  { key: "wishes", label: "Wishes" },
  { key: "exporter", label: "Exporter" },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("couple");
  const [loading, setLoading] = useState(true);
  const [coupleData, setCoupleData] = useState<CoupleData | null>(null);
  const [eventsData, setEventsData] = useState<EventData[] | null>(null);
  const [galleryData, setGalleryData] = useState<GalleryPhoto[] | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    fetch("/api/wedding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCoupleData({
            ...(data.couple || { bride: { firstName: "", lastName: "", photo: "", bio: "" }, groom: { firstName: "", lastName: "", photo: "", bio: "" }, loveStory: "" }),
            heroPhoto: data.heroPhoto || "",
            heroPhotoMobile: data.heroPhotoMobile || "",
          });
          const events = (data.events || []).map((ev: Record<string, unknown>) => ({
            _id: ev._id as string | undefined,
            title: (ev.title as string) || "",
            date: ev.date ? (ev.date as string).slice(0, 10) : "",
            time: (ev.time as string) || "",
            venueName: (ev.venueName as string) || "",
            venueAddress: (ev.venueAddress as string) || "",
          }));
          setEventsData(events);
          const gallery = (data.gallery || []).map((g: Record<string, unknown>) => ({
            _id: (g._id as string) || "",
            url: (g.url as string) || "",
            thumbnailUrl: (g.thumbnailUrl as string) || "",
            order: (g.order as number) || 0,
          }));
          setGalleryData(gallery);
        }
      })
      .catch(() => {
        // silently fail, editors will use empty defaults
      })
      .finally(() => setLoading(false));
  }, [authenticated]);

  if (authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              Admin Dashboard
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex border-b border-gray-200 mb-8" aria-label="Admin tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-selected={activeTab === tab.key}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {loading ? (
            <p className="text-gray-500">Loading wedding data...</p>
          ) : (
            <div role="tabpanel">
              {activeTab === "couple" && coupleData && (
                <CoupleEditor initialData={coupleData} />
              )}
              {activeTab === "events" && eventsData && (
                <EventEditor initialEvents={eventsData} />
              )}
              {activeTab === "gallery" && galleryData && (
                <GalleryManager initialPhotos={galleryData} />
              )}
              {activeTab === "rsvps" && <RSVPList />}
              {activeTab === "wishes" && <WishesManager />}
              {activeTab === "exporter" && <InvitationExporter />}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-4">
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          {error && (
            <p
              id="login-error"
              className="mb-4 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

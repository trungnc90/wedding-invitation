"use client";

import { useState, useEffect } from "react";

export interface RSVPEntry {
  _id: string;
  name: string;
  attending: boolean;
  numberOfAttendees: number;
  message?: string;
  createdAt: string;
}

export default function RSVPList() {
  const [rsvps, setRsvps] = useState<RSVPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/rsvps")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load RSVPs");
        return res.json();
      })
      .then((data: RSVPEntry[]) => setRsvps(data))
      .catch(() => setError("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading RSVPs...</p>;
  }

  if (error) {
    return <p className="text-red-600" role="alert">{error}</p>;
  }

  if (rsvps.length === 0) {
    return <p className="text-gray-500">No RSVPs submitted yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rsvps.map((rsvp) => (
            <tr key={rsvp._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rsvp.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={rsvp.attending ? "text-green-600" : "text-red-600"}>
                  {rsvp.attending ? "Attending" : "Not Attending"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rsvp.numberOfAttendees}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{rsvp.message || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export interface WishEntry {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

export default function WishesManager() {
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/wishes")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load wishes");
        return res.json();
      })
      .then((data: WishEntry[]) => setWishes(data))
      .catch(() => setError("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to delete wish");
        return;
      }
      setWishes((prev) => prev.filter((w) => w._id !== id));
      setError("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading wishes...</p>;
  }

  if (error && wishes.length === 0) {
    return <p className="text-red-600" role="alert">{error}</p>;
  }

  if (wishes.length === 0) {
    return <p className="text-gray-500">No wishes submitted yet.</p>;
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-red-600" role="alert">{error}</p>
      )}
      <ul className="space-y-4">
        {wishes.map((wish) => (
          <li key={wish._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{wish.name}</p>
              <p className="text-sm text-gray-600 mt-1">{wish.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(wish.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(wish._id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium shrink-0"
              aria-label={`Delete wish by ${wish.name}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";

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

export interface CoupleData {
  bride: WeddingPerson;
  groom: WeddingPerson;
  loveStory: string;
  heroPhoto?: string;
  heroPhotoMobile?: string;
}

interface CoupleEditorProps {
  initialData: CoupleData;
}

const emptyPerson: Person = { firstName: "", lastName: "", christianName: "" };

const emptyCoupleData: CoupleData = {
  bride: { ...emptyPerson, photo: "", bio: "", father: { ...emptyPerson }, mother: { ...emptyPerson } },
  groom: { ...emptyPerson, photo: "", bio: "", father: { ...emptyPerson }, mother: { ...emptyPerson } },
  loveStory: "",
  heroPhoto: "",
  heroPhotoMobile: "",
};

function ImageUpload({
  label,
  currentUrl,
  onUploaded,
}: {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Upload failed");
      }
      const data = await res.json();
      onUploaded(data.photo.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl && (
        <img src={currentUrl} alt={label} className="w-32 h-32 object-cover rounded-lg border" />
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="text-sm"
          disabled={uploading}
        />
        {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        type="text"
        value={currentUrl}
        onChange={(e) => onUploaded(e.target.value)}
        placeholder="Or paste URL directly"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
      />
    </div>
  );
}

function PersonFields({
  prefix,
  label,
  person,
  onChange,
}: {
  prefix: string;
  label: string;
  person: Person;
  onChange: (field: keyof Person, value: string) => void;
}) {
  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div>
        <label htmlFor={`${prefix}-christian`} className="block text-sm font-medium text-gray-700 mb-1">Christian Name</label>
        <input id={`${prefix}-christian`} type="text" value={person.christianName || ""} onChange={(e) => onChange("christianName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
      </div>
      <div>
        <label htmlFor={`${prefix}-first`} className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input id={`${prefix}-first`} type="text" value={person.firstName} onChange={(e) => onChange("firstName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
      </div>
      <div>
        <label htmlFor={`${prefix}-last`} className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input id={`${prefix}-last`} type="text" value={person.lastName} onChange={(e) => onChange("lastName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
      </div>
    </div>
  );
}

export default function CoupleEditor({ initialData }: CoupleEditorProps) {
  const [data, setData] = useState<CoupleData>(initialData || emptyCoupleData);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function updatePerson(side: "bride" | "groom", field: string, value: string) {
    setData((prev) => ({ ...prev, [side]: { ...prev[side], [field]: value } }));
  }

  function updateParent(side: "bride" | "groom", parent: "father" | "mother", field: keyof Person, value: string) {
    setData((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [parent]: { ...(prev[side][parent] || emptyPerson), [field]: value },
      },
    }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const { heroPhoto, heroPhotoMobile, ...coupleOnly } = data;
      const body: Record<string, unknown> = { couple: coupleOnly };
      if (heroPhoto !== undefined) body.heroPhoto = heroPhoto;
      if (heroPhotoMobile !== undefined) body.heroPhotoMobile = heroPhotoMobile;

      const res = await fetch("/api/admin/wedding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Saved successfully." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const err = await res.json().catch(() => null);
        setFeedback({ type: "error", message: err?.error || "Failed to save." });
      }
    } catch {
      setFeedback({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {feedback && (
        <div role="alert" className={`p-3 rounded-lg text-sm ${feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {feedback.message}
        </div>
      )}

      {/* Hero Photos */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-800">Hero Photos</legend>
        <ImageUpload
          label="Desktop Hero (16:9)"
          currentUrl={data.heroPhoto || ""}
          onUploaded={(url) => setData((prev) => ({ ...prev, heroPhoto: url }))}
        />
        <ImageUpload
          label="Mobile Hero (3:4)"
          currentUrl={data.heroPhotoMobile || ""}
          onUploaded={(url) => setData((prev) => ({ ...prev, heroPhotoMobile: url }))}
        />
      </fieldset>

      {(["bride", "groom"] as const).map((side) => (
        <fieldset key={side} className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">{side === "bride" ? "Bride" : "Groom"}</legend>
          <ImageUpload
            label="Photo"
            currentUrl={data[side].photo}
            onUploaded={(url) => updatePerson(side, "photo", url)}
          />
          <div>
            <label htmlFor={`${side}-christian`} className="block text-sm font-medium text-gray-700 mb-1">Christian Name</label>
            <input id={`${side}-christian`} type="text" value={data[side].christianName || ""} onChange={(e) => updatePerson(side, "christianName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <div>
            <label htmlFor={`${side}-first`} className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input id={`${side}-first`} type="text" value={data[side].firstName} onChange={(e) => updatePerson(side, "firstName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <div>
            <label htmlFor={`${side}-last`} className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input id={`${side}-last`} type="text" value={data[side].lastName} onChange={(e) => updatePerson(side, "lastName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <div>
            <label htmlFor={`${side}-bio`} className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea id={`${side}-bio`} rows={3} value={data[side].bio} onChange={(e) => updatePerson(side, "bio", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <PersonFields prefix={`${side}-father`} label="Father" person={data[side].father || emptyPerson} onChange={(field, value) => updateParent(side, "father", field, value)} />
          <PersonFields prefix={`${side}-mother`} label="Mother" person={data[side].mother || emptyPerson} onChange={(field, value) => updateParent(side, "mother", field, value)} />
        </fieldset>
      ))}

      <div className="space-y-2">
        <label htmlFor="love-story" className="block text-lg font-semibold text-gray-800">Love Story</label>
        <textarea id="love-story" rows={5} value={data.loveStory} onChange={(e) => setData((prev) => ({ ...prev, loveStory: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
      </div>

      <button type="submit" disabled={saving} className="px-6 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

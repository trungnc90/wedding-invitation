"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

export interface GalleryPhoto {
  _id: string;
  url: string;
  thumbnailUrl: string;
  order: number;
}

interface GalleryManagerProps {
  initialPhotos: GalleryPhoto[];
}

export default function GalleryManager({ initialPhotos }: GalleryManagerProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos || []);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos((prev) => [...prev, data.photo]);
        setFeedback({ type: "success", message: "Photo uploaded successfully." });
      } else {
        const err = await res.json().catch(() => null);
        setFeedback({ type: "error", message: err?.error || "Failed to upload photo." });
      }
    } catch {
      setFeedback({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p._id !== id));
        setFeedback({ type: "success", message: "Photo deleted successfully." });
      } else {
        const err = await res.json().catch(() => null);
        setFeedback({ type: "error", message: err?.error || "Failed to delete photo." });
      }
    } catch {
      setFeedback({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setDeleting(null);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  return (
    <div className="space-y-6">
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

      <div
        data-testid="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-pink-500 bg-pink-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <p className="text-gray-600 mb-3">
          {uploading ? "Uploading..." : "Drag and drop a photo here, or"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload photo"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Choose File"}
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500">No photos in the gallery yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo._id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={photo.thumbnailUrl || photo.url}
                alt="Gallery photo"
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                disabled={deleting === photo._id}
                onClick={() => handleDelete(photo._id)}
                className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                aria-label={`Delete photo ${photo._id}`}
              >
                {deleting === photo._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

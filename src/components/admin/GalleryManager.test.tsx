import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GalleryManager, { GalleryPhoto } from "./GalleryManager";

const samplePhotos: GalleryPhoto[] = [
  { _id: "photo1", url: "https://example.com/1.jpg", thumbnailUrl: "https://example.com/1_thumb.jpg", order: 1 },
  { _id: "photo2", url: "https://example.com/2.jpg", thumbnailUrl: "https://example.com/2_thumb.jpg", order: 2 },
];

describe("GalleryManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders gallery photos in a grid", () => {
    render(<GalleryManager initialPhotos={samplePhotos} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "https://example.com/1_thumb.jpg");
    expect(images[1]).toHaveAttribute("src", "https://example.com/2_thumb.jpg");
  });

  it("shows empty message when no photos", () => {
    render(<GalleryManager initialPhotos={[]} />);
    expect(screen.getByText("No photos in the gallery yet.")).toBeInTheDocument();
  });

  it("renders upload button and drop zone", () => {
    render(<GalleryManager initialPhotos={[]} />);
    expect(screen.getByRole("button", { name: "Choose File" })).toBeInTheDocument();
    expect(screen.getByTestId("drop-zone")).toBeInTheDocument();
  });

  it("renders delete button for each photo", () => {
    render(<GalleryManager initialPhotos={samplePhotos} />);
    expect(screen.getByLabelText("Delete photo photo1")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete photo photo2")).toBeInTheDocument();
  });

  it("uploads a file via POST and adds photo to grid", async () => {
    const newPhoto: GalleryPhoto = { _id: "photo3", url: "https://example.com/3.jpg", thumbnailUrl: "https://example.com/3_thumb.jpg", order: 3 };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, photo: newPhoto }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<GalleryManager initialPhotos={samplePhotos} />);

    const file = new File(["image-data"], "photo.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Upload photo");
    await user.upload(input, file);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/gallery/upload", expect.objectContaining({
        method: "POST",
      }));
    });

    await waitFor(() => {
      expect(screen.getByText("Photo uploaded successfully.")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("shows error on upload failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "File too large. Maximum size is 10MB" }), { status: 400 })
    );
    const user = userEvent.setup();
    render(<GalleryManager initialPhotos={samplePhotos} />);

    const file = new File(["data"], "big.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Upload photo");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("File too large. Maximum size is 10MB");
    });
  });

  it("shows error on upload network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<GalleryManager initialPhotos={samplePhotos} />);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Upload photo");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("deletes a photo via DELETE and removes from grid", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, deletedId: "photo1" }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<GalleryManager initialPhotos={samplePhotos} />);

    await user.click(screen.getByLabelText("Delete photo photo1"));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/gallery/photo1", { method: "DELETE" });
    });

    await waitFor(() => {
      expect(screen.getByText("Photo deleted successfully.")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("shows error on delete failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Photo not found" }), { status: 404 })
    );
    const user = userEvent.setup();
    render(<GalleryManager initialPhotos={samplePhotos} />);

    await user.click(screen.getByLabelText("Delete photo photo1"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Photo not found");
    });
  });

  it("handles drag-and-drop upload", async () => {
    const newPhoto: GalleryPhoto = { _id: "photo4", url: "https://example.com/4.jpg", thumbnailUrl: "https://example.com/4_thumb.jpg", order: 4 };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, photo: newPhoto }), { status: 200 })
    );
    render(<GalleryManager initialPhotos={[]} />);

    const dropZone = screen.getByTestId("drop-zone");
    const file = new File(["image-data"], "dropped.jpg", { type: "image/jpeg" });

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText("Photo uploaded successfully.")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});

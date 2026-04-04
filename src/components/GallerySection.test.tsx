import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GallerySection, {
  getNextIndex,
  getPrevIndex,
  GalleryPhoto,
} from "./GallerySection";

const makePhotos = (count: number): GalleryPhoto[] =>
  Array.from({ length: count }, (_, i) => ({
    _id: `photo-${i}`,
    url: `https://lh3.googleusercontent.com/full-${i}`,
    thumbnailUrl: `https://lh3.googleusercontent.com/thumb-${i}`,
    order: i,
  }));

describe("getNextIndex", () => {
  it("advances by one", () => {
    expect(getNextIndex(0, 5)).toBe(1);
    expect(getNextIndex(3, 5)).toBe(4);
  });

  it("wraps from last to first", () => {
    expect(getNextIndex(4, 5)).toBe(0);
  });

  it("handles single photo", () => {
    expect(getNextIndex(0, 1)).toBe(0);
  });
});

describe("getPrevIndex", () => {
  it("goes back by one", () => {
    expect(getPrevIndex(3, 5)).toBe(2);
    expect(getPrevIndex(1, 5)).toBe(0);
  });

  it("wraps from first to last", () => {
    expect(getPrevIndex(0, 5)).toBe(4);
  });

  it("handles single photo", () => {
    expect(getPrevIndex(0, 1)).toBe(0);
  });
});

describe("GallerySection", () => {
  it("renders nothing when photos array is empty", () => {
    const { container } = render(<GallerySection photos={[]} />);
    expect(container.querySelector("section")).toBeNull();
  });

  it("renders all photo thumbnails in a grid", () => {
    const photos = makePhotos(4);
    render(<GallerySection photos={photos} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(4);
  });

  it("renders the section heading", () => {
    render(<GallerySection photos={makePhotos(2)} />);
    expect(screen.getByText("Thư Viện Ảnh")).toBeInTheDocument();
  });

  it("opens lightbox when a photo is clicked", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    const buttons = screen.getAllByRole("button", { name: /Xem ảnh/ });
    fireEvent.click(buttons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("navigates to next photo in lightbox", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem ảnh/ })[0]);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ảnh tiếp"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("navigates to previous photo in lightbox", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem ảnh/ })[1]);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ảnh trước"));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("wraps navigation from last to first", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem ảnh/ })[2]);
    expect(screen.getByText("3 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ảnh tiếp"));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("wraps navigation from first to last", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem ảnh/ })[0]);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ảnh trước"));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("closes lightbox when close button is clicked", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem ảnh/ })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Đóng"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes lightbox on Escape key", () => {
    render(<GallerySection photos={makePhotos(3)} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem ảnh/ })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("uses lazy loading on thumbnail images", () => {
    render(<GallerySection photos={makePhotos(2)} />);
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });
});

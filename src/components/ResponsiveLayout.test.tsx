import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "./HeroSection";
import CoupleSection from "./CoupleSection";
import EventSection from "./EventSection";
import GallerySection from "./GallerySection";

describe("Responsive Layout", () => {
  describe("HeroSection responsive classes", () => {
    const props = {
      brideName: "Ngọc Anh",
      groomName: "Minh Tuấn",
      weddingDate: "2025-12-25T10:00:00Z",
      heroPhoto: "https://lh3.googleusercontent.com/test-photo",
    };

    it("renders heading with responsive font sizes", () => {
      render(<HeroSection {...props} />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).toMatch(/text-3xl/);
      expect(heading.className).toMatch(/sm:text-5xl/);
      expect(heading.className).toMatch(/md:text-6xl/);
      expect(heading.className).toMatch(/lg:text-7xl/);
    });

    it("renders full-screen hero section", () => {
      render(<HeroSection {...props} />);
      const section = screen.getByRole("heading", { level: 1 }).closest("section");
      expect(section?.className).toMatch(/min-h-screen/);
      expect(section?.className).toMatch(/w-full/);
    });
  });

  describe("CoupleSection responsive classes", () => {
    const props = {
      bride: {
        name: "Ngọc Anh",
        photo: "https://lh3.googleusercontent.com/bride",
        bio: "Bio",
      },
      groom: {
        name: "Minh Tuấn",
        photo: "https://lh3.googleusercontent.com/groom",
        bio: "Bio",
      },
      loveStory: "Love story",
    };

    it("uses single column on mobile and two columns on tablet+", () => {
      render(<CoupleSection {...props} />);
      const section = screen.getByRole("heading", { level: 2, name: /Cô Dâu/ }).closest("section");
      const grid = section?.querySelector(".grid");
      expect(grid?.className).toMatch(/grid-cols-1/);
      expect(grid?.className).toMatch(/md:grid-cols-2/);
    });

    it("has responsive section padding", () => {
      render(<CoupleSection {...props} />);
      const section = screen.getByRole("heading", { level: 2, name: /Cô Dâu/ }).closest("section");
      expect(section?.className).toMatch(/py-10/);
      expect(section?.className).toMatch(/sm:py-12/);
      expect(section?.className).toMatch(/md:py-16/);
    });

    it("has responsive heading font size", () => {
      render(<CoupleSection {...props} />);
      const heading = screen.getByRole("heading", { level: 2, name: /Cô Dâu/ });
      expect(heading.className).toMatch(/text-2xl/);
      expect(heading.className).toMatch(/sm:text-3xl/);
    });
  });

  describe("EventSection responsive classes", () => {
    const events = [
      {
        title: "Lễ Cưới",
        date: "2025-03-15T00:00:00.000Z",
        time: "10:00",
        venueName: "Nhà Hàng ABC",
        venueAddress: "123 Đường Lê Lợi",
      },
      {
        title: "Tiệc Cưới",
        date: "2025-03-15T00:00:00.000Z",
        time: "18:00",
        venueName: "Khách Sạn XYZ",
        venueAddress: "456 Đường Nguyễn Huệ",
      },
    ];

    it("uses single column on mobile and two columns on tablet+", () => {
      render(<EventSection events={events} />);
      const section = screen.getByRole("heading", { level: 2, name: /Sự Kiện/ }).closest("section");
      const grid = section?.querySelector(".grid");
      expect(grid?.className).toMatch(/grid-cols-1/);
      expect(grid?.className).toMatch(/md:grid-cols-2/);
    });

    it("has responsive section padding", () => {
      render(<EventSection events={events} />);
      const section = screen.getByRole("heading", { level: 2, name: /Sự Kiện/ }).closest("section");
      expect(section?.className).toMatch(/py-10/);
      expect(section?.className).toMatch(/sm:py-12/);
      expect(section?.className).toMatch(/md:py-16/);
    });
  });

  describe("GallerySection responsive classes", () => {
    const photos = [
      { _id: "1", url: "https://example.com/1.jpg", thumbnailUrl: "https://example.com/1t.jpg", order: 1 },
      { _id: "2", url: "https://example.com/2.jpg", thumbnailUrl: "https://example.com/2t.jpg", order: 2 },
    ];

    it("uses progressive grid columns across breakpoints", () => {
      render(<GallerySection photos={photos} />);
      const section = screen.getByRole("heading", { level: 2, name: /Thư Viện/ }).closest("section");
      const grid = section?.querySelector(".grid");
      expect(grid?.className).toMatch(/grid-cols-2/);
      expect(grid?.className).toMatch(/sm:grid-cols-3/);
      expect(grid?.className).toMatch(/md:grid-cols-4/);
    });

    it("has responsive section padding", () => {
      render(<GallerySection photos={photos} />);
      const section = screen.getByRole("heading", { level: 2, name: /Thư Viện/ }).closest("section");
      expect(section?.className).toMatch(/py-10/);
      expect(section?.className).toMatch(/sm:py-12/);
      expect(section?.className).toMatch(/md:py-16/);
    });
  });
});

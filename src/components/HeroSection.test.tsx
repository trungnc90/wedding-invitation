import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "./HeroSection";

describe("HeroSection", () => {
  const defaultProps = {
    brideName: "Ngọc Anh",
    groomName: "Minh Tuấn",
    weddingDate: "2025-12-25T10:00:00Z",
    heroPhoto: "https://lh3.googleusercontent.com/test-photo",
  };

  it("renders couple names", () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText(/Minh Tuấn/)).toBeInTheDocument();
    expect(screen.getByText(/Ngọc Anh/)).toBeInTheDocument();
  });

  it("renders the wedding date in Vietnamese format", () => {
    render(<HeroSection {...defaultProps} />);
    // The formatted date should contain the year at minimum
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it("renders the hero background image with correct alt text", () => {
    render(<HeroSection {...defaultProps} />);
    const img = screen.getByAltText("Ngọc Anh & Minh Tuấn");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("googleusercontent.com")
    );
  });

  it("renders the countdown timer", () => {
    render(<HeroSection {...defaultProps} />);
    // Countdown labels in Vietnamese
    expect(screen.getByText("Ngày")).toBeInTheDocument();
    expect(screen.getByText("Giờ")).toBeInTheDocument();
    expect(screen.getByText("Phút")).toBeInTheDocument();
    expect(screen.getByText("Giây")).toBeInTheDocument();
  });
});

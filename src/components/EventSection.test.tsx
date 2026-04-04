import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventSection from "./EventSection";

describe("EventSection", () => {
  const sampleEvents = [
    {
      title: "Lễ Cưới",
      date: "2025-03-15T00:00:00.000Z",
      time: "10:00",
      venueName: "Nhà Hàng ABC",
      venueAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    },
    {
      title: "Tiệc Cưới",
      date: "2025-03-15T00:00:00.000Z",
      time: "18:00",
      venueName: "Khách Sạn XYZ",
      venueAddress: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    },
  ];

  it("renders the section heading", () => {
    render(<EventSection events={sampleEvents} />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Sự Kiện Cưới/ })
    ).toBeInTheDocument();
  });

  it("renders all event cards", () => {
    render(<EventSection events={sampleEvents} />);
    expect(screen.getByText("Lễ Cưới")).toBeInTheDocument();
    expect(screen.getByText("Tiệc Cưới")).toBeInTheDocument();
  });

  it("renders event time and venue name", () => {
    render(<EventSection events={sampleEvents} />);
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("Nhà Hàng ABC")).toBeInTheDocument();
    expect(screen.getByText("Khách Sạn XYZ")).toBeInTheDocument();
  });

  it("renders venue address as a Google Maps link", () => {
    render(<EventSection events={sampleEvents} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);

    const firstLink = links[0];
    expect(firstLink).toHaveTextContent("123 Đường Lê Lợi, Quận 1, TP.HCM");
    expect(firstLink).toHaveAttribute(
      "href",
      `https://maps.google.com/?q=${encodeURIComponent("123 Đường Lê Lợi, Quận 1, TP.HCM")}`
    );

    const secondLink = links[1];
    expect(secondLink).toHaveTextContent(
      "456 Đường Nguyễn Huệ, Quận 1, TP.HCM"
    );
    expect(secondLink).toHaveAttribute(
      "href",
      `https://maps.google.com/?q=${encodeURIComponent("456 Đường Nguyễn Huệ, Quận 1, TP.HCM")}`
    );
  });

  it("opens Google Maps links in a new tab", () => {
    render(<EventSection events={sampleEvents} />);
    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders empty state when no events provided", () => {
    render(<EventSection events={[]} />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Sự Kiện Cưới/ })
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders a single event correctly", () => {
    render(<EventSection events={[sampleEvents[0]]} />);
    expect(screen.getByText("Lễ Cưới")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Nhà Hàng ABC")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventEditor, { EventData } from "./EventEditor";

const sampleEvents: EventData[] = [
  {
    title: "Ceremony",
    date: "2025-06-15",
    time: "10:00",
    venueName: "Grand Hall",
    venueAddress: "123 Main St",
  },
];

describe("EventEditor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders existing events with form fields", () => {
    render(<EventEditor initialEvents={sampleEvents} />);

    expect(screen.getByLabelText("Title")).toHaveValue("Ceremony");
    expect(screen.getByLabelText("Date")).toHaveValue("2025-06-15");
    expect(screen.getByLabelText("Time")).toHaveValue("10:00");
    expect(screen.getByLabelText("Venue Name")).toHaveValue("Grand Hall");
    expect(screen.getByLabelText("Venue Address")).toHaveValue("123 Main St");
  });

  it("renders add event and save buttons", () => {
    render(<EventEditor initialEvents={[]} />);
    expect(screen.getByRole("button", { name: "+ Add Event" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Events" })).toBeInTheDocument();
  });

  it("adds a new empty event when clicking add", async () => {
    const user = userEvent.setup();
    render(<EventEditor initialEvents={[]} />);

    await user.click(screen.getByRole("button", { name: "+ Add Event" }));

    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("removes an event when clicking remove", async () => {
    const user = userEvent.setup();
    render(<EventEditor initialEvents={sampleEvents} />);

    expect(screen.getByText("Event 1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove event 1" }));

    expect(screen.queryByText("Event 1")).not.toBeInTheDocument();
  });

  it("sends PUT request with events data on save", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<EventEditor initialEvents={sampleEvents} />);

    await user.click(screen.getByRole("button", { name: "Save Events" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/wedding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: sampleEvents }),
      });
    });
  });

  it("shows success feedback after saving", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<EventEditor initialEvents={sampleEvents} />);

    await user.click(screen.getByRole("button", { name: "Save Events" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Events saved successfully.");
    });
  });

  it("shows error feedback on failed save", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );
    const user = userEvent.setup();
    render(<EventEditor initialEvents={sampleEvents} />);

    await user.click(screen.getByRole("button", { name: "Save Events" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    });
  });

  it("shows error feedback on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<EventEditor initialEvents={sampleEvents} />);

    await user.click(screen.getByRole("button", { name: "Save Events" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });
});

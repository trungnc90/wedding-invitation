import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RSVPList, { RSVPEntry } from "./RSVPList";

const sampleRsvps: RSVPEntry[] = [
  { _id: "r1", name: "Alice", attending: true, numberOfAttendees: 3, message: "Can't wait!", createdAt: "2024-06-01T00:00:00Z" },
  { _id: "r2", name: "Bob", attending: false, numberOfAttendees: 1, message: "", createdAt: "2024-06-02T00:00:00Z" },
  { _id: "r3", name: "Charlie", attending: true, numberOfAttendees: 2, createdAt: "2024-06-03T00:00:00Z" },
];

describe("RSVPList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    render(<RSVPList />);
    expect(screen.getByText("Loading RSVPs...")).toBeInTheDocument();
  });

  it("renders RSVP table after fetching data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(sampleRsvps), { status: 200 })
    );
    render(<RSVPList />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getAllByText("Attending")).toHaveLength(2);
    expect(screen.getByText("Not Attending")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Can't wait!")).toBeInTheDocument();
  });

  it("shows empty state when no RSVPs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    render(<RSVPList />);

    await waitFor(() => {
      expect(screen.getByText("No RSVPs submitted yet.")).toBeInTheDocument();
    });
  });

  it("shows dash for missing message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([sampleRsvps[2]]), { status: 200 })
    );
    render(<RSVPList />);

    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("shows error on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    render(<RSVPList />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("shows error on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );
    render(<RSVPList />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("fetches from /api/admin/rsvps", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    render(<RSVPList />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/rsvps");
    });
  });
});

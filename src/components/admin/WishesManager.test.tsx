import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WishesManager, { WishEntry } from "./WishesManager";

const sampleWishes: WishEntry[] = [
  { _id: "w1", name: "Alice", message: "Congratulations!", createdAt: "2024-06-01T00:00:00Z" },
  { _id: "w2", name: "Bob", message: "Best wishes to you both!", createdAt: "2024-06-02T00:00:00Z" },
];

describe("WishesManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    render(<WishesManager />);
    expect(screen.getByText("Loading wishes...")).toBeInTheDocument();
  });

  it("renders wishes after fetching data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(sampleWishes), { status: 200 })
    );
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Best wishes to you both!")).toBeInTheDocument();
  });

  it("shows empty state when no wishes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByText("No wishes submitted yet.")).toBeInTheDocument();
    });
  });

  it("renders delete button for each wish", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(sampleWishes), { status: 200 })
    );
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByLabelText("Delete wish by Alice")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Delete wish by Bob")).toBeInTheDocument();
  });

  it("deletes a wish and removes it from the list", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWishes), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, deletedId: "w1" }), { status: 200 })
      );
    const user = userEvent.setup();
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Delete wish by Alice"));

    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("calls DELETE /api/admin/wishes/:id on delete", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWishes), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
    const user = userEvent.setup();
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Delete wish by Alice"));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/wishes/w1", { method: "DELETE" });
    });
  });

  it("shows error on delete failure", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWishes), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
      );
    const user = userEvent.setup();
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Delete wish by Alice"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Not found");
    });
  });

  it("shows error on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("shows error on delete network failure", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWishes), { status: 200 })
      )
      .mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<WishesManager />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Delete wish by Alice"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("fetches from /api/wishes on mount", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    render(<WishesManager />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/wishes");
    });
  });
});

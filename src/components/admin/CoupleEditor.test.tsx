import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CoupleEditor, { CoupleData } from "./CoupleEditor";

const sampleData: CoupleData = {
  bride: {
    firstName: "Jane",
    lastName: "Doe",
    christianName: "Maria",
    photo: "https://example.com/jane.jpg",
    bio: "A lovely person",
    father: { firstName: "John Sr", lastName: "Doe", christianName: "Joseph" },
    mother: { firstName: "Mary", lastName: "Smith", christianName: "Anna" },
  },
  groom: {
    firstName: "John",
    lastName: "Lee",
    christianName: "Joseph",
    photo: "https://example.com/john.jpg",
    bio: "A great person",
    father: { firstName: "James", lastName: "Lee", christianName: "Peter" },
    mother: { firstName: "Susan", lastName: "Tran", christianName: "Maria" },
  },
  loveStory: "They met at a coffee shop.",
};

describe("CoupleEditor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders bride fields with initial data", () => {
    render(<CoupleEditor initialData={sampleData} />);
    expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://example.com/jane.jpg")).toBeInTheDocument();
  });

  it("renders groom fields with initial data", () => {
    render(<CoupleEditor initialData={sampleData} />);
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lee")).toBeInTheDocument();
  });

  it("renders parent fields for bride", () => {
    render(<CoupleEditor initialData={sampleData} />);
    expect(screen.getByDisplayValue("John Sr")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mary")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Joseph")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Anna")).toBeInTheDocument();
  });

  it("renders parent fields for groom", () => {
    render(<CoupleEditor initialData={sampleData} />);
    expect(screen.getByDisplayValue("James")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Susan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Peter")).toBeInTheDocument();
  });

  it("renders love story", () => {
    render(<CoupleEditor initialData={sampleData} />);
    expect(screen.getByDisplayValue("They met at a coffee shop.")).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<CoupleEditor initialData={sampleData} />);
    expect(screen.getByRole("button", { name: "Save Couple Info" })).toBeInTheDocument();
  });

  it("sends PUT request on save", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<CoupleEditor initialData={sampleData} />);

    await user.click(screen.getByRole("button", { name: "Save Couple Info" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/wedding", expect.objectContaining({
        method: "PUT",
      }));
    });
  });

  it("shows success feedback after saving", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<CoupleEditor initialData={sampleData} />);

    await user.click(screen.getByRole("button", { name: "Save Couple Info" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Couple info saved successfully.");
    });
  });

  it("shows error feedback on failed save", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Auth required" }), { status: 401 })
    );
    const user = userEvent.setup();
    render(<CoupleEditor initialData={sampleData} />);

    await user.click(screen.getByRole("button", { name: "Save Couple Info" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Auth required");
    });
  });

  it("shows error feedback on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<CoupleEditor initialData={sampleData} />);

    await user.click(screen.getByRole("button", { name: "Save Couple Info" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });
});

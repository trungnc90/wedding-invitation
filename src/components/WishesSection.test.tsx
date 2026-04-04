import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WishesSection, { Wish } from "./WishesSection";

const mockWishes: Wish[] = [
  { _id: "1", name: "Nguyễn Văn A", message: "Chúc mừng hạnh phúc!", createdAt: "2024-06-15T10:00:00.000Z" },
  { _id: "2", name: "Trần Thị B", message: "Trăm năm hạnh phúc!", createdAt: "2024-06-14T08:00:00.000Z" },
];

const manyWishes: Wish[] = Array.from({ length: 12 }, (_, i) => ({
  _id: `wish-${i + 1}`,
  name: `Người gửi ${i + 1}`,
  message: `Lời chúc số ${i + 1}`,
  createdAt: new Date(2024, 5, 15 - i).toISOString(),
}));

describe("WishesSection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders initial wishes with name, message, and date", () => {
    render(<WishesSection initialWishes={mockWishes} />);
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("Chúc mừng hạnh phúc!")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
  });

  it("shows empty state when no wishes", () => {
    render(<WishesSection initialWishes={[]} />);
    expect(screen.getByText("Chưa có lời chúc nào.")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<WishesSection initialWishes={[]} />);
    expect(screen.getByLabelText(/Họ và tên/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lời chúc/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gửi Lời Chúc/ })).toBeInTheDocument();
  });

  it("shows validation error when name is empty on submit", async () => {
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));
    expect(screen.getByText("Vui lòng nhập tên của bạn")).toBeInTheDocument();
  });

  it("shows validation error when message is empty on submit", async () => {
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);
    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));
    expect(screen.getByText("Vui lòng nhập lời chúc")).toBeInTheDocument();
  });

  it("does not submit when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits valid wish and adds it to the list", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn C");
    await user.type(screen.getByLabelText(/Lời chúc/), "Hạnh phúc mãi mãi!");
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn C")).toBeInTheDocument();
    });
  });

  it("sends correct payload to API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn C");
    await user.type(screen.getByLabelText(/Lời chúc/), "Hạnh phúc!");
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nguyễn Văn C", message: "Hạnh phúc!" }),
      });
    });
  });

  it("disables submit button while submitting", async () => {
    let resolveFetch: (value: Response) => void;
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Test");
    await user.type(screen.getByLabelText(/Lời chúc/), "Test message");
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));

    expect(screen.getByRole("button", { name: /Đang gửi/ })).toBeDisabled();

    resolveFetch!(new Response(JSON.stringify({ success: true }), { status: 201 }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Gửi Lời Chúc/ })).toBeEnabled();
    });
  });

  it("shows error message when API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 503 })
    );
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Test");
    await user.type(screen.getByLabelText(/Lời chúc/), "Test message");
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));

    await waitFor(() => {
      expect(screen.getByText("Service temporarily unavailable")).toBeInTheDocument();
    });
  });

  it("resets form after successful submission", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<WishesSection initialWishes={[]} />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Test");
    await user.type(screen.getByLabelText(/Lời chúc/), "Test message");
    await user.click(screen.getByRole("button", { name: /Gửi Lời Chúc/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Họ và tên/)).toHaveValue("");
      expect(screen.getByLabelText(/Lời chúc/)).toHaveValue("");
    });
  });

  it("displays wishes in order (newest first from props)", () => {
    const wishes: Wish[] = [
      { _id: "new", name: "New", message: "Newest", createdAt: "2024-12-01T00:00:00Z" },
      { _id: "old", name: "Old", message: "Oldest", createdAt: "2024-01-01T00:00:00Z" },
    ];
    render(<WishesSection initialWishes={wishes} />);
    const names = screen.getAllByRole("heading", { level: 3 });
    expect(names[0]).toHaveTextContent("New");
    expect(names[1]).toHaveTextContent("Old");
  });

  // Pagination tests
  it("shows only first 5 wishes when more than 5 exist", () => {
    render(<WishesSection initialWishes={manyWishes} />);
    const names = screen.getAllByRole("heading", { level: 3 });
    expect(names).toHaveLength(5);
    expect(screen.getByText("Người gửi 1")).toBeInTheDocument();
    expect(screen.getByText("Người gửi 5")).toBeInTheDocument();
    expect(screen.queryByText("Người gửi 6")).not.toBeInTheDocument();
  });

  it("shows scroll hint when more wishes exist", () => {
    render(<WishesSection initialWishes={manyWishes} />);
    expect(screen.getByText(/Cuộn xuống để xem thêm/)).toBeInTheDocument();
  });

  it("does not show scroll hint when all wishes fit", () => {
    render(<WishesSection initialWishes={mockWishes} />);
    expect(screen.queryByText(/Cuộn xuống để xem thêm/)).not.toBeInTheDocument();
  });

  it("has a scrollable container with max height", () => {
    const { container } = render(<WishesSection initialWishes={manyWishes} />);
    const scrollContainer = container.querySelector(".overflow-y-auto");
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.className).toContain("max-h-");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RSVPForm from "./RSVPForm";

describe("RSVPForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all form fields", () => {
    render(<RSVPForm />);
    expect(screen.getByLabelText(/Họ và tên/)).toBeInTheDocument();
    expect(screen.getByText(/Có, tôi sẽ tham dự/)).toBeInTheDocument();
    expect(screen.getByText(/Không thể tham dự/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lời nhắn/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gửi Xác Nhận/ })).toBeInTheDocument();
  });

  it("does not show number of attendees select by default", () => {
    render(<RSVPForm />);
    expect(screen.queryByLabelText(/Số người tham dự/)).not.toBeInTheDocument();
  });

  it("shows number of attendees select when attending is yes", async () => {
    const user = userEvent.setup();
    render(<RSVPForm />);
    await user.click(screen.getByLabelText(/Có, tôi sẽ tham dự/));
    expect(screen.getByLabelText(/Số người tham dự/)).toBeInTheDocument();
  });

  it("hides number of attendees when attending is no", async () => {
    const user = userEvent.setup();
    render(<RSVPForm />);
    await user.click(screen.getByLabelText(/Có, tôi sẽ tham dự/));
    expect(screen.getByLabelText(/Số người tham dự/)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Không thể tham dự/));
    expect(screen.queryByLabelText(/Số người tham dự/)).not.toBeInTheDocument();
  });

  it("shows validation error when name is empty on submit", async () => {
    const user = userEvent.setup();
    render(<RSVPForm />);
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));
    expect(screen.getByText(/Vui lòng nhập tên của bạn/)).toBeInTheDocument();
  });

  it("shows validation error when attending is not selected", async () => {
    const user = userEvent.setup();
    render(<RSVPForm />);
    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));
    expect(screen.getByText(/Vui lòng xác nhận tham dự/)).toBeInTheDocument();
  });

  it("does not submit when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<RSVPForm />);
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits valid form and shows success message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<RSVPForm />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByLabelText(/Có, tôi sẽ tham dự/));
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));

    await waitFor(() => {
      expect(screen.getByText(/Cảm ơn bạn đã xác nhận tham dự/)).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting", async () => {
    let resolveFetch: (value: Response) => void;
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const user = userEvent.setup();
    render(<RSVPForm />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByLabelText(/Không thể tham dự/));
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));

    expect(screen.getByRole("button", { name: /Đang gửi/ })).toBeDisabled();

    resolveFetch!(new Response(JSON.stringify({ success: true }), { status: 201 }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Gửi Xác Nhận/ })).toBeEnabled();
    });
  });

  it("shows error message when API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 503 })
    );
    const user = userEvent.setup();
    render(<RSVPForm />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByLabelText(/Có, tôi sẽ tham dự/));
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));

    await waitFor(() => {
      expect(screen.getByText(/Service temporarily unavailable/)).toBeInTheDocument();
    });
  });

  it("sends correct payload for attending guest", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<RSVPForm />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByLabelText(/Có, tôi sẽ tham dự/));
    await user.selectOptions(screen.getByLabelText(/Số người tham dự/), "3");
    await user.type(screen.getByLabelText(/Lời nhắn/), "Chúc mừng!");
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Nguyễn Văn A",
          attending: true,
          numberOfAttendees: 3,
          message: "Chúc mừng!",
        }),
      });
    });
  });

  it("resets form after successful submission", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<RSVPForm />);

    await user.type(screen.getByLabelText(/Họ và tên/), "Nguyễn Văn A");
    await user.click(screen.getByLabelText(/Không thể tham dự/));
    await user.click(screen.getByRole("button", { name: /Gửi Xác Nhận/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Họ và tên/)).toHaveValue("");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "./page";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login form when not authenticated", () => {
    render(<AdminPage />);
    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("does not show dashboard content initially", () => {
    render(<AdminPage />);
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("shows dashboard after successful login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
  });

  it('displays "Invalid password" error on 401 response', async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
      })
    );
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeInTheDocument();
    });
  });

  it("sends POST to /api/admin/login with the password", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "my-secret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "my-secret" }),
      });
    });
  });

  it("disables the submit button while logging in", async () => {
    let resolveFetch: (value: Response) => void;
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "test");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled();

    resolveFetch!(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
  });

  it("shows generic error on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "test");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("clears error when retrying login", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Invalid password" }), {
          status: 401,
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "correct");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
    expect(screen.queryByText("Invalid password")).not.toBeInTheDocument();
  });

  it("hides login form after successful authentication", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByLabelText("Password"), "correct");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.queryByText("Admin Login")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    });
  });
});

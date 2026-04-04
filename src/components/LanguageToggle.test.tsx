import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageToggle from "./LanguageToggle";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      label: "Ngôn ngữ",
      vi: "VI",
      en: "EN",
    };
    return translations[key] ?? key;
  },
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset cookie
    document.cookie = "locale=;path=/;max-age=0";
    // Re-mock refresh since restoreAllMocks clears it
    mockRefresh.mockReset();
  });

  it("renders nothing when hasEnglish is false", () => {
    const { container } = render(<LanguageToggle hasEnglish={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders toggle button when hasEnglish is true", () => {
    render(<LanguageToggle hasEnglish={true} />);
    const button = screen.getByRole("button", { name: "Ngôn ngữ" });
    expect(button).toBeInTheDocument();
  });

  it("displays VI and EN labels", () => {
    render(<LanguageToggle hasEnglish={true} />);
    expect(screen.getByText("VI")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("sets locale cookie and calls router.refresh on click", async () => {
    const user = userEvent.setup();
    render(<LanguageToggle hasEnglish={true} />);

    const button = screen.getByRole("button", { name: "Ngôn ngữ" });
    await user.click(button);

    // Should have set the locale cookie to 'en' (switching from default 'vi')
    expect(document.cookie).toContain("locale=en");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("toggles from en back to vi", async () => {
    // Set initial locale to en
    document.cookie = "locale=en;path=/";

    const user = userEvent.setup();
    render(<LanguageToggle hasEnglish={true} />);

    const button = screen.getByRole("button", { name: "Ngôn ngữ" });
    await user.click(button);

    expect(document.cookie).toContain("locale=vi");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});

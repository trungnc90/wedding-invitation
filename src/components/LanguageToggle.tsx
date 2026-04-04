"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface LanguageToggleProps {
  hasEnglish: boolean;
}

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365}`;
}

export default function LanguageToggle({ hasEnglish }: LanguageToggleProps) {
  const router = useRouter();
  const t = useTranslations("LanguageToggle");

  if (!hasEnglish) {
    return null;
  }

  const currentLocale =
    typeof document !== "undefined"
      ? (document.cookie
          .split("; ")
          .find((c) => c.startsWith("locale="))
          ?.split("=")[1] ?? "vi")
      : "vi";

  const handleToggle = () => {
    const newLocale = currentLocale === "vi" ? "en" : "vi";
    setLocaleCookie(newLocale);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={t("label")}
      className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium shadow-md backdrop-blur transition hover:bg-white"
    >
      <span className={currentLocale === "vi" ? "text-rose-600 font-bold" : "text-gray-500"}>
        {t("vi")}
      </span>
      <span className="text-gray-300">/</span>
      <span className={currentLocale === "en" ? "text-rose-600 font-bold" : "text-gray-500"}>
        {t("en")}
      </span>
    </button>
  );
}

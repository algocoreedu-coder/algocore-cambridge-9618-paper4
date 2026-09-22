"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import { type ReactNode, useEffect, useState } from "react";

import type { LearningLocale } from "@/app/components/paper4-learning";

export const localeChangeEvent = "algocore:locale-change";

const viTranslations = {
  "On this page(table of contents)": "Trong bài này",
  "Toggle Theme(theme switcher)(aria-label)": "Đổi giao diện sáng tối",
  "Collapse Sidebar(sidebar)(aria-label)": "Thu gọn điều hướng",
  "Open Sidebar(sidebar)(aria-label)": "Mở điều hướng",
  "Close Sidebar(sidebar)(aria-label)": "Đóng điều hướng",
};

function localeFromLocation(fallback: LearningLocale): LearningLocale {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "vi";
}

export function AppProviders({
  children,
  initialLocale,
}: {
  readonly children: ReactNode;
  readonly initialLocale: LearningLocale;
}) {
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const updateFromHistory = () => setLocale(localeFromLocation(initialLocale));
    const updateFromLesson = (event: Event) => {
      const requested = (event as CustomEvent<LearningLocale>).detail;
      setLocale(requested === "en" ? "en" : "vi");
    };
    window.addEventListener("popstate", updateFromHistory);
    window.addEventListener(localeChangeEvent, updateFromLesson);
    return () => {
      window.removeEventListener("popstate", updateFromHistory);
      window.removeEventListener(localeChangeEvent, updateFromLesson);
    };
  }, [initialLocale]);

  return (
    <RootProvider
      search={{ enabled: false }}
      theme={{ defaultTheme: "light" }}
      i18n={{
        locale,
        translations: locale === "vi" ? viTranslations : {},
      }}
    >
      {children}
    </RootProvider>
  );
}

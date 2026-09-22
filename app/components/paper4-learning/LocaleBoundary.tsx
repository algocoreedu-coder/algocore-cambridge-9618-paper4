"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";

import { localeChangeEvent } from "@/app/AppProviders";
import type { LearningLocale } from "./types";

export function LocaleBoundary({
  children,
  locale,
}: {
  readonly children: ReactNode;
  readonly locale: LearningLocale;
}) {
  const boundary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent<LearningLocale>(localeChangeEvent, { detail: locale }));
    const localeControl = boundary.current?.querySelector<HTMLButtonElement>(
      `[data-action="locale-${locale}"]`,
    );
    if (localeControl?.getAttribute("aria-pressed") !== "true") {
      localeControl?.click();
    }
  }, [locale]);

  return <div ref={boundary} lang={locale} style={{ display: "contents" }}>{children}</div>;
}

export function LocaleLink({
  currentLocale,
  locale,
  slug,
}: {
  readonly currentLocale: LearningLocale;
  readonly locale: LearningLocale;
  readonly slug: string;
}) {
  const router = useRouter();
  const href = `/paper-4/lessons/${slug}?lang=${locale}`;
  const onNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent<LearningLocale>(localeChangeEvent, { detail: locale }));
    router.push(`${href}${window.location.hash}`);
  };

  return (
    <Link
      href={href}
      hrefLang={locale}
      lang={locale}
      aria-current={currentLocale === locale ? "page" : undefined}
      onClick={onNavigate}
    >
      {locale === "vi" ? "Tiếng Việt" : "English"}
    </Link>
  );
}

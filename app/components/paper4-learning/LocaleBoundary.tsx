"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useEffect } from "react";

import { localeChangeEvent } from "@/app/AppProviders";
import type { LearningLocale } from "./types";

export function LocaleBoundary({
  children,
  locale,
}: {
  readonly children?: ReactNode;
  readonly locale: LearningLocale;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent<LearningLocale>(localeChangeEvent, { detail: locale }));
  }, [locale]);

  return children ? <div lang={locale} style={{ display: "contents" }}>{children}</div> : null;
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
    const query = new URLSearchParams(window.location.search);
    query.set("lang", locale);
    window.dispatchEvent(new CustomEvent<LearningLocale>(localeChangeEvent, { detail: locale }));
    router.push(`/paper-4/lessons/${slug}?${query.toString()}${window.location.hash}`, { scroll: false });
  };

  return (
    <Link
      href={href}
      data-locale-switch
      hrefLang={locale}
      lang={locale}
      aria-current={currentLocale === locale ? "page" : undefined}
      onClick={onNavigate}
    >
      {locale === "vi" ? "Tiếng Việt" : "English"}
    </Link>
  );
}

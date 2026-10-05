"use client";

import { useEffect } from "react";
import { localeChangeEvent } from "@/app/AppProviders";
import type { Locale } from "@/app/lib/paper3/catalog";

export function Paper3LocaleBoundary({ locale }: { readonly locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent(localeChangeEvent, { detail: locale }));
  }, [locale]);
  return null;
}

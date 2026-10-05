"use client";

import { useEffect } from "react";
import { localeChangeEvent } from "@/app/AppProviders";
import type { Locale } from "@/app/lib/paper2/types";

export function Paper2LocaleBoundary({ locale }: { readonly locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent(localeChangeEvent, { detail: locale }));
  }, [locale]);
  return null;
}

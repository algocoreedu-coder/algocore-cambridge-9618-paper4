"use client";

import Link from "next/link";
import { useLearningLocale } from "@/app/AppProviders";

export default function Paper3NotFound() {
  const locale = useLearningLocale();
  return <section className="mx-auto w-full max-w-3xl p-6 py-16" data-paper3-not-found>
    <p className="mb-3 font-semibold">Paper 3 · 404</p>
    <h1 className="mb-4 text-3xl font-bold">{locale === "vi" ? "Không tìm thấy mục này" : "This page was not found"}</h1>
    <p className="mb-6">{locale === "vi" ? "Quay về Study Map để chọn section hoặc topic có trong khóa học." : "Return to the study map to choose a section or topic in this course."}</p>
    <Link className="inline-flex min-h-11 items-center rounded-lg border px-4 font-semibold underline underline-offset-4" href={`/paper-3?lang=${locale}`}>
      {locale === "vi" ? "Về Study Map" : "Back to the study map"}
    </Link>
  </section>;
}

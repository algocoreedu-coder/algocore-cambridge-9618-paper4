"use client";
import Link from "next/link";
import { useLearningLocale } from "@/app/AppProviders";
import { paper2Href } from "@/app/lib/paper2/catalog";

export default function NotFound() {
  const locale = useLearningLocale();
  return <section className="p-6 space-y-4">
    <p>Paper 2 · 404</p>
    <h1 className="text-2xl font-semibold">{locale === "vi" ? "Không tìm thấy nội dung này" : "This page could not be found"}</h1>
    <p>{locale === "vi" ? "Chọn một trong 12 mục trên bản đồ học tập để tiếp tục." : "Choose one of the twelve syllabus sections on the study map to continue."}</p>
    <Link className="inline-flex min-h-11 items-center underline" href={paper2Href("/paper-2", locale)}>{locale === "vi" ? "Về bản đồ học tập" : "Back to the study map"}</Link>
  </section>;
}

"use client";
import Link from "next/link";
import { useLearningLocale } from "@/app/AppProviders";
import { Button } from "@/app/components/algocore-ui";
import { paper2Href } from "@/app/lib/paper2/catalog";

export default function ErrorPage({ reset }: { readonly error: Error & { digest?: string }; readonly reset: () => void }) {
  const locale = useLearningLocale();
  return <section className="p-6 space-y-4" role="alert">
    <h1 className="text-2xl font-semibold">{locale === "vi" ? "Chưa tải được trang học" : "This learning page could not load"}</h1>
    <p>{locale === "vi" ? "Hãy thử lại hoặc quay về bản đồ học tập." : "Try again, or return to the study map."}</p>
    <Button onClick={reset}>{locale === "vi" ? "Thử lại" : "Try again"}</Button>
    <Link className="inline-flex min-h-11 items-center underline" href={paper2Href("/paper-2", locale)}>{locale === "vi" ? "Về bản đồ" : "Study map"}</Link>
  </section>;
}

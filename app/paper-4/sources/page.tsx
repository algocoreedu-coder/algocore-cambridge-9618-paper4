import type { Metadata } from "next";
import Link from "next/link";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

import { LocaleBoundary } from "@/app/components/paper4-learning";
import { sourceAuthorityCatalog } from "@/app/data/stage9-source-authorities";

export const metadata: Metadata = {
  title: "Paper 4 source conventions | AlgoCore",
  description: "Authority and access rules for citations in the bilingual Paper 4 learning pages.",
};

const copy = {
  vi: {
    title: "Quy ước nguồn cho Paper 4",
    description: "Cách đọc authority, source ID, locator và chế độ truy cập trong learning page.",
    intro: "Mỗi citation giữ nguyên mã nguồn và locator để kiểm chứng. Locator cục bộ luôn là văn bản; giao diện không biến đường dẫn Windows hoặc đường dẫn repository thành liên kết.",
    accessTitle: "Hai chế độ truy cập",
    internal: "Citation được đối chiếu trong corpus nhưng tài liệu gốc không được phát hành từ giao diện.",
    external: "Chỉ xuất hiện khi registry có access mode rõ, trạng thái xác minh và URL HTTPS riêng biệt.",
    back: "Quay lại Paper 4",
    language: "English",
  },
  en: {
    title: "Paper 4 source conventions",
    description: "How to read authority, source ID, locator, and access mode on a learning page.",
    intro: "Each citation preserves its source ID and locator for verification. A local locator is always text; the interface never turns a Windows or repository path into a link.",
    accessTitle: "Two access modes",
    internal: "The citation is checked in the corpus, but the source file is not published through the interface.",
    external: "Shown only when the registry provides an explicit access mode, verified status, and separate HTTPS URL.",
    back: "Back to Paper 4",
    language: "Tiếng Việt",
  },
} as const;

export default async function SourceConventionsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const query = await searchParams;
  const locale = query.lang === "en" ? "en" : "vi";
  const text = copy[locale];
  const otherLocale = locale === "vi" ? "en" : "vi";

  return (
    <LocaleBoundary locale={locale}>
    <DocsPage toc={[]} tableOfContent={{ enabled: false }} footer={{ enabled: false }}>
      <header lang={locale}>
        <DocsTitle>{text.title}</DocsTitle>
        <DocsDescription>{text.description}</DocsDescription>
      </header>
      <DocsBody lang={locale}>
        <p>{text.intro}</p>
        <h2>{text.accessTitle}</h2>
        <ul>
          <li><code>internal-citation</code>: {text.internal}</li>
          <li><code>verified-external</code>: {text.external}</li>
        </ul>
        <h2>Authority</h2>
        {sourceAuthorityCatalog.map((authority) => (
          <section id={`authority-${authority.id}`} key={authority.id}>
            <h3>{authority.label[locale]}</h3>
            <p>{authority.description[locale]}</p>
            <p><code>{authority.id}</code></p>
          </section>
        ))}
        <p>
          <Link href={`/paper-4?lang=${locale}`}>{text.back}</Link>
          {" · "}
          <Link href={`/paper-4/sources?lang=${otherLocale}`}>{text.language}</Link>
        </p>
      </DocsBody>
    </DocsPage>
    </LocaleBoundary>
  );
}

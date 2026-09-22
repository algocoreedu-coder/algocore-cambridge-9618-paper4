import Link from "next/link";

import {
  sourceAuthorityDefinition,
  type SourceAuthorityClass,
} from "@/app/data/stage9-source-authorities";
import type { LearningLocale, LearningSourceReference, SourceLocator } from "./types";
import styles from "./SourceReferences.module.css";

type SourceAccessMode = "internal-citation" | "verified-external";

export type ResolvedSourceReference = Readonly<{
  sourceId: string;
  authority: string;
  authorityClass: SourceAuthorityClass;
  label: string;
  locator?: string;
  status: string;
  accessMode: SourceAccessMode;
  externalUrl?: string;
}>;

const copy = {
  vi: {
    heading: "Nguồn kiểm chứng",
    references: "tham chiếu",
    authority: "Thẩm quyền nguồn",
    sourceId: "Mã nguồn",
    locator: "Locator kiểm chứng",
    status: "Trạng thái",
    accessMode: "Chế độ truy cập",
    internal: "Trích dẫn nội bộ",
    external: "URL ngoài đã xác minh",
    openIndex: "Xem quy ước nguồn",
    openExternal: "Mở nguồn ngoài",
  },
  en: {
    heading: "Verified sources",
    references: "references",
    authority: "Authority",
    sourceId: "Source ID",
    locator: "Verification locator",
    status: "Status",
    accessMode: "Access mode",
    internal: "Internal citation",
    external: "Verified external URL",
    openIndex: "View source conventions",
    openExternal: "Open external source",
  },
} as const;

function locatorText(locator: SourceLocator) {
  const parts = [
    locator.heading,
    locator.bullet_locator,
    locator.pdf_page !== undefined ? `PDF p. ${locator.pdf_page}` : undefined,
    locator.printed_page !== undefined ? `printed p. ${locator.printed_page}` : undefined,
    locator.anchor_text,
  ];
  return parts.filter((value): value is string => typeof value === "string" && value.trim().length > 0).join(" · ");
}

/** Resolve a citation without ever treating its locator as a URL. */
export function resolveSourceReference(
  reference: LearningSourceReference,
  locale: LearningLocale,
): ResolvedSourceReference {
  const sourceId = reference.source_id;
  const authority = reference.authority;
  const authorityDefinition = sourceAuthorityDefinition(authority);

  return {
    sourceId,
    authority,
    authorityClass: authorityDefinition.id,
    label: reference.locator.heading ?? sourceId,
    locator: locatorText(reference.locator),
    status: "CITATION_ONLY",
    accessMode: "internal-citation",
  };
}

export function SourceReferences({
  references,
  locale,
}: {
  readonly references: readonly LearningSourceReference[];
  readonly locale: LearningLocale;
}) {
  if (references.length === 0) return null;

  const labels = copy[locale];
  const resolvedReferences = references.map((reference) => resolveSourceReference(reference, locale));
  const indexHref = `/paper-4/sources?lang=${locale}`;

  return (
    <details className={styles.references}>
      <summary>
        <strong>{labels.heading}</strong>
        <span>{resolvedReferences.length} {labels.references}</span>
      </summary>
      <div className={styles.grid}>
        {resolvedReferences.map((reference, index) => {
          const authorityDefinition = sourceAuthorityDefinition(reference.authority);
          return (
            <article
              className={styles.card}
              data-access-mode={reference.accessMode}
              data-authority-class={reference.authorityClass}
              key={`${reference.sourceId}-${reference.authority}-${index}`}
            >
              <header>
                <span className={styles.authority}>{authorityDefinition.label[locale]}</span>
                <span className={styles.mode}>
                  {reference.accessMode === "verified-external" ? labels.external : labels.internal}
                </span>
              </header>
              <h3>{reference.label}</h3>
              <dl>
                <div><dt>{labels.authority}</dt><dd>{reference.authority}</dd></div>
                <div><dt>{labels.sourceId}</dt><dd><code>{reference.sourceId}</code></dd></div>
                {reference.locator ? (
                  <div><dt>{labels.locator}</dt><dd><code>{reference.locator}</code></dd></div>
                ) : null}
                <div><dt>{labels.status}</dt><dd>{reference.status}</dd></div>
                <div><dt>{labels.accessMode}</dt><dd><code>{reference.accessMode}</code></dd></div>
              </dl>
              <footer>
                <Link href={indexHref}>{labels.openIndex}</Link>
                {reference.externalUrl ? (
                  <a href={reference.externalUrl} rel="noopener noreferrer" target="_blank">
                    {labels.openExternal}
                  </a>
                ) : null}
              </footer>
            </article>
          );
        })}
      </div>
    </details>
  );
}

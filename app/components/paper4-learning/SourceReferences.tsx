import Link from "next/link";

import {
  sourceAuthorityDefinition,
  type SourceAuthorityClass,
} from "@/app/data/stage9-source-authorities";
import type { LearningLocale, LearningSourceReference } from "./types";
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

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isVerifiedHttpsUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

/** Resolve a citation without ever treating its locator as a URL. */
export function resolveSourceReference(
  reference: LearningSourceReference | string,
  locale: LearningLocale,
): ResolvedSourceReference {
  if (typeof reference === "string") {
    return {
      sourceId: reference,
      authority: "internal-evidence",
      authorityClass: "internal-evidence",
      label: reference,
      status: "INTERNAL_CITATION",
      accessMode: "internal-citation",
    };
  }

  const sourceId = readString(reference.sourceId)
    ?? readString(reference.source_id)
    ?? "UNSPECIFIED_SOURCE";
  const authority = readString(reference.authority) ?? "unclassified";
  const authorityDefinition = sourceAuthorityDefinition(authority);
  const status = readString(reference.status) ?? "INTERNAL_CITATION";
  const requestedMode = readString(reference.accessMode)
    ?? readString(reference.access_mode);
  const externalUrl = readString(reference.externalUrl)
    ?? readString(reference.external_url)
    ?? readString(reference.url);
  const verifiedFlag = reference.urlVerified === true || reference.url_verified === true;
  const verifiedStatus = /(^|[_ -])VERIFIED([_ -]|$)/i.test(status);
  const mayLinkExternally = requestedMode === "verified-external"
    && isVerifiedHttpsUrl(externalUrl)
    && (verifiedFlag || verifiedStatus);

  return {
    sourceId,
    authority,
    authorityClass: authorityDefinition.id,
    label: reference.label?.[locale] ?? sourceId,
    locator: readString(reference.citation) ?? readString(reference.locator),
    status,
    accessMode: mayLinkExternally ? "verified-external" : "internal-citation",
    externalUrl: mayLinkExternally ? externalUrl : undefined,
  };
}

export function SourceReferences({
  references,
  locale,
}: {
  readonly references: readonly (LearningSourceReference | string)[];
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

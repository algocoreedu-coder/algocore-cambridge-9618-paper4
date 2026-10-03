"use client";

import { Fragment, useId, useMemo, useState } from "react";

import type { Locale, PythonArtifactDto } from "../paper4-visual/types";
import styles from "./PythonArtifact.module.css";

const labels = {
  vi: { source: "Mã Python đã kiểm chứng", copy: "Sao chép mã", copied: "Đã sao chép mã.", copyFailed: "Không thể sao chép tự động; bạn vẫn có thể chọn mã thủ công.", active: "Dòng đang chạy", execution: "Đã chạy và kiểm tra độc lập" },
  en: { source: "Verified Python source", copy: "Copy code", copied: "Code copied.", copyFailed: "Automatic copy failed; you can still select the code manually.", active: "Active line", execution: "Executed and independently checked" },
} as const;

export type PythonArtifactProps = Readonly<{
  artifact: PythonArtifactDto;
  activeLineIds?: readonly string[];
  visibleLineIds?: readonly string[];
  maxVisibleLines?: number;
  locale: Locale;
  headingLevel?: 3 | 4;
  className?: string;
  audience?: "learner" | "audit";
}>;

export function artifactSource(artifact: PythonArtifactDto) {
  return [...artifact.lines].sort((left, right) => left.order - right.order).map((line) => line.text).join("\n");
}

function excerptLines(artifact: PythonArtifactDto, visibleLineIds: readonly string[] | undefined, maxVisibleLines: number) {
  const ordered = [...artifact.lines].sort((left, right) => left.order - right.order);
  if (!visibleLineIds) return ordered;
  const hardLimit = Math.min(8, Math.max(1, maxVisibleLines));
  const requested = new Set(visibleLineIds.slice(0, hardLimit));
  const selected = new Set<number>();
  ordered.forEach((line, index) => { if (requested.has(line.line_id)) selected.add(index); });
  if (selected.size === 0) return ordered;
  const limit = hardLimit;
  for (let distance = 1; selected.size < limit && distance < ordered.length; distance += 1) {
    for (const index of [...selected].sort((left, right) => left - right)) {
      for (const candidate of [index - distance, index + distance]) {
        if (candidate >= 0 && candidate < ordered.length) selected.add(candidate);
        if (selected.size >= limit) break;
      }
      if (selected.size >= limit) break;
    }
  }
  return ordered.filter((_, index) => selected.has(index)).slice(0, limit);
}

export function PythonArtifact({ artifact, activeLineIds = [], visibleLineIds, maxVisibleLines = 8, locale, headingLevel = 3, className, audience = "audit" }: PythonArtifactProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const titleId = useId();
  const activeIds = useMemo(() => new Set(activeLineIds), [activeLineIds]);
  const orderedLines = useMemo(() => excerptLines(artifact, visibleLineIds, maxVisibleLines), [artifact, maxVisibleLines, visibleLineIds]);
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const t = labels[locale];
  const sourceLabel = audience === "learner" ? (locale === "vi" ? "Mã Python" : "Python source") : t.source;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(audience === "learner" ? orderedLines.map((line) => line.text).join("\n") : artifactSource(artifact));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className={`${styles.artifact} ${className ?? ""}`} aria-labelledby={titleId} data-python-artifact-id={audience === "audit" ? artifact.python_artifact_id : undefined} data-code-sha256={audience === "audit" ? artifact.code_sha256 : undefined}>
      <header className={styles.header}>
        <div>
          <Heading id={titleId}>{sourceLabel}</Heading>
          <p>{artifact.caption[locale]}</p>
        </div>
        <button type="button" onClick={copyCode}>{t.copy}</button>
      </header>
      {audience === "audit" && <p className={styles.execution}>
        <strong>{t.execution}</strong> · {artifact.entry_point} · {artifact.version}
      </p>}
      <pre className={styles.source} tabIndex={0} aria-label={sourceLabel}>
        <code className={styles.lines}>
          {orderedLines.map((line, index) => {
            const active = activeIds.has(line.line_id);
            return (
              <Fragment key={line.line_id}>
                {index > 0 && line.order > orderedLines[index - 1].order + 1 && (
                  <span className={styles.line} data-code-gap="true" aria-hidden="true">
                    <span className={styles.lineNumber}>…</span><span className={styles.lineText}>…</span>
                  </span>
                )}
                <span id={audience === "audit" ? line.line_id : undefined} className={styles.line} data-line-id={audience === "audit" ? line.line_id : undefined} data-active-code-line={active ? "true" : undefined} aria-current={active ? "step" : undefined}>
                  <span className={styles.lineNumber} aria-hidden="true">{line.order}</span>
                  <span className={styles.lineText}>{line.text || "\u00a0"}</span>
                  {active && <span className={styles.srOnly}>{t.active}</span>}
                </span>
              </Fragment>
            );
          })}
        </code>
      </pre>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {copyStatus === "copied" ? t.copied : copyStatus === "failed" ? t.copyFailed : ""}
      </p>
    </section>
  );
}

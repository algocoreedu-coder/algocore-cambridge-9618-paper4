"use client";

import { useId, useMemo, useState } from "react";

import type { Locale, PythonArtifactDto } from "../paper4-visual/types";
import styles from "./PythonArtifact.module.css";

const labels = {
  vi: { source: "Mã Python đã kiểm chứng", copy: "Sao chép mã", copied: "Đã sao chép mã.", copyFailed: "Không thể sao chép tự động; bạn vẫn có thể chọn mã thủ công.", active: "Dòng đang chạy", execution: "Đã chạy và kiểm tra độc lập" },
  en: { source: "Verified Python source", copy: "Copy code", copied: "Code copied.", copyFailed: "Automatic copy failed; you can still select the code manually.", active: "Active line", execution: "Executed and independently checked" },
} as const;

export type PythonArtifactProps = Readonly<{
  artifact: PythonArtifactDto;
  activeLineIds?: readonly string[];
  locale: Locale;
  headingLevel?: 3 | 4;
  className?: string;
}>;

export function artifactSource(artifact: PythonArtifactDto) {
  return [...artifact.lines].sort((left, right) => left.order - right.order).map((line) => line.text).join("\n");
}

export function PythonArtifact({ artifact, activeLineIds = [], locale, headingLevel = 3, className }: PythonArtifactProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const titleId = useId();
  const activeIds = useMemo(() => new Set(activeLineIds), [activeLineIds]);
  const orderedLines = useMemo(() => [...artifact.lines].sort((left, right) => left.order - right.order), [artifact.lines]);
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const t = labels[locale];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(artifactSource(artifact));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className={`${styles.artifact} ${className ?? ""}`} aria-labelledby={titleId} data-python-artifact-id={artifact.python_artifact_id} data-code-sha256={artifact.code_sha256}>
      <header className={styles.header}>
        <div>
          <Heading id={titleId}>{t.source}</Heading>
          <p>{artifact.caption[locale]}</p>
        </div>
        <button type="button" onClick={copyCode}>{t.copy}</button>
      </header>
      <p className={styles.execution}>
        <strong>{t.execution}</strong> · {artifact.entry_point} · {artifact.version}
      </p>
      <pre className={styles.source} tabIndex={0} aria-label={t.source}>
        <code className={styles.lines}>
          {orderedLines.map((line) => {
            const active = activeIds.has(line.line_id);
            return (
              <span key={line.line_id} id={line.line_id} className={styles.line} data-line-id={line.line_id} aria-current={active ? "step" : undefined}>
                <span className={styles.lineNumber} aria-hidden="true">{line.order}</span>
                <span className={styles.lineText}>{line.text || "\u00a0"}</span>
                {active && <span className={styles.srOnly}>{t.active}</span>}
              </span>
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

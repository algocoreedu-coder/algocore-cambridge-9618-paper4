"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import type { Locale, PythonArtifactDto } from "../paper4-visual/types";
import styles from "./PythonArtifact.module.css";

const labels = {
  vi: { source: "Mã Python đã kiểm chứng", copy: "Sao chép toàn bộ mã", copied: "Đã sao chép toàn bộ mã.", copyFailed: "Không thể sao chép tự động; bạn vẫn có thể chọn mã thủ công.", active: "Dòng đang chạy", activeLines: "Dòng đang chạy", totalLines: "Tổng số dòng", jumpActive: "Đến dòng đang chạy", activeAbove: "Dòng đang chạy ở phía trên", activeBelow: "Dòng đang chạy ở phía dưới", execution: "Đã chạy và kiểm tra độc lập", scrollHint: "Cuộn trong khung để xem toàn bộ mã. Dòng màu vàng là dòng đang chạy." },
  en: { source: "Verified Python source", copy: "Copy full source", copied: "Full source copied.", copyFailed: "Automatic copy failed; you can still select the code manually.", active: "Active line", activeLines: "Active lines", totalLines: "Total lines", jumpActive: "Jump to active line", activeAbove: "Active lines are above", activeBelow: "Active lines are below", execution: "Executed and independently checked", scrollHint: "Scroll inside this panel to review the complete source. The yellow line is currently running." },
} as const;

export type PythonArtifactProps = Readonly<{
  artifact: PythonArtifactDto;
  activeLineIds?: readonly string[];
  locale: Locale;
  headingLevel?: 3 | 4;
  className?: string;
  audience?: "learner" | "audit";
}>;

export function artifactSource(artifact: PythonArtifactDto) {
  return [...artifact.lines].sort((left, right) => left.order - right.order).map((line) => line.text).join("\n");
}

export function PythonArtifact({ artifact, activeLineIds = [], locale, headingLevel = 3, className, audience = "audit" }: PythonArtifactProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const titleId = useId();
  const scrollHintId = useId();
  const sourceRef = useRef<HTMLPreElement>(null);
  const activeIds = useMemo(() => new Set(activeLineIds), [activeLineIds]);
  const orderedLines = useMemo(() => [...artifact.lines].sort((left, right) => left.order - right.order), [artifact]);
  const activeLineKey = activeLineIds.join("|");
  const activeLineOrders = orderedLines.filter((line) => activeIds.has(line.line_id)).map((line) => line.order);
  const activeRange = activeLineOrders.length === 0 ? "—" : activeLineOrders.length > 1 && activeLineOrders.every((order, index) => index === 0 || order === activeLineOrders[index - 1] + 1)
    ? `${activeLineOrders[0]}–${activeLineOrders.at(-1)}`
    : activeLineOrders.join(", ");
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const t = labels[locale];
  const sourceLabel = audience === "learner" ? (locale === "vi" ? "Mã Python" : "Python source") : t.source;

  const jumpToActiveLine = useCallback(() => {
    const source = sourceRef.current;
    const activeLine = source?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!source || !activeLine) return;

    const sourceRect = source.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();
    const lineTop = lineRect.top - sourceRect.top + source.scrollTop;
    source.scrollTo({
      top: Math.max(0, lineTop - (source.clientHeight - activeLine.offsetHeight) / 2),
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    const source = sourceRef.current;
    const activeLine = source?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!source || !activeLine) return;

    const sourceRect = source.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();
    const lineTop = lineRect.top - sourceRect.top + source.scrollTop;
    const lineBottom = lineRect.bottom - sourceRect.top + source.scrollTop;
    if (lineTop < source.scrollTop || lineBottom > source.scrollTop + source.clientHeight) jumpToActiveLine();
  }, [activeLineKey, jumpToActiveLine]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(artifactSource(artifact));
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
        <div className={styles.headerActions}>
          {activeIds.size > 0 && <button type="button" data-code-action="jump-active" onClick={jumpToActiveLine}>{t.jumpActive}</button>}
          <button type="button" data-code-action="copy-full-source" onClick={copyCode}>{t.copy}</button>
        </div>
      </header>
      {audience === "audit" && <p className={styles.execution}>
        <strong>{t.execution}</strong> · {artifact.entry_point} · {artifact.version}
      </p>}
      {audience === "learner" && <p className={styles.scrollHint} id={scrollHintId}>{t.scrollHint}</p>}
      <div className={styles.sourceMeta} aria-live="polite" aria-atomic="true">
        <span>{t.totalLines}: <strong>{orderedLines.length}</strong></span>
        <span>{t.activeLines}: <strong>{activeRange}</strong></span>
      </div>
      <pre ref={sourceRef} className={styles.source} tabIndex={0} role="region" aria-label={`${sourceLabel}. ${t.totalLines}: ${orderedLines.length}. ${t.activeLines}: ${activeRange}.`} aria-describedby={audience === "learner" ? scrollHintId : undefined} data-scrollable-code="true" data-total-lines={orderedLines.length}>
        <code className={styles.lines}>
          {orderedLines.map((line) => {
            const active = activeIds.has(line.line_id);
            return (
              <span id={audience === "audit" ? line.line_id : undefined} className={styles.line} data-line-id={audience === "audit" ? line.line_id : undefined} data-active-code-line={active ? "true" : undefined} aria-current={active ? "step" : undefined} key={line.line_id}>
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

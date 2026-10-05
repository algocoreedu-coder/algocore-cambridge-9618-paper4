"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Locale } from "@/app/lib/paper2/catalog";
import type { Paper2VisualSelection } from "@/app/lib/paper2/visual-types";
import { Paper2SceneRenderer, Paper2SceneText, visualText } from "./Paper2SceneRenderer";
import styles from "./Paper2Lesson.module.css";

export function Paper2VisualExplorer({ selection, locale }: { readonly selection: Paper2VisualSelection; readonly locale: Locale }) {
  const instanceId = useId().replace(/:/g, "-");
  const available = useMemo(() => selection.assets, [selection.assets]);
  const [assetIndex, setAssetIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const model = available[Math.min(assetIndex, Math.max(available.length - 1, 0))];
  const variant = model?.variants[Math.min(variantIndex, Math.max(model.variants.length - 1, 0))];
  const frame = variant?.frames[Math.min(frameIndex, Math.max(variant.frames.length - 1, 0))];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("visual");
    const requestedIndex = available.findIndex((item) => item.id === requested);
    const nextAssetIndex = requestedIndex >= 0 ? requestedIndex : 0;
    const nextAsset = available[nextAssetIndex];
    const requestedVariant = params.get("variant");
    const nextVariantIndex = Math.max(0, nextAsset?.variants.findIndex((item) => item.id === requestedVariant) ?? 0);
    const nextVariant = nextAsset?.variants[nextVariantIndex];
    const requestedStep = params.get("step");
    const nextFrameIndex = Math.max(0, nextVariant?.frames.findIndex((item) => item.id === requestedStep) ?? 0);
    setAssetIndex(nextAssetIndex);
    setVariantIndex(nextVariantIndex);
    setFrameIndex(nextFrameIndex);
  }, [available]);

  useEffect(() => {
    if (!model || !variant || !frame) return;
    const url = new URL(location.href);
    url.searchParams.set("visual", model.id);
    url.searchParams.set("variant", variant.id);
    url.searchParams.set("step", frame.id);
    history.replaceState(history.state, "", `${url.pathname}${url.search}${location.hash}`);
  }, [frame, model, variant]);

  if (!model || !variant || !frame) return <p>{locale === "vi" ? "Visual chưa có model canonical được export." : "This visual does not yet have an exported canonical model."}</p>;
  const totalFrames = variant.frames.length;
  const go = (next: number) => setFrameIndex(Math.max(0, Math.min(totalFrames - 1, next)));
  const selectAsset = (index: number) => { setAssetIndex(index); setVariantIndex(0); setFrameIndex(0); };
  const selectVariant = (index: number) => { setVariantIndex(index); setFrameIndex(0); };
  const keyboard = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const next = { ArrowLeft: frameIndex - 1, ArrowRight: frameIndex + 1, Home: 0, End: totalFrames - 1 }[event.key];
    if (next !== undefined) { event.preventDefault(); go(next); }
  };
  const labels = {
    before: locale === "vi" ? "Trước" : "Before",
    operation: locale === "vi" ? "Thao tác / quan hệ" : "Operation / relationship",
    after: locale === "vi" ? "Sau" : "After",
    why: locale === "vi" ? "Vì sao" : "Why this matters",
  };
  const textAlternativeId = `${model.id}-${variant.id}-${frame.id}-text-alternative`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const visualTitleId = `${instanceId}-${model.id}-visual-title`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const keyboardHintId = `${instanceId}-${model.id}-keyboard-hint`.replace(/[^a-zA-Z0-9_-]/g, "-");

  return <section className={styles.visualExplorer} data-paper2-visual={model.id} data-paper2-visual-player="native" data-source-manifest-sha256={selection.sourceManifestSha256} onKeyDown={keyboard} tabIndex={0} aria-labelledby={visualTitleId} aria-describedby={keyboardHintId}>
    {available.length > 1 && <div className={styles.visualTabs} role="group" aria-label={locale === "vi" ? "Chọn visual" : "Choose a visual"}>{available.map((item, index) => <button type="button" key={item.id} aria-pressed={index === assetIndex} onClick={() => selectAsset(index)}>{item.id} · {item.title[locale]}</button>)}</div>}
    <div className={styles.visualHeader}><div><span>{model.id}</span><h3 id={visualTitleId}>{model.title[locale]}</h3><p>{model.objective[locale]}</p></div><strong>{model.variants.length} {locale === "vi" ? "tình huống" : "scenarios"}</strong></div>
    <label className={styles.variantSelector}>{locale === "vi" ? "Tình huống / dữ liệu" : "Scenario / input"}<select data-p2-variant value={variantIndex} onChange={(event) => selectVariant(Number(event.target.value))}>{model.variants.map((item, index) => <option key={item.id} value={index}>{visualText(item.label, locale)}</option>)}</select></label>
    <div className={styles.nativeVisual} data-p2-frame={frame.id} data-p2-frame-index={frameIndex} data-scene-type={frame.scene.type}>
      <div className={styles.visualNarrative}><span>{locale === "vi" ? `BƯỚC ${frameIndex + 1} / ${totalFrames}` : `STEP ${frameIndex + 1} / ${totalFrames}`}</span><h4>{visualText(frame.title, locale)}</h4><dl><div><dt>{labels.before}</dt><dd>{visualText(frame.before, locale)}</dd></div><div><dt>{labels.operation}</dt><dd>{visualText(frame.operation, locale)}</dd></div><div><dt>{labels.after}</dt><dd>{visualText(frame.after, locale)}</dd></div><div><dt>{labels.why}</dt><dd>{visualText(frame.why, locale)}</dd></div></dl></div>
      <div className={styles.scenePanel}><Paper2SceneRenderer scene={frame.scene} locale={locale} hookPrefix={`${model.id}-${variant.id}-${frame.id}`} /><p className={styles.sceneCaption}>{visualText(frame.scene.caption, locale)}</p></div>
    </div>
    {(model.code?.length || (frame.vars && Object.keys(frame.vars).length > 0)) && <div className={styles.stateCode}>{model.code?.length ? <div className={styles.codePanel}><strong>{locale === "vi" ? "Pseudocode minh họa · dòng tô sáng đang được xét" : "Teaching pseudocode · highlighted lines are active"}</strong><ol tabIndex={0} aria-label={locale === "vi" ? "Vùng pseudocode có thể cuộn ngang bằng bàn phím" : "Keyboard-scrollable teaching pseudocode"}>{model.code.map((line, index) => <li key={`${index}-${line}`} className={(frame.codeLines ?? []).includes(index) ? styles.codeActive : ""}><span>{index + 1}</span><code>{line}</code></li>)}</ol></div> : null}{frame.vars && Object.keys(frame.vars).length > 0 ? <div className={styles.varsPanel}><strong>{locale === "vi" ? "Giá trị hiện tại" : "Current values"}</strong><dl>{Object.entries(frame.vars).map(([key, value]) => <div key={key} data-key={`var-${key}`}><dt>{key} = </dt><dd>{visualText(value, locale)}</dd></div>)}</dl></div> : null}</div>}
    <details className={styles.textEquivalent} open><summary id={textAlternativeId}>{locale === "vi" ? "Mô tả sơ đồ bằng chữ / bảng" : "Diagram as text / table"}</summary><div tabIndex={0} aria-labelledby={textAlternativeId}><Paper2SceneText scene={frame.scene} locale={locale} /></div></details>
    <div className={styles.visualControls}><button type="button" data-p2-control="previous" disabled={frameIndex === 0} onClick={() => go(frameIndex - 1)}>← {locale === "vi" ? "Bước trước" : "Previous"}</button><button type="button" data-p2-control="next" disabled={frameIndex === totalFrames - 1} onClick={() => go(frameIndex + 1)}>{locale === "vi" ? "Bước tiếp" : "Next"} →</button><button type="button" data-p2-control="reset" onClick={() => go(0)}>↺ {locale === "vi" ? "Đặt lại" : "Reset"}</button></div>
    <div className={styles.stepTrack} role="group" aria-label={locale === "vi" ? "Chọn bước" : "Choose a step"}>{variant.frames.map((item, index) => <button type="button" key={item.id} data-p2-step={item.id} aria-current={index === frameIndex ? "step" : undefined} aria-label={`${index + 1}. ${visualText(item.title, locale)}`} onClick={() => go(index)}>{index + 1}</button>)}</div>
    <p className={styles.keyboardHint} id={keyboardHintId}>{locale === "vi" ? "Bàn phím: ← / → trước / tiếp, Home / End đầu / cuối. Không tự phát." : "Keyboard: ← / → previous / next, Home / End first / last. No autoplay."}</p>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{frameIndex + 1} / {totalFrames}. {visualText(frame.title, locale)}. {visualText(frame.focus, locale)}</p>
    <section className={styles.transcript} data-p2-transcript><details open><summary>{locale === "vi" ? "Toàn bộ bước và lời giải — đọc ngay" : "All steps and explanations — available now"}</summary><ol>{variant.frames.map((item, index) => <li key={item.id}><h5>{index + 1}. {visualText(item.title, locale)}</h5><dl><dt>{labels.before}</dt><dd>{visualText(item.before, locale)}</dd><dt>{labels.operation}</dt><dd>{visualText(item.operation, locale)}</dd><dt>{labels.after}</dt><dd>{visualText(item.after, locale)}</dd><dt>{labels.why}</dt><dd>{visualText(item.why, locale)}</dd></dl></li>)}</ol></details></section>
  </section>;
}

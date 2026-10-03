"use client";

import { useState } from "react";

import { visualFamilyComponents } from "./components";
import { visualFamilies } from "./fixtures";
import type { VisualLocale, VisualScenario } from "./types";
import styles from "./VisualFamilies.module.css";

const copy = {
  en: {
    eyebrow: "Paper 4 · Dynamic Visual System v1",
    title: "Semantic visual family review gallery",
    intro: "Review all 16 reusable families before they are connected to verified lesson traces. Each card supports prediction, three deterministic steps and normal, boundary and failure fixtures.",
    language: "Gallery language",
    scenarios: "Scenario shown across all families",
    normal: "Normal",
    boundary: "Boundary",
    failure: "Failure",
    note: "Prototype boundary: these neutral fixtures demonstrate interaction and visual grammar. They do not claim to be past-paper evidence or final lesson content.",
  },
  vi: {
    eyebrow: "Paper 4 · Hệ thống visual động v1",
    title: "Thư viện kiểm duyệt các family visual semantic",
    intro: "Kiểm tra đủ 16 family tái sử dụng trước khi nối với trace đã xác minh của từng bài. Mỗi card có dự đoán, ba bước xác định và các tình huống thông thường, biên, lỗi.",
    language: "Ngôn ngữ thư viện",
    scenarios: "Tình huống hiển thị cho toàn bộ family",
    normal: "Thông thường",
    boundary: "Biên",
    failure: "Lỗi",
    note: "Phạm vi prototype: các fixture trung tính chỉ minh hoạ tương tác và ngôn ngữ thị giác. Chúng không phải bằng chứng đề thi hay nội dung bài học cuối cùng.",
  },
} as const;

export function VisualFamilyGallery({ initialLocale }: Readonly<{ initialLocale: VisualLocale }>) {
  const [locale, setLocale] = useState<VisualLocale>(initialLocale);
  const [scenario, setScenario] = useState<VisualScenario>("normal");
  const t = copy[locale];

  return <main className={styles.gallery} data-visual-family-gallery data-gallery-locale={locale} data-scenario={scenario}>
    <header className={styles.galleryHeader}>
      <div><p className={styles.eyebrow}>{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></div>
      <div className={styles.toolbar}>
        <fieldset><legend>{t.language}</legend><div className={styles.segmented}>
          <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>English</button>
          <button type="button" aria-pressed={locale === "vi"} onClick={() => setLocale("vi")}>Tiếng Việt</button>
        </div></fieldset>
        <fieldset><legend>{t.scenarios}</legend><div className={styles.segmented}>
          {(["normal", "boundary", "failure"] as const).map((mode) => <button key={mode} type="button" aria-pressed={scenario === mode} onClick={() => setScenario(mode)}>{t[mode]}</button>)}
        </div></fieldset>
      </div>
      <aside className={styles.prototypeNote}>{t.note}</aside>
    </header>

    <div className={styles.familyList}>
      {visualFamilies.map((family) => {
        const Family = visualFamilyComponents[family.id];
        return <Family key={`${family.id}-${scenario}`} locale={locale} scenario={scenario} />;
      })}
    </div>
  </main>;
}

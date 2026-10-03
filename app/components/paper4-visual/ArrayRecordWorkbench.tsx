import type { DataModelsRecord } from "../paper4-learning/learnerProjection";
import type { Locale } from "./types";
import type { DataModelsSceneModel } from "./dataModelsAdapter";
import styles from "./Paper4VisualRuntime.module.css";

const copy = {
  en: {
    count: "Live count", capacity: "Capacity", result: "Result", candidate: "Candidate record", records: "Bounded record array",
    index: "index", empty: "empty slot", name: "name", score: "score", unavailable: "not present", state: "Record state", slots: "Record array slots",
  },
  vi: {
    count: "Số record đang dùng", capacity: "Capacity", result: "Kết quả", candidate: "Record mới", records: "Mảng record có giới hạn",
    index: "index", empty: "ô trống", name: "name", score: "score", unavailable: "không có", state: "Trạng thái record", slots: "Các ô trong mảng record",
  },
} as const;

export function RecordObjectCard({ record, locale }: Readonly<{ record: DataModelsRecord; locale: Locale }>) {
  const t = copy[locale];
  return <section className={styles.recordCard} id="candidate-record" aria-labelledby="candidate-record-title">
    <h4 id="candidate-record-title">{t.candidate}</h4>
    <dl id="record-fields"><div><dt>{t.name}</dt><dd>{record.name}</dd></div><div data-field-present={record.score !== undefined}><dt>{t.score}</dt><dd>{record.score ?? t.unavailable}</dd></div></dl>
  </section>;
}

export function ArrayRibbon({ records, capacity, activeIndex, locale }: Readonly<{ records: readonly DataModelsRecord[]; capacity: number; activeIndex: number | null; locale: Locale }>) {
  const t = copy[locale];
  return <section className={styles.arrayRibbonSection} id="array-ribbon" aria-labelledby="array-ribbon-title">
    <h4 id="array-ribbon-title">{t.records}</h4>
    <div className={styles.arrayRibbonViewport} role="region" tabIndex={0} aria-label={t.slots}>
      <ol className={styles.arrayRibbon}>
        {Array.from({ length: capacity }, (_, index) => {
          const record = records[index];
          return <li key={index} data-slot-state={record ? "occupied" : "empty"} data-active={index === activeIndex || undefined} aria-label={record ? `${t.index} ${index}, ${t.name} ${record.name}, ${t.score} ${record.score ?? t.unavailable}` : `${t.index} ${index}, ${t.empty}`}>
            <span>{t.index} {index}</span>
            {record ? <><strong>{record.name}</strong><small>{t.score}: {record.score ?? t.unavailable}</small></> : <em>{t.empty}</em>}
          </li>;
        })}
      </ol>
    </div>
  </section>;
}

export function ArrayRecordWorkbench({ model, locale, headingId }: Readonly<{ model: DataModelsSceneModel; locale: Locale; headingId: string }>) {
  const t = copy[locale];
  return <article className={`${styles.panel} ${styles.arrayRecordWorkbench}`} data-scene="data-models-array-record" data-primary-panel="true" data-operation={model.operation} data-phase={model.phase} data-active-targets={model.activeTargets.join(" ")} aria-labelledby={headingId}>
    <header className={styles.dataModelsHeader}><h3 id={headingId}>{t.state}</h3></header>
    <dl className={styles.dataModelsFacts}>
      <div><dt>{t.count}</dt><dd>{model.count}</dd></div>
      <div id="capacity"><dt>{t.capacity}</dt><dd>{model.capacity}</dd></div>
      {model.phase === "revealed" && model.result && <div><dt>{t.result}</dt><dd>{`${model.result[0] ? "True" : "False"}, ${model.result[1]}`}</dd></div>}
    </dl>
    <div className={styles.dataModelsVisualGrid}>
      <RecordObjectCard record={model.candidate} locale={locale} />
      <ArrayRibbon records={model.records} capacity={model.capacity} activeIndex={model.activeIndex} locale={locale} />
    </div>
  </article>;
}

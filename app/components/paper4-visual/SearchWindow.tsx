import type { Locale } from "./types";
import { cellState, localizedSceneText, type BinarySearchSceneModel } from "./binarySearchAdapter";
import styles from "./Paper4VisualRuntime.module.css";

export type SearchWindowProps = Readonly<{
  model: BinarySearchSceneModel;
  locale: Locale;
  headingId: string;
  onHearFullState?: () => void;
}>;

const copy = {
  en: {
    question: "Which interval can still contain the target?",
    target: "Target",
    low: "low",
    middle: "middle",
    high: "high",
    result: "Result",
    hidden: "hidden",
    empty: "Empty search interval",
    index: "index",
    value: "value",
    possible: "possible",
    outside: "excluded",
    found: "found",
    inversion: "order break",
    delta: "What changed",
    invariant: "Rule to protect",
    hear: "Hear full state",
    comparison: "Comparison",
    noComparison: "No midpoint read",
    viewport: "Search array. Scroll horizontally to inspect every indexed cell.",
  },
  vi: {
    question: "Khoảng nào vẫn có thể chứa target?",
    target: "Target",
    low: "low",
    middle: "middle",
    high: "high",
    result: "Kết quả",
    hidden: "đang ẩn",
    empty: "Khoảng tìm kiếm rỗng",
    index: "index",
    value: "giá trị",
    possible: "có thể đúng",
    outside: "đã loại",
    found: "đã tìm thấy",
    inversion: "sai thứ tự",
    delta: "Điều vừa thay đổi",
    invariant: "Quy tắc cần giữ",
    hear: "Nghe toàn bộ trạng thái",
    comparison: "Lần so sánh",
    noComparison: "Không đọc middle",
    viewport: "Mảng tìm kiếm. Cuộn ngang trong vùng này để xem mọi ô và index.",
  },
} as const;

function CellMarkers({ model, index }: Readonly<{ model: BinarySearchSceneModel; index: number }>) {
  const markers: string[] = [];
  const bounds = model.phase === "revealed" ? model.retained : model.probe;
  if (index === bounds.low) markers.push("low");
  if (index === model.probe.middle) markers.push("middle");
  if (index === bounds.high) markers.push("high");
  return <span className={styles.searchPointers} aria-hidden="true">{markers.map((marker) => <span id={`bs-pointer-${marker === "middle" ? "mid" : marker}`} key={marker}>{marker}</span>)}</span>;
}

export function SearchWindow({ model, locale, headingId, onHearFullState }: SearchWindowProps) {
  const t = copy[locale];
  const shownBounds = model.phase === "revealed" ? model.retained : model.probe;
  const result = model.phase === "revealed" && model.result !== null ? String(model.result) : t.hidden;

  return (
    <article className={`${styles.panel} ${styles.searchScene}`} data-scene="binary-search-window" data-primary-panel="true" data-core-projection="iterative" data-phase={model.phase} data-status={model.status} data-active-targets={model.activeVisualTargets.join(" ")} aria-labelledby={headingId}>
      <header className={styles.searchHeader}>
        <div>
          <p className={styles.searchEyebrow}>Search Window</p>
          <h3 id={headingId} tabIndex={-1} data-storyboard-target={model.storyboardTarget}>{t.question}</h3>
        </div>
        {onHearFullState && <button type="button" className={styles.hearState} onClick={onHearFullState}>{t.hear}</button>}
      </header>

      <dl className={styles.searchFacts}>
        <div><dt>{t.target}</dt><dd id="bs-target">{model.target}</dd></div>
        <div><dt>{t.low}</dt><dd>{shownBounds.low}</dd></div>
        <div><dt>{t.middle}</dt><dd>{model.probe.middle ?? "—"}</dd></div>
        <div><dt>{t.high}</dt><dd>{shownBounds.high}</dd></div>
        <div><dt>{t.result}</dt><dd id="bs-result">{result}</dd></div>
      </dl>

      <figure id="visual.dsa.binary-search-interval" className={styles.searchFigure}>
        <div id="bs-live-window">
          <div id="bs-array">
            {model.values.length === 0 ? (
              <div className={styles.emptyWindow} role="img" aria-label={`${t.empty}: low ${model.probe.low}, high ${model.probe.high}`}>
                <strong aria-hidden="true">∅</strong>
                <span>{t.empty}: low {model.probe.low} &gt; high {model.probe.high}</span>
              </div>
            ) : (
              <div className={styles.arrayViewport} role="region" tabIndex={0} aria-label={t.viewport}>
                <ol className={styles.searchArray} role="list">
                  {model.values.map((value, index) => {
                    const state = cellState(model, index);
                    const stateLabel = t[state];
                    return (
                      <li key={index} id={`bs-cell-${index}`} data-cell-state={state} aria-label={`${t.index} ${index}, ${t.value} ${value}, ${stateLabel}`}>
                        <span className={styles.cellIndex} aria-hidden="true">{index}</span>
                        <strong>{value}</strong>
                        <span className={styles.cellState}>{stateLabel}</span>
                        <CellMarkers model={model} index={index} />
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        </div>
        {model.inversion && <p id="bs-inversion-pair" className={styles.inversionSummary}>{model.values[model.inversion[0]]} &gt; {model.values[model.inversion[1]]}</p>}
        <figcaption>
          <output id="visual.dsa.growth-counter">
            {model.comparisonNumber > 0 ? `${t.comparison} ${model.comparisonNumber}` : t.noComparison}
          </output>
        </figcaption>
      </figure>

      <div className={styles.searchStatus} id="visual.binary-search.state" data-revealed={model.phase === "revealed" || undefined}>
        <div id="bs-delta-strip">
          <span>{t.delta}</span>
          <p id={model.eventSpecificTarget}>{model.phase === "revealed" ? localizedSceneText(model.deltaLabel, locale) : localizedSceneText(model.prediction.prompt, locale)}</p>
        </div>
        <div>
          <span>{t.invariant}</span>
          <p id={model.eventName === "reject_unsorted_input" ? "bs-precondition-gate" : undefined}>{localizedSceneText(model.invariantLabel, locale)}</p>
        </div>
      </div>
    </article>
  );
}

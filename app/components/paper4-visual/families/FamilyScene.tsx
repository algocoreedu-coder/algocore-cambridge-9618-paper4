"use client";

import { useEffect, useId, useState } from "react";

import { getVisualFamily } from "./fixtures";
import type { VisualFamilyId, VisualFamilyProps, VisualKind, VisualLocale, VisualScenario } from "./types";
import styles from "./VisualFamilies.module.css";

const ui = {
  en: {
    usedIn: "Planned lesson use",
    scenario: "Scenario",
    normal: "Normal",
    boundary: "Boundary",
    failure: "Failure",
    predict: "Pause and predict",
    reveal: "Reveal the action",
    choose: "Choose an answer before revealing the action.",
    correct: "Your prediction matches this fixture.",
    retry: "Compare the current state with the operation, then try the revealed explanation.",
    step: "Visual step",
    code: "Python focus",
    state: "State summary",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    staticNote: "Reduced motion: changes remain visible as labelled states.",
    activeLine: "Active line",
  },
  vi: {
    usedIn: "Bài học dự kiến sử dụng",
    scenario: "Tình huống",
    normal: "Thông thường",
    boundary: "Biên",
    failure: "Lỗi",
    predict: "Dừng lại và dự đoán",
    reveal: "Hiện thao tác",
    choose: "Hãy chọn một đáp án trước khi hiện thao tác.",
    correct: "Dự đoán của em khớp với tình huống này.",
    retry: "So sánh trạng thái hiện tại với thao tác, rồi đọc phần giải thích được hiện ra.",
    step: "Bước minh hoạ",
    code: "Dòng Python trọng tâm",
    state: "Tóm tắt trạng thái",
    previous: "Trước",
    next: "Tiếp",
    reset: "Làm lại",
    staticNote: "Giảm chuyển động: thay đổi vẫn được ghi rõ bằng nhãn trạng thái.",
    activeLine: "Dòng đang chạy",
  },
} as const;

function StructureView({ kind, phase, scenario, revealed, locale }: Readonly<{
  kind: VisualKind;
  phase: number;
  scenario: VisualScenario;
  revealed: boolean;
  locale: VisualLocale;
}>) {
  const isFailure = scenario === "failure";
  const active = revealed ? phase : 0;
  const hidden = !revealed;
  const unknown = locale === "vi" ? "chưa hiện" : "not revealed";
  const labels = locale === "vi" ? {
    array: "Mảng có chỉ số và sức chứa", search: "Khoảng tìm kiếm có chỉ số", sort: "Các giá trị so sánh và biên đã sắp xếp",
    record: "Các trường của bản ghi", input: "Đầu vào", expected: "Mong đợi", actual: "Thực tế", verdict: "Kết luận",
    stack: "Các ô ngăn xếp từ đáy tới đỉnh", queue: "Các ô hàng đợi vòng với front và rear", nodes: "Ba nút có mũi tên liên kết",
    objects: "Một lớp và hai đối tượng", file: "Các bản ghi tệp cùng con trỏ", counter: "Số thao tác cho từng phần tử", console: "Đầu ra chương trình",
    path: "Đường điều khiển", hash: "Các bucket băm và thứ tự dò", nodeAlternative: "Nút 1 liên kết tới nút 2; nút 2 liên kết tới nút 3; nút 3 liên kết tới null.", objectAlternative: "Lớp Student tạo ra hai đối tượng riêng biệt s1 và s2.",
    indexCaption: "chỉ số → giá trị → sức chứa", searchCaption: "low · middle · high", sortCaption: "so sánh → di chuyển → kiểm tra",
    testCaption: "đầu vào → mong đợi → thực tế → kết luận",
    tableRegion: "Bảng kiểm thử; có thể cuộn ngang khi nội dung rộng",
    stackState: "Đáy 4, tiếp theo 7, ô trên cùng",
    queueState: "front tại ô 0, rear tại ô",
    fileState: "chế độ đọc, con trỏ tại dòng",
    countState: "n bằng 4, đếm phép so sánh, số đếm hiện tại",
    current: "Hiện tại",
    activeLine: "Dòng đang chạy",
    nodeState: "Nút đang được chú ý",
    objectState: "Đối tượng đang được chú ý",
    phase: "bước",
  } : {
    array: "Indexed array with capacity", search: "Indexed search interval", sort: "Compared values and sorted boundary",
    record: "Record fields", input: "Input", expected: "Expected", actual: "Actual", verdict: "Verdict",
    stack: "Stack cells from bottom to top", queue: "Circular queue slots with front and rear", nodes: "Three linked nodes with labelled arrows",
    objects: "One class and two object instances", file: "File records with a cursor", counter: "Operation count for each item", console: "Program output",
    path: "Control path", hash: "Hash buckets and probe order", nodeAlternative: "Node 1 links to node 2; node 2 links to node 3; node 3 links to null.", objectAlternative: "The Student class creates separate s1 and s2 instances.",
    indexCaption: "index → value → capacity", searchCaption: "low · middle · high", sortCaption: "compare → move → confirm",
    testCaption: "input → expected → actual → verdict",
    tableRegion: "Test matrix; scroll horizontally when content is wider than the region",
    stackState: "Bottom 4, then 7, top cell",
    queueState: "front at slot 0, rear at slot",
    fileState: "read mode, cursor at line",
    countState: "n equals 4, counting comparisons, current count",
    current: "Current",
    activeLine: "Active line",
    nodeState: "Current focus node",
    objectState: "Current focus object",
    phase: "phase",
  };

  if (kind === "array" || kind === "search" || kind === "sort") {
    const values = kind === "sort" ? [8, 3, 6, 9, 12] : kind === "search" ? [4, 9, 14, 25, 31, 42, 57] : [12, 19, 7, 28, "—"];
    return <figure className={styles.figure} aria-label={kind === "search" ? labels.search : kind === "sort" ? labels.sort : labels.array}>
      <ol className={styles.cellRow}>
        {values.map((value, index) => {
          const target = kind === "search" ? index === 3 : kind === "sort" ? index < 2 : index === 3;
          return <li key={`${value}-${index}`} data-active={revealed && target && active > 0} data-muted={kind === "search" && revealed && active > 1 && index > 2}>
            <small>{index}</small><strong>{hidden && target ? "?" : value}</strong>
            {target && <span>{hidden ? unknown : active > 1 ? (isFailure ? "×" : "✓") : "↓"}</span>}
          </li>;
        })}
      </ol>
      <figcaption>{kind === "search" ? labels.searchCaption : kind === "sort" ? labels.sortCaption : labels.indexCaption}</figcaption>
    </figure>;
  }

  if (kind === "record") return <dl className={styles.record} aria-label={labels.record}>
    <div><dt>name</dt><dd>Binh</dd></div><div><dt>score</dt><dd>{hidden ? "?" : scenario === "failure" ? "121" : "81"}</dd></div><div data-active={revealed}><dt>valid</dt><dd>{hidden ? unknown : isFailure ? "false ×" : "true ✓"}</dd></div>
  </dl>;

  if (kind === "pipeline" || kind === "predicate" || kind === "exception") {
    const nodes = kind === "pipeline" ? ["input", "process", "output"] : kind === "predicate" ? ["condition", "accept", "reject"] : ["try", "handler", "continue"];
    return <ol className={styles.flow} aria-label={labels.path}>
      {nodes.map((node, index) => <li key={node} data-active={revealed && index === Math.min(active, 2)} data-rejected={revealed && isFailure && index === 2}>
        <span>{index + 1}</span><strong>{node}</strong>{revealed && index === Math.min(active, 2) && <em className={styles.activeMarker}>● {labels.current}</em>}{index < 2 && <b aria-hidden="true">→</b>}
      </li>)}
    </ol>;
  }

  if (kind === "tests") return <div className={styles.tableWrap} role="region" aria-label={labels.tableRegion} tabIndex={0}><table className={styles.testTable}>
    <caption>{labels.testCaption}</caption><thead><tr><th>{labels.input}</th><th>{labels.expected}</th><th>{labels.actual}</th><th>{labels.verdict}</th></tr></thead>
    <tbody><tr><td>{scenario === "boundary" ? "0" : scenario === "failure" ? "'x'" : "50"}</td><td>{isFailure ? "reject" : "accept"}</td><td>{hidden ? "?" : isFailure ? "accept" : "accept"}</td><td>{hidden ? "—" : isFailure ? "FAIL ×" : "PASS ✓"}</td></tr></tbody>
  </table></div>;

  if (kind === "stack") {
    const topValue = hidden ? unknown : isFailure ? "full" : "9";
    return <div className={styles.stack} role="img" aria-label={`${labels.stack}. ${labels.stackState}: ${topValue}.`}>
    {["4", "7", hidden ? "?" : isFailure ? "full" : "9"].map((value, index) => <div key={`${value}-${index}`} data-active={revealed && index === 2}><span>{index === 2 ? "TOP →" : ""}</span><strong>{value}</strong>{revealed && index === 2 && <em className={styles.activeMarker}>● {labels.current}</em>}</div>)}
    </div>;
  }

  if (kind === "queue") {
    const rearSlot = hidden ? unknown : scenario === "boundary" ? "0" : isFailure ? "3" : "2";
    return <div className={styles.queue} role="img" aria-label={`${labels.queue}. ${labels.queueState} ${rearSlot}.`}>
    {["A", "B", "—", "—"].map((value, index) => <div key={`${value}-${index}`} data-active={revealed && index === (scenario === "boundary" ? 0 : 2)}><small>{index}</small><strong>{hidden && index === 2 ? "?" : value}</strong><span>{index === 0 ? "front" : index === 2 ? "rear" : ""}</span></div>)}
    </div>;
  }

  if (kind === "nodes" || kind === "objects") return <div className={styles.svgWrap}>
    <svg viewBox="0 0 520 170" role="img" aria-labelledby={`${kind}-title-${scenario}`}>
      <title id={`${kind}-title-${scenario}`}>{`${kind === "nodes" ? labels.nodes : labels.objects}. ${kind === "nodes" ? labels.nodeState : labels.objectState}: ${hidden ? unknown : active + 1}; ${labels.phase} ${active + 1}.`}</title>
      <defs><marker id={`arrow-${kind}-${scenario}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <path aria-hidden="true" className={styles.connector} markerEnd={`url(#arrow-${kind}-${scenario})`} d="M145 85 H220" />
      <path aria-hidden="true" className={styles.connector} markerEnd={`url(#arrow-${kind}-${scenario})`} d="M315 85 H390" />
      {[85, 270, 455].map((x, index) => <g key={x} className={revealed && index === Math.min(active, 2) ? styles.svgActive : undefined}>
        <rect x={x - 55} y="45" width="110" height="80" rx="12" />
        <text x={x} y="78" textAnchor="middle">{kind === "nodes" ? `node ${index + 1}` : index === 0 ? "Student" : `s${index}`}</text>
        <text x={x} y="103" textAnchor="middle">{hidden && index > 0 ? "?" : kind === "nodes" ? (index === 2 ? "next: null" : `next: ${index + 2}`) : index === 0 ? "blueprint" : "score: 81"}</text>
      </g>)}
    </svg>
    <p className={styles.textAlternative}>{kind === "nodes" ? labels.nodeAlternative : labels.objectAlternative} {kind === "nodes" ? labels.nodeState : labels.objectState}: {hidden ? unknown : active + 1}; {labels.phase} {active + 1}.</p>
  </div>;

  if (kind === "hash") return <ol className={styles.buckets} aria-label={labels.hash}>
    {["Ada", "—", "Bo", "Cy", "—"].map((value, index) => <li key={`${value}-${index}`} data-active={revealed && (index === 2 || index === 3)}><small>bucket {index}</small><strong>{hidden && index === 3 ? "?" : value}</strong>{revealed && index === 2 && <span>probe 1</span>}{revealed && index === 3 && <span>probe 2</span>}</li>)}
  </ol>;

  if (kind === "file") {
    const cursorLine = revealed ? Math.min(active + 1, 3) : unknown;
    return <div className={styles.fileStrip} role="img" aria-label={`${labels.file}. ${labels.fileState} ${cursorLine}.`}>
    <header><strong>read</strong><span>cursor</span></header><ol>{["An,72", "Binh,81", "Cy,65"].map((line, index) => <li key={line} data-active={revealed && index === Math.min(active, 2)}><small>line {index + 1}</small><code>{line}</code>{revealed && index === Math.min(active, 2) && <b>↑ {labels.current}</b>}</li>)}</ol>
    </div>;
  }

  if (kind === "counter") {
    const currentCount = revealed ? Math.min(active + 1, 4) : unknown;
    return <div className={styles.counter} role="img" aria-label={`${labels.counter}. ${labels.countState}: ${currentCount}.`}>
    {[1, 2, 3, 4].map((count) => <div key={count} data-active={revealed && count <= active + 1}><span>item {count}</span><meter min="0" max="4" value={revealed ? Math.min(count, active + 1) : 0}>{count}</meter><strong>{revealed && count <= active + 1 ? count : "—"}</strong>{revealed && count === active + 1 && <em className={styles.activeMarker}>● {labels.current}</em>}</div>)}
    </div>;
  }

  return <output className={styles.console} aria-label={labels.console} aria-live="polite"><span>$ python solution.py</span><code>{revealed ? (isFailure ? "Invalid score" : scenario === "boundary" ? "Score: 0" : "Score: 81") : "▌"}</code></output>;
}

export function VisualFamilyScene({ id, locale = "en", scenario = "normal" }: VisualFamilyProps & Readonly<{ id: VisualFamilyId }>) {
  const family = getVisualFamily(id);
  const fixture = family.scenarios[scenario];
  const copy = ui[locale];
  const groupId = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setChoice(null); setRevealed(false); setPhase(0); setMessage("");
  }, [locale, scenario]);

  const reveal = () => {
    if (choice === null) { setMessage(copy.choose); return; }
    setRevealed(true);
    setMessage(choice === fixture.correctOption ? copy.correct : copy.retry);
  };
  const reset = () => { setChoice(null); setRevealed(false); setPhase(0); setMessage(""); };

  return <article className={styles.family} data-visual-family={family.id} data-scenario={scenario} data-phase={phase}>
    <header className={styles.familyHeader}>
      <div><p className={styles.eyebrow}>{family.id}</p><h2>{family.name[locale]}</h2><p>{family.purpose[locale]}</p></div>
      <p className={styles.lessonUse}><strong>{copy.usedIn}:</strong> {family.lessons.join(" · ")}</p>
    </header>

    <div className={styles.twoPanels}>
      <section className={styles.scenePanel} aria-labelledby={`${groupId}-scene`}>
        <div className={styles.panelHeading}><div><p>{copy.scenario}: <strong>{copy[scenario]}</strong></p><h3 id={`${groupId}-scene`}>{fixture.steps[phase][locale]}</h3></div><span aria-hidden="true">{phase + 1}/3</span></div>
        <StructureView kind={family.kind} phase={phase} scenario={scenario} revealed={revealed} locale={locale} />
        <p className={styles.motionNote}>{copy.staticNote}</p>
      </section>

      <section className={styles.learningPanel} aria-labelledby={`${groupId}-predict`}>
        <p className={styles.eyebrow}>{copy.predict}</p><h3 id={`${groupId}-predict`}>{fixture.prompt[locale]}</h3>
        <fieldset className={styles.options}><legend className={styles.srOnly}>{fixture.prompt[locale]}</legend>
          {fixture.options.map((option, index) => <label key={option.en} data-selected={choice === index}>
            <input type="radio" name={`${groupId}-choice`} value={index} checked={choice === index} onChange={() => setChoice(index)} />
            <span>{option[locale]}</span>
          </label>)}
        </fieldset>
        <button className={styles.primaryButton} type="button" onClick={reveal} aria-controls={`${groupId}-reveal`}>{copy.reveal}</button>
        <div id={`${groupId}-reveal`} className={styles.reveal} data-visible={revealed}>
          {revealed ? <><p><strong>{fixture.reveal[locale]}</strong></p><dl className={styles.facts} aria-label={copy.state}>{family.fields.map((field) => <div key={field.label.en}><dt>{field.label[locale]}</dt><dd>{field.values[scenario]}</dd></div>)}</dl></> : <p aria-hidden="true">•••</p>}
        </div>
        <p className={styles.live} role="status" aria-live="polite">{message}</p>
      </section>
    </div>

    <section className={styles.codePanel} aria-labelledby={`${groupId}-code`}>
      <h3 id={`${groupId}-code`}>{copy.code}</h3><ol>{fixture.code.map((line, index) => <li key={`${line}-${index}`} data-active={revealed && index === phase}><code>{line}</code>{revealed && index === phase && <span className={styles.activeLineMarker}>● {copy.activeLine}</span>}</li>)}</ol>
    </section>

    <nav className={styles.controls} aria-label={`${family.name[locale]} — ${copy.step}`}>
      <button type="button" onClick={() => setPhase((value) => Math.max(0, value - 1))} disabled={!revealed || phase === 0}>← {copy.previous}</button>
      <button type="button" onClick={() => setPhase((value) => Math.min(2, value + 1))} disabled={!revealed || phase === 2}>{copy.next} →</button>
      <button type="button" onClick={reset}>↻ {copy.reset}</button>
    </nav>
  </article>;
}

"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { ReactNode } from "react";

import { Paper4VisualRuntime } from "@/app/components/paper4-visual";
import type { JsonValue } from "@/app/components/paper4-visual/types";
import type { AssessmentItem, KnowledgeUnit, LearningLocale, LessonDto, RetrievalItem } from "./types";
import type { LessonNavigationItem } from "./LessonLearningPage";
import { Paper4LessonShell, type Paper4StageItem } from "./Paper4LessonShell";
import styles from "./CanonicalLessonJourney.module.css";

const copy = {
  en: {
    stages: "Six-stage lesson journey",
    recognise: "Recognise",
    recogniseHelp: "Identify the question signals and the result the examiner expects.",
    understand: "Understand",
    understandHelp: "Build the rules and representations before writing code.",
    trace: "Trace",
    traceHelp: "Connect Python to visible state changes.",
    practise: "Practise",
    practiseHelp: "Attempt the task before opening feedback.",
    protect: "Protect marks",
    protectHelp: "Check the exact conditions and common errors that cost credit.",
    recall: "Recall",
    recallHelp: "Retrieve the method from memory and repair any gap.",
    overview: "What this lesson is about",
    signals: "Signals to notice in a question",
    precondition: "Before you start",
    outputContract: "What your solution must produce",
    knowledgeReference: "Lesson knowledge",
    knowledgeReferenceHelp: "Open one concept at a time. The main syllabus content comes first; supporting transfer ideas are clearly labelled.",
    support: "Supporting transfer",
    concept: "Concept",
    explanation: "Plain explanation",
    pythonConnection: "Connection to Python",
    representation: "How to represent or trace it",
    invariant: "Rule that must stay true",
    misconceptions: "Common misconceptions",
    examSignals: "Exam signals",
    microExample: "Small worked example",
    scenario: "Scenario",
    walkthrough: "Walkthrough",
    selfCheck: "Self-check",
    revealAnswer: "Reveal answer and reason",
    answer: "Answer",
    rationale: "Reason",
    verifiedPython: "Python source",
    verifiedPythonHelp: "Read the relevant functions first. Open the full source only when you need to trace exact execution.",
    openCode: "Open the complete Python source",
    visualTrace: "Interactive trace",
    visualUnavailable: "Use the source and the concept rules above to trace this lesson. A dedicated semantic visual can be added without changing the lesson content.",
    scenariosCovered: "Scenarios covered",
    normal: "Normal",
    boundary: "Boundary",
    failure: "Failure",
    expected: "Expected work",
    hint: "Open a hint",
    response: "Your attempt",
    responsePlaceholder: "Write your explanation, trace or Python here…",
    record: "Record attempt",
    recorded: "Attempt recorded. Feedback is now available.",
    feedback: "Feedback and repair",
    rubric: "Self-check criteria",
    noMarkingChain: "Use the lesson rules to check the exact state, output, boundary and failure behaviour.",
    detection: "How to detect the error",
    mistake: "Mistake",
    consequence: "Consequence",
    repair: "How to repair it",
    criterion: "What must be correct",
    recallResponse: "Answer from memory",
    checkRecall: "Record recall",
    retry: "Clear and try again",
    attempts: "Attempts",
    nextLesson: "Continue to the next lesson",
    noNext: "You have reached the final lesson in this course sequence.",
    previous: "Previous stage",
    continue: "Continue",
    traceGate: "Record a prediction in the trace before continuing.",
    practiseGate: "Record at least one practice attempt before continuing.",
    predictFirst: "Predict before revealing",
    predictPrompt: "What will change, and what must stay true?",
    exampleInput: "Example input",
    expectedResult: "Expected result",
    revealResult: "Record prediction and reveal",
    noValue: "no value",
    before: "Before",
    decisionChange: "Decision and change",
    after: "After",
    supportBoundary: "AlgoCore transfer support: use this lesson to strengthen table and collision reasoning. Treat an exam task as authoritative only when its question explicitly requires this method.",
    representationalOnly: "This is a relationship representation, not an executed graph-traversal algorithm.",
  },
  vi: {
    stages: "Hành trình bài học sáu chặng",
    recognise: "Nhận dạng",
    recogniseHelp: "Nhận ra dấu hiệu trong câu hỏi và kết quả giám khảo cần.",
    understand: "Hiểu kiến thức",
    understandHelp: "Nắm quy tắc và cách biểu diễn trước khi viết code.",
    trace: "Trace",
    traceHelp: "Nối mã Python với từng thay đổi trạng thái.",
    practise: "Luyện tập",
    practiseHelp: "Tự làm trước khi mở phản hồi.",
    protect: "Giữ điểm",
    protectHelp: "Kiểm tra điều kiện chính xác và lỗi thường làm mất điểm.",
    recall: "Nhớ lại",
    recallHelp: "Tự nhớ lại phương pháp rồi sửa phần còn thiếu.",
    overview: "Bài học này giải quyết vấn đề gì",
    signals: "Dấu hiệu cần nhận ra trong đề",
    precondition: "Trước khi bắt đầu",
    outputContract: "Kết quả bài làm phải tạo ra",
    knowledgeReference: "Kiến thức của bài",
    knowledgeReferenceHelp: "Mỗi lần chỉ mở một khái niệm. Nội dung chính của syllabus được đưa lên trước; phần mở rộng được ghi rõ.",
    support: "Phần mở rộng hỗ trợ",
    concept: "Khái niệm",
    explanation: "Giải thích dễ hiểu",
    pythonConnection: "Liên hệ với Python",
    representation: "Cách biểu diễn hoặc trace",
    invariant: "Quy tắc luôn phải đúng",
    misconceptions: "Nhầm lẫn thường gặp",
    examSignals: "Dấu hiệu trong đề",
    microExample: "Ví dụ nhỏ có hướng dẫn",
    scenario: "Tình huống",
    walkthrough: "Cách làm",
    selfCheck: "Tự kiểm tra",
    revealAnswer: "Mở đáp án và lý do",
    answer: "Đáp án",
    rationale: "Lý do",
    verifiedPython: "Mã nguồn Python",
    verifiedPythonHelp: "Đọc các hàm liên quan trước. Chỉ mở toàn bộ source khi cần trace chính xác từng bước chạy.",
    openCode: "Mở toàn bộ mã nguồn Python",
    visualTrace: "Trace tương tác",
    visualUnavailable: "Dùng source và các quy tắc phía trên để trace bài này. Visual semantic riêng có thể được bổ sung mà không làm thay đổi nội dung bài.",
    scenariosCovered: "Các tình huống đã có",
    normal: "Thông thường",
    boundary: "Biên",
    failure: "Lỗi",
    expected: "Sản phẩm cần làm",
    hint: "Mở gợi ý",
    response: "Bài làm của em",
    responsePlaceholder: "Viết giải thích, trace hoặc Python tại đây…",
    record: "Ghi nhận lần làm",
    recorded: "Đã ghi nhận. Bây giờ em có thể mở phản hồi.",
    feedback: "Phản hồi và cách sửa",
    rubric: "Tiêu chí tự kiểm tra",
    noMarkingChain: "Dùng quy tắc của bài để kiểm tra chính xác trạng thái, đầu ra, trường hợp biên và lỗi.",
    detection: "Cách phát hiện lỗi",
    mistake: "Lỗi",
    consequence: "Hậu quả",
    repair: "Cách sửa lỗi",
    criterion: "Điều phải làm đúng",
    recallResponse: "Trả lời từ trí nhớ",
    checkRecall: "Ghi nhận phần nhớ lại",
    retry: "Xóa và thử lại",
    attempts: "Số lần làm",
    nextLesson: "Tiếp tục sang bài kế tiếp",
    noNext: "Em đã tới bài cuối trong chuỗi bài học này.",
    previous: "Chặng trước",
    continue: "Tiếp tục",
    traceGate: "Hãy ghi một dự đoán trong phần trace trước khi tiếp tục.",
    practiseGate: "Hãy ghi ít nhất một lần làm bài trước khi tiếp tục.",
    predictFirst: "Dự đoán trước khi xem kết quả",
    predictPrompt: "Điều gì sẽ thay đổi, và quy tắc nào phải luôn đúng?",
    exampleInput: "Dữ liệu ví dụ",
    expectedResult: "Kết quả mong đợi",
    revealResult: "Ghi dự đoán và mở kết quả",
    noValue: "không có giá trị",
    before: "Trước",
    decisionChange: "Quyết định và thay đổi",
    after: "Sau",
    supportBoundary: "Phần mở rộng của AlgoCore: dùng bài này để củng cố cách suy luận về bảng và va chạm. Chỉ coi một phương pháp là yêu cầu thi khi đề bài ghi rõ yêu cầu đó.",
    representationalOnly: "Đây là cách biểu diễn quan hệ, không phải thuật toán duyệt đồ thị đang được thực thi.",
  },
} as const;

const internalArtifact = /\bac-9618(?:[-.][a-z0-9]+)+\b/gi;
const internalLine = /\b(?:[a-z0-9_.-]+\.)?L\d+(?:\s*[-–—]\s*L?\d+)?\b/gi;
const internalRun = /\b(?:p4r\d+|stage\d+)[\w.-]*\b/gi;
const fixtureReference = /\b(?:fixture\s+)?[\w-]+\.(normal|boundary|failure)\b/gi;
const productionLanguage = /\b(?:A\d+-frozen|production-v\d+|independently rerun|verified source)\b/gi;

const supportUnitKeys = new Set([
  "text-processing/run-length",
  "hashing/find-collisions", "hashing/hash-address", "hashing/insert-collisions", "hashing/table-storage",
  "performance/algorithm-choice", "performance/asymptotic-cost", "performance/trace-cost",
  "graphs/characteristics", "graphs/structure-choice",
]);

function cleanLearnerText(text: string, locale: LearningLocale) {
  return text
    .replace(fixtureReference, (_match, kind: string) => locale === "vi" ? `ví dụ ${kind}` : `the ${kind} example`)
    .replace(internalArtifact, locale === "vi" ? "ví dụ Python" : "the Python example")
    .replace(internalLine, locale === "vi" ? "dòng Python đang xét" : "the current Python line")
    .replace(internalRun, "")
    .replace(productionLanguage, "")
    .replace(/\bIn artifact\s+/gi, "In ")
    .replace(/\blines\s+(?=the current Python line)/gi, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function learnerPythonPurpose(unit: KnowledgeUnit, locale: LearningLocale) {
  // The Teacher-owned connection carries the lesson's real scope. Rebuilding a
  // generic "implement in Python" instruction here incorrectly turns
  // conceptual topics such as Graphs into coding requirements.
  return cleanLearnerText(unit.python_connection[locale], locale);
}

function uniqueTexts(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function StageHeader({ id, number, title, help }: Readonly<{ id: string; number: number; title: string; help: string }>) {
  return <header className={styles.stageHeader}><span>{number}</span><div><h2 id={id} tabIndex={-1}>{title}</h2><p>{help}</p></div></header>;
}

function KnowledgeSelfCheck({ unit, locale }: Readonly<{ unit: KnowledgeUnit; locale: LearningLocale }>) {
  const t = copy[locale];
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [attempted, setAttempted] = useState(false);
  return <section className={styles.selfCheck} data-prediction-recorded={attempted ? "true" : "false"}>
    <h4>{t.selfCheck}</h4>
    <p>{cleanLearnerText(unit.self_check.prompt[locale], locale)}</p>
    <label htmlFor={inputId}>{t.recallResponse}</label>
    <textarea id={inputId} rows={3} value={draft} onChange={(event) => { setDraft(event.currentTarget.value); setAttempted(false); }} />
    <button type="button" disabled={!draft.trim()} onClick={() => setAttempted(true)}>{t.record}</button>
    {attempted && <div data-answer-revealed="true"><p><strong>{t.answer}: </strong>{cleanLearnerText(unit.self_check.answer[locale], locale)}</p><p><strong>{t.rationale}: </strong>{cleanLearnerText(unit.self_check.rationale[locale], locale)}</p></div>}
  </section>;
}

export function CanonicalKnowledgeReference({ knowledgeUnits, locale, primaryKnowledgeUnitId }: Readonly<{ knowledgeUnits: readonly KnowledgeUnit[]; locale: LearningLocale; primaryKnowledgeUnitId?: string }>) {
  const t = copy[locale];
  const [openUnit, setOpenUnit] = useState<number | null>(0);
  const lessonSlug = knowledgeUnits[0]?.knowledge_unit_id.match(/\.lesson\.([^.]+)\.knowledge\./)?.[1] ?? "";
  const orderedUnits = primaryKnowledgeUnitId
    ? [...knowledgeUnits].sort((left, right) => Number(right.knowledge_unit_id === primaryKnowledgeUnitId) - Number(left.knowledge_unit_id === primaryKnowledgeUnitId))
    : knowledgeUnits;
  return <section className={styles.knowledgeReference} data-canonical-knowledge-reference data-knowledge-unit-count={knowledgeUnits.length}>
    <header><h3>{t.knowledgeReference}</h3><p>{t.knowledgeReferenceHelp}</p></header>
    <div className={styles.knowledgeList}>
      {orderedUnits.map((unit, index) => {
        const shortId = unit.knowledge_unit_id.split(".").at(-1) ?? `concept-${index + 1}`;
        const support = supportUnitKeys.has(`${lessonSlug}/${shortId}`);
        const primary = unit.knowledge_unit_id === primaryKnowledgeUnitId;
        return <details key={unit.knowledge_unit_id} className={`${styles.knowledgeUnit} ${support ? styles.supportUnit : ""}`} data-canonical-knowledge-unit data-primary-concept={primary ? "true" : undefined} data-knowledge-role={support ? "support" : "publish"} open={openUnit === index} onToggle={(event) => { if (event.currentTarget.open) setOpenUnit(index); else if (openUnit === index) setOpenUnit(null); }}>
        <summary><span>{support ? t.support : `${t.concept} ${index + 1}`}</span><strong>{cleanLearnerText(unit.title[locale], locale)}</strong></summary>
        <div className={styles.knowledgeBody}>
          <section><h4>{t.explanation}</h4><p>{cleanLearnerText(unit.explanation[locale], locale)}</p></section>
          <section><h4>{t.pythonConnection}</h4><p>{learnerPythonPurpose(unit, locale)}</p></section>
          <section><h4>{t.representation}</h4><p>{cleanLearnerText(unit.representation[locale], locale)}</p></section>
          <aside className={styles.invariant}><h4>{t.invariant}</h4><p>{cleanLearnerText(unit.invariant_or_rule[locale], locale)}</p></aside>
          <div className={styles.knowledgeColumns}>
            <section><h4>{t.misconceptions}</h4><ul>{unit.misconceptions.map((item, itemIndex) => <li key={itemIndex}>{cleanLearnerText(item[locale], locale)}</li>)}</ul></section>
            <section><h4>{t.examSignals}</h4><ul>{unit.exam_signals.map((item, itemIndex) => <li key={itemIndex}>{cleanLearnerText(item[locale], locale)}</li>)}</ul></section>
          </div>
          <section className={styles.microExample}><h4>{t.microExample}</h4><p><strong>{t.scenario}: </strong>{cleanLearnerText(unit.micro_example.scenario[locale], locale)}</p><p><strong>{t.walkthrough}: </strong>{cleanLearnerText(unit.micro_example.walkthrough[locale], locale)}</p></section>
          <KnowledgeSelfCheck unit={unit} locale={locale} />
        </div>
      </details>;})}
    </div>
  </section>;
}

function PracticeCard({ item, locale, position, onAttempt, storageKey }: Readonly<{ item: AssessmentItem; locale: LearningLocale; position: number; onAttempt: () => void; storageKey: string }>) {
  const t = copy[locale];
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [attempt, setAttempt] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "null") as { draft?: unknown; attempt?: unknown } | null;
      if (stored && typeof stored.draft === "string") setDraft(stored.draft);
      if (stored && typeof stored.attempt === "string") { setAttempt(stored.attempt); onAttempt(); }
    } catch { /* A malformed optional draft must not block the lesson. */ }
    setRestored(true);
  }, [onAttempt, storageKey]);
  useEffect(() => {
    if (!restored) return;
    try { window.sessionStorage.setItem(storageKey, JSON.stringify({ draft, attempt })); } catch { /* Storage is progressive enhancement. */ }
  }, [attempt, draft, restored, storageKey]);
  return <details className={styles.interactionCard} data-canonical-practice-item data-prediction-recorded={attempt ? "true" : "false"}>
    <summary><span>{position}</span><strong>{cleanLearnerText(item.prompt[locale], locale)}</strong></summary>
    <div className={styles.interactionBody}>
      <p><strong>{t.expected}: </strong>{cleanLearnerText(item.expected_artifact[locale], locale)}</p>
      <label htmlFor={inputId}>{t.response}</label>
      <textarea id={inputId} rows={6} value={draft} placeholder={t.responsePlaceholder} onChange={(event) => { setDraft(event.currentTarget.value); setAttempt(null); }} />
      <button type="button" disabled={!draft.trim()} onClick={() => { setAttempt(draft.trim()); onAttempt(); }}>{t.record}</button>
      <p role="status">{attempt ? t.recorded : ""}</p>
      {attempt && <div className={styles.feedback} data-answer-revealed="true">
        <details className={styles.nestedDisclosure}><summary>{t.hint}</summary><p>{cleanLearnerText(item.hint[locale], locale)}</p></details>
        <p><strong>{t.feedback}: </strong>{cleanLearnerText(item.feedback[locale], locale)}</p>
        <details className={styles.nestedDisclosure}><summary>{t.rubric}</summary><ul>{item.self_rubric.criteria.map((criterion, index) => <li key={index}>{cleanLearnerText(criterion.description[locale], locale)}</li>)}</ul><p>{cleanLearnerText(item.self_rubric.pass_rule[locale], locale)}</p><p>{cleanLearnerText(item.self_rubric.retry_rule[locale], locale)}</p></details>
      </div>}
    </div>
  </details>;
}

function RecallCard({ item, locale, position }: Readonly<{ item: RetrievalItem; locale: LearningLocale; position: number }>) {
  const t = copy[locale];
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [attempt, setAttempt] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  return <details className={styles.interactionCard} data-canonical-retrieval-item data-prediction-recorded={attempt ? "true" : "false"}>
    <summary><span>{position}</span><strong>{cleanLearnerText(item.prompt[locale], locale)}</strong></summary>
    <div className={styles.interactionBody}>
      <p>{cleanLearnerText(item.response_contract.prompt[locale], locale)}</p>
      <label htmlFor={inputId}>{t.recallResponse}</label>
      <textarea id={inputId} rows={5} value={draft} placeholder={t.responsePlaceholder} onChange={(event) => { setDraft(event.currentTarget.value); setAttempt(null); }} />
      <div className={styles.inlineActions}><button type="button" disabled={!draft.trim()} onClick={() => { setAttempt(draft.trim()); setAttempts((value) => value + 1); }}>{t.checkRecall}</button><span>{t.attempts}: {attempts}</span></div>
      {attempt && <div className={styles.feedback} data-answer-revealed="true">
        <details className={styles.nestedDisclosure}><summary>{t.revealAnswer}</summary><p><strong>{t.answer}: </strong>{cleanLearnerText(item.answer[locale], locale)}</p><p><strong>{t.rationale}: </strong>{cleanLearnerText(item.rationale[locale], locale)}</p></details>
        <p><strong>{t.detection}: </strong>{cleanLearnerText(item.diagnosis.misconception_to_check[locale], locale)}</p>
        <p><strong>{t.repair}: </strong>{cleanLearnerText(item.repair.action[locale], locale)}</p>
        <button type="button" onClick={() => { setDraft(""); setAttempt(null); }}>{t.retry}</button>
      </div>}
    </div>
  </details>;
}

const primaryPatternByLesson: Readonly<Record<string, string>> = {
  "binary-tree": "TREE_INSERT",
  hashing: "HASH_INSERT",
  "oop-model": "OOP_INSTANTIATE",
  "oop-state": "OOP_UPDATE",
  "oop-inheritance": "OOP_OVERRIDE",
  "oop-aggregation": "OOP_CAPACITY_ADD",
  "text-files": "FILE_READ_ARRAY",
  "object-files": "FILE_READ_OBJECTS",
  "exam-workflow": "MAIN_FLOW",
};

const primaryKnowledgeByLesson: Readonly<Record<string, string>> = {
  "binary-tree": "ordered-insert",
  dictionary: "find-insert",
  hashing: "insert-collisions",
  "oop-model": "constructor",
  "oop-state": "rule-updates",
  "oop-inheritance": "override-dispatch",
  "oop-aggregation": "bounded-add",
  "text-files": "record-loading",
  "object-files": "construct-from-record",
  "random-files": "read-write-update",
  exceptions: "handle-recover",
  graphs: "characteristics",
  "exam-workflow": "compose-main",
};

function primaryKnowledgeUnit(lesson: LessonDto) {
  const shortId = primaryKnowledgeByLesson[lesson.identity.slug];
  return lesson.theory.knowledge_units.find((unit) => unit.knowledge_unit_id.split(".").at(-1) === shortId) ?? lesson.theory.knowledge_units[0];
}

function primaryFirst<T extends { readonly knowledge_unit_id: string }>(items: readonly T[], primaryId: string | undefined) {
  if (!primaryId) return [...items];
  return [...items].sort((left, right) => Number(right.knowledge_unit_id === primaryId) - Number(left.knowledge_unit_id === primaryId));
}

function humanKey(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function primitiveText(value: string | number | boolean | null, locale: LearningLocale) {
  if (value === null) return copy[locale].noValue;
  if (typeof value === "boolean") return value ? (locale === "vi" ? "có" : "yes") : (locale === "vi" ? "không" : "no");
  return String(value);
}

function LearnerValue({ value, locale, depth = 0 }: Readonly<{ value: JsonValue; locale: LearningLocale; depth?: number }>) {
  if (value === null || typeof value !== "object") return <span>{primitiveText(value, locale)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>{copy[locale].noValue}</span>;
    if (value.every((item) => item === null || typeof item !== "object")) {
      return <span className={styles.valueSequence}>{value.map((item) => primitiveText(item as string | number | boolean | null, locale)).join(" · ")}</span>;
    }
    if (depth >= 2) return <span>{locale === "vi" ? `${value.length} mục` : `${value.length} items`}</span>;
    return <ol className={styles.valueItems}>{value.slice(0, 6).map((item, index) => <li key={index}><LearnerValue value={item} locale={locale} depth={depth + 1} /></li>)}</ol>;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return <span>{copy[locale].noValue}</span>;
  if (depth >= 2) return <span>{locale === "vi" ? `${entries.length} thuộc tính` : `${entries.length} properties`}</span>;
  return <dl className={styles.valueList}>{entries.slice(0, 8).map(([key, item]) => <div key={key}><dt>{humanKey(key)}</dt><dd><LearnerValue value={item} locale={locale} depth={depth + 1} /></dd></div>)}</dl>;
}

const fallbackStepsByLesson: Readonly<Record<string, Readonly<Record<LearningLocale, readonly string[]>>>> = {
  dictionary: {
    en: ["Find the requested key without changing the entries.", "Insert a new key, or update/reject a duplicate exactly as the contract states.", "Delete only when the key exists; a missing delete leaves all entries unchanged."],
    vi: ["Tìm khóa được yêu cầu mà không thay đổi các entry.", "Chèn khóa mới, hoặc cập nhật/từ chối khóa trùng đúng theo contract.", "Chỉ xóa khi khóa tồn tại; nếu khóa thiếu thì mọi entry phải giữ nguyên."],
  },
  "random-files": {
    en: ["Calculate the byte offset from address × fixed record size.", "Seek to that offset and read exactly one record.", "Write one correctly sized replacement at the same offset, then check that neighbouring records did not change."],
    vi: ["Tính byte offset bằng địa chỉ × kích thước cố định của record.", "Seek tới offset đó và đọc đúng một record.", "Ghi một record thay thế đúng kích thước tại cùng offset, rồi kiểm tra các record lân cận không đổi."],
  },
  exceptions: {
    en: ["Attempt the read and conversion in the protected block.", "At the first failure, choose the matching specific handler and preserve the last valid value.", "Run cleanup on both success and failure so the resource is closed."],
    vi: ["Thực hiện đọc và chuyển đổi trong khối được bảo vệ.", "Tại lỗi đầu tiên, chọn đúng handler cụ thể và giữ lại giá trị hợp lệ gần nhất.", "Luôn cleanup ở cả trường hợp thành công và lỗi để tài nguyên được đóng."],
  },
  graphs: {
    en: ["Identify the vertices and the relationships that form edges.", "Decide whether direction matters, then represent each accepted relationship once according to that choice.", "Reject an edge with an unknown endpoint and keep the existing representation unchanged."],
    vi: ["Xác định các vertex và những quan hệ tạo thành edge.", "Quyết định quan hệ có hướng hay không, rồi biểu diễn mỗi quan hệ hợp lệ đúng một lần theo lựa chọn đó.", "Từ chối edge có endpoint không tồn tại và giữ nguyên biểu diễn hiện tại."],
  },
};

function learnerOutcome(value: JsonValue): JsonValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "trace"));
}

function FallbackTracePrediction({ lesson, locale, onProgress, storageKey }: Readonly<{ lesson: LessonDto; locale: LearningLocale; onProgress: () => void; storageKey: string }>) {
  const t = copy[locale];
  const inputId = useId();
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "null") as { scenarioIndex?: unknown; draft?: unknown; revealed?: unknown } | null;
      if (stored && typeof stored.scenarioIndex === "number" && stored.scenarioIndex >= 0 && stored.scenarioIndex < lesson.tests.fixtures.length) setScenarioIndex(stored.scenarioIndex);
      if (stored && typeof stored.draft === "string") setDraft(stored.draft);
      if (stored?.revealed === true) { setRevealed(true); onProgress(); }
    } catch { /* A malformed optional trace draft must not block the lesson. */ }
    setRestored(true);
  }, [lesson.tests.fixtures.length, onProgress, storageKey]);
  useEffect(() => {
    if (!restored) return;
    try { window.sessionStorage.setItem(storageKey, JSON.stringify({ scenarioIndex, draft, revealed })); } catch { /* Storage is progressive enhancement. */ }
  }, [draft, restored, revealed, scenarioIndex, storageKey]);
  const fixture = lesson.tests.fixtures[scenarioIndex] ?? lesson.tests.fixtures[0];
  const expected = lesson.tests.expected_outputs.find((item) => item.fixture_ref === fixture?.fixture_id);
  const decisionSteps = fallbackStepsByLesson[lesson.identity.slug]?.[locale] ?? [cleanLearnerText(primaryKnowledgeUnit(lesson)?.representation[locale] ?? t.visualUnavailable, locale)];
  const scenarioLabel = (kind: string) => kind === "normal" ? t.normal : kind === "boundary" ? t.boundary : t.failure;
  if (!fixture) return <p className={styles.fallback}>{t.visualUnavailable}</p>;
  return <section className={styles.fallbackTrace} data-fallback-trace data-prediction-recorded={revealed ? "true" : "false"}>
    <header><h3>{t.predictFirst}</h3><p>{t.predictPrompt}</p></header>
    <div className={styles.scenarioTabs} role="group" aria-label={t.scenariosCovered}>{lesson.tests.fixtures.map((item, index) => <button key={item.fixture_id} type="button" aria-pressed={index === scenarioIndex} onClick={() => { setScenarioIndex(index); setDraft(""); setRevealed(false); }}>{scenarioLabel(item.case_kind)}</button>)}</div>
    <section className={styles.valuePanel}><h4>{t.exampleInput}</h4><LearnerValue value={fixture.input} locale={locale} /></section>
    <label htmlFor={inputId}>{t.predictPrompt}</label>
    <textarea id={inputId} rows={4} value={draft} placeholder={t.responsePlaceholder} onChange={(event) => { setDraft(event.currentTarget.value); setRevealed(false); }} />
    <button type="button" disabled={!draft.trim()} onClick={() => { setRevealed(true); onProgress(); }}>{t.revealResult}</button>
    {revealed && expected && <div className={styles.transitionGrid} data-answer-revealed="true">
      <section className={styles.valuePanel}><h4>{t.before}</h4><LearnerValue value={fixture.input} locale={locale} /></section>
      <section className={styles.valuePanel}><h4>{t.decisionChange}</h4>{lesson.identity.slug === "graphs" && <p>{t.representationalOnly}</p>}<ol>{decisionSteps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section className={styles.valuePanel}><h4>{t.after}</h4><LearnerValue value={learnerOutcome(expected.value)} locale={locale} /></section>
    </div>}
  </section>;
}

function ProtectMarks({ lesson, locale, primaryKnowledgeUnitId }: Readonly<{ lesson: LessonDto; locale: LearningLocale; primaryKnowledgeUnitId?: string }>) {
  const t = copy[locale];
  const [openRisk, setOpenRisk] = useState<number | null>(0);
  const units = primaryFirst(lesson.theory.knowledge_units, primaryKnowledgeUnitId);
  const risks = units.flatMap((unit) => {
    const misconception = lesson.errors.misconceptions.find((candidate) => candidate.knowledge_unit_id === unit.knowledge_unit_id);
    return misconception ? [{ misconception, unit }] : [];
  }).slice(0, 4);
  if (risks.length === 0) return <p className={styles.fallback}>{t.noMarkingChain}</p>;
  return <div className={styles.markingList}>{risks.map(({ misconception, unit }, index) => {
    const invariant = cleanLearnerText(unit.invariant_or_rule[locale], locale);
    const traceAction = cleanLearnerText(unit.representation[locale], locale);
    const consequence = locale === "vi" ? `Trạng thái đầu tiên bị sai khi không còn thỏa quy tắc: ${invariant}` : `The first incorrect state is the point where this rule no longer holds: ${invariant}`;
    const repair = locale === "vi" ? `Làm lại bước đó theo trace này: ${traceAction}` : `Rebuild that step using this trace action: ${traceAction}`;
    return <details className={styles.riskCard} key={`${unit.knowledge_unit_id}-${index}`} open={openRisk === index} onToggle={(event) => { if (event.currentTarget.open) setOpenRisk(index); else if (openRisk === index) setOpenRisk(null); }}><summary>{t.criterion} {index + 1}: {cleanLearnerText(unit.title[locale], locale)}</summary><div><p><strong>{t.mistake}: </strong>{cleanLearnerText(misconception[locale], locale)}</p><p><strong>{t.consequence}: </strong>{consequence}</p><p><strong>{t.repair}: </strong>{repair}</p></div></details>;
  })}</div>;
}

function CurrentStageShell({ stageId, labelledBy, state, current, children }: Readonly<{ stageId: "recognise" | "understand" | "trace" | "practise" | "protect" | "recall"; labelledBy: string; state: "current" | "complete" | "locked"; current: boolean; children: ReactNode }>) {
  const common = { id: `canonical-stage-${stageId}`, className: styles.stage, "data-canonical-stage": stageId, "data-stage-state": state, "aria-labelledby": current ? labelledBy : undefined } as const;
  if (stageId === "recognise") return <section {...common} data-learner-stage="recognise" hidden={!current} aria-hidden={current ? undefined : "true"}>{children}</section>;
  if (stageId === "understand") return <section {...common} data-learner-stage="understand" hidden={!current} aria-hidden={current ? undefined : "true"}>{children}</section>;
  if (stageId === "trace") return <section {...common} data-learner-stage="trace" hidden={!current} aria-hidden={current ? undefined : "true"}>{children}</section>;
  if (stageId === "practise") return <section {...common} data-learner-stage="practise" hidden={!current} aria-hidden={current ? undefined : "true"}>{children}</section>;
  if (stageId === "protect") return <section {...common} data-learner-stage="protectMarks" hidden={!current} aria-hidden={current ? undefined : "true"}>{children}</section>;
  return <section {...common} data-learner-stage="recallAndContinue" hidden={!current} aria-hidden={current ? undefined : "true"}>{children}</section>;
}

export function CanonicalLessonJourney({ lesson, locale, nextLesson }: Readonly<{ lesson: LessonDto; locale: LearningLocale; nextLesson: LessonNavigationItem | null }>) {
  const t = copy[locale];
  const units = lesson.theory.knowledge_units;
  const primaryUnit = primaryKnowledgeUnit(lesson);
  const primaryKnowledgeUnitId = primaryUnit?.knowledge_unit_id;
  const orderedUnits = primaryFirst(units, primaryKnowledgeUnitId);
  const signals = uniqueTexts(orderedUnits.flatMap((unit) => unit.exam_signals.map((signal) => cleanLearnerText(signal[locale], locale))));
  const patterns = [...lesson.visual.owned_patterns, ...(lesson.visual.trace_backed_association_patterns ?? [])];
  const source = [...lesson.python.lines].sort((a, b) => a.order - b.order).map((line) => line.text).join("\n");
  const coverage = lesson.tests.normal_boundary_failure_coverage;
  const nextHref = nextLesson ? `/paper-4/lessons/${nextLesson.slug}?lang=${locale}` : null;
  const [activeStage, setActiveStage] = useState("recognise");
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [traceReady, setTraceReady] = useState(false);
  const [practiceReady, setPracticeReady] = useState(false);
  const [progressRestored, setProgressRestored] = useState(false);
  const stages = [
    ["recognise", "recognise", t.recognise, t.recogniseHelp],
    ["understand", "understand", t.understand, t.understandHelp],
    ["trace", "trace", t.trace, t.traceHelp],
    ["practise", "practise", t.practise, t.practiseHelp],
    ["protect", "protectMarks", t.protect, t.protectHelp],
    ["recall", "recallAndContinue", t.recall, t.recallHelp],
  ] as const;
  const activeIndex = stages.findIndex(([candidateStageId]) => candidateStageId === activeStage);
  const [stageId, , stageTitle, stageHelp] = stages[activeIndex];
  const initialPatternId = primaryPatternByLesson[lesson.identity.slug];
  const gateReady = stageId === "trace" ? traceReady : stageId === "practise" ? practiceReady : true;
  const progressKey = `algocore.paper4.canonical.${lesson.identity.slug}.progress.v1`;
  const fallbackTraceKey = `${progressKey}.trace`;
  const sourceLabelId = useId();
  const recordTraceProgress = useCallback(() => setTraceReady(true), []);
  const recordPracticeProgress = useCallback(() => setPracticeReady(true), []);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(progressKey) ?? "null") as { activeStage?: unknown; unlockedIndex?: unknown; traceReady?: unknown; practiceReady?: unknown } | null;
      if (stored && typeof stored.activeStage === "string" && stages.some(([candidate]) => candidate === stored.activeStage)) setActiveStage(stored.activeStage);
      if (stored && typeof stored.unlockedIndex === "number") setUnlockedIndex(Math.max(0, Math.min(stages.length - 1, stored.unlockedIndex)));
      if (stored?.traceReady === true) setTraceReady(true);
      if (stored?.practiceReady === true) setPracticeReady(true);
    } catch { /* A malformed optional progress record must not block the lesson. */ }
    setProgressRestored(true);
  }, [progressKey]);

  useEffect(() => {
    if (!progressRestored) return;
    try { window.sessionStorage.setItem(progressKey, JSON.stringify({ activeStage, unlockedIndex, traceReady, practiceReady })); } catch { /* Storage is progressive enhancement. */ }
  }, [activeStage, practiceReady, progressKey, progressRestored, traceReady, unlockedIndex]);

  const selectStage = (index: number) => {
    if (index < 0 || index > unlockedIndex) return;
    setActiveStage(stages[index][0]);
    requestAnimationFrame(() => document.getElementById(`canonical-stage-${stages[index][0]}-title`)?.focus());
  };
  const advance = () => {
    if (!gateReady || activeIndex >= stages.length - 1) return;
    const nextIndex = activeIndex + 1;
    setUnlockedIndex((value) => Math.max(value, nextIndex));
    setActiveStage(stages[nextIndex][0]);
    requestAnimationFrame(() => document.getElementById(`canonical-stage-${stages[nextIndex][0]}-title`)?.focus());
  };

  let stageContent;
  if (stageId === "recognise") stageContent = <div className={styles.stageBody}>{lesson.identity.slug === "hashing" && <aside className={styles.fallback} role="note"><strong>{t.support}</strong><p>{t.supportBoundary}</p></aside>}<article className={styles.leadCard} data-primary-concept="true"><h3>{t.overview}</h3><p>{cleanLearnerText(primaryUnit?.explanation[locale] ?? lesson.identity.title[locale], locale)}</p></article><article><h3>{t.signals}</h3><ul>{signals.slice(0, 4).map((signal) => <li key={signal}>{signal}</li>)}</ul></article><dl className={styles.contractFacts}><div><dt>{t.precondition}</dt><dd>{cleanLearnerText(primaryUnit?.invariant_or_rule[locale] ?? "", locale)}</dd></div><div><dt>{t.outputContract}</dt><dd>{cleanLearnerText(lesson.practice.items[0]?.expected_artifact[locale] ?? lesson.identity.title[locale], locale)}</dd></div></dl></div>;
  else if (stageId === "understand") stageContent = <CanonicalKnowledgeReference knowledgeUnits={units} locale={locale} primaryKnowledgeUnitId={primaryKnowledgeUnitId} />;
  else if (stageId === "trace") stageContent = <div className={styles.stageBody}>{lesson.identity.slug === "hashing" && <aside className={styles.fallback} role="note"><strong>{t.support}</strong><p>{t.supportBoundary}</p></aside>}<article className={styles.codeCard}><header><div><h3 id={sourceLabelId}>{t.verifiedPython}</h3><p>{t.verifiedPythonHelp}</p></div><ul aria-label={t.scenariosCovered}>{coverage.normal && <li>{t.normal}</li>}{coverage.boundary && <li>{t.boundary}</li>}{coverage.failure && <li>{t.failure}</li>}</ul></header><details><summary>{t.openCode}</summary><pre tabIndex={0} role="region" aria-labelledby={sourceLabelId}><code>{source}</code></pre></details></article><section aria-label={t.visualTrace}>{patterns.length > 0 ? <Paper4VisualRuntime patterns={patterns} pythonArtifact={lesson.python} initialPatternId={initialPatternId} initialLocale={locale} locale={locale} audience="learner" onLearnerProgress={({ hasRecordedPrediction }) => { if (hasRecordedPrediction) recordTraceProgress(); }} /> : <FallbackTracePrediction lesson={lesson} locale={locale} onProgress={recordTraceProgress} storageKey={fallbackTraceKey} />}</section></div>;
  else if (stageId === "practise") stageContent = <div className={styles.cardList}>{lesson.identity.slug === "hashing" && <aside className={styles.fallback} role="note"><strong>{t.support}</strong><p>{t.supportBoundary}</p></aside>}{lesson.practice.items.map((item, index) => <PracticeCard key={item.assessment_item_id} item={item} locale={locale} position={index + 1} onAttempt={recordPracticeProgress} storageKey={`${progressKey}.practice.${item.assessment_item_id}`} />)}</div>;
  else if (stageId === "protect") stageContent = <ProtectMarks lesson={lesson} locale={locale} primaryKnowledgeUnitId={primaryKnowledgeUnitId} />;
  else stageContent = <><div className={styles.cardList}>{primaryFirst(lesson.retrieval.items, primaryKnowledgeUnitId).slice(0, 5).map((item, index) => <RecallCard key={item.knowledge_unit_id} item={item} locale={locale} position={index + 1} />)}</div><footer className={styles.nextLesson}>{nextHref ? <a href={nextHref}>{t.nextLesson}: {nextLesson!.title[locale]} →</a> : <p>{t.noNext}</p>}</footer></>;

  const stageItems: readonly Paper4StageItem[] = stages.map(([id, , label], index) => ({
    id,
    label,
    state: index === activeIndex ? "current" : index <= unlockedIndex ? "complete" : "locked",
    disabled: index > unlockedIndex,
    onSelect: () => selectStage(index),
  }));

  return <Paper4LessonShell
    className={styles.journey}
    items={stageItems}
    journeyKind="canonical"
    knowledgeUnitCount={units.length}
    lessonSlug={lesson.identity.slug}
    locale={locale}
  >
    {stages.map(([candidateStageId], index) => {
      const current = index === activeIndex;
      const state = current ? "current" : index <= unlockedIndex ? "complete" : "locked";
      return <CurrentStageShell key={candidateStageId} stageId={candidateStageId} labelledBy={`canonical-stage-${candidateStageId}-title`} state={state} current={current}>
        {current && <>
          <StageHeader id={`canonical-stage-${stageId}-title`} number={activeIndex + 1} title={stageTitle} help={stageHelp} />
          {stageContent}
          {(stageId === "trace" || stageId === "practise") && !gateReady && <p className={styles.gateHint} role="status">{stageId === "trace" ? t.traceGate : t.practiseGate}</p>}
          <div className={styles.stageActions}>{activeIndex > 0 && <button type="button" className={styles.secondaryAction} onClick={() => selectStage(activeIndex - 1)}>← {t.previous}</button>}{activeIndex < stages.length - 1 && <button type="button" className={styles.primaryAction} data-exit-gate={stageId === "trace" ? "prediction" : stageId === "practise" ? "attempt" : "open"} disabled={!gateReady} onClick={advance}>{t.continue}: {stages[activeIndex + 1][2]} →</button>}</div>
        </>}
      </CurrentStageShell>;
    })}
  </Paper4LessonShell>;
}

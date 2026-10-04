"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { Button, CodePanel, Select, StateVisual } from "@/app/components/algocore-ui";
import { Paper4VisualRuntime } from "@/app/components/paper4-visual";
import type { LocalizedText, PatternMetadata, PythonArtifactDto } from "@/app/components/paper4-visual/types";

import styles from "./PatternRuntimeSupplement.module.css";
import type { LearningLocale } from "./types";

const copy = {
  en: {
    title: "Additional exam patterns",
    help: "Study the short function for this question type. The verification harness runs behind the lesson and is not code you need to reproduce in the exam.",
    choose: "Question pattern",
    code: "Exam-ready Python pattern",
    adapt: "Adapt parameter names, field names and the result contract to the wording of the question.",
    trace: "Worked trace",
    step: "Step",
    of: "of",
    previous: "Previous",
    next: "Next",
    rule: "Rule to remember",
  },
  vi: {
    title: "Các dạng code bổ sung cho bài thi",
    help: "Học function ngắn dành cho từng dạng câu hỏi. Bộ harness kiểm chứng chạy phía sau bài học và không phải phần code em cần chép vào bài thi.",
    choose: "Dạng câu hỏi",
    code: "Mẫu Python dùng cho bài thi",
    adapt: "Hãy đổi tên tham số, tên trường và hợp đồng kết quả theo đúng yêu cầu của đề.",
    trace: "Trace ví dụ",
    step: "Bước",
    of: "trên",
    previous: "Trước",
    next: "Tiếp",
    rule: "Quy tắc cần nhớ",
  },
} as const;

type ExamTraceStep = Readonly<{
  active: readonly number[];
  facts: readonly Readonly<{ label: LocalizedText; value: LocalizedText | number }>[];
  explanation: LocalizedText;
}>;

type ExamPattern = Readonly<{
  patternId: string;
  title: LocalizedText;
  caption: LocalizedText;
  rule: LocalizedText;
  code: readonly string[];
  steps: readonly ExamTraceStep[];
}>;

const bi = (en: string, vi: string): LocalizedText => ({ en, vi });
const fact = (labelEn: string, labelVi: string, valueEn: string | number, valueVi: string | number = valueEn): ExamTraceStep["facts"][number] => ({
  label: bi(labelEn, labelVi),
  value: typeof valueEn === "number" ? valueEn : bi(valueEn, String(valueVi)),
});

const searchCollectionPatterns: readonly ExamPattern[] = [
  {
    patternId: "COUNT_OCCURRENCES",
    title: bi("Count every match", "Đếm mọi phần tử khớp"),
    caption: bi("Example: count 4 in [4, 2, 4, 8]", "Ví dụ: đếm số 4 trong [4, 2, 4, 8]"),
    rule: bi("Scan the complete collection and increase count once for each match.", "Quét hết collection và tăng count đúng một lần cho mỗi phần tử khớp."),
    code: [
      "def count_occurrences(values, target):",
      "    count = 0",
      "    for value in values:",
      "        if value == target:",
      "            count += 1",
      "    return count",
    ],
    steps: [
      { active: [2], facts: [fact("next value", "value tiếp theo", "4"), fact("count", "count", 0)], explanation: bi("Initialise the accumulator before the loop.", "Khởi tạo biến đếm trước vòng lặp.") },
      { active: [3, 4, 5], facts: [fact("value", "value", 4), fact("match", "khớp", "True", "Đúng"), fact("count", "count", 1)], explanation: bi("The first 4 matches, so count becomes 1.", "Số 4 đầu tiên khớp, nên count trở thành 1.") },
      { active: [3, 4], facts: [fact("value", "value", 2), fact("match", "khớp", "False", "Sai"), fact("count", "count", 1)], explanation: bi("2 does not match; count stays 1.", "Số 2 không khớp; count vẫn là 1.") },
      { active: [3, 4, 5], facts: [fact("value", "value", 4), fact("match", "khớp", "True", "Đúng"), fact("count", "count", 2)], explanation: bi("The second 4 also counts. Do not stop after the first match.", "Số 4 thứ hai cũng phải được đếm. Không dừng sau match đầu tiên.") },
      { active: [3, 4], facts: [fact("value", "value", 8), fact("match", "khớp", "False", "Sai"), fact("count", "count", 2)], explanation: bi("8 does not match; the complete collection has now been scanned.", "Số 8 không khớp; toàn bộ collection đã được quét.") },
      { active: [6], facts: [fact("returned", "giá trị trả về", 2)], explanation: bi("Return the final count only after the loop finishes.", "Chỉ trả count sau khi vòng lặp kết thúc.") },
    ],
  },
  {
    patternId: "FILTER_RECORDS",
    title: bi("Filter every matching record", "Lọc mọi record phù hợp"),
    caption: bi("Example: retain amounts at least 4 from [5, 2, 4]", "Ví dụ: giữ các amount ít nhất bằng 4 từ [5, 2, 4]"),
    rule: bi("Test every record with the same condition and append every match in scan order.", "Kiểm tra mọi record bằng cùng một điều kiện và append mọi match theo thứ tự quét."),
    code: [
      "def filter_records(records, threshold):",
      "    selected = []",
      "    for record in records:",
      "        if record[\"amount\"] >= threshold:",
      "            selected.append(record)",
      "    return selected",
    ],
    steps: [
      { active: [2], facts: [fact("threshold", "threshold", 4), fact("selected amounts", "amount đã giữ", "[]")], explanation: bi("Start with an empty result list.", "Bắt đầu với danh sách kết quả rỗng.") },
      { active: [3, 4, 5], facts: [fact("amount", "amount", 5), fact("condition", "điều kiện", "True", "Đúng"), fact("selected amounts", "amount đã giữ", "[5]")], explanation: bi("5 meets the condition, so append its record.", "5 thỏa điều kiện, nên append record đó.") },
      { active: [3, 4], facts: [fact("amount", "amount", 2), fact("condition", "điều kiện", "False", "Sai"), fact("selected amounts", "amount đã giữ", "[5]")], explanation: bi("2 is skipped, but the scan continues.", "2 bị bỏ qua, nhưng vòng quét vẫn tiếp tục.") },
      { active: [3, 4, 5], facts: [fact("amount", "amount", 4), fact("condition", "điều kiện", "True", "Đúng"), fact("selected amounts", "amount đã giữ", "[5, 4]")], explanation: bi("4 is on the inclusive boundary and must be retained.", "4 nằm đúng biên bao gồm và phải được giữ lại.") },
      { active: [6], facts: [fact("returned amounts", "amount trả về", "[5, 4]")], explanation: bi("Return all retained records after the complete scan.", "Trả về toàn bộ record đã giữ sau khi quét hết.") },
    ],
  },
  {
    patternId: "GROUP_AGGREGATE",
    title: bi("Build grouped totals", "Tính tổng theo nhóm"),
    caption: bi("Example: A:5, B:2, A:4", "Ví dụ: A:5, B:2, A:4"),
    rule: bi("Create a key once, then update the existing total for every later record with that key.", "Tạo key đúng một lần, sau đó cập nhật tổng hiện có cho mọi record tiếp theo cùng key."),
    code: [
      "def group_totals(records):",
      "    totals = {}",
      "    for record in records:",
      "        key = record[\"group\"]",
      "        if key not in totals:",
      "            totals[key] = 0",
      "        totals[key] += record[\"amount\"]",
      "    return totals",
    ],
    steps: [
      { active: [2], facts: [fact("totals", "totals", "{}")], explanation: bi("Initialise one dictionary for the grouped totals.", "Khởi tạo một dictionary để lưu tổng theo nhóm.") },
      { active: [5, 6, 7], facts: [fact("record", "record", "A:5"), fact("new key", "key mới", "True", "Đúng"), fact("totals", "totals", "{'A': 5}")], explanation: bi("A is new: create it at 0, then add 5.", "A là key mới: tạo với 0, rồi cộng 5.") },
      { active: [5, 6, 7], facts: [fact("record", "record", "B:2"), fact("new key", "key mới", "True", "Đúng"), fact("totals", "totals", "{'A': 5, 'B': 2}")], explanation: bi("B is new and becomes a second group.", "B là key mới và trở thành nhóm thứ hai.") },
      { active: [5, 7], facts: [fact("record", "record", "A:4"), fact("new key", "key mới", "False", "Sai"), fact("totals", "totals", "{'A': 9, 'B': 2}")], explanation: bi("A already exists, so update A instead of creating another key.", "A đã tồn tại, nên cập nhật A thay vì tạo thêm key.") },
      { active: [8], facts: [fact("returned", "giá trị trả về", "{'A': 9, 'B': 2}")], explanation: bi("Return the completed totals after every record has contributed once.", "Trả totals hoàn chỉnh sau khi mỗi record đã đóng góp đúng một lần.") },
    ],
  },
] as const;

const stackPatterns: readonly ExamPattern[] = [
  {
    patternId: "STACK_PAIR",
    title: bi("Pop one item from each stack", "Lấy một phần tử từ mỗi stack"),
    caption: bi("Example: left [3, 7], right [4, 9]", "Ví dụ: left [3, 7], right [4, 9]"),
    rule: bi("Check both stacks before changing either one. Then pop once from each stack.", "Kiểm tra cả hai stack trước khi thay đổi stack nào. Sau đó pop đúng một lần từ mỗi stack."),
    code: [
      "def pop_pair(left_stack, right_stack):",
      "    if left_stack.top == -1 or right_stack.top == -1:",
      "        return None",
      "    left_item = left_stack.pop()",
      "    right_item = right_stack.pop()",
      "    return [left_item, right_item]",
    ],
    steps: [
      { active: [2, 3], facts: [fact("left top", "top bên trái", 1), fact("right top", "top bên phải", 1), fact("empty stack", "stack rỗng", "False", "Sai")], explanation: bi("Both stacks contain an item, so the operation may continue.", "Cả hai stack đều có phần tử, nên thao tác có thể tiếp tục.") },
      { active: [4], facts: [fact("left item", "phần tử bên trái", 7), fact("left stack", "stack bên trái", "[3]")], explanation: bi("Pop 7 from the top of the left stack.", "Pop 7 khỏi đỉnh stack bên trái.") },
      { active: [5], facts: [fact("right item", "phần tử bên phải", 9), fact("right stack", "stack bên phải", "[4]")], explanation: bi("Pop 9 from the top of the right stack.", "Pop 9 khỏi đỉnh stack bên phải.") },
      { active: [6], facts: [fact("returned pair", "cặp trả về", "[7, 9]"), fact("left stack", "stack bên trái", "[3]"), fact("right stack", "stack bên phải", "[4]")], explanation: bi("Return the two popped items in the order requested.", "Trả hai phần tử đã pop theo thứ tự đề yêu cầu.") },
    ],
  },
  {
    patternId: "STACK_REDUCE",
    title: bi("Use the correct operand order", "Dùng đúng thứ tự toán hạng"),
    caption: bi("Example: stack [12, 5] represents 12 - 5", "Ví dụ: stack [12, 5] biểu diễn 12 - 5"),
    rule: bi("For subtraction or division, the first pop is the right operand and the second pop is the left operand.", "Với phép trừ hoặc chia, lần pop đầu là toán hạng phải và lần pop thứ hai là toán hạng trái."),
    code: [
      "def subtract_top_two(stack):",
      "    if stack.top < 1:",
      "        return None",
      "    right = stack.pop()",
      "    left = stack.pop()",
      "    return left - right",
    ],
    steps: [
      { active: [2, 3], facts: [fact("top", "top", 1), fact("items available", "số phần tử có sẵn", 2)], explanation: bi("Two operands are available, so subtraction is valid.", "Có đủ hai toán hạng, nên phép trừ hợp lệ.") },
      { active: [4], facts: [fact("first pop", "lần pop đầu", 5), fact("role", "vai trò", "right operand", "toán hạng phải")], explanation: bi("The top item is popped first and saved as the right operand.", "Phần tử trên đỉnh được pop trước và lưu làm toán hạng phải.") },
      { active: [5], facts: [fact("second pop", "lần pop thứ hai", 12), fact("role", "vai trò", "left operand", "toán hạng trái")], explanation: bi("The next item is the left operand.", "Phần tử tiếp theo là toán hạng trái.") },
      { active: [6], facts: [fact("calculation", "phép tính", "12 - 5"), fact("returned", "giá trị trả về", 7)], explanation: bi("Evaluate left minus right. Reversing the pops would give the wrong answer.", "Tính toán hạng trái trừ toán hạng phải. Đảo thứ tự sẽ cho đáp án sai.") },
    ],
  },
] as const;

function local(value: LocalizedText | number, locale: LearningLocale) {
  return typeof value === "number" ? value : value[locale];
}

function friendlyPatternLabel(patternId: string, locale: LearningLocale) {
  const text = patternId.toLocaleLowerCase(locale === "vi" ? "vi-VN" : "en-US").replaceAll("_", " ");
  return text.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase(locale === "vi" ? "vi-VN" : "en-US"));
}

function ExamPatternSupplement({ patterns, locale, catalog, surfaceId }: Readonly<{
  patterns: readonly PatternMetadata[];
  locale: LearningLocale;
  catalog: readonly ExamPattern[];
  surfaceId: string;
}>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const labelId = useId();
  const available = useMemo(() => patterns.map((pattern) => catalog.find((item) => item.patternId === pattern.pattern_id)).filter((item): item is ExamPattern => Boolean(item)), [catalog, patterns]);
  const selected = available[Math.min(selectedIndex, available.length - 1)];
  const t = copy[locale];

  useEffect(() => { setSelectedIndex(0); setStepIndex(0); }, [patterns]);
  useEffect(() => setStepIndex(0), [selectedIndex]);
  if (!selected) return null;
  const step = selected.steps[Math.min(stepIndex, selected.steps.length - 1)];

  return <section className={styles.examSupplement} data-exam-code-supplement={surfaceId} aria-labelledby={labelId}>
    <header className={styles.intro}><h3 id={labelId}>{t.title}</h3><p>{t.help}</p></header>
    <Select id={`${labelId}-pattern`} label={t.choose} value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.currentTarget.value))}>
      {available.map((item, index) => <option key={item.patternId} value={index}>{item.title[locale]}</option>)}
    </Select>
    <div className={styles.examGrid}>
      <div data-exam-code-panel>
        <CodePanel title={t.code} caption={selected.caption[locale]} label={`${t.code}: ${selected.title[locale]}`} lines={selected.code.map((text, index) => ({ number: index + 1, text, active: step.active.includes(index + 1) }))} />
        <p className={styles.adaptNote}>{t.adapt}</p>
      </div>
      <article className={styles.traceCard} data-exam-trace-step={stepIndex + 1}>
        <header><span>{t.step} {stepIndex + 1} {t.of} {selected.steps.length}</span><h4>{t.trace}</h4></header>
        <StateVisual title={selected.title[locale]} facts={step.facts.map((item) => ({ label: item.label[locale], value: local(item.value, locale), changed: true }))} />
        <p>{step.explanation[locale]}</p>
      </article>
    </div>
    <aside className={styles.rule}><strong>{t.rule}</strong><p>{selected.rule[locale]}</p></aside>
    <nav className={styles.controls} aria-label={`${t.trace}: ${selected.title[locale]}`}>
      <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>← {t.previous}</Button>
      <Button variant="secondary" disabled={stepIndex === selected.steps.length - 1} onClick={() => setStepIndex((value) => Math.min(selected.steps.length - 1, value + 1))}>{t.next} →</Button>
    </nav>
  </section>;
}

export function PatternRuntimeSupplement({ patterns, pythonArtifact, locale }: Readonly<{
  patterns: readonly PatternMetadata[];
  pythonArtifact: PythonArtifactDto;
  locale: LearningLocale;
}>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const labelId = useId();
  useEffect(() => setSelectedIndex(0), [patterns]);
  if (patterns.length === 0) return null;
  if (pythonArtifact.lesson_id.endsWith(".lesson.search-collections")) return <ExamPatternSupplement patterns={patterns} locale={locale} catalog={searchCollectionPatterns} surfaceId="search-collections" />;
  if (pythonArtifact.lesson_id.endsWith(".lesson.stack")) return <ExamPatternSupplement patterns={patterns} locale={locale} catalog={stackPatterns} surfaceId="stack" />;
  const selected = patterns[Math.min(selectedIndex, patterns.length - 1)];
  const t = copy[locale];
  return <section aria-labelledby={labelId}>
    <header><h3 id={labelId}>{t.title}</h3><p>{t.help}</p></header>
    {patterns.length > 1 && <label><span>{t.choose}</span><select value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.currentTarget.value))}>{patterns.map((pattern, index) => <option key={pattern.pattern_id} value={index}>{friendlyPatternLabel(pattern.pattern_id, locale)}</option>)}</select></label>}
    <Paper4VisualRuntime key={selected.pattern_id} patterns={[selected]} pythonArtifact={pythonArtifact} initialPatternId={selected.pattern_id} initialLocale={locale} locale={locale} headingLevel={3} audience="learner" />
  </section>;
}

"use client";

import { useId, useMemo, useState } from "react";

import { Button, Card, Disclosure, Textarea } from "@/app/components/algocore-ui";
import type { PythonArtifactDto } from "@/app/components/paper4-visual/types";
import type { AssessmentItem, LearningLocale, PythonExpectedOutput, PythonFixture } from "./types";
import { codeExerciseFor, isCanonicalCodingTask } from "./paper4CodeExercises";
import { PythonFixtureRunner } from "./PythonFixtureRunner";
import styles from "./CanonicalAssessmentPractice.module.css";

const copy = {
  en: {
    eyebrow: "Exam-practice progression",
    title: "Apply the method to a complete task",
    intro: "Complete one task at a time. Feedback stays hidden until you write a substantial attempt and check it against every criterion.",
    item: "Task",
    of: "of",
    levels: { guided: "Guided", faded: "Reduced support", independent: "Independent" },
    authority: "AlgoCore-authored practice · no official Cambridge marks",
    executed: "Completion is decided by the declared fixture tests below.",
    selfCheckOnly: "Self-check only · this response is not executed by the website yet.",
    expected: "What to produce",
    requirements: "Syllabus coverage",
    requirementsNote: "This task is linked to the lesson's verified syllabus requirements. It is AlgoCore-authored practice, not a past-paper question.",
    hint: "Need a starting hint?",
    response: "Your answer, code or trace",
    placeholder: "Write enough detail to show the method, result and checks you performed…",
    draftShort: "Add a meaningful attempt before self-checking (at least a short explanation, trace, or code fragment).",
    selfCheck: "Check your evidence before feedback",
    selfCheckHelp: "Tick a criterion only when your draft contains the evidence it asks for.",
    evidence: "Evidence expected",
    reveal: "Record attempt and reveal feedback",
    ready: "Your draft and self-check are ready.",
    recorded: "Attempt recorded. Compare your work with the feedback and pass rule.",
    feedback: "Feedback",
    passRule: "Pass rule",
    retryRule: "If you need another attempt",
    previous: "Previous task",
    next: "Next task",
  },
  vi: {
    eyebrow: "Luyện tập theo tiến trình",
    title: "Áp dụng phương pháp vào một nhiệm vụ hoàn chỉnh",
    intro: "Làm từng nhiệm vụ. Phản hồi chỉ xuất hiện sau khi em viết bài làm có nội dung và tự đối chiếu đủ từng tiêu chí.",
    item: "Bài",
    of: "trên",
    levels: { guided: "Có hướng dẫn", faded: "Giảm hỗ trợ", independent: "Tự làm" },
    authority: "Bài luyện do AlgoCore biên soạn · không có điểm chính thức của Cambridge",
    executed: "Hoàn thành được quyết định bằng các fixture test công bố bên dưới.",
    selfCheckOnly: "Chỉ tự kiểm · website chưa thực thi câu trả lời này.",
    expected: "Sản phẩm cần tạo",
    requirements: "Phạm vi syllabus",
    requirementsNote: "Bài này đã được liên kết với các yêu cầu syllabus đã kiểm chứng của bài học. Đây là bài luyện do AlgoCore biên soạn, không phải câu hỏi trong đề thi cũ.",
    hint: "Cần gợi ý để bắt đầu?",
    response: "Câu trả lời, code hoặc trace của em",
    placeholder: "Viết đủ để thể hiện phương pháp, kết quả và các bước kiểm tra em đã thực hiện…",
    draftShort: "Hãy viết một bài làm có ý nghĩa trước khi tự kiểm (ít nhất một giải thích ngắn, trace hoặc đoạn code).",
    selfCheck: "Đối chiếu bằng chứng trước khi xem phản hồi",
    selfCheckHelp: "Chỉ đánh dấu khi bài làm của em thực sự có bằng chứng mà tiêu chí yêu cầu.",
    evidence: "Bằng chứng cần có",
    reveal: "Ghi nhận bài làm và xem phản hồi",
    ready: "Bài làm và phần tự kiểm đã sẵn sàng.",
    recorded: "Đã ghi nhận bài làm. Hãy so sánh với phản hồi và quy tắc đạt.",
    feedback: "Phản hồi",
    passRule: "Quy tắc đạt",
    retryRule: "Nếu cần làm lại",
    previous: "Bài trước",
    next: "Bài tiếp theo",
  },
} as const;

const levelOrder = new Map([["guided", 0], ["faded", 1], ["independent", 2]]);

const criterionCopy = {
  en: {
    requirement: ["I answered every part of this task and made the method clear.", "The answer or code covers each operation requested in the prompt."],
    execution: ["I checked the result using the cases requested in the task.", "The draft records what was tested and the result that was produced."],
    trace: ["My trace shows the starting state, meaningful changes and final state.", "The draft includes enough state changes to locate the first mistake."],
    transfer: ["I completed the changed cases without relying on a pre-revealed answer.", "The draft includes the normal, boundary and failure behaviour requested."],
    other: ["My draft contains evidence for this criterion.", "The evidence is visible in the answer, code or trace above."],
    pass: "Self-pass only when every checked criterion is supported by evidence in your draft. This is an AlgoCore self-check, not Cambridge marking.",
    retry: "Find the first unsupported or incorrect step, repair it, then test the affected case and one earlier case again.",
  },
  vi: {
    requirement: ["Em đã trả lời đủ mọi phần của nhiệm vụ và nêu rõ phương pháp.", "Câu trả lời hoặc code bao quát từng thao tác được yêu cầu trong đề bài."],
    execution: ["Em đã kiểm tra kết quả bằng các trường hợp mà nhiệm vụ yêu cầu.", "Bài làm ghi rõ trường hợp đã kiểm tra và kết quả thu được."],
    trace: ["Trace của em có trạng thái đầu, các thay đổi quan trọng và trạng thái cuối.", "Bài làm có đủ chuyển trạng thái để tìm được bước sai đầu tiên."],
    transfer: ["Em hoàn thành các trường hợp thay đổi mà không dựa vào đáp án mở sẵn.", "Bài làm có hành vi normal, boundary và failure được nhiệm vụ yêu cầu."],
    other: ["Bài làm của em có bằng chứng cho tiêu chí này.", "Bằng chứng xuất hiện rõ trong câu trả lời, code hoặc trace phía trên."],
    pass: "Chỉ tự đánh giá đạt khi mọi tiêu chí đã chọn đều có bằng chứng trong bài làm. Đây là tự kiểm của AlgoCore, không phải chấm điểm Cambridge.",
    retry: "Tìm bước đầu tiên chưa có bằng chứng hoặc bị sai, sửa bước đó rồi kiểm tra lại trường hợp liên quan và một trường hợp trước đó.",
  },
} as const;

function criterionPresentation(criterionId: string, locale: LearningLocale) {
  const suffix = criterionId.split(".").at(-1);
  const key = suffix === "requirement" || suffix === "execution" || suffix === "trace" || suffix === "transfer" ? suffix : "other";
  return criterionCopy[locale][key];
}

function hasMeaningfulDraft(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 40) return false;
  const tokens = trimmed.toLocaleLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? [];
  return tokens.length >= 6 && new Set(tokens).size >= 4;
}

function AssessmentCard({ item, locale, position, total, lessonSlug, pythonArtifact, fixtures, expectedOutputs }: Readonly<{
  item: AssessmentItem;
  locale: LearningLocale;
  position: number;
  total: number;
  lessonSlug: string;
  pythonArtifact: PythonArtifactDto;
  fixtures: readonly PythonFixture[];
  expectedOutputs: readonly PythonExpectedOutput[];
}>) {
  const t = copy[locale];
  const responseId = useId();
  const statusId = useId();
  const [draft, setDraft] = useState("");
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [executionPassed, setExecutionPassed] = useState(false);
  const exercise = codeExerciseFor(item, lessonSlug);
  const codingTask = isCanonicalCodingTask(item);
  const draftReady = hasMeaningfulDraft(draft);
  const criteriaReady = item.self_rubric.criteria.length > 0 && item.self_rubric.criteria.every((criterion) => checked.has(criterion.criterion_id));
  const canReveal = draftReady && criteriaReady;
  const requirementData = JSON.stringify(item.assessment_requirement_ids);

  const toggleCriterion = (criterionId: string, value: boolean) => {
    setChecked((current) => {
      const next = new Set(current);
      if (value) next.add(criterionId); else next.delete(criterionId);
      return next;
    });
    setRevealed(false);
  };

  return <div
    data-assessment-item-id={item.assessment_item_id}
    data-assessment-level={item.level}
    data-assessment-requirement-ids={requirementData}
    data-authority="AlgoCore_authored_practice"
    data-official-marks="none"
    data-assessment-mode={exercise ? "fixture-executed" : "self-check"}
    data-assessment-complete={exercise ? executionPassed ? "true" : "false" : revealed ? "self-reported" : "false"}
  ><Card variant="question">
    <header className={styles.cardHeader}>
      <div>
        <span className={styles.position}>{t.item} {position} {t.of} {total}</span>
        <span className={styles.level}>{t.levels[item.level as keyof typeof t.levels] ?? item.level}</span>
      </div>
      <p className={styles.authority}>{t.authority}</p>
      <p className={styles.mode}>{exercise ? t.executed : codingTask ? t.selfCheckOnly : t.selfCheckOnly}</p>
    </header>

    <p className={styles.prompt}>{item.prompt[locale]}</p>
    <section className={styles.expected} aria-label={t.expected}>
      <strong>{t.expected}</strong>
      <p>{item.expected_artifact[locale]}</p>
    </section>

    <Disclosure summary={t.requirements}>
      <p>{t.requirementsNote}</p>
    </Disclosure>
    <Disclosure summary={t.hint}>
      <p>{item.hint[locale]}</p>
    </Disclosure>

    {exercise ? <PythonFixtureRunner
      contract={exercise}
      artifact={pythonArtifact}
      fixtures={fixtures}
      expectedOutputs={expectedOutputs}
      locale={locale}
      onPassChange={setExecutionPassed}
    /> : <><Textarea
      id={responseId}
      label={t.response}
      description={!draftReady && draft.length > 0 ? t.draftShort : undefined}
      rows={8}
      value={draft}
      placeholder={t.placeholder}
      onChange={(event) => { setDraft(event.currentTarget.value); setRevealed(false); }}
    />

    <fieldset className={styles.criteria}>
      <legend>{t.selfCheck}</legend>
      <p>{t.selfCheckHelp}</p>
      {item.self_rubric.criteria.map((criterion) => {
        const criterionId = `${responseId}-${criterion.criterion_id}`;
        const [description, evidence] = criterionPresentation(criterion.criterion_id, locale);
        return <label key={criterion.criterion_id} htmlFor={criterionId}>
          <input
            id={criterionId}
            type="checkbox"
            checked={checked.has(criterion.criterion_id)}
            onChange={(event) => toggleCriterion(criterion.criterion_id, event.currentTarget.checked)}
          />
          <span><strong>{description}</strong><small>{t.evidence}: {evidence}</small></span>
        </label>;
      })}
    </fieldset>

    <div className={styles.revealRow}><Button disabled={!canReveal} onClick={() => setRevealed(true)}>{t.reveal}</Button></div>
    <p id={statusId} className={styles.status} role="status" aria-live="polite">{revealed ? t.recorded : canReveal ? t.ready : ""}</p>

    {revealed && <section className={styles.feedback} data-assessment-feedback-revealed="true" aria-label={t.feedback}>
      <h4>{t.feedback}</h4>
      <p>{item.feedback[locale]}</p>
      <h4>{t.passRule}</h4>
      <p>{criterionCopy[locale].pass}</p>
      <h4>{t.retryRule}</h4>
      <p>{criterionCopy[locale].retry}</p>
    </section>}</>}
    {exercise && executionPassed && <section className={styles.feedback} data-assessment-feedback-revealed="true" aria-label={t.feedback}>
      <h4>{t.feedback}</h4>
      <p>{item.feedback[locale]}</p>
    </section>}
  </Card></div>;
}

export function CanonicalAssessmentPractice({ items, locale, lessonSlug, pythonArtifact, fixtures, expectedOutputs }: Readonly<{
  items: readonly AssessmentItem[];
  locale: LearningLocale;
  lessonSlug: string;
  pythonArtifact: PythonArtifactDto;
  fixtures: readonly PythonFixture[];
  expectedOutputs: readonly PythonExpectedOutput[];
}>) {
  const t = copy[locale];
  const ordered = useMemo(() => [...items].sort((left, right) => (levelOrder.get(left.level) ?? 9) - (levelOrder.get(right.level) ?? 9)), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  if (ordered.length === 0) return null;

  return <section className={styles.surface} data-canonical-assessment-practice data-assessment-item-count={ordered.length} aria-labelledby="canonical-assessment-title">
    <header className={styles.intro}>
      <span>{t.eyebrow}</span>
      <h3 id="canonical-assessment-title">{t.title}</h3>
      <p>{t.intro}</p>
    </header>

    <div className={styles.items}>
      {ordered.map((item, index) => <div key={item.assessment_item_id} hidden={index !== activeIndex} aria-hidden={index !== activeIndex ? "true" : undefined}>
        <AssessmentCard item={item} locale={locale} position={index + 1} total={ordered.length} lessonSlug={lessonSlug} pythonArtifact={pythonArtifact} fixtures={fixtures} expectedOutputs={expectedOutputs} />
      </div>)}
    </div>

    {ordered.length > 1 && <nav className={styles.navigation} aria-label={locale === "vi" ? "Chuyển bài luyện" : "Practice task navigation"}>
      <Button variant="secondary" disabled={activeIndex === 0} onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}>← {t.previous}</Button>
      <span aria-live="polite">{activeIndex + 1} / {ordered.length}</span>
      <Button variant="secondary" disabled={activeIndex === ordered.length - 1} onClick={() => setActiveIndex((value) => Math.min(ordered.length - 1, value + 1))}>{t.next} →</Button>
    </nav>}
  </section>;
}

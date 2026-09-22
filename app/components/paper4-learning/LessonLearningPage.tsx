import Link from "next/link";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

import { Paper4VisualRuntime, type RuntimeRegistry } from "@/app/components/paper4-visual";
import { LocaleBoundary, LocaleLink } from "./LocaleBoundary";
import { SourceReferences } from "./SourceReferences";
import type {
  LearningBlock,
  LearningContent,
  LearningLesson,
  LearningLocale,
} from "./types";
import styles from "./LessonLearningPage.module.css";

const sectionLabels = {
  recognition: { vi: "Nhận diện dạng bài", en: "Recognise the question type" },
  "exam-cues": { vi: "Tín hiệu trong đề", en: "Signals in the prompt" },
  knowledge: { vi: "Kiến thức cần dùng", en: "Knowledge to activate" },
  method: { vi: "Phương pháp giải", en: "Solution method" },
  "worked-example": { vi: "Ví dụ có hướng dẫn", en: "Worked example" },
  "action-view": { vi: "Action View", en: "Action View" },
  "marking-pitfalls": { vi: "Tránh mất điểm", en: "Protect your marks" },
  practice: { vi: "Luyện tập", en: "Practice" },
  retrieval: { vi: "Gợi nhớ", en: "Retrieval" },
  "next-and-sources": { vi: "Học gì tiếp theo", en: "What to learn next" },
} as const;

const pageCopy = {
  vi: {
    skip: "Bỏ qua đến nội dung bài học",
    course: "Cambridge 9618 · Paper 4 · Python · 2026",
    language: "Ngôn ngữ bài học",
    visualFallbackTitle: "Bài này dùng sơ đồ hỗ trợ tĩnh",
    visualFallback: "Không có event trace động thuộc phạm vi bài này. Hãy dùng nội dung và câu hỏi dự đoán ở trên để tự mô phỏng từng bước; Visual Lab không chạy Python tùy ý.",
    visualLab: "Mở Visual Lab đầy đủ",
    previous: "Bài trước",
    next: "Bài tiếp theo",
  },
  en: {
    skip: "Skip to lesson content",
    course: "Cambridge 9618 · Paper 4 · Python · 2026",
    language: "Lesson language",
    visualFallbackTitle: "This lesson uses static academic support",
    visualFallback: "There is no dynamic event trace in this lesson's scope. Use the explanation and prediction prompt above to simulate each step; the Visual Lab does not execute arbitrary Python.",
    visualLab: "Open the full Visual Lab",
    previous: "Previous lesson",
    next: "Next lesson",
  },
} as const;

function titleFor(block: LearningBlock, locale: LearningLocale) {
  return sectionLabels[block.kind]?.[locale] ?? block.kind;
}

const contentKeyLabels: Readonly<Record<string, Readonly<Record<LearningLocale, string>>>> = {
  summary: { vi: "Tóm tắt", en: "Summary" },
  workedExample: { vi: "Ví dụ hoàn chỉnh", en: "Complete worked example" },
  requirement: { vi: "Yêu cầu", en: "Requirement" },
  design: { vi: "Thiết kế", en: "Design" },
  python: { vi: "Mã Python", en: "Python code" },
  code: { vi: "Mã lệnh", en: "Code" },
  codeType: { vi: "Loại mã", en: "Code type" },
  pseudocode: { vi: "Mã giả", en: "Pseudocode" },
  trace: { vi: "Bảng vết", en: "Trace" },
  staticTable: { vi: "Bảng khái niệm tĩnh", en: "Static conceptual table" },
  columns: { vi: "Cột", en: "Columns" },
  rows: { vi: "Hàng", en: "Rows" },
  step: { vi: "Bước", en: "Step" },
  state: { vi: "Trạng thái", en: "State" },
  expectedOutput: { vi: "Kết quả mong đợi", en: "Expected output" },
  tests: { vi: "Ca kiểm thử", en: "Tests" },
  case: { vi: "Loại ca", en: "Case" },
  id: { vi: "Mã mục", en: "Item ID" },
  input: { vi: "Dữ liệu vào", en: "Input" },
  expected: { vi: "Kết quả cần có", en: "Expected" },
  evidence: { vi: "Bằng chứng", en: "Evidence" },
  practiceItems: { vi: "Bài luyện tập", en: "Practice items" },
  practiceFlow: { vi: "Lộ trình luyện tập", en: "Practice flow" },
  guided: { vi: "Có hướng dẫn", en: "Guided" },
  faded: { vi: "Giảm gợi ý", en: "Faded" },
  independent: { vi: "Độc lập", en: "Independent" },
  level: { vi: "Mức luyện", en: "Level" },
  kind: { vi: "Loại", en: "Kind" },
  fixture: { vi: "Dữ kiện", en: "Fixture" },
  expectedArtifact: { vi: "Sản phẩm cần nộp", en: "Expected artifact" },
  hint: { vi: "Gợi ý", en: "Hint" },
  revealRule: { vi: "Điều kiện mở đáp án", en: "Reveal rule" },
  revealCondition: { vi: "Điều kiện mở đáp án", en: "Reveal condition" },
  feedback: { vi: "Phản hồi và cách sửa", en: "Feedback and repair" },
  misconception: { vi: "Ngộ nhận cần sửa", en: "Misconception" },
  rubric: { vi: "Tiêu chí tự chấm AlgoCore", en: "AlgoCore self-assessment rubric" },
  selfRubric: { vi: "Rubric tự chấm", en: "Self-assessment rubric" },
  criteria: { vi: "Tiêu chí", en: "Criteria" },
  passRule: { vi: "Điều kiện đạt", en: "Pass rule" },
  retrievalItem: { vi: "Nhiệm vụ gợi nhớ", en: "Retrieval task" },
  prompt: { vi: "Đề bài", en: "Prompt" },
  hiddenAnswer: { vi: "Đáp án ẩn", en: "Hidden answer" },
  reveal: { vi: "Cách mở đáp án", en: "Reveal" },
  diagnosis: { vi: "Chẩn đoán", en: "Diagnosis" },
  repair: { vi: "Cách sửa", en: "Repair" },
  markingChain: { vi: "Chuỗi bảo vệ điểm", en: "Mark-protection chain" },
  markingChains: { vi: "Các chuỗi bảo vệ điểm", en: "Mark-protection chains" },
  markingMap: { vi: "Bản đồ yêu cầu và tiêu chí", en: "Requirement and rubric map" },
  patternId: { vi: "Mã dạng bài", en: "Pattern ID" },
  requirementRef: { vi: "Nguồn yêu cầu", en: "Requirement source" },
  markOrRubricRef: { vi: "Nguồn mark scheme hoặc rubric", en: "Mark-scheme or rubric source" },
  methodStepRef: { vi: "Bước phương pháp", en: "Method step" },
  methodRef: { vi: "Nguồn phương pháp", en: "Method source" },
  rubricRef: { vi: "Nguồn rubric", en: "Rubric source" },
  errorDetection: { vi: "Cách phát hiện lỗi", en: "Error detection" },
  repairCheck: { vi: "Kiểm tra sau khi sửa", en: "Repair check" },
  noInventedOfficialMarks: { vi: "Không tự gán điểm chính thức", en: "No invented official marks" },
  authority: { vi: "Thẩm quyền", en: "Authority" },
  refId: { vi: "Mã nguồn", en: "Source ID" },
  methodStep: { vi: "Bước thực hiện", en: "Method step" },
  error: { vi: "Lỗi thường gặp", en: "Likely error" },
  detection: { vi: "Cách kiểm tra", en: "Detection" },
  mode: { vi: "Chế độ", en: "Mode" },
};

function humaniseKey(key: string, locale: LearningLocale) {
  return contentKeyLabels[key]?.[locale] ?? key.replaceAll("_", " ").replaceAll("-", " ");
}

const revealableContentKeys = new Set(["hint", "hiddenAnswer", "feedback"]);

const codeContentKeys = new Set(["python", "code", "pseudocode"]);

function codeText(value: LearningContent): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((line) => typeof line === "string")) {
    return value.join("\n");
  }
  return null;
}

function ContentValue({
  value,
  locale,
  contentKey,
}: {
  readonly value: LearningContent;
  readonly locale: LearningLocale;
  readonly contentKey?: string;
}) {
  if (contentKey && codeContentKeys.has(contentKey)) {
    const source = codeText(value);
    if (source !== null) {
      const language = contentKey === "pseudocode" ? "pseudocode" : "python";
      return (
        <figure className={styles.codeFigure} data-language={language}>
          <figcaption>{humaniseKey(contentKey, locale)}</figcaption>
          <pre aria-label={humaniseKey(contentKey, locale)} tabIndex={0}>
            <code className={`language-${language}`}>{source}</code>
          </pre>
        </figure>
      );
    }
  }

  if (typeof value === "string") {
    const paragraphs = value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
    return <>{paragraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 28)}-${index}`}>{paragraph}</p>)}</>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    const display = typeof value === "boolean"
      ? (value ? (locale === "vi" ? "Có" : "Yes") : (locale === "vi" ? "Không" : "No"))
      : String(value);
    return <p>{display}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => (
          <li key={index}><ContentValue value={item} locale={locale} /></li>
        ))}
      </ul>
    );
  }

  return (
    <dl>
      {Object.entries(value).map(([key, item]) => (
        <div key={key}>
          <dt>{humaniseKey(key, locale)}</dt>
          <dd>
            {revealableContentKeys.has(key) ? (
              <details className={styles.revealable}>
                <summary>{locale === "vi" ? "Mở sau khi tự trả lời" : "Reveal after attempting"}</summary>
                <ContentValue value={item} locale={locale} contentKey={key} />
              </details>
            ) : <ContentValue value={item} locale={locale} contentKey={key} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function lessonHref(lesson: LearningLesson, locale: LearningLocale, anchor?: string) {
  return `/paper-4/lessons/${lesson.slug}?lang=${locale}${anchor ? `#${anchor}` : ""}`;
}

function scopeRuntimeRegistry(
  runtimeRegistry: RuntimeRegistry,
  lesson: LearningLesson,
): RuntimeRegistry {
  const requestedIds = new Set(lesson.actionView?.patternIds ?? lesson.patternIds);
  const patterns = runtimeRegistry.patterns.filter((pattern) => requestedIds.has(pattern.pattern_id));
  return {
    ...runtimeRegistry,
    counts: {
      patterns: patterns.length,
      scenarios: patterns.reduce((total, pattern) => total + pattern.scenarios.length, 0),
      unique_events: new Set(patterns.flatMap((pattern) => pattern.events.map((event) => event.event_id))).size,
    },
    patterns,
  };
}

function LessonNavLink({
  direction,
  lesson,
  locale,
}: {
  readonly direction: "previous" | "next";
  readonly lesson: LearningLesson | undefined;
  readonly locale: LearningLocale;
}) {
  if (!lesson) return <span />;
  const copy = pageCopy[locale];
  return (
    <Link href={lessonHref(lesson, locale)} rel={direction === "previous" ? "prev" : "next"}>
      {direction === "previous" ? "←" : null} {direction === "previous" ? copy.previous : copy.next}: {lesson.titles[locale]} {direction === "next" ? "→" : null}
    </Link>
  );
}

export function LessonLearningPage({
  lesson,
  lessons,
  locale,
  runtimeRegistry,
}: {
  readonly lesson: LearningLesson;
  readonly lessons: readonly LearningLesson[];
  readonly locale: LearningLocale;
  readonly runtimeRegistry: RuntimeRegistry;
}) {
  const copy = pageCopy[locale];
  const toc = lesson.blocks.map((block) => ({
    title: titleFor(block, locale),
    url: `#${block.anchor}`,
    depth: 2,
  }));
  const scopedRegistry = scopeRuntimeRegistry(runtimeRegistry, lesson);
  const byId = new Map(lessons.map((item) => [item.lessonId, item]));
  const lessonIndex = lessons.findIndex((item) => item.lessonId === lesson.lessonId);
  const previousLesson = lesson.prerequisiteLessonIds.map((id) => byId.get(id)).find(Boolean)
    ?? (lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined);
  const nextLesson = lesson.nextLessonIds.map((id) => byId.get(id)).find(Boolean)
    ?? (lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined);

  return (
    <LocaleBoundary locale={locale}>
    <DocsPage
      toc={toc}
      tableOfContent={{ style: "normal", single: false }}
      footer={{ enabled: false }}
      className={styles.page}
    >
      <a className={styles.skipLink} href={`#${lesson.blocks[0]?.anchor ?? "lesson-content"}`}>{copy.skip}</a>
      <header lang={locale}>
        <div className={styles.eyebrow}>
          <strong>LEARNING PAGE · 2026</strong>
          <span>{copy.course}</span>
        </div>
        <DocsTitle>{lesson.titles[locale]}</DocsTitle>
        <DocsDescription>{lesson.descriptions[locale]}</DocsDescription>
        <div className={styles.meta}>
          <span>{lesson.packageId} · {lesson.version} · {lesson.patternIds.length} patterns</span>
          <nav className={styles.localeNav} aria-label={copy.language}>
            <LocaleLink slug={lesson.slug} locale="vi" currentLocale={locale} />
            <LocaleLink slug={lesson.slug} locale="en" currentLocale={locale} />
          </nav>
        </div>
      </header>

      <DocsBody id="lesson-content" lang={locale}>
        {lesson.blocks.map((block, index) => {
          const isActionView = block.kind === "action-view";
          return (
            <section
              key={block.blockId}
              id={block.anchor}
              className={styles.section}
              aria-labelledby={`${block.anchor}-title`}
              data-block-id={block.blockId}
              data-block-kind={block.kind}
            >
              <header className={styles.sectionHeader}>
                <span className={styles.sectionNumber} aria-hidden="true">{index + 1}</span>
                <h2 id={`${block.anchor}-title`}>{titleFor(block, locale)}</h2>
                <p>{block.blockId}</p>
              </header>
              <div className={styles.content}><ContentValue value={block.content[locale]} locale={locale} /></div>

              {isActionView && (
                <div className={styles.actionFrame}>
                  {scopedRegistry.patterns.length > 0 ? (
                    <Paper4VisualRuntime
                      registry={scopedRegistry}
                      initialPatternId={scopedRegistry.patterns[0]?.pattern_id}
                      initialLocale={locale}
                      autoplayDelayMs={1800}
                      headingLevel={3}
                    />
                  ) : (
                    <aside className={styles.fallback} role="note">
                      <strong>{copy.visualFallbackTitle}</strong>
                      <p>{copy.visualFallback}</p>
                      <Link className={styles.visualLabLink} href={`/paper-4?lang=${locale}#visual-lab`}>{copy.visualLab}</Link>
                    </aside>
                  )}
                </div>
              )}

              <SourceReferences references={block.sourceRefs} locale={locale} />
            </section>
          );
        })}
      </DocsBody>

      <nav className={styles.lessonNav} aria-label={locale === "vi" ? "Điều hướng bài học" : "Lesson navigation"}>
        <LessonNavLink direction="previous" lesson={previousLesson} locale={locale} />
        <LessonNavLink direction="next" lesson={nextLesson} locale={locale} />
      </nav>
    </DocsPage>
    </LocaleBoundary>
  );
}

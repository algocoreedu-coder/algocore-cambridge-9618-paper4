import type { KnowledgeUnit, LearningLocale, LearningSourceReference } from "./types";
import styles from "./SourceDisclosure.module.css";

type SourceDisclosureProps = Readonly<{
  knowledgeUnits: readonly KnowledgeUnit[];
  lessonSources: readonly LearningSourceReference[];
  locale: LearningLocale;
}>;

type FriendlySource = Readonly<{
  key: string;
  heading?: string;
  page?: string;
}>;

const copy = {
  en: {
    title: "Sources and exam scope",
    summary: (coursebookCount: number, objectiveCount: number) =>
      `${coursebookCount} coursebook ${coursebookCount === 1 ? "section" : "sections"} · ${objectiveCount} syllabus ${objectiveCount === 1 ? "objective" : "objectives"}`,
    intro: "The 2026 syllabus defines exam scope. The coursebook supports learning and examples.",
    coursebookHeading: "Coursebook support",
    coursebookSource: "Watson & Williams, Cambridge International AS & A Level Computer Science (2019)",
    syllabusHeading: "Syllabus scope",
    syllabusSource: "Cambridge International AS & A Level Computer Science 9618 syllabus (2026)",
    headingLabel: "Heading",
    pageLabel: "Printed page",
    pagesLabel: "Printed pages",
    pdfPageLabel: "PDF page",
    pdfPagesLabel: "PDF pages",
  },
  vi: {
    title: "Nguồn học và phạm vi thi",
    summary: (coursebookCount: number, objectiveCount: number) =>
      `${coursebookCount} phần trong coursebook · ${objectiveCount} mục tiêu syllabus`,
    intro: "Syllabus 2026 xác định phạm vi thi. Coursebook hỗ trợ kiến thức và ví dụ học tập.",
    coursebookHeading: "Kiến thức từ coursebook",
    coursebookSource: "Watson & Williams, Cambridge International AS & A Level Computer Science (2019)",
    syllabusHeading: "Phạm vi syllabus",
    syllabusSource: "Cambridge International AS & A Level Computer Science 9618 syllabus (2026)",
    headingLabel: "Đề mục",
    pageLabel: "Trang in",
    pagesLabel: "Các trang in",
    pdfPageLabel: "Trang PDF",
    pdfPagesLabel: "Các trang PDF",
  },
} as const;

function compactPages(pages: readonly number[]) {
  const sorted = [...new Set(pages)].sort((left, right) => left - right);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (const page of sorted.slice(1)) {
    if (page === (end ?? page) + 1) {
      end = page;
      continue;
    }
    if (start !== undefined && end !== undefined) ranges.push(start === end ? `${start}` : `${start}–${end}`);
    start = page;
    end = page;
  }
  if (start !== undefined && end !== undefined) ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(", ");
}

function bookHeadingMap(lessonSources: readonly LearningSourceReference[]) {
  return new Map(lessonSources.flatMap((source) => {
    if (!source.authority.toLowerCase().includes("coursebook")) return [];
    const sectionKey = source.locator.anchor_text?.trim();
    if (!sectionKey) return [];
    return [[sectionKey, source.locator.heading?.trim()] as const];
  }));
}

function friendlyCoursebookSources(knowledgeUnits: readonly KnowledgeUnit[], lessonSources: readonly LearningSourceReference[]) {
  const headingBySection = bookHeadingMap(lessonSources);
  const sources = new Map<string, FriendlySource>();
  for (const unit of knowledgeUnits) {
    for (const reference of unit.book_refs) {
      const printedPages = compactPages(reference.printed_pages);
      const pdfPages = compactPages(reference.pdf_pages);
      sources.set(reference.section_id, {
        key: reference.section_id,
        heading: headingBySection.get(reference.section_id),
        page: printedPages || pdfPages || undefined,
      });
    }
  }
  return [...sources.values()];
}

function friendlySyllabusSources(knowledgeUnits: readonly KnowledgeUnit[]) {
  const sources = new Map<string, FriendlySource>();
  for (const unit of knowledgeUnits) {
    for (const reference of unit.objective_refs) {
      const heading = [reference.locator.heading, reference.locator.bullet_locator]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" — ");
      const page = reference.locator.printed_page ?? reference.locator.pdf_page;
      sources.set(reference.objective_id, {
        key: reference.objective_id,
        heading: heading || undefined,
        page: page === undefined ? undefined : String(page),
      });
    }
  }
  return [...sources.values()];
}

function SourceList({
  items,
  source,
  heading,
  locale,
  pageKind,
}: Readonly<{
  items: readonly FriendlySource[];
  source: string;
  heading: string;
  locale: LearningLocale;
  pageKind: "printed" | "pdf";
}>) {
  const t = copy[locale];
  return <section className={styles.sourceGroup}>
    <h3>{heading}</h3>
    <ul>
      {items.map((item) => {
        const multiplePages = Boolean(item.page?.includes(",") || item.page?.includes("–"));
        const pageLabel = pageKind === "printed"
          ? (multiplePages ? t.pagesLabel : t.pageLabel)
          : (multiplePages ? t.pdfPagesLabel : t.pdfPageLabel);
        return <li key={item.key} data-learning-source>
          <strong>{source}</strong>
          <dl>
            {item.heading && <div><dt>{t.headingLabel}</dt><dd>{item.heading}</dd></div>}
            {item.page && <div><dt>{pageLabel}</dt><dd>{item.page}</dd></div>}
          </dl>
        </li>;
      })}
    </ul>
  </section>;
}

export function SourceDisclosure({ knowledgeUnits, lessonSources, locale }: SourceDisclosureProps) {
  const t = copy[locale];
  const coursebookSources = friendlyCoursebookSources(knowledgeUnits, lessonSources);
  const syllabusSources = friendlySyllabusSources(knowledgeUnits);
  if (coursebookSources.length === 0 && syllabusSources.length === 0) return null;

  return <aside className={styles.wrapper} aria-labelledby="paper4-source-disclosure-heading">
    <details className={styles.disclosure} data-source-disclosure>
      <summary>
        <span>
          <strong id="paper4-source-disclosure-heading">{t.title}</strong>
          <small>{t.summary(coursebookSources.length, syllabusSources.length)}</small>
        </span>
      </summary>
      <div className={styles.body}>
        <p>{t.intro}</p>
        <div className={styles.groups}>
          {coursebookSources.length > 0 && <SourceList items={coursebookSources} source={t.coursebookSource} heading={t.coursebookHeading} locale={locale} pageKind="printed" />}
          {syllabusSources.length > 0 && <SourceList items={syllabusSources} source={t.syllabusSource} heading={t.syllabusHeading} locale={locale} pageKind="pdf" />}
        </div>
      </div>
    </details>
  </aside>;
}

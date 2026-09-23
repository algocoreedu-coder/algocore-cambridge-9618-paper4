import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { Activity, BookOpenCheck, Languages, Workflow } from "lucide-react";
import Link from "next/link";

import type { CourseManifest, LearningLocale } from "@/app/components/paper4-learning";
import { LocaleBoundary } from "@/app/components/paper4-learning";
import { Paper4VisualRuntime } from "@/app/components/paper4-visual";
import manifestData from "@/app/data/paper4-v2/course-manifest.json";

const manifest = manifestData as unknown as CourseManifest;
const lessonBySlug = new Map(manifest.lessons.map((lesson) => [lesson.slug, lesson]));

const tocByLocale = {
  vi: [
    { title: "Cách dùng", url: "#how-to-use", depth: 2 },
    { title: "Lộ trình 26 bài", url: "#course-map", depth: 2 },
    { title: "Visual Lab", url: "#visual-lab", depth: 2 },
    { title: "Quy trình luyện", url: "#practice-loop", depth: 2 },
  ],
  en: [
    { title: "How to use", url: "#how-to-use", depth: 2 },
    { title: "26-lesson pathway", url: "#course-map", depth: 2 },
    { title: "Visual Lab", url: "#visual-lab", depth: 2 },
    { title: "Practice loop", url: "#practice-loop", depth: 2 },
  ],
} satisfies Record<LearningLocale, Array<{ title: string; url: string; depth: number }>>;

function resolveLocale(value: string | string[] | undefined): LearningLocale {
  return value === "vi" ? "vi" : "en";
}

export default async function Paper4Page({ searchParams }: { readonly searchParams: Promise<{ lang?: string | string[] }> }) {
  const locale = resolveLocale((await searchParams).lang);
  return <>
    <LocaleBoundary locale={locale} />
    <DocsPage full toc={tocByLocale[locale]} tableOfContent={{ enabled: true, style: "normal", single: false }} footer={{ enabled: false }}>
      <div className="lesson-eyebrow"><span className="unit-label">PAPER 4 · 2026</span><span>ADVANCED PRACTICAL SKILLS</span></div>
      <DocsTitle>{manifest.editorial_registry.course_title[locale]}</DocsTitle>
      <DocsDescription>{locale === "vi" ? "26 bài nối lý thuyết, Python đã chạy, trace động, tiêu chí chấm và luyện tập tăng dần." : "Twenty-six lessons connect theory, executed Python, dynamic traces, marking evidence, and progressive practice."}</DocsDescription>
      <nav className="paper4-locale-switch" aria-label={locale === "vi" ? "Ngôn ngữ khóa học" : "Course language"}>
        <Link href="/paper-4?lang=vi" data-locale-switch aria-current={locale === "vi" ? "page" : undefined}>Tiếng Việt</Link>
        <Link href="/paper-4?lang=en" data-locale-switch aria-current={locale === "en" ? "page" : undefined}>English</Link>
      </nav>
      <div className="paper4-metrics" aria-label={locale === "vi" ? "Phạm vi Paper 4" : "Paper 4 scope"}>
        <span><Workflow size={18} /><strong>{manifest.counts.patterns}</strong> {locale === "vi" ? "dạng bài" : "patterns"}</span>
        <span><BookOpenCheck size={18} /><strong>{manifest.counts.visual_scenario_traces}</strong> {locale === "vi" ? "tình huống" : "scenarios"}</span>
        <span><Activity size={18} /><strong>{manifest.counts.visual_event_bindings}</strong> events</span>
        <span><Languages size={18} /><strong>VI · EN</strong></span>
      </div>

      <DocsBody>
        <section id="course-map" className="paper4-course-map" aria-labelledby="course-map-title">
          <div className="paper4-section-heading"><span>13 PACKAGES · 26 LESSONS · 10 SECTIONS</span><h2 id="course-map-title">{locale === "vi" ? "Lộ trình ôn thi Paper 4" : "Paper 4 revision pathway"}</h2><p>{locale === "vi" ? "Học theo thứ tự hoặc mở đúng dạng bài cần ôn." : "Follow the sequence or open the exact pattern you need."}</p></div>
          <div className="paper4-package-grid">{manifest.packages.map((pkg, packageIndex) => <article className="paper4-package-card" key={pkg.package_id}><header><span>{String(packageIndex + 1).padStart(2, "0")}</span><h3>{pkg.title[locale]}</h3></header><ol>{pkg.lesson_slugs.map((slug) => { const lesson = lessonBySlug.get(slug); if (!lesson) return null; const patternCount = lesson.official_pattern_ids.length; return <li key={lesson.lesson_id}><Link href={`/paper-4/lessons/${slug}?lang=${locale}`}>{lesson.title[locale]}</Link><small>{patternCount > 0 ? `${patternCount} patterns` : locale === "vi" ? "hỗ trợ lý thuyết" : "theory support"} · 10 sections</small></li>; })}</ol></article>)}</div>
        </section>

        <section id="how-to-use" className="paper4-intro" aria-labelledby="how-to-use-title"><h2 id="how-to-use-title">{locale === "vi" ? "Cách dùng" : "How to use"}</h2><ol><li>{locale === "vi" ? "Đọc lý thuyết và nối từng quy tắc với dòng Python thật." : "Connect every theory rule to a real Python line."}</li><li>{locale === "vi" ? "Chạy normal, boundary và failure trace." : "Replay the normal, boundary, and failure traces."}</li><li>{locale === "vi" ? "Dừng trước event tiếp theo và tự dự đoán." : "Pause before the next event and predict it."}</li><li>{locale === "vi" ? "Đối chiếu tiêu chí chấm và lỗi dễ mất điểm." : "Check the marking evidence and mark-losing errors."}</li><li>{locale === "vi" ? "Hoàn thành guided, faded rồi independent practice." : "Complete guided, faded, then independent practice."}</li></ol></section>

        <section id="visual-lab" className="paper4-lab-section" aria-labelledby="visual-lab-title"><div className="paper4-section-heading"><span>LAZY CANONICAL TRACE RUNTIME</span><h2 id="visual-lab-title">Paper 4 Visual Lab</h2><p>{locale === "vi" ? "Chỉ trace đang chọn được tải; Python hiển thị là artifact đã chạy tạo trace đó." : "Only the selected trace is loaded; the displayed Python is the executed artifact that produced it."}</p></div><Paper4VisualRuntime patterns={manifest.patterns} initialPatternId={manifest.patterns[0]?.pattern_id} initialLocale={locale} autoplayDelayMs={1800} /></section>

        <section id="practice-loop" className="paper4-practice-loop" aria-labelledby="practice-loop-title"><h2 id="practice-loop-title">{locale === "vi" ? "Quy trình luyện" : "Practice loop"}</h2><div><p><b>1 · Theory</b><span>{locale === "vi" ? "Nhắc quy tắc và invariant." : "Recall the rule and invariant."}</span></p><p><b>2 · Predict</b><span>{locale === "vi" ? "Dự đoán event và state." : "Predict the event and state."}</span></p><p><b>3 · Trace</b><span>{locale === "vi" ? "Đối chiếu code, state và output." : "Compare code, state, and output."}</span></p><p><b>4 · Protect marks</b><span>{locale === "vi" ? "Sửa lỗi đầu tiên làm mất điểm." : "Repair the first mark-losing divergence."}</span></p></div></section>
      </DocsBody>
      <footer className="lesson-footer"><span>AlgoCore Education · A Level 9618</span><span>Canonical v2 · verified Python · 2026</span></footer>
    </DocsPage>
  </>;
}

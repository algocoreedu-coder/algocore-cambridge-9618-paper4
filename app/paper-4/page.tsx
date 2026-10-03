import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import Link from "next/link";

import type { CourseManifest, LearningLocale } from "@/app/components/paper4-learning";
import { LocaleBoundary } from "@/app/components/paper4-learning";
import manifestData from "@/app/data/paper4-v2/course-manifest.json";
import { getPaper4LessonReadiness, paper4Readiness } from "@/app/lib/paper4/readiness";

const manifest = manifestData as unknown as CourseManifest;
const lessonBySlug = new Map(manifest.lessons.map((lesson) => [lesson.slug, lesson]));

const tocByLocale = {
  vi: [
    { title: "Cách dùng", url: "#how-to-use", depth: 2 },
    { title: "Lộ trình bài học", url: "#course-map", depth: 2 },
    { title: "Quy trình luyện", url: "#practice-loop", depth: 2 },
  ],
  en: [
    { title: "How to use", url: "#how-to-use", depth: 2 },
    { title: "Lesson pathway", url: "#course-map", depth: 2 },
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
      <DocsDescription>{locale === "vi" ? "Học theo sáu chặng: nhận diện, hiểu mô hình, trace, luyện tập, tránh mất điểm và gợi nhớ." : "Learn through six stages: recognise, understand, trace, practise, protect marks, and recall."}</DocsDescription>
      <p data-paper-ready={paper4Readiness.paperReady ? "true" : "false"}>
        {paper4Readiness.paperReady
          ? (locale === "vi" ? "Đã hoàn tất kiểm chứng ôn thi toàn bộ Paper 4." : "Full Paper 4 exam preparation has passed verification.")
          : (locale === "vi" ? "Có thể ôn theo từng chủ đề; phần luyện toàn bộ bài thi vẫn đang được hoàn thiện." : "Topic revision is available; full-paper rehearsal is still being completed.")}
      </p>
      <p><Link className="paper4-rehearsal-entry" href={`/paper-4/rehearsals?lang=${locale}`}>{locale === "vi" ? "Mở khu luyện đề tổng hợp →" : "Open mixed rehearsal →"}</Link></p>
      <nav className="paper4-locale-switch" aria-label={locale === "vi" ? "Ngôn ngữ khóa học" : "Course language"}>
        <Link href="/paper-4?lang=vi" data-locale-switch aria-current={locale === "vi" ? "page" : undefined}>Tiếng Việt</Link>
        <Link href="/paper-4?lang=en" data-locale-switch aria-current={locale === "en" ? "page" : undefined}>English</Link>
      </nav>
      <DocsBody>
        <section id="course-map" className="paper4-course-map" aria-labelledby="course-map-title">
          <div className="paper4-section-heading"><h2 id="course-map-title">{locale === "vi" ? "Lộ trình ôn thi Paper 4" : "Paper 4 revision pathway"}</h2><p>{locale === "vi" ? "Mở bài đã được duyệt hoặc xem trạng thái chuẩn bị của bài tiếp theo." : "Open an approved lesson or check the preparation status of the next lesson."}</p></div>
          <div className="paper4-package-grid">{manifest.packages.map((pkg, packageIndex) => <article className="paper4-package-card" key={pkg.package_id}><header><span>{String(packageIndex + 1).padStart(2, "0")}</span><h3>{pkg.title[locale]}</h3></header><ol>{pkg.lesson_slugs.map((slug) => { const lesson = lessonBySlug.get(slug); if (!lesson) return null; const readiness = getPaper4LessonReadiness(slug); return <li key={lesson.lesson_id} data-topic-ready={readiness.topicReady ? "true" : "false"}><Link href={`/paper-4/lessons/${slug}?lang=${locale}`}>{lesson.title[locale]}</Link><small>{readiness.topicReady ? (locale === "vi" ? "Chủ đề đã kiểm chứng" : "Topic verified") : readiness.accessAllowed ? (locale === "vi" ? "Có thể ôn · đang kiểm chứng độc lập" : "Revision available · independent review pending") : (locale === "vi" ? "Tạm khóa để chỉnh sửa" : "Withheld for revision")}</small></li>; })}</ol></article>)}</div>
        </section>

        <section id="how-to-use" className="paper4-intro" aria-labelledby="how-to-use-title"><h2 id="how-to-use-title">{locale === "vi" ? "Cách dùng" : "How to use"}</h2><ol><li>{locale === "vi" ? "Đọc lý thuyết và nối từng quy tắc với dòng Python thật." : "Connect every theory rule to a real Python line."}</li><li>{locale === "vi" ? "Chạy normal, boundary và failure trace." : "Replay the normal, boundary, and failure traces."}</li><li>{locale === "vi" ? "Dừng trước event tiếp theo và tự dự đoán." : "Pause before the next event and predict it."}</li><li>{locale === "vi" ? "Đối chiếu tiêu chí chấm và lỗi dễ mất điểm." : "Check the marking evidence and mark-losing errors."}</li><li>{locale === "vi" ? "Hoàn thành guided, faded rồi independent practice." : "Complete guided, faded, then independent practice."}</li></ol></section>

        <section id="practice-loop" className="paper4-practice-loop" aria-labelledby="practice-loop-title"><h2 id="practice-loop-title">{locale === "vi" ? "Quy trình luyện" : "Practice loop"}</h2><div><p><b>1 · Theory</b><span>{locale === "vi" ? "Nhắc quy tắc và invariant." : "Recall the rule and invariant."}</span></p><p><b>2 · Predict</b><span>{locale === "vi" ? "Dự đoán event và state." : "Predict the event and state."}</span></p><p><b>3 · Trace</b><span>{locale === "vi" ? "Đối chiếu code, state và output." : "Compare code, state, and output."}</span></p><p><b>4 · Protect marks</b><span>{locale === "vi" ? "Sửa lỗi đầu tiên làm mất điểm." : "Repair the first mark-losing divergence."}</span></p></div></section>
      </DocsBody>
      <footer className="lesson-footer"><span>AlgoCore Education · A Level 9618</span><span>Paper 4 · Python · 2026</span></footer>
    </DocsPage>
  </>;
}

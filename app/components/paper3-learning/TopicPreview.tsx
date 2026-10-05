import Link from "next/link";
import { ArrowLeft, ArrowRight, ScanEye, MousePointer2, Lightbulb, PencilRuler, CircleDashed, Map, BookOpen } from "lucide-react";
import type { Locale, StudyMapCatalog } from "@/app/lib/paper3/catalog";
import { learningModes, paper3Href, SectionIcon } from "./shared";
import styles from "./Paper3Learning.module.css";
import { Paper3LocaleBoundary } from "./Paper3LocaleBoundary";

export function TopicPreview({ catalog, slug, locale }: { readonly catalog: StudyMapCatalog; readonly slug: string; readonly locale: Locale }) {
  const topic = catalog.topics.find((item) => item.slug === slug);
  if (!topic) return null;
  const strand = catalog.strands.find((item) => item.id === topic.strandId);
  const section = catalog.sections.find((item) => item.id === strand?.sectionId);
  if (!strand || !section) return null;
  const siblings = catalog.topics.filter((item) => item.strandId === topic.strandId);
  const index = siblings.indexOf(topic);
  const next = siblings[index + 1];
  const journey = [
    { icon: ScanEye, en: "See the idea", vi: "Nhìn thấy ý tưởng", descEn: "A visual model with clear labels and context.", descVi: "Mô hình trực quan có nhãn và ngữ cảnh rõ ràng." },
    { icon: MousePointer2, en: "Explore each step", vi: "Khám phá từng bước", descEn: "Follow changes, compare states and ask why.", descVi: "Theo dõi thay đổi, so sánh trạng thái và hiểu vì sao." },
    { icon: Lightbulb, en: "Recognise the question", vi: "Nhận diện câu hỏi", descEn: "Connect exam clues with the right method.", descVi: "Nối dấu hiệu trong đề với phương pháp phù hợp." },
    { icon: PencilRuler, en: "Try it yourself", vi: "Tự mình giải", descEn: "Use worked examples, then practise and check.", descVi: "Tham khảo lời giải, tự luyện rồi kiểm tra kết quả." },
  ];

  return <div className={styles.page} lang={locale} data-topic-id={topic.id}>
    <Paper3LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper3Href("/paper-3", locale)}><Map size={16} aria-hidden="true" />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span aria-hidden="true">/</span><Link href={paper3Href(`/paper-3/sections/${section.id}`, locale)}>{section.id} · {section.title[locale]}</Link><span aria-hidden="true">/</span><Link href={paper3Href(`/paper-3/sections/${section.id}#strand-${strand.id.replaceAll(".", "-")}`, locale)}>{strand.id}</Link></nav>
    <header className={styles.topicHero}><div className={styles.eyebrow}><SectionIcon id={section.id} size={19} />{strand.id} · {strand.title[locale]}</div><h1>{topic.title[locale]}</h1><p>{topic.summary[locale]}</p><span className={styles.modePill}><BookOpen size={16} aria-hidden="true" />{learningModes[topic.learningMode][locale]}</span></header>
    <section className={styles.preparationPanel} aria-labelledby="topic-preparation-title"><div className={styles.preparationSymbol}><CircleDashed size={34} strokeWidth={1.5} aria-hidden="true" /></div><div><span className={styles.kicker}>{locale === "vi" ? "BẠN ĐANG XEM TỔNG QUAN TOPIC" : "YOU ARE VIEWING A TOPIC OVERVIEW"}</span><h2 id="topic-preparation-title">{locale === "vi" ? "Bài học đang được biên soạn" : "Lesson in preparation"}</h2><p>{locale === "vi" ? "Phần giải thích, minh họa tương tác và bài luyện cho topic này sẽ được thêm sau. Hiện tại, bạn có thể khám phá phạm vi học và các topic liên quan trong bản đồ." : "The explanations, interactive visuals and practice for this topic will be added next. For now, explore its place in the syllabus and the other topics in the study map."}</p><Link className={styles.primaryLink} href={paper3Href(`/paper-3/sections/${section.id}#strand-${strand.id.replaceAll(".", "-")}`, locale)}><ArrowLeft size={17} aria-hidden="true" />{locale === "vi" ? "Khám phá các topic cùng mục" : "Explore this syllabus strand"}</Link></div></section>
    <section className={styles.journeyPreview} aria-labelledby="topic-journey-title"><div className={styles.blockHeading}><div><span className={styles.kicker}>{locale === "vi" ? "HÀNH TRÌNH HỌC DỰ KIẾN" : "THE PLANNED LEARNING JOURNEY"}</span><h2 id="topic-journey-title">{locale === "vi" ? "Học bằng cách nhìn, hiểu và làm" : "Learn by seeing, understanding and doing"}</h2></div></div><ol className={styles.journeySteps}>{journey.map((step, stepIndex) => <li key={step.en}><div className={styles.journeyIcon}><step.icon size={27} strokeWidth={1.6} aria-hidden="true" /><span>{stepIndex + 1}</span></div><h3>{locale === "vi" ? step.vi : step.en}</h3><p>{locale === "vi" ? step.descVi : step.descEn}</p></li>)}</ol><p className={styles.journeyNote}>{locale === "vi" ? "Đây là cấu trúc dự kiến của bài học; các hoạt động chưa mở trong phiên bản khung này." : "This is the intended lesson structure; these activities are not available in this framework version."}</p></section>
    <nav className={styles.pageNavigation} aria-label={locale === "vi" ? "Khám phá thêm" : "Explore more"}><Link href={paper3Href(`/paper-3/sections/${section.id}`, locale)}><ArrowLeft size={18} aria-hidden="true" /><span><small>{locale === "vi" ? "Về section" : "Back to section"}</small>{section.title[locale]}</span></Link>{next && <Link href={paper3Href(`/paper-3/topics/${next.slug}`, locale)}><span><small>{locale === "vi" ? "Topic tiếp theo · Tổng quan" : "Next topic · Overview"}</small>{next.title[locale]}</span><ArrowRight size={18} aria-hidden="true" /></Link>}</nav>
  </div>;
}

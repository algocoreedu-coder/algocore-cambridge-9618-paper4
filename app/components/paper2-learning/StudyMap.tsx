"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Braces, Check, Clock3, Database, FileCheck2, GitBranch, Layers3, Map as MapIcon, Search, Workflow, X } from "lucide-react";
import { SegmentedControl } from "@/app/components/algocore-ui";
import { getSectionTopics, paper2Href, type Locale, type StudyMapCatalog } from "@/app/lib/paper2/catalog";
import { Paper2LocaleBoundary } from "./Paper2LocaleBoundary";
import { CourseProgressSummary } from "./CourseProgressSummary";
import type { Paper2ProgressLesson } from "./progress-storage";
import { PreparationNote, SectionIcon, sectionReadinessLabel, topicStatusLabel, TopicRow } from "./shared";
import styles from "./Paper2Learning.module.css";

function normalise(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

function topicCountLabel(count: number, locale: Locale) {
  return `${count} ${locale === "vi" ? "chủ đề" : count === 1 ? "topic" : "topics"}`;
}

type EdgePath = { id: string; d: string; kind: string };

export function StudyMap({ catalog, locale, progressLessons }: { readonly catalog: StudyMapCatalog; readonly locale: Locale; readonly progressLessons: readonly Paper2ProgressLesson[] }) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const view = params.get("view") === "list" ? "list" : "map";
  const selected = catalog.sections.find(section => section.id === params.get("section")) ?? catalog.sections[0];
  const canvas = useRef<HTMLDivElement>(null);
  const pendingMobileSelection = useRef<string | null>(null);
  const [edges, setEdges] = useState<EdgePath[]>([]);
  const relationships = useMemo(() => catalog.relationships.filter(relation => relation.fromSectionId === selected?.id || relation.toSectionId === selected?.id), [catalog, selected]);
  const connected = new Set(relationships.flatMap(relation => [relation.fromSectionId, relation.toSectionId]));

  // Next integrates native history with useSearchParams. Typing replaces the
  // current entry; deliberate section/view changes remain navigable with Back.
  function updateQuery(patch: Record<string, string>, replace = false) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(patch)) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    url.searchParams.set("lang", locale);
    const href = `${url.pathname}${url.search}${url.hash}`;
    if (replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
  }

  function selectSection(sectionId: string) {
    pendingMobileSelection.current = sectionId;
    updateQuery({ section: sectionId });
    if (matchMedia("(max-width: 767px)").matches) requestAnimationFrame(revealSectionDetail);
  }

  function revealSectionDetail() {
    const detail = document.getElementById("paper2-section-detail");
    detail?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    detail?.focus({ preventScroll: true });
  }

  const results = useMemo(() => {
    const terms = normalise(query.trim()).split(/\s+/).filter(Boolean);
    return catalog.topics.filter(topic => {
      const section = catalog.sections.find(entry => entry.id === topic.sectionId);
      const strand = catalog.strands.find(entry => entry.id === section?.strandId);
      const text = normalise([topic.id, topic.sectionId, topic.slug, topic.title.en, topic.title.vi, topic.summary.en, topic.summary.vi, ...topic.searchTerms, section?.title.en, section?.title.vi, strand?.id, strand?.title.en, strand?.title.vi].join(" "));
      return terms.every(term => text.includes(term));
    });
  }, [catalog, query]);

  useEffect(() => {
    const element = canvas.current;
    if (!element || view !== "map" || query.trim()) return;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      const nodes = new Map(Array.from(element.querySelectorAll<HTMLButtonElement>("[data-map-node]")).map(node => [node.dataset.sectionId, node.getBoundingClientRect()]));
      setEdges(relationships.flatMap((relation, index) => {
        const from = nodes.get(relation.fromSectionId), to = nodes.get(relation.toSectionId);
        if (!from || !to) return [];
        const singleColumn = from.width > bounds.width * .6;
        const bus = singleColumn ? 10 + (index % 3) * 3 : bounds.width / 2 + ((index % 3) - 1) * 4;
        const anchor = (rect: DOMRect) => ({ x: (singleColumn || rect.left - bounds.left > bounds.width / 2 ? rect.left : rect.right) - bounds.left, y: rect.top - bounds.top + rect.height / 2 });
        const a = anchor(from), b = anchor(to);
        return [{ id: `${relation.fromSectionId}-${relation.toSectionId}-${index}`, d: `M ${a.x} ${a.y} H ${bus} V ${b.y} H ${b.x}`, kind: relation.kind }];
      }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [relationships, locale, view, query]);

  useEffect(() => {
    if (pendingMobileSelection.current !== selected?.id || !matchMedia("(max-width: 767px)").matches) return;
    pendingMobileSelection.current = null;
    requestAnimationFrame(revealSectionDetail);
  }, [selected?.id]);

  if (!selected) return <div className={styles.page}><p>{locale === "vi" ? "Bản đồ đang được cập nhật." : "The map is being updated."}</p></div>;
  const selectedTopics = getSectionTopics(catalog, selected.id);

  return <div className={styles.page} lang={locale} data-paper2-map>
    <Paper2LocaleBoundary locale={locale} />
    <header className={styles.hero}>
      <div className={styles.eyebrow}><span>{locale === "vi" ? "BẢN ĐỒ ÔN TẬP · PAPER 2" : "YOUR REVISION MAP · PAPER 2"}</span><span className={styles.yearBadge}>{catalog.course.examYear}</span></div>
      <h1>{locale === "vi" ? <>Nhìn rõ từng phần.<br /><em>Kết nối cách giải.</em></> : <>See how ideas connect.<br /><em>Find your next step.</em></>}</h1>
      <p>{locale === "vi" ? "Từ tư duy thuật toán đến lập trình và kiểm thử: chọn một phần để hiểu mục tiêu, khám phá các chủ đề và những kiến thức liên quan." : "From algorithmic thinking to programming and testing: choose a section to explore its objectives, topics and connections."}</p>
      <div className={styles.courseFacts}><span><Layers3 size={17} aria-hidden="true" /><strong>{catalog.strands.length}</strong> {locale === "vi" ? "mạch kiến thức" : "strands"}</span><span><MapIcon size={17} aria-hidden="true" /><strong>{catalog.sections.length}</strong> {locale === "vi" ? "phần" : "sections"}</span><span><strong>{catalog.topics.length}</strong> {locale === "vi" ? "chủ đề" : "topics"}</span><span><Clock3 size={17} aria-hidden="true" />{catalog.course.durationMinutes} {locale === "vi" ? "phút" : "min"}</span><span><FileCheck2 size={17} aria-hidden="true" />{catalog.course.marks} {locale === "vi" ? "điểm" : "marks"}</span></div>
    </header>
    <PreparationNote locale={locale} availableCount={catalog.topics.filter(topic => topic.status === "available").length} totalCount={catalog.topics.length} scope="course" />
    <CourseProgressSummary lessons={progressLessons} locale={locale} />
    <section className={styles.notationGuides} aria-labelledby="paper2-notation-guides-title">
      <div className={styles.notationGuideHeader}>
        <span className={styles.kicker}>{locale === "vi" ? "TRA NHANH KÝ HIỆU THI" : "EXAM NOTATION QUICK GUIDES"}</span>
        <h2 id="paper2-notation-guides-title">{locale === "vi" ? "Cú pháp và sơ đồ cần dùng trong Paper 2" : "Syntax and diagrams used in Paper 2"}</h2>
        <p>{locale === "vi" ? "Mở thẳng bảng quy tắc, ký hiệu và cách đọc trước khi làm bài." : "Open the exact rules, symbols and reading method before you practise."}</p>
      </div>
      <div className={styles.notationGuideGrid}>
        <Link href={paper2Href("/paper-2/topics/algorithm-representations#t04-pseudocode-syntax", locale)}>
          <Braces size={23} aria-hidden="true" />
          <span><strong>{locale === "vi" ? "Cú pháp pseudocode" : "Pseudocode syntax"}</strong><small>{locale === "vi" ? "DECLARE, gán, IF, CASE, vòng lặp, mảng, routine và file" : "DECLARE, assignment, IF, CASE, loops, arrays, routines and files"}</small></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href={paper2Href("/paper-2/topics/algorithm-representations#t04-flowchart-symbols", locale)}>
          <Workflow size={23} aria-hidden="true" />
          <span><strong>{locale === "vi" ? "Ký hiệu flowchart" : "Flowchart notation"}</strong><small>{locale === "vi" ? "Start/End, input/output, process, decision và đường luồng" : "Start/End, input/output, process, decision and flow lines"}</small></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href={paper2Href("/paper-2/topics/state-transition-diagrams#understand", locale)}>
          <GitBranch size={23} aria-hidden="true" />
          <span><strong>{locale === "vi" ? "Sơ đồ chuyển trạng thái" : "State-transition diagrams"}</strong><small>{locale === "vi" ? "State, transition, event, điều kiện và cách trace" : "States, transitions, events, conditions and tracing"}</small></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <article className={styles.scopeGuideCard}>
          <Database size={23} aria-hidden="true" />
          <span><strong>{locale === "vi" ? "Database thuộc Paper 1" : "Database belongs to Paper 1"}</strong><small>{locale === "vi" ? "Syllabus 2026 xếp Database ở mục 8; Paper 2 chỉ kiểm tra mục 9–12." : "The 2026 syllabus places Databases in section 8; Paper 2 assesses sections 9–12."}</small></span>
          <b>{locale === "vi" ? "Ngoài Paper 2" : "Outside Paper 2"}</b>
        </article>
      </div>
    </section>
    <section className={styles.assessmentPath} aria-labelledby="paper2-assessment-path-title">
      <div><span className={styles.kicker}>{locale === "vi" ? "HƯỚNG TỚI SẴN SÀNG LÀM BÀI THI" : "TOWARDS EXAM READINESS"}</span><h2 id="paper2-assessment-path-title">{locale === "vi" ? "Chọn cách luyện tiếp theo" : "Choose your next practice mode"}</h2><p>{locale === "vi" ? "Tiến độ đọc bài, lượt làm bài và điểm tự chấm được lưu thành các trạng thái riêng trên thiết bị này." : "Lesson review, attempts and self-marked scores are stored as separate states on this device."}</p></div>
      <div><Link href={paper2Href("/paper-2/practice", locale)}><Layers3 size={22} aria-hidden="true" /><span><strong>{locale === "vi" ? "Luyện tập theo phần" : "Section practice"}</strong><small>{locale === "vi" ? "Bộ bài có hướng dẫn, chẩn đoán và tổng hợp" : "Guided, diagnostic and cumulative sets"}</small></span><ArrowRight size={18} aria-hidden="true" /></Link><Link href={paper2Href("/paper-2/mocks", locale)}><FileCheck2 size={22} aria-hidden="true" /><span><strong>{locale === "vi" ? "Đề mô phỏng 120 phút" : "120-minute mocks"}</strong><small>{locale === "vi" ? "75 điểm · lời giải mở sau khi nộp" : "75 marks · solutions after submission"}</small></span><ArrowRight size={18} aria-hidden="true" /></Link><Link href={paper2Href("/paper-2/progress", locale)}><BarChart3 size={22} aria-hidden="true" /><span><strong>{locale === "vi" ? "Tiến độ luyện thi" : "Practice progress"}</strong><small>{locale === "vi" ? "Lượt làm, tự chấm và bài nên học tiếp" : "Attempts, self-marks and the next activity"}</small></span><ArrowRight size={18} aria-hidden="true" /></Link></div>
    </section>
    <section className={styles.searchSection} aria-labelledby="paper2-search-label">
      <label id="paper2-search-label" htmlFor="paper2-search">{locale === "vi" ? "Bạn muốn tìm hiểu điều gì?" : "What would you like to understand?"}</label>
      <div className={styles.searchField}><Search size={21} aria-hidden="true" /><input id="paper2-search" type="search" autoComplete="off" value={query} onChange={event => updateQuery({ q: event.target.value }, true)} placeholder={locale === "vi" ? "Chủ đề, thuật ngữ hoặc mã đề cương…" : "Topic, term or syllabus code…"} aria-describedby="paper2-search-help" />{query && <button type="button" onClick={() => updateQuery({ q: "" }, true)} aria-label={locale === "vi" ? "Xóa tìm kiếm" : "Clear search"}><X size={19} aria-hidden="true" /></button>}</div>
      <p id="paper2-search-help">{locale === "vi" ? "Thử: pseudocode, flowchart, state transition, T08 hoặc 10.2. Tìm bằng EN/VI, có hoặc không dấu." : "Try pseudocode, flowchart, state transition, T08 or 10.2. Search in English or Vietnamese, with or without accents."}</p>
    </section>
    {query.trim() ? <section className={styles.results} aria-labelledby="paper2-results-title"><div className={styles.blockHeading}><h2 id="paper2-results-title">{locale === "vi" ? "Chủ đề phù hợp" : "Matching topics"}</h2><span role="status">{results.length} {locale === "vi" ? "kết quả" : "results"}</span></div>{results.length ? <div className={styles.topicList}>{results.map(topic => { const section = catalog.sections.find(entry => entry.id === topic.sectionId); return <TopicRow key={topic.id} topic={topic} locale={locale} contextLabel={section ? `${section.id} · ${section.title[locale]}` : topic.sectionId} />; })}</div> : <div className={styles.emptySearch}><Search size={32} aria-hidden="true" /><h3>{locale === "vi" ? "Chưa tìm thấy chủ đề phù hợp" : "No matching topics"}</h3><p>{locale === "vi" ? "Thử một từ ngắn hơn, tên tiếng Anh hoặc mã như 10.2. Bạn cũng có thể trở lại toàn bộ bản đồ." : "Try a shorter term, an English name or a code such as 10.2. You can also return to the complete map."}</p><button type="button" className={styles.secondaryButton} onClick={() => updateQuery({ q: "" }, true)}>{locale === "vi" ? "Xem toàn bộ bản đồ" : "Explore the full map"}<ArrowRight size={17} aria-hidden="true" /></button></div>}</section> : <section className={styles.mapSection} aria-labelledby="paper2-map-title">
      <div className={styles.blockHeading}><div><span className={styles.kicker}>{catalog.strands.length} {locale === "vi" ? "MẠCH KIẾN THỨC" : "STRANDS"} · {catalog.sections.length} {locale === "vi" ? "PHẦN" : "SECTIONS"}</span><h2 id="paper2-map-title">{locale === "vi" ? "Bản đồ học tập" : "Your study map"}</h2></div><SegmentedControl label={locale === "vi" ? "Cách xem bản đồ" : "Map view"} value={view} onChange={value => updateQuery({ view: value })} segments={[{ id: "map", label: locale === "vi" ? "Sơ đồ" : "Map" }, { id: "list", label: locale === "vi" ? "Danh sách" : "List" }]} /></div>
      <p className={styles.mapHint}>{locale === "vi" ? "Chọn một phần để xem mục tiêu và các kết nối. Các đường nối thể hiện quan hệ với phần đang chọn; bạn có thể bắt đầu ở bất kỳ phần nào." : "Choose a section to see its objectives and connections. Lines show relationships with your selection; you can start anywhere."}</p>
      <a className={styles.selectedJump} href="#paper2-section-detail">{locale === "vi" ? "Đang chọn" : "Selected"}: {selected.id} · {selected.title[locale]} <span>{locale === "vi" ? "Xem chi tiết" : "View details"}<ArrowDown size={15} aria-hidden="true" /></span></a>
      <div className={styles.mapWorkspace}>
        <div ref={canvas} className={`${styles.mapCanvas} ${styles.paper2Canvas}`} data-view={view}>
          {view === "map" && <svg className={styles.connectionEdges} aria-hidden="true">{edges.map(edge => <path key={edge.id} d={edge.d} data-kind={edge.kind} />)}</svg>}
          <div className={styles.strandMapGrid}>{catalog.strands.map(strand => <section className={styles.strandMapGroup} key={strand.id} aria-labelledby={`paper2-strand-${strand.id}`}><header><span className={styles.strandCode}><SectionIcon id={strand.id} /></span><div><span className={styles.kicker}>{locale === "vi" ? "MẠCH" : "STRAND"} {strand.id}</span><h3 id={`paper2-strand-${strand.id}`}>{strand.title[locale]}</h3></div></header><div className={styles.sectionNodes}>{catalog.sections.filter(section => section.strandId === strand.id).map(section => {
            const sectionTopics = getSectionTopics(catalog, section.id);
            const availableCount = sectionTopics.filter((topic) => topic.status === "available").length;
            const readiness = sectionReadinessLabel(availableCount, sectionTopics.length, locale);
            return <button key={section.id} type="button" className={styles.mapNode} data-map-node data-section-id={section.id} data-connected={connected.has(section.id)} data-ready-count={availableCount} aria-label={`${section.id} · ${section.title[locale]}. ${readiness}`} aria-pressed={selected.id === section.id} aria-controls="paper2-section-detail" onClick={() => selectSection(section.id)}><span className={styles.nodeHeader}><span className={styles.nodeNumber}>{section.id}</span><span className={styles.nodeSelected}>{selected.id === section.id ? <><Check size={14} aria-hidden="true" />{locale === "vi" ? "Đã chọn" : "Selected"}</> : <ArrowUpRight size={16} aria-hidden="true" />}</span></span><strong>{section.title[locale]}</strong><span className={styles.nodeMeta}>{topicCountLabel(sectionTopics.length, locale)}</span><span className={styles.nodeReadiness}>{readiness}</span></button>;
          })}</div></section>)}</div>
          <div className={styles.mapLegend}><span><i aria-hidden="true" />{locale === "vi" ? "Kiến thức nền" : "Foundation"}</span><span><i className={styles.dashedLegend} aria-hidden="true" />{locale === "vi" ? "Liên hệ kiến thức" : "Connection"}</span></div>
        </div>
        <aside id="paper2-section-detail" className={styles.sectionDetail} aria-labelledby="paper2-selected-title" tabIndex={-1}>
          <div className={styles.detailIcon}><SectionIcon id={selected.id} size={30} /></div><span className={styles.kicker}>{locale === "vi" ? "PHẦN" : "SECTION"} {selected.id}</span><h3 id="paper2-selected-title">{selected.title[locale]}</h3><p className={styles.bigQuestion}>{selected.question[locale]}</p><p>{selected.summary[locale]}</p>
          <div className={styles.detailStrands}>{selectedTopics.map(topic => <Link key={topic.id} href={paper2Href(`/paper-2/topics/${topic.slug}`, locale)}><span>{topic.id}</span><span className={styles.detailTopicCopy}>{topic.title[locale]}<small>{topicStatusLabel(topic, locale)}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>
          <Link className={styles.primaryLink} href={paper2Href(`/paper-2/sections/${selected.id}`, locale)}>{locale === "vi" ? "Khám phá phần này" : "Explore this section"}<ArrowRight size={17} aria-hidden="true" /></Link>
          <div className={styles.connections}><h4>{locale === "vi" ? "Vì sao các phần liên quan?" : "How do the ideas connect?"}</h4>{relationships.length ? relationships.map((relation, index) => { const other = catalog.sections.find(section => section.id === (relation.fromSectionId === selected.id ? relation.toSectionId : relation.fromSectionId)); if (!other) return null; return <div className={styles.connection} key={`${other.id}-${index}`}><button type="button" onClick={() => selectSection(other.id)}><span>{other.id}</span>{other.title[locale]}<ArrowRight size={15} aria-hidden="true" /></button><p>{relation.label[locale]}</p><small>{relation.kind === "foundation" ? (locale === "vi" ? "Kiến thức nền" : "Foundation") : (locale === "vi" ? "Liên hệ" : "Connection")} · {relation.fromSectionId} → {relation.toSectionId}</small></div>; }) : <p>{locale === "vi" ? "Khám phá các chủ đề và mục tiêu của phần này." : "Explore this section’s topics and objectives."}</p>}</div>
        </aside>
      </div>
    </section>}
  </div>;
}

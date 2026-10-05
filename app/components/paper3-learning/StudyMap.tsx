"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search, X, Map as MapIcon, Route, Layers3, Clock3, FileCheck2 } from "lucide-react";
import { SegmentedControl } from "@/app/components/algocore-ui";
import type { Locale, StudyMapCatalog } from "@/app/lib/paper3/catalog";
import { getSectionTopics, paper3Href, PreparationNote, SectionIcon, TopicRow } from "./shared";
import styles from "./Paper3Learning.module.css";
import { Paper3LocaleBoundary } from "./Paper3LocaleBoundary";

function normalise(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }

export function StudyMap({ catalog, locale }: { readonly catalog: StudyMapCatalog; readonly locale: Locale }) {
  const [selectedId, setSelectedId] = useState(catalog.sections[0]?.id ?? "13");
  const [view, setView] = useState("map");
  const [query, setQuery] = useState("");
  const selected = catalog.sections.find((section) => section.id === selectedId) ?? catalog.sections[0];
  const selectedTopics = getSectionTopics(catalog, selected.id);
  const relationships = catalog.relationships.filter((relation) => relation.fromSectionId === selected.id || relation.toSectionId === selected.id);
  const connected = new Set(relationships.flatMap((relation) => [relation.fromSectionId, relation.toSectionId]));
  const results = useMemo(() => {
    const terms = normalise(query.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return catalog.topics.filter((topic) => {
      const strand = catalog.strands.find((entry) => entry.id === topic.strandId);
      const optionalTerms = "searchTerms" in topic && Array.isArray(topic.searchTerms) ? topic.searchTerms.join(" ") : "";
      const haystack = normalise([topic.id, topic.strandId, topic.title.en, topic.title.vi, topic.summary.en, topic.summary.vi, strand?.title.en, strand?.title.vi, optionalTerms].join(" "));
      return terms.every((term) => haystack.includes(term));
    });
  }, [catalog, query]);
  const positions = new Map(catalog.sections.map((section, index) => [section.id, { x: index % 2 === 0 ? 25 : 75, y: Math.floor(index / 2) * 25 + 12.5 }]));

  return <div className={styles.page} lang={locale} data-paper3-map>
    <Paper3LocaleBoundary locale={locale} />
    <header className={styles.hero}>
      <div className={styles.eyebrow}><span>{locale === "vi" ? "BẢN ĐỒ ÔN TẬP" : "YOUR REVISION AT A GLANCE"}</span><span className={styles.yearBadge}>2026</span></div>
      <h1>{locale === "vi" ? <>Kết nối kiến thức.<br /><em>Hiểu trọn Paper 3.</em></> : <>Connect the ideas.<br /><em>See the whole picture.</em></>}</h1>
      <p>{locale === "vi" ? "Khám phá từng phần lý thuyết, thấy các ý tưởng liên quan và chọn topic bạn muốn tìm hiểu." : "Explore the theory, discover how ideas connect, and find the topic you want to understand."}</p>
      <div className={styles.courseFacts}><span><Layers3 size={17} aria-hidden="true" /><strong>{catalog.sections.length}</strong> {locale === "vi" ? "section" : "sections"}</span><span><Route size={17} aria-hidden="true" /><strong>{catalog.strands.length}</strong> {locale === "vi" ? "mục syllabus" : "syllabus strands"}</span><span><MapIcon size={17} aria-hidden="true" /><strong>{catalog.topics.length}</strong> topics</span><span><Clock3 size={17} aria-hidden="true" />{catalog.course.durationMinutes} {locale === "vi" ? "phút" : "min"}</span><span><FileCheck2 size={17} aria-hidden="true" />{catalog.course.marks} {locale === "vi" ? "điểm" : "marks"}</span></div>
    </header>
    <PreparationNote locale={locale} availableCount={catalog.topics.filter(topic => topic.status === "available").length} />
    <section className={styles.searchSection} aria-labelledby="paper3-search-label">
      <label id="paper3-search-label" htmlFor="paper3-search">{locale === "vi" ? "Bạn muốn tìm hiểu điều gì?" : "What do you want to explore?"}</label>
      <div className={styles.searchField}><Search size={21} aria-hidden="true" /><input id="paper3-search" type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "vi" ? "Tìm topic, thuật ngữ hoặc mã syllabus…" : "Search a topic, a term or a syllabus code…"} aria-describedby="paper3-search-help" />{query && <button type="button" onClick={() => setQuery("")} aria-label={locale === "vi" ? "Xóa tìm kiếm" : "Clear search"}><X size={19} aria-hidden="true" /></button>}</div>
      <p id="paper3-search-help">{locale === "vi" ? "Thử: floating point, đệ quy, TCP/IP hoặc 13.3. Tìm bằng tiếng Anh hoặc tiếng Việt." : "Try floating point, recursion, TCP/IP or 13.3. Search in English or Vietnamese."}</p>
    </section>
    {query.trim() ? <section className={styles.results} aria-labelledby="paper3-results-title"><div className={styles.blockHeading}><h2 id="paper3-results-title">{locale === "vi" ? "Topic phù hợp" : "Matching topics"}</h2><span role="status">{results.length} {locale === "vi" ? "kết quả" : "results"}</span></div>{results.length ? <div>{results.map((topic) => <TopicRow key={topic.id} topic={topic} locale={locale} />)}</div> : <div className={styles.emptySearch}><Search size={32} aria-hidden="true" /><h3>{locale === "vi" ? "Chưa tìm thấy topic phù hợp" : "No matching topics yet"}</h3><p>{locale === "vi" ? "Thử tên tiếng Anh, một từ ngắn hơn hoặc mã như 19.1. Bạn cũng có thể xóa tìm kiếm để xem cả bản đồ." : "Try an English term, a shorter phrase, or a code such as 19.1. Clear the search to explore the complete map."}</p><button className={styles.secondaryButton} type="button" onClick={() => setQuery("")}>{locale === "vi" ? "Xem toàn bộ bản đồ" : "Explore the full map"}<ArrowRight size={17} aria-hidden="true" /></button></div>}</section> : <section aria-labelledby="paper3-map-title" className={styles.mapSection}>
      <div className={styles.blockHeading}><div><span className={styles.kicker}>{locale === "vi" ? "8 PHẦN · MỘT BỨC TRANH TỔNG THỂ" : "8 SECTIONS · ONE CONNECTED PICTURE"}</span><h2 id="paper3-map-title">{locale === "vi" ? "Bản đồ học tập" : "Your study map"}</h2></div><SegmentedControl label={locale === "vi" ? "Cách xem bản đồ" : "Study map view"} value={view} onChange={setView} segments={[{ id: "map", label: locale === "vi" ? "Sơ đồ" : "Map" }, { id: "list", label: locale === "vi" ? "Danh sách" : "List" }]} /></div>
      <p className={styles.mapHint}>{locale === "vi" ? "Chọn một section để khám phá nội dung và những kết nối kiến thức. Bạn có thể bắt đầu ở bất kỳ phần nào." : "Select a section to see its topics and connections. You can start anywhere."}</p>
      <div className={styles.mapWorkspace}>
        <div className={styles.mapCanvas} data-view={view}>
          {view === "map" && <svg className={styles.mapEdges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{catalog.relationships.map((relation, index) => { const from = positions.get(relation.fromSectionId); const to = positions.get(relation.toSectionId); if (!from || !to) return null; const active = relation.fromSectionId === selected.id || relation.toSectionId === selected.id; return <path key={index} d={`M ${from.x} ${from.y} H ${from.x === to.x ? (from.x < 50 ? -2 : 102) : 50} V ${to.y} H ${to.x}`} data-active={active} data-kind={relation.kind} vectorEffect="non-scaling-stroke" />; })}</svg>}
          <div className={styles.nodeGrid} role="group" aria-label={locale === "vi" ? "Chọn section" : "Choose a section"}>{catalog.sections.map((section) => <button className={styles.mapNode} data-section-id={section.id} key={section.id} type="button" aria-pressed={section.id === selected.id} aria-controls="paper3-section-detail" onClick={() => setSelectedId(section.id)} data-connected={connected.has(section.id)}><span className={styles.nodeHeader}><span className={styles.nodeNumber}>{section.id}</span><SectionIcon id={section.id} size={24} /><span className={styles.nodeSelected}>{section.id === selected.id ? (locale === "vi" ? "Đã chọn" : "Selected") : <ArrowUpRight size={15} />}</span></span><strong>{section.title[locale]}</strong><span className={styles.nodeMeta}>{section.strandIds.length} {locale === "vi" ? "mục" : "strands"}<span aria-hidden="true"> · </span>{getSectionTopics(catalog, section.id).length} topics</span></button>)}</div>
          <div className={styles.mapLegend}><span><i aria-hidden="true" />{locale === "vi" ? "Kiến thức nền" : "Foundation"}</span><span><i className={styles.dashedLegend} aria-hidden="true" />{locale === "vi" ? "Liên hệ kiến thức" : "Connection"}</span></div>
        </div>
        <aside id="paper3-section-detail" className={styles.sectionDetail} aria-labelledby="paper3-selected-title">
          <div className={styles.detailIcon}><SectionIcon id={selected.id} size={32} /></div><span className={styles.kicker}>SECTION {selected.id}</span><h3 id="paper3-selected-title">{selected.title[locale]}</h3><p className={styles.bigQuestion}>{selected.question[locale]}</p><p>{selected.summary[locale]}</p>
          <div className={styles.detailStrands}>{catalog.strands.filter((strand) => strand.sectionId === selected.id).map((strand) => <Link key={strand.id} href={paper3Href(`/paper-3/sections/${selected.id}#strand-${strand.id.replaceAll(".", "-")}`, locale)}><span>{strand.id}</span>{strand.title[locale]}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>
          <Link className={styles.primaryLink} href={paper3Href(`/paper-3/sections/${selected.id}`, locale)}>{locale === "vi" ? `Khám phá ${selectedTopics.length} topic` : `Explore ${selectedTopics.length} topics`}<ArrowRight size={18} aria-hidden="true" /></Link>
          <div className={styles.connections}><h4>{locale === "vi" ? "Kết nối với" : "Connects with"}</h4>{relationships.length ? relationships.map((relation, index) => { const otherId = relation.fromSectionId === selected.id ? relation.toSectionId : relation.fromSectionId; const other = catalog.sections.find((section) => section.id === otherId); if (!other) return null; return <div className={styles.connection} key={index}><button type="button" onClick={() => setSelectedId(otherId)}><span>{other.id}</span>{other.title[locale]}<ArrowRight size={15} aria-hidden="true" /></button><p>{relation.label[locale]}</p><small>{relation.kind === "foundation" ? (locale === "vi" ? "Kiến thức nền" : "Foundation") : (locale === "vi" ? "Liên hệ kiến thức" : "Connection")}</small></div>; }) : <p>{locale === "vi" ? "Khám phá các topic trong section này." : "Explore the topics within this section."}</p>}</div>
        </aside>
      </div>
    </section>}
  </div>;
}



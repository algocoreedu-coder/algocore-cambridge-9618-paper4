import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Layers3, Map } from "lucide-react";
import type { Locale, StudyMapCatalog } from "@/app/lib/paper3/catalog";
import { getSectionTopics, paper3Href, PreparationNote, SectionIcon, TopicRow } from "./shared";
import styles from "./Paper3Learning.module.css";
import { Paper3LocaleBoundary } from "./Paper3LocaleBoundary";
import { Chapter13Overview } from "./Chapter13Overview";
import { Chapter14Overview } from "./Chapter14Overview";
import { Chapter15Overview } from "./Chapter15Overview";

export function SectionOverview({ catalog, sectionId, locale }: { readonly catalog: StudyMapCatalog; readonly sectionId: string; readonly locale: Locale }) {
  const section = catalog.sections.find((item) => item.id === sectionId);
  if (!section) return null;
  const strands = catalog.strands.filter((item) => item.sectionId === sectionId);
  const topics = getSectionTopics(catalog, sectionId);
  const index = catalog.sections.indexOf(section);
  const previous = catalog.sections[index - 1];
  const next = catalog.sections[index + 1];
  const relationships = catalog.relationships.filter((item) => item.fromSectionId === sectionId || item.toSectionId === sectionId);
  const graphTopic = sectionId === "19" ? catalog.topics.find((item) => item.id === "P3-18.1-T01") : undefined;

  return <div className={styles.page} lang={locale} data-section-id={section.id}>
    <Paper3LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper3Href("/paper-3", locale)}><Map size={16} aria-hidden="true" />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span aria-hidden="true">/</span><span aria-current="page">Section {section.id}</span></nav>
    <header className={styles.sectionHero}><div className={styles.sectionHeroSymbol}><SectionIcon id={section.id} size={40} /><span>{section.id}</span></div><div><div className={styles.eyebrow}>PAPER 3 <span aria-hidden="true">/</span> SECTION {section.id}</div><h1>{section.title[locale]}</h1><p>{section.summary[locale]}</p><div className={styles.courseFacts}><span><Layers3 size={17} aria-hidden="true" />{strands.length} {locale === "vi" ? "mục syllabus" : "syllabus strands"}</span><span>{topics.length} topics</span></div></div></header>
    <div className={styles.sectionQuestion}><span>{locale === "vi" ? "CÂU HỎI LỚN" : "THE BIG QUESTION"}</span><p>{section.question[locale]}</p></div>
    {sectionId === "13" ? <Chapter13Overview locale={locale} /> : sectionId === "14" ? <Chapter14Overview locale={locale} /> : sectionId === "15" ? <Chapter15Overview locale={locale} /> : <PreparationNote locale={locale} availableCount={topics.filter(topic => topic.status === "available").length} totalCount={topics.length} />}
    <section className={styles.sectionRoute} aria-labelledby="section-route-heading"><div className={styles.blockHeading}><h2 id="section-route-heading">{locale === "vi" ? "Khám phá phần này" : "Inside this section"}</h2><span>{locale === "vi" ? "Chọn một mục để xem topic" : "Choose a strand to see its topics"}</span></div><nav className={styles.strandRoute} aria-label={locale === "vi" ? "Các mục syllabus trong section" : "Syllabus strands in this section"}>{strands.map((strand) => <a className={styles.strandRouteCard} href={`#strand-${strand.id.replaceAll(".", "-")}`} key={strand.id}><span>{strand.id}</span><strong>{strand.title[locale]}</strong><small>{catalog.topics.filter((topic) => topic.strandId === strand.id).length} topics</small><ArrowRight size={18} aria-hidden="true" /></a>)}</nav></section>
    <div className={styles.strandGroups}>{strands.map((strand) => <section className={styles.strandGroup} key={strand.id} id={`strand-${strand.id.replaceAll(".", "-")}`} aria-labelledby={`heading-${strand.id}`}><header><span className={styles.strandCode}>{strand.id}</span><div><span className={styles.kicker}>{locale === "vi" ? "MỤC SYLLABUS" : "SYLLABUS STRAND"}</span><h2 id={`heading-${strand.id}`}>{strand.title[locale]}</h2></div></header><div className={styles.topicList}>{catalog.topics.filter((topic) => topic.strandId === strand.id).map((topic, topicIndex) => <TopicRow key={topic.id} topic={topic} locale={locale} index={topicIndex} />)}</div></section>)}</div>
    {relationships.length > 0 && <section className={styles.relatedSections} aria-labelledby="section-connections-title"><div><span className={styles.kicker}>{locale === "vi" ? "NHÌN RỘNG HƠN" : "SEE THE CONNECTIONS"}</span><h2 id="section-connections-title">{locale === "vi" ? "Những ý tưởng liên quan" : "Ideas beyond this section"}</h2></div><div>{relationships.map((relation, relationIndex) => { const other = catalog.sections.find((item) => item.id === (relation.fromSectionId === sectionId ? relation.toSectionId : relation.fromSectionId)); if (!other) return null; return <Link className={styles.relatedSection} data-section-id={other.id} key={relationIndex} href={paper3Href(`/paper-3/sections/${other.id}`, locale)}><SectionIcon id={other.id} size={23} /><span><strong>{other.id} · {other.title[locale]}</strong><small>{relation.label[locale]}</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>; })}</div></section>}
    {graphTopic && <div className={styles.crossTopic}><span className={styles.kicker}>{locale === "vi" ? "TOPIC LIÊN QUAN · ADT ĐỒ THỊ" : "RELATED TOPIC · GRAPH ADT"}</span><p>{locale === "vi" ? "Ôn khái niệm ADT đồ thị cùng bài Graphs and Dijkstra trong section 18." : "Revisit the graph ADT through Graphs and Dijkstra in section 18."}</p><Link href={paper3Href(`/paper-3/topics/${graphTopic.slug}`, locale)}>{graphTopic.title[locale]}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>}
    <nav className={styles.pageNavigation} aria-label={locale === "vi" ? "Điều hướng section" : "Section navigation"}>{previous ? <Link href={paper3Href(`/paper-3/sections/${previous.id}`, locale)}><ArrowLeft size={18} aria-hidden="true" /><span><small>{locale === "vi" ? "Section trước" : "Previous section"}</small>{previous.id} · {previous.title[locale]}</span></Link> : <Link href={paper3Href("/paper-3", locale)}><ArrowLeft size={18} aria-hidden="true" />{locale === "vi" ? "Về bản đồ học tập" : "Back to the study map"}</Link>}{next && <Link href={paper3Href(`/paper-3/sections/${next.id}`, locale)}><span><small>{locale === "vi" ? "Section tiếp theo" : "Next section"}</small>{next.id} · {next.title[locale]}</span><ArrowRight size={18} aria-hidden="true" /></Link>}</nav>
  </div>;
}

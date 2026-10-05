"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Root } from "fumadocs-core/page-tree";
import { Map, Compass } from "lucide-react";
import { localeChangeEvent, useLearningLocale } from "@/app/AppProviders";
import { Button, SegmentedControl } from "@/app/components/algocore-ui";
import type { Locale, StudyMapCatalog } from "@/app/lib/paper3/catalog";
import { paper3Href, SectionIcon } from "./shared";
import styles from "./Paper3Learning.module.css";

export function Paper3Shell({ catalog, children }: { readonly catalog: StudyMapCatalog; readonly children: ReactNode }) {
  const locale = useLearningLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingAnchor = useRef<{ locale: Locale; pathname: string; hash: string } | null>(null);
  useEffect(() => {
    const pending = pendingAnchor.current;
    if (!pending || searchParams.get("lang") !== pending.locale || pathname !== pending.pathname) return;
    pendingAnchor.current = null;
    const url = new URL(window.location.href);
    if (url.hash === pending.hash) return;
    url.hash = pending.hash;
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [pathname, searchParams]);
  const tree = useMemo<Root>(() => ({
    $id: `paper3-root-${locale}`, name: "Cambridge 9618", children: [
      { $id: "paper3-map", type: "page", name: locale === "vi" ? "Bản đồ học tập" : "Study map", url: paper3Href("/paper-3", locale), icon: <Map /> },
      { $id: "paper3-sections", type: "separator", name: locale === "vi" ? "KHÁM PHÁ KIẾN THỨC" : "EXPLORE THE SYLLABUS" },
      ...catalog.sections.map((section) => ({ $id: `paper3-section-${section.id}`, type: "page" as const, name: `${section.id} · ${section.title[locale]}`, url: paper3Href(`/paper-3/sections/${section.id}`, locale), icon: <SectionIcon id={section.id} size={18} /> })),
    ],
  }), [catalog, locale]);

  function changeLocale(value: string) {
    const nextLocale: Locale = value === "vi" ? "vi" : "en";
    if (nextLocale === locale) return;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", nextLocale);
    pendingAnchor.current = { locale: nextLocale, pathname, hash: window.location.hash };
    window.dispatchEvent(new CustomEvent(localeChangeEvent, { detail: nextLocale }));
    // Next's cached-route navigation appends the requested fragment to its cached
    // canonical URL. Restore it once after the locale commit to avoid #id#id.
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return <DocsLayout tree={tree} containerProps={{ className: styles.docsLayout }} nav={{ title: <span className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" /></span>, url: paper3Href("/paper-3", locale) }} sidebar={{ collapsible: true, banner: <div className="course-label"><span>CAMBRIDGE 9618 · {catalog.course.examYear}</span><strong>Paper 3</strong><p>{locale === "vi" ? "Lý thuyết nâng cao" : "Advanced Theory"}</p></div>, footer: <div className={styles.sidebarFooter}><div className="sidebar-note"><Compass size={20} /><span>AlgoCore Learning<small>{locale === "vi" ? "Nhìn rõ · Hiểu sâu · Tự giải" : "See it · Understand it · Apply it"}</small></span></div><form action="/api/auth/logout" method="post"><input type="hidden" name="lang" value={locale} /><Button type="submit" variant="secondary" size="compact">{locale === "vi" ? "Đăng xuất" : "Sign out"}</Button></form></div> }}>
    <div className={styles.content} data-paper3-shell>
      <a className={styles.skipLink} href="#paper3-main">{locale === "vi" ? "Đến nội dung chính" : "Skip to content"}</a>
      <div className={styles.topbar}><span><span className={styles.liveDot} aria-hidden="true" />PAPER 3 <span className={styles.topbarDivider}>/</span> {locale === "vi" ? "Lý thuyết nâng cao" : "Advanced Theory"}</span><SegmentedControl label={locale === "vi" ? "Ngôn ngữ: English hoặc Tiếng Việt" : "Language: English or Vietnamese"} value={locale} onChange={changeLocale} segments={[{ id: "en", label: "EN" }, { id: "vi", label: "VI" }]} /></div>
      <main id="paper3-main" className={styles.main} tabIndex={-1}>{children}</main>
      <footer className={styles.footer}><span>AlgoCore Education</span><span>Cambridge 9618 · {catalog.course.examYear} · {locale === "vi" ? "Đề cương phiên bản" : "Syllabus version"} {catalog.course.syllabusVersion}</span></footer>
    </div>
  </DocsLayout>;
}

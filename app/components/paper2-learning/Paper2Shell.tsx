"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Root } from "fumadocs-core/page-tree";
import { BarChart3, BookOpenCheck, Compass, FileCheck2, Map } from "lucide-react";
import { localeChangeEvent, useLearningLocale } from "@/app/AppProviders";
import { Button, SegmentedControl } from "@/app/components/algocore-ui";
import type { Locale, StudyMapCatalog } from "@/app/lib/paper2/catalog";
import { paper2Href, SectionIcon } from "./shared";
import styles from "./Paper2Learning.module.css";

export function Paper2Shell({ catalog, children }: { readonly catalog: StudyMapCatalog; readonly children: ReactNode }) {
  const locale = useLearningLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const [routePending, setRoutePending] = useState(false);
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
  useEffect(() => setRoutePending(false), [pathname, currentSearch]);
  useEffect(() => {
    const beginNavigation = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const next = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (next.origin !== current.origin || !next.pathname.startsWith("/paper-2")) return;
      if (next.pathname === current.pathname && next.search === current.search) return;
      setRoutePending(true);
    };
    const beginHistoryNavigation = () => setRoutePending(true);
    document.addEventListener("click", beginNavigation, true);
    window.addEventListener("popstate", beginHistoryNavigation);
    return () => {
      document.removeEventListener("click", beginNavigation, true);
      window.removeEventListener("popstate", beginHistoryNavigation);
    };
  }, []);
  const tree = useMemo<Root>(() => ({
    $id: `paper2-root-${locale}`, name: "Cambridge 9618", children: [
      { $id: "paper2-map", type: "page", name: locale === "vi" ? "Bản đồ học tập" : "Study map", url: paper2Href("/paper-2", locale), icon: <Map /> },
      { $id: "paper2-practice", type: "page", name: locale === "vi" ? "Luyện theo phần" : "Practice sets", url: paper2Href("/paper-2/practice", locale), icon: <BookOpenCheck /> },
      { $id: "paper2-mocks", type: "page", name: locale === "vi" ? "Đề mô phỏng 120 phút" : "120-minute mocks", url: paper2Href("/paper-2/mocks", locale), icon: <FileCheck2 /> },
      { $id: "paper2-progress", type: "page", name: locale === "vi" ? "Tiến độ luyện thi" : "Practice progress", url: paper2Href("/paper-2/progress", locale), icon: <BarChart3 /> },
      { $id: "paper2-sections", type: "separator", name: locale === "vi" ? "KHÁM PHÁ KIẾN THỨC" : "EXPLORE THE SYLLABUS" },
      ...catalog.strands.flatMap((strand) => [
        { $id: `paper2-strand-${strand.id}`, type: "separator" as const, name: `${strand.id} · ${strand.title[locale]}` },
        ...catalog.sections.filter(section => section.strandId === strand.id).map(section => ({ $id: `paper2-section-${section.id}`, type: "page" as const, name: `${section.id} · ${section.title[locale]}`, url: paper2Href(`/paper-2/sections/${section.id}`, locale), icon: <SectionIcon id={section.id} size={18} /> })),
      ]),
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

  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const main = document.getElementById("paper2-main");
    if (!main) return;
    const url = new URL(window.location.href);
    url.hash = "paper2-main";
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    main.focus();
    main.scrollIntoView({ block: "start" });
  }

  return <><a className={styles.skipLink} href="#paper2-main" onClick={skipToContent}>{locale === "vi" ? "Đến nội dung chính" : "Skip to content"}</a><DocsLayout tree={tree} containerProps={{ className: styles.docsLayout }} nav={{ title: <span className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" /></span>, url: paper2Href("/paper-2", locale) }} sidebar={{ collapsible: true, banner: <div className="course-label"><span>CAMBRIDGE 9618 · {catalog.course.examYear}</span><strong>Paper 2</strong><p>{locale === "vi" ? "Tư duy thuật toán & lập trình" : "Algorithms & programming"}</p></div>, footer: <div className={styles.sidebarFooter}><div className="sidebar-note"><Compass size={20} /><span>AlgoCore Learning<small>{locale === "vi" ? "Nhìn rõ · Hiểu sâu · Tự giải" : "See it · Understand it · Apply it"}</small></span></div><form action="/api/auth/logout" method="post"><input type="hidden" name="lang" value={locale} /><Button type="submit" variant="secondary" size="compact">{locale === "vi" ? "Đăng xuất" : "Sign out"}</Button></form></div> }}>
    <div className={styles.content} data-paper2-shell>
      <div role="region" aria-label={locale === "vi" ? "Điều khiển trang Paper 2" : "Paper 2 page controls"}>
        <div className={styles.topbar}><span><span className={styles.liveDot} aria-hidden="true" />PAPER 2 <span className={styles.topbarDivider}>/</span> {locale === "vi" ? "Tư duy thuật toán & lập trình" : "Algorithms & programming"}</span><SegmentedControl label={locale === "vi" ? "Ngôn ngữ: English hoặc Tiếng Việt" : "Language: English or Vietnamese"} value={locale} onChange={changeLocale} segments={[{ id: "en", label: "EN" }, { id: "vi", label: "VI" }]} /></div>
      </div>
      <div className={styles.routeLoading} data-paper2-route-loading data-pending={routePending ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{routePending ? (locale === "vi" ? "Đang mở nội dung Paper 2…" : "Loading Paper 2 content…") : ""}</div>
      <main id="paper2-main" className={styles.main} tabIndex={-1} aria-busy={routePending || undefined} aria-label={locale === "vi" ? "Nội dung chính Paper 2" : "Paper 2 main content"}>{children}</main>
      <footer className={styles.footer}><span>AlgoCore Education</span><nav className={styles.courseLinks} aria-label={locale === "vi" ? "Các Paper khác" : "Other papers"}><Link href={paper2Href("/paper-3", locale)}>Paper 3</Link><Link href={paper2Href("/paper-4", locale)}>Paper 4</Link></nav><span>Cambridge 9618 · {catalog.course.examYear} · {locale === "vi" ? "Đề cương phiên bản" : "Syllabus version"} {catalog.course.syllabusVersion}</span></footer>
    </div>
  </DocsLayout></>;
}

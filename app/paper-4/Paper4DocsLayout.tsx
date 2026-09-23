"use client";

import type { Root } from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { BookOpen, Braces, FlaskConical, Home } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { useLearningLocale } from "@/app/AppProviders";
import type { CourseManifest } from "@/app/components/paper4-learning";
import manifestData from "@/app/data/paper4-v2/course-manifest.json";

const manifest = manifestData as unknown as CourseManifest;
const lessonBySlug = new Map(manifest.lessons.map((lesson) => [lesson.slug, lesson]));

export function Paper4DocsLayout({ children }: { readonly children: ReactNode }) {
  const locale = useLearningLocale();
  const tree = useMemo<Root>(() => ({
    $id: "paper4-root",
    name: "A Level 9618",
    children: [
      { $id: "paper4-separator", type: "separator", name: "ALGOCORE · PAPER 4" },
      {
        $id: "paper4-course",
        type: "folder",
        name: locale === "vi" ? "Kỹ năng thực hành nâng cao" : "Advanced Practical Skills",
        defaultOpen: true,
        icon: <Braces />,
        children: [
          {
            $id: "paper4-hub",
            type: "page",
            name: locale === "vi" ? "Trang khóa học · Visual Lab" : "Course hub · Visual Lab",
            url: `/paper-4?lang=${locale}`,
            icon: <FlaskConical />,
          },
          ...manifest.packages.map((pkg) => ({
            $id: pkg.package_id,
            type: "folder" as const,
            name: pkg.title[locale],
            defaultOpen: false,
            icon: <BookOpen />,
            children: pkg.lesson_slugs.map((slug) => {
              const lesson = lessonBySlug.get(slug);
              if (!lesson) throw new Error(`Paper 4 manifest package references unknown lesson slug ${slug}`);
              return {
                $id: lesson.lesson_id,
                type: "page" as const,
                name: lesson.title[locale],
                url: `/paper-4/lessons/${lesson.slug}?lang=${locale}`,
              };
            }),
          })),
        ],
      },
    ],
  }), [locale]);

  const lessonCount = locale === "vi" ? `${manifest.counts.lessons} bài` : `${manifest.counts.lessons} lessons`;
  const patternCount = locale === "vi" ? `${manifest.counts.patterns} dạng` : `${manifest.counts.patterns} patterns`;

  return <DocsLayout
    key={locale}
    tree={tree}
    containerProps={{ className: "paper4-docs-layout" }}
    nav={{
      title: <span key="paper4-brand" className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" /></span>,
      url: `/paper-4?lang=${locale}`,
    }}
    sidebar={{
      collapsible: true,
      banner: <div key="paper4-sidebar-banner" className="course-label"><span>CAMBRIDGE 9618 · 2026</span><strong>{locale === "vi" ? "Học Paper 4" : "Paper 4 Learning"}</strong><p>Python · {lessonCount} · {patternCount}</p></div>,
      footer: <div key="paper4-sidebar-footer" className="sidebar-note"><Home size={17} /><span>AlgoCore Learning Page<small>{locale === "vi" ? "Canonical v2 · Python đã kiểm chứng" : "Canonical v2 · verified Python"}</small></span></div>,
    }}
  >{children}</DocsLayout>;
}

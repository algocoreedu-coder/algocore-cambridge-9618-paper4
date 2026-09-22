import type { Root } from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { BookOpen, Braces, FlaskConical, Home } from "lucide-react";

import type { CourseManifest } from "@/app/components/paper4-learning";
import manifestData from "@/app/data/paper4-v2/course-manifest.json";

const manifest = manifestData as unknown as CourseManifest;
const lessonBySlug = new Map(manifest.lessons.map((lesson) => [lesson.slug, lesson]));

const tree: Root = {
  $id: "paper4-root",
  name: "A Level 9618",
  children: [
    { $id: "paper4-separator", type: "separator", name: "ALGOCORE · PAPER 4" },
    {
      $id: "paper4-course",
      type: "folder",
      name: "Advanced Practical Skills",
      defaultOpen: true,
      icon: <Braces />,
      children: [
        { $id: "paper4-hub", type: "page", name: "Course hub · Visual Lab", url: "/paper-4?lang=vi", icon: <FlaskConical /> },
        ...manifest.packages.map((pkg) => ({
          $id: pkg.package_id,
          type: "folder" as const,
          name: `${pkg.title.vi} · ${pkg.title.en}`,
          defaultOpen: false,
          icon: <BookOpen />,
          children: pkg.lesson_slugs.map((slug) => {
            const lesson = lessonBySlug.get(slug);
            if (!lesson) throw new Error(`Paper 4 manifest package references unknown lesson slug ${slug}`);
            return { $id: lesson.lesson_id, type: "page" as const, name: lesson.title.vi, url: `/paper-4/lessons/${lesson.slug}?lang=vi` };
          }),
        })),
      ],
    },
  ],
};

export default function Paper4Layout({ children }: { readonly children: React.ReactNode }) {
  return <DocsLayout
    tree={tree}
    nav={{ title: <span key="paper4-brand" className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" /></span>, url: "/paper-4?lang=vi" }}
    sidebar={{
      collapsible: true,
      banner: <div key="paper4-sidebar-banner" className="course-label"><span>CAMBRIDGE 9618 · 2026</span><strong>Paper 4 Learning</strong><p>Python · {manifest.counts.lessons} bài · {manifest.counts.patterns} dạng</p></div>,
      footer: <div key="paper4-sidebar-footer" className="sidebar-note"><Home size={17} /><span>AlgoCore Learning Page<small>Canonical v2 · verified Python</small></span></div>,
    }}
  >{children}</DocsLayout>;
}

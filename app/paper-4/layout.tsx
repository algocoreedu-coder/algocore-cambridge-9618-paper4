import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { BookOpen, Braces, FlaskConical, Home } from 'lucide-react';
import learningData from '@/app/data/stage9-learning-pages.json';
import type { LearningRegistry } from '@/app/components/paper4-learning';

const learningRegistry = learningData as unknown as LearningRegistry;
const lessonById = new Map(learningRegistry.lessons.map((lesson) => [lesson.lessonId, lesson]));

const tree: Root = {
  $id: 'paper4-root',
  name: 'A Level 9618',
  children: [
    { $id: 'paper4-separator', type: 'separator', name: 'ALGOCORE · PAPER 4' },
    {
      $id: 'paper4-course',
      type: 'folder',
      name: 'Advanced Practical Skills',
      defaultOpen: true,
      icon: <Braces />,
      children: [
        { $id: 'paper4-hub', type: 'page', name: 'Course hub · Visual Lab', url: '/paper-4', icon: <FlaskConical /> },
        ...learningRegistry.packages.map((pkg) => ({
          $id: pkg.packageId,
          type: 'folder' as const,
          name: `${pkg.titles.vi} · ${pkg.titles.en}`,
          defaultOpen: false,
          icon: <BookOpen />,
          children: pkg.lessonIds.map((lessonId) => {
            const lesson = lessonById.get(lessonId)!;
            return { $id: lesson.lessonId, type: 'page' as const, name: lesson.titles.vi, url: `/paper-4/lessons/${lesson.slug}?lang=vi` };
          }),
        })),
      ],
    },
  ],
};

export default function Paper4Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: <span key="paper4-brand" className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" /></span>,
        url: '/paper-4',
      }}
      sidebar={{
        collapsible: true,
        banner: <div key="paper4-sidebar-banner" className="course-label"><span>CAMBRIDGE 9618 · 2026</span><strong>Paper 4 Learning</strong><p>Python · 26 bài · 58 dạng</p></div>,
        footer: <div key="paper4-sidebar-footer" className="sidebar-note"><Home size={17} /><span>AlgoCore Learning Page<small>Course integration · Stage 9</small></span></div>,
      }}
    >
      {children}
    </DocsLayout>
  );
}

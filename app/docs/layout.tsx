import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { Root } from 'fumadocs-core/page-tree';
import { BookOpen, Binary, Lightbulb, PencilLine, ListChecks, FlaskConical, Map } from 'lucide-react';
import { Button } from '@/app/components/algocore-ui';

const tree: Root = {
  name: 'Computer Science',
  children: [
    { type: 'separator', name: 'A LEVEL · COMPUTER SCIENCE' },
    {
      type: 'folder', name: '13. Biểu diễn dữ liệu', defaultOpen: true,
      icon: <BookOpen />,
      children: [
        { type: 'page', name: 'Số nguyên có dấu', url: '/docs', icon: <Binary /> },
        { type: 'page', name: 'Mục tiêu bài học', url: '/docs#learning-goals', icon: <ListChecks /> },
        { type: 'page', name: 'Ví dụ từng bước', url: '/docs#worked-example', icon: <Lightbulb /> },
        { type: 'page', name: 'Tự kiểm tra', url: '/docs#practice', icon: <PencilLine /> },
      ],
    },
    { type: 'separator', name: 'PAPER 2 · PROBLEM-SOLVING' },
    { type: 'page', name: 'Study Map · Paper 2', url: '/paper-2', icon: <Map /> },
    { type: 'separator', name: 'PAPER 4 · PRACTICAL' },
    { type: 'page', name: 'Visual Lab · 58 dạng bài', url: '/paper-4', icon: <FlaskConical /> },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={tree}
      nav={{ title: <span className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" /></span>, url: '/docs' }}
      sidebar={{
        collapsible: true,
        banner: <div className="course-label"><span>CAMBRIDGE 9618</span><strong>Computer Science</strong><p>Học hiểu. Thực hành. Tiến bộ.</p></div>,
        footer: <div><div className="sidebar-note"><BookOpen size={17} /><span>Học liệu AlgoCore<small>Bài học mẫu · Paper 3</small></span></div><form action="/api/auth/logout" method="post"><input type="hidden" name="lang" value="vi" /><Button type="submit" variant="secondary" size="compact">Đăng xuất</Button></form></div>,
      }}
    >
      {children}
    </DocsLayout>
  );
}

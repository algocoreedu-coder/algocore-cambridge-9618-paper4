import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { Activity, BookOpenCheck, Languages, Workflow } from 'lucide-react';
import Link from 'next/link';

import { Paper4VisualRuntime, type RuntimeRegistry } from '@/app/components/paper4-visual';
import registryData from '@/app/data/stage8-runtime-registry.json';
import learningData from '@/app/data/stage9-learning-pages.json';
import type { LearningRegistry } from '@/app/components/paper4-learning';

const registry = registryData as unknown as RuntimeRegistry;
const learningRegistry = learningData as unknown as LearningRegistry;

const toc = [
  { title: 'Cách dùng / How to use', url: '#how-to-use', depth: 2 },
  { title: 'Lộ trình 26 bài / 26 lessons', url: '#course-map', depth: 2 },
  { title: 'Visual Lab', url: '#visual-lab', depth: 2 },
  { title: 'Quy trình luyện / Practice loop', url: '#practice-loop', depth: 2 },
];

export default async function Paper4VisualLabPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const query = await searchParams;
  const locale = query.lang === 'en' ? 'en' : 'vi';
  const byId = new Map(learningRegistry.lessons.map((lesson) => [lesson.lessonId, lesson]));
  return (
    <DocsPage toc={toc} tableOfContent={{ style: 'normal', single: false }} footer={{ enabled: false }}>
      <div className="lesson-eyebrow"><span className="unit-label">PAPER 4 · 2026</span><span>ADVANCED PRACTICAL SKILLS</span></div>
      <DocsTitle>{locale === 'vi' ? 'Paper 4 — học cách giải từng dạng' : 'Paper 4 — master every question pattern'}</DocsTitle>
      <DocsDescription>
        {locale === 'vi'
          ? '26 bài học song ngữ nối kiến thức, phương pháp, marking points và visual event để bạn giải đúng và tránh mất điểm.'
          : '26 bilingual lessons connect knowledge, methods, marking points and visual events so you can solve accurately and protect every mark.'}
      </DocsDescription>
      <nav className="paper4-locale-switch" aria-label={locale === 'vi' ? 'Ngôn ngữ khóa học' : 'Course language'}>
        <Link href="/paper-4?lang=vi" aria-current={locale === 'vi' ? 'page' : undefined}>Tiếng Việt</Link>
        <Link href="/paper-4?lang=en" aria-current={locale === 'en' ? 'page' : undefined}>English</Link>
      </nav>
      <div className="paper4-metrics" aria-label="Phạm vi visual Paper 4">
        <span><Workflow size={18} /><strong>58</strong> dạng bài</span>
        <span><BookOpenCheck size={18} /><strong>174</strong> tình huống</span>
        <span><Activity size={18} /><strong>331</strong> event</span>
        <span><Languages size={18} /><strong>VI · EN</strong> song ngữ</span>
      </div>

      <DocsBody>
        <section id="course-map" className="paper4-course-map" aria-labelledby="course-map-title">
          <div className="paper4-section-heading">
            <span>13 PACKAGES · 26 LESSONS · 10 LEARNING BLOCKS</span>
            <h2 id="course-map-title">{locale === 'vi' ? 'Lộ trình ôn thi Paper 4' : 'Paper 4 revision pathway'}</h2>
            <p>{locale === 'vi' ? 'Học theo thứ tự hoặc mở đúng dạng bài bạn đang cần ôn.' : 'Follow the sequence or open the exact question type you need to revise.'}</p>
          </div>
          <div className="paper4-package-grid">
            {learningRegistry.packages.map((pkg, packageIndex) => (
              <article className="paper4-package-card" key={pkg.packageId}>
                <header><span>{String(packageIndex + 1).padStart(2, '0')}</span><h3>{pkg.titles[locale]}</h3></header>
                <ol>
                  {pkg.lessonIds.map((lessonId) => {
                    const lesson = byId.get(lessonId);
                    if (!lesson) return null;
                    return <li key={lesson.lessonId}><Link href={`/paper-4/lessons/${lesson.slug}?lang=${locale}`}>{lesson.titles[locale]}</Link><small>{lesson.patternIds.length} patterns · 10 blocks</small></li>;
                  })}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section id="how-to-use" className="paper4-intro" aria-labelledby="how-to-use-title">
          <h2 id="how-to-use-title">Cách dùng / How to use</h2>
          <ol>
            <li><strong>Chọn dạng bài.</strong> Select one of the 58 Paper 4 patterns.</li>
            <li><strong>Dừng và dự đoán.</strong> Predict the next event before pressing Next.</li>
            <li><strong>Đối chiếu bốn vùng.</strong> Compare code, state, trace and output at the same step.</li>
            <li><strong>Kiểm tra invariant.</strong> Say what must remain true to protect the marking point.</li>
            <li><strong>Reset và replay.</strong> Repeat until you can explain every transition without guessing.</li>
          </ol>
        </section>

        <section id="visual-lab" className="paper4-lab-section" aria-labelledby="visual-lab-title">
          <div className="paper4-section-heading">
            <span>DETERMINISTIC EVENT RUNTIME</span>
            <h2 id="visual-lab-title">Paper 4 Visual Lab</h2>
            <p>Mọi panel dùng chung một event hiện tại; đổi ngôn ngữ không đổi trace hoặc trạng thái.</p>
          </div>
          <Paper4VisualRuntime registry={registry} initialLocale={locale} autoplayDelayMs={1800} />
        </section>

        <section id="practice-loop" className="paper4-practice-loop" aria-labelledby="practice-loop-title">
          <h2 id="practice-loop-title">Quy trình luyện / Practice loop</h2>
          <div>
            <p><b>1 · Predict</b><span>Nói event và state tiếp theo trước khi bấm.</span></p>
            <p><b>2 · Trace</b><span>Đối chiếu code line, thay đổi state và output.</span></p>
            <p><b>3 · Protect marks</b><span>Nhắc lại invariant và lỗi dễ làm mất điểm.</span></p>
            <p><b>4 · Replay</b><span>Reset, đổi input, rồi giải thích lại bằng ngôn ngữ còn lại.</span></p>
          </div>
        </section>
      </DocsBody>
      <footer className="lesson-footer"><span>AlgoCore Education · A Level 9618</span><span>Stage 9 learning pages · Stage 8 visual runtime</span></footer>
    </DocsPage>
  );
}

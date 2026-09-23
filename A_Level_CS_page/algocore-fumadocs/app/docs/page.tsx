import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { BookOpen, Clock3, ArrowDown, Lightbulb, TriangleAlert, Check } from 'lucide-react';

const toc = [
  { title: 'Mục tiêu bài học', url: '#learning-goals', depth: 2 },
  { title: 'Một bit dành cho dấu', url: '#concept', depth: 2 },
  { title: 'Ví dụ từng bước', url: '#worked-example', depth: 2 },
  { title: 'Tự kiểm tra', url: '#practice', depth: 2 },
];

export default function LessonPage() {
  return (
    <DocsPage toc={toc} tableOfContent={{ style: 'normal', single: false }} footer={{ enabled: false }}>
      <div className="lesson-eyebrow"><span className="unit-label">UNIT 13</span><span>DATA REPRESENTATION</span></div>
      <DocsTitle>Số nguyên có dấu</DocsTitle>
      <DocsDescription>Hiểu cách máy tính biểu diễn số âm bằng phương pháp bù hai — two’s complement.</DocsDescription>
      <div className="lesson-meta"><span><BookOpen size={15} /> Paper 3 · Lý thuyết</span><span><Clock3 size={15} /> 8 phút đọc</span><span className="sample-label">Bài học mẫu</span></div>
      <DocsBody>
        <section className="learning-goals" aria-labelledby="learning-goals">
          <h2 id="learning-goals">Mục tiêu bài học</h2>
          <p>Sau bài này, bạn có thể:</p>
          <ul>
            <li><Check size={17} /> Xác định miền giá trị của số nguyên bù hai 8 bit.</li>
            <li><Check size={17} /> Chuyển một số nguyên âm sang biểu diễn nhị phân.</li>
            <li><Check size={17} /> Giải thích trọng số của bit ngoài cùng bên trái.</li>
          </ul>
        </section>
        <h2 id="concept">Một bit dành cho dấu</h2>
        <p>Trong biểu diễn bù hai, bit ngoài cùng bên trái có <strong>trọng số âm</strong>. Với 8 bit, trọng số này là <strong>−128</strong>; bảy bit còn lại có trọng số từ 64 đến 1. Bit trái bằng 1 cho biết giá trị là số âm.</p>
        <div className="bit-panel" role="figure" aria-label="11110011 trong bù hai 8 bit có giá trị âm 13">
          <div className="bit-panel-header"><span>BÙ HAI · 8 BIT</span><span>Ví dụ: −13</span></div>
          <div className="bit-grid">
            {[-128, 64, 32, 16, 8, 4, 2, 1].map((weight, i) => <div key={weight} className={i === 0 ? 'bit-column sign-bit' : 'bit-column'}><span>{weight}</span><strong>{[1, 1, 1, 1, 0, 0, 1, 1][i]}</strong></div>)}
          </div>
          <p>−128 + 64 + 32 + 16 + 2 + 1 = <strong>−13</strong></p>
        </div>
        <aside className="concept-note"><Lightbulb size={21} /><div><strong>Điểm cần nhớ</strong><p>Với n bit, miền giá trị bù hai là −2<sup>n−1</sup> đến 2<sup>n−1</sup> − 1. Với 8 bit: <b>−128 đến 127</b>.</p></div></aside>
        <h2 id="worked-example">Ví dụ từng bước</h2>
        <p>Để biểu diễn <strong>−13</strong> bằng bù hai 8 bit, bắt đầu với biểu diễn của +13:</p>
        <ol className="worked-steps">
          <li><span className="step-number">1</span><div><strong>Viết số dương với đủ 8 bit</strong><code>0000 1101</code></div></li>
          <li><span className="step-number">2</span><div><strong>Đảo tất cả các bit</strong><code>1111 0010</code></div></li>
          <li><span className="step-number">3</span><div><strong>Cộng thêm 1</strong><code>1111 0011</code></div></li>
        </ol>
        <aside className="warning-note"><TriangleAlert size={21} /><div><strong>Tránh nhầm lẫn</strong><p>Chỉ đổi bit đầu tiên thành 1 không tạo ra biểu diễn bù hai. Bạn cần đảo <b>tất cả</b> các bit rồi cộng 1.</p></div></aside>
        <h2 id="practice">Tự kiểm tra</h2>
        <div className="practice-card"><div className="practice-heading"><span>LUYỆN TẬP</span><span>01</span></div><h3>Biểu diễn −6 bằng bù hai 8 bit.</h3><p>Hãy tự viết ba bước trước khi xem lời giải.</p><details><summary>Xem lời giải <ArrowDown size={16} /></summary><div className="solution"><p>+6 = <code>0000 0110</code> → đảo bit: <code>1111 1001</code> → cộng 1: <strong><code>1111 1010</code></strong>.</p><p>Kiểm tra: −128 + 64 + 32 + 16 + 8 + 2 = <strong>−6</strong>.</p></div></details></div>
      </DocsBody>
      <footer className="lesson-footer"><span>AlgoCore Education</span><span>Hiểu bản chất, vững tư duy.</span></footer>
    </DocsPage>
  );
}

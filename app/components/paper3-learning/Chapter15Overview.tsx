import Link from "next/link";
import { ArrowRight, ArrowUpRight, Binary, Boxes, Braces, CircuitBoard, Cpu, GitCompareArrows, Grid2X2, Layers3, MemoryStick, Network } from "lucide-react";
import type { Locale } from "@/app/lib/paper3/catalog";
import { paper3Href } from "./shared";
import styles from "./Chapter15Overview.module.css";

const strands = [
  {
    id: "15.1",
    icon: Cpu,
    title: { en: "From instructions to parallel machines", vi: "Từ lệnh đến hệ thống song song" },
    question: { en: "How does a processor organise and share work?", vi: "Bộ xử lý tổ chức và chia sẻ công việc thế nào?" },
    topics: [
      { slug: "risc-and-cisc", icon: GitCompareArrows, en: "Compare RISC and CISC", vi: "So sánh RISC và CISC" },
      { slug: "pipelines-registers-and-interrupts", icon: Layers3, en: "Trace a processor pipeline", vi: "Theo dõi pipeline xử lý lệnh" },
      { slug: "flynn-architectures-and-massive-parallelism", icon: Network, en: "Classify parallel architectures", vi: "Phân loại kiến trúc song song" },
      { slug: "virtual-machines", icon: Boxes, en: "Allocate virtual machines", vi: "Phân bổ tài nguyên máy ảo" },
    ],
  },
  {
    id: "15.2",
    icon: CircuitBoard,
    title: { en: "From logic signals to stored state", vi: "Từ tín hiệu logic đến trạng thái được lưu" },
    question: { en: "How do gates calculate, simplify and remember a result?", vi: "Các cổng tính, rút gọn và ghi nhớ kết quả ra sao?" },
    topics: [
      { slug: "circuit-truth-table-and-expression", icon: CircuitBoard, en: "Translate circuit, table and expression", vi: "Đổi giữa mạch, bảng và biểu thức" },
      { slug: "half-full-adders", icon: Binary, en: "Build half and full adders", vi: "Dựng bộ cộng bán phần và toàn phần" },
      { slug: "sr-and-jk-flip-flops", icon: MemoryStick, en: "Track flip-flop state", vi: "Theo dõi trạng thái flip-flop" },
      { slug: "boolean-simplification", icon: Braces, en: "Simplify with Boolean laws", vi: "Rút gọn bằng luật Boolean" },
      { slug: "karnaugh-maps", icon: Grid2X2, en: "Group a Karnaugh map", vi: "Nhóm ô trên bản đồ Karnaugh" },
    ],
  },
] as const;

export function Chapter15Overview({ locale }: { readonly locale: Locale }) {
  const vi = locale === "vi";
  return <section className={styles.overview} aria-labelledby="chapter15-overview-title">
    <div className={styles.heading}>
      <span>{vi ? "BẢN ĐỒ CƠ CHẾ" : "MECHANISM MAP"}</span>
      <h2 id="chapter15-overview-title">{vi ? "Từ dòng lệnh đến tín hiệu và trạng thái" : "From instruction streams to signals and stored state"}</h2>
      <p>{vi ? "Nhánh thứ nhất theo dõi cách bộ xử lý thực hiện, chồng lấp và phân chia công việc. Nhánh thứ hai theo dõi tín hiệu qua cổng logic, biến đổi biểu thức và lưu một bit. Mỗi topic gắn lý thuyết với một mô hình tương tác có thể kiểm tra từng trạng thái." : "The first strand follows how processors execute, overlap and divide work. The second follows signals through logic gates, transforms expressions and stores one bit. Every topic connects the theory to an interactive model whose state you can inspect."}</p>
    </div>
    <div className={styles.strands}>
      {strands.map((strand, strandIndex) => <div className={styles.strand} key={strand.id}>
        <header>
          <div><strand.icon size={23} aria-hidden="true" /><span>{strand.id}</span></div>
          <h3>{strand.title[locale]}</h3>
          <p>{strand.question[locale]}</p>
        </header>
        <ol>{strand.topics.map((topic, topicIndex) => <li key={topic.slug}>
          <Link href={paper3Href(`/paper-3/topics/${topic.slug}`, locale)}>
            <span className={styles.step}>{topicIndex + 1}</span>
            <topic.icon size={20} aria-hidden="true" />
            <strong>{locale === "vi" ? topic.vi : topic.en}</strong>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          {topicIndex < strand.topics.length - 1 && <ArrowRight className={styles.arrow} size={19} aria-hidden="true" />}
        </li>)}</ol>
        {strandIndex === 0 && <div className={styles.bridge}><ArrowRight size={18} aria-hidden="true" />{vi ? "Cơ chế xử lý dẫn tới các phép toán phần cứng" : "Processing mechanisms lead into hardware logic"}</div>}
      </div>)}
    </div>
    <aside><strong>{vi ? "Trước khi bắt đầu" : "Before you begin"}</strong><p>{vi ? "Ôn fetch–execute cycle, thanh ghi và các cổng AND, OR, NOT. Mỗi lesson nhắc lại kiến thức nền cần dùng và cho phép chuyển sang tiếng Việt mà không thay đổi trạng thái mô phỏng." : "Recall the fetch–execute cycle, registers, and the AND, OR and NOT gates. Each lesson revisits the prerequisite it uses, and changing language preserves the visual model."}</p></aside>
  </section>;
}

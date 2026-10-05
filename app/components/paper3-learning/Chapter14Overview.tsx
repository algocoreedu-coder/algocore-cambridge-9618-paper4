import Link from "next/link";
import { ArrowRight, ArrowUpRight, GitFork, Layers3, Route, Send, Users } from "lucide-react";
import type { Locale } from "@/app/lib/paper3/catalog";
import { paper3Href } from "./shared";
import styles from "./Chapter14Overview.module.css";

const strands = [
  {
    id: "14.1",
    icon: Layers3,
    title: { en: "Build a shared language", vi: "Xây dựng ngôn ngữ chung" },
    question: { en: "How do layers, protocols and peers cooperate?", vi: "Các lớp, giao thức và peer phối hợp thế nào?" },
    topics: [
      { slug: "tcp-ip-stack-and-message-journey", icon: Send, en: "Trace a message through TCP/IP", vi: "Theo dấu thông điệp qua TCP/IP" },
      { slug: "application-protocol-selection", icon: Route, en: "Match a protocol to a service", vi: "Ghép giao thức với dịch vụ" },
      { slug: "bittorrent-and-peer-to-peer-transfer", icon: Users, en: "Reconstruct a peer-to-peer transfer", vi: "Tái dựng quá trình truyền peer-to-peer" },
    ],
  },
  {
    id: "14.2",
    icon: Route,
    title: { en: "Move data through the network", vi: "Di chuyển dữ liệu qua mạng" },
    question: { en: "Which path and switching method fit the task?", vi: "Đường đi và phương thức chuyển mạch nào phù hợp?" },
    topics: [
      { slug: "packet-journey-and-routers", icon: Route, en: "Follow packets across routers", vi: "Theo dõi packet qua router" },
      { slug: "choosing-a-switching-method", icon: GitFork, en: "Compare circuit and packet switching", vi: "So sánh chuyển mạch kênh và gói" },
    ],
  },
] as const;

export function Chapter14Overview({ locale }: { readonly locale: Locale }) {
  const vi = locale === "vi";
  return <section className={styles.overview} aria-labelledby="chapter14-overview-title">
    <div className={styles.heading}>
      <span>{vi ? "BẢN ĐỒ CƠ CHẾ" : "MECHANISM MAP"}</span>
      <h2 id="chapter14-overview-title">{vi ? "Từ dữ liệu ứng dụng đến hành trình qua mạng" : "From application data to a journey across the network"}</h2>
      <p>{vi ? "Bắt đầu bằng lý do các thiết bị cần giao thức và mô hình phân lớp. Sau đó theo dõi dữ liệu khi được chuẩn bị, chia sẻ, định tuyến và chuyển mạch. Mỗi bài cho phép bạn thay đổi trạng thái để quan sát cơ chế, không chỉ đọc định nghĩa." : "Begin with why devices need protocols and a layered model. Then follow data as it is prepared, shared, routed and switched. Each lesson lets you change the state and inspect the mechanism rather than only read a definition."}</p>
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
        {strandIndex === 0 && <div className={styles.bridge}><ArrowRight size={18} aria-hidden="true" />{vi ? "Thông điệp đã sẵn sàng để đi qua mạng" : "The message is ready to travel across the network"}</div>}
      </div>)}
    </div>
    <aside><strong>{vi ? "Trước khi bắt đầu" : "Before you begin"}</strong><p>{vi ? "Bạn chỉ cần phân biệt thiết bị gửi, thiết bị nhận và mạng ở giữa. Các bài sẽ xây dựng dần khái niệm layer, protocol, packet, router và switching method." : "You only need to distinguish the sending device, receiving device and the network between them. The lessons build the ideas of layers, protocols, packets, routers and switching methods step by step."}</p></aside>
  </section>;
}

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Braces, Database, Binary } from "lucide-react";
import type { Locale } from "@/app/lib/paper3/catalog";
import { paper3Href } from "./shared";
import styles from "./Chapter13Overview.module.css";

export function Chapter13Overview({ locale }: { readonly locale: Locale }) {
  const vi = locale === "vi";
  const nodes = [
    { id: "13.1", icon: Braces, title: vi ? "Mô tả dữ liệu" : "Describe the data", model: "TYPE → VARIABLE → VALUE", text: vi ? "Chọn kiểu, miền giá trị và các trường để mô hình hóa đúng một thực thể." : "Choose types, valid values and fields to model an entity accurately." },
    { id: "13.2", icon: Database, title: vi ? "Lưu và tìm bản ghi" : "Store and locate a record", model: "KEY → HASH → SLOT", text: vi ? "Tách cách tổ chức tệp khỏi cách truy cập; theo dõi việc tìm đúng khóa khi có va chạm." : "Separate file organisation from access; follow the search for the right key when addresses collide." },
    { id: "13.3", icon: Binary, title: vi ? "Biểu diễn giá trị số" : "Represent a numerical value", model: "VALUE = M × 2ᴱ", text: vi ? "Hiểu giới hạn số bit: cách mã hóa số thực và đánh đổi giữa độ chính xác với phạm vi." : "Understand a finite bit budget: how real numbers are encoded and the trade-off between precision and range." },
  ];
  return <section className={styles.overview} aria-labelledby="chapter13-overview-title">
    <h2 id="chapter13-overview-title">{vi ? "Ba quyết định khi biểu diễn dữ liệu" : "Three decisions behind data representation"}</h2>
    <p>{vi ? "Hãy hình dung một hệ thống lưu dữ liệu học sinh: trước hết xác định trường và kiểu, sau đó chọn cách lưu/tìm bản ghi; mỗi giá trị số trong đó còn cần một cách biểu diễn bằng bit. Ba nhánh dưới đây giải thích từng quyết định." : "Imagine a system storing student data: first define its fields and types, then decide how to store and find each record. Every numerical field also needs a bit representation. These three strands explain the decisions."}</p>
    <div className={styles.map}>{nodes.map((node, i) => <div className={styles.nodeWithLink} key={node.id}><Link href={paper3Href(`/paper-3/sections/13#strand-${node.id.replace(".", "-")}`, locale)}><div className={styles.nodeTop}><node.icon size={24} aria-hidden="true" /><span>{node.id}</span><ArrowUpRight size={18} aria-hidden="true" /></div><h3>{node.title}</h3><code>{node.model}</code><p>{node.text}</p></Link>{i < nodes.length - 1 && <ArrowDown className={styles.arrow} size={24} aria-hidden="true" />}</div>)}</div>
    <aside className={styles.prerequisites}><strong>{vi ? "Trước khi bắt đầu" : "Before you begin"}</strong><p>{vi ? "Ôn trọng số nhị phân, số nguyên bù hai và khái niệm biến/mảng. Mỗi bài nhắc lại phần kiến thức nền cần dùng; bạn có thể mở từng nhánh theo nhu cầu." : "Recall binary place values, two’s-complement integers, variables and arrays. Each lesson revisits its prerequisites; choose the strand that matches what you need to practise."}</p></aside>
  </section>;
}

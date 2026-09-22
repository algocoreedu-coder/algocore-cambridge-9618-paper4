import type { Localized } from "@/app/components/paper4-learning/types";

export type SourceAuthorityClass =
  | "official-exam"
  | "coursebook"
  | "algocore-editorial"
  | "internal-evidence"
  | "unclassified";

export type SourceAuthorityDefinition = Readonly<{
  id: SourceAuthorityClass;
  label: Localized;
  description: Localized;
}>;

export const sourceAuthorityCatalog: readonly SourceAuthorityDefinition[] = [
  {
    id: "official-exam",
    label: { vi: "Nguồn đề thi chính thức", en: "Official exam source" },
    description: {
      vi: "Question paper hoặc mark scheme Cambridge đã được corpus nội bộ đối chiếu. Mã nguồn và locator là trích dẫn; quyền truy cập tệp vẫn do kho nguồn quản lý.",
      en: "A Cambridge question paper or mark scheme checked in the internal corpus. The source ID and locator are citations; file access remains controlled by the source repository.",
    },
  },
  {
    id: "coursebook",
    label: { vi: "Coursebook", en: "Coursebook" },
    description: {
      vi: "Phần kiến thức trong coursebook đã được Stage 3 nối với lesson. Locator chỉ giúp kiểm chứng nội bộ và không phải liên kết công khai.",
      en: "A coursebook section joined to the lesson in Stage 3. Its locator supports internal verification and is not a public link.",
    },
  },
  {
    id: "algocore-editorial",
    label: { vi: "Biên tập AlgoCore", en: "AlgoCore editorial" },
    description: {
      vi: "Giải thích, chính sách hoặc suy luận do AlgoCore biên soạn từ nguồn đã khóa; không được trình bày như lời chính thức của Cambridge.",
      en: "An AlgoCore explanation, policy, or inference derived from locked sources; it is not presented as an official Cambridge statement.",
    },
  },
  {
    id: "internal-evidence",
    label: { vi: "Bằng chứng nội bộ", en: "Internal evidence" },
    description: {
      vi: "Trace, visual brief, mapping hoặc artifact đã được kiểm ở một stage trước. Người học thấy citation, còn đường dẫn tệp cục bộ không được phát hành dưới dạng href.",
      en: "A trace, visual brief, mapping, or artifact checked in an earlier stage. Learners see the citation while local file paths are never published as href values.",
    },
  },
  {
    id: "unclassified",
    label: { vi: "Chưa phân loại", en: "Unclassified source" },
    description: {
      vi: "Nguồn giữ nguyên nhãn gốc nhưng chưa khớp một nhóm authority chuẩn. Trạng thái này cần được source reviewer kiểm lại trước release.",
      en: "The original authority label is preserved but does not match a standard class. A source reviewer must check it before release.",
    },
  },
] as const;

export function classifySourceAuthority(authority: string): SourceAuthorityClass {
  const normalized = authority.trim().toLowerCase();
  if (/^(official[_ -]?)?(qp|ms)$/.test(normalized)) return "official-exam";
  if (normalized.includes("coursebook")) return "coursebook";
  if (normalized.includes("algocore")) return "algocore-editorial";
  if (/^(stage\d|stage\s|stage-|stage_)/.test(normalized)) return "internal-evidence";
  return "unclassified";
}

export function sourceAuthorityDefinition(authority: string) {
  const authorityClass = classifySourceAuthority(authority);
  return sourceAuthorityCatalog.find((item) => item.id === authorityClass)
    ?? sourceAuthorityCatalog[sourceAuthorityCatalog.length - 1];
}

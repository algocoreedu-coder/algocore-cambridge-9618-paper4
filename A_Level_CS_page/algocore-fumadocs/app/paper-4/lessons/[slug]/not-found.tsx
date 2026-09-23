import Link from "next/link";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

export default function LessonNotFound() {
  return (
    <DocsPage toc={[]} tableOfContent={{ enabled: false }} footer={{ enabled: false }}>
      <DocsTitle>Không tìm thấy bài học / Lesson not found</DocsTitle>
      <DocsDescription>
        Slug này không thuộc bộ 26 learning page Paper 4 đã phát hành.
      </DocsDescription>
      <DocsBody>
        <p lang="vi">Quay lại trang Paper 4 để chọn một bài học trong corpus đã kiểm chứng.</p>
        <p lang="en">Return to the Paper 4 hub and choose a lesson from the verified corpus.</p>
        <p><Link href="/paper-4">← Paper 4</Link></p>
      </DocsBody>
    </DocsPage>
  );
}

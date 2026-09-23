# Stage 9 schema contracts

## Learning registry

Root bắt buộc: `schemaVersion`, `releaseInputs`, `counts`, `packages`, `lessons`.

Mỗi lesson bắt buộc có:

- `lessonId`, `packageId`, `slug`, `version`, `titles.vi/en`, `descriptions.vi/en`;
- `patternIds`, `prerequisiteLessonIds`, `nextLessonIds`;
- `blocks`: đúng 10 kind theo thứ tự canonical của Stage 6: `recognition`, `exam-cues`, `knowledge`, `method`, `worked-example`, `action-view`, `marking-pitfalls`, `practice`, `retrieval`, `next-and-sources`;
- từng block có stable `blockId`, `anchor`, `content.vi/en`, `sourceRefs`;
- `actionView.patternIds` là subset khác rỗng của `patternIds` khi lesson có quá trình động;
- `provenance` chứa artifact path và SHA-256, không biến path đó thành public href.

## Exact-set invariants

- package IDs: 13 unique;
- lesson IDs/slugs: 26 unique;
- union pattern IDs: đúng 58 và bằng exact set Stage 8;
- primary lesson ownership của từng pattern lấy từ `stage-3/LESSON_PACKAGES.json.pattern_destinations`; Stage 6 secondary knowledge links không được biến thành ownership trùng;
- scenario/event data không nhân bản trong Stage 9 registry;
- 260 required blocks, mỗi lesson đúng 10;
- VI/EN parity theo cùng lesson/block ID và version;
- mọi prerequisite/next ID tham chiếu lesson tồn tại.

## Route contract

- canonical: `/paper-4/lessons/{slug}`;
- `?lang=vi|en` chọn nội dung; mặc định `vi`;
- section anchor dùng giá trị từ registry;
- invalid slug gọi `notFound()`;
- static params chứa đúng 26 slug.

## Mapping và source access

Tên block Stage 9 giữ nguyên canonical Stage 6; renderer chỉ dịch nhãn hiển thị, không đổi kind trong dữ liệu. Source ref được render qua resolver thành citation card nội bộ; `locator` là text provenance, không phải filesystem href. Mỗi card có `accessMode` và route nội bộ kiểm chứng được.

## Locale acceptance

Query `lang=vi|en` chọn locale nhưng không đổi lesson/block/pattern ID. Client locale boundary cập nhật `document.documentElement.lang`; navigation/TOC/labels nhận cùng locale. Locale switch phải giữ URL slug, anchor, selected pattern, scenario và event index.

## Gate evidence

Mỗi gate JSON có `schema_version`, `wave`, `owner`, `reviewer`, `inputs`, `checks`, `findings`, `required_open_findings`, `decision`, `generated_at`. PASS chỉ hợp lệ khi `required_open_findings` bằng 0.

# Stage 9 work orders

## WO-S9-0 — A0 Lead

Tạo planning, input lock, status và gate evidence. Không sửa Stage 0–8. Xác minh Next.js 16 dynamic-route contract trong docs cục bộ trước khi giao runtime work.

## WO-S9-R1 — A5/A7 Content remediation

**Write scope:** `stage-9/evidence/s9-r/CONTENT_REMEDIATION.json` và review files cùng thư mục.

Author 13 lesson thiếu theo exact list trong A7 planning review. Dùng `stage-3/LESSON_PACKAGES.json` làm skeleton và Stage 4/6 verified records làm nguồn. Mỗi lesson cần đủ 10 kind canonical: `recognition`, `exam-cues`, `knowledge`, `method`, `worked-example`, `action-view`, `marking-pitfalls`, `practice`, `retrieval`, `next-and-sources`. Prose mới phải có VI/EN và authority `AlgoCore_editorial`; không tạo QP/MS mark hoặc pattern mới. Author không tự review record của mình.

## WO-S9-R2 — A4 Source resolver

**Write scope:** `algocore-fumadocs/app/components/paper4-learning/SourceReferences.tsx`, source index data/route mới, và `stage-9/evidence/s9-r/source/*`.

Chuyển source refs thành citation cards/routes an toàn. Không xuất local path thành href. Mỗi card cho biết authority, source ID, locator/citation, status và access mode (`internal-citation` hoặc external URL đã xác minh).

## WO-S9-R3 — A6/A2 Locale acceptance

Renderer phải đồng bộ `html lang`, labels, navigation và nội dung; đổi VI/EN giữ cùng lesson, block anchor, pattern, scenario và event index. Evidence gồm test matrix cho page load, deep link và locale switch.

## WO-S9-A — A1 Registry engineer

**Write scope:**

- `algocore-fumadocs/scripts/build-stage9-lessons.mjs`
- `algocore-fumadocs/scripts/verify-stage9-lessons.mjs`
- `algocore-fumadocs/app/data/stage9-learning-pages.json`
- `stage-9/evidence/s9-a/*`

Đọc các artifact release Stage 6 và overlay đã review ở `s9-r/CONTENT_REMEDIATION.json`, hợp nhất đúng 26 lesson và join registry Stage 8. Không tự viết prose. Verifier phải fail với duplicate lesson/slug, placeholder, thiếu semantic block, pattern orphan, locale thiếu hoặc unsafe local href.

## WO-S9-B — A2 Integration engineer

**Write scope:**

- `algocore-fumadocs/app/components/paper4-learning/*`
- `algocore-fumadocs/app/paper-4/lessons/[slug]/*`
- `stage-9/evidence/s9-b/*`

Tạo renderer và route theo registry. Dùng `generateStaticParams`, `notFound`, metadata song ngữ và 10 anchor ổn định. Section 6 embed runtime Stage 8 bằng pattern của lesson. Giữ Action View là minh họa event, không quảng bá executor.

## WO-S9-C — A3 Navigation engineer

**Write scope:**

- course-hub/navigation components mới dưới `app/components/paper4-learning/*`
- thay đổi tối thiểu `app/paper-4/page.tsx` hoặc layout nếu cần
- `stage-9/evidence/s9-c/*`

Hiển thị 13 package và 26 lesson, prerequisite, previous/next, link visual lab và deep link tới 10 block. Mọi control dùng được bằng keyboard.

## WO-S9-D1 — A4 Source reviewer

Chỉ viết `stage-9/evidence/s9-d/source/*`. Kiểm exact joins, nhãn official/editorial, locator và không lộ local path trong href. Tạo findings; không tự sửa dữ liệu nguồn.

## WO-S9-D2 — A6 Language/accessibility reviewer

Chỉ viết `stage-9/evidence/s9-d/ux/*`. Kiểm 26 lesson VI/EN, `lang`, focus, headings, labels, mobile 320 px, light/dark, reduced-motion và locale state.

## WO-S9-D3 — A7 Pedagogy reviewer

Chỉ viết `stage-9/evidence/s9-d/pedagogy/*`. Kiểm 260 required blocks, recognition→method→worked example→prediction→practice→retrieval→next; spotcheck đủ 13 package.

## WO-S9-E — A8 Independent QA

Chỉ viết `stage-9/evidence/s9-e/*`. Không dùng kết luận self-check làm bằng chứng. Chạy exact-set, typecheck, production build và browser QA. A8 phát hành PASS/FAIL cùng finding list.

## WO-S9-F — A0 Lead

Sửa hoặc trả owner mọi finding, yêu cầu reviewer recheck, rồi tạo `RELEASE_MANIFEST.json`, `RELEASE_VERIFICATION.json`, `RELEASE_NOTES.md`, `GATE_REVIEW.md` và `STAGE10_HANDOFF.json`.

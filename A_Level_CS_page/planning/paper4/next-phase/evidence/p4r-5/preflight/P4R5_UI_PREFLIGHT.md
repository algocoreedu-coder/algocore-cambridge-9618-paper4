# P4R-5 UI/runtime preflight

**Decision:** `REWORK_REQUIRED_BEFORE_P4R5_GATE`. Khung App Router hiện giữ đúng 13 package, 26 slug và 10 section/bài, nhưng UI vẫn nối vào registry Stage 8/9 v1. Canonical v2 chưa đi qua renderer, scenario selector chưa đổi event sequence thật và code panel chưa render Python artifact đầy đủ theo stable line ID.

## Phạm vi và snapshot

- Audit read-only đối với app/runtime; chỉ hai file evidence này được tạo.
- Repository: `codex/paper4-recovery-v2`
- Snapshot HEAD lúc kiểm kê: `3cc65a93bb59c46d3981454988ace74109bcc2cd`
- Không chạy dev server, không sửa app và không rebuild generated registry.
- Các thay đổi chưa commit đang có trong worktree thuộc workstream khác, không nằm trong audit này.

`AGENTS.md` yêu cầu đọc tài liệu đi kèm đúng phiên bản Next trước khi sửa code. Preflight đã đọc tài liệu trong `node_modules/next/dist/docs/` của Next `16.3.5`:

- `01-app/01-getting-started/02-project-structure.md`
- `01-app/01-getting-started/03-layouts-and-pages.md`
- `01-app/01-getting-started/04-linking-and-navigating.md`
- `01-app/01-getting-started/05-server-and-client-components.md`
- `01-app/02-guides/internationalization.md`
- `01-app/02-guides/lazy-loading.md`
- `01-app/02-guides/preserving-ui-state.md`
- `01-app/02-guides/production-checklist.md`
- `01-app/03-api-reference/03-file-conventions/dynamic-routes.md`
- `01-app/03-api-reference/04-functions/generate-static-params.md`

Các điểm áp dụng: `params`/`searchParams` là Promise trong App Router hiện tại; `generateStaticParams()` kết hợp `dynamicParams = false` là contract đúng cho 26 slug; dữ liệu truyền từ Server Component sang Client Component được serialize nên không được truyền toàn registry; state của layout/client component có thể được giữ khi navigation không remount boundary, nhưng phải có browser test cho query locale và hash.

## Kiểm kê hiện trạng

| Hạng mục | Hiện trạng | Kết luận cho v2 |
|---|---:|---|
| Package / lesson / block | 13 / 26 / 260 | Giữ nguyên; mỗi lesson có đúng 10 canonical block kind. |
| URL ngôn ngữ | 26 slug × `?lang=vi|en` | Contract là 52 URL variant; path tĩnh thực tế vẫn là 26. |
| Invalid slug | `dynamicParams = false` + `notFound()` | Khung đúng; phải kiểm production server trả 404. |
| Learning registry v1 | 873,719 byte | `stage9-learning-pages.json` vẫn do override chain placeholder/R2/R3 tạo. |
| Runtime registry v1 | 4,932,709 byte | Bị import nguyên khối ở hub; không đạt kiến trúc partition/lazy-load. |
| Pattern / scenario / event v1 | 58 / 174 / 331 | 58/58 pattern dùng cùng event IDs cho cả ba scenario. |
| Canonical visual v2 hiện có | 58 / 174 / 589 | Raw per-pattern chunk lớn nhất khoảng 52,403 byte, phù hợp budget 150 KB nếu compiler chỉ public field an toàn. |
| Python trên learning page v1 | 26/26 có snippet | Chỉ khoảng 10–58 dòng được lặp cho VI/EN; chưa phải full source từ `PythonArtifact.lines`. |
| Code panel visual | `event.code_lines[]` | Đang hiển thị contract token như `algorithm-translate.step.contract`; không có full source hay highlight line ID. |
| Runtime a11y cơ bản | progressbar, live region, labels | Canonical `accessibility`/focus order chưa có trong type hoặc renderer; Change Input không đưa focus đến target đã đặc tả. |

Hash baseline quan trọng:

| File | SHA-256 |
|---|---|
| `app/data/stage8-runtime-registry.json` | `4a5a9b154d2b1de8197d42c7c900e2cd738238ddaddac9842ccd40246e2ffc34` |
| `app/data/stage9-learning-pages.json` | `e06dcb3781d4a52bc50770acb92547501e0da02a09fc2885c3a2c174e3554867` |
| `app/components/paper4-visual/Paper4VisualRuntime.tsx` | `b3e91304755d504436b8b7462e1fbdf8b8e225e784b10453ba2ced3e564e540b` |
| `scripts/build-stage9-lessons.mjs` | `5e44cbc7f8796326e544be881612835085c3077c54ac42a0aca2107e96c6bb8d` |

## Blocker phải xử lý

### P0 — Canonical v2 chưa được app import

`app/paper-4/layout.tsx`, `app/paper-4/page.tsx` và `app/paper-4/lessons/[slug]/page.tsx` vẫn import trực tiếp `stage9-learning-pages.json`; hub và lesson route còn import `stage8-runtime-registry.json`. `scripts/build-stage9-lessons.mjs` đọc placeholder, support, R2, R3, Python remediation và Stage 6 wave rồi overlay theo thứ tự. Đây là đúng override chain mà P4R-5 yêu cầu loại bỏ.

### P0 — Change Input không đổi trace

`Paper4VisualRuntime.tsx` luôn lấy `event`, `nextEvent`, event count và trace list từ `pattern.events`. `activeScenario` chỉ dùng để gắn metadata. Reducer `CHANGE_INPUT` chỉ lưu scenario ID và reset index. Vì v1 còn cho ba scenario cùng một `event_ids[]`, normal/boundary/failure hiện không thể đổi code/state/output theo evidence.

### P0 — Python UI chưa chứng minh code đã chạy

Learning renderer có semantic `<pre><code>` nhưng chỉ render field `python|code|pseudocode` của registry v1. Visual code panel chỉ render token trong `event.code_lines`; runtime type không mang `python_artifact_id`, artifact version, full `lines[]`, `active_line_ids[]` hoặc source hash. Không thể kiểm code hiển thị trùng code đã chạy.

### P1 — Hub serialize registry quá lớn

Hub truyền registry 4.93 MB vào Client Component. Baseline audit đã đo dev HTML khoảng 2.04 MB. Ba pattern v1 vượt budget 150 KB nếu tách nguyên trạng: `HASH_INSERT` 417,918 byte, `HASH_SEARCH` 218,577 byte và `HASH_SETUP` 182,762 byte. Canonical v2 đã gọn hơn, nhưng vẫn phải compile thành metadata hub và trace chunk tách biệt.

### P1 — Contract a11y/focus bị rơi

Canonical event có bilingual announcement/action và focus target/order. `VisualEvent` hiện không khai báo trường này; UI dùng copy chung, không phát announcement đặc tả theo event và không phục hồi focus sau scenario/pattern change. Browser QA phải kiểm keyboard, focus, screen reader, reduced motion, 320 px và 400% zoom.

### P1 — Locale có hai state độc lập

Locale trang nằm ở query/header/AppProviders; locale Visual Runtime nằm trong reducer. `LocaleBoundary` đồng bộ bằng cách tìm rồi click nút runtime. Cách này giữ event index trong trường hợp component không remount, nhưng chưa có contract test cho scenario, event, hash và code identity qua VI↔EN. P4R-5 phải dùng một locale source rõ ràng và giữ nguyên canonical code/state.

### P1 — Verifier v1 xác nhận hành vi cần loại bỏ

`verify-stage8-registry.mjs` hiện yêu cầu mỗi scenario chứa toàn bộ `pattern.events`, còn `verify-stage8-reducer.mjs` chỉ xác nhận input value/reset index. Hai verifier phải được supersede bằng exact scenario-trace checks; nếu giữ nguyên chúng sẽ cho PASS đối với hành vi sai của v2.

## Kiến trúc đích và file ownership

Compiler v2 phải là nguồn duy nhất tạo DTO public từ bảy canonical artifact envelope. Generated output không được author trực tiếp.

### Tạo mới

| File/nhóm file | Trách nhiệm |
|---|---|
| `scripts/build-paper4-v2-app-registry.mjs` | Compile canonical records thành public DTO deterministic; exact-set và authority filtering ở build boundary. |
| `scripts/check-paper4-v2-app-registry.mjs` | Read-only schema/join/source-safety/determinism check. |
| `scripts/check-paper4-v2-payload.mjs` | Đo raw bytes của hub/client metadata và từng trace chunk; fail khi vượt budget. |
| `scripts/check-paper4-v2-routes.mjs` | Kiểm 26 slug × 2 locale và invalid slug contract trên production server ở P4R-6. |
| `app/data/paper4-v2/course-manifest.json` | Chỉ metadata 13 package, 26 lesson, 58 pattern cho layout/hub. |
| `app/data/paper4-v2/lesson-loaders.generated.ts` | Static loader map 26 slug để route chỉ import đúng lesson DTO. |
| `app/data/paper4-v2/lessons/<slug>.json` | Theory, full Python artifact, tests, marking/error, practice, retrieval và source refs của một lesson. |
| `public/paper4-v2/traces/<pattern-id>.json` | Public-safe scenario-specific trace chunk lazy-load; không chứa local path hoặc internal-only locator. |
| `app/components/paper4-learning/PythonArtifact.tsx` | Render toàn bộ source theo `lines[]`, stable `line_id`, selection/copy và active-line state. |
| `app/components/paper4-visual/traceLoader.ts` | Fetch/cache/validate một pattern chunk khi Action View được mở hoặc pattern được chọn. |

Tên output có thể đổi nếu A4 đã khóa tên khác, nhưng boundary phải giữ: hub metadata, per-lesson DTO và per-pattern trace chunk là ba artifact riêng.

### Sửa bắt buộc

| File | Thay đổi cần làm |
|---|---|
| `app/paper-4/layout.tsx` | Dùng course manifest v2; bỏ import Stage 9 v1; giữ 13 package/26 link và truyền locale hiện tại vào sidebar URL. |
| `app/paper-4/page.tsx` | Không import full runtime; render metrics v2 (`58/174/589`) từ manifest; Visual Lab chỉ nhận pattern metadata và lazy-load selected chunk. |
| `app/paper-4/lessons/[slug]/page.tsx` | `generateStaticParams()` từ manifest; load đúng một lesson DTO; không import full Stage 8 registry; giữ `dynamicParams=false`. |
| `app/components/paper4-learning/types.ts` | Thay loose recursive map bằng typed Knowledge/Python/Test/Marking/Practice/Retrieval/Source DTO; tách owned pattern khỏi approved representational association. |
| `app/components/paper4-learning/LessonLearningPage.tsx` | Render 10 section bằng typed component; full Python một lần, tests/evidence/marking chain rõ authority; Action View dùng metadata + loader. |
| `app/components/paper4-learning/LocaleBoundary.tsx` và `app/AppProviders.tsx` | Đồng bộ query locale mà không click DOM; giữ slug/hash/scenario/event; document language đúng. |
| `app/components/paper4-visual/types.ts` | Thêm artifact/version/source hash, full lines, scenario event IDs, active line IDs và accessibility/focus contract. |
| `app/components/paper4-visual/Paper4VisualRuntime.tsx` | Derive events từ active scenario; lazy load; render full code và highlight; dùng event-specific announcement/focus; loading/error state. |
| `app/components/paper4-visual/reducer.ts` | State phải gồm loaded pattern/scenario và event ID/index; Change Input chọn sequence mới rồi reset atomically; locale không đổi trace. |
| `app/components/paper4-visual/registry-contract.typecheck.ts` | Typecheck manifest/lesson/chunk v2 thay vì import registry v1 4.93 MB. |
| `app/components/paper4-learning/*.module.css`, `app/components/paper4-visual/*.module.css` | Full-source overflow, active-line contrast, keyboard focus, 320 px, 400% zoom và reduced motion. |
| `app/data/stage9-source-authorities.ts`, `SourceReferences.tsx` | Giữ whitelist HTTPS và locator-as-text; nhận DTO v2, chặn local path trong public output. |
| `package.json` | Thêm generate/check/payload/typecheck/build aggregate v2; không để `check:*` ghi source/generated tree. |

### Supersede khỏi runtime/release path

- `app/data/stage8-runtime-registry.json`
- `app/data/stage9-learning-pages.json`
- `scripts/build-stage8-registry.mjs`
- `scripts/build-stage9-lessons.mjs`
- `scripts/verify-stage8-registry.mjs`
- `scripts/verify-stage8-reducer.mjs`
- `scripts/verify-stage9-lessons.mjs`
- `scripts/verify-stage9-pedagogy.mjs`

Các file v1 có thể giữ làm historical evidence, nhưng production imports và release verifier v2 phải có **0 reference** đến chúng.

## Acceptance checklist P4R-5/P4R-6

### Canonical compiler

- [ ] Rebuild hai lần byte-identical; `check:*` chạy hai lần không đổi source/generated tree.
- [ ] Exact 13 package, 26 lesson, 58 official pattern, 10 section/lesson; không duplicate/orphan ID.
- [ ] 108 KnowledgeUnit, 26 PythonArtifact, 174 VisualScenarioTrace, 589 VisualEventBinding, 58 MarkingChain, 78 AssessmentItem và 26 LessonReleaseRecord join đúng.
- [ ] Sáu lesson association giới hạn dùng AlgoCore representational rubric; không nhận ownership/official mark từ pattern liên kết.
- [ ] Public DTO không có drive path, repository path, `file://`, internal absolute locator hoặc URL ngoài chưa xác minh.

### 52 URL variants

- [ ] Mỗi slug trả 200 với `?lang=vi` và `?lang=en`; tổng 52/52.
- [ ] Mỗi URL có đúng 10 section/anchor, title/description/`lang`/canonical/hreflang đúng locale.
- [ ] Mỗi URL có source, theory, full Python, tests, trace hoặc approved static support, marking/error, practice và retrieval.
- [ ] Slug không thuộc exact set trả 404 ở production server.
- [ ] Previous/next/sidebar/source link giữ locale; hash anchor còn nguyên khi đổi locale.

### Full Python và line highlight

- [ ] 26/26 lesson render toàn bộ `PythonArtifact.lines` theo đúng thứ tự; visible text hash trùng `code_sha256`/source đã chạy.
- [ ] VI và EN dùng cùng source, line IDs, fixtures và expected outputs; đổi locale không đổi code.
- [ ] Mỗi event chỉ tham chiếu line ID tồn tại trong đúng artifact version.
- [ ] Active line có semantic state (`aria-current` hoặc tương đương), visual contrast và không làm mất khả năng select/copy code.
- [ ] Không contract token `*.step.contract`, Stage ID hoặc line pseudo-ID xuất hiện như source Python.

### Scenario-specific runtime

- [ ] 58/58 pattern và 174/174 scenario load đúng chunk; event sequence bằng chính xác `VisualScenarioTrace.event_ids`.
- [ ] Change Input đổi event/code/state/output khi evidence khác; equivalence chỉ được dùng khi canonical trace có justification.
- [ ] Scenario change reset event/prediction/output atomically và đưa focus theo accessibility contract.
- [ ] Network/error/loading state có fallback đọc được; không fetch toàn bộ 58 trace khi mở hub/lesson.

### Locale và accessibility

- [ ] VI↔EN giữ lesson, anchor, selected pattern, selected scenario và current event; code/state identity không đổi.
- [ ] Keyboard dùng được toàn bộ pattern/scenario/event/reveal controls; focus visible và thứ tự hợp lý.
- [ ] Live region đọc event-specific bilingual announcement, state delta và completion; label/action không chỉ là ID kỹ thuật.
- [ ] `prefers-reduced-motion`, 320 px, 400% zoom, light/dark và no-horizontal-page-overflow PASS.
- [ ] Axe automated scan không có required finding; code selection/copy PASS.

### Payload, typecheck và build

- [ ] Hub initial HTML `< 250 KB` uncompressed.
- [ ] Initial client data `< 300 KB` uncompressed.
- [ ] Mỗi per-pattern trace chunk `< 150 KB` uncompressed.
- [ ] Không có full 4.93 MB registry trong hub client payload hoặc RSC response.
- [ ] Node 22 `npm ci`, `npm run typecheck` và `npm run build` PASS từ clean checkout.
- [ ] Production-server route/browser run không có console error, hydration warning hoặc failed chunk request.

## Thứ tự implementation đề xuất

1. A4 khóa DTO/compiler và generated partition; chạy exact-set, source-safety, determinism và payload check.
2. A5 cập nhật runtime type/reducer/trace loader/Python renderer; unit test scenario change và line binding trước UI polish.
3. App integrator chuyển layout, hub và dynamic lesson route sang v2; xóa toàn bộ production import v1.
4. A6 kiểm locale/a11y/responsive; A7 kiểm theory→code→trace→marking→practice; author sửa finding.
5. Lead chạy typecheck/build và đóng self-check, sau đó A8 chạy clean-room/production-server matrix độc lập.

Preflight này không đóng P4R-5. Nó xác nhận route shell có thể tái sử dụng và khóa các thay đổi tối thiểu cần thiết để canonical v2 thực sự xuất hiện trước người học.

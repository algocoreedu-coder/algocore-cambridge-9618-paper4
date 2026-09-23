# Recovery master plan — `paper4-2026-s9-v2`

## Definition of done

Bản v2 chỉ được release khi:

- 108/108 knowledge block Stage 3 có disposition và tất cả mục `publish` đã xuất hiện trong lesson tương ứng.
- 26/26 lesson có direct syllabus objective và coursebook section/page refs ở knowledge layer.
- 26/26 lesson có ít nhất một `PythonArtifact` hoàn chỉnh; tất cả artifact parse và chạy qua fixture đã freeze; author run và independent rerun khớp.
- 58/58 visual pattern có normal/boundary/failure scenario được disposition; scenario cần khác hành vi phải có trace/event set riêng, scenario tương đương phải có justification rõ.
- 58/58 pattern có MarkingChain được review; 2.236 marking atoms, 107 assessment requirements và 37 destinations có disposition.
- Mọi event code highlight trỏ tới line ID tồn tại trong đúng Python artifact version; code panel không hiển thị contract ID như source code.
- 52/52 lesson route VI/EN render đủ source, theory, code, trace, tests, marking/error, practice và retrieval; locale switch không đổi code/state.
- Typecheck, clean `npm ci`, production build, deterministic registry checks, accessibility/browser matrix và A8 clean-room QA đều PASS.
- Workspace có version-control baseline, replacement manifest, detached verifier và rollback target.

## Critical path

### P4R-0 — Governance và input lock

1. Tạo repository/baseline commit cho app và planning hoặc ghi rõ repository boundary được quản lý.
2. Freeze hash: Stage 0 contract, Stage 3 lesson packages, Stage 4 release, Stage 5 release, Stage 6–8 manifests, post-release audit và current app registries.
3. Tạo exact-set inventory cho 108 knowledge block, 26 lesson, 58 pattern, 174 scenario, 331 event, 2.236 marking atoms, 107 assessment requirements, 37 destinations và 26 Python artifact mục tiêu.
4. Khóa quyền ghi theo batch và reviewer độc lập.

**Gate P4R-0:** input hash đầy đủ; working tree reviewable; denominator exact; không sửa source release cũ.

### P4R-1 — Canonical schema và mapping

1. Implement schema trong `SCHEMA_CONTRACTS.md`.
2. Lập `KNOWLEDGE_DISPOSITION.json` cho 108/108 block: `publish`, `merge`, `prerequisite-link` hoặc `exclude-with-authority`.
3. Lập `LESSON_SOURCE_MAP.json`: objective IDs, syllabus locator, book section và trang in/PDF.
4. Lập `PYTHON_EXECUTION_MAP.json`: mỗi lesson → Stage 5 artifact hoặc `RERUN_REQUIRED`.
5. Lập `VISUAL_BINDING_MAP.json`: pattern/scenario/event → Python artifact/line IDs/trace.
6. Lập `MARKING_ASSESSMENT_MAP.json`: 58 pattern → requirement/method/error/marking chain; 2.236 atoms và 107 requirements có disposition.

**Gate P4R-1:** schema validation PASS; 108/108, 26/26, 58/58 exact; không locator mơ hồ; Lead và A8 đồng ý pilot.

### P4R-2 — Pilot end-to-end

Pilot gồm `data-models`, `binary-search`, `queue`, `recursion`, `hashing`, `object-files` để bao phủ theory foundation, loop/branch/not-found, circular pointers, call frames, collision/probing và file/exception paths.

Mỗi bài đi hết chuỗi map → author theory → Python artifact → run/rerun → visual line binding → VI/EN → browser QA. Không mở mass production nếu một trong bốn bài còn workaround riêng hoặc schema không dùng lại được.

**Gate P4R-2:** 6/6 bài PASS toàn bộ gate; schema không cần exception; Lead yêu cầu sửa và rerun nếu bất kỳ reviewer nào mở finding bắt buộc.

### P4R-3 — Sản xuất nội dung theo batch

Chạy bảy batch trong `BATCH_PLAN.json`. Mỗi batch có owner riêng, không cùng sửa canonical file. Agent author ghi batch artifact; Registry agent chỉ merge batch đã có reviewer PASS.

Trình tự trong mỗi batch:

1. A1 khóa source map và disposition.
2. A2 biên soạn theory/method VI/EN.
3. A3 tạo/freeze Python artifact, fixture, output và execution evidence.
4. A7 kiểm exam method, marking, misconception, practice/retrieval.
5. A6 kiểm bilingual/accessibility ở content layer.
6. Lead kiểm exact denominator và trả rework trước merge.

**Gate P4R-3:** 26/26 lesson, 108/108 knowledge disposition, 26/26 verified Python, 58/58 MarkingChain, 107/107 requirement và 37/37 destination disposition; required findings bằng 0.

### P4R-4 — Visual/event reconstruction

1. A5 tạo ba scenario trace theo Stage 5 evidence hoặc justification nếu hai scenario thực sự dùng cùng path.
2. Thêm stable `line_id` vào Python artifact; event chỉ tham chiếu ID tồn tại.
3. Registry Stage 8 v2 lưu event IDs theo từng scenario thay vì một flat pattern event stream.
4. Runtime chọn event sequence từ active scenario; Change Input reset đúng trace/state/output.
5. Code panel render source thật và highlight active lines.
6. Partition runtime theo pattern/lesson; hub chỉ tải metadata, trace được lazy-load.

**Gate P4R-4:** 58/58 pattern disposition; 174/174 scenario hợp lệ; 331 legacy event có migration disposition; 0 vocabulary/type mismatch; không contract token xuất hiện như code; normal/boundary/failure browser tests PASS; payload nằm trong budget được Lead phê duyệt.

### P4R-5 — Canonical registry và app integration

1. Thay chuỗi placeholder/R2/R3 override bằng một canonical authored input directory và deterministic compiler.
2. Renderer dùng typed components cho Knowledge, Code, Trace, Test, Evidence và Source.
3. Add source/evidence links an toàn, không lộ local filesystem path.
4. Preserve 13 package, 26 slug, 10 canonical sections, navigation và locale state.

**Gate P4R-5:** exact set PASS; no orphan/duplicate; 52/52 route; invalid slug 404; typecheck/build PASS.

### P4R-6 — Learner-visible QA

A6 chạy keyboard, 320 px, 400% zoom, light/dark, reduced motion, code selection/copy, axe và screen-reader labels. A7 kiểm mỗi bài từ góc nhìn học sinh: nhận diện → lý thuyết → code → trace → tránh mất điểm → luyện → nhớ lại. A8 chạy clean-room trên checkout sạch và production server.

**Gate P4R-6:** browser matrix 13 package × 2 locale; pilot plus risk-based deep checks; zero console error; required findings bằng 0.

### P4R-7 — Replacement release

1. Pin Node 22; chạy `npm ci`, full verifier và production build trong checkout sạch.
2. Tạo manifest `paper4-2026-s9-v2`, SBOM/dependency snapshot tối thiểu, detached verification và release notes.
3. Ghi supersession chain v1 → v2 và rollback target.
4. Lead double-check, sau đó A8 độc lập ký recommendation; Lead ký release sau cùng.

## Điều không được dùng để đóng gate

- Đếm đủ 260 block mà không kiểm nội dung bên trong.
- Code parse được nhưng không có run/rerun/output evidence.
- Ba scenario có ba nhãn nhưng dùng cùng trace/event set mà không justification.
- Đo độ sâu chỉ bằng số ký tự.
- Build PASS thay cho academic, bilingual hoặc browser review.
- Owner tự đóng finding của chính mình.
- Verifier vừa kiểm vừa ghi đè generated artifact; bước generate và bước check phải tách riêng.

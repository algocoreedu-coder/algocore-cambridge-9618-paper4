# Lead playbook — Paper 1 Stage 2

Version 1.1. Owner A0. Date 22/09/2026. State: **PLAN_READY — A9 RETEST PASS — NOT_STARTED**.

## 1. Kết quả cần đạt

Stage 2 tạo một hệ thống traceability có thể kiểm máy và kiểm nguồn:

`syllabus 2026 → atomic requirement → planned learning unit → assessment unit → pattern → marking evidence → QP/MS locator`.

Đầu ra bắt buộc gồm objective/requirement register, coursebook map, prerequisite graph, learning map, assessment-unit index, pattern catalog, marking evidence map, variant relation register, split/holdout decision, glossary seed, coverage matrix, gap/unresolved registers, manifest và integrity report.

Stage 2 chỉ chứng minh **planned coverage**. Không được gọi objective là đã dạy, không viết prompt/solution/rubric hoàn chỉnh, không dịch lesson, không sửa app và không công bố website.

## 2. Invariant đầu vào

Lead phải rehash trước khi dispatch. Nếu một pin lệch, dừng gói phụ thuộc và xác định artifact/version mới; không tự chấp nhận drift.

| Authority path, relative to workspace | Bytes | SHA256 hiện hành |
|---|---:|---|
| `A_Level_CS_page/planning/paper1/stage-0/SCOPE_AND_COVERAGE_PLAN.md` v1.0.1 | 5,751 | `1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb` |
| `A_Level_CS_page/planning/paper1/stage-0/evidence/a3/SYLLABUS_SCOPE.md` | 8,228 | `87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c` |
| `A_Level_CS_page/planning/paper1/stage-0/evidence/a3/COVERAGE_PLAN.md` — 99 parents | 17,815 | `178a39a20790bd14ace7acf78d44fed4a43d4aa13f69e3ea035889f0e8c1a305` |
| `A_Level_CS_page/planning/paper1/stage-0/evidence/a3/PILOT_SCOPE_CHECK.md` | 6,381 | `619a575cfaa3c3a516b192e0f32f8fe8b55b18fa0230285ac9442ccc64e0905a` |
| `A_Level_CS_page/planning/paper1/stage-0/LEARNING_PAGE_CONTRACT.md` | 8,781 | `95008f7fbab736368010b14994ee3d6a4d9f14b319dba8f0c8fcb8ed6a37fee3` |
| `A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json` | 121,886 | `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c` |
| `697372-2026-syllabus.pdf` | 746,673 | `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470` |
| `dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf` | 20,003,507 | `0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1` |
| `A_Level_CS_page/planning/paper1/stage-1/CORPUS_INDEX.jsonl` | 2,328,319 | `9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d` |
| `A_Level_CS_page/planning/paper1/stage-1/CORPUS_MANIFEST.json` | 6,751 | `0c053152796cd539a833d8a91dbdf2954539e413824f9b961b5f522047076e0a` |
| `A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md` | 3,675 | `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f` |
| `A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md` | 2,535 | `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2` |
| `A_Level_CS_page/planning/paper1/stage-1/UNRESOLVED_REGISTER.md` | 5,511 | `35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0` |
| `A_Level_CS_page/planning/paper1/stage-1/FINAL_INTEGRITY_CHECK.json` | 4,826 | `1f81e4a20a3fe99f48d67b4aaec927d54b89213c3d3f174aed6e693f2f455e2d` |
| `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/FINAL_REVIEW_REPORT.md` | 4,457 | `d3fac5ec05428056f43845143c4ed407b3e94956d6c772b687d48230616ef14c` |
| `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/FINAL_MACHINE_CHECKS.json` | 24,922 | `54049c6320733afb56782b0efa8884340786db5b5c9678153ce6a78d448742c4` |
| `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/HANDOFF_FINAL.json` | 7,510 | `710d78b46663ecbbbdcfd570167be3cf95c2b7636d7315b2414e333d501c3384` |
| `A_Level_CS_page/planning/paper1/stage-1/evidence/a0/final/A9_FINAL_V2_HANDOFF_AUDIT.json` | 3,742 | `8dd1b75189aa0c7967f00a2f8d6cfef1a63c5df2f83443fc689597bf58689ba5` |
| `A_Level_CS_page/planning/paper1/stage-1/evidence/a0/final/STAGE1_GATE_DECISION.json` | 2,384 | `43b794f3fd5850332ab6d0f6bfed883586a365f0357744a485eea6869f8b61ed` |

`INPUT_BASELINE.json` phải ghi path, bytes và full SHA256 cho từng row. A0 kiểm trực tiếp A9 report/machine-check hashes và kiểm chúng cũng trùng các pin trong handoff, không chỉ tin chuỗi transitive.

Các số phải được validator tái tạo từ corpus, không copy mù từ kế hoạch:

- 247 question roots + 1.025 parts.
- 893 atomic assessment units = 875 leaf parts + 18 whole questions không có child.
- 379 non-scoring containers = 229 question roots có child + 150 parent parts.
- 893/893 atomic units có đúng một marking target; tổng 2.250 marks = 30 × 75.
- 927 marking rows = 893 scoring links + 34 B21 parent-context rows.
- 128 unresolved = 94 parent/context records + 34 parent-context marking rows.
- Chỉ 233/1.272 question/part records có command word đã extract; null không có nghĩa là câu không có command word.

## 3. Quy tắc học thuật

Syllabus 2026 quyết định scope; QP/MS chứng minh lịch sử câu hỏi và cách chấm; coursebook hỗ trợ giải thích. Không dùng tần suất 2021–2025 để loại objective hoặc dự báo đề. `AC26-*` là ID AlgoCore, không phải mã Cambridge.

Mỗi required atomic requirement phải có planned learning unit và một trong hai assessment disposition: official evidence đã review, hoặc `ORIGINAL_ASSESSMENT_BRIEF_PLANNED`. Brief tự soạn chỉ mô tả kỹ năng, dữ kiện, response product và authority dự kiến; Stage 2 chưa viết câu hay đáp án.

Unresolved parent được dùng làm context cho child, nhưng không được thành assessment unit, marking point, frequency occurrence hoặc independent mark. Mọi claim chính thức phải quay về record và locator đã nghiệm thu.

## 4. Chu kỳ điều phối

Giữ tối đa ba worker ngoài Lead. Worker không spawn agent. Mỗi handoff phải đóng băng version và hash trước review.

### C0 — A0 bootstrap

A0 rehash authority, tạo `INPUT_BASELINE.json`, schema, validator skeleton, board và work order packet. Không sửa Stage 0/1. C0 dừng tại packet freeze.

### C1 — Foundation và calibration

Chạy tối đa ba gói:

1. A3 tạo 99 parent objectives, atomic requirement checklist, coursebook evidence map, prerequisite graph và provisional learning-unit clusters.
2. A4 tạo taxonomy calibration trên mẫu phân tầng gồm text/table/visual và ba pilot; A4 không classify toàn corpus trước calibration review.
3. A6 tạo glossary/command-word seed v1 chỉ từ authority đã freeze; các trường objective/pattern để rỗng và ghi `PENDING_RECONCILIATION`. Đây không phải dịch lesson.

A4 review foundation A3; A3 review calibration A4; A3/A4 review glossary theo chuyên môn. A9 review/retest contract C1 trước khi mở batch mapping.

### C2 — Mapping năm thi

Phát hành năm gói `B21`–`B25` trên đúng accepted candidate. Chạy tối đa ba gói một lúc. Mỗi A4 author ghi vùng riêng và tạo atomic map, container map, marking evidence map, unresolved disposition, QA và handoff.

Mỗi batch cần hai review độc lập: A3 kiểm scope/objective/context; một A4 reviewer khác tác giả kiểm pattern/marking. Với unit `IN_SCOPE`, `PARTIAL` hoặc `SUPPORTING`, requirement mapping là bắt buộc. Unit `OUT_OF_SCOPE` hoặc `NEEDS_REVIEW` được để mapping rỗng khi có source-backed rationale và quarantine; không ép gán AC26. A9 thực hiện risk review hoặc final review theo work order. Finding phải quay đúng owner, version mới và retest cùng version.

### C3a — Question bank và provisional patterns

Sau khi năm batch PASS, một A4 integrator tạo question bank và provisional pattern definitions. `distinct_equivalence_group_count` phải là null/PENDING trong bản này; không freeze frequency theo group trước equivalence.

### C3b — Variant equivalence

Một A4 author **bắt buộc khác** C3a author tạo candidate-pair universe bằng nhiều recall channels và review mọi candidate. Candidate generation phải gồm ít nhất: deterministic normalized prompt fingerprints; same-session cross-component pairs; shared primary requirement + response product + marks/stimulus signature; MS structural signature; và text/structure similarity. Mọi likely pair chưa review bị quarantine.

A9 review 100% positive/unresolved relations, tái chạy candidate generation và audit mẫu phân tầng từ rejected-pair complement. Nếu mẫu phát hiện false negative, owner mở rộng blocking rules, tái tạo universe và review lại; không freeze split.

### C3c — Final pattern và glossary reconciliation

Sau equivalence PASS, C3a owner phát hành pattern catalog final với raw occurrence, distinct paper và distinct equivalence-group counts được rebuild từ frozen groups. A6 phát hành glossary v2 từ objective foundation + final patterns, giữ history v1. A3/A4 review riêng các artifact không do mình viết; A9 review/retest trước C4.

### C4a — Split và holdout

A2/A4 lập split/holdout ở cấp connected component sau equivalence và final pattern freeze. Positive/unresolved relations và mọi unreviewed likely pair phải ở cùng split hoặc `QUARANTINE`. Holdout chỉ là procedural isolation vì workspace dùng chung; nếu không giữ được author isolation, ghi `CONTROLLED_CHECK` hoặc `MIXED_PRACTICE`, không quảng bá đo tiến bộ độc lập.

### C4b — Coverage và learning map

Chỉ sau C4a PASS, A3 tích hợp objective ↔ learning unit ↔ final assessment/pattern + glossary v2 + split decision và gap register. TRACE không được dispatch khi split handoff chưa được A0 audit/accept.

### C4c — A0 integration

Sau C4a và C4b PASS, A0 tạo top-level Stage 2 artifacts, manifest, summary và integrity check.

### C5 — A9 final và gate

Giao một A9 mới, không là tác giả artifact Stage 2, chỉ ghi `stage-2/evidence/a9/final-v1/`. A9 review input drift, schema, counts, traceability, sample nguồn và scope boundaries. A9 dừng sau handoff; không sửa artifact hay đóng gate.

A0 rehash toàn bộ handoff, chạy lại validator, đọc findings rồi quyết định `PASS` hoặc `CHANGES_REQUIRED`. Sau quyết định, dừng mọi agent, cập nhật tracker thành `WAITING_FOR_USER_STAGE_CHECK` và không dispatch Stage 3.

## 5. Variant và holdout

Variant relation dùng: `DUPLICATE`, `PARALLEL_EQUIVALENT`, `RELATED_NOT_EQUIVALENT`, `DISTINCT`, `UNRESOLVED`. Equivalence đòi cùng construct/objective, response demand, dependency/stimulus semantics, marks và marking conditions sau khi xem cả QP và MS. Không gộp chỉ vì cùng component, chủ đề hoặc text similarity. `CANDIDATE_PAIR_UNIVERSE` phải lưu full pair key, generation channels và review disposition; complement audit phải có seed/method/sample size/result để tái lập.

Split assignment diễn ra ở connected-component level. Mọi candidate-equivalence chưa giải quyết hoặc likely pair chưa review bị quarantine. Leakage result chỉ được mô tả là “không có detected/reviewed cross-split relation theo candidate-universe và complement audit đã ghi”; không tuyên bố chứng minh mọi cặp có thể có. A5 tương lai chỉ nhận `AUTHOR_ALLOWLIST`; A4/A9 được xem holdout để kiểm. Nếu không đủ whole-paper/independent evidence hoặc false-negative audit chưa đạt, quyết định trung thực là không có blind holdout.

## 6. Review, sửa và ownership

A0 sở hữu top-level integration. A3 sở hữu objective/book/prerequisite artifacts. Mỗi A4 batch author chỉ sở hữu batch của mình. C3b equivalence author bắt buộc khác C3a/C3c pattern author; batch review cũng bắt buộc khác batch author. A6 sở hữu glossary v1/v2. A2/A4 sở hữu split proposal nhưng không được là equivalence author. A9 chỉ review.

Không sửa chéo artifact để “đóng nhanh”. Critical/Major chặn gói phụ thuộc. Minor chỉ defer khi không vi phạm DoD và A0 ghi tác động. Đổi source mapping, objective, pattern, equivalence hoặc split làm stale mọi review phụ thuộc.

## 7. Gate Stage 2

PASS chỉ khi tất cả điều sau có bằng chứng:

- Input không drift; 99/99 parent objective groups hiện diện và atomic checklist không cộng trùng.
- Mọi required atomic requirement có planned teaching và assessment destination.
- Đúng 893 assessment units và 379 containers xuất hiện đúng một lần; 893 marking targets resolve; 2.250 marks và 30 totals khớp.
- Đúng 128 unresolved được giữ, không có marking claim mới từ parent/context.
- Prerequisite `HARD` không cycle; learning sequence là topological order hợp lệ.
- Pattern có evidence; singleton/gap minh bạch; raw count, distinct paper và distinct equivalence-group count tách riêng.
- Candidate-pair universe/rejected-complement audit đạt; không có detected/reviewed positive, unresolved hoặc unreviewed-likely relation cắt qua split; holdout decision trung thực về giới hạn false negative.
- Coursebook locator đã đọc hoặc ghi `NO_VERIFIED_BOOK_SUPPORT`; 78 derived files không làm authority.
- Glossary seed có source/boundary/review; không claim parity bài học.
- Không còn Critical/Major; A9 final PASS; A0 audit PASS.

Gate không chứng minh lesson, solution, VI/EN parity, visual, app hoặc publication đã hoàn thành.

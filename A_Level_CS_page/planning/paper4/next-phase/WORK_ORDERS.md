# Work orders

## A0 — Lead / Tổng biên tập

Khóa input, mở/đóng wave, phân ownership theo batch, kiểm denominator, source authority và cross-artifact joins. Sau mỗi gate, nếu có finding bắt buộc thì trả đúng owner và chỉ mở wave sau khi reviewer xác nhận lại. A0 không thay A8 ký độc lập.

**Output:** status, decision log, gate review, release manifest. **PASS:** mọi gate có evidence và zero required open findings.

## A1 — Curriculum/source mapper

Disposition 108 knowledge block; tạo syllabus/coursebook locator trực tiếp; map objective/book/pattern/lesson. Không author giải thích thay A2 và không suy diễn requirement Cambridge.

**Output:** `KNOWLEDGE_DISPOSITION.json`, `LESSON_SOURCE_MAP.json`. **PASS:** 108/108 exact, 26/26 lesson có nguồn, 107/107 objective disposition, locator resolver PASS.

## A2 — Theory and bilingual content author

Viết KnowledgeUnit và solution-method narrative theo source map. Bao gồm khái niệm, Python consequence, representation, invariant/rule, misconception, exam signal và micro-example. VI/EN cùng semantic content, thuật ngữ nhất quán.

**Output:** batch-owned `KNOWLEDGE_UNITS.json`, `METHOD_CONTENT.json`. **PASS:** A1 source QA, A6 language QA và A7 pedagogy review PASS; 108/108 unit publish/merge được thực thi.

## A3 — Python/execution engineer

Tạo first-class PythonArtifact, ưu tiên tái sử dụng Stage 5 implementation khi code hash khớp. Ví dụ thay đổi hoặc mới phải chạy author harness và independent rerun. Freeze fixture, raw output, trace và hashes.

**Output:** `PYTHON_ARTIFACTS.json`, source `.py`, fixtures, author run, independent rerun. **PASS:** parse/execute/output/trace exact; 26/26 execution joins; displayed source hash trùng artifact đã chạy.

## A4 — Registry/schema engineer

Implement validator/compiler từ canonical sources. Loại bỏ runtime dependence vào placeholder/R2/R3 override chain. Enforce exact sets, stable IDs, source safety và deterministic build. Tách `generate:*` khỏi read-only `check:*`; validate JSON tại build/import boundary.

**Output:** schemas, compiler, validators, generated registries. **PASS:** rebuild byte-identical; mutation/negative tests fail đúng chỗ.

## A5 — Visual/event engineer

Tạo scenario-specific traces và line binding. Nâng registry/runtime để active scenario quyết định event sequence; render full Python artifact và highlight active line IDs.

**Output:** `VISUAL_BINDING_MAP.json`, v2 runtime registry, partitioned trace chunks, runtime changes, reducer/browser tests. **PASS:** 58/58 pattern, 174/174 scenario; 0 vocabulary/type mismatch; không code contract token; scenario behavior đúng evidence; payload budget PASS.

## A6 — Language, accessibility and UX QA

Kiểm VI/EN parity, terminology, code identity, locale state, keyboard, focus, screen reader, 320 px, zoom, dark/light và reduced motion. A6 không sửa âm thầm finding của author.

**Output:** parity report, accessibility matrix, browser evidence. **PASS:** 52/52 route; zero required UX/localization findings.

## A7 — Paper 4 pedagogy and exam reviewer

Kiểm learner flow, theory/code connection, marking authority, error prevention, normal/boundary/failure reasoning, guided→faded→independent practice và retrieval. Chặn prose chung chung hoặc tips giả thành official marks. Disposition 2.236 marking atoms, 107 assessment requirements và 37 destinations; UI chỉ nhận representative chain có authority.

**Output:** `MARKING_ASSESSMENT_MAP.json`, per-batch pedagogy review và recheck. **PASS:** 58/58 MarkingChain, 2.236/2.236 atom disposition, 107/107 requirement, 37/37 destination, 78/78 practice item có stable ID; zero required findings.

## A8 — Independent clean-room QA

Chỉ nhận candidate đã được Lead đóng self-check. Checkout sạch, chạy exact-set, execution, visual, source, locale, accessibility và build verifiers. Không author hoặc tự sửa candidate.

**Output:** final QA JSON/MD, release recommendation. **PASS:** input hashes đúng, required findings bằng 0, recommendation `PASS`.

## Quy tắc ownership

- A2/A3/A5 chỉ ghi batch directory được giao.
- A4 là người duy nhất merge canonical registry sau reviewer PASS.
- A1 review source; A6 review language/UX; A7 review pedagogy; A8 review độc lập cuối.
- Lead trả rework bằng finding ID, expected fix và evidence cần thiết; không chấp nhận “đã xem bằng mắt” làm closure duy nhất.

from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path


S4 = Path(__file__).resolve().parents[1]
S3 = S4.parent / "stage-3"
SOURCE = S3 / "LESSON_PACKAGES.json"
OUT = S4 / "ASSESSMENT_DESIGN_BRIEFS.json"
OUT_MD = S4 / "ASSESSMENT_DESIGN_BRIEFS.md"
VALIDATION = S4 / "evidence" / "ASSESSMENT_DESIGN_VALIDATION.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def unique(items):
    return list(dict.fromkeys(x for x in items if x))


def topic_profile(assessment_id: str, lesson_id: str):
    key = f"{assessment_id} {lesson_id}".lower()
    profiles = [
        (("graph",), "sơ đồ đồ thị và bảng lần vết đỉnh/cạnh", "graph diagram and vertex/edge trace table",
         ["nhầm đồ thị có hướng với vô hướng", "không nêu giả định về đỉnh, cạnh hoặc đường đi"],
         ["confusing directed and undirected graphs", "omitting assumptions about vertices, edges or paths"]),
        (("performance", "algorithm-cost", "complex"), "bảng đếm phép toán và kết luận Big-O", "operation-count table and Big-O conclusion",
         ["suy độ phức tạp từ một lần chạy", "không tách vòng lặp nối tiếp và lồng nhau"],
         ["inferring complexity from one runtime", "failing to distinguish sequential and nested loops"]),
        (("exception",), "lần vết ngoại lệ và nhánh phục hồi", "exception and recovery-path trace",
         ["bắt ngoại lệ quá rộng", "tiếp tục dùng trạng thái chưa hợp lệ sau ngoại lệ"],
         ["catching exceptions too broadly", "continuing with invalid state after an exception"]),
        (("random-file", "object-file", "file"), "sơ đồ file, con trỏ và trạng thái bản ghi", "file, pointer and record-state trace",
         ["nhầm chế độ đọc/ghi hoặc vị trí con trỏ", "đóng file trước khi hoàn tất thao tác"],
         ["confusing file mode or pointer position", "closing the file before the operation is complete"]),
        (("dictionary", "adt-abstraction"), "bảng khóa–giá trị và tác động của từng thao tác ADT", "key-value table with the effect of each ADT operation",
         ["coi khóa trùng như hai mục độc lập", "nhầm thêm/cập nhật/xóa với thao tác băm và dò ô"],
         ["treating a duplicate key as two independent entries", "confusing add/update/delete semantics with hashing and slot probing"]),
        (("hash",), "bảng bucket/probe qua từng thao tác", "bucket/probe table after each operation",
         ["ghi đè phần tử khi va chạm", "dừng dò tìm trước điều kiện kết thúc đúng"],
         ["overwriting an item on collision", "ending a probe before the valid stopping condition"]),
        (("oop-model",), "sơ đồ lớp với field, constructor parameter và nguồn giá trị", "class diagram with fields, constructor parameters and value sources",
         ["không ánh xạ đủ parameter vào field", "nhầm định nghĩa lớp với việc tạo một instance"],
         ["failing to map every parameter to its field", "confusing a class definition with construction of an instance"]),
        (("oop-state",), "bảng visibility, accessor và phép chuyển trạng thái", "visibility, accessor and state-transition table",
         ["truy cập trực tiếp field private thay vì qua method", "nhầm setter thay thế với update dựa trên giá trị cũ"],
         ["accessing a private field directly instead of through a method", "confusing replacement by a setter with an update based on prior state"]),
        (("oop-aggregation",), "sơ đồ quan hệ chứa và bảng ownership/cardinality", "containment diagram and ownership/cardinality table",
         ["dùng chung một child object cho nhiều vị trí cần độc lập", "nhầm quan hệ contains-a với kế thừa is-a"],
         ["sharing one child object across positions that require independent instances", "confusing contains-a aggregation with is-a inheritance"]),
        (("inheritance", "polymorph"), "sơ đồ kế thừa và bảng dispatch theo runtime type", "inheritance diagram and runtime-type dispatch table",
         ["bỏ phần khởi tạo của lớp cha", "ghi đè sai chữ ký hoặc gọi sai phương thức theo runtime type"],
         ["omitting parent-class initialisation", "using the wrong override signature or runtime dispatch target"]),
        (("object", "oop", "class"), "sơ đồ lớp/đối tượng và bảng quan hệ", "class/object diagram and relationship table",
         ["nhầm định nghĩa lớp với instance", "không khớp field, parameter và kiểu dữ liệu"],
         ["confusing a class definition with an instance", "mismatching fields, parameters and data types"]),
        (("linked-list", "linked_list", "list"), "sơ đồ nút live/free trước và sau cập nhật", "live/free node diagram before and after mutation",
         ["mất liên kết khi đổi thứ tự con trỏ", "không cập nhật head hoặc free-list ở ca biên"],
         ["losing a link through pointer-update order", "not updating head or the free list at a boundary"]),
        (("queue",), "bảng head/tail/count qua từng thao tác", "head/tail/count table after each operation",
         ["nhầm vị trí thêm và lấy", "không xử lý empty/full hoặc wrap-around"],
         ["confusing insertion and removal ends", "not handling empty/full state or wrap-around"]),
        (("stack",), "bảng top và vùng phần tử hợp lệ", "top pointer and live-range table",
         ["tăng/giảm top sai thứ tự", "không chặn underflow hoặc overflow"],
         ["updating top in the wrong order", "not guarding underflow or overflow"]),
        (("tree",), "sơ đồ cây kèm chuỗi nút được thăm", "tree diagram with visited-node sequence",
         ["đi sai nhánh do so sánh ngược", "bỏ ca cây rỗng hoặc nút lá"],
         ["taking the wrong branch after comparison", "omitting the empty-tree or leaf case"]),
        (("recursion",), "bảng khung gọi, base case và giá trị trả về", "call-frame, base-case and return-value table",
         ["base case không đạt tới được", "không kết hợp đúng giá trị khi quay lui"],
         ["using an unreachable base case", "combining return values incorrectly while unwinding"]),
        (("sort",), "bảng từng pass với vùng đã sắp và định danh bản ghi", "pass table with sorted region and record identity",
         ["lệch biên vòng lặp của pass", "đổi khóa nhưng làm mất dữ liệu đi kèm"],
         ["using an off-by-one pass boundary", "moving a key without its associated record"]),
        (("search",), "bảng vùng tìm kiếm, phần tử đã xét và điều kiện dừng", "search interval, visited-item and stopping-condition table",
         ["dừng khi gặp phần tử không khớp đầu tiên", "cập nhật sai cận hoặc bỏ sót vị trí cuối"],
         ["stopping at the first non-match", "updating a bound incorrectly or skipping the final position"]),
        (("text", "string"), "bảng chỉ số, ký tự/token và chuỗi kết quả", "index, character/token and result-string table",
         ["bỏ ký tự đầu/cuối", "không phân biệt ký tự, token và chuỗi con"],
         ["dropping the first or last character", "confusing characters, tokens and substrings"]),
        (("testing", "test"), "ma trận ca thử, dữ liệu, kết quả mong đợi và lý do", "test matrix with data, expected result and rationale",
         ["chỉ dùng ca thường", "ghi dữ liệu thử nhưng không nêu kết quả mong đợi"],
         ["using only normal cases", "giving test data without an expected result"]),
        (("exam-workflow", "evidence"), "ma trận yêu cầu–bằng chứng và checklist ảnh chụp", "requirement-to-evidence matrix and screenshot checklist",
         ["ảnh chụp không chứng minh đúng yêu cầu", "bỏ nhãn, dữ liệu đầu vào hoặc kết quả cần đối chiếu"],
         ["submitting a screenshot that does not prove the requirement", "omitting labels, input data or the result to be checked"]),
        (("validation",), "bảng predicate, dữ liệu lỗi và vòng lặp nhập lại", "predicate, invalid-data and retry-loop table",
         ["chỉ kiểm tra kiểu mà bỏ miền giá trị", "thoát vòng lặp khi dữ liệu vẫn chưa hợp lệ"],
         ["checking only type and not the valid range", "leaving the loop while data is still invalid"]),
    ]
    for needles, artifact_vi, artifact_en, mis_vi, mis_en in profiles:
        if any(needle in key for needle in needles):
            return artifact_vi, artifact_en, mis_vi, mis_en
    return (
        "bảng hợp đồng, trạng thái trung gian và kết quả",
        "contract, intermediate-state and result table",
        ["đổi giao diện hoặc điều kiện đã cho", "kết quả cuối đúng nhưng trạng thái trung gian vi phạm invariant"],
        ["changing the supplied interface or condition", "producing the final result while violating an intermediate invariant"],
    )


def concept_profile(assessment_id: str, lesson_id: str):
    key = f"{assessment_id} {lesson_id}".lower()
    profiles = [
        (("testing",), "đối chiếu mỗi loại ca thử với input, expected result và lý do chọn", "match every test class to its input, expected result and selection rationale"),
        (("dictionary", "adt-abstraction"), "đối chiếu từng thao tác với khóa tồn tại/không tồn tại và tác động chính xác lên ánh xạ", "match each operation to key presence/absence and its exact effect on the mapping"),
        (("oop-model",), "đối chiếu class table với field, visibility, constructor parameter và giá trị khởi tạo", "match the class table to fields, visibility, constructor parameters and initial values"),
        (("oop-state",), "đối chiếu quyền truy cập và phương trình before→after của đúng field", "check access control and the before-to-after equation for the exact field"),
        (("oop-aggregation",), "kiểm quan hệ contains-a, cardinality và tính độc lập của từng child instance", "check contains-a relationships, cardinality and independence of child instances"),
        (("inheritance", "polymorph"), "đối chiếu quan hệ is-a, phần kế thừa/ghi đè và runtime dispatch", "check the is-a relation, inherited/overridden members and runtime dispatch"),
        (("performance", "algorithm-cost"), "suy chi phí từ số phép toán theo kích thước input rồi rút gọn đúng dominant term", "derive cost from operation counts as input grows and reduce it to the correct dominant term"),
        (("graph",), "biện minh từng đỉnh/cạnh, hướng/trọng số và cấu trúc biểu diễn từ quan hệ trong đề", "justify every vertex/edge, direction/weight and representation choice from the stated relationships"),
        (("exam-workflow",), "đối chiếu một-một mỗi yêu cầu với bằng chứng nhìn thấy được, dữ liệu đầu vào và kết quả", "map each requirement one-to-one to visible evidence, input data and result"),
    ]
    for needles, criterion_vi, criterion_en in profiles:
        if any(needle in key for needle in needles):
            return criterion_vi, criterion_en
    return None


def main():
    source = load(SOURCE)
    requirements = source["assessment_requirements"]
    destinations = source["planned_assessment_destinations"]
    lessons = {x["lesson_id"]: x for x in source["lessons"]}
    requirements_by_destination: dict[str, list[dict]] = {d["assessment_id"]: [] for d in destinations}
    for req in requirements:
        requirements_by_destination[req["suggested_assessment_id"]].append(req)

    blocks = {}
    for lesson in source["lessons"]:
        for block in lesson["blocks"]:
            blocks[block["block_id"]] = block

    designs = []
    coverage_rows = []
    for destination in destinations:
        assessment_id = destination["assessment_id"]
        assigned = requirements_by_destination[assessment_id]
        knowledge_ids = unique(destination.get("knowledge_block_ids", []) + [
            kid for req in assigned for kid in req.get("knowledge_block_ids", [])
        ])
        objective_ids = unique(
            [req["objective_id"] for req in assigned]
            + [oid for kid in knowledge_ids for oid in blocks.get(kid, {}).get("objective_ids", [])]
        )
        lesson = lessons[destination["lesson_id"]]
        titles = destination.get("titles") or {
            "vi": f"Đánh giá bù khuyết: {lesson['titles']['vi']}",
            "en": f"Gap assessment: {lesson['titles']['en']}",
        }
        source_design = destination.get("design_brief") or destination.get("design_intent")
        artifact_vi, artifact_en, misconception_vi, misconception_en = topic_profile(
            assessment_id, destination["lesson_id"]
        )
        focus_vi = "; ".join([r["capability"]["vi"] for r in assigned][:3]) or "; ".join(
            blocks[k]["knowledge_label_vi"] for k in knowledge_ids[:3] if k in blocks
        )
        focus_en = "; ".join([r["capability"]["en"] for r in assigned][:3]) or "; ".join(
            blocks[k]["knowledge_label_en"] for k in knowledge_ids[:3] if k in blocks
        )
        evidence = []
        for req in assigned:
            checks = req.get("acceptance_checks", [])
            evidence.append({
                "requirement_id": req["requirement_id"],
                "vi": f"Học sinh nộp {artifact_vi} để chứng minh: {req['capability']['vi']}; giáo viên đối chiếu từng trạng thái với hợp đồng, logic và ca biên đã nêu.",
                "en": f"The learner submits a {artifact_en} to demonstrate: {req['capability']['en']}; the reviewer checks each state against the contract, logic and stated boundary cases.",
                "acceptance_checks": checks,
            })
            coverage_rows.append({
                "requirement_id": req["requirement_id"],
                "assessment_id": assessment_id,
                "objective_id": req["objective_id"],
                "knowledge_block_ids": req.get("knowledge_block_ids", []),
                "origin": req.get("origin", "AlgoCore original"),
                "official_marks": None,
            })
        if assigned:
            task_vi = "Thiết kế một chuỗi bài có hỗ trợ giảm dần để học sinh thực hiện các năng lực: " + "; ".join(r["capability"]["vi"] for r in assigned) + "."
            task_en = "Design a faded-support task sequence in which learners demonstrate: " + "; ".join(r["capability"]["en"] for r in assigned) + "."
            boundary_vi = [r["task_brief"]["vi"] for r in assigned]
            boundary_en = [r["task_brief"]["en"] for r in assigned]
        else:
            task_vi = source_design["vi"]
            task_en = source_design["en"]
            boundary_vi = ["Bổ sung ít nhất một ca thường, một ca biên và một ca sửa lỗi khi Stage 6 soạn bài."]
            boundary_en = ["Add at least one normal, boundary and repair case when Stage 6 authors the task."]
            evidence.append({
                "requirement_id": None,
                "evidence_scope": "support_destination",
                "vi": f"Học sinh nộp {artifact_vi} cho nội dung {focus_vi}; sản phẩm phải cho thấy ca thường, ca biên và một lần sửa sai có giải thích.",
                "en": f"The learner submits a {artifact_en} for {focus_en}; the work must show a normal case, a boundary case and one explained repair.",
                "acceptance_checks": [
                    "All linked knowledge blocks are represented in the artifact.",
                    "A normal case, boundary case and explained repair are visible.",
                    "No Cambridge mark value is inferred or assigned.",
                ],
            })
        concept = concept_profile(assessment_id, destination["lesson_id"])
        if concept:
            criterion_vi, criterion_en = concept
            progression = [
                {"stage": "guided", "vi": f"Với {titles['vi']} ({assessment_id}), cho sẵn một phần {artifact_vi}; học sinh hoàn thiện phần còn thiếu rồi {criterion_vi}.", "en": f"For {titles['en']} ({assessment_id}), provide a partly completed {artifact_en}; learners complete the missing entries and {criterion_en}."},
                {"stage": "faded", "vi": f"Bỏ nhãn và tiêu chí gợi ý khỏi {artifact_vi}; học sinh tự phân loại ca thường/biên và giải thích mỗi lựa chọn bằng {criterion_vi}.", "en": f"Remove labels and criterion prompts from the {artifact_en}; learners classify normal/boundary cases and justify each choice by checking how they {criterion_en}."},
                {"stage": "independent", "vi": f"Dùng ngữ cảnh mới cho {titles['vi']}; học sinh tự dựng {artifact_vi}, áp dụng tiêu chí ‘{criterion_vi}’ và viết kết luận có căn cứ.", "en": f"Use an unfamiliar context for {titles['en']}; learners construct the {artifact_en}, apply the criterion ‘{criterion_en}’, and write an evidence-based conclusion."},
                {"stage": "retrieval_repair", "vi": f"Cho một {artifact_vi} có quan hệ, phân loại hoặc lập luận sai; học sinh chỉ ra mục sai, giải thích bằng ‘{criterion_vi}’ và sửa.", "en": f"Give a {artifact_en} with a faulty relationship, classification or justification; learners locate it, explain it using ‘{criterion_en}’, and repair it."},
            ]
            rubric = {
                "vi": [
                    f"giữ đúng phạm vi của {titles['vi']}",
                    f"thể hiện đủ trọng tâm: {focus_vi}",
                    f"{artifact_vi} đầy đủ và nhất quán ở ca thường/biên",
                    criterion_vi,
                    "kết luận và sửa lỗi đều dẫn lại tới evidence cụ thể trong artifact",
                ],
                "en": [
                    f"preserves the scope of {titles['en']}",
                    f"demonstrates the full focus: {focus_en}",
                    f"keeps the {artifact_en} complete and consistent for normal/boundary cases",
                    criterion_en,
                    "links every conclusion and repair to specific evidence in the artifact",
                ],
            }
        else:
            progression = [
                {"stage": "guided", "vi": f"Với {titles['vi']} ({assessment_id}), cho sẵn khung {artifact_vi} cho trọng tâm {focus_vi}, một ca thường và câu hỏi Predict trước thay đổi trạng thái chính.", "en": f"For {titles['en']} ({assessment_id}), provide a scaffolded {artifact_en} for {focus_en}, one normal case and a Predict prompt before the key state change."},
                {"stage": "faded", "vi": f"Giữ checkpoint của {artifact_vi} và ca biên, nhưng bỏ nhãn trường cùng gợi ý thứ tự bước.", "en": f"Keep the {artifact_en} checkpoints and boundary case, while removing field labels and step-order prompts."},
                {"stage": "independent", "vi": f"Dùng dữ liệu hoặc biểu diễn mới cho {titles['vi']}; học sinh tự dựng {artifact_vi} và tự chọn invariant/guard cần chứng minh.", "en": f"Use unfamiliar data or representation for {titles['en']}; learners construct the {artifact_en} and select the invariant/guard to prove."},
                {"stage": "retrieval_repair", "vi": f"Cho một {artifact_vi} có lỗi điển hình; học sinh khoanh bước sai, giải thích hậu quả và sửa mà không đổi hợp đồng.", "en": f"Give a {artifact_en} containing a topic-specific error; learners locate the faulty step, explain its consequence and repair it without changing the contract."},
            ]
            rubric = {
                "vi": [f"giữ đúng hợp đồng của {titles['vi']}", f"thể hiện đúng trọng tâm: {focus_vi}", f"{artifact_vi} nhất quán ở ca thường và ca biên", "invariant/điều kiện dừng được nêu và chứng minh bằng trạng thái", "lỗi được định vị, giải thích hậu quả và sửa đúng"],
                "en": [f"preserves the contract for {titles['en']}", f"demonstrates the focus: {focus_en}", f"keeps the {artifact_en} consistent for normal and boundary cases", "states the invariant/stopping condition and proves it with visible states", "locates the error, explains its consequence and repairs it correctly"],
            }
        designs.append({
            "assessment_id": assessment_id,
            "lesson_id": destination["lesson_id"],
            "package_id": destination["package_id"],
            "titles": titles,
            "requirement_ids": [r["requirement_id"] for r in assigned],
            "objective_ids": objective_ids,
            "knowledge_block_ids": knowledge_ids,
            "origin": "AlgoCore_original",
            "task_intent": {"vi": task_vi, "en": task_en},
            "observable_evidence": evidence,
            "progression": progression,
            "rubric_dimensions": rubric,
            "boundary_cases": {"vi": boundary_vi, "en": boundary_en},
            "misconceptions": {
                "vi": misconception_vi,
                "en": misconception_en,
                "authority": "AlgoCore_risk",
            },
            "official_source_refs": [],
            "authority_note": "This is an AlgoCore assessment design. It has no Cambridge mark allocation; any later selected official part must retain its own QP/MS locator and authority.",
            "official_marks": None,
            "status": "DESIGNED_NOT_AUTHORED",
        })

    req_ids = [r["requirement_id"] for r in requirements]
    covered = [r["requirement_id"] for r in coverage_rows]
    checks = {
        "destinations_37": len(designs) == 37,
        "requirements_107": len(requirements) == 107,
        "requirement_coverage_exact_once": Counter(req_ids) == Counter(covered) and len(covered) == len(set(covered)),
        "assessment_ids_unique": len(designs) == len({d["assessment_id"] for d in designs}),
        "all_status_correct": all(d["status"] == "DESIGNED_NOT_AUTHORED" for d in designs),
        "all_official_marks_null": all(d["official_marks"] is None for d in designs),
        "bilingual_task_and_titles": all(all(d[x].get(l) for x in ["titles", "task_intent"] for l in ["vi", "en"]) for d in designs),
        "observable_evidence_per_requirement": all(
            len(d["observable_evidence"]) == (len(d["requirement_ids"]) if d["requirement_ids"] else 1)
            for d in designs
        ),
        "support_destinations_have_observable_evidence": all(d["observable_evidence"] for d in designs if not d["requirement_ids"]),
        "destination_specific_rubrics": len({tuple(d["rubric_dimensions"]["en"]) for d in designs}) == len(designs),
        "destination_specific_progressions": len({tuple(x["en"] for x in d["progression"]) for d in designs}) == len(designs),
        "topic_specific_misconception_sets": len({tuple(d["misconceptions"]["en"]) for d in designs}) >= 12,
        "stage3_input_status": source["status"] == "LEAD_MAPPED",
    }
    if not all(checks.values()):
        raise SystemExit(checks)
    payload = {
        "schema_version": "s4-assessment-design-v1",
        "status": "LEAD_REVIEWED",
        "input_release": "paper4-2026-s3-v1",
        "input_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "authority_boundary": "All tasks and rubric dimensions in this artifact are AlgoCore designs. Official QP/MS authority is added only when a later stage selects a cited source part.",
        "counts": {"assessment_designs": len(designs), "assessment_requirements": len(coverage_rows), "objectives": len({o for d in designs for o in d["objective_ids"]}), "knowledge_blocks": len({k for d in designs for k in d["knowledge_block_ids"]}), "destinations_without_primary_requirement": sum(not d["requirement_ids"] for d in designs)},
        "assessment_designs": designs,
        "requirement_coverage": coverage_rows,
        "self_checks": checks,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = ["# Stage 4 assessment design briefs", "", "Status: **LEAD_REVIEWED**. These are task and rubric designs; Stage 6 has not authored the assessments.", "", f"- 37/37 destinations.", f"- 107/107 requirements covered exactly once by a primary destination.", f"- {payload['counts']['objectives']} linked objectives and {payload['counts']['knowledge_blocks']} knowledge blocks.", f"- {payload['counts']['destinations_without_primary_requirement']} support destinations intentionally have no primary requirement but retain a design slot.", "", "Every brief uses guided → faded → independent → retrieval/repair progression. Official marks remain null; any later official question selection must retain its own QP/MS locator.", "", "## Destinations", ""]
    for d in designs:
        md.append(f"- `{d['assessment_id']}` — {d['titles']['vi']} / {d['titles']['en']} — {len(d['requirement_ids'])} requirement(s).")
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    validation = {"status": "PASS", "checks": checks, "counts": payload["counts"], "artifact_sha256": hashlib.sha256(OUT.read_bytes()).hexdigest()}
    VALIDATION.parent.mkdir(parents=True, exist_ok=True)
    VALIDATION.write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(validation, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S1 = P4 / "stage-1"
S2 = P4 / "stage-2"
S3 = P4 / "stage-3"
S4 = P4 / "stage-4"

PATTERNS = ["STACK_SETUP", "STACK_PUSH", "STACK_POP", "STACK_PAIR", "STACK_REDUCE"]
PACKAGE_ID = "ac-9618-p4-2026-python.package.stack"
LESSON_ID = "ac-9618-p4-2026-python.lesson.stack"
VERSION = "s4-schema-v1-p0-submission-1"

ROUND1_OLD_INPUT_HASHES = {
    "stage-4/evidence/marking/2023-2024/MARKING_SUBMISSION.json": "cbe1b0247bd2dead4fde91f5dbf96849b6312c91ca3417f2a2142cc48ba92075",
    "stage-4/evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json": "7bc32b9ac2110fad8224be72473a15d63764595967cf48f05462efe71c0959c2",
    "stage-4/evidence/marking/2025/MARKING_SUBMISSION.json": "e1392a487972a2c4aa0e617f69d0ce6b97a3f7133a06d16cdbed8d5f3b53b075",
    "stage-4/evidence/marking/2025/SOURCE_RISK_REGISTER.json": "32a78a03e903d3d959b140f3c43aabbda3c367df29b1d15d07c0460f2eccedaa",
}

PRE_REWORK_INPUT_HASHES = {
    "stage-4/evidence/marking/2023-2024/MARKING_SUBMISSION.json": "796e20019b38f0e214f9c8d073caed490aee80b8f916dea9e1ee8c4bec2d51bb",
    "stage-4/evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json": "bd408ecb42a723923eb3b0b102b285e6046dfd27e414ae0aa521a3feb36591ef",
    "stage-4/evidence/marking/2025/MARKING_SUBMISSION.json": "3c460504352ff601d0423c2070b383f7b48e1a5746f2786a05732849a4f99f99",
    "stage-4/evidence/marking/2025/SOURCE_RISK_REGISTER.json": "35ab42f032dbcd7420f698c19024cc4d7361a73bf542b4e41263af9795494c18",
}

PRE_REWORK_ARTIFACT_HASHES = {
    "PATTERN_CARDS.json": "7fade2ef25a5be73bbfda7fcc1c011a88c637f50c9db444da9997989436ae8a7",
    "VARIANT_INVARIANT_REGISTER.json": "8169a54efcfb5d146ff3b9900536a094f01e824a18040ddcd3893043d283eade",
    "ERROR_PREVENTION.json": "db629b1fe4e9ad91b05eecb08b7602dd8aa417f267d2eef3157b078789f2530d",
    "SOLUTION_DESIGNS.json": "160a9738b03bd88a09ab0e1ddba4f2a3cd5345cf95929a26bda5956e536761c7",
    "WORKED_EXAMPLE_SPECS.json": "7087c7878d020897e613a93c2b554a47df44c194b27ec6ce4fabd67560bea505",
    "VISUAL_BRIEFS.json": "6cb05d5eb90664dda526dd6cd05cb35d2f6a5c44903630662b4763a2423051ec",
    "REVIEW.md": "4bac4ecd5cfdb370b1e4e9a14cb10f17dfd3a887792e376c1b758f7c35694d70",
    "VALIDATION.json": "6a7930dfc4ae23778d0de7fa2aa6bb1c7167ef81f4d4bf4482b1333744fdd07e",
    "REWORK_RESPONSE.json": "edaa64dff653610cbfe6ffae3f66b0a3edd4a5aa78181b473f54545e901808b4",
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(name: str, value):
    (HERE / name).write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def bi(vi: str, en: str):
    return {"vi": vi, "en": en}


INPUTS = [
    S2 / "EXAM_PATTERN_CATALOG.json",
    S2 / "QUESTION_PATTERN_MAP.json",
    S2 / "CONFUSABLE_PATTERNS.json",
    S3 / "BOOK_KNOWLEDGE_MAP.json",
    S3 / "COVERAGE_MATRIX.json",
    S3 / "LESSON_PACKAGES.json",
    S1 / "SOURCE_ISSUES.json",
    S4 / "evidence/marking/2021-2022/MARKING_SUBMISSION.json",
    S4 / "evidence/marking/2021-2022/SOURCE_RISK_REGISTER.json",
    S4 / "evidence/marking/2023-2024/MARKING_SUBMISSION.json",
    S4 / "evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json",
    S4 / "evidence/marking/2025/MARKING_SUBMISSION.json",
    S4 / "evidence/marking/2025/SOURCE_RISK_REGISTER.json",
    S4 / "schemas/pattern-card.schema.json",
    S4 / "schemas/error-prevention.schema.json",
    S4 / "schemas/design-briefs.schema.json",
]

input_hashes = [
    {"path": str(p.relative_to(P4)).replace("\\", "/"), "sha256": sha256(p)}
    for p in INPUTS
]

catalog_doc = read_json(S2 / "EXAM_PATTERN_CATALOG.json")
catalog = {x["pattern_id"]: x for x in catalog_doc["patterns"] if x["pattern_id"] in PATTERNS}
lesson_doc = read_json(S3 / "LESSON_PACKAGES.json")
stack_lesson = next(x for x in lesson_doc["lessons"] if x["lesson_id"] == LESSON_ID)
blocks = {p: b for b in stack_lesson["blocks"] for p in b["pattern_ids"]}
book_doc = read_json(S3 / "BOOK_KNOWLEDGE_MAP.json")
book_sections = {x["section_id"]: x for x in book_doc["sections"]}
s2_risk_doc = read_json(S4 / "evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json")
s2_fidelity_policy = s2_risk_doc["batch_fidelity_policy"]


def rows_from_submission(path: Path):
    doc = read_json(path)
    return doc.get("rows") or doc.get("parts") or []


source_rows = []
for year in ("2021-2022", "2023-2024", "2025"):
    path = S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json"
    for row in rows_from_submission(path):
        assessed = row.get("pattern_ids") or row.get("assessed_pattern_ids") or []
        for pattern in PATTERNS:
            if pattern in assessed:
                source_rows.append((pattern, year, row))

rows_by_pattern = {p: [] for p in PATTERNS}
for pattern, year, row in source_rows:
    copy = dict(row)
    copy["source_batch"] = year
    rows_by_pattern[pattern].append(copy)


def applicable_mps(pattern: str, row):
    """Keep only the atom owned by a pattern when one part assesses two patterns.

    The 2023 adaptation rows award one atom for PushColour and one for PopColour.
    Both patterns remain cross-references on the part, but neither card claims the
    other operation's atom.
    """
    mps = row["marking_points"]
    if row["part_id"].endswith("_3(b)(iv)") and set(row.get("assessed_pattern_ids", [])) == {"STACK_PUSH", "STACK_POP"}:
        suffix = "-01" if pattern == "STACK_PUSH" else "-02"
        return [m for m in mps if m["marking_point_id"].endswith(suffix)]
    return mps


def all_mp_refs(pattern: str):
    return [m["marking_point_id"] for r in rows_by_pattern[pattern] for m in applicable_mps(pattern, r)]


def source_ref(row, pattern):
    return {
        "part_id": row["part_id"],
        "source_batch": row["source_batch"],
        "qp_locator": {
            "source_id": row["qp_requirement"]["source_id"],
            "pdf_pages": row["qp_requirement"]["pdf_pages"],
        },
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "ms_atoms": [
            {
                "marking_point_id": m["marking_point_id"],
                "source_id": m["ms_source_id"],
                "pdf_pages": m["ms_pdf_pages"],
                "criterion_paraphrase": m["criterion_paraphrase"],
                "award_semantics": m["award_semantics"],
                "condition": m.get("condition"),
                "alternatives": m.get("alternatives"),
                "dependency": m.get("dependency"),
                "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"),
                "group_id": m.get("group_id"),
                "group_max": m.get("group_max"),
                "source_issue_refs": m.get("source_issue_refs", []),
            }
            for m in applicable_mps(pattern, row)
        ],
        "source_issue_refs": row.get("source_issue_refs", []),
    }


official_refs = {p: [source_ref(r, p) for r in rows_by_pattern[p]] for p in PATTERNS}


def refs_matching(pattern: str, *needles: str):
    found = []
    for row in rows_by_pattern[pattern]:
        for mp in applicable_mps(pattern, row):
            text = mp["criterion_paraphrase"].lower()
            if any(n.lower() in text for n in needles):
                found.append(mp["marking_point_id"])
    return list(dict.fromkeys(found))


def step(step_id, sequence, action_vi, action_en, why_vi, why_en, reads, writes,
         invariant, guard, termination_role, check_vi, check_en, marking_refs=None):
    return {
        "step_id": step_id,
        "sequence": sequence,
        "action": bi(action_vi, action_en),
        "why": bi(why_vi, why_en),
        "reads": reads,
        "writes": writes,
        "invariant": invariant,
        "guard": guard,
        "termination_role": termination_role,
        "check": bi(check_vi, check_en),
        "marking_point_refs": marking_refs or [],
    }


methods = {}
methods["STACK_SETUP"] = [
    step("stack-setup.step.contract", 1,
         "Gạch rõ tên, kiểu phần tử, sức chứa, phạm vi biến và ý nghĩa của top trong đề.",
         "Extract the required names, element type, capacity, scope and meaning of top.",
         "Các chi tiết này thuộc hợp đồng dữ liệu; thay bằng một stack quen thuộc khác có thể làm sai yêu cầu.",
         "These details form the data contract; substituting a familiar stack can violate the task.",
         ["QP contract"], ["representation decision"],
         "No state exists until one pointer convention has been selected from the source contract.",
         "Before declaring or initialising state.", "selects_contract",
         "Viết một câu: top là ô trống kế tiếp hay phần tử đang ở đỉnh.",
         "Write one sentence stating whether top is next-free or current-top.",
         refs_matching("STACK_SETUP", "declaring", "global", "identifiers")),
    step("stack-setup.step.representation", 2,
         "Khai báo đúng số ô và kiểu dữ liệu; phân biệt ô đang dùng với ô chưa dùng.",
         "Define the required number and type of cells, distinguishing live from unused storage.",
         "Sức chứa và kiểu phần tử quyết định mọi kiểm tra biên ở Push và Pop.",
         "Capacity and element type determine every later Push and Pop boundary.",
         ["capacity", "element type", "required identifiers"], ["stack storage"],
         "Array length equals declared capacity; logical stack order is LIFO independently of unused cell contents.",
         "The QP requires an array-backed stack.", "builds_state",
         "Đếm ô theo chỉ số đầu và cuối, không suy số ô chỉ từ chỉ số cuối.",
         "Count cells from the first through last index rather than treating the last index as the capacity.",
         refs_matching("STACK_SETUP", "elements", "array", "data structures")),
    step("stack-setup.step.initialise", 3,
         "Khởi tạo top theo đúng quy ước: 0 cho next-free hoặc −1 cho current-top; chỉ khởi tạo giá trị ô nếu đề yêu cầu.",
         "Initialise top to 0 for next-free or -1 for current-top; initialise cell values only when required.",
         "Giá trị khởi đầu biểu diễn stack rỗng và quyết định điều kiện empty/full.",
         "The initial value represents an empty stack and fixes the empty/full predicates.",
         ["pointer convention", "initial-cell requirement"], ["top", "optional cell values"],
         "Empty next-free: top=0. Empty current-top: top=-1.",
         "After storage has been sized.", "establishes_empty_state",
         "Đối chiếu: stack rỗng phải không có chỉ số live nào.",
         "Check that the empty state has no live index.",
         refs_matching("STACK_SETUP", "initialised", "initialised to")),
    step("stack-setup.step.consistency", 4,
         "Viết bốn phương trình empty, full, vị trí đọc và vị trí ghi cho quy ước đã chọn.",
         "Record the empty, full, read-index and write-index equations for the selected convention.",
         "Bảng phương trình ngăn việc trộn thứ tự cập nhật của hai quy ước.",
         "The equation table prevents update order from leaking between conventions.",
         ["top", "capacity", "convention"], ["boundary checklist"],
         "Next-free live indices are [0, top); current-top live indices are [0, top].",
         "Before designing Push or Pop.", "hands_off_to_operations",
         "Thử trạng thái rỗng và đầy; mọi chỉ số đọc/ghi phải nằm trong mảng.",
         "Test empty and full states; every read/write index must be in range."),
]

methods["STACK_PUSH"] = [
    step("stack-push.step.contract", 1,
         "Giữ nguyên kiểu tham số, kiểu kết quả, sức chứa và quy ước top của câu hỏi.",
         "Preserve the question's parameter type, result type, capacity and top convention.",
         "Push có cùng mục đích nhưng giao diện và giá trị báo đầy thay đổi giữa các đề.",
         "Push has a common purpose, but its interface and full result differ across sources.",
         ["QP function contract", "top", "capacity"], ["variant decision"],
         "The operation must either commit one item or leave the stack unchanged.",
         "At function entry.", "selects_variant",
         "Nêu rõ kết quả thành công/thất bại trước khi mô tả chuyển trạng thái.",
         "State the success/failure result before describing the transition.",
         refs_matching("STACK_PUSH", "header", "taking one", "parameter", "pushcolour function")),
    step("stack-push.step.full-guard", 2,
         "Kiểm tra đầy trước khi ghi: next-free dùng top = capacity; current-top dùng top = capacity − 1.",
         "Check full before writing: next-free uses top = capacity; current-top uses top = capacity - 1.",
         "Guard trước mutation ngăn truy cập vượt mảng và giữ nguyên state khi thất bại.",
         "Guarding before mutation prevents an out-of-range write and preserves state on failure.",
         ["top", "capacity"], [],
         "If full on entry, all stack cells and top remain unchanged.",
         "Always evaluated before mutation.", "failure_or_continue",
         "Kiểm tra bằng trạng thái còn đúng một ô và trạng thái đã đầy.",
         "Check both one-free-slot and already-full states.",
         refs_matching("STACK_PUSH", "full")),
    step("stack-push.step.failure", 3,
         "Nếu đầy, trả đúng kiểu/giá trị hoặc thông báo mà đề quy định rồi kết thúc thao tác.",
         "If full, return the exact result type/value or message required by the source and stop.",
         "Một sentinel hay Boolean khác kiểu vẫn vi phạm giao diện dù state không hỏng.",
         "A sentinel or Boolean of the wrong type still violates the interface even when state is preserved.",
         ["full guard", "return contract"], ["result only"],
         "Failure is non-mutating.", "full is true", "terminates_failure_path",
         "So sánh cả giá trị lẫn kiểu kết quả với QP.",
         "Compare both value and type against the QP contract.",
         refs_matching("STACK_PUSH", "returning false", "returning integer", "outputting suitable message")),
    step("stack-push.step.next-free-success", 4,
         "Với next-free, ghi phần tử vào chỉ số top hiện tại rồi tăng top đúng một.",
         "For next-free, write the item at the current top index, then increase top by one.",
         "Trước thao tác top chỉ ô trống; sau thao tác top mới lại chỉ ô trống kế tiếp.",
         "Before the operation top denotes the free cell; afterwards it again denotes the next free cell.",
         ["item", "top", "stack"], ["stack[top_before]", "top"],
         "After success, live indices are [0, top_after) and top_after=top_before+1.",
         "not full and convention=next_free", "commits_success_variant",
         "Ô mới nằm ở top_before và top_after không vượt capacity.",
         "The new item is at top_before and top_after does not exceed capacity.",
         refs_matching("STACK_PUSH", "inserting parameter value", "storing parameter to stack at stackpointer", "incrementing pointer", "incrementing stackpointer", "next position", "incrementing voweltop", "repeated for consonant")),
    step("stack-push.step.current-top-success", 5,
         "Với current-top, tăng top đúng một rồi ghi phần tử vào chỉ số top mới.",
         "For current-top, increase top by one, then write the item at the new top index.",
         "Trước thao tác top là phần tử cũ; phải dịch top tới ô trống trước khi ghi.",
         "Before the operation top denotes the old top item, so it must move to the free cell before the write.",
         ["item", "top", "stack"], ["top", "stack[top_after]"],
         "After success, live indices are [0, top_after] and top_after=top_before+1.",
         "not full and convention=current_top", "commits_success_variant",
         "Phần tử mới ở top_after và top_after ≤ capacity−1.",
         "The new item is at top_after and top_after <= capacity-1.",
         refs_matching("STACK_PUSH", "incrementing topofstack", "incrementing topofstack", "incrementing top", "incremented topofstack", "incremented the stack")),
    step("stack-push.step.return-check", 6,
         "Trả đúng kết quả thành công và xác nhận chỉ có một phần tử được thêm.",
         "Return the required success result and confirm that exactly one item was added.",
         "Kết quả là một phần của hợp đồng được chấm, không phải chi tiết trang trí.",
         "The result is part of the assessed contract, not decoration.",
         ["post-state", "return contract"], ["result"],
         "Successful Push increases logical size by exactly one and preserves older item order.",
         "after either success variant", "terminates_success_path",
         "Kiểm tra size tăng một, item mới ở đỉnh và các item cũ giữ nguyên thứ tự.",
         "Check size +1, new item at the top, and unchanged order of older items.",
         refs_matching("STACK_PUSH", "returning true", "returning integer 1", "returning boolean in all instances")),
]

methods["STACK_POP"] = [
    step("stack-pop.step.contract", 1,
         "Giữ đúng kiểu kết quả, sentinel rỗng và quy ước top của câu hỏi.",
         "Preserve the question's result type, empty sentinel and top convention.",
         "Các đề dùng −1 dạng số, \"−1\" dạng chuỗi, chuỗi rỗng, \"No data\" hoặc −999; chúng không hoán đổi được.",
         "Sources use numeric -1, string \"-1\", empty string, \"No data\" or -999; they are not interchangeable.",
         ["QP function contract", "top convention"], ["variant decision"],
         "The operation returns the most recent live item or the exact empty result.",
         "At function entry.", "selects_variant",
         "Ghi sentinel kèm kiểu dữ liệu, không chỉ ghi ký hiệu.",
         "Record the sentinel together with its data type.",
         refs_matching("STACK_POP", "function header", "procedure header", "one function header", "popcolour function")),
    step("stack-pop.step.empty-guard", 2,
         "Kiểm tra rỗng trước khi đọc: next-free dùng top = 0; current-top dùng top = −1.",
         "Check empty before reading: next-free uses top = 0; current-top uses top = -1.",
         "Đọc trước guard có thể dùng chỉ số âm hoặc ô không thuộc stack.",
         "Reading before the guard can access a negative index or an unused cell.",
         ["top"], [],
         "If empty on entry, all stack cells and top remain unchanged.",
         "Always evaluated before a read.", "failure_or_continue",
         "Thử chính trạng thái khởi tạo rỗng của quy ước.",
         "Test the convention's initial empty state.",
         refs_matching("STACK_POP", "checking if stack is empty", "checking if empty")),
    step("stack-pop.step.failure", 3,
         "Nếu rỗng, trả đúng sentinel và kết thúc mà không đổi top.",
         "If empty, return the exact sentinel and stop without changing top.",
         "Pop thất bại phải là chuyển trạng thái rỗng, không được làm top nhỏ hơn giá trị empty.",
         "A failed Pop is a non-transition; top must not move below its empty value.",
         ["empty guard", "sentinel contract"], ["result only"],
         "Failure is non-mutating.", "empty is true", "terminates_failure_path",
         "Kiểm tra sentinel đúng giá trị, đúng kiểu và top không đổi.",
         "Check sentinel value, sentinel type and unchanged top.",
         refs_matching("STACK_POP", "returning -1", "returning string", "returning empty string", "returning \"no data\"", "returning -999")),
    step("stack-pop.step.next-free-success", 4,
         "Với next-free, đọc phần tử tại top − 1 rồi giảm top đúng một.",
         "For next-free, read the item at top - 1, then decrease top by one.",
         "Top chỉ ô trống nên phần tử live cuối nằm ngay trước nó.",
         "Top denotes the free cell, so the last live item is immediately before it.",
         ["top", "stack[top-1]"], ["saved item", "top"],
         "Returned item equals stack[top_before-1]; top_after=top_before-1.",
         "not empty and convention=next_free", "commits_success_variant",
         "Lưu item trước khi đổi top và xác nhận top_after là ô vừa giải phóng.",
         "Save the item before changing top and confirm top_after denotes the freed cell.",
         refs_matching("STACK_POP", "top data item", "top item", "top of the stack", "decrementing animal", "decrementing correct pointer", "decrementing the stack pointer")),
    step("stack-pop.step.current-top-success", 5,
         "Với current-top, lưu phần tử tại top hiện tại rồi giảm top đúng một.",
         "For current-top, save the item at the current top index, then decrease top by one.",
         "Nếu giảm trước rồi đọc, thao tác sẽ trả phần tử kế dưới thay vì phần tử LIFO.",
         "If top is decreased before the read, the operation returns the item below the LIFO item.",
         ["top", "stack[top]"], ["saved item", "top"],
         "Returned item equals stack[top_before]; top_after=top_before-1.",
         "not empty and convention=current_top", "commits_success_variant",
         "Item trả về phải là ô top_before, không phải top_after.",
         "The returned item must come from top_before, not top_after.",
         refs_matching("STACK_POP", "before topofstack is decremented", "before it's decremented", "accessing and returning item at topofstack", "decrementing topofstack")),
    step("stack-pop.step.return-check", 6,
         "Trả item đã lưu và xác nhận stack giảm đúng một phần tử.",
         "Return the saved item and confirm that the stack lost exactly one item.",
         "Tách giá trị trả về khỏi ô mảng giúp đúng dù ô đã giải phóng chưa bị xóa vật lý.",
         "Separating the return value from storage remains correct whether or not the freed cell is cleared.",
         ["saved item", "post-state"], ["result"],
         "Successful Pop decreases logical size by one and preserves remaining order.",
         "after either success variant", "terminates_success_path",
         "Kiểm tra item gần nhất được trả, size giảm một và thứ tự còn lại không đổi.",
         "Check newest item returned, size -1 and unchanged remaining order.",
         refs_matching("STACK_POP", "returning the item removed", "returning value at top", "returning a value in all cases", "returning integer in all cases", "2nd function fully correct")),
]

methods["STACK_PAIR"] = [
    step("stack-pair.step.capture", 1,
         "Ghi hợp đồng của cả hai Pop, sentinel tương ứng và thứ tự hiển thị cặp.",
         "Record both Pop contracts, their sentinels and the required pair-output order.",
         "Chỉ so sánh được thành công/thất bại khi sentinel và kiểu đã rõ.",
         "Success and failure can only be distinguished after sentinel and type are explicit.",
         ["two stack contracts", "required output literals"], ["pair transaction contract"],
         "Before-state of both stacks is retained conceptually until the pair is committed.",
         "At procedure entry.", "opens_transaction",
         "Liệt kê bốn trường hợp: cả hai có, thiếu trái, thiếu phải, cả hai rỗng." ,
         "List four cases: both available, left missing, right missing, both empty."),
    step("stack-pair.step.pop-both", 2,
         "Gọi đúng Pop của từng stack một lần và lưu riêng hai kết quả trước khi output.",
         "Call each stack's Pop exactly once and retain both results before producing output.",
         "Cần biết toàn bộ kết quả giao dịch trước khi quyết định commit hay rollback.",
         "The complete transaction result is needed before deciding to commit or roll back.",
         ["stack A", "stack B"], ["result A", "result B", "tentative post-state"],
         "At most one live item is tentatively removed from each stack.",
         "Both Pop contracts are available.", "collects_transaction_results",
         "Không output cặp khi mới chỉ kiểm một phía.",
         "Do not output a pair after checking only one side.",
         refs_matching("STACK_PAIR", "using popcolour", "popanimal")),
    step("stack-pair.step.case-split-rollback", 3,
         "Nếu chỉ một Pop thành công, Push chính item đó trở lại đúng stack; nếu cả hai thất bại thì không Push sentinel.",
         "If exactly one Pop succeeds, Push that item back to its original stack; if both fail, do not Push a sentinel.",
         "Rollback phục hồi số lượng, thứ tự và top của stack chưa ghép được; sentinel không phải dữ liệu thật.",
         "Rollback restores count, order and top for the unmatched stack; a sentinel is not live data.",
         ["result A", "result B", "success flags"], ["one restored stack or none"],
         "On failed pairing, each stack's logical state equals its before-state.",
         "not both Pop calls succeeded", "rolls_back_failure",
         "So sánh snapshot trước/sau; không stack nào được mất item hoặc nhận sentinel.",
         "Compare before/after snapshots; neither stack loses an item or gains a sentinel.",
         refs_matching("STACK_PAIR", "no colour", "pushing the removed animal", "no animal", "pushing the removed colour")),
    step("stack-pair.step.commit-output", 4,
         "Chỉ khi cả hai Pop thành công, output đúng thứ tự/format và giữ cả hai lần xóa.",
         "Only when both Pops succeed, output the required order/format and retain both removals.",
         "Output đúng nhưng state rollback/commit sai vẫn không đáp ứng thao tác cặp.",
         "Correct output with the wrong rollback/commit state does not satisfy the paired operation.",
         ["two successful results", "output contract"], ["output", "committed state"],
         "Successful pairing decreases each stack size by one and preserves all older items.",
         "both Pop calls succeeded", "commits_success",
         "Kiểm thứ tự colour–animal theo nguồn và top của cả hai stack giảm đúng một.",
         "Check source-required colour-animal order and size -1 for both stacks.",
         refs_matching("STACK_PAIR", "procedure heading", "outputting the colour and animal")),
    step("stack-pair.step.postcheck", 5,
         "Kiểm lại bốn trường hợp; giữ literal nguồn cho hai nhánh một phía, còn message tự biên soạn cho both-empty phải ghi AlgoCore_inference.",
         "Recheck all four cases; preserve source literals for one-sided failures, while any authored both-empty message must be labelled AlgoCore_inference.",
         "Bảng case phát hiện nhánh bỏ sót, rollback nhầm item và output khi chưa đủ cặp.",
         "The case table exposes missing branches, wrong-item rollback and premature pair output.",
         ["case table", "post-state"], ["review result"],
         "Every input-state combination has exactly one disposition.",
         "After commit or rollback.", "terminates_all_paths",
         "Đặc biệt thử A rỗng/B có, A có/B rỗng và cả hai rỗng.",
         "Specifically test A-empty/B-live, A-live/B-empty and both-empty."),
]

methods["STACK_REDUCE"] = [
    step("stack-reduce.step.contract", 1,
         "Chọn đúng biến thể: fold số–toán tử theo thứ tự Pop hoặc quét cực trị; ghi sentinel, kiểu và tính phá hủy stack.",
         "Select the exact variant: popped number-operator fold or extrema scan; record sentinel, types and destructive consumption.",
         "Hai biến thể đều dùng Pop lặp lại nhưng invariant, output và điều kiện dữ liệu khác nhau.",
         "Both variants repeat Pop, but their invariants, outputs and data contracts differ.",
         ["QP reduction contract", "Pop contract"], ["reduction variant"],
         "Every consumed live item is accounted for exactly once.",
         "At routine entry.", "selects_variant",
         "Nêu rõ stack sẽ rỗng sau thao tác nếu hoàn thành.",
         "State explicitly that successful completion drains the stack.",
         refs_matching("STACK_REDUCE", "function header", "procedure header")),
    step("stack-reduce.step.first-value", 2,
         "Pop giá trị live đầu tiên; dùng nó làm total hoặc đồng thời khởi tạo min/max.",
         "Pop the first live value; use it as total or to initialise both minimum and maximum.",
         "Khởi tạo từ dữ liệu tránh giả định 0 thuộc miền và giữ đúng toán hạng trái ban đầu.",
         "Initialising from data avoids assuming zero belongs to the domain and preserves the initial left operand.",
         ["first Pop result"], ["total or min/max", "top"],
         "Accumulator summarises exactly the live values consumed so far.",
         "stack is non-empty under the source contract", "initialises_accumulator",
         "Không dùng sentinel hoặc hằng 0 làm dữ liệu khởi tạo.",
         "Do not use the sentinel or a constant zero as the initial data value.",
         refs_matching("STACK_REDUCE", "calling pop", "calls pop")),
    step("stack-reduce.step.consume-next", 3,
         "Lặp cho đến empty. Với biểu thức, lấy operator rồi lấy đúng một số theo sau; với cực trị, lấy một số mỗi vòng.",
         "Repeat until empty. For expressions, take an operator then exactly one following number; for extrema, take one number per iteration.",
         "Nhịp tiêu thụ phải khớp grammar dữ liệu; nguồn biểu thức bảo đảm một số theo sau mỗi operator.",
         "Consumption cadence must match the data grammar; the expression source guarantees a number after each operator.",
         ["top or Pop sentinel", "next item(s)"], ["operator/operand or candidate", "top"],
         "No sentinel is classified as an operator, operand or candidate value.",
         "while live data remains", "progresses_toward_empty",
         "Mỗi vòng phải giảm logical size; nếu đã lấy operator thì phải lấy được số theo hợp đồng nguồn.",
         "Each iteration reduces logical size; after an operator, the source contract must provide a number.",
         refs_matching("STACK_REDUCE", "looping until", "calls pop", "calling pop", "operator or a number", "alternating")),
    step("stack-reduce.step.apply", 4,
         "Cập nhật total theo `total operator number`, hoặc cập nhật min/max bằng candidate vừa Pop.",
         "Update total as `total operator number`, or update min/max from the candidate just popped.",
         "Thứ tự trái–phải quyết định phép trừ, chia và lũy thừa; min/max phải cùng thấy mọi candidate.",
         "Left-right order determines subtraction, division and exponentiation; both extrema must inspect every candidate.",
         ["accumulator", "operator", "number or candidate"], ["accumulator"],
         "Accumulator equals the left fold of the consumed prefix, or extrema of all consumed values.",
         "after a complete operator-number pair or one extrema candidate", "maintains_reduction_invariant",
         "Dùng ca không giao hoán và ca giá trị toàn âm để phát hiện đảo toán hạng/khởi tạo sai.",
         "Use a non-commutative case and an all-negative case to expose reversed operands or bad initialisation.",
         refs_matching("STACK_REDUCE", "select to determine", "performing correct calculation", "highest", "lowest")),
    step("stack-reduce.step.finish", 5,
         "Khi stack rỗng, trả total hoặc output min/max đúng contract; xác nhận không còn item live.",
         "When the stack is empty, return total or output min/max as required; confirm no live item remains.",
         "Kết thúc dựa trên state/sentinel của Pop, không dựa trên giá trị dữ liệu thông thường.",
         "Termination follows Pop state/sentinel rather than an ordinary data value.",
         ["empty state", "accumulator", "output contract"], ["result or output"],
         "At completion top is empty and the result summarises every original live item in source order.",
         "no live data remains", "terminates_successfully",
         "Đếm số Pop hữu ích bằng số item ban đầu và kiểm format kết quả riêng.",
         "Count useful Pops against initial live-item count and check result formatting separately.",
         refs_matching("STACK_REDUCE", "returning this final", "output of highest", "outputs highest", "outputs lowest")),
]


requirement_refs = {
    "STACK_SETUP": [
        "ac-9618-p4-2026-python.assessment-requirement.syl-19.1-21",
        "ac-9618-p4-2026-python.assessment-requirement.syl-10.4-01",
        "ac-9618-p4-2026-python.assessment-requirement.syl-10.4-02",
    ],
    "STACK_PUSH": ["ac-9618-p4-2026-python.assessment-requirement.syl-19.1-11"],
    "STACK_POP": ["ac-9618-p4-2026-python.assessment-requirement.syl-19.1-15"],
    "STACK_PAIR": ["ac-9618-p4-2026-python.assessment-requirement.syl-20.1-04"],
    "STACK_REDUCE": ["ac-9618-p4-2026-python.assessment-requirement.syl-20.1-04"],
}

objective_ids = {
    "STACK_SETUP": ["SYL-19.1-21", "SYL-10.4-01", "SYL-10.4-02"],
    "STACK_PUSH": ["SYL-19.1-11"],
    "STACK_POP": ["SYL-19.1-15"],
    "STACK_PAIR": ["SYL-20.1-04"],
    "STACK_REDUCE": ["SYL-20.1-04"],
}

confusables = {
    "STACK_SETUP": ["STACK_PUSH", "STACK_POP"],
    "STACK_PUSH": ["STACK_POP"],
    "STACK_POP": ["STACK_PUSH"],
    "STACK_PAIR": ["STACK_REDUCE"],
    "STACK_REDUCE": ["STACK_PAIR"],
}

applicability = {
    "STACK_SETUP": {
        "preconditions": ["The QP identifies an array-backed stack or asks for its state declarations."],
        "representation": ["Finite one-dimensional array plus one integer top pointer."],
        "conventions": ["next_free: empty=0, full=capacity", "current_top: empty=-1, full=capacity-1"],
        "variant_axes": ["capacity", "element_type", "scope", "top_convention", "initial_cell_values"],
        "decision_rule": bi("Lấy ý nghĩa top và giá trị khởi tạo từ QP; không suy từ tên biến.", "Take top meaning and initial value from the QP; never infer them from the variable name."),
    },
    "STACK_PUSH": {
        "preconditions": ["Stack representation, capacity, top convention and result contract are known."],
        "representation": ["Mutation of an array-backed finite stack."],
        "conventions": ["next_free writes then increments", "current_top increments then writes"],
        "variant_axes": ["current_top_or_next_free", "capacity", "parameter_type", "return_contract", "routing"],
        "decision_rule": bi("Nếu top chỉ ô trống thì ghi trước; nếu top chỉ phần tử đỉnh thì tăng trước.", "Write first when top is next-free; increment first when top is current-top."),
    },
    "STACK_POP": {
        "preconditions": ["Stack representation, top convention and exact empty result are known."],
        "representation": ["LIFO read plus pointer mutation; clearing a freed cell is source-dependent and not inherently required."],
        "conventions": ["next_free reads top-1 then decrements", "current_top reads top then decrements"],
        "variant_axes": ["top_convention", "empty_return_type", "update_order", "cell_clearing_policy"],
        "decision_rule": bi("Xác định chỉ số item từ ý nghĩa top, lưu item rồi mới làm mất quyền truy cập tới nó.", "Derive the item index from top meaning and save the item before changing access to it."),
    },
    "STACK_PAIR": {
        "preconditions": ["Two stack interfaces and their empty results are known."],
        "representation": ["A two-resource transaction built from Pop and Push operations."],
        "conventions": ["commit only when both Pops succeed", "restore the sole successful Pop on partial failure"],
        "variant_axes": ["empty_side", "both_empty", "restoration_order", "pair_output_order", "message_literal"],
        "decision_rule": bi("Chỉ commit khi có đủ hai item; thất bại một phía thì rollback item thật đã lấy.", "Commit only with two live items; on one-sided failure, roll back the live item that was removed."),
    },
    "STACK_REDUCE": {
        "preconditions": ["The QP defines reduction kind, Pop sentinel and source data grammar."],
        "representation": ["Destructive repeated Pop with an accumulator."],
        "conventions": ["expression is a left fold total operator number", "extrema start from first live value"],
        "variant_axes": ["arithmetic_or_extrema", "operator_order", "termination", "sentinel", "empty_input_policy"],
        "decision_rule": bi("Chọn invariant theo output: prefix fold cho biểu thức, min/max của prefix cho cực trị.", "Choose the invariant from the output: prefix fold for expressions, prefix extrema for highest/lowest."),
    },
}

corpus_limits = {
    "STACK_SETUP": "Observed across five normalized source groups. The corpus contains both top conventions but does not prove all possible representations.",
    "STACK_PUSH": "Observed across five normalized source groups. Routing and return contracts vary; no one listing is a universal template.",
    "STACK_POP": "Observed across five normalized source groups. Empty sentinels and update order remain source-specific.",
    "STACK_PAIR": "Limited evidence: two mirrored papers represent one normalized task group; the both-empty case is not specified explicitly.",
    "STACK_REDUCE": "Limited evidence: two 2025 task groups cover expression fold and extrema; other reductions are not evidenced.",
}

recognition_en = {
    "STACK_SETUP": "The task asks for array-backed stack declarations or initial state, including capacity and a top pointer.",
    "STACK_PUSH": "The task asks to add one item to a finite stack while handling full state and the required success/failure result.",
    "STACK_POP": "The task asks to return the most recent live item, update top and return an exact empty sentinel when needed.",
    "STACK_PAIR": "The task pops one item from each of two stacks and must restore the unmatched item when only one Pop succeeds.",
    "STACK_REDUCE": "The task repeatedly Pops values to build one result, such as a left-to-right calculation or highest/lowest values.",
}

representative_ids = {
    "STACK_SETUP": ["9618_s22_42_1(a)", "9618_s25_42_1(a)", "9618_w25_41_1(a)"],
    "STACK_PUSH": ["9618_s22_42_1(c)", "9618_s25_42_1(b)", "9618_w25_41_1(b)"],
    "STACK_POP": ["9618_s22_42_1(e)(i)", "9618_w23_42_1(c)", "9618_w25_41_1(c)"],
    "STACK_PAIR": ["9618_s23_41_3(c)"],
    "STACK_REDUCE": ["9618_s25_42_1(e)", "9618_w25_41_1(e)"],
}

errors = []


def add_error(pattern, suffix, step_refs, likely_vi, likely_en, consequence_vi, consequence_en,
              detect_vi, detect_en, repair_vi, repair_en, basis="AlgoCore_risk", mp_refs=None,
              part_ids=None, authority_note=None):
    errors.append({
        "error_id": f"p0.stack.{pattern.lower().replace('_', '-')}.error.{suffix}",
        "pattern_id": pattern,
        "question_part_ids": part_ids or [],
        "requirement_refs": requirement_refs[pattern],
        "marking_point_refs": mp_refs or [],
        "method_step_refs": step_refs,
        "likely_error": bi(likely_vi, likely_en),
        "consequence": bi(consequence_vi, consequence_en),
        "detection_check": bi(detect_vi, detect_en),
        "repair_action": bi(repair_vi, repair_en),
        "repair_exercise_ref": f"p0.stack.{pattern.lower().replace('_', '-')}.repair.{suffix}",
        "basis": basis,
        "source_locator_if_official": [r for r in official_refs[pattern] if any(m["marking_point_id"] in (mp_refs or []) for m in r["ms_atoms"])],
        "exact_mark_loss_claim": None,
        "authority_note": authority_note or "AlgoCore risk derived from the stated invariant; no claim about examiner frequency or a fixed number of lost marks.",
        "status": "SUBMITTED",
    })


add_error("STACK_SETUP", "mixed-top-convention", ["stack-setup.step.initialise", "stack-setup.step.consistency"],
          "Khởi tạo top = 0 nhưng lại dùng điều kiện current-top, hoặc khởi tạo −1 rồi dùng next-free.",
          "Initialising top to 0 while using current-top rules, or to -1 while using next-free rules.",
          "Empty/full và chỉ số Push/Pop lệch một; state không còn cùng một biểu diễn.",
          "Empty/full and Push/Pop indices become off by one; the state no longer has one representation.",
          "Điền bảng empty/full/read/write và kiểm trạng thái rỗng không có ô live.",
          "Complete the empty/full/read/write table and verify that empty has no live cell.",
          "Viết lại toàn bộ bốn phương trình từ một câu định nghĩa top.",
          "Rewrite all four equations from one sentence defining top.")
add_error("STACK_SETUP", "capacity-last-index", ["stack-setup.step.representation"],
          "Nhầm sức chứa với chỉ số cuối, ví dụ coi chỉ số 29 là 29 ô.",
          "Confusing capacity with the last index, such as treating index 29 as 29 cells.",
          "Mảng thiếu/thừa ô và điều kiện đầy sai.", "The array size and full condition are wrong.",
          "Đếm từ chỉ số 0 đến chỉ số cuối, bao gồm cả hai đầu.",
          "Count from index 0 through the last index inclusively.",
          "Vẽ dải chỉ số cho capacity 1 và capacity N trước khi khai báo.",
          "Draw index ranges for capacities 1 and N before declaring storage.",
          "official_qp_ms", refs_matching("STACK_SETUP", "elements", "array"),
          authority_note="Official criteria apply only to the cited source capacities; no fixed mark-loss claim is made.")

add_error("STACK_PUSH", "copied-update-order", ["stack-push.step.next-free-success", "stack-push.step.current-top-success"],
          "Sao thứ tự cập nhật top từ quy ước khác.", "Copying top-update order from the other convention.",
          "Ghi đè item cũ hoặc bỏ trống một ô; top không còn mô tả vùng live.",
          "An old item is overwritten or a gap is left; top no longer describes the live region.",
          "Chạy ca stack rỗng và ca còn đúng một ô; item mới phải ở đỉnh.",
          "Use empty and one-free-slot cases; the new item must become top.",
          "Từ định nghĩa top, suy ra ô ghi trước khi nhớ thứ tự câu lệnh.",
          "Derive the write cell from top meaning before memorising statement order.",
          "official_qp_ms", refs_matching("STACK_PUSH", "inserting", "storing", "incrementing"),
          authority_note="The cited MS atoms separately assess storage and pointer update under their own source conventions.")
add_error("STACK_PUSH", "mutates-when-full", ["stack-push.step.full-guard", "stack-push.step.failure"],
          "Tăng top hoặc ghi dữ liệu trước khi xử lý stack đầy.",
          "Incrementing top or writing data before handling a full stack.",
          "Truy cập vượt mảng hoặc làm hỏng state trong nhánh thất bại.",
          "The operation writes out of range or corrupts state on the failure path.",
          "Chụp state trước Push đầy và so sánh toàn bộ top/cells sau lời gọi.",
          "Snapshot state before a full Push and compare all cells/top afterwards.",
          "Đặt guard đầy trước mọi write và mọi cập nhật top.",
          "Place the full guard before every write and top update.",
          "official_qp_ms", refs_matching("STACK_PUSH", "full"),
          authority_note="Official full-check criteria are source-bound; non-mutation is the AlgoCore invariant used to prevent corruption.")
add_error("STACK_PUSH", "wrong-result-contract", ["stack-push.step.failure", "stack-push.step.return-check"],
          "Trả Boolean cho câu yêu cầu 1/−1, hoặc đổi message/kiểu kết quả.",
          "Returning Boolean where 1/-1 is required, or changing the required message/result type.",
          "Logic state có thể đúng nhưng giao diện câu hỏi và tiêu chí kết quả không đạt.",
          "State logic may be correct while the task interface and result criterion are not met.",
          "So sánh bảng hai nhánh với kiểu và literal trong QP.",
          "Compare both branches against the QP's type and literal.",
          "Viết test hợp đồng chỉ kiểm type/value ở success và full.",
          "Specify a contract test for type/value on success and full.",
          "official_qp_ms", refs_matching("STACK_PUSH", "returning", "outputting"),
          authority_note="Exact result obligations come from the cited QP/MS; alternatives are not generalised across papers.")

add_error("STACK_POP", "wrong-read-index", ["stack-pop.step.next-free-success", "stack-pop.step.current-top-success"],
          "Đọc top trong next-free hoặc đọc top−1 trong current-top.",
          "Reading top under next-free or top-1 under current-top.",
          "Trả ô chưa dùng hoặc phần tử kế dưới thay vì phần tử LIFO.",
          "An unused cell or the item below top is returned instead of the LIFO item.",
          "Dùng stack hai item khác nhau và đánh dấu chỉ số item mới nhất.",
          "Use two distinct items and label the newest item's index.",
          "Suy chỉ số đọc từ tập chỉ số live của quy ước.",
          "Derive the read index from the convention's live-index set.",
          "official_qp_ms", refs_matching("STACK_POP", "top data item", "top of the stack", "topofstack"),
          authority_note="The cited MS atoms distinguish top access and pointer update within each source convention.")
add_error("STACK_POP", "sentinel-type", ["stack-pop.step.contract", "stack-pop.step.failure"],
          "Dùng sentinel quen thuộc thay cho sentinel và kiểu mà đề yêu cầu.",
          "Using a familiar sentinel instead of the value and type required by the source.",
          "Caller hiểu sai empty hoặc phép so sánh không bao giờ đúng.",
          "The caller misreads empty or its comparison never succeeds.",
          "Lập bảng source → sentinel → type trước khi viết logic.",
          "Create a source-to-sentinel-to-type table before designing logic.",
          "Đổi test empty sang đúng literal và đúng type; không chuẩn hóa tùy tiện.",
          "Use the exact literal and type for empty; do not normalise it casually.",
          "official_qp_ms", refs_matching("STACK_POP", "returning -1", "returning string", "empty string", "no data", "-999"),
          authority_note="Sentinels are exact source contracts and are not interchangeable across official questions.")
add_error("STACK_POP", "mutates-empty", ["stack-pop.step.empty-guard", "stack-pop.step.failure"],
          "Giảm top khi stack đã rỗng.", "Decreasing top when the stack is already empty.",
          "Top vượt qua empty state và lần Push sau có thể ghi sai chỉ số.",
          "Top moves below the empty state and a later Push may use the wrong index.",
          "Gọi Pop hai lần trên stack rỗng và so sánh top trước/sau.",
          "Call Pop twice on empty and compare top before/after.",
          "Kết thúc ngay trong nhánh empty trước mutation.",
          "Return from the empty branch before mutation.")

add_error("STACK_PAIR", "missing-rollback", ["stack-pair.step.case-split-rollback"],
          "Một Pop thành công nhưng Pop còn lại thất bại, rồi bỏ luôn item đã lấy.",
          "One Pop succeeds, the other fails, and the removed item is discarded.",
          "Một yêu cầu ghép thất bại làm mất dữ liệu và thay đổi thứ tự các lần sau.",
          "A failed pair request loses data and changes later pair order.",
          "So sánh snapshot cả hai stack ở hai ca thất bại một phía.",
          "Compare both-stack snapshots for each one-sided failure.",
          "Push chính item thật đã lấy trở lại stack gốc trước khi kết thúc nhánh.",
          "Push the actual removed item back to its original stack before leaving the branch.",
          "official_qp_ms", refs_matching("STACK_PAIR", "pushing the removed"),
          authority_note="Official rollback criteria apply to the cited 2023 OutputItem source; the no-fixed-mark-loss rule remains in force.")
add_error("STACK_PAIR", "rollback-wrong-side", ["stack-pair.step.case-split-rollback"],
          "Thiếu colour nhưng lại Push sentinel colour, hoặc trả animal vào Colour.",
          "When colour is missing, pushing the colour sentinel or restoring animal into Colour.",
          "State không được phục hồi và có thể xuất hiện dữ liệu giả.",
          "State is not restored and fabricated data can appear.",
          "Ghi cặp `(item, origin stack, success flag)` cho cả hai kết quả.",
          "Record `(item, origin stack, success flag)` for both results.",
          "Rollback theo origin của kết quả thành công duy nhất.",
          "Roll back to the origin of the sole successful result.")
add_error("STACK_PAIR", "both-empty-sentinel-push", ["stack-pair.step.case-split-rollback", "stack-pair.step.postcheck"],
          "Khi cả hai rỗng, Push một sentinel như thể đó là item đã lấy.",
          "When both stacks are empty, pushing a sentinel as though it were a removed item.",
          "Stack rỗng trở thành stack chứa dữ liệu giả.",
          "An empty stack becomes a stack containing fabricated data.",
          "Thử riêng ca cả hai rỗng và kiểm size vẫn bằng 0.",
          "Test both-empty explicitly and confirm both sizes remain zero.",
          "Dùng success flag độc lập với giá trị; chỉ rollback item từ Pop thành công.",
          "Use success flags independently of values; roll back only an item from a successful Pop.",
          authority_note="Resolved by Lead decision P0-STACK-PAIR. Both-empty performs no restore, no mutation and no sentinel Push. Any both-empty message in an AlgoCore adaptation must be declared AlgoCore_inference and must not be presented as an official Cambridge literal.")

add_error("STACK_REDUCE", "reversed-operands", ["stack-reduce.step.apply"],
          "Tính `number operator total` thay vì `total operator number`.",
          "Computing `number operator total` instead of `total operator number`.",
          "Phép cộng/nhân có thể che lỗi nhưng trừ, chia và lũy thừa cho kết quả khác.",
          "Addition/multiplication may hide the defect, while subtraction, division and exponentiation change result.",
          "Dùng micro-case bắt đầu 10 rồi operator − và number 3; chỉ kiểm quan hệ, chưa chốt output chạy.",
          "Use a micro-case starting with 10 then operator - and number 3; inspect the relation without certifying runtime output.",
          "Ghi công thức invariant `total_after = total_before op next_number` bên cạnh bước apply.",
          "Write the invariant `total_after = total_before op next_number` beside apply.",
          "official_qp_ms", refs_matching("STACK_REDUCE", "performing correct calculation"),
          authority_note="The official 2025 expression contract is a left-to-right total/operator/number sequence; no exact mark-loss claim is made.")
add_error("STACK_REDUCE", "sentinel-as-data", ["stack-reduce.step.consume-next", "stack-reduce.step.finish"],
          "Đưa sentinel empty vào phép tính hoặc so sánh min/max.",
          "Using the empty sentinel as an operand or extrema candidate.",
          "Kết quả bị đổi và vòng lặp có thể xử lý thêm một item giả.",
          "The result changes and the loop may process one fabricated item.",
          "Đếm useful Pop bằng số item live ban đầu; sentinel không được tăng số này.",
          "Count useful Pops against initial live items; the sentinel must not increase that count.",
          "Kiểm empty ngay sau Pop hoặc dùng pointer guard được nguồn cho phép.",
          "Check empty immediately after Pop or use the source-permitted pointer guard.",
          "official_qp_ms", refs_matching("STACK_REDUCE", "until the stack is empty", "no items left"),
          authority_note="Official sources require consumption until empty; the invariant prevents a sentinel from becoming data.")
add_error("STACK_REDUCE", "zero-extrema-initialisation", ["stack-reduce.step.first-value", "stack-reduce.step.apply"],
          "Khởi tạo highest/lowest bằng 0 thay vì item đầu tiên.",
          "Initialising highest/lowest to zero instead of the first item.",
          "Tập toàn âm hoặc toàn dương có thể tạo một cực trị không tồn tại trong stack.",
          "All-negative or all-positive data can produce an extremum absent from the stack.",
          "Dùng ca toàn âm và xác nhận cả hai cực trị đều là item đã Pop.",
          "Use an all-negative case and require both extrema to be popped items.",
          "Khởi tạo cả min và max bằng Pop live đầu tiên.",
          "Initialise both minimum and maximum from the first live Pop.")

errors_by_pattern = {p: [e["error_id"] for e in errors if e["pattern_id"] == p] for p in PATTERNS}


cards = []
for pattern in PATTERNS:
    cat = catalog[pattern]
    block = blocks[pattern]
    issues = sorted({i for r in rows_by_pattern[pattern] for i in r.get("source_issue_refs", [])})
    cards.append({
        "card_id": f"ac-9618-p4-2026-python.stage4.pattern.{pattern.lower().replace('_', '-')}",
        "pattern_id": pattern,
        "version": VERSION,
        "status": "SUBMITTED",
        "package_id": PACKAGE_ID,
        "lesson_id": LESSON_ID,
        "knowledge_block_ids": [block["block_id"]],
        "objective_ids": objective_ids[pattern],
        "titles": bi(cat["name_vi"], cat["name_en"]),
        "recognition": bi(cat["recognition_vi"], recognition_en[pattern]),
        "source_scope": {
            "assessed_part_ids": cat["assessed_part_ids"],
            "representative_parts": [x for x in official_refs[pattern] if x["part_id"] in representative_ids[pattern]],
            "official_source_refs": official_refs[pattern],
            "corpus_limit": corpus_limits[pattern],
        },
        "confusable_pattern_refs": confusables[pattern],
        "confusable_contrast_refs": ["A3C16"] if pattern in {"STACK_SETUP", "STACK_PUSH", "STACK_POP"} else [],
        "source_issue_refs": issues,
        "source_fidelity_policies": [s2_fidelity_policy] if any(r["source_batch"] == "2023-2024" for r in rows_by_pattern[pattern]) else [],
        "book_foundation_refs": [
            {
                "section_id": sid,
                "source_id": book_sections[sid]["source_id"],
                "printed_pages": book_sections[sid]["printed_pages"],
                "pdf_pages": book_sections[sid]["pdf_pages"],
                "support_level": book_sections[sid]["support_level"],
                "limitations": book_sections[sid]["limitations"],
                "authority": "coursebook_foundation",
            }
            for sid in block["book_section_ids"]
        ],
        "applicability": applicability[pattern],
        "method_steps": methods[pattern],
        "marking_point_refs": all_mp_refs(pattern),
        "assessment_requirement_refs": requirement_refs[pattern],
        "error_refs": errors_by_pattern[pattern],
        "solution_design_ref": f"p0.stack.solution.{pattern.lower().replace('_', '-')}",
        "visual_brief_ref": f"p0.stack.visual.{pattern.lower().replace('_', '-')}",
        "authority_labels": [
            "official_qp", "official_ms", "official_syllabus", "coursebook_foundation",
            "AlgoCore_inference", "AlgoCore_risk",
        ],
        "authority_note": "Official obligations are limited to cited QP/MS rows. General method, invariant and repair advice is AlgoCore inference/risk. Batch fidelity policies guide use of extraction but are not per-part source issues.",
        "downstream_status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
    })


variant_register = {
    "schema_version": VERSION,
    "status": "SUBMITTED",
    "batch_id": "P0-stack",
    "input_hashes": input_hashes,
    "variants": [
        {
            "variant_id": "p0.stack.variant.top-pointer",
            "pattern_ids": ["STACK_SETUP", "STACK_PUSH", "STACK_POP"],
            "stage2_contrast_refs": ["A3C16"],
            "axis": "top_pointer_meaning",
            "decision_rule": bi("Đọc định nghĩa/khởi tạo top trong QP rồi dùng đúng một hàng phương trình.", "Read the QP definition/initialisation of top and use exactly one equation row."),
            "cases": [
                {"case_id": "next_free", "empty": "top=0", "full": "top=capacity", "live_indices": "0..top-1", "push": "write stack[top], then top+=1", "pop": "save stack[top-1], then top-=1", "observed_parts": ["9618_s22_42_1(a)", "9618_s23_41_3(a)", "9618_s23_43_3(a)", "9618_w23_42_1(a)(ii)"]},
                {"case_id": "current_top", "empty": "top=-1", "full": "top=capacity-1", "live_indices": "0..top", "push": "top+=1, then write stack[top]", "pop": "save stack[top], then top-=1", "observed_parts": ["9618_s25_42_1(a)", "9618_w25_41_1(a)"]},
            ],
            "invariant": "Logical size is top for next-free and top+1 for current-top; all live indices are in range.",
            "method_changing": True,
        },
        {
            "variant_id": "p0.stack.variant.push-result",
            "pattern_ids": ["STACK_PUSH"],
            "axis": "return_and_routing_contract",
            "decision_rule": bi("Giữ nguyên type/literal và routing của từng QP; không chuẩn hóa sang Boolean.", "Preserve each QP's type/literal and routing; do not normalise to Boolean."),
            "cases": [
                {"case_id": "boolean", "observed_parts": ["9618_s22_42_1(c)", "9618_s23_41_3(b)(i)", "9618_s23_43_3(b)(i)", "9618_w25_41_1(b)"]},
                {"case_id": "integer_1_minus1", "observed_parts": ["9618_s25_42_1(b)"]},
                {"case_id": "route_and_message", "observed_parts": ["9618_w23_42_1(b)(i)"]},
            ],
            "invariant": "On failure state is unchanged; on success logical size increases by exactly one.",
            "method_changing": True,
        },
        {
            "variant_id": "p0.stack.variant.pop-empty-result",
            "pattern_ids": ["STACK_POP"],
            "axis": "empty_sentinel_and_type",
            "decision_rule": bi("Sentinel là một phần của giao diện caller; chép đúng literal và type từ QP.", "The sentinel is part of the caller interface; preserve the exact QP literal and type."),
            "cases": [
                {"case_id": "numeric_minus1", "observed_parts": ["9618_s22_42_1(e)(i)"]},
                {"case_id": "empty_string", "observed_parts": ["9618_s23_41_3(b)(ii)", "9618_s23_43_3(b)(ii)"]},
                {"case_id": "no_data_string", "observed_parts": ["9618_w23_42_1(c)"]},
                {"case_id": "string_minus1", "observed_parts": ["9618_s25_42_1(c)"]},
                {"case_id": "numeric_minus999", "observed_parts": ["9618_w25_41_1(c)"]},
            ],
            "invariant": "Empty Pop returns the exact sentinel without mutating top or live cells.",
            "method_changing": True,
        },
        {
            "variant_id": "p0.stack.variant.pair-transaction",
            "pattern_ids": ["STACK_PAIR"],
            "axis": "pair_success_and_rollback",
            "decision_rule": bi("Commit hai Pop khi cả hai thành công; nếu đúng một thành công thì phục hồi item đó.", "Commit both Pops when both succeed; restore the sole successful item otherwise."),
            "cases": [
                {"case_id": "both_live", "state_change": "sizeA-1,sizeB-1; output pair"},
                {"case_id": "a_empty_b_live", "state_change": "restore B; no net mutation"},
                {"case_id": "a_live_b_empty", "state_change": "restore A; no net mutation"},
                {"case_id": "both_empty", "state_change": "no restore; no mutation; no sentinel push; any adaptation message is explicitly AlgoCore_inference and is not an official Cambridge literal"},
            ],
            "invariant": "A failed pairing leaves both logical stack states equal to their before-state.",
            "method_changing": True,
            "corpus_limit": "Only the 2023 mirrored OutputItem task is observed; both-empty is not explicitly specified.",
            "lead_adjudication": {
                "decision_id": "P0-STACK-PAIR",
                "authority": "AlgoCore_inference",
                "decision": "Use independent typed success/value results. Commit only when both succeed; restore the sole successful item exactly once; when both are empty, perform no restore, no mutation and no sentinel Push. Any adaptation message is explicitly AlgoCore_inference and is not an official Cambridge literal.",
                "official_boundary": "The official source establishes one-sided restoration but does not explicitly specify both-empty behaviour.",
                "stage5_obligation": "Execute all four cases and assert no sentinel is ever pushed as data.",
            },
        },
        {
            "variant_id": "p0.stack.variant.reduce-protocol",
            "pattern_ids": ["STACK_REDUCE"],
            "axis": "reduction_kind_operator_order_termination",
            "decision_rule": bi("Dùng grammar dữ liệu và output contract để chọn invariant trước khi lặp.", "Use the data grammar and output contract to select the invariant before looping."),
            "cases": [
                {"case_id": "expression_left_fold", "observed_parts": ["9618_s25_42_1(e)"], "operator_order": "total_before operator next_number", "termination": "empty after complete pairs"},
                {"case_id": "extrema", "observed_parts": ["9618_w25_41_1(e)"], "operator_order": "not applicable", "termination": "Pop until empty"},
            ],
            "invariant": "Accumulator summarises exactly the consumed prefix and no sentinel is treated as live data.",
            "method_changing": True,
        },
    ],
    "self_checks": {"pattern_set": PATTERNS, "variant_count": 5, "method_changing_variants": 5},
}


solutions = []
solution_specs = {
    "STACK_SETUP": {
        "input": "QP declarations: identifiers, capacity, element type, scope, top meaning and optional initial-cell values.",
        "input_vi": "Các khai báo trong QP: tên, sức chứa, kiểu phần tử, phạm vi, ý nghĩa top và yêu cầu khởi tạo ô nếu có.",
        "output": "A coherent empty array-backed stack state with explicit convention equations.",
        "output_vi": "Một trạng thái stack rỗng dùng mảng, nhất quán với bộ phương trình quy ước đã ghi rõ.",
        "state": "storage[0..capacity-1], top, live-index set",
        "pre": ["capacity > 0", "exactly one pointer convention selected"],
        "post": ["logical size is zero", "all required names/types/scope match QP"],
        "inv": ["next_free: live=[0,top)", "current_top: live=[0,top]", "0 <= logical_size <= capacity"],
        "mutation": ["Only initial state is established; cell sentinels are written only when explicitly required."],
        "term": "Finite declaration and consistency checklist.",
        "failure": ["Ambiguous top meaning blocks operation design and must be resolved from QP/facsimile."],
        "alts": ["next_free", "current_top"],
        "normal": ["capacity N empty initialisation under each observed convention"],
        "boundary": ["capacity 1", "required cell initialisation versus unspecified cells"],
        "counter": ["top=0 interpreted as current-top", "capacity confused with last index"],
    },
    "STACK_PUSH": {
        "input": "One item plus a finite stack state and exact return/message contract.",
        "input_vi": "Một item, trạng thái stack hữu hạn và hợp đồng giá trị trả về/thông báo chính xác.",
        "output": "Success result with item committed, or failure result with unchanged state.",
        "output_vi": "Kết quả thành công với item đã được commit, hoặc kết quả thất bại với state giữ nguyên.",
        "state": "storage, top, capacity, selected top convention",
        "pre": ["stack state satisfies its representation invariant"],
        "post": ["success => size+1 and new top item", "failure => identical logical state"],
        "inv": ["older item order is preserved", "top remains within convention bounds"],
        "mutation": ["No mutation before the full guard", "Exactly one cell and top change on success"],
        "term": "One full guard followed by one finite success/failure path.",
        "failure": ["full returns exact contract result without mutation"],
        "alts": ["next-free write-then-increment", "current-top increment-then-write"],
        "normal": ["empty to one item", "partially filled success"],
        "boundary": ["one free slot", "already full"],
        "counter": ["copy update order from other convention", "wrong result type"],
    },
    "STACK_POP": {
        "input": "A finite stack state plus exact empty sentinel/type.",
        "input_vi": "Trạng thái stack hữu hạn cùng sentinel rỗng và kiểu dữ liệu chính xác.",
        "output": "Most recently pushed item with size-1, or exact empty result with unchanged state.",
        "output_vi": "Item được Push gần nhất với size giảm một, hoặc kết quả empty chính xác và state không đổi.",
        "state": "storage, top, selected top convention",
        "pre": ["stack state satisfies its representation invariant"],
        "post": ["success => LIFO item and size-1", "empty => unchanged logical state"],
        "inv": ["remaining item order is preserved", "top never moves below empty"],
        "mutation": ["Save the live item before pointer mutation", "Cell clearing is not assumed unless specified"],
        "term": "One empty guard followed by one finite success/failure path.",
        "failure": ["empty returns exact sentinel without pointer mutation"],
        "alts": ["next-free read top-1", "current-top read top"],
        "normal": ["two items then Pop"],
        "boundary": ["one item", "empty"],
        "counter": ["decrement before saving under current-top", "wrong sentinel type"],
    },
    "STACK_PAIR": {
        "input": "Two stacks with Pop/Push interfaces and required pair/message format.",
        "input_vi": "Hai stack với giao diện Pop/Push và format cặp/thông báo bắt buộc.",
        "output": "One committed pair or a failure message with both stacks restored.",
        "output_vi": "Một cặp được commit, hoặc thông báo thất bại với cả hai stack được phục hồi.",
        "state": "before/after snapshots of stack A and B plus two Pop success flags",
        "pre": ["both stack interfaces are known", "Push can restore a just-popped item"],
        "post": ["both success => each size-1", "otherwise => both logical states equal before-state"],
        "inv": ["sentinels are not live items", "rollback target equals successful item's origin"],
        "mutation": ["Two tentative Pops", "Commit both or restore the sole successful Pop"],
        "term": "Four-case decision table; exactly one disposition per case.",
        "failure": ["one-sided empty triggers rollback", "both-empty requires no sentinel Push"],
        "alts": ["Pop order may vary only if message priority and rollback remain source-compliant"],
        "normal": ["both stacks non-empty"],
        "boundary": ["each one-sided empty case", "both empty"],
        "counter": ["rollback wrong stack", "blindly Push an empty sentinel"],
    },
    "STACK_REDUCE": {
        "input": "A non-empty source-conforming stack and Pop contract; expression grammar or extrema requirement.",
        "input_vi": "Một stack không rỗng đúng hợp đồng nguồn và hợp đồng Pop; kèm grammar biểu thức hoặc yêu cầu cực trị.",
        "output": "Final left-fold total or required extrema output; stack drained.",
        "output_vi": "Total cuối theo left fold hoặc output cực trị bắt buộc; stack đã được lấy hết item live.",
        "state": "top, current Pop result, accumulator, optional operator",
        "pre": ["source stack is non-empty", "expression source alternates operator then number after first number"],
        "post": ["no live items remain", "accumulator covers every original live item exactly once"],
        "inv": ["expression: accumulator is left fold of consumed prefix", "extrema: min/max are extrema of consumed prefix"],
        "mutation": ["Repeated Pop is destructive", "sentinel is never accumulated"],
        "term": "Each useful Pop reduces logical size; finite capacity implies termination at empty.",
        "failure": ["malformed operator-number sequence is outside the stated 2025 source precondition", "empty initial input needs an explicit future policy"],
        "alts": ["pointer empty guard or Pop sentinel where source permits", "expression fold versus extrema scan"],
        "normal": ["multiple expression pairs", "mixed extrema values"],
        "boundary": ["single value", "one operator-number pair", "all-negative extrema"],
        "counter": ["reversed non-commutative operands", "sentinel as data", "zero extrema initialisation"],
    },
}

for pattern in PATTERNS:
    spec = solution_specs[pattern]
    issue_refs = sorted({i for r in rows_by_pattern[pattern] for i in r.get("source_issue_refs", [])})
    solutions.append({
        "solution_design_id": f"p0.stack.solution.{pattern.lower().replace('_', '-')}",
        "pattern_id": pattern,
        "variant_id": f"p0.stack.variant.{ {'STACK_SETUP':'top-pointer','STACK_PUSH':'top-pointer','STACK_POP':'top-pointer','STACK_PAIR':'pair-transaction','STACK_REDUCE':'reduce-protocol'}[pattern] }",
        "input_contract": bi(spec["input_vi"], spec["input"]),
        "output_contract": bi(spec["output_vi"], spec["output"]),
        "state_model": spec["state"],
        "representation": applicability[pattern]["representation"],
        "preconditions": spec["pre"],
        "postconditions": spec["post"],
        "invariants": spec["inv"],
        "ordered_method_step_ids": [x["step_id"] for x in methods[pattern]],
        "mutation_and_preservation_rules": spec["mutation"],
        "termination_argument": spec["term"],
        "failure_paths": spec["failure"],
        "alternative_designs": spec["alts"],
        "stage5_test_obligations": {
            "normal": spec["normal"],
            "boundary": spec["boundary"],
            "counterexample": spec["counter"],
            "source_fixture": [r["part_id"] for r in official_refs[pattern]],
        },
        "source_constraints": official_refs[pattern],
        "source_issue_dispositions": [
            {"source_issue_id": i, "stage4_disposition": "Preserve original facsimile locator and do not certify extracted/source code.", "stage5_obligation": "Transcribe from facsimile and execute boundary tests."}
            for i in issue_refs
        ],
        "status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
    })


worked_specs = []
example_specs = {
    "STACK_SETUP": ("Thiết kế hai snapshot rỗng có cùng capacity nhưng dùng hai quy ước top.", "Design two empty snapshots with the same capacity but different top conventions.", ["label live/unused cells", "derive empty/full/read/write equations"], ["capacity 1", "cells prefilled with a source sentinel versus unspecified cells"]),
    "STACK_PUSH": ("Cho cùng state logic dưới hai quy ước và yêu cầu dự đoán ô ghi cùng top sau Push.", "Represent the same logical state under both conventions and predict the write cell and post-Push top.", ["identify full guard", "choose update order", "state success/failure contract"], ["one free slot", "full non-mutating call"]),
    "STACK_POP": ("Cho hai item phân biệt và yêu cầu xác định chỉ số đọc, item trả và top sau Pop.", "Use two distinct items and determine read index, returned item and post-Pop top.", ["check empty", "save correct live item", "apply exact sentinel type"], ["single item", "empty under each convention"]),
    "STACK_PAIR": ("Dùng bảng bốn trạng thái để quyết định commit/rollback của hai stack.", "Use a four-state table to decide commit or rollback for two stacks.", ["record both Pop success flags", "restore sole successful result", "preserve one-sided source literals and label any both-empty adaptation message AlgoCore_inference"], ["A empty/B live", "A live/B empty", "both empty"]),
    "STACK_REDUCE": ("So sánh một fold có phép không giao hoán với một ca tìm cực trị toàn âm.", "Contrast a non-commutative left fold with an all-negative extrema case.", ["initialise from first live value", "preserve total op number order", "exclude sentinel"], ["single value", "one complete operator-number pair", "all-negative extrema"]),
}
anchor_choice = {
    "STACK_SETUP": "9618_s22_42_1(a)",
    "STACK_PUSH": "9618_s22_42_1(c)",
    "STACK_POP": "9618_s22_42_1(e)(i)",
    "STACK_PAIR": "9618_s23_41_3(c)",
    "STACK_REDUCE": "9618_s25_42_1(e)",
}
for pattern in PATTERNS:
    vi, en, checkpoints, micro = example_specs[pattern]
    anchor = next(x for x in official_refs[pattern] if x["part_id"] == anchor_choice[pattern])
    worked_specs.append({
        "worked_example_spec_id": f"p0.stack.example.{pattern.lower().replace('_', '-')}",
        "pattern_id": pattern,
        "status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
        "origin": "AlgoCore_original_adaptation_spec",
        "anchor_source": anchor,
        "prompt_design": bi(vi, en),
        "representation_and_convention": applicability[pattern]["decision_rule"],
        "method_step_refs": [x["step_id"] for x in methods[pattern]],
        "learner_checkpoints": checkpoints,
        "contrast_and_boundary_microcases": micro,
        "evidence_to_capture_later": ["initial state", "decision at each guard", "state-changing event sequence", "postcondition check"],
        "prohibited_stage4_claims": ["No executable code", "No certified trace", "No final runtime output", "No official marks assigned to the original adaptation"],
        "stage5_handoff": "Create fixtures and verify implementation/trace against the stated invariants and exact source contract.",
    })


visuals = []
visual_spec = {
    "STACK_SETUP": ("Top đang chỉ điều gì, và điều đó làm thay đổi vùng live thế nào?", "What does top point to, and how does that change the live region?", ["DECLARE_STORAGE", "SET_TOP_CONVENTION", "MARK_LIVE_RANGE", "CHECK_EMPTY_FULL"], ["storage cells", "top arrow", "live/unused partition", "capacity"], "Dự đoán empty, full, read và write index trước khi lộ đáp án.", "Predict empty, full, read and write indices before revealing them."),
    "STACK_PUSH": ("Vì sao một quy ước ghi trước còn quy ước kia tăng top trước?", "Why does one convention write first while the other increments top first?", ["CHECK_FULL", "MOVE_TOP", "WRITE_CELL", "RETURN_RESULT", "REJECT_FULL"], ["before/after top", "written cell", "logical size", "return result"], "Chọn event kế tiếp cho từng quy ước ở trạng thái còn một ô.", "Choose the next event for each convention with one free slot."),
    "STACK_POP": ("Phải đọc ô nào trước khi cập nhật top để giữ LIFO?", "Which cell must be read before updating top to preserve LIFO?", ["CHECK_EMPTY", "READ_TOP_ITEM", "MOVE_TOP", "RETURN_ITEM", "RETURN_SENTINEL"], ["before/after top", "read index", "saved item", "sentinel type"], "Chọn read index và dự đoán state khi chỉ còn một item.", "Choose the read index and predict state when one item remains."),
    "STACK_PAIR": ("Khi chỉ một Pop thành công, event nào phục hồi giao dịch?", "When only one Pop succeeds, which event restores the transaction?", ["POP_A", "POP_B", "CLASSIFY_PAIR", "ROLLBACK_A", "ROLLBACK_B", "COMMIT_PAIR", "EMIT_MESSAGE"], ["both before/after stacks", "two success flags", "tentative removals", "commit/rollback status"], "Dự đoán stack nào phải rollback trong ba failure cases.", "Predict which stack must roll back in the three failure cases."),
    "STACK_REDUCE": ("Accumulator đại diện cho prefix nào và item tiếp theo thay đổi nó ra sao?", "Which consumed prefix does the accumulator represent, and how does the next item change it?", ["POP_FIRST", "POP_OPERATOR", "POP_OPERAND", "APPLY_LEFT_FOLD", "UPDATE_MIN", "UPDATE_MAX", "DETECT_EMPTY"], ["top", "current token", "operator", "accumulator", "consumed/unconsumed partition"], "Dự đoán hướng toán hạng cho phép trừ và cách min/max khởi tạo.", "Predict operand direction for subtraction and how min/max should initialise."),
}
visual_cases = {
    "STACK_SETUP": {
        "normal": bi("Cùng capacity và cùng hai item logic: đặt cạnh snapshot next-free và current-top để so sánh top cùng vùng live.", "For the same capacity and two logical items, compare next-free and current-top snapshots, top values and live regions."),
        "boundary": bi("So sánh state rỗng và đầy của cả hai quy ước; từ đó suy empty/full/read/write equations.", "Compare empty and full states under both conventions, then derive empty/full/read/write equations."),
        "failure": bi("Cố ý ghép top khởi tạo của một quy ước với live-range equation của quy ước kia để học sinh phát hiện mâu thuẫn.", "Deliberately combine one convention's initial top with the other's live-range equation so learners detect the contradiction."),
    },
    "STACK_PUSH": {
        "normal": bi("Stack còn nhiều hơn một ô: dự đoán write-index, top sau thao tác và success result theo quy ước đã chọn.", "With more than one free slot, predict write index, post-operation top and success result under the selected convention."),
        "boundary": bi("Chạy liên tiếp ca còn đúng một ô và ca đã đầy; lần đầu commit một item, lần sau phải giữ nguyên toàn bộ state.", "Run the one-free-slot case followed by the full case; the first commits one item and the second preserves all state."),
        "failure": bi("Cho thứ tự cập nhật của quy ước đối lập hoặc mutation trước full guard để quan sát overwrite/out-of-range và rollback cần thiết.", "Use the opposite convention's update order or mutate before the full guard to expose overwrite/out-of-range behaviour and the required non-mutation."),
    },
    "STACK_POP": {
        "normal": bi("Stack có hai item khác nhau: đánh dấu ô LIFO, item đã lưu và top sau Pop dưới từng quy ước.", "With two distinct items, mark the LIFO cell, saved item and post-Pop top under each convention."),
        "boundary": bi("Từ stack một item thực hiện một Pop thành công rồi một Pop empty; kiểm size về 0 và lần thứ hai không mutation.", "From a one-item stack, perform one successful Pop then one empty Pop; verify size reaches zero and the second call does not mutate state."),
        "failure": bi("Đảo read/update order hoặc dùng sai kiểu sentinel để làm lộ item trả sai và caller không nhận ra empty.", "Reverse read/update order or use the wrong sentinel type to expose an incorrect returned item and failed empty detection by the caller."),
    },
    "STACK_PAIR": {
        "normal": bi("Cả hai Pop thành công: commit hai lần xóa và emit cặp theo thứ tự nguồn, không rollback.", "Both Pops succeed: commit both removals and emit the pair in source order with no rollback."),
        "boundary": bi("Dùng đủ bốn case: both success; left-only; right-only; both empty. Hai ca một phía restore đúng một lần; both-empty không restore, không mutation.", "Use all four cases: both success, left-only, right-only and both empty. One-sided cases restore exactly once; both-empty performs no restore and no mutation."),
        "failure": bi("Cho rollback nhầm stack hoặc Push sentinel ở both-empty; visual phải chỉ ra state giả và gắn message both-empty tự biên soạn là AlgoCore_inference.", "Restore the wrong stack or Push a sentinel in both-empty; show the fabricated state and label any authored both-empty message AlgoCore_inference."),
    },
    "STACK_REDUCE": {
        "normal": bi("Left fold có phép không giao hoán: theo dõi `total_before operator next_number` qua từng cặp operator–number mà chưa chứng nhận output chạy.", "For a non-commutative left fold, track `total_before operator next_number` across each operator-number pair without certifying runtime output."),
        "boundary": bi("Đặt cạnh ca biểu thức chỉ có một số và ca extrema toàn số âm; accumulator/min/max đều khởi tạo từ item live đầu tiên.", "Compare a single-number expression with all-negative extrema; total/min/max all initialise from the first live item."),
        "failure": bi("Chuỗi thiếu number sau operator hoặc stack rỗng ban đầu nằm ngoài precondition nguồn; chỉ ghi thành contract decision và test obligation Stage 5, không gọi là Cambridge requirement.", "An operator lacking a following number or an initially empty stack is outside the source precondition; record it only as a contract decision and Stage 5 test obligation, not a Cambridge requirement."),
    },
}
for pattern in PATTERNS:
    qvi, qen, events, state, pvi, pen = visual_spec[pattern]
    cases = visual_cases[pattern]
    visuals.append({
        "visual_brief_id": f"p0.stack.visual.{pattern.lower().replace('_', '-')}",
        "pattern_id": pattern,
        "method_step_refs": [x["step_id"] for x in methods[pattern]],
        "error_refs": errors_by_pattern[pattern],
        "learning_question": bi(qvi, qen),
        "visual_mode": "event_driven",
        "state_to_show": state,
        "proposed_event_types": events,
        "predict_prompt": bi(pvi, pen),
        "normal_case": cases["normal"],
        "boundary_case": cases["boundary"],
        "failure_case": cases["failure"],
        "representation_and_convention": applicability[pattern]["conventions"],
        "static_fallback": bi("Hai snapshot before/after kèm bảng top, vùng live và invariant.", "Two before/after snapshots with a top/live-region/invariant table."),
        "accessibility_notes": ["Never rely on colour alone for live/unused or success/failure.", "Provide text labels for top and indices.", "Expose an event list compatible with keyboard step controls at Stage 7/8."],
        "status": "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD",
    })


common = {"schema_version": VERSION, "status": "SUBMITTED", "batch_id": "P0-stack", "input_hashes": input_hashes}
write_json("PATTERN_CARDS.json", {**common, "pattern_cards": cards, "self_checks": {"pattern_count": len(cards), "pattern_ids": PATTERNS, "assessed_part_pattern_links": sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards)}})
write_json("VARIANT_INVARIANT_REGISTER.json", variant_register)
write_json("ERROR_PREVENTION.json", {**common, "error_rows": errors, "self_checks": {"row_count": len(errors), "patterns_covered": sorted(errors_by_pattern)}})
write_json("SOLUTION_DESIGNS.json", {**common, "solution_designs": solutions, "self_checks": {"design_count": len(solutions), "all_statuses": sorted({x["status"] for x in solutions})}})
write_json("WORKED_EXAMPLE_SPECS.json", {**common, "worked_example_specs": worked_specs, "self_checks": {"spec_count": len(worked_specs), "primary_anchor_per_pattern": True}})
write_json("VISUAL_BRIEFS.json", {**common, "visual_briefs": visuals, "self_checks": {"brief_count": len(visuals), "event_driven_count": sum(x["visual_mode"] == "event_driven" for x in visuals)}})

unique_parts = sorted({r["part_id"] for p in PATTERNS for r in rows_by_pattern[p]})
mp_count = sum(len(applicable_mps(p, r)) for p in PATTERNS for r in rows_by_pattern[p])
review = f"""# P0 Stack method submission review

Status: **SUBMITTED**. This is a method-team submission for Lead/A1/A5/A8 review; it is not `PILOT_GATE=PASS`.

## Scope and coverage

- Exact pattern set: 5/5 — `{', '.join(PATTERNS)}`.
- Stage 2 assessed relations: {sum(len(catalog[p]['assessed_part_ids']) for p in PATTERNS)} part-pattern links.
- Unique official source parts joined: {len(unique_parts)}; official marking atoms referenced: {mp_count}.
- Method cards: {len(cards)}; solution designs: {len(solutions)}; primary worked-example specs: {len(worked_specs)}; preliminary visual briefs: {len(visuals)}.
- Error-prevention rows: {len(errors)}. No row claims an exact number of marks lost.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; all visuals remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Method decisions submitted

1. Next-free and current-top use separate equations and state-transition steps. A3C16 is carried explicitly; the submission never copies one update order into the other.
2. Failed Push/Pop operations are non-mutating. Exact Boolean, integer, string or message contracts remain tied to their source parts.
3. Stack pairing is treated as a small transaction: both successful Pops commit; exactly one successful Pop is restored to its origin stack.
4. Expression reduction uses `total_before operator next_number`; extrema initialise from the first live value. Both variants drain the stack and exclude the empty sentinel from data.
5. Coursebook sections are foundations only. `STACK_PAIR` and `STACK_REDUCE` remain explicit QP/MS + AlgoCore synthesis because the book does not supply their full protocols.

## Source boundaries and Lead decision

- Lead decision `P0-STACK-PAIR` resolves the method design: use independent typed success/value results; both success commits, a sole success is restored exactly once, and both empty performs no restore, no mutation and no sentinel Push. Any message authored for the both-empty adaptation is explicitly `AlgoCore_inference` and must not be presented as an official Cambridge literal. Stage 5 must execute all four cases.
- The 2023 extraction issue `S4-S2-S23-QP-ARROW-EXTRACTION` affects Pop/adaptation parts; original facsimiles remain authoritative for assignment direction.
- `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` is retained as a non-source batch policy: plain extraction cannot certify layout, arrows, indentation or underscores. It is not present in any card or source row's `source_issue_refs`; source listings remain unexecuted.
- `STACK_PAIR` is one normalized mirrored task group. `STACK_REDUCE` has two 2025 groups. Neither supports frequency claims or universal variants.
- Empty initial input for the 2025 reduction tasks is outside the stated source flow. It is retained as a Stage 5 boundary obligation, not an official requirement.

## Rework 1 response

- Rebuilt against the resubmitted S4-S2 and S4-S3 marking/risk hashes listed below.
- Removed `S4-S2-LAYOUT-CODE-FIDELITY` from all P0 `source_issue_refs`; the replacement policy is stored only in `source_fidelity_policies` with `is_source_issue=false`.
- Retained the located arrow-extraction issue on the four affected 2023 source parts.
- Absorbed the corrected semantics for `9618_s25_42_1(e)`: atoms mp.04–mp.07 now each retain explicit value 1; mp.05 is `discrete` with no alternative route. Dependencies on continuation atoms remain source metadata.
- Other S2 re-atomisation and S3 risk fixes do not join the five Stack patterns; their input hashes are still refreshed so later drift is detectable.

## Rework 2 response

- Closed both stale phrases left after `P0-STACK-PAIR`; there is no open Lead decision.
- The both-empty variant now states no restore, no mutation and no sentinel Push.
- The corresponding error authority note states that any authored both-empty message is `AlgoCore_inference`, not an official Cambridge literal.
- Replaced the repeated generic normal/boundary/failure text in all five visual briefs with pattern-specific cases, including the four Pair transactions and Reduce's non-commutative/all-negative cases. Malformed or initially-empty Reduce inputs are labelled Stage 5 contract obligations outside the cited source precondition.

## Self-review result

The builder and validator compare every card's assessed-part set with Stage 2, require exact QP/MS locators for each official atom, check bilingual fields, stable joins, method-step coverage, rollback/reduction invariants and downstream statuses. Submission status remains `SUBMITTED`; independent review and Lead gate are still required.

## Input hashes

""" + "\n".join(f"- `{x['path']}` — `{x['sha256']}`" for x in input_hashes) + "\n"
(HERE / "REVIEW.md").write_text(review, encoding="utf-8")

changed_input_paths = list(PRE_REWORK_INPUT_HASHES)
current_hashes = {x["path"]: x["sha256"] for x in input_hashes}
artifact_names = [
    "PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json", "ERROR_PREVENTION.json",
    "SOLUTION_DESIGNS.json", "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json", "REVIEW.md",
]
rework_response = {
    "schema_version": "s4-p0-stack-rework-response-v1",
    "status": "RESUBMITTED",
    "batch_id": "P0-stack",
    "rework_round": 2,
    "scope": PATTERNS,
    "trigger": "Lead pass 1 found two stale P0-STACK-PAIR phrases; A8 pre-review also found repeated generic normal/boundary/failure text across the five visual briefs.",
    "prior_rework_rounds": [
        {
            "rework_round": 1,
            "status": "RESUBMITTED",
            "trigger": "S4-S2 and S4-S3 marking/risk submissions changed after A8 source findings.",
            "source_input_hash_changes": [
                {"path": path, "old_sha256": ROUND1_OLD_INPUT_HASHES[path], "new_sha256": PRE_REWORK_INPUT_HASHES[path]}
                for path in PRE_REWORK_INPUT_HASHES
            ],
            "change_ids": ["P0-R1-S2-FIDELITY-POLICY", "P0-R1-S2-LOCATED-RISK", "P0-R1-S3-STACK-REDUCE-ATOMS", "P0-R1-NONJOINING-SOURCE-CHANGES", "P0-R1-PAIR-DECISION-CARRYOVER"],
            "validation": {"result": "PASS", "checks": 1426, "failed": 0},
        }
    ],
    "input_hash_changes": [
        {
            "path": path,
            "old_sha256": PRE_REWORK_INPUT_HASHES[path],
            "new_sha256": current_hashes[path],
            "changed": PRE_REWORK_INPUT_HASHES[path] != current_hashes[path],
        }
        for path in changed_input_paths
    ],
    "exact_changes": [
        {
            "change_id": "P0-R2-PAIR-STALE-ADJUDICATION",
            "affected_patterns": ["STACK_PAIR"],
            "affected_artifacts": ["VARIANT_INVARIANT_REGISTER.json", "ERROR_PREVENTION.json", "WORKED_EXAMPLE_SPECS.json", "REVIEW.md"],
            "result": "Replaced both stale pending-adjudication phrases with the resolved treatment: no restore, no mutation and no sentinel Push in both-empty. Any adaptation message is explicitly AlgoCore_inference and is not an official Cambridge literal.",
            "open_lead_decision": False,
        },
        {
            "change_id": "P0-R2-VISUAL-CASE-SPECIFIC",
            "affected_patterns": PATTERNS,
            "affected_artifacts": ["VISUAL_BRIEFS.json", "REVIEW.md"],
            "result": "Replaced the shared generic case text with distinct bilingual normal/boundary/failure cases for every pattern. Reduce malformed/empty cases remain Stage 5 contract obligations outside the cited Cambridge source precondition.",
        }
    ],
    "pre_rework_artifact_hashes": PRE_REWORK_ARTIFACT_HASHES,
    "resubmitted_artifact_hashes": {name: sha256(HERE / name) for name in artifact_names},
    "validation": {"status": "PENDING_VALIDATOR_RUN", "report": "VALIDATION.json", "sha256": None},
    "gate_boundary": "Author resubmission only. Independent QA and Lead set PILOT_GATE.",
}
write_json("REWORK_RESPONSE.json", rework_response)

print(f"Built P0 Stack: {len(cards)} cards, {len(errors)} error rows, {len(unique_parts)} unique source parts, {mp_count} marking atoms")

from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S1, S2, S3, S4 = (P4 / f"stage-{n}" for n in (1, 2, 3, 4))
PATTERNS = [
    "DATA_STORAGE", "DATA_RECORD", "ARRAY_APPEND", "RANDOM_ARRAY",
    "RULE_COMPUTE", "VALIDATE_INPUT", "UNIQUE_SELECTION", "CHECK_DIGIT",
    "ALGORITHM_TRANSLATE", "STRING_COMPARE", "STRING_SPLIT", "STRING_ROUTE",
    "RUN_LENGTH_ENCODE",
]
VERSION = "s4-schema-v1-b1-submission-1"
BATCH = "B1-foundations-text"


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def bi(vi, en):
    return {"vi": vi, "en": en}


def slug(pattern):
    return pattern.lower().replace("_", "-")


INPUTS = [
    S2 / "EXAM_PATTERN_CATALOG.json", S2 / "QUESTION_PATTERN_MAP.json",
    S2 / "CONFUSABLE_PATTERNS.json", S3 / "BOOK_KNOWLEDGE_MAP.json",
    S3 / "COVERAGE_MATRIX.json", S3 / "LESSON_PACKAGES.json",
    S1 / "SOURCE_ISSUES.json",
]
for year in ("2021-2022", "2023-2024", "2025"):
    INPUTS += [S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json", S4 / f"evidence/marking/{year}/SOURCE_RISK_REGISTER.json"]
INPUTS += [S4 / "schemas/pattern-card.schema.json", S4 / "schemas/error-prevention.schema.json", S4 / "schemas/design-briefs.schema.json"]
input_hashes = [{"path": str(p.relative_to(P4)).replace("\\", "/"), "sha256": sha(p)} for p in INPUTS]

catalog_doc = read(S2 / "EXAM_PATTERN_CATALOG.json")
catalog = {x["pattern_id"]: x for x in catalog_doc["patterns"] if x["pattern_id"] in PATTERNS}
book_doc = read(S3 / "BOOK_KNOWLEDGE_MAP.json")
chains = {x["pattern_id"]: x for x in book_doc["pattern_chains"] if x["pattern_id"] in PATTERNS}
sections = {x["section_id"]: x for x in book_doc["sections"]}
contrasts_doc = read(S2 / "CONFUSABLE_PATTERNS.json")


def submission_rows(path):
    d = read(path)
    return d.get("parts") or d.get("rows") or []


rows_by_pattern = {p: [] for p in PATTERNS}
all_source_rows = {}
policies = {}
for year in ("2021-2022", "2023-2024", "2025"):
    for row in submission_rows(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json"):
        row = dict(row)
        row["source_batch"] = year
        all_source_rows[row["part_id"]] = row
        assessed = row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
        for pattern in PATTERNS:
            if pattern in assessed:
                rows_by_pattern[pattern].append(row)
    risk = read(S4 / f"evidence/marking/{year}/SOURCE_RISK_REGISTER.json")
    if risk.get("batch_fidelity_policy"):
        policies[year] = risk["batch_fidelity_policy"]


def atom_owner(row, atom):
    """Assign an atom once among B1 patterns; non-B1 atoms stay outside this batch."""
    b1 = [p for p in row.get("assessed_pattern_ids", row.get("pattern_ids", [])) if p in PATTERNS]
    if not b1:
        return None
    if len(b1) == 1:
        # The official part has exactly one B1 assessed pattern, so that pattern
        # owns the part's atoms in this batch even when other-batch co-tags exist.
        return b1[0]
    text = atom["criterion_paraphrase"].lower()
    if set(b1) == {"RANDOM_ARRAY", "DATA_STORAGE"}:
        return "DATA_STORAGE" if any(k in text for k in ("array", "local", "1d", "2d", "elements", "space")) and not any(k in text for k in ("random", "unique", "distinct")) else "RANDOM_ARRAY"
    if set(b1) == {"UNIQUE_SELECTION", "VALIDATE_INPUT"}:
        return "VALIDATE_INPUT" if any(k in text for k in ("range", "valid", "input", "between")) else "UNIQUE_SELECTION"
    if set(b1) == {"ALGORITHM_TRANSLATE", "RULE_COMPUTE"}:
        return "RULE_COMPUTE" if any(k in text for k in ("modulus", "divis", "sum", "total", "calculat")) else "ALGORITHM_TRANSLATE"
    return row.get("primary_pattern_id") if row.get("primary_pattern_id") in b1 else b1[0]


owned = {p: defaultdict(list) for p in PATTERNS}
for row in all_source_rows.values():
    for atom in row.get("marking_points", []):
        owner = atom_owner(row, atom)
        if owner:
            owned[owner][row["part_id"]].append(atom)


def source_ref(row, pattern):
    atoms = owned[pattern].get(row["part_id"], [])
    return {
        "part_id": row["part_id"], "source_batch": row["source_batch"],
        "qp_locator": {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]},
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "ms_atoms": [{
            "marking_point_id": m["marking_point_id"], "source_id": m["ms_source_id"],
            "pdf_pages": m["ms_pdf_pages"], "criterion_paraphrase": m["criterion_paraphrase"],
            "award_semantics": m["award_semantics"], "condition": m.get("condition"),
            "alternatives": m.get("alternatives"), "dependency": m.get("dependency"),
            "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"),
            "group_id": m.get("group_id"), "group_max": m.get("group_max"),
            "source_issue_refs": m.get("source_issue_refs", []),
        } for m in atoms],
        "source_issue_refs": row.get("source_issue_refs", []),
        "atom_ownership_note": "Atoms listed here are owned once inside B1; an empty list means this assessed relation supplies context while its official atom belongs to another assessed pattern/batch.",
    }


official_refs = {p: [source_ref(r, p) for r in sorted(rows_by_pattern[p], key=lambda x: x["part_id"])] for p in PATTERNS}


def refs(pattern):
    return [m["marking_point_id"] for r in official_refs[pattern] for m in r["ms_atoms"]]


def source_issues(pattern):
    return sorted({
        issue
        for ref in official_refs[pattern]
        for issue in (ref["source_issue_refs"] + [i for atom in ref["ms_atoms"] for i in atom["source_issue_refs"]])
    })


def step(pattern, suffix, seq, action, why, invariant, guard, role, check):
    return {
        "step_id": f"{slug(pattern)}.step.{suffix}", "sequence": seq,
        "action": bi(action[0], action[1]), "why": bi(why[0], why[1]),
        "reads": ["QP contract", "current state"], "writes": ["design state"],
        "invariant": invariant, "guard": guard, "termination_role": role,
        "check": bi(check[0], check[1]), "marking_point_refs": [],
    }


SPECS = {
"DATA_STORAGE": {
 "pre":"The QP states identifiers, scope, element types, dimensions and any initial values.", "repr":"Named scalar/array storage with an explicit shape and type.", "conv":["capacity is a count, not a last index", "scope and initial values are source-bound"], "axes":["scope","dimensions","initial_values"],
 "decision":bi("Lập bảng tên–kiểu–shape–scope–khởi tạo trước khi khai báo.","Build an identifier–type–shape–scope–initialisation table before declaring storage."), "inv":"Every declared cell belongs to the required shape and accepts only the stated data type.",
 "steps":[
  ("contract",("Trích đúng tên, kiểu, scope, số chiều và giá trị đầu.","Extract exact names, types, scope, dimensions and initial values."),("Đây là hợp đồng mà các phần sau dùng lại.","This is the contract reused by later parts."),"No declaration decision is made before all five fields are known.","At task entry.","selects_contract",("Đối chiếu từng trường với QP.","Match each field to the QP.")),
  ("shape",("Đổi sức chứa thành miền chỉ số cho từng chiều.","Convert each capacity into an index domain for every dimension."),("Việc này ngăn lỗi thiếu một ô và đảo hàng/cột.","This prevents missing-cell and row/column errors."),"The Cartesian product of index domains has the required number of cells.","After reading dimensions.","defines_representation",("Tính lại tổng số ô độc lập.","Recalculate the cell count independently.")),
  ("initialise",("Khởi tạo đúng literal hoặc dãy đã cho; giữ nguyên unspecified cells.","Initialise exact literals or supplied sequences; leave unspecified cells unspecified."),("Tự thêm sentinel có thể đổi nghĩa state.","Inventing a sentinel can change state meaning."),"Initialisation changes no identifier, type or shape.","Only when the QP requires initial values.","establishes_state",("Đếm và so thứ tự mọi giá trị bắt buộc.","Count and order every required value.")),
  ("audit",("Kiểm tên, scope, shape, type và state ban đầu theo năm ô checklist.","Audit names, scope, shape, type and initial state with a five-cell checklist."),("Một khai báo chạy được vẫn có thể sai hợp đồng.","A runnable declaration can still violate the contract."),"The audited representation equals the extracted contract.","Before downstream use.","terminates_design",("Không dùng output chạy làm bằng chứng duy nhất.","Do not use runtime output as the sole evidence."))],
 "errors":[("last-index","Nhầm chỉ số cuối với số phần tử.","Confusing the last index with the number of elements.","Storage shape is one cell short or long.","Recompute index domains and total cells."),("scope-type","Đổi scope hoặc kiểu vì cú pháp quen thuộc.","Changing scope or type to match a familiar template.","Later calls or assignments violate the source contract.","Restore each declaration from the contract table.")],
 "cases":[("one-dimensional","one capacity and one index domain"),("multi-dimensional","one domain per dimension; preserve row/column order"),("prefilled","exact supplied values or sentinel" )],
 "visual":("Shape, scope và giá trị đầu phối hợp thành state nào?","How do shape, scope and initial values define the state?",["DECLARE_STORAGE","SET_SCOPE","INITIALISE_CELL","AUDIT_SHAPE"])
},
"DATA_RECORD": {
 "pre":"The QP supplies a record/class-substitute name and field contract.", "repr":"One heterogeneous record-like value with named fields.", "conv":["record substitute is not automatically a full OOP class", "field names and types remain source-bound"], "axes":["field_types","record_or_class_substitute"],
 "decision":bi("Phân loại đây là record dữ liệu hay class có hành vi trước khi thêm method.","Classify it as a data record or behavioural class before adding methods."), "inv":"Each field has exactly one required name, type and role.",
 "steps":[
  ("contract",("Lập bảng field, kiểu và ý nghĩa.","List each field, type and meaning."),("Các field khác kiểu là lý do dùng record.","Heterogeneous fields are why a record is used."),"Field set is complete and non-duplicated.","At task entry.","selects_contract",("Đếm field theo QP/MS.","Count fields against QP/MS.")),
  ("representation",("Chọn record hoặc class thay thế đúng phạm vi đề cho.","Choose a record or permitted class substitute within source scope."),("Class thay record không cho phép tự thêm encapsulation/hành vi.","A class substitute does not license invented encapsulation or behaviour."),"Representation exposes the required fields without changing their contract.","After field table.","defines_representation",("Gạch bỏ mọi method không được yêu cầu.","Cross out every unrequested method.")),
  ("construct",("Gán từng tham số cho đúng field và đúng kiểu.","Map each parameter to the matching field and type."),("Đổi thứ tự hoặc kiểu tạo record hợp lệ cú pháp nhưng sai dữ liệu.","Swapping order or type creates syntactically valid but wrong data."),"Constructed value preserves all input fields one-to-one.","When initial values are supplied.","establishes_state",("Dùng một bộ giá trị khác nhau để phát hiện swap.","Use distinct values to expose swaps.")),
  ("audit",("Kiểm truy cập field nhất quán với phần đọc/ghi sau.","Check field access is consistent with later reads and writes."),("Tên hoặc visibility không nhất quán làm hỏng tích hợp.","Inconsistent names or visibility break integration."),"Every downstream access resolves to one declared field.","Before handoff.","terminates_design",("Đối chiếu tất cả access names trong câu hỏi.","Cross-check all access names in the question."))],
 "errors":[("field-swap","Gán nhầm tham số cho field cùng kiểu.","Assigning a parameter to the wrong same-typed field.","The record silently carries wrong semantics.","Test with distinguishable field values and compare each field."),("oop-overreach","Biến record thay thế thành class nghiệp vụ tự thêm rule.","Turning a record substitute into an invented business class.","The representation no longer matches the assessed data contract.","Remove unrequested behaviour and retain only required fields.")],
 "cases":[("native-record","direct heterogeneous fields"),("class-substitute","constructor and field access only as permitted")],
 "visual":("Mỗi input đi vào field nào và được đọc lại ở đâu?","Which field receives each input and where is it read later?",["DECLARE_FIELD","MAP_PARAMETER","CREATE_RECORD","READ_FIELD"])
},
"ARRAY_APPEND": {
 "pre":"Array capacity, next-free count and result contract are known.", "repr":"Bounded array plus logical count/next-free index.", "conv":["append writes at count", "failure leaves array and count unchanged"], "axes":["capacity","count_convention","return_contract"],
 "decision":bi("Xác nhận count là số item/ô trống kế tiếp trước khi ghi.","Confirm count means logical size/next-free index before writing."), "inv":"Live items occupy exactly indices 0..count-1 and 0<=count<=capacity.",
 "steps":[
  ("contract",("Chốt capacity, count, dữ liệu mới và kết quả success/failure.","Fix capacity, count, new value and success/failure result."),("Append khác insert có thứ tự và queue enqueue.","Append differs from ordered insert and queue enqueue."),"The operation either commits one item or preserves state.","At entry.","selects_contract",("Viết postcondition cho hai nhánh.","Write postconditions for both branches.")),
  ("guard",("Kiểm count < capacity trước mọi mutation.","Check count < capacity before any mutation."),("Guard sớm bảo vệ index và state thất bại.","An early guard protects both index and failure state."),"Failed append changes neither cells nor count.","Before write.","rejects_full",("Thử count=capacity.","Test count=capacity.")),
  ("commit",("Ghi vào array[count], rồi tăng count đúng một.","Write array[count], then increment count by exactly one."),("Thứ tự này dùng count như next-free index.","This order uses count as the next-free index."),"Old prefix is preserved; new item is the last live item.","When space exists.","commits_item",("Kiểm delta count=1 và prefix không đổi.","Check count delta=1 and unchanged prefix.")),
  ("result",("Trả/output đúng contract của nhánh.","Return/output the exact branch contract."),("State đúng chưa đủ nếu interface sai.","Correct state is insufficient when the interface is wrong."),"Result agrees with whether a commit occurred.","After branch.","terminates_operation",("So result với state transition.","Match the result to the state transition."))],
 "errors":[("increment-before-guard","Tăng count trước khi kiểm đầy.","Incrementing count before checking full.","Failure corrupts logical size or writes out of range.","Move the capacity guard before every mutation."),("ordered-insert-confusion","Dịch phần tử để giữ thứ tự dù đề chỉ append.","Shifting elements to preserve order when the task only appends.","Extra mutation changes required position and logic.","Write only at the next-free index and preserve the prefix.")],
 "cases":[("space-available","commit at count then increment"),("full","return failure with identical state")],
 "visual":("Guard, write và count thay đổi theo thứ tự nào?","In what order do guard, write and count change?",["CHECK_CAPACITY","WRITE_NEXT_FREE","INCREMENT_COUNT","RETURN_RESULT"])
},
"RANDOM_ARRAY": {
 "pre":"Shape, inclusive/exclusive bounds and uniqueness requirement are known.", "repr":"Finite target array filled from a source-defined random domain.", "conv":["translate random API bounds to the stated mathematical interval", "uniqueness requires rejection/tracking"], "axes":["range_inclusive","dimensions","uniqueness"],
 "decision":bi("Viết miền toán học trước, rồi mới chọn lời gọi random tương ứng.","Write the mathematical domain first, then choose a matching random call."), "inv":"Every filled cell is in range; when uniqueness is required, all live values are distinct.",
 "steps":[
  ("contract",("Chốt shape, số item, hai biên và yêu cầu distinct.","Fix shape, item count, both bounds and distinctness."),("API random khác nhau ở biên trên.","Random APIs differ at the upper bound."),"The target and source domain are finite and explicit.","At entry.","selects_contract",("Kiểm domain có đủ giá trị nếu cần unique.","Check the domain is large enough for uniqueness.")),
  ("initialise",("Tạo đúng shape và bộ theo dõi used nếu cần.","Create the exact shape and a used-value tracker when required."),("Tách storage khỏi generation làm rõ invariant.","Separating storage from generation clarifies the invariant."),"Filled-count starts at zero and used is empty.","Before generation.","establishes_state",("Đếm target cells.","Count target cells.")),
  ("generate",("Sinh candidate; reject nếu ngoài contract hoặc đã dùng; commit nếu hợp lệ.","Generate a candidate; reject out-of-contract/used values and commit valid ones."),("Chỉ commit mới tăng filled-count.","Only a commit increases filled-count."),"Committed prefix is in range and distinct when required.","While cells remain.","advances_fill",("Theo dõi accept/reject riêng.","Track accepts and rejects separately.")),
  ("finish",("Dừng khi mọi ô được điền và audit biên/distinct.","Stop when every cell is filled and audit bounds/distinctness."),("Số lần sinh không phải điều kiện dừng đáng tin cậy.","Attempt count is not a reliable termination condition."),"filled_count equals target cell count.","After final commit.","terminates_generation",("Kiểm min/max và cardinality của set.","Check min/max and set cardinality."))],
 "errors":[("upper-bound","Dùng API làm mất hoặc vượt biên trên.","Using an API call that excludes or exceeds the required upper bound.","Generated values violate the stated interval.","Translate the API interval explicitly and test both endpoints."),("unique-loop","Tăng vị trí khi candidate bị trùng.","Advancing the target index when a duplicate candidate is rejected.","The array is short or contains duplicates.","Advance only after accepting a new value.")],
 "cases":[("duplicates-allowed","one generation per cell"),("unique","reject duplicates; domain size must cover target"),("two-dimensional","preserve both index domains")],
 "visual":("Candidate nào được accept và khi nào vị trí đích tiến lên?","Which candidates are accepted, and when does the target position advance?",["GENERATE_CANDIDATE","CHECK_RANGE","CHECK_DUPLICATE","COMMIT_VALUE","REJECT_VALUE"])
},
"RULE_COMPUTE": {
 "pre":"The source supplies a formula, table, bands or conditional rule.", "repr":"Decision rule plus typed operands, units and an output contract.", "conv":["boundary inclusion follows the source", "rounding/division is never assumed"], "axes":["table_lookup","bands","units","rounding","assumptions"],
 "decision":bi("Chuyển rule thành bảng condition→formula→unit trước khi tính.","Convert the rule into a condition→formula→unit table before calculating."), "inv":"Exactly one applicable rule is selected and every operand retains its defined unit/type.",
 "steps":[
  ("contract",("Ghi input, output, đơn vị, biên và phép làm tròn/chia.","Record inputs, output, units, boundaries and rounding/division."),("Những chi tiết này đổi kết quả dù control flow giống nhau.","These details change the result even with identical control flow."),"Every symbol in the formula has a source definition.","At entry.","selects_rule",("Gắn unit/type cho từng operand.","Attach a unit/type to every operand.")),
  ("select",("Chọn đúng row/band bằng predicate không chồng và không hở.","Select the row/band with non-overlapping, gap-free predicates."),("Boundary errors thường ẩn ở đúng giá trị ngưỡng.","Boundary errors hide at threshold values."),"Exactly one branch applies to every valid boundary case.","Before arithmetic.","selects_branch",("Thử dưới–đúng–trên mỗi ngưỡng.","Test below–at–above each threshold.")),
  ("compute",("Thay đúng operand và thứ tự phép; chỉ round/floor/modulo khi nguồn nói rõ.","Substitute operands and order operations; round/floor/modulo only when stated."),("Quy tắc quen thuộc không thay thế công thức nguồn.","A familiar rule cannot replace the source formula."),"Intermediate values correspond to the selected rule.","After branch selection.","computes_result",("Tính tay một micro-case.","Hand-calculate one micro-case.")),
  ("verify",("Kiểm output type, unit, format và postcondition.","Check output type, unit, format and postcondition."),("Giá trị số đúng nhưng sai unit/format vẫn sai contract.","A numerically correct value can still violate unit/format."),"Output represents the chosen rule for the original inputs.","At completion.","terminates_result",("Đối chiếu ngược input từ result nếu khả thi.","Reverse-check the inputs from the result where possible."))],
 "errors":[("boundary","Dùng < thay cho <= ở ngưỡng band.","Using < instead of <= at a band boundary.","A boundary input selects the wrong rule or no rule.","Build below/at/above tests for every threshold."),("invented-rounding","Tự thêm modulo, floor hoặc rounding quen thuộc.","Adding familiar modulo, floor or rounding not stated by the source.","The computation implements a different rule.","Copy the exact source operation into the contract table.")],
 "cases":[("formula","single expression with typed operands"),("banded-table","one exclusive branch per input"),("source-rounding","apply only the stated rounding/division")],
 "visual":("Input đi qua nhánh nào và mỗi intermediate giữ unit gì?","Which branch does the input take, and what unit does each intermediate carry?",["EVALUATE_PREDICATE","SELECT_RULE","COMPUTE_INTERMEDIATE","APPLY_SOURCE_ROUNDING","EMIT_RESULT"])
},
"VALIDATE_INPUT": {
 "pre":"The valid type/domain and retry/output contract are known.", "repr":"Input loop governed by an explicit validity predicate.", "conv":["continue while invalid", "exit only with a value satisfying the postcondition"], "axes":["range","length","choice","type","termination"],
 "decision":bi("Viết predicate VALID trước rồi phủ định một lần cho loop.","Write the VALID predicate first, then negate it once for the loop."), "inv":"Before exit, no invalid value is committed; after exit, the retained value satisfies VALID.",
 "steps":[
  ("predicate",("Biểu diễn type, range, length và membership thành một predicate VALID.","Express type, range, length and membership as one VALID predicate."),("Tách predicate khỏi loop ngăn đảo AND/OR.","Separating the predicate prevents AND/OR inversion."),"VALID exactly matches the source domain.","At entry.","defines_guard",("Thử một valid và từng loại invalid.","Test one valid and each invalid class.")),
  ("read",("Đọc/convert input ở vị trí cho phép xử lý lỗi kiểu.","Read/convert input where type failures can be handled."),("Convert quá sớm có thể thoát thay vì retry.","Converting too early may abort instead of retrying."),"A failed conversion never becomes committed state.","Each attempt.","obtains_candidate",("Dùng candidate riêng cho giá trị chưa hợp lệ.","Keep an uncommitted candidate value.")),
  ("loop",("Nếu invalid, thông báo theo contract và đọc lại; nếu valid, commit một lần.","On invalid, issue the source-bound response and retry; on valid, commit once."),("Mutation chỉ sau validation giữ state sạch.","Mutation only after validation preserves clean state."),"Committed state is unchanged across invalid attempts.","While not VALID.","advances_attempts",("Đếm commit, không đếm prompt, làm success.","Count commits, not prompts, as success.")),
  ("exit",("Kết thúc với postcondition VALID và đúng type.","Exit with VALID and the required type."),("Loop dừng vì counter không đảm bảo dữ liệu hợp lệ.","Stopping by attempt count does not guarantee valid data."),"Retained value satisfies every validity clause.","When VALID.","terminates_validation",("Assert toàn bộ predicate sau loop.","Assert the whole predicate after the loop."))],
 "errors":[("and-or","Dùng AND khi điều kiện invalid cần OR, hoặc ngược lại.","Using AND where invalidity requires OR, or vice versa.","Some invalid values escape or valid values loop forever.","Derive INVALID by negating the complete VALID predicate."),("validation-verification","Kiểm giá trị có hợp lệ nhưng không retry/commit đúng, hoặc nhầm với verification.","Checking validity without correct retry/commit, or confusing validation with verification.","The process does not establish the required postcondition.","Write candidate→check→commit as separate states.")],
 "cases":[("range","inclusive/exclusive endpoints"),("membership","allowed literals"),("type-length","conversion and exact length")],
 "visual":("Candidate nào bị từ chối và invariant nào giữ qua mỗi lần nhập?","Which candidates are rejected, and what invariant survives each attempt?",["READ_CANDIDATE","CHECK_TYPE","CHECK_DOMAIN","REJECT_AND_RETRY","COMMIT_VALID"])
},
"UNIQUE_SELECTION": {
 "pre":"Candidate range and used/available representation are known.", "repr":"Validation plus a consumed marker/set for selection without replacement.", "conv":["validate before marking", "termination requires at least one available item"], "axes":["index_or_answer","tracking_structure","consume_marker"],
 "decision":bi("Tách hợp lệ miền khỏi chưa được chọn; chỉ commit khi cả hai đúng.","Separate domain validity from availability; commit only when both hold."), "inv":"Every committed selection is valid and appears at most once.",
 "steps":[
  ("contract",("Chốt miền candidate, marker used và kết quả trả về.","Fix candidate domain, used marker and return contract."),("Range-valid không đồng nghĩa available.","Range-valid does not imply available."),"Availability is defined for every valid candidate.","At entry.","selects_contract",("Đếm số item còn available.","Count remaining available items.")),
  ("candidate",("Đọc/sinh candidate và kiểm miền trước khi index.","Read/generate a candidate and check its domain before indexing."),("Index invalid có thể truy cập ngoài storage.","An invalid index can access outside storage."),"No tracking structure is read outside its domain.","Each attempt.","guards_candidate",("Thử hai biên ngoài miền.","Test both out-of-range boundaries.")),
  ("availability",("Nếu đã dùng thì retry; nếu chưa dùng thì đánh dấu và commit đúng một lần.","Retry a used candidate; otherwise mark and commit exactly once."),("Marker là bằng chứng không thay thế.","The marker proves selection without replacement."),"Used set equals exactly the committed selections.","After range validity.","commits_unique",("So cardinality used với số commit.","Compare used cardinality with commit count.")),
  ("finish",("Trả index/value đúng contract và đảm bảo còn item khi loop tiếp.","Return the contracted index/value and ensure availability before another loop."),("Khi hết item, retry ngẫu nhiên không thể dừng.","When exhausted, random retry cannot terminate."),"Each successful call reduces available count by one.","On successful commit.","terminates_selection",("Kiểm exhausted case riêng.","Check the exhausted case separately."))],
 "errors":[("mark-before-check","Đánh dấu used trước khi candidate hợp lệ.","Marking used before the candidate is valid.","Invalid attempts consume real choices.","Move the marker write after both guards."),("exhausted-loop","Tiếp tục retry khi mọi item đã dùng.","Retrying after every item is used.","The loop has no possible terminating candidate.","Add a precondition/guard for remaining availability.")],
 "cases":[("boolean-used","parallel used flags"),("sentinel-consume","replace selected value with an agreed marker"),("set-tracker","membership in a used set")],
 "visual":("Range check và used check thay đổi state ở thời điểm nào?","When do the range and used checks permit a state change?",["PROPOSE_SELECTION","CHECK_RANGE","CHECK_UNUSED","MARK_USED","RETRY_SELECTION"])
},
"CHECK_DIGIT": {
 "pre":"Payload length, check-digit position, weights and exact source formula are known.", "repr":"Digit sequence split into payload and one compared check digit.", "conv":["exclude the supplied check digit from payload sum", "floor/modulo only as stated"], "axes":["weights","division_or_modulus","rounding","input_length","payload"],
 "decision":bi("Sao chép công thức nguồn bằng tên bước; không thay bằng modulo quen thuộc.","Copy the source formula as named steps; do not substitute a familiar modulo rule."), "inv":"After k payload digits, the accumulator equals exactly the weighted sum of those k digits.",
 "steps":[
  ("contract",("Tách length, payload positions, check position, weights và phép tính.","Extract length, payload positions, check position, weights and operation."),("Các check-digit scheme khác nhau không hoán đổi được.","Different check-digit schemes are not interchangeable."),"Payload and check digit are disjoint.","At entry.","selects_scheme",("Đánh dấu từng vị trí payload/check.","Label every payload/check position.")),
  ("accumulate",("Duyệt payload đúng thứ tự và cộng digit×weight tương ứng.","Traverse payload in order and add each digit×matching weight."),("Đổi offset làm toàn bộ tổng sai.","An offset error corrupts the whole sum."),"Accumulator equals weighted sum of processed payload prefix.","For each payload digit.","advances_payload",("Ghi bảng position–digit–weight–product.","Record a position–digit–weight–product table.")),
  ("derive",("Áp dụng đúng phép chia/floor/modulo của nguồn để tạo expected digit.","Apply the source's exact division/floor/modulo operation to derive the expected digit."),("Stage 3 khóa rõ s24 dùng floor weighted-sum/10, không tự suy modulo.","Stage 3 explicitly records s24 floor weighted-sum/10; modulo is not assumed."),"Derived digit follows only the cited scheme.","After sum.","derives_check",("Tính tay một ví dụ nhỏ.","Hand-calculate one small example.")),
  ("compare",("So expected với supplied check digit và trả đúng Boolean/result contract.","Compare expected with the supplied check digit and return the exact Boolean/result contract."),("So sai vị trí vẫn cho kết quả ngẫu nhiên hợp lệ.","Comparing the wrong position can pass accidentally."),"Accepted input has expected==supplied check digit.","At completion.","terminates_check",("Dùng một valid và một digit cuối bị đổi.","Use one valid case and one changed final digit."))],
 "errors":[("modulo-assumption","Mặc định dùng modulo vì nhớ scheme khác.","Assuming modulo from a different remembered scheme.","The algorithm implements a different check-digit rule.","Write the exact division/rounding operator from the QP."),("payload-offset","Đưa check digit vào tổng hoặc lệch weight một vị trí.","Including the check digit in the sum or shifting weights by one position.","Every later product/comparison is misaligned.","Use a position table and keep payload/check columns separate.")],
 "cases":[("weighted-floor","weighted sum then source-stated floor/division"),("modulo","only when explicitly specified"),("different-weight-order","preserve left/right mapping")],
 "visual":("Mỗi digit đóng góp gì và check digit được tách ở đâu?","What does each digit contribute, and where is the check digit separated?",["SPLIT_PAYLOAD","MULTIPLY_WEIGHT","ACCUMULATE_SUM","DERIVE_CHECK","COMPARE_CHECK"])
},
"ALGORITHM_TRANSLATE": {
 "pre":"A supplied algorithm and target-language constraints are present.", "repr":"A semantics-preserving mapping from pseudocode states to Python design.", "conv":["integer division/modulus retain source meaning", "recursive returns and side effects are preserved"], "axes":["recursive_or_iterative","division","parameter_updates","side_effects"],
 "decision":bi("Lập trace của thuật toán nguồn trước khi ánh xạ từng construct.","Trace the source algorithm before mapping each construct."), "inv":"After every translated step, target state corresponds to the same source state.",
 "steps":[
  ("contract",("Ghi input/output, mutation, return, arithmetic và stop condition của nguồn.","Record source inputs/outputs, mutation, return, arithmetic and stop condition."),("Translation là giữ hành vi, không phải viết lại theo ý.","Translation preserves behaviour rather than redesigning it."),"Every observable source effect has a target counterpart.","At entry.","selects_semantics",("Liệt kê state quan sát được.","List observable state.")),
  ("map",("Ánh xạ assignment, selection, loop/call và operator sang construct đích.","Map assignment, selection, loop/call and operators to target constructs."),("Cú pháp tương tự không đảm bảo semantics giống.","Similar syntax does not guarantee equal semantics."),"Mapped construct preserves evaluation order and types.","Per construct.","translates_structure",("Đánh dấu integer division/modulus riêng.","Mark integer division/modulus explicitly.")),
  ("flow",("Giữ đúng update tham số, base/termination và propagation của return.","Preserve parameter updates, base/termination and return propagation."),("Một return thiếu làm recursive/loop result biến mất.","A missing return loses recursive/loop results."),"Each path reaches the same source return/side effect.","Across control paths.","preserves_flow",("Trace một normal và boundary path.","Trace one normal and one boundary path.")),
  ("equivalence",("So trace nguồn–đích theo từng bước, chưa tuyên bố đã chạy.","Compare source/target traces stepwise without claiming execution."),("So output cuối có thể bỏ sót state mutation sai.","Final-output comparison can hide wrong state mutation."),"Corresponding checkpoints have equal abstract state.","At design completion.","terminates_translation",("Kiểm số iteration/call và return.","Check iteration/call count and returns."))],
 "errors":[("syntax-first","Viết cú pháp đích trước khi hiểu state transition.","Writing target syntax before understanding state transitions.","The program looks plausible but implements another algorithm.","Create a source-state trace and map each transition."),("division-return","Đổi integer division hoặc quên return recursive.","Changing integer division or omitting a recursive return.","Values or termination differ from the supplied algorithm.","Annotate arithmetic types and every return path.")],
 "cases":[("iterative","loop condition and update order"),("recursive","base case, smaller argument and returned value"),("side-effecting","preserve external state writes")],
 "visual":("State nguồn và state đích còn tương đương sau mỗi construct không?","Do source and target states remain equivalent after each construct?",["READ_SOURCE_STEP","MAP_CONSTRUCT","UPDATE_ABSTRACT_STATE","COMPARE_STATES","CHECK_RETURN"])
},
"STRING_COMPARE": {
 "pre":"Comparison order, case policy, prefix assumptions and shortcut restrictions are known.", "repr":"Two strings plus cursor and undecided/equal/order state.", "conv":["first differing character decides", "prefix/equality requires explicit termination"], "axes":["prefix_assumption","character_order","built_in_restriction"],
 "decision":bi("Chỉ quyết định tại ký tự khác đầu tiên hoặc khi một chuỗi kết thúc.","Decide only at the first differing character or when one string ends."), "inv":"All character pairs before cursor are equal under the required comparison policy.",
 "steps":[
  ("contract",("Chốt case, order, prefix và built-in được phép/cấm.","Fix case, ordering, prefix and allowed/prohibited built-ins."),("Lexicographic rule thay đổi theo contract.","The lexicographic rule depends on the contract."),"Comparison policy is explicit before scanning.","At entry.","selects_policy",("Viết kết quả cho equal/prefix/difference.","State outcomes for equal/prefix/difference.")),
  ("scan",("So cặp ký tự tại cursor khi cả hai còn ký tự.","Compare the cursor pair while both strings have a character."),("Quét theo vị trí giữ prefix invariant.","Position-wise scanning maintains the prefix invariant."),"Prefixes before cursor are equal.","While undecided and both live.","advances_cursor",("Cursor tăng đúng một sau cặp equal.","Advance cursor once after an equal pair.")),
  ("decide",("Khi khác, trả order từ đúng cặp đó và dừng.","On a difference, return order from that pair and stop."),("Ký tự sau không thể thay đổi lexicographic decision.","Later characters cannot change the lexicographic decision."),"Decision uses the first difference only.","First mismatch.","terminates_difference",("Ghi vị trí mismatch.","Record mismatch position.")),
  ("prefix",("Nếu hết chuỗi, xử lý equal hoặc shorter-prefix theo contract.","When a string ends, handle equality or shorter-prefix by contract."),("Không xử lý prefix gây out-of-range.","Ignoring prefixes causes out-of-range access."),"No cursor exceeds either length.","No difference before an end.","terminates_prefix",("Thử equal và hai hướng prefix.","Test equal and both prefix directions."))],
 "errors":[("first-char-only","Chỉ so ký tự đầu.","Comparing only the first character.","Strings sharing a prefix are classified incorrectly.","Use a cursor and stop only at first difference/end."),("prefix-overrun","Tiếp tục index sau khi chuỗi ngắn kết thúc.","Indexing after the shorter string ends.","The method fails or misses prefix ordering.","Guard both lengths before character access.")],
 "cases":[("first-difference","different live characters"),("equal","both end together"),("prefix","one ends while prefix remains equal")],
 "visual":("Prefix nào đã được chứng minh equal trước quyết định?","Which prefix has been proven equal before the decision?",["COMPARE_CHARACTERS","ADVANCE_CURSOR","DECIDE_DIFFERENCE","DETECT_PREFIX","RETURN_ORDER"])
},
"STRING_SPLIT": {
 "pre":"Delimiter, expected token count and built-in restriction are known.", "repr":"Source string, cursor, current token and token list.", "conv":["delimiter is not part of a token unless stated", "final token must be flushed"], "axes":["delimiter","fixed_token_count","built_in_restriction"],
 "decision":bi("Dùng state token hiện tại; delimiter commit token, end commit token cuối.","Use current-token state; delimiter commits a token and end commits the final token."), "inv":"Concatenating committed tokens, delimiters and current token reconstructs the consumed prefix.",
 "steps":[
  ("contract",("Chốt delimiter, token count, empty-token policy và shortcut restriction.","Fix delimiter, token count, empty-token policy and shortcut restriction."),("Consecutive/trailing delimiters đổi số token.","Consecutive/trailing delimiters change token count."),"Tokenisation policy is explicit.","At entry.","selects_policy",("Tạo micro-cases delimiter đầu/cuối/liền nhau.","Create leading/trailing/consecutive delimiter cases.")),
  ("scan",("Đọc từng ký tự; append ký tự thường vào current token.","Read each character; append ordinary characters to current token."),("State này hỗ trợ manual split khi built-in bị cấm.","This state supports manual splitting when a built-in is prohibited."),"Current token equals chars since last delimiter.","Per character.","advances_cursor",("Mỗi ký tự được xử lý đúng một lần.","Process each character exactly once.")),
  ("delimiter",("Tại delimiter, commit token theo policy rồi reset current token.","At a delimiter, commit according to policy then reset current token."),("Reset sau commit giữ ranh giới chính xác.","Reset after commit preserves boundaries."),"Committed tokens cover through the delimiter boundary.","On delimiter.","commits_token",("Kiểm empty token policy.","Check empty-token policy.")),
  ("flush",("Khi hết chuỗi, commit token cuối và kiểm số token.","At end, commit the final token and check token count."),("Token cuối không có delimiter để kích hoạt commit.","The final token has no delimiter to trigger commit."),"All source characters are accounted for.","At end of string.","terminates_split",("Join lại với delimiter để kiểm.","Join with delimiter to verify."))],
 "errors":[("missing-final","Không flush token cuối.","Failing to flush the final token.","The last field disappears.","Add an explicit end-of-input commit."),("delimiter-policy","Bỏ qua empty token hoặc đưa delimiter vào token sai contract.","Dropping empty tokens or including delimiters contrary to contract.","Field positions shift and routing reads wrong data.","Test leading, trailing and consecutive delimiters.")],
 "cases":[("ordinary","tokens separated by one delimiter"),("consecutive","empty-token policy decides output"),("fixed-count","validate exact field count")],
 "visual":("Khi nào current token được commit và reset?","When is the current token committed and reset?",["READ_CHARACTER","APPEND_CHARACTER","DETECT_DELIMITER","COMMIT_TOKEN","FLUSH_FINAL_TOKEN"])
},
"STRING_ROUTE": {
 "pre":"Field layout, conversion types, category mapping and destination capacities are known.", "repr":"Parsed fields converted to typed values and dispatched to destination arrays.", "conv":["parse before conversion", "route and count update form one commit"], "axes":["field_layout","category_to_array","value_type","destinations"],
 "decision":bi("Lập bảng field index→type và category→destination trước khi route.","Build field-index→type and category→destination tables before routing."), "inv":"Every committed record appears in exactly one permitted destination with correctly typed fields.",
 "steps":[
  ("contract",("Chốt delimiter/field layout, type, category và capacity từng đích.","Fix delimiter/field layout, types, categories and each destination capacity."),("Route phụ thuộc đồng thời vào schema và mapping.","Routing depends on both schema and category mapping."),"Every category has one explicit destination or rejection path.","At entry.","selects_schema",("Kiểm đủ mọi category.","Check every category.")),
  ("parse",("Tách đúng số field và giữ chuỗi gốc đến khi đủ field.","Split the exact field count and retain source text until complete."),("Convert sớm có thể che field lệch.","Early conversion can hide shifted fields."),"Parsed field positions match the schema.","Before conversion.","parses_record",("Kiểm field count.","Check field count.")),
  ("convert",("Convert từng field theo type đã ghi; lỗi conversion không commit.","Convert each field by its declared type; conversion failure does not commit."),("Typed routing cần phân biệt text và numeric values.","Typed routing distinguishes text from numeric values."),"All converted fields satisfy their types before routing.","After complete parse.","types_record",("Dùng giá trị biên numeric.","Use numeric boundary values.")),
  ("route",("Chọn đích, kiểm capacity, ghi record và tăng đúng counter như một transaction.","Choose destination, check capacity, write record and increment its counter atomically."),("Route/counter tách rời dễ ghi chéo hoặc mất record.","Separating route/count can cross-write or lose records."),"Exactly one destination changes by one on success.","After valid conversion.","terminates_route",("So before/after mọi destination.","Compare every destination before/after."))],
 "errors":[("field-index","Đọc category/value từ sai token.","Reading category/value from the wrong token.","Conversion or routing uses another field's meaning.","Use an indexed schema table and distinct test values."),("cross-route","Ghi đúng record vào sai array/counter.","Writing a valid record to the wrong array/counter.","Destination invariants and later processing are corrupted.","Treat destination selection, write and count as one commit.")],
 "cases":[("two-destination","category selects exactly one array"),("typed-field","string-to-number conversion before commit"),("capacity-failure","no destination state changes")],
 "visual":("Record đi qua parse, convert và destination nào?","How does a record move through parse, conversion and destination selection?",["PARSE_FIELD","CONVERT_FIELD","SELECT_DESTINATION","CHECK_DESTINATION_CAPACITY","COMMIT_RECORD"])
},
"RUN_LENGTH_ENCODE": {
 "pre":"Input order, non-empty/empty policy, maximum run and output format are known.", "repr":"Current symbol, current run count and emitted runs over an ordered stream.", "conv":["count consecutive equal symbols", "flush the final run"], "axes":["max_run","nonempty_input","source_queue","final_run"],
 "decision":bi("Giữ một run đang mở; ký tự đổi thì emit run cũ trước khi mở run mới.","Keep one open run; on symbol change, emit the old run before opening a new one."), "inv":"Emitted runs plus the open run reconstruct exactly the consumed input prefix.",
 "steps":[
  ("contract",("Chốt nguồn input, empty policy, max run và format symbol/count.","Fix input source, empty policy, maximum run and symbol/count format."),("RLE theo thứ tự, không phải frequency toàn chuỗi.","RLE is order-sensitive rather than whole-string frequency."),"Input order and output grammar are explicit.","At entry.","selects_contract",("Phân biệt run với total frequency.","Distinguish a run from total frequency.")),
  ("initialise",("Lấy item live đầu làm current symbol và count=1.","Use the first live item as current symbol with count=1."),("Khởi tạo từ dữ liệu tránh sentinel giả.","Initialising from data avoids a fabricated sentinel."),"Open run describes exactly the first consumed symbol.","When non-empty input is guaranteed/checked.","opens_run",("Kiểm single-item case.","Check the single-item case.")),
  ("scan",("Nếu item mới giống thì tăng count; nếu khác thì emit run, reset symbol/count.","Increment on a match; on change, emit the run and reset symbol/count."),("Chỉ ranh giới run tạo output mới.","Only a run boundary creates new output."),"Reconstruction invariant holds after each item.","For each later item.","advances_stream",("Theo dõi consumed/unconsumed partition.","Track consumed/unconsumed partition.")),
  ("flush",("Sau item cuối, emit open run đúng một lần và kiểm max/format.","After the final item, emit the open run exactly once and check max/format."),("Không có symbol-change để tự emit run cuối.","No later symbol change exists to emit the final run."),"All input is represented by emitted runs.","At end of input.","terminates_encoding",("Decode mentally to recover input.","Mentally decode to recover input."))],
 "errors":[("frequency","Đếm tổng frequency thay vì các đoạn liên tiếp.","Counting total frequency instead of consecutive runs.","Separated runs are merged and order is lost.","Reset count at every symbol change."),("final-flush","Không emit run cuối hoặc emit hai lần.","Omitting or duplicating the final run.","Encoded output cannot reconstruct the suffix.","Use one explicit end-of-input flush event.")],
 "cases":[("single-run","all symbols equal"),("alternating","every item opens a new run"),("source-queue","consumption order must match queue contract")],
 "visual":("Open run đại diện prefix nào trước và sau mỗi symbol?","Which prefix does the open run represent before and after each symbol?",["READ_SYMBOL","EXTEND_RUN","CLOSE_RUN","OPEN_RUN","FLUSH_FINAL_RUN"])
},
}


VISUAL_CASES = {
"DATA_STORAGE": {"normal":bi("Dựng mảng 2×3 số nguyên với sáu giá trị đầu khác nhau; event phải tạo đúng sáu cell, đúng row/column và đúng scope.","Build a 2×3 integer array with six distinct initial values; events must create exactly six cells with the correct row/column order and scope."),"boundary":bi("So capacity 1 với last-index 0 và một shape có initial values thiếu; audit phải giữ capacity là số cell và chỉ khởi tạo literal được nguồn nêu.","Compare capacity 1 with last-index 0 and a shape with partial initial values; the audit must keep capacity as cell count and initialise only source-stated literals.")},
"DATA_RECORD": {"normal":bi("Tạo record ba field khác kiểu bằng ba giá trị phân biệt rồi đọc lại từng field; mapping parameter→field phải một-một.","Create a three-field heterogeneous record with distinct values and read every field back; parameter-to-field mapping must be one-to-one."),"boundary":bi("Với class thay record, chỉ tạo constructor/fields được phép; case hai field cùng kiểu nhưng giá trị khác phải phát hiện swap mà không thêm method nghiệp vụ.","For a class substitute, create only permitted constructor/fields; a case with two same-typed but distinct values must expose swaps without adding business methods.")},
"ARRAY_APPEND": {"normal":bi("Với capacity 4 và count 2, append X phải ghi slot 2, giữ prefix 0..1 và đổi count thành 3 trước khi báo success.","With capacity 4 and count 2, appending X must write slot 2, preserve prefix 0..1 and change count to 3 before reporting success."),"boundary":bi("Với count=capacity, capacity guard phải phát failure trước mọi write; toàn bộ array và count sau event phải bằng snapshot ban đầu.","With count equal to capacity, the capacity guard must fail before any write; the array and count after the event must equal the initial snapshot.")},
"RANDOM_ARRAY": {"normal":bi("Điền mảng 2×2 từ miền 1..6; mỗi accepted candidate làm filled-count tăng một và mọi cell cuối nằm trong miền.","Fill a 2×2 array from domain 1..6; each accepted candidate advances filled-count once and every final cell lies in range."),"boundary":bi("Khi cần bốn giá trị unique từ miền đúng bốn phần tử, duplicate candidate phải bị reject mà target index không tiến; bốn accepted values phải có set-cardinality 4.","When four unique values are required from a four-value domain, a duplicate candidate must be rejected without advancing the target index; four accepted values must have set cardinality 4.")},
"RULE_COMPUTE": {"normal":bi("Cho input nằm giữa một band, hiển thị predicate được chọn, operand kèm unit và intermediate trước khi phát result đúng type.","For an input inside one band, show the selected predicate, unit-labelled operands and intermediate value before emitting the correctly typed result."),"boundary":bi("Chạy ba input dưới–đúng–trên cùng ngưỡng; mỗi input phải chọn đúng một band và chỉ áp dụng phép chia/rounding được nguồn ghi.","Run inputs below, at and above one threshold; each must select exactly one band and apply only source-stated division/rounding.")},
"VALIDATE_INPUT": {"normal":bi("Chuỗi attempt gồm một value ngoài range rồi một value hợp lệ: attempt đầu không commit, attempt sau commit đúng một lần và thoát với VALID=true.","Use an attempt sequence with one out-of-range value then a valid value: the first does not commit, the second commits once and exits with VALID=true."),"boundary":bi("Kiểm hai endpoint inclusive/exclusive và một conversion failure; không case invalid nào đổi retained state hoặc thoát loop.","Check both inclusive/exclusive endpoints and one conversion failure; no invalid case may change retained state or exit the loop.")},
"UNIQUE_SELECTION": {"normal":bi("Candidate hợp range và chưa used phải tạo đúng một mark-used và một commit; lần chọn lại cùng candidate phải bị reject không đổi vị trí đích.","An in-range unused candidate must produce one mark-used and one commit; selecting it again must be rejected without changing the destination position."),"boundary":bi("Khi used-set đã phủ toàn bộ miền, availability guard phải dừng theo contract thay vì retry vô hạn; out-of-range candidate cũng không được ghi vào used-set.","When the used set covers the full domain, the availability guard must terminate under the contract rather than retry forever; an out-of-range candidate must not enter the used set.")},
"CHECK_DIGIT": {"normal":bi("Với payload bốn digit, hiển thị từng position×weight, running sum, phép floor/division/modulo đúng nguồn và comparison với supplied check digit.","For a four-digit payload, show every position×weight, running sum, the exact source floor/division/modulo operation and comparison with the supplied check digit."),"boundary":bi("Đổi riêng digit kiểm tra cuối trong khi payload giữ nguyên; weighted sum phải không đổi và kết quả comparison phải chuyển từ valid sang invalid.","Change only the final check digit while preserving the payload; the weighted sum must stay unchanged and the comparison must switch from valid to invalid.")},
"ALGORITHM_TRANSLATE": {"normal":bi("Ghép trace nguồn–đích qua ba update: assignment, branch và loop/call phải tạo cùng abstract state, side effect và return.","Pair source and target traces through three updates: assignment, branch and loop/call must produce the same abstract state, side effect and return."),"boundary":bi("Với base/zero-iteration input và một phép integer division, target phải giữ đúng stop path, operator semantics và return propagation mà không thêm iteration.","For a base/zero-iteration input containing integer division, the target must preserve the stop path, operator semantics and return propagation without adding an iteration.")},
"STRING_COMPARE": {"normal":bi("So hai chuỗi có prefix chung ba ký tự rồi khác ở ký tự thứ tư; cursor chỉ tiến qua prefix và mismatch đầu tiên quyết định order.","Compare strings sharing a three-character prefix and differing at the fourth; the cursor advances only across the prefix and the first mismatch decides the order."),"boundary":bi("Đối chiếu equal strings và hai hướng strict-prefix; không event nào đọc quá length, và shorter-prefix chỉ được quyết định sau khi prefix đã equal.","Contrast equal strings and both strict-prefix directions; no event reads past a length, and shorter-prefix is decided only after proving the prefix equal.")},
"STRING_SPLIT": {"normal":bi("Quét `AA;B;CCC`: hai delimiter commit hai token và end-of-input flush token `CCC`; join lại phải phục hồi chuỗi nguồn.","Scan `AA;B;CCC`: two delimiters commit two tokens and end-of-input flushes `CCC`; joining must reconstruct the source string."),"boundary":bi("Dùng delimiter đầu, cuối và hai delimiter liên tiếp; event sequence phải thể hiện chính xác empty-token policy và không làm mất token cuối.","Use leading, trailing and consecutive delimiters; the event sequence must show the exact empty-token policy and never lose the final token.")},
"STRING_ROUTE": {"normal":bi("Parse record ba field, convert field số rồi route theo category vào đúng một destination; chỉ destination đó và counter của nó đổi một.","Parse a three-field record, convert the numeric field and route by category to exactly one destination; only that destination and its counter change once."),"boundary":bi("Với field count sai, conversion lỗi và destination đầy, cả ba path phải dừng trước commit và mọi destination snapshot giữ nguyên.","For wrong field count, conversion failure and a full destination, all three paths must stop before commit and every destination snapshot must remain unchanged.")},
"RUN_LENGTH_ENCODE": {"normal":bi("Với input `AAABB`, event phải emit `(A,3)` tại symbol change và flush `(B,2)` đúng một lần ở cuối; decode phục hồi input.","For input `AAABB`, events must emit `(A,3)` at the symbol change and flush `(B,2)` exactly once at the end; decoding reconstructs the input."),"boundary":bi("So single-item, alternating symbols và empty-policy case; single item có một final flush, alternating có một run mỗi item và empty không dereference item đầu.","Compare a single item, alternating symbols and the empty-policy case; a single item has one final flush, alternating input has one run per item, and empty input never dereferences a first item.")},
}


# Attach catalogue wording and Stage 3 provenance.
for p in PATTERNS:
    assert p in SPECS and p in catalog and p in chains


def objective_ids(pattern):
    return list(dict.fromkeys(o for k in chains[pattern]["knowledge_chain"] for o in k["objective_ids"]))


def requirement_refs(pattern):
    return [f"ac-9618-p4-2026-python.assessment-requirement.{o.lower()}" for o in objective_ids(pattern)]


def contrast_refs(pattern):
    out = []
    peers = set()
    for c in contrasts_doc["contrasts"]:
        pats = set(c["left"].get("assessed_pattern_ids", [])) | set(c["right"].get("assessed_pattern_ids", []))
        if pattern in pats:
            out.append(c["id"])
            peers |= (pats - {pattern})
    return out, sorted(peers)


methods = {}
for p, s in SPECS.items():
    methods[p] = [step(p, suffix, i + 1, action, why, inv, guard, role, check) for i, (suffix, action, why, inv, guard, role, check) in enumerate(s["steps"])]
    # One atom is owned exactly once at card level. Steps carry the full owned set
    # collectively through the final verification step until Lead refines joins.
    methods[p][-1]["marking_point_refs"] = refs(p)


errors = []
for p, s in SPECS.items():
    for suffix, lvi, len_, consequence, repair in s["errors"]:
        errors.append({
            "error_id": f"b1.{slug(p)}.error.{suffix}", "pattern_id": p,
            "question_part_ids": [], "requirement_refs": requirement_refs(p),
            "marking_point_refs": [],
            "method_step_refs": [methods[p][-2]["step_id"], methods[p][-1]["step_id"]],
            "likely_error": bi(lvi, len_),
            "consequence": bi(
                f"Hậu quả trực tiếp của lỗi ‘{lvi}’: trạng thái sau bước commit không còn thỏa quyết định ‘{s['decision']['vi']}’.",
                consequence,
            ),
            "detection_check": bi(
                f"Chạy phản ví dụ biên sau và đối chiếu từng event với invariant: {VISUAL_CASES[p]['boundary']['vi']}",
                f"Run this boundary counterexample and compare every event with the invariant: {VISUAL_CASES[p]['boundary']['en']}",
            ),
            "repair_action": bi(
                f"Sửa lỗi ‘{lvi}’ bằng quy tắc: {s['decision']['vi']} Sau đó chạy lại đúng phản ví dụ biên và kiểm checkpoint ‘{methods[p][-1]['check']['vi']}’.",
                repair,
            ),
            "repair_exercise_ref": f"b1.{slug(p)}.repair.{suffix}",
            "basis": "AlgoCore_risk", "source_locator_if_official": [],
            "exact_mark_loss_claim": None,
            "authority_note": "AlgoCore risk derived from the method invariant; no examiner-frequency or fixed-mark-loss claim.",
            "status": "SUBMITTED",
        })

error_ids = {p: [e["error_id"] for e in errors if e["pattern_id"] == p] for p in PATTERNS}

cards = []
for p in PATTERNS:
    ch, s, cat = chains[p], SPECS[p], catalog[p]
    c_refs, peers = contrast_refs(p)
    issues = source_issues(p)
    book_ids = list(dict.fromkeys(b for k in ch["knowledge_chain"] for b in k["book_section_ids"]))
    cards.append({
        "card_id": f"ac-9618-p4-2026-python.stage4.pattern.{slug(p)}", "pattern_id": p,
        "version": VERSION, "status": "SUBMITTED", "package_id": ch["package_id"], "lesson_id": ch["lesson_id"],
        "knowledge_block_ids": ch["knowledge_block_ids"], "objective_ids": objective_ids(p),
        "titles": bi(cat["name_vi"], cat["name_en"]),
        "recognition": bi(cat["recognition_vi"], cat.get("recognition_en", ch["titles"]["en"])),
        "source_scope": {
            "assessed_part_ids": ch["stage2_assessed_part_ids"],
            "representative_parts": ([x for x in official_refs[p] if x["ms_atoms"]] or official_refs[p])[:3],
            "official_source_refs": official_refs[p],
            "corpus_limit": f"Observed in {len(ch['stage2_assessed_part_ids'])} assessed part relation(s). This does not prove every possible variant.",
        },
        "confusable_pattern_refs": peers, "confusable_contrast_refs": c_refs,
        "source_issue_refs": issues,
        "source_fidelity_policies": [policies[y] for y in sorted({r["source_batch"] for r in rows_by_pattern[p]}) if y in policies],
        "book_foundation_refs": [{
            "section_id": sid, "source_id": sections[sid]["source_id"], "printed_pages": sections[sid]["printed_pages"],
            "pdf_pages": sections[sid]["pdf_pages"], "support_level": sections[sid]["support_level"],
            "limitations": sections[sid]["limitations"], "authority": "coursebook_foundation",
        } for sid in book_ids],
        "applicability": {"preconditions":[s["pre"]], "representation":[s["repr"]], "conventions":s["conv"], "variant_axes":s["axes"], "decision_rule":s["decision"]},
        "method_steps": methods[p], "marking_point_refs": refs(p), "assessment_requirement_refs": requirement_refs(p),
        "error_refs": error_ids[p], "solution_design_ref": f"b1.solution.{slug(p)}", "visual_brief_ref": f"b1.visual.{slug(p)}",
        "authority_labels":["official_qp","official_ms","official_syllabus","coursebook_foundation","AlgoCore_inference","AlgoCore_risk"],
        "authority_note":"Official obligations are limited to cited QP/MS rows. Method, invariant and repair advice is AlgoCore inference/risk. Fidelity policies are not source issues.",
        "downstream_status":"PENDING_STAGE5_EXECUTION_VERIFICATION",
    })

variants = []
for p, s in SPECS.items():
    variants.append({
        "variant_id": f"b1.variant.{slug(p)}", "pattern_ids":[p], "stage2_contrast_refs":contrast_refs(p)[0],
        "axis":";".join(s["axes"]), "decision_rule":s["decision"],
        "cases":[{"case_id":cid,"description":desc,"observed_parts":[r["part_id"] for r in rows_by_pattern[p] if cid.replace("-","_") in json.dumps(r.get("variants",{})).lower()][:5]} for cid,desc in s["cases"]],
        "invariant":s["inv"], "method_changing":True,
    })

solutions = []
examples = []
visuals = []
for p, s in SPECS.items():
    cat = catalog[p]
    step_ids = [x["step_id"] for x in methods[p]]
    solutions.append({
        "solution_design_id":f"b1.solution.{slug(p)}", "pattern_id":p, "variant_id":f"b1.variant.{slug(p)}",
        "input_contract":bi(f"Hợp đồng đầu vào phải khóa trước theo quyết định: {s['decision']['vi']}",s["pre"]), "output_contract":bi(f"Kết quả cuối phải hoàn tất bước ‘{methods[p][-1]['action']['vi']}’ và đạt checkpoint ‘{methods[p][-1]['check']['vi']}’.",f"Result/state satisfies: {s['inv']}"),
        "state_model":s["repr"], "representation":[s["repr"]], "preconditions":[s["pre"]],
        "postconditions":[s["inv"]], "invariants":[s["inv"]], "ordered_method_step_ids":step_ids,
        "mutation_and_preservation_rules":["Only the commit step may change learner-visible state; rejected/failure paths preserve prior valid state."],
        "termination_argument":f"Termination follows the explicit role `{methods[p][-1]['termination_role']}` and its stated guard/check.",
        "failure_paths":[e["likely_error"]["en"] for e in errors if e["pattern_id"]==p],
        "alternative_designs":[x[0] for x in s["cases"]],
        "stage5_test_obligations":{"normal":[s["cases"][0][1]],"boundary":[s["cases"][-1][1]],"counterexample":[e["likely_error"]["en"] for e in errors if e["pattern_id"]==p],"source_fixture":[r["part_id"] for r in rows_by_pattern[p]][:5]},
        "source_constraints":official_refs[p],
        "source_issue_dispositions":[{"issue_id":x,"stage4_disposition":"Preserve the located caveat; do not certify extracted/source code.","stage5_obligation":"Verify the derived implementation/trace against the original facsimile."} for x in source_issues(p)],
        "status":"PENDING_STAGE5_EXECUTION_VERIFICATION",
    })
    anchor = next((x for x in official_refs[p] if x["ms_atoms"]), official_refs[p][0])
    examples.append({
        "worked_example_spec_id":f"b1.example.{slug(p)}", "pattern_id":p,
        "status":"PENDING_STAGE5_EXECUTION_VERIFICATION", "origin":"AlgoCore_original_adaptation_spec",
        "anchor_source":anchor,
        "prompt_design":bi(f"Dùng một tình huống mới để áp dụng {cat['name_vi']} theo đúng contract của anchor.",f"Use a new situation to apply {cat['name_en']} under the anchor contract."),
        "representation_and_convention":s["decision"], "method_step_refs":step_ids,
        "learner_checkpoints":[x["check"]["en"] for x in methods[p]],
        "contrast_and_boundary_microcases":[x[1] for x in s["cases"]],
        "evidence_to_capture_later":["initial state","guard decisions","state-changing events","postcondition check"],
        "prohibited_stage4_claims":["No executable code","No certified trace","No final runtime output","No official marks for AlgoCore adaptation"],
        "stage5_handoff":"Create fixtures and verify implementation/trace against source locators and invariants.",
    })
    qvi,qen,events=s["visual"]
    visuals.append({
        "visual_brief_id":f"b1.visual.{slug(p)}", "pattern_id":p, "method_step_refs":step_ids, "error_refs":error_ids[p],
        "learning_question":bi(qvi,qen), "visual_mode":"event_driven",
        "state_to_show":[s["repr"],s["inv"],"current guard and commit status"], "proposed_event_types":events,
        "predict_prompt":bi("Dự đoán event kế tiếp và state nào phải được giữ nguyên.","Predict the next event and which state must remain unchanged."),
        "normal_case":VISUAL_CASES[p]["normal"],
        "boundary_case":VISUAL_CASES[p]["boundary"],
        "failure_case":bi(SPECS[p]["errors"][0][1],SPECS[p]["errors"][0][2]),
        "representation_and_convention":s["conv"],
        "static_fallback":bi("Snapshot trước/sau kèm bảng guard, state và invariant.","Before/after snapshots with guard, state and invariant table."),
        "accessibility_notes":["Do not rely on colour alone.","Label indices, fields and state changes in text.","Provide keyboard-step-compatible event descriptions at Stage 7/8."],
        "status":"PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD",
    })

common={"schema_version":VERSION,"status":"SUBMITTED","batch_id":BATCH,"input_hashes":input_hashes}
write("PATTERN_CARDS.json",{**common,"pattern_cards":cards,"self_checks":{"pattern_count":len(cards),"pattern_set":PATTERNS,"assessed_part_relations":sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards),"owned_marking_atoms":sum(len(c["marking_point_refs"]) for c in cards)}})
write("VARIANT_INVARIANT_REGISTER.json",{**common,"variants":variants,"self_checks":{"variant_count":len(variants),"method_changing":sum(v["method_changing"] for v in variants)}})
write("ERROR_PREVENTION.json",{**common,"error_rows":errors,"self_checks":{"error_count":len(errors),"exact_mark_loss_claims":0}})
write("SOLUTION_DESIGNS.json",{**common,"solution_designs":solutions,"self_checks":{"design_count":len(solutions),"pending_stage5":len(solutions)}})
write("WORKED_EXAMPLE_SPECS.json",{**common,"worked_example_specs":examples,"self_checks":{"spec_count":len(examples),"primary_anchor_count":len(examples)}})
write("VISUAL_BRIEFS.json",{**common,"visual_briefs":visuals,"self_checks":{"brief_count":len(visuals),"event_driven_count":sum(v["visual_mode"]=="event_driven" for v in visuals)}})

review=f"""# B1 Foundations + Text method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review. This is not a canonical batch PASS.

## Coverage

- Exact pattern set: {len(PATTERNS)}/13 — `{', '.join(PATTERNS)}`.
- Stage 2 assessed part-pattern relations: {sum(len(chains[p]['stage2_assessed_part_ids']) for p in PATTERNS)}.
- Unique assessed parts: {len({x for p in PATTERNS for x in chains[p]['stage2_assessed_part_ids']})}.
- Official marking atoms owned once inside B1: {sum(len(refs(p)) for p in PATTERNS)}.
- Pattern cards / variant registers / solution designs / worked examples / visual briefs: 13 each.
- Error-prevention rows: {len(errors)}. No fixed mark-loss claim.

## Method decisions

1. Data declaration separates capacity from last index, record substitution from full OOP design, and bounded append from ordered insertion or queue operations.
2. Random generation writes the mathematical interval before selecting an API; unique generation advances only on accepted candidates.
3. Validation defines `VALID` first. Unique selection adds a distinct availability guard and cannot terminate after the choice space is exhausted.
4. Rule computation preserves table boundaries, units and source-stated division/rounding. Check digit does not assume modulo; the s24 floor/division rule remains source-bound.
5. Algorithm translation is defined by state equivalence, including integer arithmetic, termination, recursive return propagation and side effects.
6. String comparison stops at the first difference or prefix boundary; split has an explicit final flush; routing commits parse/convert/destination atomically; RLE counts consecutive runs and flushes the final run.

## Source and authority boundaries

- Multi-pattern parts remain one official part. Each marking atom listed by this batch has one B1 owner; assessed co-tags remain in source scope without duplicate mark allocation.
- Exact QP/MS pages and current award semantics are carried from the source submissions. Located source issues remain source refs. `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` is carried only as `source_fidelity_policies`, never as a per-part issue.
- Coursebook references are foundations only. Random API bounds, manual string protocols, RLE queue integration and source-specific check-digit rules require AlgoCore synthesis plus Stage 5 verification.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; all visual briefs remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Unresolved decisions

- When an official part has exactly one B1 pattern plus co-tags from other batches, B1 assigns the part's atoms to that sole B1 pattern. Cross-batch duplicate prevention remains a Lead aggregation check.
- Two supplied-algorithm parts also carry `RULE_COMPUTE`. Arithmetic-specific atoms are assigned to RULE_COMPUTE and structural translation atoms to ALGORITHM_TRANSLATE; Lead should inspect this join before canonicalisation.
- Pattern-limited corpus does not establish universal APIs, message literals, empty-token policy, random retry strategy or empty-input RLE behavior. These stay source-bound or Stage 5 contract decisions.

## Self-review

The validator checks exact Stage 2 assessed sets, unique atom ownership, live QP/MS locators, VI–EN method fields, four method steps per card, pattern-specific variants/errors, one anchor and event-driven visual per pattern, source-policy separation and downstream status. No code, run, trace or final output is claimed.
"""
(HERE/"REVIEW.md").write_text(review,encoding="utf-8")

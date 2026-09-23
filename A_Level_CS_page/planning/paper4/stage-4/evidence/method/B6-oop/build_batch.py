from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S2, S3, S4 = P4 / "stage-2", P4 / "stage-3", P4 / "stage-4"
PATTERNS = ["OOP_CLASS", "OOP_SUBCLASS", "OOP_GET", "OOP_SET", "OOP_UPDATE",
            "OOP_OVERRIDE", "OOP_INSTANTIATE", "OOP_CAPACITY_ADD"]
VERSION = "s4-schema-v1-b6-submission-1"
BATCH = "B6-oop"


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def dump(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def bi(vi, en):
    return {"vi": vi, "en": en}


def slug(pattern):
    return pattern.lower().replace("_", "-")


INPUTS = [S2 / "EXAM_PATTERN_CATALOG.json", S2 / "QUESTION_PATTERN_MAP.json", S2 / "CONFUSABLE_PATTERNS.json",
          S3 / "BOOK_KNOWLEDGE_MAP.json", S3 / "COVERAGE_MATRIX.json", S3 / "LESSON_PACKAGES.json",
          S4 / "SOURCE_CAVEAT_CARRYOVER.json"]
for year in ("2021-2022", "2023-2024", "2025"):
    INPUTS += [S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json",
               S4 / f"evidence/marking/{year}/SOURCE_RISK_REGISTER.json"]
INPUTS += [S4 / "schemas/pattern-card.schema.json", S4 / "schemas/error-prevention.schema.json",
           S4 / "schemas/design-briefs.schema.json"]
input_hashes = [{"path": str(p.relative_to(P4)).replace("\\", "/"), "sha256": sha(p)} for p in INPUTS]

catalog_doc = load(S2 / "EXAM_PATTERN_CATALOG.json")
catalog = {x["pattern_id"]: x for x in catalog_doc["patterns"] if x["pattern_id"] in PATTERNS}
book_doc = load(S3 / "BOOK_KNOWLEDGE_MAP.json")
chains = {x["pattern_id"]: x for x in book_doc["pattern_chains"] if x["pattern_id"] in PATTERNS}
sections = {x["section_id"]: x for x in book_doc["sections"]}
carry = load(S4 / "SOURCE_CAVEAT_CARRYOVER.json")
issues_by_id = {x["issue_id"]: x for x in carry["issues"]}
occurrences = carry["occurrences"]
fidelity_policies = carry["batch_fidelity_policies"]


def submission_rows(path):
    doc = load(path)
    return doc.get("rows") or doc.get("parts") or []


all_rows, rows_by_pattern = {}, {p: [] for p in PATTERNS}
for year in ("2021-2022", "2023-2024", "2025"):
    for raw in submission_rows(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json"):
        row = dict(raw)
        row["source_batch"] = year
        all_rows[row["part_id"]] = row
        assessed = row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
        for pattern in PATTERNS:
            if pattern in assessed:
                rows_by_pattern[pattern].append(row)


def atom_owner(row, atom):
    """Assign each MS atom once inside B6 when a part has multiple B6 co-tags."""
    assessed = row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
    b6 = [p for p in assessed if p in PATTERNS]
    if not b6:
        return None
    if len(b6) == 1:
        return b6[0]
    kinds, text = set(b6), atom["criterion_paraphrase"].lower()
    if kinds == {"OOP_CLASS", "OOP_GET"}:
        return "OOP_GET" if "get method" in text or "getter" in text else "OOP_CLASS"
    if kinds == {"OOP_SUBCLASS", "OOP_UPDATE"}:
        return "OOP_UPDATE" if any(k in text for k in ("changenumberwords", "setterritory", "adds parameter")) else "OOP_SUBCLASS"
    if kinds == {"OOP_OVERRIDE", "OOP_UPDATE"}:
        return "OOP_OVERRIDE" if "method header" in text and "overrid" in text else "OOP_UPDATE"
    if kinds == {"OOP_CLASS", "OOP_INSTANTIATE"}:
        return "OOP_INSTANTIATE" if any(k in text for k in ("initialises all tree", "storing boardobject object")) else "OOP_CLASS"
    primary = row.get("primary_pattern_id")
    return primary if primary in b6 else b6[0]


owned = {p: defaultdict(list) for p in PATTERNS}
for row in all_rows.values():
    for atom in row["marking_points"]:
        owner = atom_owner(row, atom)
        if owner:
            owned[owner][row["part_id"]].append(atom)


def row_issue_refs(row):
    refs = set(row.get("source_issue_refs", []))
    for atom in row["marking_points"]:
        refs.update(atom.get("source_issue_refs", []))
    return sorted(refs)


W21_PARTS = {"9618_w21_41_2(e)", "9618_w21_42_2(e)"}
W21_RESOLVED_CONDITION = (
    "Criterion retained under Lead decision S4-S1-DEC-001: all 11 criteria remain official evidence, "
    "no criterion receives an independent atom value, and the official part-level holistic ceiling is 8."
)
W21_RESOLVED_DISPOSITION = (
    "Lead-resolved by S4-S1-DEC-001: retain all 11 criteria, assign no independent atom values, "
    "and apply only the official part-level holistic ceiling of 8."
)


def atom_condition(row, atom):
    return W21_RESOLVED_CONDITION if row["part_id"] in W21_PARTS else atom.get("condition")


def occurrence_view(issue_id, occurrence):
    view = {"occurrence_id": occurrence["occurrence_id"], "part_id": occurrence["part_id"],
            "source_locators": occurrence["source_locators"], "status": occurrence["status"]}
    if issue_id == "W21-2E-RUBRIC":
        view.update({"status": "LEAD_RESOLVED", "resolution_ref": "S4-S1-DEC-001",
                     "stage4_disposition": W21_RESOLVED_DISPOSITION})
    else:
        view["stage4_disposition"] = occurrence["stage4_disposition"]
    return view


def source_ref(row, pattern):
    atoms = owned[pattern].get(row["part_id"], [])
    return {"part_id": row["part_id"], "source_batch": row["source_batch"],
        "qp_locator": {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]},
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "qp_constraint_refs": row["qp_requirement"].get("constraint_refs", []),
        "ms_atoms": [{"marking_point_id": m["marking_point_id"], "source_id": m["ms_source_id"],
            "pdf_pages": m["ms_pdf_pages"], "criterion_paraphrase": m["criterion_paraphrase"],
            "authority": m.get("authority", "official_ms"), "award_semantics": m["award_semantics"],
            "condition": atom_condition(row, m), "alternatives": m.get("alternatives"),
            "dependency": m.get("dependency"), "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"),
            "group_id": m.get("group_id"), "group_max": m.get("group_max"),
            "source_issue_refs": m.get("source_issue_refs", [])} for m in atoms],
        "source_issue_refs": row_issue_refs(row),
        "atom_ownership_note": "Atoms listed here have one B6 owner. An assessed co-tag may retain an empty atom list when another B6 pattern owns the atom.",
    }


official_refs = {p: [source_ref(r, p) for r in sorted(rows_by_pattern[p], key=lambda x: x["part_id"])] for p in PATTERNS}


def refs(pattern):
    return [m["marking_point_id"] for r in official_refs[pattern] for m in r["ms_atoms"]]


def mp_by(pattern, *needles):
    result = []
    for ref in official_refs[pattern]:
        for atom in ref["ms_atoms"]:
            if any(k.lower() in atom["criterion_paraphrase"].lower() for k in needles):
                result.append(atom["marking_point_id"])
    return list(dict.fromkeys(result))


def source_issues(pattern):
    return sorted({i for ref in official_refs[pattern] for i in ref["source_issue_refs"]})


def issue_dispositions(pattern):
    pids = {r["part_id"] for r in rows_by_pattern[pattern]}
    result = []
    for issue_id in source_issues(pattern):
        issue = issues_by_id[issue_id]
        occ = [x for x in occurrences if x["issue_id"] == issue_id and x["part_id"] in pids]
        result.append({"issue_id": issue_id, "status": issue["status"], "source_locators": issue["source_locators"],
            "affected_occurrences": [occurrence_view(issue_id, x) for x in occ],
            "stage4_dispositions": [W21_RESOLVED_DISPOSITION] if issue_id == "W21-2E-RUBRIC" else issue["stage4_dispositions"],
            "stage5_obligations": issue["stage5_obligations"],
            "adjudication_refs": issue.get("adjudication_refs", [])})
    return result


def step(pattern, suffix, seq, action_vi, action_en, why_vi, why_en, reads, writes,
         invariant, guard, role, check_vi, check_en, keywords=()):
    return {"step_id": f"{slug(pattern)}.step.{suffix}", "sequence": seq,
        "action": bi(action_vi, action_en), "why": bi(why_vi, why_en),
        "reads": reads, "writes": writes, "invariant": invariant, "guard": guard,
        "termination_role": role, "check": bi(check_vi, check_en),
        "marking_point_refs": mp_by(pattern, *keywords) if keywords else []}


methods = {
"OOP_CLASS": [
 step("OOP_CLASS","contract",1,"Chuyển bảng lớp/QP thành contract: tên class, từng attribute/type/visibility, constructor signature, default và composition.","Convert the class table/QP into a contract: class name, every attribute/type/visibility, constructor signature, defaults and composition.","Tên gần giống, thứ tự tham số và default đều có thể mang nghĩa khác; contract ngăn việc viết theo mẫu nhớ sẵn.","Similar names, parameter order and defaults can carry different meanings; a contract prevents writing from memory.",["class table","QP identifiers","constructor row"],["class contract"],"Every required field has one declared name, type, visibility and initialisation source.","Before declaring the class.","selects_contract","Lập bảng parameter→field/default và đếm đủ attributes.","Build a parameter-to-field/default table and count every attribute.",("class","constructor","parameter")),
 step("OOP_CLASS","attributes",2,"Khai báo đúng class và attributes; trong Python giữ nhất quán spelling/case và quy ước private được yêu cầu.","Declare the exact class and attributes; in Python preserve spelling/case and the required private convention consistently.","Double-underscore names are name-mangled; một ký tự sai tạo attribute khác thay vì cập nhật state đã định.","Double-underscore names are name-mangled; one spelling error creates a different attribute instead of updating the intended state.",["class contract"],["class shell","attribute declarations/comments"],"Every later method refers to the same canonical attribute identifier and owner instance.","Class declaration is required.","builds_representation","Đối chiếu từng identifier ở constructor, getter, setter/update và QP facsimile.","Cross-check every identifier across constructor, getter, setter/update and the QP facsimile.",("private","attribute","data type","class header")),
 step("OOP_CLASS","constructor-signature",3,"Định nghĩa constructor với đúng số/thứ tự tham số; map từng tham số vào field tương ứng và áp dụng đúng default/array/object initialisation.","Define the constructor with the exact parameter count/order; map each parameter to its field and apply required defaults/array/object initialisation.","Constructor hợp lệ phải tạo object thỏa invariant ngay sau construction, kể cả field không đến từ tham số.","A valid constructor must establish the object invariant immediately, including fields not supplied as parameters.",["constructor signature","parameter-field map","defaults"],["instance attributes"],"After construction every required field exists once with the required type/value source.","An instance is being constructed.","establishes_object_invariant","Đọc ngược từng assignment: RHS parameter/default có thật và LHS là đúng field.","Read each assignment backward: the RHS parameter/default exists and the LHS is the exact field.",("assign","initialis","stores","elements")),
 step("OOP_CLASS","audit",4,"Kiểm encapsulation, constructor nằm trong class, không shadow/misspell field và không tự đổi signature.","Audit encapsulation, constructor placement, field shadowing/misspelling and signature fidelity.","Một listing nhìn hợp lý vẫn có thể tạo hai attributes do mangling/spelling hoặc nhận sai positional arguments.","A plausible listing can create two attributes through mangling/spelling or accept positional arguments in the wrong order.",["class contract","constructed state"],["verification only"],"The class exposes exactly the required construction interface and all internal names resolve to the intended fields.","After the design is complete.","verifies_class_contract","Dùng fixture với mọi tham số khác nhau và kiểm từng field/default riêng.","Use distinct parameter values and inspect every field/default separately.",()),
],
"OOP_SUBCLASS": [
 step("OOP_SUBCLASS","split-contract",1,"Tách constructor lớp con thành parent parameters, new parameters, parent class và new attributes.","Split the subclass constructor into parent parameters, new parameters, parent class and new attributes.","Nếu không tách, tham số dễ bị chuyển nhầm cho parent hoặc gán trùng state kế thừa.","Without the split, arguments are easily sent to the wrong parent fields or inherited state is assigned twice.",["subclass table","parent constructor contract"],["subclass map"],"Every constructor parameter has exactly one destination: parent constructor or subclass field.","Before subclass declaration.","selects_inheritance_contract","Tô hai nhóm tham số parent/new và kiểm không trùng/thiếu.","Mark parent/new parameter groups and check none are duplicated or omitted.",("parameter","constructor")),
 step("OOP_SUBCLASS","inherit",2,"Khai báo lớp con kế thừa đúng parent, giữ tên/signature method theo QP.","Declare the subclass with the exact parent and preserve QP method names/signatures.","Tạo class độc lập hoặc kế thừa nhầm parent làm mất inherited state và polymorphic contract.","Creating an independent class or inheriting from the wrong parent loses inherited state and the polymorphic contract.",["parent identifier","subclass identifier"],["inheritance relation"],"Every subclass instance is substitutable where the cited parent interface is expected.","Subclass declaration is required.","establishes_type_relation","Vẽ mũi tên subclass→parent và liệt kê inherited interface.","Draw the subclass-to-parent arrow and list the inherited interface.",("inherits","class header","parent")),
 step("OOP_SUBCLASS","super",3,"Gọi constructor parent đúng một lần với đúng parent arguments và thứ tự; không chuyển new-only fields vào parent.","Call the parent constructor exactly once with the correct parent arguments in order; do not pass subclass-only fields.","Parent constructor là nơi thiết lập invariant của phần state kế thừa.","The parent constructor establishes the invariant for inherited state.",["parent parameter slice","parent constructor"],["inherited state"],"After the parent call, all inherited fields satisfy the parent invariant.","During subclass construction before subclass-specific use.","establishes_parent_state","Đếm arguments và nối từng argument tới parent field đích.","Count arguments and trace each one to its destination parent field.",("parent constructor","super","calling")),
 step("OOP_SUBCLASS","extra-state",4,"Khởi tạo từng new attribute từ đúng remaining parameter/default với đúng private spelling.","Initialise each new attribute from the correct remaining parameter/default with exact private spelling.","Subclass invariant chỉ hoàn chỉnh sau khi new state được thiết lập, không nhờ side effect của parent.","The subclass invariant is complete only after new state is set; parent construction cannot create subclass-only state.",["new parameters","new attribute table"],["subclass fields"],"Parent invariant and every subclass-only field invariant hold simultaneously.","After successful parent construction.","establishes_subclass_state","Dùng values phân biệt parent/new để phát hiện đảo mapping.","Use distinct parent/new values to expose mapping swaps.",("attribute","assigned","defined")),
 step("OOP_SUBCLASS","audit",5,"Kiểm final signature, inheritance edge, super arguments và toàn bộ state sau construction.","Audit the final signature, inheritance edge, super arguments and complete post-construction state.","Kiểm từng mảnh riêng không phát hiện parameter bị dùng hai lần hoặc bỏ quên.","Checking pieces separately can miss a parameter used twice or omitted.",["subclass map","constructed state"],["verification only"],"Every input parameter is consumed exactly once and all parent/subclass invariants hold.","After construction design.","verifies_subclass_contract","Đánh dấu từng parameter đã dùng và inspect inherited/new fields riêng.","Tick off each used parameter and inspect inherited/new fields separately.",()),
],
"OOP_GET": [
 step("OOP_GET","classify",1,"Xác nhận đây là accessor trực tiếp: field/member nào, có index business parameter hay không, return type gì.","Confirm this is a direct accessor: which field/member, whether a business index parameter exists and the return type.","Tên Get không đủ để phân loại; method tính toán/ghép chuỗi thuộc pattern khác.","A Get name alone is insufficient; calculation/formatting methods belong to other patterns.",["method contract","class fields"],["getter contract"],"The getter selects one stored member and performs no business-state mutation.","Before method design.","selects_member","Viết một dòng member→return type và parameter list.","Write one member-to-return-type line and the parameter list.",("get method","returns","accessor")),
 step("OOP_GET","signature",2,"Dùng đúng method name và signature; scalar getter thường không có business parameter, indexed getter nhận đúng index.","Use the exact method name and signature; a scalar getter normally has no business parameter, while an indexed getter takes the required index.","Thêm/bớt parameter làm caller contract không khớp.","Adding or omitting a parameter breaks the caller contract.",["getter contract"],["method interface"],"Every permitted call supplies exactly the required arguments.","Accessor method is declared.","establishes_interface","Đối chiếu call sites/dependency parts với signature.","Cross-check call sites/dependency parts against the signature.",("header","parameter","no parameter")),
 step("OOP_GET","read",3,"Đọc đúng instance field hoặc indexed member; giữ nguyên private name/case và index convention.","Read the exact instance field or indexed member; preserve private name/case and index convention.","Sai mangled name có thể đọc attribute không tồn tại; off-by-one trả member khác.","A wrong mangled name can read a nonexistent attribute; an off-by-one index returns another member.",["instance state","optional index"],["local return value"],"Selected value equals the stored value at the contract-designated member/index.","Object invariant holds and any index is valid.","captures_value","Gán các fields/indices giá trị khác nhau rồi xác nhận đúng member được chọn.","Give fields/indices distinct values and confirm the chosen member.",("attribute","array","index","correct")),
 step("OOP_GET","return",4,"Return value với đúng type; không print thay return và không đổi object.","Return the value with the exact type; do not print instead of returning and do not mutate the object.","Caller cần giá trị để so sánh/tính tiếp; output side effect không thay thế return.","The caller needs a value for later use; an output side effect does not replace a return.",["selected value","return contract","pre-state"],["return value"],"Returned value matches stored member and post-state equals pre-state.","After the read.","terminates_accessor","Snapshot object trước/sau và so returned type/value.","Snapshot the object before/after and compare returned type/value.",("return","returning")),
],
"OOP_SET": [
 step("OOP_SET","classify",1,"Xác nhận setter là direct replacement, không phải cộng, scale, clamp hay derived calculation.","Confirm the setter is direct replacement, not addition, scaling, clamping or a derived calculation.","Nhầm OOP_SET với OOP_UPDATE thay đổi semantics của state transition.","Confusing OOP_SET with OOP_UPDATE changes the state-transition semantics.",["QP verb","method table"],["setter contract"],"Post-field equals the supplied value exactly unless the QP explicitly says otherwise.","Before mutation.","selects_replacement_rule","Viết equation `field_after = parameter`, không dùng field_before.","Write `field_after = parameter`, without using field_before.",("set","assign","replace")),
 step("OOP_SET","signature",2,"Khóa method name, parameter count/order và target field/index.","Lock the method name, parameter count/order and target field/index.","Đảo value/index hoặc gán parameter vào field cùng kiểu nhưng sai tên rất khó phát hiện.","Swapping value/index or assigning to a same-typed but wrong field is hard to spot.",["setter contract","class fields"],["parameter-field map"],"Each parameter has one source role and one target role.","Before assignment.","establishes_interface","Dùng parameter values khác nhau và index biên để kiểm mapping.","Use distinct parameter values and a boundary index to check mapping.",("parameter","method header")),
 step("OOP_SET","assign",3,"Gán đúng parameter cho đúng instance field/member một lần, giữ private spelling nhất quán.","Assign the correct parameter to the exact instance field/member once, preserving private spelling.","Tạo attribute mới do typo hoặc cập nhật field khác để state cũ không được thay.","A typo can create a new attribute or update another field while the intended state remains unchanged.",["parameter-field map","old state"],["target field/member"],"Only the target member changes and its post-value equals the parameter.","Parameter/index contract is satisfied.","commits_replacement","So toàn bộ object diff: đúng một target đổi.","Diff the entire object: exactly one target changes.",("assign","storing","attribute")),
 step("OOP_SET","postcheck",4,"Kiểm return/output contract (thường không trả business value) và object invariant sau replacement.","Check the return/output contract (usually no business value) and the object invariant after replacement.","Tự trả Boolean/value hoặc print có thể đổi interface mà QP không yêu cầu.","Inventing a Boolean/value return or printing can change the interface beyond the QP.",["post-state","method contract"],["verification only"],"Target replacement holds; unrelated state and required interface remain unchanged.","After assignment.","verifies_setter","Gọi getter tương ứng nếu được cung cấp và so field mới, field khác giữ nguyên.","Use the corresponding getter when provided and compare the new field while others remain unchanged.",("return","end")),
],
"OOP_UPDATE": [
 step("OOP_UPDATE","equation",1,"Viết state equation từ QP: add/scale, hướng dấu, index, fields liên quan và clamp/limit.","Write the state equation from the QP: add/scale, sign direction, index, affected fields and clamp/limit.","Từ Change/Set không suy được phép toán; equation cụ thể ngăn nhầm replacement với relative update.","A Change/Set name does not determine the operation; an explicit equation prevents replacement/relative-update confusion.",["QP rule","old state","parameters"],["update equation"],"Every target field has an explicit before→candidate→after relation.","Before computing.","selects_rule","Dùng ký hiệu field_before và parameter, ghi rõ clamp bound.","Use field_before and parameter symbols and state every clamp bound.",("method header","parameter","calculat","add")),
 step("OOP_UPDATE","candidate",2,"Đọc old state và tính candidate đúng order/type: delta, percentage base, coordinates hoặc indexed pay.","Read old state and compute the candidate in the exact order/type: delta, percentage base, coordinates or indexed pay.","Sai base phần trăm, dấu hoặc index có thể đúng ở case đối xứng nhưng sai tổng quát.","A wrong percentage base, sign or index can pass symmetric cases but fail generally.",["old fields","parameters","update equation"],["candidate values"],"Candidate equals the source-defined formula before limiting.","All required inputs are available.","computes_candidate","Dùng non-zero old state, asymmetric deltas và non-round percentages.","Use non-zero old state, asymmetric deltas and non-round percentages.",("add","multiply","percentage","week","coordinate","position")),
 step("OOP_UPDATE","limit-and-commit",3,"Áp dụng clamp/branch cho mọi path rồi commit đúng fields; nếu nhiều fields, cập nhật từng obligation kể cả khi một field chạm limit.","Apply clamp/branch on every path and then commit exact fields; for multiple fields, update every obligation even when one reaches a limit.","Early return ở clamp có thể bỏ update field khác; commit trước clamp vi phạm bound.","Returning early at a clamp can skip another field update; committing before clamp can violate the bound.",["candidate values","bounds","old related fields"],["target fields"],"All changed fields satisfy bounds and the source relation; unrelated fields are preserved.","Candidate is computed.","commits_valid_state","Thử dưới bound, đúng bound, vượt bound và negative delta nếu contract cho phép.","Test below, at and above each bound and a negative delta when permitted.",("limit","maximum","minimum","storing","update")),
 step("OOP_UPDATE","return",4,"Thực hiện đúng return/output contract; nhiều update methods chỉ mutate và không trả business result.","Follow the exact return/output contract; many update methods mutate without returning a business result.","Tự thêm return/output có thể làm caller hoặc evidence khác yêu cầu nguồn.","Inventing a return/output can make the caller or evidence differ from the source requirement.",["post-state","method contract"],["return/output if required"],"Post-state is the sole effect unless the source explicitly requires a result.","After commit.","terminates_update","Đối chiếu QP/MS xem giá trị được return, output hay chỉ lưu.","Check QP/MS for return, output or storage-only behaviour.",("return","output")),
 step("OOP_UPDATE","postcheck",5,"So before/after cho mọi field, bound và formula; giữ identifier đúng source adjudication.","Compare before/after for every field, bound and formula; retain identifiers under the source adjudication.","Kiểm một output đơn lẻ không phát hiện field phụ bị bỏ hoặc typo tạo field mới.","Checking one output does not reveal a skipped secondary field or a typo-created field.",["pre-state","post-state","equation"],["verification only"],"The complete object diff equals exactly the specified state transition.","After the method path.","verifies_update","Liệt kê changed/unchanged fields và kiểm không có attribute lạ.","List changed/unchanged fields and check no stray attribute exists.",()),
],
"OOP_OVERRIDE": [
 step("OOP_OVERRIDE","contract",1,"Khóa parent method name/signature, subclass-specific rule, parent-call requirement và return/output type.","Lock the parent method name/signature, subclass-specific rule, parent-call requirement and return/output type.","Đổi tên/signature tạo overload hoặc method mới thay vì polymorphic override.","Changing name/signature creates an overload or new method rather than a polymorphic override.",["parent interface","subclass QP"],["override contract"],"A call through the inherited interface selects the subclass behaviour with the same callable contract.","Before override design.","selects_dispatch_contract","Đặt parent và subclass signatures cạnh nhau; chỉ body/rule được khác theo QP.","Place parent and subclass signatures side by side; only the body/rule changes as the QP permits.",("overrid","method header","parent")),
 step("OOP_OVERRIDE","parent-strategy",2,"Chọn đúng strategy: gọi parent method với transformed arguments, gọi để mở rộng output, hoặc tái hiện phần parent obligation mà nguồn cho phép.","Choose the exact strategy: call the parent with transformed arguments, call it to extend output, or reproduce the permitted parent obligation.","Gọi super mù quáng có thể cập nhật hai lần; bỏ super khi parent sở hữu storage có thể bỏ state change.","Blindly calling super can update twice; omitting it when the parent owns storage can skip the state change.",["override contract","parent side effects"],["call plan"],"Each parent obligation occurs exactly once and subclass-specific work occurs exactly once.","Before state/output mutation.","selects_reuse_strategy","Đếm side effects parent và subclass trên từng path.","Count parent and subclass side effects on each path.",("calling parent","using parent","super","original")),
 step("OOP_OVERRIDE","specialise",3,"Áp dụng đúng rule subclass: cap movement, bonus percentage, element branch hoặc description suffix.","Apply the exact subclass rule: movement caps, bonus percentage, element branch or description suffix.","Override phải khác parent ở rule được chỉ định nhưng không phá các phần interface còn lại.","The override must differ in the specified rule while preserving the rest of the interface.",["parameters","inherited state","subclass fields"],["state/result"],"Subclass-specific relation holds for every stated branch and boundary.","Dispatch reached the subclass method.","implements_specialisation","Thử mỗi branch discriminator và giá trị tại/sát bound.","Test every branch discriminator and values at/around each bound.",("bonus","element","limit","concatenat","correct changes")),
 step("OOP_OVERRIDE","result",4,"Return/output đúng type/format và giữ parent postconditions không bị override thay đổi.","Return/output the exact type/format and preserve parent postconditions not changed by the override.","Đúng state nhưng sai return/output vẫn phá substitutability và QP contract.","Correct state with a wrong return/output still breaks substitutability and the QP contract.",["specialised result","parent contract"],["return/output"],"The result satisfies both unchanged parent obligations and the explicit subclass extension.","After specialised work.","terminates_override","Gọi qua reference parent/subclass với cùng arguments và kiểm dispatch/result.","Call through parent/subclass references with the same arguments and inspect dispatch/result.",("return","output","string")),
 step("OOP_OVERRIDE","audit",5,"Kiểm không đổi signature, không double-update và mọi branch đều giữ invariant parent/subclass.","Audit unchanged signature, absence of double updates and invariants on every branch.","Một happy path không phát hiện override gọi parent sai hoặc bỏ branch.","One happy path does not expose a bad parent call or missing branch.",["all branches","pre/post state"],["verification only"],"Exactly one override path executes and leaves a valid substitutable object.","After design.","verifies_polymorphism","Dùng event log parent-call/subclass-rule/return; mỗi event xuất hiện đúng số lần.","Use a parent-call/subclass-rule/return event log; each event appears the required number of times.",()),
],
"OOP_INSTANTIATE": [
 step("OOP_INSTANTIATE","constructor-contract",1,"Đọc constructor signature của đúng class/subclass: số/thứ tự/type arguments, defaults và nested/composed objects.","Read the exact class/subclass constructor signature: argument count/order/types, defaults and nested/composed objects.","Positional arguments cùng kiểu có thể bị đảo mà không báo lỗi nhưng object state sai.","Same-typed positional arguments can be swapped without an error while object state is wrong.",["class constructor","QP data order"],["argument map"],"Each constructor argument has one source value and one destination field.","Before reading or supplying data.","selects_constructor","Viết bảng source value→argument position→field.","Write a source-value-to-argument-position-to-field table.",("instantiat","object","parameter","creating")),
 step("OOP_INSTANTIATE","acquire-values",2,"Lấy fixed/input/file values đúng record grouping, cast/type và branch class selection; giữ file/validation obligations của source part.","Acquire fixed/input/file values with correct record grouping, casts/types and class-selection branch; retain the source part's file/validation obligations.","Constructor đúng không cứu được record bị lệch dòng, sai type hoặc chọn nhầm subclass.","A correct constructor cannot repair shifted records, wrong types or a wrong subclass selection.",["data source","record grammar","branch discriminator"],["one complete argument tuple"],"One tuple represents exactly one source record/object and is type-compatible with its constructor.","Enough source values form a complete record.","prepares_arguments","Dùng values khác nhau cho mọi field và kiểm record boundary đầu/cuối.","Use distinct values for every field and check first/last record boundaries.",("read","input","split","cast","correct values")),
 step("OOP_INSTANTIATE","construct",3,"Gọi đúng class/subclass constructor một lần với tuple đúng order; với nested arrays tạo instance riêng cho từng slot.","Call the exact class/subclass constructor once with the tuple in order; for nested arrays create a distinct instance for every slot.","Tái sử dụng một mutable object cho nhiều slots tạo alias; gọi sai class mất specialised behaviour.","Reusing one mutable object across slots creates aliasing; constructing the wrong class loses specialised behaviour.",["argument tuple","class choice"],["new instance"],"The new object satisfies its class invariant and is distinct where distinct instances are required.","A complete tuple exists.","creates_object","Inspect class identity và fields; mutate một slot để phát hiện alias.","Inspect class identity and fields; mutate one slot to expose aliasing.",("creating object","instantiating","new object","constructor")),
 step("OOP_INSTANTIATE","store",4,"Lưu instance vào đúng identifier/index/container, cập nhật count chỉ khi source yêu cầu và không ghi đè object trước.","Store the instance in the exact identifier/index/container, updating count only when required and without overwriting earlier objects.","Object đúng nhưng không được lưu/reachable hoặc index không tiến vẫn không hoàn thành tập hợp.","A correct object that is not stored/reachable, or a non-advancing index, does not complete the collection.",["new instance","target container","index/count"],["object reference in container","count if required"],"After k records, exactly k constructed objects are reachable in the required order/positions.","Construction succeeded and capacity/index is valid.","commits_instance","Kiểm first/last index, object count và identity khác nhau.","Check first/last index, object count and distinct identities.",("storing","array element","append","count")),
 step("OOP_INSTANTIATE","finish",5,"Kết thúc đúng record count/EOF/fixed list và thực hiện exact return/output/call obligations thuộc cùng source part.","Terminate at the exact record count/EOF/fixed list and perform the exact return/output/call obligations of the same source part.","Off-by-one capacity, thiếu object cuối hoặc tự cộng bullet marks là lỗi contract khác với construction.","Off-by-one capacity, a missing final object or summing rubric bullets are contract errors separate from construction.",["loop state","container","source result contract"],["return/output/calls"],"Every required object exists once; no partial extra object exists; result/output matches the QP.","All required source records/fixed instances are handled.","terminates_population","Đếm objects bằng QP count, không suy capacity từ một bullet mâu thuẫn.","Count objects from the QP contract, not from a conflicting rubric bullet.",("eof","return","output","all","times")),
],
"OOP_CAPACITY_ADD": [
 step("OOP_CAPACITY_ADD","contract",1,"Khóa capacity attribute, current count, storage slot convention, object parameter và Boolean/result contract.","Lock the capacity attribute, current count, storage-slot convention, object parameter and Boolean/result contract.","Capacity của aggregate và độ dài array/count phải tạo cùng full predicate.","Aggregate capacity, array length and count must yield one full predicate.",["aggregate fields","method signature"],["bounded-add contract"],"0 <= count <= capacity and live child slots are exactly the first count positions under the observed contract.","Before the add.","selects_capacity_rule","Viết empty/full/next-write equations và result cho hai nhánh.","Write empty/full/next-write equations and branch results.",("capacity","platform","count","boolean")),
 step("OOP_CAPACITY_ADD","full-guard",2,"Kiểm count với capacity trước mọi mutation; full trả False và giữ nguyên array/count.","Compare count with capacity before any mutation; full returns False and preserves array/count.","Tăng count trước guard tạo out-of-range hoặc state báo có object chưa lưu.","Incrementing before the guard creates an out-of-range access or claims an unstored object.",["count","capacity"],["failure result only"],"Full failure is non-mutating.","count == capacity.","terminates_failure","Snapshot full aggregate trước/sau.","Snapshot the full aggregate before/after.",("full","capacity","false")),
 step("OOP_CAPACITY_ADD","store",3,"Ở nhánh còn chỗ, lưu đúng object parameter vào slot do current count chỉ ra.","On the non-full branch, store the exact object parameter in the slot identified by current count.","Dùng count sau tăng bỏ slot đầu hoặc ghi lệch một.","Using post-increment count skips the first slot or writes off by one.",["object parameter","count","storage"],["storage[count]"],"All old child references remain; the new object occupies exactly the next free live slot.","count < capacity.","commits_child","Thử count=0 và count=capacity-1 với objects khác identity.","Test count=0 and count=capacity-1 with distinct object identities.",("store","train","array")),
 step("OOP_CAPACITY_ADD","count-result",4,"Sau store thành công mới tăng count một và return True đúng type; kiểm hậu điều kiện.","Only after a successful store increment count by one and return True with the exact type; check the postcondition.","Count là biên live storage; sai order/value làm aggregate mất invariant.","Count is the live-storage boundary; wrong order/value breaks the aggregate invariant.",["stored object","old count","result contract"],["count","result"],"Success gives count_after=count_before+1 and contains the same object; failure changes nothing.","After successful store or full branch.","terminates_add","So object identity, count delta và Boolean ở cả hai nhánh.","Check object identity, count delta and Boolean on both branches.",("increment","return","true")),
],
}

# Attach every atom owned by a B6 pattern to exactly one method step.
for pattern, items in methods.items():
    seen = set()
    for item in items:
        item["marking_point_refs"] = [x for x in item["marking_point_refs"] if not (x in seen or seen.add(x))]
    missing = [x for x in refs(pattern) if x not in seen]
    items[-1]["marking_point_refs"].extend(missing)


recognition_en = {
 "OOP_CLASS":"The task asks for a class, encapsulated attributes and a constructor that maps parameters/defaults into a valid object.",
 "OOP_SUBCLASS":"The task asks for a subclass that inherits the named parent, calls its constructor and initialises new state.",
 "OOP_GET":"The task asks for an accessor that returns one stored scalar or indexed member without mutation.",
 "OOP_SET":"The task asks for direct replacement of a stored member by a supplied value.",
 "OOP_UPDATE":"The task asks for a relative, percentage, indexed, directional or bounded state transition.",
 "OOP_OVERRIDE":"The task asks a subclass to specialise an inherited method while preserving its callable contract.",
 "OOP_INSTANTIATE":"The task asks to construct and retain object instances from fixed, input or file-derived values.",
 "OOP_CAPACITY_ADD":"The task asks a containing object to reject full state or add one child object and update count.",
}

applicability = {
 "OOP_CLASS":{"preconditions":["A class table or QP defines fields and construction."],"representation":["Python class with instance attributes and constructor."],"conventions":["attribute spelling/case is exact","double underscore implies Python name mangling","constructor parameter order follows the QP","defaults and composed storage are explicit"],"variant_axes":catalog["OOP_CLASS"]["variant_axes_to_preserve"],"decision_rule":bi("Map từng constructor input/default vào đúng field trước khi viết class.","Map every constructor input/default to its exact field before writing the class.")},
 "OOP_SUBCLASS":{"preconditions":["Parent constructor and subclass table are known."],"representation":["Single inheritance plus subclass-owned fields."],"conventions":["parent arguments go through the parent constructor","subclass-only fields initialise afterward","super/parent call occurs exactly once"],"variant_axes":catalog["OOP_SUBCLASS"]["variant_axes_to_preserve"],"decision_rule":bi("Tách parent/new parameters rồi thiết lập hai invariant theo thứ tự.","Separate parent/new parameters and establish the two invariants in order.")},
 "OOP_GET":{"preconditions":["Target stored member and return type are known."],"representation":["Read-only instance method."],"conventions":["scalar getter has no business parameter unless stated","indexed getter uses the exact index convention","return is distinct from output"],"variant_axes":catalog["OOP_GET"]["variant_axes_to_preserve"],"decision_rule":bi("Chỉ dùng OOP_GET khi method trả stored member trực tiếp.","Use OOP_GET only when the method returns a stored member directly.")},
 "OOP_SET":{"preconditions":["Target member and direct replacement value are known."],"representation":["Single direct instance-member assignment."],"conventions":["field_after equals parameter","no relative arithmetic or clamp","parameter/index order remains source-specific"],"variant_axes":catalog["OOP_SET"]["variant_axes_to_preserve"],"decision_rule":bi("Nếu field_before xuất hiện trong equation thì chuyển sang OOP_UPDATE.","If field_before appears in the equation, classify the task as OOP_UPDATE.")},
 "OOP_UPDATE":{"preconditions":["Old state, parameters, formula and bounds are known."],"representation":["Rule-based mutation of one or more instance members."],"conventions":["candidate is computed from old state","clamp applies on every relevant path","all required fields update even when one reaches a bound"],"variant_axes":catalog["OOP_UPDATE"]["variant_axes_to_preserve"],"decision_rule":bi("Viết equation before→candidate→after cho từng field.","Write a before-to-candidate-to-after equation for every field.")},
 "OOP_OVERRIDE":{"preconditions":["Parent interface and subclass rule are known."],"representation":["Dynamic dispatch through the same method signature."],"conventions":["same callable contract","parent call only when the source requires/reuses it","subclass rule preserves unchanged parent postconditions"],"variant_axes":catalog["OOP_OVERRIDE"]["variant_axes_to_preserve"],"decision_rule":bi("Chọn parent-call strategy bằng side effects và output contract, không theo thói quen.","Choose the parent-call strategy from side effects and output contract, not habit.")},
 "OOP_INSTANTIATE":{"preconditions":["Constructor signature and data source are known."],"representation":["Object construction followed by storage/reachability."],"conventions":["one complete argument tuple per object","correct class/subclass selected","distinct mutable instances per required slot","record count and storage capacity follow the QP"],"variant_axes":catalog["OOP_INSTANTIATE"]["variant_axes_to_preserve"],"decision_rule":bi("Map source record→constructor arguments→container slot cho từng object.","Map source record to constructor arguments to container slot for every object.")},
 "OOP_CAPACITY_ADD":{"preconditions":["Aggregate capacity, count, storage and result contract are known."],"representation":["Bounded contained-object array plus live count."],"conventions":["count is next free slot in the observed part","full when count equals capacity","failure is non-mutating","store precedes increment"],"variant_axes":catalog["OOP_CAPACITY_ADD"]["variant_axes_to_preserve"],"decision_rule":bi("Guard full, store tại count, tăng count, rồi return exact Boolean.","Guard full, store at count, increment count, then return the exact Boolean.")},
}

corpus_limits = {
 "OOP_CLASS":"Forty assessed relations span 2021-2025 class tables, private fields, defaults, arrays and composition; no single constructor signature or privacy spelling is universal.",
 "OOP_SUBCLASS":"Eight assessed relations cover Vehicle/Employee/Character/Animal subclasses; parent argument sets and new fields remain source-specific.",
 "OOP_GET":"Thirty-five assessed relations cover scalar and indexed stored-member access; calculated/formatting methods are excluded despite possible Get-like names.",
 "OOP_SET":"Nine assessed relations cover direct replacement only; relative arithmetic, percentage and clamps remain OOP_UPDATE.",
 "OOP_UPDATE":"Nineteen assessed relations cover deltas, percentages, coordinates, indexed pay and caps; formula/direction/bounds are never universal.",
 "OOP_OVERRIDE":"Eight assessed relations cover state updates, parent reuse and description output; super-call strategy is source-specific.",
 "OOP_INSTANTIATE":"Forty-four assessed relations cover fixed, input and file-derived construction plus arrays/composition; file/validation/main-flow co-obligations remain source-bound.",
 "OOP_CAPACITY_ADD":"Single 2025 assessed relation covers Station adding Train under platform capacity; it cannot establish a universal collection API.",
}

representatives = {
 "OOP_CLASS":["9618_s21_41_3(a)","9618_s22_41_2(a)","9618_w21_41_2(a)","9618_s25_41_3(a)(i)"],
 "OOP_SUBCLASS":["9618_s23_41_2(b)(i)","9618_s23_42_3(b)(i)","9618_s25_42_3(b)(i)"],
 "OOP_GET":["9618_s21_41_3(c)(i)","9618_s22_42_3(b)","9618_w24_41_2(c)(i)"],
 "OOP_SET":["9618_w21_41_2(c)","9618_s23_41_2(a)(iii)","9618_w23_42_3(a)(iii)"],
 "OOP_UPDATE":["9618_s22_41_2(c)","9618_s23_41_2(a)(iv)","9618_s23_42_3(a)(iii)","9618_s25_42_3(c)(i)"],
 "OOP_OVERRIDE":["9618_s23_41_2(b)(ii)","9618_s23_42_3(b)(ii)","9618_s25_42_3(b)(ii)"],
 "OOP_INSTANTIATE":["9618_s21_41_3(b)","9618_s22_42_3(c)","9618_s23_42_3(c)","9618_w25_43_1(b)(i)"],
 "OOP_CAPACITY_ADD":["9618_w25_41_2(c)(ii)"],
}

confusables = {
 "OOP_CLASS":["OOP_INSTANTIATE","DATA_RECORD"], "OOP_SUBCLASS":["OOP_CLASS","OOP_OVERRIDE"],
 "OOP_GET":["OOP_UPDATE","OUTPUT_FORMAT"], "OOP_SET":["OOP_UPDATE"],
 "OOP_UPDATE":["OOP_SET","RULE_COMPUTE"], "OOP_OVERRIDE":["OOP_UPDATE","OOP_SUBCLASS"],
 "OOP_INSTANTIATE":["OOP_CLASS","FILE_READ_OBJECTS","MAIN_FLOW"], "OOP_CAPACITY_ADD":["ARRAY_APPEND","OOP_INSTANTIATE"],
}


def objectives(pattern):
    return list(dict.fromkeys(o for x in chains[pattern]["knowledge_chain"] for o in x["objective_ids"]))


def requirement_refs(pattern):
    return [f"ac-9618-p4-2026-python.assessment-requirement.{x.lower()}" for x in objectives(pattern)]


CONTRAST_REFS = {
    "OOP_SET": ["A3C06"],
    "OOP_UPDATE": ["A3C06"],
}

cards = []
for pattern in PATTERNS:
    chain = chains[pattern]
    book_ids = list(dict.fromkeys(s for x in chain["knowledge_chain"] for s in x["book_section_ids"]))
    refs_for_pattern = official_refs[pattern]
    cards.append({"card_id":f"ac-9618-p4-2026-python.stage4.pattern.{slug(pattern)}","pattern_id":pattern,
      "version":VERSION,"status":"SUBMITTED","package_id":chain["package_id"],"lesson_id":chain["lesson_id"],
      "knowledge_block_ids":chain["knowledge_block_ids"],"objective_ids":objectives(pattern),
      "titles":bi(catalog[pattern]["name_vi"],catalog[pattern]["name_en"]),
      "recognition":bi(catalog[pattern]["recognition_vi"],recognition_en[pattern]),
      "source_scope":{"assessed_part_ids":catalog[pattern]["assessed_part_ids"],
        "representative_parts":[r for r in refs_for_pattern if r["part_id"] in representatives[pattern]],
        "official_source_refs":refs_for_pattern,"corpus_limit":corpus_limits[pattern]},
      "confusable_pattern_refs":confusables[pattern],"confusable_contrast_refs":CONTRAST_REFS.get(pattern, []),
      "source_issue_refs":source_issues(pattern),
      "source_fidelity_policies":fidelity_policies if any(r["source_batch"]=="2023-2024" for r in refs_for_pattern) else [],
      "book_foundation_refs":[{"section_id":sid,"source_id":sections[sid]["source_id"],
        "printed_pages":sections[sid]["printed_pages"],"pdf_pages":sections[sid]["pdf_pages"],
        "support_level":sections[sid]["support_level"],"limitations":sections[sid]["limitations"],
        "authority":"coursebook_foundation"} for sid in book_ids],
      "applicability":applicability[pattern],"method_steps":methods[pattern],"marking_point_refs":refs(pattern),
      "assessment_requirement_refs":requirement_refs(pattern),"error_refs":[],
      "solution_design_ref":f"b6.solution.{slug(pattern)}","visual_brief_ref":f"b6.visual.{slug(pattern)}",
      "authority_labels":["official_qp","official_ms","official_syllabus","coursebook_foundation","AlgoCore_inference","AlgoCore_risk"],
      "authority_note":"Official obligations are limited to cited QP/MS atoms. Atom ownership is unique inside B6. Method, invariants and repairs are AlgoCore inference/risk; source fidelity policy is not a per-part issue.",
      "downstream_status":"PENDING_STAGE5_EXECUTION_VERIFICATION"})


variant_specs = [
 ("class-constructor",["OOP_CLASS"],"visibility_parameter_mapping_defaults",
  "Từ class table tạo map field/type/visibility/source-of-value.","Build a field/type/visibility/value-source map from the class table.",
  [{"case_id":"all_parameters","signature":"every field supplied","initialisation":"parameter→matching field"},{"case_id":"parameters_plus_defaults","signature":"some fields omitted","initialisation":"parameter fields plus stated defaults"},{"case_id":"composition_or_array","signature":"container field","initialisation":"distinct child/default element per required slot"}],
  "Immediately after construction every required field exists once, with exact identifier and source-defined value."),
 ("subclass-construction",["OOP_SUBCLASS"],"parent_new_attributes_super_call",
  "Chia parameters thành parent slice và subclass slice trước super call.","Partition parameters into parent and subclass slices before the super call.",
  [{"case_id":"parent_plus_one_field","order":"super(parent args), then one subclass assignment"},{"case_id":"parent_plus_multiple_fields","order":"super(parent args), then each new field exactly once"}],
  "Parent invariant holds after super; subclass invariant holds after new-field initialisation."),
 ("getter-member",["OOP_GET"],"scalar_or_indexed_member",
  "Chọn stored member và optional index từ method contract.","Select the stored member and optional index from the method contract.",
  [{"case_id":"scalar","parameters":"none besides instance","return":"one stored scalar"},{"case_id":"indexed","parameters":"source index","return":"stored element at exact index"}],
  "Getter returns stored value/type and leaves the entire object unchanged."),
 ("set-versus-update",["OOP_SET","OOP_UPDATE"],"replacement_or_rule_transition",
  "Dùng equation: không có field_before là Set; có field_before/formula/bound là Update.","Use the equation: no field_before means Set; field_before/formula/bound means Update.",
  [{"case_id":"direct_set","equation":"field_after=parameter"},{"case_id":"relative_add","equation":"field_after=field_before+delta"},{"case_id":"bounded_or_scaled","equation":"field_after=clamp_or_scale(field_before, parameter)"},{"case_id":"indexed_derived","equation":"member[index]=formula(parameters, fields)"}],
  "Only named targets change; after-state satisfies the exact source equation and bounds."),
 ("override-strategy",["OOP_OVERRIDE"],"parent_call_subclass_rule_result",
  "Tính parent side effects rồi chọn call/extend/reimplement strategy để mỗi obligation xảy ra đúng một lần.","Count parent side effects, then choose call/extend/reimplement so every obligation occurs once.",
  [{"case_id":"transform_then_super","example":"bonus-adjusted hours passed to parent SetPay"},{"case_id":"specialised_state_rule","example":"movement/element rule replaces parent behaviour"},{"case_id":"extend_result","example":"parent description plus subclass text"}],
  "Same callable contract dispatches to subclass behaviour without duplicate parent side effects."),
 ("instantiate-source",["OOP_INSTANTIATE"],"fixed_input_file_single_array_composition",
  "Map one complete source record/fixed tuple to one constructor call and one storage destination.","Map one complete source record/fixed tuple to one constructor call and one storage destination.",
  [{"case_id":"fixed_single","source":"literal tuple","destination":"named object"},{"case_id":"interactive","source":"validated/input tuple","destination":"single or array slot"},{"case_id":"file_records","source":"one complete grouped record","destination":"next object slot"},{"case_id":"nested_grid","source":"default child tuple","destination":"distinct instance per grid cell"}],
  "After k source tuples exactly k valid, correctly typed object instances are reachable in required positions."),
 ("capacity-add",["OOP_CAPACITY_ADD"],"capacity_count_return",
  "Dùng count làm next-free slot và capacity làm full boundary trong observed Station contract.","Use count as next-free slot and capacity as full boundary in the observed Station contract.",
  [{"case_id":"space","guard":"count<capacity","transition":"storage[count]=object; count+=1; True"},{"case_id":"full","guard":"count==capacity","transition":"no mutation; False"}],
  "0<=count<=capacity; success adds the exact object once and failure preserves all state."),
]
variants = [{"variant_id":f"b6.variant.{vid}","pattern_ids":pats,"stage2_contrast_refs":(["A3C06"] if vid == "set-versus-update" else []),"axis":axis,
             "decision_rule":bi(vi,en),"cases":cases,"invariant":inv,"method_changing":True}
            for vid,pats,axis,vi,en,cases,inv in variant_specs]


errors=[]
def add_error(pattern,suffix,steps,likely_vi,likely_en,cons_vi,cons_en,detect_vi,detect_en,repair_vi,repair_en,
              basis="AlgoCore_risk",keywords=(),parts=(),issue_id=None,note=None):
    atom_refs=mp_by(pattern,*keywords) if keywords else []
    loc=[r for r in official_refs[pattern] if (not parts or r["part_id"] in parts) and
         (not atom_refs or any(m["marking_point_id"] in atom_refs for m in r["ms_atoms"]))]
    if issue_id:
        issue=issues_by_id[issue_id]
        loc=[{"issue_id":issue_id,"source_locators":issue["source_locators"],
              "affected_occurrences":[occurrence_view(issue_id, x) for x in occurrences if x["issue_id"]==issue_id and x["part_id"] in {r["part_id"] for r in rows_by_pattern[pattern]}],
              "adjudication_refs":issue.get("adjudication_refs",[])}]
    errors.append({"error_id":f"b6.{slug(pattern)}.error.{suffix}","pattern_id":pattern,
      "question_part_ids":list(parts),"requirement_refs":requirement_refs(pattern),"marking_point_refs":atom_refs,
      "method_step_refs":[f"{slug(pattern)}.step.{x}" for x in steps],"likely_error":bi(likely_vi,likely_en),
      "consequence":bi(cons_vi,cons_en),"detection_check":bi(detect_vi,detect_en),"repair_action":bi(repair_vi,repair_en),
      "repair_exercise_ref":f"b6.{slug(pattern)}.repair.{suffix}","basis":basis,"source_locator_if_official":loc,
      "exact_mark_loss_claim":None,"authority_note":note or "AlgoCore risk derived from the contract/invariant; no examiner-frequency or fixed mark-loss claim is made.","status":"SUBMITTED"})

add_error("OOP_CLASS","private-name-mismatch",["attributes","audit"],"Dùng `__Field` ở constructor nhưng `_Field`, `Field` hoặc khác case ở method sau.","Using `__Field` in the constructor but `_Field`, `Field` or another case later.","Python có thể tạo/read attribute khác do name mangling hoặc typo.","Python may create/read another attribute through name mangling or a typo.","Lập identifier inventory từ facsimile và diff instance fields.","Build an identifier inventory from the facsimile and diff instance fields.","Chọn một canonical QP identifier cho design và dùng nhất quán; không chứng nhận source sample có lỗi.","Use one canonical QP identifier consistently in the design; do not certify a defective source sample.","official_qp_ms",("private","attribute"))
add_error("OOP_CLASS","parameter-field-swap",["contract","constructor-signature"],"Đảo hai positional parameters hoặc gán RHS vào field cùng kiểu nhưng sai tên.","Swapping positional parameters or assigning an RHS to the wrong same-typed field.","Object được tạo nhưng state semantics sai.","The object is created with semantically wrong state.","Dùng mọi parameter value khác nhau và inspect từng field.","Use distinct values for every parameter and inspect each field.","Viết map parameter→field trước assignments.","Write the parameter-to-field map before assignments.","official_qp_ms",("assign","parameter","storing"))
add_error("OOP_CLASS","wrong-signature-default",["contract","constructor-signature"],"Thêm/bớt parameter hoặc lấy default field từ parameter không có trong QP.","Adding/removing a parameter or sourcing a default field from an absent QP parameter.","Caller contract sai hoặc invariant ban đầu không đúng.","The caller contract breaks or the initial invariant is wrong.","Đếm signature và đánh dấu fields parameter/default/computed.","Count the signature and label fields parameter/default/computed.","Khôi phục exact signature và default source.","Restore the exact signature and default source.","official_qp_ms",("constructor","initialis"))
add_error("OOP_CLASS","s21-param-sample",["constructor-signature","audit"],"Sao listing TreasureChest với `pointsP` nhưng assignment dùng `points`.","Copying the TreasureChest listing whose parameter is `pointsP` but assignment uses `points`.","Constructor tham chiếu sai identifier và không thiết lập points đúng.","The constructor references the wrong identifier and fails to establish points correctly.","Mở QP/MS locator và trace parameter→field.","Open the QP/MS locator and trace parameter to field.","Giữ requirement; Stage 5 tự implement/test, không nhận sample là code đúng.","Retain the requirement; independently implement/test at Stage 5 without treating the sample as correct code.","source_issue",parts=("9618_s21_41_3(a)","9618_s21_42_3(a)","9618_s21_43_3(a)"),issue_id="S21-3A-PARAM")
add_error("OOP_CLASS","w22-coordinate-spelling",["attributes","audit"],"Sao `__XCoordiante` ở constructor nhưng methods dùng `__XCoordinate`.","Copying `__XCoordiante` in the constructor while methods use `__XCoordinate`.","Tạo hai attributes và getter/update đọc state khác.","It creates two attributes and getter/update read another state.","So identifier ở QP/MS pages 11–13 và kiểm instance dictionary ở Stage 5.","Compare identifiers at QP/MS pages 11-13 and inspect instance state at Stage 5.","Giữ caveat, không silent-normalise sample trong Stage 4.","Carry the caveat; do not silently normalise the sample in Stage 4.","source_issue",parts=("9618_w22_42_2(a)",),issue_id="W22-42-2A-ATTRIBUTE")
add_error("OOP_CLASS","constructor-underscore-source",["constructor-signature","audit"],"Sao tên constructor một underscore từ MS 2025 hoặc tin plain-text đã giữ đủ underscores.","Copying a single-underscore constructor name from the 2025 MS or trusting plain text to preserve underscores.","Python không gọi constructor intended và fields không được khởi tạo.","Python does not invoke the intended constructor and fields remain uninitialised.","Kiểm facsimile locators và test independent construction ở Stage 5.","Check facsimile locators and independently test construction at Stage 5.","Dùng rubric làm authority, không copy/silent-repair sample tại Stage 4.","Use rubric criteria as authority; do not copy or silently repair the sample at Stage 4.","source_issue",parts=("9618_s25_41_3(a)(i)",),issue_id="S25-41-MS31-INIT")
add_error("OOP_CLASS","tree-constructor-underscore",["constructor-signature","audit"],"Coi Tree sample `def _init_` là constructor Python hợp lệ.","Treating the Tree sample `def _init_` as a valid Python constructor.","Tree FirstNode không được khởi tạo khi tạo object.","Tree FirstNode is not initialised when constructing the object.","Dùng facsimile MS p35 và independent Stage 5 fixture.","Use MS facsimile p35 and an independent Stage 5 fixture.","Giữ source defect; không chứng nhận listing.","Carry the source defect and do not certify the listing.","source_issue",parts=("9618_s25_41_3(c)(i)",),issue_id="S25-41-MS35-INIT")

add_error("OOP_SUBCLASS","missing-or-wrong-parent",["inherit"],"Khai báo class độc lập hoặc kế thừa sai parent.","Declaring an independent class or inheriting from the wrong parent.","Inherited fields/method dispatch không tồn tại.","Inherited fields and method dispatch are absent.","Kiểm subclass→parent edge và inherited interface.","Check the subclass-to-parent edge and inherited interface.","Đặt exact parent trong class declaration.","Use the exact parent in the class declaration.","official_qp_ms",("inherits","class header"))
add_error("OOP_SUBCLASS","super-argument-map",["split-contract","super","extra-state"],"Chuyển new field vào super, sai order, hoặc gán lại parent fields trực tiếp.","Passing a new field to super, using wrong order, or directly reassigning parent fields.","Parent invariant sai hoặc parameter bị dùng hai lần.","The parent invariant fails or a parameter is consumed twice.","Tô parent/new slice và tick mỗi parameter một lần.","Mark parent/new slices and tick every parameter once.","Gọi parent đúng một lần rồi gán only new fields.","Call the parent exactly once, then assign only new fields.","official_qp_ms",("parent constructor","calling parent","parameter"))
add_error("OOP_SUBCLASS","territory-identifier-source",["extra-state","audit"],"Trộn Territory/SetTerritory trong MS với TerritorySize/SetTerritorySize trong QP.","Mixing MS Territory/SetTerritory with QP TerritorySize/SetTerritorySize.","Subclass/update có thể tạo field/method khác caller mong đợi.","Subclass/update may create a field/method different from the caller contract.","Đọc QP/MS p40–41 và giữ QP identifiers trong design.","Read QP/MS p40-41 and keep QP identifiers in the design.","Áp dụng canonical treatment; Stage 5 kiểm assembly.","Apply the canonical treatment and verify assembly in Stage 5.","source_issue",parts=("9618_s25_42_3(c)(i)",),issue_id="S25-42-Q3CI-NAME")

add_error("OOP_GET","wrong-member",["classify","read"],"Return field cùng kiểu nhưng sai tên hoặc sai index.","Returning a same-typed but wrong field or index.","Caller nhận value hợp lệ về type nhưng sai nghĩa.","The caller receives a type-correct but semantically wrong value.","Gán mỗi member value khác nhau, thử index đầu/cuối.","Give every member a distinct value and test first/last index.","Trace exact member/index từ contract.","Trace the exact member/index from the contract.","official_qp_ms",("returning correct","attribute","index"))
add_error("OOP_GET","print-not-return",["return"],"Print stored value thay vì return.","Printing the stored value instead of returning it.","Call expression nhận None/void và không dùng value tiếp được.","The call expression receives None/void and cannot reuse the value.","Gán call result vào biến và kiểm type/value, tách stdout.","Assign the call result and check type/value separately from stdout.","Return exact value; chỉ output nếu QP yêu cầu.","Return the exact value; output only when required.","official_qp_ms",("return","returns"))
add_error("OOP_GET","mutating-getter",["read","return"],"Getter thay đổi field/index/counter trong khi đọc.","A getter changes a field/index/counter while reading.","Hai calls liên tiếp trả state khác và phá read-only contract.","Two consecutive calls see changed state and break the read-only contract.","Snapshot object trước/sau hai calls.","Snapshot the object around two calls.","Chỉ đọc local return value; bỏ mọi assignment vào instance.","Read only a local return value; remove every instance assignment.")

add_error("OOP_SET","set-versus-update",["classify","assign"],"Cộng parameter vào old field hoặc clamp trong direct setter.","Adding the parameter to the old field or clamping inside a direct setter.","Post-value khác input trực tiếp.","The post-value differs from the direct input.","Dùng old=10,new=3; setter phải cho 3, không 13.","Use old=10,new=3; the setter must yield 3, not 13.","Khôi phục equation field_after=parameter.","Restore field_after=parameter.","official_qp_ms",("assign","parameter"))
add_error("OOP_SET","parameter-order",["signature","assign"],"Đảo value/index hoặc gán parameter A vào field B.","Swapping value/index or assigning parameter A to field B.","Sai member bị thay dù method chạy.","The wrong member changes even though the method runs.","Dùng values/index phân biệt và diff tất cả fields.","Use distinct values/indices and diff all fields.","Map từng parameter tới một role/target.","Map every parameter to one role/target.","official_qp_ms",("parameter","attribute"))
add_error("OOP_SET","invented-result",["postcheck"],"Tự return Boolean hoặc print sau setter không được yêu cầu.","Inventing a Boolean return or print after an unspecified setter.","Interface khác QP và caller assumptions.","The interface differs from the QP and caller assumptions.","Kiểm exact return/output wording.","Check exact return/output wording.","Giữ setter storage-only trừ khi source nói khác.","Keep the setter storage-only unless the source says otherwise.")

add_error("OOP_UPDATE","replacement-instead-of-relative",["equation","candidate"],"Gán field=delta thay vì field=field+delta.","Assigning field=delta instead of field=field+delta.","Mất old state và sai mọi non-zero case.","Old state is lost and every non-zero case is wrong.","Dùng old state khác 0 và viết equation trước.","Use non-zero old state and write the equation first.","Tính candidate từ old field.","Compute the candidate from the old field.","official_qp_ms",("add","adding","increase"))
add_error("OOP_UPDATE","wrong-direction-or-base",["candidate"],"Đảo dấu coordinate/delta hoặc tính percentage trên sai base.","Reversing a coordinate/delta sign or applying a percentage to the wrong base.","State di chuyển/scaled ngược dù positive case đơn giản có thể che lỗi.","State moves/scales incorrectly even if a simple positive case hides it.","Dùng asymmetric signed values và non-round percentage.","Use asymmetric signed values and a non-round percentage.","Ghi formula với field_before/parameter labels.","Write the formula with field_before/parameter labels.","official_qp_ms",("percentage","coordinate","position","correct calculations"))
add_error("OOP_UPDATE","clamp-skips-related-field",["limit-and-commit","postcheck"],"Return ngay khi một field chạm max và bỏ update field khác phải luôn xảy ra.","Returning when one field hits max and skipping another field that must always update.","Object chỉ thực hiện một phần transition.","The object performs only part of the transition.","Boundary case một field vượt max, field khác vẫn phải đổi.","Use a case where one field exceeds max while another must still change.","Clamp từng candidate rồi commit đủ target fields.","Clamp each candidate, then commit every target field.","official_qp_ms",("limiting","every case","maximum"))
add_error("OOP_UPDATE","territory-name",["equation","postcheck"],"Update field Territory khác QP TerritorySize vì theo MS wording biến thể.","Updating Territory instead of QP TerritorySize because of the MS wording variant.","Tạo stray attribute; getter/caller không thấy update.","A stray attribute is created and the caller/getter misses the update.","Inventory attributes trước/sau và dùng canonical QP name.","Inventory attributes before/after and use the canonical QP name.","Carry S25-42-Q3CI-NAME và verify independent code Stage 5.","Carry S25-42-Q3CI-NAME and verify independent Stage 5 code.","source_issue",parts=("9618_s25_42_3(c)(i)",),issue_id="S25-42-Q3CI-NAME")

add_error("OOP_OVERRIDE","signature-drift",["contract"],"Đổi method name/parameter list nên không override parent.","Changing method name/parameters so the parent method is not overridden.","Dynamic dispatch gọi parent behaviour hoặc call thất bại.","Dynamic dispatch invokes parent behaviour or the call fails.","So parent/subclass signatures side by side và call qua parent interface.","Compare signatures side by side and call through the parent interface.","Khôi phục exact callable contract.","Restore the exact callable contract.","official_qp_ms",("overrid","method header"))
add_error("OOP_OVERRIDE","wrong-super-strategy",["parent-strategy","specialise"],"Gọi parent rồi lặp lại update, hoặc bỏ parent khi nó sở hữu storage.","Calling the parent then repeating its update, or omitting it when it owns storage.","State bị double-update hoặc không update.","State is updated twice or not at all.","Event log đếm parent/subclass side effects.","Use an event log to count parent/subclass side effects.","Chọn strategy theo source, mỗi obligation đúng một lần.","Choose the source-defined strategy so each obligation occurs once.","official_qp_ms",("calling parent","original","correct changes"))
add_error("OOP_OVERRIDE","wrong-branch-result",["specialise","result"],"Bỏ một element/direction branch hoặc ghép sai description text.","Omitting an element/direction branch or composing the wrong description text.","Một subtype branch trả/update sai exact contract.","One subtype branch returns/updates the wrong exact contract.","Test mỗi discriminator và exact output type/format.","Test each discriminator and exact output type/format.","Lập decision table đầy đủ trước body.","Build a complete decision table before the body.","official_qp_ms",("checking element","concatenating","correct"))

add_error("OOP_INSTANTIATE","argument-order-type",["constructor-contract","acquire-values","construct"],"Đưa values vào constructor sai order/type hoặc record grouping.","Passing values to the constructor in the wrong order/type or record grouping.","Object được tạo nhưng fields thuộc record khác/sai nghĩa.","The object is created with fields from another record or wrong meanings.","Dùng unique values cho mọi field và inspect first/last object.","Use unique values for every field and inspect first/last objects.","Dùng source→argument→field map.","Use the source-to-argument-to-field map.","official_qp_ms",("correct parameters","values","lines"))
add_error("OOP_INSTANTIATE","alias-or-overwrite",["construct","store"],"Tái dùng cùng mutable object cho nhiều slots hoặc không tiến index.","Reusing one mutable object for several slots or not advancing the index.","Mutate một slot đổi nhiều slots; object trước bị ghi đè.","Mutating one slot changes several, or an earlier object is overwritten.","So object identity và mutate riêng một slot.","Compare identities and mutate one slot only.","Construct inside iteration/cell và advance destination đúng một.","Construct inside each iteration/cell and advance the destination once.","official_qp_ms",("next array","each object","each array","storing"))
add_error("OOP_INSTANTIATE","wrong-class-branch",["acquire-values","construct"],"Luôn tạo parent thay vì subclass khi discriminator yêu cầu Manager/other subtype.","Always creating the parent instead of the required Manager/other subtype.","Mất subclass fields và override behaviour.","Subclass fields and override behaviour are lost.","Dùng một record mỗi branch và inspect runtime class identity tại Stage 5.","Use one record per branch and inspect runtime class identity at Stage 5.","Chọn class trước constructor call bằng exact discriminator.","Select the class before the constructor call using the exact discriminator.","official_qp_ms",("manager","employee","type"))
add_error("OOP_INSTANTIATE","s21-capacity-count",["store","finish"],"Dạy capacity 4 theo một bullet MS dù QP yêu cầu năm objects.","Teaching capacity 4 from one MS bullet although the QP requires five objects.","Object thứ năm không thể lưu hoặc bị bỏ.","The fifth object cannot be stored or is omitted.","Đối chiếu QP/MS locators và đếm five records/objects.","Cross-check QP/MS locators and count five records/objects.","Giữ cả discrepancy; không biến 4 thành QP requirement.","Preserve the discrepancy; never turn 4 into the QP requirement.","source_issue",parts=("9618_s21_41_3(b)","9618_s21_42_3(b)","9618_s21_43_3(b)"),issue_id="S21-3B-COUNT")
add_error("OOP_INSTANTIATE","w21-rubric-arithmetic",["finish"],"Cộng bullets thành 9 marks thay vì giữ holistic ceiling 8 đã adjudicate.","Summing bullets to 9 marks instead of retaining the adjudicated holistic ceiling of 8.","Tạo false mark-allocation claim.","It creates a false mark-allocation claim.","Đọc S4-S1-DEC-001 và atom semantics holistic/group metadata.","Read S4-S1-DEC-001 and the holistic/group atom metadata.","Giữ mọi criteria, không gán independent atom values; official total 8.","Retain every criterion without independent atom values; official total is 8.","source_issue",parts=("9618_w21_41_2(e)","9618_w21_42_2(e)"),issue_id="W21-2E-RUBRIC")

add_error("OOP_CAPACITY_ADD","off-by-one-full",["contract","full-guard"],"Dùng count>capacity hoặc count==capacity-1 làm full sai convention.","Using count>capacity or count==capacity-1 as full under the wrong convention.","Bỏ phí slot cuối hoặc ghi vượt array.","The final slot is wasted or storage is overrun.","Test capacity 1, count 0 và count 1.","Test capacity 1 with counts 0 and 1.","Suy full từ count là số item/next-free slot.","Derive full from count as item count/next-free slot.","official_qp_ms",("capacity","full"))
add_error("OOP_CAPACITY_ADD","increment-before-store",["store","count-result"],"Tăng count trước store hoặc tăng cả nhánh full.","Incrementing count before storage or on the full branch.","Ghi sai slot và count không khớp live objects.","The wrong slot is written and count no longer matches live objects.","Trace events guard→store→increment cho count 0/capacity−1/full.","Trace guard→store→increment for count 0/capacity-1/full.","Store tại old count; chỉ success mới increment.","Store at old count; increment only on success.","official_qp_ms",("store","increment"))
add_error("OOP_CAPACITY_ADD","wrong-result-or-object",["store","count-result"],"Return sai Boolean hoặc tạo object mới thay vì lưu exact Train parameter.","Returning the wrong Boolean or creating another object instead of storing the exact Train parameter.","Caller hiểu sai success hoặc aggregate chứa identity khác.","The caller misreads success or the aggregate contains another identity.","So object identity và Boolean ở both branches.","Check object identity and Boolean on both branches.","Lưu parameter trực tiếp và giữ exact True/False contract.","Store the parameter directly and preserve the exact True/False contract.","official_qp_ms",("train","return","true","false"))

errors_by_pattern={p:[e["error_id"] for e in errors if e["pattern_id"]==p] for p in PATTERNS}
for card in cards:
    card["error_refs"] = errors_by_pattern[card["pattern_id"]]


variant_for={"OOP_CLASS":"b6.variant.class-constructor","OOP_SUBCLASS":"b6.variant.subclass-construction",
 "OOP_GET":"b6.variant.getter-member","OOP_SET":"b6.variant.set-versus-update","OOP_UPDATE":"b6.variant.set-versus-update",
 "OOP_OVERRIDE":"b6.variant.override-strategy","OOP_INSTANTIATE":"b6.variant.instantiate-source",
 "OOP_CAPACITY_ADD":"b6.variant.capacity-add"}
contracts={
 "OOP_CLASS":("Bảng lớp/hợp đồng khởi tạo từ QP.","Class table/QP construction contract.","Object mới thỏa đúng fields, visibility, mapping và defaults.","A constructed object satisfying exact fields, visibility, mapping and defaults."),
 "OOP_SUBCLASS":("Hợp đồng parent cùng parameters/fields mới của subclass.","Parent contract plus subclass parameters/new fields.","Instance hợp lệ thỏa đồng thời invariant parent và subclass.","A valid instance satisfying both parent and subclass invariants."),
 "OOP_GET":("Object hợp lệ và source index nếu có.","A valid object and optional source index.","Đúng stored value/type và object không đổi.","Exact stored value/type with unchanged object state."),
 "OOP_SET":("Object hợp lệ cùng replacement value/index nếu có.","A valid object and replacement value/optional index.","Đúng target được thay; state không liên quan được giữ nguyên.","Exact target replacement; unrelated state preserved."),
 "OOP_UPDATE":("Object hợp lệ, rule parameters và bounds.","A valid object, rule parameters and bounds.","Đúng bounded/relative/derived state transition.","The exact bounded/relative/derived state transition."),
 "OOP_OVERRIDE":("Subclass instance và inherited method contract.","A subclass instance and inherited method contract.","Hành vi chuyên biệt giữ nguyên parent interface/postconditions không bị thay.","Specialised behaviour with unchanged parent interface/postconditions."),
 "OOP_INSTANTIATE":("Constructor, fixed/input/file record tuples và destination.","Constructor plus fixed/input/file record tuples and destination.","Các instance riêng biệt cần thiết reachable đúng vị trí/thứ tự.","Required distinct instances reachable in exact positions/order."),
 "OOP_CAPACITY_ADD":("Aggregate hữu hạn và một child object.","Bounded aggregate and one child object.","True với một child được commit, hoặc False với full state giữ nguyên.","True with one committed child, or False with unchanged full state."),
}
tests={
 "OOP_CLASS":(["distinct constructor values","all defaults/fields"],["zero/empty defaults","array/composition first and last slot"],["swapped parameters","mangled-name typo","single-underscore constructor sample"]),
 "OOP_SUBCLASS":(["parent and new fields distinct"],["minimum/maximum constructor values","no optional new field if source has none"],["wrong super order","parent field assigned twice"]),
 "OOP_GET":(["every scalar getter","valid indexed member"],["first/last index","empty string/zero stored value"],["print instead of return","wrong same-typed field"]),
 "OOP_SET":(["replace from different old value"],["first/last indexed member","zero/empty replacement"],["add instead of replace","swapped value/index"]),
 "OOP_UPDATE":(["ordinary delta/percentage/index"],["at/below/above every clamp","negative delta when allowed"],["replace instead of add","skip secondary field","wrong percentage base"]),
 "OOP_OVERRIDE":(["each subclass branch"],["at/around caps","parent result plus empty/nonempty extension"],["signature drift","double parent effect","omitted branch"]),
 "OOP_INSTANTIATE":(["fixed object","input object","file first/middle/last record"],["one record","exact capacity","nested grid corners"],["wrong class branch","aliased instances","shifted record grouping"]),
 "OOP_CAPACITY_ADD":(["empty to one","partially filled add"],["one slot left","already full","capacity 1"],["increment before store","wrong Boolean","different object identity"]),
}
solutions=[]
for p in PATTERNS:
    cin_vi,cin_en,cout_vi,cout_en=contracts[p]; normal,boundary,counter=tests[p]
    solutions.append({"solution_design_id":f"b6.solution.{slug(p)}","pattern_id":p,"variant_id":variant_for[p],
      "input_contract":bi(cin_vi,cin_en),"output_contract":bi(cout_vi,cout_en),
      "state_model":"; ".join(applicability[p]["representation"]),"representation":applicability[p]["conventions"],
      "preconditions":applicability[p]["preconditions"],"postconditions":[methods[p][-1]["invariant"],"Exact source return/output and identifier obligations remain part-specific."],
      "invariants":list(dict.fromkeys(x["invariant"] for x in methods[p])),
      "ordered_method_step_ids":[x["step_id"] for x in methods[p]],
      "mutation_and_preservation_rules":["No unrequested state mutation.","Every successful mutation restores class/object invariant before return.","Private identifier spelling and object identity remain explicit state facts."],
      "termination_argument":methods[p][-1]["termination_role"]+": "+methods[p][-1]["guard"],
      "failure_paths":[e["consequence"]["en"] for e in errors if e["pattern_id"]==p],
      "alternative_designs":applicability[p]["conventions"],
      "stage5_test_obligations":{"normal":normal,"boundary":boundary,"counterexample":counter,"source_fixture":catalog[p]["assessed_part_ids"]},
      "source_constraints":official_refs[p],"source_issue_dispositions":issue_dispositions(p),
      "status":"PENDING_STAGE5_EXECUTION_VERIFICATION"})


example_prompts={
 "OOP_CLASS":("Từ class table có ba parameters, một default và một private array, dựng parameter→field map rồi audit mangled names.","From a class table with three parameters, one default and a private array, build the parameter-to-field map and audit mangled names."),
 "OOP_SUBCLASS":("Dùng distinct values cho parent/new parameters; reveal state sau super rồi sau extra assignments.","Use distinct parent/new parameter values; reveal state after super and after extra assignments."),
 "OOP_GET":("Gán mọi fields và array indices giá trị khác nhau; dự đoán exact returned value/type và unchanged state.","Give all fields and array indices distinct values; predict the exact returned value/type and unchanged state."),
 "OOP_SET":("Bắt đầu old=10, parameter=3 để phân biệt replacement 3 với update 13.","Start with old=10 and parameter=3 to distinguish replacement 3 from update 13."),
 "OOP_UPDATE":("Theo dõi before→candidate→clamped-after cho hai fields khi một field vượt bound.","Track before→candidate→clamped-after for two fields when one exceeds its bound."),
 "OOP_OVERRIDE":("Đặt cạnh transform-then-super và specialised-without-super; đếm side effects và exact result.","Contrast transform-then-super with specialised-without-super; count side effects and exact result."),
 "OOP_INSTANTIATE":("Map ba heterogeneous records thành đúng subclass/arguments/array slots; thêm grid case để phát hiện alias.","Map three heterogeneous records to the correct subclass/arguments/array slots; add a grid case to expose aliasing."),
 "OOP_CAPACITY_ADD":("Từ aggregate còn một slot, add thành công rồi add đầy thất bại và giữ nguyên state.","From an aggregate with one slot left, add successfully then fail on full while preserving state."),
}
worked=[]
for p in PATTERNS:
    anchor=next(r for r in official_refs[p] if r["part_id"]==representatives[p][0])
    worked.append({"worked_example_spec_id":f"b6.example.{slug(p)}","pattern_id":p,
      "status":"PENDING_STAGE5_EXECUTION_VERIFICATION","origin":"AlgoCore_original_adaptation_spec","anchor_source":anchor,
      "prompt_design":bi(*example_prompts[p]),"representation_and_convention":applicability[p]["decision_rule"],
      "method_step_refs":[x["step_id"] for x in methods[p]],"learner_checkpoints":[x["check"]["en"] for x in methods[p]],
      "contrast_and_boundary_microcases":tests[p][1]+tests[p][2],
      "evidence_to_capture_later":["initial object/class state","constructor or method-call event","field-level mutation events","return/output event","postcondition and invariant audit"],
      "prohibited_stage4_claims":["No executable code","No certified trace","No final runtime output","No official marks assigned to the AlgoCore adaptation"],
      "stage5_handoff":"Implement independent Python fixtures, inspect identity/private-name state where needed, and verify event traces against exact source contracts and caveats."})


visual_core={
 "OOP_CLASS":("Mỗi constructor input/default đi vào field nào?","Where does each constructor input/default go?",["READ_CLASS_TABLE","DECLARE_ATTRIBUTE","ENTER_CONSTRUCTOR","MAP_PARAMETER","APPLY_DEFAULT","CREATE_CHILD_SLOT","AUDIT_INSTANCE"],["class table","parameter wires","private-name labels","instance field/value cards"],"Kéo từng parameter/default tới field trước reveal.","Route each parameter/default to a field before reveal."),
 "OOP_SUBCLASS":("State nào do parent tạo, state nào do subclass tạo?","Which state is created by the parent and by the subclass?",["DECLARE_INHERITANCE","SPLIT_PARAMETERS","CALL_SUPER","REVEAL_PARENT_STATE","ASSIGN_NEW_FIELD","AUDIT_SUBCLASS"],["inheritance arrow","parent/new parameter lanes","parent and subclass state panels"],"Chọn arguments cho super và remaining assignments.","Choose super arguments and remaining assignments."),
 "OOP_GET":("Getter chọn member nào và object có đổi không?","Which member does the getter select, and does the object change?",["CALL_GETTER","VALIDATE_INDEX","READ_MEMBER","RETURN_VALUE","COMPARE_OBJECT_SNAPSHOT"],["object fields","optional index","return channel","before/after diff"],"Dự đoán member, type và mutation count.","Predict member, type and mutation count."),
 "OOP_SET":("Replacement khác relative update ở equation nào?","Which equation separates replacement from relative update?",["CALL_SETTER","MAP_PARAMETER","REPLACE_FIELD","COMPARE_OLD_NEW","CHECK_UNRELATED_STATE"],["old field","parameter","new field","object diff"],"Chọn 3 hay 13 khi old=10 và parameter=3.","Choose 3 or 13 when old=10 and parameter=3."),
 "OOP_UPDATE":("Candidate và clamped-after khác nhau khi nào?","When do candidate and clamped-after differ?",["READ_OLD_STATE","COMPUTE_CANDIDATE","CHECK_BOUND","CLAMP_VALUE","COMMIT_FIELDS","AUDIT_DIFF"],["before/candidate/after columns","formula","bounds","multiple target fields"],"Dự đoán mọi after-field khi một candidate vượt bound.","Predict every after-field when one candidate exceeds a bound."),
 "OOP_OVERRIDE":("Parent và subclass side effects xảy ra bao nhiêu lần?","How many times do parent and subclass side effects occur?",["DISPATCH_METHOD","SELECT_OVERRIDE_BRANCH","CALL_PARENT","APPLY_SUBCLASS_RULE","COMPOSE_RESULT","RETURN_OR_OUTPUT","AUDIT_SIDE_EFFECTS"],["parent/subclass method lanes","dispatch target","side-effect counter","result"],"Chọn strategy và đếm events trước reveal.","Choose a strategy and count events before reveal."),
 "OOP_INSTANTIATE":("Một source record trở thành object và slot nào?","Which object and slot does one source record become?",["READ_RECORD","GROUP_VALUES","CAST_VALUE","SELECT_CLASS","MAP_ARGUMENTS","CONSTRUCT_INSTANCE","STORE_REFERENCE","ADVANCE_COUNT"],["record tokens","constructor slots","class identity","object identities","container indices"],"Map record→class→arguments→slot và phát hiện alias.","Map record→class→arguments→slot and detect aliasing."),
 "OOP_CAPACITY_ADD":("Guard, store và count update phải theo thứ tự nào?","In what order must guard, store and count update occur?",["CHECK_CAPACITY","REJECT_FULL","STORE_CHILD_AT_COUNT","INCREMENT_COUNT","RETURN_BOOLEAN","AUDIT_IDENTITY"],["capacity/count gauge","child slots","object identity","Boolean result"],"Chọn next event cho one-slot-left và full.","Choose the next event for one-slot-left and full."),
}
visual_cases={
 "OOP_CLASS":("Mọi parameter có giá trị khác nhau cùng một default field.","All parameters are distinct plus one default field.","Default 0/rỗng và slot đầu/cuối của composition.","Zero/empty default and first/last composed slot.","Đảo parameters hoặc sai mangled/private spelling tạo field lạ.","Swapped parameters or mangled/private spelling creates a stray field."),
 "OOP_SUBCLASS":("Parent fields xuất hiện sau super, rồi hai fields mới.","Parent fields appear after super, then two new fields.","Số parent arguments tối thiểu và một subclass-only field.","Minimum parent arguments and one subclass-only field.","New argument bị gửi vào super và một parent argument được gán hai lần.","A new argument is passed to super and a parent argument is assigned twice."),
 "OOP_GET":("Scalar/indexed getters trả các stored values phân biệt.","Scalar and indexed getters return distinct stored values.","Index đầu/cuối và stored zero/empty string.","First/last index and stored zero/empty string.","Print thay return hoặc chọn sai field cùng type.","Prints instead of returns or selects a same-typed wrong field."),
 "OOP_SET":("Old 10 được thay trực tiếp bằng parameter 3; fields khác giữ nguyên.","Old 10 is replaced by parameter 3 while other fields remain.","Indexed member đầu/cuối và replacement zero/rỗng.","First/last indexed member and zero/empty replacement.","Tính 10+3 hoặc đảo value/index parameters.","Computes 10+3 or swaps value/index parameters."),
 "OOP_UPDATE":("Old state khác 0 cùng delta/percentage bất đối xứng.","Non-zero old state plus asymmetric delta/percentage.","Candidate dưới, đúng, vượt bound trong khi secondary field vẫn update.","Candidate below, at and above a bound while a secondary field still updates.","Replacement, sai dấu/base hoặc early return bỏ secondary field.","Replacement, wrong sign/base or early return skips another field."),
 "OOP_OVERRIDE":("Dispatch chọn từng subtype branch với exact result.","Dispatch selects each subtype branch with exact result.","Values tại/quanh caps và parent result extension rỗng/không rỗng.","Values at/around caps and empty/nonempty parent result extension.","Signature drift, parent bị gọi hai lần hoặc thiếu discriminator branch.","Signature drift, parent called twice or one discriminator branch omitted."),
 "OOP_INSTANTIATE":("Fixed/input/file records tạo các object riêng đúng type.","Fixed, input and file records create distinct correctly typed objects.","Một record, đúng final capacity và các corner cells của nested grid.","One record, exact final capacity and nested-grid corner cells.","Arguments lệch, sai subclass, slot bị ghi đè hoặc child instances alias nhau.","Shifted arguments, wrong subclass, overwritten slot or aliased child instances."),
 "OOP_CAPACITY_ADD":("Aggregate còn chỗ lưu đúng Train rồi tăng count.","A partial aggregate stores the exact Train then increments count.","Capacity 1, còn một slot, rồi full state không mutation.","Capacity 1, one slot left, then already-full non-mutation.","Tăng count trước store/full guard hoặc sai Boolean/object identity.","Increments before store/full guard or returns the wrong Boolean/object identity."),
}
visuals=[]
for p in PATTERNS:
    qvi,qen,events,state,pvi,pen=visual_core[p]
    nvi,nen,bvi,ben,fvi,fen=visual_cases[p]
    visuals.append({"visual_brief_id":f"b6.visual.{slug(p)}","pattern_id":p,
      "method_step_refs":[x["step_id"] for x in methods[p]],"error_refs":errors_by_pattern[p],
      "learning_question":bi(qvi,qen),"visual_mode":"event_driven","state_to_show":state,"proposed_event_types":events,
      "predict_prompt":bi(pvi,pen),"normal_case":bi(nvi,nen),
      "boundary_case":bi(bvi,ben),"failure_case":bi(fvi,fen),
      "representation_and_convention":applicability[p]["conventions"],
      "static_fallback":bi("Chuỗi snapshot contract→event→object diff kèm identifier/type labels.","A contract-to-event-to-object-diff strip with identifier/type labels."),
      "accessibility_notes":["Never rely on colour alone; label owner class, field, argument, branch and success/failure in text.","Expose object identity, private-name spelling and event sequence to screen readers.","Provide keyboard step controls and a textual event log at Stage 7/8."],
      "status":"PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD"})


common={"schema_version":VERSION,"status":"SUBMITTED","batch_id":BATCH,"input_hashes":input_hashes}
owned_count=sum(len(refs(p)) for p in PATTERNS)
unique_parts=len({x for p in PATTERNS for x in catalog[p]["assessed_part_ids"]})
dump("PATTERN_CARDS.json",{**common,"pattern_cards":cards,"self_checks":{"pattern_count":len(cards),"pattern_ids":PATTERNS,
  "assessed_part_pattern_links":sum(len(catalog[p]["assessed_part_ids"]) for p in PATTERNS),"unique_parts":unique_parts,
  "official_marking_atoms_owned":owned_count,"method_steps":sum(len(methods[p]) for p in PATTERNS)}})
dump("VARIANT_INVARIANT_REGISTER.json",{**common,"variants":variants,"self_checks":{"variant_count":len(variants),"patterns_covered":sorted({p for v in variants for p in v["pattern_ids"]})}})
dump("ERROR_PREVENTION.json",{**common,"error_rows":errors,"self_checks":{"row_count":len(errors),"patterns_covered":sorted(errors_by_pattern),"exact_mark_loss_claims":0}})
dump("SOLUTION_DESIGNS.json",{**common,"solution_designs":solutions,"self_checks":{"design_count":len(solutions),"all_statuses":sorted({x["status"] for x in solutions})}})
dump("WORKED_EXAMPLE_SPECS.json",{**common,"worked_example_specs":worked,"self_checks":{"spec_count":len(worked),"one_anchor_per_pattern":True}})
dump("VISUAL_BRIEFS.json",{**common,"visual_briefs":visuals,"self_checks":{"brief_count":len(visuals),"event_driven_count":len(visuals),"one_per_pattern":True}})

all_issue_ids=sorted({i for p in PATTERNS for i in source_issues(p)})
review=f"""# B6 OOP method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review.

## Exact scope

- Patterns: 8/8 — `{', '.join(PATTERNS)}`.
- Stage 2 assessed part-pattern links: {sum(len(catalog[p]['assessed_part_ids']) for p in PATTERNS)}; unique assessed parts: {unique_parts}.
- Official marking atoms owned once inside B6 with exact QP/MS locators and award semantics: {owned_count}.
- Pattern cards: {len(cards)}; method steps: {sum(len(methods[p]) for p in PATTERNS)}; variant registers: {len(variants)}; error rows: {len(errors)}.
- Solution designs, worked-example specs and event-driven visual briefs: {len(solutions)}/{len(worked)}/{len(visuals)}.

## Method decisions

1. `OOP_CLASS` begins with an exact class/constructor contract. Parameter order, defaults, composition, attribute spelling/case and Python double-underscore name mangling remain explicit. A source sample is never treated as executable authority.
2. `OOP_SUBCLASS` partitions parent and new parameters, declares the exact inheritance edge, calls the parent constructor once with the parent slice, then initialises subclass-only state.
3. `OOP_GET` is a non-mutating stored-member return. `OOP_SET` is direct replacement. `OOP_UPDATE` writes a before→candidate→bounded-after equation, preserving direction, percentage base, index and multi-field obligations.
4. `OOP_OVERRIDE` preserves the parent callable contract and chooses transform-then-parent, specialised replacement or result extension from the source side effects; every parent/subclass obligation happens exactly once.
5. `OOP_INSTANTIATE` maps source values→constructor arguments→object identity→storage destination. Distinct mutable instances are required per slot; record grouping, subtype selection, capacity/count and exact return/output remain source-specific.
6. `OOP_CAPACITY_ADD` uses guard→store-at-old-count→increment→exact Boolean. Full failure is non-mutating.

## Atom ownership

- A part with one B6 assessed pattern assigns its source atoms to that B6 owner while retaining external co-tags as source context.
- Multi-B6 compound parts are split by criterion: class vs getter, class vs constructed child objects, subclass construction vs update method, and override header vs state-update rule.
- The {owned_count} atom IDs are unique across all eight B6 cards; assessed co-tag rows remain present even when their `ms_atoms` list is empty for that pattern.

## Source caveats and authority

- Stable caveats joined: `{', '.join(all_issue_ids)}`.
- `S21-3A-PARAM`, `W22-42-2A-ATTRIBUTE`, `S25-41-MS31-INIT` and `S25-41-MS35-INIT` block copying the affected constructor/identifier samples as verified Python. Stage 5 must independently implement and inspect field state.
- `S25-42-Q3CI-NAME` keeps QP `TerritorySize/SetTerritorySize` identifiers while retaining the MS semantic criterion and locator.
- `S21-3B-COUNT` preserves the five-object QP contract and the conflicting four-element MS bullet without teaching four as the QP capacity.
- Adjudicated `W21-2E-RUBRIC` preserves all criteria under official part total 8; no bullet arithmetic or independent atom values are invented.
- Lead pass-1 rework applies `S4-S1-DEC-001` inside every B6 source view: both W21 rows retain all 11 criteria, every atom value remains null, the condition states the resolved holistic ceiling 8, and all occurrence/disposition metadata is resolved. No stale pending-decision wording remains in any output artifact.
- `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` remains only in `source_fidelity_policies`, never in `source_issue_refs`.
- Coursebook sections are foundations. General steps, invariants and repairs are AlgoCore inference/risk unless an exact official atom is cited. No error row claims a fixed number of marks lost.

## Downstream boundary

- All solution designs and worked examples remain `PENDING_STAGE5_EXECUTION_VERIFICATION`.
- No executable code, certified trace or final runtime output is claimed.
- All visuals remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`; every pattern has unique normal, boundary and failure cases with a concrete event vocabulary.

## Self-review

The deterministic validator checks exact Stage 2 assessed sets, the explicit B6 atom-owner function, all source locators and award semantics, bilingual method/error fields, private/constructor/capacity caveat joins, pattern-specific decisions/visual cases, unique joins and downstream statuses. No Lead decision remains open in this submission.

## Input hashes

"""+"\n".join(f"- `{x['path']}` — `{x['sha256']}`" for x in input_hashes)+"\n"
(HERE/"REVIEW.md").write_text(review,encoding="utf-8")
print(f"Built {BATCH}: {len(cards)} cards, {sum(len(methods[p]) for p in PATTERNS)} steps, {len(errors)} errors, {owned_count} owned atoms")

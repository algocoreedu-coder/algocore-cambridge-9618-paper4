from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S2, S3, S4 = P4 / "stage-2", P4 / "stage-3", P4 / "stage-4"
PATTERNS = [
    "QUEUE_SETUP", "QUEUE_ENQUEUE", "QUEUE_DEQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE",
    "LIST_SETUP", "LIST_TRAVERSE", "LIST_INSERT", "LIST_REMOVE",
]
VERSION = "s4-schema-v1-b3-submission-1"
BATCH = "B3-queue-linked-list"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def dump(name: str, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def digest(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bi(vi: str, en: str):
    return {"vi": vi, "en": en}


INPUTS = [
    S2 / "EXAM_PATTERN_CATALOG.json", S2 / "QUESTION_PATTERN_MAP.json", S2 / "CONFUSABLE_PATTERNS.json",
    S3 / "BOOK_KNOWLEDGE_MAP.json", S3 / "COVERAGE_MATRIX.json", S3 / "LESSON_PACKAGES.json",
    S4 / "SOURCE_CAVEAT_CARRYOVER.json",
    S4 / "evidence/marking/2021-2022/MARKING_SUBMISSION.json",
    S4 / "evidence/marking/2021-2022/SOURCE_RISK_REGISTER.json",
    S4 / "evidence/marking/2023-2024/MARKING_SUBMISSION.json",
    S4 / "evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json",
    S4 / "evidence/marking/2025/MARKING_SUBMISSION.json",
    S4 / "evidence/marking/2025/SOURCE_RISK_REGISTER.json",
    S4 / "schemas/pattern-card.schema.json", S4 / "schemas/error-prevention.schema.json",
    S4 / "schemas/design-briefs.schema.json",
]
input_hashes = [{"path": str(p.relative_to(P4)).replace("\\", "/"), "sha256": digest(p)} for p in INPUTS]

catalog_doc = load(S2 / "EXAM_PATTERN_CATALOG.json")
catalog = {x["pattern_id"]: x for x in catalog_doc["patterns"] if x["pattern_id"] in PATTERNS}
book_doc = load(S3 / "BOOK_KNOWLEDGE_MAP.json")
chains = {x["pattern_id"]: x for x in book_doc["pattern_chains"] if x["pattern_id"] in PATTERNS}
book_sections = {x["section_id"]: x for x in book_doc["sections"]}
carry = load(S4 / "SOURCE_CAVEAT_CARRYOVER.json")
issues_by_id = {x["issue_id"]: x for x in carry["issues"]}
occurrences = carry["occurrences"]
fidelity_policies = carry["batch_fidelity_policies"]


def submission_rows(path: Path):
    doc = load(path)
    return doc.get("rows") or doc.get("parts") or []


rows_by_pattern = {p: [] for p in PATTERNS}
for year in ("2021-2022", "2023-2024", "2025"):
    for row in submission_rows(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json"):
        assessed = row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
        for pattern in PATTERNS:
            if pattern in assessed:
                copy = dict(row)
                copy["source_batch"] = year
                rows_by_pattern[pattern].append(copy)


def row_issue_refs(row):
    refs = set(row.get("source_issue_refs", []))
    for atom in row["marking_points"]:
        refs.update(atom.get("source_issue_refs", []))
    return sorted(refs)


def source_ref(row):
    return {
        "part_id": row["part_id"],
        "source_batch": row["source_batch"],
        "qp_locator": {
            "source_id": row["qp_requirement"]["source_id"],
            "pdf_pages": row["qp_requirement"]["pdf_pages"],
        },
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "qp_constraint_refs": row["qp_requirement"].get("constraint_refs", []),
        "ms_atoms": [{
            "marking_point_id": m["marking_point_id"],
            "source_id": m["ms_source_id"],
            "pdf_pages": m["ms_pdf_pages"],
            "criterion_paraphrase": m["criterion_paraphrase"],
            "authority": m.get("authority", "official_ms"),
            "award_semantics": m["award_semantics"],
            "condition": m.get("condition"),
            "alternatives": m.get("alternatives"),
            "dependency": m.get("dependency"),
            "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"),
            "group_id": m.get("group_id"),
            "group_max": m.get("group_max"),
            "source_issue_refs": m.get("source_issue_refs", []),
        } for m in row["marking_points"]],
        "source_issue_refs": row_issue_refs(row),
    }


official_refs = {p: [source_ref(r) for r in rows_by_pattern[p]] for p in PATTERNS}


def all_atoms(pattern):
    return [m["marking_point_id"] for r in rows_by_pattern[pattern] for m in r["marking_points"]]


def mp_by(pattern, *needles):
    values = []
    for row in rows_by_pattern[pattern]:
        for atom in row["marking_points"]:
            text = atom["criterion_paraphrase"].lower()
            if any(n.lower() in text for n in needles):
                values.append(atom["marking_point_id"])
    return list(dict.fromkeys(values))


def step(pattern, suffix, sequence, action_vi, action_en, why_vi, why_en, reads, writes,
         invariant, guard, termination_role, check_vi, check_en, keywords=()):
    return {
        "step_id": f"{pattern.lower().replace('_', '-')}.step.{suffix}", "sequence": sequence,
        "action": bi(action_vi, action_en), "why": bi(why_vi, why_en),
        "reads": reads, "writes": writes, "invariant": invariant, "guard": guard,
        "termination_role": termination_role, "check": bi(check_vi, check_en),
        "marking_point_refs": mp_by(pattern, *keywords) if keywords else [],
    }


methods = {
"QUEUE_SETUP": [
 step("QUEUE_SETUP","contract",1,"Trích đúng kiểu queue, sức chứa, kiểu phần tử, tên biến và ý nghĩa head/tail/count từ đề.","Extract queue kind, capacity, element type, identifiers and the meaning of head/tail/count from the task.","Cùng một tên con trỏ có thể mang quy ước khác giữa các đề; hợp đồng nguồn quyết định mọi phương trình sau.","The same pointer name can mean different things across papers; the source contract determines every later equation.",["QP contract"],["representation decision"],"Exactly one source-defined queue model and pointer convention is active.","Before creating state.","selects_contract","Viết một câu cho từng con trỏ và đánh dấu queue tuyến tính hay vòng.","Write one sentence for each pointer and label the queue linear or circular.",("declaring","global","array","record")),
 step("QUEUE_SETUP","storage",2,"Tạo đúng số ô và kiểu dữ liệu; chỉ khởi tạo giá trị ô khi đề yêu cầu.","Create the exact number and type of slots; initialise cell values only when required.","Storage shape and element type are part of the assessed representation, while unused-cell contents may be unspecified.","Storage shape and element type are part of the assessed representation, while unused-cell contents may be unspecified.",["capacity","element type","initial cell requirement"],["queue storage"],"Storage has capacity cells and no live item exists outside the live-region equation.","The QP asks for queue storage.","builds_state","Đếm ô theo chỉ số và kiểm kiểu của một item hợp lệ.","Count indexed cells and check the type of one valid item.",("elements","initialis","empty record","queue array")),
 step("QUEUE_SETUP","pointers",3,"Khởi tạo head, tail và count đúng quy ước: phân biệt tail là ô trống kế tiếp hay item cuối.","Initialise head, tail and count under the selected convention, distinguishing next-free tail from last-item tail.","State rỗng phải khớp đồng thời với empty test, live range và thao tác Enqueue đầu tiên.","The empty state must agree with the empty test, live range and first Enqueue.",["queue model","pointer convention","capacity"],["head","tail","count"],"Empty state has zero live items and every pointer is within its convention's allowed domain.","After storage exists.","establishes_empty_state","Mô phỏng Enqueue đầu tiên trên giấy; ô ghi và state mới phải hợp lệ.","Simulate the first Enqueue on paper; the written slot and resulting state must be valid.",("head","tail","numberofitems","initial")),
 step("QUEUE_SETUP","consistency",4,"Lập bảng empty/full/live-range/next-write/next-read và kiểm bốn dòng dùng cùng quy ước.","Build an empty/full/live-range/next-write/next-read table and verify every row uses one convention.","Bảng này phát hiện việc ghép quy tắc của queue vòng với queue tuyến tính hoặc tail-role khác.","This table exposes accidental mixing of circular, linear and tail-role rules.",["head","tail","count","capacity"],["contract table"],"The declared state satisfies every equation in exactly one table row.","Before using Enqueue, Dequeue or Inspect.","validates_representation","Ở trạng thái rỗng, live range phải rỗng; ở trạng thái đầy, không còn write index hợp lệ.","At empty the live range is empty; at full no valid write index remains.",()),
],
"QUEUE_ENQUEUE": [
 step("QUEUE_ENQUEUE","contract",1,"Ghi full condition, tail-role, wrap rule và kết quả success/failure đúng theo đề.","Record the exact full condition, tail role, wrap rule and success/failure result.","Boolean, 1/−1 hay message không thể thay thế lẫn nhau; wrap chỉ có ở model được chỉ định.","Boolean, 1/-1 and messages are not interchangeable; wrapping exists only in the specified model.",["QP contract","queue state"],["branch contract"],"The selected full test and result type belong to the same source convention.","Before mutation.","selects_contract","Đặt cạnh hai nhánh full/not-full và ghi type/literal phải trả.","Place full and not-full branches side by side and write the required return type/literal.",("function","procedure","return","output")),
 step("QUEUE_ENQUEUE","full-guard",2,"Kiểm đầy trước mọi write hoặc cập nhật con trỏ/count; nhánh đầy giữ nguyên state.","Check full before any write or pointer/count update; the full branch preserves state.","Mutation sớm có thể ghi vượt mảng hoặc làm mất trạng thái queue hợp lệ.","Early mutation can write out of range or destroy a valid queue state.",["head","tail","count","capacity"],["failure result only"],"Failure leaves storage, head, tail and count unchanged.","full condition is true.","terminates_failure","So sánh snapshot toàn bộ state trước/sau một Enqueue khi đầy.","Compare the complete state before and after an Enqueue on full.",("full","capacity","no space")),
 step("QUEUE_ENQUEUE","write",3,"Ở nhánh còn chỗ, ghi item vào đúng write index do tail-role xác định.","On the non-full branch, store the item at the write index implied by the tail role.","Tail next-free ghi ngay tại tail; tail last-item phải chuyển đến vị trí mới trước khi ghi theo contract.","A next-free tail writes at tail; a last-item tail moves to the new position before writing as the contract requires.",["item","tail","tail role"],["one storage slot"],"Exactly one new live item is added after all updates; earlier FIFO order is unchanged.","not full.","commits_item","Ca queue rỗng phải ghi item đầu vào đúng ô mà head sẽ đọc.","For an empty queue, the first item must be written where head will read it.",("insert","store","queuearray","parameter")),
 step("QUEUE_ENQUEUE","advance",4,"Cập nhật tail, head khi thêm item đầu, count nếu có; chỉ modulo/wrap cho queue vòng.","Update tail, first-item head and count when present; apply modulo/wrap only to a circular queue.","Mỗi metadata field phải mô tả cùng một tập item live sau commit.","Every metadata field must describe the same live-item set after commit.",["old head","old tail","old count","queue model"],["head","tail","count"],"Post-size equals pre-size+1 and all pointers remain in range; circular tail wraps, linear tail never does.","after the item is stored or at the convention-defined update point.","restores_invariant","Kiểm ca thêm item đầu và ca dùng ô cuối; queue vòng quay đúng một lần, queue tuyến tính dừng ở full.","Check first-item and final-slot cases; circular wraps exactly once, linear reaches full without wrapping.",("increment","headpointer","tailpointer","numberofitems","wrap","zero")),
 step("QUEUE_ENQUEUE","result",5,"Trả hoặc xuất đúng kết quả nhánh success, rồi kiểm hậu điều kiện.","Return or emit the exact success result, then check the postcondition.","State đúng nhưng sai interface vẫn không đáp ứng QP/MS của part đó.","Correct state with the wrong interface still violates that part's QP/MS.",["branch outcome","source result contract"],["result"],"Success has size+1; failure has unchanged state; result identifies the branch exactly as required.","after one branch completes.","terminates_operation","Đối chiếu literal, kiểu và nơi output/return với QP.","Check literal, type and output-versus-return against the QP.",("return","true","false","message","1","-1")),
],
"QUEUE_DEQUEUE": [
 step("QUEUE_DEQUEUE","contract",1,"Ghi empty condition, chỉ số đọc, wrap/reset policy và sentinel đúng kiểu.","Record the empty condition, read index, wrap/reset policy and correctly typed sentinel.","Các đề dùng string, integer, empty record hoặc message khác nhau; xóa ô vật lý cũng không mặc định bắt buộc.","Different tasks use strings, integers, empty records or messages; physically clearing a slot is not automatically required.",["QP contract","queue representation"],["branch contract"],"One empty predicate and one return contract govern the operation.","Before reading storage.","selects_contract","Lập bảng empty-result gồm value, type, output/return và mutation cho part đang làm.","Create an empty-result table with value, type, output/return and mutation for the current part.",("function","return","empty","no data")),
 step("QUEUE_DEQUEUE","empty-guard",2,"Kiểm rỗng trước khi đọc; nếu rỗng trả đúng sentinel và giữ nguyên state.","Check empty before reading; if empty, return the exact sentinel and preserve state.","Đọc trước guard có thể lấy dữ liệu cũ còn trong ô nhưng không còn live.","Reading before the guard can return stale physical data that is no longer live.",["head","tail","count"],["empty result only"],"Empty failure does not alter storage, head, tail or count.","empty predicate is true.","terminates_failure","Gọi Dequeue hai lần trên queue rỗng; metadata phải không đổi.","Call Dequeue twice on empty; metadata must remain unchanged.",("empty","false","-1","message","record")),
 step("QUEUE_DEQUEUE","save-item",3,"Lưu item tại head trước khi làm mất đường truy cập logic tới nó.","Save the item at head before changing logical access to it.","FIFO yêu cầu trả item live lâu nhất; cập nhật head trước có thể trả item kế tiếp.","FIFO requires the oldest live item; moving head first can return the following item.",["storage[head]","head"],["saved item"],"The saved value is the oldest live item in pre-state.","not empty.","captures_result","Dùng hai item khác nhau và đánh dấu item phải trả trước khi cập nhật.","Use two distinct items and mark the required returned item before updating state.",("retrieve","data at head","return next data","save")),
 step("QUEUE_DEQUEUE","advance",4,"Cập nhật head, count và reset khi queue vừa thành rỗng đúng theo convention; wrap chỉ cho queue vòng.","Update head, count and any empty reset under the source convention; wrap only for circular queues.","Sau xóa, mọi metadata phải biểu diễn đúng tập live còn lại, kể cả ca một item.","After removal, all metadata must represent the remaining live set, including the one-item case.",["old head","old tail","old count","queue model"],["head","tail","count"],"Successful size is pre-size-1; surviving order is unchanged; pointers remain in their allowed domain.","after saving the item.","restores_invariant","Kiểm ca một item, ca head ở ô cuối của vòng và ca tuyến tính không wrap.","Check one-item, circular-head-at-last-slot and linear-no-wrap cases.",("headpointer","increment","decrement","numberofitems","wrap","reset")),
 step("QUEUE_DEQUEUE","return",5,"Trả item đã lưu, không suy kết quả từ nội dung ô sau cập nhật.","Return the saved item rather than inferring it from storage after the update.","Ô vật lý có thể giữ dữ liệu cũ; tính live do metadata quyết định.","A physical slot may retain stale data; metadata determines liveness.",["saved item"],["return value"],"Returned value is the pre-state head item and is no longer live afterward.","after invariant restoration.","terminates_success","So sánh returned item, size giảm một và thứ tự phần còn lại.","Check returned item, size decrement and surviving order.",("return","returning","data")),
],
"QUEUE_INSPECT": [
 step("QUEUE_INSPECT","contract",1,"Xác định live range, thứ tự FIFO, delimiter và yêu cầu không phá hủy queue.","Identify the live range, FIFO order, delimiter and non-destructive requirement.","Duyệt mảng vật lý hoặc gọi Dequeue sẽ thay đổi nghĩa của thao tác Inspect.","Scanning physical storage or calling Dequeue changes the meaning of Inspect.",["QP contract","head/tail convention"],["iteration bounds"],"Iteration covers each and only live item in FIFO order.","Before traversal.","selects_bounds","Viết first index, stop condition và expected item count.","Write the first index, stop condition and expected item count.",("function","iterating","headpointer")),
 step("QUEUE_INSPECT","iterate",2,"Đi từ head qua đúng live range; với tail next-free tuyến tính, dừng trước tail.","Walk from head through exactly the live range; for a linear next-free tail, stop before tail.","Giới hạn nửa mở tránh in ô chưa dùng và giữ đúng số item.","A half-open bound avoids unused cells and preserves the item count.",["queue storage","head","tail"],["cursor","text accumulator"],"After k iterations the accumulator contains exactly the first k live items in order.","cursor remains inside live range.","maintains_prefix","So số vòng lặp với size logic và thử queue có một item.","Compare loop count with logical size and test a one-item queue.",("increment","tailpointer","concatenat")),
 step("QUEUE_INSPECT","format",3,"Chuyển từng item và nối delimiter đúng yêu cầu, rồi trả chuỗi.","Convert each item and append the required delimiter, then return the string.","Format là một phần của output contract và tách biệt với traversal đúng.","Formatting is part of the output contract and is separate from correct traversal.",["current item","delimiter"],["result string"],"The result contains all live items in order with the required separators.","after or during each live-item visit.","produces_output","Đếm token và dấu cách bằng một ca hai item.","Count tokens and spaces with a two-item case.",("space","returning all","integer values")),
 step("QUEUE_INSPECT","preservation",4,"Đối chiếu head, tail, count và storage trước/sau; không field nào được đổi.","Compare head, tail, count and storage before/after; no field may change.","Inspect là phép đọc; state mutation sẽ làm các thao tác sau sai.","Inspect is a read; mutation corrupts subsequent operations.",["pre-state","post-state"],["verification only"],"Post-state equals pre-state exactly.","after result construction.","verifies_non_mutation","Snapshot toàn bộ record queue trước và sau.","Snapshot the complete queue record before and after.",()),
],
"QUEUE_REDUCE": [
 step("QUEUE_REDUCE","mode",1,"Chọn mode theo QP: đọc không phá hủy bằng index/đệ quy, hay consume bằng Dequeue; ghi accumulator và sentinel.","Select the QP mode: read-only index/recursion or destructive Dequeue; record accumulator and sentinel.","Ba nguồn quan sát có mutation, hướng duyệt và output khác nhau; không có template chung duy nhất.","The three observed sources differ in mutation, direction and output; no single universal template applies.",["QP algorithm","queue contract"],["mode decision"],"Exactly one termination source and mutation policy governs the reduction.","Before processing items.","selects_algorithm","Ghi rõ queue sau hàm phải giữ nguyên hay rỗng.","State explicitly whether the queue must remain unchanged or end empty.",("recursive","dequeue","create queue","function")),
 step("QUEUE_REDUCE","initialise",2,"Khởi tạo accumulator và cursor/first item theo grammar dữ liệu, không dùng sentinel như dữ liệu.","Initialise the accumulator and cursor/first item from the data grammar, never treating the sentinel as data.","Tổng, run-length state và recursive base case cần trạng thái khởi đầu khác nhau.","Summation, run-length state and recursive base cases require different initial states.",["data grammar","empty contract","bounds"],["accumulator","cursor or previous item"],"Accumulator summarises exactly the consumed/visited prefix; sentinel is excluded.","before first reduction step.","establishes_reduction","Thử input nhỏ nhất được QP cho phép và gắn nhãn mọi giá trị state.","Use the smallest source-permitted input and label every state value.",("initial","first","total","counter","string")),
 step("QUEUE_REDUCE","iterate",3,"Mỗi bước xử lý đúng một item hoặc một frame: cộng, so với previous để nén run, hoặc cộng đệ quy theo hướng nguồn.","At each step process exactly one item or frame: add, compare with previous for a run, or recurse in the source-defined direction.","Invariant prefix giúp kiểm order, tránh bỏ item và tránh double-count.","A prefix invariant checks order, omission and double counting.",["next item","accumulator","cursor/queue state"],["accumulator","cursor/queue state"],"After k useful steps, accumulator equals the required reduction of exactly k source items in source order.","a live item or non-base recursive index exists.","maintains_reduction","Dùng dữ liệu có item lặp và không lặp; với đệ quy kiểm một phần tử và nhiều phần tử.","Use data with repeated and changing items; for recursion check one and multiple elements.",("add","sum","recursive","count","compare","concatenat")),
 step("QUEUE_REDUCE","terminate",4,"Dừng đúng ở sentinel, base index hoặc hết live range; flush run cuối nếu output cần.","Stop at the sentinel, base index or end of live range; flush the final run when required.","Run cuối không có item mới để kích hoạt flush; base case sai gây bỏ đầu hoặc vượt biên.","The final run has no following item to trigger a flush; a wrong base case omits the first item or runs out of range.",["termination state","accumulator","pending run"],["final result"],"Every original live item contributes exactly once and no sentinel contributes.","no unprocessed live item remains.","terminates_reduction","Đếm useful items và kiểm run cuối/base item xuất hiện đúng một lần.","Count useful items and verify the final run/base item appears exactly once.",("base","return","until","empty","last","append")),
 step("QUEUE_REDUCE","postcheck",5,"Kiểm output contract và hậu trạng thái queue theo mode đã chọn.","Check the output contract and final queue state under the selected mode.","Kết quả đúng nhưng mutation sai vẫn vi phạm yêu cầu read-only hoặc consume.","A correct value with the wrong mutation still violates read-only or consuming semantics.",["result","pre-state","post-state","mode"],["verification only"],"Read-only preserves queue; consuming mode ends at the source-defined empty state.","after reduction.","verifies_contract","So sánh snapshot và type/format kết quả với QP.","Compare snapshots and result type/format with the QP.",("output","return","final","global string")),
],
"LIST_SETUP": [
 step("LIST_SETUP","contract",1,"Xác định array-record/2D-array hay object nodes, null sentinel, head và có free-list hay không.","Identify array records/2D arrays versus object nodes, the null sentinel, head and whether a free list exists.","Object reference và array index có lifecycle khác; không được thêm free-list vào object model hoặc bỏ nó khỏi array model.","Object references and array indices have different lifecycles; do not add a free list to the object model or omit it from an array model.",["QP representation"],["representation decision"],"One node representation and null convention governs every link.","Before creating nodes.","selects_contract","Vẽ một node mẫu và ghi type của Data/Next.","Draw one node and label Data/Next types.",("array","record","class","constructor","headnode")),
 step("LIST_SETUP","storage",2,"Tạo đúng capacity, field/column và dữ liệu ban đầu được cho.","Create the exact capacity, fields/columns and supplied initial data.","Table state có thể chứa cả live chain và free chain; sao sai một link làm mất node.","A table state may contain both live and free chains; copying one link incorrectly loses a node.",["capacity","node schema","source table"],["node storage"],"Every index denotes exactly one node slot and each link is null or a valid index/reference.","array-backed model or object constructor is required.","builds_state","Đếm node và xác nhận mọi link nằm trong miền hoặc bằng null.","Count nodes and verify every link is in range or null.",("20","10","data","next","nodes")),
 step("LIST_SETUP","live-head",3,"Gán head theo QP; với list rỗng dùng đúng −1/None/null, với bảng có sẵn dùng chỉ số đầu logic.","Set head from the QP; use the exact -1/None/null for empty or the first logical index for supplied data.","Head quyết định duyệt logic; index 0 không mặc định là head.","Head determines logical traversal; index 0 is not automatically the head.",["source initial state","null sentinel"],["head"],"Following head reaches each live node exactly once and terminates at null.","after storage exists.","establishes_live_chain","Duyệt bằng bút từ head đến null, không theo thứ tự hàng.","Trace by hand from head to null rather than by row order.",("head","firstnode","headnode","initial")),
 step("LIST_SETUP","free-chain",4,"Nếu có free-list, nối mọi slot trống theo đúng thứ tự nguồn, đặt FirstFree/emptyList vào đầu chain.","When a free list exists, link every unused slot in the source order and set FirstFree/emptyList to its head.","Allocator chỉ thấy node trống qua chain này; một node bị bỏ khỏi chain sẽ không thể cấp phát.","The allocator can see free nodes only through this chain; an omitted node becomes unavailable.",["unused slots","free-list order","null sentinel"],["free links","first-free pointer"],"Live and free sets are disjoint and together cover all allocated array slots.","array-backed model has a free list.","establishes_free_chain","Duyệt cả live chain và free chain; không trùng, không thiếu, đều kết thúc null.","Traverse both live and free chains; they must be disjoint, complete and null-terminated.",("free","next","linked list","pointer")),
 step("LIST_SETUP","consistency",5,"Lập bảng phân hoạch index→live/free và kiểm head/free-head/null/capacity cùng nhất quán.","Build an index-to-live/free partition and check head, free-head, null and capacity together.","Kiểm cục bộ từng field không phát hiện cycle hoặc node thất lạc.","Checking fields individually does not reveal cycles or lost nodes.",["live traversal","free traversal","capacity"],["verification table"],"Each slot appears exactly once across live and free partitions; both chains terminate.","after initialisation.","validates_representation","Đếm union của hai chain bằng capacity.","Count the union of both chains and match capacity.",()),
],
"LIST_TRAVERSE": [
 step("LIST_TRAVERSE","contract",1,"Chọn head, null sentinel và format output; tách logical order khỏi physical index order.","Select head, null sentinel and output format; separate logical order from physical index order.","Linked list được sắp bằng links, không bằng vị trí trong mảng.","A linked list is ordered by links, not array positions.",["QP contract","node representation"],["cursor contract"],"Cursor is null or names the next live node to visit.","Before traversal.","selects_contract","Viết chuỗi index/reference dự kiến từ head đến null.","Write the expected index/reference chain from head to null.",("procedure","function","output","return")),
 step("LIST_TRAVERSE","initialise",2,"Đặt cursor=head và accumulator/output rỗng theo yêu cầu.","Set cursor=head and initialise the required accumulator/output.","Khởi tạo tại 0 bỏ qua head khác 0 và sai ngay với list rỗng.","Starting at 0 ignores a non-zero head and fails for an empty list.",["head"],["cursor","output state"],"No live node has been visited and cursor is the first logical node or null.","once per traversal.","establishes_prefix","Kiểm list rỗng không đọc node nào và list head khác 0 đọc đúng node đầu.","Check that empty reads no node and a non-zero head reads the correct first node.",("head","firstnode","headnode")),
 step("LIST_TRAVERSE","visit",3,"Trong khi cursor khác null: đọc/output Data của node hiện tại đúng một lần.","While cursor is not null, read/output the current node's Data exactly once.","Visit trước advance giữ liên kết giữa dữ liệu và node đang trỏ.","Visiting before advancing keeps data associated with the current node.",["node[cursor].Data"],["output or accumulator"],"After k visits, output equals the first k logical nodes in order.","cursor != null sentinel.","maintains_output_prefix","Đánh số lần visit và không cho một index xuất hiện hai lần.","Number visits and forbid any index from appearing twice.",("output","concatenate","data")),
 step("LIST_TRAVERSE","advance",4,"Đặt cursor bằng Next của node vừa visit; không tăng cursor số học.","Set cursor to the visited node's Next; never increment it arithmetically.","Chỉ Next chứa thứ tự logic và điểm dừng.","Only Next carries logical order and termination.",["node[cursor].Next"],["cursor"],"Cursor advances to the unique next logical node or null.","after visiting current node.","progresses_to_termination","Dùng bảng có link nhảy lùi/tiến để phát hiện cursor+=1.","Use a table whose links jump backward and forward to expose cursor+=1.",("next","getnextnode","pointer","increment")),
 step("LIST_TRAVERSE","finish",5,"Dừng tại đúng null sentinel và trả/hoàn tất format theo contract mà không đổi list.","Stop at the exact null sentinel and return/finish formatting without mutating the list.","Dừng theo capacity có thể đọc free nodes; mutation làm hỏng thao tác read-only.","Stopping by capacity can enter free nodes; mutation corrupts a read-only operation.",["cursor","result","pre-state"],["return/output only"],"Every reachable live node is visited once, no free node is visited, and state is unchanged.","cursor == null sentinel.","terminates_traversal","So số visit với số node reachable và snapshot state.","Match visit count to reachable nodes and snapshot state.",("return","end","-1","none")),
],
"LIST_INSERT": [
 step("LIST_INSERT","contract",1,"Xác định chèn đầu hay cuối, array/free-list hay object, full case và return contract.","Identify front versus tail insertion, array/free-list versus objects, full handling and return contract.","Thứ tự link update và allocator thay đổi theo representation/position.","Link-update order and allocation differ by representation and position.",["QP contract","list state"],["branch plan"],"One insertion position and allocation model is selected before mutation.","Before allocating.","selects_contract","Vẽ before/after chỉ với head, predecessor/tail, new node và free head.","Draw before/after using only head, predecessor/tail, new node and free head.",("function","procedure","input","return")),
 step("LIST_INSERT","capacity-guard",2,"Với array model, kiểm FirstFree/emptyList trước mutation; full giữ nguyên state và trả/xử lý đúng contract.","For an array model, check FirstFree/emptyList before mutation; full preserves state and follows the exact contract.","Không có free node thì mọi write đều phá live/free partition.","Without a free node, any write corrupts the live/free partition.",["free-head","null sentinel"],["failure result only"],"Full failure leaves live chain, free chain and pointers unchanged.","free-head == null sentinel.","terminates_failure","Snapshot cả hai chain ở ca full.","Snapshot both chains in the full case.",("full","emptylist","firstfree","return false","end")),
 step("LIST_INSERT","reserve",3,"Lưu `new_index = free_head` và `next_free = node[new_index].Next` trước khi ghi đè node; sau đó chuyển free_head=next_free.","Save `new_index = free_head` and `next_free = node[new_index].Next` before overwriting the node; then move free_head to next_free.","Next cũ của free node là đường duy nhất tới phần còn lại của free-list; ghi Data/Next trước khi lưu sẽ làm mất chain.","The old Next of the free node is the only route to the remaining free list; overwriting before saving it loses the chain.",["free-head","free node Next"],["new_index","saved next_free","free-head"],"Reserved node is removed exactly once from the free set before joining the live set.","array model and not full.","allocates_node","Kiểm ca free-list có ít nhất hai node: node thứ hai vẫn reachable sau reserve.","With at least two free nodes, verify the second remains reachable after reservation.",("emptylist","firstfree","nextnode","temporary","update")),
 step("LIST_INSERT","write-node",4,"Ghi Data vào node mới và đặt Next theo vị trí: old head cho chèn đầu, null cho chèn cuối, hoặc tạo object với reference tương ứng.","Write Data and set Next for the position: old head for front, null for tail, or create an object with the matching reference.","Node mới phải có payload và successor đúng trước khi xuất hiện trong live chain.","The new node needs the correct payload and successor before becoming reachable in the live chain.",["input data","old head","null sentinel"],["new node Data","new node Next"],"New node is internally valid but not yet doubly owned by live and free chains.","allocation succeeded or object creation is permitted.","prepares_node","Đọc lại Data/Next của node mới trước khi nối.","Read back the new node's Data/Next before linking it.",("data","node","next","create","constructor")),
 step("LIST_INSERT","link",5,"Chèn đầu bằng `new.Next=old_head; head=new`; chèn cuối bằng traversal tới tail rồi `tail.Next=new`; xử lý list rỗng bằng cập nhật head.","Insert at front with `new.Next=old_head; head=new`; at tail traverse to the tail then set `tail.Next=new`; update head for an empty list.","Head, middle/tail link và empty case là các đường mutation khác nhau.","Head, middle/tail links and the empty case are distinct mutation paths.",["new node","head","tail/predecessor"],["head or predecessor.Next"],"Post live chain contains all old nodes in order plus the new node at the requested position.","new node is ready.","commits_live_link","Thử list rỗng, một node và nhiều node; mỗi ca tăng reachable count đúng một.","Test empty, one-node and multi-node lists; each increases reachable count by one.",("head","end","nextnode","while","link")),
 step("LIST_INSERT","postcheck",6,"Kiểm live/free disjoint, tổng node bảo toàn và kết quả success đúng contract.","Check live/free disjointness, total-node conservation and the exact success result.","Link đúng cục bộ vẫn có thể tạo cycle hoặc bỏ mất free node.","Locally plausible links can still create a cycle or lose a free node.",["post live chain","post free chain","result contract"],["verification only"],"Array model partitions all slots exactly once; object model preserves an acyclic null-terminated chain.","after commit.","verifies_insertion","Duyệt cả hai chain và đếm; kiểm tail.Next/null.","Traverse and count both chains; check tail.Next/null.",("return true","success","output")),
],
"LIST_REMOVE": [
 step("LIST_REMOVE","contract",1,"Xác định xóa first occurrence, giả định có/không có target, free-list policy và Boolean/void contract.","Identify first-occurrence deletion, target-presence assumption, free-list policy and Boolean/void contract.","Các nguồn khác nhau ở not-found và recycling; không được tự thêm hành vi.","Sources differ on not-found and recycling; do not invent behaviour.",["QP contract","list representation"],["case plan"],"Search and return behaviour match one source contract.","Before traversal.","selects_contract","Liệt kê bốn case: empty, head, interior/tail, not-found và đánh dấu case nguồn cho phép.","List empty, head, interior/tail and not-found; mark which cases the source permits.",("function","procedure","return","first")),
 step("LIST_REMOVE","search",2,"Duyệt bằng current và previous cho tới first match hoặc null; không thay link trong lúc tìm.","Traverse with current and previous until the first match or null; do not mutate links while searching.","Giữ predecessor cho phép unlink head và interior/tail mà không duyệt lại.","Keeping the predecessor supports head and interior/tail unlinking without a second traversal.",["head","node Data","node Next","target"],["current","previous"],"Before each test, previous is null for head or directly precedes current; prefix contains no match.","current != null and no match yet.","progresses_search","Dùng target ở head, middle, tail và vắng mặt; current phải dừng đúng vị trí.","Use targets at head, middle, tail and absent; current must stop at the correct location.",("while","data","next","find","search")),
 step("LIST_REMOVE","handle-miss",3,"Nếu empty/not-found được phép, trả False và giữ nguyên state; nếu QP bảo đảm có target, giữ giả định đó trong precondition.","If empty/not-found is allowed, return False with unchanged state; if the QP guarantees presence, retain that precondition.","Thêm sentinel node hoặc thay head ở nhánh miss tạo dữ liệu giả.","Adding a sentinel node or changing head on miss fabricates state.",["current","presence contract"],["failure result only"],"Failure leaves every link and pointer unchanged.","current == null and absence is permitted.","terminates_failure","Snapshot list cho empty và absent.","Snapshot the list for empty and absent cases.",("false","not found","none","empty")),
 step("LIST_REMOVE","unlink",4,"Nếu current=head thì head=current.Next; ngược lại previous.Next=current.Next. Công thức này bao phủ middle và tail.","If current=head set head=current.Next; otherwise set previous.Next=current.Next. This covers middle and tail.","Unlink phải xảy ra trước recycling để successor của live node chưa bị ghi đè.","Unlinking must precede recycling so the live successor is not overwritten.",["head","previous","current","current.Next"],["head or previous.Next"],"All surviving live nodes retain order and current becomes unreachable from head.","a match exists.","removes_live_node","Sau unlink, reachable count giảm một và target đầu tiên không còn reachable.","After unlink, reachable count drops by one and the first target is no longer reachable.",("head","previous","next","remove","link")),
 step("LIST_REMOVE","recycle",5,"Với array/free-list, đặt removed.Next=old free_head rồi free_head=removed; object model không tạo free-list.","For array/free-list storage, set removed.Next=old free_head then free_head=removed; object storage does not invent a free list.","Thứ tự này đưa đúng một node về allocator mà không làm mất free chain cũ.","This order returns exactly one node to the allocator without losing the old free chain.",["removed index","old free-head"],["removed.Next","free-head"],"Removed node is free exactly once and every old free node remains reachable.","array model after unlink.","restores_free_partition","Duyệt free chain và xác nhận removed là đầu, followed by old free-head.","Traverse the free chain and verify removed is first followed by the old free-head.",("free","firstfree","next","available")),
 step("LIST_REMOVE","postcheck",6,"Trả success đúng contract và kiểm live/free disjoint, termination, head/tail cases.","Return the exact success result and check live/free disjointness, termination, and head/tail cases.","Remove có nhiều đường mutation; hậu kiểm toàn cục phát hiện cycle, lost node và double ownership.","Remove has multiple mutation paths; a global postcheck exposes cycles, lost nodes and double ownership.",["post live chain","post free chain","result contract"],["result"],"Array slots remain a complete live/free partition; object list is acyclic and null-terminated.","after successful removal.","verifies_removal","Đếm partition bằng capacity hoặc reachable objects bằng old count−1.","Match array partition to capacity or reachable object count to old count-1.",("return true","success","boolean")),
],
}

# Preserve exact ownership: each official atom appears once on its pattern card's steps.
for pattern, items in methods.items():
    claimed = {m for s in items for m in s["marking_point_refs"]}
    missing = [m for m in all_atoms(pattern) if m not in claimed]
    items[-1]["marking_point_refs"].extend(missing)
    seen = set()
    for s in items:
        s["marking_point_refs"] = [m for m in s["marking_point_refs"] if not (m in seen or seen.add(m))]


recognition_en = {
 "QUEUE_SETUP":"The task asks for queue storage plus head, tail and optional count under a stated linear or circular convention.",
 "QUEUE_ENQUEUE":"The task asks to reject full state or add one FIFO item while updating exactly the required queue metadata.",
 "QUEUE_DEQUEUE":"The task asks to reject empty state or return the oldest live item and update queue metadata.",
 "QUEUE_INSPECT":"The task reads all current queue items in FIFO order without removal.",
 "QUEUE_REDUCE":"The task aggregates, recursively processes or consumes queue data under a source-specific termination contract.",
 "LIST_SETUP":"The task creates linked storage, head/null state and, for array models, a complete free-list chain.",
 "LIST_TRAVERSE":"The task follows Next links from head to null and reads nodes in logical order.",
 "LIST_INSERT":"The task allocates or creates a node, inserts it at the required position and preserves live/free chains.",
 "LIST_REMOVE":"The task finds the first matching node, unlinks head/interior/tail correctly and recycles it when required.",
}

applicability = {
 "QUEUE_SETUP": {"preconditions":["The QP asks for queue declarations or initial state."],"representation":["Finite array or record-wrapped array with source-defined metadata."],"conventions":["linear queues do not wrap unless stated","circular queues wrap head/tail at capacity","tail may be next-free or last-item","count may be authoritative when present"],"variant_axes":catalog["QUEUE_SETUP"]["variant_axes_to_preserve"],"decision_rule":bi("Khóa model, tail-role và empty/full equations trước khi khởi tạo.","Lock the model, tail role and empty/full equations before initialising.")},
 "QUEUE_ENQUEUE": {"preconditions":["Queue representation and exact return contract are known."],"representation":["One guarded state transition on finite queue storage."],"conventions":["next-free tail writes then advances","last-item tail advances to a free position before/with write","wrap only for circular queues","failure is non-mutating"],"variant_axes":catalog["QUEUE_ENQUEUE"]["variant_axes_to_preserve"],"decision_rule":bi("Suy write index và full test từ tail-role; không sao thứ tự cập nhật giữa variants.","Derive write index and full test from tail role; never copy update order across variants.")},
 "QUEUE_DEQUEUE": {"preconditions":["Queue representation and exact empty result are known."],"representation":["FIFO read followed by source-defined metadata update."],"conventions":["head identifies the first live item in observed sources","count or pointer relation detects empty","wrap/reset and slot clearing are source-specific","empty failure is non-mutating"],"variant_axes":catalog["QUEUE_DEQUEUE"]["variant_axes_to_preserve"],"decision_rule":bi("Lưu item tại head trước; sau đó cập nhật đúng metadata của variant.","Save the head item first; then update the metadata required by the variant.")},
 "QUEUE_INSPECT": {"preconditions":["Live bounds and output format are known."],"representation":["Read-only traversal of the live queue range."],"conventions":["observed source uses linear next-free tail and half-open [head,tail) range","no Dequeue or metadata mutation"],"variant_axes":catalog["QUEUE_INSPECT"]["variant_axes_to_preserve"],"decision_rule":bi("Duyệt live range do pointers định nghĩa, không duyệt toàn bộ storage.","Traverse the pointer-defined live range, not all storage.")},
 "QUEUE_REDUCE": {"preconditions":["The QP defines data grammar, mutation policy and termination."],"representation":["Accumulator plus either read-only index/recursion or destructive Dequeue."],"conventions":["read-only recursion preserves queue","consume mode stops on exact empty result","run-length mode flushes final run"],"variant_axes":catalog["QUEUE_REDUCE"]["variant_axes_to_preserve"],"decision_rule":bi("Chọn invariant theo output và giữ nguyên destructive/read-only contract.","Choose the invariant from the output and preserve the destructive/read-only contract.")},
 "LIST_SETUP": {"preconditions":["The QP defines node representation and null value."],"representation":["Array records/2D array with optional free list, or object references."],"conventions":["head is the first logical node","null terminates chains","array model may partition live/free nodes","object model uses references and no invented free list"],"variant_axes":catalog["LIST_SETUP"]["variant_axes_to_preserve"],"decision_rule":bi("Duyệt riêng live chain và free chain để chứng minh phân hoạch.","Traverse live and free chains separately to prove the partition.")},
 "LIST_TRAVERSE": {"preconditions":["Head, node accessors/fields and null sentinel are known."],"representation":["Read-only pointer following."],"conventions":["start at head","visit before advance","advance via Next","stop at exact null"],"variant_axes":catalog["LIST_TRAVERSE"]["variant_axes_to_preserve"],"decision_rule":bi("Thứ tự logic luôn do Next quyết định, không do index vật lý.","Next always determines logical order, not physical index.")},
 "LIST_INSERT": {"preconditions":["Insertion position, allocator and failure contract are known."],"representation":["Array free-list allocation or object-node creation followed by link commit."],"conventions":["save free-node successor before overwrite","front and tail insertion use distinct link commits","full failure preserves state"],"variant_axes":catalog["LIST_INSERT"]["variant_axes_to_preserve"],"decision_rule":bi("Reserve an toàn, tạo node hợp lệ, rồi mới nối vào live chain.","Reserve safely, build a valid node, then link it into the live chain.")},
 "LIST_REMOVE": {"preconditions":["Occurrence rule, absence assumption and recycling contract are known."],"representation":["Search with previous/current, unlink, then optional recycle."],"conventions":["head case updates head","interior/tail case updates previous.Next","array model recycles after unlink","object model does not invent free-list state"],"variant_axes":catalog["LIST_REMOVE"]["variant_axes_to_preserve"],"decision_rule":bi("Tìm first match, unlink khỏi live chain trước, rồi mới recycle.","Find the first match, unlink it from the live chain first, then recycle it.")},
}

corpus_limits = {
 "QUEUE_SETUP":"Twelve assessed parts across 2022-2025 evidence linear and circular queues, several pointer conventions and optional count; they do not establish one universal queue representation.",
 "QUEUE_ENQUEUE":"Twelve assessed parts evidence Boolean, numeric and message contracts plus linear/circular transitions; each result and update order remains source-bound.",
 "QUEUE_DEQUEUE":"Eleven assessed parts evidence multiple sentinel types, reset/wrap policies and retained physical cells; no sentinel or reset rule is universal.",
 "QUEUE_INSPECT":"Single assessed part in 2024; its half-open linear range and spacing contract must not be generalised to circular queues.",
 "QUEUE_REDUCE":"Three assessed parts cover read-only recursive total, destructive sum and destructive run-length encoding; broader reductions are not evidenced.",
 "LIST_SETUP":"Six assessed parts cover supplied array-record tables, a 2D free-list model and object nodes; representations remain separate.",
 "LIST_TRAVERSE":"Six assessed parts cover array links and object references with logical-order output; cycle handling is not an official source requirement.",
 "LIST_INSERT":"Six assessed parts cover tail insertion with a free list and front insertion in array/object models; arbitrary sorted/middle insertion is outside this pattern evidence.",
 "LIST_REMOVE":"Three assessed parts cover first occurrence in array/free-list and object models; only the object source explicitly covers absence.",
}

representatives = {
 "QUEUE_SETUP":["9618_s22_41_3(a)","9618_w22_42_3(a)","9618_s23_42_2(b)"],
 "QUEUE_ENQUEUE":["9618_s22_41_3(b)","9618_w22_42_3(b)","9618_s23_42_2(c)"],
 "QUEUE_DEQUEUE":["9618_s22_41_3(c)","9618_s23_42_2(d)","9618_s24_41_3(c)"],
 "QUEUE_INSPECT":["9618_w24_42_2(d)"],
 "QUEUE_REDUCE":["9618_w22_42_3(d)","9618_s25_43_1(e)(i)","9618_w25_43_2(e)"],
 "LIST_SETUP":["9618_s21_41_1(b)","9618_w24_41_3(a)","9618_s25_43_3(b)(i)"],
 "LIST_TRAVERSE":["9618_s21_41_1(c)(i)","9618_w24_41_3(c)(i)","9618_s25_43_3(b)(iii)"],
 "LIST_INSERT":["9618_s21_41_1(d)(i)","9618_w24_41_3(b)","9618_s25_43_3(b)(ii)"],
 "LIST_REMOVE":["9618_w24_41_3(d)(i)","9618_s25_43_3(b)(iv)"],
}

confusables = {
 "QUEUE_SETUP":["QUEUE_ENQUEUE","QUEUE_DEQUEUE"], "QUEUE_ENQUEUE":["QUEUE_DEQUEUE"],
 "QUEUE_DEQUEUE":["QUEUE_ENQUEUE","QUEUE_INSPECT"], "QUEUE_INSPECT":["QUEUE_DEQUEUE","LIST_TRAVERSE"],
 "QUEUE_REDUCE":["QUEUE_INSPECT","RUN_LENGTH_ENCODE"], "LIST_SETUP":["LIST_INSERT","LIST_REMOVE"],
 "LIST_TRAVERSE":["QUEUE_INSPECT","LIST_REMOVE"], "LIST_INSERT":["LIST_REMOVE"], "LIST_REMOVE":["LIST_INSERT"],
}

def objectives(pattern):
    return list(dict.fromkeys(o for k in chains[pattern]["knowledge_chain"] for o in k["objective_ids"]))


def req_refs(pattern):
    return [f"ac-9618-p4-2026-python.assessment-requirement.{o.lower()}" for o in objectives(pattern)]


def issue_ids(pattern):
    return sorted({i for r in rows_by_pattern[pattern] for i in row_issue_refs(r)})


def issue_dispositions(pattern):
    selected = []
    pids = {r["part_id"] for r in rows_by_pattern[pattern]}
    for issue_id in issue_ids(pattern):
        issue = issues_by_id[issue_id]
        occ = [x for x in occurrences if x["issue_id"] == issue_id and x["part_id"] in pids]
        selected.append({
            "issue_id": issue_id, "status": issue["status"], "source_locators": issue["source_locators"],
            "affected_occurrences": [{"occurrence_id": x["occurrence_id"], "part_id": x["part_id"], "source_locators": x["source_locators"]} for x in occ],
            "stage4_dispositions": issue["stage4_dispositions"], "stage5_obligations": issue["stage5_obligations"],
        })
    return selected


CONTRAST_REFS = {
    "QUEUE_ENQUEUE": ["A3C15"],
    "LIST_INSERT": ["A3C17"],
}

cards = []
for pattern in PATTERNS:
    chain = chains[pattern]
    book_ids = list(dict.fromkeys(s for k in chain["knowledge_chain"] for s in k["book_section_ids"]))
    refs = official_refs[pattern]
    cards.append({
        "card_id": f"ac-9618-p4-2026-python.stage4.pattern.{pattern.lower().replace('_','-')}",
        "pattern_id": pattern, "version": VERSION, "status": "SUBMITTED",
        "package_id": chain["package_id"], "lesson_id": chain["lesson_id"],
        "knowledge_block_ids": chain["knowledge_block_ids"], "objective_ids": objectives(pattern),
        "titles": bi(catalog[pattern]["name_vi"], catalog[pattern]["name_en"]),
        "recognition": bi(catalog[pattern]["recognition_vi"], recognition_en[pattern]),
        "source_scope": {"assessed_part_ids": catalog[pattern]["assessed_part_ids"],
            "representative_parts": [r for r in refs if r["part_id"] in representatives[pattern]],
            "official_source_refs": refs, "corpus_limit": corpus_limits[pattern]},
        "confusable_pattern_refs": confusables[pattern], "confusable_contrast_refs": CONTRAST_REFS.get(pattern, []),
        "source_issue_refs": issue_ids(pattern),
        "source_fidelity_policies": fidelity_policies if any(r["source_batch"] == "2023-2024" for r in refs) else [],
        "book_foundation_refs": [{"section_id": sid,"source_id":book_sections[sid]["source_id"],
            "printed_pages":book_sections[sid]["printed_pages"],"pdf_pages":book_sections[sid]["pdf_pages"],
            "support_level":book_sections[sid]["support_level"],"limitations":book_sections[sid]["limitations"],
            "authority":"coursebook_foundation"} for sid in book_ids],
        "applicability": applicability[pattern], "method_steps": methods[pattern],
        "marking_point_refs": all_atoms(pattern), "assessment_requirement_refs": req_refs(pattern),
        "error_refs": [], "solution_design_ref": f"b3.solution.{pattern.lower().replace('_','-')}",
        "visual_brief_ref": f"b3.visual.{pattern.lower().replace('_','-')}",
        "authority_labels": ["official_qp","official_ms","official_syllabus","coursebook_foundation","AlgoCore_inference","AlgoCore_risk"],
        "authority_note": "Official obligations are limited to cited QP/MS atoms. Method, invariant, checks and repairs are AlgoCore inference/risk. The 2023-2024 fidelity policy is not a per-part source issue.",
        "downstream_status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
    })


variant_specs = [
 ("queue-model",["QUEUE_SETUP","QUEUE_ENQUEUE","QUEUE_DEQUEUE"],"linear_or_circular",
  "Khóa linear/circular, tail-role và count trước khi chọn equations.","Lock linear/circular, tail role and count before choosing equations.",
  [{"case_id":"linear_next_free","empty":"head=-1 or source value; tail=0/next free","full":"tail=capacity","live_indices":"head..tail-1 when non-empty","enqueue":"write tail; set first head; tail+=1","dequeue":"read head; head+=1 or source reset","observed_parts":["9618_w22_42_3(a)","9618_w23_41_2(a)(i)"]},
   {"case_id":"linear_last_item","empty":"head=tail=-1","full":"tail=capacity-1","live_indices":"head..tail","enqueue":"advance/set tail then write","dequeue":"read head then advance/reset","observed_parts":["9618_s24_41_3(a)","9618_s25_41_1(a)"]},
   {"case_id":"circular_count","empty":"count=0","full":"count=capacity","live_indices":"count items from head modulo capacity","enqueue":"write at next-free tail; wrap; count+=1","dequeue":"read head; wrap; count-=1","observed_parts":["9618_s22_41_3(a)","9618_s23_42_2(b)"]}],
  "Logical size and live order agree with head/tail/count; wrap occurs only in circular case."),
 ("queue-results",["QUEUE_ENQUEUE","QUEUE_DEQUEUE"],"return_and_empty_contract",
  "Lấy value, type và output/return từ từng QP; không chuẩn hóa giữa papers.","Take value, type and output/return from each QP; do not normalise across papers.",
  [{"case_id":"boolean_or_string_false","contract":"Boolean success/failure or source string FALSE","observed_parts":["9618_s22_41_3(b)","9618_s22_41_3(c)"]},{"case_id":"numeric","contract":"1/-1 or integer -1 as explicitly stated","observed_parts":["9618_s23_42_2(c)","9618_s25_43_1(c)"]},{"case_id":"empty_record_or_message","contract":"empty record, empty string or message plus return","observed_parts":["9618_s23_42_2(d)","9618_w23_41_2(a)(iii)"]}],
  "A branch returns/emits the exact source-defined type and literal and preserves failure state."),
 ("queue-processing",["QUEUE_INSPECT","QUEUE_REDUCE"],"destructive_or_readonly",
  "Chọn traversal theo hậu trạng thái queue mà QP yêu cầu.","Choose traversal from the queue post-state required by the QP.",
  [{"case_id":"inspect_readonly","mutation":"none","termination":"live range end","observed_parts":["9618_w24_42_2(d)"]},{"case_id":"recursive_readonly","mutation":"none","termination":"base index","observed_parts":["9618_w22_42_3(d)"]},{"case_id":"dequeue_consume","mutation":"queue consumed","termination":"exact empty sentinel","observed_parts":["9618_s25_43_1(e)(i)","9618_w25_43_2(e)"]}],
  "Every source item contributes once; readonly variants preserve state and consume variants follow their Dequeue contract."),
 ("list-representation",["LIST_SETUP","LIST_TRAVERSE","LIST_INSERT","LIST_REMOVE"],"array_or_objects",
  "Giữ riêng index/null/free-list của array và reference/None của object.","Keep array index/null/free-list rules separate from object reference/None rules.",
  [{"case_id":"array_records","node":"record or two columns","null":"-1","allocation":"linked free list","observed_parts":["9618_s21_41_1(b)","9618_w24_41_3(a)"]},{"case_id":"object_nodes","node":"object reference","null":"None/null","allocation":"construct object; no array free list","observed_parts":["9618_s25_43_3(b)(i)"]}],
  "Following head/Next visits exactly the live chain; array slots partition into live and free sets."),
 ("list-insert-position",["LIST_INSERT"],"front_or_tail",
  "Chọn link commit theo vị trí được yêu cầu sau khi node mới đã hợp lệ.","Choose the link commit from the requested position after the new node is valid.",
  [{"case_id":"front","links":"new.Next=old head; head=new","observed_parts":["9618_w24_41_3(b)","9618_s25_43_3(b)(ii)"]},{"case_id":"tail","links":"find tail; tail.Next=new; new.Next=null; empty updates head","observed_parts":["9618_s21_41_1(d)(i)"]}],
  "Old live order is preserved and new node appears exactly once at the requested end."),
 ("list-remove-case",["LIST_REMOVE"],"head_interior_tail_absent",
  "Phân nhánh theo current=head, predecessor tồn tại và absence contract.","Branch on current=head, predecessor existence and the absence contract.",
  [{"case_id":"head","unlink":"head=current.Next"},{"case_id":"interior_or_tail","unlink":"previous.Next=current.Next"},{"case_id":"absent","unlink":"none; false only when source permits"}],
  "Successful removal decreases live reachability by one; failure preserves state; recycling happens only after unlink."),
]
variants = [{"variant_id":f"b3.variant.{vid}","pattern_ids":pats,"stage2_contrast_refs":(["A3C15"] if vid == "queue-model" else ["A3C17"] if vid == "list-representation" else []),"axis":axis,
             "decision_rule":bi(vi,en),"cases":cases,"invariant":inv,"method_changing":True}
            for vid,pats,axis,vi,en,cases,inv in variant_specs]


errors=[]
def add_error(pattern,suffix,steps,likely_vi,likely_en,cons_vi,cons_en,detect_vi,detect_en,repair_vi,repair_en,
              basis="AlgoCore_risk",keywords=(),parts=(),issue_id=None,authority_note=None):
    refs=mp_by(pattern,*keywords) if keywords else []
    loc=[r for r in official_refs[pattern] if (not parts or r["part_id"] in parts) and (not refs or any(m["marking_point_id"] in refs for m in r["ms_atoms"]))]
    if issue_id:
        issue=issues_by_id[issue_id]
        loc=[{"issue_id":issue_id,"source_locators":issue["source_locators"],"affected_occurrences":[x for x in occurrences if x["issue_id"]==issue_id and x["part_id"] in {r["part_id"] for r in rows_by_pattern[pattern]}]}]
    errors.append({"error_id":f"b3.{pattern.lower().replace('_','-')}.error.{suffix}","pattern_id":pattern,
      "question_part_ids":list(parts),"requirement_refs":req_refs(pattern),"marking_point_refs":refs,
      "method_step_refs":[f"{pattern.lower().replace('_','-')}.step.{x}" for x in steps],
      "likely_error":bi(likely_vi,likely_en),"consequence":bi(cons_vi,cons_en),"detection_check":bi(detect_vi,detect_en),
      "repair_action":bi(repair_vi,repair_en),"repair_exercise_ref":f"b3.{pattern.lower().replace('_','-')}.repair.{suffix}",
      "basis":basis,"source_locator_if_official":loc,"exact_mark_loss_claim":None,
      "authority_note":authority_note or "AlgoCore risk derived from the stated invariant; no examiner-frequency or fixed mark-loss claim is made.","status":"SUBMITTED"})

add_error("QUEUE_SETUP","mixed-convention",["pointers","consistency"],"Ghép empty/full hoặc tail-role từ hai queue conventions.","Mixing empty/full or tail-role rules from two queue conventions.","Live range và lần Enqueue/Dequeue đầu tiên lệch chỉ số.","The live range and first Enqueue/Dequeue become off by one.","Điền bảng empty/full/read/write cho một model duy nhất.","Complete the empty/full/read/write table for one model.","Xóa quy tắc nhớ sẵn và suy lại từ câu định nghĩa pointers.","Discard memorised rules and derive them from pointer definitions.")
add_error("QUEUE_SETUP","invented-wrap",["contract","consistency"],"Thêm modulo/wrap cho queue tuyến tính.","Adding modulo/wrap to a linear queue.","Queue tái sử dụng ô trái phép và full condition sai.","The queue reuses slots without authority and its full condition is wrong.","Tìm từ circular/wrap hoặc count trong QP; nếu không có, giữ linear.","Look for circular/wrap or count in the QP; otherwise retain linear.","Đánh dấu model ở đầu lời giải và kiểm tail tại capacity.","Label the model at the start and check tail at capacity.")
add_error("QUEUE_ENQUEUE","mutate-before-full",["full-guard"],"Ghi hoặc tăng pointer trước khi kiểm đầy.","Writing or moving a pointer before checking full.","Có thể vượt mảng và làm hỏng state ở nhánh failure.","It can write out of range and corrupt failure state.","Snapshot full queue trước/sau.","Snapshot a full queue before/after.","Đưa full guard trước mọi mutation.","Move the full guard before every mutation.","official_qp_ms",("full","capacity"))
add_error("QUEUE_ENQUEUE","wrong-tail-update",["write","advance"],"Dùng thứ tự next-free cho tail last-item hoặc ngược lại.","Using next-free update order for a last-item tail or vice versa.","Ghi đè, bỏ trống hoặc sai head của item đầu.","It overwrites, leaves a gap or missets the first-item head.","Thử empty→one và one-free-slot→full.","Test empty-to-one and one-free-slot-to-full.","Suy write index từ tail-role trước khi viết steps.","Derive write index from tail role before writing steps.","official_qp_ms",("tail","insert","increment"))
add_error("QUEUE_ENQUEUE","wrong-result-contract",["contract","result"],"Trả Boolean thay cho 1/−1 hoặc thay message/literal.","Returning Boolean instead of 1/-1 or changing a message/literal.","State đúng nhưng interface sai QP/MS.","State may be correct while the interface violates QP/MS.","So type/value/output-vs-return trên cả hai nhánh.","Check type/value/output-versus-return on both branches.","Chép contract thành bảng hai nhánh trước khi làm.","Copy the contract into a two-branch table first.","official_qp_ms",("return","output"))
add_error("QUEUE_ENQUEUE","scope-sample",["contract","advance"],"Sao scope/global handling từ listing w22 mà không kiểm state ownership.","Copying scope/global handling from the w22 listing without checking state ownership.","Pointer cập nhật có thể chỉ tồn tại cục bộ hoặc khác contract.","Pointer updates may remain local or violate the contract.","Đối chiếu QP và locator caveat trước khi dùng listing.","Check the QP and caveat locator before using the listing.","Tự thiết kế state interface ở Stage 5; không chứng nhận sample.","Independently design the state interface in Stage 5; do not certify the sample.","source_issue",parts=("9618_w22_42_3(b)",),issue_id="W22-42-3B-SCOPE")
add_error("QUEUE_ENQUEUE","missing-full-guard",["full-guard"],"Bỏ full guard trong w25 queue có capacity hữu hạn.","Omitting the full guard in the finite w25 queue.","Enqueue khi đầy truy cập ngoài miền hoặc phá state.","Enqueue on full can access out of range or corrupt state.","Dùng fixture already-full và kiểm zero mutation.","Use an already-full fixture and require zero mutation.","Thêm guard theo source contract trước write.","Add the source-contract guard before the write.","source_issue",parts=("9618_w25_43_2(b)",),issue_id="W25-43-Q2B-FULL-GUARD")
add_error("QUEUE_DEQUEUE","read-after-advance",["save-item","advance"],"Cập nhật head rồi mới đọc.","Advancing head before reading.","Trả item thứ hai thay cho item FIFO đầu.","It returns the second item instead of the oldest FIFO item.","Dùng hai item khác nhau và đánh dấu pre-state head.","Use two distinct items and mark pre-state head.","Lưu item trước mọi pointer update.","Save the item before any pointer update.","official_qp_ms",("head","retrieve","return"))
add_error("QUEUE_DEQUEUE","sentinel-or-reset",["contract","empty-guard","advance"],"Dùng sentinel/reset quen thuộc thay vì contract nguồn.","Using a familiar sentinel/reset instead of the source contract.","Caller không nhận empty hoặc metadata rỗng không nhất quán.","The caller misses empty or the empty metadata becomes inconsistent.","Kiểm ca empty và one-item theo bảng contract.","Check empty and one-item cases against the contract table.","Giữ đúng type/literal và chỉ reset khi source yêu cầu.","Use the exact type/literal and reset only when required.","official_qp_ms",("empty","false","-1","reset"))
add_error("QUEUE_DEQUEUE","published-example",["contract","advance","return"],"Coi listing dequeue s22 là implementation đã được xác minh.","Treating the s22 dequeue listing as a verified implementation.","Mâu thuẫn nguồn có thể đi vào bài học hoặc code Stage 5.","A source inconsistency can enter the lesson or Stage 5 code.","Mở QP/MS facsimile tại locator và test độc lập mọi transition.","Open the QP/MS facsimile at the locator and independently test every transition.","Giữ requirement/atoms, loại sample khỏi claim đúng cho tới Stage 5.","Retain requirements/atoms but exclude the sample from correctness claims until Stage 5.","source_issue",parts=("9618_s22_41_3(c)","9618_s22_43_3(c)"),issue_id="S22-41-3C-DEQUEUE")
add_error("QUEUE_INSPECT","physical-scan",["contract","iterate"],"Duyệt toàn bộ storage hoặc từ index 0.","Scanning all storage or starting at index 0.","In unused/stale cells and wrong FIFO order appear in output.","Unused/stale cells and wrong FIFO order enter output.","Đếm iterations bằng logical size và dùng head khác 0.","Match iterations to logical size and use a non-zero head.","Duyệt live bounds do head/tail định nghĩa.","Traverse the head/tail-defined live bounds.","official_qp_ms",("headpointer","tailpointer"))
add_error("QUEUE_INSPECT","destructive-inspect",["preservation"],"Gọi Dequeue để lấy nội dung.","Calling Dequeue to obtain contents.","Queue bị rỗng/thay đổi sau thao tác read.","The queue becomes empty/changed after a read operation.","Snapshot toàn bộ queue record.","Snapshot the entire queue record.","Đọc storage qua cursor cục bộ, không mutation.","Read storage through a local cursor without mutation.")
add_error("QUEUE_REDUCE","wrong-mode",["mode","postcheck"],"Consume queue trong source read-only hoặc giữ queue trong source yêu cầu Dequeue.","Consuming a read-only source or preserving a source that requires Dequeue.","Output có thể đúng nhưng hậu trạng thái sai.","The value may be correct while the post-state is wrong.","So pre/post queue với mutation contract.","Compare pre/post queue with the mutation contract.","Chọn mode trước accumulator và kiểm hậu trạng thái.","Choose mode before the accumulator and check post-state.","official_qp_ms",("recursive","dequeue"))
add_error("QUEUE_REDUCE","sentinel-as-data",["initialise","iterate","terminate"],"Cộng/nén sentinel như item thật.","Adding/compressing the sentinel as real data.","Accumulator/output có item giả.","The accumulator/output contains fabricated data.","Đếm useful steps bằng số live items ban đầu.","Match useful steps to initial live items.","Kiểm termination ngay sau result empty.","Check termination immediately after the empty result.")
add_error("QUEUE_REDUCE","missing-final-run",["iterate","terminate"],"Chỉ flush run khi digit thay đổi.","Flushing a run only when the digit changes.","Run cuối biến mất khỏi encoded output.","The final run is missing from encoded output.","Dùng input toàn một digit và input kết thúc bằng run dài.","Use a single-digit input and one ending in a long run.","Flush pending run tại termination.","Flush the pending run at termination.","official_qp_ms",("append","count","string"))
add_error("LIST_SETUP","physical-order",["live-head","consistency"],"Coi index 0..n là thứ tự list.","Treating index 0..n as list order.","Traversal bỏ qua links và có thể đi vào free nodes.","Traversal ignores links and may enter free nodes.","Trace từ head qua Next tới null.","Trace from head through Next to null.","Vẽ chain theo links, không theo rows.","Draw the chain by links rather than rows.","official_qp_ms",("head","next"))
add_error("LIST_SETUP","broken-free-partition",["free-chain","consistency"],"Một slot vừa live vừa free hoặc không nằm trong chain nào.","A slot is both live and free or belongs to neither chain.","Allocator cấp phát trùng hoặc mất capacity.","The allocator double-allocates or loses capacity.","Đánh dấu mỗi index L/F đúng một lần.","Mark every index L/F exactly once.","Dựng lại free chain và kiểm union bằng capacity.","Rebuild the free chain and match the union to capacity.","official_qp_ms",("free","next","20"))
add_error("LIST_TRAVERSE","cursor-plus-one",["advance"],"Tăng cursor số học thay vì theo Next.","Incrementing cursor numerically instead of following Next.","Output theo physical order, bỏ/sai node logic.","Output follows physical order and misses/misorders logical nodes.","Dùng links nhảy 4→1→7.","Use links that jump 4→1→7.","Chỉ gán cursor=node[cursor].Next.","Assign only cursor=node[cursor].Next.","official_qp_ms",("nextnode","getnextnode","next"))
add_error("LIST_TRAVERSE","wrong-stop",["visit","finish"],"Dừng theo capacity hoặc truthiness thay vì exact null.","Stopping by capacity or truthiness instead of exact null.","Đọc free node, bỏ index 0 hoặc dereference null.","It reads free nodes, skips index 0 or dereferences null.","Thử empty, one-node index0 và nonzero head.","Test empty, one-node-at-index-0 and non-zero head.","So cursor với đúng −1/None/null của representation.","Compare cursor with the exact -1/None/null of the representation.")
add_error("LIST_INSERT","overwrite-free-next",["reserve","write-node"],"Ghi node mới trước khi lưu Next cũ của free node.","Overwriting the new node before saving its old free Next.","Phần còn lại của free-list bị mất.","The rest of the free list is lost.","Dùng free-list hai node và kiểm node thứ hai còn reachable.","Use a two-node free list and check the second remains reachable.","Lưu next_free trước mọi write vào reserved node.","Save next_free before any write to the reserved node.","source_issue",parts=("9618_s21_41_1(d)(i)","9618_s21_42_1(d)(i)","9618_s21_43_1(d)(i)"),issue_id="S21-1DI-FREE")
add_error("LIST_INSERT","wrong-position",["write-node","link"],"Dùng front link cho tail task hoặc ngược lại.","Using front linking for a tail task or vice versa.","New node xuất hiện sai vị trí hoặc old head/tail bị mất.","The new node appears at the wrong position or old head/tail is lost.","So before/after logical sequence.","Compare before/after logical sequence.","Chọn position trước allocation và dùng đúng commit formula.","Choose position before allocation and use the matching commit formula.","official_qp_ms",("head","end","last","next"))
add_error("LIST_INSERT","full-mutates",["capacity-guard"],"Lấy free node khi free-head đã null.","Taking a free node when free-head is null.","Index −1/out-of-range hoặc phá live chain.","It uses -1/out of range or corrupts the live chain.","Fixture capacity đầy phải zero mutation.","A full-capacity fixture must have zero mutation.","Guard full trước reserve.","Guard full before reservation.","official_qp_ms",("full","emptylist","firstfree"))
add_error("LIST_REMOVE","head-as-interior",["unlink"],"Luôn ghi previous.Next dù target ở head.","Always writing previous.Next when the target is head.","Null previous hoặc head vẫn trỏ removed node.","Previous is null or head still reaches the removed node.","Test target tại head trong list một và nhiều node.","Test head target in one- and multi-node lists.","Phân nhánh current==head để cập nhật head.","Branch on current==head and update head.","official_qp_ms",("head","first"))
add_error("LIST_REMOVE","recycle-before-unlink",["unlink","recycle"],"Ghi removed.Next=free_head trước khi predecessor/head lấy successor cũ.","Writing removed.Next=free_head before predecessor/head captures the old successor.","Live suffix bị mất hoặc nối sang free chain.","The live suffix is lost or linked into the free chain.","Dùng target giữa list ba node và trace cả hai chain.","Use a middle target in a three-node list and trace both chains.","Lưu successor, unlink live, rồi recycle.","Save successor, unlink live, then recycle.")
add_error("LIST_REMOVE","invented-absence",["contract","handle-miss"],"Giả định target luôn có trong object task hoặc tự thêm not-found vào source bảo đảm có.","Assuming target exists in the object task or inventing not-found behaviour in a presence-guaranteed source.","Dereference null hoặc thay đổi interface nguồn.","It dereferences null or changes the source interface.","Đọc presence assumption và test absent chỉ khi contract yêu cầu/cho phép.","Read the presence assumption and test absent only when required/permitted.","Giữ precondition/Boolean contract đúng từng part.","Preserve each part's precondition/Boolean contract.","official_qp_ms",("false","not found","return"))

errors_by_pattern={p:[e["error_id"] for e in errors if e["pattern_id"]==p] for p in PATTERNS}
for card in cards: card["error_refs"] = errors_by_pattern[card["pattern_id"]]


variant_for={"QUEUE_SETUP":"b3.variant.queue-model","QUEUE_ENQUEUE":"b3.variant.queue-model","QUEUE_DEQUEUE":"b3.variant.queue-model",
 "QUEUE_INSPECT":"b3.variant.queue-processing","QUEUE_REDUCE":"b3.variant.queue-processing","LIST_SETUP":"b3.variant.list-representation",
 "LIST_TRAVERSE":"b3.variant.list-representation","LIST_INSERT":"b3.variant.list-insert-position","LIST_REMOVE":"b3.variant.list-remove-case"}
contracts={
 "QUEUE_SETUP":("Thông số representation từ QP.","Representation facts from the QP.","State queue rỗng nhất quán.","A consistent empty queue state."),
 "QUEUE_ENQUEUE":("Item và queue hợp lệ.","An item and valid queue.","Success thêm đúng một item hoặc failure giữ nguyên.","Success adds exactly one item or failure preserves state."),
 "QUEUE_DEQUEUE":("Queue hợp lệ và empty contract.","A valid queue and empty contract.","Oldest item hoặc exact empty result.","Oldest item or exact empty result."),
 "QUEUE_INSPECT":("Queue tuyến tính và format contract.","A linear queue and format contract.","Chuỗi live items; queue giữ nguyên.","A string of live items; queue unchanged."),
 "QUEUE_REDUCE":("Queue/data grammar và reduction contract.","Queue/data grammar and reduction contract.","Required aggregate/encoding and required queue post-state.","Required aggregate/encoding and required queue post-state."),
 "LIST_SETUP":("Node schema, capacity/table và pointers.","Node schema, capacity/table and pointers.","Live/free chains hợp lệ hoặc object head hợp lệ.","Valid live/free chains or valid object head."),
 "LIST_TRAVERSE":("Head, null và node access.","Head, null and node access.","Logical-order output with unchanged list.","Logical-order output with unchanged list."),
 "LIST_INSERT":("Data, list hợp lệ và allocator/position contract.","Data, valid list and allocator/position contract.","One inserted node or non-mutating full failure.","One inserted node or non-mutating full failure."),
 "LIST_REMOVE":("Target, list hợp lệ và presence/recycle contract.","Target, valid list and presence/recycle contract.","First match removed or permitted non-mutating failure.","First match removed or permitted non-mutating failure."),
}

test_cases={
 "QUEUE_SETUP":(["each observed empty convention"],["capacity 1","last physical slot"],["mixed linear/circular equations"]),
 "QUEUE_ENQUEUE":(["empty to one","partially filled"],["one free slot","already full","circular wrap"],["wrong tail-role update","wrong return type"]),
 "QUEUE_DEQUEUE":(["two distinct items"],["empty","one item","circular head at last slot"],["read after advance","wrong sentinel/reset"]),
 "QUEUE_INSPECT":(["nonzero head and multiple items"],["one item","empty if source interface permits"],["scan all storage","mutating Dequeue"]),
 "QUEUE_REDUCE":(["recursive sum","destructive sum","several runs"],["one item","final run","base index"],["sentinel as data","wrong mutation mode"]),
 "LIST_SETUP":(["source initial table","empty free-list model","empty object list"],["capacity 1","nonzero head"],["overlap or lost node"]),
 "LIST_TRAVERSE":(["non-contiguous link order"],["empty","one node","head index 0"],["cursor+=1","wrong null"]),
 "LIST_INSERT":(["front object","front array","tail array"],["empty list","one free node","full"],["overwrite free Next","wrong position"]),
 "LIST_REMOVE":(["head","middle","tail"],["one node","empty/absent when permitted"],["recycle before unlink","double ownership"]),
}
solutions=[]
for p in PATTERNS:
    cin_vi,cin_en,cout_vi,cout_en=contracts[p]; norm,bound,counter=test_cases[p]
    solutions.append({"solution_design_id":f"b3.solution.{p.lower().replace('_','-')}","pattern_id":p,"variant_id":variant_for[p],
      "input_contract":bi(cin_vi,cin_en),"output_contract":bi(cout_vi,cout_en),
      "state_model":"; ".join(applicability[p]["representation"]),"representation":applicability[p]["conventions"],
      "preconditions":applicability[p]["preconditions"],
      "postconditions":[methods[p][-1]["invariant"],"All exact source return/output obligations remain part-specific."],
      "invariants":list(dict.fromkeys(x["invariant"] for x in methods[p])),
      "ordered_method_step_ids":[x["step_id"] for x in methods[p]],
      "mutation_and_preservation_rules":["No mutation on a guarded failure path.","Every successful mutation restores the representation invariant before return.","Physical stale values are not live unless reachable under metadata/links."],
      "termination_argument":methods[p][-1]["termination_role"]+": "+methods[p][-1]["guard"],
      "failure_paths":[e["consequence"]["en"] for e in errors if e["pattern_id"]==p],
      "alternative_designs":applicability[p]["conventions"],
      "stage5_test_obligations":{"normal":norm,"boundary":bound,"counterexample":counter,"source_fixture":catalog[p]["assessed_part_ids"]},
      "source_constraints":official_refs[p],"source_issue_dispositions":issue_dispositions(p),
      "status":"PENDING_STAGE5_EXECUTION_VERIFICATION"})


example_prompt={
 "QUEUE_SETUP":("So sánh ba snapshot rỗng: linear next-free, linear last-item và circular count.","Compare three empty snapshots: linear next-free, linear last-item and circular count."),
 "QUEUE_ENQUEUE":("Thiết kế một queue còn một ô rồi Enqueue success, sau đó thử Enqueue đầy.","Design a queue with one free slot, perform a successful Enqueue, then attempt a full Enqueue."),
 "QUEUE_DEQUEUE":("Dùng hai item khác nhau, Dequeue tới rỗng rồi gọi thêm một lần.","Use two distinct items, Dequeue to empty, then call once more."),
 "QUEUE_INSPECT":("Dùng head khác 0, stale cells ngoài live range và delimiter space.","Use a non-zero head, stale cells outside the live range and a space delimiter."),
 "QUEUE_REDUCE":("Đặt cạnh recursive read-only sum, destructive sum và run-length queue.","Contrast recursive read-only sum, destructive sum and a run-length queue."),
 "LIST_SETUP":("Dựng bảng có live chain phi tuần tự và free chain bù, rồi đối chiếu object list rỗng.","Build a table with non-contiguous live and complementary free chains, then contrast an empty object list."),
 "LIST_TRAVERSE":("Duyệt chain 4→1→7→−1 và chứng minh array order không liên quan.","Traverse 4→1→7→−1 and show that array order is irrelevant."),
 "LIST_INSERT":("Chèn đầu trong object model và chèn cuối trong array/free-list model với cùng payload.","Insert at front in an object model and at tail in an array/free-list model using the same payload."),
 "LIST_REMOVE":("Xóa first match lần lượt ở head, middle, tail; sau đó xét absent object case.","Remove the first match at head, middle and tail, then examine an absent object case."),
}
worked=[]
for p in PATTERNS:
    anchor=next(r for r in official_refs[p] if r["part_id"]==representatives[p][0])
    worked.append({"worked_example_spec_id":f"b3.example.{p.lower().replace('_','-')}","pattern_id":p,
      "status":"PENDING_STAGE5_EXECUTION_VERIFICATION","origin":"AlgoCore_original_adaptation_spec","anchor_source":anchor,
      "prompt_design":bi(*example_prompt[p]),"representation_and_convention":applicability[p]["decision_rule"],
      "method_step_refs":[x["step_id"] for x in methods[p]],
      "learner_checkpoints":[x["check"]["en"] for x in methods[p]],
      "contrast_and_boundary_microcases":test_cases[p][1]+test_cases[p][2],
      "evidence_to_capture_later":["initial state","guard decision","ordered state-changing events","return/output contract","postcondition and invariant check"],
      "prohibited_stage4_claims":["No executable code","No certified trace","No final runtime output","No official marks assigned to the AlgoCore adaptation"],
      "stage5_handoff":"Implement independent Python fixtures and verify event traces against the exact source contract and carried source caveats."})


visual_data={
 "QUEUE_SETUP":("Head/tail/count đang chỉ điều gì?","What do head/tail/count denote?",["DECLARE_STORAGE","SELECT_QUEUE_MODEL","SET_POINTERS","MARK_LIVE_RANGE","CHECK_EMPTY_FULL"],["indexed storage","head/tail arrows","count","live/unused partition"],"Dự đoán first read/write và full state.","Predict the first read/write and full state."),
 "QUEUE_ENQUEUE":("Item mới được commit ở event nào?","At which event is the new item committed?",["CHECK_FULL","SELECT_WRITE_INDEX","WRITE_ITEM","MOVE_TAIL","SET_FIRST_HEAD","INCREMENT_COUNT","RETURN_RESULT"],["before/after metadata","write index","new item","result"],"Chọn event tiếp theo khi còn một ô.","Choose the next event with one free slot."),
 "QUEUE_DEQUEUE":("Vì sao phải lưu item trước khi dời head?","Why must the item be saved before moving head?",["CHECK_EMPTY","READ_HEAD","SAVE_ITEM","MOVE_HEAD","DECREMENT_COUNT","RESET_OR_WRAP","RETURN_ITEM"],["head item","saved value","metadata transitions","result/sentinel"],"Dự đoán state sau khi lấy item cuối.","Predict state after removing the final item."),
 "QUEUE_INSPECT":("Live range khác storage range thế nào?","How does the live range differ from storage range?",["SET_LOCAL_CURSOR","READ_LIVE_ITEM","APPEND_DELIMITER","ADVANCE_CURSOR","RETURN_TEXT","COMPARE_SNAPSHOT"],["live/stale cells","local cursor","text","unchanged metadata"],"Chọn các ô sẽ xuất trước khi reveal.","Choose output cells before reveal."),
 "QUEUE_REDUCE":("Accumulator đang tóm tắt prefix nào?","Which prefix does the accumulator summarise?",["SELECT_MODE","READ_OR_DEQUEUE","UPDATE_ACCUMULATOR","ADVANCE_OR_RECURSE","FLUSH_FINAL_RUN","CHECK_POST_STATE"],["processed/unprocessed items","accumulator","sentinel/base","queue mutation"],"Dự đoán contribution tiếp theo và hậu trạng thái.","Predict the next contribution and post-state."),
 "LIST_SETUP":("Mỗi index thuộc live hay free chain?","Does each index belong to the live or free chain?",["CREATE_NODES","SET_HEAD","LINK_LIVE_CHAIN","SET_FREE_HEAD","LINK_FREE_CHAIN","CHECK_PARTITION"],["node table","live arrows","free arrows","head/free-head","null"],"Phân loại từng slot L/F trước reveal.","Classify every slot L/F before reveal."),
 "LIST_TRAVERSE":("Next thay đổi logical order ra sao?","How does Next determine logical order?",["SET_CURSOR_HEAD","VISIT_NODE","EMIT_DATA","FOLLOW_NEXT","STOP_AT_NULL"],["physical table","cursor","logical path","output prefix"],"Chọn node kế tiếp, không dựa vào row kế.","Choose the next node without using the next row."),
 "LIST_INSERT":("Khi nào free node đổi quyền sở hữu?","When does a free node change ownership?",["CHECK_FULL","SAVE_FREE_NEXT","RESERVE_NODE","WRITE_DATA","SET_NEW_NEXT","LINK_FRONT_OR_TAIL","CHECK_PARTITION"],["live/free chains","new index/object","saved free successor","head/tail"],"Dự đoán link phải lưu trước write.","Predict which link must be saved before the write."),
 "LIST_REMOVE":("Unlink và recycle phải theo thứ tự nào?","In what order must unlink and recycle occur?",["SEARCH_NODE","CLASSIFY_HEAD_OR_INTERIOR","SAVE_SUCCESSOR","UNLINK_LIVE","RECYCLE_NODE","RETURN_RESULT","CHECK_PARTITION"],["previous/current","successor","live chain","free chain","result"],"Chọn field thay đổi cho head/middle/tail.","Choose changed fields for head/middle/tail."),
}
visual_cases={
 "QUEUE_SETUP":("Normal: queue rỗng rồi một item dưới ba conventions.","Normal: empty then one item under three conventions.","Boundary: capacity 1 và full state.","Boundary: capacity 1 and full state.","Failure: trộn circular wrap với linear full.","Failure: mix circular wrap with linear full."),
 "QUEUE_ENQUEUE":("Normal: partial queue commit đúng một item.","Normal: partial queue commits one item.","Boundary: one-free-slot success rồi full failure zero-mutation.","Boundary: one-free-slot success then zero-mutation full failure.","Failure: đảo tail-role update hoặc cập nhật trước guard.","Failure: reverse tail-role update or mutate before guard."),
 "QUEUE_DEQUEUE":("Normal: hai item, trả item FIFO đầu.","Normal: two items return the oldest FIFO item.","Boundary: one item to empty, then empty sentinel.","Boundary: one item to empty, then empty sentinel.","Failure: move head before read hoặc dùng sai sentinel/reset.","Failure: move head before read or use wrong sentinel/reset."),
 "QUEUE_INSPECT":("Normal: nonzero head với nhiều live items.","Normal: non-zero head with multiple live items.","Boundary: one live item và exact spacing.","Boundary: one live item and exact spacing.","Failure: in toàn storage hoặc mutate bằng Dequeue.","Failure: print all storage or mutate via Dequeue."),
 "QUEUE_REDUCE":("Normal: mỗi variant với prefix invariant rõ ràng.","Normal: each variant with an explicit prefix invariant.","Boundary: one item/base case/final run.","Boundary: one item/base case/final run.","Failure: sentinel thành data hoặc wrong mutation mode.","Failure: sentinel becomes data or wrong mutation mode."),
 "LIST_SETUP":("Normal: live/free partition bao phủ capacity.","Normal: live/free partition covers capacity.","Boundary: empty list, one free slot, object HeadNode=None.","Boundary: empty list, one free slot, object HeadNode=None.","Failure: slot trùng/mất hoặc chain có cycle.","Failure: duplicated/lost slot or cyclic chain."),
 "LIST_TRAVERSE":("Normal: logical links nhảy qua physical rows.","Normal: logical links jump across physical rows.","Boundary: empty và one-node tại index 0.","Boundary: empty and one node at index 0.","Failure: cursor+=1 hoặc wrong null check.","Failure: cursor+=1 or wrong null check."),
 "LIST_INSERT":("Normal: front và tail commit sau reserve.","Normal: front and tail commit after reservation.","Boundary: empty, one free node, full.","Boundary: empty, one free node, full.","Failure: overwrite free Next hoặc link sai vị trí.","Failure: overwrite free Next or link at wrong position."),
 "LIST_REMOVE":("Normal: first match ở head/middle/tail.","Normal: first match at head/middle/tail.","Boundary: one-node và absent object case.","Boundary: one-node and absent object case.","Failure: recycle trước unlink tạo lost live suffix.","Failure: recycle before unlink loses the live suffix."),
}
visuals=[]
for p in PATTERNS:
    qvi,qen,events,state,pvi,pen=visual_data[p]; nvi,nen,bvi,ben,fvi,fen=visual_cases[p]
    visuals.append({"visual_brief_id":f"b3.visual.{p.lower().replace('_','-')}","pattern_id":p,
      "method_step_refs":[x["step_id"] for x in methods[p]],"error_refs":errors_by_pattern[p],
      "learning_question":bi(qvi,qen),"visual_mode":"event_driven","state_to_show":state,"proposed_event_types":events,
      "predict_prompt":bi(pvi,pen),"normal_case":bi(nvi,nen),"boundary_case":bi(bvi,ben),"failure_case":bi(fvi,fen),
      "representation_and_convention":applicability[p]["conventions"],
      "static_fallback":bi("Chuỗi snapshot before/event/after kèm bảng invariant và contract.","A before/event/after snapshot strip with invariant and contract table."),
      "accessibility_notes":["Do not rely on colour alone; label live/free, success/failure and arrows in text.","Expose indices/references and event names to screen readers.","Provide keyboard step controls and a textual event log at Stage 7/8."],
      "status":"PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD"})


common={"schema_version":VERSION,"status":"SUBMITTED","batch_id":BATCH,"input_hashes":input_hashes}
dump("PATTERN_CARDS.json",{**common,"pattern_cards":cards,"self_checks":{"pattern_count":len(cards),"pattern_ids":PATTERNS,"assessed_part_pattern_links":sum(len(catalog[p]["assessed_part_ids"]) for p in PATTERNS),"unique_parts":len({x for p in PATTERNS for x in catalog[p]["assessed_part_ids"]}),"official_marking_atoms":sum(len(all_atoms(p)) for p in PATTERNS),"method_steps":sum(len(methods[p]) for p in PATTERNS)}})
dump("VARIANT_INVARIANT_REGISTER.json",{**common,"variants":variants,"self_checks":{"variant_count":len(variants),"patterns_covered":sorted({p for v in variants for p in v["pattern_ids"]})}})
dump("ERROR_PREVENTION.json",{**common,"error_rows":errors,"self_checks":{"row_count":len(errors),"patterns_covered":sorted(errors_by_pattern),"exact_mark_loss_claims":0}})
dump("SOLUTION_DESIGNS.json",{**common,"solution_designs":solutions,"self_checks":{"design_count":len(solutions),"all_statuses":sorted({x["status"] for x in solutions})}})
dump("WORKED_EXAMPLE_SPECS.json",{**common,"worked_example_specs":worked,"self_checks":{"spec_count":len(worked),"one_anchor_per_pattern":True}})
dump("VISUAL_BRIEFS.json",{**common,"visual_briefs":visuals,"self_checks":{"brief_count":len(visuals),"event_driven_count":len(visuals),"one_per_pattern":True}})

source_issue_total=len({i for p in PATTERNS for i in issue_ids(p)})
review=f"""# B3 Queue and linked-list method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review.

## Exact scope

- Patterns: 9/9 — `{', '.join(PATTERNS)}`.
- Stage 2 assessed part-pattern links: {sum(len(catalog[p]['assessed_part_ids']) for p in PATTERNS)}; unique assessed parts: {len({x for p in PATTERNS for x in catalog[p]['assessed_part_ids']})}.
- Official marking atoms joined with exact QP/MS locators and source award semantics: {sum(len(all_atoms(p)) for p in PATTERNS)}.
- Pattern cards: {len(cards)}; method steps: {sum(len(methods[p]) for p in PATTERNS)}; variant registers: {len(variants)}; error rows: {len(errors)}.
- Solution designs, worked-example specs and event-driven visual briefs: {len(solutions)}/{len(worked)}/{len(visuals)}.

## Method decisions

1. Queue cards begin by locking linear/circular, head/tail role, count, empty/full equations and exact result type. Wrap is permitted only by the cited contract; failed Enqueue/Dequeue is non-mutating.
2. Enqueue separates full guard, write, pointer/count transition and exact result. Dequeue saves the FIFO item before moving head, then applies only the cited wrap/reset and sentinel policy. Inspect reads the live range without mutation.
3. Queue reduction preserves each source's destructive/read-only mode, traversal direction and termination signal. Sentinel values never become data; run-length work flushes the final run.
4. Linked-list cards keep array/free-list and object-reference models separate. Traversal follows Next to exact null. Array insertion saves the free node's old Next before overwrite; removal unlinks from the live chain before recycling.
5. Head, middle and tail mutations are explicit. Empty and not-found behaviour remains tied to each source's presence and return contract.

## Source caveats and authority

- {source_issue_total} stable issue IDs join B3: `{', '.join(sorted({i for p in PATTERNS for i in issue_ids(p)}))}`. Every disposition retains canonical source locators and Stage 5 obligations.
- `S21-1DI-FREE` is carried on three 2021 list-insert parts: the source sample is not treated as verified; Stage 5 must independently preserve the old free successor before overwrite.
- `S22-41-3C-DEQUEUE`, `W22-42-3B-SCOPE`, and `W25-43-Q2B-FULL-GUARD` remain source caveats, not silent corrections.
- `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` remains in `source_fidelity_policies` only. It is absent from every `source_issue_refs` list.
- Coursebook references are foundations. Method steps, invariants, checks and repairs are AlgoCore inference/risk unless an exact QP/MS atom is cited. No error row claims a fixed number of marks lost.

## Downstream boundary

- All solution designs are `PENDING_STAGE5_EXECUTION_VERIFICATION`.
- All worked examples are specifications only; no code, trace or final runtime output is claimed.
- All visual briefs are `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`; each pattern has a specific normal, boundary and failure case plus event vocabulary.

## Self-review

The deterministic validator checks exact B3 pattern order, Stage 2 assessed sets, all 60 official source rows, exact 266 atom ownership, locators, award metadata, bilingual method fields, variant coverage, method/error/design joins, source-caveat fidelity, status boundaries and absence of code/run claims. No Lead decision remains open in this submission.

## Input hashes

"""+"\n".join(f"- `{x['path']}` — `{x['sha256']}`" for x in input_hashes)+"\n"
(HERE/"REVIEW.md").write_text(review,encoding="utf-8")

print(f"Built {BATCH}: {len(cards)} cards, {sum(len(methods[p]) for p in PATTERNS)} steps, {len(errors)} errors, {sum(len(all_atoms(p)) for p in PATTERNS)} official atoms")

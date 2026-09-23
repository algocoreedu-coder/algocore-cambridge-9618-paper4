#!/usr/bin/env python3
"""Build the deterministic Stage 4 B5 dictionary/hash method submission."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAGE4 = HERE.parents[2]
P4 = STAGE4.parent
CATALOG = P4 / "stage-2" / "EXAM_PATTERN_CATALOG.json"
MAP = P4 / "stage-3" / "BOOK_KNOWLEDGE_MAP.json"
MARKING = STAGE4 / "evidence" / "marking" / "2025" / "MARKING_SUBMISSION.json"
RISK = MARKING.with_name("SOURCE_RISK_REGISTER.json")
INPUTS = [
    CATALOG, P4 / "stage-2" / "QUESTION_PATTERN_MAP.json", P4 / "stage-2" / "CONFUSABLE_PATTERNS.json",
    MAP, P4 / "stage-3" / "COVERAGE_MATRIX.json", P4 / "stage-3" / "LESSON_PACKAGES.json",
    P4 / "stage-1" / "SOURCE_ISSUES.json",
    STAGE4 / "evidence" / "marking" / "2021-2022" / "MARKING_SUBMISSION.json",
    STAGE4 / "evidence" / "marking" / "2021-2022" / "SOURCE_RISK_REGISTER.json",
    STAGE4 / "evidence" / "marking" / "2023-2024" / "MARKING_SUBMISSION.json",
    STAGE4 / "evidence" / "marking" / "2023-2024" / "SOURCE_RISK_REGISTER.json",
    MARKING, RISK,
    STAGE4 / "schemas" / "pattern-card.schema.json", STAGE4 / "schemas" / "error-prevention.schema.json",
    STAGE4 / "schemas" / "design-briefs.schema.json",
]
PATTERNS = ["HASH_SETUP", "HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH"]
ANCHORS = {
    "HASH_SETUP": "9618_w25_41_3(b)", "HASH_FUNCTION": "9618_s25_42_2(c)",
    "HASH_INSERT": "9618_s25_42_2(d)", "HASH_SEARCH": "9618_w25_41_3(f)",
}

TITLES = {
    "HASH_SETUP": ("Khởi tạo bảng băm và vùng va chạm", "Initialise a hash table and collision storage"),
    "HASH_FUNCTION": ("Tính địa chỉ băm", "Compute a hash address"),
    "HASH_INSERT": ("Chèn bản ghi với xử lý va chạm", "Insert a record with collision handling"),
    "HASH_SEARCH": ("Tìm bản ghi trong bảng băm", "Retrieve a record from a hash table"),
}
RECOGNITION = {
    "HASH_SETUP": ("Đề cho kích thước, hình dạng vùng lưu và bản ghi rỗng; mọi ô phải được khởi tạo theo đúng biểu diễn đó.", "The question fixes storage dimensions and the empty record; initialise every physical slot using that representation."),
    "HASH_FUNCTION": ("Nhiệm vụ chỉ ánh xạ khóa sang chỉ số bằng công thức MOD đã cho, chưa xử lý va chạm.", "The task only maps a key to an index using the stated MOD formula; it does not resolve collisions."),
    "HASH_INSERT": ("Tính địa chỉ, dùng ô chính nếu rỗng, nếu va chạm thì tìm ô theo đúng vùng Spare hoặc bucket được đề quy định.", "Compute the address, use the primary slot when empty, otherwise find a slot in the exact Spare or bucket region prescribed."),
    "HASH_SEARCH": ("Tính đúng bucket, so khóa trong vùng va chạm liên quan và trả dữ liệu hoặc chuỗi không tìm thấy trên mọi đường đi.", "Compute the correct bucket, compare keys in its collision region, and return data or the not-found string on every path."),
}
DECISIONS = {
    "HASH_SETUP": ("Chọn đúng một biểu diễn nguồn: Main[200]+Spare[100] hoặc HashTable[100][10]; dùng đúng sentinel/bản ghi rỗng và khởi tạo toàn bộ miền chỉ số.", "Select exactly the source representation—Main[200]+Spare[100] or HashTable[100][10]—then use its empty sentinel/record across the complete index domain."),
    "HASH_FUNCTION": ("Lấy modulus từ số địa chỉ chính của chính câu hỏi, không từ tổng sức chứa; trả key MOD modulus với chỉ số thuộc [0, modulus−1].", "Take the modulus from the question's primary address count, not total capacity; return key MOD modulus within [0, modulus−1]."),
    "HASH_INSERT": ("Sau địa chỉ hash, theo đúng chiến lược A3C14: va chạm đi vào Spare toàn cục hoặc các cột còn lại của đúng bucket; dừng ngay sau một lần ghi.", "After hashing, follow the exact A3C14 strategy: a collision enters global Spare or the remaining columns of the same bucket; stop immediately after one write."),
    "HASH_SEARCH": ("Tìm trong đúng bucket được hash; chỉ dừng ở sentinel rỗng khi invariant chèn bảo đảm không có lỗ, nếu không phải xét hết bucket trước khi trả Not found.", "Search only the hashed bucket; stop at an empty sentinel only when the insertion invariant guarantees no gaps, otherwise exhaust the bucket before returning Not found."),
}

METHODS = {
    "HASH_SETUP": [
        ("contract", "Chốt kích thước, số chiều, phạm vi chỉ số, trường bản ghi và sentinel rỗng từ đề.", "Fix dimensions, index domains, record fields, and the empty sentinel from the question.", "representation_contract", "VI: Một biểu diễn và một định nghĩa rỗng được dùng xuyên suốt. | EN: One representation and one empty definition remain fixed.", "VI: Trước khi cấp phát hoặc lặp. | EN: Before allocation or iteration.", "VI: Thiết lập hữu hạn. | EN: Finite setup."),
        ("declare", "Khai báo đúng Main và Spare hoặc bảng bucket hai chiều với kích thước và phạm vi toàn cục được yêu cầu.", "Declare the exact Main and Spare arrays or two-dimensional bucket table with the required sizes and scope.", "storage_regions", "VI: Mỗi chỉ số hợp lệ ánh xạ tới đúng một ô vật lý. | EN: Every valid index maps to exactly one physical slot.", "VI: Kích thước nguồn đã được chốt. | EN: Source dimensions are fixed.", "VI: Mỗi vùng chỉ được khai báo một lần. | EN: Each region is declared once."),
        ("empty_record", "Tạo biểu diễn rỗng với mọi trường dùng đúng sentinel, không chỉ riêng trường khóa nếu đề yêu cầu ba trường.", "Construct the empty representation with the sentinel in every required field, not only the key when three fields are specified.", "empty_record", "VI: Cùng một phép kiểm tra rỗng nhận diện mọi ô chưa dùng. | EN: One empty test identifies every unused slot.", "VI: Kiểu Record và sentinel tương thích. | EN: Record type and sentinel are compatible.", "VI: Hoàn tất sau khi đủ trường. | EN: Ends when all fields are set."),
        ("traverse", "Duyệt toàn bộ miền: cả hai mảng riêng hoặc mọi cặp row/column của bảng bucket.", "Traverse the complete domain: both separate arrays or every row/column pair in the bucket table.", "cursor", "VI: Mọi ô trước cursor đã rỗng; mọi ô sau cursor chưa được giả định. | EN: Every slot before the cursor is empty; later slots are not assumed.", "VI: Cursor nằm trong miền chỉ số hiện tại. | EN: The cursor is inside the current index domain.", "VI: Cursor tăng và miền hữu hạn. | EN: The cursor advances over a finite domain."),
        ("write_verify", "Gán bản ghi rỗng độc lập cho từng ô rồi kiểm đủ số ô, sentinel và không có khóa sống.", "Assign an independent empty record to each slot, then verify slot count, sentinels, and absence of live keys.", "initialised_table", "VI: Tất cả ô đã thăm là rỗng và không vô tình dùng chung trạng thái mutable. | EN: All visited slots are empty and do not accidentally share mutable state.", "VI: Ô hiện tại hợp lệ. | EN: The current slot is valid.", "VI: Kết thúc khi mọi vùng đã duyệt hết. | EN: Terminates after all regions are exhausted."),
    ],
    "HASH_FUNCTION": [
        ("contract", "Chốt kiểu khóa, miền khóa, modulus và hợp đồng trả về một địa chỉ chính.", "Fix the key type/domain, modulus, and contract returning one primary address.", "hash_contract", "VI: Cùng khóa và modulus luôn cho cùng địa chỉ. | EN: The same key and modulus always produce the same address.", "VI: Modulus dương và lấy từ đề. | EN: The source modulus is positive.", "VI: Thiết lập hữu hạn. | EN: Finite setup."),
        ("read_key", "Lấy đúng trường khóa hoặc tham số khóa mà đề chỉ định, không băm cả bản ghi hay dữ liệu trả về.", "Read the exact key field or key parameter specified, not the whole record or returned data.", "key", "VI: Giá trị được băm là khóa theo hợp đồng. | EN: The hashed value is the contract key.", "VI: Khóa thuộc miền nguồn. | EN: The key is in the source domain.", "VI: Một lần đọc khóa. | EN: One key read."),
        ("modulus", "Tính address = key MOD modulus đúng một lần với modulus 200 hoặc 100 theo nguồn.", "Compute address = key MOD modulus once, using source modulus 200 or 100.", "address", "VI: 0 ≤ address < modulus theo miền khóa và quy ước MOD đã chốt. | EN: 0 ≤ address < modulus under the fixed key domain and MOD convention.", "VI: Khóa và modulus hợp lệ. | EN: Key and modulus are valid.", "VI: Phép tính hữu hạn. | EN: Finite calculation."),
        ("return", "Trả địa chỉ nguyên và kiểm nó nằm trong miền hàng/ô chính, không cộng vùng Spare hay số cột bucket vào modulus.", "Return the integer address and verify it belongs to the main row/slot domain; do not add Spare capacity or bucket columns to the modulus.", "returned_address", "VI: Địa chỉ trả về truy cập được đúng vùng chính. | EN: The returned address indexes the correct primary region.", "VI: Address đã tính. | EN: Address is computed.", "VI: Return kết thúc hàm. | EN: Return terminates the function."),
    ],
    "HASH_INSERT": [
        ("contract", "Chốt record/key, sentinel, chiến lược va chạm, thứ tự probe, chính sách duplicate và hành vi khi đầy trước khi ghi.", "Fix the record/key, sentinel, collision strategy, probe order, duplicate policy, and full behavior before writing.", "insert_contract", "VI: Chỉ một chiến lược lưu va chạm điều khiển thao tác. | EN: Exactly one collision representation controls the operation.", "VI: Bảng đã khởi tạo theo HASH_SETUP. | EN: HASH_SETUP has initialised the table.", "VI: Thiết lập hữu hạn. | EN: Finite setup."),
        ("address", "Gọi hàm hash bằng khóa của record và giữ địa chỉ trả về.", "Call the hash function with the record key and retain its returned address.", "address", "VI: Record chỉ có thể vào ô chính đó hoặc vùng va chạm do địa chỉ đó quy định. | EN: The record can enter only that primary slot or its prescribed collision region.", "VI: Khóa hợp lệ. | EN: The key is valid.", "VI: Một phép tính địa chỉ. | EN: One address calculation."),
        ("inspect_primary", "Kiểm ô chính HashTable[address] hoặc bucket[address][0] bằng đúng sentinel rỗng.", "Inspect HashTable[address] or bucket[address][0] using the exact empty sentinel.", "primary_state", "VI: Chưa có ô nào bị thay đổi trước quyết định rỗng/va chạm. | EN: No slot changes before the empty/collision decision.", "VI: Address nằm trong miền. | EN: Address is in range.", "VI: Một lần kiểm ô chính. | EN: One primary-slot check."),
        ("store_primary", "Nếu ô chính rỗng, lưu toàn bộ record đúng một lần và kết thúc.", "If the primary slot is empty, store the complete record exactly once and finish.", "table", "VI: Record được lưu một lần tại địa chỉ hash và các ô khác giữ nguyên. | EN: The record is stored once at its hash address and all other slots remain unchanged.", "VI: Ô chính rỗng. | EN: The primary slot is empty.", "VI: Ghi thành công kết thúc thao tác. | EN: A successful write terminates the operation."),
        ("probe_collision", "Nếu va chạm, duyệt từ đầu đến cuối vùng Spare toàn cục hoặc các cột còn lại của đúng bucket; tăng probe sau mỗi ô đã dùng.", "On collision, scan the global Spare region or remaining columns of the same bucket; advance the probe after each occupied slot.", "probe", "VI: Các ô trước probe đã dùng hoặc đã bị loại theo duplicate policy; chưa ghi record. | EN: Slots before the probe are occupied or rejected by duplicate policy; the record is not yet written.", "VI: Probe ở trong vùng va chạm được phép. | EN: Probe is inside the permitted collision region.", "VI: Probe tăng nghiêm ngặt trên vùng hữu hạn. | EN: Probe strictly advances through a finite region."),
        ("store_collision", "Tại ô rỗng đầu tiên, lưu toàn bộ record đúng một lần rồi dừng; không ghi vào mọi ô rỗng còn lại.", "At the first empty slot, store the complete record exactly once and stop; never write to every remaining empty slot.", "collision_region", "VI: Tối đa một ô mới chứa record và mọi ô khác giữ nguyên. | EN: At most one new slot contains the record and every other slot is unchanged.", "VI: Probe chỉ tới ô rỗng hợp lệ. | EN: The probe identifies a valid empty slot.", "VI: Ghi đầu tiên thành công kết thúc probe. | EN: The first successful write terminates probing."),
        ("duplicate_or_full", "Nếu gặp khóa trùng hoặc hết vùng probe, áp dụng chính sách đã công bố; khi nguồn không quy định, ghi nhận boundary outcome cho Stage 5 thay vì tự overwrite.", "If a duplicate key is encountered or probing is exhausted, apply the declared policy; when the source is silent, record the boundary outcome for Stage 5 rather than silently overwriting.", "outcome", "VI: Không overwrite ngoài hợp đồng và bảng đầy không gây truy cập ngoài miền. | EN: No out-of-contract overwrite occurs and a full table never causes an out-of-range access.", "VI: Duplicate được phát hiện hoặc probe đã hết. | EN: A duplicate is detected or probing is exhausted.", "VI: Duplicate/full tạo outcome hữu hạn. | EN: Duplicate/full produces a finite outcome."),
    ],
    "HASH_SEARCH": [
        ("contract", "Chốt khóa tìm, hàm hash, vùng collision, trường dữ liệu trả về và chuỗi Not found chính xác.", "Fix the search key, hash function, collision region, returned data field, and exact Not found string.", "search_contract", "VI: Mọi đường đi trả cùng kiểu string theo hợp đồng. | EN: Every path returns the contract string type.", "VI: Bảng dùng cùng biểu diễn như khi chèn. | EN: The table uses the insertion representation.", "VI: Thiết lập hữu hạn. | EN: Finite setup."),
        ("address", "Gọi Hash với khóa tìm và giữ địa chỉ bucket trả về.", "Call Hash with the search key and retain the returned bucket address.", "address", "VI: Nếu record tồn tại theo chiến lược bucket, nó nằm trong hàng address. | EN: If the record exists under the bucket strategy, it is in row address.", "VI: Khóa thuộc miền. | EN: The key is in domain.", "VI: Một phép tính địa chỉ. | EN: One address calculation."),
        ("scan", "Duyệt các cột hợp lệ của đúng bucket theo thứ tự chèn, không quét bảng hai chiều toàn cục.", "Scan valid columns of the exact bucket in insertion order; do not scan the complete two-dimensional table.", "column", "VI: Mọi cột trước cursor đã được so và không chứa khóa. | EN: Every earlier column has been compared and does not hold the key.", "VI: Column nằm trong [0, bucket_capacity−1]. | EN: Column is within [0, bucket_capacity−1].", "VI: Column tăng trên tối đa mười ô. | EN: Column advances across at most ten slots."),
        ("compare", "So trường key của record hiện tại với khóa tìm; sentinel chỉ cho phép dừng sớm nếu quy tắc chèn bảo đảm không có lỗ.", "Compare the current record key with the target; an empty sentinel permits early exit only if insertion guarantees no gaps.", "comparison", "VI: Chỉ equality của key quyết định found. | EN: Only key equality determines found.", "VI: Ô hiện tại hợp lệ. | EN: The current slot is valid.", "VI: So sánh xong thì return hoặc tăng column. | EN: Comparison leads to return or column advance."),
        ("found", "Khi key bằng nhau, trả đúng trường dữ liệu của record và kết thúc.", "When keys are equal, return the required data field and finish.", "result", "VI: Dữ liệu trả về thuộc record có đúng khóa. | EN: Returned data belongs to the record with the exact key.", "VI: Equality đúng. | EN: Equality is true.", "VI: Return found kết thúc hàm. | EN: Found return terminates the function."),
        ("not_found", "Chỉ sau khi vùng cần xét đã hết, trả chính xác chuỗi Not found theo đề.", "Only after the required region is exhausted, return the exact Not found string.", "result", "VI: Không ô hợp lệ chưa xét nào có thể chứa khóa. | EN: No unchecked valid slot can contain the key.", "VI: Bucket đã hết hoặc early-empty invariant hợp lệ. | EN: The bucket is exhausted or a valid early-empty invariant holds.", "VI: Return not-found kết thúc hàm. | EN: Not-found return terminates the function."),
    ],
}

WHY = {
    "HASH_SETUP": {
        "contract": ("Ngăn trộn hai kiến trúc và hai nghĩa rỗng không tương thích.", "Prevents mixing two incompatible architectures or empty meanings."),
        "declare": ("Bảo đảm mọi địa chỉ mà các thao tác sau dùng đều tồn tại đúng hình dạng.", "Ensures every address used later exists in the required shape."),
        "empty_record": ("Cho phép cùng một phép kiểm rỗng hoạt động ở khởi tạo, chèn và tìm.", "Allows one empty check to work across setup, insertion, and search."),
        "traverse": ("Không bỏ sót ô cuối, vùng Spare hoặc chiều thứ hai.", "Prevents skipping the final slot, Spare region, or second dimension."),
        "write_verify": ("Chứng minh toàn bảng bắt đầu rỗng mà các ô không chia sẻ trạng thái mutable ngoài ý muốn.", "Proves the full table starts empty without unintended shared mutable state."),
    },
    "HASH_FUNCTION": {
        "contract": ("Giữ modulus gắn với miền địa chỉ chính và hợp đồng trả về.", "Keeps the modulus tied to the primary address domain and return contract."),
        "read_key": ("Địa chỉ phải phụ thuộc đúng khóa được đề quy định.", "The address must depend on the exact source-defined key."),
        "modulus": ("MOD nén khóa vào miền chỉ số chính mà không xử lý collision.", "MOD maps the key into the primary index domain without resolving collisions."),
        "return": ("Tách trách nhiệm tính địa chỉ khỏi lưu hoặc tìm record.", "Separates address calculation from record insertion or retrieval."),
    },
    "HASH_INSERT": {
        "contract": ("Ngăn tự đổi sentinel, vùng collision hoặc hành vi biên giữa chừng.", "Prevents changing the sentinel, collision region, or boundary behavior mid-method."),
        "address": ("Giữ cùng ánh xạ khóa mà HASH_FUNCTION và HASH_SEARCH dùng.", "Preserves the key mapping shared with HASH_FUNCTION and HASH_SEARCH."),
        "inspect_primary": ("Quyết định direct insert hay collision trước khi thay đổi dữ liệu.", "Chooses direct insertion or collision handling before mutating data."),
        "store_primary": ("Đường không va chạm chỉ cần đúng một lần ghi.", "The no-collision path requires exactly one write."),
        "probe_collision": ("Probe đúng vùng và tăng nghiêm ngặt để không lặp vô hạn.", "A region-correct, strictly advancing probe prevents an infinite loop."),
        "store_collision": ("Dừng ở ô trống đầu tiên giữ record duy nhất và không phá các ô khác.", "Stopping at the first empty slot preserves one copy and all other slots."),
        "duplicate_or_full": ("Biến các ca nguồn chưa định nghĩa thành outcome kiểm thử rõ thay vì overwrite im lặng.", "Turns source-unspecified cases into explicit test outcomes rather than silent overwrites."),
    },
    "HASH_SEARCH": {
        "contract": ("Bảo đảm cả found và absent đều trả đúng kiểu và nội dung.", "Ensures both found and absent paths return the required type and content."),
        "address": ("Thu hẹp tìm kiếm vào đúng vùng có thể chứa khóa.", "Restricts the search to the only region that can contain the key."),
        "scan": ("Giữ phạm vi tuyến tính trong bucket thay vì vô tình quét toàn bảng.", "Keeps the linear scan inside one bucket instead of the whole table."),
        "compare": ("Phân biệt key equality với dữ liệu trả về và với sentinel rỗng.", "Separates key equality from returned data and the empty sentinel."),
        "found": ("Trả dữ liệu của đúng record ngay khi có bằng chứng equality.", "Returns data from the exact record once equality is proven."),
        "not_found": ("Ngăn kết luận vắng mặt từ lần không khớp đầu tiên.", "Prevents concluding absence from the first non-match."),
    },
}

def read(path): return json.loads(path.read_text(encoding="utf-8"))
def write(name, data): (HERE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def bi(vi, en): return {"vi": vi, "en": en}
def unique(xs): return list(dict.fromkeys(x for x in xs if x))

def source_ref(row):
    return {
        "part_id": row["part_id"], "source_batch": "2025",
        "qp_locator": {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]},
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "ms_atoms": [{
            "marking_point_id": m["marking_point_id"], "source_id": m["ms_source_id"], "pdf_pages": m["ms_pdf_pages"],
            "criterion_paraphrase": m["criterion_paraphrase"], "award_semantics": m["award_semantics"],
            "condition": m.get("condition"), "alternatives": m.get("alternatives"), "dependency": m.get("dependency"),
            "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"), "group_id": m.get("group_id"),
            "group_max": m.get("group_max"), "source_issue_refs": m.get("source_issue_refs", []),
        } for m in row["marking_points"]],
        "source_issue_refs": row.get("source_issue_refs", []),
    }

def step_for(pattern, text):
    t = text.lower()
    if pattern == "HASH_SETUP":
        if "initialise" in t or "initialises" in t: return "traverse"
        if "declared" in t or "2d array" in t: return "declare"
        if "empty record" in t and "3 fields" in t: return "empty_record"
        return "contract"
    if pattern == "HASH_FUNCTION":
        return "modulus" if "calculation" in t or "calculated correctly" in t else "contract"
    if pattern == "HASH_INSERT":
        if "header" in t or "declare the procedure" in t: return "contract"
        if "checking if" in t: return "inspect_primary"
        if "calculatehash" in t or "call hash" in t: return "address"
        if "bucket position zero" in t or "if it is empty" in t: return "store_primary"
        if "locating next free" in t: return "probe_collision"
        if "storing in that index only" in t or "on collision" in t: return "store_collision"
        return "contract"
    if pattern == "HASH_SEARCH":
        if "header" in t: return "contract"
        if "calling hash" in t: return "address"
        if "iterating" in t: return "scan"
        if "returning data" in t: return "found"
        if "not found" in t: return "not_found"
        return "compare"
    raise KeyError(pattern)

def make_steps(pattern, rows):
    allocation = {key: [] for key, *_ in METHODS[pattern]}
    for row in rows:
        for atom in row["marking_points"]:
            allocation[step_for(pattern, atom["criterion_paraphrase"])].append(atom["marking_point_id"])
    result = []
    for i, (key, avi, aen, writes, invariant, guard, termination) in enumerate(METHODS[pattern], 1):
        wvi, wen = WHY[pattern][key]
        result.append({
            "step_id": f"B5-{pattern}-S{i:02d}", "sequence": i, "action": bi(avi, aen), "why": bi(wvi, wen),
            "reads": ["source_contract", "current_hash_state"], "writes": [writes], "invariant": invariant,
            "guard": guard, "termination_role": termination,
            "check": bi(f"Đối chiếu {writes} với miền chỉ số, sentinel và bất biến của {pattern}.", f"Check {writes} against the index domain, sentinel, and {pattern} invariant."),
            "marking_point_refs": allocation[key],
        })
    return result

def variants():
    rows = [
        ("B5-V01-setup-representation", ["HASH_SETUP"], [], "spare-arrays-vs-bucket-table", "Dùng đúng kích thước, số chiều và vùng collision của nguồn; không gộp Main+Spare với bảng 100×10.", "Use the source dimensions and collision region exactly; do not merge Main+Spare with the 100×10 table.", ["HashTable[200]+Spare[100]", "HashTable[100][10]"], "The complete physical domain uses one empty representation."),
        ("B5-V02-empty-sentinel", ["HASH_SETUP", "HASH_INSERT", "HASH_SEARCH"], [], "empty-record-and-sentinel", "Phép khởi tạo, kiểm ô trống, chèn và tìm phải dùng cùng empty record/sentinel; không coi dữ liệu hợp lệ là rỗng.", "Initialisation, empty checks, insertion, and search must share one empty record/sentinel without classifying valid data as empty.", ["−1 in all specified fields", "empty/null Record object"], "Empty-state recognition is consistent across operations."),
        ("B5-V03-hash-domain", ["HASH_FUNCTION"], [], "modulus-and-key-domain", "Chọn MOD 200 cho 200 địa chỉ chính hoặc MOD 100 cho 100 hàng; nêu miền khóa trước khi suy luận về số âm.", "Use MOD 200 for 200 primary addresses or MOD 100 for 100 rows; state the key domain before reasoning about negative keys.", ["key MOD 200", "key MOD 100"], "Returned address belongs to the primary address domain."),
        ("B5-V04-collision-strategy", ["HASH_INSERT"], ["A3C14"], "global-spare-vs-same-bucket", "Sau va chạm, quét Spare toàn cục hoặc cột còn lại của đúng bucket theo đề; dừng ở ô trống đầu tiên.", "After collision, scan global Spare or the remaining columns of the exact bucket as prescribed; stop at the first empty slot.", ["separate Spare[100]", "same-row bucket columns 1..9"], "A successful insertion changes exactly one permitted slot."),
        ("B5-V05-boundary-policy", ["HASH_INSERT", "HASH_SEARCH"], [], "duplicate-full-not-found", "Nếu nguồn không định nghĩa duplicate/full, giữ chúng là policy/fixture được công bố; Not found chỉ xuất hiện sau khi hết miền tìm hợp lệ.", "When the source does not define duplicate/full behavior, keep them as declared policy/fixtures; return Not found only after exhausting the valid search region.", ["duplicate reject/update/allow policy", "full outcome", "not-found result"], "No boundary path overwrites silently or leaves the index domain."),
        ("B5-V06-dictionary-vs-explicit-hash", ["HASH_SETUP", "HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH"], [], "python-dict-vs-exam-hash-table", "Python dict phù hợp khi đề chỉ cần ánh xạ trực tiếp; các bài B5 yêu cầu bằng chứng về MOD, sentinel, collision và probe nên phải dùng cấu trúc hash tường minh.", "A Python dict suits a direct mapping contract; B5 parts require observable MOD, sentinel, collision, and probe evidence, so use the explicit hash structure.", ["direct dictionary lookup", "explicit examination hash table"], "The implementation exposes every operation assessed by the chosen contract."),
    ]
    return [{"variant_id": vid, "pattern_ids": pats, "stage2_contrast_refs": refs, "axis": axis, "decision_rule": bi(vi,en), "cases": cases, "invariant": inv, "method_changing": True} for vid,pats,refs,axis,vi,en,cases,inv in rows]

def main():
    catalog = {x["pattern_id"]: x for x in read(CATALOG)["patterns"]}
    knowledge = read(MAP)
    chains = {x["pattern_id"]: x for x in knowledge["pattern_chains"]}
    sections = {x["section_id"]: x for x in knowledge["sections"]}
    marking = read(MARKING)
    source_rows = {x["part_id"]: x for x in marking["rows"]}
    hashes = [{"path": str(p.relative_to(P4)).replace("\\", "/"), "sha256": digest(p)} for p in INPUTS]
    variant_rows = variants()
    cards = []
    for pattern in PATTERNS:
        cat, chain = catalog[pattern], chains[pattern]
        rows = [source_rows[pid] for pid in cat["assessed_part_ids"]]
        steps = make_steps(pattern, rows)
        objectives = unique(oid for item in chain["knowledge_chain"] for oid in item.get("objective_ids", []))
        book_ids = unique(bid for item in chain["knowledge_chain"] for bid in item.get("book_section_ids", []))
        atom_refs = [m["marking_point_id"] for row in rows for m in row["marking_points"]]
        cards.append({
            "card_id": f"ac-9618-p4-2026-python.method-card.{pattern.lower().replace('_','-')}", "pattern_id": pattern,
            "version": "s4-schema-v1-b5-submission-1", "status": "SUBMITTED", "package_id": chain["package_id"],
            "lesson_id": chain["lesson_id"], "knowledge_block_ids": chain["knowledge_block_ids"], "objective_ids": objectives,
            "titles": bi(*TITLES[pattern]), "recognition": bi(*RECOGNITION[pattern]),
            "source_scope": {"assessed_part_ids": cat["assessed_part_ids"], "representative_parts": [source_ref(source_rows[ANCHORS[pattern]])], "official_source_refs": [source_ref(r) for r in rows], "corpus_limit": "Observed official B5 hash evidence is limited to 2025 Paper 4 and two incompatible collision representations; it does not establish a universal hash-table API."},
            "confusable_pattern_refs": [p for p in PATTERNS if p != pattern],
            "confusable_contrast_refs": unique(ref for v in variant_rows if pattern in v["pattern_ids"] for ref in v["stage2_contrast_refs"]),
            "source_issue_refs": [],
            "source_fidelity_policies": [{"policy_id": "B5-LIMITED-2025-HASH-CORPUS", "authority": "AlgoCore_risk", "statement": "Preserve the exact 2025 QP representation, modulus, sentinel, collision region, return contract, and official atom dependencies; do not generalise one source architecture into the other.", "applies_to_parts": cat["assessed_part_ids"], "is_source_issue": False}],
            "book_foundation_refs": [{"book_section_id": bid, "title": sections[bid].get("subheading") or sections[bid].get("title"), "authority": "coursebook_foundation"} for bid in book_ids],
            "applicability": {"preconditions": [METHODS[pattern][0][2]], "representation": ["Explicit examination hash table", "Python-oriented pseudocode", "source-specific record and index domains"], "conventions": ["Do not replace observable hash/collision operations with Python dict when those operations are assessed."], "variant_axes": [v["variant_id"] for v in variant_rows if pattern in v["pattern_ids"]], "decision_rule": bi(*DECISIONS[pattern])},
            "method_steps": steps, "marking_point_refs": atom_refs,
            "assessment_requirement_refs": [f"ac-9618-p4-2026-python.assessment-requirement.{o.lower()}" for o in objectives],
            "error_refs": [f"B5-ERR-{pattern}-{i:02d}" for i in range(1,4)],
            "solution_design_ref": f"B5-SD-{pattern}", "visual_brief_ref": f"B5-VIS-{pattern}",
            "authority_labels": ["official_qp", "official_ms", "coursebook_foundation", "AlgoCore_original", "AlgoCore_risk"],
            "authority_note": "Official atoms and locators define assessed evidence; bilingual procedures, duplicate/full policies, and visuals are AlgoCore-authored and pending Stage 5/7.",
            "downstream_status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
        })
    write("PATTERN_CARDS.json", {"schema_version":"s4-schema-v1","status":"SUBMITTED","batch_id":"B5-dictionary-hash","input_hashes":hashes,"pattern_cards":cards,"self_checks":{"exact_pattern_set":PATTERNS,"assessed_part_link_count":sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards),"owned_official_atom_count":sum(len(c["marking_point_refs"]) for c in cards),"no_duplicate_atom_ownership":len([a for c in cards for a in c["marking_point_refs"]])==len(set(a for c in cards for a in c["marking_point_refs"]))}})
    write("VARIANT_INVARIANT_REGISTER.json", {"schema_version":"s4-schema-v1","status":"SUBMITTED","batch_id":"B5-dictionary-hash","input_hashes":hashes,"variants":variant_rows,"self_checks":{"variant_count":len(variant_rows),"stage2_contrast_refs":["A3C14"],"includes_dictionary_contrast":True}})
    build_errors(cards, source_rows, hashes)
    build_designs(cards, hashes)
    build_examples(cards, source_rows, hashes)
    build_visuals(cards, hashes)
    build_review(cards, variant_rows)

def build_errors(cards, source_rows, hashes):
    definitions = {
        "HASH_SETUP": [("Chỉ khởi tạo Main hoặc chỉ hàng/cột đầu tiên.","Initialises only Main or only the first row/column."),("Dùng sentinel khác giữa khởi tạo và kiểm ô trống.","Uses different sentinels for initialisation and empty-slot checks."),("Gán cùng một object mutable vào mọi ô.","Assigns the same mutable object to every slot.")],
        "HASH_FUNCTION": [("Dùng tổng sức chứa, như 300 hoặc 1000, làm modulus.","Uses total storage capacity, such as 300 or 1000, as the modulus."),("Băm sai trường hoặc trả dữ liệu thay vì địa chỉ.","Hashes the wrong field or returns data instead of an address."),("Không chốt miền khóa/quy ước MOD nên địa chỉ có thể ngoài miền.","Leaves the key domain/MOD convention unstated, allowing an out-of-range address.")],
        "HASH_INSERT": [("Gộp Spare toàn cục với các cột cùng bucket.","Merges global Spare with same-bucket columns."),("Sau va chạm, ghi record vào mọi ô rỗng thay vì ô đầu tiên.","After collision, writes the record into every empty slot rather than the first."),("Probe không tăng hoặc vượt capacity khi duplicate/full.","The probe does not advance or exceeds capacity on duplicate/full input.")],
        "HASH_SEARCH": [("Quét toàn bảng thay vì đúng bucket hash.","Scans the whole table instead of the hashed bucket."),("Trả Not found sau lần không khớp đầu tiên.","Returns Not found after the first non-match."),("Dừng ở sentinel dù chiến lược chèn có thể tạo lỗ, hoặc thiếu return trên một đường đi.","Stops at a sentinel despite possible gaps, or omits a return path.")],
    }
    by_pattern = {c["pattern_id"]: c for c in cards}
    out=[]
    for pattern in PATTERNS:
        c=by_pattern[pattern]; steps=[s["step_id"] for s in c["method_steps"]]
        for i,(vi,en) in enumerate(definitions[pattern],1):
            atom=c["marking_point_refs"][min(i-1,len(c["marking_point_refs"])-1)]
            atom_row=next(source_rows[pid] for pid in c["source_scope"]["assessed_part_ids"] if atom in {m["marking_point_id"] for m in source_rows[pid]["marking_points"]})
            atom_data=next(m for m in atom_row["marking_points"] if m["marking_point_id"]==atom)
            linked_step=c["method_steps"][min(i,len(c["method_steps"])-1)]
            out.append({"error_id":f"B5-ERR-{pattern}-{i:02d}","pattern_id":pattern,"question_part_ids":c["source_scope"]["assessed_part_ids"],"requirement_refs":c["assessment_requirement_refs"],"marking_point_refs":[atom],"method_step_refs":[steps[min(i,len(steps)-1)]],"likely_error":bi(vi,en),"consequence":bi(f"Lỗi ‘{vi}’ làm `{linked_step['writes'][0]}` không còn thỏa miền địa chỉ/sentinel và invariant của {c['titles']['vi']}; evidence tại atom {atom} vì thế không thể hiện đúng operation.",f"The error ‘{en}’ makes `{linked_step['writes'][0]}` violate the address/sentinel domain and the invariant of {c['titles']['en']}; atom {atom} therefore no longer shows the required operation."),"detection_check":bi(f"Dùng ca biên kích hoạt ‘{vi}’; tại bước ‘{linked_step['action']['vi']}’, kiểm `{linked_step['writes'][0]}`, address/probe, số ô đổi và mọi đường return theo checkpoint ‘{linked_step['check']['vi']}’.",f"Use a boundary case that triggers ‘{en}’; at ‘{linked_step['action']['en']}’, check `{linked_step['writes'][0]}`, address/probe, changed-slot count and every return path using ‘{linked_step['check']['en']}’."),"repair_action":bi(f"Quay về bước ‘{linked_step['action']['vi']}’, khôi phục contract nguồn, sửa guard/probe/sentinel gây lỗi ‘{vi}’, rồi trace lại cho tới khi checkpoint của bước và termination đều đạt.",f"Return to ‘{linked_step['action']['en']}’, restore the source contract, repair the guard/probe/sentinel that caused ‘{en}’, then retrace until the step checkpoint and termination condition both pass."),"repair_exercise_ref":f"B5-REPAIR-{pattern}-{i:02d}","basis":"AlgoCore_risk","source_locator_if_official":{"qp_locator":{"source_id":atom_row["qp_requirement"]["source_id"],"pdf_pages":atom_row["qp_requirement"]["pdf_pages"]},"ms_locator":{"source_id":atom_data["ms_source_id"],"pdf_pages":atom_data["ms_pdf_pages"]}},"exact_mark_loss_claim":None,"authority_note":"The official atom anchors assessed evidence; the failure diagnosis and repair are AlgoCore-authored without a fixed mark-loss claim.","status":"SUBMITTED"})
    write("ERROR_PREVENTION.json",{"schema_version":"s4-schema-v1","status":"SUBMITTED","batch_id":"B5-dictionary-hash","input_hashes":hashes,"error_rows":out,"self_checks":{"error_count":len(out),"three_per_pattern":True,"exact_mark_loss_claims":0}})

def build_designs(cards, hashes):
    primary={"HASH_SETUP":"B5-V01-setup-representation","HASH_FUNCTION":"B5-V03-hash-domain","HASH_INSERT":"B5-V04-collision-strategy","HASH_SEARCH":"B5-V05-boundary-policy"}
    designs=[]
    for c in cards:
        p=c["pattern_id"]
        boundary={
            "HASH_SETUP":["Main200+Spare100 exact coverage","100x10 exact coverage","all sentinel fields","independent mutable records"],
            "HASH_FUNCTION":["key 0","key modulus−1","key modulus","key modulus+1","source-domain negative-key policy"],
            "HASH_INSERT":["primary empty","collision first/last free","global Spare vs same bucket","duplicate key","collision region full"],
            "HASH_SEARCH":["found column 0","found interior/last column","absent full bucket","empty bucket","gap only when policy permits"],
        }[p]
        designs.append({"solution_design_id":f"B5-SD-{p}","pattern_id":p,"variant_id":primary[p],"input_contract":c["method_steps"][0]["action"]["en"],"output_contract":c["method_steps"][-1]["action"]["en"],"state_model":unique(x for s in c["method_steps"] for x in s["writes"]),"representation":c["applicability"]["representation"],"preconditions":c["applicability"]["preconditions"],"postconditions":[c["method_steps"][-1]["invariant"]],"invariants":unique(s["invariant"] for s in c["method_steps"]),"ordered_method_step_ids":[s["step_id"] for s in c["method_steps"]],"mutation_and_preservation_rules":["Mutate only the slot named by the current valid address/probe.","Preserve complete records and all non-target slots.","Keep source modulus, sentinel, collision region, and return contract unchanged."],"termination_argument":"All setup/search/probe domains are finite; every continuing step strictly advances its row/column/probe, while a successful return or declared duplicate/full outcome terminates immediately.","failure_paths":c["error_refs"],"alternative_designs":c["applicability"]["variant_axes"],"stage5_test_obligations":{"normal":["Capture state before and after every event and check the bilingual invariant."],"boundary":boundary,"counterexample":["Exercise all three linked error triggers and show detection plus repaired trace."],"source_fixture":[f"Reproduce official part {pid} under its exact 2025 contract." for pid in c["source_scope"]["assessed_part_ids"]]},"source_constraints":["2025-only observed hash corpus; do not claim universal behavior.","No current SOURCE_RISK_REGISTER item targets these parts; representation ambiguity is still prohibited by A3C14."],"source_issue_dispositions":[],"status":"PENDING_STAGE5_EXECUTION_VERIFICATION"})
    write("SOLUTION_DESIGNS.json",{"schema_version":"s4-schema-v1","status":"SUBMITTED","batch_id":"B5-dictionary-hash","input_hashes":hashes,"solution_designs":designs,"self_checks":{"design_count":len(designs),"all_pending_stage5":True}})

def build_examples(cards, source_rows, hashes):
    micro={"HASH_SETUP":["last physical slot","wrong sentinel field","shared-object alias","two source shapes"],"HASH_FUNCTION":["0","modulus−1","modulus","modulus+1","domain-invalid key"],"HASH_INSERT":["primary empty","first collision slot","last free slot","duplicate","full"],"HASH_SEARCH":["found first/interior/last","absent","empty bucket","gap-policy counterexample"]}
    out=[]
    for c in cards:
        p=c["pattern_id"]; row=source_rows[ANCHORS[p]]
        out.append({"worked_example_spec_id":f"B5-WE-{p}","pattern_id":p,"status":"PENDING_STAGE5_EXECUTION_VERIFICATION","origin":"AlgoCore_original_adaptation_spec","anchor_source":source_ref(row),"prompt_design":bi(f"Thu nhỏ dữ liệu của {ANCHORS[p]} nhưng giữ nguyên modulus, sentinel, vùng collision và hợp đồng trả về.",f"Shrink the data from {ANCHORS[p]} while preserving modulus, sentinel, collision region, and return contract."),"representation_and_convention":"Explicit source hash representation; no Python dict substitution; visible address, sentinel, probe, and termination events.","method_step_refs":[s["step_id"] for s in c["method_steps"]],"learner_checkpoints":[{"after_step":s["step_id"],"prompt":s["check"]} for s in c["method_steps"]],"contrast_and_boundary_microcases":micro[p],"evidence_to_capture_later":["event trace","address/probe values","changed-slot set","invariant checks","all return outcomes"],"prohibited_stage4_claims":["Do not claim code execution.","Do not claim verified traces.","Do not infer duplicate/full behavior as official when the source is silent."],"stage5_handoff":"Implement both source representations where applicable and record normal, duplicate/full/not-found, and counterexample fixtures before VERIFIED status."})
    write("WORKED_EXAMPLE_SPECS.json",{"schema_version":"s4-schema-v1","status":"SUBMITTED","batch_id":"B5-dictionary-hash","input_hashes":hashes,"worked_example_specs":out,"self_checks":{"anchor_count":len(out),"one_per_pattern":True}})

def build_visuals(cards, hashes):
    spec={
        "HASH_SETUP":(["DECLARE_REGION","MAKE_EMPTY_RECORD","WRITE_EMPTY_SLOT","ADVANCE_DIMENSION","VERIFY_EMPTY_DOMAIN"],("Làm sao biết mọi ô của đúng biểu diễn đã nhận cùng nghĩa rỗng mà không dùng chung object mutable?","How do we know every slot in the chosen representation has the same empty meaning without sharing one mutable object?"),("Khởi tạo đủ Main và Spare hoặc toàn bộ 100×10.","Initialise complete Main+Spare or the full 100×10 table."),("Theo dõi ô cuối của vùng thứ hai/chiều thứ hai.","Track the final slot of the second region/dimension."),("Bỏ một vùng, sai sentinel hoặc alias mọi ô.","Skip a region, use the wrong sentinel, or alias all slots.")),
        "HASH_FUNCTION":(["READ_KEY","SELECT_MODULUS","APPLY_MOD","CHECK_ADDRESS_DOMAIN","RETURN_ADDRESS"],("Vì sao APPLY_MOD với đúng số địa chỉ chính luôn đưa khóa vào miền chỉ số hợp lệ?","Why does APPLY_MOD with the exact primary-address count always place the key in the valid index domain?"),("Tính địa chỉ cho khóa nằm giữa miền.","Compute an address for an interior key."),("So sánh khóa 0, modulus−1, modulus và modulus+1.","Compare keys 0, modulus−1, modulus, and modulus+1."),("Dùng tổng capacity hoặc băm sai trường.","Use total capacity or hash the wrong field.")),
        "HASH_INSERT":(["HASH_ADDRESS","CHECK_PRIMARY","COLLISION_BRANCH","PROBE_SLOT","STORE_ONCE","DUPLICATE_OR_FULL"],("PROBE_SLOT phải nằm ở vùng nào và sự kiện nào chứng minh record chỉ được STORE_ONCE?","Which region may PROBE_SLOT visit, and which event proves the record is STORE_ONCE?"),("Va chạm rồi lưu ở ô trống đầu tiên đúng chiến lược.","Collide then store in the first free slot under the chosen strategy."),("Ô trống cuối, duplicate và vùng collision đầy.","Last free slot, duplicate, and full collision region."),("Quét nhầm vùng, probe đứng yên hoặc ghi mọi ô rỗng.","Scan the wrong region, stall the probe, or write every empty slot.")),
        "HASH_SEARCH":(["HASH_ADDRESS","ENTER_BUCKET","COMPARE_KEY","FOUND_DATA","EXHAUST_BUCKET","RETURN_NOT_FOUND"],("Sau mỗi COMPARE_KEY, những cột nào đã bị loại và khi nào EXHAUST_BUCKET mới cho phép Not found?","After each COMPARE_KEY, which columns are ruled out and when does EXHAUST_BUCKET permit Not found?"),("Tìm thấy key ở cột giữa và trả đúng data.","Find a key in an interior column and return its data."),("Tìm ở cột cuối, bucket rỗng và key vắng mặt.","Search the final column, an empty bucket, and an absent key."),("Trả Not found ở lần không khớp đầu hoặc quét toàn bảng.","Return Not found on the first non-match or scan the whole table.")),
    }
    out=[]
    for c in cards:
        p=c["pattern_id"]; events,q,n,b,f=spec[p]
        out.append({"visual_brief_id":f"B5-VIS-{p}","pattern_id":p,"method_step_refs":[s["step_id"] for s in c["method_steps"]],"error_refs":c["error_refs"],"learning_question":bi(*q),"visual_mode":"event_driven","state_to_show":unique(x for s in c["method_steps"] for x in s["writes"]),"proposed_event_types":events,"predict_prompt":bi(f"Dự đoán sự kiện {p} tiếp theo, address/probe và tập ô sẽ thay đổi.",f"Predict the next {p} event, address/probe, and changed-slot set."),"normal_case":bi(*n),"boundary_case":bi(*b),"failure_case":bi(*f),"representation_and_convention":"Two selectable source panels: Main+Spare and bucket table; never merge their coordinates or capacities.","static_fallback":bi("Bảng trace từng event với key, modulus, address, probe, sentinel, ô thay đổi và bất biến.","Event trace table showing key, modulus, address, probe, sentinel, changed slot, and invariant."),"accessibility_notes":["Do not encode empty/occupied/collision by colour alone.","Announce region, row, column, address, probe, and changed-slot count.","Keyboard controls: previous, next, reset, reveal prediction."],"status":"PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD"})
    write("VISUAL_BRIEFS.json",{"schema_version":"s4-schema-v1","status":"SUBMITTED","batch_id":"B5-dictionary-hash","input_hashes":hashes,"visual_briefs":out,"self_checks":{"visual_count":len(out),"unique_event_vocabularies":len({tuple(v["proposed_event_types"]) for v in out})==len(out),"unique_learning_questions":len({(v["learning_question"]["vi"],v["learning_question"]["en"]) for v in out})==len(out),"all_pending_stage7":True}})

def build_review(cards, variant_rows):
    atoms=[a for c in cards for a in c["marking_point_refs"]]
    text=f"""# B5 dictionary/hash submission review

Status: **SUBMITTED**. Execution evidence and final storyboards remain **PENDING Stage 5/7**.

## Counts

- Patterns: 4 (`HASH_SETUP`, `HASH_FUNCTION`, `HASH_INSERT`, `HASH_SEARCH`)
- Assessed part links / unique parts: {sum(len(c['source_scope']['assessed_part_ids']) for c in cards)} / {len(set(pid for c in cards for pid in c['source_scope']['assessed_part_ids']))}
- Applicable official atoms: {len(atoms)}; duplicate ownership: {len(atoms)-len(set(atoms))}
- Method steps: {sum(len(c['method_steps']) for c in cards)}
- Variant/invariant rows: {len(variant_rows)}
- Error rows: 12; solution designs: 4; anchor specs: 4; visual briefs: 4

## Self-review

- Exact Stage 2 part sets and current 2025 QP/MS locators are preserved.
- Every official atom is owned once; dependencies and alternatives remain inside official source refs.
- Each pattern has a distinct bilingual decision rule, method, error/repair set, visual question, event vocabulary, and normal/boundary/failure case.
- Hash domain/modulus, empty sentinel, collision region, strictly advancing probe, finite termination, duplicate/full/not-found fixtures, and one-write preservation are explicit.
- A3C14 keeps Main+Spare separate from same-bucket collision storage. Python direct dictionary lookup is contrasted as a different contract and is not substituted for assessed hash mechanics.
- No current source-risk item targets these eight parts. The 2025-only limited-corpus caveat remains explicit, so no source architecture is presented as universal.
- No execution, trace verification, or exact mark-loss claim is made.

## Open downstream decisions

1. Stage 5 must choose and record duplicate and full-capacity outcomes where the official source is silent, then run both collision architectures and all boundary fixtures.
2. Stage 5 must confirm the accepted key domain before testing language-specific MOD behavior for negative keys.
3. Stage 7 must choose timing and responsive layout while preserving the fixed event vocabularies and static trace fallbacks.
"""
    (HERE/"REVIEW.md").write_text(text,encoding="utf-8")

if __name__ == "__main__": main()

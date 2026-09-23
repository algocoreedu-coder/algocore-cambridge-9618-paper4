import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = path.resolve(ROOT, "../planning/paper4/next-phase");
const OUT = path.join(ROOT, "content/paper4/lessons/production");
const bi = (vi, en) => ({ vi, en });
const DOMAIN = {
  "binary-tree": bi("cây nhị phân", "binary tree"),
  "linked-list": bi("danh sách liên kết", "linked list"),
  "random-files": bi("tệp truy cập ngẫu nhiên", "random file"),
};
const CONTROLLED_TOKEN = /\b(?:BST|ADT|OOP|BYREF|CASE|ASCII|LIFO|UTF-8|production-v1|A3|Paper 4|\d+)\b/g;
function aligned(vi, en) {
  const tokens = (text) => [...new Set(text.match(CONTROLLED_TOKEN) ?? [])].sort();
  const union = [...new Set([...tokens(vi), ...tokens(en)])].sort();
  const viMissing = union.filter((token) => !tokens(vi).includes(token));
  const enMissing = union.filter((token) => !tokens(en).includes(token));
  if (viMissing.length || enMissing.length) {
    const shared = union.join(", ");
    vi += ` Token hoặc ràng buộc giữ nguyên: ${shared}.`;
    en += ` Retained token or constraint: ${shared}.`;
  }
  return bi(vi, en);
}

const RULES = new Map([
  ["procedural-design/selection-iteration", bi("Mỗi nhánh phải xử lý đúng một trường hợp và mỗi vòng lặp phải có bước tiến tới điều kiện dừng.", "Each branch must handle one case, and every loop must make progress toward its stopping condition.")],
  ["procedural-design/subroutine-contracts", bi("Procedure tạo tác động đã công bố; function trả đúng một kết quả theo hợp đồng, và dữ liệu cục bộ không rò ra ngoài.", "A procedure performs its declared effect; a function returns its contracted result, and local data does not leak outside.")],
  ["procedural-design/parameter-modes", bi("Phân biệt thay đổi object được truyền vào với việc gán lại tên cục bộ; Python không dùng cú pháp BYREF của pseudocode.", "Distinguish mutating a passed object from rebinding a local name; Python does not use pseudocode BYREF syntax.")],
  ["procedural-design/pseudocode-translation", bi("Giữ nguyên cận chỉ số, ý nghĩa toán tử, sentinel và thứ tự bước của đề trước khi đổi sang cú pháp Python.", "Preserve the supplied index bounds, operator meanings, sentinel, and step order before translating into Python syntax.")],
  ["procedural-design/decomposition", bi("Mỗi module có đầu vào, đầu ra và trách nhiệm riêng; luồng chính gọi chúng theo đúng phụ thuộc dữ liệu.", "Each module has its own inputs, outputs, and responsibility; the main flow calls them in data-dependency order.")],
  ["procedural-design/paradigm-choice", bi("Chọn procedural khi trọng tâm là chuỗi thao tác; chọn OOP khi trạng thái và hành vi thuộc về nhiều object độc lập.", "Choose procedural design for a sequence of operations; choose OOP when state and behaviour belong to multiple independent objects.")],
  ["procedural-design/abstraction-io", bi("Mô hình chỉ giữ dữ liệu ảnh hưởng kết quả và nêu rõ input, xử lý, output cùng điều kiện trước/sau.", "The model retains only data that affects the result and states inputs, processing, outputs, and pre/postconditions.")],
  ["procedural-design/console-library", bi("Chuyển kiểu ngay tại biên nhập, in đúng nhãn/định dạng, và chỉ dùng hàm thư viện mà hợp đồng câu hỏi cho phép.", "Convert types at the input boundary, print the exact labels/format, and use only library routines allowed by the task contract.")],
  ["validation-rules/input-validation", bi("Chỉ cập nhật trạng thái đã chấp nhận sau khi mọi kiểm tra type, range, length và membership đều đạt.", "Update accepted state only after every type, range, length, and membership check passes.")],
  ["validation-rules/rule-outcomes", bi("Tính predicate từ đúng trường và đúng ngưỡng; các khoảng phải phủ miền mà không chồng lấn ngoài ý muốn.", "Compute the predicate from the correct fields and thresholds; bands must cover the domain without unintended overlap.")],
  ["validation-rules/unique-selection", bi("Một mục chỉ được chọn khi chưa dùng, sau đó đánh dấu dùng đúng một lần; phải phát hiện khi không còn lựa chọn.", "An item is selected only while unused, then marked exactly once; exhaustion must be detected.")],
  ["validation-rules/check-digit", bi("Công thức trọng số, phép chia, làm tròn hoặc modulo phải lấy từ câu hỏi; không tồn tại một công thức check digit chung.", "Weights, division, rounding, or modulo come from the question; there is no universal check-digit formula.")],
  ["testing/test-design", bi("Mỗi test có input, trạng thái đầu, expected result và actual result; reset trạng thái trước test kế tiếp.", "Every test records input, initial state, expected result, and actual result; reset state before the next test.")],
  ["testing/tracing-debugging", bi("Trace dừng tại trạng thái sai đầu tiên và lần ngược tới câu lệnh gây sai, thay vì chỉ quan sát output cuối.", "A trace stops at the first wrong state and works back to the causing statement rather than inspecting only final output.")],
  ["testing/repair-enhance", bi("Sau sửa đổi phải chạy lại test gây lỗi và toàn bộ regression set để chứng minh hành vi cần giữ không bị phá.", "After a change, rerun the failing test and the full regression set to prove preserved behaviour was not broken.")],
  ["testing/source-contract", bi("QP quyết định yêu cầu, MS quyết định tiêu chí chính thức; rubric AlgoCore phải ghi nhãn và không tự gán điểm Cambridge.", "The QP controls requirements and the MS controls official criteria; an AlgoCore rubric must be labelled and must not invent Cambridge marks.")],
  ["testing/capture-provenance", bi("Bằng chứng phải nối đúng phiên bản code, fixture, input và output của cùng một lần chạy có thể tái lập.", "Evidence must join the exact code version, fixture, input, and output from one reproducible run.")],
  ["text-processing/character-comparison", bi("So sánh từ trái sang phải; ký tự khác đầu tiên quyết định thứ tự, còn nếu một chuỗi là prefix thì chuỗi ngắn hơn đứng trước.", "Compare left to right; the first differing character decides order, and if one string is a prefix, the shorter string comes first.")],
  ["text-processing/delimiter-tokenisation", bi("Mỗi delimiter kết thúc một token; chính sách token rỗng và token cuối phải được thực hiện tường minh.", "Each delimiter ends a token; the empty-token policy and final token must be handled explicitly.")],
  ["text-processing/typed-routing", bi("Chỉ route record sau khi đủ trường, chuyển kiểu thành công và destination còn sức chứa.", "Route a record only after all fields exist, conversion succeeds, and the destination has capacity.")],
  ["text-processing/run-length", bi("Count thuộc về một dãy liên tiếp; khi symbol đổi phải xuất run cũ, reset count và nhớ flush run cuối.", "The count belongs to one consecutive run; on a symbol change, emit the old run, reset the count, and flush the final run.")],
  ["search-collections/linear-find", bi("Duyệt theo thứ tự và trả first match theo hợp đồng; chỉ báo not-found sau khi hết miền tìm kiếm.", "Scan in order and return the contracted first match; report not found only after exhausting the search domain.")],
  ["search-collections/count-all", bi("Accumulator tăng cho mọi phần tử thỏa predicate; không return sớm sau match đầu.", "The accumulator increases for every item satisfying the predicate; do not return after the first match.")],
  ["search-collections/filter-all", bi("Mỗi record được kiểm tra bằng cùng compound condition và mọi match được giữ theo thứ tự yêu cầu.", "Every record is tested by the same compound condition and all matches are retained in the required order.")],
  ["search-collections/group-totals", bi("Khóa mới tạo đúng một group; khóa cũ cập nhật group hiện có mà không nhân đôi key.", "A new key creates exactly one group; an existing key updates that group without duplicating the key.")],
  ["sorting/bubble-passes", bi("Sau mỗi pass, ít nhất một phần tử đã về cuối miền chưa sắp; swap flag chỉ cho dừng khi cả pass không đổi chỗ.", "After each pass, at least one item reaches the end of the unsorted region; stop only when a full pass makes no swap.")],
  ["sorting/insertion-shifts", bi("Prefix trước key luôn có thứ tự; dịch mọi phần tử lớn hơn key rồi chèn key vào lỗ trống còn lại.", "The prefix before the key remains sorted; shift every larger item and insert the key into the remaining gap.")],
  ["sorting/ordered-insert", bi("Tìm vị trí theo comparator, kiểm tra capacity, dịch suffix đúng một ô rồi ghi record nguyên vẹn.", "Find the position using the comparator, check capacity, shift the suffix by one cell, then write the whole record.")],
  ["sorting/comparator-variants", bi("Comparator phải nhất quán về chiều, key phụ và equality; khi swap phải di chuyển toàn bộ record.", "The comparator must be consistent about direction, secondary key, and equality; a swap moves the whole record.")],
  ["stack/representation-conventions", bi("Chọn một quy ước top-used hoặc next-free và suy ra empty/full từ cùng quy ước trong mọi operation.", "Choose either top-used or next-free and derive empty/full consistently from that convention in every operation.")],
  ["stack/push", bi("Kiểm tra overflow trước khi ghi; thứ tự tăng pointer và ghi phụ thuộc quy ước top đã công bố.", "Check overflow before writing; pointer update and write order depend on the declared top convention.")],
  ["stack/pop", bi("Kiểm tra underflow trước khi đọc; trả đúng phần tử trên cùng rồi cập nhật pointer đúng một bước.", "Check underflow before reading; return the top item and update the pointer by exactly one step.")],
  ["stack/paired-restoration", bi("Nếu cặp không hợp lệ, mọi item đã lấy tạm phải được push lại theo thứ tự phục hồi trạng thái ban đầu.", "If a pair is invalid, every temporarily popped item must be pushed back in the order that restores the initial state.")],
  ["stack/reduce-operands", bi("Với phép không giao hoán, toán hạng lấy sau là bên trái hay bên phải phải theo đúng notation của đề.", "For a non-commutative operator, whether the later pop is the left or right operand must follow the supplied notation.")],
  ["linked-list/representation-free-list", bi("Mỗi node sống thuộc đúng một chain từ head; mỗi node trống thuộc free list; hai chain không giao nhau.", "Each live node belongs to exactly one chain from head; each unused node belongs to the free list; the chains are disjoint.")],
  ["linked-list/traversal", bi("Duyệt bằng next link cho tới null sentinel, không tăng index vật lý như mảng.", "Traverse by following next links to the null sentinel, not by incrementing a physical array index.")],
  ["linked-list/search", bi("So sánh data ở node hiện tại trước khi theo link; chỉ not-found khi link tiếp theo là null.", "Compare data at the current node before following its link; report not found only when the next link is null.")],
  ["linked-list/insert", bi("Lấy node từ free list trước, gắn data/link, rồi cập nhật head hoặc predecessor mà không mất phần còn lại của chain.", "Take a node from the free list first, set data/link, then update head or predecessor without losing the rest of the chain.")],
  ["linked-list/remove-recycle", bi("Nối predecessor qua node bị xóa rồi đưa node đó về free list; xóa head dùng cùng postcondition nhưng khác pointer cập nhật.", "Link the predecessor around the removed node, then return it to the free list; head removal has the same postcondition but a different pointer update.")],
  ["binary-tree/representation", bi("Root và mỗi child link là node index/reference hoặc null sentinel; node chưa dùng không được reachable từ root.", "Root and each child link are a node index/reference or null sentinel; unused nodes must not be reachable from root.")],
  ["binary-tree/ordered-insert", bi("Mỗi so sánh chọn đúng một nhánh; node mới chỉ gắn tại null link và duplicate tuân theo policy đã cho.", "Each comparison chooses exactly one branch; a new node is attached only at a null link, and duplicates follow the supplied policy.")],
  ["binary-tree/search", bi("Nếu target nhỏ hơn đi trái, lớn hơn đi phải; không tìm thấy chỉ khi nhánh cần đi là null.", "Go left when the target is smaller and right when larger; not found occurs only when the required branch is null.")],
  ["binary-tree/traversals", bi("Inorder là left-root-right; postorder là left-right-root; output phụ thuộc thứ tự visit chứ không phụ thuộc index lưu node.", "Inorder is left-root-right; postorder is left-right-root; output follows visit order, not node storage index.")],
  ["dictionary/adt-interface", bi("Key là duy nhất và client dùng find/insert/delete qua interface, không phụ thuộc representation bên dưới.", "Keys are unique and clients use find/insert/delete through the interface without depending on the underlying representation.")],
  ["dictionary/find-insert", bi("Find phân biệt missing với giá trị hợp lệ; insert với duplicate key phải update hoặc reject đúng contract.", "Find distinguishes a missing key from a valid value; duplicate-key insertion updates or rejects exactly as contracted.")],
  ["dictionary/delete", bi("Delete key tồn tại làm key không còn tìm thấy; delete key thiếu không được làm đổi dictionary.", "Deleting an existing key makes it unfindable; deleting a missing key must leave the dictionary unchanged.")],
  ["dictionary/representation-choice", bi("Python dict chỉ dùng khi đề cho phép; nếu đề yêu cầu array/linked list/tree thì vẫn phải cài interface bằng representation đó.", "Use Python dict only when allowed; if the task prescribes an array, linked list, or tree, implement the interface with that representation.")],
  ["dictionary/other-adt-implementation", bi("ADT thành phần phải bảo toàn uniqueness, missing-key result và postcondition của dictionary ở mọi operation.", "The component ADT must preserve key uniqueness, missing-key results, and dictionary postconditions for every operation.")],
  ["oop-model/class-object", bi("Class định nghĩa cấu trúc/hành vi chung; mỗi object có identity và instance state riêng.", "A class defines shared structure and behaviour; each object has its own identity and instance state.")],
  ["oop-model/constructor", bi("Constructor kiểm tra/ghi đủ thuộc tính bắt buộc để object hợp lệ ngay khi được tạo.", "The constructor validates and assigns every required attribute so the object is valid immediately after creation.")],
  ["oop-model/instantiate", bi("Mỗi lần gọi constructor tạo một instance riêng; thay đổi một object không được đổi object khác.", "Each constructor call creates a separate instance; changing one object must not change another.")],
  ["oop-model/class-design", bi("Mỗi thuộc tính mô tả trạng thái bền của entity và mỗi method thuộc trách nhiệm của class, không chỉ là hàm ngẫu nhiên.", "Each attribute describes persistent entity state and each method belongs to the class responsibility rather than being an arbitrary function.")],
  ["oop-state/encapsulation", bi("Client thay đổi state qua public interface; invariant không phụ thuộc việc client ghi trực tiếp field nội bộ.", "Clients change state through the public interface; invariants must not depend on clients writing internal fields directly.")],
  ["oop-state/getters", bi("Getter trả giá trị đang lưu và không gây side effect hay đổi state.", "A getter returns the stored value without side effects or state changes.")],
  ["oop-state/setters", bi("Setter thay giá trị bằng parameter sau validation; nó khác với method cộng/trừ theo quy tắc.", "A setter replaces a value with its validated parameter; it differs from a rule-based increment/decrement method.")],
  ["oop-state/rule-updates", bi("Chuyển trạng thái phải áp dụng công thức một lần, chặn đúng biên và giữ state cũ khi operation thất bại.", "A state transition applies its formula once, enforces exact bounds, and preserves old state when the operation fails.")],
  ["oop-inheritance/base-derived", bi("Subclass khởi tạo phần base một lần rồi thêm state riêng; inherited contract vẫn hợp lệ.", "A subclass initialises the base portion once and then adds its own state; the inherited contract remains valid.")],
  ["oop-inheritance/override-dispatch", bi("Override giữ signature/ý nghĩa chung; lời gọi qua interface chung chọn method theo class thực của object.", "An override preserves the shared signature/meaning; a call through the common interface selects the method for the object's runtime class.")],
  ["oop-inheritance/substitutability", bi("Mọi subclass dùng được nơi base được yêu cầu mà không cần chuỗi kiểm tra type thủ công.", "Every subclass can be used where the base is expected without a manual chain of type tests.")],
  ["oop-aggregation/has-a", bi("Owner giữ reference tới component object; component vẫn có state và method riêng.", "The owner stores a reference to a component object; the component retains its own state and methods.")],
  ["oop-aggregation/bounded-add", bi("Chỉ tăng count sau khi type và capacity đều hợp lệ; failure không ghi đè slot hay đổi count.", "Increase count only after type and capacity checks pass; failure neither overwrites a slot nor changes count.")],
  ["oop-aggregation/nested-access", bi("Aggregate ủy quyền qua method của component và tổng hợp kết quả, thay vì sao chép field nội bộ.", "The aggregate delegates through component methods and combines results rather than copying internal fields.")],
  ["text-files/file-lifecycle", bi("Mỗi open thành công phải có close đảm bảo; mode đọc/ghi/append phải khớp tác động dự kiến.", "Every successful open must have guaranteed cleanup; read/write/append mode must match the intended effect.")],
  ["text-files/record-loading", bi("Chỉ commit record sau khi đọc đủ boundary, đủ fields và mọi conversion thành công.", "Commit a record only after its boundary and fields are complete and every conversion succeeds.")],
  ["text-files/serial-sequential", bi("Sequential processing đọc theo thứ tự lưu; tuyên bố về key order chỉ đúng nếu tổ chức tệp bảo đảm điều đó.", "Sequential processing reads storage order; a key-order claim is valid only when the file organisation guarantees it.")],
  ["text-files/write-append", bi("Write thay nội dung cũ, append giữ nội dung cũ; newline và encoding phải cho phép round trip chính xác.", "Write replaces old content and append preserves it; newline and encoding choices must support an exact round trip.")],
  ["text-files/adt-loading", bi("Nếu ADT reject vì capacity/type thì loader ghi nhận failure và không đếm record như đã nạp.", "If the ADT rejects for capacity or type, the loader records failure and does not count the record as loaded.")],
  ["random-files/organisation-access", bi("Direct access tính địa chỉ record trước khi đọc; sequential access phải đi qua các record trước đó.", "Direct access computes the record address before reading; sequential access passes through preceding records.")],
  ["random-files/record-address", bi("Với fixed-size binary record, byte offset = logical index × record size sau khi quy đổi address base rõ ràng.", "For a fixed-size binary record, byte offset equals logical index times record size after an explicit address-base conversion.")],
  ["random-files/read-write-update", bi("Update seek tới đúng offset, ghi đúng record size và chứng minh các record lân cận không đổi.", "An update seeks to the exact offset, writes exactly one record size, and proves neighbouring records are unchanged.")],
  ["exceptions/runtime-failures", bi("Phân loại conversion, missing-file và I/O failure theo exception thực tế thay vì coi mọi lỗi là cùng một trường hợp.", "Classify conversion, missing-file, and I/O failures by their actual exception rather than treating every failure alike.")],
  ["exceptions/handle-recover", bi("Catch exception cụ thể ở mức có thể xử lý; recovery trả outcome rõ và bảo toàn last valid state.", "Catch a specific exception at the level that can handle it; recovery returns a clear outcome and preserves the last valid state.")],
  ["exceptions/cleanup", bi("Resource được đóng trên cả success và failure; finally/context manager là lựa chọn Python, không phải cú pháp Cambridge bắt buộc.", "Resources are closed on both success and failure; finally/context managers are Python choices, not mandatory Cambridge syntax.")],
  ["performance/asymptotic-cost", bi("Nêu biến n, operation được đếm và worst-case; tách time growth khỏi auxiliary space growth.", "State the input size n, counted operation, and worst case; separate time growth from auxiliary-space growth.")],
  ["performance/algorithm-choice", bi("Lựa chọn phải dựa vào dữ liệu đã sorted chưa, kích thước, update frequency và yêu cầu time/space.", "The choice must use whether data is sorted, its size, update frequency, and time/space requirements.")],
  ["performance/trace-cost", bi("Đếm cùng loại operation trên cùng fixture; timing máy chỉ là quan sát, không thay thế mô hình tăng trưởng.", "Count the same operation on the same fixture; machine timing is an observation, not a replacement for the growth model.")],
  ["graphs/characteristics", bi("Mỗi edge nối các vertex theo directedness và weight contract; isolated vertex vẫn thuộc graph.", "Each edge joins vertices according to the directedness and weight contract; an isolated vertex still belongs to the graph.")],
  ["graphs/structure-choice", bi("Chọn graph khi quan hệ many-to-many hoặc network là trọng tâm; không suy ra yêu cầu code traversal nếu syllabus không yêu cầu.", "Choose a graph when many-to-many or network relationships are central; do not infer a traversal-coding requirement absent from the syllabus.")],
  ["exam-workflow/compose-main", bi("Main truyền đúng output của bước trước vào bước sau và chặn downstream mutation khi validation/load thất bại.", "Main passes each stage's output to the next stage and blocks downstream mutation when loading or validation fails.")],
  ["exam-workflow/format-output", bi("Nhãn, thứ tự, spacing và logical order phải khớp yêu cầu; return value và printed output là hai hợp đồng khác nhau.", "Labels, order, spacing, and logical order must match the requirement; a return value and printed output are separate contracts.")],
  ["exam-workflow/evidence-document", bi("Mỗi phần bằng chứng nêu requirement, code version, input, expected/actual output và locator có thể kiểm tra.", "Each evidence entry identifies the requirement, code version, input, expected/actual output, and a checkable locator.")],
  ["exam-workflow/source-and-rubric", bi("Chỉ QP/MS được gán thẩm quyền chính thức; giải thích, ví dụ và rubric tự soạn luôn mang nhãn AlgoCore.", "Only QP/MS receive official authority; authored explanations, examples, and rubrics always carry an AlgoCore label.")],
]);

function cleanLocatorObjective(ref) {
  const source = ref.source;
  return { objective_id: ref.objective_id, syllabus_version: "2026", locator: {
    source_id: source.source_id, pdf_page: source.pdf_page, printed_page: source.printed_page,
    heading: source.heading, bullet_locator: source.bullet_locator, anchor_text: source.anchor_text,
  }};
}

function cleanBook(ref, relationship) {
  return { section_id: ref.section_id, chapter: ref.chapter, printed_pages: ref.printed_pages,
    pdf_pages: ref.pdf_pages, relationship };
}

const inventory = JSON.parse(await readFile(path.join(PLAN, "evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json"), "utf8"));
const dispositions = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/knowledge-disposition.json"), "utf8"));
const sourceMap = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/lesson-source-map.json"), "utf8"));
const lineRoleMap = JSON.parse(await readFile(path.join(PLAN, "evidence/p4r-3/a3/LINE_ROLE_MAP.json"), "utf8"));
const sourceBySlug = new Map(sourceMap.lessons.map((x) => [x.slug, x]));
const dispositionById = new Map(dispositions.records.map((x) => [x.knowledge_block_id, x]));
const lineRoleByKnowledgeId = new Map(lineRoleMap.lessons.flatMap((lesson) => lesson.roles.map((role) => [role.knowledge_unit_id, { ...role, python_artifact_id: lesson.python_artifact_id, artifact_version: lesson.artifact_version }])));
const artifactById = new Map();
for (const lesson of inventory.lessons) {
  const artifact = JSON.parse(await readFile(path.join(ROOT, `content/paper4/python/production/${lesson.lesson_slug}/artifact.json`), "utf8"));
  artifactById.set(artifact.python_artifact_id, artifact);
}

const generated = [];
for (const lesson of inventory.lessons) {
  const source = sourceBySlug.get(lesson.lesson_slug);
  if (!source) throw new Error(`Missing source map for ${lesson.lesson_slug}`);
  for (let index = 0; index < lesson.knowledge_unit_ids.length; index += 1) {
    const id = lesson.knowledge_unit_ids[index];
    const disposition = dispositionById.get(id);
    if (!disposition) throw new Error(`Missing disposition for ${id}`);
    const key = disposition.block_key;
    const rule = RULES.get(key);
    if (!rule) throw new Error(`Missing authored rule for ${key}`);
    const focusVi = disposition.titles.vi;
    const objectiveIds = disposition.objective_ids.length ? disposition.objective_ids : source.objective_ids;
    const objectiveRefs = objectiveIds.map((oid) => source.objective_refs.find((x) => x.objective_id === oid)).filter(Boolean).map(cleanLocatorObjective);
    const bookRefs = disposition.book_section_ids.map((sid) => source.book_refs.find((x) => x.section_id === sid)).filter(Boolean).map((x) => cleanBook(x, disposition.book_relationship));
    const suffix = id.split(".").at(-1);
    const artifactId = `ac-9618-p4-2026-python.artifact.${lesson.lesson_slug}.production-v1`;
    const lineRole = lineRoleByKnowledgeId.get(id);
    if (!lineRole || lineRole.semantic_role !== suffix || lineRole.python_artifact_id !== artifactId || !lineRole.active_line_ids?.length) {
      throw new Error(`Missing or invalid frozen A3 line role for ${id}`);
    }
    const fixtureKinds = ["normal", "boundary", "failure"];
    const fixtureKind = fixtureKinds[index % fixtureKinds.length];
    const artifact = artifactById.get(artifactId);
    const fixture = artifact?.fixtures.find((item) => item.case_kind === fixtureKind);
    if (!artifact || !fixture) throw new Error(`Missing ${fixtureKind} fixture for ${artifactId}`);
    const fixtureInput = JSON.stringify(fixture.input);
    const domain = DOMAIN[lesson.lesson_slug];
    const viDomain = domain ? ` trong ${domain.vi}` : "";
    const enDomain = domain ? ` in the ${domain.en}` : "";
    const boundLines = lineRole.active_line_ids.join(", ");
    const explanation = aligned(
      `${focusVi}${viDomain} tập trung vào một quy tắc có thể kiểm tra: ${rule.vi} Khi làm Paper 4, học sinh phải dùng quy tắc này để giải thích điều kiện, thứ tự cập nhật và trạng thái sau thao tác.`,
      `${disposition.titles.en}${enDomain} centres on one checkable rule: ${rule.en} In Paper 4, the learner uses this rule to explain the condition, update order, and state after the operation.`);
    const pythonConnection = aligned(
      `Trong artifact ${artifactId}, các dòng ${boundLines} chứa đoạn mã “${lineRole.matched_text}” và minh họa trực tiếp ${focusVi}${viDomain}: ${rule.vi} Đây là source production-v1 đã được A3 đóng băng và chạy kiểm chứng.`,
      `In artifact ${artifactId}, lines ${boundLines} contain “${lineRole.matched_text}” and directly demonstrate ${disposition.titles.en}${enDomain}: ${rule.en} This is the A3-frozen and independently rerun production-v1 source.`);
    const representation = aligned(
      `Biểu diễn ${focusVi}${viDomain} bằng một trace có bốn cột: trạng thái trước, điều kiện hoặc quyết định tại ${boundLines}, thay đổi được thực hiện, và trạng thái sau. Trace phải cho thấy quy tắc sau vẫn đúng: ${rule.vi}`,
      `Represent ${disposition.titles.en}${enDomain} with a four-column trace: before-state, condition or decision at ${boundLines}, applied change, and after-state. The trace must show that this rule still holds: ${rule.en}`);
    const scenario = aligned(
      `Fixture ${fixture.fixture_id} dùng input chính xác ${fixtureInput} để kiểm tra ${focusVi}${viDomain}. Trước khi chạy, học sinh dự đoán output và trạng thái sau theo quy tắc: ${rule.vi}`,
      `Fixture ${fixture.fixture_id} uses the exact input ${fixtureInput} to test ${disposition.titles.en}${enDomain}. Before running it, the learner predicts the output and after-state from this rule: ${rule.en}`);
    const envelope = { schema_version: "2.0.0", artifact_type: "KnowledgeUnit", record: {
      knowledge_unit_id: id, lesson_id: lesson.lesson_id, stage3_block_ids: [id], disposition: "publish",
      version: "2.0.0-production.1", objective_refs: objectiveRefs, book_refs: bookRefs,
      title: disposition.titles,
      explanation,
      python_connection: pythonConnection,
      representation,
      invariant_or_rule: rule,
      misconceptions: [
        bi(`Áp dụng cú pháp hoặc shortcut Python trước khi xác định hợp đồng của “${focusVi}”.`, `Applying Python syntax or a shortcut before establishing the contract for “${disposition.titles.en}”.`),
        bi(`Chỉ kiểm tra happy path nên bỏ qua trạng thái biên/thất bại và vô tình làm đổi dữ liệu đã hợp lệ.`, "Testing only the happy path, thereby missing boundary/failure state and accidentally changing valid data."),
      ],
      exam_signals: [
        bi(`Đề yêu cầu triển khai, hoàn thiện, trace hoặc giải thích ${focusVi.toLowerCase()}.`, `The task asks the candidate to implement, complete, trace, or explain ${disposition.titles.en.toLowerCase()}.`),
        bi(`Điểm phụ thuộc vào state/pointer/index/output chính xác và cách xử lý trường hợp biên hoặc không hợp lệ.`, "Credit depends on exact state, pointer, index, or output behaviour and the handling of a boundary or invalid case."),
      ],
      micro_example: {
        scenario,
        walkthrough: bi(`Áp dụng quy tắc của “${focusVi}”; ghi before-state, thực hiện đúng một bước có thể kiểm tra, rồi đối chiếu after-state/output với hợp đồng. Nếu điều kiện trước không đạt, trả failure mà không commit thay đổi.`, `Apply the rule for “${disposition.titles.en}”: record the before-state, perform one checkable step, then compare after-state/output with the contract. If the precondition fails, return failure without committing a change.`),
        python_artifact_id: artifactId, python_artifact_refs: [artifactId], active_line_ids: lineRole.active_line_ids,
        code_link_intent: { status: "RESOLVED_A3_FROZEN_LINE_ROLE_MAP", lesson_slug: lesson.lesson_slug, semantic_role: suffix,
          artifact_version: lineRole.artifact_version, matched_text: lineRole.matched_text, resolved_line_ids: lineRole.active_line_ids },
        fixture_kind: fixtureKind, authority: "AlgoCore_authored_teaching_example",
      },
      self_check: {
        prompt: bi(`Invariant nào phải còn đúng sau khi xử lý “${focusVi}”?`, `Which invariant must still hold after processing “${disposition.titles.en}”?`),
        answer: rule,
        rationale: bi("Nêu invariant trước khi code giúp chọn đúng điều kiện, thứ tự cập nhật và failure path mà examiner có thể kiểm tra.", "Stating the invariant before coding determines the correct condition, update order, and examiner-checkable failure path."),
        answer_hidden_initially: true, authority: "AlgoCore_authored_self_check",
      },
      author: "AlgoCore A2 bilingual theory author", reviewer: "PENDING_A1_A6_A7_A8", status: "draft",
    }};
    generated.push({ lesson: lesson.lesson_slug, suffix, envelope });
  }
}

const checkOnly = process.argv.includes("--check");
const mismatches = [];
for (const item of generated) {
  const dir = path.join(OUT, item.lesson);
  const destination = path.join(dir, `${item.suffix}.knowledge-unit.json`);
  const expected = `${JSON.stringify(item.envelope, null, 2)}\n`;
  if (checkOnly) {
    let actual;
    try { actual = await readFile(destination, "utf8"); }
    catch { mismatches.push(path.relative(ROOT, destination)); continue; }
    if (actual !== expected) mismatches.push(path.relative(ROOT, destination));
  } else {
    await mkdir(dir, { recursive: true });
    await writeFile(destination, expected, "utf8");
  }
}

if (mismatches.length) {
  console.error(JSON.stringify({ status: "FAIL", code: "NON_DETERMINISTIC_OR_STALE_OUTPUT", mismatches }, null, 2));
  process.exitCode = 1;
} else {
  console.log(`P4R-3 theory ${checkOnly ? "determinism check" : "build"} complete: ${generated.length} KnowledgeUnits across ${new Set(generated.map((x) => x.lesson)).size} lessons.`);
}

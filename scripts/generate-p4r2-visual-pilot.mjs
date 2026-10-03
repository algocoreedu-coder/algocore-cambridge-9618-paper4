import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = path.resolve(ROOT, "../..");
const PYTHON_ROOT = path.join(ROOT, "content/paper4/python/pilot");
const VISUAL_ROOT = path.join(ROOT, "content/paper4/visuals/pilot");
const EVIDENCE_ROOT = path.join(
  WORKSPACE_ROOT,
  "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-2/a5",
);
const A3_ROOT = path.join(
  WORKSPACE_ROOT,
  "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-2/a3",
);
const SLUGS = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const CASES = ["normal", "boundary", "failure"];

const EVENT_TYPES = {
  check_record: "compare",
  check_capacity: "compare",
  append: "write",
  generate_random_value: "write",
  summarise_random_data: "emit",
  inspect_middle: "compare",
  search_exhausted: "branch",
  reject_unsorted_input: "reject",
  recursive_call: "call",
  recursive_inspect: "compare",
  recursive_progress_left: "advance",
  recursive_progress_right: "advance",
  recursive_base_not_found: "branch",
  check_full: "compare",
  enqueue: "write",
  check_empty: "compare",
  dequeue: "unlink",
  inspect: "read",
  reduce_item: "advance",
  reduce_complete: "emit",
  reject_invalid_capacity: "reject",
  call: "call",
  base_case: "branch",
  return: "return",
  reject_non_integer: "reject",
  probe_insert: "compare",
  insert_commit: "write",
  insert_existing: "branch",
  insert_reject_full: "reject",
  probe_search: "compare",
  search_stop_empty: "branch",
  search_found: "branch",
  search_exhausted: "branch",
  reject_non_integer_key: "reject",
  read_record: "read",
  reject_record: "reject",
  construct_object: "call",
  update: "write",
  lookup_not_found: "branch",
};

const LINE_BINDINGS = {
  "data-models": {
    check_record: ["data-models.v1.L015", "data-models.v1.L016"],
    check_capacity: ["data-models.v1.L018", "data-models.v1.L019"],
    append: ["data-models.v1.L021", "data-models.v1.L022"],
    generate_random_value: ["data-models.v1.L050", "data-models.v1.L057", "data-models.v1.L058", "data-models.v1.L059", "data-models.v1.L060", "data-models.v1.L061", "data-models.v1.L062"],
    summarise_random_data: ["data-models.v1.L031", "data-models.v1.L032", "data-models.v1.L033", "data-models.v1.L034"],
  },
  "binary-search": {
    inspect_middle: ["binary-search.v1.L015", "binary-search.v1.L016", "binary-search.v1.L017", "binary-search.v1.L018", "binary-search.v1.L019", "binary-search.v1.L020", "binary-search.v1.L021", "binary-search.v1.L022", "binary-search.v1.L023"],
    search_exhausted: ["binary-search.v1.L030", "binary-search.v1.L031"],
    reject_unsorted_input: ["binary-search.v1.L037", "binary-search.v1.L038", "binary-search.v1.L039"],
    recursive_call: ["binary-search.v1.L048", "binary-search.v1.L049"],
    recursive_inspect: ["binary-search.v1.L053", "binary-search.v1.L054"],
    recursive_progress_left: ["binary-search.v1.L057", "binary-search.v1.L058", "binary-search.v1.L059"],
    recursive_progress_right: ["binary-search.v1.L060", "binary-search.v1.L061"],
    recursive_base_not_found: ["binary-search.v1.L050", "binary-search.v1.L051", "binary-search.v1.L052"],
  },
  queue: {
    check_full: ["queue.v1.L017", "queue.v1.L018", "queue.v1.L019"],
    enqueue: ["queue.v1.L020", "queue.v1.L021", "queue.v1.L022", "queue.v1.L023", "queue.v1.L024"],
    check_empty: ["queue.v1.L028", "queue.v1.L029", "queue.v1.L030"],
    dequeue: ["queue.v1.L031", "queue.v1.L032", "queue.v1.L033", "queue.v1.L034", "queue.v1.L035", "queue.v1.L036"],
    inspect: ["queue.v1.L039", "queue.v1.L040", "queue.v1.L041", "queue.v1.L042", "queue.v1.L043"],
    reduce_item: ["queue.v1.L081", "queue.v1.L082", "queue.v1.L083", "queue.v1.L084", "queue.v1.L085", "queue.v1.L086", "queue.v1.L087", "queue.v1.L088", "queue.v1.L089", "queue.v1.L090"],
    reduce_complete: ["queue.v1.L091", "queue.v1.L092"],
    reject_invalid_capacity: ["queue.v1.L007", "queue.v1.L008", "queue.v1.L009"],
  },
  recursion: {
    call: ["recursion.v1.L005", "recursion.v1.L006", "recursion.v1.L007"],
    base_case: ["recursion.v1.L007", "recursion.v1.L008", "recursion.v1.L009"],
    return: ["recursion.v1.L010", "recursion.v1.L011", "recursion.v1.L012", "recursion.v1.L013"],
    reject_non_integer: ["recursion.v1.L026", "recursion.v1.L027", "recursion.v1.L028"],
  },
  hashing: {
    probe_insert: ["hashing.v1.L016", "hashing.v1.L017", "hashing.v1.L018", "hashing.v1.L068", "hashing.v1.L069", "hashing.v1.L070", "hashing.v1.L071", "hashing.v1.L072", "hashing.v1.L073", "hashing.v1.L074", "hashing.v1.L075"],
    insert_commit: ["hashing.v1.L020", "hashing.v1.L076", "hashing.v1.L021", "hashing.v1.L077", "hashing.v1.L078", "hashing.v1.L079", "hashing.v1.L080", "hashing.v1.L081", "hashing.v1.L082", "hashing.v1.L083", "hashing.v1.L022"],
    insert_existing: ["hashing.v1.L023", "hashing.v1.L084", "hashing.v1.L085", "hashing.v1.L086", "hashing.v1.L087", "hashing.v1.L088", "hashing.v1.L089", "hashing.v1.L090", "hashing.v1.L024"],
    insert_reject_full: ["hashing.v1.L091", "hashing.v1.L092", "hashing.v1.L093", "hashing.v1.L094", "hashing.v1.L095", "hashing.v1.L096", "hashing.v1.L097", "hashing.v1.L098", "hashing.v1.L025"],
    probe_search: ["hashing.v1.L028", "hashing.v1.L029", "hashing.v1.L030", "hashing.v1.L099", "hashing.v1.L100", "hashing.v1.L101", "hashing.v1.L102", "hashing.v1.L103", "hashing.v1.L104", "hashing.v1.L105", "hashing.v1.L106"],
    search_stop_empty: ["hashing.v1.L032", "hashing.v1.L107", "hashing.v1.L108", "hashing.v1.L109", "hashing.v1.L110", "hashing.v1.L111", "hashing.v1.L112", "hashing.v1.L033"],
    search_found: ["hashing.v1.L034", "hashing.v1.L113", "hashing.v1.L114", "hashing.v1.L115", "hashing.v1.L116", "hashing.v1.L117", "hashing.v1.L118", "hashing.v1.L035"],
    search_exhausted: ["hashing.v1.L119", "hashing.v1.L120", "hashing.v1.L121", "hashing.v1.L122", "hashing.v1.L123", "hashing.v1.L036"],
    reject_non_integer_key: ["hashing.v1.L041", "hashing.v1.L124", "hashing.v1.L125", "hashing.v1.L126", "hashing.v1.L127", "hashing.v1.L128", "hashing.v1.L043"],
  },
  "object-files": {
    read_record: ["object-files.v1.L018", "object-files.v1.L019", "object-files.v1.L020", "object-files.v1.L021", "object-files.v1.L073", "object-files.v1.L024", "object-files.v1.L074", "object-files.v1.L026", "object-files.v1.L103", "object-files.v1.L027"],
    reject_record: ["object-files.v1.L104", "object-files.v1.L105", "object-files.v1.L027"],
    construct_object: ["object-files.v1.L007", "object-files.v1.L008", "object-files.v1.L009", "object-files.v1.L010", "object-files.v1.L075", "object-files.v1.L076", "object-files.v1.L077", "object-files.v1.L078", "object-files.v1.L079", "object-files.v1.L082", "object-files.v1.L083"],
    update: ["object-files.v1.L086", "object-files.v1.L087", "object-files.v1.L088", "object-files.v1.L089", "object-files.v1.L090", "object-files.v1.L091"],
    lookup_not_found: ["object-files.v1.L086", "object-files.v1.L087", "object-files.v1.L088", "object-files.v1.L092", "object-files.v1.L093"],
  },
};

const FINAL_LINE_BINDINGS = {
  "data-models": ["data-models.v1.L035", "data-models.v1.L036", "data-models.v1.L037", "data-models.v1.L038", "data-models.v1.L075", "data-models.v1.L039", "data-models.v1.L040"],
  "binary-search": ["binary-search.v1.L064", "binary-search.v1.L065", "binary-search.v1.L066", "binary-search.v1.L067", "binary-search.v1.L068", "binary-search.v1.L069", "binary-search.v1.L070", "binary-search.v1.L071", "binary-search.v1.L072", "binary-search.v1.L073"],
  queue: ["queue.v1.L051", "queue.v1.L052", "queue.v1.L062", "queue.v1.L095", "queue.v1.L096", "queue.v1.L106", "queue.v1.L098", "queue.v1.L099", "queue.v1.L100", "queue.v1.L101", "queue.v1.L102", "queue.v1.L103", "queue.v1.L064", "queue.v1.L065", "queue.v1.L066", "queue.v1.L067", "queue.v1.L068", "queue.v1.L069", "queue.v1.L104", "queue.v1.L105", "queue.v1.L070", "queue.v1.L071", "queue.v1.L072", "queue.v1.L073"],
  recursion: ["recursion.v1.L028", "recursion.v1.L029", "recursion.v1.L030", "recursion.v1.L031", "recursion.v1.L032", "recursion.v1.L033", "recursion.v1.L034", "recursion.v1.L035"],
  hashing: ["hashing.v1.L039", "hashing.v1.L040", "hashing.v1.L044", "hashing.v1.L045", "hashing.v1.L046", "hashing.v1.L047", "hashing.v1.L048", "hashing.v1.L049", "hashing.v1.L050", "hashing.v1.L051", "hashing.v1.L052", "hashing.v1.L053", "hashing.v1.L054", "hashing.v1.L055", "hashing.v1.L056", "hashing.v1.L057", "hashing.v1.L058"],
  "object-files": ["object-files.v1.L037", "object-files.v1.L038", "object-files.v1.L094", "object-files.v1.L095", "object-files.v1.L096", "object-files.v1.L097", "object-files.v1.L098", "object-files.v1.L099", "object-files.v1.L100", "object-files.v1.L101"],
};

const PATTERN_FOCUS = {
  ARRAY_APPEND: ["check_capacity", "append"],
  DATA_RECORD: ["check_record", "append"],
  DATA_STORAGE: ["check_record", "append"],
  RANDOM_ARRAY: ["generate_random_value", "summarise_random_data"],
  BINARY_SEARCH: ["inspect_middle", "search_exhausted", "reject_unsorted_input", "recursive_call", "recursive_inspect", "recursive_progress_left", "recursive_progress_right", "recursive_base_not_found"],
  QUEUE_DEQUEUE: ["check_empty", "dequeue"],
  QUEUE_ENQUEUE: ["check_full", "enqueue"],
  QUEUE_INSPECT: ["inspect"],
  QUEUE_REDUCE: ["reduce_item", "reduce_complete"],
  QUEUE_SETUP: ["check_full", "check_empty", "reject_invalid_capacity"],
  ALGORITHM_REWRITE: ["call", "base_case", "return", "reject_non_integer"],
  HASH_FUNCTION: ["probe_insert", "insert_commit", "insert_existing", "insert_reject_full", "probe_search", "search_stop_empty", "search_found", "search_exhausted"],
  HASH_INSERT: ["probe_insert", "insert_commit", "insert_existing", "insert_reject_full"],
  HASH_SEARCH: ["probe_search", "search_stop_empty", "search_found", "search_exhausted"],
  HASH_SETUP: ["probe_insert", "insert_commit", "insert_existing", "insert_reject_full", "probe_search", "search_stop_empty", "search_found", "search_exhausted", "reject_non_integer_key"],
  FILE_READ_OBJECTS: ["read_record", "reject_record", "construct_object", "update", "lookup_not_found"],
};

const DSA_VISUAL_QUESTIONS = {
  "growth-counter": {
    vi: "Số thao tác được đếm tăng như thế nào khi kích thước đầu vào n tăng?",
    en: "How does the counted operation grow as input size n increases?",
  },
  "array-logical-capacity": {
    vi: "Logical length khác physical capacity như thế nào trước và sau thao tác?",
    en: "How does logical length differ from physical capacity before and after the operation?",
  },
  "hash-probe": {
    vi: "Collision đưa probe tới ô nào và điều kiện nào kết thúc chuỗi probe?",
    en: "Where does a collision send the probe, and which condition terminates the probe sequence?",
  },
  "queue-window": {
    vi: "front, rear và count xác định vùng phần tử đang sống như thế nào?",
    en: "How do front, rear, and count define the live queue window?",
  },
  "recursion-frames": {
    vi: "Frame nào được tạo, frame nào đạt base case và giá trị unwind theo thứ tự nào?",
    en: "Which frame is created, which reaches the base case, and in what order do values unwind?",
  },
  "binary-search-interval": {
    vi: "Mỗi comparison loại bỏ miền nào khỏi khoảng low–high?",
    en: "Which region does each comparison eliminate from the low-high interval?",
  },
};

const PILOT_DSA_VISUAL_IDS_BY_PATTERN = {
  ARRAY_APPEND: ["array-logical-capacity"],
  DATA_RECORD: ["array-logical-capacity"],
  DATA_STORAGE: ["array-logical-capacity"],
  RANDOM_ARRAY: ["array-logical-capacity"],
  BINARY_SEARCH: ["binary-search-interval", "growth-counter"],
  HASH_FUNCTION: ["hash-probe"],
  HASH_INSERT: ["hash-probe"],
  HASH_SEARCH: ["hash-probe"],
  HASH_SETUP: ["hash-probe"],
  QUEUE_DEQUEUE: ["queue-window"],
  QUEUE_ENQUEUE: ["queue-window"],
  QUEUE_INSPECT: ["queue-window"],
  QUEUE_REDUCE: ["queue-window"],
  QUEUE_SETUP: ["queue-window"],
  ALGORITHM_REWRITE: ["recursion-frames"],
};

const WORDING = {
  check_record: ["Bản ghi có đủ trường và đúng kiểu không?", "Does the record contain the required fields and types?", "Kết quả kiểm tra bản ghi quyết định có tiếp tục hay không.", "The record check decides whether execution may continue."],
  check_capacity: ["Mảng còn chỗ để thêm bản ghi không?", "Is there capacity for another record?", "Số phần tử được so với sức chứa trước khi ghi.", "The item count is compared with capacity before writing."],
  append: ["Bản ghi sẽ được ghi vào chỉ số nào?", "At which index will the record be written?", "Bản ghi đã được thêm vào cuối danh sách hiện hành.", "The record was appended at the end of the live list."],
  generate_random_value: ["Candidate nằm trong miền và có được chấp nhận không?", "Is the candidate in range and accepted?", "Candidate chỉ được commit khi thỏa hợp đồng về miền và tính duy nhất.", "A candidate is committed only when it satisfies the range and uniqueness contract."],
  summarise_random_data: ["Tập số ngẫu nhiên rỗng hay có giá trị trung bình?", "Is the random data empty, or does it have an average?", "Số lượng và trung bình được phát ra từ đúng fixture.", "The count and average are emitted from the exact fixture."],
  inspect_middle: ["Phần tử giữa sẽ thu hẹp nửa nào của khoảng tìm kiếm?", "Which half will the middle value eliminate?", "Giá trị giữa được so với đích và biên kế tiếp được suy ra.", "The middle value is compared with the target and the next bounds are derived."],
  search_exhausted: ["Điều gì chứng minh đích không tồn tại?", "What proves that the target is absent?", "low đã vượt high nên tìm kiếm kết thúc với NOT_FOUND.", "low has crossed high, so the search ends with NOT_FOUND."],
  reject_unsorted_input: ["Tìm kiếm nhị phân có hợp lệ trên dữ liệu này không?", "Is binary search valid on this data?", "Dữ liệu không tăng dần bị từ chối trước khi tìm kiếm.", "Non-ascending data is rejected before the search begins."],
  recursive_call: ["Lời gọi đệ quy đang nhận khoảng low–high nào?", "Which low-high interval enters this recursive call?", "Một frame đệ quy mới ghi lại chính xác hai biên hiện hành.", "A new recursive frame records the exact current bounds."],
  recursive_inspect: ["Phần tử giữa của frame đệ quy là gì?", "What is the middle item in this recursive frame?", "Frame đệ quy tính middle và đọc đúng giá trị tại vị trí đó.", "The recursive frame calculates middle and reads that exact item."],
  recursive_progress_left: ["Nhánh trái sẽ chuyển biên thành giá trị nào?", "Which bounds will the left branch pass next?", "Đệ quy tiến sang nửa trái với high = middle - 1.", "Recursion advances into the left half with high = middle - 1."],
  recursive_progress_right: ["Nhánh phải sẽ chuyển biên thành giá trị nào?", "Which bounds will the right branch pass next?", "Đệ quy tiến sang nửa phải với low = middle + 1.", "Recursion advances into the right half with low = middle + 1."],
  recursive_base_not_found: ["Điều kiện cơ sở nào chứng minh không tìm thấy?", "Which base condition proves the target is absent?", "low vượt high nên lời gọi đệ quy trả -1.", "low exceeds high, so the recursive call returns -1."],
  check_full: ["Hàng đợi đã đầy trước phép enqueue chưa?", "Is the queue full before enqueue?", "count được so với capacity trước mọi phép thêm.", "count is compared with capacity before every insertion."],
  enqueue: ["rear sẽ ghi và dịch chuyển đến đâu?", "Where will rear write and move next?", "Phần tử được ghi tại rear, rồi rear quay vòng và count tăng.", "The item is written at rear, then rear wraps and count increases."],
  check_empty: ["Hàng đợi có phần tử để lấy ra không?", "Does the queue contain an item to remove?", "count bằng 0 tạo nhánh underflow an toàn.", "A zero count selects the safe underflow branch."],
  dequeue: ["front nào bị xóa và dịch chuyển?", "Which front slot is cleared and advanced?", "Ô front được xóa, front quay vòng và count giảm.", "The front slot is cleared, front wraps and count decreases."],
  inspect: ["Thứ tự logic của các phần tử sống là gì?", "What is the logical order of the live items?", "Duyệt từ front khôi phục đúng thứ tự FIFO dù mảng đã quay vòng.", "Walking from front reconstructs FIFO order after wraparound."],
  reduce_item: ["Item nào được lấy tiếp và accumulator đổi ra sao?", "Which item is removed next, and how does the accumulator change?", "Reduce xử lý đúng một phần tử FIFO rồi cập nhật tổng.", "The reduction processes one FIFO item and updates the total."],
  reduce_complete: ["Queue phải rỗng hay được giữ nguyên sau reduce?", "Should the queue be empty or preserved after reduction?", "Hậu trạng thái được kiểm theo policy consume hoặc preserve.", "The post-state is checked against the consume or preserve policy."],
  reject_invalid_capacity: ["Sức chứa này có thể tạo hàng đợi không?", "Can this capacity create a queue?", "Sức chứa không dương bị từ chối trước khi cấp phát.", "A non-positive capacity is rejected before allocation."],
  call: ["Frame đệ quy mới mang chỉ số nào?", "Which index belongs to the new recursive frame?", "Một frame mới được đẩy với chỉ số hiện tại.", "A new frame is pushed with the current index."],
  base_case: ["Điều kiện dừng đã đạt chưa?", "Has the stopping condition been reached?", "index bằng độ dài tạo giá trị cơ sở 0.", "An index equal to the length produces the base value 0."],
  return: ["Frame này trả tổng từng phần nào?", "Which subtotal does this frame return?", "Frame hiện tại cộng giá trị của nó rồi trả kết quả lên frame gọi.", "The current frame adds its value and returns the result to its caller."],
  reject_non_integer: ["Dữ liệu có giữ invariant số nguyên không?", "Does the data preserve the integer invariant?", "Giá trị không phải số nguyên bị chặn trước lời gọi đệ quy.", "A non-integer is blocked before the recursive call."],
  probe_insert: ["Probe này va chạm hay tìm được ô trống?", "Does this probe collide or find an empty slot?", "Chỉ số probe được tính bằng linear probing; ô trống nhận key.", "Linear probing computes the index; an empty slot receives the key."],
  insert_commit: ["Key được ghi vào ô trống nào?", "Which empty slot receives the key?", "Commit chỉ thay đổi đúng ô đã được probe xác nhận là trống.", "The commit changes only the slot that the probe confirmed was empty."],
  insert_existing: ["Key đã tồn tại có làm thay đổi bảng không?", "Does an existing key change the table?", "Key trùng trả lại vị trí hiện có và giữ nguyên toàn bộ bảng.", "A duplicate key returns its existing position and leaves the table unchanged."],
  insert_reject_full: ["Sau bao nhiêu probe có thể kết luận bảng đầy?", "After how many probes can the table be declared full?", "Duyệt đủ một vòng rồi từ chối mà không thay đổi bảng.", "A complete probe cycle rejects the insertion without mutating the table."],
  probe_search: ["Probe này tìm thấy key hay phải đi tiếp?", "Does this probe find the key or continue?", "Tìm kiếm theo đúng chuỗi probe đã dùng khi chèn.", "Search follows the same probe sequence used during insertion."],
  search_stop_empty: ["Vì sao gặp ô trống chứng minh key không tồn tại?", "Why does an empty slot prove the key is absent?", "Ô trống kết thúc chuỗi linear probing nên tìm kiếm trả -1.", "An empty slot terminates the linear-probing chain, so search returns -1."],
  search_found: ["Probe nào xác nhận vị trí của key?", "Which probe confirms the key position?", "Giá trị tại ô probe khớp key nên vị trí được trả về.", "The value in the probed slot matches the key, so its index is returned."],
  search_exhausted: ["Điều gì bảo đảm failed search luôn kết thúc?", "What guarantees that a failed search terminates?", "Tối đa size probe được thực hiện; hết một vòng thì trả -1.", "At most size probes are performed; one complete cycle returns -1."],
  reject_non_integer_key: ["Mọi key có phải số nguyên không?", "Is every key an integer?", "Key sai kiểu bị từ chối trước khi tính địa chỉ băm.", "A key of the wrong type is rejected before hashing."],
  read_record: ["Dòng CSV này có đúng hai trường và pages hợp lệ không?", "Does this CSV row have two fields and valid pages?", "Dòng được đọc nguyên trạng trước khi kiểm tra cấu trúc và chuyển kiểu.", "The row is read verbatim before shape checks and conversion."],
  reject_record: ["Record có bị từ chối trước khi tạo object không?", "Is the record rejected before object construction?", "Số trang không dương bị chặn nên không object nào được tạo.", "A non-positive page count is blocked, so no object is constructed."],
  construct_object: ["Bản ghi hợp lệ tạo object nào?", "Which object is built from the valid row?", "Book được tạo từ title và pages đã chuyển sang số nguyên.", "A Book is constructed from the title and converted integer pages."],
  update: ["Object tìm thấy có chấp nhận số trang mới không?", "Does the matched object accept the new page count?", "Setter giữ invariant pages dương và báo rõ cập nhật thành công hay thất bại.", "The setter preserves the positive-pages invariant and reports success or failure."],
  lookup_not_found: ["Điều gì xảy ra khi không object nào khớp tiêu đề?", "What happens when no object matches the title?", "Duyệt hết danh sách tạo kết quả NOT_FOUND rõ ràng.", "Exhausting the list produces an explicit NOT_FOUND result."],
};

function clone(value) {
  return structuredClone(value);
}

function slugId(value) {
  return value.toLowerCase().replaceAll("_", "-");
}

function resultWithoutTrace(result) {
  const copy = clone(result);
  delete copy.trace;
  return copy;
}

function initialDomain(slug, input) {
  if (slug === "data-models") return { records: clone(input.records), record_valid: null, capacity_ok: null, random_values: [], random_average: null };
  if (slug === "binary-search") return { values: clone(input.values), target: input.target, low: 0, high: input.values.length - 1, middle: null, recursive_stack: [], recursive_low: null, recursive_high: null, recursive_middle: null, status: "READY" };
  if (slug === "queue") return { capacity: input.capacity, items: input.capacity > 0 ? Array(input.capacity).fill(null) : [], front: 0, rear: 0, count: 0, live: [], reduce_total: 0, reduce_mode: input.reduce_mode ?? "consume" };
  if (slug === "recursion") return { values: clone(input.values), call_stack: [], returned: {}, status: "READY" };
  if (slug === "hashing") return { size: input.size, slots: input.size > 0 ? Array(input.size).fill(null) : [], last_probe: null, status: "READY" };
  return { books: [], pending_record: null, lookup_title: input.lookup_title, new_pages: input.new_pages, found: null, status: "READY" };
}

function transition(slug, input, before, step, finalResult, isFinal) {
  const after = clone(before);
  const domain = after.domain;
  after.trace_cursor += 1;
  after.last_event = step.event;

  if (slug === "data-models") {
    if (step.event === "check_record") domain.record_valid = step.valid;
    if (step.event === "check_capacity") domain.capacity_ok = step.count < step.capacity;
    if (step.event === "append") domain.records.push(clone(step.record));
    if (step.event === "generate_random_value" && step.accepted) domain.random_values.push(step.candidate);
    if (step.event === "summarise_random_data") domain.random_average = step.average;
  } else if (slug === "binary-search") {
    if (step.event === "inspect_middle") {
      domain.low = step.low; domain.high = step.high; domain.middle = step.middle;
      if (step.value === input.target) domain.status = "FOUND";
      else if (input.target < step.value) domain.high = step.middle - 1;
      else domain.low = step.middle + 1;
    }
    if (step.event === "search_exhausted") { domain.low = step.low; domain.high = step.high; domain.status = "NOT_FOUND"; }
    if (step.event === "reject_unsorted_input") domain.status = "UNSORTED";
    if (step.event === "recursive_call") {
      domain.recursive_low = step.low;
      domain.recursive_high = step.high;
      domain.recursive_stack.push({ low: step.low, high: step.high });
    }
    if (step.event === "recursive_inspect") domain.recursive_middle = step.middle;
    if (step.event === "recursive_progress_left" || step.event === "recursive_progress_right") {
      domain.recursive_low = step.next_low;
      domain.recursive_high = step.next_high;
    }
    if (step.event === "recursive_base_not_found") domain.status = "NOT_FOUND";
  } else if (slug === "queue") {
    if (step.event === "enqueue" && domain.capacity > 0) {
      domain.items[step.index] = step.item;
      domain.rear = (step.index + 1) % domain.capacity;
      domain.count += 1;
    }
    if (step.event === "dequeue" && domain.capacity > 0) {
      domain.items[step.index] = null;
      domain.front = (step.index + 1) % domain.capacity;
      domain.count -= 1;
    }
    if (step.event === "inspect") domain.live = clone(step.values);
    if (step.event === "reduce_item") domain.reduce_total = step.total;
    if (step.event === "reduce_complete") { domain.reduce_total = step.total; domain.reduce_mode = step.mode; }
    if (step.event === "reject_invalid_capacity") domain.status = "INVALID_CAPACITY";
  } else if (slug === "recursion") {
    if (step.event === "call") domain.call_stack.push(step.index);
    if (step.event === "base_case") { domain.returned[String(step.index)] = step.result; domain.call_stack.pop(); }
    if (step.event === "return") { domain.returned[String(step.index)] = step.result; domain.call_stack.pop(); }
    if (step.event === "reject_non_integer") domain.status = "INVALID_VALUE";
  } else if (slug === "hashing") {
    if (step.event === "probe_insert") {
      const occupied = domain.slots[step.index] !== null;
      domain.last_probe = { mode: "insert", key: step.key, index: step.index, step: step.step, occupied };
    }
    if (step.event === "insert_commit") { domain.slots = clone(step.after); domain.status = "INSERTED"; }
    if (step.event === "insert_existing") domain.status = "EXISTING";
    if (step.event === "insert_reject_full") domain.status = "FULL";
    if (step.event === "probe_search") domain.last_probe = { mode: "search", key: step.key, index: step.index, step: step.step, value: domain.slots[step.index] };
    if (step.event === "search_stop_empty" || step.event === "search_exhausted") domain.status = "NOT_FOUND";
    if (step.event === "search_found") domain.status = "FOUND";
    if (step.event === "reject_non_integer_key") domain.status = "INVALID_KEY";
  } else {
    if (step.event === "read_record") domain.pending_record = { line: step.line, fields: clone(step.fields) };
    if (step.event === "reject_record") { domain.pending_record = null; domain.status = "INVALID_RECORD"; }
    if (step.event === "construct_object") {
      const fields = domain.pending_record.fields;
      const record = { type: step.type, title: step.title, pages: Number(fields[2]), line: step.line };
      if (step.type === "EBOOK") record.file_format = fields[3];
      domain.books.push(record);
      domain.pending_record = null;
    }
    if (step.event === "update") {
      const book = domain.books.find((item) => item.title === step.title);
      if (step.updated && book) book.pages = step.new_pages;
      domain.found = book ? clone(book) : null;
      domain.status = step.updated ? "UPDATED" : "INVALID_UPDATE";
    }
    if (step.event === "lookup_not_found") { domain.found = null; domain.status = "NOT_FOUND"; }
  }
  if (isFinal) domain.status = finalResult.status;
  return after;
}

function activeLines(slug, step, before, input, isFinal) {
  if (!LINE_BINDINGS[slug]?.[step.event]) throw new Error(`${slug}: no declared source binding for ${step.event}.`);
  if (isFinal && !FINAL_LINE_BINDINGS[slug]) throw new Error(`${slug}: no declared final-output binding.`);
  if (["data-models", "queue", "object-files"].includes(slug)) {
    return [...LINE_BINDINGS[slug][step.event], ...(isFinal ? FINAL_LINE_BINDINGS[slug] : [])];
  }
  const line = (numbers) => numbers.map((number) => `${slug}.v1.L${String(number).padStart(3, "0")}`);
  if (slug === "data-models") {
    if (step.event === "check_record") return line(step.valid ? [5, 6, 7, 8, 9, 10, 11, 15, 16] : [5, 6, 7, 8, 9, 10, 11, 15, 16, 17]);
    if (step.event === "check_capacity") return line(step.count >= step.capacity ? [18, 19, 20] : [18, 19]);
    if (step.event === "append") return line([21, 22, 23]);
    return line([30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
  }
  if (slug === "binary-search") {
    if (step.event === "reject_unsorted_input") return line([5, 6, 7, 8, 9, 37, 38, 39]);
    if (step.event === "search_exhausted") return line([30, 31]);
    if (step.event === "recursive_call") return line([48, 49, 50]);
    if (step.event === "recursive_base_not_found") return line([50, 51, 52, 66, 68, 69, 70, 71, 72, 73]);
    if (step.event === "recursive_inspect") {
      const found = step.value === input.target;
      return line([53, 54, 55, ...(found ? [56, 66, 68, 69, 70, 71, 72, 73] : [57])]);
    }
    if (step.event === "recursive_progress_left") return line([57, 58, 59]);
    if (step.event === "recursive_progress_right") return line([57, 60, 61]);
    const branch = step.value === input.target ? [24, 25] : input.target < step.value ? [24, 26, 27] : [24, 26, 28, 29];
    return line([15, 16, 17, 18, 19, 20, 21, 22, 23, ...branch]);
  }
  if (slug === "queue") {
    if (step.event === "check_full") return line(step.count === step.capacity ? [17, 18, 19] : [17, 18]);
    if (step.event === "enqueue") return line([20, 21, 22, 23, 24, 25]);
    if (step.event === "check_empty") return line(step.count === 0 ? [28, 29, 30] : [28, 29]);
    if (step.event === "dequeue") return line([31, 32, 33, 34, 35, 36, 37]);
    if (step.event === "reject_invalid_capacity") return line([7, 8, 9, 49, 50, 51, 52]);
    return line([39, 40, 41, 42, 43, 44, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73]);
  }
  if (slug === "recursion") {
    if (step.event === "call") return line([5, 6, 7]);
    if (step.event === "reject_non_integer") return line([26, 27, 28]);
    const completion = isFinal ? [16, 17, 18, 19, 20, 29, 30, 31, 32, 33, 34, 35] : [];
    if (step.event === "base_case") return line([7, 8, 9, ...completion]);
    return line([10, 11, 12, 13, ...completion]);
  }
  if (slug === "hashing") {
    return [...LINE_BINDINGS.hashing[step.event], ...(isFinal ? FINAL_LINE_BINDINGS.hashing : [])];
  }
  if (step.event === "read_record") {
    const badPages = Number.isNaN(Number(step.fields[2]));
    return line([18, 19, 20, 21, 73, 24, 74, ...(badPages ? [26, 27, 37, 38] : [])]);
  }
  if (step.event === "construct_object") {
    return step.type === "EBOOK"
      ? line([63, 64, 65, 66, 75, 76, 78, 79, 82, 83])
      : line([7, 8, 9, 10, 75, 76, 77, 82, 83]);
  }
  if (step.event === "update") {
    const setterBranch = step.updated ? [56, 57, 59, 60] : [56, 57, 58];
    return line([86, 87, 88, 89, ...setterBranch, 90, 91, 94, 95, 96, 97, 98, 99, 100, 101]);
  }
  return line([86, 87, 88, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101]);
}

function eventEnvelope({ slug, pattern, caseKind, traceId, sequence, before, after, step, result, isFinal }) {
  const eventName = step.event;
  const wording = WORDING[eventName];
  const eventId = `${traceId}.event-${String(sequence + 1).padStart(3, "0")}`;
  const dsaVisuals = (PILOT_DSA_VISUAL_IDS_BY_PATTERN[pattern] ?? []).map((id) => ({ id, ...DSA_VISUAL_QUESTIONS[id] }));
  const dsaQuestion = {
    vi: dsaVisuals.map((item) => item.vi).join(" "),
    en: dsaVisuals.map((item) => item.en).join(" "),
  };
  return {
    schema_version: "2.0.0",
    artifact_type: "VisualEventBinding",
    record: {
      event_id: eventId,
      trace_id: traceId,
      sequence,
      event_type: EVENT_TYPES[eventName],
      active_line_ids: activeLines(slug, step, before, before.fixture_input, isFinal),
      before,
      delta: {
        execution_trace_event: clone(step),
        pattern_focus: PATTERN_FOCUS[pattern].includes(eventName),
      },
      after,
      output_delta: isFinal
        ? { emitted_trace_event: clone(step), final_result: resultWithoutTrace(result) }
        : { emitted_trace_event: clone(step) },
      invariant_or_criterion: {
        vi: `${dsaQuestion.vi ? `${dsaQuestion.vi} ` : ""}${pattern}: sự kiện ${eventName} phải khớp trace đã chạy lại độc lập và giữ đúng chuyển trạng thái đang hiển thị.`,
        en: `${dsaQuestion.en ? `${dsaQuestion.en} ` : ""}${pattern}: event ${eventName} must match the independently rerun trace and preserve the displayed state transition.`,
      },
      prediction: { vi: wording[0], en: wording[1] },
      feedback: { vi: wording[2], en: wording[3] },
      visual_targets: [
        ...dsaVisuals.map((item) => `visual.dsa.${item.id}`),
        `visual.${slug}.state`,
        `visual.${slug}.${eventName}`,
      ],
      accessibility: {
        accessible_label: {
          vi: `Bước ${sequence + 1}: ${eventName}`,
          en: `Step ${sequence + 1}: ${eventName}`,
        },
        action_description: { vi: wording[0], en: wording[1] },
        interaction_role: "step",
        keyboard_instruction: {
          vi: "Dùng phím mũi tên trái và phải để chuyển bước; nhấn Enter để xem phản hồi của bước đang chọn.",
          en: "Use the left and right arrow keys to change step; press Enter to reveal feedback for the selected step.",
        },
        focus_target: `${eventId}.focus`,
        focus_order: sequence,
        live_status: {
          mode: EVENT_TYPES[eventName] === "reject" ? "assertive" : "polite",
          message: { vi: wording[2], en: wording[3] },
        },
      },
    },
  };
}

function scenario({ slug, artifact, pattern, caseKind, fixture, output, result, executionEvidenceRef }) {
  const patternSlug = slugId(pattern);
  const traceId = `ac-9618-p4-2026-python.trace.${slug}.${patternSlug}.${caseKind}.pilot-v1`;
  let state = {
    fixture_ref: fixture.fixture_id,
    fixture_input: clone(fixture.input),
    trace_cursor: 0,
    last_event: null,
    domain: initialDomain(slug, fixture.input),
  };
  const events = result.trace.map((step, sequence) => {
    const before = clone(state);
    const after = transition(slug, fixture.input, state, step, result, sequence === result.trace.length - 1);
    state = after;
    return eventEnvelope({ slug, pattern, caseKind, traceId, sequence, before, after: clone(after), step, result, isFinal: sequence === result.trace.length - 1 });
  });
  const record = {
    pattern_id: pattern,
    scenario_id: `ac-9618-p4-2026-python.scenario.${slug}.${patternSlug}.${caseKind}.pilot-v1`,
    case_kind: caseKind,
    trace_id: traceId,
    python_artifact_id: artifact.python_artifact_id,
    artifact_version: artifact.version,
    initial_state: events[0].record.before,
    event_ids: events.map((event) => event.record.event_id),
    expected_output_ref: output.expected_output_id,
    fixture_ref: fixture.fixture_id,
    execution_evidence_ref: executionEvidenceRef,
  };
  if (artifact.pattern_ids.length > 1) {
    record.equivalence_justification = `This ${caseKind} execution is the shared independently rerun path of the integrated ${slug} Python artifact. Pattern ${pattern} focuses on ${PATTERN_FOCUS[pattern].join(", ")}; sibling patterns intentionally reuse the executed path with distinct trace and event identities.`;
  }
  return {
    trace: { schema_version: "2.0.0", artifact_type: "VisualScenarioTrace", record },
    events,
  };
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function main() {
  const rerun = await readJson(path.join(A3_ROOT, "INDEPENDENT_RERUN.json"));
  const lineMigration = await readJson(path.join(A3_ROOT, "LINE_ID_MIGRATION.json"));
  const rerunByLesson = new Map(rerun.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const migrationByLesson = new Map(lineMigration.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const manifest = {
    schema_version: "p4r2-visual-pilot-manifest-v1",
    generated_from: "p4r2/a3/INDEPENDENT_RERUN.json",
    line_id_migration_ref: "p4r2/a3/LINE_ID_MIGRATION.json",
    lessons: [],
    counts: { lessons: 0, patterns: 0, scenarios: 0, events: 0 },
    status: "A5_CANDIDATE_PENDING_INDEPENDENT_REVIEW",
  };

  for (const slug of SLUGS) {
    const artifact = await readJson(path.join(PYTHON_ROOT, slug, "artifact.json"));
    const lessonEvidence = rerunByLesson.get(artifact.lesson_id);
    const migration = migrationByLesson.get(artifact.lesson_id);
    if (!lessonEvidence) throw new Error(`${slug}: independent rerun evidence is missing.`);
    if (!migration) throw new Error(`${slug}: line-ID migration record is missing.`);
    const traces = [];
    const events = [];
    const coverageContracts = artifact.pattern_ids.map((pattern) => ({
      pattern_id: pattern,
      focus_event_names: PATTERN_FOCUS[pattern],
      scenario_case_kinds: CASES,
      execution_scope: "integrated_python_artifact",
      contract: "Every case binds the exact independent rerun trace. A focused event may be unreachable in an early-rejection case; the rejection remains required evidence for that pattern.",
    }));

    for (const pattern of artifact.pattern_ids) {
      for (const caseKind of CASES) {
        const fixture = artifact.fixtures.find((item) => item.case_kind === caseKind);
        const output = artifact.expected_outputs.find((item) => item.fixture_ref === fixture.fixture_id);
        const evidenceCase = lessonEvidence.cases.find((item) => item.case_kind === caseKind);
        if (JSON.stringify(evidenceCase.result) !== JSON.stringify(output.value)) {
          throw new Error(`${slug}/${caseKind}: canonical expected output differs from independent rerun result.`);
        }
        const built = scenario({
          slug,
          artifact,
          pattern,
          caseKind,
          fixture,
          output,
          result: evidenceCase.result,
          executionEvidenceRef: lessonEvidence.execution_evidence_id,
        });
        traces.push(built.trace);
        events.push(...built.events);
      }
    }

    const document = {
      schema_version: "paper4-p4r2-visual-pilot-v1",
      lesson_id: artifact.lesson_id,
      python_artifact_ref: artifact.python_artifact_id,
      artifact_version: artifact.version,
      coverage_contracts: coverageContracts,
      traces,
      events,
    };
    const retiredLineIds = new Set(migration.retired_line_ids);
    const retainedRetiredIds = events.flatMap((event) => event.record.active_line_ids).filter((id) => retiredLineIds.has(id));
    if (retainedRetiredIds.length > 0) throw new Error(`${slug}: visual bindings retain retired line IDs: ${[...new Set(retainedRetiredIds)].join(", ")}`);
    const directory = path.join(VISUAL_ROOT, slug);
    await mkdir(directory, { recursive: true });
    const bytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`, "utf8");
    const relativePath = `content/paper4/visuals/pilot/${slug}/visuals.json`;
    await writeFile(path.join(ROOT, relativePath), bytes);
    manifest.lessons.push({
      slug,
      lesson_id: artifact.lesson_id,
      python_artifact_id: artifact.python_artifact_id,
      pattern_ids: artifact.pattern_ids,
      scenarios: traces.length,
      events: events.length,
      path: relativePath,
      sha256: sha256(bytes),
      retired_line_ids_rejected: migration.retired_line_ids.length,
    });
    manifest.counts.lessons += 1;
    manifest.counts.patterns += artifact.pattern_ids.length;
    manifest.counts.scenarios += traces.length;
    manifest.counts.events += events.length;
  }

  await mkdir(EVIDENCE_ROOT, { recursive: true });
  await writeFile(path.join(EVIDENCE_ROOT, "VISUAL_PILOT_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ decision: "GENERATED", ...manifest.counts }));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});

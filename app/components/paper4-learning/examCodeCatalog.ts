import type { LocalizedText } from "@/app/components/paper4-visual/types";

export type ExamTraceStep = Readonly<{
  active: readonly number[];
  facts: readonly Readonly<{ label: LocalizedText; value: LocalizedText | number }>[];
  explanation: LocalizedText;
}>;

export type ExamPattern = Readonly<{
  patternId: string;
  title: LocalizedText;
  caption: LocalizedText;
  rule: LocalizedText;
  code: readonly string[];
  steps: readonly ExamTraceStep[];
}>;

const bi = (en: string, vi: string): LocalizedText => ({ en, vi });
const fact = (labelEn: string, labelVi: string, valueEn: string | number, valueVi: string | number = valueEn): ExamTraceStep["facts"][number] => ({
  label: bi(labelEn, labelVi),
  value: typeof valueEn === "number" ? valueEn : bi(valueEn, String(valueVi)),
});

export const EXAM_CODE_CATALOG: readonly ExamPattern[] = [
  {
    patternId: "BINARY_SEARCH", title: bi("Binary Search", "Tìm kiếm nhị phân"), caption: bi("Return the index of target in an ascending list", "Trả index của target trong danh sách tăng dần"),
    rule: bi("The input must be sorted. Exclude middle after every failed comparison and return -1 only after the interval is empty.", "Input phải được sắp xếp. Loại middle sau mỗi lần so sánh sai và chỉ trả -1 khi khoảng tìm kiếm đã rỗng."),
    code: ["def binary_search(values, target):", "    low = 0", "    high = len(values) - 1", "    while low <= high:", "        middle = (low + high) // 2", "        if values[middle] == target:", "            return middle", "        if target < values[middle]:", "            high = middle - 1", "        else:", "            low = middle + 1", "    return -1"],
    steps: [
      { active: [2, 3, 4], facts: [fact("low", "low", 0), fact("high", "high", 6)], explanation: bi("Start with the complete closed interval.", "Bắt đầu với toàn bộ khoảng đóng.") },
      { active: [5, 6], facts: [fact("middle", "middle", 3), fact("middle value", "giá trị giữa", 23)], explanation: bi("Inspect the middle value before choosing a half.", "Đọc giá trị giữa trước khi chọn một nửa.") },
      { active: [8, 9], facts: [fact("target", "target", 19), fact("new high", "high mới", 2)], explanation: bi("The target is smaller, so exclude middle and the right half.", "Target nhỏ hơn, nên loại middle và nửa phải.") },
      { active: [6, 7], facts: [fact("middle value", "giá trị giữa", 19), fact("returned index", "index trả về", 2)], explanation: bi("Equality returns the matching index immediately.", "Khi bằng nhau, trả index khớp ngay.") },
    ],
  },
  {
    patternId: "COUNT_OCCURRENCES", title: bi("Count every match", "Đếm mọi phần tử khớp"), caption: bi("Count 4 in [4, 2, 4, 8]", "Đếm số 4 trong [4, 2, 4, 8]"),
    rule: bi("Scan the complete collection and increase count once for each match.", "Quét hết collection và tăng count đúng một lần cho mỗi phần tử khớp."),
    code: ["def count_occurrences(values, target):", "    count = 0", "    for value in values:", "        if value == target:", "            count += 1", "    return count"],
    steps: [
      { active: [2], facts: [fact("count", "count", 0)], explanation: bi("Initialise the accumulator before the loop.", "Khởi tạo biến đếm trước vòng lặp.") },
      { active: [3, 4, 5], facts: [fact("value", "value", 4), fact("match", "khớp", "True", "Đúng"), fact("count", "count", 1)], explanation: bi("The first 4 matches, so count becomes 1.", "Số 4 đầu tiên khớp, nên count trở thành 1.") },
      { active: [3, 4, 5], facts: [fact("value", "value", 4), fact("count", "count", 2)], explanation: bi("Continue scanning: the second 4 must also count.", "Tiếp tục quét: số 4 thứ hai cũng phải được đếm.") },
      { active: [6], facts: [fact("returned", "giá trị trả về", 2)], explanation: bi("Return only after the loop finishes.", "Chỉ return sau khi vòng lặp kết thúc.") },
    ],
  },
  {
    patternId: "FILTER_RECORDS", title: bi("Filter matching records", "Lọc record phù hợp"), caption: bi("Retain amounts at least 4", "Giữ các amount ít nhất bằng 4"),
    rule: bi("Test every record and append every match in scan order.", "Kiểm tra mọi record và append mọi match theo thứ tự quét."),
    code: ["def filter_records(records, threshold):", "    selected = []", "    for record in records:", "        if record[\"amount\"] >= threshold:", "            selected.append(record)", "    return selected"],
    steps: [
      { active: [2], facts: [fact("selected", "selected", "[]")], explanation: bi("Start with an empty result list.", "Bắt đầu với danh sách kết quả rỗng.") },
      { active: [3, 4, 5], facts: [fact("amount", "amount", 5), fact("selected", "selected", "[5]")], explanation: bi("5 meets the condition, so append its record.", "5 thỏa điều kiện, nên append record đó.") },
      { active: [3, 4], facts: [fact("amount", "amount", 2), fact("selected", "selected", "[5]")], explanation: bi("2 is skipped, but the scan continues.", "2 bị bỏ qua, nhưng vòng quét vẫn tiếp tục.") },
      { active: [6], facts: [fact("returned amounts", "amount trả về", "[5, 4]")], explanation: bi("Return all retained records after the complete scan.", "Trả toàn bộ record đã giữ sau khi quét hết.") },
    ],
  },
  {
    patternId: "GROUP_AGGREGATE", title: bi("Build grouped totals", "Tính tổng theo nhóm"), caption: bi("A:5, B:2, A:4", "A:5, B:2, A:4"),
    rule: bi("Create a key once, then update its existing total.", "Tạo key đúng một lần, sau đó cập nhật tổng hiện có."),
    code: ["def group_totals(records):", "    totals = {}", "    for record in records:", "        key = record[\"group\"]", "        if key not in totals:", "            totals[key] = 0", "        totals[key] += record[\"amount\"]", "    return totals"],
    steps: [
      { active: [2], facts: [fact("totals", "totals", "{}")], explanation: bi("Initialise one dictionary for all groups.", "Khởi tạo một dictionary cho mọi nhóm.") },
      { active: [5, 6, 7], facts: [fact("record", "record", "A:5"), fact("totals", "totals", "{'A': 5}")], explanation: bi("A is new: create it at 0, then add 5.", "A là key mới: tạo với 0, rồi cộng 5.") },
      { active: [5, 7], facts: [fact("record", "record", "A:4"), fact("totals", "totals", "{'A': 9, 'B': 2}")], explanation: bi("A exists, so update it rather than creating another key.", "A đã tồn tại, nên cập nhật thay vì tạo key khác.") },
      { active: [8], facts: [fact("returned", "giá trị trả về", "{'A': 9, 'B': 2}")], explanation: bi("Return after every record contributes once.", "Return sau khi mỗi record đóng góp đúng một lần.") },
    ],
  },
  {
    patternId: "STACK_PAIR", title: bi("Pop one item from each stack", "Lấy một phần tử từ mỗi stack"), caption: bi("left [3, 7], right [4, 9]", "left [3, 7], right [4, 9]"),
    rule: bi("Check both stacks before changing either one.", "Kiểm tra cả hai stack trước khi thay đổi stack nào."),
    code: ["def pop_pair(left_stack, right_stack):", "    if left_stack.top == -1 or right_stack.top == -1:", "        return None", "    left_item = left_stack.pop()", "    right_item = right_stack.pop()", "    return [left_item, right_item]"],
    steps: [
      { active: [2, 3], facts: [fact("left top", "top trái", 1), fact("right top", "top phải", 1)], explanation: bi("Both stacks contain an item, so continue.", "Cả hai stack có phần tử, nên tiếp tục.") },
      { active: [4], facts: [fact("left item", "phần tử trái", 7), fact("left", "left", "[3]")], explanation: bi("Pop the left stack once.", "Pop stack bên trái một lần.") },
      { active: [5], facts: [fact("right item", "phần tử phải", 9), fact("right", "right", "[4]")], explanation: bi("Pop the right stack once.", "Pop stack bên phải một lần.") },
      { active: [6], facts: [fact("returned", "giá trị trả về", "[7, 9]")], explanation: bi("Return the pair in the order required.", "Trả cặp theo thứ tự đề yêu cầu.") },
    ],
  },
  {
    patternId: "STACK_REDUCE", title: bi("Use the correct operand order", "Dùng đúng thứ tự toán hạng"), caption: bi("[12, 5] represents 12 - 5", "[12, 5] biểu diễn 12 - 5"),
    rule: bi("The first pop is the right operand; the second is the left operand.", "Lần pop đầu là toán hạng phải; lần pop thứ hai là toán hạng trái."),
    code: ["def subtract_top_two(stack):", "    if stack.top < 1:", "        return None", "    right = stack.pop()", "    left = stack.pop()", "    return left - right"],
    steps: [
      { active: [2, 3], facts: [fact("items available", "số phần tử", 2)], explanation: bi("Two operands are available.", "Có đủ hai toán hạng.") },
      { active: [4], facts: [fact("right", "toán hạng phải", 5)], explanation: bi("The top item is the right operand.", "Phần tử trên đỉnh là toán hạng phải.") },
      { active: [5], facts: [fact("left", "toán hạng trái", 12)], explanation: bi("The next item is the left operand.", "Phần tử tiếp theo là toán hạng trái.") },
      { active: [6], facts: [fact("calculation", "phép tính", "12 - 5"), fact("returned", "giá trị trả về", 7)], explanation: bi("Evaluate left minus right.", "Tính toán hạng trái trừ toán hạng phải.") },
    ],
  },
  {
    patternId: "RANDOM_ARRAY", title: bi("Generate random values", "Tạo dãy số ngẫu nhiên"), caption: bi("Create count values inside an inclusive range", "Tạo count giá trị trong khoảng bao gồm hai biên"),
    rule: bi("Repeat exactly count times and use the stated inclusive bounds.", "Lặp đúng count lần và dùng khoảng bao gồm hai biên đã cho."),
    code: ["from random import randint", "", "def make_random_array(size, lower, upper):", "    values = []", "    for _ in range(size):", "        values.append(randint(lower, upper))", "    return values"],
    steps: [
      { active: [4], facts: [fact("values", "values", "[]"), fact("count", "count", 3)], explanation: bi("Start with an empty result list.", "Bắt đầu với danh sách kết quả rỗng.") },
      { active: [5, 6], facts: [fact("generated", "số vừa tạo", 4), fact("values", "values", "[4]")], explanation: bi("Generate one value and append it during each iteration.", "Mỗi vòng lặp tạo một giá trị rồi append.") },
      { active: [5, 6], facts: [fact("iterations", "số vòng lặp", 3), fact("values", "values", "[4, 7, 2]")], explanation: bi("Stop after exactly count iterations.", "Dừng sau đúng count vòng lặp.") },
      { active: [7], facts: [fact("returned length", "độ dài trả về", 3)], explanation: bi("Return the completed list.", "Trả danh sách hoàn chỉnh.") },
    ],
  },
  {
    patternId: "HASH_SETUP", title: bi("Create a fixed hash table", "Tạo hash table kích thước cố định"), caption: bi("Seven empty slots", "Bảy slot rỗng"),
    rule: bi("Table size stays fixed; empty slots use one consistent sentinel.", "Kích thước table cố định; slot rỗng dùng cùng một sentinel."),
    code: ["def create_hash_table(size):", "    return [None] * size"],
    steps: [
      { active: [1, 2], facts: [fact("size", "size", 7)], explanation: bi("Allocate exactly the requested number of slots.", "Cấp phát đúng số slot được yêu cầu.") },
      { active: [2], facts: [fact("returned table", "table trả về", "[None, None, None, None, None, None, None]")], explanation: bi("Every slot starts empty and the new table is returned.", "Mọi slot bắt đầu rỗng và table mới được trả về.") },
    ],
  },
  {
    patternId: "HASH_SEARCH", title: bi("Search with linear probing", "Tìm kiếm bằng linear probing"), caption: bi("Start at key MOD table size", "Bắt đầu tại key MOD kích thước table"),
    rule: bi("Use the same probe sequence as insertion and stop at an empty slot or after one full cycle.", "Dùng cùng chuỗi probe như khi insert và dừng ở slot rỗng hoặc sau một vòng đầy đủ."),
    code: ["def hash_search(table, key):", "    start = key % len(table)", "    address = start", "    while table[address] is not None:", "        if table[address] == key:", "            return address", "        address = (address + 1) % len(table)", "        if address == start:", "            break", "    return -1"],
    steps: [
      { active: [2, 3], facts: [fact("key", "key", 24), fact("start", "start", 3)], explanation: bi("Calculate the home address once.", "Tính địa chỉ ban đầu đúng một lần.") },
      { active: [4, 5], facts: [fact("index", "index", 3), fact("slot", "slot", 10)], explanation: bi("The occupied slot is not the key, so continue probing.", "Slot đã có dữ liệu nhưng không phải key, nên tiếp tục probe.") },
      { active: [7, 8, 9], facts: [fact("next index", "index tiếp theo", 4)], explanation: bi("Modulo wraps the probe and the start check prevents an infinite loop.", "Modulo giúp quay vòng và kiểm tra start ngăn vòng lặp vô hạn.") },
      { active: [5, 6], facts: [fact("index", "index", 5), fact("slot", "slot", 24)], explanation: bi("The key matches, so return its index.", "Key khớp, nên trả về index.") },
    ],
  },
  {
    patternId: "INSERTION_SORT", title: bi("Insertion Sort", "Sắp xếp chèn"), caption: bi("Grow a sorted prefix from left to right", "Mở rộng vùng đã sắp xếp từ trái sang phải"),
    rule: bi("Save the key, shift larger values right, then place the key in the gap.", "Lưu key, dịch các giá trị lớn hơn sang phải, rồi đặt key vào chỗ trống."),
    code: ["def insertion_sort(values):", "    output = list(values)", "    for index in range(1, len(output)):", "        item = output[index]", "        position = index", "        while position > 0 and output[position - 1] > item:", "            output[position] = output[position - 1]", "            position -= 1", "        output[position] = item", "    return output"],
    steps: [
      { active: [2, 3, 4], facts: [fact("item", "item", 3), fact("sorted prefix", "vùng đã sắp xếp", "[2, 5]")], explanation: bi("Copy the input, then save the next item before shifting.", "Sao chép input, rồi lưu item tiếp theo trước khi dịch.") },
      { active: [6, 7, 8], facts: [fact("compared", "giá trị so sánh", 5), fact("position", "position", 1)], explanation: bi("Shift 5 right because it is larger than 3.", "Dịch 5 sang phải vì 5 lớn hơn 3.") },
      { active: [6], facts: [fact("compared", "giá trị so sánh", 2), fact("condition", "điều kiện", "False", "Sai")], explanation: bi("Stop shifting when the previous value is not larger.", "Dừng dịch khi giá trị trước không lớn hơn item.") },
      { active: [9, 10], facts: [fact("output", "output", "[2, 3, 5]")], explanation: bi("Place the item in the gap and return the sorted copy.", "Đặt item vào chỗ trống và trả bản sao đã sắp xếp.") },
    ],
  },
  {
    patternId: "ORDERED_INSERT", title: bi("Insert into an ordered fixed array", "Chèn vào mảng cố định đã sắp xếp"), caption: bi("Insert 4 into [1, 3, 7, _]", "Chèn 4 vào [1, 3, 7, _]"),
    rule: bi("Check capacity, shift from right to left, then write the item and increase count.", "Kiểm tra capacity, dịch từ phải sang trái, rồi ghi item và tăng count."),
    code: ["def ordered_insert(values, item, capacity):", "    if len(values) >= capacity:", "        return False", "    position = 0", "    while position < len(values) and values[position] <= item:", "        position += 1", "    values.append(None)", "    for index in range(len(values) - 1, position, -1):", "        values[index] = values[index - 1]", "    values[position] = item", "    return True"],
    steps: [
      { active: [2, 3], facts: [fact("length", "độ dài", 3), fact("capacity", "capacity", 4)], explanation: bi("There is one free slot, so insertion may continue.", "Còn một slot trống, nên có thể tiếp tục chèn.") },
      { active: [4, 5, 6], facts: [fact("item", "item", 4), fact("position", "position", 2)], explanation: bi("Scan to the first value greater than the item.", "Quét tới giá trị đầu tiên lớn hơn item.") },
      { active: [7, 8, 9], facts: [fact("shifted value", "giá trị được dịch", 7), fact("values", "values", "[1, 3, 7, 7]")], explanation: bi("Open one slot, then shift from right to left to avoid overwriting.", "Mở một slot rồi dịch từ phải sang trái để không ghi đè.") },
      { active: [10, 11], facts: [fact("values", "values", "[1, 3, 4, 7]"), fact("returned", "giá trị trả về", "True", "Đúng")], explanation: bi("Write the item in the gap and report success.", "Ghi item vào chỗ trống và báo thành công.") },
    ],
  },
  {
    patternId: "QUEUE_REDUCE", title: bi("Process a queue without losing order", "Xử lý queue mà không làm mất thứ tự"), caption: bi("Total every item while preserving the queue", "Tính tổng mọi item và giữ nguyên queue"),
    rule: bi("Capture the original count, then dequeue and enqueue exactly that many times.", "Lưu count ban đầu, rồi dequeue và enqueue đúng số lần đó."),
    code: ["def total_queue(queue):", "    original_count = queue.count", "    total = 0", "    for _ in range(original_count):", "        item = queue.dequeue()", "        total += item", "        queue.enqueue(item)", "    return total"],
    steps: [
      { active: [2, 3], facts: [fact("queue", "queue", "[4, 6, 2]"), fact("original count", "count ban đầu", 3)], explanation: bi("Freeze the number of items to process before rotation begins.", "Cố định số item cần xử lý trước khi xoay queue.") },
      { active: [4, 5, 6], facts: [fact("item", "item", 4), fact("total", "total", 4)], explanation: bi("Dequeue the front item and add it once.", "Dequeue item đầu và cộng đúng một lần.") },
      { active: [7], facts: [fact("queue", "queue", "[6, 2, 4]")], explanation: bi("Enqueue the item to preserve all data and relative order after a full rotation.", "Enqueue lại item để giữ dữ liệu và thứ tự tương đối sau một vòng.") },
      { active: [8], facts: [fact("returned", "giá trị trả về", 12), fact("queue", "queue", "[4, 6, 2]")], explanation: bi("After three rotations, return the total; the queue is restored.", "Sau ba lần xoay, trả total; queue trở về ban đầu.") },
    ],
  },
  {
    patternId: "RUN_LENGTH_ENCODE", title: bi("Run-length encode text", "Mã hóa run-length"), caption: bi("AAABB becomes [['A', 3], ['B', 2]]", "AAABB thành [['A', 3], ['B', 2]]"),
    rule: bi("Flush a run when the character changes and flush the final run after the loop.", "Chốt một run khi ký tự đổi và chốt run cuối sau vòng lặp."),
    code: ["def run_length_encode(text):", "    if text == \"\":", "        return []", "    encoded = []", "    current = text[0]", "    count = 1", "    for character in text[1:]:", "        if character == current:", "            count += 1", "        else:", "            encoded.append([current, count])", "            current = character", "            count = 1", "    encoded.append([current, count])", "    return encoded"],
    steps: [
      { active: [2, 3], facts: [fact("text", "text", "AAABB")], explanation: bi("Handle empty text before reading text[0].", "Xử lý chuỗi rỗng trước khi đọc text[0].") },
      { active: [4, 5, 6], facts: [fact("current", "current", "A"), fact("count", "count", 1)], explanation: bi("Start the first run from the first character.", "Bắt đầu run đầu từ ký tự đầu tiên.") },
      { active: [7, 8, 9], facts: [fact("character", "character", "A"), fact("count", "count", 3)], explanation: bi("Equal characters extend the current run.", "Ký tự giống nhau làm run hiện tại dài thêm.") },
      { active: [11, 12, 13], facts: [fact("character", "character", "B"), fact("encoded", "encoded", "[['A', 3]]")], explanation: bi("A changed to B: save A's run and start B's run.", "A đổi thành B: lưu run của A và bắt đầu run của B.") },
      { active: [14, 15], facts: [fact("returned", "giá trị trả về", "[['A', 3], ['B', 2]]")], explanation: bi("Flush the final run after the loop, then return.", "Chốt run cuối sau vòng lặp, rồi return.") },
    ],
  },
  {
    patternId: "STRING_COMPARE", title: bi("Compare two strings", "So sánh hai chuỗi"), caption: bi("Compare character by character", "So sánh từng ký tự"),
    rule: bi("Return at the first different character; if all shared characters match, compare lengths.", "Return tại ký tự khác đầu tiên; nếu phần chung giống nhau, so sánh độ dài."),
    code: ["def compare_text(left, right):", "    limit = min(len(left), len(right))", "    for index in range(limit):", "        if left[index] < right[index]:", "            return -1", "        if left[index] > right[index]:", "            return 1", "    if len(left) == len(right):", "        return 0", "    return -1 if len(left) < len(right) else 1"],
    steps: [
      { active: [2, 3], facts: [fact("left", "left", "CAT"), fact("right", "right", "CAR")], explanation: bi("Only indices shared by both strings are compared in the loop.", "Vòng lặp chỉ so sánh các index có ở cả hai chuỗi.") },
      { active: [4, 5], facts: [fact("index", "index", 0), fact("characters", "ký tự", "C = C")], explanation: bi("The first characters match, so no return occurs.", "Ký tự đầu giống nhau, nên chưa return.") },
      { active: [6, 7], facts: [fact("index", "index", 2), fact("characters", "ký tự", "T > R")], explanation: bi("The first difference decides the ordering immediately.", "Khác biệt đầu tiên quyết định thứ tự ngay.") },
      { active: [7], facts: [fact("returned", "giá trị trả về", 1)], explanation: bi("Return 1 because left is greater than right.", "Trả 1 vì left lớn hơn right.") },
    ],
  },
  {
    patternId: "TREE_SETUP", title: bi("Define a binary-tree node", "Định nghĩa node của cây nhị phân"), caption: bi("Each node stores data and two child references", "Mỗi node lưu data và hai reference con"),
    rule: bi("A new node starts with no left or right child.", "Node mới bắt đầu chưa có con trái hoặc con phải."),
    code: ["class Node:", "    def __init__(self, value):", "        self.value = value", "        self.left = None", "        self.right = None", "", "root = None"],
    steps: [
      { active: [1, 2], facts: [fact("new value", "value mới", 40)], explanation: bi("Create one node object for the supplied value.", "Tạo một object node cho value được truyền vào.") },
      { active: [3], facts: [fact("node value", "value của node", 40)], explanation: bi("Store the data item in the node.", "Lưu dữ liệu trong node.") },
      { active: [4, 5], facts: [fact("left", "left", "None"), fact("right", "right", "None")], explanation: bi("Both child references start empty.", "Cả hai reference con bắt đầu rỗng.") },
    ],
  },
  {
    patternId: "TREE_INSERT", title: bi("Insert into a binary search tree", "Chèn vào cây tìm kiếm nhị phân"), caption: bi("Follow comparisons until an empty child is found", "Theo kết quả so sánh tới khi gặp child rỗng"),
    rule: bi("Smaller values go left, larger values go right, and insertion stops at the first empty link.", "Giá trị nhỏ hơn đi trái, lớn hơn đi phải, và dừng tại link rỗng đầu tiên."),
    code: ["def insert(root, value):", "    if root is None:", "        return Node(value)", "    if value < root.value:", "        root.left = insert(root.left, value)", "    elif value > root.value:", "        root.right = insert(root.right, value)", "    return root"],
    steps: [
      { active: [1, 2, 3], facts: [fact("root", "root", 40), fact("value", "value", 30)], explanation: bi("The root exists, so compare rather than creating a new root.", "Root đã tồn tại, nên so sánh thay vì tạo root mới.") },
      { active: [4, 5], facts: [fact("comparison", "so sánh", "30 < 40"), fact("direction", "hướng", "left", "trái")], explanation: bi("A smaller value follows the left link.", "Giá trị nhỏ hơn đi theo link trái.") },
      { active: [2, 3], facts: [fact("left child", "con trái", "None"), fact("new node", "node mới", 30)], explanation: bi("The empty child becomes a new node.", "Child rỗng trở thành node mới.") },
      { active: [8], facts: [fact("returned root", "root trả về", 40)], explanation: bi("Return the root so the recursive link assignments are preserved.", "Trả root để giữ các phép gán link đệ quy.") },
    ],
  },
  {
    patternId: "TREE_TRAVERSE", title: bi("In-order traversal", "Duyệt in-order"), caption: bi("Visit left subtree, node, then right subtree", "Duyệt cây con trái, node, rồi cây con phải"),
    rule: bi("The base case stops at None; visit order for in-order is left, node, right.", "Base case dừng tại None; thứ tự in-order là trái, node, phải."),
    code: ["def inorder(node, output):", "    if node is not None:", "        inorder(node.left, output)", "        output.append(node.value)", "        inorder(node.right, output)"],
    steps: [
      { active: [1, 2], facts: [fact("node", "node", 40), fact("output", "output", "[]")], explanation: bi("A real node must process its three in-order actions.", "Node tồn tại phải thực hiện ba hành động in-order.") },
      { active: [3], facts: [fact("next node", "node tiếp theo", 30)], explanation: bi("Recurse through the complete left subtree first.", "Đệ quy qua toàn bộ cây con trái trước.") },
      { active: [4], facts: [fact("visited", "node đã thăm", 40), fact("output", "output", "[30, 40]")], explanation: bi("Visit the node after its left subtree.", "Thăm node sau cây con trái.") },
      { active: [5], facts: [fact("next node", "node tiếp theo", 60), fact("final output", "output cuối", "[30, 40, 60]")], explanation: bi("Finish with the right subtree.", "Kết thúc bằng cây con phải.") },
    ],
  },
] as const;

export const EXAM_CODE_BY_PATTERN = new Map(EXAM_CODE_CATALOG.map((pattern) => [pattern.patternId, pattern]));

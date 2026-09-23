#!/usr/bin/env python3
"""Build the deterministic Stage 4 B2 search/sort method submission."""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAGE4 = HERE.parents[2]
PLANNING = STAGE4.parent
ROOT = PLANNING.parent

CATALOG_PATH = PLANNING / "stage-2" / "EXAM_PATTERN_CATALOG.json"
MAP_PATH = PLANNING / "stage-3" / "BOOK_KNOWLEDGE_MAP.json"
SUPPORT_PATHS = [
    PLANNING / "stage-2" / "QUESTION_PATTERN_MAP.json",
    PLANNING / "stage-2" / "CONFUSABLE_PATTERNS.json",
    PLANNING / "stage-3" / "COVERAGE_MATRIX.json",
    PLANNING / "stage-3" / "LESSON_PACKAGES.json",
    PLANNING / "stage-1" / "SOURCE_ISSUES.json",
    STAGE4 / "schemas" / "pattern-card.schema.json",
    STAGE4 / "schemas" / "error-prevention.schema.json",
    STAGE4 / "schemas" / "design-briefs.schema.json",
]
MARKING_PATHS = [
    STAGE4 / "evidence" / "marking" / "2021-2022" / "MARKING_SUBMISSION.json",
    STAGE4 / "evidence" / "marking" / "2023-2024" / "MARKING_SUBMISSION.json",
    STAGE4 / "evidence" / "marking" / "2025" / "MARKING_SUBMISSION.json",
]
RISK_PATHS = [path.with_name("SOURCE_RISK_REGISTER.json") for path in MARKING_PATHS]

PATTERNS = [
    "ORDERED_INSERT", "LINEAR_SEARCH", "COUNT_OCCURRENCES", "FILTER_RECORDS",
    "GROUP_AGGREGATE", "BUBBLE_SORT", "INSERTION_SORT", "BINARY_SEARCH",
]

TITLES = {
    "ORDERED_INSERT": ("Chèn một bản ghi vào dãy đã sắp", "Insert one record into an ordered sequence"),
    "LINEAR_SEARCH": ("Tìm kiếm tuần tự", "Linear search"),
    "COUNT_OCCURRENCES": ("Đếm số lần thỏa điều kiện", "Count occurrences"),
    "FILTER_RECORDS": ("Lọc tất cả bản ghi thỏa điều kiện", "Filter all matching records"),
    "GROUP_AGGREGATE": ("Gom nhóm và cập nhật tổng hợp", "Group and update aggregates"),
    "BUBBLE_SORT": ("Sắp xếp nổi bọt", "Bubble sort"),
    "INSERTION_SORT": ("Sắp xếp chèn", "Insertion sort"),
    "BINARY_SEARCH": ("Tìm kiếm nhị phân", "Binary search"),
}

RECOGNITION = {
    "ORDERED_INSERT": ("Dãy đã có thứ tự; đề yêu cầu chèn đúng một mục và vẫn giữ thứ tự.", "The sequence is already ordered; insert exactly one item and preserve that order."),
    "LINEAR_SEARCH": ("Cần duyệt lần lượt dữ liệu chưa chắc đã sắp để tìm mục hoặc vị trí phù hợp.", "Scan data that is not guaranteed to be sorted to find a matching item or position."),
    "COUNT_OCCURRENCES": ("Kết quả là tổng số phần tử thỏa điều kiện, nên phải xét toàn bộ phạm vi sống.", "The result is the number of matching elements, so the complete live range must be examined."),
    "FILTER_RECORDS": ("Cần xuất hoặc thu thập mọi bản ghi thỏa đồng thời các điều kiện.", "Output or collect every record satisfying the combined conditions."),
    "GROUP_AGGREGATE": ("Mỗi khóa chỉ có một nhóm; mục mới cập nhật nhóm có sẵn hoặc tạo đúng một nhóm.", "Each key has one group; a new item updates an existing group or creates exactly one group."),
    "BUBBLE_SORT": ("Sắp toàn bộ dãy bằng các so sánh cặp kề nhau và hoán đổi sai thứ tự.", "Sort the complete sequence by comparing adjacent pairs and swapping those in the wrong order."),
    "INSERTION_SORT": ("Mở rộng tiền tố đã sắp bằng cách lấy một khóa, dịch các mục trước đó rồi đặt khóa.", "Grow a sorted prefix by taking one key, shifting prior items, then placing the key."),
    "BINARY_SEARCH": ("Dữ liệu đã sắp; mỗi phép so sánh loại bỏ một nửa khoảng tìm kiếm.", "The data is sorted; each comparison discards half of the remaining interval."),
}

DECISION_RULES = {
    "ORDERED_INSERT": ("Chỉ dùng khi dãy đã sắp và cần chèn một mục; chốt chiều, vị trí khóa bằng nhau và chính sách dung lượng trước khi dịch từ phải sang trái.", "Use only for inserting one item into an ordered sequence; fix direction, equal-key placement, and capacity policy before shifting right-to-left."),
    "LINEAR_SEARCH": ("Duyệt tuyến tính khi dữ liệu chưa bảo đảm đã sắp; dừng ở khớp đầu chỉ khi đề cần một kết quả, còn đếm hoặc lọc phải đi hết phạm vi.", "Scan linearly when sorted order is not guaranteed; stop at the first match only for a one-result contract, while count or filter must traverse the full range."),
    "COUNT_OCCURRENCES": ("Chọn lặp hoặc đệ quy theo yêu cầu đề, nhưng luôn xử lý toàn bộ phạm vi và cộng đúng một cho mỗi phần tử thỏa điều kiện.", "Choose iteration or recursion as required, but always process the complete range and add exactly one for each matching element."),
    "FILTER_RECORDS": ("Dùng phép AND trên đủ các trường và tiếp tục sau mỗi khớp để giữ mọi bản ghi; chốt cách biểu diễn kết quả rỗng.", "Apply AND across all required fields and continue after every match to retain all records; fix the empty-result representation."),
    "GROUP_AGGREGATE": ("Quét các nhóm sống trước; nếu khóa tồn tại thì cập nhật đúng nhóm đó, nếu không mới tạo đúng một nhóm và tăng số nhóm.", "Scan live groups first; update exactly the matching group when the key exists, otherwise create one group and increment the live count."),
    "BUBBLE_SORT": ("Dùng các lượt so sánh cặp kề theo đúng chiều, thu hẹp biên sau mỗi lượt và chỉ dừng sớm sau một lượt hoàn chỉnh không hoán đổi.", "Use passes of adjacent comparisons in the required direction, shrink the boundary after each pass, and stop early only after a complete no-swap pass."),
    "INSERTION_SORT": ("Duy trì tiền tố đã sắp: lưu bản ghi khóa, dịch các bản ghi phải đứng sau nó rồi đặt khóa; biến thể lặp/đệ quy phải giữ cùng bất biến.", "Maintain a sorted prefix: save the key record, shift records that belong after it, then place the key; iterative and recursive variants must preserve the same invariant."),
    "BINARY_SEARCH": ("Chỉ dùng với dữ liệu đã sắp theo cùng comparator; với biên bao hàm, tính midpoint nguyên và loại mid bằng ±1 ở cả lặp và đệ quy.", "Use only on data sorted by the same comparator; with inclusive bounds, compute an integer midpoint and exclude mid with ±1 in both iterative and recursive forms."),
}

ANCHORS = {
    "ORDERED_INSERT": "9618_s22_41_1(e)(ii)",
    "LINEAR_SEARCH": "9618_s21_41_2(b)(i)",
    "COUNT_OCCURRENCES": "9618_w25_43_3(a)(i)",
    "FILTER_RECORDS": "9618_w21_41_2(g)",
    "GROUP_AGGREGATE": "9618_w23_41_2(c)(iii)",
    "BUBBLE_SORT": "9618_w25_42_2(c)",
    "INSERTION_SORT": "9618_s25_43_2(b)",
    "BINARY_SEARCH": "9618_w25_42_2(e)",
}

# Only atoms assessing the B2 method are owned. Co-tagging never duplicates marks.
ATOM_SUFFIX_OVERRIDES = {
    "9618_w22_41_1(c)": {1, 4, 5, 6, 7},
    "9618_w22_43_1(c)": {1, 4, 5, 6, 7},
    "9618_w22_42_2(e)": {2, 3, 5, 6},
    "9618_s23_42_3(d)": {4, 5},
    "9618_s24_41_2(e)(ii)": {2},
    "9618_s24_43_2(e)(ii)": {2},
    "9618_s24_42_1(c)(i)": {3, 5},
}

METHODS = {
    "ORDERED_INSERT": [
        ("contract", "Chốt khóa, chiều sắp, quy tắc bằng nhau, giới hạn dung lượng và các trường phải đi cùng bản ghi.", "Fix the key, direction, equal-key rule, capacity limit, and fields that move with the record.", "Ngăn quy tắc so sánh thay đổi giữa tìm vị trí và dịch dữ liệu.", "Prevents the comparator from changing between locating and shifting.", "ordered", "the existing live sequence is ordered", "the input contract is complete", "setup", "Trace two equal keys and a full-capacity case."),
        ("qualify", "Nếu cấu trúc có giới hạn, kiểm tra mục mới có đủ điều kiện nằm trong phần được giữ hay không.", "If capacity is limited, decide whether the new item qualifies for the retained region.", "Tránh dịch dãy cho một mục chắc chắn bị loại.", "Avoids shifting the sequence for an item that must be discarded.", "qualification", "retained items still satisfy the capacity policy", "capacity is bounded", "progress", "Check just-better, equal, and just-worse boundary values."),
        ("locate", "Dùng đúng bộ so sánh để tìm vị trí chèn đầu tiên được quy tắc cho phép.", "Use the same comparator to locate the first permitted insertion position.", "Giữ nhất quán chiều sắp và xử lý giá trị bằng nhau.", "Keeps direction and equal-key handling consistent.", "insertion_index", "all positions before the cursor remain before the new item", "cursor is inside the live range", "progress", "Verify the neighbors on both sides of the chosen position."),
        ("shift", "Dịch lùi từng bản ghi hoàn chỉnh từ cuối vùng giữ về phía vị trí chèn.", "Shift complete records backward from the retained end toward the insertion position.", "Dịch từ phải sang trái tránh ghi đè dữ liệu chưa sao chép.", "Right-to-left shifting avoids overwriting data that is still needed.", "shifted_suffix", "the shifted suffix preserves order and whole-record integrity", "destination is within capacity", "progress", "Track record identities, not only key values."),
        ("place", "Đặt bản ghi mới đúng một lần và cắt phần vượt dung lượng nếu cần.", "Place the new record exactly once and trim any overflow when required.", "Hoàn tất hậu điều kiện mà không biến thao tác chèn thành sắp xếp toàn bộ.", "Completes the postcondition without turning one insertion into a full sort.", "final_sequence", "the retained live sequence remains ordered", "the insertion slot is open", "termination", "Confirm order, capacity, record integrity, and one occurrence of the new record."),
    ],
    "LINEAR_SEARCH": [
        ("contract", "Chốt khóa tìm, phạm vi sống, chuẩn hóa chữ hoa/thường, accessor và dạng kết quả.", "Fix the search key, live range, case normalization, accessor, and result contract.", "Tránh tìm đúng dữ liệu nhưng trả sai kiểu hoặc sai chỉ số.", "Prevents a correct match from producing the wrong result type or index.", "search_contract", "the target and result convention stay fixed", "input and live count are valid", "setup", "Check found-at-first, found-at-last, and absent results."),
        ("initialise", "Khởi tạo trạng thái chưa tìm thấy và vị trí theo sentinel đã chốt.", "Initialise not-found state and the agreed position sentinel.", "Tạo kết quả đúng cho trường hợp không có khớp.", "Establishes the correct default for an absent target.", "result_state", "no unvisited element has influenced the result", "before the first visit", "setup", "State the exact absent sentinel before tracing."),
        ("scan", "Duyệt từng chỉ số hợp lệ trong phạm vi dữ liệu đang dùng.", "Visit every valid index in the live data range.", "Tìm tuyến tính không được bỏ qua đầu hoặc cuối phạm vi.", "Linear search must not skip either end of the range.", "cursor", "all earlier live elements have been checked", "cursor is within the live range", "progress", "Mark each visited index on an empty and one-item input."),
        ("compare", "Đọc đúng trường hoặc accessor, chuẩn hóa nếu cần rồi so sánh với khóa tìm.", "Read the required field or accessor, normalize when required, then compare with the target.", "So sánh đúng biểu diễn mà đề quy định.", "Compares the representation required by the question.", "candidate_key", "the comparison uses the fixed equality rule", "a candidate has been read", "progress", "Check a case-only difference and a non-matching adjacent field."),
        ("record", "Khi khớp, lưu kết quả và chỉ dừng sớm nếu hợp đồng yêu cầu một khớp.", "On a match, record the result and stop early only when the contract asks for one match.", "Phân biệt tìm một mục với đếm hoặc lọc mọi mục.", "Separates finding one item from counting or filtering all items.", "result_state", "a stored first match remains the first match", "equality is true", "progress", "Compare the trace with COUNT_OCCURRENCES on duplicate values."),
        ("finish", "Trả về hoặc sử dụng kết quả theo đúng hợp đồng cho cả trường hợp có và không có khớp.", "Return or use the result contract for both found and absent cases.", "Đóng mọi đường đi mà không trả về sớm từ lần không khớp đầu tiên.", "Closes every path without returning on the first non-match.", "final_result", "all required candidates were checked or a permitted early match ended the scan", "loop ended or permitted match found", "termination", "Check the exact returned index, Boolean, object, or update action."),
    ],
    "COUNT_OCCURRENCES": [
        ("contract", "Chốt điều kiện khớp, phạm vi sống và biến thể lặp hoặc đệ quy.", "Fix the match predicate, live range, and iterative or recursive variant.", "Đảm bảo mọi phần tử dùng cùng một điều kiện.", "Ensures every element uses the same predicate.", "count_contract", "the predicate and range remain fixed", "input is valid", "setup", "Predict totals for zero, one, and repeated matches."),
        ("init_or_base", "Với lặp, đặt bộ đếm bằng 0; với đệ quy, trả 0 khi đoạn dữ liệu rỗng.", "For iteration set the count to zero; for recursion return zero for an empty segment.", "Cung cấp phần tử trung hòa và điểm dừng đúng.", "Provides the neutral value and a valid stopping point.", "partial_count", "the count equals matches in the processed empty prefix", "before processing or at length zero", "setup", "Check the empty-input result without reading an element."),
        ("visit", "Xét từng phần tử trong toàn bộ phạm vi sống, kể cả phần tử cuối.", "Examine each element in the complete live range, including the final element.", "Đếm yêu cầu duyệt hết, không dừng ở lần khớp đầu.", "Counting requires a full scan and cannot stop at the first match.", "cursor_or_subproblem", "the partial count covers exactly the processed elements", "an unprocessed element remains", "progress", "Tick all visited indices in a 100-element boundary trace."),
        ("accumulate", "Cộng 1 khi điều kiện đúng; trong đệ quy cộng kết quả của bài toán nhỏ hơn và truyền giá trị trả về.", "Add one when the predicate is true; recursively add the smaller result and propagate the return value.", "Mỗi khớp đóng góp đúng một lần.", "Each match contributes exactly once.", "partial_count", "partial count equals the number of matches processed so far", "a candidate has been evaluated", "progress", "Compare the running total after every visit."),
        ("progress", "Tăng chỉ số hoặc giảm kích thước bài toán đệ quy một đơn vị.", "Advance the index or reduce the recursive problem size by one.", "Bảo đảm thuật toán tiến về điểm dừng.", "Ensures the method moves toward termination.", "remaining_range", "processed and remaining ranges partition the live data", "more data remains", "progress", "Show the strictly decreasing remaining length."),
        ("return", "Trả tổng cuối cùng sau khi toàn bộ phạm vi đã được xử lý.", "Return the final total after the complete range has been processed.", "Phân biệt số lượng với vị trí của một khớp.", "Distinguishes a count from the location of one match.", "final_count", "the count equals all matching live elements", "no elements remain", "termination", "Recount independently on all-match and no-match cases."),
    ],
    "FILTER_RECORDS": [
        ("contract", "Chốt các trường, phép AND, chuẩn hóa dữ liệu và yêu cầu xuất hay thu thập kết quả.", "Fix the fields, AND predicate, normalization, and whether matches are output or collected.", "Ngăn thay đổi điều kiện giữa các bản ghi.", "Prevents the predicate from changing between records.", "filter_contract", "the full predicate remains fixed", "input is valid", "setup", "Write the predicate as separate clauses before combining it."),
        ("initialise", "Khởi tạo tập kết quả rỗng hoặc cờ chưa có kết quả.", "Initialise an empty result collection or a no-match flag.", "Hỗ trợ đúng trường hợp không có bản ghi phù hợp.", "Supports the no-match case correctly.", "result_set", "the result contains exactly accepted processed records", "before the scan", "setup", "Check the empty result representation."),
        ("read", "Duyệt các bản ghi đã nạp và đọc đúng trường hoặc getter cần kiểm tra.", "Visit loaded records and read the required fields or getters.", "Giữ tìm kiếm trong phạm vi sống và đúng giao diện đối tượng.", "Keeps the scan within live data and the object interface.", "candidate_record", "all earlier records have been classified", "cursor is valid", "progress", "Trace a last-record match."),
        ("test", "Chuẩn hóa các trường cần thiết rồi đánh giá toàn bộ mệnh đề kết hợp bằng AND.", "Normalize required fields and evaluate the complete compound predicate with AND.", "Một bản ghi chỉ được nhận khi mọi điều kiện đều đúng.", "A record is accepted only when every condition is true.", "predicate_result", "no partial clause can accept a record", "all required fields are available", "progress", "Use a record satisfying only one clause as a counterexample."),
        ("collect", "Xuất hoặc thêm mọi bản ghi có mệnh đề đúng; tiếp tục quét sau một khớp.", "Output or append every record whose predicate is true; continue after a match.", "Lọc khác tìm một mục vì phải giữ mọi khớp.", "Filtering differs from one-item search because every match is retained.", "result_set", "result equals all matching processed records", "predicate result is known", "progress", "Verify two matching records are both present."),
        ("finish", "Sau khi quét hết, xử lý rõ trường hợp kết quả rỗng theo hợp đồng.", "After the full scan, handle an empty result explicitly according to the contract.", "Hoàn tất cả đường có và không có kết quả.", "Completes both matching and no-match paths.", "final_result", "result contains all and only matching live records", "scan is complete", "termination", "Check no-match, one-match, and many-match cases."),
    ],
    "GROUP_AGGREGATE": [
        ("contract", "Chốt khóa nhóm, đại lượng tổng hợp, cách biểu diễn nhóm và số nhóm đang dùng.", "Fix the group key, aggregate, group representation, and live group count.", "Ngăn trộn khóa với giá trị cần cộng.", "Prevents mixing the key with the value being aggregated.", "group_contract", "each key names at most one live group", "input item is valid", "setup", "State the key and aggregate fields separately."),
        ("acquire", "Lấy đúng một mục đầu vào và giữ khóa cùng giá trị cần tổng hợp.", "Acquire exactly one input item and retain its key and aggregate value.", "Mỗi mục đầu vào phải được áp dụng đúng một lần.", "Each input item must be applied exactly once.", "current_item", "unprocessed inputs remain unchanged", "an input item exists", "progress", "Track queue length before and after acquisition."),
        ("scan", "Duyệt các nhóm đang tồn tại để tìm khóa bằng khóa của mục hiện tại.", "Scan existing live groups for a key equal to the current item key.", "Tránh tìm trong vùng chưa dùng hoặc tạo nhóm quá sớm.", "Avoids scanning unused capacity or creating a group prematurely.", "group_cursor", "no earlier group matches the current key", "cursor is below live group count", "progress", "Check a match in the final existing group."),
        ("update", "Nếu thấy khóa, chỉ cập nhật đại lượng của nhóm đó và đánh dấu đã xử lý.", "If the key is found, update only that group's aggregate and mark the item handled.", "Duy trì đúng một nhóm cho mỗi khóa.", "Maintains exactly one group per key.", "matched_group", "all other groups remain unchanged", "a matching key exists", "progress", "Compare all group records before and after the update."),
        ("create", "Nếu quét hết mà chưa thấy khóa, tạo đúng một nhóm mới và tăng số nhóm.", "If the scan ends without a match, create exactly one new group and increment the live group count.", "Bổ sung khóa mới mà không tạo bản sao cho khóa cũ.", "Adds a new key without duplicating an existing one.", "new_group", "one live group exists for every processed key", "no matching group exists and capacity permits", "progress", "Test an unseen key immediately after an existing-key case."),
        ("finish", "Kết thúc khi mục hiện tại đã cập nhật hoặc tạo một nhóm, rồi kiểm tra tính duy nhất của khóa.", "Finish when the current item has updated or created one group, then check key uniqueness.", "Ngăn một mục cập nhật nhiều nhóm hoặc bị bỏ qua.", "Prevents one item from updating multiple groups or being lost.", "final_groups", "each processed input contributes once to exactly one group", "current item is handled", "termination", "Re-sum source values by key and compare with all aggregates."),
    ],
    "BUBBLE_SORT": [
        ("contract", "Chốt khóa, chiều sắp, phạm vi sống, bản ghi nguyên vẹn và yêu cầu không dùng hàm sort có sẵn.", "Fix the key, direction, live range, whole-record rule, and any ban on built-in sort.", "Một bộ so sánh duy nhất phải điều khiển mọi lần đổi chỗ.", "One comparator must govern every swap.", "sort_contract", "the multiset of complete records is preserved", "input is valid", "setup", "Trace equal keys and verify all record fields stay attached."),
        ("pass", "Bắt đầu một lượt trên tiền tố chưa cố định và đặt cờ hoán đổi về False nếu dùng tối ưu dừng sớm.", "Start a pass over the unfixed prefix and reset the swap flag if early exit is used.", "Xác định đúng biên trong của lượt hiện tại.", "Establishes the correct inner boundary for the current pass.", "pass_boundary", "the suffix beyond the boundary is already final", "at least two unfixed items remain", "progress", "Write the last valid left index for this pass."),
        ("compare", "So sánh từng cặp kề nhau trong biên hợp lệ bằng chiều đã chốt.", "Compare each adjacent pair inside the valid boundary using the fixed direction.", "Bubble sort chỉ quyết định trên cặp kề nhau.", "Bubble sort makes decisions on adjacent pairs.", "pair", "all pairs before the cursor have been processed this pass", "right neighbor exists", "progress", "Check that the final comparison never reads past the array."),
        ("swap", "Nếu cặp sai thứ tự, hoán đổi toàn bộ bản ghi và đặt cờ hoán đổi.", "When a pair is out of order, swap complete records and set the swap flag.", "Giữ khóa và dữ liệu đi kèm đồng bộ.", "Keeps keys and associated data together.", "records_and_flag", "the multiset of records is unchanged", "comparator reports wrong order", "progress", "Compare record identities before and after one swap."),
        ("shrink", "Kết thúc lượt, giảm biên chưa sắp vì một cực trị đã tới vị trí cuối của vùng đó.", "At pass end, shrink the unsorted boundary because one extreme has reached its final position.", "Mỗi lượt làm giảm vùng cần xét.", "Each pass reduces the region still needing work.", "pass_boundary", "the fixed suffix is ordered and final", "pass comparisons are complete", "progress", "Highlight the newly fixed element after each pass."),
        ("finish", "Dừng khi biên còn không quá một mục hoặc một lượt hợp lệ không có hoán đổi.", "Stop when at most one unfixed item remains or a valid pass makes no swaps.", "Điểm dừng dựa trên hậu điều kiện đã được chứng minh.", "Termination follows from the established postcondition.", "final_sequence", "the whole live sequence is ordered and records are preserved", "boundary exhausted or no-swap pass completed", "termination", "Check ascending, descending, already-sorted, and duplicate-key inputs."),
    ],
    "INSERTION_SORT": [
        ("contract", "Chốt khóa, chiều sắp, phạm vi sống, bản ghi nguyên vẹn và biến thể lặp, đệ quy hoặc viết lại không đệ quy.", "Fix the key, direction, live range, whole-record rule, and iterative, recursive, or non-recursive-rewrite variant.", "Giữ cùng một hậu điều kiện qua mọi biến thể.", "Keeps one postcondition across all variants.", "sort_contract", "the multiset of complete records is preserved", "input is valid", "setup", "Name the variant and comparator before tracing."),
        ("prefix", "Thiết lập tiền tố độ dài một đã sắp; với đệ quy, đây là trường hợp cơ sở tương ứng.", "Establish a length-one sorted prefix; recursively this is the corresponding base case.", "Tạo bất biến tiền tố đã sắp.", "Establishes the sorted-prefix invariant.", "sorted_prefix", "the prefix is ordered and preserves its records", "at least one live item or empty base", "setup", "Check empty and one-item inputs."),
        ("select", "Lưu toàn bộ bản ghi khóa ngay sau tiền tố đã sắp.", "Save the complete key record immediately after the sorted prefix.", "Bảo vệ bản ghi trong khi các mục lớn hơn hoặc nhỏ hơn được dịch.", "Protects the record while preceding items are shifted.", "key_record", "the saved key is not lost during shifts", "an item remains outside the prefix", "progress", "Verify the saved record still has every field."),
        ("shift", "Dịch sang phải các bản ghi trước khóa khi bộ so sánh cho biết chúng phải đứng sau khóa.", "Shift prior records right while the comparator says they belong after the key.", "Tạo chỗ chèn mà không dùng chuỗi hoán đổi kiểu bubble sort.", "Creates the insertion slot without using bubble-sort-style adjacent swaps.", "shift_cursor", "the gap and shifted suffix are ordered relative to the key", "cursor is inside the prefix and comparison requires movement", "progress", "Check the lower bound before reading index -1."),
        ("place", "Đặt bản ghi khóa đúng một lần vào khoảng trống.", "Place the complete key record exactly once into the gap.", "Khôi phục tiền tố lớn hơn đã sắp và bảo toàn bản ghi.", "Restores a larger sorted prefix while preserving records.", "sorted_prefix", "the enlarged prefix is ordered and preserves its records", "the insertion position is known", "progress", "Check start, middle, end, and equal-key placements."),
        ("finish", "Mở rộng tiền tố hoặc truyền kết quả đệ quy cho tới khi toàn bộ phạm vi đã sắp.", "Expand the prefix or propagate the recursive result until the full range is sorted.", "Biến thể chỉ thay đổi cơ chế điều khiển, không thay đổi kết quả.", "The variant changes control flow without changing the result.", "final_sequence", "the complete live sequence is ordered", "prefix reaches live length or recursion returns", "termination", "Compare iterative and recursive outputs on the same records."),
    ],
    "BINARY_SEARCH": [
        ("contract", "Xác nhận dữ liệu đã sắp theo cùng bộ so sánh; chốt chỉ số biên bao hàm và dạng kết quả.", "Confirm the data is sorted by the same comparator; fix inclusive bounds and the result contract.", "Tìm nhị phân không hợp lệ nếu điều kiện tiền đề hoặc quy ước biên thay đổi.", "Binary search is invalid if its precondition or bound convention changes.", "search_contract", "the target can only lie inside the current interval", "sorted input and valid initial bounds", "setup", "Check comparator direction and absent sentinel."),
        ("base", "Nếu cận dưới vượt cận trên, trả kết quả không tìm thấy.", "If the lower bound exceeds the upper bound, return the not-found result.", "Đây là điểm dừng cho khoảng rỗng ở cả lặp và đệ quy.", "This is the empty-interval stopping condition for both iteration and recursion.", "interval", "no discarded position can contain the target", "low > high", "termination", "Trace empty and one-element absent intervals."),
        ("midpoint", "Tính chỉ số giữa bằng phép chia nguyên để low ≤ mid ≤ high.", "Compute the midpoint with integer division so low ≤ mid ≤ high.", "Bảo đảm đọc một phần tử nằm trong khoảng hiện tại.", "Ensures the inspected element lies inside the current interval.", "mid", "mid belongs to the candidate interval", "low <= high", "progress", "Check even and odd interval lengths."),
        ("compare", "So sánh khóa giữa với khóa tìm bằng đúng chiều sắp và trả kết quả khi bằng nhau.", "Compare the middle key with the target using the actual sort direction and return when equal.", "Quyết định nửa có thể chứa khóa dựa trên thứ tự thật.", "Chooses the possible half from the actual ordering.", "comparison", "the target, if present, remains inside the interval", "mid is valid", "progress", "Use ascending and descending examples."),
        ("shrink", "Loại cả vị trí giữa: đặt low = mid + 1 hoặc high = mid - 1; biến thể đệ quy phải trả kết quả lời gọi con.", "Discard the midpoint: set low = mid + 1 or high = mid - 1; the recursive variant must return the child result.", "Khoảng giảm nghiêm ngặt nên không lặp vô hạn.", "The interval shrinks strictly, preventing an infinite loop.", "interval", "no discarded position can contain the target", "comparison is not equal", "progress", "Verify the new interval length is strictly smaller."),
        ("finish", "Lặp hoặc đệ quy cho tới khi tìm thấy hoặc khoảng rỗng rồi trả đúng sentinel.", "Iterate or recurse until found or the interval is empty, then return the agreed sentinel.", "Hoàn tất mọi đường trả về với cùng hợp đồng.", "Completes every path with the same return contract.", "final_result", "the result is a valid match or the agreed absent value", "found or empty interval", "termination", "Test first, last, middle, absent-below, and absent-above targets."),
    ],
}

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def dump(name: str, data) -> None:
    (HERE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def rows_of(doc):
    return doc.get("rows") or doc.get("parts") or []

def row_id(row):
    return row.get("part_id") or row.get("question_part_id")

def atom_suffix(atom_id: str) -> int:
    match = re.search(r"(?:-|\.)(\d{2})$", atom_id)
    if not match:
        raise ValueError(f"No numeric suffix: {atom_id}")
    return int(match.group(1))

def atom_id(atom):
    return atom.get("marking_point_id") or atom.get("atom_id")

def source_ref(row):
    return {
        "part_id": row_id(row),
        "source_batch": row["source_batch"],
        "qp_locator": {
            "source_id": row["qp_requirement"]["source_id"],
            "pdf_pages": row["qp_requirement"]["pdf_pages"],
        },
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "ms_atoms": [{
            "marking_point_id": atom_id(m), "source_id": m["ms_source_id"],
            "pdf_pages": m["ms_pdf_pages"], "criterion_paraphrase": m["criterion_paraphrase"],
            "award_semantics": m["award_semantics"], "condition": m.get("condition"),
            "alternatives": m.get("alternatives"), "dependency": m.get("dependency"),
            "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"),
            "group_id": m.get("group_id"), "group_max": m.get("group_max"),
            "source_issue_refs": m.get("source_issue_refs", []),
        } for m in applicable_atoms(row)],
        "source_issue_refs": row.get("source_issue_refs", []),
    }

def applicable_atoms(row):
    atoms = row.get("marking_points") or row.get("award_atoms") or []
    allowed = ATOM_SUFFIX_OVERRIDES.get(row_id(row))
    if allowed is None:
        return atoms
    return [atom for atom in atoms if atom_suffix(atom_id(atom)) in allowed]

def bi(vi, en):
    return {"vi": vi, "en": en}

def unique(values):
    return list(dict.fromkeys(value for value in values if value))

def official_atom_text(atom):
    for key in ("criterion_paraphrase", "description", "requirement", "award_semantics"):
        value = atom.get(key)
        if isinstance(value, dict):
            return value.get("en") or value.get("vi") or json.dumps(value, ensure_ascii=False)
        if value:
            return str(value)
    return atom_id(atom)

def assign_atoms(pattern, steps, atoms):
    keywords = {
        "ORDERED_INSERT": ["contract", "qualify", "locate", "shift", "place"],
        "LINEAR_SEARCH": ["contract", "initialise", "scan", "compare", "record", "finish"],
        "COUNT_OCCURRENCES": ["contract", "init_or_base", "visit", "accumulate", "progress", "return"],
        "FILTER_RECORDS": ["contract", "initialise", "read", "test", "collect", "finish"],
        "GROUP_AGGREGATE": ["contract", "acquire", "scan", "update", "create", "finish"],
        "BUBBLE_SORT": ["contract", "pass", "compare", "swap", "shrink", "finish"],
        "INSERTION_SORT": ["contract", "prefix", "select", "shift", "place", "finish"],
        "BINARY_SEARCH": ["contract", "base", "midpoint", "compare", "shrink", "finish"],
    }[pattern]
    out = {key: [] for key in keywords}
    signals = {
        "contract": ["parameter", "procedure", "function", "return", "declar", "array", "list"],
        "qualify": ["qualif", "top", "limit", "capacity"],
        "locate": ["position", "location", "find", "search", "index", "looping through"],
        "shift": ["shift", "move", "copy"],
        "place": ["insert", "assign", "store"],
        "initialise": ["initial", "false", "-1", "counter", "count to 0"],
        "init_or_base": ["initial", "base", "empty", "zero", "0"],
        "scan": ["loop", "iterate", "each", "all", "traverse", "search"],
        "compare": ["compar", "equal", "match", "case", "upper", "lower"],
        "record": ["found", "position", "index", "set"],
        "finish": ["return", "output", "display", "not found", "end"],
        "visit": ["loop", "each", "all", "range", "element"],
        "accumulate": ["count", "increment", "total", "add", "+ 1", "checking", "comparing", "match"],
        "progress": ["recursive", "recursion", "reduce", "next", "remainder", "less character", "without first"],
        "return": ["return", "count", "result"],
        "read": ["get", "field", "record", "object"],
        "test": ["condition", "and", "compar", "match"],
        "collect": ["append", "output", "display", "match"],
        "acquire": ["dequeue", "remove", "item", "input"],
        "update": ["update", "existing", "add", "total"],
        "create": ["new", "create", "append", "increment"],
        "pass": ["pass", "outer", "loop"],
        "swap": ["swap", "exchange", "temporary", "temp"],
        "shrink": ["bound", "range", "pass", "reduce", "mid + 1", "mid - 1"],
        "prefix": ["base", "prefix", "first", "recursive", "outer loop", "external loop", "elements left"],
        "select": ["key", "current", "save", "temp", "extract", "selection"],
        "base": ["base", "low >", "not found", "-1", "empty"],
        "midpoint": ["mid", "middle", "div", "//"],
    }
    def semantic_key(text):
        if pattern == "ORDERED_INSERT":
            if "procedure" in text: return "contract"
            if "array data" in text: return "shift"
            if "name and score" in text: return "place"
            if "looping" in text or "finding" in text: return "locate"
        if pattern == "LINEAR_SEARCH":
            if "function" in text or "procedure" in text or "parameter" in text: return "contract"
            if "initial" in text or "sentinel" in text: return "initialise"
            if "getname" in text or "getemployeenumber" in text or "case" in text or "compar" in text: return "compare"
            if "index" in text or "found" in text or "true" in text: return "record"
            if "return" in text or "not found" in text or "false" in text: return "finish"
            if "loop" in text or "each" in text or "search" in text: return "scan"
        if pattern == "COUNT_OCCURRENCES":
            if "function header" in text or "function findvalues" in text: return "contract"
            if "base case" in text or "length is 0" in text or "initialising counter" in text: return "init_or_base"
            if "returning the total" in text or "returning the calculated" in text: return "return"
            if "recursive call" in text or "less character" in text or "without first element" in text or "remainder of" in text: return "progress"
            if "count" in text or "add" in text or "vowel" in text or "compar" in text or "totalling" in text: return "accumulate"
            if "loop" in text or "length" in text or "array element" in text: return "visit"
        if pattern == "FILTER_RECORDS":
            if "function" in text or "procedure" in text or "parameter" in text: return "contract"
            if "initial" in text or "flag" in text: return "initialise"
            if "getter" in text or "get" in text or "field" in text or "attribute" in text: return "read"
            if "condition" in text or " and " in text or "compar" in text: return "test"
            if "output" in text or "display" in text or "append" in text: return "collect"
            if "not found" in text or "no match" in text: return "finish"
            if "loop" in text or "record" in text: return "read"
        if pattern == "GROUP_AGGREGATE":
            if "dequeue" in text or "procedure header" in text: return "acquire"
            if "loop" in text or "find matching" in text: return "scan"
            if "creating a new" in text or "numberrecords" in text or "new record" in text: return "create"
            if "incrementing total" in text or "update" in text: return "update"
        if pattern == "BUBBLE_SORT":
            if "procedure" in text or "function" in text or "parameter" in text or "outputting" in text: return "contract"
            if "outer loop" in text or "pass" in text: return "pass"
            if "inner loop" in text or "compar" in text: return "compare"
            if "swap" in text or "exchang" in text or "temporary" in text or "moving" in text: return "swap"
            if "bound" in text or "reduce" in text: return "shrink"
            if "return" in text or "sorted" in text: return "finish"
        if pattern == "INSERTION_SORT":
            if "header" in text or "parameter" in text: return "contract"
            if "base case" in text or "outer loop" in text or "external loop" in text or "recursive function" in text: return "prefix"
            if "extract" in text or "selection" in text or "internal loop" in text or "compar" in text: return "select"
            if "moving" in text: return "shift"
            if "insert" in text: return "place"
            if "return" in text or "structure" in text or "logic changed" in text: return "finish"
        if pattern == "BINARY_SEARCH":
            if "completed statements" in text or "function" in text and "recursive call" not in text: return "contract"
            if "base case" in text or "not found" in text or "no elements" in text: return "base"
            if "calculating" in text and ("mid" in text or "middle" in text) or "div operator" in text: return "midpoint"
            if "compar" in text or "equal" in text or "returning mid" in text or "returning index" in text: return "compare"
            if "updating" in text or "update low" in text or "update high" in text or "middle +" in text or "middle �" in text or "middle -" in text: return "shrink"
            if "returning �1" in text or "returning -1" in text or "end criteria" in text: return "finish"
            if "recursive call" in text: return "shrink"
        return None
    for atom in atoms:
        text = official_atom_text(atom).lower()
        direct = semantic_key(text)
        if direct:
            out[direct].append(atom_id(atom))
            continue
        best_key, best_score = keywords[0], 0
        for key in keywords:
            score = sum(token in text for token in signals.get(key, []))
            if score > 0 and score >= best_score:
                best_key, best_score = key, score
        out[best_key].append(atom_id(atom))
    return out

def risk_index(risk_docs):
    by_part = defaultdict(list)
    detail = {}
    for doc in risk_docs:
        for issue in doc.get("issue_definitions", []):
            detail[issue["source_issue_id"]] = issue
        for instance in doc.get("instances", []):
            rid = instance["source_issue_id"]
            by_part[instance.get("part_id") or instance.get("question_part_id")].append(rid)
        for risk in doc.get("risks", []):
            rid = risk.get("risk_id") or risk.get("issue_id")
            detail[rid] = risk
            for pid in risk.get("affected_part_ids") or risk.get("part_ids") or []:
                by_part[pid].append(rid)
    return by_part, detail

def make_steps(pattern, all_atoms):
    allocated = assign_atoms(pattern, METHODS[pattern], all_atoms)
    steps = []
    for i, (key, action_vi, action_en, why_vi, why_en, writes, invariant, guard, role, check_en) in enumerate(METHODS[pattern], 1):
        steps.append({
            "step_id": f"B2-{pattern}-S{i:02d}", "sequence": i,
            "action": bi(action_vi, action_en), "why": bi(why_vi, why_en),
            "reads": ["input_contract", "live_data", "current_state"], "writes": [writes],
            "invariant": invariant, "guard": guard, "termination_role": role,
            "check": bi(
                f"Kiểm bước ‘{action_vi}’: {why_vi} Đối chiếu `{writes}` với guard `{guard}` và invariant của bước trước khi đi tiếp.",
                check_en,
            ),
            "marking_point_refs": allocated[key],
        })
    return steps

def make_variants():
    specs = [
        ("ordered-policy", ["ORDERED_INSERT"], ["A3C10"], "qualification-direction-ties-capacity", "Chốt top-N hay không, chiều, vị trí của khóa bằng nhau và cách cắt dung lượng trước khi dịch.", "Fix top-N qualification, direction, equal-key placement, and capacity trimming before shifting.", ["unbounded insertion", "bounded qualifying insertion", "equal-key before/after policy"], "Existing order and whole-record integrity are preserved.", True),
        ("linear-result", ["LINEAR_SEARCH"], ["A3C07"], "result-case-live-range", "Dùng kết quả Boolean, chỉ số, đối tượng hoặc cập nhật đúng như đề; chuẩn hóa chữ chỉ khi đề yêu cầu.", "Use the requested Boolean, index, object, or update result; normalize case only when required.", ["first-match early exit", "full scan with stored result", "case-normalized accessor comparison"], "Every required live position before termination has been inspected.", True),
        ("count-control", ["COUNT_OCCURRENCES"], ["A3C07", "A3C13"], "iterative-recursive", "Chọn vòng lặp với bộ đếm hoặc đệ quy với base case 0 và lời gọi trên bài toán nhỏ hơn.", "Choose a loop with a counter or recursion with a zero base case and a smaller subproblem.", ["iterative full-range scan", "recursive reduction with returned subtotal"], "The partial result equals matches in exactly the processed portion.", True),
        ("filter-predicate", ["FILTER_RECORDS"], ["A3C07"], "compound-predicate-all-matches", "Giữ phép AND và tiếp tục sau mỗi khớp để thu mọi bản ghi.", "Preserve the AND predicate and continue after matches to collect every record.", ["output matches", "collect matches", "empty-result branch"], "The result contains all and only matching processed records.", True),
        ("group-branch", ["GROUP_AGGREGATE"], ["A3C20"], "existing-new-group", "Sau khi quét nhóm sống, cập nhật đúng một nhóm đã có hoặc tạo đúng một nhóm mới.", "After scanning live groups, update one existing group or create exactly one new group.", ["existing key update", "new key creation"], "One live group exists per processed key.", True),
        ("search-choice", ["LINEAR_SEARCH", "BINARY_SEARCH"], ["A3C07", "A3C08"], "linear-vs-binary", "Chỉ chọn nhị phân khi dữ liệu đã sắp theo cùng bộ so sánh; nếu không, duyệt tuyến tính.", "Choose binary search only for data sorted by the same comparator; otherwise scan linearly.", ["unsorted linear scan", "sorted interval halving"], "The chosen method's precondition remains true.", True),
        ("insert-vs-sort", ["ORDERED_INSERT", "INSERTION_SORT"], ["A3C10"], "one-item-insert-vs-full-sort", "Chèn một mục vào dãy đã sắp khác với lặp thao tác chèn để sắp toàn bộ dãy.", "Inserting one item into an ordered sequence differs from repeated insertion used to sort the full sequence.", ["single ordered insertion", "growing sorted prefix"], "The requested scope—one item or the whole live range—is preserved.", True),
        ("sort-family", ["BUBBLE_SORT", "INSERTION_SORT"], [], "adjacent-passes-vs-sorted-prefix", "Bubble sort tạo hậu tố cố định bằng cặp kề; insertion sort mở rộng tiền tố đã sắp bằng dịch và đặt khóa.", "Bubble sort fixes a suffix through adjacent pairs; insertion sort grows a sorted prefix by shifting and placing a key.", ["bubble adjacent passes", "insertion sorted prefix"], "Complete records and the requested order are preserved.", True),
        ("bubble-policy", ["BUBBLE_SORT"], [], "direction-record-early-exit", "Đổi chiều bộ so sánh nhưng giữ biên hợp lệ; chỉ dừng sớm sau một lượt hoàn chỉnh không hoán đổi.", "Reverse the comparator for direction while retaining valid bounds; stop early only after a complete no-swap pass.", ["ascending", "descending", "whole-record swap", "optional no-swap exit"], "The fixed suffix is final after every completed pass.", True),
        ("insertion-control", ["INSERTION_SORT"], [], "iterative-recursive-rewrite", "Biến thể lặp, đệ quy và viết lại không đệ quy phải giữ cùng comparator, dịch bản ghi và hậu điều kiện.", "Iterative, recursive, and non-recursive rewrite variants retain the same comparator, record shifts, and postcondition.", ["iterative prefix growth", "recursive prefix sort plus insert", "explicit-loop rewrite"], "The sorted prefix grows and preserves all records.", True),
        ("binary-control", ["BINARY_SEARCH"], ["A3C08"], "iterative-recursive", "Vòng lặp cập nhật biên tại chỗ; đệ quy truyền biên mới và phải return kết quả lời gọi con.", "Iteration updates bounds in place; recursion passes new bounds and must return the child result.", ["iterative inclusive bounds", "recursive inclusive bounds"], "The target, if present, remains inside a strictly smaller interval.", True),
        ("binary-bounds", ["BINARY_SEARCH"], ["A3C08"], "inclusive-bounds-midpoint-return", "Với biên bao hàm, dùng midpoint nguyên và loại mid bằng ±1; giữ sentinel nhất quán.", "With inclusive bounds, use an integer midpoint and exclude mid with ±1; preserve the result sentinel.", ["found at midpoint", "empty interval", "absent target", "ascending/descending comparator"], "low and high delimit exactly the remaining candidate interval.", True),
    ]
    return [{
        "variant_id": f"B2-V{i:02d}-{slug}", "pattern_ids": pats,
        "stage2_contrast_refs": refs, "axis": axis, "decision_rule": bi(vi, en),
        "cases": cases, "invariant": invariant, "method_changing": changing,
    } for i, (slug, pats, refs, axis, vi, en, cases, invariant, changing) in enumerate(specs, 1)]

def main():
    catalog = load(CATALOG_PATH)
    mapping = load(MAP_PATH)
    marking_docs = [load(p) for p in MARKING_PATHS]
    for doc, batch in zip(marking_docs, ("2021-2022", "2023-2024", "2025")):
        for row in rows_of(doc):
            row["source_batch"] = batch
    risk_docs = [load(p) for p in RISK_PATHS]
    all_rows = {row_id(row): row for doc in marking_docs for row in rows_of(doc)}
    catalog_by_pattern = {row["pattern_id"]: row for row in catalog["patterns"]}
    chains = {row["pattern_id"]: row for row in mapping["pattern_chains"]}
    sections = {row["section_id"]: row for row in mapping["sections"]}
    risks_by_part, risk_details = risk_index(risk_docs)
    input_paths = [CATALOG_PATH, *SUPPORT_PATHS[:2], MAP_PATH, *SUPPORT_PATHS[2:5], *MARKING_PATHS, *RISK_PATHS, *SUPPORT_PATHS[5:]]
    input_hashes = [{"path": str(p.relative_to(PLANNING)).replace("\\", "/"), "sha256": sha(p)} for p in input_paths]
    fidelity_policy = risk_docs[1].get("batch_fidelity_policy")
    all_pattern_atoms, cards, requirement_rows = {}, [], []

    for pattern in PATTERNS:
        cat = catalog_by_pattern[pattern]
        assessed = cat["assessed_part_ids"]
        rows = [all_rows[pid] for pid in assessed]
        atoms = [atom for row in rows for atom in applicable_atoms(row)]
        all_pattern_atoms[pattern] = atoms
        chain = chains[pattern]
        objectives = unique(oid for link in chain["knowledge_chain"] for oid in link.get("objective_ids", []))
        book_ids = unique(bid for link in chain["knowledge_chain"] for bid in link.get("book_section_ids", []))
        issue_refs = unique(rid for row in rows for rid in (row.get("source_issue_refs") or risks_by_part.get(row_id(row), [])))
        steps = make_steps(pattern, atoms)
        marking_refs = [atom_id(a) for a in atoms]
        requirement_refs = [f"ac-9618-p4-2026-python.assessment-requirement.{oid.lower()}" for oid in objectives]
        card = {
            "card_id": f"ac-9618-p4-2026-python.method-card.{pattern.lower().replace('_','-')}",
            "pattern_id": pattern, "version": "s4-schema-v1-b2-submission-1", "status": "SUBMITTED",
            "package_id": chain["package_id"], "lesson_id": chain["lesson_id"],
            "knowledge_block_ids": chain["knowledge_block_ids"], "objective_ids": objectives,
            "titles": bi(*TITLES[pattern]), "recognition": bi(*RECOGNITION[pattern]),
            "source_scope": {
                "assessed_part_ids": assessed,
                "representative_parts": [source_ref(all_rows[ANCHORS[pattern]])],
                "official_source_refs": [source_ref(r) for r in rows],
                "corpus_limit": "Stage 1 corpus: 2021-2025 Paper 4 sources only; 2026 syllabus target.",
            },
            "confusable_pattern_refs": cat.get("confusable_patterns", []),
            "confusable_contrast_refs": unique(ref for v in make_variants() if pattern in v["pattern_ids"] for ref in v["stage2_contrast_refs"]),
            "source_issue_refs": issue_refs,
            "source_fidelity_policies": ([fidelity_policy] if fidelity_policy and any(r["source_batch"] == "2023-2024" for r in rows) else []) + [{"source_issue_id": rid, "policy": risk_details.get(rid, {}).get("stage4_disposition") or risk_details.get(rid, {}).get("recommended_handling") or "Teach the intended invariant and retain the official source caveat."} for rid in issue_refs],
            "book_foundation_refs": [{"book_section_id": bid, "title": sections[bid].get("title"), "authority": "coursebook_foundation"} for bid in book_ids],
            "applicability": {
                "preconditions": [METHODS[pattern][0][2]],
                "representation": ["Python-oriented pseudocode", "explicit live ranges", "complete-record movement where records are used"],
                "conventions": ["Use source-specific indexing, case, return, direction, and accessor conventions."],
                "variant_axes": [v["variant_id"] for v in make_variants() if pattern in v["pattern_ids"]],
                "decision_rule": bi(*DECISION_RULES[pattern]),
            },
            "method_steps": steps,
            "marking_point_refs": marking_refs,
            "assessment_requirement_refs": requirement_refs,
            "error_refs": [f"B2-ERR-{pattern}-{i:02d}" for i in range(1, 4)],
            "solution_design_ref": f"B2-SD-{pattern}", "visual_brief_ref": f"B2-VIS-{pattern}",
            "authority_labels": ["official_qp", "official_ms", "coursebook_foundation", "AlgoCore_original", "AlgoCore_risk"],
            "authority_note": "Official atoms define assessed evidence; the ordered bilingual method is AlgoCore-authored and awaits Stage 5 execution verification.",
            "downstream_status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
        }
        cards.append(card)
        for row in rows:
            owned = [atom_id(a) for a in applicable_atoms(row)]
            requirement_rows.append({
                "pattern_id": pattern, "question_part_id": row_id(row),
                "owned_marking_point_refs": owned,
                "ownership_note": "Owns only B2-applicable official atoms; co-tags do not duplicate marks." if row_id(row) in ATOM_SUFFIX_OVERRIDES else "All official atoms in this single-B2-pattern part are applicable.",
            })

    variants = make_variants()
    dump("VARIANT_INVARIANT_REGISTER.json", {"schema_version": "s4-schema-v1", "status": "SUBMITTED", "batch_id": "B2-search-sort", "input_hashes": input_hashes, "variants": variants, "self_checks": {"variant_count": len(variants), "patterns_covered": PATTERNS}})
    dump("PATTERN_CARDS.json", {
        "schema_version": "s4-schema-v1", "status": "SUBMITTED", "batch_id": "B2-search-sort",
        "input_hashes": input_hashes, "pattern_cards": cards,
        "self_checks": {
            "exact_pattern_set": PATTERNS, "assessed_part_link_count": sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards),
            "owned_official_atom_count": sum(len(c["marking_point_refs"]) for c in cards),
            "atom_ownership_rows": requirement_rows,
            "no_duplicate_atom_ownership": len([a for c in cards for a in c["marking_point_refs"]]) == len(set(a for c in cards for a in c["marking_point_refs"])),
        },
    })
    build_errors(cards, all_rows, input_hashes)
    build_designs(cards, risks_by_part, risk_details, input_hashes)
    build_examples(cards, all_rows, input_hashes)
    build_visuals(cards, input_hashes)
    build_review(cards, input_hashes)

def first_atom(card, index=0):
    refs = card["marking_point_refs"]
    return refs[min(index, len(refs)-1)] if refs else None

def build_errors(cards, rows, input_hashes):
    defs = {
        "ORDERED_INSERT": [("Sắp lại toàn bộ dãy thay vì chèn một mục.", "Re-sorts the entire sequence instead of inserting one item."), ("Dịch từ trái sang phải làm ghi đè bản ghi chưa sao chép.", "Shifts left-to-right and overwrites a record still needed."), ("Chỉ dịch khóa hoặc xử lý sai khóa bằng nhau/dung lượng.", "Moves only the key or mishandles equal keys/capacity.")],
        "LINEAR_SEARCH": [("Trả về không tìm thấy ngay ở lần không khớp đầu tiên.", "Returns not-found after the first non-match."), ("So sánh sai trường hoặc bỏ chuẩn hóa chữ theo đề.", "Compares the wrong field or omits required case normalization."), ("Duyệt dung lượng thay vì phạm vi sống hoặc trả sai hợp đồng.", "Scans capacity rather than the live range or returns the wrong contract." )],
        "COUNT_OCCURRENCES": [("Dừng ở khớp đầu tiên nên kết quả thành Boolean/vị trí.", "Stops at the first match, producing a Boolean/location rather than a count."), ("Bỏ phần tử cuối do biên trên sai.", "Skips the final element because of an incorrect upper bound."), ("Đệ quy thiếu base case, tiến triển hoặc return kết quả lời gọi con.", "Recursion lacks a base case, progress, or returned child result.")],
        "FILTER_RECORDS": [("Dùng OR khi đề yêu cầu mọi điều kiện đồng thời.", "Uses OR when all conditions must hold."), ("Dừng sau bản ghi phù hợp đầu tiên.", "Stops after the first matching record."), ("Không xử lý kết quả rỗng hoặc chuẩn hóa sai trường.", "Omits the empty-result path or normalizes the wrong field." )],
        "GROUP_AGGREGATE": [("Luôn tạo nhóm mới nên một khóa xuất hiện nhiều lần.", "Always creates a new group, duplicating a key."), ("Cập nhật sai nhóm hoặc quét cả vùng chưa dùng.", "Updates the wrong group or scans unused capacity."), ("Lấy nhiều hơn một mục hoặc dùng sentinel như dữ liệu thật.", "Consumes more than one item or treats a sentinel as real data." )],
        "BUBBLE_SORT": [("Biên vòng trong đọc phần tử bên phải ngoài mảng.", "Inner bounds read a right neighbor outside the array."), ("Chỉ đổi khóa nên phá vỡ bản ghi.", "Swaps only keys and breaks record integrity."), ("Dừng sớm trước khi hoàn tất một lượt không hoán đổi hoặc không reset cờ.", "Stops before a complete no-swap pass or fails to reset the flag." )],
        "INSERTION_SORT": [("Dùng chuỗi swap kiểu bubble thay vì giữ khóa, dịch rồi đặt.", "Uses bubble-like swaps instead of saving, shifting, and placing the key."), ("Đọc chỉ số -1 do kiểm tra thứ tự điều kiện sai.", "Reads index -1 because guard conditions are ordered incorrectly."), ("Viết lại đệ quy/lặp làm đổi comparator, chiều hoặc mất return.", "Recursive/iterative rewrite changes the comparator, direction, or return." )],
        "BINARY_SEARCH": [("Áp dụng cho dữ liệu chưa sắp hoặc sai chiều so sánh.", "Applies the method to unsorted data or the wrong comparator direction."), ("Cập nhật biên thành mid thay vì mid ± 1 nên khoảng không giảm.", "Updates a bound to mid rather than mid ± 1, so the interval may not shrink."), ("Sao chép midpoint/guard lỗi hoặc quên return kết quả đệ quy.", "Copies a faulty midpoint/guard or omits the recursive result return." )],
    }
    out = []
    for card in cards:
        p = card["pattern_id"]
        step_ids = [s["step_id"] for s in card["method_steps"]]
        for i, (vi, en) in enumerate(defs[p], 1):
            atom = first_atom(card, i-1)
            pid = ANCHORS[p]
            row = rows[pid]
            linked_step = card["method_steps"][min(i, len(card["method_steps"])-1)]
            out.append({
                "error_id": f"B2-ERR-{p}-{i:02d}", "pattern_id": p,
                "question_part_ids": card["source_scope"]["assessed_part_ids"],
                "requirement_refs": card["assessment_requirement_refs"],
                "marking_point_refs": [atom] if atom else [], "method_step_refs": [step_ids[min(i, len(step_ids)-1)]],
                "likely_error": bi(vi, en),
                "consequence": bi(
                    f"Nếu ‘{vi}’, {linked_step['why']['vi'].lower()} Khi đó `{linked_step['writes'][0]}` không còn chứng minh được invariant/hậu điều kiện của {card['titles']['vi']}.",
                    f"If ‘{en}’, {linked_step['why']['en'].lower()} Then `{linked_step['writes'][0]}` can no longer demonstrate the invariant/postcondition of {card['titles']['en']}.",
                ),
                "detection_check": bi(
                    f"Dựng ca biên tác động trực tiếp đến lỗi ‘{vi}’, rồi thực hiện checkpoint: {linked_step['check']['vi']}",
                    f"Construct a boundary case that directly triggers ‘{en}’, then perform this checkpoint: {linked_step['check']['en']}",
                ),
                "repair_action": bi(
                    f"Quay về thao tác ‘{linked_step['action']['vi']}’, sửa guard/update gây ra ‘{vi}’, rồi trace lại cho tới khi checkpoint của bước đạt.",
                    f"Return to ‘{linked_step['action']['en']}’, repair the guard/update that caused ‘{en}’, then retrace until the step checkpoint passes.",
                ),
                "repair_exercise_ref": f"B2-REPAIR-{p}-{i:02d}", "basis": "official_qp_ms",
                "source_locator_if_official": {"qp_locator": {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]}, "ms_locator": {"source_id": row["marking_points"][0]["ms_source_id"], "pdf_pages": row["marking_points"][0]["ms_pdf_pages"]}} if atom else None,
                "exact_mark_loss_claim": None,
                "authority_note": "The error diagnosis and repair are AlgoCore-authored; official references identify assessed evidence only.",
                "status": "SUBMITTED",
            })
    dump("ERROR_PREVENTION.json", {"schema_version": "s4-schema-v1", "status": "SUBMITTED", "batch_id": "B2-search-sort", "input_hashes": input_hashes, "error_rows": out, "self_checks": {"error_count": len(out), "three_per_pattern": all(sum(e["pattern_id"] == p for e in out) == 3 for p in PATTERNS), "exact_mark_loss_claims": 0}})

def build_designs(cards, risks_by_part, risk_details, input_hashes):
    primary_variants = {
        "ORDERED_INSERT": "B2-V01-ordered-policy", "LINEAR_SEARCH": "B2-V02-linear-result",
        "COUNT_OCCURRENCES": "B2-V03-count-control", "FILTER_RECORDS": "B2-V04-filter-predicate",
        "GROUP_AGGREGATE": "B2-V05-group-branch", "BUBBLE_SORT": "B2-V09-bubble-policy",
        "INSERTION_SORT": "B2-V10-insertion-control", "BINARY_SEARCH": "B2-V11-binary-control",
    }
    designs = []
    for card in cards:
        p = card["pattern_id"]
        risks = unique(r for pid in card["source_scope"]["assessed_part_ids"] for r in (risks_by_part.get(pid) or card["source_issue_refs"] if pid in card["source_scope"]["assessed_part_ids"] else []))
        designs.append({
            "solution_design_id": f"B2-SD-{p}", "pattern_id": p,
            "variant_id": primary_variants[p],
            "input_contract": card["method_steps"][0]["action"]["en"],
            "output_contract": card["method_steps"][-1]["action"]["en"],
            "state_model": unique(x for s in card["method_steps"] for x in s["writes"]),
            "representation": card["applicability"]["representation"],
            "preconditions": card["applicability"]["preconditions"],
            "postconditions": [card["method_steps"][-1]["invariant"]],
            "invariants": unique(s["invariant"] for s in card["method_steps"]),
            "ordered_method_step_ids": [s["step_id"] for s in card["method_steps"]],
            "mutation_and_preservation_rules": ["Mutate only the declared state at each step.", "Preserve complete records and all data outside the live region.", "Do not duplicate ownership of co-tagged official atoms."],
            "termination_argument": "Every progress step strictly advances a cursor, shrinks an interval/boundary, grows a sorted prefix, or consumes exactly one item; a finite live range therefore reaches the termination guard.",
            "failure_paths": [e for e in card["error_refs"]],
            "alternative_designs": [v for v in card["applicability"]["variant_axes"]],
            "stage5_test_obligations": {
                "normal": ["Trace at least one interior match/move/update with every invariant visible."],
                "boundary": ["empty", "one item", "first position", "last position", "duplicate/equal key", "no match where applicable"],
                "counterexample": ["Run each linked error trigger and prove the detection check catches it."],
                "source_fixture": [f"Reproduce official part {pid} under its exact source convention." for pid in card["source_scope"]["assessed_part_ids"]],
            },
            "source_constraints": [{"source_issue_id": rid, "disposition": risk_details.get(rid, {}).get("stage4_disposition") or risk_details.get(rid, {}).get("recommended_handling") or "Retain the official source caveat and verify the intended invariant in Stage 5."} for rid in card["source_issue_refs"]],
            "source_issue_dispositions": [{"source_issue_id": rid, "stage5_obligation": risk_details.get(rid, {}).get("stage5_obligation") or "Test both the literal source behavior and the corrected invariant-preserving behavior; do not silently normalize."} for rid in card["source_issue_refs"]],
            "status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
        })
    dump("SOLUTION_DESIGNS.json", {"schema_version": "s4-schema-v1", "status": "SUBMITTED", "batch_id": "B2-search-sort", "input_hashes": input_hashes, "solution_designs": designs, "self_checks": {"design_count": len(designs), "all_pending_stage5": all(d["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for d in designs)}})

def build_examples(cards, rows, input_hashes):
    micro = {
        "ORDERED_INSERT": ["insert at start", "insert at end", "equal key", "full capacity rejected/accepted"],
        "LINEAR_SEARCH": ["first match", "last match", "absent target", "case-normalized field"],
        "COUNT_OCCURRENCES": ["zero matches", "all match", "final element matches", "iterative/recursive same total"],
        "FILTER_RECORDS": ["one clause only", "all clauses", "multiple matches", "empty result"],
        "GROUP_AGGREGATE": ["existing first group", "existing last group", "new key", "repeated same key"],
        "BUBBLE_SORT": ["already sorted", "reverse order", "duplicate keys", "whole records"],
        "INSERTION_SORT": ["insert at prefix start", "insert at prefix end", "equal keys", "recursive/iterative parity"],
        "BINARY_SEARCH": ["middle match", "first/last match", "absent below/above", "one-element recursive/iterative"],
    }
    out = []
    for card in cards:
        p, pid = card["pattern_id"], ANCHORS[card["pattern_id"]]
        row = rows[pid]
        out.append({
            "worked_example_spec_id": f"B2-WE-{p}", "pattern_id": p,
            "status": "PENDING_STAGE5_EXECUTION_VERIFICATION", "origin": "AlgoCore_original_adaptation_spec",
            "anchor_source": source_ref(row),
            "prompt_design": bi(f"Chuyển ngữ cảnh của {pid} thành một ví dụ nhỏ nhưng giữ nguyên hợp đồng, quy ước và bằng chứng chấm.", f"Adapt {pid} to a small example while preserving its contract, conventions, and assessed evidence."),
            "representation_and_convention": "; ".join(card["applicability"]["representation"] + card["applicability"]["conventions"]),
            "method_step_refs": [s["step_id"] for s in card["method_steps"]],
            "learner_checkpoints": [{"after_step": s["step_id"], "prompt": s["check"]} for s in card["method_steps"]],
            "contrast_and_boundary_microcases": micro[p],
            "evidence_to_capture_later": ["event trace", "state snapshots", "expected output", "invariant checks", "source-risk fixture results"],
            "prohibited_stage4_claims": ["Do not claim code execution.", "Do not claim trace verification.", "Do not promise exact marks from non-official phrasing."],
            "stage5_handoff": "Implement both normal and boundary fixtures, preserve the source convention, and record trace evidence before VERIFIED status.",
        })
    dump("WORKED_EXAMPLE_SPECS.json", {"schema_version": "s4-schema-v1", "status": "SUBMITTED", "batch_id": "B2-search-sort", "input_hashes": input_hashes, "worked_example_specs": out, "self_checks": {"anchor_count": len(out), "one_per_pattern": set(e["pattern_id"] for e in out) == set(PATTERNS)}})

def build_visuals(cards, input_hashes):
    events = {
        "ORDERED_INSERT": ["CHECK_QUALIFICATION", "LOCATE", "SHIFT_RIGHT", "PLACE", "DROP_LAST"],
        "LINEAR_SEARCH": ["VISIT_INDEX", "NORMALIZE_KEY", "COMPARE", "FOUND", "END_NOT_FOUND"],
        "COUNT_OCCURRENCES": ["VISIT_OR_RECURSE", "MATCH_RESULT", "INCREMENT", "RETURN_SUBTOTAL"],
        "FILTER_RECORDS": ["READ_FIELDS", "EVALUATE_CLAUSES", "ACCEPT_OR_REJECT", "EMPTY_SUMMARY"],
        "GROUP_AGGREGATE": ["ACQUIRE_ITEM", "SCAN_GROUP", "UPDATE_EXISTING", "CREATE_GROUP", "VERIFY_UNIQUE_KEY"],
        "BUBBLE_SORT": ["START_PASS", "COMPARE_ADJACENT", "SWAP_RECORDS", "SHRINK_BOUNDARY", "STOP_NO_SWAP"],
        "INSERTION_SORT": ["SELECT_KEY", "SHIFT_RIGHT", "PLACE_KEY", "EXPAND_PREFIX", "RETURN_VARIANT"],
        "BINARY_SEARCH": ["SET_BOUNDS", "MIDPOINT", "COMPARE", "DISCARD_HALF", "FOUND_OR_NOT_FOUND", "RECURSE_OR_LOOP"],
    }
    cases = {
        "ORDERED_INSERT": ("Chèn giữa dãy còn chỗ.", "Insert into the middle with spare capacity.", "Khóa bằng nhau ở dãy đầy.", "Equal key in a full sequence.", "Dịch xuôi làm ghi đè bản ghi.", "Forward shifting overwrites a record."),
        "LINEAR_SEARCH": ("Tìm thấy ở giữa.", "Target found in the middle.", "Mục tiêu vắng mặt ở phạm vi một phần tử.", "Absent target in a one-item range.", "Trả về sau lần không khớp đầu.", "Return after the first non-match."),
        "COUNT_OCCURRENCES": ("Có nhiều khớp xen kẽ.", "Several interleaved matches.", "Khớp duy nhất ở phần tử cuối.", "Only the final element matches.", "Dừng tại khớp đầu hoặc bỏ chỉ số cuối.", "Stop at first match or skip the last index."),
        "FILTER_RECORDS": ("Nhiều bản ghi thỏa cả hai điều kiện.", "Several records satisfy both clauses.", "Không bản ghi nào thỏa.", "No record matches.", "OR nhận bản ghi chỉ thỏa một điều kiện.", "OR accepts a record satisfying one clause."),
        "GROUP_AGGREGATE": ("Cập nhật khóa đã có rồi tạo khóa mới.", "Update an existing key then create a new key.", "Khóa khớp ở nhóm cuối.", "Key matches the final live group.", "Tạo nhóm trùng khóa.", "Create a duplicate group key."),
        "BUBBLE_SORT": ("Hai lượt có hoán đổi.", "Two passes with swaps.", "Dãy đã sắp kết thúc bằng lượt không hoán đổi.", "Already sorted data ends after a no-swap pass.", "Biên đọc cặp ngoài mảng hoặc đổi riêng khóa.", "Bounds read outside the array or swap only keys."),
        "INSERTION_SORT": ("Khóa dịch qua nhiều bản ghi.", "A key shifts across several records.", "Khóa bằng nhau hoặc đặt ở đầu.", "Equal key or placement at the start.", "Khóa bị ghi đè hoặc đọc chỉ số -1.", "Key is overwritten or index -1 is read."),
        "BINARY_SEARCH": ("Tìm thấy sau hai lần loại nửa.", "Found after two interval reductions.", "Khoảng một phần tử rồi rỗng.", "One-item interval becomes empty.", "Biên không giảm hoặc midpoint ngoài khoảng.", "Bounds do not shrink or midpoint leaves the interval."),
    }
    questions = {
        "ORDERED_INSERT": ("Vị trí chèn và hướng dịch nào giữ thứ tự, bản ghi nguyên vẹn và giới hạn dung lượng?", "Which insertion position and shift direction preserve order, whole records, and capacity?"),
        "LINEAR_SEARCH": ("Sau mỗi VISIT_INDEX, ta đã loại trừ những vị trí nào và khi nào hợp đồng cho phép dừng?", "After each VISIT_INDEX, which positions are ruled out and when does the contract permit stopping?"),
        "COUNT_OCCURRENCES": ("Mỗi VISIT_OR_RECURSE làm tổng bộ phận khớp với phần dữ liệu đã xử lý như thế nào?", "How does each VISIT_OR_RECURSE keep the partial total equal to matches in the processed data?"),
        "FILTER_RECORDS": ("Tại sao bản ghi chỉ nhận ACCEPT khi mọi mệnh đề AND đúng, và vì sao vẫn phải quét tiếp?", "Why is a record ACCEPTed only when every AND clause holds, and why must the scan continue?"),
        "GROUP_AGGREGATE": ("Sự kiện nào chứng minh một mục chỉ UPDATE_EXISTING hoặc CREATE_GROUP đúng một lần cho khóa của nó?", "Which event proves that one item performs exactly one UPDATE_EXISTING or CREATE_GROUP for its key?"),
        "BUBBLE_SORT": ("Sau SHRINK_BOUNDARY, vì sao hậu tố vừa tô đã ở vị trí cuối và không cần so sánh lại?", "After SHRINK_BOUNDARY, why is the highlighted suffix final and no longer compared?"),
        "INSERTION_SORT": ("SELECT_KEY, SHIFT_RIGHT và PLACE_KEY mở rộng tiền tố đã sắp mà không làm mất bản ghi ra sao?", "How do SELECT_KEY, SHIFT_RIGHT, and PLACE_KEY enlarge the sorted prefix without losing a record?"),
        "BINARY_SEARCH": ("Mỗi DISCARD_HALF giữ mục tiêu trong biên bao hàm nào và làm độ dài khoảng giảm nghiêm ngặt ra sao?", "How does each DISCARD_HALF retain the target within inclusive bounds while strictly shrinking the interval?"),
    }
    out = []
    for card in cards:
        p = card["pattern_id"]
        cv = cases[p]
        out.append({
            "visual_brief_id": f"B2-VIS-{p}", "pattern_id": p,
            "method_step_refs": [s["step_id"] for s in card["method_steps"]], "error_refs": card["error_refs"],
            "learning_question": bi(*questions[p]),
            "visual_mode": "event_driven",
            "state_to_show": unique(x for s in card["method_steps"] for x in s["writes"]),
            "proposed_event_types": events[p],
            "predict_prompt": bi("Hãy dự đoán sự kiện và trạng thái tiếp theo trước khi chạy một bước.", "Predict the next event and state before advancing one step."),
            "normal_case": bi(cv[0], cv[1]), "boundary_case": bi(cv[2], cv[3]), "failure_case": bi(cv[4], cv[5]),
            "representation_and_convention": "; ".join(card["applicability"]["representation"] + card["applicability"]["conventions"]),
            "static_fallback": bi("Bảng từng bước có mũi tên, vùng tô màu và cột guard/bất biến bằng văn bản.", "Step table with arrows, shaded regions, and textual guard/invariant columns."),
            "accessibility_notes": ["Do not encode state by colour alone.", "Announce event name, changed indices, and invariant text.", "Keyboard controls: previous, next, reset, reveal prediction."],
            "status": "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD",
        })
    dump("VISUAL_BRIEFS.json", {"schema_version": "s4-schema-v1", "status": "SUBMITTED", "batch_id": "B2-search-sort", "input_hashes": input_hashes, "visual_briefs": out, "self_checks": {"visual_count": len(out), "unique_event_vocabularies": len({tuple(v["proposed_event_types"]) for v in out}) == len(out), "all_pending_stage7": all(v["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for v in out)}})

def build_review(cards, hashes):
    part_links = sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards)
    unique_parts = len(set(pid for c in cards for pid in c["source_scope"]["assessed_part_ids"]))
    atoms = [a for c in cards for a in c["marking_point_refs"]]
    review = f"""# B2 search-sort submission review\n\nStatus: **SUBMITTED**. Downstream execution and storyboard evidence remain **PENDING Stage 5/7**.\n\n## Scope and counts\n\n- Patterns: {len(cards)} (`{', '.join(PATTERNS)}`)\n- Assessed part links: {part_links}; unique assessed parts: {unique_parts}\n- Owned applicable official atoms: {len(atoms)}; duplicate owned atom IDs: {len(atoms)-len(set(atoms))}\n- Method steps: {sum(len(c['method_steps']) for c in cards)}\n- Variant/invariant rows: 12\n- Error-prevention rows: {len(cards)*3}\n- Worked-example anchor specs: {len(cards)}\n- Pattern-specific visual briefs: {len(cards)}\n\n## Self-review\n\n- Exact Stage 2 assessed-part sets are copied per pattern and checked by the validator.\n- Each B2-applicable official atom is owned once. Co-tagged parts use explicit suffix-level ownership; excluded atoms remain with their other assessed patterns.\n- Official source references retain exact QP/MS locators from the current marking submissions.\n- Every method step contains bilingual action, reason and check plus invariant, guard and termination role.\n- The register preserves linear/count/filter/group differences, bubble/insertion differences, ordered-insert/insertion-sort scope, and iterative/recursive/inclusive-bound variants.\n- Current source issues are carried into cards and design dispositions, including the 2021 bubble variable-name mismatch, W22 counting range defect, and S22 binary-search guard/midpoint defects where applicable.\n- No file claims executable code, execution, trace verification, or exact mark loss.\n\n## Open downstream decisions\n\n1. Stage 5 must implement and record normal, boundary, counterexample and source-risk fixtures before any design becomes VERIFIED.\n2. Stage 7 must choose final interaction timing and responsive layout; the event vocabularies and static fallbacks are fixed here.\n3. Equal-key stability is source-specific when an official part does not prescribe it; each lesson must state the adopted convention rather than imply a universal rule.\n\n## Determinism\n\nThe builder reads the hashed Stage 2/3 and current marking/risk submissions, emits sorted stable JSON, and the validator recomputes all source joins and ownership checks.\n\nInput file count: {len(hashes)}.\n"""
    (HERE / "REVIEW.md").write_text(review, encoding="utf-8")

if __name__ == "__main__":
    main()

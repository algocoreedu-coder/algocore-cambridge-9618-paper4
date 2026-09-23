# B2 — Learning handoff (VI–EN)

Status: **PASS_RECOMMENDED** after author and fresh subprocess runs. Stage 6/7/8 remain NOT_STARTED.

Eight patterns are implemented with explicit normal, boundary, counterexample and source-anchor evidence. The educational content must preserve the bilingual method sequence, invariant, guard, termination role and marking-point links below.

## ORDERED_INSERT — Chèn một bản ghi vào dãy đã sắp / Insert one record into an ordered sequence
- Recognition / Nhận diện: Dãy đã có thứ tự; đề yêu cầu chèn đúng một mục và vẫn giữ thứ tự. / The sequence is already ordered; insert exactly one item and preserve that order.
- Invariant / Bất biến: the existing live sequence is ordered; retained items still satisfy the capacity policy; all positions before the cursor remain before the new item; the shifted suffix preserves order and whole-record integrity; the retained live sequence remains ordered
- Method steps / Các bước: B2-ORDERED_INSERT-S01, B2-ORDERED_INSERT-S02, B2-ORDERED_INSERT-S03, B2-ORDERED_INSERT-S04, B2-ORDERED_INSERT-S05
- Source anchor / Mốc nguồn: 9618_s22_41_1(e)(ii)
- Executed traces / Trace đã chạy: 3

## LINEAR_SEARCH — Tìm kiếm tuần tự / Linear search
- Recognition / Nhận diện: Cần duyệt lần lượt dữ liệu chưa chắc đã sắp để tìm mục hoặc vị trí phù hợp. / Scan data that is not guaranteed to be sorted to find a matching item or position.
- Invariant / Bất biến: the target and result convention stay fixed; no unvisited element has influenced the result; all earlier live elements have been checked; the comparison uses the fixed equality rule; a stored first match remains the first match; all required candidates were checked or a permitted early match ended the scan
- Method steps / Các bước: B2-LINEAR_SEARCH-S01, B2-LINEAR_SEARCH-S02, B2-LINEAR_SEARCH-S03, B2-LINEAR_SEARCH-S04, B2-LINEAR_SEARCH-S05, B2-LINEAR_SEARCH-S06
- Source anchor / Mốc nguồn: 9618_s21_41_2(b)(i)
- Executed traces / Trace đã chạy: 3

## COUNT_OCCURRENCES — Đếm số lần thỏa điều kiện / Count occurrences
- Recognition / Nhận diện: Kết quả là tổng số phần tử thỏa điều kiện, nên phải xét toàn bộ phạm vi sống. / The result is the number of matching elements, so the complete live range must be examined.
- Invariant / Bất biến: the predicate and range remain fixed; the count equals matches in the processed empty prefix; the partial count covers exactly the processed elements; partial count equals the number of matches processed so far; processed and remaining ranges partition the live data; the count equals all matching live elements
- Method steps / Các bước: B2-COUNT_OCCURRENCES-S01, B2-COUNT_OCCURRENCES-S02, B2-COUNT_OCCURRENCES-S03, B2-COUNT_OCCURRENCES-S04, B2-COUNT_OCCURRENCES-S05, B2-COUNT_OCCURRENCES-S06
- Source anchor / Mốc nguồn: 9618_w25_43_3(a)(i)
- Executed traces / Trace đã chạy: 3

## FILTER_RECORDS — Lọc tất cả bản ghi thỏa điều kiện / Filter all matching records
- Recognition / Nhận diện: Cần xuất hoặc thu thập mọi bản ghi thỏa đồng thời các điều kiện. / Output or collect every record satisfying the combined conditions.
- Invariant / Bất biến: the full predicate remains fixed; the result contains exactly accepted processed records; all earlier records have been classified; no partial clause can accept a record; result equals all matching processed records; result contains all and only matching live records
- Method steps / Các bước: B2-FILTER_RECORDS-S01, B2-FILTER_RECORDS-S02, B2-FILTER_RECORDS-S03, B2-FILTER_RECORDS-S04, B2-FILTER_RECORDS-S05, B2-FILTER_RECORDS-S06
- Source anchor / Mốc nguồn: 9618_w21_41_2(g)
- Executed traces / Trace đã chạy: 3

## GROUP_AGGREGATE — Gom nhóm và cập nhật tổng hợp / Group and update aggregates
- Recognition / Nhận diện: Mỗi khóa chỉ có một nhóm; mục mới cập nhật nhóm có sẵn hoặc tạo đúng một nhóm. / Each key has one group; a new item updates an existing group or creates exactly one group.
- Invariant / Bất biến: each key names at most one live group; unprocessed inputs remain unchanged; no earlier group matches the current key; all other groups remain unchanged; one live group exists for every processed key; each processed input contributes once to exactly one group
- Method steps / Các bước: B2-GROUP_AGGREGATE-S01, B2-GROUP_AGGREGATE-S02, B2-GROUP_AGGREGATE-S03, B2-GROUP_AGGREGATE-S04, B2-GROUP_AGGREGATE-S05, B2-GROUP_AGGREGATE-S06
- Source anchor / Mốc nguồn: 9618_w23_41_2(c)(iii)
- Executed traces / Trace đã chạy: 3

## BUBBLE_SORT — Sắp xếp nổi bọt / Bubble sort
- Recognition / Nhận diện: Sắp toàn bộ dãy bằng các so sánh cặp kề nhau và hoán đổi sai thứ tự. / Sort the complete sequence by comparing adjacent pairs and swapping those in the wrong order.
- Invariant / Bất biến: the multiset of complete records is preserved; the suffix beyond the boundary is already final; all pairs before the cursor have been processed this pass; the multiset of records is unchanged; the fixed suffix is ordered and final; the whole live sequence is ordered and records are preserved
- Method steps / Các bước: B2-BUBBLE_SORT-S01, B2-BUBBLE_SORT-S02, B2-BUBBLE_SORT-S03, B2-BUBBLE_SORT-S04, B2-BUBBLE_SORT-S05, B2-BUBBLE_SORT-S06
- Source anchor / Mốc nguồn: 9618_w25_42_2(c)
- Executed traces / Trace đã chạy: 3

## INSERTION_SORT — Sắp xếp chèn / Insertion sort
- Recognition / Nhận diện: Mở rộng tiền tố đã sắp bằng cách lấy một khóa, dịch các mục trước đó rồi đặt khóa. / Grow a sorted prefix by taking one key, shifting prior items, then placing the key.
- Invariant / Bất biến: the multiset of complete records is preserved; the prefix is ordered and preserves its records; the saved key is not lost during shifts; the gap and shifted suffix are ordered relative to the key; the enlarged prefix is ordered and preserves its records; the complete live sequence is ordered
- Method steps / Các bước: B2-INSERTION_SORT-S01, B2-INSERTION_SORT-S02, B2-INSERTION_SORT-S03, B2-INSERTION_SORT-S04, B2-INSERTION_SORT-S05, B2-INSERTION_SORT-S06
- Source anchor / Mốc nguồn: 9618_s25_43_2(b)
- Executed traces / Trace đã chạy: 3

## BINARY_SEARCH — Tìm kiếm nhị phân / Binary search
- Recognition / Nhận diện: Dữ liệu đã sắp; mỗi phép so sánh loại bỏ một nửa khoảng tìm kiếm. / The data is sorted; each comparison discards half of the remaining interval.
- Invariant / Bất biến: the target can only lie inside the current interval; no discarded position can contain the target; mid belongs to the candidate interval; the target, if present, remains inside the interval; the result is a valid match or the agreed absent value
- Method steps / Các bước: B2-BINARY_SEARCH-S01, B2-BINARY_SEARCH-S02, B2-BINARY_SEARCH-S03, B2-BINARY_SEARCH-S04, B2-BINARY_SEARCH-S05, B2-BINARY_SEARCH-S06
- Source anchor / Mốc nguồn: 9618_w25_42_2(e)
- Executed traces / Trace đã chạy: 3

## Required Stage 6 handoff slots
- VI–EN recognition and decision rule
- VI–EN method explanation with one worked example
- guard/invariant checkpoint prompts
- boundary and counterexample explanation
- marking point mapping without synthetic marks
- source authority note and source fixture link
- event-driven visual trace link
- accessibility fallback table
- learner self-check and retrieval prompt

Lead gate condition: do not promote Stage 5 to EXECUTION_VERIFIED until A5 independent rerun and A8 QA both PASS.

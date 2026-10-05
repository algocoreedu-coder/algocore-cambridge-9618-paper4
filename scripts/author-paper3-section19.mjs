import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "content", "paper3", "lessons");
const L = (en, vi) => ({ en, vi });
const P = ([en, vi]) => L(en, vi);
const theory = (id, title, paragraph, code) => ({ id, title: P(title), paragraphs: [P(paragraph)], ...(code ? { code } : {}), sourceIds: ["syllabus-2026", "book"] });
const step = (id, action, why, result, code) => ({ id, action: P(action), why: P(why), result: P(result), check: L(`Check that ${result[0].toLowerCase()}`, `Kiểm tra rằng ${result[1].toLowerCase()}`), ...(code ? { code } : {}) });
const misconception = (mistake, correction, selfCheck) => ({ mistake: P(mistake), correction: P(correction), selfCheck: P(selfCheck) });
const checkpoint = (id, prompt, options, correctIndex, explanation, transfer = false) => ({
  id, prompt: P(prompt), transfer,
  choices: options.map((option, index) => ({ id: String.fromCharCode(97 + index), label: P(option.slice(0, 2)), feedback: P(option.slice(2, 4)) })),
  correctChoiceId: String.fromCharCode(97 + correctIndex), explanation: P(explanation),
});
const commands = (focus) => [
  { command: "write", guidance: L(`Write a complete response for ${focus.en}: declare the convention, show every required operation and close all Cambridge pseudocode structures.`, `Viết câu trả lời đầy đủ cho ${focus.vi}: khai báo quy ước, trình bày mọi thao tác cần thiết và đóng mọi cấu trúc giả mã Cambridge.`) },
  { command: "trace", guidance: L(`Record each state change for ${focus.en}; include unchanged decisions and the final result.`, `Ghi từng thay đổi trạng thái của ${focus.vi}; gồm cả quyết định không đổi và kết quả cuối.`) },
  { command: "explain", guidance: L(`Link the rule for ${focus.en} to the resulting state or performance consequence.`, `Liên hệ quy tắc của ${focus.vi} với trạng thái hoặc hệ quả hiệu năng.`) },
  { command: "compare", guidance: L(`Use one shared criterion and the same task before comparing ${focus.en} with another method.`, `Dùng một tiêu chí chung và cùng nhiệm vụ trước khi so sánh ${focus.vi} với phương pháp khác.`) },
  { command: "justify", guidance: L(`Name the feature of ${focus.en}, then connect it to the requirement in the given situation.`, `Nêu đặc điểm của ${focus.vi}, rồi nối nó với yêu cầu của tình huống đã cho.`) },
];
const sourceSet = (bookLocator, papers = []) => [
  { id: "syllabus-2026", title: "Cambridge International AS & A Level Computer Science 9618 — syllabus for examinations in 2026, Version 2", locator: "Printed/PDF p37, §§19.1–19.2", kind: "syllabus", url: "https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf" },
  { id: "book", title: "Watson and Williams, Cambridge International AS & A Level Computer Science, Hodder Education, 2019, ISBN 9781510457591", locator: bookLocator, kind: "book" },
  { id: "pseudocode-guide", title: "Cambridge 9618 Pseudocode Guide for Teachers for examination in 2026, Version 1", locator: "pp5–24: presentation, declarations, arrays, operators, control structures and subroutines", kind: "guide", url: "https://www.cambridgeinternational.org/Images/697401-2026-pseudocode-guide.pdf" },
  ...papers,
];
const paperPair = (id, title, qp, ms) => [
  { id: `${id}-qp`, title: `${title} question paper`, locator: qp, kind: "question-paper" },
  { id: `${id}-ms`, title: `${title} mark scheme`, locator: ms, kind: "mark-scheme" },
];

function makeLesson(spec) {
  return {
    schemaVersion: 1, version: "2026.19.1", topicId: spec.id, slug: spec.slug, estimatedMinutes: spec.minutes,
    title: P(spec.title), question: P(spec.question), opening: P(spec.opening),
    objectives: spec.objectives.map(P), prerequisites: spec.prerequisites.map(P),
    glossary: spec.glossary.map(([term, en, vi]) => ({ term, meaning: L(en, vi) })),
    theory: spec.theory.map((x) => theory(...x)),
    visual: { kind: spec.kind, title: P(spec.visual.title), introduction: P(spec.visual.introduction), task: P(spec.visual.task), conventions: spec.visual.conventions.map(P), sourceIds: ["syllabus-2026", "book"] },
    workedExample: { title: P(spec.worked.title), prompt: P(spec.worked.prompt), origin: "algocore-authored", officialMarks: null, steps: spec.worked.steps.map((x) => step(...x)), result: P(spec.worked.result), selfCheck: P(spec.worked.selfCheck), sourceIds: ["syllabus-2026", "book"] },
    recognition: { cues: spec.recognition.cues.map(P), distinguish: P(spec.recognition.distinguish), method: spec.recognition.method.map(P), commandWords: commands({ en: spec.title[0], vi: spec.title[1] }) },
    misconceptions: spec.misconceptions.map((x) => misconception(...x)),
    checkpoints: spec.checkpoints.map((x) => checkpoint(...x)),
    recall: { prompt: P(spec.recall.prompt), answerPoints: [...spec.recall.points, ["State the declared convention and verify the final invariant or boundary.", "Nêu quy ước đã công bố và kiểm tra invariant hoặc boundary cuối."]].map(P) },
    takeaways: spec.takeaways.map(P), relatedSlugs: spec.related, sources: sourceSet(spec.book, spec.papers),
  };
}

const linearCode = `FUNCTION LinearSearch(Data : ARRAY[0:5] OF INTEGER, Target : INTEGER) RETURNS INTEGER
  DECLARE Index : INTEGER
  Index ← 0
  WHILE Index <= 5
    IF Data[Index] = Target THEN
      RETURN Index
    ENDIF
    Index ← Index + 1
  ENDWHILE
  RETURN -1
ENDFUNCTION`;

const linear = makeLesson({
  id: "P3-19.1-T01", slug: "linear-search", minutes: 30, kind: "linear-search", title: ["Linear search", "Tìm kiếm tuyến tính"],
  question: ["How can a sequential scan prove that a target is found or absent?", "Quét tuần tự chứng minh target được tìm thấy hoặc không tồn tại như thế nào?"],
  opening: ["A class list is unsorted. The search must inspect only valid cells and report the first match or −1.", "Danh sách lớp chưa sắp xếp. Thuật toán chỉ được xét ô hợp lệ và trả match đầu tiên hoặc −1."],
  objectives: [["Trace a zero-based first-match scan.", "Trace phép quét zero-based trả match đầu tiên."], ["Write bounded Cambridge pseudocode.", "Viết giả mã Cambridge có giới hạn."], ["Handle empty, duplicate and missing cases.", "Xử lý empty, duplicate và missing."], ["Explain O(n) worst-case growth.", "Giải thích tăng trưởng worst-case O(n)."]],
  prerequisites: [["Read a one-dimensional array and its bounds.", "Đọc mảng một chiều và cận."], ["Use equality and a WHILE loop.", "Dùng phép bằng và vòng WHILE."]],
  glossary: [["target", "Value being sought.", "Giá trị cần tìm."], ["first match", "Lowest valid index containing the target.", "Chỉ số hợp lệ nhỏ nhất chứa target."], ["comparison", "One test of the current item against the target.", "Một lần so phần tử hiện tại với target."], ["sentinel result", "Declared value −1 meaning not found.", "Giá trị −1 đã quy ước nghĩa là không tìm thấy."], ["valid range", "Indices 0 through UpperBound inclusive.", "Các chỉ số từ 0 tới UpperBound, có tính cả hai đầu."]],
  theory: [
    ["valid-range", ["Lock the range", "Khóa miền hợp lệ"], ["The fixture is zero-based. Index starts at 0 and no cell above UpperBound is read.", "Fixture dùng zero-based. Index bắt đầu tại 0 và không đọc ô lớn hơn UpperBound."]],
    ["compare-then-advance", ["Compare before advancing", "So sánh trước khi tăng"], ["Test Data[Index] first. Return Index immediately on equality; otherwise increment exactly once.", "Kiểm tra Data[Index] trước. Trả Index ngay khi bằng; nếu không thì tăng đúng một lần."]],
    ["missing-duplicate", ["First match and missing", "Match đầu tiên và missing"], ["Duplicates stop at the first reachable index. Missing is known only after the valid range is exhausted; an empty array makes zero comparisons.", "Dữ liệu trùng dừng tại chỉ số đầu tiên gặp. Chỉ kết luận missing sau khi hết miền hợp lệ; mảng rỗng có 0 phép so sánh."]],
    ["linear-pseudocode", ["Cambridge pseudocode", "Giả mã Cambridge"], ["The function below records the match before any increment, avoiding an off-by-one result.", "Hàm dưới lưu match trước mọi lần tăng, tránh kết quả lệch một chỉ số."], linearCode],
  ],
  visual: { title: ["Sequential search workbench", "Bàn trace tìm kiếm tuần tự"], introduction: ["The checked prefix, active index, comparison count and result advance together.", "Prefix đã xét, chỉ số hiện tại, số phép so sánh và kết quả tiến cùng nhau."], task: ["Predict each next comparison, then test first, duplicate, missing and empty fixtures.", "Dự đoán phép so sánh tiếp theo, rồi thử fixture đầu, trùng, missing và empty."], conventions: [["Index base 0; valid range 0..UpperBound.", "Index base 0; miền hợp lệ 0..UpperBound."], ["Return first matching index, else −1.", "Trả chỉ số match đầu tiên, nếu không trả −1."], ["AlgoCore teaching fixtures; no official marks.", "Fixture dạy học AlgoCore; không có điểm chính thức."]] },
  worked: { title: ["Find the first 7", "Tìm số 7 đầu tiên"], prompt: ["Trace Data=[4,9,2,7,7,1], Target=7.", "Trace Data=[4,9,2,7,7,1], Target=7."], steps: [
    ["declare", ["Write bounds 0..5 and first-match return rule.", "Ghi cận 0..5 và quy tắc trả match đầu tiên."], ["This fixes which cells may be read.", "Điều này khóa các ô được phép đọc."], ["UpperBound=5; missing result is −1.", "UpperBound=5; kết quả missing là −1."]],
    ["initialise", ["Set Index←0.", "Đặt Index←0."], ["The first valid cell is 0.", "Ô hợp lệ đầu tiên là 0."], ["No cells checked; comparisons=0.", "Chưa xét ô nào; comparisons=0."], "Index ← 0"],
    ["check-0", ["Compare 4 with 7.", "So sánh 4 với 7."], ["The current cell is tested before advancing.", "Ô hiện tại được xét trước khi tăng."], ["Mismatch; Index←1; comparisons=1.", "Không khớp; Index←1; comparisons=1."]],
    ["check-1", ["Compare 9 with 7.", "So sánh 9 với 7."], ["Linear search does not use ordering.", "Linear search không dùng thứ tự."], ["Mismatch; Index←2; comparisons=2.", "Không khớp; Index←2; comparisons=2."]],
    ["check-2", ["Compare 2 with 7.", "So sánh 2 với 7."], ["Every earlier valid item must be ruled out.", "Mọi phần tử hợp lệ trước đó phải bị loại."], ["Mismatch; Index←3; comparisons=3.", "Không khớp; Index←3; comparisons=3."]],
    ["check-3", ["Compare 7 with 7 and return 3.", "So sánh 7 với 7 và trả 3."], ["Equality satisfies the first-match contract.", "Phép bằng thỏa contract match đầu tiên."], ["Result=3; comparisons=4; index 4 is not inspected.", "Result=3; comparisons=4; không xét index 4."], "RETURN Index"],
  ], result: ["The first target is at index 3 after four comparisons.", "Target đầu tiên ở index 3 sau bốn phép so sánh."], selfCheck: ["Did the trace compare before incrementing and stop at the first duplicate?", "Trace có so sánh trước khi tăng và dừng ở phần tử trùng đầu tiên không?"] },
  recognition: { cues: [["scan/check each item", "quét/kiểm tra từng phần tử"], ["unsorted data", "dữ liệu chưa sắp xếp"], ["first occurrence", "lần xuất hiện đầu tiên"]], distinguish: ["Near miss: a long list alone does not justify binary search; the list must be sorted under the comparison rule.", "Dễ nhầm: chỉ danh sách dài chưa đủ để dùng binary search; danh sách phải được sắp theo quy tắc so sánh."], method: [["Write the bounds and duplicate policy.", "Ghi cận và chính sách duplicate."], ["Initialise the first valid index.", "Khởi tạo chỉ số hợp lệ đầu tiên."], ["Compare before incrementing.", "So sánh trước khi tăng."], ["Return immediately on the first match.", "Trả ngay tại match đầu tiên."], ["Return −1 only after exhaustion.", "Chỉ trả −1 sau khi hết miền."]] },
  misconceptions: [
    [["Increment before saving the match.", "Tăng trước khi lưu match."], ["Return the current index before incrementing.", "Trả chỉ số hiện tại trước khi tăng."], ["Which index actually contained the target?", "Chỉ số nào thực sự chứa target?"]],
    [["Report missing after one mismatch.", "Báo missing sau một mismatch."], ["Continue until every valid cell has been ruled out.", "Tiếp tục tới khi mọi ô hợp lệ bị loại."], ["Has the valid range been exhausted?", "Miền hợp lệ đã hết chưa?"]],
    [["Use binary search because the list is large.", "Dùng binary search vì danh sách lớn."], ["Confirm the sorted precondition before selecting binary search.", "Xác nhận điều kiện sorted trước khi chọn binary search."], ["What evidence says the values are sorted?", "Dữ kiện nào cho biết các giá trị đã sorted?"]],
    [["Read Data[0] for an empty input.", "Đọc Data[0] với input rỗng."], ["Use a pre-condition loop so zero comparisons are possible.", "Dùng vòng lặp kiểm tra trước để có thể thực hiện 0 phép so sánh."], ["Is index 0 valid when UpperBound=−1?", "Index 0 có hợp lệ khi UpperBound=−1 không?"]],
  ],
  checkpoints: [
    ["recall", ["What does this fixture return for a missing target?", "Fixture này trả gì khi thiếu target?"], [["−1", "−1", "Correct: −1 is the declared missing sentinel.", "Đúng: −1 là sentinel missing đã công bố."], ["0", "0", "Index 0 is a valid location, so it cannot mean missing here.", "Index 0 là vị trí hợp lệ nên không thể nghĩa là missing."], ["UpperBound", "UpperBound", "UpperBound names the last valid cell, not failure.", "UpperBound là ô hợp lệ cuối, không phải failure."]], 0, ["Use the declared return contract.", "Dùng contract trả về đã công bố."]],
    ["recognise", ["Which clue best identifies linear search?", "Dấu hiệu nào nhận diện linear search rõ nhất?"], [["Check each item in an unsorted list", "Kiểm tra từng phần tử trong danh sách chưa sorted", "Correct: sequential scanning does not require sorting.", "Đúng: quét tuần tự không yêu cầu sorted."], ["Repeatedly discard half", "Liên tục loại một nửa", "Discarding half is binary-search language.", "Loại một nửa là ngôn ngữ của binary search."], ["Compare adjacent pairs", "So sánh cặp kề nhau", "Adjacent pairs indicate bubble sort.", "Cặp kề nhau cho thấy bubble sort."]], 0, ["Use the scan/unsorted clue.", "Dùng dấu hiệu quét/unsorted."]],
    ["predict", ["After mismatches at indices 0 and 1, which cell is checked next?", "Sau mismatch tại index 0 và 1, ô nào được xét tiếp?"], [["Index 2", "Index 2", "Correct: Index advances exactly once per mismatch.", "Đúng: Index tăng đúng một lần cho mỗi mismatch."], ["Index 3", "Index 3", "That skips index 2 and cannot prove absence.", "Cách này bỏ index 2 và không chứng minh được absence."], ["Index 1 again", "Lại index 1", "Without increment the algorithm would not progress.", "Không tăng thì thuật toán không tiến triển."]], 0, ["The unchecked prefix begins at index 2.", "Prefix chưa xét bắt đầu tại index 2."]],
    ["trace", ["For [4,9,2,7,7,1], how many comparisons find the first 7?", "Với [4,9,2,7,7,1], cần bao nhiêu phép so sánh để tìm 7 đầu tiên?"], [["4", "4", "Correct: indices 0,1,2,3 are tested.", "Đúng: xét index 0,1,2,3."], ["3", "3", "Three mismatches occur before the fourth comparison matches.", "Có ba mismatch trước phép so sánh thứ tư khớp."], ["5", "5", "The first match stops before checking the duplicate at index 4.", "Match đầu tiên dừng trước khi xét duplicate tại index 4."]], 0, ["Count comparisons, including the successful one.", "Đếm cả phép so sánh thành công."]],
    ["write", ["Which update belongs after a mismatch?", "Cập nhật nào đặt sau mismatch?"], [["Index ← Index + 1", "Index ← Index + 1", "Correct: this checks the next valid cell.", "Đúng: bước này xét ô hợp lệ tiếp theo."], ["Index ← Index + 2", "Index ← Index + 2", "This can skip a possible target.", "Cách này có thể bỏ qua target."], ["RETURN −1", "RETURN −1", "Failure is returned only after range exhaustion.", "Chỉ trả failure sau khi hết miền."]], 0, ["Progress one cell without skipping.", "Tiến một ô mà không bỏ sót."]],
    ["transfer", ["UpperBound=−1. What happens?", "UpperBound=−1. Điều gì xảy ra?"], [["Zero comparisons; return −1", "0 phép so sánh; trả −1", "Correct: 0<=−1 is false before any read.", "Đúng: 0<=−1 sai trước mọi lần đọc."], ["Read Data[0]", "Đọc Data[0]", "Index 0 is outside the declared empty range.", "Index 0 nằm ngoài miền rỗng đã công bố."], ["Return 0", "Trả 0", "0 is a valid index in non-empty fixtures, not the missing sentinel.", "0 là index hợp lệ trong fixture không rỗng, không phải sentinel missing."]], 0, ["A WHILE guard makes the empty case safe.", "Guard WHILE làm trường hợp empty an toàn."], true],
  ],
  recall: { prompt: ["State the invariant and termination rule for first-match linear search.", "Nêu invariant và quy tắc dừng của linear search match đầu tiên."], points: [["All indices below Index have been checked and do not match.", "Mọi chỉ số dưới Index đã được xét và không khớp."], ["Return Index on equality.", "Trả Index khi bằng."], ["Return −1 only after Index passes UpperBound.", "Chỉ trả −1 khi Index vượt UpperBound."]] },
  takeaways: [["Compare before incrementing.", "So sánh trước khi tăng."], ["Missing follows complete exhaustion.", "Missing chỉ sau khi hết toàn bộ miền."], ["Worst-case comparisons grow linearly with n.", "Số phép so sánh worst-case tăng tuyến tính theo n."]], related: ["binary-search", "time-and-space-complexity"],
  book: "Chapter 19, printed pp451–454 / PDF pp467–470: linear search", papers: [...paperPair("s22-32", "Cambridge 9618/32 — May/June 2022", "Question 8(a), p11", "Question 8(a), p8"), ...paperPair("s24-32", "Cambridge 9618/32 — May/June 2024", "Question 8(a), p9", "Question 8(a), p10")],
});

const binaryCode = `FUNCTION BinarySearch(Data : ARRAY[0:6] OF INTEGER, Target : INTEGER) RETURNS INTEGER
  DECLARE Low : INTEGER
  DECLARE High : INTEGER
  DECLARE Mid : INTEGER
  Low ← 0
  High ← 6
  WHILE Low <= High
    Mid ← (Low + High) DIV 2
    IF Data[Mid] = Target THEN
      RETURN Mid
    ELSE
      IF Data[Mid] < Target THEN
        Low ← Mid + 1
      ELSE
        High ← Mid - 1
      ENDIF
    ENDIF
  ENDWHILE
  RETURN -1
ENDFUNCTION`;

const binary = makeLesson({
  id: "P3-19.1-T02", slug: "binary-search", minutes: 35, kind: "binary-search", title: ["Binary search", "Tìm kiếm nhị phân"],
  question: ["How does sorted order let one comparison discard half of the remaining window?", "Thứ tự sorted giúp một phép so sánh loại một nửa cửa sổ còn lại như thế nào?"],
  opening: ["A sorted ID list can be searched by keeping an inclusive Low..High window.", "Danh sách ID đã sorted có thể được tìm bằng cửa sổ Low..High tính cả hai đầu."],
  objectives: [["State and test the sorted precondition.", "Nêu và kiểm tra điều kiện sorted."], ["Trace inclusive Low, High and Mid.", "Trace Low, High, Mid tính cả hai đầu."], ["Write a progressing search that checks the last candidate.", "Viết thuật toán tiến triển có xét ứng viên cuối."], ["Explain logarithmic comparison growth.", "Giải thích tăng trưởng phép so sánh logarithmic."]],
  prerequisites: [["Compare ordered integers.", "So sánh số nguyên có thứ tự."], ["Use DIV and inclusive bounds.", "Dùng DIV và cận inclusive."]],
  glossary: [["sorted precondition", "Values are non-decreasing under the search comparison.", "Giá trị không giảm theo phép so sánh của search."], ["search window", "Inclusive indices Low through High still possible.", "Các index Low tới High còn có thể, tính cả hai đầu."], ["midpoint", "Index (Low+High) DIV 2.", "Index (Low+High) DIV 2."], ["discard", "Remove a proven-impossible half from the next window.", "Loại nửa đã chứng minh không thể chứa target."], ["logarithmic", "Repeated halving gives O(log n) growth.", "Liên tục chia đôi tạo tăng trưởng O(log n)."]],
  theory: [
    ["sorted", ["Sorted data is required", "Cần dữ liệu sorted"], ["The comparison at Mid is useful only when values are sorted by the same rule. An unsorted fixture is blocked, not searched.", "So sánh tại Mid chỉ hữu ích khi giá trị sorted theo cùng quy tắc. Fixture unsorted bị chặn, không được search."]],
    ["inclusive", ["Inclusive window", "Cửa sổ inclusive"], ["Low and High are both candidates. WHILE Low<=High checks a singleton and safely skips an empty window.", "Low và High đều là ứng viên. WHILE Low<=High xét singleton và bỏ qua an toàn cửa sổ rỗng."]],
    ["progress", ["Exclude Mid after inequality", "Loại Mid sau bất đẳng thức"], ["Target larger sets Low←Mid+1; target smaller sets High←Mid−1. Equality returns the first matching midpoint encountered, not necessarily the first duplicate.", "Target lớn hơn đặt Low←Mid+1; target nhỏ hơn đặt High←Mid−1. Equality trả midpoint khớp đầu tiên gặp, không nhất thiết duplicate đầu tiên."]],
    ["binary-code", ["Cambridge pseudocode", "Giả mã Cambridge"], ["The implementation checks the final candidate and returns −1 only when Low>High.", "Cài đặt xét ứng viên cuối và chỉ trả −1 khi Low>High."], binaryCode],
  ],
  visual: { title: ["Halving-window workbench", "Bàn trace cửa sổ chia đôi"], introduction: ["The window, midpoint, comparison and discarded cells change together.", "Cửa sổ, midpoint, phép so sánh và ô bị loại thay đổi cùng nhau."], task: ["Predict the next window, then diagnose the unsorted near-miss.", "Dự đoán cửa sổ tiếp theo, rồi chẩn đoán near-miss unsorted."], conventions: [["Zero-based; Low/High inclusive.", "Zero-based; Low/High inclusive."], ["Mid=(Low+High) DIV 2.", "Mid=(Low+High) DIV 2."], ["Duplicate result is first midpoint match, not first duplicate.", "Kết quả duplicate là midpoint khớp đầu tiên, không phải duplicate đầu tiên."]] },
  worked: { title: ["Find 31 in seven values", "Tìm 31 trong bảy giá trị"], prompt: ["Trace [3,8,12,19,24,31,45], Target=31.", "Trace [3,8,12,19,24,31,45], Target=31."], steps: [
    ["precondition", ["Confirm non-decreasing order.", "Xác nhận thứ tự không giảm."], ["Half-discard logic depends on order.", "Logic loại nửa phụ thuộc thứ tự."], ["Binary search may run.", "Binary search có thể chạy."]],
    ["initialise", ["Set Low←0 and High←6.", "Đặt Low←0 và High←6."], ["Both endpoints are valid candidates.", "Cả hai đầu đều là ứng viên hợp lệ."], ["Window contains seven values.", "Cửa sổ chứa bảy giá trị."]],
    ["mid-3", ["Calculate Mid←3 and compare 19 with 31.", "Tính Mid←3 và so 19 với 31."], ["19<31 proves indices 0..3 cannot contain 31.", "19<31 chứng minh index 0..3 không thể chứa 31."], ["Low←4; High remains 6.", "Low←4; High vẫn là 6."], "Low ← Mid + 1"],
    ["mid-5", ["Calculate Mid←(4+6) DIV 2=5.", "Tính Mid←(4+6) DIV 2=5."], ["The window midpoint is a live candidate.", "Midpoint của cửa sổ là ứng viên còn sống."], ["Data[5]=31 matches.", "Data[5]=31 khớp."], "Mid ← (Low + High) DIV 2"],
    ["return", ["Return 5 immediately.", "Trả 5 ngay."], ["Equality satisfies the result contract.", "Equality thỏa result contract."], ["Result=5 after two comparisons.", "Result=5 sau hai phép so sánh."], "RETURN Mid"],
    ["verify", ["Check the window invariant and index.", "Kiểm tra invariant cửa sổ và index."], ["Every discarded value is below Target.", "Mọi giá trị bị loại đều nhỏ hơn Target."], ["Index 5 contains 31; no excluded region is revisited.", "Index 5 chứa 31; không xét lại vùng đã loại."]],
  ], result: ["Binary search returns index 5 after two comparisons.", "Binary search trả index 5 sau hai phép so sánh."], selfCheck: ["Did every inequality exclude Mid and strictly shrink the inclusive window?", "Mỗi bất đẳng thức có loại Mid và thu nhỏ nghiêm ngặt cửa sổ inclusive không?"] },
  recognition: { cues: [["sorted/ordered list", "danh sách sorted/có thứ tự"], ["middle item", "phần tử giữa"], ["discard half", "loại một nửa"]], distinguish: ["Near miss: a middle-item comparison on unsorted values cannot justify discarding either side.", "Dễ nhầm: so sánh phần tử giữa trên dữ liệu unsorted không biện minh được việc loại bên nào."], method: [["Confirm sorted order.", "Xác nhận thứ tự sorted."], ["Write inclusive bounds.", "Ghi cận inclusive."], ["Calculate floor midpoint.", "Tính midpoint làm tròn xuống."], ["Use the comparison to exclude Mid and one half.", "Dùng phép so sánh để loại Mid và một nửa."], ["Stop on equality or Low>High.", "Dừng khi bằng hoặc Low>High."]] },
  misconceptions: [
    [["Run on unsorted data.", "Chạy trên dữ liệu unsorted."], ["Block the run until the sorted precondition holds.", "Chặn run tới khi điều kiện sorted đúng."], ["Which inequality proves a whole side impossible?", "Bất đẳng thức nào chứng minh cả một bên là không thể?"]],
    [["Set Low←Mid after Target is larger.", "Đặt Low←Mid khi Target lớn hơn."], ["Use Low←Mid+1 so the state must progress.", "Dùng Low←Mid+1 để trạng thái chắc chắn tiến."], ["Can the same Mid repeat?", "Mid cũ có thể lặp không?"]],
    [["Stop when Low=High without checking.", "Dừng khi Low=High mà không xét."], ["Keep WHILE Low<=High so the final candidate is tested.", "Giữ WHILE Low<=High để xét ứng viên cuối."], ["Was the singleton candidate compared?", "Ứng viên singleton đã được so sánh chưa?"]],
    [["Promise the first duplicate.", "Hứa trả duplicate đầu tiên."], ["State that this fixture returns the first matching midpoint encountered.", "Nêu fixture trả midpoint khớp đầu tiên gặp."], ["Does the algorithm scan left after equality?", "Thuật toán có quét trái sau equality không?"]],
  ],
  checkpoints: [
    ["recall", ["Which precondition is essential?", "Điều kiện nào là thiết yếu?"], [["Values sorted by the same comparison rule", "Giá trị sorted theo cùng quy tắc so sánh", "Correct: only then can one half be ruled out.", "Đúng: chỉ khi đó mới loại được một nửa."], ["All values unique", "Mọi giá trị unique", "Duplicates are allowed under the declared result policy.", "Duplicate được phép theo result policy đã nêu."], ["Array length is even", "Độ dài mảng là số chẵn", "Binary search works for odd, even and singleton sizes.", "Binary search chạy với size lẻ, chẵn và singleton."]], 0, ["Sorted order supports the discard proof.", "Thứ tự sorted hỗ trợ chứng minh loại nửa."]],
    ["recognise", ["Which wording signals binary search?", "Cụm nào báo hiệu binary search?"], [["Sorted values; compare middle; discard half", "Giá trị sorted; so giữa; loại nửa", "Correct: all three clues fit binary search.", "Đúng: cả ba dấu hiệu khớp binary search."], ["Unsorted; check every item", "Unsorted; kiểm tra từng phần tử", "That identifies linear search.", "Đó là linear search."], ["Adjacent swap passes", "Các pass đổi cặp kề", "That identifies bubble sort.", "Đó là bubble sort."]], 0, ["Look for sorted, midpoint and halving.", "Tìm sorted, midpoint và chia đôi."]],
    ["predict", ["Low=0, High=6, Data[3]=19<Target. Next Low?", "Low=0, High=6, Data[3]=19<Target. Low tiếp theo?"], [["4", "4", "Correct: Mid 3 and the lower half are excluded.", "Đúng: Mid 3 và nửa dưới bị loại."], ["3", "3", "Mid would remain possible and may repeat.", "Mid vẫn còn và có thể lặp."], ["0", "0", "Leaving Low unchanged discards nothing.", "Không đổi Low thì không loại gì."]], 0, ["Use Low←Mid+1.", "Dùng Low←Mid+1."]],
    ["trace", ["How many comparisons find 31 in the worked fixture?", "Cần bao nhiêu phép so sánh để tìm 31 trong fixture?"], [["2", "2", "Correct: compare indices 3 then 5.", "Đúng: so index 3 rồi 5."], ["1", "1", "The first midpoint contains 19, not 31.", "Midpoint đầu chứa 19, không phải 31."], ["4", "4", "The window halves; indices 0,1,2 are not scanned.", "Cửa sổ chia đôi; không quét index 0,1,2."]], 0, ["Count midpoint comparisons only.", "Chỉ đếm các phép so sánh midpoint."]],
    ["write", ["Which loop guard checks the final candidate safely?", "Guard nào xét ứng viên cuối an toàn?"], [["WHILE Low <= High", "WHILE Low <= High", "Correct: equality represents one live candidate.", "Đúng: equality biểu diễn một ứng viên còn sống."], ["WHILE Low < High", "WHILE Low < High", "This can exit before checking a singleton window.", "Cách này có thể thoát trước khi xét cửa sổ singleton."], ["REPEAT forever", "REPEAT mãi", "There is no safe missing termination.", "Không có termination missing an toàn."]], 0, ["Inclusive bounds require <=.", "Cận inclusive cần <=."]],
    ["transfer", ["Values=[10,5,20] and Target=5. What should the visual do?", "Values=[10,5,20], Target=5. Visual nên làm gì?"], [["Report precondition failure without search mutation", "Báo precondition failure mà không mutate search", "Correct: the values are not sorted.", "Đúng: các giá trị chưa sorted."], ["Return −1 as a valid binary result", "Trả −1 như kết quả binary hợp lệ", "A result from an invalid precondition is unreliable.", "Kết quả từ precondition sai là không đáng tin."], ["Sort silently and return 0", "Âm thầm sort rồi trả 0", "Silently changing the question data violates the contract.", "Âm thầm đổi dữ liệu đề bài vi phạm contract."]], 0, ["Diagnose the failed precondition first.", "Chẩn đoán precondition sai trước."], true],
  ],
  recall: { prompt: ["State the binary-search invariant and progress rule.", "Nêu invariant và quy tắc tiến triển của binary search."], points: [["If present, Target remains in inclusive Low..High.", "Nếu tồn tại, Target còn trong Low..High inclusive."], ["Mid uses DIV 2.", "Mid dùng DIV 2."], ["Inequality sets Low=Mid+1 or High=Mid−1.", "Bất đẳng thức đặt Low=Mid+1 hoặc High=Mid−1."]] },
  takeaways: [["Sorted order is mandatory.", "Thứ tự sorted là bắt buộc."], ["Check the singleton candidate.", "Xét ứng viên singleton."], ["Repeated halving gives O(log n) growth.", "Liên tục chia đôi tạo tăng trưởng O(log n)."]], related: ["linear-search", "time-and-space-complexity"],
  book: "Chapter 19, printed pp454–457 / PDF pp470–473: binary search", papers: [...paperPair("w22-31", "Cambridge 9618/31 — October/November 2022", "Question 12, p11", "Question 12, pp14–15"), ...paperPair("s24-31", "Cambridge 9618/31 — May/June 2024", "Question 10, pp10–11", "Question 10, pp12–13")],
});

const quiz = (id, prompt, correct, wrong1, wrong2, rule, transfer = false) => [id, prompt, [
  [correct[0], correct[1], `Correct: ${rule[0]}`, `Đúng: ${rule[1]}`],
  [wrong1[0], wrong1[1], `${wrong1[0]} conflicts with the rule: ${rule[0]}`, `${wrong1[1]} trái với quy tắc: ${rule[1]}`],
  [wrong2[0], wrong2[1], `${wrong2[0]} conflicts with the rule: ${rule[0]}`, `${wrong2[1]} trái với quy tắc: ${rule[1]}`],
], 0, rule, transfer];

const bubbleCode = `PROCEDURE BubbleSort(BYREF Data : ARRAY[0:4] OF INTEGER)
  DECLARE EndIndex : INTEGER
  DECLARE Index : INTEGER
  DECLARE Temp : INTEGER
  DECLARE Swapped : BOOLEAN
  EndIndex ← 4
  REPEAT
    Swapped ← FALSE
    FOR Index ← 0 TO EndIndex - 1
      IF Data[Index] > Data[Index + 1] THEN
        Temp ← Data[Index]
        Data[Index] ← Data[Index + 1]
        Data[Index + 1] ← Temp
        Swapped ← TRUE
      ENDIF
    NEXT Index
    EndIndex ← EndIndex - 1
  UNTIL (Swapped = FALSE) OR (EndIndex = 0)
ENDPROCEDURE`;

const bubble = makeLesson({
  id: "P3-19.1-T03", slug: "bubble-sort", minutes: 35, kind: "bubble-sort", title: ["Bubble sort", "Sắp xếp nổi bọt"],
  question: ["How do adjacent comparisons build a guaranteed sorted region one pass at a time?", "Các phép so sánh kề nhau xây vùng đã sorted sau từng pass như thế nào?"],
  opening: ["Each complete ascending pass moves the largest remaining value to the current upper boundary.", "Mỗi pass tăng dần hoàn chỉnh đưa giá trị lớn nhất còn lại tới biên trên hiện tại."],
  objectives: [["Trace adjacent comparisons and swaps.", "Trace so sánh và swap cặp kề."], ["Explain the completed upper region.", "Giải thích vùng trên đã hoàn tất."], ["Write corrected pass-level early exit.", "Viết early exit đúng ở mức pass."], ["Relate work to size and initial order.", "Liên hệ công việc với size và thứ tự ban đầu."]],
  prerequisites: [["Compare and swap two array values.", "So sánh và swap hai giá trị mảng."], ["Distinguish one comparison from one pass.", "Phân biệt một comparison với một pass."]],
  glossary: [["adjacent pair", "Items at Index and Index+1.", "Phần tử tại Index và Index+1."], ["pass", "A complete scan to the current EndIndex.", "Một lượt quét hoàn chỉnh tới EndIndex hiện tại."], ["swap", "Exchange two out-of-order adjacent values.", "Đổi chỗ hai giá trị kề sai thứ tự."], ["sorted region", "Upper cells guaranteed final after completed passes.", "Các ô trên được bảo đảm final sau các pass hoàn chỉnh."], ["early exit", "Stop after a complete pass makes no swaps.", "Dừng sau một pass hoàn chỉnh không có swap."]],
  theory: [
    ["adjacent", ["Compare neighbours", "So sánh phần tử kề"], ["For ascending order, swap only when the left value is greater than the right value.", "Với thứ tự tăng dần, chỉ swap khi giá trị trái lớn hơn giá trị phải."]],
    ["pass-boundary", ["One pass completes one boundary", "Một pass hoàn tất một biên"], ["The largest unsorted value moves to EndIndex. Only after the complete pass may EndIndex shrink.", "Giá trị unsorted lớn nhất đi tới EndIndex. Chỉ sau pass hoàn chỉnh mới thu EndIndex."]],
    ["early-exit", ["Reset Swapped once per pass", "Reset Swapped một lần mỗi pass"], ["A no-swap comparison proves little; a complete no-swap pass proves the active region is sorted.", "Một comparison không swap chứng minh rất ít; pass hoàn chỉnh không swap chứng minh vùng active đã sorted."]],
    ["bubble-code", ["Cambridge pseudocode", "Giả mã Cambridge"], ["Swapped is reset before the FOR loop, correcting the misleading per-comparison placement in the coursebook example.", "Swapped được reset trước vòng FOR, sửa vị trí gây hiểu nhầm theo từng comparison trong ví dụ coursebook."], bubbleCode],
  ],
  visual: { title: ["Pass-and-swap workbench", "Bàn trace pass và swap"], introduction: ["Active pair, swap result, pass boundary and completed region update together.", "Cặp active, kết quả swap, biên pass và vùng hoàn tất cập nhật cùng nhau."], task: ["Predict each swap and identify when early exit is valid.", "Dự đoán từng swap và xác định khi nào early exit hợp lệ."], conventions: [["Ascending order; swap only left>right.", "Tăng dần; chỉ swap khi trái>phải."], ["Swapped resets once before each pass.", "Swapped reset một lần trước mỗi pass."], ["Upper boundary shrinks after a complete pass.", "Biên trên thu sau một pass hoàn chỉnh."]] },
  worked: { title: ["Sort [5,1,4,2,8]", "Sort [5,1,4,2,8]"], prompt: ["Trace comparisons, swaps and pass boundaries.", "Trace comparisons, swaps và biên pass."], steps: [
    ["setup", ["Set EndIndex←4 and Swapped←FALSE.", "Đặt EndIndex←4 và Swapped←FALSE."], ["The first pass covers pairs ending at index 4.", "Pass đầu phủ các cặp kết thúc tại index 4."], ["Active region is 0..4.", "Vùng active là 0..4."]],
    ["swap-01", ["Compare 5 and 1; swap.", "So sánh 5 và 1; swap."], ["5>1 violates ascending order.", "5>1 vi phạm thứ tự tăng."], ["[1,5,4,2,8]; Swapped=TRUE.", "[1,5,4,2,8]; Swapped=TRUE."]],
    ["swap-12", ["Compare 5 and 4; swap.", "So sánh 5 và 4; swap."], ["The active left value is still larger.", "Giá trị trái active vẫn lớn hơn."], ["[1,4,5,2,8].", "[1,4,5,2,8]."]],
    ["swap-23", ["Compare 5 and 2; swap.", "So sánh 5 và 2; swap."], ["Adjacent order is wrong.", "Thứ tự cặp kề sai."], ["[1,4,2,5,8].", "[1,4,2,5,8]."]],
    ["finish-pass", ["Compare 5 and 8; do not swap; finish pass.", "So sánh 5 và 8; không swap; hoàn tất pass."], ["5<=8 is already ascending.", "5<=8 đã tăng dần."], ["Index 4 is final; EndIndex←3.", "Index 4 là final; EndIndex←3."]],
    ["remaining", ["Run later passes until a complete no-swap pass.", "Chạy các pass sau tới một pass hoàn chỉnh không swap."], ["Each pass grows the completed upper region.", "Mỗi pass mở rộng vùng trên hoàn tất."], ["Final [1,2,4,5,8]; early exit follows the no-swap pass.", "Final [1,2,4,5,8]; early exit sau pass không swap."]],
  ], result: ["The array is ascending and every pass-level early exit is justified.", "Mảng tăng dần và mọi early exit mức pass đều được biện minh."], selfCheck: ["Was Swapped reset once before, not during, each pass?", "Swapped có được reset một lần trước, không phải trong, mỗi pass không?"] },
  recognition: { cues: [["adjacent compare and swap", "so sánh và swap cặp kề"], ["passes", "các pass"], ["no swaps", "không có swap"]], distinguish: ["Near miss: insertion sort saves one key and shifts a sorted prefix; bubble sort repeatedly compares adjacent pairs.", "Dễ nhầm: insertion sort lưu một key và shift sorted prefix; bubble sort liên tục so cặp kề."], method: [["Declare direction and boundary.", "Khai báo hướng và biên."], ["Reset Swapped before a pass.", "Reset Swapped trước pass."], ["Trace every adjacent comparison.", "Trace mọi comparison kề."], ["Shrink boundary after the pass.", "Thu biên sau pass."], ["Exit only after a full no-swap pass.", "Chỉ exit sau pass hoàn chỉnh không swap."]] },
  misconceptions: [
    [["Reset Swapped before every comparison.", "Reset Swapped trước mọi comparison."], ["Reset it once before the complete pass.", "Reset một lần trước pass hoàn chỉnh."], ["Does the flag represent the whole pass?", "Flag có đại diện cả pass không?"]],
    [["Stop after one no-swap pair.", "Dừng sau một cặp không swap."], ["Only a complete no-swap pass proves the active region sorted.", "Chỉ pass hoàn chỉnh không swap chứng minh vùng active sorted."], ["Were all active pairs checked?", "Đã xét mọi cặp active chưa?"]],
    [["Compare arbitrary distant cells.", "So sánh ô xa bất kỳ."], ["Bubble sort compares adjacent indices only.", "Bubble sort chỉ so index kề."], ["Are the indices Index and Index+1?", "Các index có là Index và Index+1 không?"]],
    [["Shrink the boundary after each swap.", "Thu biên sau mỗi swap."], ["Shrink only after a complete pass.", "Chỉ thu sau pass hoàn chỉnh."], ["Has the largest active item reached the boundary?", "Phần tử active lớn nhất đã tới biên chưa?"]],
  ],
  checkpoints: [
    quiz("recall", ["When may ascending bubble sort swap?", "Bubble sort tăng dần swap khi nào?"], ["Left value > right value", "Giá trị trái > giá trị phải"], ["Left value < right value", "Giá trị trái < giá trị phải"], ["Values are equal", "Hai giá trị bằng nhau"], ["swap only an out-of-order adjacent pair", "chỉ swap cặp kề sai thứ tự"]),
    quiz("recognise", ["Which clue identifies bubble sort?", "Dấu hiệu nào nhận diện bubble sort?"], ["Adjacent pairs over repeated passes", "Cặp kề qua nhiều pass"], ["Saved key and shifts", "Lưu key và shift"], ["Discard half a search window", "Loại nửa cửa sổ search"], ["bubble sort scans adjacent pairs", "bubble sort quét các cặp kề"]),
    quiz("predict", ["After [5,1] is compared ascending, what pair state follows?", "Sau khi so [5,1] tăng dần, trạng thái cặp nào tiếp theo?"], ["[1,5] and Swapped=TRUE", "[1,5] và Swapped=TRUE"], ["[5,1] and Swapped=FALSE", "[5,1] và Swapped=FALSE"], ["[5,5]", "[5,5]"], ["5>1 requires a swap and sets the pass flag", "5>1 cần swap và đặt flag của pass"]),
    quiz("trace", ["What is guaranteed after the first full pass over five ascending-target values?", "Điều gì được bảo đảm sau pass đầy đủ đầu tiên trên năm giá trị cần tăng dần?"], ["The largest value is at index 4", "Giá trị lớn nhất ở index 4"], ["The whole array is sorted", "Toàn bộ mảng sorted"], ["The smallest value is always at index 0", "Giá trị nhỏ nhất luôn ở index 0"], ["one complete pass fixes the upper boundary", "một pass hoàn chỉnh cố định biên trên"]),
    quiz("write", ["Where is Swapped←FALSE placed?", "Swapped←FALSE đặt ở đâu?"], ["Before the inner FOR loop each pass", "Trước vòng FOR trong mỗi pass"], ["Inside every IF comparison", "Trong mỗi IF comparison"], ["Only after the entire algorithm", "Chỉ sau toàn bộ thuật toán"], ["the flag must summarize the complete pass", "flag phải tóm tắt cả pass"]),
    quiz("transfer", ["A complete pass makes no swaps. What follows?", "Một pass hoàn chỉnh không có swap. Điều gì tiếp theo?"], ["Stop: the active region is sorted", "Dừng: vùng active đã sorted"], ["Swap the first pair anyway", "Vẫn swap cặp đầu"], ["Reset data to its input", "Reset dữ liệu về input"], ["a full no-swap pass justifies early exit", "pass hoàn chỉnh không swap biện minh early exit"], true),
  ],
  recall: { prompt: ["Describe one bubble pass and the early-exit proof.", "Mô tả một bubble pass và chứng minh early exit."], points: [["Compare every active adjacent pair.", "So mọi cặp kề active."], ["Swap only left>right and record Swapped.", "Chỉ swap khi trái>phải và ghi Swapped."], ["Shrink after the pass; stop if no swap occurred.", "Thu biên sau pass; dừng nếu không có swap."]] },
  takeaways: [["Bubble sort uses adjacent pairs.", "Bubble sort dùng cặp kề."], ["One pass fixes one upper boundary.", "Một pass cố định một biên trên."], ["Reset the flag once per pass.", "Reset flag một lần mỗi pass."]], related: ["insertion-sort", "time-and-space-complexity"],
  book: "Chapter 19, printed pp458–461 / PDF pp474–477: bubble sort; pass-level correction documented", papers: paperPair("s21-31", "Cambridge 9618/31 — May/June 2021", "Question 8, pp10–11", "Question 8, pp8–9"),
});

const insertionCode = `PROCEDURE InsertionSort(BYREF Data : ARRAY[0:4] OF INTEGER)
  DECLARE Index : INTEGER
  DECLARE Position : INTEGER
  DECLARE Key : INTEGER
  FOR Index ← 1 TO 4
    Key ← Data[Index]
    Position ← Index - 1
    WHILE (Position >= 0) AND (Data[Position] > Key)
      Data[Position + 1] ← Data[Position]
      Position ← Position - 1
    ENDWHILE
    Data[Position + 1] ← Key
  NEXT Index
ENDPROCEDURE`;

const insertion = makeLesson({
  id: "P3-19.1-T04", slug: "insertion-sort", minutes: 35, kind: "insertion-sort", title: ["Insertion sort", "Sắp xếp chèn"],
  question: ["How can a saved key be inserted into a sorted prefix without losing data?", "Làm sao chèn key đã lưu vào sorted prefix mà không mất dữ liệu?"],
  opening: ["The current item is saved before larger prefix items shift right to open one gap.", "Phần tử hiện tại được lưu trước khi các phần tử prefix lớn hơn shift phải để mở một gap."],
  objectives: [["Trace key, position and shifts.", "Trace key, position và shifts."], ["Maintain the sorted-prefix invariant.", "Duy trì invariant sorted-prefix."], ["Write stable ascending pseudocode.", "Viết giả mã tăng dần stable."], ["Explain order and size effects.", "Giải thích ảnh hưởng của order và size."]],
  prerequisites: [["Index an array safely.", "Đánh index mảng an toàn."], ["Distinguish shifting from swapping.", "Phân biệt shifting với swapping."]],
  glossary: [["sorted prefix", "Data[0..Index−1] already ordered.", "Data[0..Index−1] đã có thứ tự."], ["key", "Saved copy of the current item.", "Bản sao đã lưu của phần tử hiện tại."], ["shift", "Move a larger prefix item one cell right.", "Di chuyển phần tử prefix lớn hơn sang phải một ô."], ["gap", "Position opened for the saved key.", "Vị trí mở ra cho key đã lưu."], ["stable", "Equal earlier items remain before the key.", "Phần tử bằng xuất hiện trước vẫn đứng trước key."]],
  theory: [
    ["prefix", ["Sorted-prefix invariant", "Invariant sorted-prefix"], ["Before each iteration, Data[0..Index−1] is sorted. Inserting Key makes Data[0..Index] sorted.", "Trước mỗi iteration, Data[0..Index−1] sorted. Chèn Key làm Data[0..Index] sorted."]],
    ["save-key", ["Save before overwriting", "Lưu trước khi ghi đè"], ["Key←Data[Index] preserves the only copy while larger items shift into later cells.", "Key←Data[Index] giữ bản sao duy nhất trong khi phần tử lớn hơn shift vào ô sau."]],
    ["strict-shift", ["Shift only greater values", "Chỉ shift giá trị lớn hơn"], ["The strict > condition leaves equal earlier values in place, so the fixture is stable.", "Điều kiện > nghiêm ngặt giữ nguyên giá trị bằng xuất hiện trước, nên fixture stable."]],
    ["insertion-code", ["Cambridge pseudocode", "Giả mã Cambridge"], ["The saved key is written once after the loop into Position+1.", "Key đã lưu được ghi một lần sau vòng lặp vào Position+1."], insertionCode],
  ],
  visual: { title: ["Key-and-gap workbench", "Bàn trace key và gap"], introduction: ["Sorted prefix, saved key, predecessor and gap are visible at every step.", "Sorted prefix, key đã lưu, predecessor và gap hiển thị ở mọi bước."], task: ["Predict each shift and verify that no value disappears.", "Dự đoán mỗi shift và kiểm tra không giá trị nào biến mất."], conventions: [["Ascending, zero-based array.", "Mảng tăng dần, zero-based."], ["Shift while predecessor>Key.", "Shift khi predecessor>Key."], ["Equality does not shift; fixture is stable.", "Equality không shift; fixture stable."]] },
  worked: { title: ["Insert 2 into [1,4,5]", "Chèn 2 vào [1,4,5]"], prompt: ["Trace the iteration for Data=[1,4,5,2,8], Index=3.", "Trace iteration cho Data=[1,4,5,2,8], Index=3."], steps: [
    ["invariant", ["Mark Data[0..2]=[1,4,5] sorted.", "Đánh dấu Data[0..2]=[1,4,5] sorted."], ["This is the prefix invariant.", "Đây là prefix invariant."], ["Index=3 is the next unsorted item.", "Index=3 là phần tử unsorted tiếp theo."]],
    ["save", ["Set Key←2 and Position←2.", "Đặt Key←2 và Position←2."], ["The original 2 must survive later overwrites.", "Số 2 gốc phải tồn tại sau các ghi đè."], ["Key safely stores 2.", "Key lưu an toàn giá trị 2."], "Key ← Data[Index]"],
    ["shift-5", ["Compare 5>2 and shift 5 to index 3.", "So 5>2 và shift 5 tới index 3."], ["5 belongs to the right of Key.", "5 phải ở bên phải Key."], ["Data=[1,4,5,5,8]; Position←1; Key still 2.", "Data=[1,4,5,5,8]; Position←1; Key vẫn 2."]],
    ["shift-4", ["Compare 4>2 and shift 4 to index 2.", "So 4>2 và shift 4 tới index 2."], ["4 also belongs to the right.", "4 cũng phải ở bên phải."], ["Data=[1,4,4,5,8]; Position←0.", "Data=[1,4,4,5,8]; Position←0."]],
    ["stop", ["Compare 1>2; false.", "So 1>2; false."], ["1 already belongs before Key.", "1 đã đúng vị trí trước Key."], ["The gap is Position+1=1.", "Gap ở Position+1=1."]],
    ["insert", ["Write Key at Data[1].", "Ghi Key vào Data[1]."], ["All larger prefix items have shifted right.", "Mọi phần tử prefix lớn hơn đã shift phải."], ["Data=[1,2,4,5,8]; prefix 0..3 sorted and multiset preserved.", "Data=[1,2,4,5,8]; prefix 0..3 sorted và multiset được giữ."]],
  ], result: ["The key 2 is inserted at index 1 without losing 4 or 5.", "Key 2 được chèn tại index 1 mà không mất 4 hoặc 5."], selfCheck: ["Can you identify the saved key, every shift and the single final key write?", "Bạn có chỉ ra key đã lưu, từng shift và lần ghi key cuối duy nhất không?"] },
  recognition: { cues: [["sorted prefix", "sorted prefix"], ["save key/current item", "lưu key/phần tử hiện tại"], ["shift larger items", "shift phần tử lớn hơn"]], distinguish: ["Near miss: bubble sort swaps adjacent pairs over passes; insertion sort saves one key and shifts a prefix.", "Dễ nhầm: bubble sort swap cặp kề qua các pass; insertion sort lưu một key và shift prefix."], method: [["Mark the sorted prefix.", "Đánh dấu sorted prefix."], ["Save Key.", "Lưu Key."], ["Set Position to predecessor.", "Đặt Position ở predecessor."], ["Shift while predecessor>Key.", "Shift khi predecessor>Key."], ["Write Key once in the gap.", "Ghi Key một lần vào gap."]] },
  misconceptions: [
    [["Shift before saving Key.", "Shift trước khi lưu Key."], ["Copy Key before any overwrite.", "Copy Key trước mọi ghi đè."], ["Where is the only safe copy of the item?", "Bản sao an toàn duy nhất của phần tử ở đâu?"]],
    [["Swap Key repeatedly.", "Swap Key nhiều lần."], ["Shift prefix values; write Key once.", "Shift giá trị prefix; ghi Key một lần."], ["How many final key writes occur?", "Có bao nhiêu lần ghi key cuối?"]],
    [["Assume the suffix is sorted.", "Giả sử suffix sorted."], ["Only the prefix before Index is guaranteed sorted.", "Chỉ prefix trước Index được bảo đảm sorted."], ["Which indices satisfy the invariant now?", "Những index nào thỏa invariant lúc này?"]],
    [["Shift equal values.", "Shift các giá trị bằng."], ["Use strict > to preserve stability.", "Dùng > nghiêm ngặt để giữ stability."], ["Does equality satisfy the WHILE condition?", "Equality có thỏa điều kiện WHILE không?"]],
  ],
  checkpoints: [
    quiz("recall", ["What must be saved before shifting?", "Phải lưu gì trước khi shift?"], ["Data[Index] in Key", "Data[Index] vào Key"], ["Only UpperBound", "Chỉ UpperBound"], ["The final array", "Mảng cuối"], ["the current item needs a safe copy", "phần tử hiện tại cần bản sao an toàn"]),
    quiz("recognise", ["Which clue identifies insertion sort?", "Dấu hiệu nào nhận diện insertion sort?"], ["Saved key and sorted prefix", "Key đã lưu và sorted prefix"], ["Repeated half-discard", "Liên tục loại nửa"], ["FIFO removal", "Loại FIFO"], ["insertion sort grows a sorted prefix", "insertion sort mở rộng sorted prefix"]),
    quiz("predict", ["Key=2, Position item=5. Next action?", "Key=2, phần tử Position=5. Hành động tiếp?"], ["Shift 5 right", "Shift 5 sang phải"], ["Overwrite Key with 5", "Ghi đè Key bằng 5"], ["Stop immediately", "Dừng ngay"], ["5>2 requires one right shift", "5>2 cần một shift phải"]),
    quiz("trace", ["After shifting 5 and 4, where is the gap?", "Sau khi shift 5 và 4, gap ở đâu?"], ["Index 1", "Index 1"], ["Index 3", "Index 3"], ["Index 4", "Index 4"], ["Position stopped at 0, so write at Position+1", "Position dừng ở 0 nên ghi tại Position+1"]),
    quiz("write", ["Which stable loop condition is correct?", "Điều kiện vòng lặp stable nào đúng?"], ["Data[Position] > Key", "Data[Position] > Key"], ["Data[Position] >= Key", "Data[Position] >= Key"], ["Data[Position] = Key", "Data[Position] = Key"], ["strict greater-than leaves equals in original order", "greater-than nghiêm ngặt giữ equal theo thứ tự gốc"]),
    quiz("transfer", ["The input is already sorted. What happens per iteration?", "Input đã sorted. Điều gì xảy ra mỗi iteration?"], ["One failed predecessor comparison; no shifts", "Một comparison predecessor sai; không shift"], ["Every prefix item shifts", "Mọi phần tử prefix shift"], ["The key is lost", "Key bị mất"], ["the first predecessor is <=Key, so the shift loop stops", "predecessor đầu <=Key nên vòng shift dừng"], true),
  ],
  recall: { prompt: ["State the insertion-sort invariant and safe update order.", "Nêu invariant và thứ tự cập nhật an toàn của insertion sort."], points: [["Prefix before Index is sorted.", "Prefix trước Index sorted."], ["Save Key before shifting larger items.", "Lưu Key trước khi shift phần tử lớn hơn."], ["Write Key once at Position+1.", "Ghi Key một lần tại Position+1."]] },
  takeaways: [["Save the key before overwriting.", "Lưu key trước khi ghi đè."], ["Shift values; do not repeatedly swap the key.", "Shift giá trị; không swap key lặp lại."], ["Strict > makes the fixture stable.", "> nghiêm ngặt làm fixture stable."]], related: ["bubble-sort", "time-and-space-complexity"],
  book: "Chapter 19, printed pp461–464 / PDF pp477–480: insertion sort and performance", papers: [...paperPair("s21-31", "Cambridge 9618/31 — May/June 2021", "Question 8, pp10–11", "Question 8, pp8–9"), ...paperPair("s25-33", "Cambridge 9618/33 — May/June 2025", "Question 12, pp14–15", "Question 12, p15")],
});

const stack = makeLesson({
  id: "P3-19.1-T05", slug: "stack", minutes: 35, kind: "stack-adt", title: ["Stack ADT", "ADT stack"],
  question: ["How do Top and the visible data change under LIFO operations?", "Top và dữ liệu nhìn thấy thay đổi thế nào dưới các thao tác LIFO?"],
  opening: ["A browser history stores the most recent live item at one accessible end.", "Lịch sử trình duyệt lưu phần tử sống gần nhất tại một đầu truy cập."],
  objectives: [["Describe LIFO and the stack interface.", "Mô tả LIFO và interface stack."], ["Trace PUSH, POP and PEEK.", "Trace PUSH, POP và PEEK."], ["Write array-stack guards and updates.", "Viết guard và update stack bằng mảng."], ["Handle underflow and overflow without mutation.", "Xử lý underflow và overflow không mutation."]],
  prerequisites: [["Use a fixed zero-based array.", "Dùng mảng cố định zero-based."], ["Distinguish an index from a stored value.", "Phân biệt index với giá trị lưu."]],
  glossary: [["LIFO", "Last in, first out.", "Vào sau, ra trước."], ["Top", "Index of the last occupied cell; −1 when empty.", "Index của ô occupied cuối; −1 khi empty."], ["PUSH", "Add at the top.", "Thêm tại top."], ["POP", "Remove and return the top value.", "Loại và trả giá trị top."], ["PEEK", "Read the top without mutation.", "Đọc top không mutation."]],
  theory: [
    ["interface", ["One-end LIFO interface", "Interface LIFO một đầu"], ["PUSH adds, POP removes/returns and PEEK reads the newest live item. The interface does not require an array representation.", "PUSH thêm, POP loại/trả và PEEK đọc phần tử sống mới nhất. Interface không bắt buộc representation bằng mảng."]],
    ["state", ["Top convention", "Quy ước Top"], ["In the fixture, Top=−1 is empty and Top=Capacity−1 is full. These pointer values are declared choices, not universal definitions.", "Trong fixture, Top=−1 là empty và Top=Capacity−1 là full. Các giá trị pointer này là lựa chọn đã công bố, không phải định nghĩa phổ quát."]],
    ["order", ["Safe update order", "Thứ tự cập nhật an toàn"], ["PUSH guards, increments, then writes. POP guards, saves, clears, decrements, then returns. PEEK never changes Top.", "PUSH guard, tăng rồi ghi. POP guard, lưu, xóa, giảm rồi trả. PEEK không đổi Top."]],
    ["errors", ["Errors preserve state", "Lỗi giữ nguyên trạng thái"], ["Underflow and overflow are explicit results. No invalid cell is read or overwritten.", "Underflow và overflow là kết quả rõ ràng. Không đọc hoặc ghi đè ô không hợp lệ."], `// PUSH
IF Top = Capacity - 1 THEN RETURN FALSE
Top ← Top + 1
Stack[Top] ← NewValue
// POP
IF Top = -1 THEN RETURN ErrorValue
Removed ← Stack[Top]
Stack[Top] ← EmptyValue
Top ← Top - 1
RETURN Removed`],
  ],
  visual: { title: ["LIFO stack workbench", "Bàn trace stack LIFO"], introduction: ["Array cells, Top, operation result and logical stack change together.", "Ô mảng, Top, kết quả thao tác và stack logic thay đổi cùng nhau."], task: ["Predict pointer order, then test underflow and overflow.", "Dự đoán thứ tự pointer, rồi thử underflow và overflow."], conventions: [["Top=−1 empty.", "Top=−1 là empty."], ["Top=Capacity−1 full.", "Top=Capacity−1 là full."], ["Rejected operations do not mutate state.", "Thao tác bị từ chối không mutate trạng thái."]] },
  worked: { title: ["Push A, B; peek; pop", "Push A, B; peek; pop"], prompt: ["Use Capacity=3 and initial Top=−1.", "Dùng Capacity=3 và Top ban đầu=−1."], steps: [
    ["initial", ["Declare Stack[0:2] and Top←−1.", "Khai báo Stack[0:2] và Top←−1."], ["The pointer convention defines empty/full.", "Quy ước pointer định nghĩa empty/full."], ["Logical stack is empty.", "Stack logic empty."]],
    ["push-a", ["Guard, set Top←0, write A.", "Guard, đặt Top←0, ghi A."], ["Increment-before-write targets the first valid cell.", "Tăng trước ghi nhắm ô hợp lệ đầu."], ["Stack=[A,_,_], Top=0.", "Stack=[A,_,_], Top=0."]],
    ["push-b", ["Guard, set Top←1, write B.", "Guard, đặt Top←1, ghi B."], ["B is the most recent item.", "B là phần tử mới nhất."], ["Stack=[A,B,_], Top=1.", "Stack=[A,B,_], Top=1."]],
    ["peek", ["Read Stack[Top].", "Đọc Stack[Top]."], ["PEEK observes without mutation.", "PEEK quan sát không mutation."], ["Return B; Top remains 1.", "Trả B; Top vẫn 1."]],
    ["pop", ["Save B, clear cell 1, set Top←0.", "Lưu B, xóa ô 1, đặt Top←0."], ["The old top must be saved before decrement.", "Top cũ phải được lưu trước khi giảm."], ["Return B; logical stack contains A.", "Trả B; stack logic chứa A."]],
    ["error", ["On an empty stack, reject POP before reading.", "Với stack empty, từ chối POP trước khi đọc."], ["Top=−1 has no valid cell.", "Top=−1 không có ô hợp lệ."], ["Underflow result; entire before-state preserved.", "Kết quả underflow; giữ nguyên toàn bộ before-state."]],
  ], result: ["LIFO returns B before A; PEEK and rejected operations preserve state.", "LIFO trả B trước A; PEEK và thao tác bị từ chối giữ nguyên trạng thái."], selfCheck: ["Did POP save the old top value before decrementing Top?", "POP có lưu giá trị top cũ trước khi giảm Top không?"] },
  recognition: { cues: [["LIFO", "LIFO"], ["push/pop/top", "push/pop/top"], ["most recent item first", "phần tử mới nhất ra trước"]], distinguish: ["Near miss: a runtime call stack also behaves LIFO but stores call frames; it is not this manually implemented Stack array.", "Dễ nhầm: runtime call stack cũng LIFO nhưng lưu call frame; nó không phải mảng Stack cài thủ công này."], method: [["Write Top meaning.", "Ghi ý nghĩa Top."], ["Check empty/full first.", "Kiểm tra empty/full trước."], ["Apply pointer update in declared order.", "Áp dụng pointer update theo thứ tự đã nêu."], ["Record returned value.", "Ghi giá trị trả về."], ["Verify error leaves state unchanged.", "Kiểm tra lỗi giữ state không đổi."]] },
  misconceptions: [
    [["Write before checking full.", "Ghi trước khi check full."], ["Guard overflow before changing Top or data.", "Guard overflow trước khi đổi Top hoặc dữ liệu."], ["Could a live cell be overwritten?", "Có thể ghi đè ô sống không?"]],
    [["Decrement before saving POP value.", "Giảm trước khi lưu giá trị POP."], ["Save Stack[Top] first.", "Lưu Stack[Top] trước."], ["Which cell contains the return value?", "Ô nào chứa giá trị trả về?"]],
    [["PEEK removes the item.", "PEEK loại phần tử."], ["PEEK returns Stack[Top] without mutation.", "PEEK trả Stack[Top] không mutation."], ["Did Top change?", "Top có đổi không?"]],
    [["Top=0 means empty.", "Top=0 nghĩa là empty."], ["Under this fixture Top=−1 is empty; Top=0 holds one item.", "Trong fixture này Top=−1 là empty; Top=0 chứa một phần tử."], ["Is cell 0 occupied?", "Ô 0 có occupied không?"]],
  ],
  checkpoints: [
    quiz("recall", ["What order does a stack use?", "Stack dùng thứ tự nào?"], ["LIFO", "LIFO"], ["FIFO", "FIFO"], ["Sorted key order", "Thứ tự key sorted"], ["the most recent pushed item is removed first", "phần tử push gần nhất được loại trước"]),
    quiz("recognise", ["Which words identify a stack?", "Từ nào nhận diện stack?"], ["push, pop, top", "push, pop, top"], ["enqueue, dequeue, front", "enqueue, dequeue, front"], ["head, next, null", "head, next, null"], ["stack operations use one logical top", "thao tác stack dùng một logical top"]),
    quiz("predict", ["Top=0; PUSH X succeeds. New Top?", "Top=0; PUSH X thành công. Top mới?"], ["1", "1"], ["0", "0"], ["−1", "−1"], ["PUSH increments before writing", "PUSH tăng trước khi ghi"]),
    quiz("trace", ["After PUSH A, PUSH B, POP, what is returned?", "Sau PUSH A, PUSH B, POP, trả gì?"], ["B", "B"], ["A", "A"], ["Nothing", "Không có gì"], ["LIFO removes the most recent B", "LIFO loại B mới nhất"]),
    quiz("write", ["Which POP order is safe?", "Thứ tự POP nào an toàn?"], ["guard → save → clear/decrement → return", "guard → lưu → xóa/giảm → trả"], ["decrement → read", "giảm → đọc"], ["write → guard", "ghi → guard"], ["the old top must be saved before pointer change", "top cũ phải được lưu trước khi đổi pointer"]),
    quiz("transfer", ["Top=−1 and POP is requested. What happens?", "Top=−1 và yêu cầu POP. Điều gì xảy ra?"], ["Underflow; no mutation", "Underflow; không mutation"], ["Read Stack[−1]", "Đọc Stack[−1]"], ["Set Top=0", "Đặt Top=0"], ["empty guard rejects before any invalid read", "empty guard từ chối trước mọi lần đọc sai"], true),
  ],
  recall: { prompt: ["Write the stack pointer contract and safe operation orders.", "Viết pointer contract và thứ tự thao tác an toàn của stack."], points: [["Top=−1 empty; Capacity−1 full.", "Top=−1 empty; Capacity−1 full."], ["PUSH guard, increment, write.", "PUSH guard, tăng, ghi."], ["POP guard, save, clear/decrement, return.", "POP guard, lưu, xóa/giảm, trả."]] },
  takeaways: [["Stack is LIFO.", "Stack là LIFO."], ["Pointer order controls correctness.", "Thứ tự pointer quyết định tính đúng."], ["Errors do not mutate state.", "Lỗi không mutate state."]], related: ["queue", "call-stacks-and-unwinding"],
  book: "Chapter 19, printed pp464–466 / PDF pp480–482: ADT and stack", papers: [...paperPair("w23-31", "Cambridge 9618/31 — October/November 2023", "Question 10, pp10–11", "Question 10, p8"), ...paperPair("w25-32", "Cambridge 9618/32 — October/November 2025", "Question 12, p12", "Question 12, p17")],
});

const queue = makeLesson({
  id: "P3-19.1-T06", slug: "queue", minutes: 40, kind: "queue-adt", title: ["Queue ADT", "ADT queue"],
  question: ["How do Front, Rear and Count preserve FIFO order through circular wrap-around?", "Front, Rear và Count giữ thứ tự FIFO qua wrap-around vòng tròn như thế nào?"],
  opening: ["A printer queue reuses a fixed array without moving live jobs when an index reaches the end.", "Queue máy in tái sử dụng mảng cố định mà không di chuyển job sống khi index tới cuối."],
  objectives: [["Describe FIFO and the queue interface.", "Mô tả FIFO và interface queue."], ["Trace circular ENQUEUE and DEQUEUE.", "Trace ENQUEUE và DEQUEUE vòng tròn."], ["Write count-based empty/full guards.", "Viết guard empty/full dựa trên Count."], ["Explain wrap-around and no-mutation errors.", "Giải thích wrap-around và lỗi không mutation."]],
  prerequisites: [["Use MOD with a positive capacity.", "Dùng MOD với capacity dương."], ["Read a fixed array by index.", "Đọc mảng cố định theo index."]],
  glossary: [["FIFO", "First in, first out.", "Vào trước, ra trước."], ["Front", "Index of the next removal.", "Index của lần remove tiếp theo."], ["Rear", "Index of the next insertion.", "Index của lần insert tiếp theo."], ["Count", "Number of live queue items.", "Số item sống trong queue."], ["wrap-around", "MOD returns an index from the end to 0.", "MOD đưa index từ cuối về 0."]],
  theory: [
    ["fifo", ["FIFO interface", "Interface FIFO"], ["ENQUEUE adds at the logical rear; DEQUEUE removes the oldest live value at Front.", "ENQUEUE thêm tại rear logic; DEQUEUE loại giá trị sống cũ nhất tại Front."]],
    ["pointer-contract", ["Exact pointer meanings", "Ý nghĩa pointer chính xác"], ["Initially Front=0, Rear=0, Count=0. Front names next removal and Rear names next insertion.", "Ban đầu Front=0, Rear=0, Count=0. Front là lần remove tiếp và Rear là lần insert tiếp."]],
    ["count-wrap", ["Count separates equal pointer states", "Count phân biệt trạng thái pointer bằng nhau"], ["Count=0 is empty and Count=Capacity is full, even though Front can equal Rear in either state. MOD advances without moving data.", "Count=0 là empty và Count=Capacity là full, dù Front có thể bằng Rear ở cả hai trạng thái. MOD tiến index mà không di chuyển dữ liệu."]],
    ["queue-code", ["Safe operation order", "Thứ tự thao tác an toàn"], ["ENQUEUE writes then advances Rear; DEQUEUE saves/clears then advances Front. Count changes last.", "ENQUEUE ghi rồi tăng Rear; DEQUEUE lưu/xóa rồi tăng Front. Count đổi cuối."], `// ENQUEUE
IF Count = Capacity THEN RETURN FALSE
Queue[Rear] ← NewValue
Rear ← (Rear + 1) MOD Capacity
Count ← Count + 1
// DEQUEUE
IF Count = 0 THEN RETURN ErrorValue
Removed ← Queue[Front]
Queue[Front] ← EmptyValue
Front ← (Front + 1) MOD Capacity
Count ← Count - 1
RETURN Removed`],
  ],
  visual: { title: ["Circular FIFO workbench", "Bàn trace FIFO vòng tròn"], introduction: ["Physical cells, logical order, pointers and Count remain visible together.", "Ô vật lý, thứ tự logic, pointer và Count cùng hiển thị."], task: ["Create wrap-around, then distinguish full from empty when Front=Rear.", "Tạo wrap-around, rồi phân biệt full với empty khi Front=Rear."], conventions: [["Initial Front=Rear=0, Count=0.", "Ban đầu Front=Rear=0, Count=0."], ["Rear is next insertion; Front next removal.", "Rear là insert tiếp; Front là remove tiếp."], ["Count disambiguates empty/full.", "Count phân biệt empty/full."]] },
  worked: { title: ["Wrap a capacity-4 queue", "Wrap queue capacity 4"], prompt: ["ENQUEUE A,B,C; DEQUEUE twice; ENQUEUE D,E.", "ENQUEUE A,B,C; DEQUEUE hai lần; ENQUEUE D,E."], steps: [
    ["initial", ["Set Front=0, Rear=0, Count=0.", "Đặt Front=0, Rear=0, Count=0."], ["These meanings define all later states.", "Các ý nghĩa này định nghĩa mọi state sau."], ["Queue empty.", "Queue empty."]],
    ["enqueue-abc", ["Write A at 0, B at 1, C at 2.", "Ghi A tại 0, B tại 1, C tại 2."], ["Rear marks each next insertion.", "Rear đánh dấu mỗi lần insert tiếp."], ["Front=0, Rear=3, Count=3; logical A,B,C.", "Front=0, Rear=3, Count=3; logic A,B,C."]],
    ["dequeue-a", ["Save/clear Queue[0], advance Front to 1.", "Lưu/xóa Queue[0], tăng Front tới 1."], ["A is the oldest live item.", "A là item sống cũ nhất."], ["Return A; Count=2; logical B,C.", "Trả A; Count=2; logic B,C."]],
    ["dequeue-b", ["Save/clear Queue[1], advance Front to 2.", "Lưu/xóa Queue[1], tăng Front tới 2."], ["FIFO next removes B.", "FIFO tiếp theo loại B."], ["Return B; Count=1; logical C.", "Trả B; Count=1; logic C."]],
    ["enqueue-d", ["Write D at Rear=3; advance Rear to 0 by MOD 4.", "Ghi D tại Rear=3; tăng Rear về 0 bằng MOD 4."], ["The physical end wraps without moving C.", "Cuối vật lý wrap mà không di chuyển C."], ["Front=2, Rear=0, Count=2; logical C,D.", "Front=2, Rear=0, Count=2; logic C,D."]],
    ["enqueue-e", ["Write E at Rear=0; advance Rear to 1.", "Ghi E tại Rear=0; tăng Rear tới 1."], ["Cell 0 is now free and reusable.", "Ô 0 đã free và có thể tái dùng."], ["Front=2, Rear=1, Count=3; logical C,D,E.", "Front=2, Rear=1, Count=3; logic C,D,E."]],
  ], result: ["Physical order [E,_,C,D] represents logical FIFO order C,D,E.", "Thứ tự vật lý [E,_,C,D] biểu diễn FIFO logic C,D,E."], selfCheck: ["Did you read logical order from Front for Count items rather than left-to-right array order?", "Bạn có đọc thứ tự logic từ Front trong Count item thay vì trái-sang-phải không?"] },
  recognition: { cues: [["FIFO", "FIFO"], ["enqueue/dequeue", "enqueue/dequeue"], ["front/rear", "front/rear"]], distinguish: ["Near miss: a stack may use an array too, but POP removes the newest item; DEQUEUE removes the oldest.", "Dễ nhầm: stack cũng có thể dùng mảng, nhưng POP loại item mới nhất; DEQUEUE loại item cũ nhất."], method: [["Lock pointer meanings.", "Khóa ý nghĩa pointer."], ["Check Count before mutation.", "Check Count trước mutation."], ["Read/write at the named pointer.", "Đọc/ghi tại pointer đã nêu."], ["Advance with MOD.", "Tăng bằng MOD."], ["Update Count and report logical order.", "Update Count và báo thứ tự logic."]] },
  misconceptions: [
    [["Rear is the last occupied cell.", "Rear là ô occupied cuối."], ["In this fixture Rear is the next insertion index.", "Trong fixture này Rear là index insert tiếp."], ["Where will the next ENQUEUE write?", "ENQUEUE tiếp theo sẽ ghi ở đâu?"]],
    [["Front=Rear always means empty.", "Front=Rear luôn nghĩa empty."], ["Read Count: 0 means empty and Capacity means full.", "Đọc Count: 0 là empty và Capacity là full."], ["What is Count?", "Count bằng bao nhiêu?"]],
    [["Read physical cells left to right as FIFO order.", "Đọc ô vật lý trái sang phải như thứ tự FIFO."], ["Start at Front and follow Count cells modulo Capacity.", "Bắt đầu tại Front và theo Count ô modulo Capacity."], ["Which live item is oldest?", "Item sống nào cũ nhất?"]],
    [["Reset pointers whenever queue becomes empty.", "Reset pointer mỗi khi queue empty."], ["Pointers naturally coincide; do not reset merely because Count becomes 0.", "Pointer tự nhiên trùng nhau; không reset chỉ vì Count về 0."], ["Does the contract require a reset?", "Contract có yêu cầu reset không?"]],
  ],
  checkpoints: [
    quiz("recall", ["What order does a queue use?", "Queue dùng thứ tự nào?"], ["FIFO", "FIFO"], ["LIFO", "LIFO"], ["BST order", "Thứ tự BST"], ["the oldest live item is removed first", "item sống cũ nhất được loại trước"]),
    quiz("recognise", ["Which words identify a queue?", "Từ nào nhận diện queue?"], ["enqueue, dequeue, front, rear", "enqueue, dequeue, front, rear"], ["push, pop, top", "push, pop, top"], ["key, value, lookup", "key, value, lookup"], ["queue operations use front and rear", "thao tác queue dùng front và rear"]),
    quiz("predict", ["Capacity=4, Rear=3. After successful ENQUEUE, new Rear?", "Capacity=4, Rear=3. Sau ENQUEUE thành công, Rear mới?"], ["0", "0"], ["4", "4"], ["2", "2"], ["(3+1) MOD 4 wraps to 0", "(3+1) MOD 4 wrap về 0"]),
    quiz("trace", ["Physical [E,_,C,D], Front=2, Count=3. Logical order?", "Vật lý [E,_,C,D], Front=2, Count=3. Thứ tự logic?"], ["C,D,E", "C,D,E"], ["E,C,D", "E,C,D"], ["D,E,C", "D,E,C"], ["read three live cells from Front modulo capacity", "đọc ba ô sống từ Front modulo capacity"]),
    quiz("write", ["Which ENQUEUE order is correct?", "Thứ tự ENQUEUE nào đúng?"], ["guard → write at Rear → advance Rear → increment Count", "guard → ghi tại Rear → tăng Rear → tăng Count"], ["advance Front → write", "tăng Front → ghi"], ["increment Count before full guard", "tăng Count trước full guard"], ["Rear names the next insertion cell", "Rear là ô insert tiếp"]),
    quiz("transfer", ["Front=Rear and Count=Capacity. State?", "Front=Rear và Count=Capacity. Trạng thái?"], ["Full", "Full"], ["Empty", "Empty"], ["Invalid automatically", "Tự động invalid"], ["Count, not pointer equality, distinguishes full", "Count, không phải pointer equality, phân biệt full"], true),
  ],
  recall: { prompt: ["State the circular-queue contract and operation order.", "Nêu contract queue vòng và thứ tự thao tác."], points: [["Front next removal; Rear next insertion.", "Front remove tiếp; Rear insert tiếp."], ["Count=0 empty; Count=Capacity full.", "Count=0 empty; Count=Capacity full."], ["Use MOD and mutate only after guards.", "Dùng MOD và chỉ mutate sau guard."]] },
  takeaways: [["Queue is FIFO.", "Queue là FIFO."], ["Count disambiguates equal pointers.", "Count phân biệt pointer bằng nhau."], ["Logical order may wrap across the array end.", "Thứ tự logic có thể wrap qua cuối mảng."]], related: ["stack", "implementing-one-adt-with-another"],
  book: "Chapter 19, printed pp466–469 / PDF pp482–485: circular queue", papers: [...paperPair("s23-32", "Cambridge 9618/32 — May/June 2023", "Question 11, pp13–14", "Question 11, p12"), ...paperPair("s23-31", "Cambridge 9618/31 — May/June 2023", "Question 11, pp10–11", "Question 11, pp8–9")],
});

const linked = makeLesson({
  id: "P3-19.1-T07", slug: "linked-list", minutes: 45, kind: "linked-list", title: ["Linked list", "Danh sách liên kết"],
  question: ["How can pointer updates find, insert or delete a node without losing the rest of the list?", "Cập nhật pointer thế nào để find, insert hoặc delete node mà không mất phần còn lại của list?"],
  opening: ["Array addresses store records, but logical order comes only from Head and Next links.", "Address mảng lưu record, nhưng thứ tự logic chỉ đến từ link Head và Next."],
  objectives: [["Trace an unordered record-array list.", "Trace list record-array không ordered."], ["Find/delete the first reachable match.", "Find/delete match reachable đầu tiên."], ["Allocate the lowest free address.", "Cấp phát address free thấp nhất."], ["Relink safely and preserve reachability.", "Relink an toàn và giữ reachability."]],
  prerequisites: [["Read record fields and array addresses.", "Đọc field record và address mảng."], ["Distinguish physical from logical order.", "Phân biệt thứ tự vật lý với logic."]],
  glossary: [["Head", "Address of the first live node; −1 when empty.", "Address node sống đầu; −1 khi empty."], ["Next", "Address of the next logical node.", "Address node logic tiếp theo."], ["Null", "Sentinel −1 meaning no next node.", "Sentinel −1 nghĩa không có node tiếp."], ["reachable", "Can be visited by following Next from Head.", "Có thể tới bằng cách theo Next từ Head."], ["allocator", "Chooses the lowest free address in this fixture.", "Chọn address free thấp nhất trong fixture."]],
  theory: [
    ["representation", ["Record-array representation", "Representation record-array"], ["Each allocated node has Data and Next. Addresses are 0-based and Null=−1. Physical neighbouring cells need not be logical neighbours.", "Mỗi node allocated có Data và Next. Address zero-based và Null=−1. Ô vật lý kề nhau không nhất thiết là node logic kề nhau."]],
    ["traversal", ["Follow links, not indices", "Theo link, không theo index"], ["The core list is unordered. FIND starts at Head and follows Next until the first equality or Null.", "List core không ordered. FIND bắt đầu tại Head và theo Next tới equality đầu tiên hoặc Null."]],
    ["insert", ["Save the successor before insertion", "Lưu successor trước insertion"], ["Allocate the lowest free address, write the new node linked to the saved successor, then redirect Head or Anchor.Next.", "Cấp phát address free thấp nhất, ghi node mới link tới successor đã lưu, rồi đổi Head hoặc Anchor.Next."]],
    ["delete", ["Bypass before clearing", "Bypass trước khi clear"], ["DELETE saves Current.Next, relinks Head or Previous.Next, then clears the removed record. Missing leaves state unchanged.", "DELETE lưu Current.Next, relink Head hoặc Previous.Next, rồi clear record đã loại. Missing giữ state không đổi."], `Current ← Head
Previous ← -1
WHILE Current <> -1
  IF Node[Current].Data = Target THEN
    RETURN Current
  ENDIF
  Previous ← Current
  Current ← Node[Current].Next
ENDWHILE
RETURN -1`],
  ],
  visual: { title: ["Pointer-and-reachability workbench", "Bàn trace pointer và reachability"], introduction: ["The record table and arrow diagram expose the same addresses and links.", "Bảng record và sơ đồ mũi tên hiển thị cùng address và link."], task: ["Trace first-match find, then insert/delete while checking every live node remains reachable.", "Trace find match đầu, rồi insert/delete trong khi kiểm tra mọi node sống vẫn reachable."], conventions: [["Addresses 0..Capacity−1; Null=−1.", "Address 0..Capacity−1; Null=−1."], ["Unordered; first reachable match.", "Unordered; match reachable đầu tiên."], ["Lowest-free allocator; errors do not mutate.", "Allocator lowest-free; lỗi không mutate."]] },
  worked: { title: ["Insert and delete without losing the chain", "Insert và delete mà không mất chain"], prompt: ["Head=2; nodes 2:A→5, 5:C→1, 1:D→−1; address 0 is lowest free.", "Head=2; node 2:A→5, 5:C→1, 1:D→−1; address 0 là free thấp nhất."], steps: [
    ["draw", ["Draw 2→5→1→−1.", "Vẽ 2→5→1→−1."], ["Logical order comes from links.", "Thứ tự logic đến từ link."], ["Reachable data order A,C,D.", "Thứ tự data reachable A,C,D."]],
    ["find-anchor", ["Traverse to anchor address 5.", "Traverse tới anchor address 5."], ["Follow Next from Head; do not increment address.", "Theo Next từ Head; không tăng address."], ["Anchor data C; saved successor=1.", "Anchor data C; successor đã lưu=1."]],
    ["allocate", ["Choose NewAddress=0.", "Chọn NewAddress=0."], ["The fixture uses the lowest free address.", "Fixture dùng address free thấp nhất."], ["Address 0 is reserved for new B.", "Address 0 được dành cho B mới."]],
    ["write-new", ["Write node 0:B→1.", "Ghi node 0:B→1."], ["The successor must be preserved before redirecting the anchor.", "Successor phải được giữ trước khi đổi anchor."], ["New node already reaches the old suffix.", "Node mới đã tới suffix cũ."]],
    ["link-anchor", ["Set Node[5].Next←0.", "Đặt Node[5].Next←0."], ["This places B after C.", "Điều này đặt B sau C."], ["Chain 2→5→0→1→−1; A,C,B,D.", "Chain 2→5→0→1→−1; A,C,B,D."]],
    ["delete-first", ["Delete first D match at address 1 by bypassing then clearing.", "Delete match D đầu tại address 1 bằng bypass rồi clear."], ["Previous address 0 must point to successor −1 before record 1 is cleared.", "Previous address 0 phải trỏ successor −1 trước khi record 1 được clear."], ["Node[0].Next=−1; address 1 free; chain remains 2→5→0→−1.", "Node[0].Next=−1; address 1 free; chain vẫn 2→5→0→−1."]],
  ], result: ["All remaining live nodes are reachable and the chain ends at Null.", "Mọi node sống còn lại reachable và chain kết thúc tại Null."], selfCheck: ["Did insertion save the successor and deletion relink before clearing?", "Insertion có lưu successor và deletion có relink trước khi clear không?"] },
  recognition: { cues: [["node/data/next", "node/data/next"], ["head/start pointer", "head/start pointer"], ["null/free pointer", "null/free pointer"]], distinguish: ["Near miss: array position order is not linked-list order; only Head and Next define traversal.", "Dễ nhầm: thứ tự vị trí mảng không phải thứ tự linked list; chỉ Head và Next định nghĩa traversal."], method: [["Record Head and Null.", "Ghi Head và Null."], ["Draw address-labelled links.", "Vẽ link có nhãn address."], ["Follow Next to first match/anchor.", "Theo Next tới match/anchor đầu."], ["Save successor before relinking.", "Lưu successor trước relink."], ["Verify reachability and Null termination.", "Kiểm tra reachability và kết thúc Null."]] },
  misconceptions: [
    [["Increment Current as an array scan.", "Tăng Current như quét mảng."], ["Set Current←Node[Current].Next.", "Đặt Current←Node[Current].Next."], ["Which field contains the logical successor?", "Field nào chứa successor logic?"]],
    [["Change Anchor.Next before saving it.", "Đổi Anchor.Next trước khi lưu."], ["Save the old successor first.", "Lưu successor cũ trước."], ["Can the suffix still be reached?", "Suffix còn reachable không?"]],
    [["Clear a deleted node before bypassing.", "Clear node bị delete trước bypass."], ["Relink Head/Previous before clearing.", "Relink Head/Previous trước clearing."], ["Where is the successor stored?", "Successor được lưu ở đâu?"]],
    [["Choose any free address silently.", "Âm thầm chọn address free bất kỳ."], ["Use the declared lowest-free allocator.", "Dùng allocator lowest-free đã công bố."], ["Which free address is smallest?", "Address free nào nhỏ nhất?"]],
  ],
  checkpoints: [
    quiz("recall", ["What does Null=−1 mean?", "Null=−1 nghĩa gì?"], ["No next node", "Không có node tiếp"], ["Address zero", "Address zero"], ["Delete Head", "Delete Head"], ["−1 terminates a link in this fixture", "−1 kết thúc link trong fixture"]),
    quiz("recognise", ["Which clue identifies a linked list?", "Dấu hiệu nào nhận diện linked list?"], ["Head and Next fields", "Field Head và Next"], ["Low/High/Mid", "Low/High/Mid"], ["Front/Rear/Count", "Front/Rear/Count"], ["linked traversal follows Next from Head", "linked traversal theo Next từ Head"]),
    quiz("predict", ["Current=5 and Node[5].Next=1. Next Current?", "Current=5 và Node[5].Next=1. Current tiếp?"], ["1", "1"], ["6", "6"], ["−1", "−1"], ["traversal follows the stored Next address", "traversal theo address Next đã lưu"]),
    quiz("trace", ["After inserting address 0 after node 5, what is Node[5].Next?", "Sau khi chèn address 0 sau node 5, Node[5].Next là gì?"], ["0", "0"], ["1", "1"], ["5", "5"], ["the anchor must point to the new node", "anchor phải trỏ node mới"]),
    quiz("write", ["Which insertion order preserves the suffix?", "Thứ tự insertion nào giữ suffix?"], ["save successor → write new.Next → redirect anchor", "lưu successor → ghi new.Next → đổi anchor"], ["redirect anchor → guess successor", "đổi anchor → đoán successor"], ["clear anchor → allocate", "clear anchor → allocate"], ["save the old link before overwriting it", "lưu link cũ trước khi ghi đè"]),
    quiz("transfer", ["Target is missing. What mutation occurs?", "Target missing. Mutation nào xảy ra?"], ["None", "Không có"], ["Clear Head", "Clear Head"], ["Allocate a node", "Allocate node"], ["a failed delete/find preserves valid state", "delete/find thất bại giữ state hợp lệ"], true),
  ],
  recall: { prompt: ["Give the safe pointer-update rules for linked-list insertion and deletion.", "Nêu quy tắc pointer update an toàn cho insertion và deletion linked list."], points: [["Traverse by Next from Head.", "Traverse bằng Next từ Head."], ["Save successor before insertion relink.", "Lưu successor trước insertion relink."], ["Bypass before clearing deletion record.", "Bypass trước khi clear record deletion."]] },
  takeaways: [["Logical order follows links.", "Thứ tự logic theo link."], ["Save links before overwriting.", "Lưu link trước khi ghi đè."], ["Verify reachability after mutation.", "Kiểm tra reachability sau mutation."]], related: ["binary-tree", "implementing-one-adt-with-another"],
  book: "Chapter 19, printed pp469–481 / PDF pp485–497: linked-list find, insert and delete", papers: paperPair("w22-32", "Cambridge 9618/32 — October/November 2022", "Question 11, pp10–11", "Question 11, pp15–16"),
});

const tree = makeLesson({
  id: "P3-19.1-T08", slug: "binary-tree", minutes: 40, kind: "binary-tree", title: ["Binary tree", "Cây nhị phân"],
  question: ["How does a BST ordering rule determine the path used to find or insert a value?", "Quy tắc thứ tự BST quyết định đường find hoặc insert giá trị như thế nào?"],
  opening: ["A record-array tree stores left and right child links; values, not addresses, choose the path.", "Cây record-array lưu link con trái/phải; giá trị, không phải address, chọn đường."],
  objectives: [["Identify root, child and leaf.", "Nhận diện root, child và leaf."], ["Trace BST find and insert paths.", "Trace đường find và insert BST."], ["Preserve smaller-left/larger-right ordering.", "Giữ thứ tự nhỏ-trái/lớn-phải."], ["Reject duplicates without mutation.", "Từ chối duplicate không mutation."]],
  prerequisites: [["Compare integers.", "So sánh số nguyên."], ["Follow record links using Null.", "Theo link record bằng Null."]],
  glossary: [["root", "Entry node of the tree.", "Node đầu vào của cây."], ["child", "Node reached by a left or right link.", "Node tới qua link trái hoặc phải."], ["leaf", "Node with no children.", "Node không có con."], ["BST", "Binary search tree with a declared ordering.", "Cây tìm kiếm nhị phân có ordering đã nêu."], ["path", "Comparison-directed sequence of visited nodes.", "Chuỗi node được thăm theo comparison."]],
  theory: [
    ["structure", ["Binary structure", "Cấu trúc binary"], ["Each node has at most two child links. A binary tree is not automatically a BST or balanced.", "Mỗi node có tối đa hai link con. Binary tree không tự động là BST hoặc balanced."]],
    ["ordering", ["BST ordering", "Ordering BST"], ["The fixture requires all smaller descendants left and larger descendants right; keys are unique.", "Fixture yêu cầu descendant nhỏ hơn ở trái và lớn hơn ở phải; key unique."]],
    ["find", ["One comparison chooses one child", "Một comparison chọn một child"], ["Equality returns Current; smaller follows Left; larger follows Right. Null proves missing along that path.", "Equality trả Current; nhỏ hơn theo Left; lớn hơn theo Right. Null chứng minh missing trên path đó."]],
    ["insert", ["Attach at first Null child", "Gắn tại child Null đầu tiên"], ["INSERT follows the same comparisons, records Parent, rejects equality and attaches one new leaf. Deletion is outside core.", "INSERT theo cùng comparison, ghi Parent, từ chối equality và gắn một leaf mới. Deletion ngoài core."], `Current ← Root
WHILE Current <> -1
  IF Tree[Current].Data = Target THEN RETURN Current
  IF Target < Tree[Current].Data THEN
    Current ← Tree[Current].Left
  ELSE
    Current ← Tree[Current].Right
  ENDIF
ENDWHILE
RETURN -1`],
  ],
  visual: { title: ["BST path workbench", "Bàn trace path BST"], introduction: ["Node diagram, record table and comparison path share the same links.", "Sơ đồ node, bảng record và path comparison dùng cùng link."], task: ["Predict left/right choices, insert a leaf and test duplicate rejection.", "Dự đoán chọn trái/phải, chèn leaf và thử duplicate rejection."], conventions: [["Null=−1; Root=−1 means empty.", "Null=−1; Root=−1 nghĩa empty."], ["Smaller left, larger right.", "Nhỏ trái, lớn phải."], ["Duplicates rejected; find/insert only.", "Duplicate bị từ chối; chỉ find/insert."]] },
  worked: { title: ["Find 35 and insert 40", "Tìm 35 và insert 40"], prompt: ["BST root 50; left 30 with right 35; right 70.", "BST root 50; trái 30 có phải 35; phải 70."], steps: [
    ["declare", ["Write ordering and duplicate rule.", "Ghi ordering và quy tắc duplicate."], ["Path decisions need an explicit contract.", "Quyết định path cần contract rõ."], ["Smaller left; larger right; equality rejects insert.", "Nhỏ trái; lớn phải; equality từ chối insert."]],
    ["find-root", ["Compare 35 with 50.", "So 35 với 50."], ["35<50 chooses Left.", "35<50 chọn Left."], ["Move to node 30.", "Đi tới node 30."]],
    ["find-next", ["Compare 35 with 30.", "So 35 với 30."], ["35>30 chooses Right.", "35>30 chọn Right."], ["Move to node 35.", "Đi tới node 35."]],
    ["find-hit", ["Compare equal and return node 35.", "So bằng và trả node 35."], ["Equality satisfies FIND.", "Equality thỏa FIND."], ["Path 50→30→35.", "Path 50→30→35."]],
    ["insert-path", ["For 40, follow 50 left, 30 right, 35 right.", "Với 40, theo 50 trái, 30 phải, 35 phải."], ["Each inequality preserves BST ordering.", "Mỗi bất đẳng thức giữ ordering BST."], ["Right child of 35 is first Null; Parent=35.", "Child phải của 35 là Null đầu; Parent=35."]],
    ["attach", ["Create leaf 40 and set 35.Right to it.", "Tạo leaf 40 và đặt 35.Right tới nó."], ["40>35 and 40<50.", "40>35 và 40<50."], ["BST ordering holds; duplicate attempt would make no mutation.", "Ordering BST giữ đúng; thử duplicate sẽ không mutation."]],
  ], result: ["FIND path is 50→30→35; INSERT 40 attaches as right child of 35.", "Path FIND là 50→30→35; INSERT 40 gắn làm con phải của 35."], selfCheck: ["Does every edge on the path follow the declared comparison rule?", "Mọi edge trên path có theo quy tắc comparison đã nêu không?"] },
  recognition: { cues: [["root/left/right child", "root/con trái/con phải"], ["leaf", "leaf"], ["smaller left, larger right", "nhỏ trái, lớn phải"]], distinguish: ["Near miss: a generic binary tree has at most two children but may not support BST search without an ordering rule.", "Dễ nhầm: binary tree chung có tối đa hai con nhưng có thể không hỗ trợ BST search nếu không có ordering."], method: [["Write ordering and Null.", "Ghi ordering và Null."], ["Start at Root.", "Bắt đầu tại Root."], ["Compare once per node.", "So một lần mỗi node."], ["Follow exactly one child.", "Theo đúng một child."], ["Stop at equality or Null; attach only at Null.", "Dừng tại equality hoặc Null; chỉ attach tại Null."]] },
  misconceptions: [
    [["Every binary tree is ordered.", "Mọi binary tree đều ordered."], ["Require an explicit BST ordering before directed search.", "Cần ordering BST rõ trước directed search."], ["What rule links values to left/right?", "Quy tắc nào nối value với left/right?"]],
    [["Use address size to choose path.", "Dùng độ lớn address để chọn path."], ["Compare stored Data values, not addresses.", "So Data đã lưu, không so address."], ["Which field contains the key?", "Field nào chứa key?"]],
    [["Insert duplicate on either side.", "Insert duplicate vào một bên."], ["Reject equality with no mutation.", "Từ chối equality không mutation."], ["What is the declared duplicate rule?", "Quy tắc duplicate đã nêu là gì?"]],
    [["Implement tree deletion here.", "Cài tree deletion ở đây."], ["Section 19 core requires find/insert; deletion is outside this core.", "Core Section 19 yêu cầu find/insert; deletion ngoài core này."], ["Which operations are in scope?", "Operation nào trong scope?"]],
  ],
  checkpoints: [
    quiz("recall", ["What makes this binary tree a BST?", "Điều gì làm binary tree này là BST?"], ["Smaller left; larger right", "Nhỏ trái; lớn phải"], ["At most two children only", "Chỉ tối đa hai con"], ["Addresses increase downward", "Address tăng theo chiều xuống"], ["a declared value ordering controls descendants", "ordering value đã nêu điều khiển descendant"]),
    quiz("recognise", ["Which clue identifies BST search?", "Dấu hiệu nào nhận diện BST search?"], ["Compare then follow left or right", "So rồi theo trái hoặc phải"], ["Scan every array cell", "Quét mọi ô mảng"], ["Use Front and Rear", "Dùng Front và Rear"], ["one comparison selects one ordered child", "một comparison chọn một child có order"]),
    quiz("predict", ["Target 35 at node 50. Next direction?", "Target 35 tại node 50. Hướng tiếp?"], ["Left", "Trái"], ["Right", "Phải"], ["Stop missing", "Dừng missing"], ["35<50 follows Left", "35<50 theo Left"]),
    quiz("trace", ["Path to 35 in the fixture?", "Path tới 35 trong fixture?"], ["50→30→35", "50→30→35"], ["50→70→35", "50→70→35"], ["30→50→35", "30→50→35"], ["each comparison chooses the shown child", "mỗi comparison chọn child đã nêu"]),
    quiz("write", ["What happens on equality during INSERT?", "Điều gì xảy ra khi equality trong INSERT?"], ["Return failure; no mutation", "Trả failure; không mutation"], ["Create a left duplicate", "Tạo duplicate trái"], ["Delete the node", "Delete node"], ["the fixture rejects duplicate keys", "fixture từ chối key duplicate"]),
    quiz("transfer", ["Root=−1 and INSERT 20. Result?", "Root=−1 và INSERT 20. Kết quả?"], ["Create a root leaf containing 20", "Tạo root leaf chứa 20"], ["Report missing only", "Chỉ báo missing"], ["Follow Left from −1", "Theo Left từ −1"], ["empty insert creates the root", "insert vào empty tạo root"], true),
  ],
  recall: { prompt: ["State the BST find/insert method and boundary.", "Nêu phương pháp find/insert BST và boundary."], points: [["Compare values from Root.", "So value từ Root."], ["Follow one ordered child until equality/Null.", "Theo một child ordered tới equality/Null."], ["Attach at Null; reject duplicates; no deletion in core.", "Attach tại Null; từ chối duplicate; không deletion trong core."]] },
  takeaways: [["Binary does not automatically mean ordered.", "Binary không tự động nghĩa ordered."], ["Values choose the path.", "Value chọn path."], ["Duplicate insert preserves state.", "Insert duplicate giữ state."]], related: ["linked-list", "implementing-one-adt-with-another"],
  book: "Chapter 19, printed pp481–487 / PDF pp497–503: binary-tree find and insert", papers: [...paperPair("w24-31", "Cambridge 9618/31 — October/November 2024", "Question 11, pp12–13", "Question 11, pp15–17"), ...paperPair("s25-31", "Cambridge 9618/31 — May/June 2025", "Question 4, pp5–6", "Question 4, pp9–10")],
});

const dictionary = makeLesson({
  id: "P3-19.1-T09", slug: "dictionary", minutes: 30, kind: "dictionary", title: ["Dictionary ADT", "ADT dictionary"],
  question: ["How do unique keys control lookup, insertion and update independently of storage order?", "Key unique điều khiển lookup, insertion và update độc lập với storage order như thế nào?"],
  opening: ["A course code maps to one course title; the key is an identifier, not an array index.", "Mã khóa học map tới một tên khóa học; key là identifier, không phải array index."],
  objectives: [["Describe unique key–value mappings.", "Mô tả mapping key–value unique."], ["Trace LOOKUP, INSERT and UPDATE.", "Trace LOOKUP, INSERT và UPDATE."], ["Apply duplicate/missing failure rules.", "Áp dụng quy tắc failure duplicate/missing."], ["Separate interface from representation.", "Tách interface khỏi representation."]],
  prerequisites: [["Distinguish an identifier from a position.", "Phân biệt identifier với position."], ["Read a key–value table.", "Đọc bảng key–value."]],
  glossary: [["key", "Unique identifier used for access.", "Identifier unique dùng để truy cập."], ["value", "Data associated with a key.", "Data gắn với key."], ["LOOKUP", "Return value for a matching key or NotFound.", "Trả value của key khớp hoặc NotFound."], ["INSERT", "Add a previously absent key.", "Thêm key chưa tồn tại."], ["UPDATE", "Replace the value of an existing key.", "Thay value của key hiện có."]],
  theory: [
    ["mapping", ["Unique keys, reusable values", "Key unique, value có thể lặp"], ["Each key maps to one value. Different keys may store equal values; key uniqueness does not imply value uniqueness.", "Mỗi key map tới một value. Key khác nhau có thể lưu value bằng nhau; key unique không nghĩa value unique."]],
    ["lookup", ["Lookup by key", "Lookup theo key"], ["LOOKUP compares keys and returns the matching value. Missing reports NotFound without inventing a value.", "LOOKUP so key và trả value khớp. Missing báo NotFound mà không tự tạo value."]],
    ["insert-update", ["INSERT and UPDATE are different", "INSERT và UPDATE khác nhau"], ["INSERT existing rejects; UPDATE missing reports missing. Both failures preserve state. UPDATE existing replaces only its value.", "INSERT existing bị từ chối; UPDATE missing báo missing. Cả hai failure giữ state. UPDATE existing chỉ thay value."]],
    ["representation", ["ADT does not imply hashing", "ADT không ngầm định hashing"], ["An ordered entry list is one teaching representation. The dictionary interface does not make a numeric key a physical index or require hashing.", "Entry list có thứ tự là một representation dạy học. Interface dictionary không biến numeric key thành physical index hoặc bắt buộc hashing."]],
  ],
  visual: { title: ["Key–value operation workbench", "Bàn thao tác key–value"], introduction: ["Operation, key match, result and before/after entries remain aligned.", "Operation, key match, result và entry before/after luôn đồng bộ."], task: ["Predict hit/missing behavior and test duplicate INSERT versus UPDATE.", "Dự đoán hit/missing và thử INSERT duplicate so với UPDATE."], conventions: [["Keys are unique strings.", "Key là string unique."], ["INSERT existing rejects.", "INSERT existing bị từ chối."], ["UPDATE missing and LOOKUP missing do not mutate.", "UPDATE missing và LOOKUP missing không mutate."]] },
  worked: { title: ["Manage two course entries", "Quản lý hai entry khóa học"], prompt: ["Start {CS:Computer Science, MA:Mathematics}; run LOOKUP CS, INSERT PH, UPDATE MA, INSERT CS.", "Bắt đầu {CS:Computer Science, MA:Mathematics}; chạy LOOKUP CS, INSERT PH, UPDATE MA, INSERT CS."], steps: [
    ["declare", ["State unique-key and failure policies.", "Nêu chính sách unique-key và failure."], ["Observable behavior must be known before tracing storage.", "Hành vi observable phải rõ trước khi trace storage."], ["Existing INSERT and missing UPDATE reject without mutation.", "INSERT existing và UPDATE missing bị từ chối không mutation."]],
    ["lookup", ["LOOKUP CS.", "LOOKUP CS."], ["CS matches an existing key.", "CS khớp key hiện có."], ["Return Computer Science; entries unchanged.", "Trả Computer Science; entries không đổi."]],
    ["insert", ["INSERT PH→Physics.", "INSERT PH→Physics."], ["PH is absent and therefore valid.", "PH chưa tồn tại nên hợp lệ."], ["Append unique entry PH:Physics.", "Append entry unique PH:Physics."]],
    ["update", ["UPDATE MA→Further Mathematics.", "UPDATE MA→Further Mathematics."], ["MA exists; UPDATE may replace its value.", "MA tồn tại; UPDATE được thay value."], ["Only MA value changes.", "Chỉ value MA đổi."]],
    ["duplicate", ["Attempt INSERT CS→Coding.", "Thử INSERT CS→Coding."], ["CS is an existing key.", "CS là key đã có."], ["Reject; Computer Science remains unchanged.", "Từ chối; Computer Science giữ nguyên."]],
    ["verify", ["Compare final mappings with the interface rules.", "So final mapping với quy tắc interface."], ["Representation order is not part of key lookup.", "Thứ tự representation không thuộc key lookup."], ["CS unchanged, MA updated, PH inserted; three unique keys.", "CS không đổi, MA updated, PH inserted; ba key unique."]],
  ], result: ["LOOKUP observes; INSERT adds only absent keys; UPDATE changes only existing keys.", "LOOKUP quan sát; INSERT chỉ thêm key absent; UPDATE chỉ đổi key existing."], selfCheck: ["Did any rejected operation change the mapping?", "Thao tác bị từ chối có đổi mapping không?"] },
  recognition: { cues: [["key–value", "key–value"], ["lookup by unique key", "lookup bằng key unique"], ["insert/update", "insert/update"]], distinguish: ["Near miss: a numeric key is not automatically an array index, and a dictionary does not automatically mean hashing.", "Dễ nhầm: numeric key không tự động là array index, và dictionary không tự động nghĩa hashing."], method: [["Identify operation and key.", "Nhận diện operation và key."], ["Apply uniqueness/missing policy.", "Áp dụng chính sách uniqueness/missing."], ["Find through the representation mapping.", "Find qua representation mapping."], ["Return value or typed failure.", "Trả value hoặc typed failure."], ["Check rejected state is unchanged.", "Check state bị từ chối không đổi."]] },
  misconceptions: [
    [["Keys and values must both be unique.", "Key và value đều phải unique."], ["Keys are unique; different keys may share a value.", "Key unique; key khác có thể cùng value."], ["Which field identifies the entry?", "Field nào xác định entry?"]],
    [["INSERT existing performs UPDATE.", "INSERT existing thực hiện UPDATE."], ["This fixture rejects duplicate INSERT.", "Fixture này từ chối INSERT duplicate."], ["Which operation was requested?", "Operation nào được yêu cầu?"]],
    [["UPDATE missing creates a key.", "UPDATE missing tạo key."], ["Missing UPDATE reports failure without mutation.", "UPDATE missing báo failure không mutation."], ["Was an existing key found?", "Có tìm thấy key existing không?"]],
    [["Dictionary always uses hashing.", "Dictionary luôn dùng hashing."], ["Hashing is only one possible representation.", "Hashing chỉ là một representation có thể."], ["Did the interface state a hash function?", "Interface có nêu hash function không?"]],
  ],
  checkpoints: [
    quiz("recall", ["Which dictionary field must be unique?", "Field dictionary nào phải unique?"], ["Key", "Key"], ["Value", "Value"], ["Physical index", "Physical index"], ["the key identifies one mapping", "key xác định một mapping"]),
    quiz("recognise", ["Which clue identifies a dictionary?", "Dấu hiệu nào nhận diện dictionary?"], ["Lookup a value by unique key", "Lookup value bằng key unique"], ["Remove newest item", "Loại item mới nhất"], ["Follow left/right children", "Theo child trái/phải"], ["dictionary access is key–value mapping", "dictionary truy cập bằng mapping key–value"]),
    quiz("predict", ["INSERT existing key CS. Outcome?", "INSERT key CS đã có. Kết quả?"], ["Reject; no mutation", "Từ chối; không mutation"], ["Overwrite its value", "Ghi đè value"], ["Create duplicate CS", "Tạo CS duplicate"], ["duplicate INSERT is rejected by contract", "INSERT duplicate bị contract từ chối"]),
    quiz("trace", ["After INSERT PH and UPDATE MA, how many unique keys?", "Sau INSERT PH và UPDATE MA, có bao nhiêu key unique?"], ["3", "3"], ["4", "4"], ["2", "2"], ["UPDATE does not add a key; INSERT PH adds one", "UPDATE không thêm key; INSERT PH thêm một"]),
    quiz("write", ["Which UPDATE missing behavior is correct?", "Behavior UPDATE missing nào đúng?"], ["Return failure and preserve state", "Trả failure và giữ state"], ["Append automatically", "Tự append"], ["Delete first entry", "Delete entry đầu"], ["UPDATE requires an existing key", "UPDATE cần key existing"]),
    quiz("transfer", ["Keys 101 and 205 are integers. May code use them directly as array indices?", "Key 101 và 205 là integer. Code có thể dùng trực tiếp làm array index không?"], ["Only if a representation mapping explicitly says so", "Chỉ khi mapping representation nêu rõ"], ["Always", "Luôn luôn"], ["Never store integer keys", "Không bao giờ lưu key integer"], ["key identity is separate from physical position", "identity key tách khỏi position vật lý"], true),
  ],
  recall: { prompt: ["Differentiate LOOKUP, INSERT and UPDATE under the locked policy.", "Phân biệt LOOKUP, INSERT và UPDATE theo policy đã khóa."], points: [["LOOKUP returns value or NotFound.", "LOOKUP trả value hoặc NotFound."], ["INSERT adds only an absent key.", "INSERT chỉ thêm key absent."], ["UPDATE changes only an existing key; failures preserve state.", "UPDATE chỉ đổi key existing; failure giữ state."]] },
  takeaways: [["Keys, not positions, control access.", "Key, không phải position, điều khiển access."], ["INSERT and UPDATE are distinct.", "INSERT và UPDATE khác nhau."], ["The ADT does not imply hashing.", "ADT không ngầm định hashing."]], related: ["implementing-one-adt-with-another", "linked-list"],
  book: "Chapter 19, printed pp488–489 / PDF pp504–505: dictionary and ADT implementation", papers: [],
});

const adtImplementation = makeLesson({
  id: "P3-19.1-T10", slug: "implementing-one-adt-with-another", minutes: 40, kind: "adt-implementation", title: ["Implementing one ADT with another", "Cài đặt một ADT bằng ADT khác"],
  question: ["How can different internal structures preserve the same external ADT behaviour?", "Các cấu trúc nội bộ khác nhau giữ cùng hành vi ADT bên ngoài như thế nào?"],
  opening: ["A queue can keep its FIFO interface while two internal stacks move values between inbox and outbox.", "Queue có thể giữ interface FIFO trong khi hai stack nội bộ chuyển value giữa inbox và outbox."],
  objectives: [["Separate interface from representation.", "Tách interface khỏi representation."], ["State a representation invariant.", "Nêu representation invariant."], ["Map external operations to internal operations.", "Map operation ngoài tới operation trong."], ["Justify behavior and compare costs.", "Biện minh behavior và so sánh cost."]],
  prerequisites: [["Know stack, queue, list, tree and dictionary interfaces.", "Biết interface stack, queue, list, tree và dictionary."], ["Trace short operation sequences.", "Trace chuỗi operation ngắn."]],
  glossary: [["interface", "Observable operations, inputs and results.", "Operation, input và result observable."], ["representation", "Internal data and mapped operations.", "Data nội bộ và operation mapped."], ["invariant", "Condition making internal state a valid external value.", "Điều kiện làm state nội bộ thành value ngoài hợp lệ."], ["client", "Code using the external interface.", "Code dùng interface ngoài."], ["trade-off", "A cost difference with behavior preserved.", "Khác biệt cost khi behavior vẫn giữ."]],
  theory: [
    ["separation", ["Interface before representation", "Interface trước representation"], ["Define observable behavior first. A client should receive the same results even if the internal structure changes.", "Định nghĩa behavior observable trước. Client phải nhận cùng result dù cấu trúc nội bộ đổi."]],
    ["invariant", ["Representation invariant", "Representation invariant"], ["The invariant explains how internal cells, links or component ADTs correspond to the external logical value.", "Invariant giải thích cách ô, link hoặc component ADT nội bộ tương ứng với logical value ngoài."]],
    ["queue-two-stacks", ["Queue from two stacks", "Queue bằng hai stack"], ["ENQUEUE pushes to Inbox. DEQUEUE uses Outbox; if it is empty, pop every Inbox item into Outbox, reversing order exactly once before removal.", "ENQUEUE push vào Inbox. DEQUEUE dùng Outbox; nếu empty, pop toàn bộ Inbox sang Outbox, đảo order đúng một lần trước remove."]],
    ["scope", ["Required representations and graph boundary", "Representation bắt buộc và boundary graph"], ["Arrays/records/other ADTs may implement stack, queue, linked list, dictionary and BST. For graph, know nodes, edges, direction/weight and justify suitability; graph-structure code is not required.", "Mảng/record/ADT khác có thể cài stack, queue, linked list, dictionary và BST. Với graph, biết node, edge, direction/weight và justify suitability; không yêu cầu code cấu trúc graph."], `PROCEDURE Enqueue(NewValue : STRING)
  CALL Push(Inbox, NewValue)
ENDPROCEDURE

FUNCTION Dequeue() RETURNS STRING
  IF IsEmpty(Outbox) THEN
    WHILE NOT IsEmpty(Inbox)
      CALL Push(Outbox, Pop(Inbox))
    ENDWHILE
  ENDIF
  RETURN Pop(Outbox)
ENDFUNCTION`],
  ],
  visual: { title: ["Interface-to-internals workbench", "Bàn map interface tới internals"], introduction: ["External request, internal operations, invariant and observable result appear in one timeline.", "Request ngoài, operation trong, invariant và result observable xuất hiện trên một timeline."], task: ["Trace a queue built from two stacks, then compare array/list representations and inspect the graph scope card.", "Trace queue tạo từ hai stack, rồi so representation array/list và xem scope card graph."], conventions: [["External FIFO behavior is fixed.", "Behavior FIFO ngoài cố định."], ["Internal stacks are LIFO.", "Stack nội bộ là LIFO."], ["Graph code is outside the Section 19 core.", "Code graph ngoài core Section 19."]] },
  worked: { title: ["Preserve FIFO with two LIFO stacks", "Giữ FIFO bằng hai stack LIFO"], prompt: ["ENQUEUE A, ENQUEUE B, ENQUEUE C, DEQUEUE, ENQUEUE D, DEQUEUE.", "ENQUEUE A, ENQUEUE B, ENQUEUE C, DEQUEUE, ENQUEUE D, DEQUEUE."], steps: [
    ["interface", ["Write the external FIFO promise.", "Ghi promise FIFO ngoài."], ["Representation must be judged against observable behavior.", "Representation phải được đánh giá theo behavior observable."], ["Expected removals begin A, then B.", "Removal dự kiến bắt đầu A, rồi B."]],
    ["enqueue", ["Push A, B, C onto Inbox.", "Push A, B, C vào Inbox."], ["ENQUEUE maps directly to one internal push.", "ENQUEUE map trực tiếp tới một push nội bộ."], ["Inbox bottom→top A,B,C; Outbox empty.", "Inbox bottom→top A,B,C; Outbox empty."]],
    ["transfer", ["For first DEQUEUE, move C, B, A from Inbox to Outbox.", "Với DEQUEUE đầu, chuyển C, B, A từ Inbox sang Outbox."], ["Two reversals make A the Outbox top.", "Hai lần đảo làm A thành top Outbox."], ["Outbox bottom→top C,B,A; Inbox empty.", "Outbox bottom→top C,B,A; Inbox empty."]],
    ["dequeue-a", ["POP Outbox and return A.", "POP Outbox và trả A."], ["A is the oldest enqueued value.", "A là value enqueue cũ nhất."], ["Observable FIFO promise holds.", "Promise FIFO observable giữ đúng."]],
    ["enqueue-d", ["Push D onto Inbox while Outbox still contains C,B.", "Push D vào Inbox khi Outbox vẫn chứa C,B."], ["Do not transfer while Outbox can serve older items.", "Không transfer khi Outbox còn phục vụ item cũ."], ["Inbox top D; Outbox top B.", "Inbox top D; Outbox top B."]],
    ["dequeue-b", ["POP Outbox and return B.", "POP Outbox và trả B."], ["B is older than C and D.", "B cũ hơn C và D."], ["Results A then B match a normal queue.", "Result A rồi B khớp queue bình thường."]],
  ], result: ["Different internals preserve the same ENQUEUE/DEQUEUE results; costs differ by state.", "Internals khác nhau giữ cùng result ENQUEUE/DEQUEUE; cost khác theo state."], selfCheck: ["Could a client distinguish this representation from another queue by returned order?", "Client có phân biệt representation này với queue khác bằng order trả về không?"] },
  recognition: { cues: [["ADT X using Y", "ADT X dùng Y"], ["internal representation", "representation nội bộ"], ["operation mapping/invariant", "mapping operation/invariant"]], distinguish: ["Near miss: queue-from-two-stacks is one implementation, not the definition of a queue.", "Dễ nhầm: queue-from-two-stacks là một implementation, không phải định nghĩa queue."], method: [["Write external interface.", "Ghi interface ngoài."], ["Name internal substrate.", "Nêu substrate trong."], ["State invariant.", "Nêu invariant."], ["Map each operation and trace results.", "Map mỗi operation và trace result."], ["Compare cost without changing behavior.", "So cost mà không đổi behavior."]] },
  misconceptions: [
    [["Representation is the ADT definition.", "Representation là định nghĩa ADT."], ["Define observable operations separately.", "Định nghĩa operation observable riêng."], ["What can the client observe?", "Client quan sát được gì?"]],
    [["Same behavior means same complexity.", "Cùng behavior nghĩa cùng complexity."], ["Representations can preserve results but change time/space costs.", "Representation có thể giữ result nhưng đổi cost time/space."], ["How many internal operations occur?", "Có bao nhiêu operation nội bộ?"]],
    [["Always transfer Inbox before DEQUEUE.", "Luôn transfer Inbox trước DEQUEUE."], ["Transfer only when Outbox is empty.", "Chỉ transfer khi Outbox empty."], ["Are older items already in Outbox?", "Item cũ đã ở Outbox chưa?"]],
    [["Graph structure code is mandatory.", "Code cấu trúc graph là bắt buộc."], ["Syllabus requires features/justification and explicitly excludes graph-structure code.", "Syllabus yêu cầu feature/justification và loại rõ code cấu trúc graph."], ["What does the syllabus boundary say?", "Boundary syllabus nói gì?"]],
  ],
  checkpoints: [
    quiz("recall", ["What belongs to an ADT interface?", "Điều gì thuộc ADT interface?"], ["Observable operations and results", "Operation và result observable"], ["One fixed array layout", "Một layout mảng cố định"], ["Compiler frame addresses", "Address call frame compiler"], ["the interface describes client-visible behavior", "interface mô tả behavior client nhìn thấy"]),
    quiz("recognise", ["Which prompt asks about implementation by another ADT?", "Prompt nào hỏi implementation bằng ADT khác?"], ["Implement a queue using two stacks", "Cài queue bằng hai stack"], ["Define FIFO only", "Chỉ định nghĩa FIFO"], ["Trace binary search", "Trace binary search"], ["one external interface is mapped onto another structure", "một interface ngoài được map lên cấu trúc khác"]),
    quiz("predict", ["Outbox contains top B and Inbox contains D. Next DEQUEUE?", "Outbox có top B và Inbox có D. DEQUEUE tiếp?"], ["Return B without transfer", "Trả B không transfer"], ["Return D", "Trả D"], ["Move B back to Inbox", "Chuyển B về Inbox"], ["older Outbox items are served before newer Inbox items", "item Outbox cũ được phục vụ trước item Inbox mới"]),
    quiz("trace", ["After enqueue A,B,C then first transfer, Outbox top?", "Sau enqueue A,B,C rồi transfer đầu, top Outbox?"], ["A", "A"], ["C", "C"], ["B", "B"], ["moving all values reverses order", "chuyển toàn bộ value đảo order"]),
    quiz("write", ["When does the transfer WHILE loop run?", "Vòng WHILE transfer chạy khi nào?"], ["Only when Outbox is empty", "Chỉ khi Outbox empty"], ["On every ENQUEUE", "Mỗi ENQUEUE"], ["After every POP", "Sau mọi POP"], ["existing Outbox values are older and must remain first", "value Outbox hiện có cũ hơn và phải ra trước"]),
    quiz("transfer", ["A road network needs vertices and weighted edges. What Section 19 answer is required?", "Mạng đường cần vertex và edge có trọng số. Câu trả lời Section 19 cần gì?"], ["Describe graph features and justify suitability; no structure code required", "Mô tả feature graph và justify suitability; không cần code cấu trúc"], ["Implement Dijkstra", "Cài Dijkstra"], ["Write an adjacency matrix program", "Viết chương trình adjacency matrix"], ["the explicit syllabus boundary is interface/features, not graph code", "boundary syllabus rõ là interface/feature, không phải code graph"], true),
  ],
  recall: { prompt: ["Explain how one ADT can implement another.", "Giải thích cách một ADT cài ADT khác."], points: [["State external behavior and internal representation.", "Nêu behavior ngoài và representation trong."], ["Give invariant and operation mapping.", "Nêu invariant và mapping operation."], ["Show equal observable results and discuss cost.", "Cho thấy result observable bằng nhau và bàn cost."]] },
  takeaways: [["Interface and representation are separate.", "Interface và representation tách nhau."], ["Invariant connects internal state to external behavior.", "Invariant nối state trong với behavior ngoài."], ["Graph implementation code is outside core.", "Code implementation graph ngoài core."]], related: ["stack", "queue", "dictionary"],
  book: "Chapter 19, printed pp487–489 / PDF pp503–505: graph scope and ADT implementations", papers: [...paperPair("s23-31", "Cambridge 9618/31 — May/June 2023", "Question 11(c), p11", "Question 11(c), p9"), ...paperPair("w23-32", "Cambridge 9618/32 — October/November 2023", "Question 9(b), p9", "Question 9(b), pp6–7")],
});

const complexity = makeLesson({
  id: "P3-19.1-T11", slug: "time-and-space-complexity", minutes: 40, kind: "complexity-comparator", title: ["Time and space complexity", "Độ phức tạp thời gian và không gian"],
  question: ["How can operation and storage growth compare algorithms fairly as n changes?", "Tăng trưởng operation và storage so sánh công bằng các thuật toán khi n đổi như thế nào?"],
  opening: ["A measured trace supports one input; Big O describes growth under declared assumptions.", "Một trace đo hỗ trợ một input; Big O mô tả tăng trưởng dưới giả định đã nêu."],
  objectives: [["Define task, n, metric and assumptions.", "Định nghĩa task, n, metric và assumption."], ["Separate time from extra space.", "Tách time khỏi extra space."], ["Use O(1), O(log n), O(n) and O(n²).", "Dùng O(1), O(log n), O(n) và O(n²)."], ["Compare only algorithms doing the same task.", "Chỉ so thuật toán làm cùng task."]],
  prerequisites: [["Read simple tables and growth patterns.", "Đọc bảng và pattern tăng trưởng đơn giản."], ["Know the reviewed search/sort algorithms.", "Biết các search/sort algorithm đã học."]],
  glossary: [["n", "Declared input-size measure.", "Thước đo input size đã nêu."], ["time complexity", "Growth of representative operations.", "Tăng trưởng operation đại diện."], ["extra space", "Additional storage beyond the input representation.", "Storage bổ sung ngoài representation input."], ["Big O", "Asymptotic upper growth class under assumptions.", "Lớp tăng trưởng upper asymptotic theo assumption."], ["same-task comparison", "Both algorithms produce the same required result.", "Cả hai algorithm tạo cùng result yêu cầu."]],
  theory: [
    ["frame", ["Define the comparison frame", "Định nghĩa khung so sánh"], ["Name the task, n, counted operation, case and representation before comparing. Otherwise a growth claim is ambiguous.", "Nêu task, n, operation được đếm, case và representation trước khi so. Nếu không, claim tăng trưởng mơ hồ."]],
    ["time-space", ["Time and extra space are separate", "Time và extra space tách biệt"], ["Time models operation growth; extra space models added storage such as temporary values or recursive frames. Neither is automatically seconds or total input bytes.", "Time mô hình tăng trưởng operation; extra space mô hình storage thêm như temp hoặc recursive frame. Không cái nào tự động là giây hoặc tổng byte input."]],
    ["classes", ["Common growth classes", "Các lớp tăng trưởng thường gặp"], ["O(1) stays bounded, O(log n) grows by repeated halving, O(n) scales with a scan and O(n²) can arise from nested passes.", "O(1) giữ bounded, O(log n) tăng theo chia đôi, O(n) theo một scan và O(n²) có thể từ pass lồng."]],
    ["limits", ["Big O is not exact runtime", "Big O không phải runtime chính xác"], ["Same-class algorithms may differ in constants, initial order and memory. Best/worst/average claims name the implementation and case.", "Algorithm cùng class có thể khác constant, initial order và memory. Claim best/worst/average phải nêu implementation và case."]],
  ],
  visual: { title: ["Growth-comparison workbench", "Bàn so sánh tăng trưởng"], introduction: ["Operation tables and curves update with n, case and metric.", "Bảng operation và curve cập nhật theo n, case và metric."], task: ["Compare linear/binary search, bubble/insertion order effects and recursive frame space.", "So linear/binary search, ảnh hưởng order của bubble/insertion và space recursive frame."], conventions: [["Same task and compatible assumptions.", "Cùng task và assumption tương thích."], ["Time and extra space selected separately.", "Time và extra space chọn riêng."], ["Big O is growth, not seconds.", "Big O là tăng trưởng, không phải giây."]] },
  worked: { title: ["Compare worst-case search growth", "So tăng trưởng worst-case của search"], prompt: ["For sorted n=8, compare first-match linear search with inclusive binary search for a missing target.", "Với n=8 sorted, so linear search match đầu và binary search inclusive cho target missing."], steps: [
    ["task", ["State same task: decide whether Target occurs.", "Nêu cùng task: quyết định Target có xuất hiện không."], ["A fair comparison needs equal required output.", "So sánh công bằng cần cùng output yêu cầu."], ["Both return index or −1.", "Cả hai trả index hoặc −1."]],
    ["n-case", ["Set n=8 and worst-case missing.", "Đặt n=8 và worst-case missing."], ["Case controls how far each method proceeds.", "Case điều khiển mỗi method đi bao xa."], ["Linear scans all; binary exhausts windows.", "Linear quét hết; binary hết các window."]],
    ["linear", ["Count eight linear comparisons.", "Đếm tám comparison tuyến tính."], ["Every valid item must be ruled out.", "Mọi item hợp lệ phải bị loại."], ["Work is proportional to n: O(n).", "Work tỷ lệ n: O(n)."]],
    ["binary", ["Trace window sizes 8→4→2→1→0.", "Trace size window 8→4→2→1→0."], ["Each comparison roughly halves remaining candidates.", "Mỗi comparison gần chia đôi candidate còn lại."], ["At most four comparisons here; O(log n).", "Tối đa bốn comparison ở đây; O(log n)."]],
    ["space", ["State iterative extra space for both.", "Nêu extra space iterative cho cả hai."], ["A fixed number of indices does not grow with n.", "Số index cố định không tăng theo n."], ["Both reviewed iterative searches use O(1) extra space.", "Cả hai search iterative dùng O(1) extra space."]],
    ["conclusion", ["Conclude with assumptions and limits.", "Kết luận kèm assumption và limit."], ["Growth class supports scaling, not exact seconds.", "Growth class hỗ trợ scaling, không phải giây chính xác."], ["For sorted data and same task, binary time grows more slowly; both use constant extra space.", "Với data sorted và cùng task, time binary tăng chậm hơn; cả hai dùng extra space constant."]],
  ], result: ["The comparison is fair because task, n, case, representation and metric are stated.", "So sánh công bằng vì task, n, case, representation và metric được nêu."], selfCheck: ["Could the conclusion still be read as exact seconds or as a cross-task ranking?", "Kết luận có thể bị đọc như giây chính xác hoặc ranking khác task không?"] },
  recognition: { cues: [["efficiency/growth", "efficiency/tăng trưởng"], ["time or memory", "time hoặc memory"], ["Big O/input size n", "Big O/input size n"]], distinguish: ["Near miss: a single measured time is evidence for one environment, not by itself a Big O proof.", "Dễ nhầm: một thời gian đo là evidence cho một environment, không tự nó chứng minh Big O."], method: [["State task and n.", "Nêu task và n."], ["Choose time or extra-space metric.", "Chọn metric time hoặc extra-space."], ["Name case and assumptions.", "Nêu case và assumption."], ["Identify dominant growth.", "Nhận diện tăng trưởng dominant."], ["Give a scoped same-task conclusion.", "Kết luận scoped cho cùng task."]] },
  misconceptions: [
    [["Big O is seconds.", "Big O là giây."], ["Big O describes asymptotic operation/storage growth.", "Big O mô tả tăng trưởng operation/storage asymptotic."], ["What happens as n changes?", "Điều gì xảy ra khi n đổi?"]],
    [["Two O(n) algorithms take equal time.", "Hai algorithm O(n) mất cùng time."], ["Class omits constants and data effects.", "Class bỏ qua constant và data effect."], ["Are implementation details identical?", "Implementation detail có giống hệt không?"]],
    [["Compare algorithms doing different tasks.", "So algorithm làm task khác nhau."], ["Use the same required result and compatible assumptions.", "Dùng cùng result yêu cầu và assumption tương thích."], ["Are the outputs equivalent?", "Output có equivalent không?"]],
    [["Space means all input storage automatically.", "Space tự động nghĩa toàn bộ input storage."], ["State whether the metric is extra/auxiliary space.", "Nêu metric có phải extra/auxiliary space không."], ["Which storage grows in addition to input?", "Storage nào tăng ngoài input?"]],
  ],
  checkpoints: [
    quiz("recall", ["What does O(log n) suggest here?", "O(log n) gợi ý gì ở đây?"], ["Repeated halving of remaining work", "Liên tục chia đôi work còn lại"], ["Exact runtime in seconds", "Runtime chính xác theo giây"], ["Memory always doubles", "Memory luôn gấp đôi"], ["logarithmic growth follows repeated halving", "tăng trưởng logarithmic theo chia đôi"]),
    quiz("recognise", ["Which prompt asks for complexity?", "Prompt nào hỏi complexity?"], ["Compare time and memory as n grows", "So time và memory khi n tăng"], ["Name the current array value", "Nêu value mảng hiện tại"], ["Draw one pointer only", "Vẽ một pointer"], ["growth with input size is the key clue", "tăng trưởng theo input size là dấu hiệu chính"]),
    quiz("predict", ["Worst-case linear search doubles n. Approximate comparisons?", "Worst-case linear search tăng n gấp đôi. Comparison xấp xỉ?"], ["Double", "Gấp đôi"], ["Stay fixed", "Giữ cố định"], ["Square-root", "Căn bậc hai"], ["linear work is proportional to n", "work tuyến tính tỷ lệ với n"]),
    quiz("trace", ["Window sizes 8→4→2→1 indicate which class?", "Size window 8→4→2→1 cho class nào?"], ["O(log n)", "O(log n)"], ["O(n)", "O(n)"], ["O(n²)", "O(n²)"], ["each step halves the remaining candidates", "mỗi bước chia đôi candidate còn lại"]),
    quiz("write", ["What must a valid comparison state first?", "So sánh hợp lệ phải nêu gì trước?"], ["Same task, n, metric and assumptions", "Cùng task, n, metric và assumption"], ["Only algorithm names", "Chỉ tên algorithm"], ["Only one stopwatch result", "Chỉ một kết quả stopwatch"], ["the comparison frame controls meaning", "khung so sánh quyết định ý nghĩa"]),
    quiz("transfer", ["Recursive factorial uses one frame per call. Extra-space growth with Number=n?", "Factorial recursive dùng một frame mỗi call. Extra-space tăng theo Number=n?"], ["O(n)", "O(n)"], ["O(1)", "O(1)"], ["O(log n)", "O(log n)"], ["call depth grows linearly to the base case", "độ sâu call tăng tuyến tính tới base case"], true),
  ],
  recall: { prompt: ["Give the five-part method for a complexity comparison.", "Nêu phương pháp năm phần để so complexity."], points: [["Same task and representation assumptions.", "Cùng task và assumption representation."], ["Define n, case and metric.", "Định nghĩa n, case và metric."], ["State growth class and a scoped conclusion.", "Nêu growth class và kết luận scoped."]] },
  takeaways: [["Big O describes growth.", "Big O mô tả tăng trưởng."], ["Time and extra space are separate.", "Time và extra space tách nhau."], ["Fair comparison requires the same task.", "So sánh công bằng cần cùng task."]], related: ["linear-search", "binary-search", "designing-and-tracing-recursion"],
  book: "Chapter 19, printed pp489–490 / PDF pp505–506: algorithm comparison and Big O", papers: [...paperPair("s22-32", "Cambridge 9618/32 — May/June 2022", "Question 8(b)–(c), pp11–12", "Question 8(b)–(c), pp8–9"), ...paperPair("s24-31", "Cambridge 9618/31 — May/June 2024", "Question 10(c), p11", "Question 10(c), p13")],
});

const factorialCode = `FUNCTION Factorial(Number : INTEGER) RETURNS INTEGER
  IF Number = 0 THEN
    RETURN 1
  ENDIF
  RETURN Number * Factorial(Number - 1)
ENDFUNCTION`;

const recursion = makeLesson({
  id: "P3-19.2-T01", slug: "designing-and-tracing-recursion", minutes: 45, kind: "recursion-trace", title: ["Designing and tracing recursion", "Thiết kế và trace đệ quy"],
  question: ["How do a reachable base case and a smaller recursive call build a correct result?", "Base case reachable và recursive call nhỏ hơn xây result đúng như thế nào?"],
  opening: ["Factorial(4) winds through 4,3,2,1,0; the base value then returns through the calls in reverse order.", "Factorial(4) winding qua 4,3,2,1,0; base value rồi return ngược qua các call."],
  objectives: [["Identify base and recursive cases.", "Nhận diện base case và recursive case."], ["Prove progress toward the base.", "Chứng minh progress tới base."], ["Write typed recursive pseudocode.", "Viết giả mã recursive có type."], ["Separate call order from return order.", "Tách call order khỏi return order."]],
  prerequisites: [["Evaluate multiplication and list sums.", "Tính multiplication và list sum."], ["Read a function call and return value.", "Đọc function call và return value."]],
  glossary: [["recursion", "A subroutine invokes itself directly or indirectly.", "Subroutine gọi chính nó trực tiếp hoặc gián tiếp."], ["base case", "Reachable case that returns without another recursive call.", "Case reachable trả về không gọi recursive tiếp."], ["recursive case", "Reduces the problem and invokes the subroutine again.", "Giảm bài toán và gọi lại subroutine."], ["progress measure", "Quantity moving toward the base.", "Đại lượng tiến tới base."], ["unwinding", "Return values flow back to suspended callers.", "Return value chảy ngược về caller đang chờ."]],
  theory: [
    ["essential", ["Three essential features", "Ba feature thiết yếu"], ["A safe recursive function has a reachable base case, a recursive/general case and measurable progress toward the base.", "Recursive function an toàn có base case reachable, recursive/general case và progress đo được tới base."]],
    ["factorial-base", ["Canonical factorial base is zero", "Base factorial chuẩn là zero"], ["This source-aligned fixture defines 0!=1. Factorial(4) calls 4,3,2,1,0, so maximum depth is five frames.", "Fixture theo nguồn định nghĩa 0!=1. Factorial(4) gọi 4,3,2,1,0, nên depth tối đa năm frame."]],
    ["call-return", ["Wind then unwind", "Winding rồi unwinding"], ["Calls occur before the base result. Each suspended multiplication completes in reverse call order: 0,1,2,3,4.", "Call xảy ra trước base result. Mỗi multiplication đang chờ hoàn tất theo thứ tự call ngược: 0,1,2,3,4."]],
    ["recursion-code", ["Cambridge pseudocode", "Giả mã Cambridge"], ["The typed function tests the base before making the smaller call.", "Function có type xét base trước khi gọi nhỏ hơn."], factorialCode],
  ],
  visual: { title: ["Recursive call-and-return trace", "Trace call và return đệ quy"], introduction: ["Arguments, active rule, call order and returned values are shown separately.", "Argument, active rule, call order và return value hiển thị riêng."], task: ["Trace factorial and list sum, then block no-progress and unreachable-base fixtures.", "Trace factorial và list sum, rồi chặn fixture no-progress và unreachable-base."], conventions: [["Factorial base Number=0 returns 1.", "Base factorial Number=0 trả 1."], ["Each recursive argument must progress.", "Mỗi argument recursive phải tiến triển."], ["Unsafe known fixtures are diagnosed, not executed.", "Fixture unsafe đã biết được chẩn đoán, không execute."]] },
  worked: { title: ["Trace Factorial(4)", "Trace Factorial(4)"], prompt: ["Show call order 4→0 and return order 0→4.", "Trình bày call order 4→0 và return order 0→4."], steps: [
    ["domain", ["Declare Number as a non-negative INTEGER.", "Khai báo Number là INTEGER không âm."], ["The base/progress proof depends on the domain.", "Chứng minh base/progress phụ thuộc domain."], ["Input 4 is valid.", "Input 4 hợp lệ."]],
    ["call-4", ["4 is not base; call Factorial(3).", "4 không phải base; gọi Factorial(3)."], ["Number−1 progresses toward 0.", "Number−1 tiến tới 0."], ["Call order starts 4→3.", "Call order bắt đầu 4→3."]],
    ["calls-3-1", ["Call Factorial(2), then Factorial(1), then Factorial(0).", "Gọi Factorial(2), rồi Factorial(1), rồi Factorial(0)."], ["Every argument decreases by one.", "Mỗi argument giảm một."], ["Winding order 4,3,2,1,0; depth 5.", "Winding order 4,3,2,1,0; depth 5."]],
    ["base", ["At Number=0, return 1.", "Tại Number=0, trả 1."], ["The base performs no recursive call.", "Base không thực hiện recursive call."], ["Factorial(0)=1 starts unwinding.", "Factorial(0)=1 bắt đầu unwinding."], "RETURN 1"],
    ["unwind-1-2", ["Compute 1×1=1, then 2×1=2.", "Tính 1×1=1, rồi 2×1=2."], ["Each child result returns to its immediate caller.", "Mỗi child result trả về immediate caller."], ["Factorial(1)=1; Factorial(2)=2.", "Factorial(1)=1; Factorial(2)=2."]],
    ["unwind-3-4", ["Compute 3×2=6, then 4×6=24.", "Tính 3×2=6, rồi 4×6=24."], ["Unwinding is reverse call order.", "Unwinding là call order ngược."], ["Return order 0,1,2,3,4; final 24.", "Return order 0,1,2,3,4; final 24."]],
  ], result: ["Factorial(4)=24 with five frames and canonical base Number=0.", "Factorial(4)=24 với năm frame và base chuẩn Number=0."], selfCheck: ["Does the trace include the Number=0 frame before unwinding?", "Trace có gồm frame Number=0 trước unwinding không?"] },
  recognition: { cues: [["calls itself", "gọi chính nó"], ["base case", "base case"], ["smaller subproblem", "subproblem nhỏ hơn"]], distinguish: ["Near miss: calling another function is not necessarily recursion; a call chain must return to the same subroutine directly or indirectly.", "Dễ nhầm: gọi function khác không nhất thiết là recursion; call chain phải quay về cùng subroutine trực tiếp hoặc gián tiếp."], method: [["State domain and base result.", "Nêu domain và base result."], ["Name the progress measure.", "Nêu progress measure."], ["Write base before recursive call.", "Viết base trước recursive call."], ["List winding calls.", "Liệt kê winding calls."], ["Return in reverse order and combine.", "Return theo thứ tự ngược và combine."]] },
  misconceptions: [
    [["A base-case line is enough even if unreachable.", "Có dòng base case là đủ dù unreachable."], ["Prove the recursive argument can reach the base.", "Chứng minh argument recursive có thể tới base."], ["Does the measure move toward the condition?", "Measure có tiến tới condition không?"]],
    [["Factorial base is 1 in this lesson.", "Base factorial là 1 trong bài này."], ["The source-aligned base is Number=0 returning 1.", "Base theo nguồn là Number=0 trả 1."], ["Is there a Factorial(0) frame?", "Có frame Factorial(0) không?"]],
    [["Call and return order are identical.", "Call order và return order giống nhau."], ["Returns occur in reverse after the base.", "Return xảy ra ngược sau base."], ["Which caller receives the base result first?", "Caller nào nhận base result đầu?"]],
    [["Short recursive code uses constant stack space.", "Code recursive ngắn dùng stack space constant."], ["Each active call needs a separate frame.", "Mỗi call active cần frame riêng."], ["How does depth change with n?", "Depth đổi theo n thế nào?"]],
  ],
  checkpoints: [
    quiz("recall", ["What are the three essential recursion features?", "Ba feature thiết yếu của recursion là gì?"], ["Base, recursive case and progress", "Base, recursive case và progress"], ["Loop, queue and key", "Loop, queue và key"], ["Only a self-call", "Chỉ một self-call"], ["safe recursion must stop and reduce the problem", "recursion an toàn phải dừng và giảm bài toán"]),
    quiz("recognise", ["Which code is recursive?", "Code nào recursive?"], ["Factorial calls Factorial(Number−1)", "Factorial gọi Factorial(Number−1)"], ["Main calls Output once", "Main gọi Output một lần"], ["A FOR loop increments Index", "Vòng FOR tăng Index"], ["the subroutine invokes itself on a smaller argument", "subroutine gọi chính nó với argument nhỏ hơn"]),
    quiz("predict", ["After Factorial(2) calls Factorial(1), next call?", "Sau Factorial(2) gọi Factorial(1), call tiếp?"], ["Factorial(0)", "Factorial(0)"], ["Factorial(2)", "Factorial(2)"], ["Factorial(−1)", "Factorial(−1)"], ["Number−1 reaches the zero base", "Number−1 tới base zero"]),
    quiz("trace", ["Maximum frames for Factorial(4) under this contract?", "Số frame tối đa cho Factorial(4) theo contract này?"], ["5", "5"], ["4", "4"], ["6", "6"], ["frames exist for 4,3,2,1,0", "có frame cho 4,3,2,1,0"]),
    quiz("write", ["Which base pseudocode is locked?", "Giả mã base nào đã khóa?"], ["IF Number = 0 THEN RETURN 1", "IF Number = 0 THEN RETURN 1"], ["IF Number = 1 THEN RETURN 0", "IF Number = 1 THEN RETURN 0"], ["RETURN Factorial(Number)", "RETURN Factorial(Number)"], ["0! is 1 and the base makes no further call", "0! là 1 và base không gọi tiếp"]),
    quiz("transfer", ["A function calls itself with the same positive argument. Decision?", "Function gọi chính nó với cùng argument dương. Quyết định?"], ["Block: no progress toward base", "Chặn: không progress tới base"], ["Run indefinitely as valid", "Chạy vô hạn như hợp lệ"], ["Treat as iteration", "Coi là iteration"], ["known no-progress recursion is unsafe", "recursion no-progress đã biết là unsafe"], true),
  ],
  recall: { prompt: ["Explain Factorial(4) from design through trace.", "Giải thích Factorial(4) từ design tới trace."], points: [["Base Number=0 returns 1.", "Base Number=0 trả 1."], ["Recursive case decreases by one.", "Recursive case giảm một."], ["Calls 4→0; returns 0→4; result 24.", "Calls 4→0; returns 0→4; result 24."]] },
  takeaways: [["A base case must be reachable.", "Base case phải reachable."], ["Progress must be measurable.", "Progress phải đo được."], ["Winding and unwinding orders differ.", "Order winding và unwinding khác nhau."]], related: ["call-stacks-and-unwinding", "time-and-space-complexity"],
  book: "Chapter 19, printed pp490–493 / PDF pp506–509: recursion; factorial base 0 and trace", papers: [...paperPair("s23-31", "Cambridge 9618/31 — May/June 2023", "Question 12, pp11–12", "Question 12, pp9–10"), ...paperPair("w25-33", "Cambridge 9618/33 — October/November 2025", "Question 11, p9", "Question 11, p13")],
});

const callStack = makeLesson({
  id: "P3-19.2-T02", slug: "call-stacks-and-unwinding", minutes: 40, kind: "call-stack-unwinding", title: ["Call stacks and unwinding", "Call stack và unwinding"],
  question: ["What must the compiler/runtime preserve for every recursive call, and how is it restored?", "Compiler/runtime phải giữ gì cho mỗi recursive call và khôi phục thế nào?"],
  opening: ["Each Factorial invocation needs its own argument, local result and resume point while a child call runs.", "Mỗi invocation Factorial cần argument, local result và resume point riêng khi child call chạy."],
  objectives: [["Model one frame per invocation.", "Mô hình một frame mỗi invocation."], ["Trace push order to the zero base.", "Trace push order tới base zero."], ["Trace LIFO pop and returned-value flow.", "Trace pop LIFO và luồng return value."], ["Distinguish runtime frames from a program stack ADT.", "Phân biệt runtime frame với stack ADT trong chương trình."]],
  prerequisites: [["Trace Factorial(4) with base zero.", "Trace Factorial(4) với base zero."], ["Understand LIFO stack behavior.", "Hiểu behavior stack LIFO."]],
  glossary: [["call frame", "Per-invocation stored arguments, locals and resume point.", "Argument, local và resume point lưu riêng cho mỗi invocation."], ["return address", "Where the caller resumes after the child returns.", "Nơi caller resume sau khi child return."], ["winding", "Push frames while calls deepen.", "Push frame khi call sâu dần."], ["unwinding", "Pop frames as results return.", "Pop frame khi result return."], ["stack overflow", "Failure when call depth exceeds available stack capacity.", "Failure khi call depth vượt capacity stack có sẵn."]],
  theory: [
    ["separate-frames", ["Every invocation has separate state", "Mỗi invocation có state riêng"], ["Arguments and locals are not shared rows. Each frame also preserves a resume point/return address for its caller.", "Argument và local không dùng chung row. Mỗi frame còn giữ resume point/return address cho caller."]],
    ["push", ["Calls push in winding order", "Call push theo winding order"], ["Factorial(4) pushes frames 4,3,2,1,0. The base-zero contract therefore reaches maximum depth five.", "Factorial(4) push frame 4,3,2,1,0. Contract base-zero vì vậy đạt depth tối đa năm."]],
    ["pop", ["Returns pop in LIFO order", "Return pop theo LIFO"], ["Frame 0 returns 1 first. Frames 1,2,3,4 resume, combine the child result and pop in that order.", "Frame 0 trả 1 trước. Frame 1,2,3,4 resume, combine child result và pop theo order đó."]],
    ["boundary", ["Syllabus-level abstraction", "Abstraction mức syllabus"], ["The workbench shows compiler/runtime state conceptually, not a universal ABI or physical memory layout. A manual Stack array is a different program object.", "Workbench hiển thị state compiler/runtime theo concept, không phải ABI phổ quát hoặc layout memory vật lý. Mảng Stack thủ công là object chương trình khác."], factorialCode],
  ],
  visual: { title: ["Frame-stack unwinding workbench", "Bàn unwinding frame-stack"], introduction: ["Frames show argument, locals, resume point and returned child value at every push/pop.", "Frame hiển thị argument, local, resume point và child value trả về ở mỗi push/pop."], task: ["Wind Factorial(4) through frame 0, then predict each LIFO return.", "Wind Factorial(4) tới frame 0, rồi dự đoán mỗi return LIFO."], conventions: [["Canonical base Number=0.", "Base chuẩn Number=0."], ["Push order 4,3,2,1,0; max depth 5.", "Push order 4,3,2,1,0; max depth 5."], ["Pop/resume order 0,1,2,3,4.", "Pop/resume order 0,1,2,3,4."]] },
  worked: { title: ["Wind and unwind Factorial(4)", "Wind và unwind Factorial(4)"], prompt: ["Track argument, resume expression and returned value in every frame.", "Theo dõi argument, resume expression và return value trong mọi frame."], steps: [
    ["push-4", ["Push frame F4 with Number=4.", "Push frame F4 với Number=4."], ["The caller must resume after Factorial(3).", "Caller phải resume sau Factorial(3)."], ["Resume expression is 4×child.", "Resume expression là 4×child."]],
    ["push-3", ["Push F3 above F4.", "Push F3 trên F4."], ["F4 remains suspended with its own state.", "F4 vẫn suspended với state riêng."], ["F3 stores 3×child; depth 2.", "F3 lưu 3×child; depth 2."]],
    ["push-2-1", ["Push F2 then F1.", "Push F2 rồi F1."], ["Each recursive call gets a new frame.", "Mỗi recursive call có frame mới."], ["Stack bottom→top F4,F3,F2,F1.", "Stack bottom→top F4,F3,F2,F1."]],
    ["push-base", ["Push F0 and return base value 1.", "Push F0 và trả base value 1."], ["Number=0 makes no child call.", "Number=0 không gọi child."], ["Maximum depth 5; pop F0 with result 1.", "Depth tối đa 5; pop F0 với result 1."]],
    ["unwind-1-2", ["Resume F1:1×1=1; pop. Resume F2:2×1=2; pop.", "Resume F1:1×1=1; pop. Resume F2:2×1=2; pop."], ["LIFO returns to the immediate caller.", "LIFO return tới immediate caller."], ["Child result entering F3 is 2.", "Child result đi vào F3 là 2."]],
    ["unwind-3-4", ["Resume F3:3×2=6; then F4:4×6=24.", "Resume F3:3×2=6; rồi F4:4×6=24."], ["Each frame combines then leaves the stack.", "Mỗi frame combine rồi rời stack."], ["Stack empty after final return; result 24.", "Stack empty sau final return; result 24."]],
  ], result: ["Five separate frames wind 4→0 and unwind 0→4 to return 24.", "Năm frame riêng wind 4→0 và unwind 0→4 để trả 24."], selfCheck: ["Is frame F0 present, and does every returned value go first to its immediate caller?", "Frame F0 có hiện diện và mỗi return value có đi trước tới immediate caller không?"] },
  recognition: { cues: [["compiler/runtime stack", "stack compiler/runtime"], ["return address/local variables", "return address/local variable"], ["winding/unwinding", "winding/unwinding"]], distinguish: ["Near miss: the manual stack lesson stores application values; the call stack stores invocation frames created by runtime execution.", "Dễ nhầm: bài stack thủ công lưu application value; call stack lưu invocation frame do runtime execution tạo."], method: [["List call arguments.", "Liệt kê call argument."], ["Create one frame per invocation.", "Tạo một frame mỗi invocation."], ["Record resume point and locals.", "Ghi resume point và local."], ["Push to the base frame.", "Push tới base frame."], ["Pop in reverse and pass results to callers.", "Pop theo thứ tự ngược và truyền result tới caller."]] },
  misconceptions: [
    [["All calls share one Number variable.", "Mọi call dùng chung một variable Number."], ["Each invocation has its own argument/local frame.", "Mỗi invocation có frame argument/local riêng."], ["Which frame owns this Number?", "Frame nào sở hữu Number này?"]],
    [["Omit the zero frame.", "Bỏ frame zero."], ["The canonical base is Number=0, so F0 must be pushed.", "Base chuẩn là Number=0 nên F0 phải được push."], ["Where is base tested true?", "Base đúng ở đâu?"]],
    [["Pop in call order.", "Pop theo call order."], ["LIFO pops the most recent frame first.", "LIFO pop frame mới nhất trước."], ["Which frame is currently on top?", "Frame nào hiện ở top?"]],
    [["The diagram is a universal physical layout.", "Sơ đồ là layout vật lý phổ quát."], ["Treat it as a syllabus-level runtime abstraction.", "Coi đây là abstraction runtime mức syllabus."], ["Which details depend on language/ABI?", "Detail nào phụ thuộc language/ABI?"]],
  ],
  checkpoints: [
    quiz("recall", ["What does one call frame preserve?", "Một call frame giữ gì?"], ["Arguments, locals and resume point", "Argument, local và resume point"], ["Only final output", "Chỉ final output"], ["Every program array", "Mọi array chương trình"], ["each invocation needs separate suspended state", "mỗi invocation cần state suspended riêng"]),
    quiz("recognise", ["Which wording identifies call-stack behavior?", "Wording nào nhận diện call-stack?"], ["push return addresses and locals; unwind LIFO", "push return address và local; unwind LIFO"], ["enqueue at rear", "enqueue tại rear"], ["lookup by key", "lookup bằng key"], ["compiler recursion preserves frames", "compiler recursion giữ frame"]),
    quiz("predict", ["Frames F4,F3,F2 are active; next recursive argument?", "Frame F4,F3,F2 active; argument recursive tiếp?"], ["1", "1"], ["3", "3"], ["0 immediately", "0 ngay"], ["Number decreases from 2 to 1", "Number giảm từ 2 xuống 1"]),
    quiz("trace", ["What is max depth for Factorial(4) with base 0?", "Max depth của Factorial(4) với base 0?"], ["5", "5"], ["4", "4"], ["24", "24"], ["frames are 4,3,2,1,0", "frame là 4,3,2,1,0"]),
    quiz("write", ["Which unwind order is correct?", "Unwind order nào đúng?"], ["F0,F1,F2,F3,F4", "F0,F1,F2,F3,F4"], ["F4,F3,F2,F1,F0", "F4,F3,F2,F1,F0"], ["F0,F4,F1,F3,F2", "F0,F4,F1,F3,F2"], ["LIFO returns in reverse call order", "LIFO return theo call order ngược"]),
    quiz("transfer", ["Recursive calls do not progress and keep pushing. Main risk?", "Recursive call không progress và tiếp tục push. Rủi ro chính?"], ["Stack overflow", "Stack overflow"], ["Queue underflow", "Queue underflow"], ["Dictionary duplicate", "Dictionary duplicate"], ["unbounded call depth exhausts stack capacity", "call depth không giới hạn làm cạn capacity stack"] , true),
  ],
  recall: { prompt: ["Explain compiler/runtime support for Factorial(4).", "Giải thích hỗ trợ compiler/runtime cho Factorial(4)."], points: [["Push separate frames 4,3,2,1,0.", "Push frame riêng 4,3,2,1,0."], ["Base F0 returns 1.", "Base F0 trả 1."], ["Pop 0,1,2,3,4 and resume each multiplication.", "Pop 0,1,2,3,4 và resume mỗi multiplication."]] },
  takeaways: [["Every invocation has separate state.", "Mỗi invocation có state riêng."], ["Base zero gives five frames for Factorial(4).", "Base zero tạo năm frame cho Factorial(4)."], ["Unwinding is LIFO.", "Unwinding là LIFO."]], related: ["designing-and-tracing-recursion", "stack"],
  book: "Chapter 19, printed pp491 and 494 / PDF pp507 and 510: factorial base-zero trace and compiler stack", papers: [...paperPair("w23-32", "Cambridge 9618/32 — October/November 2023", "Question 9(c), p9", "Question 9(c), p7"), ...paperPair("w25-32", "Cambridge 9618/32 — October/November 2025", "Question 12(b), p12", "Question 12(b), p17")],
});

const lessons = [linear, binary, bubble, insertion, stack, queue, linked, tree, dictionary, adtImplementation, complexity, recursion, callStack];
const expectedKinds = ["linear-search", "binary-search", "bubble-sort", "insertion-sort", "stack-adt", "queue-adt", "linked-list", "binary-tree", "dictionary", "adt-implementation", "complexity-comparator", "recursion-trace", "call-stack-unwinding"];
const requiredCommands = ["write", "trace", "explain", "compare", "justify"];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function validateLocalized(value, path) {
  assert(value && typeof value.en === "string" && value.en.trim(), `${path}.en missing`);
  assert(value && typeof value.vi === "string" && value.vi.trim(), `${path}.vi missing`);
}
function validateLesson(lesson, index) {
  assert(lesson.schemaVersion === 1, `${lesson.slug}: schemaVersion`);
  assert(lesson.topicId === `P3-19.${index < 11 ? "1" : "2"}-T${String(index < 11 ? index + 1 : index - 10).padStart(2, "0")}`, `${lesson.slug}: topicId/order`);
  assert(lesson.visual.kind === expectedKinds[index], `${lesson.slug}: visual.kind`);
  assert(lesson.theory.length >= 4, `${lesson.slug}: needs >=4 theory blocks`);
  assert(lesson.workedExample.steps.length >= 6, `${lesson.slug}: needs >=6 worked steps`);
  assert(lesson.checkpoints.length >= 6, `${lesson.slug}: needs >=6 checkpoints`);
  assert(lesson.misconceptions.length >= 4, `${lesson.slug}: needs >=4 misconceptions`);
  assert(lesson.misconceptions.every((item) => item.selfCheck), `${lesson.slug}: every misconception needs selfCheck`);
  assert(JSON.stringify(lesson.recognition.commandWords.map((item) => item.command)) === JSON.stringify(requiredCommands), `${lesson.slug}: command words/order`);
  const sources = new Set(lesson.sources.map((source) => source.id));
  for (const block of lesson.theory) {
    validateLocalized(block.title, `${lesson.slug}.theory.${block.id}.title`);
    block.paragraphs.forEach((paragraph, paragraphIndex) => validateLocalized(paragraph, `${lesson.slug}.theory.${block.id}.paragraphs.${paragraphIndex}`));
    block.sourceIds.forEach((sourceId) => assert(sources.has(sourceId), `${lesson.slug}: undefined source ${sourceId}`));
  }
  for (const item of lesson.workedExample.steps) {
    for (const field of ["action", "why", "result", "check"]) validateLocalized(item[field], `${lesson.slug}.step.${item.id}.${field}`);
  }
  for (const item of lesson.checkpoints) {
    assert(item.choices.length >= 3, `${lesson.slug}.${item.id}: choices`);
    assert(item.choices.filter((option) => option.id === item.correctChoiceId).length === 1, `${lesson.slug}.${item.id}: one correct choice`);
    validateLocalized(item.prompt, `${lesson.slug}.${item.id}.prompt`);
    validateLocalized(item.explanation, `${lesson.slug}.${item.id}.explanation`);
    for (const option of item.choices) {
      validateLocalized(option.label, `${lesson.slug}.${item.id}.${option.id}.label`);
      validateLocalized(option.feedback, `${lesson.slug}.${item.id}.${option.id}.feedback`);
      assert(option.feedback.en.length > 18 && option.feedback.vi.length > 12, `${lesson.slug}.${item.id}.${option.id}: feedback too generic`);
    }
  }
  const serial = JSON.stringify(lesson);
  assert(!/[A-Z]:\\|sha256|build id|PASS_FOR_IMPLEMENTATION/i.test(serial), `${lesson.slug}: internal metadata leaked`);
}

assert(lessons.length === 13, "Section 19 must contain 13 lessons");
assert(new Set(lessons.map((lesson) => lesson.slug)).size === 13, "Section 19 slugs must be unique");
lessons.forEach(validateLesson);
await mkdir(output, { recursive: true });
for (const lesson of lessons) {
  const path = join(output, `${lesson.slug}.json`);
  const text = `${JSON.stringify(lesson, null, 2)}\n`;
  JSON.parse(text);
  await writeFile(path, text, "utf8");
  console.log(`${lesson.topicId} ${lesson.slug} ${createHash("sha256").update(text).digest("hex")}`);
}
console.log(`PASS section19-content lessons=${lessons.length} theory>=4 worked>=6 checkpoints>=6 misconceptions>=4 commands=${requiredCommands.join(",")}`);

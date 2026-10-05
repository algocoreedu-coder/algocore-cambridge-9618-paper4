import type { Localized } from "./catalog";

export type ComputationalVisualKind =
  | "linear-search"
  | "binary-search"
  | "bubble-sort"
  | "insertion-sort"
  | "stack-adt"
  | "queue-adt"
  | "linked-list"
  | "binary-tree"
  | "dictionary"
  | "adt-implementation"
  | "complexity-comparator"
  | "recursion-trace"
  | "call-stack-unwinding";

export interface ComputationalStep<S> {
  readonly id: string;
  readonly event: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly rule: Localized;
  readonly activeRule: string;
  readonly outcome: Localized;
  readonly codeLine: string;
  readonly before: S;
  readonly after: S;
}

export interface ComputationalTrace<S> {
  readonly fixtureId: string;
  readonly scenario: string;
  readonly initial: S;
  readonly final: S;
  readonly convention: Localized;
  readonly pseudocode: readonly string[];
  readonly steps: readonly ComputationalStep<S>[];
}

const L = (en: string, vi: string): Localized => ({ en, vi });
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const deepFreeze = <T,>(value: T): T => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(item => deepFreeze(item));
  }
  return value;
};
const requireScenario = <T extends string>(value: string, fixtures: Readonly<Record<T, unknown>>): T => {
  if (!(value in fixtures)) throw new RangeError(`Unknown scenario: ${value}`);
  return value as T;
};
const semanticLine = (event: string, codeLine: string): string => {
  const text = codeLine.toLowerCase();
  if (event === "push-frame") return "FRAME-PUSH"; if (event === "base-return") return "FRAME-BASE-RETURN"; if (event === "unwind-return") return "FRAME-UNWIND";
  if (event === "save-link") return text.includes("head") ? "LL-I01" : "LL-I04"; if (event === "write-node") return text.includes("oldhead") ? "LL-I02" : "LL-I05"; if (event === "relink") return text.includes("head ← new") ? "LL-I03" : text.includes("anchor") ? "LL-I06" : "LL-D02"; if (event === "clear-node") return "LL-D03";
  if (event === "insert" && text.includes("root")) return "BST-I01"; if (event === "insert") return "BST-I06"; if (event === "compare" && text.includes("return")) return "BST-F03"; if (event === "compare" && text.includes("left")) return "BST-F04"; if (event === "compare" && text.includes("right")) return "BST-F05";
  if (event === "enter-call") return text.includes("return base") ? (text.includes("0") ? "SUM-02" : "FAC-02") : text.includes("childresult") && text.includes("sum") ? "SUM-04" : "FAC-04";
  if (event === "scan") return "DCT-03"; if (event === "resolve") return text.includes("append") ? "DCT-06" : text.includes("entry") ? "DCT-08" : text.includes("return") ? "DCT-03" : "DCT-04";
  if (text.includes("data[index] = target")) return "LS-03"; if (text === "return -1") return "LS-06"; if (text.includes("index ← 0")) return "LS-01";
  if (text.includes("low ← 0")) return "BS-01"; if (text.includes("low ← middle + 1")) return "BS-05"; if (text.includes("high ← middle - 1")) return "BS-06"; if (text.includes("return middle")) return "BS-04";
  if (text.includes("boundary")) return "BUB-01"; if (text.includes("swap")) return "BUB-05"; if (text.includes("exit")) return "BUB-07";
  if (text.includes("key ←")) return "INS-02"; if (text.includes("data[j + 1] ← data[j]")) return "INS-05"; if (text.includes("data[j + 1] ← key")) return "INS-07";
  if (event === "push") return "STK-03"; if (event === "pop") return "STK-06"; if (event === "peek") return "STK-09"; if (event === "enqueue") return "QUE-05"; if (event === "dequeue") return "QUE-10";
  return event;
};
const step = <S,>(id: string, title: Localized, rule: Localized, outcome: Localized, codeLine: string, before: S, after: S, event = id, activeRule = semanticLine(event, codeLine)): ComputationalStep<S> => ({ id, event, title, action: title, why: rule, rule, activeRule, outcome, codeLine, before: copy(before), after: copy(after) });
const finishTrace = <S,>(scenario: string, convention: Localized, pseudocode: readonly string[], steps: readonly ComputationalStep<S>[]): ComputationalTrace<S> => deepFreeze({ fixtureId: scenario, scenario, convention, pseudocode: [...pseudocode], initial: copy(steps[0].before), final: copy(steps[steps.length - 1].after), steps: [...steps] });

export type LinearScenario = "first" | "middle" | "last" | "duplicate-first-match" | "missing" | "empty";
const linearFixtures: Record<LinearScenario, { values: number[]; target: number }> = {
  first: { values: [8, 3, 5, 3, 9], target: 8 }, middle: { values: [8, 3, 5, 3, 9], target: 5 }, last: { values: [8, 3, 5, 3, 9], target: 9 },
  "duplicate-first-match": { values: [8, 3, 5, 3, 9], target: 3 }, missing: { values: [8, 3, 5, 3, 9], target: 7 }, empty: { values: [], target: 7 },
};
export interface LinearSearchState { values: number[]; target: number; currentIndex: number | null; checkedIndices: number[]; comparisons: number; resultIndex: number | null; status: "ready" | "searching" | "found" | "missing"; }
export function linearSearchTrace(scenarioInput: string): ComputationalTrace<LinearSearchState> {
  const scenario = requireScenario(scenarioInput, linearFixtures), fixture = linearFixtures[scenario];
  let state: LinearSearchState = { values: [...fixture.values], target: fixture.target, currentIndex: null, checkedIndices: [], comparisons: 0, resultIndex: null, status: "ready" };
  const steps: ComputationalStep<LinearSearchState>[] = [step("ready", L("Declare the valid range", "Khai báo miền chỉ số hợp lệ"), L("Use zero-based indices and return the first match.", "Dùng chỉ số bắt đầu từ 0 và trả về kết quả khớp đầu tiên."), fixture.values.length ? L("Start at index 0.", "Bắt đầu tại chỉ số 0.") : L("The empty range contains no target.", "Miền rỗng không chứa mục tiêu."), "index ← 0", state, state)];
  if (fixture.values.length === 0) {
    const before = state; state = { ...state, resultIndex: -1, status: "missing" };
    steps.push(step("empty-return", L("Return not found for the empty range", "Trả về không tìm thấy cho miền rỗng"), L("The loop guard is false before the first comparison.", "Điều kiện vòng lặp sai trước phép so sánh đầu tiên."), L("Return -1 with zero comparisons.", "Trả về -1 với không phép so sánh nào."), "RETURN -1", before, state, "terminal", "LS-06"));
  }
  for (let index = 0; index < fixture.values.length; index += 1) {
    if (state.status === "found") break;
    const before = state, found = fixture.values[index] === fixture.target;
    const missing = !found && index === fixture.values.length - 1;
    state = { ...state, currentIndex: index, checkedIndices: [...state.checkedIndices, index], comparisons: state.comparisons + 1, resultIndex: found ? index : missing ? -1 : null, status: found ? "found" : missing ? "missing" : "searching" };
    steps.push(step(`compare-${index}`, L(`Compare index ${index}`, `So sánh chỉ số ${index}`), L("Check the current item before advancing.", "Kiểm tra phần tử hiện tại trước khi tiến chỉ số."), found ? L(`Found the first match at index ${index}.`, `Tìm thấy kết quả khớp đầu tiên tại chỉ số ${index}.`) : state.status === "missing" ? L("All valid positions have been checked.", "Mọi vị trí hợp lệ đã được kiểm tra.") : L("Not equal, so continue to the next index.", "Không bằng nên tiếp tục sang chỉ số kế tiếp."), "IF Data[index] = Target THEN RETURN index", before, state, "compare", found ? "LS-04" : "LS-05"));
  }
  return finishTrace(scenario, L("Zero-based indices; duplicate policy: return the first match.", "Chỉ số bắt đầu từ 0; nếu trùng lặp, trả về kết quả khớp đầu tiên."), ["FOR Index ← 0 TO LENGTH(Data) - 1", "  IF Data[Index] = Target THEN", "    RETURN Index", "  ENDIF", "NEXT Index", "RETURN -1"], steps);
}

export type BinaryScenario = "middle" | "first" | "last" | "duplicate-midpoint-match" | "missing" | "empty" | "singleton-found" | "singleton-missing" | "unsorted-near-miss";
const binaryFixtures: Record<BinaryScenario, { values: number[]; target: number }> = {
  middle: { values: [3, 7, 11, 18, 24, 31, 42], target: 18 }, first: { values: [3, 7, 11, 18, 24, 31, 42], target: 3 }, last: { values: [3, 7, 11, 18, 24, 31, 42], target: 42 },
  "duplicate-midpoint-match": { values: [2, 4, 4, 4, 8], target: 4 }, missing: { values: [2, 5, 8, 12, 16, 23], target: 19 }, empty: { values: [], target: 7 },
  "singleton-found": { values: [7], target: 7 }, "singleton-missing": { values: [7], target: 5 }, "unsorted-near-miss": { values: [3, 11, 7, 18], target: 7 },
};
export interface BinarySearchState { values: number[]; target: number; low: number; high: number; middle: number | null; comparedValue: number | null; discarded: number[]; comparisons: number; resultIndex: number | null; status: "ready" | "searching" | "found" | "missing" | "blocked-unsorted"; decision: "none" | "equal" | "discard-left" | "discard-right" | "precondition-failed"; }
export function binarySearchTrace(scenarioInput: string): ComputationalTrace<BinarySearchState> {
  const scenario = requireScenario(scenarioInput, binaryFixtures), fixture = binaryFixtures[scenario], sorted = fixture.values.every((value, index) => index === 0 || fixture.values[index - 1] <= value);
  let state: BinarySearchState = { values: [...fixture.values], target: fixture.target, low: 0, high: fixture.values.length - 1, middle: null, comparedValue: null, discarded: [], comparisons: 0, resultIndex: null, status: "ready", decision: "none" };
  const steps = [step("ready", L("Check the precondition", "Kiểm tra điều kiện tiên quyết"), L("Binary search requires data sorted in ascending order.", "Binary search yêu cầu dữ liệu được sắp xếp tăng dần."), !sorted ? L("Blocked: sort the data or use linear search.", "Đã chặn: hãy sắp xếp dữ liệu hoặc dùng linear search.") : fixture.values.length ? L("The active window is the whole array.", "Cửa sổ hoạt động là toàn bộ mảng.") : L("low > high, so the target is missing.", "low > high nên không tìm thấy mục tiêu."), "low ← 0; high ← LENGTH(Data) - 1", state, state)];
  if (!sorted) {
    const before = state; state = { ...state, resultIndex: -1, status: "blocked-unsorted", decision: "precondition-failed" };
    steps.push(step("reject-unsorted", L("Reject unsorted input", "Từ chối dữ liệu chưa sắp xếp"), L("The sorted-input precondition fails before any midpoint is calculated.", "Điều kiện dữ liệu đã sắp xếp không thỏa trước khi tính midpoint."), L("No search comparison runs; sort first or use linear search.", "Không chạy phép so sánh tìm kiếm; hãy sắp xếp trước hoặc dùng linear search."), "Require ascending order before search", before, state, "terminal", "BS-01"));
    return finishTrace(scenario, L("Zero-based bounds; middle = (low + high) DIV 2.", "Cận bắt đầu từ 0; middle = (low + high) DIV 2."), binaryPseudocode, steps);
  }
  if (fixture.values.length === 0) {
    const before = state; state = { ...state, resultIndex: -1, status: "missing" };
    steps.push(step("empty-window", L("Stop at the empty window", "Dừng tại cửa sổ rỗng"), L("The initial bounds already satisfy low > high.", "Hai cận ban đầu đã thỏa low > high."), L("Return -1 with zero comparisons.", "Trả về -1 với không phép so sánh nào."), "RETURN -1", before, state, "terminal", "BS-07"));
    return finishTrace(scenario, L("Zero-based bounds; middle = (low + high) DIV 2.", "Cận bắt đầu từ 0; middle = (low + high) DIV 2."), binaryPseudocode, steps);
  }
  while (state.low <= state.high && state.status !== "found") {
    const before = state, middle = Math.floor((state.low + state.high) / 2), comparedValue = fixture.values[middle];
    let low = state.low, high = state.high, decision: BinarySearchState["decision"], status: BinarySearchState["status"] = "searching", resultIndex: number | null = null;
    if (comparedValue === fixture.target) { decision = "equal"; status = "found"; resultIndex = middle; }
    else if (comparedValue < fixture.target) { decision = "discard-left"; low = middle + 1; }
    else { decision = "discard-right"; high = middle - 1; }
    if (status !== "found" && low > high) status = "missing";
    const discarded = fixture.values.map((_, index) => index).filter(index => index < low || index > high);
    if (status === "missing") resultIndex = -1;
    state = { ...state, low, high, middle, comparedValue, discarded, comparisons: state.comparisons + 1, resultIndex, status, decision };
    steps.push(step(`compare-${state.comparisons}`, L(`Compare middle index ${middle}`, `So sánh chỉ số giữa ${middle}`), decision === "equal" ? L("The middle value equals the target.", "Giá trị giữa bằng mục tiêu.") : decision === "discard-left" ? L("Middle is smaller; the target can only be to the right.", "Giá trị giữa nhỏ hơn; mục tiêu chỉ có thể ở bên phải.") : L("Middle is larger; the target can only be to the left.", "Giá trị giữa lớn hơn; mục tiêu chỉ có thể ở bên trái."), status === "found" ? L(`Return index ${middle}.`, `Trả về chỉ số ${middle}.`) : status === "missing" ? L("The new bounds cross, so the target is missing.", "Hai cận mới đã vượt nhau nên không tìm thấy mục tiêu.") : L(`New active window: ${low}..${high}.`, `Cửa sổ hoạt động mới: ${low}..${high}.`), decision === "discard-left" ? "low ← middle + 1" : decision === "discard-right" ? "high ← middle - 1" : "RETURN middle", before, state));
  }
  return finishTrace(scenario, L("Ascending sorted data; zero-based inclusive bounds; midpoint rounds down with DIV.", "Dữ liệu tăng dần; hai cận bao gồm; midpoint làm tròn xuống bằng DIV."), binaryPseudocode, steps);
}
const binaryPseudocode = ["low ← 0", "high ← LENGTH(Data) - 1", "WHILE low <= high", "  middle ← (low + high) DIV 2", "  IF Data[middle] = Target THEN RETURN middle", "  IF Data[middle] < Target THEN low ← middle + 1", "  IF Data[middle] > Target THEN high ← middle - 1", "ENDWHILE", "RETURN -1"];

export type SortScenario = "mixed" | "sorted" | "reverse" | "duplicates" | "empty" | "singleton";
const bubbleFixtures: Record<SortScenario, number[]> = { mixed: [5, 1, 4, 2, 8], sorted: [1, 2, 3, 4, 5], reverse: [5, 4, 3, 2, 1], duplicates: [4, 2, 4, 1, 2], empty: [], singleton: [7] };
const insertionFixtures: Record<SortScenario, number[]> = { mixed: [5, 2, 4, 6, 1], sorted: [1, 2, 3, 4, 5], reverse: [5, 4, 3, 2, 1], duplicates: [4, 2, 4, 1, 2], empty: [], singleton: [7] };
export interface BubbleSortState { values: number[]; pair: [number, number] | null; pass: number; completedFrom: number; comparisons: number; swaps: number; swappedThisPass: boolean; decision: "ready" | "keep" | "swap" | "pass-complete" | "sorted"; }
export function bubbleSortTrace(scenarioInput: string): ComputationalTrace<BubbleSortState> {
  const scenario = requireScenario(scenarioInput, bubbleFixtures); let state: BubbleSortState = { values: [...bubbleFixtures[scenario]], pair: null, pass: 0, completedFrom: bubbleFixtures[scenario].length, comparisons: 0, swaps: 0, swappedThisPass: false, decision: "ready" };
  const steps = [step("ready", L("Mark the unsorted range", "Đánh dấu miền chưa sắp xếp"), L("Compare adjacent items from left to right.", "So sánh các phần tử kề nhau từ trái sang phải."), state.values.length < 2 ? L("A collection with fewer than two items is already sorted.", "Tập có ít hơn hai phần tử đã được sắp xếp.") : L("No position is guaranteed yet.", "Chưa có vị trí nào được bảo đảm."), "Boundary ← LENGTH(Data)", state, state)];
  if (state.values.length < 2) {
    const before = state; state = { ...state, completedFrom: 0, decision: "sorted" };
    steps.push(step("trivial-sorted", L("Finish without a pass", "Hoàn tất mà không cần lượt"), L("An empty or singleton collection has no adjacent pair out of order.", "Tập rỗng hoặc một phần tử không có cặp kề nào sai thứ tự."), L("The whole collection is complete and the completed boundary is 0.", "Toàn bộ tập đã hoàn tất và biên completed là 0."), "Boundary ← 0", before, state, "terminal", "BUB-01"));
  }
  for (let pass = 1; pass < state.values.length; pass += 1) {
    let swapped = false;
    for (let left = 0; left < state.values.length - pass; left += 1) {
      const before = state, values = [...state.values], shouldSwap = values[left] > values[left + 1];
      if (shouldSwap) [values[left], values[left + 1]] = [values[left + 1], values[left]];
      swapped ||= shouldSwap;
      state = { ...state, values, pair: [left, left + 1], pass, completedFrom: state.values.length - pass + 1, comparisons: state.comparisons + 1, swaps: state.swaps + (shouldSwap ? 1 : 0), swappedThisPass: swapped, decision: shouldSwap ? "swap" : "keep" };
      steps.push(step(`p${pass}-c${left}`, L(`Pass ${pass}: compare positions ${left} and ${left + 1}`, `Lượt ${pass}: so sánh vị trí ${left} và ${left + 1}`), L("Swap only when the left value is greater.", "Chỉ đổi chỗ khi giá trị bên trái lớn hơn."), shouldSwap ? L("The adjacent values swap; the multiset is preserved.", "Hai giá trị kề nhau đổi chỗ; tập giá trị được giữ nguyên.") : L("The pair remains in this order.", "Cặp này giữ nguyên thứ tự."), "IF Data[i] > Data[i + 1] THEN SWAP", before, state, "compare-swap", shouldSwap ? "BUB-05" : "BUB-04"));
    }
    const before = state, sorted = !swapped || pass === state.values.length - 1; state = { ...state, pair: null, completedFrom: sorted ? 0 : state.values.length - pass, decision: sorted ? "sorted" : "pass-complete" };
    steps.push(step(`pass-${pass}`, L(`Complete pass ${pass}`, `Hoàn tất lượt ${pass}`), L("The largest unsorted value is now at the right boundary.", "Giá trị lớn nhất trong miền chưa sắp xếp đã tới biên phải."), !swapped ? L("No swap occurred, so early exit is safe.", "Không có đổi chỗ nên có thể kết thúc sớm.") : L("Shrink the unsorted range by one.", "Thu nhỏ miền chưa sắp xếp một vị trí."), "IF NOT Swapped THEN EXIT", before, state, "pass-complete", !swapped ? "BUB-07" : "BUB-01"));
    if (!swapped) break;
  }
  return finishTrace(scenario, L("Ascending order; adjacent comparison; this fixture uses a no-swap early exit.", "Thứ tự tăng dần; so sánh kề nhau; fixture này kết thúc sớm khi không có đổi chỗ."), ["Boundary ← LENGTH(Data) - 1", "REPEAT", "  Swapped ← FALSE", "  FOR i ← 0 TO Boundary - 1", "    IF Data[i] > Data[i + 1] THEN", "      SWAP Data[i], Data[i + 1]", "      Swapped ← TRUE", "    ENDIF", "  NEXT i", "  Boundary ← Boundary - 1", "UNTIL NOT Swapped OR Boundary = 0"], steps);
}

export interface InsertionSortState { values: Array<number | null>; originalValues: number[]; sortedEnd: number; key: number | null; keyFrom: number | null; compareIndex: number | null; shiftedIndices: number[]; insertionIndex: number | null; comparisons: number; shifts: number; decision: "ready" | "save-key" | "compare" | "shift" | "insert" | "sorted"; }
export function insertionSortTrace(scenarioInput: string): ComputationalTrace<InsertionSortState> {
  const scenario = requireScenario(scenarioInput, insertionFixtures), original = [...insertionFixtures[scenario]]; let state: InsertionSortState = { values: [...original], originalValues: original, sortedEnd: original.length ? 0 : -1, key: null, keyFrom: null, compareIndex: null, shiftedIndices: [], insertionIndex: null, comparisons: 0, shifts: 0, decision: "ready" };
  const steps = [step("ready", L("Mark the sorted prefix", "Đánh dấu prefix đã sắp xếp"), L("A one-item prefix is sorted.", "Prefix có một phần tử là đã sắp xếp."), original.length < 2 ? L("No insertion is required.", "Không cần chèn.") : L("The first key will come from index 1.", "Key đầu tiên sẽ lấy từ chỉ số 1."), "FOR i ← 1 TO LENGTH(Data) - 1", state, state)];
  if (original.length < 2) {
    const before = state; state = { ...state, decision: "sorted" };
    steps.push(step("trivial-sorted", L("Finish at the loop guard", "Hoàn tất tại điều kiện vòng lặp"), L("There is no unsorted item at index 1.", "Không có phần tử chưa sắp xếp tại chỉ số 1."), L("Return the unchanged empty or singleton collection.", "Trả về tập rỗng hoặc một phần tử không đổi."), "No i in 1..LENGTH(Data) - 1", before, state, "terminal", "INS-01"));
  }
  for (let keyFrom = 1; keyFrom < original.length; keyFrom += 1) {
    const key = state.values[keyFrom] as number; let before = state, values = [...state.values]; values[keyFrom] = null;
    state = { ...state, values, key, keyFrom, compareIndex: keyFrom - 1, shiftedIndices: [], insertionIndex: null, decision: "save-key" };
    steps.push(step(`save-${keyFrom}`, L(`Save key ${key}`, `Lưu key ${key}`), L("Save the key before shifting so no value is overwritten.", "Lưu key trước khi dịch để không ghi đè mất dữ liệu."), L(`Position ${keyFrom} is a temporary gap.`, `Vị trí ${keyFrom} là ô trống tạm thời.`), "Key ← Data[i]", before, state, "save-key", "INS-02"));
    let compareIndex = keyFrom - 1;
    while (compareIndex >= 0) {
      const compared = state.values[compareIndex] as number; before = state;
      state = { ...state, compareIndex, comparisons: state.comparisons + 1, decision: "compare" };
      steps.push(step(`compare-${keyFrom}-${compareIndex}`, L(`Compare ${compared} with key ${key}`, `So sánh ${compared} với key ${key}`), L("Shift only when the prefix value is strictly greater than the key.", "Chỉ dịch khi giá trị trong prefix lớn hơn key một cách nghiêm ngặt."), compared > key ? L(`${compared} must move right.`, `${compared} phải dịch sang phải.`) : L("Stop shifting; equal values remain before the key.", "Dừng dịch; giá trị bằng key vẫn đứng trước key."), "WHILE j >= 0 AND Data[j] > Key", before, state, "compare", "INS-04"));
      if (compared <= key) break;
      before = state;
      values = [...state.values]; values[compareIndex + 1] = compared; values[compareIndex] = null;
      state = { ...state, values, compareIndex, shiftedIndices: [...state.shiftedIndices, compareIndex], shifts: state.shifts + 1, decision: "shift" };
      steps.push(step(`shift-${keyFrom}-${compareIndex}`, L(`Shift ${compared} right`, `Dịch ${compared} sang phải`), L("A sorted-prefix value greater than the saved key moves one place right.", "Giá trị trong prefix lớn hơn key đã lưu được dịch sang phải một vị trí."), L("The key remains safely stored outside the array.", "Key vẫn được lưu an toàn bên ngoài mảng."), "Data[j + 1] ← Data[j]", before, state, "shift", "INS-05"));
      compareIndex -= 1;
    }
    const insertionIndex = compareIndex + 1; before = state; values = [...state.values]; values[insertionIndex] = key;
    state = { ...state, values, sortedEnd: keyFrom, key: null, keyFrom: null, compareIndex: null, insertionIndex, decision: keyFrom === original.length - 1 ? "sorted" : "insert" };
    steps.push(step(`insert-${keyFrom}`, L(`Insert key at index ${insertionIndex}`, `Chèn key tại chỉ số ${insertionIndex}`), L("Insert after all greater values have shifted; equal values stay before the key.", "Chèn sau khi mọi giá trị lớn hơn đã dịch; giá trị bằng key vẫn đứng trước key."), L(`Indices 0..${keyFrom} are now sorted.`, `Các chỉ số 0..${keyFrom} giờ đã được sắp xếp.`), "Data[j + 1] ← Key", before, state, "insert-key", "INS-07"));
  }
  return finishTrace(scenario, L("Ascending stable insertion sort; the key is saved before shifts.", "Insertion sort tăng dần và ổn định; key được lưu trước khi dịch."), ["FOR i ← 1 TO LENGTH(Data) - 1", "  Key ← Data[i]", "  j ← i - 1", "  WHILE j >= 0 AND Data[j] > Key", "    Data[j + 1] ← Data[j]", "    j ← j - 1", "  ENDWHILE", "  Data[j + 1] ← Key", "NEXT i"], steps);
}

export type StackScenario = "normal" | "underflow" | "overflow" | "empty";
const stackFixtures: Record<StackScenario, { capacity: number; operations: Array<{ op: "PUSH" | "POP" | "PEEK"; value?: number }> }> = {
  normal: { capacity: 4, operations: [{ op: "PUSH", value: 10 }, { op: "PUSH", value: 20 }, { op: "POP" }, { op: "PUSH", value: 30 }, { op: "PEEK" }] },
  underflow: { capacity: 3, operations: [{ op: "POP" }, { op: "PEEK" }] }, overflow: { capacity: 2, operations: [{ op: "PUSH", value: 1 }, { op: "PUSH", value: 2 }, { op: "PUSH", value: 3 }] }, empty: { capacity: 3, operations: [] },
};
export interface StackState { cells: Array<number | null>; capacity: number; top: number; size: number; operation: string; returned: number | null; error: "UNDERFLOW" | "OVERFLOW" | null; committed: boolean | null; status: "empty" | "ready" | "full"; }
export function applyStackOperation(input: StackState, op: "PUSH" | "POP" | "PEEK", value?: number): StackState {
  if (op !== "PUSH" && op !== "POP" && op !== "PEEK") throw new RangeError(`Unknown stack operation: ${String(op)}`);
  const cells = [...input.cells];
  if (op === "PUSH") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) throw new RangeError("PUSH requires a finite integer value");
    if (input.top === input.capacity - 1) return deepFreeze({ ...input, cells, operation: op, returned: null, error: "OVERFLOW", committed: false });
    cells[input.top + 1] = value!; const top = input.top + 1, size = input.size + 1; return deepFreeze({ ...input, cells, top, size, operation: `${op} ${value}`, returned: null, error: null, committed: true, status: top === input.capacity - 1 ? "full" : "ready" });
  }
  if (input.top < 0) return deepFreeze({ ...input, cells, operation: op, returned: null, error: "UNDERFLOW", committed: false, status: "empty" });
  const returned = cells[input.top]; if (op === "PEEK") return deepFreeze({ ...input, cells, operation: op, returned, error: null, committed: true });
  cells[input.top] = null; const top = input.top - 1, size = input.size - 1; return deepFreeze({ ...input, cells, top, size, operation: op, returned, error: null, committed: true, status: top < 0 ? "empty" : "ready" });
}
export function stackTrace(scenarioInput: string): ComputationalTrace<StackState> {
  const scenario = requireScenario(scenarioInput, stackFixtures), fixture = stackFixtures[scenario]; let state: StackState = { cells: Array(fixture.capacity).fill(null), capacity: fixture.capacity, top: -1, size: 0, operation: "—", returned: null, error: null, committed: null, status: "empty" };
  const steps = [step("ready", L("Declare the stack convention", "Khai báo quy ước stack"), L("top = -1 means empty; the top item is at cells[top].", "top = -1 nghĩa là rỗng; phần tử trên cùng nằm tại cells[top]."), L(`Capacity is ${fixture.capacity} cells.`, `Sức chứa là ${fixture.capacity} ô.`), "Top ← -1", state, state)];
  if (fixture.operations.length === 0) {
    const before = state; state = { ...state, operation: "CHECK EMPTY", committed: false };
    steps.push(step("empty-terminal", L("Confirm the empty terminal state", "Xác nhận trạng thái kết thúc rỗng"), L("top = -1 is checked before any array access.", "top = -1 được kiểm tra trước mọi truy cập mảng."), L("No operation is scheduled, so the stack remains safely empty.", "Không có thao tác được lên lịch nên stack giữ nguyên trạng thái rỗng an toàn."), "IF Top = -1 THEN Empty", before, state, "terminal", "STK-04"));
  }
  fixture.operations.forEach((operation, index) => { const before = state; state = applyStackOperation(state, operation.op, operation.value); steps.push(step(`op-${index}`, L(operation.value === undefined ? operation.op : `${operation.op} ${operation.value}`, operation.value === undefined ? operation.op : `${operation.op} ${operation.value}`), operation.op === "PUSH" ? L("Guard first; increment top; then store the value.", "Kiểm tra điều kiện trước; tăng top; rồi lưu giá trị.") : L("Guard before access; POP clears the cell then decrements top.", "Kiểm tra trước khi truy cập; POP xóa ô rồi giảm top."), state.error ? L(`Safe ${state.error}: the complete state is preserved.`, `${state.error} an toàn: toàn bộ trạng thái được giữ nguyên.`) : state.returned !== null ? L(`Returned ${state.returned}.`, `Trả về ${state.returned}.`) : L("Stack state updated.", "Trạng thái stack đã cập nhật."), operation.op === "PUSH" ? "Top ← Top + 1; Stack[Top] ← Value" : operation.op === "POP" ? "Value ← Stack[Top]; Stack[Top] ← NULL; Top ← Top - 1" : "Value ← Stack[Top]", before, state, operation.op.toLowerCase(), state.error ? operation.op === "PUSH" ? "STK-01" : operation.op === "POP" ? "STK-04" : "STK-08" : operation.op === "PUSH" ? "STK-03" : operation.op === "POP" ? "STK-06" : "STK-09")); });
  return finishTrace(scenario, L(`Fixed array capacity ${fixture.capacity}; bottom index 0; top = -1 when empty; LIFO.`, `Mảng cố định sức chứa ${fixture.capacity}; đáy tại chỉ số 0; top = -1 khi rỗng; LIFO.`), ["PROCEDURE PUSH(Value)", "  IF Top = Capacity - 1 THEN OUTPUT \"Overflow\"", "  ELSE Top ← Top + 1; Stack[Top] ← Value", "  ENDIF", "ENDPROCEDURE", "FUNCTION POP RETURNS INTEGER", "  IF Top = -1 THEN RETURN -1", "  Value ← Stack[Top]; Stack[Top] ← NULL; Top ← Top - 1", "  RETURN Value", "ENDFUNCTION"], steps);
}

export type QueueScenario = "fifo" | "wrap-around" | "underflow" | "overflow" | "empty";
type QueueValue = number | string;
const queueFixtures: Record<QueueScenario, { capacity: number; operations: Array<{ op: "ENQUEUE" | "DEQUEUE"; value?: QueueValue }> }> = {
  fifo: { capacity: 4, operations: [{ op: "ENQUEUE", value: "A" }, { op: "ENQUEUE", value: "B" }, { op: "ENQUEUE", value: "C" }, { op: "DEQUEUE" }, { op: "DEQUEUE" }] },
  "wrap-around": { capacity: 4, operations: [{ op: "ENQUEUE", value: "A" }, { op: "ENQUEUE", value: "B" }, { op: "ENQUEUE", value: "C" }, { op: "DEQUEUE" }, { op: "DEQUEUE" }, { op: "ENQUEUE", value: "D" }, { op: "ENQUEUE", value: "E" }, { op: "ENQUEUE", value: "F" }] },
  underflow: { capacity: 3, operations: [{ op: "DEQUEUE" }] }, overflow: { capacity: 2, operations: [{ op: "ENQUEUE", value: 1 }, { op: "ENQUEUE", value: 2 }, { op: "ENQUEUE", value: 3 }] }, empty: { capacity: 3, operations: [] },
};
export interface QueueState { cells: Array<QueueValue | null>; capacity: number; front: number; rear: number; count: number; logicalOrder: QueueValue[]; operation: string; returned: QueueValue | null; error: "UNDERFLOW" | "OVERFLOW" | null; committed: boolean | null; wrapped: boolean; }
export function applyQueueOperation(input: QueueState, op: "ENQUEUE" | "DEQUEUE", value?: QueueValue): QueueState {
  if (op !== "ENQUEUE" && op !== "DEQUEUE") throw new RangeError(`Unknown queue operation: ${String(op)}`);
  const cells = [...input.cells], logicalOrderBefore = [...input.logicalOrder];
  if (op === "ENQUEUE") { if (value === undefined || (typeof value === "number" && !Number.isFinite(value))) throw new RangeError("ENQUEUE requires a safe finite value"); if (input.count === input.capacity) return deepFreeze({ ...input, cells, logicalOrder: logicalOrderBefore, operation: op, returned: null, error: "OVERFLOW", committed: false }); const writeIndex = input.rear; cells[writeIndex] = value; const rear = (input.rear + 1) % input.capacity, count = input.count + 1, logicalOrder = Array.from({ length: count }, (_, i) => cells[(input.front + i) % input.capacity] as QueueValue); return deepFreeze({ ...input, cells, rear, count, logicalOrder, operation: `${op} ${String(value)}`, returned: null, error: null, committed: true, wrapped: input.wrapped || rear < input.rear }); }
  if (input.count === 0) return deepFreeze({ ...input, cells, logicalOrder: logicalOrderBefore, operation: op, returned: null, error: "UNDERFLOW", committed: false });
  const oldFront = input.front, returned = cells[oldFront]; cells[oldFront] = null; const count = input.count - 1, front = (oldFront + 1) % input.capacity, rear = input.rear, logicalOrder = Array.from({ length: count }, (_, i) => cells[(front + i) % input.capacity] as QueueValue); return deepFreeze({ ...input, cells, front, rear, count, logicalOrder, operation: op, returned, error: null, committed: true, wrapped: input.wrapped || front < oldFront });
}
export function queueTrace(scenarioInput: string): ComputationalTrace<QueueState> {
  const scenario = requireScenario(scenarioInput, queueFixtures), fixture = queueFixtures[scenario]; let state: QueueState = { cells: Array(fixture.capacity).fill(null), capacity: fixture.capacity, front: 0, rear: 0, count: 0, logicalOrder: [], operation: "—", returned: null, error: null, committed: null, wrapped: false };
  const steps = [step("ready", L("Declare the circular-queue convention", "Khai báo quy ước queue vòng"), L("front is the next removal; rear is the next insertion; count distinguishes empty from full.", "front là vị trí lấy ra tiếp theo; rear là vị trí chèn tiếp theo; count phân biệt rỗng với đầy."), L("The queue is empty when count = 0.", "Queue rỗng khi count = 0."), "Front ← 0; Rear ← 0; Count ← 0", state, state)];
  if (fixture.operations.length === 0) {
    const before = state; state = { ...state, operation: "CHECK EMPTY", committed: false };
    steps.push(step("empty-terminal", L("Confirm the empty terminal state", "Xác nhận trạng thái kết thúc rỗng"), L("count = 0 is checked before reading Queue[front].", "count = 0 được kiểm tra trước khi đọc Queue[front]."), L("No operation is scheduled, so every pointer and cell remains unchanged.", "Không có thao tác được lên lịch nên mọi pointer và ô giữ nguyên."), "IF Count = 0 THEN Empty", before, state, "terminal", "QUE-06"));
  }
  fixture.operations.forEach((operation, index) => { const before = state; state = applyQueueOperation(state, operation.op, operation.value); steps.push(step(`op-${index}`, L(operation.value === undefined ? operation.op : `${operation.op} ${operation.value}`, operation.value === undefined ? operation.op : `${operation.op} ${operation.value}`), operation.op === "ENQUEUE" ? L("Guard; write at rear; advance rear modulo capacity; increment count.", "Kiểm tra; ghi tại rear; tăng rear theo modulo sức chứa; tăng count.") : L("Guard; read and clear front; advance modulo capacity; decrement count.", "Kiểm tra; đọc và xóa front; tăng theo modulo sức chứa; giảm count."), state.error ? L(`Safe ${state.error}: every field is unchanged.`, `${state.error} an toàn: mọi trường đều không đổi.`) : state.returned !== null ? L(`Returned ${state.returned}, the oldest queued item.`, `Trả về ${state.returned}, phần tử cũ nhất trong queue.`) : L("FIFO state updated.", "Trạng thái FIFO đã cập nhật."), operation.op === "ENQUEUE" ? "Queue[Rear] ← Value; Rear ← (Rear + 1) MOD Capacity" : "Value ← Queue[Front]; Queue[Front] ← NULL; Front ← (Front + 1) MOD Capacity", before, state, operation.op.toLowerCase(), state.error ? operation.op === "ENQUEUE" ? "QUE-01" : "QUE-06" : operation.op === "ENQUEUE" ? "QUE-05" : "QUE-10")); });
  return finishTrace(scenario, L(`Circular array capacity ${fixture.capacity}; front=next removal; rear=next insertion; count defines empty/full.`, `Mảng vòng sức chứa ${fixture.capacity}; front=vị trí lấy tiếp theo; rear=vị trí chèn tiếp theo; count xác định rỗng/đầy.`), ["PROCEDURE ENQUEUE(Value)", "  IF Count = Capacity THEN RETURN FALSE", "  Queue[Rear] ← Value", "  Rear ← (Rear + 1) MOD Capacity", "  Count ← Count + 1", "ENDPROCEDURE", "FUNCTION DEQUEUE RETURNS STRING", "  IF Count = 0 THEN RETURN ErrorValue", "  Removed ← Queue[Front]; Queue[Front] ← EmptyValue", "  Front ← (Front + 1) MOD Capacity", "  Count ← Count - 1", "  RETURN Removed", "ENDFUNCTION"], steps);
}

export interface ListNodeRecord { address: number; data: number | null; next: number; allocated: boolean; }
export interface LinkedListState { head: number; nodes: ListNodeRecord[]; current: number; previous: number; path: number[]; reachable: number[]; operation: string; status: "ready" | "traversing" | "found" | "missing" | "updating" | "inserted" | "deleted"; savedSuccessor: number | null; returned: number | null; error: string | null; }
export type LinkedListScenario = "find-head" | "find-middle" | "find-tail" | "find-missing" | "insert-head" | "insert-middle" | "delete-head" | "delete-middle" | "delete-tail" | "delete-missing" | "empty-find" | "duplicate-first-match";
const listBaseNodes = (): ListNodeRecord[] => [{ address: 0, data: 10, next: 2, allocated: true }, { address: 1, data: null, next: -1, allocated: false }, { address: 2, data: 30, next: 4, allocated: true }, { address: 3, data: null, next: -1, allocated: false }, { address: 4, data: 50, next: -1, allocated: true }, { address: 5, data: null, next: -1, allocated: false }];
const listDuplicateNodes = (): ListNodeRecord[] => listBaseNodes().map(node => node.address === 2 ? { ...node, next: 3 } : node.address === 3 ? { address: 3, data: 30, next: 4, allocated: true } : node);
const linkedScenarios: Record<LinkedListScenario, { operation: "find" | "insert-head" | "insert-middle" | "delete"; target?: number; value?: number }> = {
  "find-head": { operation: "find", target: 10 }, "find-middle": { operation: "find", target: 30 }, "find-tail": { operation: "find", target: 50 }, "find-missing": { operation: "find", target: 40 },
  "insert-head": { operation: "insert-head", value: 5 }, "insert-middle": { operation: "insert-middle", target: 30, value: 40 },
  "delete-head": { operation: "delete", target: 10 }, "delete-middle": { operation: "delete", target: 30 }, "delete-tail": { operation: "delete", target: 50 }, "delete-missing": { operation: "delete", target: 40 }, "empty-find": { operation: "find", target: 10 }, "duplicate-first-match": { operation: "delete", target: 30 },
};
export function validateLinkedListState(head: number, nodes: readonly ListNodeRecord[]): number[] {
  if (!Number.isInteger(head) || head < -1) throw new RangeError("Malformed head pointer");
  const addresses = new Set(nodes.map(node => node.address));
  if (addresses.size !== nodes.length || nodes.some(node => !Number.isInteger(node.address) || node.address < 0 || !Number.isInteger(node.next))) throw new RangeError("Malformed node address or pointer");
  const reachable: number[] = [], seen = new Set<number>(); let cursor = head;
  while (cursor !== -1) {
    if (!addresses.has(cursor)) throw new RangeError("Dangling reachable link");
    if (seen.has(cursor)) throw new RangeError("Linked-list cycle");
    const node = nodes.find(item => item.address === cursor)!;
    if (!node.allocated) throw new RangeError("Reachable node is not allocated");
    seen.add(cursor); reachable.push(cursor); cursor = node.next;
  }
  return reachable;
}
function traverseList(state: LinkedListState, target: number, steps: ComputationalStep<LinkedListState>[]): { state: LinkedListState; found: number; previous: number } {
  let current = state.head, previous = -1;
  while (current !== -1) {
    const before = state, node = state.nodes.find(item => item.address === current)!;
    state = { ...state, current, previous, path: [...state.path, current], status: node.data === target ? "found" : "traversing" };
    steps.push(step(`visit-${current}`, L(`Visit address ${current}`, `Thăm địa chỉ ${current}`), L("Compare the node data, then follow next only if it is not equal.", "So sánh data của node, rồi chỉ theo next nếu chưa bằng."), node.data === target ? L(`Found ${target} at address ${current}.`, `Tìm thấy ${target} tại địa chỉ ${current}.`) : L(`Follow next = ${node.next}.`, `Theo next = ${node.next}.`), node.data === target ? "IF Nodes[Current].Data = Target THEN" : "Previous ← Current; Current ← Nodes[Current].Next", before, state, "visit", node.data === target ? "LL-F03" : "LL-F04"));
    if (node.data === target) return { state, found: current, previous };
    previous = current; current = node.next;
  }
  const before = state; state = { ...state, current: -1, previous, status: "missing" };
  steps.push(step("missing", L("Reach NULL", "Tới NULL"), L("A missing target is reported only after traversal reaches -1.", "Chỉ báo thiếu sau khi traversal tới -1."), L("No reachable node matches the target.", "Không có node reachable nào khớp mục tiêu."), "RETURN -1", before, state, "not-found", "LL-F04"));
  return { state, found: -1, previous };
}
export function linkedListTrace(scenarioInput: string): ComputationalTrace<LinkedListState> {
  const scenario = requireScenario(scenarioInput, linkedScenarios), fixture = linkedScenarios[scenario], empty = scenario === "empty-find";
  const initialNodes = empty ? listBaseNodes().map(node => ({ address: node.address, data: null, next: -1, allocated: false })) : scenario === "duplicate-first-match" ? listDuplicateNodes() : listBaseNodes();
  let state: LinkedListState = { head: empty ? -1 : 0, nodes: initialNodes, current: empty ? -1 : 0, previous: -1, path: [], reachable: empty ? [] : validateLinkedListState(0, initialNodes), operation: fixture.operation, status: "ready", savedSuccessor: null, returned: null, error: null };
  const steps = [step("ready", L("Read head and pointer convention", "Đọc head và quy ước pointer"), L("Addresses are zero-based; NULL is -1; the list is unordered.", "Địa chỉ bắt đầu từ 0; NULL là -1; list không có thứ tự."), empty ? L("head = -1, so the list is empty.", "head = -1 nên list rỗng.") : L("Traversal begins at head = 0.", "Traversal bắt đầu tại head = 0."), "Current ← Head; Previous ← -1", state, state)];
  if (empty) {
    const before = state; state = { ...state, status: "missing" };
    steps.push(step("empty-return", L("Stop at the NULL head", "Dừng tại head NULL"), L("The traversal guard fails before any node is read.", "Điều kiện traversal sai trước khi đọc node nào."), L("Return -1 with an empty path.", "Trả về -1 với path rỗng."), "RETURN -1", before, state, "terminal", "LL-F04"));
    return finishTrace(scenario, L("Record array; head/next NULL = -1; allocator chooses the lowest free address.", "Mảng record; NULL của head/next = -1; bộ cấp phát chọn địa chỉ trống nhỏ nhất."), listPseudocode, steps);
  }
  if (fixture.operation === "find" || fixture.operation === "delete" || fixture.operation === "insert-middle") {
    const traversal = traverseList(state, fixture.target!, steps); state = traversal.state;
    if (fixture.operation === "find" || traversal.found === -1) return finishTrace(scenario, L("Record array; first reachable duplicate match; NULL = -1.", "Mảng record; dùng kết quả trùng đầu tiên reachable; NULL = -1."), listPseudocode, steps);
    if (fixture.operation === "insert-middle") {
      const anchor = traversal.found, free = state.nodes.find(node => !node.allocated)!.address, saved = state.nodes.find(node => node.address === anchor)!.next; let before = state;
      state = { ...state, savedSuccessor: saved, status: "updating" };
      steps.push(step("save-successor", L("Save the successor", "Lưu successor"), L("Save anchor.next before overwriting it.", "Lưu anchor.next trước khi ghi đè."), L(`Saved successor ${saved}.`, `Đã lưu successor ${saved}.`), "SavedNext ← Nodes[Anchor].Next", before, state, "save-link"));
      before = state; let nodes = state.nodes.map(node => node.address === free ? { address: free, data: fixture.value!, next: saved, allocated: true } : node);
      state = { ...state, nodes, status: "updating", reachable: validateLinkedListState(state.head, nodes) };
      steps.push(step("write-node", L(`Write new node at ${free}`, `Ghi node mới tại ${free}`), L("Link the new node to the saved successor first.", "Liên kết node mới tới successor đã lưu trước."), L("The existing list remains reachable.", "List hiện có vẫn reachable."), "Nodes[New].Next ← SavedNext", before, state, "write-node"));
      before = state; nodes = state.nodes.map(node => node.address === anchor ? { ...node, next: free } : node); state = { ...state, nodes, reachable: validateLinkedListState(state.head, nodes), status: "inserted" };
      steps.push(step("link-anchor", L("Link anchor to new node", "Liên kết anchor tới node mới"), L("Overwrite anchor.next only after new.next is safe.", "Chỉ ghi đè anchor.next sau khi new.next đã an toàn."), L("Traversal now yields 10, 30, 40, 50.", "Traversal giờ cho 10, 30, 40, 50."), "Nodes[Anchor].Next ← New", before, state, "relink"));
      return finishTrace(scenario, L("Record array; save successor before relinking; NULL = -1.", "Mảng record; lưu successor trước khi relink; NULL = -1."), listPseudocode, steps);
    }
    const deleted = state.nodes.find(node => node.address === traversal.found)!; let before = state, nodes: ListNodeRecord[], head = state.head;
    if (traversal.previous === -1) head = deleted.next; else nodes = state.nodes.map(node => node.address === traversal.previous ? { ...node, next: deleted.next } : node);
    nodes ??= state.nodes; state = { ...state, head, nodes, reachable: validateLinkedListState(head, nodes), status: "updating", returned: deleted.data };
    steps.push(step("relink-delete", L("Relink around the target", "Relink bỏ qua mục tiêu"), L("Change head/previous before clearing the deleted record.", "Đổi head/previous trước khi xóa record cần xóa."), L("Every remaining live node stays reachable.", "Mọi node còn lại vẫn reachable."), traversal.previous === -1 ? "Head ← Nodes[Current].Next" : "Nodes[Previous].Next ← Nodes[Current].Next", before, state, "relink"));
    before = state; nodes = state.nodes.map(node => node.address === traversal.found ? { address: node.address, data: null, next: -1, allocated: false } : node); state = { ...state, nodes, reachable: validateLinkedListState(state.head, nodes), current: traversal.found, status: "deleted" };
    steps.push(step("clear-delete", L("Clear the deleted record", "Xóa record đã delete"), L("Clear only after the remaining chain has been relinked.", "Chỉ xóa sau khi chain còn lại đã được relink."), L(`Returned ${deleted.data}; address ${deleted.address} is free.`, `Trả về ${deleted.data}; địa chỉ ${deleted.address} đã trống.`), "Nodes[Deleted] ← free record", before, state, "clear-node"));
    return finishTrace(scenario, L("Delete the first reachable match; relink before clearing; NULL = -1.", "Delete kết quả khớp reachable đầu tiên; relink trước khi xóa; NULL = -1."), listPseudocode, steps);
  }
  const free = state.nodes.find(node => !node.allocated)!.address, oldHead = state.head; let before = state;
  state = { ...state, savedSuccessor: oldHead, status: "updating" }; steps.push(step("save-head", L("Save old head", "Lưu head cũ"), L("Keep the old chain address before changing head.", "Giữ địa chỉ chain cũ trước khi đổi head."), L(`Saved ${oldHead}.`, `Đã lưu ${oldHead}.`), "OldHead ← Head", before, state, "save-link"));
  before = state; let nodes = state.nodes.map(node => node.address === free ? { address: free, data: fixture.value!, next: oldHead, allocated: true } : node); state = { ...state, nodes, reachable: validateLinkedListState(oldHead, nodes) };
  steps.push(step("write-head-node", L("Write the new node", "Ghi node mới"), L("Point new.next to the saved old head.", "Cho new.next trỏ tới head cũ đã lưu."), L("The old list is still intact.", "List cũ vẫn nguyên vẹn."), "Nodes[New].Next ← OldHead", before, state, "write-node"));
  before = state; state = { ...state, head: free, reachable: validateLinkedListState(free, nodes), status: "inserted" };
  steps.push(step("move-head", L("Move head last", "Chuyển head sau cùng"), L("Publish the new node only after its link is valid.", "Chỉ công bố node mới sau khi link của nó hợp lệ."), L("The new value is now first.", "Giá trị mới giờ đứng đầu."), "Head ← New", before, state, "relink"));
  return finishTrace(scenario, L("Insert at head using the lowest free address; write next before head.", "Chèn đầu bằng địa chỉ trống nhỏ nhất; ghi next trước head."), listPseudocode, steps);
}
const listPseudocode = ["Current ← Head", "Previous ← -1", "WHILE Current <> -1 AND Nodes[Current].Data <> Target", "  Previous ← Current", "  Current ← Nodes[Current].Next", "ENDWHILE"];

export interface TreeNodeRecord { id: string; value: number; left: string | null; right: string | null; }
export interface BinaryTreeState { root: string | null; nodes: TreeNodeRecord[]; target: number; operation: "find" | "insert"; currentId: string | null; path: string[]; comparisons: number; decision: "ready" | "left" | "right" | "equal" | "attach" | "null"; status: "ready" | "searching" | "found" | "missing" | "inserted" | "duplicate-rejected"; insertedId: string | null; parentId: string | null; side: "left" | "right" | "root" | null; }
export type BinaryTreeScenario = "found" | "missing" | "insert-leaf" | "empty-insert" | "duplicate";
const treeBaseNodes = (): TreeNodeRecord[] => [{ id: "n50", value: 50, left: "n30", right: "n70" }, { id: "n30", value: 30, left: "n20", right: "n40" }, { id: "n70", value: 70, left: "n60", right: "n80" }, { id: "n20", value: 20, left: null, right: null }, { id: "n40", value: 40, left: null, right: null }, { id: "n60", value: 60, left: null, right: null }, { id: "n80", value: 80, left: null, right: null }];
const treeScenarios: Record<BinaryTreeScenario, { operation: "find" | "insert"; value: number; empty?: boolean }> = { found: { operation: "find", value: 60 }, missing: { operation: "find", value: 65 }, "insert-leaf": { operation: "insert", value: 65 }, "empty-insert": { operation: "insert", value: 50, empty: true }, duplicate: { operation: "insert", value: 50 } };
export function validateBinaryTree(root: string | null, nodes: readonly TreeNodeRecord[]): void {
  const ids = new Set(nodes.map(node => node.id)); if (ids.size !== nodes.length || nodes.some(node => !/^n\d+$/.test(node.id))) throw new RangeError("Malformed or duplicate tree node ID");
  const visit = (id: string | null, min: number, max: number, seen: Set<string>): void => { if (id === null) return; if (!ids.has(id) || seen.has(id)) throw new RangeError("Dangling link or tree cycle"); const node = nodes.find(item => item.id === id)!; if (!(node.value > min && node.value < max)) throw new RangeError("BST ordering violation"); seen.add(id); visit(node.left, min, node.value, seen); visit(node.right, node.value, max, seen); };
  visit(root, -Infinity, Infinity, new Set());
}
export function binaryTreeTrace(scenarioInput: string): ComputationalTrace<BinaryTreeState> {
  const scenario = requireScenario(scenarioInput, treeScenarios), fixture = treeScenarios[scenario]; let state: BinaryTreeState = { root: fixture.empty ? null : "n50", nodes: fixture.empty ? [] : treeBaseNodes(), target: fixture.value, operation: fixture.operation, currentId: fixture.empty ? null : "n50", path: [], comparisons: 0, decision: "ready", status: "ready", insertedId: null, parentId: null, side: null };
  const steps = [step("ready", L("Read the BST rule", "Đọc quy tắc BST"), L("Every left descendant is smaller; every right descendant is larger; duplicates reject.", "Mọi descendant trái nhỏ hơn; mọi descendant phải lớn hơn; duplicate bị từ chối."), state.root ? L("Begin at the root.", "Bắt đầu tại root.") : L("The root is NULL.", "Root là NULL."), "Current ← Root", state, state)];
  if (state.root === null) { const before = state, node = { id: `n${fixture.value}`, value: fixture.value, left: null, right: null }; state = { ...state, root: node.id, nodes: [node], currentId: node.id, status: "inserted", decision: "attach", insertedId: node.id, side: "root" }; steps.push(step("attach-root", L("Attach the root", "Gắn root"), L("An insertion into an empty BST creates the root.", "Chèn vào BST rỗng sẽ tạo root."), L(`${fixture.value} is now the root.`, `${fixture.value} giờ là root.`), "Root ← NewNode", before, state, "insert", "BST-I01")); return finishTrace(scenario, L("BST: left < node < right; duplicates reject; deletion is outside scope.", "BST: trái < node < phải; duplicate bị từ chối; deletion ngoài phạm vi."), treePseudocode, steps); }
  let currentId: string | null = state.root, parentId: string | null = null, side: "left" | "right" | null = null;
  while (currentId) {
    const node = state.nodes.find(item => item.id === currentId)!; const before = state; parentId = currentId;
    const decision = fixture.value === node.value ? "equal" : fixture.value < node.value ? "left" : "right"; side = decision === "left" || decision === "right" ? decision : null;
    state = { ...state, currentId, path: [...state.path, currentId], comparisons: state.comparisons + 1, decision, status: decision === "equal" ? fixture.operation === "find" ? "found" : "duplicate-rejected" : "searching", parentId };
    const activeRule = fixture.operation === "find" ? decision === "equal" ? "BST-F03" : decision === "left" ? "BST-F04" : "BST-F05" : decision === "equal" ? "BST-I03" : decision === "left" ? "BST-I04" : "BST-I05";
    steps.push(step(`compare-${currentId}`, L(`Compare with ${node.value}`, `So sánh với ${node.value}`), decision === "equal" ? L("Equality ends search; insertion rejects the duplicate.", "Bằng nhau kết thúc tìm kiếm; insertion từ chối duplicate.") : decision === "left" ? L("A smaller target can only be in the left subtree.", "Mục tiêu nhỏ hơn chỉ có thể ở subtree trái.") : L("A larger target can only be in the right subtree.", "Mục tiêu lớn hơn chỉ có thể ở subtree phải."), decision === "equal" ? state.status === "found" ? L(`Found ${node.id}.`, `Tìm thấy ${node.id}.`) : L("No node changes.", "Không node nào thay đổi.") : L(`Follow the ${decision} link.`, `Theo link ${decision}.`), decision === "equal" ? "RETURN Current" : decision === "left" ? "Current ← Nodes[Current].Left" : "Current ← Nodes[Current].Right", before, state, "compare", activeRule));
    if (decision === "equal") return finishTrace(scenario, L("BST: left < node < right; duplicates reject; deletion is outside scope.", "BST: trái < node < phải; duplicate bị từ chối; deletion ngoài phạm vi."), treePseudocode, steps);
    currentId = node[decision];
  }
  if (fixture.operation === "find") { const before = state; state = { ...state, currentId: null, status: "missing", decision: "null", parentId }; steps.push(step("missing", L("Reach a NULL child", "Tới child NULL"), L("The BST ordering path has no remaining candidate.", "Đường đi theo thứ tự BST không còn ứng viên."), L("The value is missing.", "Không có giá trị."), "RETURN NULL", before, state, "not-found", side === "left" ? "BST-F04" : "BST-F05")); return finishTrace(scenario, L("BST: left < node < right; duplicates reject; deletion is outside scope.", "BST: trái < node < phải; duplicate bị từ chối; deletion ngoài phạm vi."), treePseudocode, steps); }
  const newNode: TreeNodeRecord = { id: `n${fixture.value}`, value: fixture.value, left: null, right: null }, before = state; const nodes = state.nodes.map(node => node.id === parentId ? { ...node, [side!]: newNode.id } : node).concat(newNode); validateBinaryTree(state.root, nodes); state = { ...state, nodes, currentId: newNode.id, status: "inserted", decision: "attach", insertedId: newNode.id, parentId, side };
  steps.push(step("attach-leaf", L(`Attach ${newNode.id}`, `Gắn ${newNode.id}`), L("Attach a new leaf at the first NULL link on the comparison path.", "Gắn leaf mới tại link NULL đầu tiên trên đường so sánh."), L(`${newNode.id} is the ${side} child of ${parentId}.`, `${newNode.id} là child ${side} của ${parentId}.`), `Nodes[Parent].${side === "left" ? "Left" : "Right"} ← NewNode`, before, state, "insert", "BST-I06"));
  return finishTrace(scenario, L("BST: left < node < right; duplicates reject; deletion is outside scope.", "BST: trái < node < phải; duplicate bị từ chối; deletion ngoài phạm vi."), treePseudocode, steps);
}
const treePseudocode = ["Current ← Root", "WHILE Current <> NULL", "  IF Target = Nodes[Current].Value THEN RETURN Current", "  IF Target < Nodes[Current].Value THEN Current ← Nodes[Current].Left", "  ELSE Current ← Nodes[Current].Right", "ENDWHILE"];

export interface DictionaryEntry { key: string; value: string; }
export interface DictionaryState { entries: DictionaryEntry[]; operation: "lookup" | "insert" | "update"; key: string; argument: string | null; scannedKeys: string[]; returned: string | null; status: "ready" | "scanning" | "found" | "missing" | "inserted" | "updated" | "duplicate-key-rejected"; committed: boolean | null; }
export type DictionaryScenario = "lookup" | "missing" | "insert" | "update" | "duplicate-insert" | "equal-values-distinct-keys";
const dictionaryScenarios: Record<DictionaryScenario, { operation: DictionaryState["operation"]; key: string; argument: string | null }> = { lookup: { operation: "lookup", key: "blue", argument: null }, missing: { operation: "lookup", key: "green", argument: null }, insert: { operation: "insert", key: "green", argument: "#00FF00" }, update: { operation: "update", key: "blue", argument: "#1010FF" }, "duplicate-insert": { operation: "insert", key: "blue", argument: "replacement" }, "equal-values-distinct-keys": { operation: "insert", key: "green", argument: "#0000FF" } };
export function validateDictionaryEntries(entries: readonly DictionaryEntry[]): void { const keys = entries.map(entry => entry.key); if (keys.some(key => !key) || new Set(keys).size !== keys.length) throw new RangeError("Initial dictionary keys must be unique non-empty strings"); }
export function dictionaryTrace(scenarioInput: string): ComputationalTrace<DictionaryState> {
  const scenario = requireScenario(scenarioInput, dictionaryScenarios), fixture = dictionaryScenarios[scenario], initialEntries = [{ key: "red", value: "#FF0000" }, { key: "blue", value: "#0000FF" }]; validateDictionaryEntries(initialEntries);
  let state: DictionaryState = { entries: initialEntries, ...fixture, scannedKeys: [], returned: null, status: "ready", committed: null };
  const steps = [step("ready", L(`External request: ${fixture.operation.toUpperCase()}(${fixture.key})`, `Yêu cầu ngoài: ${fixture.operation.toUpperCase()}(${fixture.key})`), L("A key is a unique identifier, not the internal array index.", "Key là định danh duy nhất, không phải chỉ số mảng bên trong."), L("Scan the reviewed entry-list implementation.", "Quét implementation dạng entry-list đã duyệt."), "Index ← 0", state, state)];
  let foundIndex = -1;
  for (let index = 0; index < state.entries.length; index += 1) {
    const before = state; state = { ...state, scannedKeys: [...state.scannedKeys, state.entries[index].key], status: "scanning" };
    steps.push(step(`scan-${index}`, L(`Compare key ${state.entries[index].key}`, `So sánh key ${state.entries[index].key}`), L("Compare keys; do not compare the requested key with the array index.", "So sánh key; không so key yêu cầu với chỉ số mảng."), state.entries[index].key === fixture.key ? L("Matching key found.", "Đã tìm thấy key khớp.") : L("Continue to the next entry.", "Tiếp tục sang entry kế."), "IF Entries[Index].Key = Key THEN", before, state, "scan"));
    if (state.entries[index].key === fixture.key) { foundIndex = index; break; }
  }
  const before = state;
  if (fixture.operation === "lookup") state = { ...state, returned: foundIndex >= 0 ? state.entries[foundIndex].value : null, status: foundIndex >= 0 ? "found" : "missing", committed: false };
  else if (fixture.operation === "insert") state = foundIndex >= 0 ? { ...state, status: "duplicate-key-rejected", committed: false } : { ...state, entries: [...state.entries, { key: fixture.key, value: fixture.argument! }], status: "inserted", committed: true };
  else state = foundIndex < 0 ? { ...state, status: "missing", committed: false } : { ...state, entries: state.entries.map((entry, index) => index === foundIndex ? { ...entry, value: fixture.argument! } : entry), status: "updated", committed: true };
  validateDictionaryEntries(state.entries);
  steps.push(step("resolve", L("Resolve the external operation", "Giải quyết thao tác ngoài"), fixture.operation === "insert" ? L("INSERT requires an unused key; an existing key is rejected.", "INSERT yêu cầu key chưa dùng; key đã tồn tại bị từ chối.") : fixture.operation === "update" ? L("UPDATE changes only an existing key.", "UPDATE chỉ đổi key đã tồn tại.") : L("LOOKUP returns the matched value without changing entries.", "LOOKUP trả về value khớp mà không đổi entries."), state.status === "found" ? L(`Return ${state.returned}.`, `Trả về ${state.returned}.`) : state.status === "missing" ? L("Report missing without mutation.", "Báo missing mà không thay đổi.") : state.status === "duplicate-key-rejected" ? L("Reject duplicate INSERT without mutation.", "Từ chối INSERT trùng mà không thay đổi.") : L(`Dictionary ${state.status}.`, `Dictionary đã ${state.status}.`), fixture.operation === "lookup" ? "RETURN Entries[Index].Value" : fixture.operation === "insert" ? "APPEND (Key, Value)" : "Entries[Index].Value ← Value", before, state, "resolve"));
  return finishTrace(scenario, L("Unique string keys; INSERT existing rejects; UPDATE missing reports missing; entry position is internal.", "Key chuỗi duy nhất; INSERT key đã có bị từ chối; UPDATE key thiếu báo missing; vị trí entry là nội bộ."), ["Index ← 0", "WHILE Index < LENGTH(Entries) AND Entries[Index].Key <> Key", "  Index ← Index + 1", "ENDWHILE", "// resolve LOOKUP, INSERT or UPDATE using the declared policy"], steps);
}

export type ADTImplementationScenario = "stack-array" | "queue-circular-array" | "queue-two-stacks" | "linked-list-record-array" | "dictionary-entry-list" | "dictionary-linked-list" | "binary-tree-linked-records" | "graph-adt-scope-card";
export interface ADTImplementationState { externalADT: string; externalOperation: string; observableResult: string; representation: string; internalSteps: string[]; revealedSteps: string[]; invariant: string; edgeCase: string; costNote: string; graphBoundary: { nodes: number; edges: number; vocabulary: string; suitability: string; excluded: string }; status: "ready" | "mapping" | "complete"; }
const adtImplementations: Record<ADTImplementationScenario, Omit<ADTImplementationState, "revealedSteps" | "status" | "graphBoundary">> = {
  "stack-array": { externalADT: "Stack", externalOperation: "PUSH(7)", representation: "fixed array + top", internalSteps: ["guard top < capacity-1", "top ← top + 1", "cells[top] ← 7"], observableResult: "7 is the next POP result", invariant: "live items occupy cells[0..top] in push order", edgeCase: "overflow preserves state", costNote: "PUSH maps to a constant number of array operations" },
  "queue-circular-array": { externalADT: "Queue", externalOperation: "ENQUEUE(7)", representation: "circular array + front/rear/count", internalSteps: ["guard count < capacity", "cells[rear] ← 7", "rear ← (rear + 1) MOD capacity", "count ← count + 1"], observableResult: "existing front item remains the next DEQUEUE result", invariant: "logical FIFO order follows count cells from front modulo capacity; rear is next insertion", edgeCase: "count distinguishes empty from full", costNote: "ENQUEUE maps to constant-time index and write operations" },
  "linked-list-record-array": { externalADT: "Linked list", externalOperation: "INSERT_AFTER(30, 40)", representation: "record array + head/next", internalSteps: ["locate anchor", "allocate lowest free record", "new.next ← anchor.next", "anchor.next ← new address"], observableResult: "traversal yields 10,30,40,50", invariant: "every live node is reachable once from head and traversal ends at NULL", edgeCase: "save successor before relink", costNote: "location cost depends on traversal; relink uses fixed pointer writes" },
  "dictionary-entry-list": { externalADT: "Dictionary", externalOperation: "UPDATE('blue', '#1010FF')", representation: "entry list", internalSteps: ["scan entries for key", "replace matching value only"], observableResult: "LOOKUP('blue') returns '#1010FF' and key remains unique", invariant: "at most one entry per key", edgeCase: "missing UPDATE does not insert", costNote: "linear entry-list lookup grows with entries" },
  "dictionary-linked-list": { externalADT: "Dictionary", externalOperation: "LOOKUP('blue')", representation: "linked records at addresses 0 and 2", internalSteps: ["read record 0 key 'red'", "follow next = 2", "read record 2 key 'blue'", "return '#0000FF'"], observableResult: "#0000FF", invariant: "each reachable record has a unique key and traversal ends at NULL", edgeCase: "the key is separate from the record address", costNote: "lookup follows links until a matching key or NULL" },
  "binary-tree-linked-records": { externalADT: "Binary search tree", externalOperation: "INSERT(65)", representation: "linked node records", internalSteps: ["compare at 50 and move right", "compare at 70 and move left", "compare at 60 and move right", "attach new leaf at null child"], observableResult: "FIND(65) succeeds along 50,70,60,65", invariant: "all left descendants are smaller and all right descendants are larger", edgeCase: "duplicate insertion rejects", costNote: "work depends on tree height" },
  "queue-two-stacks": { externalADT: "Queue", externalOperation: "ENQUEUE(A), ENQUEUE(B), DEQUEUE()", representation: "two internal LIFO stacks", internalSteps: ["PUSH A onto inStack", "PUSH B onto inStack", "outStack empty: POP B from inStack; PUSH B onto outStack", "continue transfer: POP A from inStack; PUSH A onto outStack", "POP A from outStack"], observableResult: "DEQUEUE returns A and B remains next, preserving FIFO although each internal structure is LIFO", invariant: "logical queue equals outStack read top-to-bottom followed by inStack read bottom-to-top", edgeCase: "transfer only when outStack is empty", costNote: "one DEQUEUE may transfer several values; the external result remains FIFO" },
  "graph-adt-scope-card": { externalADT: "Graph", externalOperation: "JUSTIFY graph for campus links", representation: "nodes A/B/C and weighted undirected edges A-B/B-C", internalSteps: ["identify nodes as places", "identify edges as direct links", "identify weight as route length", "justify many-to-many relationships"], observableResult: "graph is suitable for a network of many-to-many relationships", invariant: "every edge endpoint names an existing node", edgeCase: "describe/use/justify only; no graph implementation code", costNote: "Dijkstra and A* search state are outside this Section 19 ADT card" },
};
const graphBoundary = { nodes: 3, edges: 2, vocabulary: "nodes/vertices, edges/arcs, weight/cost, connected path", suitability: "Places can connect to zero, one or many other places without a linear hierarchy.", excluded: "No graph implementation code, Dijkstra state or A* state." };
export function adtImplementationTrace(scenarioInput: string): ComputationalTrace<ADTImplementationState> {
  const scenario = requireScenario(scenarioInput, adtImplementations), fixture = adtImplementations[scenario]; let state: ADTImplementationState = { ...fixture, internalSteps: [...fixture.internalSteps], revealedSteps: [], graphBoundary, status: "ready" };
  const steps = [step("ready", L("Separate interface from representation", "Tách interface khỏi representation"), L("The external request/result defines observable behavior; internal steps may vary.", "Yêu cầu/kết quả bên ngoài định nghĩa behavior quan sát được; các bước nội bộ có thể khác."), L("Keep the representation invariant visible.", "Luôn hiển thị representation invariant."), "External request enters implementation", state, state)];
  fixture.internalSteps.forEach((internal, index) => { const before = state; state = { ...state, revealedSteps: fixture.internalSteps.slice(0, index + 1), status: index === fixture.internalSteps.length - 1 ? "complete" : "mapping" }; steps.push(step(`map-${index}`, L(`Internal step ${index + 1}`, `Bước nội bộ ${index + 1}`), L(internal, internal), index === fixture.internalSteps.length - 1 ? L(`Observable result: ${fixture.observableResult}`, `Kết quả quan sát được: ${fixture.observableResult}`) : L("The invariant still holds after this step.", "Invariant vẫn đúng sau bước này."), internal, before, state, "map-operation")); });
  return finishTrace(scenario, L("The external ADT contract stays fixed while the internal representation may change.", "Contract ADT bên ngoài giữ nguyên trong khi representation bên trong có thể thay đổi."), fixture.internalSteps, steps);
}

export type ComplexityScenario = "search-worst-case" | "bubble-order-impact" | "insertion-order-impact" | "factorial-space";
export interface ComplexityRow { label: string; exactTime: number | null; exactSpace: number | null; timeBigO: string; spaceBigO: string; pattern: "solid" | "dashed"; }
export interface ComplexityState { task: string; n: number; assumptions: string[]; metric: string; rows: ComplexityRow[]; chart: Array<{ n: number; values: number[] }>; status: "setup" | "counts" | "compare"; }
const complexityScenarios: Record<ComplexityScenario, { task: string; assumptions: string[] }> = { "search-worst-case": { task: "find a target or report missing", assumptions: ["binary input is already sorted", "sorting cost is excluded", "one key comparison is one teaching operation"] }, "bubble-order-impact": { task: "sort the same n items", assumptions: ["early-exit bubble sort", "one adjacent comparison is one teaching operation"] }, "insertion-order-impact": { task: "sort the same n items", assumptions: ["stable ascending insertion sort", "one key comparison is one teaching operation"] }, "factorial-space": { task: "compare auxiliary space while computing n factorial", assumptions: ["recursive frames include calls from n through 0", "the iterative version uses one accumulator storage unit", "the chart and exact-count column show auxiliary storage units"] } };
const complexityDomain = (n: number): number[] => [...new Set([1, Math.ceil(n / 4), Math.ceil(n / 2), Math.ceil(3 * n / 4), n])].filter(value => value <= n).sort((left, right) => left - right);
export function complexityComparison(scenarioInput: string, nInput = 5): ComputationalTrace<ComplexityState> {
  const scenario = requireScenario(scenarioInput, complexityScenarios); if (!Number.isFinite(nInput) || !Number.isInteger(nInput) || nInput < 1 || nInput > 64) throw new RangeError("n must be an integer from 1 to 64");
  const fixture = complexityScenarios[scenario], domain = complexityDomain(nInput); let rows: ComplexityRow[], chart: ComplexityState["chart"], metric: string;
  if (scenario === "search-worst-case") { chart = domain.map(n => ({ n, values: [n, Math.ceil(Math.log2(n + 1))] })); rows = [{ label: "Linear search", exactTime: nInput, exactSpace: 1, timeBigO: "O(n)", spaceBigO: "O(1)", pattern: "solid" }, { label: "Binary search", exactTime: Math.ceil(Math.log2(nInput + 1)), exactSpace: 1, timeBigO: "O(log n)", spaceBigO: "O(1)", pattern: "dashed" }]; metric = "worst-case key comparisons — not seconds"; }
  else if (scenario === "bubble-order-impact") { chart = domain.map(n => ({ n, values: [Math.max(0, n - 1), n * (n - 1) / 2] })); rows = [{ label: "Sorted input", exactTime: Math.max(0, nInput - 1), exactSpace: 1, timeBigO: "O(n) best case with early exit", spaceBigO: "O(1)", pattern: "solid" }, { label: "Reverse input", exactTime: nInput * (nInput - 1) / 2, exactSpace: 1, timeBigO: "O(n^2)", spaceBigO: "O(1)", pattern: "dashed" }]; metric = "adjacent comparisons — not seconds"; }
  else if (scenario === "insertion-order-impact") { chart = domain.map(n => ({ n, values: [Math.max(0, n - 1), n * (n - 1) / 2] })); rows = [{ label: "Sorted input", exactTime: Math.max(0, nInput - 1), exactSpace: 1, timeBigO: "O(n)", spaceBigO: "O(1)", pattern: "solid" }, { label: "Reverse input", exactTime: nInput * (nInput - 1) / 2, exactSpace: 1, timeBigO: "O(n^2)", spaceBigO: "O(1)", pattern: "dashed" }]; metric = "key comparisons — not seconds"; }
  else { chart = domain.map(n => ({ n, values: [n + 1, 1] })); rows = [{ label: "Recursive factorial · call frames", exactTime: nInput + 1, exactSpace: nInput + 1, timeBigO: "O(n)", spaceBigO: "O(n)", pattern: "solid" }, { label: "Iterative factorial · accumulator", exactTime: 1, exactSpace: 1, timeBigO: "O(n)", spaceBigO: "O(1)", pattern: "dashed" }]; metric = "auxiliary storage units — not seconds"; }
  let state: ComplexityState = { task: fixture.task, n: nInput, assumptions: fixture.assumptions, metric, rows, chart, status: "setup" };
  const steps = [step("setup", L("Declare the same task and assumptions", "Khai báo cùng task và assumptions"), L("Big O compares growth only after task, n, metric and assumptions are fixed.", "Big O chỉ so growth sau khi đã cố định task, n, metric và assumptions."), L("No animation duration or hardware timing is evidence.", "Thời lượng animation hoặc timing phần cứng không phải bằng chứng."), "Declare task, n, metric and assumptions", state, state)];
  let before = state; state = { ...state, status: "counts" }; steps.push(step("counts", L("Reveal exact teaching counts", "Mở số phép tính minh họa chính xác"), L("Exact counts describe these reviewed fixtures; they are distinct from growth classes.", "Số đếm chính xác mô tả các fixture đã duyệt; khác với lớp tăng trưởng."), L("The chart and table use the same count model.", "Biểu đồ và bảng dùng cùng count model."), "Compute teaching counts", before, state));
  before = state; state = { ...state, status: "compare" }; steps.push(step("compare", L("Compare time and auxiliary space", "So sánh time và auxiliary space"), L("Time and space are separate metrics; equal time Big O need not mean equal auxiliary space.", "Time và space là hai metric riêng; cùng Big O time không có nghĩa cùng auxiliary space."), L("Report each Big O class with its assumptions.", "Báo từng lớp Big O cùng assumptions."), "State asymptotic classes", before, state));
  return finishTrace(scenario, L("Big O is asymptotic growth, not seconds; exact counts remain labelled as teaching counts.", "Big O là tăng trưởng tiệm cận, không phải giây; số đếm chính xác luôn được ghi là teaching counts."), ["Declare same task and input size n", "Count the declared operation or auxiliary storage", "Compare growth as n increases", "State Big O with assumptions"], steps);
}

export type RecursionScenario = "numeric-factorial-4" | "list-sum" | "empty-list-sum" | "broken-no-progress" | "broken-unreachable-base";
export interface RecursionCall { id: string; argument: string; depth: number; base: boolean; }
export interface RecursionReturn { id: string; argument: string; depth: number; returned: number; }
export interface RecursionState { input: number | number[]; status: "ready" | "calling" | "returning" | "complete" | "blocked-invalid"; activeCall: RecursionCall | null; callOrder: RecursionCall[]; returnOrder: RecursionReturn[]; maxDepth: number; result: number | null; errorCode: "NO_PROGRESS_TOWARD_BASE_CASE" | "BASE_CASE_UNREACHABLE" | null; executedCalls: number; repair: string | null; }
const recursionScenarios: Record<RecursionScenario, number | number[]> = { "numeric-factorial-4": 4, "list-sum": [4, 7, 2], "empty-list-sum": [], "broken-no-progress": 3, "broken-unreachable-base": 3 };
export function recursionTrace(scenarioInput: string): ComputationalTrace<RecursionState> {
  const scenario = requireScenario(scenarioInput, recursionScenarios), input = recursionScenarios[scenario]; let state: RecursionState = { input: copy(input), status: "ready", activeCall: null, callOrder: [], returnOrder: [], maxDepth: 0, result: null, errorCode: null, executedCalls: 0, repair: null };
  const steps = [step("validate", L("Validate base case and progress", "Kiểm tra base case và progress"), L("A recursive call must make a strictly smaller subproblem that can reach the base case.", "Recursive call phải tạo subproblem nhỏ hơn nghiêm ngặt và có thể tới base case."), L("Unsafe fixtures stop before any call executes.", "Fixture không an toàn dừng trước khi thực thi call."), "Validate base case and progress measure", state, state, "validate")];
  if (scenario.startsWith("broken")) {
    const before = state, noProgress = scenario === "broken-no-progress"; state = { ...state, status: "blocked-invalid", errorCode: noProgress ? "NO_PROGRESS_TOWARD_BASE_CASE" : "BASE_CASE_UNREACHABLE", repair: noProgress ? "Call F(n - 1), not F(n), and keep a reachable base case." : "Move the argument toward n = 0, not away from it." };
    steps.push(step("blocked", L("Block unsafe recursion", "Chặn recursion không an toàn"), noProgress ? L("F(n) calls F(n), so the problem never becomes smaller.", "F(n) gọi F(n), nên bài toán không bao giờ nhỏ hơn.") : L("F(n+1) moves away from the base case n=0.", "F(n+1) đi xa base case n=0."), L("Zero recursive calls were executed; use the repair guidance.", "Không recursive call nào được thực thi; hãy dùng hướng dẫn sửa."), "STOP: invalid recursion", before, state, "blocked-invalid"));
    return finishTrace(scenario, L("Validate a reachable base case and strict progress before execution.", "Kiểm tra base case reachable và progress nghiêm ngặt trước khi chạy."), recursionPseudocode(scenario), steps);
  }
  const calls: RecursionCall[] = [];
  if (scenario === "numeric-factorial-4") for (let n = 4, depth = 1; n >= 0; n -= 1, depth += 1) calls.push({ id: `factorial-${n}`, argument: `n=${n}`, depth, base: n === 0 });
  else { const values = input as number[]; for (let index = 0; index <= values.length; index += 1) calls.push({ id: `sum-${index}`, argument: `index=${index}, remaining=[${values.slice(index).join(",")}]`, depth: index + 1, base: index === values.length }); }
  for (const call of calls) { const before = state, factorial = scenario === "numeric-factorial-4"; state = { ...state, status: "calling", activeCall: call, callOrder: [...state.callOrder, call], maxDepth: Math.max(state.maxDepth, call.depth), executedCalls: state.executedCalls + 1 }; steps.push(step(`call-${call.id}`, L(`Enter ${call.id}`, `Vào ${call.id}`), call.base ? L("The base condition is true, so no child call is created.", "Điều kiện base đúng nên không tạo child call.") : L("Form the declared smaller subproblem.", "Tạo subproblem nhỏ hơn đã khai báo."), call.base ? L("Begin returning the base value.", "Bắt đầu trả về base value.") : L("Push a distinct invocation and continue downward.", "Thêm invocation riêng và tiếp tục đi xuống."), call.base ? factorial ? "IF Number = 0 THEN" : "IF Index > UpperBound THEN" : factorial ? "ChildResult ← Factorial(Number - 1)" : "ChildResult ← ListSum(Data, Index + 1, UpperBound)", before, state, "enter-call", factorial ? call.base ? "FAC-02" : "FAC-04" : call.base ? "SUM-02" : "SUM-04")); }
  let returned = scenario === "numeric-factorial-4" ? 1 : 0;
  for (let index = calls.length - 1; index >= 0; index -= 1) {
    const call = calls[index], before = state;
    if (!call.base) returned = scenario === "numeric-factorial-4" ? Number(call.argument.match(/\d+/)![0]) * returned : (input as number[])[index] + returned;
    const item: RecursionReturn = { id: call.id, argument: call.argument, depth: call.depth, returned };
    state = { ...state, status: index === 0 ? "complete" : "returning", activeCall: index > 0 ? calls[index - 1] : null, returnOrder: [...state.returnOrder, item], result: index === 0 ? returned : null };
    const factorial = scenario === "numeric-factorial-4"; steps.push(step(`return-${call.id}`, L(`Return from ${call.id}`, `Trả về từ ${call.id}`), call.base ? L("Return the base value.", "Trả về base value.") : L("Combine this frame's value with the child result.", "Kết hợp giá trị của frame này với child result."), L(`Returned ${returned}${index > 0 ? " to its caller" : " as the final result"}.`, `Trả về ${returned}${index > 0 ? " cho caller" : " làm kết quả cuối"}.`), factorial ? call.base ? "RETURN 1" : "RETURN Number * ChildResult" : call.base ? "RETURN 0" : "RETURN Data[Index] + ChildResult", before, state, call.base ? "base-return" : "unwind-return", factorial ? call.base ? "FAC-03" : "FAC-05" : call.base ? "SUM-03" : "SUM-05"));
  }
  return finishTrace(scenario, L("Each invocation has a separate frame; returns unwind in reverse call order.", "Mỗi invocation có frame riêng; return unwind theo thứ tự ngược call."), recursionPseudocode(scenario), steps);
}
const recursionPseudocode = (scenario: RecursionScenario): string[] => scenario === "broken-no-progress" ? ["BLOCKED NEAR-MISS: FUNCTION F(n : INTEGER) RETURNS INTEGER", "  IF n = 0 THEN RETURN 1", "  RETURN n * F(n) // BLOCKED: n does not decrease", "REPAIR: replace F(n) with F(n - 1)"] : scenario === "broken-unreachable-base" ? ["BLOCKED NEAR-MISS: FUNCTION F(n : INTEGER) RETURNS INTEGER", "  IF n = 0 THEN RETURN 1", "  RETURN n * F(n + 1) // BLOCKED: n moves away from 0", "REPAIR: replace F(n + 1) with F(n - 1)"] : scenario.includes("factorial") ? ["FUNCTION Factorial(Number : INTEGER) RETURNS INTEGER", "  IF Number = 0 THEN", "    RETURN 1", "  ENDIF", "  ChildResult ← Factorial(Number - 1)", "  RETURN Number * ChildResult", "ENDFUNCTION"] : ["FUNCTION ListSum(Data : ARRAY OF INTEGER, Index : INTEGER, UpperBound : INTEGER) RETURNS INTEGER", "  IF Index > UpperBound THEN RETURN 0", "  ChildResult ← ListSum(Data, Index + 1, UpperBound)", "  RETURN Data[Index] + ChildResult", "ENDFUNCTION"];

export interface CallFrame { frameId: string; function: string; argument: number; locals: Record<string, number>; resumePoint: string; }
export interface CallStackState { frames: CallFrame[]; topFrameId: string | null; phase: "ready" | "push" | "base-return" | "unwind" | "complete"; callTree: Array<{ parent: string | null; child: string }>; outputExpression: string; poppedFrameId: string | null; childResultReceived: number | null; returned: number | null; result: number | null; }
const callStackScenarios = { "factorial-4": 4 } as const;
export function callStackTrace(scenarioInput: string): ComputationalTrace<CallStackState> {
  const scenario = requireScenario(scenarioInput, callStackScenarios); let state: CallStackState = { frames: [], topFrameId: null, phase: "ready", callTree: [], outputExpression: "Factorial(4)", poppedFrameId: null, childResultReceived: null, returned: null, result: null };
  const steps = [step("ready", L("Separate three projections", "Tách ba projection"), L("The call tree, live LIFO stack and returned expression are synchronized views, not one structure.", "Call tree, stack LIFO đang live và biểu thức return là các view đồng bộ, không phải một cấu trúc."), L("The first event pushes Factorial(4).", "Event đầu tiên push Factorial(4)."), "Call Factorial(4)", state, state)];
  for (let n = 4; n >= 0; n -= 1) {
    const before = state, frame: CallFrame = { frameId: `factorial-${n}`, function: "Factorial", argument: n, locals: {}, resumePoint: n === 0 ? "RETURN 1" : "RETURN n * childResult" }, parent = state.topFrameId;
    state = { ...state, frames: [...state.frames, frame], topFrameId: frame.frameId, phase: "push", callTree: [...state.callTree, { parent, child: frame.frameId }], poppedFrameId: null, childResultReceived: null, returned: null, outputExpression: `${"  ".repeat(4 - n)}Factorial(${n})` };
    steps.push(step(`push-${n}`, L(`Push frame ${frame.frameId}`, `Push frame ${frame.frameId}`), L("Every invocation receives a distinct frame and resume point.", "Mỗi invocation nhận frame và resume point riêng."), L(`${frame.frameId} is now the active top frame.`, `${frame.frameId} giờ là frame active trên cùng.`), n === 0 ? "IF Number = 0 THEN RETURN 1" : "ChildResult ← Factorial(Number - 1)", before, state, "push-frame"));
  }
  let childResult = 1;
  for (let n = 0; n <= 4; n += 1) {
    const before = state, popped = before.frames[before.frames.length - 1], received = n === 0 ? null : childResult, returned = n === 0 ? 1 : n * childResult; childResult = returned; let frames = before.frames.slice(0, -1); if (frames.length) frames = frames.map((frame, frameIndex) => frameIndex === frames.length - 1 ? { ...frame, locals: { ...frame.locals, childResult: returned } } : frame);
    state = { ...state, frames, topFrameId: frames.at(-1)?.frameId ?? null, phase: n === 0 ? "base-return" : n === 4 ? "complete" : "unwind", poppedFrameId: popped.frameId, childResultReceived: received, returned, result: n === 4 ? returned : null, outputExpression: n === 0 ? "1" : `${n} * ${received} = ${returned}` };
    steps.push(step(`return-${n}`, L(n === 0 ? "Return the base value" : `Unwind frame factorial-${n}`, n === 0 ? "Trả về base value" : `Unwind frame factorial-${n}`), n === 0 ? L("The base frame returns 1 and pops.", "Base frame trả về 1 rồi pop.") : L("The child result enters this frame's saved resume expression before the frame pops.", "Child result đi vào resume expression đã lưu của frame này trước khi frame pop."), L(n === 4 ? "The stack is empty and the final result is 24." : `Pass ${returned} to ${state.topFrameId}.`, n === 4 ? "Stack rỗng và kết quả cuối là 24." : `Chuyển ${returned} cho ${state.topFrameId}.`), n === 0 ? "RETURN 1" : "RETURN Number * ChildResult", before, state, n === 0 ? "base-return" : "unwind-return"));
  }
  return finishTrace(scenario, L("Push one distinct frame per call; unwind and pop in LIFO order; pass each returned value to the correct resume point.", "Push một frame riêng cho mỗi call; unwind và pop theo LIFO; chuyển mỗi giá trị return tới đúng resume point."), recursionPseudocode("numeric-factorial-4"), steps);
}

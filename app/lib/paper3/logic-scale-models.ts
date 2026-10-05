import type { Localized } from "./catalog";

export type LogicScaleKind = "adders" | "sr-jk-flip-flops" | "boolean-simplification" | "karnaugh-map";
export type Bit = 0 | 1;
export interface ScaleStep<S> { readonly id: string; readonly title: Localized; readonly action: Localized; readonly why: Localized; readonly outcome: Localized; readonly before: S; readonly after: S }
export const L = (en: string, vi: string): Localized => ({ en, vi });
export function freeze<T>(value: T): T { if (value !== null && typeof value === "object" && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function bits(values: readonly number[]) { if (values.some(value => value !== 0 && value !== 1)) throw new RangeError("Bits must be 0 or 1"); }

export type BooleanExpression = { readonly op: "input"; readonly name: string } | { readonly op: "constant"; readonly value: Bit } | { readonly op: "NOT"; readonly child: BooleanExpression } | { readonly op: "AND" | "OR" | "XOR"; readonly left: BooleanExpression; readonly right: BooleanExpression };
/** Bounded typed parser: no JavaScript evaluation; NOT > AND > XOR > OR. */
export function parseBoolean(source: string): BooleanExpression {
  if (!source.trim() || source.length > 256) throw new RangeError("Expression must contain 1–256 characters");
  const tokens = source.toUpperCase().match(/NOT|AND|XOR|OR|[A-D01()]|\S/g) ?? [];
  let index = 0;
  const atom = (): BooleanExpression => { const token = tokens[index++]; if (token === "NOT") return { op: "NOT", child: atom() }; if (token === "(") { const expr = binary(0); if (tokens[index++] !== ")") throw new RangeError("Missing closing bracket"); return expr; } if (token === "0" || token === "1") return { op: "constant", value: Number(token) as Bit }; if (/^[A-D]$/.test(token ?? "")) return { op: "input", name: token }; throw new RangeError("Expected A–D, 0/1, NOT or brackets"); };
  const operators = ["OR", "XOR", "AND"] as const;
  const binary = (level: number): BooleanExpression => { if (level === operators.length) return atom(); let left = binary(level + 1); while (tokens[index] === operators[level]) { const op = operators[level]; index++; left = { op, left, right: binary(level + 1) }; } return left; };
  const expression = binary(0); if (index !== tokens.length) throw new RangeError("Unexpected expression token"); return freeze(expression);
}
export function evaluateBoolean(expression: BooleanExpression, inputs: Readonly<Record<string, Bit>>): Bit {
  if (expression.op === "constant") return expression.value;
  if (expression.op === "input") { const value = inputs[expression.name]; if (value !== 0 && value !== 1) throw new RangeError("Missing declared input " + expression.name); return value; }
  if (expression.op === "NOT") return evaluateBoolean(expression.child, inputs) === 1 ? 0 : 1;
  const left = evaluateBoolean(expression.left, inputs), right = evaluateBoolean(expression.right, inputs);
  return expression.op === "AND" ? (left & right) as Bit : expression.op === "OR" ? (left | right) as Bit : (left ^ right) as Bit;
}
export interface BooleanRow { readonly bits: string; readonly inputs: Readonly<Record<string, Bit>>; readonly original: Bit; readonly candidate: Bit }
export function equivalence(original: string, candidate: string, variables: readonly string[]) {
  if (variables.length < 1 || variables.length > 4 || new Set(variables).size !== variables.length || variables.some(name => !/^[A-D]$/.test(name))) throw new RangeError("Declare 1–4 distinct Boolean inputs");
  const a = parseBoolean(original), b = parseBoolean(candidate);
  const rows: BooleanRow[] = Array.from({ length: 2 ** variables.length }, (_, n) => { const vector = n.toString(2).padStart(variables.length, "0"); const inputs = Object.fromEntries(variables.map((name, i) => [name, Number(vector[i]) as Bit])); return { bits: vector, inputs, original: evaluateBoolean(a, inputs), candidate: evaluateBoolean(b, inputs) }; });
  return freeze({ equivalent: rows.every(row => row.original === row.candidate), counterexample: rows.find(row => row.original !== row.candidate) ?? null, rows });
}
export function booleanCircuit(source: string, inputs: Readonly<Record<string, Bit>>) {
  const nodes: { id: string; operation: "NOT" | "AND" | "OR" | "XOR"; inputs: readonly { signal: string; value: Bit }[]; output: Bit }[] = [];
  const walk = (expression: BooleanExpression): { signal: string; value: Bit } => { if (expression.op === "input") return { signal: expression.name, value: evaluateBoolean(expression, inputs) }; if (expression.op === "constant") return { signal: String(expression.value), value: expression.value }; const children = expression.op === "NOT" ? [walk(expression.child)] : [walk(expression.left), walk(expression.right)]; const id = `g${nodes.length + 1}`; const value = evaluateBoolean(expression, inputs); nodes.push({ id, operation: expression.op, inputs: children, output: value }); return { signal: id, value }; };
  const output = walk(parseBoolean(source)); return freeze({ nodes, output });
}

export type AdderKind = "half" | "full";
export interface AdderValues { readonly A: Bit; readonly B: Bit; readonly Cin: Bit | null; readonly p: Bit; readonly c1: Bit; readonly c2: Bit | null; readonly sum: Bit; readonly carry: Bit; readonly total: number }
export function adderValues(kind: AdderKind, vector: string): AdderValues {
  if (!["half", "full"].includes(kind) || !/^[01]+$/.test(vector) || vector.length !== (kind === "half" ? 2 : 3)) throw new RangeError("Invalid adder input");
  const [A, B, inputCarry] = [...vector].map(Number) as Bit[];
  const Cin = kind === "full" ? inputCarry : null, p = (A ^ B) as Bit, c1 = (A & B) as Bit;
  const sum = (p ^ (Cin ?? 0)) as Bit, c2 = Cin === null ? null : (p & Cin) as Bit, carry = (c1 | (c2 ?? 0)) as Bit;
  return freeze({ A, B, Cin, p, c1, c2, sum, carry, total: A + B + (Cin ?? 0) });
}
export function adderTable(kind: AdderKind) { const width = kind === "half" ? 2 : 3; return freeze(Array.from({ length: 2 ** width }, (_, value) => { const vector = value.toString(2).padStart(width, "0"); return { vector, ...adderValues(kind, vector) }; })); }
export interface AdderState { readonly inputs: Readonly<Record<string, Bit>>; readonly known: Readonly<Record<string, Bit | null>>; readonly active: string | null; readonly verified: boolean }
export function adderTrace(kind: AdderKind, vector: string) {
  const result = adderValues(kind, vector);
  const inputs: Record<string, Bit> = { A: result.A, B: result.B }; if (kind === "full") inputs.Cin = result.Cin!;
  const known: Record<string, Bit | null> = { p: null, c1: null, sum: null, carry: null }; if (kind === "full") known.c2 = null;
  let state: AdderState = freeze({ inputs, known, active: null, verified: false });
  const definitions: readonly { id: string; node: string | null; expression: string; value?: Bit; title: Localized }[] = [
    { id: "inputs", node: null, expression: Object.entries(state.inputs).map(([name, bit]) => `${name}=${bit}`).join(", "), title: L("Set the input bits", "Đặt các bit đầu vào") },
    { id: "xor-ab", node: "p", expression: "p = A XOR B", value: result.p, title: L("First XOR: partial sum", "XOR đầu: tổng tạm") },
    { id: "and-ab", node: "c1", expression: "c1 = A AND B", value: result.c1, title: L("First AND: carry", "AND đầu: bit nhớ") },
    ...(kind === "full" ? [{ id: "xor-cin", node: "sum", expression: "S = p XOR Cin", value: result.sum, title: L("Include carry-in", "Tính cả carry-in") }, { id: "and-cin", node: "c2", expression: "c2 = p AND Cin", value: result.c2!, title: L("Second carry path", "Nhánh nhớ thứ hai") }, { id: "carry-or", node: "carry", expression: "Cout = c1 OR c2", value: result.carry, title: L("Combine the carry paths", "Gộp hai nhánh nhớ") }] : []),
    { id: "numeric-check", node: null, expression: `2 × ${result.carry} + ${result.sum} = ${result.total}`, title: L("Check the numeric sum", "Kiểm tra tổng số học") },
  ];
  const initial = state;
  const steps = definitions.map(definition => { const before = state; const known = { ...state.known }; if (definition.node) known[definition.node] = definition.value!; if (kind === "half" && definition.node === "p") known.sum = result.sum; if (kind === "half" && definition.node === "c1") known.carry = result.carry;
    state = freeze({ ...state, known, active: definition.node, verified: definition.id === "numeric-check" });
    return freeze({ id: definition.id, title: definition.title, action: L(definition.expression, definition.expression), why: definition.id === "numeric-check" ? L("Carry has weight two; sum has weight one. Verify every input combination in the table.", "Bit nhớ có trọng số hai; bit tổng có trọng số một. Kiểm tra mọi tổ hợp trong bảng.") : L("Each named signal is computed from the shown inputs; arrows identify its next gate.", "Mỗi tín hiệu có tên được tính từ đầu vào hiển thị; mũi tên cho biết cổng kế tiếp."), outcome: L(definition.node ? `${definition.node} = ${definition.value}` : definition.id === "numeric-check" ? "The arithmetic identity holds." : "No gate has been evaluated yet.", definition.node ? `${definition.node} = ${definition.value}` : definition.id === "numeric-check" ? "Đẳng thức số học được thỏa mãn." : "Chưa tính cổng nào."), before, after: state }); });
  return freeze({ id: kind, vector, result, initial, steps, rows: adderTable(kind) });
}

export type StoredBit = Bit | null;
export interface SrState { readonly Q: StoredBit; readonly Qbar: StoredBit; readonly status: "known" | "invalid" | "indeterminate" }
export function srTransition(previous: SrState, S: Bit, R: Bit): SrState { bits([S, R]); if (S === 1 && R === 1) return freeze({ Q: 0, Qbar: 0, status: "invalid" }); if (S === 1) return freeze({ Q: 1, Qbar: 0, status: "known" }); if (R === 1) return freeze({ Q: 0, Qbar: 1, status: "known" }); if (previous.status !== "known") return freeze({ Q: null, Qbar: null, status: "indeterminate" }); return freeze({ ...previous }); }
export function jkTransition(Q: Bit, J: Bit, K: Bit, risingEdge: boolean): Bit { bits([Q, J, K]); if (!risingEdge || (J === 0 && K === 0)) return Q; if (J === 0) return 0; if (K === 0) return 1; return Q === 1 ? 0 : 1; }

export const simplificationExamples = freeze([
  { id: "factor-complements", label: L("Factor complementary terms", "Đặt nhân tử với hai phần bù"), variables: ["A", "B"], expressions: ["(A AND B) OR (A AND NOT B)", "A AND (B OR NOT B)", "A AND 1", "A"], laws: [L("Original", "Ban đầu"), L("Distributive law", "Luật phân phối"), L("Complement law", "Luật phần bù"), L("Identity law", "Luật đồng nhất")] },
  { id: "de-morgan", label: L("De Morgan then factor", "De Morgan rồi đặt nhân tử"), variables: ["A", "B"], expressions: ["NOT (A OR B) OR (NOT A AND B)", "(NOT A AND NOT B) OR (NOT A AND B)", "NOT A AND (NOT B OR B)", "NOT A AND 1", "NOT A"], laws: [L("Original", "Ban đầu"), L("De Morgan's law", "Luật De Morgan"), L("Distributive law", "Luật phân phối"), L("Complement law", "Luật phần bù"), L("Identity law", "Luật đồng nhất")] },
  { id: "absorption", label: L("Absorption", "Hấp thụ"), variables: ["A", "B"], expressions: ["A OR (A AND B)", "A"], laws: [L("Original", "Ban đầu"), L("Absorption law", "Luật hấp thụ")] },
] as const);
export interface SimplificationState { readonly expression: string; readonly law: Localized; readonly rows: readonly BooleanRow[]; readonly equivalent: boolean }
export function simplificationTrace(id: string) {
  const example = simplificationExamples.find(item => item.id === id); if (!example) throw new RangeError("Unsupported simplification example");
  const original = example.expressions[0];
  let state: SimplificationState = freeze({ expression: original, law: example.laws[0], ...equivalence(original, original, example.variables) });
  const initial = state;
  const steps: ScaleStep<SimplificationState>[] = example.expressions.map((expression, index) => { const before = state; state = freeze({ expression, law: example.laws[index], ...equivalence(original, expression, example.variables) }); return freeze({ id: ({ "factor-complements": ["original", "factor", "complement", "identity"], "de-morgan": ["original", "de-morgan", "factor", "complement", "identity"], "absorption": ["original", "absorb"] } as Record<string, readonly string[]>)[id][index], title: example.laws[index], action: L(expression, expression), why: index === 0 ? L("Start with the original function and enumerate all input combinations.", "Bắt đầu từ hàm gốc và liệt kê mọi tổ hợp đầu vào.") : L("This law rewrites the expression without changing the function; both truth columns must agree on every row.", "Luật biến đổi biểu thức nhưng không đổi hàm; hai cột chân trị phải trùng nhau ở mọi hàng."), outcome: L(`All ${state.rows.length} truth rows agree.`, `Cả ${state.rows.length} hàng chân trị đều trùng khớp.`), before, after: state }); });
  return freeze({ id, label: example.label, variables: example.variables, original, initial, steps });
}
export function simplificationChoices(id: string, stepIndex: number) {
  const trace = simplificationTrace(id), next = trace.steps[Math.min(stepIndex + 1, trace.steps.length - 1)];
  return freeze([{ id: "reviewed-law", label: next.after.law, expression: next.after.expression }, { id: "drop-term", label: L("Drop an OR term without a law", "Bỏ một hạng OR khi chưa có luật"), expression: "A AND B" }]);
}
export function simplificationAttempt(original: string, candidate: string, variables: readonly string[]) {
  try { const comparison = equivalence(original, candidate, variables); return freeze({ validSyntax: true, ...comparison, feedback: comparison.equivalent ? L("Equivalent: every truth-table row agrees. The proposed step may be accepted.", "Tương đương: mọi hàng chân trị trùng nhau. Có thể chấp nhận bước đề xuất.") : L(`Rejected: input ${comparison.counterexample!.bits} gives original=${comparison.counterexample!.original}, candidate=${comparison.counterexample!.candidate}. The current expression is unchanged.`, `Từ chối: đầu vào ${comparison.counterexample!.bits} cho biểu thức gốc=${comparison.counterexample!.original}, đề xuất=${comparison.counterexample!.candidate}. Giữ nguyên biểu thức hiện tại.`) }); }
  catch { return freeze({ validSyntax: false, equivalent: false, counterexample: null, rows: [] as BooleanRow[], feedback: L("Use declared inputs A–D, NOT/AND/OR/XOR, 0/1 and matching brackets. The expression is unchanged.", "Dùng đầu vào đã khai báo A–D, NOT/AND/OR/XOR, 0/1 và ngoặc khớp. Biểu thức không đổi.") }); }
}

export const karnaughExamples = freeze([
  { id: "two-input-nand", label: L("Two inputs · NAND", "Hai đầu vào · NAND"), variables: ["A", "B"], rowVariables: ["A"], columnVariables: ["B"], rowLabels: ["0", "1"], columnLabels: ["0", "1"], ones: [0, 1, 2], groups: [[0, 1], [0, 2]] },
  { id: "three-input-majority", label: L("Three inputs · overlapping groups", "Ba đầu vào · nhóm chồng lấp"), variables: ["A", "B", "C"], rowVariables: ["A"], columnVariables: ["B", "C"], rowLabels: ["0", "1"], columnLabels: ["00", "01", "11", "10"], ones: [3, 5, 6, 7], groups: [[3, 7], [5, 7], [6, 7]] },
  { id: "four-input-corners", label: L("Four inputs · wrap around corners", "Bốn đầu vào · nối qua bốn góc"), variables: ["A", "B", "C", "D"], rowVariables: ["A", "B"], columnVariables: ["C", "D"], rowLabels: ["00", "01", "11", "10"], columnLabels: ["00", "01", "11", "10"], ones: [0, 2, 8, 10], groups: [[0, 2, 8, 10]] },
] as const);
export function karnaughMap(id: string) {
  const example = karnaughExamples.find(item => item.id === id); if (!example) throw new RangeError("Unsupported Karnaugh map");
  const cells = example.rowLabels.flatMap((row, rowIndex) => example.columnLabels.map((column, columnIndex) => { const vector = row + column; const minterm = parseInt(vector, 2); return { id: minterm, row: rowIndex, column: columnIndex, bits: vector, value: (example.ones as readonly number[]).includes(minterm) ? 1 as Bit : 0 as Bit }; }));
  return freeze({ ...example, cells });
}
export type GroupReason = "empty" | "duplicate" | "unknown" | "zero" | "size" | "rectangle" | "valid";
export function validateKarnaughGroup(id: string, selection: readonly number[]) {
  const map = karnaughMap(id); let reason: GroupReason = "valid";
  const chosen = map.cells.filter(cell => selection.includes(cell.id));
  const power = (n: number) => n > 0 && (n & (n - 1)) === 0;
  const consecutive = (values: readonly number[], length: number) => values.some(start => Array.from({ length: values.length }, (_, offset) => (start + offset) % length).every(value => values.includes(value)));
  const rows = [...new Set(chosen.map(cell => cell.row))], columns = [...new Set(chosen.map(cell => cell.column))];
  if (!selection.length) reason = "empty"; else if (new Set(selection).size !== selection.length) reason = "duplicate"; else if (chosen.length !== selection.length) reason = "unknown"; else if (!power(selection.length)) reason = "size"; else if (chosen.some(cell => cell.value === 0)) reason = "zero"; else if (selection.length !== rows.length * columns.length || !power(rows.length) || !power(columns.length) || !consecutive(rows, map.rowLabels.length) || !consecutive(columns, map.columnLabels.length)) reason = "rectangle";
  const term = reason === "valid" ? map.variables.flatMap((name, index) => chosen.every(cell => cell.bits[index] === chosen[0].bits[index]) ? [chosen[0].bits[index] === "1" ? name : `NOT ${name}`] : []).join(" AND ") || "1" : null;
  const feedback: Record<GroupReason, Localized> = { empty: L("Select at least one cell.", "Chọn ít nhất một ô."), duplicate: L("A cell cannot occur twice inside one group.", "Một ô không được lặp hai lần trong cùng nhóm."), unknown: L("The selection contains an unknown cell.", "Lựa chọn chứa ô không tồn tại."), zero: L("Rejected: a group must contain only 1 cells.", "Từ chối: nhóm chỉ được chứa các ô 1."), size: L("Rejected: group size must be a power of two.", "Từ chối: số ô phải là lũy thừa của hai."), rectangle: L("Rejected: use a complete adjacent rectangle; opposite edges may join, diagonals may not.", "Từ chối: chọn hình chữ nhật liền kề đầy đủ; cạnh đối diện có thể nối, đường chéo không được."), valid: L(`Valid group → ${term}. Overlap with another group is allowed.`, `Nhóm hợp lệ → ${term}. Được chồng lấp với nhóm khác.`) };
  return freeze({ valid: reason === "valid", reason, selection: [...selection], term, feedback: feedback[reason], wrapsRows: rows.length > 1 && rows.length < map.rowLabels.length && rows.includes(0) && rows.includes(map.rowLabels.length - 1), wrapsColumns: columns.length > 1 && columns.length < map.columnLabels.length && columns.includes(0) && columns.includes(map.columnLabels.length - 1) });
}
export function karnaughSolution(id: string, groups: readonly (readonly number[])[]) {
  const map = karnaughMap(id), checked = groups.map(group => validateKarnaughGroup(id, group));
  const valid = checked.every(group => group.valid), covered = [...new Set(groups.filter((_, index) => checked[index].valid).flat())].sort((a, b) => a - b);
  const terms = checked.filter(group => group.valid).map(group => group.term!); const expression = terms.length ? terms.map(term => `(${term})`).join(" OR ") : "0";
  const source = map.ones.map(value => map.variables.map((name, index) => value.toString(2).padStart(map.variables.length, "0")[index] === "1" ? name : `NOT ${name}`).join(" AND ")).map(term => `(${term})`).join(" OR ") || "0";
  const comparison = equivalence(source, expression, map.variables), complete = valid && map.ones.every(value => covered.includes(value)) && comparison.equivalent;
  return freeze({ valid, covered, uncovered: map.ones.filter(value => !covered.includes(value)), terms, expression, complete, ...comparison });
}

export interface FlipState { readonly kind: "sr-nor" | "jk-edge"; readonly input1: Bit; readonly input2: Bit; readonly Q: StoredBit; readonly Qbar: StoredBit; readonly previousQ: StoredBit; readonly status: string; readonly activeEdge: boolean }
export function flipTransition(previous: FlipState, input1: Bit, input2: Bit, activeEdge: boolean): FlipState {
  const next=previous.kind==="sr-nor"?srTransition({Q:previous.Q,Qbar:previous.Qbar,status:previous.status as SrState["status"]},input1,input2):(()=>{const Q=jkTransition(previous.Q as Bit,input1,input2,activeEdge);return {Q,Qbar:(1-Q) as Bit,status:"known"};})();
  return freeze({...previous,...next,input1,input2,previousQ:previous.Q,activeEdge:previous.kind==="jk-edge"&&activeEdge});
}
export function flipFlopTrace(kind: "sr-nor" | "jk-edge") {
  if (!["sr-nor", "jk-edge"].includes(kind)) throw new RangeError("Unsupported storage convention");
  const events: readonly (readonly [string, Bit, Bit, boolean])[] = kind === "sr-nor" ? [["initial",0,0,false],["set",1,0,false],["hold-set",0,0,false],["reset",0,1,false],["hold-reset",0,0,false],["invalid",1,1,false],["release-invalid",0,0,false],["recover-set",1,0,false]] : [["initial",0,0,false],["set",1,0,true],["hold",0,0,true],["toggle-to-zero",1,1,true],["toggle-to-one",1,1,true],["no-edge",0,1,false],["reset",0,1,true]];
  let state: FlipState = freeze({ kind, input1: 0, input2: 0, Q: 0, Qbar: 1, previousQ: 0, status: "known", activeEdge: false }); const initial = state;
  const steps: ScaleStep<FlipState>[] = events.map(([id, a, b, edge]) => { const before = state; const next = kind === "sr-nor" ? srTransition({ Q: before.Q, Qbar: before.Qbar, status: before.status as SrState["status"] }, a, b) : (() => { const Q = jkTransition(before.Q as Bit, a, b, edge); return { Q, Qbar: (1 - Q) as Bit, status: "known" }; })();
    state = freeze({ kind, input1: a, input2: b, ...next, previousQ: before.Q, activeEdge: edge });
    const title = id === "initial" ? L("Initial state", "Trạng thái ban đầu") : id === "invalid" ? L("Forbidden SR inputs", "Đầu vào SR bị cấm") : id === "release-invalid" ? L("Release the forbidden state", "Nhả trạng thái bị cấm") : id === "no-edge" ? L("No active clock edge", "Không có cạnh clock tác động") : id.startsWith("toggle") ? L("Toggle on the rising edge", "Đảo trạng thái tại cạnh lên") : id.includes("hold") ? L("Hold the stored value", "Giữ giá trị đã lưu") : id === "set" || id === "recover-set" ? L("Set Q to one", "Đặt Q bằng một") : L("Reset Q to zero", "Đặt Q bằng không");
    return freeze({ id, title, before, after: state, action: L(`${kind === "sr-nor" ? "S/R" : "J/K"}=${a}${b}${kind === "jk-edge" ? edge ? "; rising edge" : "; no rising edge" : "; no clock"}.`, `${kind === "sr-nor" ? "S/R" : "J/K"}=${a}${b}${kind === "jk-edge" ? edge ? "; có cạnh lên" : "; không có cạnh lên" : "; không dùng clock"}.`), why: kind === "sr-nor" ? L("The active-high NOR latch uses cross-coupled feedback. 11 forces both outputs low; release does not determine which stable state wins.", "Chốt NOR tích cực mức cao dùng hồi tiếp chéo. 11 ép hai đầu ra xuống0; khi nhả không xác định trạng thái ổn định nào sẽ thắng.") : L("This is an edge-triggered functional abstraction: without a rising edge Q holds; J=K=1 toggles the previous Q only at the edge.", "Đây là mô hình chức năng kích theo cạnh: không có cạnh lên thì giữ Q; J=K=1 chỉ đảo Q trước đó tại cạnh lên."), outcome: L(`Q=${state.Q ?? "indeterminate"}; Qbar=${state.Qbar ?? "indeterminate"}.`, `Q=${state.Q ?? "chưa xác định"}; Qbar=${state.Qbar ?? "chưa xác định"}.`) }); });
  return freeze({ id: kind, initial, steps });
}

export function karnaughTrace(id: string) {
  const map = karnaughMap(id); const group = [...map.groups[0]]; const checked = validateKarnaughGroup(id, group); const solution = karnaughSolution(id, map.groups);
  const snapshots = [
    { id: "place-values", title: L("Place values in Gray order", "Đặt giá trị theo mã Gray"), selected: [] as number[], groups: [] as readonly (readonly number[])[], term: null as string | null },
    { id: "select-group", title: L("Select an adjacent group", "Chọn nhóm liền kề"), selected: group, groups: [], term: null },
    { id: "validate-group", title: L("Validate the rectangle", "Kiểm tra hình chữ nhật"), selected: group, groups: [], term: null },
    { id: "derive-term", title: L("Keep unchanged variables", "Giữ biến không đổi"), selected: group, groups: [group], term: checked.term },
    { id: "combine-terms", title: L("Cover all 1 cells", "Phủ mọi ô1"), selected: [], groups: map.groups, term: solution.expression },
    { id: "verify-equivalence", title: L("Check the full truth table", "Kiểm tra toàn bộ bảng chân trị"), selected: [], groups: map.groups, term: solution.expression },
  ];
  const initial = freeze({ selected: [] as readonly number[], groups: [] as readonly (readonly number[])[], term: null as string | null, verified: false }); let state = initial;
  const groupNames=group.map(value=>`m${value}`).join(", ");
  const phaseActions:Record<string,Localized>={"place-values":L("Place each truth value at its binary row/column address in Gray order.","Đặt từng giá trị chân trị tại địa chỉ nhị phân hàng/cột theo thứ tự Gray."),"select-group":L(`Select ${groupNames}.`,`Chọn ${groupNames}.`),"validate-group":L("Check the selected cells: only1s, power-of-two size and a complete adjacent rectangle, allowing opposite-edge wrap.","Kiểm tra ô đã chọn: chỉ có1, số ô là lũy thừa hai, hình chữ nhật liền kề đầy đủ và được nối qua cạnh đối diện."),"derive-term":L(`Keep the literals unchanged across ${groupNames}.`,`Giữ các literal không đổi trên ${groupNames}.`),"combine-terms":L("OR the derived product terms and inspect coverage of every1 cell.","OR các tích đã suy ra và kiểm tra phủ mọi ô1."),"verify-equivalence":L("Compare the original function and derived SOP on every input row.","So hàm gốc với SOP suy ra trên mọi hàng đầu vào.")};
  const steps = snapshots.map(snapshot => { const before = state; state = freeze({ selected: snapshot.selected, groups: snapshot.groups, term: snapshot.term, verified: snapshot.id === "verify-equivalence" });const coverage=karnaughSolution(id,state.groups);
    const outcomes:Record<string,Localized>={"place-values":L(`${map.ones.length} one-cells placed; no group selected or validated.`,`Đã đặt ${map.ones.length} ô1; chưa chọn hay kiểm tra nhóm.`),"select-group":L(`${groupNames} selected; validation is the next step.`,`Đã chọn ${groupNames}; bước kế tiếp kiểm tra tính hợp lệ.`),"validate-group":L(`Valid group of ${group.length} cells; its invariant term is ${checked.term}.`,`Nhóm ${group.length} ô hợp lệ; tích không đổi tương ứng là ${checked.term}.`),"derive-term":L(`Term ${checked.term}; uncovered1 cells: ${coverage.uncovered.map(value=>`m${value}`).join(", ")||"none"}.`,`Tích ${checked.term}; ô1 chưa phủ: ${coverage.uncovered.map(value=>`m${value}`).join(", ")||"không còn"}.`),"combine-terms":L(`All ${map.ones.length} one-cells are covered by ${state.groups.length} groups; SOP = ${coverage.expression}.`,`Cả ${map.ones.length} ô1 được phủ bởi ${state.groups.length} nhóm; SOP = ${coverage.expression}.`),"verify-equivalence":L(`All ${solution.rows.length} input rows agree; the derived SOP is equivalent.`,`Cả ${solution.rows.length} hàng đầu vào trùng nhau; SOP suy ra tương đương.`)};
    return freeze({ id: snapshot.id, title: snapshot.title, before, after: state, action:phaseActions[snapshot.id], why: snapshot.id==="verify-equivalence"?L("Checking every input combination proves equivalence for this finite Boolean function.","Kiểm tra mọi tổ hợp đầu vào chứng minh tương đương cho hàm Boolean hữu hạn này."):L("Gray neighbours differ in one bit. A power-of-two rectangle may wrap across opposite edges; keep only literals constant throughout the group. Overlap is allowed.", "Ô kề Gray khác một bit. Hình chữ nhật lũy thừa hai có thể nối qua cạnh đối diện; chỉ giữ literal không đổi trong nhóm. Được phép chồng lấp."), outcome:outcomes[snapshot.id] }); });
  return freeze({ id, initial, steps, map, solution });
}

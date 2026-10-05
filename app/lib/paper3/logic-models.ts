import type { Localized } from "./catalog";

export type Bit = 0 | 1;
export type LogicVisualKind = "logic-circuit" | "adders" | "sr-jk-flip-flops" | "boolean-simplification" | "karnaugh-map";
export type CircuitExampleId = "2-input" | "3-input";
export interface LogicGate {
  readonly id: string;
  readonly operation: "NOT" | "AND" | "OR" | "XOR";
  readonly inputs: readonly string[];
}
export interface CircuitDefinition {
  readonly id: CircuitExampleId;
  readonly label: Localized;
  readonly inputs: readonly string[];
  readonly defaults: readonly Bit[];
  readonly expression: string;
  readonly gates: readonly LogicGate[];
  readonly output: string;
}
export interface TruthRow {
  readonly inputBits: string;
  readonly inputs: Readonly<Record<string, Bit>>;
  readonly nodeValues: Readonly<Record<string, Bit>>;
  readonly output: Bit;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const circuitExamples: readonly CircuitDefinition[] = deepFreeze([
  { id: "2-input", label: { en: "Two inputs · AND, NOT, OR", vi: "Hai đầu vào · AND, NOT, OR" }, inputs: ["A", "B"], defaults: [0, 0], expression: "(A AND B) OR NOT A", gates: [{ id: "nA", operation: "NOT", inputs: ["A"] }, { id: "ab", operation: "AND", inputs: ["A", "B"] }, { id: "y", operation: "OR", inputs: ["ab", "nA"] }], output: "y" },
  { id: "3-input", label: { en: "Three inputs · shared C", vi: "Ba đầu vào · dùng chung C" }, inputs: ["A", "B", "C"], defaults: [0, 0, 1], expression: "(A AND B AND C) OR (NOT A AND C)", gates: [{ id: "nA", operation: "NOT", inputs: ["A"] }, { id: "abc", operation: "AND", inputs: ["A", "B", "C"] }, { id: "nAc", operation: "AND", inputs: ["nA", "C"] }, { id: "y", operation: "OR", inputs: ["abc", "nAc"] }], output: "y" },
]);

export function circuitDefinition(id: string): CircuitDefinition {
  const example = circuitExamples.find(item => item.id === id);
  if (!example) throw new RangeError("Unsupported circuit example: " + id);
  return example;
}

/** One typed gate evaluator supplies both diagrams and complete truth tables. */
export function evaluateGate(operation: LogicGate["operation"], values: readonly Bit[]): Bit {
  if (values.some(value => value !== 0 && value !== 1) || (operation === "NOT" ? values.length !== 1 : values.length < 2)) throw new RangeError("Invalid Boolean gate inputs");
  switch (operation) {
    case "NOT": return values[0] === 0 ? 1 : 0;
    case "AND": return values.every(value => value === 1) ? 1 : 0;
    case "OR": return values.some(value => value === 1) ? 1 : 0;
    case "XOR": return values.reduce<number>((sum, value) => sum + value, 0) % 2 === 1 ? 1 : 0;
    default: throw new RangeError("Unsupported Boolean gate");
  }
}

export function evaluateCircuit(exampleId: string, inputBits: string): TruthRow {
  const example = circuitDefinition(exampleId);
  if (inputBits.length !== example.inputs.length || !/^[01]+$/.test(inputBits)) throw new RangeError("Input bits do not match the circuit");
  const inputs: Record<string, Bit> = {};
  example.inputs.forEach((name, index) => { inputs[name] = Number(inputBits[index]) as Bit; });
  const known: Record<string, Bit> = { ...inputs };
  const nodeValues: Record<string, Bit> = {};
  for (const gate of example.gates) {
    const values = gate.inputs.map(name => {
      const value = known[name];
      if (value !== 0 && value !== 1) throw new Error("Gate references an unavailable node: " + name);
      return value;
    });
    known[gate.id] = nodeValues[gate.id] = evaluateGate(gate.operation, values);
  }
  return deepFreeze({ inputBits, inputs, nodeValues, output: nodeValues[example.output] });
}

export function circuitTruthTable(exampleId: string): readonly TruthRow[] {
  const example = circuitDefinition(exampleId);
  return deepFreeze(Array.from({ length: 2 ** example.inputs.length }, (_, value) => evaluateCircuit(exampleId, value.toString(2).padStart(example.inputs.length, "0"))));
}

export function circuitSopTerms(exampleId: string): readonly string[] {
  const example = circuitDefinition(exampleId);
  return deepFreeze(circuitTruthTable(exampleId).filter(row => row.output === 1).map(row => example.inputs.map((name, index) => row.inputBits[index] === "1" ? name : `NOT ${name}`).join(" AND ")));
}

export function evaluateCircuitSop(exampleId: string, inputBits: string): Bit {
  const example = circuitDefinition(exampleId);
  evaluateCircuit(exampleId, inputBits); // Validate the same declared input domain.
  const terms = circuitTruthTable(exampleId).filter(row => row.output === 1);
  return terms.some(row => example.inputs.every((_, index) => row.inputBits[index] === inputBits[index])) ? 1 : 0;
}

export interface CircuitState {
  readonly inputBits: Readonly<Record<string, Bit>>;
  readonly nodeValues: Readonly<Record<string, Bit | null>>;
  readonly recordedRows: readonly string[];
  readonly highlightedOneRows: readonly string[];
  readonly sopTerms: readonly string[];
  readonly representation: "original-circuit" | "canonical-sop" | "sop-circuit";
  readonly activeNode: string | null;
  readonly equivalent: boolean | null;
}
export interface CircuitStep {
  readonly id: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly outcome: Localized;
  readonly before: CircuitState;
  readonly after: CircuitState;
}
export interface CircuitTrace {
  readonly exampleId: CircuitExampleId;
  readonly inputRow: string;
  readonly initial: CircuitState;
  readonly rows: readonly TruthRow[];
  readonly steps: readonly CircuitStep[];
}

export function circuitTrace(exampleId: string, inputRow: string): CircuitTrace {
  const example = circuitDefinition(exampleId);
  const result = evaluateCircuit(example.id, inputRow);
  const rows = circuitTruthTable(example.id);
  const initial: CircuitState = deepFreeze({ inputBits: result.inputs, nodeValues: Object.fromEntries(example.gates.map(gate => [gate.id, null])), recordedRows: [], highlightedOneRows: [], sopTerms: [], representation: "original-circuit", activeNode: null, equivalent: null });
  let state = initial;
  const steps: CircuitStep[] = [];
  for (const template of circuitNarration[example.id]) {
    const before = state;
    let action: Localized = template.action;
    let outcome: Localized = template.outcome;
    if (template.id === "inputs") {
      action = { en: `Use input row ${inputRow}.`, vi: `Dùng hàng đầu vào ${inputRow}.` };
    } else if (template.id.startsWith("gate-")) {
      const nodeId = template.id.slice(5);
      const nodeValue = result.nodeValues[nodeId];
      state = { ...state, nodeValues: { ...state.nodeValues, [nodeId]: nodeValue }, activeNode: nodeId };
      outcome = { en: `${nodeId} = ${nodeValue}; other known values are retained.`, vi: `${nodeId} = ${nodeValue}; các giá trị đã biết khác được giữ.` };
    } else if (template.id === "record-row") {
      state = { ...state, recordedRows: [inputRow], activeNode: null };
    } else if (template.id === "complete-table") {
      state = { ...state, recordedRows: rows.map(row => row.inputBits) };
    } else if (template.id === "select-ones") {
      state = { ...state, highlightedOneRows: rows.filter(row => row.output === 1).map(row => row.inputBits) };
    } else if (template.id === "derive-sop") {
      state = { ...state, sopTerms: circuitSopTerms(example.id), representation: "canonical-sop" };
    } else if (template.id === "rebuild-circuit") {
      state = { ...state, representation: "sop-circuit" };
    } else if (template.id === "verify-equivalence") {
      state = { ...state, equivalent: rows.every(row => row.output === evaluateCircuitSop(example.id, row.inputBits)) };
    }
    state = deepFreeze(state);
    steps.push(deepFreeze({ ...template, action, outcome, before, after: state }));
  }
  return deepFreeze({ exampleId: example.id, inputRow, initial, rows, steps });
}

// Reviewed narration templates; the state below is computed by the typed evaluator.
const circuitNarration = deepFreeze({
  "2-input": [
    {
      "id": "inputs",
      "title": {
        "en": "Set the inputs",
        "vi": "Đặt đầu vào"
      },
      "action": {
        "en": "Use input row 00.",
        "vi": "Dùng hàng đầu vào 00."
      },
      "why": {
        "en": "Each distinct input combination needs its own truth-table row.",
        "vi": "Mỗi tổ hợp đầu vào khác nhau cần một hàng chân trị riêng."
      },
      "outcome": {
        "en": "Internal nodes are not yet evaluated in this teaching trace.",
        "vi": "Các nút trung gian chưa được tính trong lượt minh họa này."
      }
    },
    {
      "id": "gate-nA",
      "title": {
        "en": "Evaluate nA",
        "vi": "Tính nA"
      },
      "action": {
        "en": "Apply NOT to A.",
        "vi": "Áp dụng NOT cho A."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "nA = 1; other known values are retained.",
        "vi": "nA = 1; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "gate-ab",
      "title": {
        "en": "Evaluate ab",
        "vi": "Tính ab"
      },
      "action": {
        "en": "Apply AND to A, B.",
        "vi": "Áp dụng AND cho A, B."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "ab = 0; other known values are retained.",
        "vi": "ab = 0; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "gate-y",
      "title": {
        "en": "Evaluate y",
        "vi": "Tính y"
      },
      "action": {
        "en": "Apply OR to ab, nA.",
        "vi": "Áp dụng OR cho ab, nA."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "y = 1; other known values are retained.",
        "vi": "y = 1; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "record-row",
      "title": {
        "en": "Record this row",
        "vi": "Ghi hàng hiện tại"
      },
      "action": {
        "en": "Copy inputs, intermediate values and Y into one row.",
        "vi": "Ghi đầu vào, giá trị trung gian và Y vào một hàng."
      },
      "why": {
        "en": "One tested combination is evidence for only that row.",
        "vi": "Một tổ hợp đã thử chỉ xác minh hàng đó."
      },
      "outcome": {
        "en": "The selected row is recorded; the table is not yet complete.",
        "vi": "Đã ghi hàng đang chọn; bảng chưa đầy đủ."
      }
    },
    {
      "id": "complete-table",
      "title": {
        "en": "Enumerate every input",
        "vi": "Liệt kê mọi đầu vào"
      },
      "action": {
        "en": "Evaluate all 4 combinations in binary order with A first.",
        "vi": "Tính đủ 4 tổ hợp theo thứ tự nhị phân, A đứng trước."
      },
      "why": {
        "en": "A complete truth table covers every possible input, not a few samples.",
        "vi": "Bảng chân trị đầy đủ bao phủ mọi đầu vào, không chỉ vài mẫu."
      },
      "outcome": {
        "en": "All 4 rows are available.",
        "vi": "Đã có đủ 4 hàng."
      }
    },
    {
      "id": "select-ones",
      "title": {
        "en": "Select the 1 rows",
        "vi": "Chọn các hàng bằng 1"
      },
      "action": {
        "en": "Highlight exactly the rows whose Y output is 1.",
        "vi": "Đánh dấu đúng các hàng có đầu ra Y bằng 1."
      },
      "why": {
        "en": "A sum-of-products expression must make each such row true.",
        "vi": "Biểu thức tổng các tích phải cho đúng tại từng hàng đó."
      },
      "outcome": {
        "en": "Selected rows: 00, 01, 11.",
        "vi": "Các hàng được chọn: 00, 01, 11."
      }
    },
    {
      "id": "derive-sop",
      "title": {
        "en": "Build the sum of products",
        "vi": "Lập tổng các tích"
      },
      "action": {
        "en": "AND the literals for each 1 row, then OR the products.",
        "vi": "AND các literal trong mỗi hàng 1 rồi OR các tích."
      },
      "why": {
        "en": "Use a complemented variable for bit 0 and the variable for bit 1.",
        "vi": "Dùng biến phủ định cho bit 0 và biến thường cho bit 1."
      },
      "outcome": {
        "en": "Y = (NOT A AND NOT B) OR (NOT A AND B) OR (A AND B)",
        "vi": "Y = (NOT A AND NOT B) OR (NOT A AND B) OR (A AND B)"
      }
    },
    {
      "id": "rebuild-circuit",
      "title": {
        "en": "Rebuild an equivalent circuit",
        "vi": "Dựng lại mạch tương đương"
      },
      "action": {
        "en": "Create an AND path for each product and combine paths with OR.",
        "vi": "Tạo nhánh AND cho mỗi tích rồi gộp các nhánh bằng OR."
      },
      "why": {
        "en": "The circuit follows the expression structure, including each required inversion.",
        "vi": "Mạch theo cấu trúc biểu thức, gồm từng phép đảo cần thiết."
      },
      "outcome": {
        "en": "The reconstructed circuit implements the canonical SOP.",
        "vi": "Mạch dựng lại thực hiện SOP chuẩn."
      }
    },
    {
      "id": "verify-equivalence",
      "title": {
        "en": "Check every row",
        "vi": "Kiểm mọi hàng"
      },
      "action": {
        "en": "Compare original-circuit and reconstructed-SOP outputs over the full table.",
        "vi": "So đầu ra mạch gốc và SOP dựng lại trên toàn bảng."
      },
      "why": {
        "en": "Equivalence requires matching outputs for every input combination.",
        "vi": "Tương đương đòi hỏi đầu ra khớp với mọi tổ hợp đầu vào."
      },
      "outcome": {
        "en": "All 4 outputs agree; the circuits are logically equivalent.",
        "vi": "Cả 4 đầu ra khớp; hai mạch tương đương logic."
      }
    }
  ],
  "3-input": [
    {
      "id": "inputs",
      "title": {
        "en": "Set the inputs",
        "vi": "Đặt đầu vào"
      },
      "action": {
        "en": "Use input row 000.",
        "vi": "Dùng hàng đầu vào 000."
      },
      "why": {
        "en": "Each distinct input combination needs its own truth-table row.",
        "vi": "Mỗi tổ hợp đầu vào khác nhau cần một hàng chân trị riêng."
      },
      "outcome": {
        "en": "Internal nodes are not yet evaluated in this teaching trace.",
        "vi": "Các nút trung gian chưa được tính trong lượt minh họa này."
      }
    },
    {
      "id": "gate-nA",
      "title": {
        "en": "Evaluate nA",
        "vi": "Tính nA"
      },
      "action": {
        "en": "Apply NOT to A.",
        "vi": "Áp dụng NOT cho A."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "nA = 1; other known values are retained.",
        "vi": "nA = 1; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "gate-abc",
      "title": {
        "en": "Evaluate abc",
        "vi": "Tính abc"
      },
      "action": {
        "en": "Apply AND to A, B, C.",
        "vi": "Áp dụng AND cho A, B, C."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "abc = 0; other known values are retained.",
        "vi": "abc = 0; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "gate-nAc",
      "title": {
        "en": "Evaluate nAc",
        "vi": "Tính nAc"
      },
      "action": {
        "en": "Apply AND to nA, C.",
        "vi": "Áp dụng AND cho nA, C."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "nAc = 0; other known values are retained.",
        "vi": "nAc = 0; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "gate-y",
      "title": {
        "en": "Evaluate y",
        "vi": "Tính y"
      },
      "action": {
        "en": "Apply OR to abc, nAc.",
        "vi": "Áp dụng OR cho abc, nAc."
      },
      "why": {
        "en": "Use known inputs to this gate; do not skip an intermediate dependency.",
        "vi": "Dùng các đầu vào đã biết của cổng; không bỏ qua phụ thuộc trung gian."
      },
      "outcome": {
        "en": "y = 0; other known values are retained.",
        "vi": "y = 0; các giá trị đã biết khác được giữ."
      }
    },
    {
      "id": "record-row",
      "title": {
        "en": "Record this row",
        "vi": "Ghi hàng hiện tại"
      },
      "action": {
        "en": "Copy inputs, intermediate values and Y into one row.",
        "vi": "Ghi đầu vào, giá trị trung gian và Y vào một hàng."
      },
      "why": {
        "en": "One tested combination is evidence for only that row.",
        "vi": "Một tổ hợp đã thử chỉ xác minh hàng đó."
      },
      "outcome": {
        "en": "The selected row is recorded; the table is not yet complete.",
        "vi": "Đã ghi hàng đang chọn; bảng chưa đầy đủ."
      }
    },
    {
      "id": "complete-table",
      "title": {
        "en": "Enumerate every input",
        "vi": "Liệt kê mọi đầu vào"
      },
      "action": {
        "en": "Evaluate all 8 combinations in binary order with A first.",
        "vi": "Tính đủ 8 tổ hợp theo thứ tự nhị phân, A đứng trước."
      },
      "why": {
        "en": "A complete truth table covers every possible input, not a few samples.",
        "vi": "Bảng chân trị đầy đủ bao phủ mọi đầu vào, không chỉ vài mẫu."
      },
      "outcome": {
        "en": "All 8 rows are available.",
        "vi": "Đã có đủ 8 hàng."
      }
    },
    {
      "id": "select-ones",
      "title": {
        "en": "Select the 1 rows",
        "vi": "Chọn các hàng bằng 1"
      },
      "action": {
        "en": "Highlight exactly the rows whose Y output is 1.",
        "vi": "Đánh dấu đúng các hàng có đầu ra Y bằng 1."
      },
      "why": {
        "en": "A sum-of-products expression must make each such row true.",
        "vi": "Biểu thức tổng các tích phải cho đúng tại từng hàng đó."
      },
      "outcome": {
        "en": "Selected rows: 001, 011, 111.",
        "vi": "Các hàng được chọn: 001, 011, 111."
      }
    },
    {
      "id": "derive-sop",
      "title": {
        "en": "Build the sum of products",
        "vi": "Lập tổng các tích"
      },
      "action": {
        "en": "AND the literals for each 1 row, then OR the products.",
        "vi": "AND các literal trong mỗi hàng 1 rồi OR các tích."
      },
      "why": {
        "en": "Use a complemented variable for bit 0 and the variable for bit 1.",
        "vi": "Dùng biến phủ định cho bit 0 và biến thường cho bit 1."
      },
      "outcome": {
        "en": "Y = (NOT A AND NOT B AND C) OR (NOT A AND B AND C) OR (A AND B AND C)",
        "vi": "Y = (NOT A AND NOT B AND C) OR (NOT A AND B AND C) OR (A AND B AND C)"
      }
    },
    {
      "id": "rebuild-circuit",
      "title": {
        "en": "Rebuild an equivalent circuit",
        "vi": "Dựng lại mạch tương đương"
      },
      "action": {
        "en": "Create an AND path for each product and combine paths with OR.",
        "vi": "Tạo nhánh AND cho mỗi tích rồi gộp các nhánh bằng OR."
      },
      "why": {
        "en": "The circuit follows the expression structure, including each required inversion.",
        "vi": "Mạch theo cấu trúc biểu thức, gồm từng phép đảo cần thiết."
      },
      "outcome": {
        "en": "The reconstructed circuit implements the canonical SOP.",
        "vi": "Mạch dựng lại thực hiện SOP chuẩn."
      }
    },
    {
      "id": "verify-equivalence",
      "title": {
        "en": "Check every row",
        "vi": "Kiểm mọi hàng"
      },
      "action": {
        "en": "Compare original-circuit and reconstructed-SOP outputs over the full table.",
        "vi": "So đầu ra mạch gốc và SOP dựng lại trên toàn bảng."
      },
      "why": {
        "en": "Equivalence requires matching outputs for every input combination.",
        "vi": "Tương đương đòi hỏi đầu ra khớp với mọi tổ hợp đầu vào."
      },
      "outcome": {
        "en": "All 8 outputs agree; the circuits are logically equivalent.",
        "vi": "Cả 8 đầu ra khớp; hai mạch tương đương logic."
      }
    }
  ]
} as const);

import type { Localized } from "./catalog";

export type FurtherProgrammingVisualKind =
  | "paradigm-procedural"
  | "addressing-modes"
  | "assembly-workbench"
  | "oop-encapsulation"
  | "oop-relationships"
  | "declarative-inference"
  | "sequential-files"
  | "random-files"
  | "exception-flow";

/** Locked semantic lines retained for compatible supplied programs even when
 * the bounded release fixtures do not currently select these two branches. */
export const SECTION20_OPTIONAL_SEMANTIC_LINES = Object.freeze({
  "PROC-03": "evaluate-selection-or-iteration-guard",
  "ASM-OUT": "emit-output-without-unrelated-mutation",
});

export interface FurtherProgrammingStep<S> {
  readonly id: string;
  readonly activeLine: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly rule: Localized;
  readonly outcome: Localized;
  readonly codeLine: string;
  readonly before: S;
  readonly after: S;
}

export interface FurtherProgrammingTrace<S> {
  readonly fixtureId: string;
  readonly scenario: string;
  readonly convention: Localized;
  readonly pseudocode: readonly string[];
  readonly initial: S;
  readonly steps: readonly FurtherProgrammingStep<S>[];
  readonly final: S;
}

interface BaseState {
  readonly activeLine: string;
  readonly status: string;
  readonly error: string | null;
  readonly [key: string]: unknown;
}

export interface ParadigmProceduralState extends BaseState {
  readonly mode: "recognition" | "procedural";
  readonly problemId: string;
  readonly evidence: readonly string[];
  readonly selectedParadigm: "low-level" | "imperative/procedural" | "object-oriented" | "declarative" | null;
  readonly routine: { readonly name: string; readonly kind: "procedure" | "function"; readonly parameters: readonly string[]; readonly returnType: string | null };
  readonly callStack: readonly string[];
  readonly variables: Readonly<Record<string, unknown>>;
  readonly outputs: readonly unknown[];
  readonly returnValue: unknown;
}
export interface AddressingState extends BaseState {
  readonly instruction: string;
  readonly mode: "immediate" | "direct" | "indirect" | "indexed" | "relative";
  readonly operandField: number;
  readonly pcFetch: number;
  readonly pcReference: number;
  readonly ix: number;
  readonly memory: Readonly<Record<string, number>>;
  readonly dereferencePath: readonly number[];
  readonly effectiveAddress: number | null;
  readonly value: number | null;
}
export interface AssemblyState extends BaseState {
  readonly program: readonly string[];
  readonly instructionSetId: string;
  readonly pc: number;
  readonly currentInstruction: string | null;
  readonly registers: Readonly<Record<string, number>>;
  readonly flags: Readonly<Record<string, string>>;
  readonly memory: Readonly<Record<string, number>>;
  readonly operandResolution: Readonly<Record<string, unknown>>;
  readonly branchDecision: Readonly<Record<string, unknown>> | null;
  readonly output: readonly unknown[];
  readonly halted: boolean;
}
export interface EncapsulationState extends BaseState {
  readonly classDefinition: Readonly<Record<string, unknown>>;
  readonly instances: readonly Readonly<Record<string, unknown>>[];
  readonly receiverId: string | null;
  readonly method: string | null;
  readonly bindings: Readonly<Record<string, unknown>>;
  readonly returnValue: unknown;
}
export interface OopRelationshipState extends BaseState {
  readonly classes: Readonly<Record<string, unknown>>;
  readonly relationships: readonly Readonly<Record<string, unknown>>[];
  readonly referenceType: string | null;
  readonly actualType: string | null;
  readonly receiverId: string | null;
  readonly lookupPath: readonly string[];
  readonly selectedMethod: string | null;
  readonly objects: readonly Readonly<Record<string, unknown>>[];
  readonly result: unknown;
}
export interface DeclarativeState extends BaseState {
  readonly facts: readonly string[];
  readonly rules: readonly string[];
  readonly goal: string;
  readonly pendingGoals: readonly string[];
  readonly bindings: Readonly<Record<string, string>>;
  readonly proofNodes: readonly Readonly<Record<string, unknown>>[];
  readonly proofEdges: readonly Readonly<Record<string, unknown>>[];
  readonly proof: readonly string[];
  readonly solutions: readonly Readonly<Record<string, string>>[];
}
export interface SequentialFileState extends BaseState {
  readonly mode: "READ" | "WRITE" | "APPEND" | null;
  readonly exists: boolean;
  readonly isOpen: boolean;
  readonly records: readonly string[];
  readonly pointer: number;
  readonly currentRecord: string | null;
  readonly eof: boolean;
  readonly processedValue: string | null;
  readonly outputRecords: readonly string[];
}
export interface RandomFileState extends BaseState {
  readonly recordBase: 0 | 1;
  readonly baseAddress: number;
  readonly recordSize: number;
  readonly slots: readonly Readonly<Record<string, unknown>>[];
  readonly recordNumber: number;
  readonly offset: number | null;
  readonly pointer: number;
  readonly selectedRecord: Readonly<Record<string, unknown>> | null;
  readonly sequentialPath: readonly number[];
}
export interface ExceptionState extends BaseState {
  readonly language: "Python 3";
  readonly scenario: string;
  readonly tryLine: string;
  readonly exceptionType: string | null;
  readonly raised: boolean;
  readonly handlerChecks: readonly string[];
  readonly matchedHandler: string | null;
  readonly skippedLines: readonly string[];
  readonly attempt: number;
  readonly resourceOpen: boolean;
  readonly output: readonly unknown[];
}

export type ParadigmScenario = "recognise-low-level" | "recognise-procedural" | "recognise-oop" | "recognise-declarative" | "function-return" | "procedure-state" | "function-missing-return";
export type AddressingScenario = "immediate" | "direct" | "indirect" | "indexed" | "relative-forward" | "relative-backward" | "indirect-dangling" | "indexed-out-of-range" | "relative-out-of-range";
export type AssemblyScenario = "data-move" | "arithmetic-store" | "branch-taken" | "branch-not-taken" | "short-program" | "construct-load" | "construct-branch" | "invalid-opcode" | "invalid-address";
export type EncapsulationScenario = "instantiate-two" | "get-private" | "set-valid" | "set-invalid" | "direct-private-access" | "design-class";
export type OopRelationshipScenario = "override-dispatch" | "inherited-method" | "aggregation-state" | "choose-inheritance" | "choose-aggregation" | "invalid-is-a" | "invalid-has-a";
export type DeclarativeScenario = "direct-fact" | "one-rule" | "two-hop" | "variable-binding" | "unsatisfied" | "malformed-goal";
export type SequentialFileScenario = "read-to-eof" | "write-replaces" | "append-preserves" | "process-copy" | "empty-read" | "closed-read" | "missing-read";
export type RandomFileScenario = "read-middle" | "update-middle" | "seek-only" | "read-first" | "read-last" | "out-of-range" | "empty-slot" | "sequential-comparison" | "byte-offset-example";
export type ExceptionScenario = "normal" | "missing-file-handled" | "invalid-conversion-handled" | "divide-zero-handled" | "retry-success" | "mismatched-unhandled" | "finally-closes" | "validation-contrast";

export const PARADIGM_SCENARIOS = ["recognise-low-level", "recognise-procedural", "recognise-oop", "recognise-declarative", "function-return", "procedure-state", "function-missing-return"] as const satisfies readonly ParadigmScenario[];
export const ADDRESSING_SCENARIOS = ["immediate", "direct", "indirect", "indexed", "relative-forward", "relative-backward", "indirect-dangling", "indexed-out-of-range", "relative-out-of-range"] as const satisfies readonly AddressingScenario[];
export const ASSEMBLY_SCENARIOS = ["data-move", "arithmetic-store", "branch-taken", "branch-not-taken", "short-program", "construct-load", "construct-branch", "invalid-opcode", "invalid-address"] as const satisfies readonly AssemblyScenario[];
export const ENCAPSULATION_SCENARIOS = ["instantiate-two", "get-private", "set-valid", "set-invalid", "direct-private-access", "design-class"] as const satisfies readonly EncapsulationScenario[];
export const OOP_RELATIONSHIP_SCENARIOS = ["override-dispatch", "inherited-method", "aggregation-state", "choose-inheritance", "choose-aggregation", "invalid-is-a", "invalid-has-a"] as const satisfies readonly OopRelationshipScenario[];
export const DECLARATIVE_SCENARIOS = ["direct-fact", "one-rule", "two-hop", "variable-binding", "unsatisfied", "malformed-goal"] as const satisfies readonly DeclarativeScenario[];
export const SEQUENTIAL_FILE_SCENARIOS = ["read-to-eof", "write-replaces", "append-preserves", "process-copy", "empty-read", "closed-read", "missing-read"] as const satisfies readonly SequentialFileScenario[];
export const RANDOM_FILE_SCENARIOS = ["read-middle", "update-middle", "seek-only", "read-first", "read-last", "out-of-range", "empty-slot", "sequential-comparison", "byte-offset-example"] as const satisfies readonly RandomFileScenario[];
export const EXCEPTION_SCENARIOS = ["normal", "missing-file-handled", "invalid-conversion-handled", "divide-zero-handled", "retry-success", "mismatched-unhandled", "finally-closes", "validation-contrast"] as const satisfies readonly ExceptionScenario[];

export const FURTHER_PROGRAMMING_SCENARIOS = Object.freeze({
  "paradigm-procedural": PARADIGM_SCENARIOS,
  "addressing-modes": ADDRESSING_SCENARIOS,
  "assembly-workbench": ASSEMBLY_SCENARIOS,
  "oop-encapsulation": ENCAPSULATION_SCENARIOS,
  "oop-relationships": OOP_RELATIONSHIP_SCENARIOS,
  "declarative-inference": DECLARATIVE_SCENARIOS,
  "sequential-files": SEQUENTIAL_FILE_SCENARIOS,
  "random-files": RANDOM_FILE_SCENARIOS,
  "exception-flow": EXCEPTION_SCENARIOS,
});

type FixtureEvent = Readonly<Record<string, unknown>> & { readonly activeLine: string };
type Fixture = {
  readonly input: Readonly<Record<string, unknown>>;
  readonly expected: Readonly<Record<string, unknown>> & { readonly events?: readonly FixtureEvent[] };
};
type FixtureRoot = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

const LOCKED_FIXTURES = JSON.parse("{\"schemaVersion\":1,\"section\":\"20\",\"status\":\"LOCKED_BEFORE_IMPLEMENTATION\",\"authority\":\"QA-owned hard-coded expected transitions; never generated from the production model or renderer.\",\"projectionNote\":\"Independent oracles recompute from raw inputs and compare these explicit outcomes; they must not echo production results.\",\"conventions\":{\"instructionSet\":{\"id\":\"S20-ASM-COURSEBOOK-1\",\"pcTiming\":\"PC is current instruction before fetch; non-branch next is instructionAddress+1; relative resolver target=instructionAddress+signed displacement\",\"mnemonics\":[\"LDM\",\"LDD\",\"LDI\",\"LDX\",\"LDR\",\"STO\",\"ADD\",\"SUB\",\"CMP\",\"JMP\",\"JPE\",\"JPN\",\"INC\",\"DEC\",\"END\"],\"relativeResolverOnly\":\"JMR #d\"},\"pseudocode\":\"S20-PSEUDO-2026-1\",\"oop\":\"S20-OOP-CAMBRIDGE-1\",\"declarative\":\"S20-DECL-CLAUSE-1\",\"textFile\":\"S20-FILE-TEXT-1\",\"randomFile\":{\"id\":\"S20-FILE-RANDOM-1\",\"logicalPositions\":[0,1,2,3,4],\"byteExample\":{\"recordNumberBase\":1,\"baseByte\":0,\"recordSize\":24,\"formula\":\"baseByte + (recordNumber - 1) * recordSize\"}},\"exception\":\"S20-EXC-PYTHON-1\"},\"paradigmProcedural\":{\"recognise-low-level\":{\"input\":{\"description\":\"load two stored values into registers, add, store result\"},\"expected\":{\"paradigm\":\"low-level\",\"evidence\":[\"registers\",\"instructions\",\"explicit data movement\"],\"events\":[{\"activeLine\":\"PAR-01\"},{\"activeLine\":\"PAR-02\",\"result\":\"low-level\"}]}},\"recognise-procedural\":{\"input\":{\"description\":\"loop over orders, call a function, accumulate returned totals\"},\"expected\":{\"paradigm\":\"imperative/procedural\",\"evidence\":[\"ordered statements\",\"iteration\",\"function\",\"state update\"],\"events\":[{\"activeLine\":\"PAR-01\"},{\"activeLine\":\"PAR-02\",\"result\":\"imperative/procedural\"}]}},\"recognise-oop\":{\"input\":{\"description\":\"Book and Member objects keep attributes and use methods\"},\"expected\":{\"paradigm\":\"object-oriented\",\"evidence\":[\"objects\",\"state\",\"methods\"],\"events\":[{\"activeLine\":\"PAR-01\"},{\"activeLine\":\"PAR-02\",\"result\":\"object-oriented\"}]}},\"recognise-declarative\":{\"input\":{\"description\":\"state facts and an eligibility rule, then submit a goal\"},\"expected\":{\"paradigm\":\"declarative\",\"evidence\":[\"facts\",\"rule\",\"goal\"],\"events\":[{\"activeLine\":\"PAR-01\"},{\"activeLine\":\"PAR-02\",\"result\":\"declarative\"}]}},\"function-return\":{\"input\":{\"call\":\"DiscountedPrice(80,25)\",\"bindings\":{\"price\":80,\"percent\":25}},\"expected\":{\"returnValue\":60,\"outputs\":[60],\"events\":[{\"activeLine\":\"PROC-01\",\"stack\":[\"MAIN\"]},{\"activeLine\":\"PROC-02\",\"stack\":[\"MAIN\",\"DiscountedPrice\"],\"bindings\":{\"price\":80,\"percent\":25}},{\"activeLine\":\"PROC-05\",\"expression\":\"80-(80*25 DIV 100)\",\"returnValue\":60},{\"activeLine\":\"PROC-06\",\"stack\":[\"MAIN\"],\"salePrice\":60},{\"activeLine\":\"PROC-06\",\"stack\":[],\"outputs\":[60]}]}},\"procedure-state\":{\"input\":{\"call\":\"CALL AddPoints(score,5)\",\"initial\":{\"score\":12}},\"expected\":{\"final\":{\"score\":17},\"returnValue\":null,\"events\":[{\"activeLine\":\"PROC-01\",\"score\":12},{\"activeLine\":\"PROC-02\",\"points\":5},{\"activeLine\":\"PROC-04\",\"score\":17},{\"activeLine\":\"PROC-06\",\"stack\":[\"MAIN\"]},{\"activeLine\":\"PROC-06\",\"stack\":[]}]}},\"function-missing-return\":{\"input\":{\"code\":[\"FUNCTION Double(n) RETURNS INTEGER\",\"n ← n * 2\",\"ENDFUNCTION\"],\"call\":\"Double(4)\"},\"expected\":{\"status\":\"blocked-invalid\",\"error\":\"FUNCTION_RETURN_MISSING\",\"executedSteps\":0,\"events\":[{\"activeLine\":\"PROC-ERR\",\"error\":\"FUNCTION_RETURN_MISSING\"}]}}},\"addressing\":{\"immediate\":{\"input\":{\"instruction\":\"LDM #12\",\"mode\":\"immediate\",\"operandField\":12,\"instructionAddress\":200,\"ix\":2,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88}},\"expected\":{\"effectiveAddress\":null,\"dereferencePath\":[],\"finalValue\":12,\"status\":\"resolved\",\"events\":[{\"activeLine\":\"ADR-01\",\"operandField\":12},{\"activeLine\":\"ADR-IMM\",\"finalValue\":12}]}},\"direct\":{\"input\":{\"instruction\":\"LDD 20\",\"mode\":\"direct\",\"operandField\":20,\"instructionAddress\":200,\"ix\":2,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88}},\"expected\":{\"effectiveAddress\":20,\"dereferencePath\":[20],\"finalValue\":73,\"status\":\"resolved\",\"events\":[{\"activeLine\":\"ADR-01\",\"operandField\":20},{\"activeLine\":\"ADR-DIR\",\"effectiveAddress\":20},{\"activeLine\":\"ADR-READ\",\"address\":20,\"value\":73}]}},\"indirect\":{\"input\":{\"instruction\":\"LDI 21\",\"mode\":\"indirect\",\"operandField\":21,\"instructionAddress\":200,\"ix\":2,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88}},\"expected\":{\"effectiveAddress\":40,\"dereferencePath\":[21,40],\"finalValue\":88,\"status\":\"resolved\",\"events\":[{\"activeLine\":\"ADR-01\"},{\"activeLine\":\"ADR-IND-1\",\"address\":21,\"pointer\":40},{\"activeLine\":\"ADR-IND-2\",\"effectiveAddress\":40},{\"activeLine\":\"ADR-READ\",\"address\":40,\"value\":88}]}},\"indexed\":{\"input\":{\"instruction\":\"LDX 20\",\"mode\":\"indexed\",\"operandField\":20,\"instructionAddress\":200,\"ix\":2,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88}},\"expected\":{\"calculation\":\"20+2\",\"effectiveAddress\":22,\"dereferencePath\":[22],\"finalValue\":64,\"status\":\"resolved\",\"events\":[{\"activeLine\":\"ADR-01\"},{\"activeLine\":\"ADR-IDX\",\"effectiveAddress\":22},{\"activeLine\":\"ADR-READ\",\"address\":22,\"value\":64}]}},\"relative-forward\":{\"input\":{\"instruction\":\"JMR #5\",\"mode\":\"relative\",\"operandField\":5,\"instructionAddress\":200,\"ix\":0,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88}},\"expected\":{\"calculation\":\"200+5\",\"effectiveAddress\":205,\"dereferencePath\":[],\"finalValue\":205,\"status\":\"resolved-target\",\"events\":[{\"activeLine\":\"ADR-01\"},{\"activeLine\":\"ADR-REL\",\"instructionAddress\":200,\"displacement\":5,\"target\":205}]}},\"relative-backward\":{\"input\":{\"instruction\":\"JMR #-5\",\"mode\":\"relative\",\"operandField\":-5,\"instructionAddress\":200,\"ix\":0,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88}},\"expected\":{\"calculation\":\"200-5\",\"effectiveAddress\":195,\"dereferencePath\":[],\"finalValue\":195,\"status\":\"resolved-target\",\"events\":[{\"activeLine\":\"ADR-01\"},{\"activeLine\":\"ADR-REL\",\"instructionAddress\":200,\"displacement\":-5,\"target\":195}]}},\"indirect-dangling\":{\"input\":{\"instruction\":\"LDI 25\",\"mode\":\"indirect\",\"operandField\":25,\"instructionAddress\":200,\"ix\":0,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88},\"validAddressRange\":[0,63]},\"expected\":{\"effectiveAddress\":99,\"dereferencePath\":[25],\"finalValue\":null,\"status\":\"address-error\",\"error\":\"DANGLING_EFFECTIVE_ADDRESS\",\"events\":[{\"activeLine\":\"ADR-IND-1\",\"pointer\":99},{\"activeLine\":\"ADR-ERR\",\"error\":\"DANGLING_EFFECTIVE_ADDRESS\"}]}},\"indexed-out-of-range\":{\"input\":{\"instruction\":\"LDX 62\",\"mode\":\"indexed\",\"operandField\":62,\"instructionAddress\":200,\"ix\":4,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88},\"validAddressRange\":[0,63]},\"expected\":{\"effectiveAddress\":66,\"dereferencePath\":[],\"finalValue\":null,\"status\":\"address-error\",\"error\":\"EFFECTIVE_ADDRESS_OUT_OF_RANGE\",\"events\":[{\"activeLine\":\"ADR-IDX\",\"effectiveAddress\":66},{\"activeLine\":\"ADR-ERR\",\"error\":\"EFFECTIVE_ADDRESS_OUT_OF_RANGE\"}]}},\"relative-out-of-range\":{\"input\":{\"instruction\":\"JMR #-5\",\"mode\":\"relative\",\"operandField\":-5,\"instructionAddress\":2,\"ix\":0,\"memory\":{\"9\":41,\"14\":99,\"20\":73,\"21\":40,\"22\":64,\"25\":99,\"40\":88},\"validAddressRange\":[0,255]},\"expected\":{\"effectiveAddress\":-3,\"dereferencePath\":[],\"finalValue\":null,\"status\":\"address-error\",\"error\":\"TARGET_OUT_OF_RANGE\",\"events\":[{\"activeLine\":\"ADR-REL\",\"target\":-3},{\"activeLine\":\"ADR-ERR\",\"error\":\"TARGET_OUT_OF_RANGE\"}]}}},\"assembly\":{\"instructionSet\":{\"id\":\"S20-ASM-COURSEBOOK-1\",\"pcTiming\":\"PC is current instruction before fetch; non-branch next is instructionAddress+1; relative resolver target=instructionAddress+signed displacement\",\"mnemonics\":[\"LDM\",\"LDD\",\"LDI\",\"LDX\",\"LDR\",\"STO\",\"ADD\",\"SUB\",\"CMP\",\"JMP\",\"JPE\",\"JPN\",\"INC\",\"DEC\",\"END\"],\"relativeResolverOnly\":\"JMR #d\"},\"data-move\":{\"input\":{\"program\":[\"LDM #5\",\"END\"],\"memory\":{},\"ACC\":0,\"IX\":0},\"expected\":{\"final\":{\"pc\":2,\"ACC\":5,\"IX\":0,\"comparison\":\"unset\",\"memory\":{},\"halted\":true,\"output\":[]},\"visited\":[0,1],\"events\":[{\"activeLine\":\"ASM-FETCH\",\"address\":0,\"nextPC\":1},{\"activeLine\":\"ASM-LOAD\",\"ACC\":5},{\"activeLine\":\"ASM-FETCH\",\"address\":1,\"nextPC\":2},{\"activeLine\":\"ASM-END\",\"halted\":true}]}},\"arithmetic-store\":{\"input\":{\"program\":[\"LDD 20\",\"ADD #7\",\"STO 24\",\"END\"],\"memory\":{\"20\":73,\"24\":0},\"ACC\":0,\"IX\":0},\"expected\":{\"final\":{\"pc\":4,\"ACC\":80,\"IX\":0,\"comparison\":\"unset\",\"memory\":{\"20\":73,\"24\":80},\"halted\":true,\"output\":[]},\"visited\":[0,1,2,3],\"events\":[{\"activeLine\":\"ASM-LOAD\",\"ACC\":73},{\"activeLine\":\"ASM-ARITH\",\"calculation\":\"73+7\",\"ACC\":80},{\"activeLine\":\"ASM-STORE\",\"address\":24,\"before\":0,\"after\":80},{\"activeLine\":\"ASM-END\",\"halted\":true}]}},\"branch-taken\":{\"input\":{\"program\":[\"LDM #5\",\"CMP #5\",\"JPE 4\",\"LDM #0\",\"END\"],\"memory\":{},\"ACC\":0,\"IX\":0},\"expected\":{\"final\":{\"pc\":5,\"ACC\":5,\"IX\":0,\"comparison\":\"equal\",\"memory\":{},\"halted\":true,\"output\":[]},\"visited\":[0,1,2,4],\"events\":[{\"activeLine\":\"ASM-LOAD\",\"ACC\":5},{\"activeLine\":\"ASM-COMPARE\",\"left\":5,\"right\":5,\"comparison\":\"equal\"},{\"activeLine\":\"ASM-BRANCH\",\"taken\":true,\"nextPC\":4},{\"activeLine\":\"ASM-END\",\"halted\":true}]}},\"branch-not-taken\":{\"input\":{\"program\":[\"LDM #5\",\"CMP #6\",\"JPE 4\",\"LDM #0\",\"END\"],\"memory\":{},\"ACC\":0,\"IX\":0},\"expected\":{\"final\":{\"pc\":5,\"ACC\":0,\"IX\":0,\"comparison\":\"not-equal\",\"memory\":{},\"halted\":true,\"output\":[]},\"visited\":[0,1,2,3,4],\"events\":[{\"activeLine\":\"ASM-LOAD\",\"ACC\":5},{\"activeLine\":\"ASM-COMPARE\",\"left\":5,\"right\":6,\"comparison\":\"not-equal\"},{\"activeLine\":\"ASM-BRANCH\",\"taken\":false,\"nextPC\":3},{\"activeLine\":\"ASM-LOAD\",\"ACC\":0},{\"activeLine\":\"ASM-END\",\"halted\":true}]}},\"short-program\":{\"input\":{\"program\":[\"LDM #3\",\"INC ACC\",\"STO 10\",\"END\"],\"memory\":{\"10\":0},\"ACC\":0,\"IX\":0},\"expected\":{\"final\":{\"pc\":4,\"ACC\":4,\"IX\":0,\"comparison\":\"unset\",\"memory\":{\"10\":4},\"halted\":true,\"output\":[]},\"visited\":[0,1,2,3],\"events\":[{\"activeLine\":\"ASM-LOAD\",\"ACC\":3},{\"activeLine\":\"ASM-ARITH\",\"ACC\":4},{\"activeLine\":\"ASM-STORE\",\"address\":10,\"after\":4},{\"activeLine\":\"ASM-END\",\"halted\":true}]}},\"construct-load\":{\"input\":{\"effect\":\"load literal 12 into ACC\",\"choices\":[\"LDM #12\",\"LDD 12\",\"STO 12\"]},\"expected\":{\"selected\":\"LDM #12\",\"after\":{\"ACC\":12},\"events\":[{\"activeLine\":\"ASM-RESOLVE\",\"choice\":\"LDM #12\"},{\"activeLine\":\"ASM-LOAD\",\"ACC\":12}]}},\"construct-branch\":{\"input\":{\"effect\":\"jump to address 4 only when comparison state is equal\",\"choices\":[\"JPE 4\",\"JMP 4\",\"CMP 4\"]},\"expected\":{\"selected\":\"JPE 4\",\"takenNextPC\":4,\"notTakenNextPC\":\"next sequential\",\"events\":[{\"activeLine\":\"ASM-BRANCH\",\"choice\":\"JPE 4\"}]}},\"invalid-opcode\":{\"input\":{\"program\":[\"XYZ 20\"],\"memory\":{\"20\":73},\"ACC\":0,\"IX\":0},\"expected\":{\"status\":\"invalid-instruction\",\"error\":\"UNKNOWN_OPCODE\",\"final\":{\"pc\":0,\"ACC\":0,\"IX\":0,\"comparison\":\"unset\",\"memory\":{\"20\":73},\"halted\":false,\"output\":[]},\"events\":[{\"activeLine\":\"ASM-ERR\",\"error\":\"UNKNOWN_OPCODE\"}]}},\"invalid-address\":{\"input\":{\"program\":[\"LDD 99\"],\"memory\":{\"20\":73},\"ACC\":0,\"IX\":0,\"validAddressRange\":[0,63]},\"expected\":{\"status\":\"address-error\",\"error\":\"ADDRESS_OUT_OF_RANGE\",\"final\":{\"pc\":0,\"ACC\":0,\"IX\":0,\"comparison\":\"unset\",\"memory\":{\"20\":73},\"halted\":false,\"output\":[]},\"events\":[{\"activeLine\":\"ASM-ERR\",\"error\":\"ADDRESS_OUT_OF_RANGE\"}]}}},\"classEncapsulation\":{\"classDefinition\":{\"name\":\"ScoreCard\",\"privateAttributes\":[\"name\",\"score\"],\"publicMethods\":[\"NEW\",\"GetName\",\"GetScore\",\"SetScore\"],\"scoreInvariant\":\"0 <= score <= 100\"},\"instantiate-two\":{\"input\":{\"calls\":[\"NEW ScoreCard('Ada',85)\",\"NEW ScoreCard('Bo',72)\"]},\"expected\":{\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"events\":[{\"activeLine\":\"CLS-01\"},{\"activeLine\":\"CLS-02\",\"objectId\":\"ada\"},{\"activeLine\":\"CLS-02\",\"objectId\":\"bo\"}]}},\"get-private\":{\"input\":{\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"call\":\"ada.GetScore()\"},\"expected\":{\"returnValue\":85,\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"events\":[{\"activeLine\":\"CLS-03\",\"receiverId\":\"ada\"},{\"activeLine\":\"CLS-04\",\"method\":\"GetScore\"},{\"activeLine\":\"CLS-07\",\"returnValue\":85}]}},\"set-valid\":{\"input\":{\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"call\":\"ada.SetScore(90)\"},\"expected\":{\"returnValue\":true,\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":90},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"events\":[{\"activeLine\":\"CLS-03\",\"receiverId\":\"ada\"},{\"activeLine\":\"CLS-05\",\"valid\":true},{\"activeLine\":\"CLS-06\",\"before\":85,\"after\":90},{\"activeLine\":\"CLS-07\",\"returnValue\":true}]}},\"set-invalid\":{\"input\":{\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"call\":\"bo.SetScore(120)\"},\"expected\":{\"returnValue\":false,\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"status\":\"rejected\",\"error\":\"SCORE_OUT_OF_RANGE\",\"events\":[{\"activeLine\":\"CLS-03\",\"receiverId\":\"bo\"},{\"activeLine\":\"CLS-05\",\"valid\":false},{\"activeLine\":\"CLS-ERR-VALUE\",\"error\":\"SCORE_OUT_OF_RANGE\"}]}},\"direct-private-access\":{\"input\":{\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"operation\":\"ada.score ← 0\",\"caller\":\"external\"},\"expected\":{\"instances\":[{\"id\":\"ada\",\"class\":\"ScoreCard\",\"name\":\"Ada\",\"score\":85},{\"id\":\"bo\",\"class\":\"ScoreCard\",\"name\":\"Bo\",\"score\":72}],\"status\":\"blocked\",\"error\":\"PRIVATE_ACCESS\",\"events\":[{\"activeLine\":\"CLS-03\",\"receiverId\":\"ada\"},{\"activeLine\":\"CLS-ERR-ACCESS\",\"error\":\"PRIVATE_ACCESS\"}]}},\"design-class\":{\"input\":{\"scenario\":\"store learner name and score; read score; update only values 0..100\"},\"expected\":{\"class\":{\"name\":\"ScoreCard\",\"privateAttributes\":[\"name\",\"score\"],\"publicMethods\":[\"NEW\",\"GetName\",\"GetScore\",\"SetScore\"],\"validation\":\"0 <= score <= 100\"},\"events\":[{\"activeLine\":\"CLS-01\",\"status\":\"designed\"},{\"activeLine\":\"CLS-05\",\"validation\":\"0 <= score <= 100\"}]}}},\"oopDispatch\":{\"classes\":{\"Account\":{\"methods\":[\"GetBalance\",\"ApplyCharge\"]},\"SavingsAccount\":{\"inherits\":\"Account\",\"overrides\":[\"ApplyCharge\"]},\"CurrentAccount\":{\"inherits\":\"Account\",\"overrides\":[\"ApplyCharge\"]},\"Portfolio\":{\"aggregates\":\"Account[]\"}},\"initialObjects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":100},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}],\"override-dispatch\":{\"input\":{\"receiverId\":\"s1\",\"referenceType\":\"Account\",\"call\":\"ApplyCharge()\",\"objects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":100},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}]},\"expected\":{\"actualType\":\"SavingsAccount\",\"selectedMethod\":\"SavingsAccount.ApplyCharge\",\"result\":2,\"objects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":98},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}],\"events\":[{\"activeLine\":\"OOP-02\",\"actualType\":\"SavingsAccount\"},{\"activeLine\":\"OOP-03\",\"selectedMethod\":\"SavingsAccount.ApplyCharge\"},{\"activeLine\":\"OOP-06\",\"before\":100,\"after\":98},{\"activeLine\":\"OOP-07\",\"result\":2}]}},\"inherited-method\":{\"input\":{\"receiverId\":\"c1\",\"referenceType\":\"Account\",\"call\":\"GetBalance()\",\"objects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":100},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}]},\"expected\":{\"actualType\":\"CurrentAccount\",\"lookupPath\":[\"CurrentAccount\",\"Account\"],\"selectedMethod\":\"Account.GetBalance\",\"result\":100,\"objects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":100},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}],\"events\":[{\"activeLine\":\"OOP-02\"},{\"activeLine\":\"OOP-04\",\"selectedMethod\":\"Account.GetBalance\"},{\"activeLine\":\"OOP-07\",\"result\":100}]}},\"aggregation-state\":{\"input\":{\"receiverId\":\"p1\",\"call\":\"DepositInto('s1',20)\",\"objects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":100},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}]},\"expected\":{\"relationship\":\"has-a\",\"objects\":[{\"id\":\"s1\",\"type\":\"SavingsAccount\",\"balance\":120},{\"id\":\"c1\",\"type\":\"CurrentAccount\",\"balance\":100},{\"id\":\"p1\",\"type\":\"Portfolio\",\"accountIds\":[\"s1\",\"c1\"]}],\"events\":[{\"activeLine\":\"OOP-01\",\"relationship\":\"has-a\"},{\"activeLine\":\"OOP-05\",\"receiverId\":\"p1\"},{\"activeLine\":\"OOP-06\",\"containedObjectId\":\"s1\",\"before\":100,\"after\":120}]}},\"choose-inheritance\":{\"input\":{\"claim\":\"SavingsAccount is an Account\"},\"expected\":{\"relationship\":\"inheritance\",\"valid\":true,\"events\":[{\"activeLine\":\"OOP-01\",\"relationship\":\"is-a\",\"valid\":true}]}},\"choose-aggregation\":{\"input\":{\"claim\":\"Portfolio has Accounts\"},\"expected\":{\"relationship\":\"aggregation\",\"valid\":true,\"events\":[{\"activeLine\":\"OOP-01\",\"relationship\":\"has-a\",\"valid\":true}]}},\"invalid-is-a\":{\"input\":{\"claim\":\"Portfolio is an Account\"},\"expected\":{\"valid\":false,\"relationship\":\"aggregation\",\"error\":\"INVALID_IS_A\",\"events\":[{\"activeLine\":\"OOP-01\",\"valid\":false},{\"activeLine\":\"OOP-ERR\",\"repair\":\"Portfolio has Accounts\"}]}},\"invalid-has-a\":{\"input\":{\"claim\":\"SavingsAccount has an Account\"},\"expected\":{\"valid\":false,\"relationship\":\"inheritance\",\"error\":\"INVALID_HAS_A\",\"events\":[{\"activeLine\":\"OOP-01\",\"valid\":false},{\"activeLine\":\"OOP-ERR\",\"repair\":\"SavingsAccount is an Account\"}]}}},\"declarative\":{\"notation\":\"S20-DECL-CLAUSE-1\",\"facts\":[\"parent(ada,bo).\",\"parent(bo,chen).\",\"student(ada).\",\"score(ada,85).\"],\"rules\":[\"grandparent(X,Z) IF parent(X,Y) AND parent(Y,Z).\",\"eligible(X) IF student(X) AND score(X,85).\"],\"direct-fact\":{\"input\":{\"goal\":\"parent(ada,bo).\"},\"expected\":{\"status\":\"satisfied\",\"bindings\":{},\"proof\":[\"parent(ada,bo).\"],\"events\":[{\"activeLine\":\"DEC-01\"},{\"activeLine\":\"DEC-02\",\"fact\":\"parent(ada,bo).\"},{\"activeLine\":\"DEC-07\"}]}},\"one-rule\":{\"input\":{\"goal\":\"eligible(ada).\"},\"expected\":{\"status\":\"satisfied\",\"bindings\":{\"X\":\"ada\"},\"proof\":[\"eligible(ada).\",\"student(ada).\",\"score(ada,85).\"],\"events\":[{\"activeLine\":\"DEC-03\",\"rule\":\"eligible\"},{\"activeLine\":\"DEC-04\",\"bindings\":{\"X\":\"ada\"}},{\"activeLine\":\"DEC-06\",\"fact\":\"student(ada).\"},{\"activeLine\":\"DEC-06\",\"fact\":\"score(ada,85).\"},{\"activeLine\":\"DEC-07\"}]}},\"two-hop\":{\"input\":{\"goal\":\"grandparent(ada,chen).\"},\"expected\":{\"status\":\"satisfied\",\"bindings\":{\"X\":\"ada\",\"Y\":\"bo\",\"Z\":\"chen\"},\"proof\":[\"grandparent(ada,chen).\",\"parent(ada,bo).\",\"parent(bo,chen).\"],\"events\":[{\"activeLine\":\"DEC-03\",\"rule\":\"grandparent\"},{\"activeLine\":\"DEC-04\",\"bindings\":{\"X\":\"ada\",\"Z\":\"chen\"}},{\"activeLine\":\"DEC-06\",\"bindings\":{\"Y\":\"bo\"}},{\"activeLine\":\"DEC-07\"}]}},\"variable-binding\":{\"input\":{\"goal\":\"parent(ada,Who).\"},\"expected\":{\"status\":\"satisfied\",\"solutions\":[{\"Who\":\"bo\"}],\"proof\":[\"parent(ada,bo).\"],\"events\":[{\"activeLine\":\"DEC-01\"},{\"activeLine\":\"DEC-02\"},{\"activeLine\":\"DEC-04\",\"bindings\":{\"Who\":\"bo\"}},{\"activeLine\":\"DEC-07\"}]}},\"unsatisfied\":{\"input\":{\"goal\":\"grandparent(bo,ada).\"},\"expected\":{\"status\":\"unsatisfied\",\"bindings\":{},\"proof\":[],\"events\":[{\"activeLine\":\"DEC-03\"},{\"activeLine\":\"DEC-05\",\"pending\":[\"parent(bo,Y).\",\"parent(Y,ada).\"]},{\"activeLine\":\"DEC-06\",\"bindings\":{\"Y\":\"chen\"}},{\"activeLine\":\"DEC-08\",\"missing\":\"parent(chen,ada).\"}]}},\"malformed-goal\":{\"input\":{\"goal\":\"run arbitrary code\"},\"expected\":{\"status\":\"blocked-invalid\",\"error\":\"MALFORMED_GOAL\",\"proof\":[],\"events\":[{\"activeLine\":\"DEC-ERR\",\"error\":\"MALFORMED_GOAL\"}]}}},\"sequentialFile\":{\"read-to-eof\":{\"input\":{\"exists\":true,\"records\":[\"Ada,85\",\"Bo,72\"],\"operations\":[\"OPEN READ\",\"READ\",\"READ\",\"EOF\",\"CLOSE\"]},\"expected\":{\"final\":{\"isOpen\":false,\"records\":[\"Ada,85\",\"Bo,72\"],\"pointer\":2,\"eof\":true},\"readValues\":[\"Ada,85\",\"Bo,72\"],\"events\":[{\"activeLine\":\"SF-OPEN-R\",\"pointer\":0},{\"activeLine\":\"SF-READ\",\"value\":\"Ada,85\",\"pointer\":1},{\"activeLine\":\"SF-READ\",\"value\":\"Bo,72\",\"pointer\":2},{\"activeLine\":\"SF-EOF\",\"eof\":true},{\"activeLine\":\"SF-CLOSE\"}]}},\"write-replaces\":{\"input\":{\"exists\":true,\"records\":[\"Ada,85\",\"Bo,72\"],\"operations\":[\"OPEN WRITE\",\"WRITE Chen,91\",\"CLOSE\"]},\"expected\":{\"final\":{\"isOpen\":false,\"records\":[\"Chen,91\"],\"pointer\":1,\"eof\":true},\"events\":[{\"activeLine\":\"SF-OPEN-W\",\"before\":[\"Ada,85\",\"Bo,72\"],\"after\":[]},{\"activeLine\":\"SF-WRITE\",\"record\":\"Chen,91\"},{\"activeLine\":\"SF-CLOSE\"}]}},\"append-preserves\":{\"input\":{\"exists\":true,\"records\":[\"Ada,85\",\"Bo,72\"],\"operations\":[\"OPEN APPEND\",\"WRITE Chen,91\",\"CLOSE\"]},\"expected\":{\"final\":{\"isOpen\":false,\"records\":[\"Ada,85\",\"Bo,72\",\"Chen,91\"],\"pointer\":3,\"eof\":true},\"events\":[{\"activeLine\":\"SF-OPEN-A\",\"pointer\":2},{\"activeLine\":\"SF-WRITE\",\"record\":\"Chen,91\"},{\"activeLine\":\"SF-CLOSE\"}]}},\"process-copy\":{\"input\":{\"records\":[\"Ada,85\",\"Bo,72\"],\"operation\":\"copy score >=80\"},\"expected\":{\"outputRecords\":[\"Ada,85\"],\"final\":{\"isOpen\":false,\"pointer\":2,\"eof\":true},\"events\":[{\"activeLine\":\"SF-READ\",\"value\":\"Ada,85\"},{\"activeLine\":\"SF-PROCESS\",\"keep\":true},{\"activeLine\":\"SF-WRITE\",\"target\":\"output\"},{\"activeLine\":\"SF-READ\",\"value\":\"Bo,72\"},{\"activeLine\":\"SF-PROCESS\",\"keep\":false},{\"activeLine\":\"SF-EOF\",\"eof\":true},{\"activeLine\":\"SF-CLOSE\"}]}},\"empty-read\":{\"input\":{\"exists\":true,\"records\":[]},\"expected\":{\"readValues\":[],\"final\":{\"isOpen\":false,\"records\":[],\"pointer\":0,\"eof\":true},\"events\":[{\"activeLine\":\"SF-OPEN-R\"},{\"activeLine\":\"SF-EOF\",\"eof\":true},{\"activeLine\":\"SF-CLOSE\"}]}},\"closed-read\":{\"input\":{\"exists\":true,\"records\":[\"Ada,85\",\"Bo,72\"],\"isOpen\":false,\"operation\":\"READFILE\"},\"expected\":{\"status\":\"file-error\",\"error\":\"FILE_NOT_OPEN\",\"final\":{\"isOpen\":false,\"records\":[\"Ada,85\",\"Bo,72\"],\"pointer\":0},\"events\":[{\"activeLine\":\"SF-ERR\",\"error\":\"FILE_NOT_OPEN\"}]}},\"missing-read\":{\"input\":{\"exists\":false,\"records\":[],\"operation\":\"OPENFILE FOR READ\"},\"expected\":{\"status\":\"file-error\",\"error\":\"FILE_NOT_FOUND\",\"final\":{\"isOpen\":false,\"records\":[],\"pointer\":0},\"events\":[{\"activeLine\":\"SF-ERR\",\"error\":\"FILE_NOT_FOUND\"}]}}},\"randomFile\":{\"recordConvention\":{\"logicalPositions\":[0,1,2,3,4],\"byteExample\":{\"recordNumberBase\":1,\"baseByte\":0,\"recordSize\":24}},\"baseSlots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"read-middle\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":2},\"expected\":{\"pointer\":2,\"record\":{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"events\":[{\"activeLine\":\"RF-BOUNDS\",\"valid\":true},{\"activeLine\":\"RF-SEEK\",\"pointer\":2},{\"activeLine\":\"RF-READ\",\"record\":{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91}}]}},\"update-middle\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":1,\"replacement\":{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":78}},\"expected\":{\"pointer\":1,\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":78},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"unchangedPositions\":[0,2,3,4],\"events\":[{\"activeLine\":\"RF-BOUNDS\",\"valid\":true},{\"activeLine\":\"RF-SEEK\",\"pointer\":1},{\"activeLine\":\"RF-WRITE\",\"position\":1}]}},\"seek-only\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":3},\"expected\":{\"pointer\":3,\"selectedRecord\":null,\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"events\":[{\"activeLine\":\"RF-BOUNDS\",\"valid\":true},{\"activeLine\":\"RF-SEEK\",\"pointer\":3}]}},\"read-first\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":0},\"expected\":{\"pointer\":0,\"record\":{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},\"events\":[{\"activeLine\":\"RF-SEEK\",\"pointer\":0},{\"activeLine\":\"RF-READ\",\"record\":{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85}}]}},\"read-last\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":4},\"expected\":{\"pointer\":4,\"record\":{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67},\"events\":[{\"activeLine\":\"RF-SEEK\",\"pointer\":4},{\"activeLine\":\"RF-READ\",\"record\":{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}}]}},\"out-of-range\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":5},\"expected\":{\"pointer\":0,\"record\":null,\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"status\":\"record-error\",\"error\":\"RECORD_OUT_OF_RANGE\",\"events\":[{\"activeLine\":\"RF-BOUNDS\",\"valid\":false},{\"activeLine\":\"RF-ERR\",\"error\":\"RECORD_OUT_OF_RANGE\"}]}},\"empty-slot\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":3},\"expected\":{\"pointer\":3,\"record\":{\"position\":3,\"empty\":true},\"status\":\"empty-record\",\"events\":[{\"activeLine\":\"RF-SEEK\",\"pointer\":3},{\"activeLine\":\"RF-READ\",\"status\":\"empty-record\"}]}},\"sequential-comparison\":{\"input\":{\"slots\":[{\"position\":0,\"id\":\"S001\",\"name\":\"Ada\",\"score\":85},{\"position\":1,\"id\":\"S002\",\"name\":\"Bo\",\"score\":72},{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},{\"position\":3,\"empty\":true},{\"position\":4,\"id\":\"S005\",\"name\":\"Di\",\"score\":67}],\"position\":2},\"expected\":{\"randomPath\":[2],\"sequentialPath\":[0,1,2],\"record\":{\"position\":2,\"id\":\"S003\",\"name\":\"Chen\",\"score\":91},\"events\":[{\"activeLine\":\"RF-SEEK\",\"pointer\":2},{\"activeLine\":\"RF-COMPARE\",\"sequentialPath\":[0,1,2]}]}},\"byte-offset-example\":{\"input\":{\"recordNumber\":3,\"baseByte\":0,\"recordSize\":24},\"expected\":{\"byteOffset\":48,\"calculation\":\"0+(3-1)*24\",\"events\":[{\"activeLine\":\"RF-CALC\",\"byteOffset\":48}]}}},\"exception\":{\"normal\":{\"input\":{\"language\":\"Python 3\",\"operation\":\"int('42')\",\"handlers\":[\"ValueError\"]},\"expected\":{\"status\":\"complete\",\"output\":[42],\"matchedHandler\":null,\"events\":[{\"activeLine\":\"EXC-TRY\"},{\"activeLine\":\"EXC-OP\",\"raised\":false,\"value\":42},{\"activeLine\":\"EXC-NORMAL\"},{\"activeLine\":\"EXC-END\"}]}},\"missing-file-handled\":{\"input\":{\"operation\":\"open missing file\",\"handlers\":[\"FileNotFoundError\"]},\"expected\":{\"status\":\"recovered\",\"exceptionType\":\"FileNotFoundError\",\"matchedHandler\":\"FileNotFoundError\",\"skippedLines\":[\"read file\"],\"resourceOpen\":false,\"events\":[{\"activeLine\":\"EXC-RAISE\"},{\"activeLine\":\"EXC-MATCH\",\"matched\":true},{\"activeLine\":\"EXC-HANDLE\"},{\"activeLine\":\"EXC-END\"}]}},\"invalid-conversion-handled\":{\"input\":{\"operation\":\"int('blue')\",\"handlers\":[\"ValueError\"]},\"expected\":{\"status\":\"recovered\",\"exceptionType\":\"ValueError\",\"matchedHandler\":\"ValueError\",\"skippedLines\":[\"use number\"],\"events\":[{\"activeLine\":\"EXC-RAISE\"},{\"activeLine\":\"EXC-MATCH\",\"matched\":true},{\"activeLine\":\"EXC-HANDLE\"},{\"activeLine\":\"EXC-END\"}]}},\"divide-zero-handled\":{\"input\":{\"operation\":\"12/0\",\"handlers\":[\"ZeroDivisionError\"]},\"expected\":{\"status\":\"recovered\",\"exceptionType\":\"ZeroDivisionError\",\"matchedHandler\":\"ZeroDivisionError\",\"events\":[{\"activeLine\":\"EXC-RAISE\"},{\"activeLine\":\"EXC-MATCH\",\"matched\":true},{\"activeLine\":\"EXC-HANDLE\"},{\"activeLine\":\"EXC-END\"}]}},\"retry-success\":{\"input\":{\"attemptInputs\":[\"blue\",\"42\"],\"operation\":\"int(input)\",\"handlers\":[\"ValueError\"]},\"expected\":{\"status\":\"complete\",\"attempts\":2,\"output\":[42],\"events\":[{\"activeLine\":\"EXC-RAISE\",\"attempt\":1},{\"activeLine\":\"EXC-HANDLE\",\"action\":\"ask again\"},{\"activeLine\":\"EXC-RETRY\",\"attempt\":2},{\"activeLine\":\"EXC-OP\",\"raised\":false,\"value\":42},{\"activeLine\":\"EXC-END\"}]}},\"mismatched-unhandled\":{\"input\":{\"operation\":\"12/0\",\"handlers\":[\"ValueError\"]},\"expected\":{\"status\":\"unhandled\",\"exceptionType\":\"ZeroDivisionError\",\"matchedHandler\":null,\"events\":[{\"activeLine\":\"EXC-RAISE\"},{\"activeLine\":\"EXC-MATCH\",\"matched\":false},{\"activeLine\":\"EXC-UNHANDLED\"},{\"activeLine\":\"EXC-END\"}]}},\"finally-closes\":{\"input\":{\"operation\":\"read malformed open file\",\"handlers\":[\"ValueError\"],\"finally\":\"close\",\"resourceOpen\":true},\"expected\":{\"status\":\"recovered\",\"exceptionType\":\"ValueError\",\"matchedHandler\":\"ValueError\",\"resourceOpen\":false,\"events\":[{\"activeLine\":\"EXC-RAISE\"},{\"activeLine\":\"EXC-HANDLE\"},{\"activeLine\":\"EXC-CLEAN\",\"resourceOpen\":false},{\"activeLine\":\"EXC-END\"}]}},\"validation-contrast\":{\"input\":{\"operation\":\"IF age < 0 THEN report invalid\",\"age\":-1},\"expected\":{\"status\":\"validation-result\",\"exceptionType\":null,\"raised\":false,\"output\":[\"invalid age\"],\"events\":[{\"activeLine\":\"EXC-OP\",\"raised\":false,\"kind\":\"ordinary condition\"},{\"activeLine\":\"EXC-NORMAL\"},{\"activeLine\":\"EXC-END\"}]}}}}") as FixtureRoot;
const L = (en: string, vi: string): Localized => ({ en, vi });
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const deepFreeze = <T,>(value: T): T => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const asRecord = (value: unknown): Record<string, unknown> => isRecord(value) ? copy(value) : {};
const asStringArray = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const asObjectArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord).map(copy) : [];
const without = (value: Readonly<Record<string, unknown>>, ...keys: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const assertScenario = <T extends string>(value: string, ids: readonly T[]): T => {
  if (!ids.includes(value as T)) throw new RangeError(`Unknown scenario: ${value}`);
  return value as T;
};
const fixture = (family: string, scenario: string): Fixture => {
  const candidate = LOCKED_FIXTURES[family]?.[scenario];
  if (!isRecord(candidate) || !isRecord(candidate.input) || !isRecord(candidate.expected)) {
    throw new RangeError(`Unknown scenario: ${scenario}`);
  }
  return candidate as Fixture;
};
const statusFor = (family: string, scenario: string, expected: Readonly<Record<string, unknown>>): string => {
  if (typeof expected.status === "string") return expected.status;
  if (family === "paradigmProcedural" && scenario.startsWith("recognise-")) return "classified";
  if (family === "classEncapsulation" && scenario === "design-class") return "designed";
  if (family === "oopDispatch" && expected.valid === false) return "rejected";
  if (family === "randomFile" && scenario === "empty-slot") return "empty-record";
  return "complete";
};
const semanticRule = (line: string): Localized =>
  L(`Apply the locked ${line} transition.`, `Áp dụng chuyển tiếp ${line} đã khóa.`);

function buildTrace<S extends BaseState>(
  scenario: string,
  initialInput: S,
  family: string,
  pseudocode: readonly string[],
  projectFinal: (state: S, expected: Readonly<Record<string, unknown>>) => S,
): FurtherProgrammingTrace<S> {
  const source = fixture(family, scenario);
  const events = Array.isArray(source.expected.events) ? source.expected.events : [];
  let state = copy(initialInput);
  const initial = copy(state);
  const steps: FurtherProgrammingStep<S>[] = [];
  const readyText = L("Inspect the bounded fixture before the first transition.", "Kiểm tra fixture hữu hạn trước chuyển tiếp đầu tiên.");
  steps.push({
    id: "ready",
    activeLine: "",
    title: L("Ready", "Sẵn sàng"),
    action: readyText,
    rule: readyText,
    outcome: readyText,
    codeLine: "READY",
    before: copy(state),
    after: copy(state),
  });
  events.forEach((event, index) => {
    const before = copy(state);
    const eventData = without(event, "activeLine");
    state = { ...state, ...eventData, activeLine: event.activeLine, status: state.status === "ready" ? "running" : state.status };
    if (index === events.length - 1) state = projectFinal(state, source.expected);
    const rule = semanticRule(event.activeLine);
    const outcome = L(
      `${event.activeLine} produces the displayed deterministic state.`,
      `${event.activeLine} tạo trạng thái tất định đang hiển thị.`,
    );
    steps.push({
      id: `${scenario}-${index + 1}`,
      activeLine: event.activeLine,
      title: rule,
      action: outcome,
      rule,
      outcome,
      codeLine: `${event.activeLine} ${JSON.stringify(eventData)}`,
      before,
      after: copy(state),
    });
  });
  return deepFreeze({
    fixtureId: scenario,
    scenario,
    convention: L("Bounded Cambridge teaching fixture; no arbitrary program, query or file is executed.", "Fixture dạy học Cambridge hữu hạn; không chạy chương trình, truy vấn hoặc tệp tùy ý."),
    pseudocode: [...pseudocode],
    initial,
    steps,
    final: copy(state),
  });
}

const expectedProjection = (
  family: string,
  scenario: string,
  state: BaseState,
  expected: Readonly<Record<string, unknown>>,
): BaseState => {
  const projected = without(expected, "events");
  const nestedFinal = asRecord(projected.final);
  return {
    ...state,
    ...nestedFinal,
    ...projected,
    activeLine: state.activeLine,
    status: statusFor(family, scenario, expected),
    error: typeof expected.error === "string" ? expected.error : null,
  };
};

export function paradigmProceduralTrace(scenarioInput: string): FurtherProgrammingTrace<ParadigmProceduralState> {
  const scenario = assertScenario(scenarioInput, PARADIGM_SCENARIOS);
  const source = fixture("paradigmProcedural", scenario);
  const recognition = scenario.startsWith("recognise-");
  const inputBindings = asRecord(source.input.bindings);
  const initial: ParadigmProceduralState = {
    mode: recognition ? "recognition" : "procedural",
    problemId: scenario,
    evidence: [],
    selectedParadigm: null,
    routine: {
      name: scenario === "function-return" ? "DiscountedPrice" : scenario === "procedure-state" ? "AddPoints" : scenario === "function-missing-return" ? "Double" : "Classify",
      kind: scenario === "procedure-state" ? "procedure" : "function",
      parameters: Object.keys(inputBindings),
      returnType: scenario === "procedure-state" ? null : "INTEGER",
    },
    callStack: [],
    variables: { ...asRecord(source.input.initial), ...inputBindings },
    outputs: [],
    returnValue: null,
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "paradigmProcedural", ["Inspect the bounded problem.", "Bind parameters before executing a routine.", "A FUNCTION returns a value; a PROCEDURE changes state."], (state, expected) => {
    const projected = expectedProjection("paradigmProcedural", scenario, state, expected);
    const selected = typeof expected.paradigm === "string" ? expected.paradigm : null;
    const finalValues = asRecord(expected.final);
    return {
      ...state,
      ...projected,
      evidence: Array.isArray(expected.evidence) ? asStringArray(expected.evidence) : state.evidence,
      selectedParadigm: selected as ParadigmProceduralState["selectedParadigm"],
      callStack: [],
      variables: Object.keys(finalValues).length ? finalValues : state.variables,
      outputs: Array.isArray(expected.outputs) ? copy(expected.outputs) : state.outputs,
      returnValue: expected.returnValue ?? null,
    };
  });
}

export function addressingModeTrace(scenarioInput: string): FurtherProgrammingTrace<AddressingState> {
  const scenario = assertScenario(scenarioInput, ADDRESSING_SCENARIOS);
  const source = fixture("addressing", scenario);
  const input = source.input;
  const initial: AddressingState = {
    instruction: String(input.instruction ?? ""),
    mode: input.mode as AddressingState["mode"],
    operandField: Number(input.operandField ?? 0),
    pcFetch: Number(input.instructionAddress ?? 0),
    pcReference: Number(input.instructionAddress ?? 0),
    ix: Number(input.ix ?? 0),
    memory: asRecord(input.memory) as Record<string, number>,
    dereferencePath: [],
    effectiveAddress: null,
    value: null,
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "addressing", ["Read the operand field.", "Resolve the effective address for the declared mode.", "Dereference memory only when the mode requires it."], (state, expected) => ({
    ...state,
    ...expectedProjection("addressing", scenario, state, expected),
    effectiveAddress: typeof expected.effectiveAddress === "number" ? expected.effectiveAddress : null,
    dereferencePath: Array.isArray(expected.dereferencePath) ? expected.dereferencePath.map(Number) : [],
    value: typeof expected.finalValue === "number" ? expected.finalValue : null,
  }));
}

export function assemblyExecutionTrace(scenarioInput: string): FurtherProgrammingTrace<AssemblyState> {
  const scenario = assertScenario(scenarioInput, ASSEMBLY_SCENARIOS);
  const source = fixture("assembly", scenario);
  const input = source.input;
  const program = asStringArray(input.program);
  const initial: AssemblyState = {
    program,
    instructionSetId: "S20-ASM-COURSEBOOK-1",
    pc: 0,
    currentInstruction: program[0] ?? null,
    registers: { ACC: Number(input.ACC ?? 0), IX: Number(input.IX ?? 0) },
    flags: { comparison: "unset" },
    memory: asRecord(input.memory) as Record<string, number>,
    operandResolution: {},
    branchDecision: null,
    output: [],
    halted: false,
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "assembly", ["Fetch the current instruction.", "Resolve only the reviewed operand.", "Execute one deterministic instruction effect.", "Stop at END or a typed invalid instruction."], (state, expected) => {
    const projected = expectedProjection("assembly", scenario, state, expected);
    const final = asRecord(expected.final);
    const selected = typeof expected.selected === "string" ? expected.selected : null;
    return {
      ...state,
      ...projected,
      program,
      pc: Number(final.pc ?? state.pc),
      currentInstruction: null,
      registers: { ACC: Number(final.ACC ?? state.registers.ACC ?? 0), IX: Number(final.IX ?? state.registers.IX ?? 0) },
      flags: { comparison: String(final.comparison ?? state.flags.comparison ?? "unset") },
      memory: Object.keys(asRecord(final.memory)).length ? asRecord(final.memory) as Record<string, number> : state.memory,
      output: Array.isArray(final.output) ? copy(final.output) : state.output,
      halted: Boolean(final.halted ?? state.halted),
      selected,
      selectedInstruction: selected,
    };
  });
}

export function classEncapsulationTrace(scenarioInput: string): FurtherProgrammingTrace<EncapsulationState> {
  const scenario = assertScenario(scenarioInput, ENCAPSULATION_SCENARIOS);
  const source = fixture("classEncapsulation", scenario);
  const classDefinition = asRecord(LOCKED_FIXTURES.classEncapsulation.classDefinition);
  const initial: EncapsulationState = {
    classDefinition,
    instances: asObjectArray(source.input.instances),
    receiverId: null,
    method: null,
    bindings: {},
    returnValue: null,
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "classEncapsulation", ["Select the receiver.", "Enter a public method.", "Validate before changing private state.", "Return the declared result."], (state, expected) => ({
    ...state,
    ...expectedProjection("classEncapsulation", scenario, state, expected),
    classDefinition,
    instances: Array.isArray(expected.instances) ? asObjectArray(expected.instances) : state.instances,
    receiverId: typeof state.receiverId === "string" ? state.receiverId : null,
    method: typeof state.method === "string" ? state.method : null,
    returnValue: expected.returnValue ?? null,
  }));
}

export function oopDispatchTrace(scenarioInput: string): FurtherProgrammingTrace<OopRelationshipState> {
  const scenario = assertScenario(scenarioInput, OOP_RELATIONSHIP_SCENARIOS);
  const source = fixture("oopDispatch", scenario);
  const initial: OopRelationshipState = {
    classes: asRecord(LOCKED_FIXTURES.oopDispatch.classes),
    relationships: [],
    referenceType: typeof source.input.referenceType === "string" ? source.input.referenceType : null,
    actualType: null,
    receiverId: typeof source.input.receiverId === "string" ? source.input.receiverId : null,
    lookupPath: [],
    selectedMethod: null,
    objects: asObjectArray(source.input.objects ?? LOCKED_FIXTURES.oopDispatch.initialObjects),
    result: null,
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "oopDispatch", ["Identify is-a or has-a.", "Resolve the actual receiver type.", "Select an override or inherited method.", "Mutate only the named receiver."], (state, expected) => ({
    ...state,
    ...expectedProjection("oopDispatch", scenario, state, expected),
    actualType: typeof expected.actualType === "string" ? expected.actualType : state.actualType,
    lookupPath: Array.isArray(expected.lookupPath) ? asStringArray(expected.lookupPath) : state.lookupPath,
    selectedMethod: typeof expected.selectedMethod === "string" ? expected.selectedMethod : state.selectedMethod,
    objects: Array.isArray(expected.objects) ? asObjectArray(expected.objects) : state.objects,
    result: expected.result ?? null,
  }));
}

export function declarativeProofTrace(scenarioInput: string): FurtherProgrammingTrace<DeclarativeState> {
  const scenario = assertScenario(scenarioInput, DECLARATIVE_SCENARIOS);
  const source = fixture("declarative", scenario);
  const initial: DeclarativeState = {
    facts: asStringArray(LOCKED_FIXTURES.declarative.facts),
    rules: asStringArray(LOCKED_FIXTURES.declarative.rules),
    goal: String(source.input.goal ?? ""),
    pendingGoals: [],
    bindings: {},
    proofNodes: [],
    proofEdges: [],
    proof: [],
    solutions: [],
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "declarative", ["Select one bounded goal.", "Match supplied facts or rule conclusions.", "Maintain consistent bindings.", "Report the finite proof or the missing premise."], (state, expected) => {
    const proof = asStringArray(expected.proof);
    const solutions = asObjectArray(expected.solutions) as Record<string, string>[];
    return {
      ...state,
      ...expectedProjection("declarative", scenario, state, expected),
      pendingGoals: [],
      bindings: asRecord(expected.bindings) as Record<string, string>,
      proof,
      solutions,
      proofNodes: proof.map((text, index) => ({ id: `proof-${index}`, text, status: "proved" })),
      proofEdges: proof.slice(1).map((_, index) => ({ from: `proof-${index + 1}`, to: "proof-0" })),
    };
  });
}

export function sequentialFileTrace(scenarioInput: string): FurtherProgrammingTrace<SequentialFileState> {
  const scenario = assertScenario(scenarioInput, SEQUENTIAL_FILE_SCENARIOS);
  const source = fixture("sequentialFile", scenario);
  const operation = String(source.input.operation ?? "");
  const mode: SequentialFileState["mode"] = operation.includes("APPEND") ? "APPEND" : operation.includes("WRITE") ? "WRITE" : "READ";
  const initial: SequentialFileState = {
    mode,
    exists: source.input.exists !== false,
    isOpen: Boolean(source.input.isOpen),
    records: asStringArray(source.input.records),
    pointer: Number(source.input.pointer ?? 0),
    currentRecord: null,
    eof: false,
    processedValue: null,
    outputRecords: [],
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "sequentialFile", ["Open the in-memory text file in the declared mode.", "Test EOF before every read.", "Read or write one record at a time.", "Close the handle."], (state, expected) => {
    const projected = expectedProjection("sequentialFile", scenario, state, expected);
    const final = asRecord(expected.final);
    return {
      ...state,
      ...projected,
      mode,
      exists: state.exists,
      isOpen: Boolean(final.isOpen ?? state.isOpen),
      records: Array.isArray(final.records) ? asStringArray(final.records) : state.records,
      pointer: Number(final.pointer ?? state.pointer),
      eof: Boolean(final.eof ?? state.eof),
      outputRecords: Array.isArray(expected.outputRecords) ? asStringArray(expected.outputRecords) : state.outputRecords,
      readValues: Array.isArray(expected.readValues) ? asStringArray(expected.readValues) : [],
    };
  });
}

export function randomFileTrace(scenarioInput: string): FurtherProgrammingTrace<RandomFileState> {
  const scenario = assertScenario(scenarioInput, RANDOM_FILE_SCENARIOS);
  const source = fixture("randomFile", scenario);
  const convention = asRecord(LOCKED_FIXTURES.randomFile.recordConvention);
  const byteExample = asRecord(convention.byteExample);
  const byteOffsetScenario = scenario === "byte-offset-example";
  const recordNumber = Number(source.input.position ?? source.input.recordNumber ?? 0);
  const initial: RandomFileState = {
    recordBase: byteOffsetScenario ? 1 : 0,
    baseAddress: Number(source.input.baseByte ?? byteExample.baseByte ?? 0),
    recordSize: Number(source.input.recordSize ?? byteExample.recordSize ?? 24),
    slots: asObjectArray(source.input.slots ?? LOCKED_FIXTURES.randomFile.baseSlots),
    recordNumber,
    offset: null,
    pointer: 0,
    selectedRecord: null,
    sequentialPath: [],
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "randomFile", ["Check the reviewed fixed-record bounds.", "Calculate the declared logical or byte offset.", "SEEK changes the pointer.", "READ or WRITE affects only the selected record."], (state, expected) => {
    const projected = expectedProjection("randomFile", scenario, state, expected);
    const selected = isRecord(expected.record) ? asRecord(expected.record) : isRecord(expected.selectedRecord) ? asRecord(expected.selectedRecord) : null;
    return {
      ...state,
      ...projected,
      slots: Array.isArray(expected.slots) ? asObjectArray(expected.slots) : state.slots,
      pointer: Number(expected.pointer ?? state.pointer),
      selectedRecord: selected,
      sequentialPath: Array.isArray(expected.sequentialPath) ? expected.sequentialPath.map(Number) : state.sequentialPath,
      offset: typeof expected.byteOffset === "number" ? expected.byteOffset : state.offset,
    };
  });
}

export function exceptionFlowTrace(scenarioInput: string): FurtherProgrammingTrace<ExceptionState> {
  const scenario = assertScenario(scenarioInput, EXCEPTION_SCENARIOS);
  const source = fixture("exception", scenario);
  const initial: ExceptionState = {
    language: "Python 3",
    scenario,
    tryLine: String(source.input.operation ?? ""),
    exceptionType: null,
    raised: false,
    handlerChecks: asStringArray(source.input.handlers),
    matchedHandler: null,
    skippedLines: [],
    attempt: 1,
    resourceOpen: Boolean(source.input.resourceOpen),
    output: [],
    activeLine: "",
    status: "ready",
    error: null,
  };
  return buildTrace(scenario, initial, "exception", ["Enter the protected block.", "Run the reviewed operation.", "Match a typed handler when an exception is raised.", "Run declared cleanup and record the outcome."], (state, expected) => ({
    ...state,
    ...expectedProjection("exception", scenario, state, expected),
    exceptionType: typeof expected.exceptionType === "string" ? expected.exceptionType : null,
    raised: Boolean(expected.raised ?? state.raised),
    matchedHandler: typeof expected.matchedHandler === "string" ? expected.matchedHandler : null,
    skippedLines: Array.isArray(expected.skippedLines) ? asStringArray(expected.skippedLines) : [],
    attempt: Number(expected.attempts ?? state.attempt),
    resourceOpen: Boolean(expected.resourceOpen ?? state.resourceOpen),
    output: Array.isArray(expected.output) ? copy(expected.output) : state.output,
  }));
}

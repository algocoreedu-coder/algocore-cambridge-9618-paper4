import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "paper4");
const outputRoot = join(contentRoot, "assessments", "production");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const bilingual = (vi, en) => ({ vi, en });
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const lessonId = (slug) => `ac-9618-p4-2026-python.lesson.${slug}`;
const stableAtomId = (sourceId) => sourceId.replace(/[^A-Za-z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const pilotSlugs = new Set(["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"]);
const productionSlugs = [
  "binary-tree", "dictionary", "exam-workflow", "exceptions", "graphs", "linked-list",
  "oop-aggregation", "oop-inheritance", "oop-model", "oop-state", "performance",
  "procedural-design", "random-files", "search-collections", "sorting", "stack", "testing",
  "text-files", "text-processing", "validation-rules",
];

// These profiles make every task lesson-specific while the canonical fixture IDs keep it executable.
const profiles = {
  "binary-tree": ["cây nhị phân với insert, search và ba phép duyệt", "a binary tree with insertion, search, and three traversals", "giữ quy tắc left < node < right và không chèn duplicate", "preserve left < node < right and do not insert duplicates"],
  dictionary: ["dictionary ánh xạ khóa duy nhất sang giá trị, gồm find/insert/update/delete", "a dictionary mapping unique keys to values through find/insert/update/delete", "quyết định rõ hành vi khóa thiếu và chỉ cập nhật một lần", "define missing-key behaviour and update exactly once"],
  "exam-workflow": ["main program ghép input, lời gọi subroutine, output và bằng chứng chạy", "a main program that composes input, subroutine calls, output, and run evidence", "mọi output phải đến từ state đã kiểm tra và đúng định dạng đề", "every output must come from checked state and match the required format"],
  exceptions: ["xử lý lỗi theo từng record và cleanup tài nguyên", "per-record error recovery and resource cleanup", "bắt đúng lỗi, ghi log, tiếp tục an toàn và luôn cleanup", "catch the intended failure, log it, recover safely, and always clean up"],
  graphs: ["adjacency list/matrix có hướng, trọng số và đỉnh cô lập", "adjacency lists/matrices with direction, weights, and isolated vertices", "không làm mất direction/weight và vẫn giữ đỉnh không có cạnh", "preserve direction/weight and retain vertices with no edges"],
  "linked-list": ["linked list dạng mảng với start pointer, next pointer và free list", "an array-backed linked list with start, next pointers, and a free list", "mọi node sống xuất hiện đúng một lần và node xóa quay về free list", "each live node appears exactly once and removed nodes return to the free list"],
  "oop-aggregation": ["quan hệ has-a với phép thêm phần tử có giới hạn", "a has-a relationship with capacity-bounded addition", "kiểm tra capacity trước mutation và truy cập object con qua owner", "check capacity before mutation and access the nested object through its owner"],
  "oop-inheritance": ["base/derived class, override và polymorphic dispatch", "base/derived classes, overriding, and polymorphic dispatch", "constructor base chạy đúng và lời gọi qua base reference chọn override", "run base construction correctly and dispatch an overridden method through a base reference"],
  "oop-model": ["thiết kế class, constructor và tạo nhiều object độc lập", "class design, construction, and creation of independent objects", "mỗi instance giữ state riêng và constructor thiết lập invariant", "each instance owns separate state and the constructor establishes the invariant"],
  "oop-state": ["encapsulation bằng getter, setter và rule-based update", "encapsulation through getters, setters, and rule-based updates", "mọi thay đổi state đi qua validation và rejected update không mutate", "route every state change through validation and keep state unchanged after rejection"],
  performance: ["đếm operation và chọn linear/binary/sort theo workload", "operation counting and selection of linear/binary/sort for a workload", "nêu precondition, setup cost và tần suất query trước khi so sánh", "state preconditions, setup cost, and query frequency before comparing strategies"],
  "procedural-design": ["dịch pseudocode thành subroutine Python với parameter mode và I/O rõ", "translation of pseudocode into Python subroutines with explicit parameter roles and I/O", "giữ nguyên selection/iteration contract và không giấu mutation", "preserve selection/iteration contracts and do not hide mutation"],
  "random-files": ["địa chỉ record cố định và read/write/update truy cập trực tiếp", "fixed-record addressing and direct read/write/update access", "tính offset từ record number, kiểm tra range rồi mới ghi", "derive the offset from the record number and validate range before writing"],
  "search-collections": ["linear find, count, filter và group totals trên collection", "linear find, count, filter, and grouped totals over a collection", "duyệt đủ phần tử khi cần all matches và không double-count", "scan every item when all matches are required and never double-count"],
  sorting: ["ordered insert, bubble passes và insertion shifts", "ordered insertion, bubble passes, and insertion shifts", "giữ sorted prefix/suffix invariant và không ghi đè phần tử khi shift", "preserve the sorted prefix/suffix invariant and do not overwrite an item while shifting"],
  stack: ["stack array với top convention, push/pop, pair và reduce", "an array stack with a fixed top convention, push/pop, pairing, and reduction", "guard full/empty trước mutation và giữ đúng LIFO", "guard full/empty before mutation and preserve LIFO"],
  testing: ["test plan normal/boundary/invalid với expected độc lập actual", "a normal/boundary/invalid test plan whose expected values are independent of actual results", "suy expected từ requirement, lưu provenance và sửa lỗi đầu tiên", "derive expected values from requirements, retain provenance, and repair the first divergence"],
  "text-files": ["vòng đời text file, đọc tuần tự, load record và write/append", "the text-file lifecycle, sequential reads, record loading, and write/append", "open đúng mode, parse đủ field và đóng file kể cả khi lỗi", "open in the correct mode, parse every field, and close the file even on failure"],
  "text-processing": ["so sánh ký tự, tokenise delimiter, typed routing và run-length", "character comparison, delimiter tokenisation, typed routing, and run-length encoding", "xử lý token cuối, run cuối và ký tự không hợp lệ mà không mất dữ liệu", "handle the final token, final run, and invalid characters without losing data"],
  "validation-rules": ["input validation, unique selection, rule outcome và check digit", "input validation, unique selection, rule outcomes, and check digits", "tính rule từ dữ liệu gốc, phân biệt invalid với duplicate và không mutate khi reject", "compute the rule from source data, distinguish invalid from duplicate, and do not mutate on rejection"],
};

const oopPrompts = {
  "oop-model": {
    guided: bilingual(
      "Từ yêu cầu quản lý Student gồm student_id, name và score, hãy lập class-design checklist: entity, state, responsibility, constructor, public method và invariant. Sau đó dự đoán trace khi tạo hai instance độc lập.",
      "From a requirement to manage a Student with student_id, name, and score, produce a class-design checklist: entity, state, responsibility, constructor, public method, and invariant. Then predict the trace for two independent instances."),
    faded: bilingual(
      "Sửa class Student có method thiếu self và constructor gán field trước validation. Nộp code chạy được và chứng minh invalid input không tạo object nửa hợp lệ.",
      "Repair a Student class whose method omits self and whose constructor assigns fields before validation. Submit runnable code and prove that invalid input creates no partially valid object."),
    independent: bilingual(
      "Thiết kế một class mới từ prompt, tạo hai instance, thay đổi một instance và chứng minh instance còn lại không đổi bằng normal, boundary và failure evidence.",
      "Design a new class from a prompt, create two instances, change one instance, and prove the other remains unchanged with normal, boundary, and failure evidence."),
  },
  "oop-state": {
    guided: bilingual(
      "Trace Account qua getter, setter và rule-based update. Đánh dấu guard chạy trước write và state được giữ khi update bị từ chối.",
      "Trace Account through a getter, setter, and rule-based update. Mark the guard before the write and the state preserved after a rejected update."),
    faded: bilingual(
      "Sửa code client đang ghi trực tiếp __balance và setter đang mutate trước validation. Giữ explicit getter/setter là đường ôn thi; ghi @property là Python nuance bổ sung.",
      "Repair client code that writes __balance directly and a setter that mutates before validation. Keep explicit getters/setters as the exam path; label @property as supplementary Python nuance."),
    independent: bilingual(
      "Cài đặt class có private-by-convention state, getter, validated setter và relative update; chứng minh mỗi rejected operation không mutate state.",
      "Implement a class with private-by-convention state, a getter, a validated setter, and a relative update; prove every rejected operation leaves state unchanged."),
  },
  "oop-inheritance": {
    guided: bilingual(
      "Trace constructor chain Rectangle.__init__ → super().__init__, rồi xác định runtime type, selected area() method và output cho từng object.",
      "Trace the Rectangle.__init__ → super().__init__ constructor chain, then identify each object's runtime type, selected area() method, and output."),
    faded: bilingual(
      "Sửa subclass bỏ super() và override sai tên hoặc signature. Giải thích vì sao overload không thay thế override trong lời giải này.",
      "Repair a subclass that omits super() and misnames or changes the signature of an override. Explain why overloading does not replace overriding in this solution."),
    independent: bilingual(
      "Thiết kế base contract và hai subclass is-a; xử lý collection qua cùng area() call mà không dùng chuỗi isinstance, rồi kiểm chứng dynamic dispatch.",
      "Design a base contract and two is-a subclasses; process a collection through the same area() call without an isinstance chain, then verify dynamic dispatch."),
  },
  "oop-aggregation": {
    guided: bilingual(
      "Vẽ object graph Shelf has-a Book, chỉ ra owner, component references và state của từng object; giải thích vì sao đây không phải is-a.",
      "Draw the Shelf has-a Book object graph, identifying the owner, component references, and each object's state; explain why this is not an is-a relationship."),
    faded: bilingual(
      "Sửa add() đang append trước khi kiểm tra capacity và type. Dùng fixture full-capacity và wrong-object-type để chứng minh collection không đổi khi reject.",
      "Repair add() when it appends before checking capacity and type. Use full-capacity and wrong-object-type fixtures to prove the collection remains unchanged after rejection."),
    independent: bilingual(
      "Cài đặt aggregate mới có component method delegation, capacity guard và object graph; kiểm chứng normal, boundary và failure mà không dùng inheritance cho quan hệ has-a.",
      "Implement a new aggregate with component-method delegation, a capacity guard, and an object graph; verify normal, boundary, and failure cases without using inheritance for the has-a relationship."),
  },
};

function atomCriterion(atom) {
  const details = [
    `disposition=${atom.disposition}`, `award_semantics=${atom.award_semantics}`,
    atom.group_id ? `group=${atom.group_id}` : null,
    atom.group_max !== null ? `group_max=${atom.group_max}` : null,
    atom.dependency ? `dependency=${JSON.stringify(atom.dependency)}` : null,
    atom.alternatives?.length ? `alternatives=${JSON.stringify(atom.alternatives)}` : null,
    atom.source_issue_refs?.length ? `source_issues=${atom.source_issue_refs.join(",")}` : null,
  ].filter(Boolean).join("; ");
  return bilingual(
    `${atom.criterion_paraphrase} [${details}. Diễn giải biên tập theo đúng ngữ cảnh locator; xem QP/MS và giữ group/dependency. Không suy ra số điểm.]`,
    `${atom.criterion_paraphrase} [${details}. Context-bound editorial paraphrase; consult the cited QP/MS and preserve group/dependency. No mark allocation is inferred.]`,
  );
}

function atomLocator(atom) {
  const qp = atom.qp_locators[0];
  const ms = atom.ms_locator;
  return {
    source_id: ms.source_id, pdf_page: ms.pdf_pages[0], heading: `${atom.paper_id} ${atom.part_id}`,
    bullet_locator: atom.marking_point_id,
    anchor_text: `QP ${qp.source_id} pdf ${qp.pdf_pages.join(",")} requirement ${qp.requirement_id}; MS ${ms.source_id} pdf ${ms.pdf_pages.join(",")}`,
  };
}

function prompts(slug) {
  if (oopPrompts[slug]) {
    return Object.fromEntries(Object.entries(oopPrompts[slug]).map(([level, prompt]) => [level, bilingual(
      `${prompt.vi} Dùng fixture và output canonical của mức này làm bằng chứng thực thi.`,
      `${prompt.en} Use this level's fixture and canonical output as execution evidence.`
    )]));
  }
  const [focusVi, focusEn, invariantVi, invariantEn] = profiles[slug];
  const generated = {
    guided: bilingual(
      `Chạy fixture normal cho ${focusVi}. Trước khi chạy, dự đoán event và state chính; sau đó lập trace trước/event/sau, đối chiếu output canonical và giải thích invariant: ${invariantVi}.`,
      `Run the normal fixture for ${focusEn}. Predict the key events and state before execution, then submit a before/event/after trace, compare it with canonical output, and explain this invariant: ${invariantEn}.`,
    ),
    faded: bilingual(
      `Hoàn thiện hoặc sửa đoạn Python cho fixture boundary của ${focusVi}. Nộp code chạy được, output thực tế, state trước/sau và chỉ ra guard đầu tiên bảo vệ quy tắc: ${invariantVi}.`,
      `Complete or repair the Python for the boundary fixture of ${focusEn}. Submit runnable code, actual output, before/after state, and identify the first guard that protects this rule: ${invariantEn}.`,
    ),
    independent: bilingual(
      `Tự cài đặt và kiểm chứng ${focusVi} bằng cả ba fixture normal, boundary và failure. Nộp code, ba output thực tế, assertions, trace lỗi đầu tiên và giải thích vì sao lời giải giữ quy tắc: ${invariantVi}.`,
      `Independently implement and verify ${focusEn} with all three fixtures: normal, boundary, and failure. Submit code, three actual outputs, assertions, a first-divergence trace, and explain why the solution preserves this rule: ${invariantEn}.`,
    ),
  };
  if (slug === "exam-workflow") {
    generated.independent = bilingual(
      "Capstone OOP: từ prompt hãy thiết kế class, tạo aggregate has-a chứa các object thuộc base/subclass, xử lý bằng polymorphic call, rồi bàn giao output qua main workflow. Nộp code, ba fixture và output normal/boundary/failure, object graph, constructor/dynamic-dispatch trace và evidence matrix; đây là bài AlgoCore tích hợp, không tạo official pattern mới.",
      "OOP capstone: design a class from the prompt, create a has-a aggregate containing base/subclass objects, process them through a polymorphic call, and hand the output to the main workflow. Submit code, three normal/boundary/failure fixture outputs, an object graph, constructor/dynamic-dispatch trace, and an evidence matrix; this is an AlgoCore integration task and creates no new official pattern.");
  }
  return generated;
}

function assessmentRubric(slug, level, patterns, requirements, refs, representational) {
  const patternLabel = patterns.join(", ");
  const criteria = [
    {
      criterion_id: `${slug}.${level}.rubric.requirement`,
      description: bilingual(
        `Bằng chứng trả lời đúng các requirement ${requirements.join(", ")} và dùng ${patternLabel} như ${representational ? "nhãn workflow/biểu diễn AlgoCore, không phải phân bổ điểm Cambridge" : "các pattern đã nối nguồn"}.`,
        `Evidence answers requirements ${requirements.join(", ")} and uses ${patternLabel} as ${representational ? "AlgoCore workflow/representation labels, not Cambridge mark allocations" : "source-linked patterns"}.`,
      ),
      evidence_required: "Submitted code and trace explicitly identify the linked requirement and each listed pattern role.",
    },
    {
      criterion_id: `${slug}.${level}.rubric.execution`,
      description: bilingual("Output thực tế khớp fixture và expected output canonical.", "Actual output matches the canonical fixture and expected output."),
      evidence_required: `Actual run evidence resolving ${refs.join(", ")}.`,
    },
    {
      criterion_id: `${slug}.${level}.rubric.trace`,
      description: bilingual("Trace xác định state đầu, event quan trọng, state cuối và invariant hoặc lỗi đầu tiên.", "The trace identifies initial state, meaningful events, final state, and the invariant or first divergence."),
      evidence_required: "A before/event/after trace and first-divergence diagnosis when applicable.",
    },
  ];
  if (level === "independent") criteria.push({
    criterion_id: `${slug}.${level}.rubric.transfer`,
    description: bilingual("Lời giải chạy đủ normal, boundary và failure khi đáp án vẫn bị ẩn.", "The solution runs normal, boundary, and failure while the answer remains hidden."),
    evidence_required: "Three actual outputs plus assertions for acceptance, boundary behaviour, and rejection.",
  });
  return {
    authority: "AlgoCore_authored_rubric", official_marks: null, criteria,
    pass_rule: bilingual(`Đạt khi có bằng chứng cho đủ ${criteria.length}/${criteria.length} tiêu chí và mọi output canonical khớp.`, `Pass only with evidence for all ${criteria.length}/${criteria.length} criteria and matching canonical outputs.`),
    retry_rule: bilingual("Sửa event sai đầu tiên, chạy lại fixture liên quan rồi regression-check các fixture đã đạt.", "Repair the first wrong event, rerun the affected fixture, then regression-check previously passing fixtures."),
    pattern_authority: representational ? "AlgoCore_representational_workflow_only" : "source_linked_pattern_workflow",
  };
}

const markingPath = join(contentRoot, "mappings", "marking-disposition.json");
const assessmentPath = join(contentRoot, "mappings", "assessment-item-map.json");
const [markingText, assessmentText] = await Promise.all([readFile(markingPath, "utf8"), readFile(assessmentPath, "utf8")]);
const markingMap = JSON.parse(markingText);
const assessmentMap = JSON.parse(assessmentText);
const productionLessonIds = new Set(productionSlugs.map(lessonId));
const productionChains = markingMap.marking_chains.filter((chain) => productionLessonIds.has(chain.lesson_id));
const atomsByPattern = new Map();
for (const atom of markingMap.marking_atom_dispositions) {
  if (!atomsByPattern.has(atom.pattern_id)) atomsByPattern.set(atom.pattern_id, []);
  atomsByPattern.get(atom.pattern_id).push(atom);
}

const markingEnvelopes = productionChains.map((chain) => {
  const atoms = atomsByPattern.get(chain.pattern_id) ?? [];
  const caveats = atoms.filter((atom) => atom.disposition === "RETAIN_WITH_SOURCE_CAVEAT").length;
  return {
    schema_version: "2.0.0", artifact_type: "MarkingChain",
    record: {
      marking_chain_id: chain.marking_chain_id, pattern_id: chain.pattern_id, lesson_id: chain.lesson_id,
      requirement_ref: chain.requirement_ref, method_step_refs: chain.method_step_refs, error_ref: chain.error_refs[0],
      detection_check: chain.detection_check,
      repair_check: bilingual(`${chain.repair_check.vi} Error refs nguồn: ${chain.error_refs.join(", ")}.`, `${chain.repair_check.en} Source error refs: ${chain.error_refs.join(", ")}.`),
      marking_atoms: atoms.map((atom) => ({ atom_id: stableAtomId(atom.marking_point_id), authority: "Cambridge_QP_MS", criterion: atomCriterion(atom), locator: atomLocator(atom) })),
      limited_evidence: chain.limited_evidence,
      transfer_limit: bilingual(`${chain.transfer_limit.vi} ${caveats} atom có caveat; không cộng atom thành tổng điểm mới.`, `${chain.transfer_limit.en} ${caveats} atoms carry caveats; atoms must not be summed into a new mark total.`),
      reviewer: "A7_P4R3_PRODUCTION_PEDAGOGY_REVIEW", status: "reviewed",
    },
  };
});

const sourceItems = assessmentMap.assessment_items.filter((item) => productionLessonIds.has(item.lesson_id));
const sourceByLessonLevel = new Map(sourceItems.map((item) => [`${item.lesson_id}:${item.level}`, item]));
const chainPatterns = new Set(markingEnvelopes.map((item) => item.record.pattern_id));
// Every assessment shares the complete executable evidence pack; the prompt still controls progression.
const caseByLevel = {
  guided: ["normal", "boundary", "failure"],
  faded: ["normal", "boundary", "failure"],
  independent: ["normal", "boundary", "failure"],
};
const expectedArtifact = {
  guided: bilingual("Trace song ngữ có dự đoán, state transition, output thực tế và một invariant check.", "A bilingual trace with prediction, state transition, actual output, and one invariant check."),
  faded: bilingual("Đoạn Python sửa được, output boundary, trace trước/sau và ghi chú guard.", "Runnable repaired Python, boundary output, before/after trace, and guard note."),
  independent: bilingual("Lời giải Python, ba output normal/boundary/failure, assertions và bản tự kiểm.", "Python solution, three normal/boundary/failure outputs, assertions, and self-audit."),
};

const assessmentEnvelopes = [];
const representationalLessons = [];
for (const slug of productionSlugs) {
  const artifact = await readJson(join(contentRoot, "python", "production", slug, "artifact.json"));
  const lessonPrompts = prompts(slug);
  for (const level of ["guided", "faded", "independent"]) {
    const source = sourceByLessonLevel.get(`${lessonId(slug)}:${level}`);
    if (!source) throw new Error(`Missing source assessment ${slug}:${level}`);
    const representational = source.pattern_ids.length === 0;
    const patterns = representational ? [...artifact.pattern_ids] : [...source.pattern_ids];
    if (representational) representationalLessons.push(slug);
    const requirements = representational
      ? [...source.assessment_requirement_ids]
      : [...new Set(patterns.map((pattern) => markingEnvelopes.find((item) => item.record.lesson_id === lessonId(slug) && item.record.pattern_id === pattern)?.record.requirement_ref))];
    if (requirements.includes(undefined) || requirements.length === 0) throw new Error(`Missing assessment requirement linkage for ${slug}:${level}`);
    const refs = [artifact.python_artifact_id];
    for (const caseKind of caseByLevel[level]) {
      const fixture = artifact.fixtures.find((item) => item.case_kind === caseKind);
      const expected = artifact.expected_outputs.find((item) => item.fixture_ref === fixture?.fixture_id);
      if (!fixture || !expected) throw new Error(`Missing ${slug}:${caseKind} execution reference`);
      refs.push(fixture.fixture_id, expected.expected_output_id);
    }
    const profile = profiles[slug];
    assessmentEnvelopes.push({
      schema_version: "2.0.0", artifact_type: "AssessmentItem",
      record: {
        assessment_item_id: source.assessment_item_id, lesson_id: lessonId(slug), pattern_ids: patterns,
        assessment_requirement_ids: requirements, destination_id: source.destination_id, level,
        prompt: lessonPrompts[level], shared_fixture_code_data_ids: refs, expected_artifact: expectedArtifact[level],
        hint: bilingual(`Kiểm tra guard trước mutation; dùng trace để chứng minh: ${profile[2]}.`, `Check the guard before mutation; use the trace to prove: ${profile[3]}.`),
        feedback: bilingual(`Nếu sai, tìm event đầu tiên vi phạm “${profile[2]}”, sửa event đó rồi chạy lại fixture hiện tại và các ca trước.`, `If incorrect, find the first event that violates “${profile[3]}”, repair it, then rerun the current and earlier cases.`),
        self_rubric: assessmentRubric(slug, level, patterns, requirements, refs, representational),
        disclosure_contract: { answer_hidden_initially: true, hint_hidden_initially: true, feedback_after_attempt: true },
      },
    });
  }
}

const manifest = {
  schema_version: "paper4-p4r3-assessment-production-v1", target_release: "paper4-2026-s9-v2",
  generated_by: "scripts/build-p4r3-assessment-production.mjs",
  authority_boundary: {
    cambridge_atoms: "All 1,830 production atoms remain context-bound to direct QP/MS locators; editorial paraphrases do not create a mark scheme.",
    practice_rubrics: "All 60 practice rubrics are AlgoCore-authored with official_marks=null.",
    representational_patterns: "For six lessons lacking a Stage 4 chain, Python artifact pattern IDs describe only workflow/representation and never imply Cambridge marks.",
  },
  inputs: [
    { path: "content/paper4/mappings/marking-disposition.json", sha256: sha256(markingText) },
    { path: "content/paper4/mappings/assessment-item-map.json", sha256: sha256(assessmentText) },
  ],
  counts: {
    lessons: productionSlugs.length, marking_chains: markingEnvelopes.length,
    marking_atoms: markingEnvelopes.reduce((sum, item) => sum + item.record.marking_atoms.length, 0),
    assessment_items: assessmentEnvelopes.length,
    legacy_a0_ids_preserved: assessmentEnvelopes.filter((item) => item.record.assessment_item_id.includes(".practice.")).length,
    representational_workflow_lessons: new Set(representationalLessons).size,
  },
  carryovers: [],
  files: {
    marking_chains: "content/paper4/assessments/production/marking-chains.json",
    assessment_items: "content/paper4/assessments/production/assessment-items.json",
  },
  status: "A7_REVIEWED_PRODUCTION_COMPLETE_PENDING_LEAD_A8_GATE",
};

await mkdir(outputRoot, { recursive: true });
await Promise.all([
  writeFile(join(outputRoot, "marking-chains.json"), `${JSON.stringify(markingEnvelopes, null, 2)}\n`),
  writeFile(join(outputRoot, "assessment-items.json"), `${JSON.stringify(assessmentEnvelopes, null, 2)}\n`),
  writeFile(join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`),
]);
console.log(JSON.stringify(manifest.counts, null, 2));

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "paper4");
const outputRoot = join(contentRoot, "assessments", "pilot");
const mappingRoot = join(contentRoot, "mappings");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const bilingual = (vi, en) => ({ vi, en });
const lessonId = (slug) => `ac-9618-p4-2026-python.lesson.${slug}`;
const stableAtomId = (sourceId) => sourceId.replace(/[^A-Za-z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const lessonSpecs = {
  "data-models": {
    prompts: {
      guided: bilingual(
        "Với fixture normal, lập bảng trước/sau cho `records`, kiểm tra cấu trúc record `{name, score}`, dự đoán thứ tự `check_record → check_capacity → append`, rồi tính `random_average`. Giải thích vì sao record và vùng lưu phải được kiểm tra trước khi append.",
        "Using the normal fixture, make a before/after table for `records`, validate the `{name, score}` record shape, predict `check_record → check_capacity → append`, then calculate `random_average`. Explain why the record and store must be checked before append."
      ),
      faded: bilingual(
        "Hoàn thiện logic `add_record` để fixture boundary trả `FULL` mà không đổi mảng. Nộp đoạn Python, trace `check_record/check_capacity`, trạng thái trước/sau và một câu chỉ ra lỗi tăng count hoặc append trước guard.",
        "Complete `add_record` so the boundary fixture returns `FULL` without changing the array. Submit the Python fragment, the `check_record/check_capacity` trace, before/after state, and one sentence identifying the error caused by appending or incrementing before the guard."
      ),
      independent: bilingual(
        "Viết và chạy mô-đun xử lý cả ba fixture: xác thực record, append có giới hạn, giữ đúng cấu trúc lưu và tính trung bình dữ liệu số. Nộp output thực tế cho normal/boundary/failure, assertions cho trạng thái không đổi khi từ chối và giải thích quy tắc biên của mảng.",
        "Write and run a module for all three fixtures: validate records, perform bounded append, preserve the storage shape, and compute the numeric-data average. Submit actual outputs for normal/boundary/failure, assertions that rejected operations do not mutate state, and an explanation of the array boundary rule."
      ),
    },
    patterns: {
      guided: ["DATA_RECORD", "DATA_STORAGE"],
      faded: ["ARRAY_APPEND"],
      independent: ["ARRAY_APPEND", "DATA_RECORD", "DATA_STORAGE", "RANDOM_ARRAY"],
    },
  },
  "binary-search": {
    prompts: {
      guided: bilingual(
        "Với fixture normal, trace từng vòng lặp bằng `low`, `high`, `middle` và giá trị giữa cho đến khi tìm thấy 31. Sau mỗi phép so sánh, nêu nửa khoảng bị loại và kiểm tra khoảng còn lại vẫn chứa mọi vị trí khả dĩ.",
        "For the normal fixture, trace every iteration using `low`, `high`, `middle`, and the middle value until 31 is found. After each comparison, name the discarded half and check that the remaining interval still contains every possible position."
      ),
      faded: bilingual(
        "Hoàn thiện guard và cập nhật biên để fixture boundary kết thúc an toàn với danh sách rỗng và fixture failure bị từ chối vì chưa sắp xếp. Nộp Python đã sửa, hai trace ngắn và giải thích vì sao dùng `middle - 1` hoặc `middle + 1`.",
        "Complete the guard and bound updates so the boundary fixture terminates safely on an empty list and the failure fixture is rejected as unsorted. Submit the repaired Python, two short traces, and explain why the update uses `middle - 1` or `middle + 1`."
      ),
      independent: bilingual(
        "Cài đặt tìm kiếm nhị phân theo hợp đồng danh sách tăng dần, bao gồm biến thể lặp và biến thể đệ quy có cùng kết quả. Chạy ba fixture, nộp output thực tế, trace khoảng tìm kiếm và assertions về found/not-found/unsorted.",
        "Implement binary search for an ascending-list contract, including iterative and recursive variants that return the same result. Run all three fixtures and submit actual outputs, interval traces, and assertions for found/not-found/unsorted cases."
      ),
    },
    patterns: { guided: ["BINARY_SEARCH"], faded: ["BINARY_SEARCH"], independent: ["BINARY_SEARCH"] },
  },
  queue: {
    prompts: {
      guided: bilingual(
        "Với fixture normal, vẽ trạng thái `items/front/rear/count` sau từng enqueue và dequeue. Đánh dấu ô được ghi hoặc đọc, chỉ ra thời điểm wrap-around và kiểm tra phần tử trả về giữ đúng FIFO.",
        "For the normal fixture, draw `items/front/rear/count` after each enqueue and dequeue. Mark the cell written or read, identify wrap-around, and check that the returned item preserves FIFO order."
      ),
      faded: bilingual(
        "Dùng fixture boundary để hoàn thiện guard empty/full, phép inspect không phá hủy và phép reduce trên các phần tử sống. Nộp đoạn Python còn thiếu, trace trước/sau cho lần dequeue rỗng và enqueue đầy, cùng phép kiểm tra `count <= capacity`.",
        "Use the boundary fixture to complete the empty/full guards, non-destructive inspection, and reduction over live items. Submit the missing Python, before/after traces for empty dequeue and full enqueue, and a `count <= capacity` check."
      ),
      independent: bilingual(
        "Tự cài đặt circular queue hoàn chỉnh gồm setup, enqueue, dequeue, inspect và reduce; chạy normal/boundary/failure. Nộp code, output thực tế, trace wrap-around, assertions FIFO và bằng chứng mọi thao tác bị từ chối đều giữ nguyên trạng thái.",
        "Implement a complete circular queue with setup, enqueue, dequeue, inspect, and reduce; run normal/boundary/failure. Submit code, actual outputs, a wrap-around trace, FIFO assertions, and evidence that every rejected operation leaves state unchanged."
      ),
    },
    patterns: {
      guided: ["QUEUE_SETUP", "QUEUE_ENQUEUE", "QUEUE_DEQUEUE"],
      faded: ["QUEUE_ENQUEUE", "QUEUE_DEQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE"],
      independent: ["QUEUE_SETUP", "QUEUE_ENQUEUE", "QUEUE_DEQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE"],
    },
  },
  recursion: {
    prompts: {
      guided: bilingual(
        "Với fixture normal, vẽ call stack của `recursive_sum`: ghi index khi gọi, xác định base case và điền kết quả theo thứ tự unwind. So sánh tổng cuối với phiên bản lặp.",
        "For the normal fixture, draw the `recursive_sum` call stack: record each call index, identify the base case, and fill results in unwind order. Compare the final total with the iterative version."
      ),
      faded: bilingual(
        "Hoàn thiện base case, bước tiến và return để fixture boundary rỗng trả 0; thêm guard để fixture failure bị từ chối trước lời gọi đệ quy. Chuyển cùng logic sang vòng lặp và nộp trace đối chiếu.",
        "Complete the base case, progress step, and return so the empty boundary fixture returns 0; add a guard so the failure fixture is rejected before recursion. Translate the same logic to a loop and submit a comparison trace."
      ),
      independent: bilingual(
        "Viết hai phiên bản đệ quy và lặp theo cùng hợp đồng dữ liệu, chạy cả ba fixture và chứng minh kết quả tương đương trên input hợp lệ. Nộp code, call/unwind trace, output thực tế và assertions về terminal case, progress và invalid input.",
        "Write recursive and iterative versions for the same data contract, run all three fixtures, and prove equal results on valid input. Submit code, a call/unwind trace, actual outputs, and assertions for the terminal case, progress, and invalid input."
      ),
    },
    patterns: { guided: ["ALGORITHM_REWRITE"], faded: ["ALGORITHM_REWRITE"], independent: ["ALGORITHM_REWRITE"] },
  },
  hashing: {
    prompts: {
      guided: bilingual(
        "Với fixture normal, tính địa chỉ ban đầu của 10, 17 và 24, rồi trace từng probe khi insert và search 17. Ghi trạng thái bảng sau mỗi insert và giải thích vì sao các khóa va chạm.",
        "For the normal fixture, calculate the initial addresses of 10, 17, and 24, then trace every probe while inserting and searching for 17. Record the table after each insert and explain why the keys collide."
      ),
      faded: bilingual(
        "Hoàn thiện linear probing có wrap-around và giới hạn tối đa `size` probe. Với fixture boundary, chỉ ra insert nào trả -1 và vì sao search 9 kết thúc; nộp Python, bảng probe và kiểm tra không lặp vô hạn.",
        "Complete linear probing with wrap-around and a maximum of `size` probes. For the boundary fixture, identify which insert returns -1 and why searching for 9 terminates; submit Python, a probe table, and a no-infinite-loop check."
      ),
      independent: bilingual(
        "Cài đặt hash table gồm setup, hash function, collision insert và search; chạy normal/boundary/failure. Nộp code, output thực tế, probe traces, assertions về wrap/full/not-found và bằng chứng invalid key bị từ chối trước mutation.",
        "Implement a hash table with setup, hash function, collision-resolving insert, and search; run normal/boundary/failure. Submit code, actual outputs, probe traces, assertions for wrap/full/not-found, and evidence that an invalid key is rejected before mutation."
      ),
    },
    patterns: {
      guided: ["HASH_SETUP", "HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH"],
      faded: ["HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH"],
      independent: ["HASH_SETUP", "HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH"],
    },
  },
  "object-files": {
    prompts: {
      guided: bilingual(
        "Với fixture normal, trace chuỗi `open/read record → validate fields → construct object → lookup`. Ghi object tạo từ từng record, kết quả lookup và điểm mà dữ liệu file trở thành thuộc tính object.",
        "For the normal fixture, trace `open/read record → validate fields → construct object → lookup`. Record the object created from each row, the lookup result, and where file data becomes object attributes."
      ),
      faded: bilingual(
        "Hoàn thiện nhánh route record sang đúng class/subclass và cập nhật object đích theo hợp đồng artifact hiện tại. Dùng boundary để chứng minh lookup thiếu không làm đổi danh sách và failure để chỉ ra record bị từ chối trước construction; nộp Python và hai trace.",
        "Complete the branch that routes a record to the correct class/subclass and updates the target object under the current artifact contract. Use boundary to prove a missing lookup does not mutate the list and failure to identify rejection before construction; submit Python and two traces."
      ),
      independent: bilingual(
        "Xây pipeline đọc file thành object, chọn class/subclass, lookup và update có kiểm tra; chạy normal/boundary/failure. Nộp code, file fixtures, output thực tế, trace read/construct/lookup/update và assertions cho record lỗi, lookup thiếu và commit hợp lệ.",
        "Build a checked pipeline that reads a file into objects, selects a class/subclass, and performs lookup and update; run normal/boundary/failure. Submit code, file fixtures, actual outputs, read/construct/lookup/update traces, and assertions for malformed rows, missing lookup, and valid commit."
      ),
    },
    patterns: { guided: ["FILE_READ_OBJECTS"], faded: ["FILE_READ_OBJECTS"], independent: ["FILE_READ_OBJECTS"] },
  },
};

const levels = ["guided", "faded", "independent"];
const caseByLevel = { guided: "normal", faded: "boundary", independent: "failure" };

const expectedArtifact = {
  guided: bilingual(
    "Trace song ngữ có chú thích, dự đoán, chuyển trạng thái thực tế và một kiểm tra bất biến.",
    "Bilingual annotated trace with predictions, actual state transitions, and one invariant check."
  ),
  faded: bilingual(
    "Bản sửa Python chạy được, output fixture thực tế, trace trước/sau và ghi chú sửa lỗi.",
    "Runnable Python repair, actual fixture output, before/after trace, and error-repair note."
  ),
  independent: bilingual(
    "Lời giải Python chạy được, output normal-boundary-failure, assertions và bản tự kiểm.",
    "Runnable Python solution, normal-boundary-failure outputs, assertions, and self-audit."
  ),
};

const hints = {
  "data-models": bilingual("Giữ thứ tự validate → capacity guard → mutation → derived calculation.", "Keep validate → capacity guard → mutation → derived calculation in that order."),
  "binary-search": bilingual("Viết invariant cho đoạn đóng `[low, high]` trước khi cập nhật biên.", "State the invariant for the closed interval `[low, high]` before updating a bound."),
  queue: bilingual("Kiểm tra guard trước mutation; mọi chỉ số vòng dùng modulo capacity.", "Check the guard before mutation; every circular index uses modulo capacity."),
  recursion: bilingual("Mỗi lời gọi phải tiến gần base case; kết quả được ghép khi unwind.", "Every call must move toward the base case; results combine while unwinding."),
  hashing: bilingual("Bắt đầu tại `key % size`, probe tối đa `size` ô và wrap bằng modulo.", "Start at `key % size`, probe at most `size` cells, and wrap with modulo."),
  "object-files": bilingual("Validate đủ field trước construction; chỉ update sau lookup và type route hợp lệ.", "Validate all fields before construction; update only after a valid lookup and type route."),
};

const feedback = {
  "data-models": bilingual("Nếu output sai, tìm event đầu tiên khác expected: record guard, capacity guard, append index hoặc random summary; sửa đúng event đó rồi chạy lại cả ba ca.", "If output differs, find the first event that differs from expected: record guard, capacity guard, append index, or random summary; repair that event and rerun all three cases."),
  "binary-search": bilingual("Nếu không kết thúc hoặc sai index, đối chiếu precondition sorted, điều kiện `low <= high`, phép tính midpoint và bước loại bỏ midpoint.", "If the search does not terminate or returns the wrong index, check the sorted precondition, `low <= high`, midpoint calculation, and the step that excludes the midpoint."),
  queue: bilingual("Nếu FIFO/state sai, khoanh event đầu tiên làm sai front, rear hoặc count; guard phải xảy ra trước write/read và rejected operation không đổi state.", "If FIFO/state is wrong, locate the first event that corrupts front, rear, or count; guards must precede writes/reads and rejected operations must not mutate state."),
  recursion: bilingual("Nếu hai phiên bản lệch nhau, so terminal value, bước tiến index và thứ tự cộng khi unwind trước khi sửa code.", "If the two versions disagree, compare the terminal value, index progress, and unwind addition order before changing code."),
  hashing: bilingual("Nếu sai vị trí hoặc lặp, kiểm tra start address, modulo wrap, điều kiện dừng khi gặp `None` và giới hạn số probe.", "If a position is wrong or probing loops, check the start address, modulo wrap, stop-on-`None`, and the probe limit."),
  "object-files": bilingual("Nếu object/output sai, tìm record đầu tiên sai ở parse, validation, class route, construction, lookup hoặc update; không commit object dở dang.", "If an object/output is wrong, locate the first bad record at parse, validation, class route, construction, lookup, or update; never commit a partial object."),
};

function atomCriterion(atom) {
  const caveatBits = [
    `disposition=${atom.disposition}`,
    `award_semantics=${atom.award_semantics}`,
    atom.group_id ? `group=${atom.group_id}` : null,
    atom.group_max !== null ? `group_max=${atom.group_max}` : null,
    atom.dependency ? `dependency=${JSON.stringify(atom.dependency)}` : null,
    atom.alternatives?.length ? `alternatives=${JSON.stringify(atom.alternatives)}` : null,
    atom.source_issue_refs?.length ? `source_issues=${atom.source_issue_refs.join(",")}` : null,
  ].filter(Boolean).join("; ");
  const limitEn = "Context-bound editorial paraphrase; consult the cited QP/MS and preserve its grouping/dependency rules. No mark allocation is inferred here.";
  const limitVi = "Diễn giải biên tập chỉ dùng trong ngữ cảnh đã dẫn; phải xem QP/MS và giữ quy tắc group/dependency. Không suy ra số điểm tại đây.";
  return bilingual(`${atom.criterion_paraphrase} [${caveatBits}. ${limitVi}]`, `${atom.criterion_paraphrase} [${caveatBits}. ${limitEn}]`);
}

function atomLocator(atom) {
  const qp = atom.qp_locators[0];
  const ms = atom.ms_locator;
  return {
    source_id: ms.source_id,
    pdf_page: ms.pdf_pages[0],
    heading: `${atom.paper_id} ${atom.part_id}`,
    bullet_locator: atom.marking_point_id,
    anchor_text: `QP ${qp.source_id} pdf ${qp.pdf_pages.join(",")} requirement ${qp.requirement_id}; MS ${ms.source_id} pdf ${ms.pdf_pages.join(",")}`,
  };
}

function assessmentRubric(slug, level, patterns, refs) {
  const criteria = [
    {
      criterion_id: `${slug}.${level}.rubric.requirement`,
      description: bilingual(`Prompt được trả lời đủ cho ${patterns.join(", ")} và có bằng chứng riêng cho từng pattern.`, `The prompt is fully answered for ${patterns.join(", ")} with distinct evidence for every pattern.`),
      evidence_required: "Submitted code/trace explicitly labels every listed pattern and linked requirement.",
    },
    {
      criterion_id: `${slug}.${level}.rubric.execution`,
      description: bilingual("Output nộp khớp fixture và expected output canonical được tham chiếu.", "Submitted output matches the referenced canonical fixture and expected output."),
      evidence_required: `Actual run evidence resolving ${refs.join(", ")}.`,
    },
    {
      criterion_id: `${slug}.${level}.rubric.trace`,
      description: bilingual("Trace xác định đúng state đầu, event có ý nghĩa, state cuối và invariant/error check.", "The trace identifies the initial state, meaningful events, final state, and invariant/error check."),
      evidence_required: "Before/event/after trace plus the first-error diagnosis when applicable.",
    },
  ];
  if (level === "independent") criteria.push({
    criterion_id: `${slug}.${level}.rubric.transfer`,
    description: bilingual("Lời giải chạy đủ normal, boundary và failure mà không dùng đáp án được mở sẵn.", "The solution runs normal, boundary, and failure cases without a pre-revealed answer."),
    evidence_required: "Three actual outputs and assertions covering acceptance, boundary behaviour, and rejection.",
  });
  return {
    authority: "AlgoCore_authored_rubric",
    official_marks: null,
    criteria,
    pass_rule: bilingual(
      `Đạt khi có bằng chứng cho toàn bộ ${criteria.length}/${criteria.length} tiêu chí; output canonical phải khớp và không được bỏ qua tiêu chí requirement hoặc execution.`,
      `Pass only with evidence for all ${criteria.length}/${criteria.length} criteria; canonical output must match and neither the requirement nor execution criterion may be skipped.`
    ),
    retry_rule: bilingual("Sửa event sai đầu tiên, chạy lại fixture liên quan rồi kiểm tra hồi quy các fixture trước.", "Repair the first wrong event, rerun the affected fixture, then regression-check earlier fixtures."),
  };
}

const markingPath = join(mappingRoot, "marking-disposition.json");
const assessmentPath = join(mappingRoot, "assessment-item-map.json");
const [markingText, assessmentText] = await Promise.all([readFile(markingPath, "utf8"), readFile(assessmentPath, "utf8")]);
const markingMap = JSON.parse(markingText);
const assessmentMap = JSON.parse(assessmentText);
const pilotSlugs = Object.keys(lessonSpecs);
const pilotLessonIds = new Set(pilotSlugs.map(lessonId));
const pilotChains = markingMap.marking_chains.filter((chain) => pilotLessonIds.has(chain.lesson_id));
const atomsByPattern = new Map();
for (const atom of markingMap.marking_atom_dispositions) {
  if (!atomsByPattern.has(atom.pattern_id)) atomsByPattern.set(atom.pattern_id, []);
  atomsByPattern.get(atom.pattern_id).push(atom);
}

const markingEnvelopes = pilotChains.map((chain) => {
  const atoms = atomsByPattern.get(chain.pattern_id) ?? [];
  const caveatAtoms = atoms.filter((atom) => atom.disposition === "RETAIN_WITH_SOURCE_CAVEAT");
  return {
    schema_version: "2.0.0",
    artifact_type: "MarkingChain",
    record: {
      marking_chain_id: chain.marking_chain_id,
      pattern_id: chain.pattern_id,
      lesson_id: chain.lesson_id,
      requirement_ref: chain.requirement_ref,
      method_step_refs: chain.method_step_refs,
      error_ref: chain.error_refs[0],
      detection_check: chain.detection_check,
      repair_check: bilingual(
        `${chain.repair_check.vi} Error refs được giữ trong nguồn: ${chain.error_refs.join(", ")}.`,
        `${chain.repair_check.en} Source-preserved error refs: ${chain.error_refs.join(", ")}.`
      ),
      marking_atoms: atoms.map((atom) => ({
        atom_id: stableAtomId(atom.marking_point_id),
        authority: "Cambridge_QP_MS",
        criterion: atomCriterion(atom),
        locator: atomLocator(atom),
      })),
      limited_evidence: chain.limited_evidence,
      transfer_limit: bilingual(
        `${chain.transfer_limit.vi} ${caveatAtoms.length} atom có caveat được gắn ngay trong criterion; không cộng các atom thành tổng điểm mới.`,
        `${chain.transfer_limit.en} ${caveatAtoms.length} caveated atoms are labelled inside their criteria; atoms must not be summed into a new mark total.`
      ),
      reviewer: "A7_P4R2_PILOT_PEDAGOGY_REVIEW",
      status: "reviewed",
    },
  };
});

const chainByPattern = new Map(markingEnvelopes.map((envelope) => [envelope.record.pattern_id, envelope.record]));
const sourceItems = assessmentMap.assessment_items.filter((item) => pilotLessonIds.has(item.lesson_id));
const sourceItemByLessonLevel = new Map(sourceItems.map((item) => [`${item.lesson_id}:${item.level}`, item]));

const assessmentEnvelopes = [];
for (const slug of pilotSlugs) {
  const artifact = await readJson(join(contentRoot, "python", "pilot", slug, "artifact.json"));
  const spec = lessonSpecs[slug];
  for (const level of levels) {
    const source = sourceItemByLessonLevel.get(`${lessonId(slug)}:${level}`);
    if (!source) throw new Error(`Missing canonical assessment source for ${slug}:${level}`);
    const patterns = spec.patterns[level];
    const requirements = [...new Set(patterns.map((pattern) => chainByPattern.get(pattern)?.requirement_ref))];
    if (requirements.includes(undefined)) throw new Error(`Missing marking-chain requirement for ${slug}:${level}`);
    const cases = level === "independent" ? ["normal", "boundary", "failure"] : [caseByLevel[level]];
    const refs = [artifact.python_artifact_id];
    for (const caseKind of cases) {
      const fixture = artifact.fixtures.find((item) => item.case_kind === caseKind);
      const expected = artifact.expected_outputs.find((item) => item.fixture_ref === fixture?.fixture_id);
      if (!fixture || !expected) throw new Error(`Missing ${caseKind} fixture/output for ${slug}`);
      refs.push(fixture.fixture_id, expected.expected_output_id);
    }
    assessmentEnvelopes.push({
      schema_version: "2.0.0",
      artifact_type: "AssessmentItem",
      record: {
        assessment_item_id: source.assessment_item_id,
        lesson_id: lessonId(slug),
        pattern_ids: patterns,
        assessment_requirement_ids: requirements,
        destination_id: `ac-9618-p4-2026-python.lesson.${slug}.assessment.progression`,
        level,
        prompt: spec.prompts[level],
        shared_fixture_code_data_ids: refs,
        expected_artifact: expectedArtifact[level],
        hint: hints[slug],
        feedback: feedback[slug],
        self_rubric: assessmentRubric(slug, level, patterns, refs),
        disclosure_contract: {
          answer_hidden_initially: true,
          hint_hidden_initially: true,
          feedback_after_attempt: true,
        },
      },
    });
  }
}

const manifest = {
  schema_version: "paper4-p4r2-assessment-pilot-v1",
  target_release: "paper4-2026-s9-v2",
  generated_by: "scripts/build-p4r2-assessment-pilot.mjs",
  authority_boundary: {
    cambridge_atoms: "Context-bound QP/MS atoms retain direct locators and caveats. Their editorial paraphrases do not create a new mark scheme.",
    practice_rubrics: "All practice rubrics are AlgoCore-authored self-checks with official_marks=null.",
  },
  inputs: [
    { path: "content/paper4/mappings/marking-disposition.json", sha256: sha256(markingText) },
    { path: "content/paper4/mappings/assessment-item-map.json", sha256: sha256(assessmentText) },
  ],
  counts: {
    lessons: pilotSlugs.length,
    marking_chains: markingEnvelopes.length,
    marking_atoms: markingEnvelopes.reduce((sum, item) => sum + item.record.marking_atoms.length, 0),
    assessment_items: assessmentEnvelopes.length,
    legacy_a0_ids_preserved: assessmentEnvelopes.filter((item) => ["queue", "recursion", "hashing"].some((slug) => item.record.assessment_item_id.startsWith(`${lessonId(slug)}.practice.`))).length,
  },
  files: {
    marking_chains: "content/paper4/assessments/pilot/marking-chains.json",
    assessment_items: "content/paper4/assessments/pilot/assessment-items.json",
  },
  status: "A7_REVIEWED_PENDING_LEAD_A8_GATE",
};

await mkdir(outputRoot, { recursive: true });
await Promise.all([
  writeFile(join(outputRoot, "marking-chains.json"), `${JSON.stringify(markingEnvelopes, null, 2)}\n`),
  writeFile(join(outputRoot, "assessment-items.json"), `${JSON.stringify(assessmentEnvelopes, null, 2)}\n`),
  writeFile(join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`),
]);

console.log(JSON.stringify(manifest.counts, null, 2));

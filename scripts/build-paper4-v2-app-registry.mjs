import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const RECORDS_DIR = path.join(ROOT, "content", "paper4", "records", "full");
const CANONICAL_REGISTRY_AGGREGATE = "12f6fb4216bdcd07620eee8071aa58555e1d100ea451f2518d7f6c38c4057d94";
const EDITORIAL_REGISTRY_PATH = path.resolve(ROOT, "..", "planning", "paper4", "stage-3", "LESSON_PACKAGES.json");
const EDITORIAL_REGISTRY_SHA256 = "01710c1a99028228bf5472ddf9457a4ac9c5df64ebd576785139d23d6fca0ad2";

const GENERATED_OUTPUT_PATHS = [
  path.join(ROOT, "app", "data", "paper4-v2", "lessons"),
  path.join(ROOT, "app", "data", "paper4-v2", "course-manifest.json"),
  path.join(ROOT, "app", "data", "paper4-v2", "lesson-loaders.generated.ts"),
  path.join(ROOT, "public", "paper4-v2", "traces"),
];

const RECORD_FILES = Object.freeze({
  knowledgeUnits: "knowledge-units.json",
  pythonArtifacts: "python-artifacts.json",
  visualScenarioTraces: "visual-scenario-traces.json",
  visualEventBindings: "visual-event-bindings.json",
  markingChains: "marking-chains.json",
  assessmentItems: "assessment-items.json",
  lessonReleaseRecords: "lesson-release-records.json",
});

const EXPECTED_COUNTS = Object.freeze({
  knowledgeUnits: 108,
  pythonArtifacts: 26,
  visualScenarioTraces: 174,
  visualEventBindings: 945,
  markingChains: 58,
  assessmentItems: 79,
  lessonReleaseRecords: 26,
  packages: 13,
  patterns: 58,
  sectionsPerLesson: 10,
});

const SECTION_KIND_BY_ID = Object.freeze({
  "paper4.section.recognition": "recognition",
  "paper4.section.exam-cues": "exam-cues",
  "paper4.section.knowledge": "knowledge",
  "paper4.section.method": "method",
  "paper4.section.worked-example": "worked-example",
  "paper4.section.action-view": "action-view",
  "paper4.section.marking-pitfalls": "marking-pitfalls",
  "paper4.section.practice": "practice",
  "paper4.section.retrieval": "retrieval",
  "paper4.section.next-and-sources": "next-and-sources",
});

const DATA_KEYS_BY_SECTION = Object.freeze({
  recognition: ["identity", "authority"],
  "exam-cues": ["theory.knowledge_units[].exam_signals"],
  knowledge: ["theory.knowledge_units"],
  method: ["theory.knowledge_units[].python_connection", "theory.knowledge_units[].invariant_or_rule"],
  "worked-example": ["theory.knowledge_units[].micro_example"],
  "action-view": ["python", "tests", "visual"],
  "marking-pitfalls": ["marking", "errors"],
  practice: ["practice"],
  retrieval: ["retrieval"],
  "next-and-sources": ["navigation", "sources"],
});

function stableSort(values, key) {
  return [...values].sort((left, right) => String(key(left)).localeCompare(String(key(right)), "en"));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalText(value) {
  return value.replace(/\r\n/g, "\n");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  const set = new Set(values);
  assert(set.size === values.length, `${label} contains duplicate IDs`);
  return set;
}

async function loadEnvelopeRecords(filename, artifactType, expectedSha256) {
  const source = await readFile(path.join(RECORDS_DIR, filename), "utf8");
  assert(sha256(canonicalText(source)) === expectedSha256, `${filename} differs from the canonical SHA256SUMS authority`);
  const records = JSON.parse(source);
  assert(Array.isArray(records), `${filename} must be an array`);
  return records.map((envelope, index) => {
    assert(envelope?.schema_version === "2.0.0", `${filename}[${index}] has unexpected schema_version`);
    assert(envelope?.artifact_type === artifactType, `${filename}[${index}] has unexpected artifact_type`);
    assert(envelope?.record && typeof envelope.record === "object", `${filename}[${index}] has no record`);
    return envelope.record;
  });
}

async function loadCanonicalRecords() {
  const sumsSource = await readFile(path.join(RECORDS_DIR, "SHA256SUMS.txt"), "utf8");
  const sums = new Map(sumsSource.trim().split(/\r?\n/).map((line) => {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    assert(match, `Invalid canonical SHA256SUMS line: ${line}`);
    return [match[2], match[1]];
  }));
  assert(sums.get("REGISTRY-AGGREGATE") === CANONICAL_REGISTRY_AGGREGATE, "Canonical registry aggregate authority mismatch");
  const [knowledgeUnits, pythonArtifacts, visualScenarioTraces, visualEventBindings, markingChains, assessmentItems, lessonReleaseRecords] = await Promise.all([
    loadEnvelopeRecords(RECORD_FILES.knowledgeUnits, "KnowledgeUnit", sums.get(RECORD_FILES.knowledgeUnits)),
    loadEnvelopeRecords(RECORD_FILES.pythonArtifacts, "PythonArtifact", sums.get(RECORD_FILES.pythonArtifacts)),
    loadEnvelopeRecords(RECORD_FILES.visualScenarioTraces, "VisualScenarioTrace", sums.get(RECORD_FILES.visualScenarioTraces)),
    loadEnvelopeRecords(RECORD_FILES.visualEventBindings, "VisualEventBinding", sums.get(RECORD_FILES.visualEventBindings)),
    loadEnvelopeRecords(RECORD_FILES.markingChains, "MarkingChain", sums.get(RECORD_FILES.markingChains)),
    loadEnvelopeRecords(RECORD_FILES.assessmentItems, "AssessmentItem", sums.get(RECORD_FILES.assessmentItems)),
    loadEnvelopeRecords(RECORD_FILES.lessonReleaseRecords, "LessonReleaseRecord", sums.get(RECORD_FILES.lessonReleaseRecords)),
  ]);
  return { knowledgeUnits, pythonArtifacts, visualScenarioTraces, visualEventBindings, markingChains, assessmentItems, lessonReleaseRecords };
}

async function loadEditorialRegistry() {
  const raw = await readFile(EDITORIAL_REGISTRY_PATH, "utf8");
  assert(sha256(raw) === EDITORIAL_REGISTRY_SHA256, "Stage 3 LESSON_PACKAGES.json hash differs from the locked compiler input");
  const registry = JSON.parse(raw);
  assert(registry.schema_version === "1.0.0", "Stage 3 editorial registry schema mismatch");
  assert(registry.course_id === "ac-9618-p4-2026-python", "Stage 3 editorial registry course mismatch");
  assert(Array.isArray(registry.packages) && registry.packages.length === EXPECTED_COUNTS.packages, "Stage 3 editorial package exact set mismatch");
  assert(Array.isArray(registry.lessons) && registry.lessons.length === EXPECTED_COUNTS.lessonReleaseRecords, "Stage 3 editorial lesson exact set mismatch");
  return registry;
}

function citationOnly(sourceRef) {
  return {
    source_id: sourceRef.source_id,
    authority: sourceRef.authority,
    locator: sourceRef.locator,
  };
}

function publicKnowledgeUnit(unit) {
  return {
    knowledge_unit_id: unit.knowledge_unit_id,
    disposition: unit.disposition,
    version: unit.version,
    objective_refs: unit.objective_refs,
    book_refs: unit.book_refs,
    title: unit.title,
    explanation: unit.explanation,
    python_connection: unit.python_connection,
    representation: unit.representation,
    invariant_or_rule: unit.invariant_or_rule,
    misconceptions: unit.misconceptions,
    exam_signals: unit.exam_signals,
    micro_example: unit.micro_example,
    self_check: unit.self_check,
  };
}

function publicPythonArtifact(artifact) {
  return {
    python_artifact_id: artifact.python_artifact_id,
    lesson_id: artifact.lesson_id,
    pattern_ids: artifact.pattern_ids,
    version: artifact.version,
    language: artifact.language,
    lines: [...artifact.lines].sort((left, right) => left.order - right.order),
    entry_point: artifact.entry_point,
    code_sha256: artifact.code_sha256,
    caption: artifact.caption,
    execution: {
      syntax_status: artifact.syntax_status,
      execution_status: artifact.execution_status,
      author_run_ref: artifact.author_run_ref,
      independent_rerun_ref: artifact.independent_rerun_ref,
      execution_log_sha256: artifact.execution_log_sha256,
    },
  };
}

function publicMarkingChain(chain) {
  const caveated = chain.marking_atoms.find((atom) => JSON.stringify(atom.criterion).includes("RETAIN_WITH_SOURCE_CAVEAT"));
  const candidates = [
    chain.marking_atoms[0],
    caveated,
    chain.marking_atoms[Math.floor(chain.marking_atoms.length / 2)],
    chain.marking_atoms.at(-1),
  ].filter(Boolean);
  const representativeAtoms = [...new Map(candidates.map((atom) => [atom.atom_id, atom])).values()].slice(0, 3);
  return {
    marking_chain_id: chain.marking_chain_id,
    pattern_id: chain.pattern_id,
    requirement_ref: chain.requirement_ref,
    method_step_refs: chain.method_step_refs,
    error_ref: chain.error_ref,
    detection_check: chain.detection_check,
    repair_check: chain.repair_check,
    marking_atom_count: chain.marking_atoms.length,
    marking_atom_selection: "representative_public_sample",
    marking_atoms: representativeAtoms,
    limited_evidence: chain.limited_evidence,
    transfer_limit: chain.transfer_limit,
  };
}

function publicAssessmentItem(item) {
  return {
    assessment_item_id: item.assessment_item_id,
    pattern_ids: item.pattern_ids,
    assessment_requirement_ids: item.assessment_requirement_ids,
    destination_id: item.destination_id,
    level: item.level,
    prompt: item.prompt,
    shared_fixture_code_data_ids: item.shared_fixture_code_data_ids,
    expected_artifact: item.expected_artifact,
    hint: item.hint,
    feedback: item.feedback,
    self_rubric: item.self_rubric,
    disclosure_contract: item.disclosure_contract,
  };
}

function publicRetrievalItem(unit) {
  const evidenceRefs = unit.micro_example?.active_line_ids ?? [];
  const misconception = unit.misconceptions?.[0] ?? {
    vi: "Câu trả lời chưa nêu đúng quy tắc hoặc chưa nối quy tắc với trạng thái/chương trình.",
    en: "The response does not yet state the rule or connect it to program state or code.",
  };
  return {
    knowledge_unit_id: unit.knowledge_unit_id,
    ...unit.self_check,
    response_contract: {
      mode: evidenceRefs.length > 0 ? "recall_then_trace" : "recall_then_explain",
      prompt: {
        vi: evidenceRefs.length > 0
          ? `Trả lời từ trí nhớ, nêu quy tắc và đối chiếu ít nhất một dòng: ${evidenceRefs.join(", ")}.`
          : "Trả lời từ trí nhớ và giải thích quy tắc hoặc trạng thái quyết định kết quả.",
        en: evidenceRefs.length > 0
          ? `Answer from memory, state the rule, and trace at least one line: ${evidenceRefs.join(", ")}.`
          : "Answer from memory and explain the rule or state that determines the result.",
      },
      evidence_refs: evidenceRefs,
      submit_before_answer: true,
    },
    diagnosis: {
      prompt: {
        vi: "So sánh câu trả lời đã ghi nhận với đáp án và rationale. Xác định ý còn thiếu hoặc bước trace đầu tiên bị sai.",
        en: "Compare the recorded response with the answer and rationale. Identify the missing idea or the first incorrect trace step.",
      },
      misconception_to_check: misconception,
    },
    repair: {
      action: {
        vi: `Viết lại câu trả lời bằng quy tắc này rồi kiểm tra lại với code/trace: ${unit.invariant_or_rule.vi}`,
        en: `Rewrite the answer using this rule, then check it against the code or trace: ${unit.invariant_or_rule.en}`,
      },
      retry_rule: {
        vi: "Chọn Thử lại, trả lời không nhìn đáp án, rồi chỉ đạt khi đủ ý chính, lý do và bằng chứng dòng/trace hoặc quy tắc.",
        en: "Choose Try again, answer without viewing the model answer, and pass only when the key idea, reason, and line/trace or rule evidence are present.",
      },
    },
    self_rubric: {
      authority: "AlgoCore_authored_self_rubric",
      official_marks: null,
      criteria: [
        {
          criterion_id: `${unit.knowledge_unit_id}.retrieval.key-idea`,
          description: { vi: "Nêu đúng ý cốt lõi của đáp án.", en: "States the answer's key idea accurately." },
        },
        {
          criterion_id: `${unit.knowledge_unit_id}.retrieval.reason`,
          description: { vi: "Giải thích vì sao quy tắc tạo ra kết quả.", en: "Explains why the rule produces the result." },
        },
        {
          criterion_id: `${unit.knowledge_unit_id}.retrieval.evidence`,
          description: evidenceRefs.length > 0
            ? { vi: "Đối chiếu đúng ít nhất một line ID hoặc bước trace.", en: "Checks at least one correct line ID or trace step." }
            : { vi: "Nêu đúng invariant hoặc quy tắc kiểm tra.", en: "States the correct invariant or checking rule." },
        },
      ],
    },
  };
}

function publicEvent(event) {
  return {
    event_id: event.event_id,
    trace_id: event.trace_id,
    sequence: event.sequence,
    event_type: event.event_type,
    active_line_ids: event.active_line_ids,
    before: event.before,
    delta: event.delta,
    after: event.after,
    output_delta: event.output_delta,
    invariant_or_criterion: event.invariant_or_criterion,
    prediction: event.prediction,
    feedback: event.feedback,
    visual_targets: event.visual_targets,
    accessibility: event.accessibility,
  };
}

function patternFileName(patternId) {
  return `${patternId.toLowerCase().replaceAll("_", "-")}.json`;
}

function buildSections(release) {
  assert(release.canonical_section_ids.length === EXPECTED_COUNTS.sectionsPerLesson, `${release.slug} must have ten sections`);
  return release.canonical_section_ids.map((sectionId, index) => {
    const kind = SECTION_KIND_BY_ID[sectionId];
    assert(kind, `${release.slug} has unknown section ${sectionId}`);
    return { section_id: sectionId, kind, order: index + 1, data_keys: DATA_KEYS_BY_SECTION[kind] };
  });
}

function canonicalAggregateSha(records) {
  return sha256(stableJson(Object.fromEntries(Object.entries(records).map(([key, value]) => [key, value]))));
}

export async function createPaper4V2Outputs() {
  const [records, editorialRegistry] = await Promise.all([loadCanonicalRecords(), loadEditorialRegistry()]);
  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (key in records) assert(records[key].length === expected, `${key}: expected ${expected}, received ${records[key].length}`);
  }

  const knowledgeIds = unique(records.knowledgeUnits.map((item) => item.knowledge_unit_id), "KnowledgeUnit");
  const artifactIds = unique(records.pythonArtifacts.map((item) => item.python_artifact_id), "PythonArtifact");
  const traceIds = unique(records.visualScenarioTraces.map((item) => item.trace_id), "VisualScenarioTrace");
  const eventIds = unique(records.visualEventBindings.map((item) => item.event_id), "VisualEventBinding");
  unique(records.markingChains.map((item) => item.marking_chain_id), "MarkingChain");
  unique(records.assessmentItems.map((item) => item.assessment_item_id), "AssessmentItem");
  const lessonIds = unique(records.lessonReleaseRecords.map((item) => item.lesson_id), "LessonReleaseRecord");

  const artifactById = new Map(records.pythonArtifacts.map((item) => [item.python_artifact_id, item]));
  const releaseByLesson = new Map(records.lessonReleaseRecords.map((item) => [item.lesson_id, item]));
  const releaseBySlug = new Map(records.lessonReleaseRecords.map((item) => [item.slug, item]));
  const eventById = new Map(records.visualEventBindings.map((item) => [item.event_id, item]));
  const artifactByLesson = new Map(records.pythonArtifacts.map((item) => [item.lesson_id, item]));
  const editorialLessonById = new Map(editorialRegistry.lessons.map((item) => [item.lesson_id, item]));
  const editorialPackageById = new Map(editorialRegistry.packages.map((item) => [item.package_id, item]));

  assert(releaseBySlug.size === EXPECTED_COUNTS.lessonReleaseRecords, "Lesson slugs are not unique");
  for (const unit of records.knowledgeUnits) assert(lessonIds.has(unit.lesson_id), `${unit.knowledge_unit_id} has unknown lesson`);
  for (const artifact of records.pythonArtifacts) assert(lessonIds.has(artifact.lesson_id), `${artifact.python_artifact_id} has unknown lesson`);
  for (const trace of records.visualScenarioTraces) {
    assert(artifactIds.has(trace.python_artifact_id), `${trace.trace_id} has unknown PythonArtifact`);
    for (const eventId of trace.event_ids) assert(eventIds.has(eventId), `${trace.trace_id} has unknown event ${eventId}`);
  }
  for (const event of records.visualEventBindings) assert(traceIds.has(event.trace_id), `${event.event_id} has unknown trace`);

  const patternIds = stableSort([...new Set(records.visualScenarioTraces.map((trace) => trace.pattern_id))], (value) => value);
  assert(patternIds.length === EXPECTED_COUNTS.patterns, `patterns: expected ${EXPECTED_COUNTS.patterns}, received ${patternIds.length}`);

  const patternMetadata = [];
  const visualTargetsByPattern = new Map();
  const outputs = new Map();

  for (const patternId of patternIds) {
    const traces = stableSort(records.visualScenarioTraces.filter((trace) => trace.pattern_id === patternId), (trace) => `${trace.case_kind}:${trace.scenario_id}`);
    assert(traces.length === 3, `${patternId} must have normal, boundary and failure traces`);
    assert(new Set(traces.map((trace) => trace.case_kind)).size === 3, `${patternId} has duplicate case_kind`);
    const ownerArtifactIds = new Set(traces.map((trace) => trace.python_artifact_id));
    assert(ownerArtifactIds.size === 1, `${patternId} traces span multiple Python artifacts`);
    const ownerArtifact = artifactById.get([...ownerArtifactIds][0]);
    const ownerRelease = releaseByLesson.get(ownerArtifact.lesson_id);
    const chunkEventIds = traces.flatMap((trace) => trace.event_ids);
    assert(new Set(chunkEventIds).size === chunkEventIds.length, `${patternId} reuses event IDs across scenarios`);
    const chunkEvents = chunkEventIds.map((eventId) => publicEvent(eventById.get(eventId)));
    visualTargetsByPattern.set(patternId, new Set(chunkEvents.flatMap((event) => event.visual_targets)));
    const validLineIds = new Set(ownerArtifact.lines.map((line) => line.line_id));
    for (const event of chunkEvents) {
      for (const lineId of event.active_line_ids) assert(validLineIds.has(lineId), `${event.event_id} has invalid active line ${lineId}`);
    }
    const filename = patternFileName(patternId);
    const traceUrl = `/paper4-v2/traces/${filename}?v=${ownerArtifact.code_sha256.slice(0, 16)}`;
    const chunk = {
      schema_version: "paper4-v2-trace-chunk-v1",
      pattern_id: patternId,
      owner: {
        lesson_id: ownerArtifact.lesson_id,
        lesson_slug: ownerRelease.slug,
        python_artifact_id: ownerArtifact.python_artifact_id,
        artifact_version: ownerArtifact.version,
        code_sha256: ownerArtifact.code_sha256,
      },
      python_artifact: publicPythonArtifact(ownerArtifact),
      scenarios: traces.map((trace) => ({
        scenario_id: trace.scenario_id,
        case_kind: trace.case_kind,
        trace_id: trace.trace_id,
        python_artifact_id: trace.python_artifact_id,
        artifact_version: trace.artifact_version,
        initial_state: trace.initial_state,
        event_ids: trace.event_ids,
        expected_output_ref: trace.expected_output_ref,
        fixture_ref: trace.fixture_ref,
      })),
      events: chunkEvents,
    };
    outputs.set(`public/paper4-v2/traces/${filename}`, stableJson(chunk));
    patternMetadata.push({
      pattern_id: patternId,
      owner_lesson_id: ownerArtifact.lesson_id,
      owner_lesson_slug: ownerRelease.slug,
      python_artifact_id: ownerArtifact.python_artifact_id,
      trace_url: traceUrl,
      scenario_count: traces.length,
      event_count: chunkEvents.length,
    });
  }

  const releases = editorialRegistry.lessons.map((editorialLesson) => {
    const release = releaseByLesson.get(editorialLesson.lesson_id);
    assert(release, `Stage 3 lesson ${editorialLesson.lesson_id} is absent from canonical release records`);
    return release;
  });
  const lessonMetadata = [];
  for (let index = 0; index < releases.length; index += 1) {
    const release = releases[index];
    const editorialLesson = editorialLessonById.get(release.lesson_id);
    assert(editorialLesson, `${release.slug} is absent from Stage 3 LESSON_PACKAGES.json`);
    assert(editorialLesson.slug === release.slug && editorialLesson.package_id === release.package_id, `${release.slug} Stage 3 identity mismatch`);
    assert(editorialLesson.titles?.vi && editorialLesson.titles?.en, `${release.slug} lacks bilingual Stage 3 titles`);
    const artifact = artifactByLesson.get(release.lesson_id);
    assert(artifact, `${release.slug} has no Python artifact`);
    assert(release.python_artifact_ids.length === 1 && release.python_artifact_ids[0] === artifact.python_artifact_id, `${release.slug} PythonArtifact join is not exact`);
    const units = stableSort(records.knowledgeUnits.filter((unit) => unit.lesson_id === release.lesson_id), (unit) => unit.knowledge_unit_id);
    assert(units.length === release.knowledge_unit_ids.length, `${release.slug} KnowledgeUnit count does not match release`);
    for (const unitId of release.knowledge_unit_ids) assert(knowledgeIds.has(unitId) && units.some((unit) => unit.knowledge_unit_id === unitId), `${release.slug} has unresolved KnowledgeUnit ${unitId}`);
    const chains = stableSort(records.markingChains.filter((chain) => chain.lesson_id === release.lesson_id), (chain) => chain.pattern_id);
    const assessments = stableSort(records.assessmentItems.filter((item) => item.lesson_id === release.lesson_id), (item) => `${item.level}:${item.assessment_item_id}`);
    const expectedAssessmentCount = release.slug === "exam-workflow" ? 4 : 3;
    assert(assessments.length === expectedAssessmentCount, `${release.slug} must have ${expectedAssessmentCount} assessment items`);
    if (release.slug === "exam-workflow") {
      assert(assessments.some((item) => item.assessment_item_id === "ac-9618-p4-2026-python.lesson.exam-workflow.practice.p4r9-dsa-capstone"), "exam-workflow lacks the protected P4R-9 DSA capstone");
    }
    const ownedPatternIds = stableSort(patternMetadata.filter((pattern) => pattern.owner_lesson_id === release.lesson_id).map((pattern) => pattern.pattern_id), (value) => value);
    const approvedAssociationPatternIds = stableSort(release.pattern_ids.filter((patternId) => !ownedPatternIds.includes(patternId)), (value) => value);
    const traceBackedAssociationPatternIds = release.slug === "performance"
      ? approvedAssociationPatternIds.filter((patternId) => visualTargetsByPattern.get(patternId)?.has("visual.dsa.growth-counter"))
      : [];
    const isAssociationOnly = ownedPatternIds.length === 0;
    if (isAssociationOnly) {
      assert(chains.length === 0, `${release.slug} association-only lesson must not inherit Cambridge marking chains`);
      for (const assessment of assessments) {
        assert(assessment.self_rubric?.authority === "AlgoCore_authored_rubric", `${release.slug} association-only assessment has non-AlgoCore authority`);
        assert(assessment.self_rubric?.official_marks === null, `${release.slug} association-only assessment has official marks`);
        assert(assessment.self_rubric?.pattern_authority === "AlgoCore_representational_workflow_only", `${release.slug} association-only assessment lacks transfer limit`);
      }
    }

    const sections = buildSections(release);
    const dto = {
      schema_version: "paper4-v2-lesson-dto-v1",
      identity: {
        lesson_id: release.lesson_id,
        package_id: release.package_id,
        slug: release.slug,
        version: release.version,
        label: release.slug,
        title: editorialLesson.titles,
        scope: editorialLesson.scope,
      },
      authority: {
        official_pattern_ids: ownedPatternIds,
        approved_association_pattern_ids: approvedAssociationPatternIds,
        association_scope: isAssociationOnly ? "AlgoCore_representational_workflow_only" : "official_pattern_owner",
        cambridge_marking_chain_ids: chains.map((chain) => chain.marking_chain_id),
      },
      sections,
      theory: { knowledge_units: units.map(publicKnowledgeUnit) },
      python: publicPythonArtifact(artifact),
      tests: {
        fixtures: artifact.fixtures,
        expected_outputs: artifact.expected_outputs,
        normal_boundary_failure_coverage: artifact.normal_boundary_failure_coverage,
        author_run_ref: artifact.author_run_ref,
        independent_rerun_ref: artifact.independent_rerun_ref,
        execution_log_sha256: artifact.execution_log_sha256,
      },
      visual: {
        owned_patterns: ownedPatternIds.map((patternId) => patternMetadata.find((pattern) => pattern.pattern_id === patternId)),
        trace_backed_association_patterns: traceBackedAssociationPatternIds.map((patternId) => {
          const metadata = patternMetadata.find((pattern) => pattern.pattern_id === patternId);
          assert(metadata, `${release.slug} has no canonical trace metadata for associated pattern ${patternId}`);
          return {
            ...metadata,
            required_visual_target: "visual.dsa.growth-counter",
            association_authority: "AlgoCore_representational_workflow_only",
            official_marks: null,
            reuse_notice: {
              vi: "Lab này dùng lại trace Python canonical đã thực thi từ bài sở hữu dạng bài; liên kết này không chuyển quyền sở hữu dạng bài hoặc điểm Cambridge.",
              en: "This lab reuses an executed canonical Python trace from the pattern-owner lesson; the association does not transfer pattern ownership or Cambridge marks.",
            },
            source_owner: {
              lesson_id: metadata.owner_lesson_id,
              lesson_slug: metadata.owner_lesson_slug,
              python_artifact_id: metadata.python_artifact_id,
            },
          };
        }),
        approved_static_or_representational_support: approvedAssociationPatternIds.map((patternId) => ({
          pattern_id: patternId,
          authority: "AlgoCore_representational_workflow_only",
          official_marks: null,
        })),
      },
      marking: { chains: chains.map(publicMarkingChain) },
      errors: {
        error_refs: release.error_refs,
        misconceptions: units.flatMap((unit) => unit.misconceptions.map((item) => ({ knowledge_unit_id: unit.knowledge_unit_id, ...item }))),
        checks: chains.map((chain) => ({
          marking_chain_id: chain.marking_chain_id,
          detection_check: chain.detection_check,
          repair_check: chain.repair_check,
        })),
      },
      practice: { items: assessments.map(publicAssessmentItem) },
      retrieval: {
        release_refs: release.retrieval_refs,
        items: units.map(publicRetrievalItem),
      },
      navigation: {
        previous_slug: index === 0 ? null : releases[index - 1].slug,
        next_slug: index === releases.length - 1 ? null : releases[index + 1].slug,
      },
      sources: release.source_refs.map(citationOnly),
    };
    outputs.set(`app/data/paper4-v2/lessons/${release.slug}.json`, stableJson(dto));
    lessonMetadata.push({
      lesson_id: release.lesson_id,
      package_id: release.package_id,
      slug: release.slug,
      label: release.slug,
      title: editorialLesson.titles,
      dto_module: `./lessons/${release.slug}.json`,
      official_pattern_ids: ownedPatternIds,
      approved_association_pattern_ids: approvedAssociationPatternIds,
    });
  }

  const packageIds = editorialRegistry.packages.map((item) => item.package_id);
  unique(packageIds, "Stage 3 package registry");
  assert(packageIds.length === EXPECTED_COUNTS.packages, `packages: expected ${EXPECTED_COUNTS.packages}, received ${packageIds.length}`);
  const releasePackageIds = new Set(releases.map((release) => release.package_id));
  assert(packageIds.every((packageId) => releasePackageIds.has(packageId)), "Stage 3 package registry differs from canonical releases");
  const packages = packageIds.map((packageId) => {
    const editorialPackage = editorialPackageById.get(packageId);
    assert(editorialPackage?.titles?.vi && editorialPackage?.titles?.en, `${packageId} lacks bilingual Stage 3 titles`);
    const lessonSlugs = editorialPackage.lesson_ids.map((lessonId) => lessonMetadata.find((lesson) => lesson.lesson_id === lessonId)?.slug);
    assert(lessonSlugs.every(Boolean), `${packageId} has an unresolved Stage 3 lesson slug`);
    const compiledLessonIds = new Set(lessonMetadata.filter((lesson) => lesson.package_id === packageId).map((lesson) => lesson.lesson_id));
    assert(editorialPackage.lesson_ids.length === compiledLessonIds.size && editorialPackage.lesson_ids.every((lessonId) => compiledLessonIds.has(lessonId)), `${packageId} Stage 3 lesson exact set mismatch`);
    return {
      package_id: packageId,
      label: packageId.split(".package.").at(-1),
      title: editorialPackage.titles,
      lesson_slugs: lessonSlugs,
    };
  });

  const semanticInputSha = canonicalAggregateSha(records);
  const manifest = {
    schema_version: "paper4-v2-course-manifest-v1",
    canonical_registry_sha256: CANONICAL_REGISTRY_AGGREGATE,
    compiler_input_semantic_sha256: semanticInputSha,
    editorial_registry: {
      source_id: "stage-3.LESSON_PACKAGES",
      sha256: EDITORIAL_REGISTRY_SHA256,
      course_title: editorialRegistry.titles,
    },
    counts: {
      packages: packages.length,
      lessons: lessonMetadata.length,
      patterns: patternMetadata.length,
      sections_per_lesson: EXPECTED_COUNTS.sectionsPerLesson,
      knowledge_units: records.knowledgeUnits.length,
      python_artifacts: records.pythonArtifacts.length,
      visual_scenario_traces: records.visualScenarioTraces.length,
      visual_event_bindings: records.visualEventBindings.length,
      marking_chains: records.markingChains.length,
      assessment_items: records.assessmentItems.length,
      lesson_release_records: records.lessonReleaseRecords.length,
    },
    canonical_sections: Object.entries(SECTION_KIND_BY_ID).map(([section_id, kind], index) => ({ section_id, kind, order: index + 1 })),
    packages,
    lessons: lessonMetadata,
    patterns: patternMetadata,
  };
  outputs.set("app/data/paper4-v2/course-manifest.json", stableJson(manifest));

  const loaderLines = [
    "/* This file is generated by scripts/build-paper4-v2-app-registry.mjs. */",
    "/* Do not edit it directly. */",
    "",
    "export const paper4V2LessonLoaders = {",
    ...lessonMetadata.map((lesson) => `  ${JSON.stringify(lesson.slug)}: () => import(${JSON.stringify(lesson.dto_module)}).then((module) => module.default),`),
    "} as const;",
    "",
    "export type Paper4V2LessonSlug = keyof typeof paper4V2LessonLoaders;",
    "",
  ];
  outputs.set("app/data/paper4-v2/lesson-loaders.generated.ts", `${loaderLines.join("\n")}\n`);

  return {
    outputs,
    stats: {
      counts: manifest.counts,
      canonical_registry_sha256: CANONICAL_REGISTRY_AGGREGATE,
      compiler_input_semantic_sha256: semanticInputSha,
      output_sha256: sha256(stableJson([...outputs.entries()].map(([filename, contents]) => ({ filename, sha256: sha256(contents) })))),
    },
  };
}

export async function writePaper4V2Outputs() {
  const { outputs, stats } = await createPaper4V2Outputs();
  for (const outputPath of GENERATED_OUTPUT_PATHS) await rm(outputPath, { recursive: true, force: true });
  for (const [relativePath, contents] of outputs) {
    const absolutePath = path.join(ROOT, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, contents, "utf8");
  }
  return stats;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const stats = await writePaper4V2Outputs();
  console.log(JSON.stringify({ status: "PASS", ...stats }, null, 2));
}

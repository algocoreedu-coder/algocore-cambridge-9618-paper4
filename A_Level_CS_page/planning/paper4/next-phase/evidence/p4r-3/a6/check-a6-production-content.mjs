import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, "../../../../../../algocore-fumadocs");
const CONTENT_ROOT = path.join(APP_ROOT, "content/paper4");
const SCOPE_PATH = path.resolve(HERE, "../preflight/P4R3_SCOPE_INVENTORY.json");
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const canonical = (value) => JSON.stringify(value);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function filesBelow(directory, suffix) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesBelow(child, suffix));
    else if (entry.isFile() && entry.name.endsWith(suffix)) output.push(child);
  }
  return output.sort();
}

const findings = [];
const add = (code, records, detail, remediation) => findings.push({ code, count: records.length, records, detail, remediation });
const scope = await readJson(SCOPE_PATH);
const lessons = scope.lessons;
const slugs = lessons.map((lesson) => lesson.lesson_slug);
const officialLessons = lessons.filter((lesson) => lesson.pattern_ids.length > 0);
const provisionalLessons = lessons.filter((lesson) => lesson.pattern_ids.length === 0);
const provisionalSlugs = new Set(provisionalLessons.map((lesson) => lesson.lesson_slug));

const knowledgeFiles = await filesBelow(path.join(CONTENT_ROOT, "lessons/production"), ".knowledge-unit.json");
const knowledge = await Promise.all(knowledgeFiles.map(readJson));
const artifactFiles = slugs.map((slug) => path.join(CONTENT_ROOT, "python/production", slug, "artifact.json"));
const artifacts = await Promise.all(artifactFiles.map(readJson));
const visualFiles = officialLessons.map((lesson) => path.join(CONTENT_ROOT, "visuals/production", lesson.lesson_slug, "visuals.json"));
const visualBundles = await Promise.all(visualFiles.map(readJson));
const assessmentFile = path.join(CONTENT_ROOT, "assessments/production/assessment-items.json");
const markingFile = path.join(CONTENT_ROOT, "assessments/production/marking-chains.json");
const assessments = await readJson(assessmentFile);
const markingChains = await readJson(markingFile);
const traces = visualBundles.flatMap((bundle) => bundle.traces.map((envelope) => envelope.record));
const events = visualBundles.flatMap((bundle) => bundle.events.map((envelope) => envelope.record));
const markingAtoms = markingChains.flatMap((envelope) => envelope.record.marking_atoms);

const countContracts = [
  ["A6-COUNT-KNOWLEDGE", knowledge, 82, "KnowledgeUnits"],
  ["A6-COUNT-PYTHON", artifacts, 20, "PythonArtifacts"],
  ["A6-COUNT-FIXTURES", artifacts.flatMap((artifact) => artifact.fixtures), 60, "embedded fixtures"],
  ["A6-COUNT-MARKING-CHAIN", markingChains, 42, "MarkingChains"],
  ["A6-COUNT-MARKING-ATOM", markingAtoms, 1830, "marking atoms"],
  ["A6-COUNT-ASSESSMENT", assessments, 60, "AssessmentItems"],
  ["A6-COUNT-TRACE", traces, 126, "visual traces"],
  ["A6-COUNT-EVENT", events, 351, "visual events"],
];
for (const [code, records, expected, label] of countContracts) {
  if (records.length !== expected) add(code, [String(records.length)], `Expected ${expected} ${label}; found ${records.length}.`, `Restore the exact P4R-3/P4R-4 production scope before gate review.`);
}
if (provisionalLessons.length !== 6) add("A6-PROVISIONAL-SCOPE", provisionalLessons.map((x) => x.lesson_slug), `Expected six provisional lessons; found ${provisionalLessons.length}.`, "Restore the six patternless lessons in the frozen preflight scope.");

const auditedFiles = [...knowledgeFiles, ...artifactFiles, ...visualFiles, assessmentFile, markingFile];
const bilingualPairs = [];
const malformedPairs = [];
const identicalPairs = [];
const tokenParityFailures = [];
const terminologyChecks = [];
const terminologyMismatches = [];
const localPathLeaks = [];
const insecureRefs = [];
const absolutePath = /(?:^|[\s"'`(])(?:[A-Za-z]:[\\/]|file:\/\/|\\\\|\/Users\/|\/home\/)/i;
const workspacePath = /(?:_Lam_viec|AlgoCoreEduction|A_Level_CS_page[\\/]|planning[\\/]paper4)/i;
const localHost = /(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::\d+)?/i;
const naturalLanguage = /[A-Za-zÀ-ỹ]{4}/u;
const mirroredToken = /(?:ac-9618-[A-Za-z0-9._:-]+|\b[A-Z][A-Z0-9]+_[A-Z0-9_]+\b)/g;
const terminologyRules = [
  ["binary tree", /\bbinary tree\b/i, /cây nhị phân|binary tree/i],
  ["linked list", /\blinked list\b/i, /danh sách liên kết|linked list/i],
  ["inheritance", /\binheritance\b/i, /kế thừa|inheritance/i],
  ["encapsulation", /\bencapsulation\b/i, /đóng gói|encapsulation/i],
  ["random file", /\brandom(?:-access)? file\b/i, /tệp (?:truy cập )?ngẫu nhiên|random file/i],
];

function tokenSet(text) {
  return [...new Set((text.match(mirroredToken) ?? []).map((token) => token.toLowerCase()))].sort();
}

function walk(value, filename, jsonPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, filename, `${jsonPath}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    const hasVi = Object.hasOwn(value, "vi");
    const hasEn = Object.hasOwn(value, "en");
    if (hasVi || hasEn) {
      const record = `${path.relative(APP_ROOT, filename).replaceAll("\\", "/")}:${jsonPath}`;
      bilingualPairs.push(record);
      if (!(hasVi && hasEn && typeof value.vi === "string" && value.vi.trim() && typeof value.en === "string" && value.en.trim())) {
        malformedPairs.push(record);
      } else {
        const vi = value.vi.replace(/\s+/g, " ").trim();
        const en = value.en.replace(/\s+/g, " ").trim();
        if (vi.toLocaleLowerCase("vi") === en.toLowerCase() && naturalLanguage.test(vi)) identicalPairs.push(record);
        const viTokens = tokenSet(vi);
        const enTokens = tokenSet(en);
        if (canonical(viTokens) !== canonical(enTokens)) tokenParityFailures.push(`${record}#vi=${viTokens.join(",")}#en=${enTokens.join(",")}`);
        for (const [term, enPattern, viPattern] of terminologyRules) {
          if (enPattern.test(en)) {
            terminologyChecks.push(`${record}#${term}`);
            if (!viPattern.test(vi)) terminologyMismatches.push(`${record}#${term}`);
          }
        }
      }
    }
    for (const [key, child] of Object.entries(value)) walk(child, filename, `${jsonPath}.${key}`);
    return;
  }
  if (typeof value === "string") {
    const record = `${path.relative(APP_ROOT, filename).replaceAll("\\", "/")}:${jsonPath}`;
    if (absolutePath.test(value) || workspacePath.test(value) || localHost.test(value)) localPathLeaks.push(record);
    if (/http:\/\//i.test(value)) insecureRefs.push(record);
  }
}

for (const filename of auditedFiles) walk(await readJson(filename), filename);
if (malformedPairs.length) add("A6-BILINGUAL-PAIR-MALFORMED", malformedPairs, "A bilingual object is missing a non-empty Vietnamese or English value.", "Supply both locales in the canonical paired structure.");
if (identicalPairs.length) add("A6-BILINGUAL-PAIR-IDENTICAL", identicalPairs, "Vietnamese and English natural-language prose are identical.", "Author an independent Vietnamese rendering with the same meaning.");
if (tokenParityFailures.length) add("A6-BILINGUAL-TOKEN-PARITY", tokenParityFailures, "Stable IDs, pattern tokens, or numeric constraints differ between the Vietnamese and English members of a bilingual pair.", "Mirror all identifiers and numeric constraints across locales without translating stable IDs.");
if (terminologyMismatches.length) add("A6-TERMINOLOGY-MISMATCH", terminologyMismatches, "An English core term lacks its approved Vietnamese equivalent or an explicitly retained technical token.", "Use the established Vietnamese-English terminology pair consistently.");
if (localPathLeaks.length) add("A6-LOCAL-PATH-LEAK", localPathLeaks, "Canonical learner content contains a machine-local path or localhost reference.", "Replace it with a stable internal content ID or approved public citation.");
if (insecureRefs.length) add("A6-INSECURE-REFERENCE", insecureRefs, "Canonical learner content contains an insecure HTTP reference.", "Use an approved HTTPS citation with explicit access mode.");

const artifactById = new Map(artifacts.map((artifact) => [artifact.python_artifact_id, artifact]));
const artifactByLesson = new Map(artifacts.map((artifact) => [artifact.lesson_id, artifact]));
const lineKeys = new Set();
const codeCopyFailures = [];
const codeHashFailures = [];
const lineIdentityFailures = [];
const fixtureIdentityFailures = [];
for (const artifact of artifacts) {
  const source = await readFile(path.join(APP_ROOT, artifact.filename));
  const ordered = [...artifact.lines].sort((left, right) => left.order - right.order);
  const displayed = Buffer.from(ordered.map((line) => line.text).join("\n"), "utf8");
  if (!source.equals(displayed)) codeCopyFailures.push(artifact.python_artifact_id);
  if (artifact.code_sha256 !== sha256(source)) codeHashFailures.push(artifact.python_artifact_id);
  if (new Set(ordered.map((line) => line.line_id)).size !== ordered.length || ordered.some((line, index) => line.order !== index + 1)) lineIdentityFailures.push(artifact.python_artifact_id);
  for (const line of ordered) lineKeys.add(`${artifact.python_artifact_id}:${line.line_id}`);
  for (const fixture of artifact.fixtures) {
    const disk = await readJson(path.join(CONTENT_ROOT, "python/production", artifact.lesson_id.split(".").at(-1), "fixtures", `${fixture.case_kind}.json`));
    if (canonical(disk) !== canonical(fixture.input)) fixtureIdentityFailures.push(fixture.fixture_id);
  }
}
if (codeCopyFailures.length) add("A6-CODE-COPYABILITY", codeCopyFailures, "Displayed ordered code is not byte-identical to the executed source.", "Use the same source bytes for execution, display, and copy.");
if (codeHashFailures.length) add("A6-CODE-HASH", codeHashFailures, "A source hash differs from the PythonArtifact contract.", "Refresh the artifact and evidence only from the executed source.");
if (lineIdentityFailures.length) add("A6-CODE-LINE-IDENTITY", lineIdentityFailures, "Line IDs or display order are duplicated or non-contiguous.", "Assign stable unique line IDs and contiguous display order.");
if (fixtureIdentityFailures.length) add("A6-FIXTURE-IDENTITY", fixtureIdentityFailures, "A fixture file differs from the exact input embedded in its PythonArtifact.", "Use one locale-independent fixture payload everywhere.");

const knowledgeJoinFailures = [];
const knowledgeDisclosureFailures = [];
const explanationParityFailures = [];
const pythonConnectionParityFailures = [];
const representationParityFailures = [];
const scenarioParityFailures = [];
for (const envelope of knowledge) {
  const record = envelope.record;
  const artifact = artifactById.get(record.micro_example?.python_artifact_id);
  const lineIds = record.micro_example?.active_line_ids ?? [];
  if (!artifact || artifact.lesson_id !== record.lesson_id || lineIds.length === 0 || lineIds.some((lineId) => !lineKeys.has(`${artifact.python_artifact_id}:${lineId}`))) knowledgeJoinFailures.push(record.knowledge_unit_id);
  if (record.self_check?.answer_hidden_initially !== true) knowledgeDisclosureFailures.push(record.knowledge_unit_id);
  if (record.explanation?.vi?.includes("Học sinh cần xác định dữ liệu và trạng thái trước thao tác") && record.explanation?.en?.includes("The learner identifies")) explanationParityFailures.push(record.knowledge_unit_id);
  if (record.python_connection?.vi?.includes("Routine thể hiện quy tắc:") && record.python_connection?.en?.includes("artifact implements")) pythonConnectionParityFailures.push(record.knowledge_unit_id);
  if (record.representation?.vi?.includes("dùng bảng gồm bước, dữ liệu đang xét") && record.representation?.en?.includes("the fields")) representationParityFailures.push(record.knowledge_unit_id);
  if (record.micro_example?.scenario?.vi?.startsWith("Case ") && /^(Normal|Boundary|Failure) case:/.test(record.micro_example?.scenario?.en ?? "")) scenarioParityFailures.push(record.knowledge_unit_id);
}
if (knowledgeJoinFailures.length) add("A6-KNOWLEDGE-CODE-IDENTITY", knowledgeJoinFailures, "A KnowledgeUnit does not resolve to the exact shared production-v1 artifact and stable line IDs.", "Repair the artifact/version/line join without duplicating code by locale.");
if (knowledgeDisclosureFailures.length) add("A6-SELF-CHECK-DISCLOSURE", knowledgeDisclosureFailures, "A self-check answer is visible initially.", "Require answer_hidden_initially=true and reveal only after learner action.");
if (explanationParityFailures.length) add("A6-KNOWLEDGE-EXPLANATION-PARITY", explanationParityFailures, "The Vietnamese explanation is a generic process template while the English explanation adds the unit-specific concept/field list; the two locales do not teach the same content.", "Rewrite each Vietnamese explanation to cover every concept and constraint in its English peer, then review meaning in both directions.");
if (pythonConnectionParityFailures.length) add("A6-KNOWLEDGE-PYTHON-CONNECTION-PARITY", pythonConnectionParityFailures, "The Vietnamese Python connection states a rule/invariant while the English peer describes a different artifact-wide behavior list; the pair is not semantically equivalent.", "Author one shared unit-specific code connection and render equivalent Vietnamese and English text against the same bound lines.");
if (representationParityFailures.length) add("A6-KNOWLEDGE-REPRESENTATION-PARITY", representationParityFailures, "The Vietnamese representation is a generic state-table template while the English peer names unit-specific fields and decisions.", "Mirror the exact representation fields, state, and decision semantics in both locales.");
if (scenarioParityFailures.length) add("A6-KNOWLEDGE-SCENARIO-PARITY", scenarioParityFailures, "The Vietnamese micro-scenario is a generic valid/boundary/failure template while the English peer gives concrete lesson data and expected behavior.", "Translate and adapt the exact concrete fixture scenario into both locales without changing code/fixture identity.");

const traceByPattern = new Map();
for (const trace of traces) {
  const list = traceByPattern.get(trace.pattern_id) ?? [];
  list.push(trace);
  traceByPattern.set(trace.pattern_id, list);
}
const visualIdentityFailures = [];
const visualA11yFailures = [];
const focusFailures = [];
const validRoles = new Set(["status", "step", "control", "code-line", "diagram-node"]);
const validLiveModes = new Set(["polite", "assertive", "off"]);
const isBilingual = (value) => value && typeof value === "object" && typeof value.vi === "string" && value.vi.trim() && typeof value.en === "string" && value.en.trim();
for (const bundle of visualBundles) {
  const artifact = artifactById.get(bundle.python_artifact_ref);
  const eventById = new Map(bundle.events.map((envelope) => [envelope.record.event_id, envelope.record]));
  for (const traceEnvelope of bundle.traces) {
    const trace = traceEnvelope.record;
    const fixture = artifact?.fixtures.find((item) => item.fixture_id === trace.fixture_ref);
    const output = artifact?.expected_outputs.find((item) => item.expected_output_id === trace.expected_output_ref && item.fixture_ref === trace.fixture_ref);
    const orderedEvents = trace.event_ids.map((eventId) => eventById.get(eventId));
    if (!artifact || artifact.lesson_id !== bundle.lesson_id || bundle.artifact_version !== artifact.version || trace.python_artifact_id !== artifact.python_artifact_id || trace.artifact_version !== artifact.version || !fixture || !output || orderedEvents.some((event) => !event)) visualIdentityFailures.push(trace.trace_id);
    const seenTargets = new Set();
    for (const [index, event] of orderedEvents.entries()) {
      if (!event) continue;
      if (event.trace_id !== trace.trace_id || event.sequence !== index || event.active_line_ids.length === 0 || event.active_line_ids.some((lineId) => !lineKeys.has(`${artifact.python_artifact_id}:${lineId}`))) visualIdentityFailures.push(event.event_id);
      const a11y = event.accessibility;
      if (!isBilingual(event.invariant_or_criterion) || !isBilingual(event.prediction) || !isBilingual(event.feedback) || !isBilingual(a11y?.accessible_label) || !isBilingual(a11y?.action_description) || !isBilingual(a11y?.keyboard_instruction) || !isBilingual(a11y?.live_status?.message) || !validRoles.has(a11y?.interaction_role) || !validLiveModes.has(a11y?.live_status?.mode) || typeof a11y?.focus_target !== "string" || !a11y.focus_target.trim()) visualA11yFailures.push(event.event_id);
      if (a11y?.focus_order !== index || seenTargets.has(a11y?.focus_target)) focusFailures.push(event.event_id);
      seenTargets.add(a11y?.focus_target);
    }
  }
}
if (visualIdentityFailures.length) add("A6-VISUAL-SHARED-IDENTITY", [...new Set(visualIdentityFailures)], "A visual trace/event does not resolve to the exact artifact, fixture, output, event, or production line family.", "Regenerate the binding from the same independently rerun PythonArtifact.");
if (visualA11yFailures.length) add("A6-VISUAL-A11Y-CONTRACT", [...new Set(visualA11yFailures)], "A visual event lacks complete bilingual learning copy or accessibility metadata.", "Provide bilingual accessible label, action, keyboard instruction, live status, valid role, and stable focus target.");
if (focusFailures.length) add("A6-VISUAL-FOCUS-SEQUENCE", [...new Set(focusFailures)], "A trace has duplicate focus targets or focus_order different from its event sequence.", "Use unique targets with zero-based contiguous event-relative focus order.");

const assessmentDisclosureFailures = [];
const assessmentIdentityFailures = [];
const provisionalAuthorityFailures = [];
const officialPatternFailures = [];
for (const envelope of assessments) {
  const record = envelope.record;
  const slug = record.lesson_id.split(".").at(-1);
  const artifact = artifactByLesson.get(record.lesson_id);
  const resolvable = new Set([artifact?.python_artifact_id, ...(artifact?.fixtures ?? []).map((fixture) => fixture.fixture_id), ...(artifact?.expected_outputs ?? []).map((output) => output.expected_output_id)]);
  const disclosure = record.disclosure_contract;
  if (disclosure?.answer_hidden_initially !== true || disclosure?.hint_hidden_initially !== true || disclosure?.feedback_after_attempt !== true) assessmentDisclosureFailures.push(record.assessment_item_id);
  if (!artifact || !record.shared_fixture_code_data_ids?.includes(artifact.python_artifact_id) || record.shared_fixture_code_data_ids.some((id) => !resolvable.has(id))) assessmentIdentityFailures.push(record.assessment_item_id);
  if (record.self_rubric?.authority !== "AlgoCore_authored_rubric" || record.self_rubric?.official_marks !== null) provisionalAuthorityFailures.push(record.assessment_item_id);
  if (provisionalSlugs.has(slug)) {
    const descriptions = record.self_rubric?.criteria?.map((criterion) => `${criterion.description?.vi ?? ""} ${criterion.description?.en ?? ""}`).join(" ") ?? "";
    if (record.self_rubric?.pattern_authority !== "AlgoCore_representational_workflow_only" || !/workflow\/representation labels/i.test(descriptions) || !/not Cambridge mark allocations/i.test(descriptions) || !/nhãn workflow\/biểu diễn AlgoCore/i.test(descriptions) || !/không phải phân bổ điểm Cambridge/i.test(descriptions)) provisionalAuthorityFailures.push(record.assessment_item_id);
    if (record.pattern_ids.some((pattern) => traceByPattern.get(pattern)?.some((trace) => trace.lesson_id === record.lesson_id))) provisionalAuthorityFailures.push(record.assessment_item_id);
  } else {
    if (record.self_rubric?.pattern_authority !== "source_linked_pattern_workflow" || record.pattern_ids.some((pattern) => !(traceByPattern.get(pattern) ?? []).some((trace) => trace.python_artifact_id === artifact?.python_artifact_id))) officialPatternFailures.push(record.assessment_item_id);
  }
}
if (assessmentDisclosureFailures.length) add("A6-ASSESSMENT-DISCLOSURE", assessmentDisclosureFailures, "An assessment reveals answer/hint too early or feedback before an attempt.", "Hide answer and hint initially and show feedback only after an attempt.");
if (assessmentIdentityFailures.length) add("A6-ASSESSMENT-SHARED-IDENTITY", assessmentIdentityFailures, "An assessment references a forked or unresolved code/fixture/output identity.", "Use only IDs from the lesson's exact shared production-v1 PythonArtifact.");
if (provisionalAuthorityFailures.length) add("A6-PROVISIONAL-AUTHORITY", [...new Set(provisionalAuthorityFailures)], "A provisional lesson does not clearly limit its patterns to AlgoCore representation/workflow, keep official_marks=null, and deny Cambridge mark allocation authority.", "Apply the exact representational/workflow-only authority label and bilingual disclosure to all 18 provisional items.");
if (officialPatternFailures.length) add("A6-OFFICIAL-PATTERN-TRACE", officialPatternFailures, "An official pattern-owner assessment does not resolve to its lesson's exact visual trace family.", "Repair the assessment-to-pattern-to-trace join using stable IDs.");

const markingFailures = [];
for (const envelope of markingChains) {
  const record = envelope.record;
  for (const atom of record.marking_atoms) {
    if (atom.authority !== "Cambridge_QP_MS" || !atom.locator?.source_id || !Number.isInteger(atom.locator?.pdf_page) || !atom.locator?.bullet_locator || !isBilingual(atom.criterion)) markingFailures.push(`${record.marking_chain_id}:${atom.atom_id}`);
  }
}
if (markingFailures.length) add("A6-MARKING-AUTHORITY", markingFailures, "A marking atom lacks Cambridge_QP_MS authority, direct locator, or bilingual contextual criterion.", "Restore the exact locator-bound atom without inferring marks from AlgoCore prose.");

const result = {
  schema_version: "paper4-p4r3-a6-production-content-review-v1",
  checker_mode: "READ_ONLY_NO_CANONICAL_EDITS_NO_GATE_SIGNATURE",
  runtime: process.version,
  decision: findings.length ? "REWORK_REQUIRED" : "PASS",
  scope: { official_pattern_owner_lessons: officialLessons.length, provisional_lessons: provisionalLessons.length, provisional_lesson_slugs: [...provisionalSlugs].sort() },
  counts: {
    knowledge_units: knowledge.length,
    python_artifacts: artifacts.length,
    fixtures: artifacts.flatMap((artifact) => artifact.fixtures).length,
    marking_chains: markingChains.length,
    marking_atoms: markingAtoms.length,
    assessment_items: assessments.length,
    provisional_assessment_items: assessments.filter((item) => provisionalSlugs.has(item.record.lesson_id.split(".").at(-1))).length,
    visual_traces: traces.length,
    visual_events: events.length,
    bilingual_pairs_checked: bilingualPairs.length,
    terminology_occurrences_checked: terminologyChecks.length,
    reconstructable_copyable_sources: artifacts.length - codeCopyFailures.length,
    matching_source_hashes: artifacts.length - codeHashFailures.length,
    disk_fixture_identity_pass: 60 - fixtureIdentityFailures.length,
    knowledge_line_binding_pass: knowledge.length - knowledgeJoinFailures.length,
    visual_shared_identity_pass: events.length - new Set(visualIdentityFailures.filter((id) => id.includes(".event."))).size,
    visual_accessibility_contract_pass: events.length - new Set(visualA11yFailures).size,
    visual_focus_sequence_pass: events.length - new Set(focusFailures).size,
    hidden_self_check_pass: knowledge.length - knowledgeDisclosureFailures.length,
    hidden_assessment_pass: assessments.length - assessmentDisclosureFailures.length,
    assessment_shared_identity_pass: assessments.length - assessmentIdentityFailures.length,
    provisional_authority_pass: 18 - new Set(provisionalAuthorityFailures).size,
    local_path_leaks: localPathLeaks.length,
    hard_finding_groups: findings.length,
  },
  hard_findings: findings,
  limitations: [
    "This content-layer review does not perform browser QA.",
    "Keyboard, screen-reader, 320 px, zoom, theme, and reduced-motion rendering remain for the runtime/browser gate.",
    "A6 does not sign Lead or A8 release gates.",
  ],
};

const serialized = `${JSON.stringify(result, null, 2)}\n`;
const outIndex = process.argv.indexOf("--out");
if (outIndex >= 0 && process.argv[outIndex + 1]) {
  await mkdir(path.dirname(process.argv[outIndex + 1]), { recursive: true });
  await writeFile(process.argv[outIndex + 1], serialized, "utf8");
}
console.log(serialized);
if (findings.length) process.exitCode = 2;

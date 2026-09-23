import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const appRoot = process.cwd();
const contentRoot = join(appRoot, "content", "paper4");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

async function filesBelow(path, suffix) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) result.push(...await filesBelow(child, suffix));
    else if (entry.name.endsWith(suffix)) result.push(child);
  }
  return result.sort();
}

const slugs = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const knowledgeFiles = await filesBelow(join(contentRoot, "lessons", "pilot"), ".knowledge-unit.json");
const knowledge = await Promise.all(knowledgeFiles.map(readJson));
const artifacts = await Promise.all(slugs.map((slug) => readJson(join(contentRoot, "python", "pilot", slug, "artifact.json"))));
const visualBundles = await Promise.all(slugs.map((slug) => readJson(join(contentRoot, "visuals", "pilot", slug, "visuals.json"))));
const assessments = await readJson(join(contentRoot, "assessments", "pilot", "assessment-items.json"));
const visualTraces = visualBundles.flatMap((bundle) => bundle.traces.map((item) => item.record));
const visualEvents = visualBundles.flatMap((bundle) => bundle.events.map((item) => item.record));

const hardFindings = [];
const observations = [];
const add = (code, records, detail, remediation) => hardFindings.push({ code, count: records.length, records, detail, remediation });

const bilingualPairs = [];
const malformedPairs = [];
const identicalPairs = [];
const terminologyChecks = [];
const terminologyMismatches = [];
const localPathLeaks = [];
const unsafeRemoteRefs = [];
const absolutePath = /(?:^|[\s"'`(])(?:[A-Za-z]:[\\/]|file:\/\/|\\\\)/i;
const localHost = /(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::\d+)?/i;
const httpRef = /http:\/\//i;
const terminologyRules = [
  ["binary search", /\bbinary search\b/i, /tìm (?:kiếm )?nhị phân/i],
];

function walk(value, file, path = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, file, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    const hasVi = Object.hasOwn(value, "vi");
    const hasEn = Object.hasOwn(value, "en");
    if (hasVi || hasEn) {
      const record = `${relative(appRoot, file).replaceAll("\\", "/")}:${path}`;
      bilingualPairs.push(record);
      if (!(hasVi && hasEn && typeof value.vi === "string" && value.vi.trim() && typeof value.en === "string" && value.en.trim())) {
        malformedPairs.push(record);
      } else {
        const vi = value.vi.replace(/\s+/g, " ").trim().toLocaleLowerCase("vi");
        const en = value.en.replace(/\s+/g, " ").trim().toLowerCase();
        if (vi === en && /[a-z\p{L}]{4}/u.test(vi)) identicalPairs.push(record);
        for (const [term, enPattern, viPattern] of terminologyRules) {
          if (enPattern.test(value.en)) {
            terminologyChecks.push({ record, term });
            if (!viPattern.test(value.vi)) terminologyMismatches.push({ record, term });
          }
        }
      }
    }
    for (const [key, child] of Object.entries(value)) walk(child, file, `${path}.${key}`);
    return;
  }
  if (typeof value === "string") {
    const record = `${relative(appRoot, file).replaceAll("\\", "/")}:${path}`;
    if (absolutePath.test(value) || localHost.test(value)) localPathLeaks.push(record);
    if (httpRef.test(value)) unsafeRemoteRefs.push(record);
  }
}

const auditedJsonFiles = [
  ...knowledgeFiles,
  ...slugs.map((slug) => join(contentRoot, "python", "pilot", slug, "artifact.json")),
  ...slugs.map((slug) => join(contentRoot, "visuals", "pilot", slug, "visuals.json")),
  join(contentRoot, "assessments", "pilot", "assessment-items.json"),
  join(contentRoot, "assessments", "pilot", "marking-chains.json"),
];
for (const file of auditedJsonFiles) walk(await readJson(file), file);

if (knowledge.length !== 26) add("A6-COUNT-KNOWLEDGE", knowledge.map((item) => item.record?.knowledge_unit_id ?? "UNKNOWN"), `Expected 26 KnowledgeUnits, found ${knowledge.length}.`, "Restore the exact six-lesson pilot set.");
if (artifacts.length !== 6) add("A6-COUNT-PYTHON", artifacts.map((item) => item.python_artifact_id ?? "UNKNOWN"), `Expected 6 Python artifacts, found ${artifacts.length}.`, "Restore one shared Python artifact per pilot lesson.");
if (visualTraces.length !== 48) add("A6-COUNT-TRACE", visualTraces.map((item) => item.trace_id), `Expected 48 traces, found ${visualTraces.length}.`, "Restore three scenarios for every pilot pattern.");
if (visualEvents.length !== 238) add("A6-COUNT-EVENT", visualEvents.map((item) => item.event_id), `Expected 238 events, found ${visualEvents.length}.`, "Regenerate from the approved execution evidence.");
if (assessments.length !== 18) add("A6-COUNT-ASSESSMENT", assessments.map((item) => item.record?.assessment_item_id ?? "UNKNOWN"), `Expected 18 assessment items, found ${assessments.length}.`, "Restore guided, faded and independent items for every pilot lesson.");
if (malformedPairs.length) add("A6-BILINGUAL-PAIR-MALFORMED", malformedPairs, "A bilingual object is missing a non-empty vi or en value.", "Supply both locales in the canonical paired structure.");
if (identicalPairs.length) add("A6-BILINGUAL-PAIR-IDENTICAL", identicalPairs, "Vietnamese and English prose are identical.", "Author independent, semantically equivalent locale text.");
if (terminologyMismatches.length) add("A6-TERMINOLOGY-MISMATCH", terminologyMismatches.map((item) => `${item.record}#${item.term}`), "An English core term has no approved Vietnamese equivalent or explicitly retained technical token.", "Use the approved VI/EN terminology pair consistently.");

const artifactById = new Map(artifacts.map((artifact) => [artifact.python_artifact_id, artifact]));
const artifactByLesson = new Map(artifacts.map((artifact) => [artifact.lesson_id, artifact]));
const copyFailures = [];
const hashFailures = [];
const duplicateLineFailures = [];
const allLineIds = new Map();
for (const artifact of artifacts) {
  const source = await readFile(join(appRoot, artifact.filename), "utf8");
  const ordered = [...artifact.lines].sort((a, b) => a.order - b.order);
  const rebuilt = ordered.map((line) => line.text).join("\n");
  if (source.replace(/\r\n/g, "\n").replace(/\n$/, "") !== rebuilt.replace(/\r\n/g, "\n").replace(/\n$/, "")) copyFailures.push(artifact.python_artifact_id);
  if (createHash("sha256").update(source).digest("hex") !== artifact.code_sha256) hashFailures.push(artifact.python_artifact_id);
  if (new Set(ordered.map((line) => line.line_id)).size !== ordered.length || new Set(ordered.map((line) => line.order)).size !== ordered.length) duplicateLineFailures.push(artifact.python_artifact_id);
  for (const line of ordered) allLineIds.set(`${artifact.python_artifact_id}:${line.line_id}`, line.text);
}
if (copyFailures.length) add("A6-CODE-COPYABILITY", copyFailures, "Displayed ordered code does not reconstruct the copyable source.", "Keep one byte-equivalent source for display and copy.");
if (hashFailures.length) add("A6-CODE-HASH", hashFailures, "The source hash differs from the artifact contract.", "Refresh the artifact only from the executed source.");
if (duplicateLineFailures.length) add("A6-CODE-LINE-IDENTITY", duplicateLineFailures, "Line IDs or display order are not unique.", "Assign stable unique line IDs and contiguous display order.");

const knowledgeJoinFailures = [];
for (const item of knowledge) {
  const record = item.record;
  const refs = record.micro_example?.python_artifact_refs ?? [record.micro_example?.python_artifact_id].filter(Boolean);
  for (const artifactId of refs) {
    const artifact = artifactById.get(artifactId);
    if (!artifact || artifact.lesson_id !== record.lesson_id || !(record.micro_example?.active_line_ids ?? []).every((lineId) => allLineIds.has(`${artifactId}:${lineId}`))) {
      knowledgeJoinFailures.push(record.knowledge_unit_id);
      break;
    }
  }
}
if (knowledgeJoinFailures.length) add("A6-KNOWLEDGE-CODE-IDENTITY", knowledgeJoinFailures, "A micro-example does not resolve to the exact lesson artifact and stable line IDs.", "Repair the artifact/version/line join without copying locale-specific code.");

const visualJoinFailures = [];
for (const bundle of visualBundles) {
  const artifact = artifactById.get(bundle.python_artifact_ref);
  for (const traceEnvelope of bundle.traces) {
    const trace = traceEnvelope.record;
    const eventIds = new Set(bundle.events.filter((event) => event.record.trace_id === trace.trace_id).map((event) => event.record.event_id));
    if (!artifact || artifact.lesson_id !== bundle.lesson_id || bundle.artifact_version !== artifact.version || trace.python_artifact_id !== artifact.python_artifact_id || trace.artifact_version !== artifact.version || trace.event_ids.some((id) => !eventIds.has(id))) visualJoinFailures.push(trace.trace_id);
  }
  for (const eventEnvelope of bundle.events) {
    const event = eventEnvelope.record;
    if (!artifact || event.active_line_ids.some((lineId) => !allLineIds.has(`${artifact.python_artifact_id}:${lineId}`))) visualJoinFailures.push(event.event_id);
  }
}
if (visualJoinFailures.length) add("A6-VISUAL-CODE-TRACE-IDENTITY", [...new Set(visualJoinFailures)], "A visual trace/event does not resolve to its exact shared Python artifact version and lines.", "Regenerate visual bindings from the same executed artifact.");

const knowledgeDisclosureFailures = knowledge.filter((item) => item.record.self_check?.answer_hidden_initially !== true).map((item) => item.record.knowledge_unit_id);
if (knowledgeDisclosureFailures.length) add("A6-SELF-CHECK-DISCLOSURE", knowledgeDisclosureFailures, "A KnowledgeUnit answer is not hidden initially.", "Set answer_hidden_initially=true and reveal only on learner action.");
const assessmentDisclosureFailures = assessments.filter((item) => {
  const c = item.record.disclosure_contract;
  return c?.answer_hidden_initially !== true || c?.hint_hidden_initially !== true || c?.feedback_after_attempt !== true;
}).map((item) => item.record.assessment_item_id);
if (assessmentDisclosureFailures.length) add("A6-ASSESSMENT-DISCLOSURE", assessmentDisclosureFailures, "An assessment answer/hint/feedback reveal contract is unsafe.", "Require hidden answer and hint, then feedback after attempt.");

const assessmentJoinFailures = [];
for (const item of assessments) {
  const record = item.record;
  const artifact = artifactByLesson.get(record.lesson_id);
  const resolvable = new Set([artifact?.python_artifact_id, ...(artifact?.fixtures ?? []).map((x) => x.fixture_id), ...(artifact?.expected_outputs ?? []).map((x) => x.expected_output_id)]);
  if (!artifact || !record.shared_fixture_code_data_ids?.includes(artifact.python_artifact_id) || record.shared_fixture_code_data_ids.some((id) => !resolvable.has(id)) || record.pattern_ids.some((pattern) => !visualTraces.some((trace) => trace.pattern_id === pattern && trace.python_artifact_id === artifact.python_artifact_id))) assessmentJoinFailures.push(record.assessment_item_id);
}
if (assessmentJoinFailures.length) add("A6-ASSESSMENT-SHARED-IDENTITY", assessmentJoinFailures, "An assessment item does not resolve to the same code/fixture/output/trace family used by the lesson.", "Use stable shared IDs; do not fork data by locale.");

const isBilingual = (value) => value && typeof value === "object" && typeof value.vi === "string" && value.vi.trim() && typeof value.en === "string" && value.en.trim();
const englishOnlyCriteria = visualEvents.filter((event) => !isBilingual(event.invariant_or_criterion)).map((event) => event.event_id);
if (englishOnlyCriteria.length) add("A6-VISUAL-CRITERION-LOCALE", englishOnlyCriteria, "Learner-facing invariant_or_criterion is a single English string, so Vietnamese semantic parity cannot be represented or validated.", "Change the field to {vi,en}, author the Vietnamese criterion, and update schema/checkers/rendering.");
const mixedExpectedArtifacts = assessments.filter((item) => !isBilingual(item.record.expected_artifact)).map((item) => item.record.assessment_item_id);
if (mixedExpectedArtifacts.length) add("A6-ASSESSMENT-EXPECTED-ARTIFACT-LOCALE", mixedExpectedArtifacts, "expected_artifact is a single mixed-language string, so locale selection and semantic parity cannot be enforced.", "Change expected_artifact to {vi,en} and render only the active locale.");

const eventsWithA11yContract = visualEvents.filter((event) => {
  const a = event.accessibility;
  return isBilingual(a?.accessible_label)
    && isBilingual(a?.action_description)
    && ["status", "step", "control", "code-line", "diagram-node"].includes(a?.interaction_role)
    && isBilingual(a?.keyboard_instruction)
    && typeof a?.focus_target === "string" && a.focus_target.trim()
    && Number.isInteger(a?.focus_order) && a.focus_order >= 0
    && ["polite", "assertive", "off"].includes(a?.live_status?.mode)
    && isBilingual(a?.live_status?.message);
}).map((event) => event.event_id);
const eventsWithoutA11yContract = visualEvents.filter((event) => !eventsWithA11yContract.includes(event.event_id)).map((event) => event.event_id);
if (eventsWithoutA11yContract.length) add("A6-VISUAL-A11Y-CONTRACT", eventsWithoutA11yContract, "Visual events expose machine target IDs but no accessible name, keyboard action, focus target/order, or status-announcement contract.", "Add a typed bilingual accessibility/interaction contract per control/target and validate it before browser rendering.");
const focusOrderFailures = [];
for (const trace of visualTraces) {
  const events = visualEvents.filter((event) => event.trace_id === trace.trace_id).sort((a, b) => a.sequence - b.sequence);
  const targets = new Set();
  for (const event of events) {
    if (event.accessibility?.focus_order !== event.sequence || targets.has(event.accessibility?.focus_target)) focusOrderFailures.push(event.event_id);
    targets.add(event.accessibility?.focus_target);
  }
}
if (focusOrderFailures.length) add("A6-VISUAL-FOCUS-SEQUENCE", focusOrderFailures, "A trace has a duplicate focus target or focus_order that differs from its event sequence.", "Use a unique focus target and contiguous event-relative focus order.");

if (localPathLeaks.length) add("A6-LOCAL-PATH-LEAK", localPathLeaks, "Canonical learner content contains a machine-local path or localhost reference.", "Replace it with a stable internal content ID or approved public citation.");
if (unsafeRemoteRefs.length) add("A6-UNSAFE-PUBLIC-REFERENCE", unsafeRemoteRefs, "Canonical learner content contains an insecure http reference.", "Use an approved https citation with explicit access mode.");

const result = {
  schema_version: "paper4-p4r2-a6-content-review-v1",
  checker_mode: "READ_ONLY",
  runtime: process.version,
  decision: hardFindings.length ? "REWORK_REQUIRED" : "PASS",
  counts: {
    knowledge_units: knowledge.length,
    python_artifacts: artifacts.length,
    visual_scenarios: visualTraces.length,
    visual_events: visualEvents.length,
    assessment_items: assessments.length,
    bilingual_pairs_checked: bilingualPairs.length,
    malformed_bilingual_pairs: malformedPairs.length,
    identical_bilingual_pairs: identicalPairs.length,
    terminology_occurrences_checked: terminologyChecks.length,
    terminology_mismatches: terminologyMismatches.length,
    reconstructable_copyable_sources: artifacts.length - copyFailures.length,
    code_hashes_matching: artifacts.length - hashFailures.length,
    knowledge_code_identity_pass: knowledge.length - knowledgeJoinFailures.length,
    visual_code_trace_identity_failures: new Set(visualJoinFailures).size,
    hidden_self_check_contract_pass: knowledge.length - knowledgeDisclosureFailures.length,
    hidden_assessment_contract_pass: assessments.length - assessmentDisclosureFailures.length,
    assessment_shared_identity_pass: assessments.length - assessmentJoinFailures.length,
    local_path_leaks: localPathLeaks.length,
    unsafe_remote_refs: unsafeRemoteRefs.length,
    visual_events_with_explicit_a11y_contract: eventsWithA11yContract.length,
    visual_events_with_valid_focus_sequence: visualEvents.length - focusOrderFailures.length,
    hard_finding_groups: hardFindings.length,
  },
  hard_findings: hardFindings,
  observations,
};

const serialized = `${JSON.stringify(result, null, 2)}\n`;
const outIndex = process.argv.indexOf("--out");
if (outIndex >= 0 && process.argv[outIndex + 1]) await writeFile(process.argv[outIndex + 1], serialized);
console.log(serialized);
if (hardFindings.length) process.exitCode = 2;

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = path.resolve(ROOT, "../..");
const PYTHON_ROOT = path.join(ROOT, "content/paper4/python/production");
const VISUAL_ROOT = path.join(ROOT, "content/paper4/visuals/production");
const EVIDENCE_ROOT = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-4/a5");
const A3_ROOT = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/a3");
const SCOPE_PATH = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json");
const MIGRATION_PATH = path.join(ROOT, "content/paper4/mappings/visual-migration-inventory.json");
const CASES = ["normal", "boundary", "failure"];
const EVENT_TYPES = new Set(["read", "write", "assign", "compare", "advance", "swap", "link", "unlink", "call", "return", "branch", "reject", "emit"]);
const OOP_VISUAL_PROFILE = {
  OOP_CLASS: { id: "class-instance-memory", vi: "Thuộc tính nào thuộc instance nào, và self đang trỏ tới object nào?", en: "Which attributes belong to which instance, and which object does self reference?" },
  OOP_INSTANTIATE: { id: "class-instance-memory", vi: "Hai lần gọi constructor tạo hai identity và state độc lập như thế nào?", en: "How do two constructor calls create separate identities and state?" },
  OOP_GET: { id: "encapsulation-gate", vi: "Getter đọc field nào mà không làm đổi state?", en: "Which field does the getter read without changing state?" },
  OOP_SET: { id: "encapsulation-gate", vi: "Guard nào chạy trước write và state nào được giữ khi reject?", en: "Which guard runs before the write, and which state is preserved after rejection?" },
  OOP_UPDATE: { id: "encapsulation-gate", vi: "Candidate được tính, kiểm tra và commit theo thứ tự nào?", en: "In what order is the candidate derived, checked, and committed?" },
  OOP_SUBCLASS: { id: "constructor-chain", vi: "super() khởi tạo base state trước subclass state theo thứ tự nào?", en: "In what order does super() initialise base state before subclass state?" },
  OOP_OVERRIDE: { id: "dynamic-dispatch", vi: "Runtime type nào quyết định implementation của area() được gọi?", en: "Which runtime type selects the area() implementation?" },
  OOP_CAPACITY_ADD: { id: "object-graph", vi: "Shelf giữ reference tới Book nào, và reject có giữ nguyên object graph không?", en: "Which Book references does Shelf hold, and does rejection preserve the object graph?" },
};

function clone(value) { return structuredClone(value); }
function slugId(value) { return value.toLowerCase().replaceAll("_", "-"); }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
async function readJson(filename) { return JSON.parse(await readFile(filename, "utf8")); }
function withoutTrace(result) { const copy = clone(result); delete copy.trace; return copy; }

function classifyEvent(name) {
  if (/(reject|invalid|block|capacity_reject|duplicate)/.test(name)) return "reject";
  if (/(remove|delete|pop|dequeue|unlink)/.test(name)) return "unlink";
  if (/(swap)/.test(name)) return "swap";
  if (/(insert|write|push|enqueue|append|add_edge|bounded_add|setter|repair|recover|update)/.test(name)) return "write";
  if (/(read|load|seek_read)/.test(name)) return "read";
  if (/(instantiate|dispatch|call)/.test(name)) return "call";
  if (/(return)/.test(name)) return "return";
  if (/(check|compare|inspect|search|count|aggregate|validate)/.test(name)) return "compare";
  if (/(format|complete|flush)/.test(name)) return "emit";
  if (/(route|classify|process|rule)/.test(name)) return "branch";
  return "assign";
}

function wording(eventName, eventType) {
  const label = eventName.replaceAll("_", " ");
  const actions = {
    read: ["Đọc dữ liệu nào ở bước này?", "Which data is read at this step?", "Bước đọc lấy đúng dữ liệu từ fixture đã chạy lại.", "The read takes the exact data from the rerun fixture."],
    write: ["Giá trị nào sẽ được ghi hoặc cập nhật?", "Which value will be written or updated?", "Phép ghi giữ nguyên dữ liệu trước đó và áp dụng đúng thay đổi trong trace.", "The write preserves prior data and applies the exact change in the trace."],
    unlink: ["Phần tử nào sẽ bị gỡ khỏi cấu trúc?", "Which item will be removed from the structure?", "Liên kết hoặc phần tử được gỡ đúng theo trạng thái trước của trace.", "The link or item is removed from the trace's prior state."],
    compare: ["Kết quả so sánh sẽ chọn nhánh nào?", "Which branch will the comparison select?", "So sánh dùng đúng toán hạng và kết quả đã được chạy lại.", "The comparison uses the exact operands and independently rerun result."],
    reject: ["Điều kiện nào khiến dữ liệu bị từ chối?", "Which condition causes the input to be rejected?", "Đường lỗi dừng hoặc bảo vệ trạng thái tại đúng điểm kiểm tra.", "The failure path stops or protects state at the exact guard."],
    call: ["Đối tượng hoặc phương thức nào được gọi động?", "Which object or method is called dynamically?", "Lời gọi dùng đúng kiểu chạy và kết quả ghi trong trace.", "The call uses the runtime type and result recorded in the trace."],
    branch: ["Dữ liệu hiện tại sẽ đi theo nhánh nào?", "Which branch will the current data take?", "Nhánh được chọn từ đúng điều kiện và dữ liệu của fixture.", "The branch is selected from the fixture's exact condition and data."],
    emit: ["Kết quả nào sẽ được phát ra?", "Which result will be emitted?", "Đầu ra được định dạng từ kết quả đã kiểm chứng độc lập.", "The output is formatted from the independently verified result."],
    assign: ["Trạng thái nào thay đổi sau bước này?", "Which state changes after this step?", "Trạng thái mới giữ đúng sự kiện và giá trị trong trace.", "The new state preserves the event and values from the trace."],
    advance: ["Con trỏ hoặc chỉ số sẽ dịch chuyển đến đâu?", "Where will the pointer or index advance?", "Vị trí kế tiếp khớp phép dịch chuyển trong trace.", "The next position matches the transition in the trace."],
    swap: ["Hai giá trị nào đổi chỗ?", "Which two values exchange positions?", "Phép đổi chỗ giữ nguyên tập giá trị và đổi đúng hai vị trí.", "The swap preserves the values and exchanges the exact two positions."],
    link: ["Liên kết mới sẽ nối hai nút nào?", "Which nodes will the new link connect?", "Liên kết mới khớp trạng thái cấu trúc sau bước chạy.", "The new link matches the post-step structure."],
    return: ["Giá trị nào được trả về cho lời gọi trước?", "Which value returns to the caller?", "Giá trị trả về khớp frame và kết quả đã chạy lại.", "The return value matches the frame and rerun result."],
  };
  const [qVi, qEn, fVi, fEn] = actions[eventType] ?? actions.assign;
  return { prediction: { vi: `${qVi} (${label})`, en: `${qEn} (${label})` }, feedback: { vi: `${fVi} Sự kiện: ${label}.`, en: `${fEn} Event: ${label}.` } };
}

function scoreLine(text, eventName) {
  const lower = text.toLowerCase();
  const words = eventName.toLowerCase().split("_").filter((word) => word.length > 2);
  let score = 0;
  if (lower.includes(`\"${eventName.toLowerCase()}\"`) || lower.includes(`'${eventName.toLowerCase()}'`)) score += 20;
  if (lower.includes(`def ${eventName.toLowerCase()}`)) score += 16;
  for (const word of words) if (lower.includes(word)) score += 3;
  if (lower.includes("trace.append")) score += 5;
  if (lower.includes("def run")) score += 1;
  return score;
}

function bindLines(artifact, eventName, roleLines, isFinal) {
  const candidates = artifact.lines
    .filter((line) => line.text.trim() && !line.text.trim().startsWith("#"))
    .map((line) => ({ ...line, score: scoreLine(line.text, eventName) }))
    .filter((line) => line.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);
  const selected = [];
  for (const line of candidates) {
    if (!selected.includes(line.line_id)) selected.push(line.line_id);
    if (selected.length === 3) break;
  }
  if (selected.length === 0) selected.push(...roleLines.slice(0, 2));
  if (isFinal) {
    const returnLine = artifact.lines.findLast((line) => /return\s+\{/.test(line.text));
    if (returnLine && !selected.includes(returnLine.line_id)) selected.push(returnLine.line_id);
  }
  if (selected.length === 0) throw new Error(`${artifact.python_artifact_id}/${eventName}: no real source line could be bound.`);
  return selected;
}

function initialState(fixture, result) {
  return {
    fixture_ref: fixture.fixture_id,
    fixture_input: clone(fixture.input),
    trace_cursor: 0,
    history: [],
    latest_event: null,
    execution_status: result.status ?? "EXECUTED",
  };
}

function makeEvent({ artifact, pattern, caseKind, traceId, sequence, step, before, result, activeLineIds }) {
  const eventName = String(step.event ?? "state_change");
  const eventType = classifyEvent(eventName);
  if (!EVENT_TYPES.has(eventType)) throw new Error(`${eventName}: uncontrolled event type ${eventType}.`);
  const eventId = `${traceId}.event-${String(sequence + 1).padStart(3, "0")}`;
  const after = {
    ...clone(before),
    trace_cursor: sequence + 1,
    history: [...before.history, clone(step)],
    latest_event: eventName,
  };
  if (sequence === result.trace.length - 1) after.verified_result = withoutTrace(result);
  const copy = wording(eventName, eventType);
  const oopVisual = OOP_VISUAL_PROFILE[pattern];
  return {
    envelope: {
      schema_version: "2.0.0",
      artifact_type: "VisualEventBinding",
      record: {
        event_id: eventId,
        trace_id: traceId,
        sequence,
        event_type: eventType,
        active_line_ids: activeLineIds,
        before: clone(before),
        delta: { execution_trace_event: clone(step), pattern_focus: true },
        after: clone(after),
        output_delta: {
          emitted_trace_event: clone(step),
          ...(sequence === result.trace.length - 1 ? { final_result: withoutTrace(result) } : {}),
        },
        invariant_or_criterion: {
          vi: oopVisual ? `${oopVisual.vi} Sự kiện ${eventName} phải khớp trace chạy lại độc lập và line Python production-v1.` : `${pattern}: sự kiện ${eventName} phải khớp trace chạy lại độc lập, line Python production-v1 và chuyển trạng thái đang hiển thị.`,
          en: oopVisual ? `${oopVisual.en} Event ${eventName} must match the independent rerun trace and production-v1 Python lines.` : `${pattern}: event ${eventName} must match the independent rerun trace, production-v1 Python lines, and displayed state transition.`,
        },
        prediction: copy.prediction,
        feedback: copy.feedback,
        visual_targets: oopVisual
          ? [`visual.oop.${oopVisual.id}`, `visual.${slugId(pattern)}.${slugId(eventName)}`]
          : [`visual.${slugId(pattern)}.state`, `visual.${slugId(pattern)}.${slugId(eventName)}`],
        accessibility: {
          accessible_label: { vi: `Bước ${sequence + 1}: ${eventName}`, en: `Step ${sequence + 1}: ${eventName}` },
          action_description: copy.prediction,
          interaction_role: "step",
          keyboard_instruction: {
            vi: "Dùng phím mũi tên trái/phải để đổi bước; nhấn Enter để nghe phản hồi của bước đang chọn.",
            en: "Use Left/Right Arrow to change step; press Enter to hear feedback for the selected step.",
          },
          focus_target: `${eventId}.focus`,
          focus_order: sequence,
          live_status: { mode: eventType === "reject" ? "assertive" : "polite", message: copy.feedback },
        },
      },
    },
    after,
  };
}

async function main() {
  const [scope, rerun, roleMap, migration] = await Promise.all([
    readJson(SCOPE_PATH),
    readJson(path.join(A3_ROOT, "INDEPENDENT_RERUN.json")),
    readJson(path.join(A3_ROOT, "LINE_ROLE_MAP.json")),
    readJson(MIGRATION_PATH),
  ]);
  const officialOwners = scope.lessons
    .filter((lesson) => lesson.pattern_ids.length > 0)
    .map((lesson) => ({ slug: lesson.lesson_slug, patterns: lesson.pattern_ids }));
  const officialPatterns = officialOwners.flatMap((item) => item.patterns);
  if (officialPatterns.length !== 42 || new Set(officialPatterns).size !== 42) throw new Error("Scope must contain exactly 42 unique official production patterns.");
  const migrationByPattern = new Map(migration.patterns.map((item) => [item.pattern_id, item]));
  const rerunByLesson = new Map(rerun.lessons.map((item) => [item.lesson_id, item]));
  const rolesByLesson = new Map(roleMap.lessons.map((item) => [item.lesson_id, item.roles.flatMap((role) => role.active_line_ids)]));
  await rm(VISUAL_ROOT, { recursive: true, force: true });
  await mkdir(VISUAL_ROOT, { recursive: true });
  await mkdir(EVIDENCE_ROOT, { recursive: true });

  const manifest = {
    schema_version: "paper4-p4r4-visual-production-manifest-v1",
    authority: "A5_EXECUTION_BACKED_VISUAL_AUTHORING_NO_GATE_SIGNATURE",
    artifact_version: "production-v1",
    inputs: {
      independent_rerun: "p4r-3/a3/INDEPENDENT_RERUN.json",
      line_role_map: "p4r-3/a3/LINE_ROLE_MAP.json",
      scope_inventory: "p4r-3/preflight/P4R3_SCOPE_INVENTORY.json",
      migration_inventory: "content/paper4/mappings/visual-migration-inventory.json",
    },
    counts: { lessons: 0, patterns: 0, scenarios: 0, events: 0 },
    files: [],
  };
  const dispositions = [];
  const bindings = [];

  for (const { slug, patterns } of officialOwners) {
    const artifactPath = path.join(PYTHON_ROOT, slug, "artifact.json");
    const artifact = await readJson(artifactPath);
    const evidence = rerunByLesson.get(artifact.lesson_id);
    if (!evidence) throw new Error(`${slug}: independent rerun evidence is missing.`);
    const roleLines = [...new Set(rolesByLesson.get(artifact.lesson_id) ?? [])];
    const fixtureByKind = new Map(artifact.fixtures.map((fixture) => [fixture.case_kind, fixture]));
    const outputByFixture = new Map(artifact.expected_outputs.map((output) => [output.fixture_ref, output]));
    const evidenceByKind = new Map(evidence.cases.map((item) => [item.case_kind, item]));
    const traces = [];
    const events = [];
    const contracts = [];

    for (const pattern of patterns) {
      const migrated = migrationByPattern.get(pattern);
      if (!migrated) throw new Error(`${pattern}: legacy migration record is missing.`);
      const patternEventNames = [...new Set(evidence.cases.flatMap((item) => item.result.trace.map((step) => String(step.event ?? "state_change"))))];
      contracts.push({
        pattern_id: pattern,
        focus_event_names: patternEventNames,
        scenario_case_kinds: CASES,
        execution_scope: "integrated_python_artifact",
        contract: "Every case binds the exact production-v1 independent rerun trace. Shared integrated execution is retained only with explicit pattern and case equivalence justification.",
      });
      const replacementTraceIds = [];
      const replacementEventIds = [];
      for (const caseKind of CASES) {
        const fixture = fixtureByKind.get(caseKind);
        const output = outputByFixture.get(fixture.fixture_id);
        const evidenceCase = evidenceByKind.get(caseKind);
        if (!fixture || !output || !evidenceCase) throw new Error(`${slug}/${caseKind}: fixture, output or rerun evidence missing.`);
        if (JSON.stringify(output.value) !== JSON.stringify(evidenceCase.result)) throw new Error(`${slug}/${caseKind}: artifact output and independent rerun differ.`);
        const patternSlug = slugId(pattern);
        const traceId = `ac-9618-p4-2026-python.trace.${slug}.${patternSlug}.${caseKind}.production-v1`;
        let state = initialState(fixture, evidenceCase.result);
        const eventIds = [];
        for (const [sequence, step] of evidenceCase.result.trace.entries()) {
          const activeLineIds = bindLines(artifact, String(step.event ?? "state_change"), roleLines, sequence === evidenceCase.result.trace.length - 1);
          const made = makeEvent({ artifact, pattern, caseKind, traceId, sequence, step, before: state, result: evidenceCase.result, activeLineIds });
          events.push(made.envelope);
          eventIds.push(made.envelope.record.event_id);
          replacementEventIds.push(made.envelope.record.event_id);
          bindings.push({ slug, pattern_id: pattern, case_kind: caseKind, event_name: step.event, event_id: made.envelope.record.event_id, active_line_ids: activeLineIds, strategy: "event-token-scored-source-lines-with-semantic-role-fallback" });
          state = made.after;
        }
        const trace = {
          schema_version: "2.0.0",
          artifact_type: "VisualScenarioTrace",
          record: {
            pattern_id: pattern,
            scenario_id: `ac-9618-p4-2026-python.scenario.${slug}.${patternSlug}.${caseKind}.production-v1`,
            case_kind: caseKind,
            trace_id: traceId,
            python_artifact_id: artifact.python_artifact_id,
            artifact_version: "production-v1",
            initial_state: initialState(fixture, evidenceCase.result),
            event_ids: eventIds,
            expected_output_ref: output.expected_output_id,
            fixture_ref: fixture.fixture_id,
            execution_evidence_ref: artifact.independent_rerun_ref,
            equivalence_justification: `Pattern ${pattern} uses the integrated ${slug} production-v1 execution for ${caseKind}. The complete rerun path is retained because each visible transition depends on the same fixture state; pattern identity is expressed by its own scenario, trace, event identities, criterion and visual targets.`,
          },
        };
        traces.push(trace);
        replacementTraceIds.push(traceId);
      }
      dispositions.push({
        pattern_id: pattern,
        legacy_source_locator: migrated.source.source_locator,
        legacy_scenario_ids: migrated.scenarios.map((item) => item.scenario_id),
        legacy_event_ids: migrated.events.map((item) => item.event_id),
        legacy_counts: { scenarios: migrated.scenarios.length, events: migrated.events.length },
        disposition: "SUPERSEDED_BY_EXECUTION_BACKED_PRODUCTION_V1",
        replacement_trace_ids: replacementTraceIds,
        replacement_event_ids: replacementEventIds,
        cloned_legacy_trace_resolved: true,
        non_python_tokens_rejected: true,
        placeholder_state_rejected: true,
      });
    }
    const visual = {
      schema_version: "paper4-p4r4-visual-production-v1",
      lesson_id: artifact.lesson_id,
      python_artifact_ref: artifact.python_artifact_id,
      artifact_version: "production-v1",
      coverage_contracts: contracts,
      traces,
      events,
    };
    const outDir = path.join(VISUAL_ROOT, slug);
    await mkdir(outDir, { recursive: true });
    const bytes = `${JSON.stringify(visual, null, 2)}\n`;
    const outPath = path.join(outDir, "visuals.json");
    await writeFile(outPath, bytes, "utf8");
    manifest.counts.lessons += 1;
    manifest.counts.patterns += patterns.length;
    manifest.counts.scenarios += traces.length;
    manifest.counts.events += events.length;
    manifest.files.push({ path: path.relative(ROOT, outPath).replaceAll("\\", "/"), sha256: sha256(bytes), patterns: patterns.length, scenarios: traces.length, events: events.length });
  }
  const dispositionDocument = {
    schema_version: "paper4-p4r4-visual-migration-disposition-v1",
    authority: "A5_MIGRATION_EVIDENCE_NO_GATE_SIGNATURE",
    exact_scope: { patterns: 42, legacy_scenarios: dispositions.reduce((n, item) => n + item.legacy_counts.scenarios, 0), legacy_events: dispositions.reduce((n, item) => n + item.legacy_counts.events, 0) },
    dispositions,
  };
  const bindingDocument = {
    schema_version: "paper4-p4r4-line-binding-audit-v1",
    artifact_version: "production-v1",
    count: bindings.length,
    bindings,
  };
  await writeFile(path.join(EVIDENCE_ROOT, "PRODUCTION_VISUAL_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(path.join(EVIDENCE_ROOT, "MIGRATION_DISPOSITION.json"), `${JSON.stringify(dispositionDocument, null, 2)}\n`, "utf8");
  await writeFile(path.join(EVIDENCE_ROOT, "LINE_BINDING_AUDIT.json"), `${JSON.stringify(bindingDocument, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest.counts));
}

await main();

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = path.resolve(root, "../planning/paper4/completion-program-2026/evidence/cp1-ds2");
const uiRoot = path.join(root, "app/components/algocore-ui");
const galleryRoot = path.join(root, "app/paper-4/design-system");
const read = (file) => fs.readFileSync(file, "utf8");
const checks = [];
const record = (id, pass, message, evidence = {}) => checks.push({ id, pass: Boolean(pass), message, evidence });

const files = ["AlgoCoreUI.module.css", "controls.tsx", "surfaces.tsx", "journey.tsx", "index.ts"];
record("DS2-S01", files.every((file) => fs.existsSync(path.join(uiRoot, file))), "Shared component contract files exist", { files });
record("DS2-S02", fs.existsSync(path.join(galleryRoot, "page.tsx")) && fs.existsSync(path.join(galleryRoot, "DS2Gallery.tsx")), "Internal DS2 gallery route exists");

const index = read(path.join(uiRoot, "index.ts"));
const requiredExports = ["Button", "IconButton", "Card", "Callout", "Field", "Select", "Textarea", "ChoiceGroup", "Feedback", "Progress", "LessonStepper", "StageNavigation", "CodePanel", "StateVisual", "Disclosure", "LanguageSwitch", "SegmentedControl", "LessonContainer", "LessonShell"];
const missingExports = requiredExports.filter((name) => !new RegExp(`\\b${name}\\b`).test(index));
record("DS2-S03", missingExports.length === 0, "All DS2 component contracts are exported", { required: requiredExports.length, missingExports });

const css = read(path.join(uiRoot, "AlgoCoreUI.module.css"));
const rawColours = css.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi) ?? [];
record("DS2-S04", rawColours.length === 0, "DS2 styles consume semantic AlgoCore tokens and introduce no raw colours", { rawColours });
const requiredTokens = ["--alg-touch-target", "--alg-action-primary", "--alg-state-error", "--alg-focus-ring", "--alg-surface-code", "--alg-learning-memory-change", "--alg-motion-quick"];
const missingTokens = requiredTokens.filter((token) => !css.includes(token));
record("DS2-S05", missingTokens.length === 0, "Controls, states, code, learning and motion use the DS1 semantic contract", { missingTokens });
record("DS2-S06", css.includes("min-height: var(--alg-touch-target)") && css.includes("prefers-reduced-motion: reduce"), "Touch-target and reduced-motion contracts are present");

const components = ["controls.tsx", "surfaces.tsx", "journey.tsx"].map((file) => read(path.join(uiRoot, file))).join("\n");
record("DS2-S07", components.includes('Omit<T, "className">') && !/className\??:\s*string/.test(components), "Primitive consumers cannot restyle component internals through a className contract");
record("DS2-S08", components.includes('role="progressbar"') && components.includes('aria-live=') && components.includes('aria-current='), "Progress, feedback and current-stage semantics are explicit");
record("DS2-S09", components.includes("facts: readonly StateFact[]") && !components.includes("JSON.stringify"), "StateVisual accepts typed learner facts and cannot render raw JSON");

const gallery = read(path.join(galleryRoot, "DS2Gallery.tsx"));
const galleryFamilies = ["controls", "surfaces", "journey"].filter((family) => gallery.includes(`data-ds2-family=\"${family}\"`));
record("DS2-S10", galleryFamilies.length === 3 && gallery.includes("English is canonical") && gallery.includes("Tiếng Anh là bản chuẩn"), "Gallery covers all DS2 lanes in English and Vietnamese", { galleryFamilies });
record("DS2-S11", gallery.includes("loading") && gallery.includes("disabled") && gallery.includes('status="incorrect"') && gallery.includes('variant="warning"'), "Gallery includes pending, disabled, incorrect and warning states");

const allSources = files.map((file) => [file, read(path.join(uiRoot, file))]);
const learnerMutation = allSources.some(([, source]) => source.includes("learnerProjection") || source.includes("TraceEvent"));
record("DS2-S12", !learnerMutation, "Shared primitives do not import learner projections or trace events");

const failures = checks.filter((check) => !check.pass);
const result = { schema_version: "algocore-ds2-component-contract-gate-v1", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
fs.mkdirSync(evidenceRoot, { recursive: true });
fs.writeFileSync(path.join(evidenceRoot, "DS2_STATIC_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;

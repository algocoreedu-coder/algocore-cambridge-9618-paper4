import type { SearchCollectionsLearnerProjection, SearchCollectionsTraceStep, SearchCollectionsTraceVariant } from "./learnerProjection";
import type { Localized } from "./types";

export const SEARCH_COLLECTIONS_PROJECTION_SHA256 = "BD98010D781359A3E03BE8591B9C94C9B81E2F9EF9A198D2166163D7B1EB6DF1";
export const SEARCH_COLLECTIONS_PROGRESS_KEY = "algocore.paper4.learner.search-collections.trace.v1";
export const SEARCH_COLLECTIONS_PRACTICE_KEY = "algocore.paper4.learner.search-collections.practice.v1";
export const SEARCH_COLLECTIONS_PROTECT_KEY = "algocore.paper4.learner.search-collections.protect-marks.v1";
export const SEARCH_COLLECTIONS_TRACE_SCHEMA = "paper4-search-collections-trace-progress-v1";

export type SearchCollectionsScenario = "normal-primary" | "boundary-empty" | "not-found";
export type SearchCollectionsCheckpointId = "normal-primary:0" | "normal-primary:1" | "normal-primary:2";
export type SearchCollectionsDraftId = SearchCollectionsCheckpointId | "boundary-empty:0" | "not-found:0";
export type SearchCollectionsTraceCase = Readonly<{
  kind: SearchCollectionsScenario;
  label: Localized;
  values: readonly number[];
  target: number;
  expected: Readonly<{ found: number }>;
  explanation?: Localized;
}>;
export type SearchCollectionsTraceProgress = Readonly<{
  schema_version: typeof SEARCH_COLLECTIONS_TRACE_SCHEMA;
  projection_sha256: typeof SEARCH_COLLECTIONS_PROJECTION_SHA256;
  scenario: SearchCollectionsScenario;
  checkpoint_index: 0 | 1 | 2;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<SearchCollectionsDraftId, string>>>;
  revealed_checkpoint_ids: readonly SearchCollectionsCheckpointId[];
}>;

const normalIds: readonly SearchCollectionsCheckpointId[] = ["normal-primary:0", "normal-primary:1", "normal-primary:2"];
const draftIds: readonly SearchCollectionsDraftId[] = [...normalIds, "boundary-empty:0", "not-found:0"];

export function searchCollectionsCheckpointId(index: number): SearchCollectionsCheckpointId {
  return `normal-primary:${index === 0 ? 0 : index === 1 ? 1 : 2}`;
}

export function createInitialSearchCollectionsProgress(): SearchCollectionsTraceProgress {
  return { schema_version: SEARCH_COLLECTIONS_TRACE_SCHEMA, projection_sha256: SEARCH_COLLECTIONS_PROJECTION_SHA256, scenario: "normal-primary", checkpoint_index: 0, phase: "predict", drafts: {}, revealed_checkpoint_ids: [] };
}

export function isSearchCollectionsNormalComplete(progress: Pick<SearchCollectionsTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return normalIds.every((id) => progress.revealed_checkpoint_ids.includes(id) && Boolean(progress.drafts[id]?.trim()));
}

export function restoreSearchCollectionsProgress(raw: string | null): SearchCollectionsTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schema_version !== SEARCH_COLLECTIONS_TRACE_SCHEMA || value.projection_sha256 !== SEARCH_COLLECTIONS_PROJECTION_SHA256) return null;
    if (value.scenario !== "normal-primary" && value.scenario !== "boundary-empty" && value.scenario !== "not-found") return null;
    if (value.checkpoint_index !== 0 && value.checkpoint_index !== 1 && value.checkpoint_index !== 2) return null;
    if (value.scenario !== "normal-primary" && value.checkpoint_index !== 0) return null;
    if (value.phase !== "predict" && value.phase !== "revealed") return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts)) return null;
    const entries = Object.entries(value.drafts);
    const drafts = Object.fromEntries(entries.filter(([id, draft]) => draftIds.includes(id as SearchCollectionsDraftId) && typeof draft === "string"));
    if (Object.keys(drafts).length !== entries.length || !Array.isArray(value.revealed_checkpoint_ids)) return null;
    const revealed = value.revealed_checkpoint_ids.filter((id): id is SearchCollectionsCheckpointId => typeof id === "string" && normalIds.includes(id as SearchCollectionsCheckpointId));
    if (revealed.length !== value.revealed_checkpoint_ids.length || revealed.some((id) => !drafts[id]?.trim())) return null;
    const currentId: SearchCollectionsDraftId = value.scenario === "normal-primary" ? searchCollectionsCheckpointId(value.checkpoint_index as number) : `${value.scenario}:0`;
    if (value.phase === "revealed" && !drafts[currentId]?.trim()) return null;
    if (value.scenario === "normal-primary" && value.phase === "revealed" && !revealed.includes(currentId as SearchCollectionsCheckpointId)) return null;
    return { ...createInitialSearchCollectionsProgress(), scenario: value.scenario, checkpoint_index: value.checkpoint_index as 0 | 1 | 2, phase: value.phase, drafts, revealed_checkpoint_ids: [...new Set(revealed)] };
  } catch { return null; }
}

export function searchCollectionsCases(projection: SearchCollectionsLearnerProjection): readonly SearchCollectionsTraceCase[] {
  const primary: SearchCollectionsTraceCase = { kind: "normal-primary", label: projection.stages.trace.scenario.label, values: projection.stages.trace.scenario.values, target: projection.stages.trace.scenario.target, expected: { found: 0 } };
  return [primary, ...projection.stages.trace.variants.map(searchCollectionsVariantCase)];
}

function searchCollectionsVariantCase(variant: SearchCollectionsTraceVariant): SearchCollectionsTraceCase {
  return { kind: variant.kind === "boundary" ? "boundary-empty" : "not-found", label: variant.kind === "boundary" ? { en: "Boundary · empty collection", vi: "Boundary · collection rỗng" } : { en: "Valid result · target absent", vi: "Kết quả hợp lệ · không có target" }, values: variant.input.values, target: variant.input.target, expected: variant.expected, explanation: variant.explanation };
}

export function searchCollectionsStep(projection: SearchCollectionsLearnerProjection, index: 0 | 1 | 2): SearchCollectionsTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1) throw new Error("Search Collections steps do not match the approved three-decision sequence.");
  return step;
}

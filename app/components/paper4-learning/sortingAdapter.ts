import type { SortingLearnerProjection, SortingTraceStep, SortingTraceVariant } from "./learnerProjection";
import type { Localized } from "./types";

export const SORTING_PROJECTION_SHA256 = "D72B0ACA0FEDAE5A3B46E092925D9292967DBFFBA10725C85AA58DFE95F600CD";
export const SORTING_PROGRESS_KEY = "algocore.paper4.learner.sorting.trace.v1";
export const SORTING_PRACTICE_KEY = "algocore.paper4.learner.sorting.practice.v1";
export const SORTING_PROTECT_KEY = "algocore.paper4.learner.sorting.protect-marks.v1";
export const SORTING_TRACE_SCHEMA = "paper4-sorting-trace-progress-v1";

export type SortingScenario = "normal-primary" | "boundary-already-sorted" | "boundary-single" | "boundary-empty";
export type SortingCheckpointId = "normal-primary:0" | "normal-primary:1" | "normal-primary:2";
export type SortingDraftId = SortingCheckpointId | "boundary-already-sorted:0" | "boundary-single:0" | "boundary-empty:0";
export type SortingTraceCase = Readonly<{ kind: SortingScenario; label: Localized; values: readonly number[]; expected: Readonly<{ result: readonly number[]; passes: number; early_stop?: boolean }>; explanation?: Localized }>;
export type SortingTraceProgress = Readonly<{ schema_version: typeof SORTING_TRACE_SCHEMA; projection_sha256: typeof SORTING_PROJECTION_SHA256; scenario: SortingScenario; checkpoint_index: 0 | 1 | 2; phase: "predict" | "revealed"; drafts: Readonly<Partial<Record<SortingDraftId, string>>>; revealed_checkpoint_ids: readonly SortingCheckpointId[] }>;

const normalIds: readonly SortingCheckpointId[] = ["normal-primary:0","normal-primary:1","normal-primary:2"];
const draftIds: readonly SortingDraftId[] = [...normalIds,"boundary-already-sorted:0","boundary-single:0","boundary-empty:0"];
export const SORTING_EXECUTABLE_CASES = [
  { kind:"normal-primary", values:[4,2,3], result:[2,3,4] },
  { kind:"normal-reverse", values:[3,2,1], result:[1,2,3] },
  { kind:"normal-duplicates", values:[2,1,2], result:[1,2,2] },
  { kind:"boundary-already-sorted", values:[1,2,3], result:[1,2,3] },
  { kind:"boundary-single", values:[7], result:[7] },
  { kind:"boundary-empty", values:[], result:[] },
] as const;

export const sortingCheckpointId = (index: number): SortingCheckpointId => `normal-primary:${index === 0 ? 0 : index === 1 ? 1 : 2}`;
export function createInitialSortingProgress(): SortingTraceProgress { return { schema_version:SORTING_TRACE_SCHEMA, projection_sha256:SORTING_PROJECTION_SHA256, scenario:"normal-primary", checkpoint_index:0, phase:"predict", drafts:{}, revealed_checkpoint_ids:[] }; }
export function isSortingNormalComplete(progress: Pick<SortingTraceProgress,"drafts"|"revealed_checkpoint_ids">) { return normalIds.every((id)=>progress.revealed_checkpoint_ids.includes(id)&&Boolean(progress.drafts[id]?.trim())); }
export function restoreSortingProgress(raw: string | null): SortingTraceProgress | null {
  if(!raw)return null; try { const value=JSON.parse(raw) as Record<string,unknown>; if(value.schema_version!==SORTING_TRACE_SCHEMA||value.projection_sha256!==SORTING_PROJECTION_SHA256)return null; if(value.scenario!=="normal-primary"&&value.scenario!=="boundary-already-sorted"&&value.scenario!=="boundary-single"&&value.scenario!=="boundary-empty")return null; if(value.checkpoint_index!==0&&value.checkpoint_index!==1&&value.checkpoint_index!==2)return null; if(value.scenario!=="normal-primary"&&value.checkpoint_index!==0)return null; if(value.phase!=="predict"&&value.phase!=="revealed")return null; if(!value.drafts||typeof value.drafts!=="object"||Array.isArray(value.drafts)||!Array.isArray(value.revealed_checkpoint_ids))return null; const entries=Object.entries(value.drafts); const drafts=Object.fromEntries(entries.filter(([id,draft])=>draftIds.includes(id as SortingDraftId)&&typeof draft==="string")); if(Object.keys(drafts).length!==entries.length)return null; const revealed=value.revealed_checkpoint_ids.filter((id):id is SortingCheckpointId=>typeof id==="string"&&normalIds.includes(id as SortingCheckpointId)); if(revealed.length!==value.revealed_checkpoint_ids.length||revealed.some((id)=>!drafts[id]?.trim()))return null; const currentId:SortingDraftId=value.scenario==="normal-primary"?sortingCheckpointId(value.checkpoint_index as number):`${value.scenario}:0`; if(value.phase==="revealed"&&!drafts[currentId]?.trim())return null; if(value.scenario==="normal-primary"&&value.phase==="revealed"&&!revealed.includes(currentId as SortingCheckpointId))return null; return {...createInitialSortingProgress(),scenario:value.scenario,checkpoint_index:value.checkpoint_index as 0|1|2,phase:value.phase,drafts,revealed_checkpoint_ids:[...new Set(revealed)]}; } catch{return null;}
}
export function sortingCases(projection: SortingLearnerProjection): readonly SortingTraceCase[] { return [{kind:"normal-primary",label:projection.stages.trace.scenario.label,values:projection.stages.trace.scenario.values,expected:{result:[2,3,4],passes:2,early_stop:true}},...projection.stages.trace.variants.map(sortingVariantCase)]; }
function sortingVariantCase(variant: SortingTraceVariant): SortingTraceCase { const map={boundary_already_sorted:"boundary-already-sorted",boundary_single:"boundary-single",boundary_empty:"boundary-empty"} as const; const labels={boundary_already_sorted:{en:"Boundary · already sorted",vi:"Boundary · đã sắp"},boundary_single:{en:"Boundary · single item",vi:"Boundary · một item"},boundary_empty:{en:"Boundary · empty",vi:"Boundary · rỗng"}} as const; return {kind:map[variant.kind],label:labels[variant.kind],values:variant.input.values,expected:variant.expected,explanation:variant.explanation}; }
export function sortingStep(projection: SortingLearnerProjection,index:0|1|2):SortingTraceStep{const step=projection.stages.trace.steps[index];if(!step||step.step!==index+1)throw new Error("Sorting steps do not match the approved sequence.");return step;}

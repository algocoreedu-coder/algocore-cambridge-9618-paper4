import type { StackLearnerProjection, StackTraceStep, StackTraceVariant } from "./learnerProjection";

export const STACK_PROJECTION_SHA256 = "64467481BC42B6950FA7FEFB1958BD62126976A4F0DAEEA4DE30FE6E2160707D";
export const STACK_PROGRESS_KEY = "algocore.paper4.learner.stack.trace.v1";
export const STACK_PRACTICE_KEY = "algocore.paper4.learner.stack.practice.v1";
export const STACK_PROTECT_KEY = "algocore.paper4.learner.stack.protect-marks.v1";
export const STACK_TRACE_SCHEMA = "paper4-stack-current-top-progress-v1";
export const STACK_PRACTICE_SCHEMA = "paper4-stack-practice-progress-v1";

export type StackCheckpointId = "normal:0" | "normal:1" | "normal:2" | "normal:3";
export type StackTraceProgress = Readonly<{
  schema_version: typeof STACK_TRACE_SCHEMA;
  projection_sha256: typeof STACK_PROJECTION_SHA256;
  case_kind: "normal-current-top";
  checkpoint_index: 0 | 1 | 2 | 3;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<StackCheckpointId, string>>>;
  revealed_checkpoint_ids: readonly StackCheckpointId[];
}>;

const ids: readonly StackCheckpointId[] = ["normal:0", "normal:1", "normal:2", "normal:3"];
export const stackCheckpointId = (index:number):StackCheckpointId => ids[index] ?? "normal:0";
export function stackStep(projection:StackLearnerProjection,index:0|1|2|3):StackTraceStep { const step=projection.stages.trace.steps[index]; if(!step||step.step!==index+1||step.code_focus.length>3) throw new Error("Stack primary decisions do not match the frozen projection."); return step; }
export function stackVariants(projection:StackLearnerProjection):readonly [StackTraceVariant,StackTraceVariant] { const v=projection.stages.trace.variants; if(v.length!==2||v[0]?.kind!=="boundary_empty_pop"||v[1]?.kind!=="rejected_operations") throw new Error("Stack support cases do not match the frozen projection."); return v as readonly [StackTraceVariant,StackTraceVariant]; }
export function createInitialStackProgress():StackTraceProgress { return {schema_version:STACK_TRACE_SCHEMA,projection_sha256:STACK_PROJECTION_SHA256,case_kind:"normal-current-top",checkpoint_index:0,phase:"predict",drafts:{},revealed_checkpoint_ids:[]}; }
export function isStackComplete(p:Pick<StackTraceProgress,"drafts"|"revealed_checkpoint_ids">){return ids.every(id=>Boolean(p.drafts[id]?.trim())&&p.revealed_checkpoint_ids.includes(id));}
export function restoreStackProgress(raw:string|null):StackTraceProgress|null { if(!raw)return null; try{const v=JSON.parse(raw) as Record<string,unknown>;if(v.schema_version!==STACK_TRACE_SCHEMA||v.projection_sha256!==STACK_PROJECTION_SHA256||v.case_kind!=="normal-current-top"||![0,1,2,3].includes(v.checkpoint_index as number)||(v.phase!=="predict"&&v.phase!=="revealed")||!v.drafts||typeof v.drafts!=="object"||Array.isArray(v.drafts)||!Array.isArray(v.revealed_checkpoint_ids))return null;const entries=Object.entries(v.drafts);if(entries.some(([id,d])=>!ids.includes(id as StackCheckpointId)||typeof d!=="string"))return null;const drafts=Object.fromEntries(entries) as Partial<Record<StackCheckpointId,string>>;const revealed=v.revealed_checkpoint_ids as unknown[];if(revealed.some(id=>typeof id!=="string"||!ids.includes(id as StackCheckpointId)||!drafts[id as StackCheckpointId]?.trim()))return null;return {...createInitialStackProgress(),checkpoint_index:v.checkpoint_index as 0|1|2|3,phase:v.phase,drafts,revealed_checkpoint_ids:[...new Set(revealed as StackCheckpointId[])]};}catch{return null;} }

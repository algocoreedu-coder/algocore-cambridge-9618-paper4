import type { Localized } from "./types";

export type VisualText = Localized | string | number | boolean | null;
export type VisualStatus = "active" | "muted" | "done" | "match" | string;

export interface VisualArrayScene {
  readonly type: "array";
  readonly cells: readonly { readonly id: string; readonly label: VisualText; readonly value: VisualText; readonly status?: VisualStatus }[];
  readonly pointers?: readonly { readonly index: number; readonly label: VisualText }[];
  readonly caption: VisualText;
}

export interface VisualGraphNode {
  readonly id: string;
  readonly label: VisualText;
  readonly detail?: VisualText;
  readonly x: number;
  readonly y: number;
  readonly tone?: VisualStatus;
  readonly shape?: string;
}

export interface VisualGraphScene {
  readonly type: "graph";
  readonly nodes: readonly VisualGraphNode[];
  readonly edges: readonly { readonly from: string; readonly to: string; readonly label?: VisualText; readonly active?: boolean }[];
  readonly caption: VisualText;
}

export interface VisualLaneScene {
  readonly type: "lanes";
  readonly lanes: readonly { readonly id: string; readonly label: VisualText; readonly items: readonly { readonly id: string; readonly label: VisualText; readonly value?: VisualText; readonly status?: VisualStatus }[] }[];
  readonly links?: readonly { readonly from: string; readonly to: string; readonly label: VisualText }[];
  readonly caption: VisualText;
}

export interface VisualTableScene {
  readonly type: "table";
  readonly columns: readonly VisualText[];
  readonly rows: readonly { readonly id: string; readonly cells: readonly VisualText[]; readonly status?: VisualStatus }[];
  readonly caption?: VisualText;
}

export interface VisualDomainScene {
  readonly type: "domain";
  readonly min: number;
  readonly max: number;
  readonly low: number;
  readonly high: number;
  readonly value: number;
  readonly label: VisualText;
  readonly caption: VisualText;
}

export interface VisualDiagramNode {
  readonly id: string;
  readonly shape: string;
  readonly label: VisualText;
  readonly detail?: VisualText;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly tone?: VisualStatus;
  readonly fontSize?: number;
}

export interface VisualDiagramConnector {
  readonly id: string;
  readonly from?: string;
  readonly to?: string;
  readonly points?: readonly (readonly [number, number])[];
  readonly path?: string;
  readonly arrow?: "none" | "start" | "end" | "both";
  readonly label?: VisualText;
  readonly labelX?: number;
  readonly labelY?: number;
  readonly active?: boolean;
}

export interface VisualDiagramMark extends VisualDiagramConnector {
  readonly type: "data-couple" | "control-couple" | "selection" | "repetition" | "initial" | "text" | string;
  readonly x?: number;
  readonly y?: number;
  readonly r?: number;
}

export interface VisualDiagramScene {
  readonly type: "diagram";
  readonly mode?: string;
  readonly width: number;
  readonly height: number;
  readonly caption: VisualText;
  readonly description: VisualText;
  readonly nodes: readonly VisualDiagramNode[];
  readonly edges?: readonly VisualDiagramConnector[];
  readonly marks?: readonly VisualDiagramMark[];
}

export type Paper2VisualScene = VisualArrayScene | VisualGraphScene | VisualDiagramScene | VisualLaneScene | VisualTableScene | VisualDomainScene;

export interface Paper2VisualFrame {
  readonly id: string;
  readonly title: VisualText;
  readonly before: VisualText;
  readonly operation: VisualText;
  readonly after: VisualText;
  readonly why: VisualText;
  readonly focus: VisualText;
  readonly scene: Paper2VisualScene;
  readonly vars?: Readonly<Record<string, VisualText>>;
  readonly codeLines?: readonly number[];
}

export interface Paper2VisualVariant {
  readonly id: string;
  readonly label: VisualText;
  readonly frames: readonly Paper2VisualFrame[];
}

export interface Paper2VisualAsset {
  readonly id: string;
  readonly topicId?: string;
  readonly section: string;
  readonly family?: string;
  readonly title: Localized;
  readonly objective: Localized;
  readonly lessonUse: Localized;
  readonly kind: "process" | "exploration" | "section" | string;
  readonly variants: readonly Paper2VisualVariant[];
  readonly code?: readonly string[];
  readonly sources: readonly { readonly label: string; readonly locator: string }[];
}

export interface Paper2VisualExport {
  readonly schemaVersion: 2;
  readonly generatedFrom: readonly string[];
  readonly sourceHashes: Readonly<Record<string, string>>;
  readonly sourceManifest: string;
  readonly sourceManifestSha256: string;
  readonly baselineCounts: { readonly assets: number; readonly variants: number; readonly frames: number };
  readonly counts: { readonly assets: number; readonly variants: number; readonly frames: number };
  readonly supportedSceneTypes: readonly string[];
  readonly semanticSha256: string;
  readonly assetHashes: Readonly<Record<string, string>>;
  readonly assets: readonly Paper2VisualAsset[];
}

export interface Paper2VisualSelection {
  readonly assets: readonly Paper2VisualAsset[];
  readonly sourceManifestSha256: string;
}

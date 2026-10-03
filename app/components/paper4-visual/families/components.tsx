import type { ComponentType } from "react";

import { VisualFamilyScene } from "./FamilyScene";
import type { VisualFamilyId, VisualFamilyProps } from "./types";

export const VC01ArrayRibbon = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-01" {...props} />;
export const VC02RecordObjectCard = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-02" {...props} />;
export const VC03FlowPipeline = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-03" {...props} />;
export const VC04PredicateGate = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-04" {...props} />;
export const VC05TestMatrix = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-05" {...props} />;
export const VC06SearchWindow = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-06" {...props} />;
export const VC07SortTrack = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-07" {...props} />;
export const VC08StackTower = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-08" {...props} />;
export const VC09QueueTrackRing = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-09" {...props} />;
export const VC10NodeLinkCanvas = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-10" {...props} />;
export const VC11HashBuckets = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-11" {...props} />;
export const VC12ClassObjectMap = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-12" {...props} />;
export const VC13FileCursor = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-13" {...props} />;
export const VC14ExceptionPath = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-14" {...props} />;
export const VC15OperationCounter = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-15" {...props} />;
export const VC16OutputConsole = (props: VisualFamilyProps) => <VisualFamilyScene id="VC-16" {...props} />;

export const visualFamilyComponents: Readonly<Record<VisualFamilyId, ComponentType<VisualFamilyProps>>> = {
  "VC-01": VC01ArrayRibbon,
  "VC-02": VC02RecordObjectCard,
  "VC-03": VC03FlowPipeline,
  "VC-04": VC04PredicateGate,
  "VC-05": VC05TestMatrix,
  "VC-06": VC06SearchWindow,
  "VC-07": VC07SortTrack,
  "VC-08": VC08StackTower,
  "VC-09": VC09QueueTrackRing,
  "VC-10": VC10NodeLinkCanvas,
  "VC-11": VC11HashBuckets,
  "VC-12": VC12ClassObjectMap,
  "VC-13": VC13FileCursor,
  "VC-14": VC14ExceptionPath,
  "VC-15": VC15OperationCounter,
  "VC-16": VC16OutputConsole,
};

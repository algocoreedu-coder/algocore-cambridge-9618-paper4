import "server-only";

import rawExportedVisuals from "./generated/canonical-visuals.json";
import type { Paper2VisualAsset, Paper2VisualExport, Paper2VisualSelection } from "./visual-types";

const exportedVisuals = rawExportedVisuals as unknown as Paper2VisualExport;
const visualById = new Map(exportedVisuals.assets.map((asset) => [asset.id, asset]));

/**
 * Select the minimum visual payload on the server. Returning undefined for any
 * unknown ID keeps lesson and review routes fail-closed instead of silently
 * exposing a different asset or the complete canonical registry.
 */
export function getPaper2VisualSelection(assetIds: readonly string[]): Paper2VisualSelection | undefined {
  if (assetIds.length === 0) return undefined;
  const uniqueIds = [...new Set(assetIds)];
  const assets = uniqueIds.map((id) => visualById.get(id));
  if (assets.some((asset) => !asset)) return undefined;
  return {
    assets: assets as readonly Paper2VisualAsset[],
    sourceManifestSha256: exportedVisuals.sourceManifestSha256,
  };
}

export function getPaper2VisualIds(): readonly string[] {
  return Object.freeze([...visualById.keys()]);
}

export function getPaper2VisualManifestSha256(): string {
  return exportedVisuals.sourceManifestSha256;
}

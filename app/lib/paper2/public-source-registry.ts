import "server-only";

import sourceData from "@/content/paper2/sources/source-registry.json";
import rightsData from "@/content/paper2/sources/rights-ledger.json";

export interface Paper2PublicSourceLabel {
  readonly sourceId: string;
  readonly label: string;
  readonly kind: string;
  readonly attribution: string;
  readonly disposition: string;
}

const rightsById = new Map(rightsData.rights.map((rights) => [rights.rightsId, rights]));
const sourceById = new Map(sourceData.sources.map((source) => [source.sourceId, source]));

export function getPaper2PublicSourceLabels(sourceIds: readonly string[]): readonly Paper2PublicSourceLabel[] {
  return [...new Set(sourceIds)].flatMap((sourceId) => {
    const source = sourceById.get(sourceId);
    if (!source) return [];
    const rights = rightsById.get(source.rightsId);
    return [{
      sourceId,
      label: source.publicLabel,
      kind: source.kind,
      attribution: typeof rights?.attribution === "string" ? rights.attribution : rights?.attribution?.creditLine ?? source.authority,
      disposition: rights?.disposition ?? "unverified",
    }];
  });
}

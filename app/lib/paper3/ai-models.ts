import type { Localized } from "./catalog";

export type AILocale = "en" | "vi";
export type AIVisualKind = "dijkstra-search" | "astar-search" | "learning-categories" | "neural-network" | "backpropagation" | "regression";
export type SearchFixtureId = "primary" | "tie" | "unreachable";
export type AStarFixtureId = "primary" | "tie" | "inadmissible";
export type LearningScenarioId = "labelled-energy-regression" | "unlabelled-shopper-groups" | "warehouse-agent-reward" | "labelled-robot-images";

export interface GraphNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly heuristic?: number;
}

export interface GraphEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly weight: number;
}

export interface GraphFixture {
  readonly id: string;
  readonly directed: boolean;
  readonly startId: string;
  readonly goalId: string;
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly title: Localized;
  readonly purpose: Localized;
}

export interface TraceStep<S> {
  readonly id: string;
  readonly event: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly outcome: Localized;
  readonly before: S;
  readonly after: S;
}

export interface SearchState {
  readonly phase: string;
  readonly currentNodeId: string | null;
  readonly candidateEdgeId: string | null;
  readonly candidateDecision: "accepted" | "rejected-higher" | "rejected-equal" | "skipped-settled" | "not-considered";
  readonly frontierIds: readonly string[];
  readonly predecessors: Readonly<Record<string, string | null>>;
  readonly selectedOrder: readonly string[];
  readonly path: readonly string[];
  readonly totalCost: number | null;
  readonly distances: Readonly<Record<string, number | null>>;
  readonly settledIds: readonly string[];
  readonly gScores: Readonly<Record<string, number | null>>;
  readonly hScores: Readonly<Record<string, number | null>>;
  readonly fScores: Readonly<Record<string, number | null>>;
  readonly openIds: readonly string[];
  readonly closedIds: readonly string[];
  readonly terminalStatus: "path-found" | "no-path" | null;
}

export interface SearchTrace {
  readonly fixtureId: string;
  readonly algorithm: "dijkstra" | "astar";
  readonly fixture: GraphFixture;
  readonly initial: SearchState;
  readonly steps: readonly TraceStep<SearchState>[];
  readonly final: SearchState & {
    readonly status: "path-found" | "no-path";
    readonly cost: number | null;
    readonly optimalityClaim?: string;
    readonly referenceShortestPath?: readonly string[];
    readonly referenceShortestCost?: number;
  };
}

const L = (en: string, vi: string): Localized => ({ en, vi });
const round = (value: number) => Math.round((value + Number.EPSILON) * 1e10) / 1e10;
const searchDecisionCopy: Readonly<Record<SearchState["candidateDecision"], Localized>> = {
  accepted: L("accepted", "chấp nhận"),
  "rejected-higher": L("rejected because the cost is higher", "từ chối vì chi phí cao hơn"),
  "rejected-equal": L("rejected because the cost is equal", "từ chối vì chi phí bằng nhau"),
  "skipped-settled": L("skipped because the node is already settled", "bỏ qua vì nút đã được chốt"),
  "not-considered": L("not considered", "chưa xét"),
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

const primaryNodes: readonly GraphNode[] = [
  { id: "S", label: "Start", x: 7, y: 50, heuristic: 7 },
  { id: "A", label: "A", x: 30, y: 20, heuristic: 8 },
  { id: "B", label: "B", x: 30, y: 78, heuristic: 5 },
  { id: "C", label: "C", x: 55, y: 12, heuristic: 9 },
  { id: "D", label: "D", x: 58, y: 66, heuristic: 3 },
  { id: "G", label: "Goal", x: 88, y: 48, heuristic: 0 },
];
const primaryEdges: readonly GraphEdge[] = [
  { id: "e-sa", from: "S", to: "A", weight: 2 },
  { id: "e-sb", from: "S", to: "B", weight: 2 },
  { id: "e-ac", from: "A", to: "C", weight: 2 },
  { id: "e-ad", from: "A", to: "D", weight: 5 },
  { id: "e-bd", from: "B", to: "D", weight: 2 },
  { id: "e-cg", from: "C", to: "G", weight: 10 },
  { id: "e-dg", from: "D", to: "G", weight: 3 },
];

const primaryFixture: GraphFixture = {
  id: "primary", directed: false, startId: "S", goalId: "G", nodes: primaryNodes, edges: primaryEdges,
  title: L("Shared route graph", "Đồ thị tuyến đường dùng chung"),
  purpose: L("Compare cumulative-cost search with heuristic-guided search on the same positive weighted graph.", "So sánh tìm kiếm theo chi phí tích lũy với tìm kiếm có heuristic trên cùng đồ thị trọng số dương."),
};
const tieFixture: GraphFixture = {
  id: "tie", directed: false, startId: "S", goalId: "G",
  nodes: [
    { id: "S", label: "Start", x: 8, y: 50, heuristic: 5 }, { id: "A", label: "A", x: 42, y: 22, heuristic: 3 },
    { id: "B", label: "B", x: 42, y: 78, heuristic: 3 }, { id: "G", label: "Goal", x: 86, y: 50, heuristic: 0 },
  ],
  edges: [
    { id: "e-sa", from: "S", to: "A", weight: 2 }, { id: "e-sb", from: "S", to: "B", weight: 2 },
    { id: "e-ag", from: "A", to: "G", weight: 3 }, { id: "e-bg", from: "B", to: "G", weight: 3 },
  ],
  title: L("Equal-cost tie", "Trường hợp đồng chi phí"),
  purpose: L("Expose the alphabetical node-ID tie-break and keep the first equal-cost predecessor.", "Thể hiện quy tắc phá hòa theo ID nút và giữ predecessor đầu tiên khi chi phí bằng nhau."),
};
const unreachableFixture: GraphFixture = {
  id: "unreachable", directed: false, startId: "S", goalId: "G",
  nodes: [{ id: "S", label: "Start", x: 8, y: 50 }, { id: "A", label: "A", x: 45, y: 30 }, { id: "G", label: "Goal", x: 86, y: 50 }],
  edges: [{ id: "e-sa", from: "S", to: "A", weight: 1 }],
  title: L("Disconnected goal", "Đích không kết nối"),
  purpose: L("Show that an empty frontier means no path rather than a fabricated result.", "Cho thấy frontier rỗng nghĩa là không có đường đi thay vì dựng ra kết quả."),
};
const inadmissibleFixture: GraphFixture = {
  id: "inadmissible", directed: false, startId: "S", goalId: "G",
  nodes: [
    { id: "S", label: "Start", x: 8, y: 50, heuristic: 6 }, { id: "A", label: "A", x: 42, y: 22, heuristic: 0 },
    { id: "B", label: "B", x: 42, y: 78, heuristic: 10 }, { id: "G", label: "Goal", x: 86, y: 50, heuristic: 0 },
  ],
  edges: [
    { id: "e-sa", from: "S", to: "A", weight: 2 }, { id: "e-ag", from: "A", to: "G", weight: 8 },
    { id: "e-sb", from: "S", to: "B", weight: 4 }, { id: "e-bg", from: "B", to: "G", weight: 2 },
  ],
  title: L("Unreliable heuristic", "Heuristic không phù hợp"),
  purpose: L("Demonstrate why an arbitrary overestimate cannot support an optimality claim.", "Minh họa vì sao một ước lượng quá cao tùy ý không thể hỗ trợ tuyên bố tối ưu."),
};

export const dijkstraFixtures: Readonly<Record<SearchFixtureId, GraphFixture>> = deepFreeze({ primary: primaryFixture, tie: tieFixture, unreachable: unreachableFixture });
export const aStarFixtures: Readonly<Record<AStarFixtureId, GraphFixture>> = deepFreeze({ primary: primaryFixture, tie: tieFixture, inadmissible: inadmissibleFixture });

function keys<T>(record: Readonly<Record<string, T>>) { return Object.keys(record).sort((a, b) => a.localeCompare(b)); }
function mapNodes<T>(fixture: GraphFixture, value: (node: GraphNode) => T): Record<string, T> { return Object.fromEntries(fixture.nodes.map(node => [node.id, value(node)])); }
function copyState(state: SearchState, patch: Partial<SearchState>): SearchState {
  return { ...state, ...patch, predecessors: { ...state.predecessors, ...(patch.predecessors ?? {}) }, distances: { ...state.distances, ...(patch.distances ?? {}) }, gScores: { ...state.gScores, ...(patch.gScores ?? {}) }, hScores: { ...state.hScores, ...(patch.hScores ?? {}) }, fScores: { ...state.fScores, ...(patch.fScores ?? {}) } };
}
function adjacency(fixture: GraphFixture, nodeId: string) {
  const result: { nodeId: string; edge: GraphEdge }[] = [];
  for (const edge of fixture.edges) {
    if (edge.from === nodeId) result.push({ nodeId: edge.to, edge });
    if (!fixture.directed && edge.to === nodeId) result.push({ nodeId: edge.from, edge });
  }
  return result.sort((a, b) => a.nodeId.localeCompare(b.nodeId) || a.edge.id.localeCompare(b.edge.id));
}
function reconstruct(predecessors: Readonly<Record<string, string | null>>, start: string, goal: string) {
  const path: string[] = [];
  let cursor: string | null = goal;
  const seen = new Set<string>();
  while (cursor) {
    if (seen.has(cursor)) throw new RangeError("Malformed predecessor chain");
    seen.add(cursor); path.unshift(cursor);
    if (cursor === start) return path;
    cursor = predecessors[cursor] ?? null;
  }
  return [];
}
function searchStep(id: string, event: string, title: Localized, action: Localized, why: Localized, outcome: Localized, before: SearchState, after: SearchState): TraceStep<SearchState> {
  return { id, event, title, action, why, outcome, before, after };
}

export function dijkstraTrace(fixtureId: SearchFixtureId): SearchTrace {
  const fixture = dijkstraFixtures[fixtureId];
  if (!fixture) throw new RangeError(`Unknown Dijkstra fixture: ${fixtureId}`);
  validateGraphFixture(fixture);
  const distances = mapNodes<number | null>(fixture, () => null); distances[fixture.startId] = 0;
  let state: SearchState = {
    phase: "initialised", currentNodeId: null, candidateEdgeId: null, candidateDecision: "not-considered", frontierIds: [fixture.startId],
    predecessors: mapNodes(fixture, () => null), selectedOrder: [], path: [], totalCost: null, distances, settledIds: [],
    gScores: mapNodes(fixture, () => null), hScores: mapNodes(fixture, () => null), fScores: mapNodes(fixture, () => null), openIds: [], closedIds: [], terminalStatus: null,
  };
  const initial = state;
  const steps: TraceStep<SearchState>[] = [];
  steps.push(searchStep("initialise", "initialise", L("Initialise distances", "Khởi tạo khoảng cách"), L("Set S to 0 and every other distance to unset.", "Đặt S bằng 0 và mọi khoảng cách khác là chưa xác định."), L("The start is the only known frontier node.", "Điểm đầu là nút frontier duy nhất đã biết."), L("Frontier: S; no predecessor is assigned.", "Frontier: S; chưa gán predecessor."), state, state));
  let counter = 0;
  while (true) {
    const candidates = keys(state.distances).filter(id => !state.settledIds.includes(id) && state.distances[id] !== null).sort((a, b) => (state.distances[a] as number) - (state.distances[b] as number) || a.localeCompare(b));
    if (!candidates.length) {
      const after = copyState(state, { phase: "no-path", currentNodeId: null, candidateEdgeId: null, frontierIds: [], terminalStatus: "no-path" });
      steps.push(searchStep("no-path", "no-path", L("Frontier is empty", "Frontier đã rỗng"), L("Stop without inventing a route.", "Dừng mà không dựng ra tuyến đường."), L("Every reachable node is settled but the goal is not.", "Mọi nút có thể tới đã được settled nhưng chưa tới đích."), L("No path exists in this fixture.", "Không có đường đi trong fixture này."), state, after)); state = after; break;
    }
    const current = candidates[0];
    let after = copyState(state, { phase: "selected", currentNodeId: current, candidateEdgeId: null, candidateDecision: "not-considered", selectedOrder: [...state.selectedOrder, current], frontierIds: candidates.slice(1) });
    steps.push(searchStep(`select-${counter}-${current}`, "select-node", L(`Select ${current}`, `Chọn ${current}`), L("Choose the unsettled node with the smallest cumulative distance.", "Chọn nút chưa settled có khoảng cách tích lũy nhỏ nhất."), L("Dijkstra uses distance only; equal values use node ID.", "Dijkstra chỉ dùng khoảng cách; giá trị bằng nhau dùng ID nút."), L(`${current} becomes the current node at cost ${after.distances[current]}.`, `${current} trở thành nút hiện tại với chi phí ${after.distances[current]}.`), state, after)); state = after;
    if (current === fixture.goalId) {
      const path = reconstruct(state.predecessors, fixture.startId, fixture.goalId);
      after = copyState(state, { phase: "complete", path, totalCost: state.distances[current], settledIds: [...state.settledIds, current], currentNodeId: null, terminalStatus: "path-found" });
      steps.push(searchStep("complete-path", "complete-path", L("Reconstruct the shortest path", "Dựng lại đường ngắn nhất"), L("Follow predecessors from G back to S.", "Theo predecessor từ G ngược về S."), L("Each predecessor records the accepted lower-cost route.", "Mỗi predecessor ghi tuyến chi phí thấp hơn đã được chấp nhận."), L(`Path ${path.join(" → ")} has total cost ${after.totalCost}.`, `Đường ${path.join(" → ")} có tổng chi phí ${after.totalCost}.`), state, after)); state = after; break;
    }
    for (const { nodeId, edge } of adjacency(fixture, current)) {
      const before = state;
      if (state.settledIds.includes(nodeId)) {
        after = copyState(state, { phase: "considered", candidateEdgeId: edge.id, candidateDecision: "skipped-settled" });
      } else {
        const candidate = (state.distances[current] as number) + edge.weight;
        const existing = state.distances[nodeId];
        const decision = existing === null || candidate < existing ? "accepted" : candidate === existing ? "rejected-equal" : "rejected-higher";
        const nextDistances = { ...state.distances }; const nextPredecessors = { ...state.predecessors };
        if (decision === "accepted") { nextDistances[nodeId] = candidate; nextPredecessors[nodeId] = current; }
        const frontierIds = keys(nextDistances)
          .filter(id => id !== current && !state.settledIds.includes(id) && nextDistances[id] !== null)
          .sort((a, b) => (nextDistances[a] as number) - (nextDistances[b] as number) || a.localeCompare(b));
        after = copyState(state, {
          phase: "considered",
          candidateEdgeId: edge.id,
          candidateDecision: decision,
          distances: nextDistances,
          predecessors: nextPredecessors,
          frontierIds,
        });
      }
      const value = after.distances[nodeId];
      const decisionCopy = searchDecisionCopy[after.candidateDecision];
      steps.push(searchStep(`edge-${counter}-${edge.id}`, "consider-edge", L(`Consider ${edge.id}`, `Xét ${edge.id}`), L(`Test the route through ${current}.`, `Thử tuyến đi qua ${current}.`), L("Replace a working value only when the new cumulative cost is strictly lower.", "Chỉ thay working value khi chi phí tích lũy mới thấp hơn nghiêm ngặt."), L(`${nodeId}: ${decisionCopy.en}; distance ${value ?? "unset"}.`, `${nodeId}: ${decisionCopy.vi}; khoảng cách ${value ?? "chưa xác định"}.`), before, after)); state = after; counter += 1;
    }
    const settledIds = [...state.settledIds, current];
    const frontierIds = keys(state.distances).filter(id => !settledIds.includes(id) && state.distances[id] !== null).sort((a, b) => (state.distances[a] as number) - (state.distances[b] as number) || a.localeCompare(b));
    after = copyState(state, { phase: "settled", currentNodeId: null, candidateEdgeId: null, candidateDecision: "not-considered", settledIds, frontierIds });
    steps.push(searchStep(`settle-${current}`, "settle-node", L(`Settle ${current}`, `Chốt ${current}`), L("Make the smallest working value final.", "Đặt working value nhỏ nhất thành final."), L("Positive weights mean this distance will not need reopening.", "Trọng số dương nghĩa là không cần mở lại khoảng cách này."), L(`${current} joins the settled set.`, `${current} vào tập settled.`), state, after)); state = after; counter += 1;
  }
  return deepFreeze({ fixtureId, algorithm: "dijkstra", fixture, initial, steps, final: { ...state, status: state.terminalStatus as "path-found" | "no-path", cost: state.totalCost } });
}

export function aStarTrace(fixtureId: AStarFixtureId): SearchTrace {
  const fixture = aStarFixtures[fixtureId];
  if (!fixture) throw new RangeError(`Unknown A* fixture: ${fixtureId}`);
  validateGraphFixture(fixture, Object.fromEntries(fixture.nodes.map(node => [node.id, node.heuristic as number])));
  const gScores = mapNodes<number | null>(fixture, () => null); gScores[fixture.startId] = 0;
  const hScores = mapNodes<number | null>(fixture, node => node.heuristic ?? null);
  if (Object.values(hScores).some(value => value === null || !Number.isFinite(value) || value < 0)) throw new RangeError("A* requires finite non-negative heuristics");
  const fScores = mapNodes<number | null>(fixture, () => null); fScores[fixture.startId] = hScores[fixture.startId];
  let state: SearchState = {
    phase: "initialised", currentNodeId: null, candidateEdgeId: null, candidateDecision: "not-considered", frontierIds: [fixture.startId],
    predecessors: mapNodes(fixture, () => null), selectedOrder: [], path: [], totalCost: null, distances: mapNodes(fixture, () => null), settledIds: [],
    gScores, hScores, fScores, openIds: [fixture.startId], closedIds: [], terminalStatus: null,
  };
  const initial = state; const steps: TraceStep<SearchState>[] = [];
  steps.push(searchStep("initialise", "initialise", L("Initialise g, h and f", "Khởi tạo g, h và f"), L("Set g(S)=0 and f(S)=g+h.", "Đặt g(S)=0 và f(S)=g+h."), L("A* keeps path cost and heuristic estimate separate.", "A* giữ riêng chi phí đường đi và ước lượng heuristic."), L(`Open: S; f(S)=${fScores[fixture.startId]}.`, `Open: S; f(S)=${fScores[fixture.startId]}.`), state, state));
  let counter = 0;
  while (state.openIds.length) {
    const open = [...state.openIds].sort((a, b) => (state.fScores[a] as number) - (state.fScores[b] as number) || a.localeCompare(b));
    const current = open[0];
    let after = copyState(state, { phase: "selected", currentNodeId: current, selectedOrder: [...state.selectedOrder, current], openIds: open.slice(1), frontierIds: open.slice(1), candidateEdgeId: null, candidateDecision: "not-considered" });
    steps.push(searchStep(`select-${counter}-${current}`, "select-node", L(`Select ${current}`, `Chọn ${current}`), L("Choose the open node with the smallest f; use node ID on a tie.", "Chọn nút open có f nhỏ nhất; dùng ID nút khi hòa."), L("f combines known path cost g with estimate h.", "f kết hợp chi phí đã biết g với ước lượng h."), L(`${current}: g=${after.gScores[current]}, h=${after.hScores[current]}, f=${after.fScores[current]}.`, `${current}: g=${after.gScores[current]}, h=${after.hScores[current]}, f=${after.fScores[current]}.`), state, after)); state = after;
    if (current === fixture.goalId) {
      const path = reconstruct(state.predecessors, fixture.startId, fixture.goalId);
      const claim = fixtureId === "inadmissible" ? "none-inadmissible-boundary-demo" : "optimal-under-reviewed-admissible-consistent-heuristic";
      const claimText = fixtureId === "inadmissible" ? L("No optimality claim: this fixture deliberately overestimates.", "Không tuyên bố tối ưu: fixture này cố ý ước lượng quá cao.") : L("Optimal for this reviewed admissible/consistent fixture.", "Tối ưu cho fixture admissible/consistent đã duyệt này.");
      after = copyState(state, { phase: "complete", path, totalCost: state.gScores[current], currentNodeId: null, terminalStatus: "path-found" });
      steps.push(searchStep("complete-path", "complete-path", L("Reconstruct the selected route", "Dựng lại tuyến đã chọn"), L("Follow predecessors from G to S.", "Theo predecessor từ G về S."), claimText, L(`Path ${path.join(" → ")} costs ${after.totalCost}.`, `Đường ${path.join(" → ")} có chi phí ${after.totalCost}.`), state, after)); state = after;
      return deepFreeze({
        fixtureId,
        algorithm: "astar",
        fixture,
        initial,
        steps,
        final: {
          ...state,
          status: "path-found",
          cost: state.totalCost,
          optimalityClaim: claim,
          ...(fixtureId === "inadmissible"
            ? { referenceShortestPath: ["S", "B", "G"] as const, referenceShortestCost: 6 }
            : {}),
        },
      });
    }
    for (const { nodeId, edge } of adjacency(fixture, current)) {
      const before = state;
      if (state.closedIds.includes(nodeId)) {
        after = copyState(state, { phase: "considered", candidateEdgeId: edge.id, candidateDecision: "skipped-settled" });
      } else {
        const candidate = (state.gScores[current] as number) + edge.weight;
        const existing = state.gScores[nodeId];
        const decision = existing === null || candidate < existing ? "accepted" : candidate === existing ? "rejected-equal" : "rejected-higher";
        const nextG = { ...state.gScores }; const nextF = { ...state.fScores }; const nextPred = { ...state.predecessors }; const nextOpen = [...state.openIds];
        if (decision === "accepted") { nextG[nodeId] = candidate; nextF[nodeId] = candidate + (state.hScores[nodeId] as number); nextPred[nodeId] = current; if (!nextOpen.includes(nodeId)) nextOpen.push(nodeId); }
        after = copyState(state, { phase: "considered", candidateEdgeId: edge.id, candidateDecision: decision, gScores: nextG, fScores: nextF, predecessors: nextPred, openIds: nextOpen.sort(), frontierIds: nextOpen.sort() });
      }
      const decisionCopy = searchDecisionCopy[after.candidateDecision];
      steps.push(searchStep(`edge-${counter}-${edge.id}`, "consider-edge", L(`Consider ${edge.id}`, `Xét ${edge.id}`), L(`Calculate a candidate g through ${current}, then f=g+h.`, `Tính g ứng viên qua ${current}, rồi f=g+h.`), L("Equal or higher g does not replace the existing predecessor.", "g bằng hoặc cao hơn không thay predecessor hiện có."), L(`${nodeId}: ${decisionCopy.en}; g=${after.gScores[nodeId] ?? "unset"}, h=${after.hScores[nodeId]}, f=${after.fScores[nodeId] ?? "unset"}.`, `${nodeId}: ${decisionCopy.vi}; g=${after.gScores[nodeId] ?? "chưa xác định"}, h=${after.hScores[nodeId]}, f=${after.fScores[nodeId] ?? "chưa xác định"}.`), before, after)); state = after; counter += 1;
    }
    after = copyState(state, { phase: "closed", currentNodeId: null, candidateEdgeId: null, candidateDecision: "not-considered", closedIds: [...state.closedIds, current] });
    steps.push(searchStep(`close-${current}`, "close-node", L(`Close ${current}`, `Đóng ${current}`), L("Finish expanding the current node.", "Hoàn tất mở rộng nút hiện tại."), L("Its outgoing candidates have now been tested.", "Các ứng viên đi ra từ nút đã được kiểm tra."), L(`${current} moves to closed.`, `${current} chuyển sang closed.`), state, after)); state = after; counter += 1;
  }
  const after = copyState(state, { phase: "no-path", terminalStatus: "no-path", frontierIds: [] });
  steps.push(searchStep("no-path", "no-path", L("Open set is empty", "Tập open đã rỗng"), L("Stop without a route.", "Dừng mà không có tuyến."), L("The goal was never selected.", "Đích chưa từng được chọn."), L("No path exists.", "Không có đường đi."), state, after));
  return deepFreeze({ fixtureId, algorithm: "astar", fixture, initial, steps, final: { ...after, status: "no-path", cost: null, optimalityClaim: "no-route" } });
}

export function validateGraphFixture(graph: GraphFixture, heuristics?: Readonly<Record<string, number>>): true {
  if (!graph || typeof graph.id !== "string" || !graph.id || typeof graph.directed !== "boolean" || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) throw new RangeError("Malformed graph fixture");
  const nodeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (!/^[A-Za-z0-9_-]+$/.test(node.id) || nodeIds.has(node.id)) throw new RangeError("Graph node IDs must be unique non-empty ASCII identifiers");
    if (typeof node.label !== "string" || !node.label.trim() || !Number.isFinite(node.x) || !Number.isFinite(node.y)) throw new RangeError("Graph nodes require a non-empty label and finite renderer coordinates");
    nodeIds.add(node.id);
  }
  if (!nodeIds.has(graph.startId) || !nodeIds.has(graph.goalId)) throw new RangeError("Graph start and goal must exist");
  const edgeIds = new Set<string>(); const endpointPairs = new Set<string>();
  for (const edge of graph.edges) {
    if (!edge.id || edgeIds.has(edge.id) || !nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new RangeError("Malformed graph edge");
    if (edge.from === edge.to || !Number.isFinite(edge.weight) || edge.weight < 0) throw new RangeError("Graph edges require distinct endpoints and finite non-negative weights");
    edgeIds.add(edge.id);
    const pair = graph.directed ? `${edge.from}>${edge.to}` : [edge.from, edge.to].sort().join("~");
    if (endpointPairs.has(pair)) throw new RangeError("Parallel graph edges are not supported");
    endpointPairs.add(pair);
  }
  if (heuristics) for (const id of nodeIds) if (!Number.isFinite(heuristics[id]) || heuristics[id] < 0) throw new RangeError("A* requires a finite non-negative heuristic for every node");
  return true;
}

interface LearningScenario {
  readonly id: LearningScenarioId;
  readonly title: Localized;
  readonly data: Localized;
  readonly labelsOrTargets: string;
  readonly environmentInteraction: boolean;
  readonly feedbackType: "continuous-target" | "no-target-pattern" | "reward-penalty" | "target-label";
  readonly requiredOutcome: string;
  readonly expectedCategory: "supervised" | "unsupervised" | "reinforcement";
  readonly nearMissCategory: string;
  readonly nearMissReason: Localized;
}

export const learningScenarios: Readonly<Record<LearningScenarioId, LearningScenario>> = deepFreeze({
  "labelled-energy-regression": { id: "labelled-energy-regression", title: L("Labelled energy-use pairs", "Các cặp mức dùng năng lượng đã gắn mục tiêu"), data: L("Every training example supplies a continuous energy-use target.", "Mỗi ví dụ huấn luyện cung cấp mục tiêu mức dùng năng lượng liên tục."), labelsOrTargets: "continuous energy-use target supplied for every labelled training example", environmentInteraction: false, feedbackType: "continuous-target", requiredOutcome: "predict a continuous energy-use value", expectedCategory: "supervised", nearMissCategory: "classification", nearMissReason: L("The supplied numeric target makes this supervised regression, not class prediction.", "Mục tiêu số được cung cấp làm đây là hồi quy có giám sát, không phải dự đoán lớp.") },
  "unlabelled-shopper-groups": { id: "unlabelled-shopper-groups", title: L("Unlabelled shopper groups", "Nhóm người mua không nhãn"), data: L("Purchase behaviour has no expected group for each shopper.", "Hành vi mua hàng không có nhóm kỳ vọng cho từng người mua."), labelsOrTargets: "none", environmentInteraction: false, feedbackType: "no-target-pattern", requiredOutcome: "discover shopper groups with similar behaviour", expectedCategory: "unsupervised", nearMissCategory: "supervised", nearMissReason: L("No expected group label is supplied for each shopper.", "Không có nhãn nhóm kỳ vọng được cung cấp cho từng người mua.") },
  "warehouse-agent-reward": { id: "warehouse-agent-reward", title: L("Warehouse agent reward loop", "Vòng phản hồi agent kho hàng"), data: L("The agent acts in the environment and receives reward or penalty after each action.", "Agent hành động trong môi trường và nhận thưởng hoặc phạt sau mỗi hành động."), labelsOrTargets: "no correct action label for each state", environmentInteraction: true, feedbackType: "reward-penalty", requiredOutcome: "learn actions that increase cumulative reward", expectedCategory: "reinforcement", nearMissCategory: "supervised", nearMissReason: L("The agent receives reward or penalty after action, not a correct label for every state.", "Agent nhận thưởng hoặc phạt sau hành động, không phải nhãn đúng cho từng trạng thái.") },
  "labelled-robot-images": { id: "labelled-robot-images", title: L("Labelled robot images", "Ảnh robot đã gắn nhãn"), data: L("Every training image supplies its robot class; no agent acts in an environment.", "Mỗi ảnh huấn luyện cung cấp lớp robot; không có agent hành động trong môi trường."), labelsOrTargets: "class label supplied for every robot image", environmentInteraction: false, feedbackType: "target-label", requiredOutcome: "predict the robot class for a new image", expectedCategory: "supervised", nearMissCategory: "reinforcement", nearMissReason: L("The word robot does not make the task reinforcement learning; there is no acting agent/environment reward loop.", "Từ robot không làm nhiệm vụ thành học tăng cường; không có vòng agent hành động/phần thưởng môi trường.") },
});

const learningLabelsCopy: Readonly<Record<string, Localized>> = {
  "continuous energy-use target supplied for every labelled training example": L("a continuous energy-use target for every labelled example", "mục tiêu mức dùng năng lượng liên tục cho từng ví dụ có nhãn"),
  none: L("none", "không có"),
  "no correct action label for each state": L("no correct-action label for each state", "không có nhãn hành động đúng cho từng trạng thái"),
  "class label supplied for every robot image": L("a class label for every robot image", "nhãn lớp cho từng ảnh robot"),
};
const learningFeedbackCopy: Readonly<Record<LearningScenario["feedbackType"], Localized>> = {
  "continuous-target": L("continuous target", "mục tiêu liên tục"),
  "no-target-pattern": L("patterns without supplied targets", "mẫu không có mục tiêu được cung cấp"),
  "reward-penalty": L("reward or penalty", "thưởng hoặc phạt"),
  "target-label": L("target class label", "nhãn lớp mục tiêu"),
};
const learningOutcomeCopy: Readonly<Record<string, Localized>> = {
  "predict a continuous energy-use value": L("predict a continuous energy-use value", "dự đoán một giá trị mức dùng năng lượng liên tục"),
  "discover shopper groups with similar behaviour": L("discover shopper groups with similar behaviour", "khám phá các nhóm người mua có hành vi tương tự"),
  "learn actions that increase cumulative reward": L("learn actions that increase cumulative reward", "học các hành động làm tăng phần thưởng tích lũy"),
  "predict the robot class for a new image": L("predict the robot class for a new image", "dự đoán lớp robot cho một ảnh mới"),
};
const learningCategoryCopy: Readonly<Record<LearningScenario["expectedCategory"], Localized>> = {
  supervised: L("supervised learning", "học có giám sát"),
  unsupervised: L("unsupervised learning", "học không giám sát"),
  reinforcement: L("reinforcement learning", "học tăng cường"),
};

export interface LearningCategoryTrace {
  readonly scenarioId: LearningScenarioId;
  readonly scenario: LearningScenario;
  readonly steps: readonly TraceStep<LearningScenario>[];
  readonly final: LearningScenario;
}
export function learningCategoryTrace(scenarioId: LearningScenarioId): LearningCategoryTrace {
  const scenario = learningScenarios[scenarioId]; if (!scenario) throw new RangeError(`Unknown learning scenario: ${scenarioId}`);
  const labelsCopy = learningLabelsCopy[scenario.labelsOrTargets];
  const feedbackCopy = learningFeedbackCopy[scenario.feedbackType];
  const outcomeCopy = learningOutcomeCopy[scenario.requiredOutcome];
  const categoryCopy = learningCategoryCopy[scenario.expectedCategory];
  const steps = [
    { id: "inspect-data", event: "inspect", title: L("Inspect the examples", "Kiểm tra các ví dụ"), action: scenario.data, why: L("The available feedback decides the category.", "Phản hồi có sẵn quyết định hình thức học."), outcome: L(`Labels/targets: ${labelsCopy.en}.`, `Nhãn/mục tiêu: ${labelsCopy.vi}.`), before: scenario, after: scenario },
    { id: "check-interaction", event: "inspect", title: L("Check the feedback loop", "Kiểm tra vòng phản hồi"), action: L(scenario.environmentInteraction ? "Observe agent actions and environment feedback." : "Confirm that examples are processed without an agent acting in an environment.", scenario.environmentInteraction ? "Quan sát hành động agent và phản hồi môi trường." : "Xác nhận ví dụ được xử lý mà không có agent hành động trong môi trường."), why: L("Reward/penalty interaction distinguishes reinforcement learning.", "Tương tác thưởng/phạt phân biệt học tăng cường."), outcome: L(`Feedback: ${feedbackCopy.en}.`, `Phản hồi: ${feedbackCopy.vi}.`), before: scenario, after: scenario },
    { id: "classify", event: "decide", title: L("Choose the learning category", "Chọn hình thức học"), action: L(`Select ${categoryCopy.en}.`, `Chọn ${categoryCopy.vi}.`), why: scenario.nearMissReason, outcome: L(`Required outcome: ${outcomeCopy.en}.`, `Đầu ra cần có: ${outcomeCopy.vi}.`), before: scenario, after: scenario },
  ];
  return deepFreeze({ scenarioId, scenario, steps, final: scenario });
}

export interface NeuralConnection {
  readonly id: string;
  readonly fromLayerId: string;
  readonly fromNodeId: string;
  readonly toLayerId: string;
  readonly toNodeId: string;
  readonly weight: number;
}

export interface NeuralWeightedContribution {
  readonly sourceNodeId: string;
  readonly sourceValue: number;
  readonly weight: number;
  readonly contribution: number;
}

export interface NeuralNodeCalculation {
  readonly nodeId: string;
  readonly layerId: string;
  readonly bias: number;
  readonly contributions: readonly NeuralWeightedContribution[];
  readonly weightedSum: number;
  readonly activation: "identity" | "relu";
  readonly activationOutput: number;
}

export interface NeuralLayerState {
  readonly id: string;
  readonly values: readonly number[];
  readonly note: Localized;
}

export interface NeuralState {
  readonly mode: "inference";
  readonly depth: "shallow" | "deep";
  readonly inputs: readonly number[];
  readonly layers: readonly NeuralLayerState[];
  readonly connections: readonly NeuralConnection[];
  readonly nodeCalculations: readonly NeuralNodeCalculation[];
  readonly output: number | null;
  readonly prediction: number | null;
  readonly predictedClass: "positive" | "negative" | null;
  readonly weightsChanged: false;
}

interface NeuralLayerDefinition {
  readonly id: string;
  readonly weights: readonly (readonly number[])[];
  readonly biases: readonly number[];
  readonly activation: "identity" | "relu";
  readonly note: Localized;
}

export interface NeuralInferenceTrace { readonly depth: "shallow" | "deep"; readonly inputPreset: "standard" | "alternate"; readonly steps: readonly TraceStep<NeuralState>[]; readonly final: NeuralState; }
export function neuralInferenceTrace(depth: "shallow" | "deep", inputPreset: "standard" | "alternate"): NeuralInferenceTrace {
  if (!(["shallow", "deep"] as const).includes(depth)) throw new RangeError(`Unknown neural depth: ${depth}`);
  if (!(["standard", "alternate"] as const).includes(inputPreset)) throw new RangeError(`Unknown neural input preset: ${inputPreset}`);
  const inputs = inputPreset === "standard" ? [0.8, 0.6] : [0.3, 0.4];
  const definitions: readonly NeuralLayerDefinition[] = depth === "shallow"
    ? [{ id: "output", weights: [[0.7, 0.4]], biases: [-0.2], activation: "identity", note: L("Linear weighted score", "Điểm tuyến tính có trọng số") }]
    : [
      { id: "hidden-1", weights: [[0.7, 0.4], [0.2, 0.8]], biases: [-0.2, -0.1], activation: "relu", note: L("Weighted sums followed by ReLU", "Tổng có trọng số rồi qua ReLU") },
      { id: "hidden-2", weights: [[0.6, 0.5]], biases: [-0.1], activation: "relu", note: L("Second learned representation", "Biểu diễn học được thứ hai") },
      { id: "output", weights: [[1]], biases: [0], activation: "identity", note: L("Linear output score", "Điểm đầu ra tuyến tính") },
    ];
  const layers: NeuralLayerState[] = [{ id: "input", values: inputs, note: L("Selected edge-density and symmetry inputs", "Đầu vào mật độ cạnh và đối xứng đã chọn") }];
  const connections: NeuralConnection[] = [];
  const nodeCalculations: NeuralNodeCalculation[] = [];
  let previousLayerId = "input";
  let previousValues: readonly number[] = inputs;
  for (const definition of definitions) {
    const layerCalculations = definition.weights.map((weights, nodeIndex) => {
      if (weights.length !== previousValues.length) throw new RangeError(`Neural fixture ${definition.id} has an invalid weight row`);
      const nodeId = `${definition.id}-${nodeIndex + 1}`;
      const contributions = weights.map((weight, sourceIndex) => {
        const sourceNodeId = `${previousLayerId}-${sourceIndex + 1}`;
        connections.push({ id: `${sourceNodeId}->${nodeId}`, fromLayerId: previousLayerId, fromNodeId: sourceNodeId, toLayerId: definition.id, toNodeId: nodeId, weight });
        return { sourceNodeId, sourceValue: previousValues[sourceIndex], weight, contribution: round(previousValues[sourceIndex] * weight) };
      });
      const weightedSum = round(contributions.reduce((sum, item) => sum + item.contribution, definition.biases[nodeIndex]));
      const activationOutput = round(definition.activation === "relu" ? Math.max(0, weightedSum) : weightedSum);
      return { nodeId, layerId: definition.id, bias: definition.biases[nodeIndex], contributions, weightedSum, activation: definition.activation, activationOutput } satisfies NeuralNodeCalculation;
    });
    const values = layerCalculations.map(item => item.activationOutput);
    nodeCalculations.push(...layerCalculations);
    layers.push({ id: definition.id, values, note: definition.note });
    previousLayerId = definition.id;
    previousValues = values;
  }
  const output = previousValues[0];
  const predictedClass = output >= 0.5 ? "positive" : "negative";
  const empty: NeuralState = { mode: "inference", depth, inputs, layers: [], connections, nodeCalculations: [], output: null, prediction: null, predictedClass: null, weightsChanged: false };
  const states: NeuralState[] = [];
  for (let i = 0; i < layers.length; i += 1) {
    const visibleLayerIds = new Set(layers.slice(0, i + 1).map(layer => layer.id));
    states.push({ ...empty, layers: layers.slice(0, i + 1), nodeCalculations: nodeCalculations.filter(item => visibleLayerIds.has(item.layerId)) });
  }
  states.push({ ...empty, layers, nodeCalculations, output, prediction: output, predictedClass });
  const titles = depth === "shallow" ? [L("Read the inputs", "Đọc đầu vào"), L("Calculate the output score", "Tính điểm đầu ra"), L("Apply the threshold", "Áp dụng ngưỡng")] : [L("Read the inputs", "Đọc đầu vào"), L("Activate hidden layer 1", "Kích hoạt lớp ẩn 1"), L("Activate hidden layer 2", "Kích hoạt lớp ẩn 2"), L("Calculate the output score", "Tính điểm đầu ra"), L("Apply the threshold", "Áp dụng ngưỡng")];
  const predictedClassVi = predictedClass === "positive" ? "dương" : "âm";
  const steps = states.map((after, index) => ({ id: index === states.length - 1 ? "prediction" : layers[index]?.id ?? `layer-${index}`, event: "forward", title: titles[index], action: L("Move values forward through fixed weighted connections.", "Đưa giá trị tiến về trước qua các kết nối trọng số cố định."), why: L("Inference uses learned weights; it does not run backpropagation.", "Suy luận dùng trọng số đã học; không chạy lan truyền ngược."), outcome: index === states.length - 1 ? L(`Score ${output}; class ${predictedClass}.`, `Điểm ${output}; lớp ${predictedClassVi}.`) : layers[index].note, before: index ? states[index - 1] : empty, after }));
  return deepFreeze({ depth, inputPreset, steps, final: states[states.length - 1] });
}

export interface BackpropState { readonly mode: "training"; readonly iteration: number; readonly input: number; readonly target: number; readonly learningRate: number; readonly oldWeight: number; readonly newWeight: number | null; readonly oldPrediction: number | null; readonly newPrediction: number | null; readonly oldError: number | null; readonly newError: number | null; readonly oldSquaredError: number | null; readonly newSquaredError: number | null; readonly direction: "forward" | "backward" | "compare"; readonly errorReduced: boolean | null; }
export interface BackpropTrace { readonly scenarioId: "bp01" | "bp02"; readonly steps: readonly TraceStep<BackpropState>[]; readonly final: BackpropState; }
export function backpropagationTrace(scenarioId: "bp01" | "bp02"): BackpropTrace {
  if (!(["bp01", "bp02"] as const).includes(scenarioId)) throw new RangeError(`Unknown backpropagation scenario: ${scenarioId}`);
  const input = scenarioId === "bp01" ? 2 : 1, oldWeight = scenarioId === "bp01" ? 0.2 : 0.8, target = scenarioId === "bp01" ? 1 : 0, learningRate = scenarioId === "bp01" ? 0.1 : 0.25;
  const oldPrediction = round(input * oldWeight), oldError = round(target - oldPrediction), oldSquaredError = round(oldError ** 2);
  const newWeight = round(oldWeight + learningRate * oldError * input);
  const newPrediction = round(input * newWeight), newError = round(target - newPrediction), newSquaredError = round(newError ** 2);
  const base: BackpropState = { mode: "training", iteration: 1, input, target, learningRate, oldWeight, newWeight: null, oldPrediction: null, newPrediction: null, oldError: null, newError: null, oldSquaredError: null, newSquaredError: null, direction: "forward", errorReduced: null };
  const predictionRead: BackpropState = { ...base, oldPrediction };
  const compared: BackpropState = { ...predictionRead, direction: "compare" };
  const errorCalculated: BackpropState = { ...compared, oldError, oldSquaredError };
  const backward: BackpropState = { ...errorCalculated, direction: "backward" };
  const adjusted: BackpropState = { ...backward, newWeight };
  const rerun: BackpropState = { ...adjusted, iteration: 2, direction: "forward", newPrediction };
  const final: BackpropState = { ...rerun, direction: "compare", newError, newSquaredError, errorReduced: newSquaredError < oldSquaredError };
  const states = [base, predictionRead, compared, errorCalculated, backward, adjusted, rerun, final];
  const ids = ["forward", "prediction", "compare", "error", "propagate", "adjust", "next-forward", "compare-after"];
  const titles = [L("Forward pass", "Lan truyền xuôi"), L("Read the prediction", "Đọc dự đoán"), L("Compare with target", "So sánh với mục tiêu"), L("Calculate the error", "Tính sai số"), L("Propagate error information backwards", "Lan truyền thông tin sai số ngược"), L("Adjust the selected weight", "Điều chỉnh trọng số đã chọn"), L("Run the next forward pass", "Chạy lần truyền xuôi tiếp theo"), L("Compare before and after", "So sánh trước và sau")];
  const steps = states.map((after, index) => ({ id: ids[index], event: ids[index], title: titles[index], action: index === 5 ? L(`Apply the declared toy update with learning rate ${learningRate}.`, `Áp dụng quy tắc cập nhật minh họa đã công bố với tốc độ học ${learningRate}.`) : L("Follow the declared teaching rule for this stage.", "Theo quy tắc dạy học đã công bố cho giai đoạn này."), why: index >= 4 ? L("Backward correction belongs to training, not inference.", "Hiệu chỉnh ngược thuộc huấn luyện, không thuộc suy luận.") : L("A prediction must exist before its error can guide an update.", "Phải có dự đoán trước khi sai số có thể hướng dẫn cập nhật."), outcome: index === 7 ? L(`Squared error ${oldSquaredError} → ${newSquaredError}; reduced: ${final.errorReduced}.`, `Sai số bình phương ${oldSquaredError} → ${newSquaredError}; đã giảm: ${final.errorReduced ? "có" : "không"}.`) : L(`Stage ${index + 1} complete.`, `Hoàn tất giai đoạn ${index + 1}.`), before: index ? states[index - 1] : base, after }));
  return deepFreeze({ scenarioId, steps, final });
}

export interface RegressionPoint { readonly x: number; readonly y: number; }
export type RegressionPointPreset = "baseline" | "moved" | "added";
export interface RegressionFitSummary { readonly slope: number; readonly intercept: number; readonly sse: number; }
export interface RegressionState { readonly datasetId: "energy"; readonly pointPreset: RegressionPointPreset; readonly changedPointId: "P4" | "P5" | null; readonly previousFit: RegressionFitSummary | null; readonly points: readonly RegressionPoint[]; readonly slope: number | null; readonly intercept: number | null; readonly fittedValues: readonly number[]; readonly residuals: readonly number[]; readonly sse: number | null; readonly predictionX: number; readonly predictionY: number | null; readonly observedRange: readonly [number, number]; readonly extrapolation: boolean; readonly outputType: "continuous"; readonly stage: "inspect" | "fit" | "predict"; }
export interface RegressionTrace { readonly datasetId: "energy"; readonly pointPreset: RegressionPointPreset; readonly steps: readonly TraceStep<RegressionState>[]; readonly final: RegressionState; }

function fitRegressionPoints(points: readonly RegressionPoint[]) {
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length, meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0); if (Math.abs(denominator) < 1e-9) throw new RangeError("Regression requires variation in x");
  const slope = round(points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator), intercept = round(meanY - slope * meanX);
  const fittedValues = points.map(point => round(slope * point.x + intercept)), residuals = points.map((point, i) => round(point.y - fittedValues[i])), sse = round(residuals.reduce((sum, value) => sum + value ** 2, 0));
  return { slope, intercept, fittedValues, residuals, sse };
}

export function regressionTrace(datasetId: "energy", predictionX: number, pointPreset: RegressionPointPreset = "baseline"): RegressionTrace {
  if (datasetId !== "energy") throw new RangeError(`Unknown regression dataset: ${datasetId}`);
  if (!Number.isFinite(predictionX)) throw new RangeError("Prediction input must be finite");
  if (predictionX < 0 || predictionX > 7) throw new RangeError("Prediction input must stay within the visual domain [0, 7]");
  if (!(["baseline", "moved", "added"] as const).includes(pointPreset)) throw new RangeError(`Unknown regression point preset: ${pointPreset}`);
  const baseline: RegressionPoint[] = [{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 6 }, { x: 4, y: 10 }];
  const points: RegressionPoint[] = pointPreset === "moved" ? baseline.map((point, index) => index === 3 ? { x: 4, y: 8 } : point) : pointPreset === "added" ? [...baseline, { x: 5, y: 12 }] : baseline;
  const baselineFit = fitRegressionPoints(baseline);
  const { slope, intercept, fittedValues, residuals, sse } = pointPreset === "baseline" ? baselineFit : fitRegressionPoints(points);
  const observedRange: [number, number] = [Math.min(...points.map(point => point.x)), Math.max(...points.map(point => point.x))];
  const changedPointId = pointPreset === "moved" ? "P4" as const : pointPreset === "added" ? "P5" as const : null;
  const previousFit: RegressionFitSummary | null = pointPreset === "baseline" ? null : { slope: baselineFit.slope, intercept: baselineFit.intercept, sse: baselineFit.sse };
  const shared = { datasetId, pointPreset, changedPointId, previousFit, points, predictionX, observedRange, extrapolation: predictionX < observedRange[0] || predictionX > observedRange[1], outputType: "continuous" as const };
  const inspect: RegressionState = { ...shared, slope: null, intercept: null, fittedValues: [], residuals: [], sse: null, predictionY: null, stage: "inspect" };
  const fitted: RegressionState = { ...shared, slope, intercept, fittedValues, residuals, sse, predictionY: null, stage: "fit" };
  const final: RegressionState = { ...fitted, predictionY: round(slope * predictionX + intercept), stage: "predict" };
  const steps = [
    { id: "inspect-pairs", event: "inspect", title: L("Inspect input–target pairs", "Kiểm tra cặp đầu vào–mục tiêu"), action: L("Treat x as input and y as a known continuous target.", "Xem x là đầu vào và y là mục tiêu liên tục đã biết."), why: L("Known targets make this a supervised-learning fixture.", "Mục tiêu đã biết làm đây là fixture học có giám sát."), outcome: L(`${points.length} training pairs; no fitted equation or prediction is revealed yet.`, `${points.length} cặp huấn luyện; chưa mở phương trình khớp hay dự đoán.`), before: inspect, after: inspect },
    { id: "fit-model", event: "fit", title: L("Fit the least-squares line", "Khớp đường bình phương tối thiểu"), action: L(`Calculate y = ${slope}x + ${intercept}.`, `Tính y = ${slope}x + ${intercept}.`), why: L("The fitted line minimises the sum of squared residuals for this fixture.", "Đường khớp giảm thiểu tổng bình phương phần dư cho bộ dữ liệu này."), outcome: L(`SSE = ${sse}; residual segments show each observed-to-fitted difference.`, `SSE = ${sse}; các đoạn phần dư biểu diễn chênh lệch từ giá trị quan sát đến giá trị khớp.`), before: inspect, after: fitted },
    { id: "predict", event: "predict", title: L("Predict a continuous value", "Dự đoán giá trị liên tục"), action: L(`Substitute x=${predictionX}.`, `Thay x=${predictionX}.`), why: L("The fitted relationship maps a new input to a numeric output.", "Quan hệ đã khớp ánh xạ đầu vào mới sang đầu ra số."), outcome: L(`Predicted y=${final.predictionY}${final.extrapolation ? " (outside the observed x range)" : ""}.`, `Dự đoán y=${final.predictionY}${final.extrapolation ? " (ngoài miền x đã quan sát)" : ""}.`), before: fitted, after: final },
  ];
  return deepFreeze({ datasetId, pointPreset, steps, final });
}

export const displayNumber = (value: number | null) => value === null ? "—" : Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");

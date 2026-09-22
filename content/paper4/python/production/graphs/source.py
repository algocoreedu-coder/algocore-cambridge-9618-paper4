from pathlib import Path

class Graph:
    def __init__(self, vertices, directed): self.adj, self.directed = {v: [] for v in vertices}, directed
    def add_edge(self, start, end):
        if start not in self.adj or end not in self.adj: return False
        if end in self.adj[start]: return False
        self.adj[start].append(end); self.adj[start].sort()
        if not self.directed and start != end:
            self.adj[end].append(start); self.adj[end].sort()
        return True

def run(fixture):
    graph, trace = Graph(fixture["vertices"], fixture["directed"]), []
    for start, end in fixture.get("edges", []):
        before = {key: list(value) for key, value in graph.adj.items()}
        added = graph.add_edge(start, end)
        trace.append({"event": "add_edge", "edge": [start, end], "added": added, "unchanged_on_reject": added or before == graph.adj})
    vertices = fixture["vertices"]
    matrix = [[1 if right in graph.adj[left] else 0 for right in vertices] for left in vertices]
    edge_slots = sum(len(neighbours) for neighbours in graph.adj.values())
    return {"status": "OK", "adjacency": graph.adj, "matrix": matrix, "edge_slots": edge_slots, "matrix_slots": len(vertices) ** 2, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

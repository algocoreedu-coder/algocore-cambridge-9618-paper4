from pathlib import Path

class ArrayList:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.next = list(range(1, capacity)) + [-1]
        self.head, self.free = -1, 0 if capacity else -1
    def insert_head(self, value):
        if self.free == -1: return False
        node, self.free = self.free, self.next[self.free]
        self.data[node], self.next[node], self.head = value, self.head, node
        return True
    def traverse(self):
        output, node, seen = [], self.head, set()
        while node != -1:
            if node in seen or node < 0 or node >= len(self.data): raise ValueError("corrupt link")
            seen.add(node); output.append(self.data[node]); node = self.next[node]
        return output
    def remove(self, target):
        previous, node = -1, self.head
        while node != -1 and self.data[node] != target: previous, node = node, self.next[node]
        if node == -1: return False
        if previous == -1: self.head = self.next[node]
        else: self.next[previous] = self.next[node]
        self.data[node], self.next[node], self.free = None, self.free, node
        return True

def run(fixture):
    linked, trace = ArrayList(fixture["capacity"]), []
    for value in reversed(fixture.get("initial", [])):
        trace.append({"event": "insert", "value": value, "success": linked.insert_head(value)})
    before = linked.traverse()
    inserted = linked.insert_head(fixture["insert"])
    removed = linked.remove(fixture["remove"])
    try: after, status = linked.traverse(), "OK"
    except ValueError: after, status = before, "CORRUPT"
    trace += [{"event": "insert_requested", "success": inserted}, {"event": "remove_requested", "success": removed}]
    return {"status": status, "before": before, "after": after, "inserted": inserted, "removed": removed, "head": linked.head, "free": linked.free, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

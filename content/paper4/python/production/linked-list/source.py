from pathlib import Path

class ArrayList:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.next = list(range(1, capacity)) + [-1]
        self.head = -1
        self.free = 0 if capacity else -1

    def state(self):
        return {
            "head": self.head,
            "free": self.free,
            "data": list(self.data),
            "next": list(self.next),
        }

    def insert_head(self, value, trace):
        before = self.state()
        if self.free == -1:
            trace.append({
                "event": "insert_reject_full",
                "value": value,
                "before": before,
                "change": {"reason": "free_list_empty"},
                "after": self.state(),
            })
            return False
        node = self.free
        next_free = self.next[node]
        saved_head = self.head
        self.free = next_free
        self.data[node] = value
        self.next[node] = saved_head
        self.head = node
        trace.append({
            "event": "insert_head",
            "value": value,
            "before": before,
            "change": {
                "allocated_node": node,
                "saved_head": saved_head,
                "next_free": next_free,
            },
            "after": self.state(),
        })
        return True

    def traverse(self):
        output = []
        node = self.head
        seen = set()
        while node != -1:
            if node in seen or node < 0 or node >= len(self.data):
                raise ValueError("corrupt link")
            seen.add(node)
            output.append(self.data[node])
            node = self.next[node]
        return output

    def remove(self, target, trace):
        previous = -1
        node = self.head
        while node != -1:
            trace.append({
                "event": "remove_compare",
                "target": target,
                "previous": previous,
                "node": node,
                "value": self.data[node],
                "next_node": self.next[node],
            })
            if self.data[node] == target:
                break
            previous = node
            node = self.next[node]
        before = self.state()
        if node == -1:
            trace.append({
                "event": "remove_reject_missing",
                "target": target,
                "before": before,
                "change": {"reason": "target_not_found"},
                "after": self.state(),
            })
            return False
        successor = self.next[node]
        previous_free = self.free
        if previous == -1:
            self.head = successor
        else:
            self.next[previous] = successor
        self.data[node] = None
        self.next[node] = previous_free
        self.free = node
        trace.append({
            "event": "remove_recycle",
            "target": target,
            "before": before,
            "change": {
                "previous": previous,
                "removed_node": node,
                "saved_successor": successor,
                "previous_free": previous_free,
            },
            "after": self.state(),
        })
        return True

def run(fixture):
    linked = ArrayList(fixture["capacity"])
    trace = []
    for value in reversed(fixture.get("initial", [])):
        linked.insert_head(value, trace)
    before = linked.traverse()
    inserted = linked.insert_head(fixture["insert"], trace)
    removed = linked.remove(fixture["remove"], trace)
    try:
        after = linked.traverse()
        status = "OK"
    except ValueError:
        after = before
        status = "CORRUPT"
    return {
        "status": status,
        "before": before,
        "after": after,
        "inserted": inserted,
        "removed": removed,
        "head": linked.head,
        "free": linked.free,
        "trace": trace,
    }

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

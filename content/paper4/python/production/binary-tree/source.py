from pathlib import Path

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value, trace, phase):
    if root is None:
        trace.append({
            "event": "tree_attach_root",
            "phase": phase,
            "value": value,
        })
        return Node(value), True
    current = root
    while True:
        if value == current.value:
            trace.append({
                "event": "tree_reject_duplicate",
                "phase": phase,
                "node": current.value,
                "value": value,
            })
            return root, False
        side = "left" if value < current.value else "right"
        child = getattr(current, side)
        trace.append({
            "event": "tree_compare_insert",
            "phase": phase,
            "node": current.value,
            "value": value,
            "direction": side,
            "child": None if child is None else child.value,
        })
        if child is None:
            setattr(current, side, Node(value))
            trace.append({
                "event": "tree_attach_child",
                "phase": phase,
                "parent": current.value,
                "direction": side,
                "value": value,
            })
            return root, True
        current = child

def traverse(node, order):
    if node is None:
        return []
    if order == "pre":
        return [node.value] + traverse(node.left, order) + traverse(node.right, order)
    if order == "post":
        return traverse(node.left, order) + traverse(node.right, order) + [node.value]
    return traverse(node.left, order) + [node.value] + traverse(node.right, order)

def run(fixture):
    root = None
    trace = []
    for value in fixture.get("values", []):
        root, added = insert(root, value, trace, "setup")
    before = traverse(root, "in")
    root, added = insert(root, fixture["insert"], trace, "requested")
    current = root
    found = False
    while current is not None:
        if fixture["target"] == current.value:
            direction = "found"
        elif fixture["target"] < current.value:
            direction = "left"
        else:
            direction = "right"
        trace.append({
            "event": "tree_search_visit",
            "node": current.value,
            "target": fixture["target"],
            "direction": direction,
        })
        if direction == "found":
            found = True
            break
        current = getattr(current, direction)
    if not found:
        trace.append({
            "event": "tree_search_exhausted",
            "target": fixture["target"],
        })
    return {
        "status": "FOUND" if found else "NOT_FOUND",
        "inserted": added,
        "unchanged_on_duplicate": added or before == traverse(root, "in"),
        "inorder": traverse(root, "in"),
        "preorder": traverse(root, "pre"),
        "postorder": traverse(root, "post"),
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

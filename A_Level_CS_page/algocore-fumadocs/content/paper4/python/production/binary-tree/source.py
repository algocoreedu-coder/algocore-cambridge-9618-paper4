from pathlib import Path

class Node:
    def __init__(self, value): self.value, self.left, self.right = value, None, None

def insert(root, value):
    if root is None: return Node(value), True
    current = root
    while True:
        if value == current.value: return root, False
        side = "left" if value < current.value else "right"
        child = getattr(current, side)
        if child is None: setattr(current, side, Node(value)); return root, True
        current = child

def traverse(node, order):
    if node is None: return []
    if order == "pre": return [node.value] + traverse(node.left, order) + traverse(node.right, order)
    if order == "post": return traverse(node.left, order) + traverse(node.right, order) + [node.value]
    return traverse(node.left, order) + [node.value] + traverse(node.right, order)

def run(fixture):
    root, trace = None, []
    for value in fixture.get("values", []):
        root, added = insert(root, value); trace.append({"event": "insert", "value": value, "added": added})
    before = traverse(root, "in")
    root, added = insert(root, fixture["insert"])
    current, found = root, False
    while current is not None:
        trace.append({"event": "search", "node": current.value})
        if fixture["target"] == current.value: found = True; break
        current = current.left if fixture["target"] < current.value else current.right
    return {"status": "FOUND" if found else "NOT_FOUND", "inserted": added, "unchanged_on_duplicate": added or before == traverse(root, "in"), "inorder": traverse(root, "in"), "preorder": traverse(root, "pre"), "postorder": traverse(root, "post"), "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

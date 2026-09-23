from pathlib import Path

class Stack:
    def __init__(self, capacity):
        self.items = [None] * capacity
        self.top = -1
    def push(self, value):
        if self.top + 1 == len(self.items):
            return False
        self.top += 1
        self.items[self.top] = value
        return True
    def pop(self):
        if self.top == -1:
            return None
        value = self.items[self.top]
        self.items[self.top] = None
        self.top -= 1
        return value
    def live(self):
        return self.items[:self.top + 1]

def run(fixture):
    stack, trace, results = Stack(fixture["capacity"]), [], []
    for operation in fixture["operations"]:
        before = {"top": stack.top, "live": stack.live()}
        if operation[0] == "push":
            outcome = stack.push(operation[1])
        else:
            outcome = stack.pop()
        results.append(outcome)
        trace.append({"event": operation[0], "before": before, "after": {"top": stack.top, "live": stack.live()}, "outcome": outcome})
    reduce_stack = Stack(max(2, len(fixture.get("operands", []))))
    for value in fixture.get("operands", []): reduce_stack.push(value)
    right, left = reduce_stack.pop(), reduce_stack.pop()
    reduced = None if left is None or right is None else left - right
    return {"status": "OK", "results": results, "live": stack.live(), "top": stack.top, "reduced": reduced, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

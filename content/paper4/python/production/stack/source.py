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

def stack_from(values):
    stack = Stack(len(values))
    for value in values:
        stack.push(value)
    return stack

def pair_stacks(left_stack, right_stack, trace):
    before = {"left": left_stack.live(), "right": right_stack.live()}
    left_item = left_stack.pop()
    right_item = right_stack.pop()
    if left_item is None or right_item is None:
        if left_item is not None:
            left_stack.push(left_item)
        if right_item is not None:
            right_stack.push(right_item)
        trace.append({"event": "pair_rollback", "before": before, "after": {"left": left_stack.live(), "right": right_stack.live()}})
        return None
    pair = [left_item, right_item]
    trace.append({"event": "pair_commit", "pair": pair, "before": before, "after": {"left": left_stack.live(), "right": right_stack.live()}})
    return pair

def reduce_operands(values):
    stack = stack_from(values)
    right, left = stack.pop(), stack.pop()
    return None if left is None or right is None else left - right

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
    left_stack = stack_from(fixture.get("pair_left", []))
    right_stack = stack_from(fixture.get("pair_right", []))
    pair = pair_stacks(left_stack, right_stack, trace)
    reduced = reduce_operands(fixture.get("operands", []))
    return {"status": "OK", "results": results, "live": stack.live(), "top": stack.top, "pair": pair, "pair_left": left_stack.live(), "pair_right": right_stack.live(), "reduced": reduced, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

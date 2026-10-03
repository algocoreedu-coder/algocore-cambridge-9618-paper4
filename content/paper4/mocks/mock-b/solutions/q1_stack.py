from pathlib import Path


class Stack:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.top = -1

    def push(self, character):
        if self.top == len(self.data) - 1:
            return False
        self.top += 1
        self.data[self.top] = character
        return True

    def pop(self):
        if self.top == -1:
            return None
        character = self.data[self.top]
        self.data[self.top] = None
        self.top -= 1
        return character

    def is_empty(self):
        return self.top == -1


def check_expression(text):
    opening = "([{"
    match = {")": "(", "]": "[", "}": "{"}
    stack = Stack(len(text))
    trace = []
    for position, character in enumerate(text, 1):
        if character in opening:
            stack.push(character)
            trace.append({"position": position, "bracket": character, "stack_after": stack.data[: stack.top + 1]})
        elif character in match:
            before = stack.data[: stack.top + 1]
            actual = stack.pop()
            trace.append({"position": position, "bracket": character, "stack_before": before, "expected": match[character], "actual": actual, "stack_after": stack.data[: stack.top + 1]})
            if actual != match[character]:
                return False, position, trace
    return (True, None, trace) if stack.is_empty() else (False, len(text), trace)


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "inputs" / "expressions.txt"
    with path.open(encoding="utf-8") as source:
        for line_number, raw in enumerate(source, 1):
            valid, position, trace = check_expression(raw.rstrip("\n"))
            print(line_number, "VALID" if valid else f"INVALID@{position}", trace)

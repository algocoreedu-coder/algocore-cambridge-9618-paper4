"""Generate the frozen P4R-3 Python production sources and fixtures.

The source strings below are the authored teaching programs. Generation is
deterministic: UTF-8, LF endings, sorted JSON keys and one final newline.
"""

from __future__ import annotations

import json
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[1]
ROOT = APP_ROOT / "content" / "paper4" / "python" / "production"


COMMON_TAIL = '''

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
'''


SOURCES = {
"procedural-design": '''from pathlib import Path

def classify(score):
    if score < 0 or score > 100:
        return "INVALID"
    if score >= 70:
        return "DISTINCTION"
    if score >= 40:
        return "PASS"
    return "RETRY"

def apply_bonus(scores, bonus):
    # Return a new list: the caller's list is not Cambridge BYREF data.
    return [min(100, score + bonus) for score in scores]

def run(fixture):
    trace = []
    original = list(fixture.get("scores", []))
    if not isinstance(fixture.get("bonus"), int):
        return {"status": "INVALID_INPUT", "scores": original, "caller_unchanged": True, "trace": [{"event": "reject_bonus"}]}
    adjusted = apply_bonus(original, fixture["bonus"])
    labels = []
    for index, score in enumerate(adjusted):
        label = classify(score)
        trace.append({"event": "classify", "index": index, "score": score, "label": label})
        labels.append(label)
    status = "OK" if all(label != "INVALID" for label in labels) else "INVALID_INPUT"
    return {"status": status, "adjusted": adjusted, "labels": labels, "caller_unchanged": original == fixture.get("scores", []), "trace": trace}
''',
"validation-rules": '''from pathlib import Path

def check_digit(code, weights, modulus):
    if not code.isdigit() or len(code) != len(weights) or modulus <= 1:
        raise ValueError("invalid check-digit contract")
    return sum(int(digit) * weight for digit, weight in zip(code, weights)) % modulus

def run(fixture):
    trace = []
    accepted = list(fixture.get("accepted", []))
    candidate = fixture.get("candidate")
    if not isinstance(candidate, int) or not fixture["minimum"] <= candidate <= fixture["maximum"]:
        return {"status": "INVALID_INPUT", "accepted": accepted, "trace": [{"event": "range_reject", "value": candidate}]}
    if candidate in accepted:
        return {"status": "DUPLICATE", "accepted": accepted, "trace": [{"event": "duplicate_reject", "value": candidate}]}
    try:
        calculated = check_digit(fixture["code"], fixture["weights"], fixture["modulus"])
    except (KeyError, TypeError, ValueError) as error:
        return {"status": "INVALID_CODE", "accepted": accepted, "message": str(error), "trace": [{"event": "code_reject"}]}
    trace.append({"event": "check_digit", "calculated": calculated})
    if calculated != fixture["supplied_digit"]:
        return {"status": "CHECK_DIGIT_MISMATCH", "accepted": accepted, "calculated": calculated, "trace": trace}
    accepted.append(candidate)
    trace.append({"event": "accept_unique", "value": candidate})
    return {"status": "ACCEPTED", "accepted": accepted, "calculated": calculated, "trace": trace}
''',
"testing": '''from pathlib import Path

def defective_grade(score):
    return "PASS" if score > 40 else "RETRY"

def repaired_grade(score):
    if score < 0 or score > 100:
        return "INVALID"
    return "PASS" if score >= 40 else "RETRY"

def run_suite(cases, function):
    rows = []
    for case in cases:
        actual = function(case["input"])
        rows.append({"input": case["input"], "expected": case["expected"], "actual": actual, "passed": actual == case["expected"]})
    return rows

def run(fixture):
    before = run_suite(fixture["cases"], defective_grade)
    first_divergence = next((index for index, row in enumerate(before) if not row["passed"]), -1)
    after = run_suite(fixture["cases"], repaired_grade)
    trace = [{"event": "defect_run", "first_divergence": first_divergence}, {"event": "repair"}, {"event": "regression", "all_pass": all(row["passed"] for row in after)}]
    return {"status": "PASS" if all(row["passed"] for row in after) else "FAIL", "failed_before_repair": first_divergence >= 0, "first_divergence": first_divergence, "before": before, "after": after, "trace": trace}
''',
"text-processing": '''from pathlib import Path

def compare_text(left, right):
    for a, b in zip(left, right):
        if a != b:
            return -1 if a < b else 1
    return (len(left) > len(right)) - (len(left) < len(right))

def run_length_encode(text):
    if text == "":
        return []
    encoded, current, count = [], text[0], 1
    for character in text[1:]:
        if character == current:
            count += 1
        else:
            encoded.append([current, count])
            current, count = character, 1
    encoded.append([current, count])
    return encoded

def run(fixture):
    trace = []
    fields = fixture["record"].split(fixture["delimiter"])
    if len(fields) != 3 or fields[0] not in {"INT", "TEXT"}:
        return {"status": "MALFORMED", "routed": {}, "trace": [{"event": "reject_fields", "fields": fields}]}
    try:
        value = int(fields[2]) if fields[0] == "INT" else fields[2]
    except ValueError:
        return {"status": "MALFORMED", "routed": {}, "trace": [{"event": "reject_conversion", "token": fields[2]}]}
    routed = {fields[1]: value}
    trace.append({"event": "route", "tag": fields[0], "key": fields[1]})
    encoded = run_length_encode(fixture["text"])
    trace.append({"event": "flush_final_run", "runs": len(encoded)})
    return {"status": "OK", "comparison": compare_text(fixture["left"], fixture["right"]), "fields": fields, "routed": routed, "encoded": encoded, "trace": trace}
''',
"search-collections": '''from pathlib import Path

def run(fixture):
    trace, found = [], -1
    values = fixture.get("values", [])
    for index, value in enumerate(values):
        trace.append({"event": "inspect", "index": index, "match": value == fixture["target"]})
        if found == -1 and value == fixture["target"]:
            found = index
    records = fixture.get("records", [])
    if any("group" not in record or "amount" not in record for record in records):
        return {"status": "MALFORMED_RECORD", "found": found, "groups": {}, "trace": trace + [{"event": "reject_record"}]}
    groups, filtered = {}, []
    for record in records:
        groups[record["group"]] = groups.get(record["group"], 0) + record["amount"]
        if record["amount"] >= fixture["threshold"]:
            filtered.append(record)
    return {"status": "OK", "found": found, "count": sum(value == fixture["target"] for value in values), "filtered": filtered, "groups": groups, "trace": trace + [{"event": "aggregate", "groups": len(groups)}]}
''',
"sorting": '''from pathlib import Path

def bubble(values, trace, reverse=False):
    output = list(values)
    comparisons = 0
    swaps = 0
    for end in range(len(output) - 1, 0, -1):
        changed = False
        pass_number = len(output) - end
        for index in range(end):
            comparisons += 1
            left = output[index]
            right = output[index + 1]
            wrong = left < right if reverse else left > right
            trace.append({
                "event": "bubble_compare",
                "pass": pass_number,
                "left_index": index,
                "right_index": index + 1,
                "left": left,
                "right": right,
                "swap_required": wrong,
            })
            if wrong:
                before = list(output)
                output[index] = right
                output[index + 1] = left
                swaps += 1
                changed = True
                trace.append({
                    "event": "bubble_swap",
                    "pass": pass_number,
                    "indices": [index, index + 1],
                    "before": before,
                    "after": list(output),
                })
        trace.append({
            "event": "bubble_pass_complete",
            "pass": pass_number,
            "changed": changed,
            "sorted_suffix_start": end,
            "values": list(output),
        })
        if not changed:
            break
    trace.append({"event": "bubble_complete", "values": list(output)})
    return output, comparisons, swaps

def insertion(values, trace):
    output = list(values)
    for index in range(1, len(output)):
        item = output[index]
        position = index
        trace.append({
            "event": "insertion_select_key",
            "index": index,
            "key": item,
            "sorted_prefix": list(output[:index]),
        })
        while position > 0 and output[position - 1] > item:
            before = list(output)
            output[position] = output[position - 1]
            trace.append({
                "event": "insertion_shift",
                "from_index": position - 1,
                "to_index": position,
                "value": output[position],
                "before": before,
                "after": list(output),
            })
            position -= 1
        before = list(output)
        output[position] = item
        trace.append({
            "event": "insertion_place_key",
            "from_index": index,
            "to_index": position,
            "key": item,
            "before": before,
            "after": list(output),
        })
    trace.append({"event": "insertion_complete", "values": list(output)})
    return output

def run(fixture):
    values = fixture.get("values", [])
    trace = []
    if not all(isinstance(value, int) for value in values):
        trace.append({
            "event": "reject_key",
            "before": list(values),
            "after": list(values),
        })
        return {"status": "INVALID_KEY", "values": values, "trace": trace}
    ordered, comparisons, swaps = bubble(values, trace, fixture.get("reverse", False))
    insertion_ordered = insertion(values, trace)
    bounded = list(fixture.get("bounded", []))
    if len(bounded) >= fixture["capacity"]:
        before = list(bounded)
        trace.append({
            "event": "capacity_reject",
            "capacity": fixture["capacity"],
            "before": before,
            "after": list(bounded),
        })
        return {
            "status": "FULL",
            "values": bounded,
            "bubble": ordered,
            "insertion": insertion_ordered,
            "trace": trace,
        }
    item = fixture["insert"]
    position = 0
    while position < len(bounded):
        current = bounded[position]
        moves_right = current <= item
        trace.append({
            "event": "ordered_insert_compare",
            "index": position,
            "current": current,
            "item": item,
            "moves_right": moves_right,
        })
        if not moves_right:
            break
        position += 1
    before = list(bounded)
    bounded.insert(position, item)
    trace.append({
        "event": "ordered_insert",
        "position": position,
        "item": item,
        "before": before,
        "after": list(bounded),
    })
    return {
        "status": "OK",
        "bubble": ordered,
        "insertion": insertion_ordered,
        "bounded": bounded,
        "comparisons": comparisons,
        "swaps": swaps,
        "trace": trace,
    }

''',
"stack": '''from pathlib import Path

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
''',
"linked-list": '''from pathlib import Path

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

''',
"binary-tree": '''from pathlib import Path

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

''',
"dictionary": '''from pathlib import Path

class DictionaryADT:
    def __init__(self): self.entries = []
    def find(self, key):
        return next((value for stored, value in self.entries if stored == key), None)
    def insert(self, key, value):
        if self.find(key) is not None: return False
        self.entries.append([key, value]); return True
    def delete(self, key):
        for index, pair in enumerate(self.entries):
            if pair[0] == key: self.entries.pop(index); return True
        return False

def run(fixture):
    table, trace = DictionaryADT(), []
    for key, value in fixture.get("initial", []): table.insert(key, value)
    before = [list(pair) for pair in table.entries]
    inserted = table.insert(fixture["insert"][0], fixture["insert"][1])
    deleted = table.delete(fixture["delete"])
    frequency = {}
    for token in fixture.get("tokens", []): frequency[token] = frequency.get(token, 0) + 1
    trace += [{"event": "insert", "success": inserted}, {"event": "delete", "success": deleted}, {"event": "aggregate", "groups": len(frequency)}]
    return {"status": "OK", "before": before, "entries": table.entries, "inserted": inserted, "deleted": deleted, "found": table.find(fixture["find"]), "frequency": frequency, "trace": trace}
''',
"performance": '''from pathlib import Path

def linear(values, target):
    comparisons = 0
    for index, value in enumerate(values):
        comparisons += 1
        if value == target: return index, comparisons
    return -1, comparisons

def binary(values, target):
    if values != sorted(values): raise ValueError("binary search requires sorted input")
    low, high, comparisons = 0, len(values) - 1, 0
    while low <= high:
        middle = (low + high) // 2; comparisons += 1
        if values[middle] == target: return middle, comparisons
        if values[middle] < target: low = middle + 1
        else: high = middle - 1
    return -1, comparisons

def insertion_cost(values):
    output, comparisons, shifts = list(values), 0, 0
    for index in range(1, len(output)):
        item, position = output[index], index
        while position > 0:
            comparisons += 1
            if output[position - 1] <= item: break
            output[position] = output[position - 1]; position -= 1; shifts += 1
        output[position] = item
    return output, comparisons, shifts

def run(fixture):
    values = fixture["values"]
    linear_result = linear(values, fixture["target"])
    try: binary_result, status = binary(values, fixture["target"]), "OK"
    except ValueError: binary_result, status = [-1, 0], "UNSORTED"
    ordered, comparisons, shifts = insertion_cost(values)
    trace = [{"event": "linear_count", "comparisons": linear_result[1]}, {"event": "binary_count", "comparisons": binary_result[1]}, {"event": "insertion_count", "comparisons": comparisons, "shifts": shifts}]
    return {"status": status, "linear": linear_result, "binary": binary_result, "sorted": ordered, "result_equivalent": ordered == sorted(values), "trace": trace}
''',
"graphs": '''from pathlib import Path

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
''',
"oop-model": '''from pathlib import Path

class Student:
    def __init__(self, student_id, name, score=0):
        valid_id = isinstance(student_id, int) and student_id >= 1
        valid_score = isinstance(score, int) and 0 <= score <= 100
        if not valid_id or not valid_score:
            raise ValueError("invalid student")
        self.student_id = student_id
        self.name = name
        self.score = score

    def state(self):
        return {
            "student_id": self.student_id,
            "name": self.name,
            "score": self.score,
        }

def run(fixture):
    objects = []
    rejected = 0
    trace = []
    for record in fixture.get("records", []):
        try:
            student = Student(record.get("student_id"), record.get("name", ""), record.get("score", 0))
            trace.append({"event": "bind_instance", "student_id": student.student_id})
            objects.append(student)
            trace.append({"event": "instantiate", "student_id": student.student_id})
        except (TypeError, ValueError):
            rejected += 1
            trace.append({"event": "reject_constructor", "object_created": False})
    states = [student.state() for student in objects]
    independent_instances = len({id(student) for student in objects}) == len(objects)
    return {
        "status": "OK" if rejected == 0 else "PARTIAL_REJECT",
        "objects": states,
        "rejected": rejected,
        "independent_instances": independent_instances,
        "trace": trace,
    }
''',
"oop-state": '''from pathlib import Path

class Account:
    def __init__(self, balance, limit):
        self.__balance = balance
        self.__limit = limit

    def get_balance(self):
        return self.__balance

    def set_balance(self, value):
        if not 0 <= value <= self.__limit:
            return False
        self.__balance = value
        return True

    def apply_change(self, delta):
        candidate = self.__balance + delta
        return self.set_balance(candidate)

def run(fixture):
    account = Account(fixture["start"], fixture["limit"])
    trace = []
    old = account.get_balance()
    setter_ok = account.set_balance(fixture["replacement"])
    trace.append({"event": "setter", "success": setter_ok, "balance": account.get_balance()})
    before_update = account.get_balance()
    update_ok = account.apply_change(fixture["delta"])
    trace.append({"event": "rule_update", "success": update_ok, "balance": account.get_balance()})
    preserved = update_ok or account.get_balance() == before_update
    return {
        "status": "OK",
        "old": old,
        "balance": account.get_balance(),
        "setter_ok": setter_ok,
        "update_ok": update_ok,
        "preserved_after_failed_update": preserved,
        "trace": trace,
    }
''',
"oop-inheritance": '''from pathlib import Path

class Shape:
    def __init__(self, name):
        self.name = name

    def area(self):
        raise NotImplementedError("subclass must implement area")

class Rectangle(Shape):
    def __init__(self, width, height):
        if width < 0 or height < 0:
            raise ValueError("negative size")
        super().__init__("rectangle")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        if radius < 0:
            raise ValueError("negative size")
        super().__init__("circle")
        self.radius = radius

    def area(self):
        return round(3.14 * self.radius * self.radius, 2)

def run(fixture):
    shapes = []
    rejected = 0
    trace = []
    for record in fixture.get("shapes", []):
        try:
            if record["type"] == "rectangle":
                shape = Rectangle(record["width"], record["height"])
            elif record["type"] == "circle":
                shape = Circle(record["radius"])
            else:
                raise ValueError("unknown shape")
            shapes.append(shape)
            trace.append({"event": "constructor_chain", "runtime_type": type(shape).__name__})
        except (KeyError, ValueError):
            rejected += 1
            trace.append({"event": "reject_subclass"})
    outputs = []
    for shape in shapes:
        area = shape.area()
        outputs.append({"name": shape.name, "area": area})
        trace.append({"event": "dynamic_dispatch", "runtime_type": type(shape).__name__, "method": "area", "result": area})
    return {
        "status": "OK" if rejected == 0 else "REJECTED_INVALID_SUBCLASS",
        "outputs": outputs,
        "rejected": rejected,
        "trace": trace,
    }
''',
"oop-aggregation": '''from pathlib import Path

class Book:
    def __init__(self, title):
        self.title = title

    def label(self):
        return self.title.upper()

class Shelf:
    def __init__(self, capacity):
        self.capacity = capacity
        self.books = []

    def add(self, book):
        valid_book = isinstance(book, Book)
        has_space = len(self.books) < self.capacity
        if not valid_book or not has_space:
            return False
        self.books.append(book)
        return True

    def labels(self):
        return [book.label() for book in self.books]

def run(fixture):
    shelf = Shelf(fixture["capacity"])
    trace = []
    for value in fixture.get("items", []):
        item = Book(value) if isinstance(value, str) else value
        before = len(shelf.books)
        success = shelf.add(item)
        trace.append({
            "event": "bounded_add",
            "success": success,
            "count": len(shelf.books),
            "unchanged_on_reject": success or before == len(shelf.books),
            "relationship": "has-a",
        })
    return {
        "status": "OK",
        "count": len(shelf.books),
        "labels": shelf.labels(),
        "capacity": shelf.capacity,
        "trace": trace,
    }
''',
"text-files": r'''from pathlib import Path
from tempfile import TemporaryDirectory

def parse_records(text):
    records = []
    for raw in text.splitlines():
        if raw == "": continue
        fields = raw.split(",")
        if len(fields) != 2: raise ValueError("malformed record")
        records.append({"name": fields[0], "score": int(fields[1])})
    return records

def run(fixture):
    trace = []
    with TemporaryDirectory() as directory:
        source, output = Path(directory) / "input.txt", Path(directory) / "output.txt"
        source.write_text(fixture["content"], encoding="utf-8", newline="\n")
        committed = fixture.get("committed", "SAFE\n")
        output.write_text(committed, encoding="utf-8", newline="\n")
        try:
            records = parse_records(source.read_text(encoding="utf-8"))
            rendered = "".join(f"{record['name']}:{record['score']}\n" for record in records)
            output.write_text(rendered, encoding="utf-8", newline="\n")
            with output.open("a", encoding="utf-8", newline="\n") as handle: handle.write(fixture.get("append", ""))
            trace += [{"event": "load", "records": len(records)}, {"event": "overwrite"}, {"event": "append"}]
            return {"status": "OK", "records": records, "output": output.read_text(encoding="utf-8"), "trace": trace}
        except (OSError, UnicodeError, ValueError) as error:
            trace.append({"event": "reject", "type": type(error).__name__})
            return {"status": "INVALID_FILE", "output": output.read_text(encoding="utf-8"), "trace": trace}
''',
"random-files": '''from pathlib import Path
from io import BytesIO

def pack(value, size):
    raw = value.encode("ascii")
    if len(raw) > size: raise ValueError("record too long")
    return raw.ljust(size, b" ")

def read_record(handle, address, size):
    if address < 0: raise ValueError("negative address")
    handle.seek(address * size); raw = handle.read(size)
    if len(raw) != size: raise EOFError("short read")
    return raw.rstrip(b" ").decode("ascii")

def run(fixture):
    size, trace = fixture["record_size"], []
    try: raw = b"".join(pack(value, size) for value in fixture["records"])
    except (UnicodeError, ValueError) as error: return {"status": "INVALID_RECORD", "message": str(error), "trace": [{"event": "pack_reject"}]}
    handle, before = BytesIO(raw), raw
    try:
        old = read_record(handle, fixture["address"], size)
        replacement = pack(fixture["replacement"], size)
        handle.seek(fixture["address"] * size); handle.write(replacement)
        after = handle.getvalue(); new = read_record(handle, fixture["address"], size)
        neighbours_unchanged = before[:fixture["address"]*size] == after[:fixture["address"]*size] and before[(fixture["address"]+1)*size:] == after[(fixture["address"]+1)*size:]
        trace += [{"event": "seek_read", "offset": fixture["address"] * size}, {"event": "seek_write", "offset": fixture["address"] * size}]
        return {"status": "UPDATED", "old": old, "new": new, "byte_length": len(after), "neighbours_unchanged": neighbours_unchanged, "trace": trace}
    except (EOFError, UnicodeError, ValueError) as error:
        return {"status": "ADDRESS_ERROR", "message": str(error), "byte_length": len(before), "trace": [{"event": "reject_address"}]}
''',
"exceptions": '''from pathlib import Path
from io import StringIO

class InjectedReadError(OSError): pass

class DemoStream(StringIO):
    def __init__(self, text, fail=False): super().__init__(text); self.fail = fail
    def read(self, *args):
        if self.fail: raise InjectedReadError("injected")
        return super().read(*args)

def run(fixture):
    previous, trace, stream = fixture["previous"], [], DemoStream(fixture.get("content", ""), fixture.get("inject_io", False))
    try:
        with stream:
            text = stream.read().strip(); trace.append({"event": "read"})
            if text == "": raise ValueError("empty value")
            value = int(text)
        status = "OK"
    except ValueError as error:
        value, status = previous, "VALUE_ERROR"; trace.append({"event": "recover_value", "message": str(error)})
    except InjectedReadError as error:
        value, status = previous, "IO_ERROR"; trace.append({"event": "recover_io", "message": str(error)})
    finally:
        trace.append({"event": "cleanup", "closed": stream.closed})
    return {"status": status, "value": value, "preserved_on_failure": status == "OK" or value == previous, "closed": stream.closed, "trace": trace}
''',
"exam-workflow": r'''from pathlib import Path

def load(rows):
    if not isinstance(rows, list): raise ValueError("rows must be a list")
    return [dict(row) for row in rows]
def validate(rows):
    if any(set(row) != {"name", "score"} or not isinstance(row["score"], int) or not 0 <= row["score"] <= 100 for row in rows): raise ValueError("invalid row")
    return rows
def process(rows, minimum): return [row for row in rows if row["score"] >= minimum]
def format_output(rows): return "\n".join(f"{index + 1}. {row['name']}: {row['score']}" for index, row in enumerate(rows)) or "NO RESULTS"

def run(fixture):
    trace, evidence = [], []
    try:
        rows = load(fixture["rows"]); trace.append({"event": "load", "count": len(rows)}); evidence.append({"requirement": "load", "passed": True})
        validate(rows); trace.append({"event": "validate"}); evidence.append({"requirement": "validate", "passed": True})
        selected = process(rows, fixture["minimum"]); trace.append({"event": "process", "count": len(selected)}); evidence.append({"requirement": "process", "passed": True})
        output = format_output(selected); trace.append({"event": "format", "output": output}); evidence.append({"requirement": "format", "passed": True})
        return {"status": "OK", "output": output, "selected": selected, "evidence": evidence, "first_failed_stage": None, "trace": trace}
    except (KeyError, TypeError, ValueError) as error:
        failed = "load" if not trace else "validate"
        evidence.append({"requirement": failed, "passed": False, "actual": str(error)})
        trace.append({"event": "block_downstream", "failed": failed})
        return {"status": "FAILED", "output": "", "selected": [], "evidence": evidence, "first_failed_stage": failed, "trace": trace}
''',
}


FIXTURES = {
"procedural-design": {
 "normal": {"scores": [35, 65, 82], "bonus": 5},
 "boundary": {"scores": [], "bonus": 0},
 "failure": {"scores": [40, 70], "bonus": "5"}},
"validation-rules": {
 "normal": {"accepted": [2], "candidate": 4, "minimum": 1, "maximum": 5, "code": "123", "weights": [1,2,3], "modulus": 7, "supplied_digit": 0},
 "boundary": {"accepted": [], "candidate": 1, "minimum": 1, "maximum": 1, "code": "007", "weights": [3,2,1], "modulus": 10, "supplied_digit": 7},
 "failure": {"accepted": [3], "candidate": 3, "minimum": 1, "maximum": 5, "code": "12X", "weights": [1,2,3], "modulus": 7, "supplied_digit": 0}},
"testing": {
 "normal": {"cases": [{"input": 55, "expected": "PASS"}, {"input": 20, "expected": "RETRY"}]},
 "boundary": {"cases": [{"input": 40, "expected": "PASS"}, {"input": 0, "expected": "RETRY"}, {"input": 100, "expected": "PASS"}]},
 "failure": {"cases": [{"input": -1, "expected": "INVALID"}, {"input": 101, "expected": "INVALID"}]}},
"text-processing": {
 "normal": {"record": "INT|age|16", "delimiter": "|", "text": "AAABBCCCC", "left": "ALGO", "right": "CORE"},
 "boundary": {"record": "TEXT||", "delimiter": "|", "text": "Z", "left": "A", "right": "AA"},
 "failure": {"record": "INT|age|sixteen", "delimiter": "|", "text": "", "left": "A", "right": "A"}},
"search-collections": {
 "normal": {"values": [4,2,4,8], "target": 4, "records": [{"group":"A","amount":5},{"group":"B","amount":2},{"group":"A","amount":4}], "threshold": 4},
 "boundary": {"values": [], "target": 9, "records": [], "threshold": 1},
 "failure": {"values": [1], "target": 2, "records": [{"group":"A"}], "threshold": 1}},
"sorting": {
 "normal": {"values": [5,1,4,2], "bounded": [1,3,7], "insert": 4, "capacity": 5},
 "boundary": {"values": [], "bounded": [], "insert": 0, "capacity": 1, "reverse": True},
 "failure": {"values": [3,2,1], "bounded": [1,2], "insert": 3, "capacity": 2}},
"stack": {
 "normal": {"capacity": 4, "operations": [["push",10],["push",20],["pop"],["push",30]], "operands": [9,4]},
 "boundary": {"capacity": 1, "operations": [["pop"],["push",7],["push",8]], "operands": []},
 "failure": {"capacity": 2, "operations": [["push",1],["push",2],["push",3],["pop"],["pop"],["pop"]], "operands": [5]}},
"linked-list": {
 "normal": {"capacity": 5, "initial": [2,4], "insert": 1, "remove": 2},
 "boundary": {"capacity": 1, "initial": [], "insert": 9, "remove": 9},
 "failure": {"capacity": 2, "initial": [1,2], "insert": 3, "remove": 8}},
"binary-tree": {
 "normal": {"values": [8,4,12,2,6,10,14], "insert": 5, "target": 10},
 "boundary": {"values": [], "insert": 7, "target": 7},
 "failure": {"values": [5,3,7], "insert": 3, "target": 9}},
"dictionary": {
 "normal": {"initial": [["A",1],["B",2]], "insert": ["C",3], "delete": "A", "find": "C", "tokens": ["x","y","x"]},
 "boundary": {"initial": [], "insert": ["A",0], "delete": "missing", "find": "A", "tokens": []},
 "failure": {"initial": [["A",1]], "insert": ["A",9], "delete": "missing", "find": "missing", "tokens": ["x"]}},
"performance": {
 "normal": {"values": [1,3,5,7,9,11,13], "target": 11},
 "boundary": {"values": [], "target": 1},
 "failure": {"values": [5,1,4,2], "target": 4}},
"graphs": {
 "normal": {"vertices": ["A","B","C"], "directed": False, "edges": [["A","B"],["B","C"]]},
 "boundary": {"vertices": ["A"], "directed": True, "edges": [["A","A"]]},
 "failure": {"vertices": ["A","B"], "directed": False, "edges": [["A","Z"],["A","B"],["A","B"]]}},
"oop-model": {
 "normal": {"records": [{"student_id":1,"name":"Ada","score":90},{"student_id":2,"name":"Lin","score":80}]},
 "boundary": {"records": [{"student_id":1,"name":"","score":0}]},
 "failure": {"records": [{"student_id":0,"name":"Bad","score":50},{"student_id":3,"name":"Good","score":100}]}},
"oop-state": {
 "normal": {"start": 20, "limit": 100, "replacement": 40, "delta": 10},
 "boundary": {"start": 0, "limit": 100, "replacement": 100, "delta": 0},
 "failure": {"start": 30, "limit": 100, "replacement": 50, "delta": 60}},
"oop-inheritance": {
 "normal": {"shapes": [{"type":"rectangle","width":3,"height":4},{"type":"circle","radius":2}]},
 "boundary": {"shapes": [{"type":"rectangle","width":0,"height":0}]},
 "failure": {"shapes": [{"type":"rectangle","width":-1,"height":4}]}},
"oop-aggregation": {
 "normal": {"capacity": 3, "items": ["Algorithms","Data"]},
 "boundary": {"capacity": 1, "items": ["Only"]},
 "failure": {"capacity": 1, "items": ["First","Second",42]}},
"text-files": {
 "normal": {"content": "Ada,90\nLin,80\n", "append": "END:2\n"},
 "boundary": {"content": "Solo,0", "append": ""},
 "failure": {"content": "Ada,90,EXTRA\n", "append": "", "committed": "SAFE\n"}},
"random-files": {
 "normal": {"record_size": 8, "records": ["ALPHA","BETA","GAMMA"], "address": 1, "replacement": "DELTA"},
 "boundary": {"record_size": 5, "records": ["A","12345"], "address": 1, "replacement": "Z"},
 "failure": {"record_size": 4, "records": ["ONE","TWO"], "address": 3, "replacement": "BAD"}},
"exceptions": {
 "normal": {"content": "42\n", "previous": 7},
 "boundary": {"content": "   ", "previous": 0},
 "failure": {"content": "99", "previous": 12, "inject_io": True}},
"exam-workflow": {
 "normal": {"rows": [{"name":"Ada","score":90},{"name":"Lin","score":55}], "minimum": 60},
 "boundary": {"rows": [], "minimum": 100},
 "failure": {"rows": [{"name":"Bad","score":101}], "minimum": 60}},
}


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def main() -> None:
    if set(SOURCES) != set(FIXTURES):
        raise AssertionError("source and fixture lesson sets differ")
    for slug in sorted(SOURCES):
        source = SOURCES[slug].strip() + COMMON_TAIL
        write_text(ROOT / slug / "source.py", source)
        for case_kind, fixture in FIXTURES[slug].items():
            write_text(ROOT / slug / "fixtures" / f"{case_kind}.json", json.dumps(fixture, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
    print(json.dumps({"decision": "PASS", "lessons": len(SOURCES), "fixtures": sum(len(value) for value in FIXTURES.values())}, sort_keys=True))


if __name__ == "__main__":
    main()

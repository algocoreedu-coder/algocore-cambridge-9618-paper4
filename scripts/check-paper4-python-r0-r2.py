"""Focused regression checks for the Paper 4 R0/R2 Python repairs."""

from __future__ import annotations

import importlib.util
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, relative: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


data_models = load_module("paper4_data_models", "content/paper4/python/pilot/data-models/source.py")
object_files = load_module("paper4_object_files", "content/paper4/python/pilot/object-files/source.py")
workflow = load_module("paper4_exam_workflow", "content/paper4/python/production/exam-workflow/source.py")
sorting = load_module("paper4_sorting", "content/paper4/python/production/sorting/source.py")
stack = load_module("paper4_stack", "content/paper4/python/production/stack/source.py")
queue = load_module("paper4_queue", "content/paper4/python/pilot/queue/source.py")


assert data_models.valid_record({"name": "Binh", "score": 81})
assert not data_models.valid_record({"name": "Binh", "score": True})
random_trace = []
values = data_models.generate_random_array(6, 10, 20, 3, True, random_trace)
assert len(values) == len(set(values)) == 6
assert all(10 <= value <= 20 for value in values)
assert all(step["event"] == "generate_random_value" for step in random_trace)
try:
    data_models.generate_random_array(3, 1, 2, 0, True, [])
except ValueError:
    pass
else:
    raise AssertionError("RANDOM_ARRAY accepted an impossible unique-value contract")

with tempfile.TemporaryDirectory() as directory:
    invalid_path = Path(directory) / "invalid.csv"
    invalid_path.write_text("BOOK,Algorithms,-5\n", encoding="utf-8")
    trace = []
    books, status = object_files.read_books(invalid_path, trace)
    assert books is None and status == "INVALID_PAGES_AT_LINE_1"
    assert "construct_object" not in {step["event"] for step in trace}
book = object_files.Book("Algorithms", 320)
assert not book.set_pages(True) and book.Pages == 320
assert not book.set_pages(-5) and book.Pages == 320

missing_minimum = workflow.run({"rows": [{"name": "Ada", "score": 90}]})
assert missing_minimum["first_failed_stage"] == "process"
invalid_row = workflow.run({"rows": [{"name": "Bad", "score": 101}], "minimum": 60})
assert invalid_row["first_failed_stage"] == "validate"

ordered = [1, 3, 7]
ordered_trace = []
assert sorting.ordered_insert(ordered, 4, 5, ordered_trace)
assert ordered == [1, 3, 4, 7]
assert "ordered_insert_shift" in {step["event"] for step in ordered_trace}
full = [1, 2]
assert not sorting.ordered_insert(full, 3, 2, []) and full == [1, 2]

pair_trace = []
left, right = stack.stack_from(["blue"]), stack.stack_from([])
assert stack.pair_stacks(left, right, pair_trace) is None
assert left.live() == ["blue"] and right.live() == []
assert pair_trace[-1]["event"] == "pair_rollback"
left, right = stack.stack_from(["red"]), stack.stack_from(["fox"])
assert stack.pair_stacks(left, right, []) == ["red", "fox"]

reduce_trace = []
consume = queue.CircularQueue(3, reduce_trace)
for value in (20, 30, 40):
    consume.enqueue(value)
assert queue.reduce_numeric(consume, False, reduce_trace) == 90
assert consume.live_items() == []
preserve_trace = []
preserve = queue.CircularQueue(2, preserve_trace)
for value in (5, 6):
    preserve.enqueue(value)
assert queue.reduce_numeric(preserve, True, preserve_trace) == 11
assert preserve.live_items() == [5, 6]

print("PASS paper4 Python R0/R2 regression: 3 defects + 4 pattern contracts")

from __future__ import annotations

import json
import sys

from implementation.stack_pilot import (
    stack_pair, stack_pop, stack_push, stack_reduce_expression, stack_setup,
)


def run(pattern: str) -> dict:
    if pattern == "STACK_SETUP":
        s = stack_setup(10, "next_free", None)
        assert s.top == 0 and s.capacity == 10 and s.live_range() == []
        return {"pattern_id": pattern, "source_contract": "StackData[10], StackPointer=0", "snapshot": s.snapshot()}
    if pattern == "STACK_PUSH":
        s = stack_setup(10, "next_free", None)
        result = stack_push(s, 7, result_mode="boolean")
        assert result is True and s.top == 1 and s.snapshot()["live_values"] == [7]
        return {"pattern_id": pattern, "source_contract": "Push integer when space exists; return success", "result": result, "snapshot": s.snapshot()}
    if pattern == "STACK_POP":
        s = stack_setup(10, "next_free", None)
        stack_push(s, 42)
        value = stack_pop(s, empty_value=-1)
        assert value == 42 and s.top == 0
        return {"pattern_id": pattern, "source_contract": "Pop returns top item and updates pointer", "value": value, "snapshot": s.snapshot()}
    if pattern == "STACK_PAIR":
        a = stack_setup(20, "next_free", None); b = stack_setup(10, "next_free", None)
        stack_push(a, "Animal"); stack_push(b, "Red")
        result = stack_pair(a, b)
        assert result["pair"] == ["Animal", "Red"] and result["restores"] == []
        return {"pattern_id": pattern, "source_contract": "OutputItem commits pair when both Pops succeed", "result": result}
    if pattern == "STACK_REDUCE":
        s = stack_setup(20, "next_free", None)
        for item in (4, "+", 3, "-", 20): stack_push(s, item)
        value, steps = stack_reduce_expression(s)
        assert value == 21 and s.logical_size() == 0
        return {"pattern_id": pattern, "source_contract": "Calculate consumes expression stack left-to-right", "value": value, "steps": steps, "snapshot": s.snapshot()}
    raise KeyError(pattern)


def main() -> int:
    if len(sys.argv) != 2:
        return 2
    pattern = sys.argv[1]
    try:
        result = run(pattern)
        result["result"] = "PASS"
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({"pattern_id": pattern, "result": "FAIL", "error": repr(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

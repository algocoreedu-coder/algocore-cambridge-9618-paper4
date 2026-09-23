"""Stage 5 P0 stack pilot implementation.

The module is intentionally self contained and uses a typed, array-backed
stack.  It is an AlgoCore adaptation for verification; it does not claim to
be an official Cambridge answer or literal source transcription.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Literal

TopMode = Literal["next_free", "current_top"]


@dataclass
class EventRecorder:
    events: list[dict[str, Any]] = field(default_factory=list)

    def emit(self, event_id: str, action: str, pre: dict[str, Any], post: dict[str, Any],
             guard: str, invariant: str, output_delta: Any = None) -> None:
        self.events.append({
            "event_id": event_id,
            "action": action,
            "pre_state": pre,
            "post_state": post,
            "guard": guard,
            "invariant_result": invariant,
            "output_delta": output_delta,
        })


@dataclass
class StackState:
    capacity: int
    mode: TopMode
    storage: list[Any]
    top: int
    recorder: EventRecorder | None = None

    def __post_init__(self) -> None:
        if self.capacity <= 0 or len(self.storage) != self.capacity:
            raise ValueError("capacity/storage mismatch")
        self.assert_valid()

    def logical_size(self) -> int:
        return self.top if self.mode == "next_free" else self.top + 1

    def live_range(self) -> list[int]:
        return list(range(self.logical_size()))

    def snapshot(self, output: Any = None, return_value: Any = None) -> dict[str, Any]:
        return {
            "storage": list(self.storage),
            "top": self.top,
            "capacity": self.capacity,
            "mode": self.mode,
            "logical_size": self.logical_size(),
            "live_range": self.live_range(),
            "live_values": [self.storage[i] for i in self.live_range()],
            "output": output,
            "return": return_value,
        }

    def assert_valid(self) -> None:
        if self.mode == "next_free":
            assert 0 <= self.top <= self.capacity
        else:
            assert -1 <= self.top < self.capacity
        assert 0 <= self.logical_size() <= self.capacity

    def _emit(self, event_id: str, action: str, pre: dict[str, Any], guard: str,
              output: Any = None, return_value: Any = None) -> None:
        self.assert_valid()
        if self.recorder:
            self.recorder.emit(event_id, action, pre, self.snapshot(output, return_value),
                               guard, "PASS")


def stack_setup(capacity: int, mode: TopMode, fill: Any = None,
                recorder: EventRecorder | None = None) -> StackState:
    """Executable factory/init entry point returning a canonical snapshot."""
    initial_top = 0 if mode == "next_free" else -1
    state = StackState(capacity, mode, [fill for _ in range(capacity)], initial_top, recorder)
    state._emit("stack-setup.step.initialise", "initialise_empty_stack", state.snapshot(),
                f"mode={mode}; capacity={capacity}")
    return state


def stack_push(state: StackState, item: Any, *, result_mode: str = "boolean",
               recorder: EventRecorder | None = None) -> Any:
    rec = recorder or state.recorder
    pre = state.snapshot()
    full = state.logical_size() == state.capacity
    if full:
        result = (False if result_mode == "boolean" else -1)
        state._emit("stack-push.step.failure", "reject_full", pre, "full_guard", return_value=result)
        return result
    if state.mode == "next_free":
        index = state.top
        state.storage[index] = item
        state.top += 1
    else:
        state.top += 1
        index = state.top
        state.storage[index] = item
    result = True if result_mode == "boolean" else 1
    state._emit("stack-push.step.return-check", "commit_push", pre,
                f"not_full; index={index}", return_value=result)
    return result


def stack_pop(state: StackState, *, empty_value: Any = -1) -> Any:
    pre = state.snapshot()
    if state.logical_size() == 0:
        state._emit("stack-pop.step.failure", "return_empty", pre, "empty_guard",
                     return_value=empty_value)
        return empty_value
    index = state.top - 1 if state.mode == "next_free" else state.top
    value = state.storage[index]
    if state.mode == "next_free":
        state.top -= 1
    else:
        state.top -= 1
    state._emit("stack-pop.step.return-check", "commit_pop", pre,
                f"not_empty; index={index}", return_value=value)
    return value


def stack_pair(left: StackState, right: StackState) -> dict[str, Any]:
    """Transactional pair operation with no sentinel restoration."""
    before_left = left.snapshot()
    before_right = right.snapshot()
    left_value = stack_pop(left)
    left_ok = before_left["logical_size"] > 0
    right_value = stack_pop(right)
    right_ok = before_right["logical_size"] > 0
    restores: list[str] = []
    output: dict[str, Any] = {"label": None, "pair": None, "message": None}
    if left_ok and right_ok:
        output["pair"] = [left_value, right_value]
        output["label"] = "official_source_contract"
    elif left_ok and not right_ok:
        stack_push(left, left_value)
        restores.append("left")
        output["message"] = "No right item"
        output["label"] = "official_source_contract"
    elif not left_ok and right_ok:
        stack_push(right, right_value)
        restores.append("right")
        output["message"] = "No left item"
        output["label"] = "official_source_contract"
    else:
        output["message"] = "No pair (AlgoCore_inference)"
        output["label"] = "AlgoCore_inference"
    output["left_ok"] = left_ok
    output["right_ok"] = right_ok
    output["restores"] = restores
    output["before"] = {"left": before_left, "right": before_right}
    output["after"] = {"left": left.snapshot(), "right": right.snapshot()}
    output["preserved_on_failure"] = (
        output["after"]["left"]["live_values"] == before_left["live_values"] and
        output["after"]["right"]["live_values"] == before_right["live_values"]
        if not (left_ok and right_ok) else True
    )
    output["sentinel_push_count"] = 0
    return output


def stack_reduce_expression(state: StackState) -> tuple[Any, list[dict[str, Any]]]:
    """Left fold: accumulator before operator before next number."""
    trace: list[dict[str, Any]] = []
    first = stack_pop(state)
    trace.append({"kind": "first_value", "value": first})
    total = first
    while state.logical_size():
        operator = stack_pop(state)
        next_value = stack_pop(state)
        trace.append({"kind": "operator_value", "operator": operator, "next": next_value,
                      "acc_before": total})
        if operator == "+": total = total + next_value
        elif operator == "-": total = total - next_value
        elif operator == "*": total = total * next_value
        elif operator == "/": total = total / next_value
        elif operator == "^": total = total ** next_value
        else: raise ValueError(f"unsupported operator: {operator}")
        trace[-1]["acc_after"] = total
    return total, trace


def stack_reduce_extrema(state: StackState) -> tuple[int, int, list[Any]]:
    """Extrema scan initialised from first live item, including all-negative data."""
    first = stack_pop(state)
    values = [first]
    highest = lowest = first
    while state.logical_size():
        value = stack_pop(state)
        values.append(value)
        highest = max(highest, value)
        lowest = min(lowest, value)
    return highest, lowest, values


# Explicit variant-to-entry-point bindings used by fixtures.
ENTRY_POINTS: dict[str, dict[str, str]] = {
    "p0.stack.variant.top-pointer": {
        "next_free": "stack_setup/stack_push/stack_pop(mode=next_free)",
        "current_top": "stack_setup/stack_push/stack_pop(mode=current_top)",
    },
    "p0.stack.variant.push-result": {
        "boolean": "stack_push(result_mode=boolean)",
        "integer_1_minus1": "stack_push(result_mode=integer_1_minus1)",
        "route_and_message": "stack_push(result_mode=boolean)+caller_route",
    },
    "p0.stack.variant.pop-empty-result": {
        "numeric_minus1": "stack_pop(empty_value=-1)",
        "empty_string": "stack_pop(empty_value='')",
        "no_data_string": "stack_pop(empty_value='No data')",
        "string_minus1": "stack_pop(empty_value='-1')",
        "numeric_minus999": "stack_pop(empty_value=-999)",
    },
    "p0.stack.variant.pair-transaction": {
        "both_live": "stack_pair",
        "a_empty_b_live": "stack_pair",
        "a_live_b_empty": "stack_pair",
        "both_empty": "stack_pair",
    },
    "p0.stack.variant.reduce-protocol": {
        "expression_left_fold": "stack_reduce_expression",
        "extrema": "stack_reduce_extrema",
    },
}

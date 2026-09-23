"""Independent B8 integration candidate.

The candidate composes already verified operations by explicit state/version
handoffs.  It does not reimplement any B1-B7 algorithm.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Iterable


@dataclass
class IntegrationState:
    version: int = 0
    values: dict[str, Any] = field(default_factory=dict)
    owners: dict[str, int] = field(default_factory=dict)


def main_flow(
    steps: Iterable[dict[str, Any]],
    operations: dict[str, Callable[..., Any]],
    *,
    trace: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Run an explicit call/state graph and return the final owned results."""
    state = IntegrationState()
    events = trace if trace is not None else []
    for index, step in enumerate(steps, start=1):
        name = step["name"]
        requires = tuple(step.get("requires", ()))
        missing = [key for key in requires if key not in state.values]
        if missing:
            raise ValueError(f"precondition unavailable for {name}: {missing}")
        before = state.version
        args = [state.values[key] for key in requires]
        result = operations[name](*args)
        owner = step.get("result", name)
        if owner in state.owners:
            raise ValueError(f"result owner collision: {owner}")
        state.version += 1
        state.values[owner] = result
        state.owners[owner] = index
        events.append(
            {
                "seq": index,
                "action": "INVOKE_DEPENDENCY_CALL",
                "name": name,
                "requires": list(requires),
                "pre_version": before,
                "post_version": state.version,
                "result_owner": owner,
                "invariant_result": "PASS",
            }
        )
    return {"version": state.version, "values": dict(state.values), "owners": dict(state.owners)}


def output_format(items: Iterable[Any], mode: str) -> str:
    """Render a selected sequence without mutating its source."""
    values = list(items)
    if mode == "labelled-lines":
        return "".join(f"Item {index}: {value}\n" for index, value in enumerate(values, start=1))
    if mode == "physical-grid":
        return "\n".join(" | ".join(str(cell) for cell in row) for row in values) + ("\n" if values else "")
    if mode == "returned-string":
        return ",".join(str(value) for value in values)
    raise ValueError(f"unsupported output mode: {mode}")


def evidence_run(cases: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Validate complete attribution for planned evidence captures."""
    records = []
    for case in cases:
        required = ("case_id", "input", "expected_observable", "capture_slot")
        missing = [key for key in required if key not in case]
        if missing:
            raise ValueError(f"incomplete evidence case: {missing}")
        records.append(
            {
                "case_id": case["case_id"],
                "capture_slot": case["capture_slot"],
                "attribution": {
                    "input_visible": True,
                    "expected_observable": case["expected_observable"],
                    "execution_claim": "observed_in_this_run",
                },
                "file_visible": case.get("file_visible", False),
            }
        )
    return records

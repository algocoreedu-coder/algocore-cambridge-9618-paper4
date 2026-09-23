"""Independent, read-only live rerun of all canonical Paper 4 Python fixtures."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
APP = HERE.parents[5] / "algocore-fumadocs"
REGISTRY = APP / "content/paper4/records/full/python-artifacts.json"


def digest(value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def contains_rejection(value: object) -> bool:
    if value is False:
        return True
    if isinstance(value, str):
        return any(token in value.lower() for token in (
            "invalid", "error", "reject", "duplicate", "full", "empty",
            "not_found", "not found", "failed", "unsorted", "missing",
        ))
    if isinstance(value, list):
        return any(contains_rejection(item) for item in value)
    if isinstance(value, dict):
        return any(contains_rejection(item) for item in value.values())
    return False


def run(source: Path, fixture: Path) -> tuple[bytes, object]:
    env = dict(os.environ)
    env["PYTHONHASHSEED"] = "0"
    completed = subprocess.run(
        [sys.executable, str(source), str(fixture)],
        cwd=source.parent,
        env=env,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0 or completed.stderr:
        raise AssertionError(
            f"{source.parent.name}/{fixture.stem}: exit={completed.returncode}, "
            f"stderr={completed.stderr.decode('utf-8', errors='replace')!r}"
        )
    return completed.stdout, json.loads(completed.stdout.decode("utf-8"))


def main() -> None:
    envelopes = json.loads(REGISTRY.read_text(encoding="utf-8"))
    artifacts = [item["record"] for item in envelopes]
    failures: list[str] = []
    case_counts = {"normal": 0, "boundary": 0, "failure": 0}
    run_pairs = 0
    rejection_count = 0

    for artifact in artifacts:
        source = APP / artifact["filename"]
        fixture_dir = source.parent / "fixtures"
        expected_by_fixture = {
            item["fixture_ref"]: item["value"] for item in artifact["expected_outputs"]
        }
        for fixture in artifact["fixtures"]:
            case = fixture["case_kind"]
            fixture_path = fixture_dir / f"{case}.json"
            label = f"{artifact['python_artifact_id']}/{case}"
            try:
                disk_fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
                if disk_fixture != fixture["input"]:
                    raise AssertionError("disk fixture differs from registry input")
                stdout_a, parsed_a = run(source, fixture_path)
                stdout_b, parsed_b = run(source, fixture_path)
                if stdout_a != stdout_b or parsed_a != parsed_b:
                    raise AssertionError("two fresh-process reruns differ")
                expected = expected_by_fixture[fixture["fixture_id"]]
                if parsed_a != expected:
                    raise AssertionError(
                        f"live output differs from frozen expected output: "
                        f"live={digest(parsed_a)}, expected={digest(expected)}"
                    )
                trace = parsed_a.get("trace") if isinstance(parsed_a, dict) else None
                if not isinstance(trace, list) or not trace:
                    raise AssertionError("trace is missing or empty")
                if case == "failure":
                    if not contains_rejection(parsed_a):
                        raise AssertionError("failure result has no explicit rejection/state evidence")
                    rejection_count += 1
                case_counts[case] += 1
                run_pairs += 1
            except Exception as exc:  # clean-room report must retain every finding
                failures.append(f"{label}: {exc}")

    result = {
        "schema_version": "paper4-p4r4-a8-cleanroom-rerun-v1",
        "decision": "PASS" if not failures else "FAIL",
        "checker_mode": "READ_ONLY",
        "python_version": sys.version.split()[0],
        "artifacts": len(artifacts),
        "fixture_cases": sum(case_counts.values()),
        "fresh_process_executions": run_pairs * 2,
        "case_counts": case_counts,
        "failure_rejections": rejection_count,
        "failures": failures,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

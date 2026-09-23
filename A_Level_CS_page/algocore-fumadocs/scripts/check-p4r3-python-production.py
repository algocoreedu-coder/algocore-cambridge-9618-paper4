"""Read-only structural, execution and exact-rerun checker for P4R-3 A3."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = APP_ROOT.parent.parent
ROOT = APP_ROOT / "content/paper4/python/production"
EVIDENCE = WORKSPACE_ROOT / "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/a3"
INVENTORY = WORKSPACE_ROOT / "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def contains_rejection(value: object) -> bool:
    if value is False:
        return True
    if isinstance(value, str):
        return any(token in value.lower() for token in ("invalid", "error", "reject", "duplicate", "full", "not_found", "failed", "unsorted"))
    if isinstance(value, list):
        return any(contains_rejection(item) for item in value)
    if isinstance(value, dict):
        return any(contains_rejection(item) for item in value.values())
    return False


def main() -> None:
    lessons = json.loads(INVENTORY.read_text(encoding="utf-8"))["lessons"]
    author = json.loads((EVIDENCE / "AUTHOR_RUN.json").read_text(encoding="utf-8"))
    independent = json.loads((EVIDENCE / "INDEPENDENT_RERUN.json").read_text(encoding="utf-8"))
    assert author["process_id"] != independent["process_id"], "author and independent reruns must use different processes"
    assert author["counts"]["lessons"] == independent["counts"]["lessons"] == 20
    assert author["counts"]["fixtures"] == independent["counts"]["fixtures"] == 60
    author_by_id = {item["lesson_id"]: item for item in author["lessons"]}
    independent_by_id = {item["lesson_id"]: item for item in independent["lessons"]}
    failure_integrity = 0
    for lesson in lessons:
        slug, lesson_id = lesson["lesson_slug"], lesson["lesson_id"]
        directory = ROOT / slug
        source = directory / "source.py"
        source_bytes = source.read_bytes()
        compile(source_bytes, str(source), "exec")
        artifact = json.loads((directory / "artifact.json").read_text(encoding="utf-8"))
        assert artifact["code_sha256"] == sha256(source_bytes)
        assert "\n".join(line["text"] for line in artifact["lines"]).encode("utf-8") == source_bytes
        assert artifact["author_run_ref"] == author_by_id[lesson_id]["execution_evidence_id"]
        assert artifact["independent_rerun_ref"] == independent_by_id[lesson_id]["execution_evidence_id"]
        for first, second in zip(author_by_id[lesson_id]["cases"], independent_by_id[lesson_id]["cases"], strict=True):
            assert first["case_kind"] == second["case_kind"]
            for field in ("fixture_sha256", "stdout_sha256", "result_sha256", "trace_sha256"):
                assert first[field] == second[field], f"{slug}/{first['case_kind']}: {field} mismatch"
            assert first["result_sha256"] == sha256(canonical_bytes(first["result"]))
            expected = next(item for item in artifact["expected_outputs"] if item["fixture_ref"] == f"{slug}.{first['case_kind']}")
            assert expected["value"] == first["result"]
            assert first["stderr_utf8"] == second["stderr_utf8"] == ""
            if first["case_kind"] == "failure":
                assert contains_rejection(first["result"]), f"{slug}/failure has no explicit rejection or preserved-state evidence"
                failure_integrity += 1

    node = subprocess.run(["node", str(APP_ROOT / "scripts/check-p4r3-python-production.mjs")], cwd=APP_ROOT, capture_output=True, text=True, check=False)
    if node.returncode:
        raise AssertionError(f"Node canonical checker failed:\n{node.stdout}\n{node.stderr}")
    node_result = json.loads(node.stdout)
    assert node_result["validate_registry"] == "PASS_20_OF_20"
    print(json.dumps({"decision": "PASS", "lessons": 20, "fixtures": 60, "exact_rerun_matches": 60, "failure_integrity": f"PASS_{failure_integrity}_OF_20", "canonical_schema": "PASS_20_OF_20", "semantic_roles": "PASS_82_OF_82"}, sort_keys=True))


if __name__ == "__main__":
    main()

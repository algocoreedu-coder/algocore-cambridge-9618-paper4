"""Read-only structural and hash checker for the P4R-2 Python pilot."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = APP_ROOT.parent.parent
PILOT_ROOT = APP_ROOT / "content" / "paper4" / "python" / "pilot"
EVIDENCE_ROOT = WORKSPACE_ROOT / "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-2/a3"
SLUGS = ("data-models", "binary-search", "queue", "recursion", "hashing", "object-files")
CASES = ("normal", "boundary", "failure")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def main() -> None:
    author = json.loads((EVIDENCE_ROOT / "AUTHOR_RUN.json").read_text(encoding="utf-8"))
    independent = json.loads((EVIDENCE_ROOT / "INDEPENDENT_RERUN.json").read_text(encoding="utf-8"))
    assert author["process_id"] != independent["process_id"], "author and independent runs must be different processes"
    assert author["counts"]["lessons"] == independent["counts"]["lessons"] == 6
    assert author["counts"]["fixtures"] == independent["counts"]["fixtures"] == 18
    author_by_id = {lesson["lesson_id"]: lesson for lesson in author["lessons"]}
    independent_by_id = {lesson["lesson_id"]: lesson for lesson in independent["lessons"]}
    for slug in SLUGS:
        directory = PILOT_ROOT / slug
        source_bytes = (directory / "source.py").read_bytes()
        artifact = json.loads((directory / "artifact.json").read_text(encoding="utf-8"))
        lesson_id = f"ac-9618-p4-2026-python.lesson.{slug}"
        assert artifact["lesson_id"] == lesson_id
        assert artifact["code_sha256"] == sha256(source_bytes)
        reconstructed = "\n".join(line["text"] for line in artifact["lines"]).encode("utf-8")
        assert reconstructed == source_bytes, f"{slug}: displayed line bytes differ from executed source"
        assert [line["order"] for line in artifact["lines"]] == list(range(1, len(artifact["lines"]) + 1))
        assert len({line["line_id"] for line in artifact["lines"]}) == len(artifact["lines"])
        assert artifact["normal_boundary_failure_coverage"] == {kind: True for kind in CASES}
        assert artifact["author_run_ref"] == author_by_id[lesson_id]["execution_evidence_id"]
        assert artifact["independent_rerun_ref"] == independent_by_id[lesson_id]["execution_evidence_id"]
        assert all(set(fixture) == {"fixture_id", "case_kind", "input"} for fixture in artifact["fixtures"])
        assert all(set(output) == {"expected_output_id", "fixture_ref", "value"} for output in artifact["expected_outputs"])
        author_lesson = author_by_id[lesson_id]
        independent_lesson = independent_by_id[lesson_id]
        assert author_lesson["code_sha256"] == independent_lesson["code_sha256"] == artifact["code_sha256"]
        assert author_lesson["execution_log_sha256"] == independent_lesson["execution_log_sha256"] == artifact["execution_log_sha256"]
        for first, second in zip(author_lesson["cases"], independent_lesson["cases"], strict=True):
            assert first["case_kind"] == second["case_kind"]
            for field in ("fixture_sha256", "stdout_sha256", "result_sha256", "trace_sha256"):
                assert first[field] == second[field], f"{slug}/{first['case_kind']}: {field} mismatch"
            assert first["result_sha256"] == sha256(canonical_bytes(first["result"]))
    canonical = subprocess.run(
        ["node", str(APP_ROOT / "scripts" / "check-p4r2-python-pilot.mjs")],
        cwd=APP_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if canonical.returncode != 0:
        raise AssertionError(f"canonical validator failed:\n{canonical.stdout}\n{canonical.stderr}")
    canonical_result = json.loads(canonical.stdout)
    assert canonical_result["validate_registry"] == "PASS_6_OF_6"
    print(json.dumps({"decision": "PASS", "lessons": 6, "fixtures": 18, "exact_rerun_matches": 18, "canonical_schema": "PASS_6_OF_6"}, sort_keys=True))


if __name__ == "__main__":
    main()

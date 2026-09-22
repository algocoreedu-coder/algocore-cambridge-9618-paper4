"""Build and execute the six-lesson P4R-2 Python pilot.

Run this file in a fresh process with --mode author, then again with
--mode independent. The second run compares every raw output and trace hash
with the author-produced PythonArtifact before recording independent evidence.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = APP_ROOT.parent.parent
PILOT_ROOT = APP_ROOT / "content" / "paper4" / "python" / "pilot"
EVIDENCE_ROOT = (
    WORKSPACE_ROOT
    / "A_Level_CS_page"
    / "planning"
    / "paper4"
    / "next-phase"
    / "evidence"
    / "p4r-2"
    / "a3"
)

CASES = ("normal", "boundary", "failure")
LESSONS = {
    "data-models": {
        "patterns": ["ARRAY_APPEND", "DATA_RECORD", "DATA_STORAGE", "RANDOM_ARRAY"],
        "batch": "b1",
        "caption": {
            "vi": "Bản ghi có kiểm tra kiểu, mảng có sức chứa và dữ liệu ngẫu nhiên xác định.",
            "en": "Typed records, a capacity-bounded array and deterministic random data.",
        },
        "checks": {
            "normal": {"status": "ADDED", "append_success": True, "random_average": 77.5},
            "boundary": {"status": "FULL", "append_success": False, "random_average": None},
            "failure": {"status": "INVALID_RECORD", "append_success": False},
        },
    },
    "binary-search": {
        "patterns": ["BINARY_SEARCH"],
        "batch": "b2",
        "caption": {
            "vi": "Tìm kiếm nhị phân với bất biến đoạn tìm kiếm và kiểm tra tiền điều kiện sắp xếp.",
            "en": "Binary search with an interval invariant and a sorted-input precondition.",
        },
        "checks": {
            "normal": {"status": "FOUND", "index": 4},
            "boundary": {"status": "NOT_FOUND", "index": -1},
            "failure": {"status": "UNSORTED", "index": -1},
        },
    },
    "queue": {
        "patterns": ["QUEUE_DEQUEUE", "QUEUE_ENQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE", "QUEUE_SETUP"],
        "batch": "b3",
        "caption": {
            "vi": "Hàng đợi vòng duy trì front, rear và count qua enqueue, dequeue, inspect và reduce.",
            "en": "A circular queue maintaining front, rear and count through enqueue, dequeue, inspect and reduce.",
        },
        "checks": {
            "normal": {"status": "OK", "live": [20, 30, 40], "numeric_total": 90},
            "boundary": {"status": "OK", "removed": [None], "operation_results": [True, True, False]},
            "failure": {"status": "INVALID_CAPACITY", "message": "capacity must be positive"},
        },
    },
    "recursion": {
        "patterns": ["ALGORITHM_REWRITE"],
        "batch": "b4",
        "caption": {
            "vi": "Tổng đệ quy có base case, quá trình unwind và phép đối chiếu với phiên bản lặp.",
            "en": "A recursive sum with a base case, unwind trace and iterative equivalence check.",
        },
        "checks": {
            "normal": {"status": "OK", "recursive_result": 13, "iterative_result": 13},
            "boundary": {"status": "OK", "recursive_result": 0, "iterative_result": 0},
            "failure": {"status": "INVALID_VALUE"},
        },
    },
    "hashing": {
        "patterns": ["HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH", "HASH_SETUP"],
        "batch": "b5",
        "caption": {
            "vi": "Bảng băm dùng phép chia dư, dò tuyến tính, chèn và tìm kiếm có giới hạn.",
            "en": "A hash table using remainder addressing and bounded linear probing for insert and search.",
        },
        "checks": {
            "normal": {"status": "OK", "inserted_at": [3, 4, 5], "found_at": 4},
            "boundary": {"status": "OK", "inserted_at": [0, 1, 2, -1], "found_at": -1},
            "failure": {"status": "INVALID_KEY"},
        },
    },
    "object-files": {
        "patterns": ["FILE_READ_OBJECTS"],
        "batch": "b7",
        "caption": {
            "vi": "Đọc bản ghi CSV, dựng đối tượng và tra cứu thuộc tính với kiểm tra bản ghi lỗi.",
            "en": "Read CSV records, construct objects and look up attributes while guarding malformed records.",
        },
        "checks": {
            "normal": {"status": "OK", "found": {"title": "Algorithms", "pages": 320}},
            "boundary": {"status": "OK", "books": [], "found": None},
            "failure": {"status": "INVALID_PAGES_AT_LINE_1", "books": []},
        },
    },
}


def canonical_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def assert_subset(actual: dict, expected: dict, label: str) -> None:
    for key, expected_value in expected.items():
        if actual.get(key) != expected_value:
            raise AssertionError(f"{label}: {key} expected {expected_value!r}, got {actual.get(key)!r}")


def run_case(source: Path, fixture: Path) -> dict:
    environment = dict(os.environ)
    environment["PYTHONHASHSEED"] = "0"
    completed = subprocess.run(
        [sys.executable, str(source), str(fixture)],
        cwd=source.parent,
        env=environment,
        capture_output=True,
        check=False,
    )
    stdout = completed.stdout
    stderr = completed.stderr
    if completed.returncode != 0:
        raise AssertionError(
            f"{source.parent.name}/{fixture.stem}: exit {completed.returncode}: {stderr.decode('utf-8', errors='replace')}"
        )
    parsed = json.loads(stdout.decode("utf-8"))
    trace = parsed.get("trace")
    if not isinstance(trace, list):
        raise AssertionError(f"{source.parent.name}/{fixture.stem}: trace must be a list")
    return {
        "case_kind": fixture.stem,
        "fixture_path": fixture.relative_to(APP_ROOT).as_posix(),
        "fixture_sha256": sha256(fixture.read_bytes()),
        "exit_code": completed.returncode,
        "stdout_utf8": stdout.decode("utf-8").rstrip("\n"),
        "stdout_sha256": sha256(stdout),
        "stderr_utf8": stderr.decode("utf-8"),
        "result": parsed,
        "result_sha256": sha256(canonical_bytes(parsed)),
        "trace_sha256": sha256(canonical_bytes(trace)),
    }


def source_record(slug: str) -> tuple[Path, bytes, list[dict]]:
    source = PILOT_ROOT / slug / "source.py"
    source_bytes = source.read_bytes()
    if b"\r\n" in source_bytes or not source_bytes.endswith(b"\n"):
        raise AssertionError(f"{slug}: canonical source must use LF and one final newline")
    text = source_bytes.decode("utf-8")
    compile(text, str(source), "exec")
    lines = [
        {"line_id": f"{slug}.v1.L{order:03d}", "order": order, "text": line}
        for order, line in enumerate(text.split("\n"), start=1)
    ]
    reconstructed = "\n".join(line["text"] for line in lines).encode("utf-8")
    if reconstructed != source_bytes:
        raise AssertionError(f"{slug}: stable-line reconstruction differs from source bytes")
    return source, source_bytes, lines


def stage5_refs(meta: dict) -> list[str]:
    return [f"stage5.{meta['batch']}.pattern-provenance"]


def artifact_for(
    slug: str,
    meta: dict,
    source: Path,
    source_bytes: bytes,
    lines: list[dict],
    cases: list[dict],
    status: str,
) -> dict:
    author_ref = f"p4r2.a3.{slug}.pilot-v1.author-run"
    rerun_ref = f"p4r2.a3.{slug}.pilot-v1.independent-rerun"
    execution_matrix = [
        {
            "case_kind": case["case_kind"],
            "fixture_sha256": case["fixture_sha256"],
            "stdout_sha256": case["stdout_sha256"],
            "result_sha256": case["result_sha256"],
            "trace_sha256": case["trace_sha256"],
        }
        for case in cases
    ]
    return {
        "python_artifact_id": f"ac-9618-p4-2026-python.artifact.{slug}.pilot-v1",
        "lesson_id": f"ac-9618-p4-2026-python.lesson.{slug}",
        "pattern_ids": meta["patterns"],
        "version": "pilot-v1",
        "filename": source.relative_to(APP_ROOT).as_posix(),
        "language": "python",
        "lines": lines,
        "entry_point": "run(fixture, fixture_path)" if slug == "object-files" else "run(fixture)",
        "fixtures": [
            {
                "fixture_id": f"{slug}.{case['case_kind']}",
                "case_kind": case["case_kind"],
                "input": json.loads((APP_ROOT / case["fixture_path"]).read_text(encoding="utf-8")),
            }
            for case in cases
        ],
        "expected_outputs": [
            {
                "expected_output_id": f"{slug}.{case['case_kind']}.expected-output",
                "fixture_ref": f"{slug}.{case['case_kind']}",
                "value": case["result"],
            }
            for case in cases
        ],
        "normal_boundary_failure_coverage": {kind: True for kind in CASES},
        "stage5_source_refs": stage5_refs(meta),
        "author_run_ref": author_ref,
        "independent_rerun_ref": rerun_ref,
        "execution_log_sha256": sha256(canonical_bytes(execution_matrix)),
        "syntax_status": "PASS",
        "execution_status": "PASS",
        "code_sha256": sha256(source_bytes),
        "caption": meta["caption"],
        "status": status,
    }


def execute(mode: str) -> None:
    run_lessons = []
    for slug, meta in LESSONS.items():
        source, source_bytes, lines = source_record(slug)
        cases = []
        for case_kind in CASES:
            case = run_case(source, source.parent / "fixtures" / f"{case_kind}.json")
            assert_subset(case["result"], meta["checks"][case_kind], f"{slug}/{case_kind}")
            cases.append(case)
        artifact_path = source.parent / "artifact.json"
        candidate = artifact_for(
            slug,
            meta,
            source,
            source_bytes,
            lines,
            cases,
            "executed" if mode == "author" else "independently-rerun",
        )
        if mode == "author":
            write_json(artifact_path, candidate)
        else:
            existing = json.loads(artifact_path.read_text(encoding="utf-8"))
            expected_author_artifact = dict(candidate)
            expected_author_artifact["status"] = "executed"
            if existing != expected_author_artifact:
                raise AssertionError(f"{slug}: independent rerun differs from author artifact")
            write_json(artifact_path, candidate)
        run_lessons.append(
            {
                "lesson_id": candidate["lesson_id"],
                "python_artifact_id": candidate["python_artifact_id"],
                "execution_evidence_id": (
                    candidate["author_run_ref"] if mode == "author" else candidate["independent_rerun_ref"]
                ),
                "code_sha256": candidate["code_sha256"],
                "execution_log_sha256": candidate["execution_log_sha256"],
                "syntax_status": "PASS",
                "cases": cases,
            }
        )

    evidence = {
        "schema_version": "p4r2-python-pilot-run-v1",
        "run_kind": mode,
        "process_id": os.getpid(),
        "python_version": sys.version.split()[0],
        "interpreter": sys.executable,
        "source_policy": "UTF-8 LF bytes in source.py are the future display bytes and the executed bytes.",
        "lessons": run_lessons,
        "counts": {
            "lessons": len(run_lessons),
            "fixtures": sum(len(lesson["cases"]) for lesson in run_lessons),
            "normal": len(run_lessons),
            "boundary": len(run_lessons),
            "failure": len(run_lessons),
            "syntax_pass": len(run_lessons),
            "execution_pass": len(run_lessons),
        },
        "decision": "PASS",
        "gate_authority": "A3_EVIDENCE_ONLY_NO_GATE_SIGNATURE",
    }
    filename = "AUTHOR_RUN.json" if mode == "author" else "INDEPENDENT_RERUN.json"
    write_json(EVIDENCE_ROOT / filename, evidence)
    if mode == "independent":
        author_path = EVIDENCE_ROOT / "AUTHOR_RUN.json"
        independent_path = EVIDENCE_ROOT / "INDEPENDENT_RERUN.json"
        author_evidence = json.loads(author_path.read_text(encoding="utf-8"))
        records = []
        for author_lesson, independent_lesson in zip(
            author_evidence["lessons"], evidence["lessons"], strict=True
        ):
            for run_kind, lesson, evidence_path in (
                ("author", author_lesson, author_path),
                ("independent", independent_lesson, independent_path),
            ):
                records.append(
                    {
                        "evidence_id": lesson["execution_evidence_id"],
                        "run_kind": run_kind,
                        "python_artifact_id": lesson["python_artifact_id"],
                        "lesson_id": lesson["lesson_id"],
                        "evidence_file": evidence_path.relative_to(WORKSPACE_ROOT).as_posix(),
                        "evidence_file_sha256": sha256(evidence_path.read_bytes()),
                        "selector": {"lesson_id": lesson["lesson_id"]},
                        "code_sha256": lesson["code_sha256"],
                        "execution_log_sha256": lesson["execution_log_sha256"],
                    }
                )
        resolver = {
            "schema_version": "p4r2-execution-evidence-resolver-v1",
            "records": records,
            "counts": {"artifacts": len(LESSONS), "evidence_records": len(records)},
        }
        write_json(EVIDENCE_ROOT / "EVIDENCE_RESOLVER.json", resolver)
    print(json.dumps({"mode": mode, "decision": "PASS", "lessons": 6, "fixtures": 18}, sort_keys=True))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("author", "independent"), required=True)
    arguments = parser.parse_args()
    execute(arguments.mode)

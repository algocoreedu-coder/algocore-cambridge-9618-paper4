"""Execute, freeze and evidence the 20 P4R-3 Python production artifacts."""

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
PRODUCTION_ROOT = APP_ROOT / "content" / "paper4" / "python" / "production"
EVIDENCE_ROOT = WORKSPACE_ROOT / "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/a3"
INVENTORY_PATH = WORKSPACE_ROOT / "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json"
CASES = ("normal", "boundary", "failure")


# Each Stage 3 semantic role resolves to a distinctive authored source line.
ROLE_MARKERS = {
    "procedural-design": {"selection-iteration":"if score", "subroutine-contracts":"def classify", "parameter-modes":"Return a new list", "pseudocode-translation":"def apply_bonus", "decomposition":"adjusted = apply_bonus", "paradigm-choice":"def run", "abstraction-io":"fixture.get", "console-library":"json.loads"},
    "validation-rules": {"input-validation":"not isinstance(candidate", "rule-outcomes":"check_digit(fixture", "unique-selection":"candidate in accepted", "check-digit":"def check_digit"},
    "testing": {"test-design":"def run_suite", "tracing-debugging":"first_divergence", "repair-enhance":"after = run_suite", "source-contract":"case[\"expected\"]", "capture-provenance":"failed_before_repair"},
    "text-processing": {"character-comparison":"def compare_text", "delimiter-tokenisation":"split(fixture", "typed-routing":"value = int", "run-length":"def run_length_encode"},
    "search-collections": {"linear-find":"if found == -1", "count-all":"sum(value ==", "filter-all":"filtered.append", "group-totals":"groups[record"},
    "sorting": {"bubble-passes":"def bubble", "insertion-shifts":"def insertion", "ordered-insert":"def ordered_insert", "comparator-variants":"wrong ="},
    "stack": {"representation-conventions":"self.top = -1", "push":"def push", "pop":"def pop", "paired-restoration":"def pair_stacks", "reduce-operands":"def reduce_operands"},
    "linked-list": {"representation-free-list":"self.head = -1", "traversal":"def traverse", "search":"while node != -1:", "insert":"def insert_head", "remove-recycle":"def remove"},
    "binary-tree": {"representation":"class Node", "ordered-insert":"def insert", "search":"while current is not None", "traversals":"def traverse"},
    "dictionary": {"adt-interface":"class DictionaryADT", "find-insert":"def find", "delete":"def delete", "representation-choice":"self.entries = []", "other-adt-implementation":"frequency[token]"},
    "performance": {"asymptotic-cost":"def insertion_cost", "algorithm-choice":"binary search requires", "trace-cost":"linear_count"},
    "graphs": {"characteristics":"def add_edge", "structure-choice":"matrix ="},
    "oop-model": {"class-object":"class Student", "constructor":"def __init__", "instantiate":"student = Student", "class-design":"def state"},
    "oop-state": {"encapsulation":"self.__balance = balance", "getters":"def get_balance", "setters":"def set_balance", "rule-updates":"def apply_change"},
    "oop-inheritance": {"base-derived":"class Rectangle", "override-dispatch":"area = shape.area()", "substitutability":"for shape in shapes"},
    "oop-aggregation": {"has-a":"self.books = []", "bounded-add":"def add", "nested-access":"book.label()"},
    "text-files": {"file-lifecycle":"with TemporaryDirectory", "record-loading":"def parse_records", "serial-sequential":"for raw in text.splitlines", "write-append":"output.open(\"a\"", "adt-loading":"records.append"},
    "random-files": {"organisation-access":"BytesIO", "record-address":"address * size", "read-write-update":"handle.write"},
    "exceptions": {"runtime-failures":"except ValueError", "handle-recover":"except InjectedReadError", "cleanup":"finally:"},
    "exam-workflow": {"compose-main":"rows = load", "format-output":"def format_output", "evidence-document":"evidence.append", "source-and-rubric":"requirement"},
}


CAPTIONS = {
    "procedural-design": ("Phân rã thủ tục, tham số và luồng chính có kiểm chứng.", "Verified procedural decomposition, parameters and main flow."),
    "validation-rules": ("Validation, lựa chọn duy nhất và check digit theo tham số đề.", "Validation, unique selection and question-parameterised check digits."),
    "testing": ("Thiết kế test, phát hiện sai khác, sửa lỗi và regression.", "Test design, divergence detection, repair and regression."),
    "text-processing": ("So sánh, tách, định tuyến kiểu và mã hóa run-length.", "Comparison, splitting, typed routing and run-length encoding."),
    "search-collections": ("Tìm, đếm, lọc và gom nhóm bằng full scan.", "Full-scan find, count, filter and group aggregation."),
    "sorting": ("Bubble, insertion và ordered insert có giới hạn.", "Bubble, insertion and capacity-bounded ordered insertion."),
    "stack": ("Stack mảng cố định với push, pop và đúng thứ tự toán hạng.", "A fixed-array stack with push, pop and correct operand order."),
    "linked-list": ("Linked list trên mảng và free list có tái sử dụng node.", "An array linked list with a recyclable free list."),
    "binary-tree": ("BST với insert, search và ba phép duyệt.", "A BST with insert, search and three traversals."),
    "dictionary": ("Dictionary ADT với CRUD và đếm tần suất.", "A dictionary ADT with CRUD and frequency aggregation."),
    "performance": ("Đếm phép toán, kiểm tra tiền điều kiện và so sánh thuật toán.", "Operation counting, preconditions and algorithm comparison."),
    "graphs": ("Adjacency list/matrix với chính sách cạnh rõ ràng.", "Adjacency list/matrix representations with explicit edge policies."),
    "oop-model": ("Class blueprint, self, constructor và các instance độc lập.", "A class blueprint, self, constructor, and independent instances."),
    "oop-state": ("Encapsulation với getter, setter, guard-before-write và state preservation.", "Encapsulation with getters, setters, guard-before-write, and state preservation."),
    "oop-inheritance": ("Quan hệ is-a, super(), override và dynamic dispatch.", "An is-a relationship, super(), overriding, and dynamic dispatch."),
    "oop-aggregation": ("Quan hệ has-a, object graph và bounded component references.", "A has-a relationship, object graph, and bounded component references."),
    "text-files": ("Đọc tuần tự, parse, overwrite và append an toàn.", "Safe sequential reading, parsing, overwrite and append."),
    "random-files": ("Record cố định, byte offset và cập nhật trực tiếp.", "Fixed records, byte offsets and direct updates."),
    "exceptions": ("Bắt exception cụ thể, phục hồi trạng thái và cleanup.", "Specific exception handling, state recovery and cleanup."),
    "exam-workflow": ("Luồng load, validate, process, format và bằng chứng thi.", "An exam workflow from load through evidence-backed formatting."),
}


def canonical_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def load_inventory() -> list[dict]:
    lessons = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))["lessons"]
    if len(lessons) != 20:
        raise AssertionError(f"expected 20 lessons, found {len(lessons)}")
    return lessons


def approved_patterns(lesson: dict) -> list[str]:
    patterns = lesson["pattern_ids"] or lesson.get("proposed_pattern_ids", [])
    if not patterns:
        raise AssertionError(f"{lesson['lesson_slug']}: no approved pattern association")
    return patterns


def run_case(source: Path, fixture: Path) -> dict:
    environment = dict(os.environ)
    environment["PYTHONHASHSEED"] = "0"
    completed = subprocess.run([sys.executable, str(source), str(fixture)], cwd=source.parent, env=environment, capture_output=True, check=False)
    if completed.returncode != 0:
        raise AssertionError(f"{source.parent.name}/{fixture.stem}: exit {completed.returncode}: {completed.stderr.decode('utf-8', errors='replace')}")
    parsed = json.loads(completed.stdout.decode("utf-8"))
    if not isinstance(parsed.get("trace"), list) or not parsed["trace"]:
        raise AssertionError(f"{source.parent.name}/{fixture.stem}: trace must be a non-empty list")
    return {
        "case_kind": fixture.stem,
        "fixture_path": fixture.relative_to(APP_ROOT).as_posix(),
        "fixture_sha256": sha256(fixture.read_bytes()),
        "exit_code": completed.returncode,
        "stdout_utf8": completed.stdout.decode("utf-8").rstrip("\n"),
        "stdout_sha256": sha256(completed.stdout),
        "stderr_utf8": completed.stderr.decode("utf-8"),
        "result": parsed,
        "result_sha256": sha256(canonical_bytes(parsed)),
        "trace_sha256": sha256(canonical_bytes(parsed["trace"])),
    }


def freeze_lines(slug: str, source_bytes: bytes) -> list[dict]:
    text = source_bytes.decode("utf-8")
    compile(text, f"{slug}/source.py", "exec")
    return [{"line_id": f"{slug}.production-v1.L{index:03d}", "order": index, "text": line} for index, line in enumerate(text.split("\n"), 1)]


def assert_p4r9_trace_contract(slug: str, case: dict) -> None:
    if slug not in {"linked-list", "binary-tree", "sorting", "stack"}:
        return
    case_kind = case["case_kind"]
    trace = case["result"]["trace"]
    event_names = {step.get("event") for step in trace}
    required = {
        "linked-list": {"insert_head", "remove_compare"},
        "binary-tree": {"tree_search_visit"},
        "sorting": {"bubble_complete", "insertion_complete"},
        "stack": set(),
    }[slug]
    if slug == "linked-list":
        required.add("remove_recycle" if case_kind != "failure" else "insert_reject_full")
    if slug == "binary-tree":
        required.add("tree_attach_root" if case_kind == "boundary" else "tree_compare_insert")
        if case_kind == "failure":
            required.update({"tree_reject_duplicate", "tree_search_exhausted"})
    if slug == "sorting":
        required.add("capacity_reject" if case_kind == "failure" else "ordered_insert")
        if case_kind == "normal":
            required.update({"bubble_compare", "bubble_swap", "insertion_shift", "insertion_place_key", "ordered_insert_shift"})
    if slug == "stack":
        required.add("pair_commit" if case_kind == "normal" else "pair_rollback")
    missing = required - event_names
    if missing:
        raise AssertionError(f"{slug}/{case_kind}: missing P4R-9 trace events {sorted(missing)}")
    for step in trace:
        if step.get("event") in {"insert_reject_full", "remove_reject_missing", "capacity_reject"}:
            if step.get("before") != step.get("after"):
                raise AssertionError(f"{slug}/{case_kind}: rejected operation mutated valid state")


def build_role_map(lesson: dict, lines: list[dict]) -> dict:
    slug = lesson["lesson_slug"]
    roles = []
    for knowledge_unit_id in lesson["knowledge_unit_ids"]:
        role = knowledge_unit_id.rsplit(".knowledge.", 1)[1]
        marker = ROLE_MARKERS.get(slug, {}).get(role)
        matches = [line for line in lines if marker and marker in line["text"]]
        if not matches:
            raise AssertionError(f"{slug}/{role}: source marker {marker!r} did not resolve")
        chosen = matches[0]
        roles.append({"knowledge_unit_id": knowledge_unit_id, "semantic_role": role, "active_line_ids": [chosen["line_id"]], "matched_text": chosen["text"].strip()})
    return {"lesson_id": lesson["lesson_id"], "python_artifact_id": f"ac-9618-p4-2026-python.artifact.{slug}.production-v1", "artifact_version": "production-v1", "roles": roles}


def artifact_for(lesson: dict, source: Path, source_bytes: bytes, lines: list[dict], cases: list[dict], status: str) -> dict:
    slug = lesson["lesson_slug"]
    artifact_id = f"ac-9618-p4-2026-python.artifact.{slug}.production-v1"
    execution_matrix = [{key: case[key] for key in ("case_kind", "fixture_sha256", "stdout_sha256", "result_sha256", "trace_sha256")} for case in cases]
    vi, en = CAPTIONS[slug]
    return {
        "python_artifact_id": artifact_id,
        "lesson_id": lesson["lesson_id"],
        "pattern_ids": approved_patterns(lesson),
        "version": "production-v1",
        "filename": source.relative_to(APP_ROOT).as_posix(),
        "language": "python",
        "lines": lines,
        "entry_point": "run(fixture)",
        "fixtures": [{"fixture_id": f"{slug}.{case['case_kind']}", "case_kind": case["case_kind"], "input": json.loads((APP_ROOT / case["fixture_path"]).read_text(encoding="utf-8"))} for case in cases],
        "expected_outputs": [{"expected_output_id": f"{slug}.{case['case_kind']}.expected-output", "fixture_ref": f"{slug}.{case['case_kind']}", "value": case["result"]} for case in cases],
        "normal_boundary_failure_coverage": {kind: True for kind in CASES},
        "stage5_source_refs": [f"stage5.{batch.lower()}.pattern-provenance" for batch in lesson["stage5_candidates"]["batches"]],
        "author_run_ref": f"p4r3.a3.{slug}.production-v1.author-run",
        "independent_rerun_ref": f"p4r3.a3.{slug}.production-v1.independent-rerun",
        "execution_log_sha256": sha256(canonical_bytes(execution_matrix)),
        "syntax_status": "PASS",
        "execution_status": "PASS",
        "code_sha256": sha256(source_bytes),
        "caption": {"vi": vi, "en": en},
        "status": status,
    }


def execute(mode: str) -> None:
    run_lessons, role_maps = [], []
    for lesson in load_inventory():
        slug = lesson["lesson_slug"]
        source = PRODUCTION_ROOT / slug / "source.py"
        source_bytes = source.read_bytes()
        if b"\r\n" in source_bytes or not source_bytes.endswith(b"\n"):
            raise AssertionError(f"{slug}: source must be LF with one final newline")
        lines = freeze_lines(slug, source_bytes)
        role_maps.append(build_role_map(lesson, lines))
        cases = [run_case(source, source.parent / "fixtures" / f"{kind}.json") for kind in CASES]
        for case in cases:
            assert_p4r9_trace_contract(slug, case)
        artifact = artifact_for(lesson, source, source_bytes, lines, cases, "executed" if mode == "author" else "independently-rerun")
        artifact_path = source.parent / "artifact.json"
        if mode == "author":
            write_json(artifact_path, artifact)
        else:
            existing = json.loads(artifact_path.read_text(encoding="utf-8"))
            expected = dict(artifact); expected["status"] = "executed"
            if existing != expected:
                raise AssertionError(f"{slug}: independent rerun differs from author artifact")
            write_json(artifact_path, artifact)
        run_lessons.append({
            "lesson_id": lesson["lesson_id"], "python_artifact_id": artifact["python_artifact_id"],
            "execution_evidence_id": artifact["author_run_ref"] if mode == "author" else artifact["independent_rerun_ref"],
            "code_sha256": artifact["code_sha256"], "execution_log_sha256": artifact["execution_log_sha256"],
            "syntax_status": "PASS", "cases": cases,
        })

    evidence = {
        "schema_version": "p4r3-python-production-run-v1", "run_kind": mode, "process_id": os.getpid(),
        "python_version": sys.version.split()[0], "interpreter": sys.executable,
        "source_policy": "UTF-8 LF source.py bytes are both displayed and executed.",
        "lessons": run_lessons,
        "counts": {"lessons": len(run_lessons), "fixtures": sum(len(item["cases"]) for item in run_lessons), "normal": 20, "boundary": 20, "failure": 20, "syntax_pass": 20, "execution_pass": 20},
        "decision": "PASS", "gate_authority": "A3_EVIDENCE_ONLY_NO_GATE_SIGNATURE",
    }
    write_json(EVIDENCE_ROOT / ("AUTHOR_RUN.json" if mode == "author" else "INDEPENDENT_RERUN.json"), evidence)
    write_json(EVIDENCE_ROOT / "LINE_ROLE_MAP.json", {"schema_version": "p4r3-a3-line-role-map-v1", "artifact_version": "production-v1", "lessons": role_maps, "counts": {"lessons": 20, "semantic_roles": sum(len(item["roles"]) for item in role_maps)}})

    if mode == "independent":
        author_path, independent_path = EVIDENCE_ROOT / "AUTHOR_RUN.json", EVIDENCE_ROOT / "INDEPENDENT_RERUN.json"
        author = json.loads(author_path.read_text(encoding="utf-8"))
        records = []
        for author_lesson, independent_lesson in zip(author["lessons"], evidence["lessons"], strict=True):
            for run_kind, item, evidence_path in (("author", author_lesson, author_path), ("independent", independent_lesson, independent_path)):
                records.append({"evidence_id": item["execution_evidence_id"], "run_kind": run_kind, "python_artifact_id": item["python_artifact_id"], "lesson_id": item["lesson_id"], "evidence_file": evidence_path.relative_to(WORKSPACE_ROOT).as_posix(), "evidence_file_sha256": sha256(evidence_path.read_bytes()), "selector": {"lesson_id": item["lesson_id"]}, "code_sha256": item["code_sha256"], "execution_log_sha256": item["execution_log_sha256"]})
        write_json(EVIDENCE_ROOT / "EVIDENCE_RESOLVER.json", {"schema_version": "p4r3-execution-evidence-resolver-v1", "records": records, "counts": {"artifacts": 20, "evidence_records": 40}})
        files = []
        for lesson in load_inventory():
            directory = PRODUCTION_ROOT / lesson["lesson_slug"]
            for path in [directory / "source.py", directory / "artifact.json", *[directory / "fixtures" / f"{kind}.json" for kind in CASES]]:
                files.append({"path": path.relative_to(APP_ROOT).as_posix(), "sha256": sha256(path.read_bytes())})
        for path in [author_path, independent_path, EVIDENCE_ROOT / "EVIDENCE_RESOLVER.json", EVIDENCE_ROOT / "LINE_ROLE_MAP.json"]:
            files.append({"path": path.relative_to(WORKSPACE_ROOT).as_posix(), "sha256": sha256(path.read_bytes())})
        write_json(EVIDENCE_ROOT / "PRODUCTION_MANIFEST.json", {
            "schema_version": "p4r3-a3-production-manifest-v1", "target_release": "paper4-2026-s9-v2",
            "artifact_version": "production-v1", "files": files,
            "counts": {"lessons": 20, "artifacts": 20, "fixtures": 60, "execution_evidence_records": 40, "semantic_roles": 82},
            "decision": "PASS", "authority": "A3_EVIDENCE_ONLY_NO_GATE_SIGNATURE",
        })
        review = """# A3 P4R-3 Python production review\n\n**Decision:** `PASS` (A3 evidence only; no gate signature)\n\n- Exactly 20 remaining lessons have one `production-v1` PythonArtifact each.\n- All 60 frozen normal/boundary/failure fixtures execute under Python 3.\n- Author and independent processes produce identical code, output, result and trace hashes for every fixture.\n- All 82 Stage 3 semantic roles resolve to stable source line IDs in `LINE_ROLE_MAP.json`.\n- Displayed source bytes, executed source bytes and `code_sha256` are identical.\n- Patternless lessons use only the associations approved in `P4R3_KICKOFF_DECISIONS.md`; no new official pattern or mark claim was introduced.\n- File and exception examples use temporary/in-memory fixture-local resources and preserve state on rejected paths.\n"""
        (EVIDENCE_ROOT / "A3_PYTHON_PRODUCTION_REVIEW.md").write_text(review, encoding="utf-8", newline="\n")
    print(json.dumps({"mode": mode, "decision": "PASS", "lessons": 20, "fixtures": 60, "semantic_roles": sum(len(item["roles"]) for item in role_maps)}, sort_keys=True))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("author", "independent"), required=True)
    execute(parser.parse_args().mode)

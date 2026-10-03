from __future__ import annotations

import json
import importlib.util
import re
import subprocess
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "content" / "paper4" / "mocks"
MANIFEST = PACK / "manifest.json"


def fail(message: str) -> None:
    raise AssertionError(message)


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def localized(value: object, label: str) -> None:
    if not isinstance(value, dict) or not all(isinstance(value.get(k), str) and value[k].strip() for k in ("en", "vi")):
        fail(f"{label} must contain non-empty en and vi strings")


def validate_paper(paper: dict, solution: dict, entry: dict) -> list[Path]:
    required = {
        "schema_version", "paper_id", "authority", "title", "mode", "duration_minutes",
        "total_marks", "language_contract", "scope", "source_files", "submission_checklist",
        "evidence_document_checklist", "questions",
    }
    missing = required - paper.keys()
    if missing:
        fail(f"{entry['paper']}: missing {sorted(missing)}")
    if paper["paper_id"] != entry["paper_id"] or solution.get("paper_id") != entry["paper_id"]:
        fail(f"{entry['paper_id']}: paper/solution identity mismatch")
    if paper["authority"] != "AlgoCore_authored" or solution.get("authority") != "AlgoCore_authored_rubric":
        fail(f"{entry['paper_id']}: authority mismatch")
    if solution.get("official_marks", "missing") is not None:
        fail(f"{entry['paper_id']}: official_marks must be null")
    localized(paper["title"], f"{entry['paper_id']}.title")
    if paper["language_contract"] != "en_canonical_vi_support_same_tasks_marks_data":
        fail(f"{entry['paper_id']}: locale contract mismatch")
    question_marks = sum(q["marks"] for q in paper["questions"])
    if question_marks != paper["total_marks"] or question_marks != entry["marks"]:
        fail(f"{entry['paper_id']}: mark total {question_marks} does not match declared total")
    if paper["duration_minutes"] != entry["duration_minutes"]:
        fail(f"{entry['paper_id']}: duration mismatch")
    if paper["duration_minutes"] is not None:
        pacing = sum(q["recommended_minutes"] for q in paper["questions"])
        if pacing != paper["duration_minutes"]:
            fail(f"{entry['paper_id']}: pacing total {pacing} != duration")
    if entry["kind"] == "full" and (paper["total_marks"], paper["duration_minutes"]) != (75, 150):
        fail(f"{entry['paper_id']}: full mock must be 75 marks / 150 minutes")
    if entry["kind"] == "full":
        topics = " ".join(topic.lower() for q in paper["questions"] for topic in q["topics"])
        for category in ("oop", "file"):
            if category not in topics:
                fail(f"{entry['paper_id']}: missing {category} coverage")
        if not any(token in topics for token in ("stack", "queue", "tree", "algorithm", "sort", "search")):
            fail(f"{entry['paper_id']}: missing ADT/algorithm coverage")
        if len(paper["source_files"]) < 1:
            fail(f"{entry['paper_id']}: full mock has no source/input files")
    for collection in ("submission_checklist", "evidence_document_checklist"):
        if len(paper[collection]) < 2:
            fail(f"{entry['paper_id']}: incomplete {collection}")
        for index, item in enumerate(paper[collection]):
            localized(item, f"{entry['paper_id']}.{collection}[{index}]")
    question_ids = []
    for q in paper["questions"]:
        question_ids.append(q["question_id"])
        if q.get("authority") != "AlgoCore_authored":
            fail(f"{q['question_id']}: incorrect authority")
        localized(q.get("prompt"), f"{q['question_id']}.prompt")
        for collection in ("deliverables", "evidence_required"):
            for index, item in enumerate(q.get(collection, [])):
                localized(item, f"{q['question_id']}.{collection}[{index}]")
        if any(topic.lower() == "graph" for topic in q["topics"]):
            if q.get("graph_task_mode") != "describe_classify_justify_only":
                fail(f"{q['question_id']}: graph task exceeds 2026 Paper 4 scope")
    answers = solution.get("answers", [])
    if [a.get("question_id") for a in answers] != question_ids:
        fail(f"{entry['paper_id']}: solution questions do not match paper order")
    for question, answer in zip(paper["questions"], answers):
        if answer.get("marks") != question["marks"]:
            fail(f"{question['question_id']}: solution mark mismatch")
        if "mark_groups" in answer:
            fail(f"{question['question_id']}: anonymous mark_groups are not allowed")
        rubric = answer.get("rubric", [])
        if sum(group.get("marks", 0) for group in rubric) != answer["marks"]:
            fail(f"{question['question_id']}: rubric groups do not sum to marks")
        for group in rubric:
            if group.get("marks") != 1:
                fail(f"{question['question_id']}.{group.get('criterion_id')}: each observable checkpoint must be one mark")
            localized(group.get("evidence"), f"{question['question_id']}.{group.get('criterion_id')}.evidence")
            localized(group.get("dependency_credit"), f"{question['question_id']}.{group.get('criterion_id')}.dependency_credit")
            credit_points = group.get("credit_points", {})
            if any(len(credit_points.get(locale, [])) != group["marks"] for locale in ("en", "vi")):
                fail(f"{question['question_id']}.{group.get('criterion_id')}: credit points must equal allocated marks in both locales")
        if question["question_id"] == "HB1":
            roles = {role: sum(group["marks"] for group in rubric if group.get("scope_role") == role) for role in ("core", "enrichment")}
            if roles != {"core": 6, "enrichment": 4}:
                fail(f"HB1 rubric must match printed 6+4 core/enrichment split, got {roles}")
        if question["question_id"] == "HA2":
            evidence_text = " ".join(group["evidence"]["en"].lower() for group in rubric)
            for required_phrase in ("write mode", "append mode", "preserves"):
                if required_phrase not in evidence_text:
                    fail(f"HA2 rubric does not explicitly assess {required_phrase}")
    paper_dir = (PACK / entry["paper"]).parent
    for relative in paper["source_files"]:
        if not (paper_dir / relative).is_file():
            fail(f"{entry['paper_id']}: missing source file {relative}")
    refs = []
    for relative in solution.get("reference_files", []):
        path = paper_dir / relative
        if not path.is_file():
            fail(f"{entry['paper_id']}: missing reference file {relative}")
        refs.append(path)
    return refs


def main() -> int:
    manifest = load(MANIFEST)
    schema = load(PACK / "mock-pack.schema.json")
    schema_validator = Draft202012Validator(schema)
    if manifest.get("official_cambridge_material") is not False:
        fail("manifest must explicitly deny official Cambridge authority")
    if manifest.get("dry_run_status") != "NOT_RUN":
        fail("timed dry-run status must remain NOT_RUN until independent timed records exist")
    if manifest.get("independent_review_status") not in {"REWORK_REQUIRED_2_RECHECK_PENDING", "PASS"}:
        fail("independent content-review status must record rework or a later signed result")
    papers = manifest.get("papers", [])
    if len(papers) != 5:
        fail("pack must contain diagnostic, two half-papers and two full mocks")
    kinds = [p["kind"] for p in papers]
    if kinds.count("diagnostic") != 1 or kinds.count("half") != 2 or kinds.count("full") != 2:
        fail(f"incorrect pack topology: {kinds}")
    refs: list[Path] = []
    paper_question_ids: list[str] = []
    for entry in papers:
        paper_path = PACK / entry["paper"]
        solution_path = PACK / entry["solution"]
        if paper_path.parent == solution_path.parent and paper_path.name == solution_path.name:
            fail(f"{entry['paper_id']}: solution is not separate")
        paper, solution = load(paper_path), load(solution_path)
        paper_question_ids.extend(question["question_id"] for question in paper["questions"])
        schema_errors = sorted(schema_validator.iter_errors(paper), key=lambda error: list(error.path))
        if schema_errors:
            first = schema_errors[0]
            fail(f"{entry['paper_id']}: schema error at {list(first.path)}: {first.message}")
        refs.extend(validate_paper(paper, solution, entry))
    assessment_wrappers = []
    for relative in ("content/paper4/assessments/pilot/assessment-items.json", "content/paper4/assessments/production/assessment-items.json"):
        assessment_wrappers.extend(load(ROOT / relative))
    canonical_ids = {wrapper["record"]["assessment_item_id"] for wrapper in assessment_wrappers}
    canonical_patterns = {pattern for wrapper in assessment_wrappers for pattern in wrapper["record"]["pattern_ids"]}
    source_basis = manifest.get("source_basis", {})
    if len(canonical_ids) != source_basis.get("canonical_assessment_count"):
        fail(f"canonical assessment denominator drift: {len(canonical_ids)}")
    if len(canonical_patterns) != source_basis.get("pattern_family_count"):
        fail(f"pattern-family denominator drift: {len(canonical_patterns)}")
    lineage = manifest.get("question_lineage", {})
    if set(lineage) != set(paper_question_ids):
        fail("question_lineage must cover every paper question exactly once")
    for question_id, record in lineage.items():
        unknown_assessments = set(record.get("canonical_assessment_ids", [])) - canonical_ids
        unknown_patterns = set(record.get("pattern_ids", [])) - canonical_patterns
        if unknown_assessments or unknown_patterns or not record.get("syllabus_areas"):
            fail(f"{question_id}: unresolved lineage assessments={sorted(unknown_assessments)} patterns={sorted(unknown_patterns)}")
    required_coverage = {"recursion", "algorithm_complexity", "bubble_sort", "adt_from_adt", "file_write", "file_append", "dictionary_adt", "hash_linear_probing"}
    coverage = manifest.get("coverage_matrix", {})
    if required_coverage - coverage.keys():
        fail(f"coverage matrix missing {sorted(required_coverage - coverage.keys())}")
    if coverage["hash_linear_probing"].get("role") != "enrichment":
        fail("hash linear probing must be labelled enrichment")
    all_text = "\n".join(path.read_text(encoding="utf-8") for path in PACK.rglob("*.json"))
    if re.search(r"9618/[0-9]{2}", all_text):
        fail("invented or borrowed Cambridge paper code detected")
    generic_rubric_phrases = ("visibly demonstrates", "associated with", "relevant guard or boundary", "required data remains consistent", "expected and actual evidence")
    lowered_pack_text = all_text.lower()
    if any(phrase in lowered_pack_text for phrase in generic_rubric_phrases):
        fail("generic generated rubric language remains")
    half_b_paper = load(PACK / "half-b" / "paper.json")
    half_b_submit = " ".join(item["en"].lower() for item in half_b_paper["submission_checklist"])
    if "all three" not in half_b_submit or "hb3_algorithms.py" not in half_b_submit:
        fail("Half-paper B checklist must request HB1-HB3 evidence and the HB3 source file")
    executed = []
    for ref in refs:
        result = subprocess.run([sys.executable, str(ref)], cwd=ref.parent, text=True, capture_output=True, timeout=15)
        if result.returncode != 0:
            fail(f"reference solution failed: {ref.relative_to(ROOT)}\n{result.stderr}")
        if not result.stdout.strip():
            fail(f"reference solution produced no evidence: {ref.relative_to(ROOT)}")
        expected_path = ref.with_suffix(".expected.txt")
        if not expected_path.is_file():
            fail(f"missing expected output: {expected_path.relative_to(ROOT)}")
        expected = expected_path.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
        actual = result.stdout.replace("\r\n", "\n").strip()
        if actual != expected:
            fail(f"output drift: {ref.relative_to(ROOT)}")
        executed.append(str(ref.relative_to(ROOT)))
    member_file = PACK / "half-b" / "inputs" / "members.dat"
    member_bytes = member_file.read_bytes()
    if len(member_bytes) % 20 or any(len(record) != 20 or record[-1:] != b"\n" for record in [member_bytes[i:i + 20] for i in range(0, len(member_bytes), 20)]):
        fail("half-b members.dat violates exact 20-byte LF record contract")
    def load_module(name: str, path: Path):
        spec = importlib.util.spec_from_file_location(name, path)
        module = importlib.util.module_from_spec(spec)
        assert spec and spec.loader
        spec.loader.exec_module(module)
        return module
    half_a = load_module("half_a_reference_check", PACK / "half-a" / "solutions" / "half_a_reference.py")
    for required_name in ("Initialise", "Append", "RemoveFirst", "ToList"):
        if not callable(getattr(half_a, required_name, None)):
            fail(f"HA1 reference has no named {required_name} function")
    if [half_a.removal_trace(target)["removed"] for target in ("A", "C", "D", "X")] != [True, True, True, False]:
        fail("HA1 removal traces do not cover first/middle/last/absent")
    half_b = load_module("half_b_reference_check", PACK / "half-b" / "solutions" / "half_b_reference.py")
    for member_id, points in ((1000000, 0), (999999, 1000000000000)):
        try:
            half_b.Member(member_id, points)
            fail("HB2 accepted an overflowing fixed record")
        except ValueError:
            pass
    mock_a_q2 = load_module("mock_a_q2_check", PACK / "mock-a" / "solutions" / "q2_readings.py")
    readings, errors = mock_a_q2.load_readings(PACK / "mock-a" / "inputs" / "readings.txt")
    if any(item.get_sensor_id() == "" for item in readings) or not any("empty sensor id" in error for error in errors):
        fail("MA2 does not reject empty sensor IDs")
    mock_b_q1 = load_module("mock_b_q1_check", PACK / "mock-b" / "solutions" / "q1_stack.py")
    valid, position, trace = mock_b_q1.check_expression("([)]")
    if valid or position != 3 or not trace or trace[-1].get("bracket") != ")":
        fail("MB1 mismatch trace omits the mismatching bracket")
    report = {
        "status": "PASS",
        "papers": len(papers),
        "diagnostics": kinds.count("diagnostic"),
        "half_papers": kinds.count("half"),
        "full_mocks_150m_75marks": kinds.count("full"),
        "reference_solutions_executed": len(executed),
        "question_lineage_resolved": len(lineage),
        "canonical_assessment_bank_checked": len(canonical_ids),
        "pattern_families_checked": len(canonical_patterns),
        "coverage_matrix_requirements_checked": len(required_coverage),
        "prompt_reference_boundary_checks": 5,
        "task_specific_rubric_points_checked": sum(question["marks"] for entry in papers for question in load(PACK / entry["paper"])["questions"]),
        "executed": executed,
        "er3_gate": "NOT_PASS_UNTIL_INDEPENDENT_DRY_RUNS",
        "paper_ready_effect": False,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Stage 2 C0 authority and corpus invariant validator.

This checker is intentionally limited to the frozen Stage 0/1 authority and
the Stage 2 bootstrap. It does not classify questions or make academic claims.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


EXPECTED_AUTHORITY = [
    ("A_Level_CS_page/planning/paper1/stage-0/SCOPE_AND_COVERAGE_PLAN.md", 5751, "1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb"),
    ("A_Level_CS_page/planning/paper1/stage-0/evidence/a3/SYLLABUS_SCOPE.md", 8228, "87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c"),
    ("A_Level_CS_page/planning/paper1/stage-0/evidence/a3/COVERAGE_PLAN.md", 17815, "178a39a20790bd14ace7acf78d44fed4a43d4aa13f69e3ea035889f0e8c1a305"),
    ("A_Level_CS_page/planning/paper1/stage-0/evidence/a3/PILOT_SCOPE_CHECK.md", 6381, "619a575cfaa3c3a516b192e0f32f8fe8b55b18fa0230285ac9442ccc64e0905a"),
    ("A_Level_CS_page/planning/paper1/stage-0/LEARNING_PAGE_CONTRACT.md", 8781, "95008f7fbab736368010b14994ee3d6a4d9f14b319dba8f0c8fcb8ed6a37fee3"),
    ("A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json", 121886, "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    ("697372-2026-syllabus.pdf", 746673, "bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470"),
    ("dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf", 20003507, "0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1"),
    ("A_Level_CS_page/planning/paper1/stage-1/CORPUS_INDEX.jsonl", 2328319, "9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d"),
    ("A_Level_CS_page/planning/paper1/stage-1/CORPUS_MANIFEST.json", 6751, "0c053152796cd539a833d8a91dbdf2954539e413824f9b961b5f522047076e0a"),
    ("A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md", 3675, "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    ("A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md", 2535, "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
    ("A_Level_CS_page/planning/paper1/stage-1/UNRESOLVED_REGISTER.md", 5511, "35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0"),
    ("A_Level_CS_page/planning/paper1/stage-1/FINAL_INTEGRITY_CHECK.json", 4826, "1f81e4a20a3fe99f48d67b4aaec927d54b89213c3d3f174aed6e693f2f455e2d"),
    ("A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/FINAL_REVIEW_REPORT.md", 4457, "d3fac5ec05428056f43845143c4ed407b3e94956d6c772b687d48230616ef14c"),
    ("A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/FINAL_MACHINE_CHECKS.json", 24922, "54049c6320733afb56782b0efa8884340786db5b5c9678153ce6a78d448742c4"),
    ("A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/HANDOFF_FINAL.json", 7510, "710d78b46663ecbbbdcfd570167be3cf95c2b7636d7315b2414e333d501c3384"),
    ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/final/A9_FINAL_V2_HANDOFF_AUDIT.json", 3742, "8dd1b75189aa0c7967f00a2f8d6cfef1a63c5df2f83443fc689597bf58689ba5"),
    ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/final/STAGE1_GATE_DECISION.json", 2384, "43b794f3fd5850332ab6d0f6bfed883586a365f0357744a485eea6869f8b61ed"),
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def locate_root() -> Path:
    here = Path(__file__).resolve()
    marker = Path("A_Level_CS_page/planning/paper1/stage-2")
    for candidate in [Path.cwd().resolve(), *here.parents]:
        if (candidate / marker).is_dir():
            return candidate
    raise RuntimeError("workspace root not found")


def main() -> int:
    root = locate_root()
    errors: list[str] = []
    authority = []
    for rel, expected_bytes, expected_sha in EXPECTED_AUTHORITY:
        p = root / rel
        exists = p.is_file()
        actual_bytes = p.stat().st_size if exists else None
        actual_sha = sha256(p) if exists else None
        passed = exists and actual_bytes == expected_bytes and actual_sha == expected_sha
        authority.append({
            "path": rel,
            "expected_bytes": expected_bytes,
            "actual_bytes": actual_bytes,
            "expected_sha256": expected_sha,
            "actual_sha256": actual_sha,
            "result": "PASS" if passed else "FAIL",
        })
        if not passed:
            errors.append(f"authority drift: {rel}")

    coverage = (root / EXPECTED_AUTHORITY[2][0]).read_text(encoding="utf-8")
    objective_ids = re.findall(r"^\|\s*(AC26-[0-9]+\.[0-9]+-[0-9]+)\s*\|", coverage, re.M)

    corpus_path = root / "A_Level_CS_page/planning/paper1/stage-1/CORPUS_INDEX.jsonl"
    records = [json.loads(line) for line in corpus_path.read_text(encoding="utf-8").splitlines()]
    record_types = Counter(r["record_type"] for r in records)
    questions = [r for r in records if r["record_type"] == "question"]
    parts = [r for r in records if r["record_type"] == "part"]
    marking = [r for r in records if r["record_type"] == "marking_item"]

    parts_by_question: dict[str, list[dict]] = defaultdict(list)
    child_parts: dict[str, list[dict]] = defaultdict(list)
    for part in parts:
        parts_by_question[part["question_id"]].append(part)
        parent = part.get("parent_part_id_or_null")
        if parent:
            child_parts[parent].append(part)

    whole_questions = [q for q in questions if not parts_by_question[q["id"]]]
    leaf_parts = [p for p in parts if not child_parts[p["id"]]]
    atomic_ids = {q["id"] for q in whole_questions} | {p["id"] for p in leaf_parts}
    question_containers = [q for q in questions if parts_by_question[q["id"]]]
    parent_part_containers = [p for p in parts if child_parts[p["id"]]]
    container_ids = {q["id"] for q in question_containers} | {p["id"] for p in parent_part_containers}

    scoring_marks = [m for m in marking if m.get("link_type") != "PARENT_CONTEXT_ONLY"]
    context_marks = [m for m in marking if m.get("link_type") == "PARENT_CONTEXT_ONLY"]
    target_counts = Counter(
        m.get("part_id_or_null") or m.get("question_id_or_null") for m in scoring_marks
    )
    atomic_one_target = sum(target_counts[x] == 1 for x in atomic_ids)
    extra_scoring_targets = sorted(set(target_counts) - atomic_ids)

    atomic_records = whole_questions + leaf_parts
    mark_total = sum(r.get("marks_displayed_or_null") or 0 for r in atomic_records)
    paper_totals: dict[str, int] = defaultdict(int)
    for r in atomic_records:
        source_id = r.get("source_qp_id") or r.get("qp_locator", {}).get("source_id")
        paper_totals[source_id] += r.get("marks_displayed_or_null") or 0

    unresolved_qp = [r for r in questions + parts if r.get("status") == "UNRESOLVED"]
    unresolved_marking = [r for r in marking if r.get("status") == "UNRESOLVED"]
    command_words = [
        r for r in questions + parts if r.get("command_word_verbatim_or_null") not in (None, "")
    ]

    a9_handoff = json.loads((root / EXPECTED_AUTHORITY[16][0]).read_text(encoding="utf-8"))
    a9_outputs = {x["path"]: x.get("sha256") for x in a9_handoff["review_outputs"]}
    a9_direct_pin_match = (
        a9_outputs.get(EXPECTED_AUTHORITY[14][0]) == EXPECTED_AUTHORITY[14][2]
        and a9_outputs.get(EXPECTED_AUTHORITY[15][0]) == EXPECTED_AUTHORITY[15][2]
    )

    checks = {
        "authority_19_exact": all(x["result"] == "PASS" for x in authority),
        "objective_parent_count_99": len(objective_ids) == 99 and len(set(objective_ids)) == 99,
        "question_roots_247": len(questions) == 247,
        "parts_1025": len(parts) == 1025,
        "atomic_893": len(atomic_ids) == 893,
        "leaf_parts_875": len(leaf_parts) == 875,
        "whole_questions_18": len(whole_questions) == 18,
        "containers_379": len(container_ids) == 379,
        "question_containers_229": len(question_containers) == 229,
        "parent_part_containers_150": len(parent_part_containers) == 150,
        "marking_rows_927": len(marking) == 927,
        "scoring_links_893": len(scoring_marks) == 893,
        "parent_context_marking_34": len(context_marks) == 34,
        "atomic_exactly_one_target_893": atomic_one_target == 893 and not extra_scoring_targets,
        "marks_2250": mark_total == 2250,
        "papers_30_each_75": len(paper_totals) == 30 and all(v == 75 for v in paper_totals.values()),
        "unresolved_128": len(unresolved_qp) + len(unresolved_marking) == 128,
        "unresolved_question_part_94": len(unresolved_qp) == 94,
        "unresolved_marking_34": len(unresolved_marking) == 34,
        "command_word_observations_233": len(command_words) == 233,
        "a9_report_and_machine_hashes_match_handoff": a9_direct_pin_match,
        "stage1_gate_pass": json.loads((root / EXPECTED_AUTHORITY[18][0]).read_text(encoding="utf-8")).get("decision") == "PASS",
    }
    for name, passed in checks.items():
        if not passed:
            errors.append(f"check failed: {name}")

    result = {
        "schema_version": "1.0",
        "check_id": "P1-S2-A0-C0-VALIDATION",
        "checked_date_local": "2026-09-22",
        "result": "PASS" if not errors else "FAIL",
        "authority_inputs": authority,
        "counts": {
            "record_types": dict(sorted(record_types.items())),
            "objective_parent_ids": len(objective_ids),
            "question_roots": len(questions),
            "parts": len(parts),
            "leaf_parts": len(leaf_parts),
            "whole_questions": len(whole_questions),
            "atomic_assessment_units": len(atomic_ids),
            "question_containers": len(question_containers),
            "parent_part_containers": len(parent_part_containers),
            "non_scoring_containers": len(container_ids),
            "marking_rows": len(marking),
            "scoring_links": len(scoring_marks),
            "parent_context_marking_rows": len(context_marks),
            "atomic_units_with_exactly_one_target": atomic_one_target,
            "marks": mark_total,
            "papers": len(paper_totals),
            "papers_with_75_marks": sum(v == 75 for v in paper_totals.values()),
            "unresolved_question_or_part": len(unresolved_qp),
            "unresolved_marking": len(unresolved_marking),
            "unresolved_total": len(unresolved_qp) + len(unresolved_marking),
            "command_word_observations": len(command_words),
        },
        "checks": {k: "PASS" if v else "FAIL" for k, v in checks.items()},
        "errors": errors,
        "scope_stop": {
            "classification_performed": False,
            "holdout_selected": False,
            "stage0_or_stage1_modified": False,
        },
    }

    out = root / "A_Level_CS_page/planning/paper1/stage-2/evidence/a0/bootstrap/C0_VALIDATION.json"
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"result": result["result"], "counts": result["counts"], "errors": errors}, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())

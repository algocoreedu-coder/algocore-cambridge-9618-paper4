from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path


S4 = Path(__file__).resolve().parents[1]
S3 = S4.parent / "stage-3"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    gaps_path = S3 / "GAP_REGISTER.json"
    lessons_path = S3 / "LESSON_PACKAGES.json"
    assessments_path = S4 / "ASSESSMENT_DESIGN_BRIEFS.json"
    gaps = load(gaps_path)
    lessons = load(lessons_path)
    assessments = load(assessments_path)
    req_to_assessment = {x["requirement_id"]: x["assessment_id"] for x in assessments["requirement_coverage"]}
    block_patterns = {
        block["block_id"]: block.get("pattern_ids", [])
        for lesson in lessons["lessons"]
        for block in lesson["blocks"]
    }
    objective_rows = []
    for row in gaps["objective_obligations"]:
        reqs = row["assessment_requirement_ids"]
        pattern_ids = list(dict.fromkeys(
            p for block_id in row["knowledge_block_ids"] for p in block_patterns.get(block_id, [])
        ))
        objective_rows.append({
            "gap_id": row["gap_id"],
            "objective_id": row["objective_id"],
            "priority": row["priority"],
            "scope": row["scope"],
            "corpus_coverage": row["corpus_coverage"],
            "capability": {"vi": row["capability_vi"], "en": row["capability_en"]},
            "knowledge_block_ids": row["knowledge_block_ids"],
            "pattern_ids": pattern_ids,
            "assessment_requirement_ids": reqs,
            "assessment_ids": list(dict.fromkeys(req_to_assessment[r] for r in reqs)),
            "stage4_disposition": "ASSESSMENT_DESIGNED_METHOD_LINKED" if pattern_ids else "ASSESSMENT_DESIGNED_SUPPORT_ONLY",
            "closure_boundary": "Stage 4 closes the design obligation only. Stage 5 verifies executable solutions/traces and Stage 6 authors learner-facing tasks.",
            "downstream_status": "PENDING_STAGE5_AND_STAGE6",
        })
    book_rows = []
    for index, row in enumerate(gaps["book_specific_gaps"], 1):
        pattern_id = row["pattern_id"]
        book_rows.append({
            "book_gap_id": f"S4-BOOK-GAP-{index:02d}",
            "pattern_id": pattern_id,
            "gap": row["gap"],
            "stage3_disposition": row["disposition"],
            "stage4_disposition": "Use the coursebook only for cited foundations; the canonical pattern card, solution design, error prevention and worked-example spec carry the missing exam-specific protocol with AlgoCore authority labels.",
            "required_stage4_refs": [
                f"PATTERN_CARDS.json#{pattern_id}",
                f"SOLUTION_DESIGN_BRIEFS.json#{pattern_id}",
                f"WORKED_EXAMPLE_SPECS.json#{pattern_id}",
                f"PRELIMINARY_VISUAL_BRIEFS.json#{pattern_id}",
            ],
            "downstream_status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
        })
    priority_counts = Counter(x["priority"] for x in objective_rows)
    checks = {
        "objective_obligations_107": len(objective_rows) == 107,
        "authored_capability_checks_65": priority_counts["AUTHORED_CAPABILITY_CHECK"] == 65,
        "transfer_checks_42": priority_counts["TRANSFER_CHECK"] == 42,
        "book_gaps_19": len(book_rows) == 19,
        "all_requirements_join_assessment": all(x["assessment_ids"] for x in objective_rows),
        "all_book_gaps_have_four_refs": all(len(x["required_stage4_refs"]) == 4 for x in book_rows),
    }
    if not all(checks.values()):
        raise SystemExit(checks)
    out = {
        "schema_version": "s4-gap-disposition-v1",
        "status": "LEAD_REVIEWED",
        "input_hashes": {
            "stage-3/GAP_REGISTER.json": hashlib.sha256(gaps_path.read_bytes()).hexdigest(),
            "stage-3/LESSON_PACKAGES.json": hashlib.sha256(lessons_path.read_bytes()).hexdigest(),
            "stage-4/ASSESSMENT_DESIGN_BRIEFS.json": hashlib.sha256(assessments_path.read_bytes()).hexdigest(),
        },
        "counts": {
            "objective_obligations": len(objective_rows),
            "authored_capability_checks": priority_counts["AUTHORED_CAPABILITY_CHECK"],
            "transfer_checks": priority_counts["TRANSFER_CHECK"],
            "book_specific_gaps": len(book_rows),
        },
        "objective_dispositions": objective_rows,
        "book_gap_dispositions": book_rows,
        "source_issue_carryover_ref": "SOURCE_CAVEAT_CARRYOVER.json",
        "self_checks": checks,
    }
    target = S4 / "GAP_DISPOSITIONS.json"
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# Stage 4 gap dispositions", "", "Status: **LEAD_REVIEWED**.", "",
        "- 107/107 non-excluded objective obligations have an assessment destination.",
        "- 65/65 authored capability checks and 42/42 transfer checks are designed.",
        "- 19/19 coursebook-specific gaps have explicit Stage 4 artifact obligations.",
        "- Source defects and caveats remain in `SOURCE_CAVEAT_CARRYOVER.json`.", "",
        "These dispositions close design coverage only. They do not claim that Python, traces, assessments or lessons have been authored or executed.",
    ]
    (S4 / "GAP_DISPOSITIONS.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    validation = {"status": "PASS", "checks": checks, "counts": out["counts"], "artifact_sha256": hashlib.sha256(target.read_bytes()).hexdigest()}
    (S4 / "evidence" / "GAP_DISPOSITION_VALIDATION.json").write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(validation, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

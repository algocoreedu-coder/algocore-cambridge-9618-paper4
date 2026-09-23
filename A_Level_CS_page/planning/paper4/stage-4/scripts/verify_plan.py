"""Read-only verification for the Stage 4 coordination plan."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
PAPER = ROOT.parent

def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def main():
    errors = []
    checks = 0
    def check(condition, message):
        nonlocal checks
        checks += 1
        if not condition:
            errors.append(message)

    batch = read(ROOT / "BATCH_PLAN.json")
    status = read(ROOT / "STATUS.json")
    catalog = read(PAPER / "stage-2/EXAM_PATTERN_CATALOG.json")
    qmap = read(PAPER / "stage-2/QUESTION_PATTERN_MAP.json")
    packages = read(PAPER / "stage-3/LESSON_PACKAGES.json")

    source_totals = {key: sum(row[key] for row in batch["source_batches"])
                     for key in ["papers", "questions", "parts", "marks"]}
    for key, source_key in [("papers", "papers"), ("questions", "questions"),
                            ("parts", "parts"), ("marks", "original_marks")]:
        check(source_totals[key] == qmap["counts"][source_key],
              f"Source batch total mismatch: {key}")

    planned = [pattern for row in batch["method_batches"] for pattern in row["pattern_ids"]]
    official = [row["pattern_id"] for row in catalog["patterns"]]
    check(len(planned) == len(set(planned)), "Pattern appears in more than one method batch")
    check(set(planned) == set(official), "Method batches do not partition the catalog")
    check(len(planned) == 58, "Expected 58 method patterns")

    package_map = {row["package_id"].split(".")[-1]: set(row["pattern_ids"])
                   for row in packages["packages"]}
    for row in batch["method_batches"]:
        expected = set().union(*(package_map[name] for name in row["packages"]))
        check(set(row["pattern_ids"]) == expected,
              f"Package/pattern mismatch in {row['batch_id']}")
    check(package_map["support"] == set(), "Support package unexpectedly has pattern IDs")

    check(status["input_release"] == batch["input_release"] == "paper4-2026-s3-v1",
          "Input release mismatch")
    check(status["production_status"] in {"NOT_STARTED", "INPUT_AND_SOURCE_MAPPING", "PILOT", "BATCH_PRODUCTION", "PILOT_PASSED_BATCH_PRODUCTION", "FINAL_QA", "COMPLETE"},
          "Unknown production status")
    check(status["pilot"]["pattern_ids"] == batch["method_batches"][0]["pattern_ids"],
          "Pilot IDs differ between STATUS and BATCH_PLAN")
    check(status["planned_counts"]["pattern_cards"] == len(planned), "Status pattern count mismatch")
    check(status["planned_counts"]["corpus_parts_to_disposition"] == source_totals["parts"],
          "Status part count mismatch")

    required = [
        "README.md", "STAGE4_MASTER_PLAN.md", "WORK_ORDERS.md", "SCHEMA_CONTRACTS.md",
        "GATE_CHECKLIST.md", "LEAD_PLANNING_DECISIONS.md", "PLANNING_REVIEW.md",
        "BATCH_PLAN.json", "STATUS.json", "INPUT_LOCK.json",
        "schemas/pattern-card.schema.json", "schemas/marking-row.schema.json",
        "schemas/error-prevention.schema.json", "schemas/design-briefs.schema.json",
        "evidence/A1_METHOD_PLANNING_REVIEW.md", "evidence/A4_MARKS_PLANNING_REVIEW.md",
        "evidence/A5_LEARNING_EXPERIENCE_PLANNING_REVIEW.md",
    ]
    for path in required:
        check((ROOT / path).is_file(), f"Missing planning artifact: {path}")

    result = {"status": "PASS" if not errors else "FAIL", "checks": checks,
              "source_totals": source_totals, "method_patterns": len(planned),
              "method_batches": len(batch["method_batches"]), "errors": errors}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return bool(errors)

if __name__ == "__main__":
    sys.exit(main())

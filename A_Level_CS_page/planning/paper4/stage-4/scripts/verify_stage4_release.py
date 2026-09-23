from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


S4 = Path(__file__).resolve().parents[1]


def load(name: str):
    return json.loads((S4 / name).read_text(encoding="utf-8"))


def sha(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    errors = []
    checks = 0

    def check(condition, message):
        nonlocal checks
        checks += 1
        if not condition:
            errors.append(message)

    manifest = load("RELEASE_MANIFEST.json")
    gate = load("GATE_REVIEW.json")
    status = load("STATUS.json")
    qa = load("evidence/qa/final/A8_FINAL_QA.json")
    pass2 = load("evidence/lead-review/LEAD_PASS2.json")
    cards = load("PATTERN_CARDS.json")
    errors_doc = load("ERROR_PREVENTION_MATRIX.json")
    marking = load("MARKING_MAP.json")
    assessment = load("ASSESSMENT_DESIGN_BRIEFS.json")

    check(manifest["release_id"] == gate["release_id"] == status["release_id"] == "paper4-2026-s4-v1", "release id mismatch")
    check(manifest["status"] == "LOCKED", "manifest is not locked")
    check(gate["status"] == "PASS", "gate is not PASS")
    check(status["status"] == status["production_status"] == "COMPLETE", "stage status is not complete")
    check(status["stage5_status"] == gate["stage5_status"] == manifest["stage5_status"] == "NOT_STARTED", "Stage 5 boundary mismatch")
    check(qa["status"] == "PASS_RECOMMENDED" and not qa["active_findings"], "A8 final QA is not clean")
    check(qa["validator"]["status"] == "PASS" and qa["validator"]["checks"] == 53, "A8 validator summary mismatch")
    check(pass2["status"] == "PASS", "Lead pass 2 is not PASS")
    check(all(gate["checks"].values()), "gate contains a failed check")
    check(len(cards["pattern_cards"]) == 58 and all(x["status"] == "DESIGN_REVIEWED" for x in cards["pattern_cards"]), "pattern-card status/count mismatch")
    check(len(errors_doc["error_rows"]) == 154 and all(x["status"] == "DESIGN_REVIEWED" for x in errors_doc["error_rows"]), "error-row status/count mismatch")
    check(marking["counts"]["parts"] == 672 and marking["counts"]["official_marks"] == 2175 and marking["counts"]["marking_points"] == 2236, "marking totals mismatch")
    check(assessment["counts"]["assessment_designs"] == 37 and assessment["counts"]["assessment_requirements"] == 107, "assessment totals mismatch")
    check(len(manifest["files"]) == len({x["path"] for x in manifest["files"]}), "duplicate manifest path")
    for item in manifest["files"]:
        path = S4 / item["path"]
        check(path.is_file(), f"missing manifest file: {item['path']}")
        if path.is_file():
            check(sha(path) == item["sha256"], f"manifest hash mismatch: {item['path']}")
    for name, expected in qa["canonical_hashes"].items():
        check(sha(S4 / name) == expected, f"A8 canonical hash drift: {name}")
    for name, expected in pass2["final_design_hashes"].items():
        check(sha(S4 / name) == expected, f"Lead pass 2 hash drift: {name}")

    result = {
        "release_id": manifest["release_id"],
        "status": "PASS" if not errors else "FAIL",
        "checks": checks,
        "files_locked": len(manifest["files"]),
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())

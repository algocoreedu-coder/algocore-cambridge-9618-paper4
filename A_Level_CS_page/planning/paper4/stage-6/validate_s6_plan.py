import json
from pathlib import Path

root = Path(__file__).resolve().parent
stage3 = json.loads((root.parent / "stage-3" / "LESSON_PACKAGES.json").read_text(encoding="utf-8-sig"))
batch = json.loads((root / "BATCH_PLAN.json").read_text(encoding="utf-8-sig"))
status = json.loads((root / "STATUS.json").read_text(encoding="utf-8-sig"))
stage5 = json.loads((root.parent / "stage-5" / "STATUS.json").read_text(encoding="utf-8-sig"))
checks = {}
canon = sorted(p["package_id"] for p in stage3["packages"])
checks["canonical_package_bijection"] = sorted(batch["canonical_packages"]) == canon and len(batch["canonical_packages"]) == len(canon)
checks["stage3_counts"] = (len(stage3["packages"]) == 13 and len(stage3["lessons"]) == 26 and len(stage3["assessment_requirements"]) == 107)
checks["stage5_release"] = stage5["release_id"] == "paper4-2026-s5-v1" and stage5["status"] == "EXECUTION_VERIFIED" and stage5["release_verification_status"] == "PASS"
checks["wave_ids"] = [w["wave"] for w in batch["waves"]] == ["S6-0","S6-A","S6-B","S6-C","S6-D","S6-E","S6-F","S6-G","S6-H"]
checks["exact_denominators"] = batch["stage5_obligation_total"] == 4881 and batch["stage3_assessment_requirements"] == 107 and batch["stage3_destinations"] == 37
checks["s6_contracts"] = all((root / f).exists() for f in ["SCHEMA_CONTRACTS.md","COVERAGE_MATRIX_TEMPLATE.json","DISPOSITION_POLICY.md"])
checks["s6_0_artifacts"] = all((root / "evidence" / "s6-0" / f).exists() for f in ["S6_INPUT_LOCK.json","S6_PACKAGE_INVENTORY.json","S6-0_DELIVERABLE_SCHEMA.json"])
checks["status_not_premature"] = status["status"] == "REWORK_REQUIRED"
result = {"schema_version":"s6-plan-validator-v1", "checks":checks, "result":"PASS" if all(checks.values()) else "FAIL"}
(root / "evidence" / "s6-0" / "S6_PLAN_VALIDATION.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result))
if result["result"] != "PASS": raise SystemExit(1)

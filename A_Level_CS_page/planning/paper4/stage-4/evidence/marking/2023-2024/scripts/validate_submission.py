#!/usr/bin/env python3
"""Mechanical validation for S4-S2. Semantic source review remains a Lead duty."""

from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
OUT = HERE.parent
P4 = OUT.parents[3]
S1 = P4 / "stage-1"
S2 = P4 / "stage-2"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    req = load(OUT / "QUESTION_REQUIREMENTS.json")
    mark = load(OUT / "MARKING_SUBMISSION.json")
    risk = load(OUT / "SOURCE_RISK_REGISTER.json")
    stage2 = load(S2 / "QUESTION_PATTERN_MAP.json")
    manifest = load(S1 / "SOURCE_MANIFEST.json")
    baseline = {x["part_id"]: x for x in stage2["rows"] if x.get("analyst_batch") == "2023-2024"}
    source_pages = {x["source_id"]: x["page_count"] for x in manifest["sources"] if "page_count" in x}
    risk_ids = {x["issue_id"] for x in risk["risks"]}

    checks: list[tuple[str, bool]] = []
    add = lambda name, ok: checks.append((name, bool(ok)))
    req_rows = {x["part_id"]: x for x in req["rows"]}
    mark_rows = {x["part_id"]: x for x in mark["parts"]}
    add("baseline has 304 unique parts", len(baseline) == 304)
    add("question requirements exact part set", set(req_rows) == set(baseline))
    add("marking submission exact part set", set(mark_rows) == set(baseline))
    add("part marks total 900", sum(x["marks"] for x in mark_rows.values()) == 900)
    add("12 papers", len({x["paper_id"] for x in mark_rows.values()}) == 12)
    add("36 questions", len({x["question_id"] for x in mark_rows.values()}) == 36)
    add("all statuses SUBMITTED", req["status"] == mark["status"] == risk["status"] == "SUBMITTED")
    add("one requirement row per part", len(req["rows"]) == len(req_rows) == 304)
    add("one marking row per part", len(mark["parts"]) == len(mark_rows) == 304)
    add("all requirement atoms nonempty", all(x["requirement_atoms"] for x in req_rows.values()))
    req_ids = [a["requirement_id"] for x in req_rows.values() for a in x["requirement_atoms"]]
    add("requirement atom IDs unique", len(req_ids) == len(set(req_ids)))
    mp_ids = [p["marking_point_id"] for x in mark_rows.values() for p in x["marking_points"]]
    add("marking point IDs unique", len(mp_ids) == len(set(mp_ids)))
    add("all parts have marking atoms", all(x["marking_points"] for x in mark_rows.values()))
    add("all marking atoms official MS", all(p["authority"] == "official_ms" for x in mark_rows.values() for p in x["marking_points"]))
    add("all marking atoms have source locators", all(p["ms_source_id"] and p["ms_pdf_pages"] for x in mark_rows.values() for p in x["marking_points"]))
    add("all MS pages in source range", all(all(1 <= n <= source_pages[p["ms_source_id"]] for n in p["ms_pdf_pages"]) for x in mark_rows.values() for p in x["marking_points"]))
    add("all QP pages in source range", all(all(1 <= n <= source_pages[x["qp_requirement"]["source_id"]] for n in x["qp_requirement"]["pdf_pages"]) for x in mark_rows.values()))
    add("all criteria nonempty", all(p["criterion_paraphrase"].strip() for x in mark_rows.values() for p in x["marking_points"]))
    add("award semantics vocabulary", all(p["award_semantics"] in {"discrete", "group_max", "alternative", "dependent", "holistic", "evidence", "accept_equivalent"} for x in mark_rows.values() for p in x["marking_points"]))
    add("individual values conservative", all(p["source_mark_value_if_unambiguous"] in {None, 1} for x in mark_rows.values() for p in x["marking_points"]))
    add("group max only positive", all(p["group_max"] is None or p["group_max"] > 0 for x in mark_rows.values() for p in x["marking_points"]))
    add("method join remains pending", all(not p["method_step_refs"] and p["method_join_status"] == "PENDING_LEAD_METHOD_JOIN" for x in mark_rows.values() for p in x["marking_points"]))
    add("patterns match Stage 2", all(x["assessed_pattern_ids"] == baseline[pid]["assessed_pattern_ids"] and x["context_pattern_ids"] == baseline[pid]["context_pattern_ids"] for pid, x in mark_rows.items()))
    add("no mark duplicated by pattern", all("pattern_mark_allocations" not in x for x in mark_rows.values()))
    add("all issue refs resolve", all(set(x["source_issue_refs"]) <= risk_ids for x in mark_rows.values()))
    all_batch_parts = set(baseline)
    add("all risk part refs resolve", all(set(x["part_ids"]) <= all_batch_parts for x in risk["risks"]))
    add("all risks have both dispositions", all(x["stage4_disposition"] and x["stage5_obligation"] for x in risk["risks"]))
    add("s24 1b mismatch is unallocated", all(p["source_mark_value_if_unambiguous"] is None and p["award_semantics"] == "holistic" for pid in ("9618_s24_41_1(b)", "9618_s24_43_1(b)") for p in mark_rows[pid]["marking_points"]))
    add("downstream code status is not certified", all(x["part_disposition"] == "INDEXED_FOR_STAGE4_METHOD_JOIN" for x in mark_rows.values()))
    explicit_rows = {
        "9618_s24_41_1(e)(ii)": (3, {"discrete"}),
        "9618_s24_43_1(e)(ii)": (3, {"discrete"}),
        "9618_s24_41_1(e)(iii)": (2, {"evidence"}),
        "9618_s24_43_1(e)(iii)": (2, {"evidence"}),
        "9618_s24_41_2(c)": (4, {"discrete"}),
        "9618_s24_43_2(c)": (4, {"discrete"}),
        "9618_s24_41_2(d)(i)": (2, {"discrete"}),
        "9618_s24_43_2(d)(i)": (2, {"discrete"}),
        "9618_w23_41_3(e)(ii)": (2, {"evidence"}),
        "9618_w23_43_3(e)(ii)": (2, {"evidence"}),
    }
    add("facsimile_explicit_mark_rows_are_fully_atomised", all(
        len(mark_rows[pid]["marking_points"]) == expected
        and sum(p["source_mark_value_if_unambiguous"] or 0 for p in mark_rows[pid]["marking_points"]) == mark_rows[pid]["marks"]
        and {p["award_semantics"] for p in mark_rows[pid]["marking_points"]} == semantics
        for pid, (expected, semantics) in explicit_rows.items()
    ))
    max4 = mark_rows["9618_s23_42_2(f)(i)"]["marking_points"]
    setpay = mark_rows["9618_s23_42_3(b)(ii)"]["marking_points"]
    add("alternative_and_group_max_semantics_match_facsimiles",
        len(max4) == 5 and all(p["award_semantics"] == "group_max" and p["group_max"] == 4 and p["source_mark_value_if_unambiguous"] == 1 and p["alternatives"] is None for p in max4)
        and len(setpay) == 3 and [p["award_semantics"] for p in setpay] == ["discrete", "discrete", "alternative"]
        and setpay[2]["alternatives"] == ["Override SetPay in the subclass.", "Call the parent SetPay with the updated hours."])
    add("criterion_paraphrases_contain_no_page_furniture", all("Question Answer Marks" not in p["criterion_paraphrase"] for x in mark_rows.values() for p in x["marking_points"]))
    add("batch_policy_is_not_a_part_source_issue",
        "S4-S2-LAYOUT-CODE-FIDELITY" not in risk_ids
        and all("S4-S2-LAYOUT-CODE-FIDELITY" not in x["source_issue_refs"] for x in mark_rows.values())
        and risk.get("batch_fidelity_policy", {}).get("is_source_issue") is False
        and risk.get("batch_fidelity_policy", {}).get("per_part_source_issue_refs") is False)
    add("retained_source_risks_have_real_nonempty_locators", all(
        x["locators"] and all(loc.get("source_id") in source_pages and loc.get("pdf_pages") for loc in x["locators"])
        for x in risk["risks"]
    ))

    failed = [name for name, ok in checks if not ok]
    report = {
        "schema_version": "1.0",
        "status": "PASS" if not failed else "FAIL",
        "checks_run": len(checks),
        "checks_passed": len(checks) - len(failed),
        "checks_failed": failed,
        "checks": [{"check": name, "pass": ok} for name, ok in checks],
        "counts": {
            "parts": len(mark_rows),
            "marks": sum(x["marks"] for x in mark_rows.values()),
            "requirement_atoms": len(req_ids),
            "marking_point_atoms": len(mp_ids),
            "risk_records": len(risk["risks"]),
        },
        "semantic_boundary": "Mechanical PASS does not replace Lead review of criterion meaning, source alternatives, or original-page formatting.",
    }
    (OUT / "VALIDATION.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

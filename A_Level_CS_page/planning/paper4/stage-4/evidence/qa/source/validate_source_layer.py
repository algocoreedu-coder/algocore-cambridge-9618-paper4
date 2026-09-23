#!/usr/bin/env python3
"""Independent source-layer checks for Paper 4 Stage 4.

This validator intentionally combines mechanical joins with narrowly scoped
semantic regression checks established by A8 facsimile review.  It does not
certify any future teaching method or executable solution.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
STAGE4 = HERE.parents[2]
PAPER4 = STAGE4.parent
STAGE1 = PAPER4 / "stage-1"
STAGE2 = PAPER4 / "stage-2"
MARKING = STAGE4 / "evidence" / "marking"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


checks: list[dict] = []


def check(name: str, passed: bool, detail):
    checks.append({"check": name, "passed": bool(passed), "detail": detail})


s1 = load(STAGE1 / "QUESTION_INDEX.json")
s1_issues = load(STAGE1 / "SOURCE_ISSUES.json")
s1_manifest = load(STAGE1 / "SOURCE_MANIFEST.json")
s2 = load(STAGE2 / "QUESTION_PATTERN_MAP.json")
adjudications = load(STAGE4 / "SOURCE_ADJUDICATIONS.json")

baseline = {}
part_label_index = {}
for paper in s1["papers"]:
    for question in paper["questions"]:
        for part in question["parts"]:
            pid = part["part_id"]
            baseline[pid] = {
                "paper_id": paper["paper_id"],
                "question_id": question["question_id"],
                "marks": part["marks"],
                "part_label": part["part"],
                "qp": part["source_links"]["qp"],
                "ms": part["source_links"]["ms"],
            }
            part_label_index[(paper["paper_id"], part["part"])] = pid

s2_rows = {row["part_id"]: row for row in s2["rows"]}
for pid, item in baseline.items():
    s2row = s2_rows[pid]
    item.update(
        assessed_pattern_ids=s2row["assessed_pattern_ids"],
        context_pattern_ids=s2row["context_pattern_ids"],
        dependency_part_ids=s2row["dependency_part_ids"],
    )

source_ids = {item["source_id"] for item in s1_manifest["sources"]}

batch_expected = {
    "2021-2022": {"papers": 11, "questions": 33, "parts": 228, "marks": 825},
    "2023-2024": {"papers": 12, "questions": 36, "parts": 304, "marks": 900},
    "2025": {"papers": 6, "questions": 18, "parts": 140, "marks": 450},
}

all_qrows = []
all_mrows = []
all_atom_ids = []
join_errors = []
locator_errors = []
batch_results = {}
loaded = {}

for batch, expected in batch_expected.items():
    folder = MARKING / batch
    qdoc = load(folder / "QUESTION_REQUIREMENTS.json")
    mdoc = load(folder / "MARKING_SUBMISSION.json")
    rdoc = load(folder / "SOURCE_RISK_REGISTER.json")
    qrows = qdoc["rows"]
    mrows = mdoc.get("rows", mdoc.get("parts"))
    loaded[batch] = (qdoc, mdoc, rdoc, qrows, mrows)
    all_qrows.extend(qrows)
    all_mrows.extend(mrows)

    qids = [row["part_id"] for row in qrows]
    mids = [row["part_id"] for row in mrows]
    papers = {row["paper_id"] for row in qrows}
    questions = {row["question_id"] for row in qrows}
    marks = sum(baseline[pid]["marks"] for pid in qids)
    batch_results[batch] = {
        "papers": len(papers),
        "questions": len(questions),
        "parts": len(qids),
        "marks": marks,
        "q_duplicates": sorted(pid for pid, n in Counter(qids).items() if n > 1),
        "m_duplicates": sorted(pid for pid, n in Counter(mids).items() if n > 1),
        "part_sets_equal": set(qids) == set(mids),
    }

    for row in qrows:
        pid = row["part_id"]
        base = baseline.get(pid)
        if base is None:
            join_errors.append([batch, pid, "unknown_part_id"])
            continue
        qp = row["qp_requirement"]
        if qp.get("source_id") != base["qp"]["source_id"] or qp.get("pdf_pages") != base["qp"]["pdf_pages"]:
            locator_errors.append([batch, pid, "qp", qp, base["qp"]])
        if row.get("assessed_pattern_ids", row.get("pattern_ids")) != base["assessed_pattern_ids"]:
            join_errors.append([batch, pid, "assessed_pattern_ids"])
        if row.get("context_pattern_ids", []) != base["context_pattern_ids"]:
            join_errors.append([batch, pid, "context_pattern_ids"])
        if row.get("dependency_part_ids", []) != base["dependency_part_ids"]:
            join_errors.append([batch, pid, "dependency_part_ids"])

    for row in mrows:
        pid = row["part_id"]
        base = baseline.get(pid)
        if base is None:
            join_errors.append([batch, pid, "unknown_marking_part_id"])
            continue
        marks = row.get("marks", row.get("original_part_marks"))
        if marks != base["marks"]:
            join_errors.append([batch, pid, "part_marks", marks, base["marks"]])
        if row.get("assessed_pattern_ids", row.get("pattern_ids")) != base["assessed_pattern_ids"]:
            join_errors.append([batch, pid, "marking_assessed_pattern_ids"])
        if row.get("context_pattern_ids", []) != base["context_pattern_ids"]:
            join_errors.append([batch, pid, "marking_context_pattern_ids"])
        if not row.get("marking_points"):
            join_errors.append([batch, pid, "no_marking_points"])
        for atom in row.get("marking_points", []):
            all_atom_ids.append(atom["marking_point_id"])
            if atom.get("authority") != "official_ms":
                locator_errors.append([batch, pid, atom["marking_point_id"], "authority"])
            if atom.get("ms_source_id") != base["ms"]["source_id"]:
                locator_errors.append([batch, pid, atom["marking_point_id"], "ms_source_id"])
            pages = atom.get("ms_pdf_pages", [])
            if not pages or not set(pages).issubset(set(base["ms"]["pdf_pages"])):
                locator_errors.append([batch, pid, atom["marking_point_id"], "ms_pdf_pages", pages, base["ms"]["pdf_pages"]])

check("batch_baselines", all(batch_results[b][k] == v for b, ex in batch_expected.items() for k, v in ex.items()), batch_results)
check("union_exact_672_parts", len(all_qrows) == 672 and len({r["part_id"] for r in all_qrows}) == 672 and {r["part_id"] for r in all_qrows} == set(baseline), {"rows": len(all_qrows), "unique": len({r['part_id'] for r in all_qrows})})
check("marking_union_exact_672_parts", len(all_mrows) == 672 and len({r["part_id"] for r in all_mrows}) == 672 and {r["part_id"] for r in all_mrows} == set(baseline), {"rows": len(all_mrows), "unique": len({r['part_id'] for r in all_mrows})})
check("global_totals", len({r["paper_id"] for r in all_qrows}) == 29 and len({r["question_id"] for r in all_qrows}) == 87 and sum(baseline[r["part_id"]]["marks"] for r in all_qrows) == 2175, {"papers": len({r['paper_id'] for r in all_qrows}), "questions": len({r['question_id'] for r in all_qrows}), "marks": sum(baseline[r['part_id']]['marks'] for r in all_qrows)})
check("joins_match_frozen_stage1_stage2", not join_errors, join_errors[:50])
check("qp_ms_locators_match_frozen_part_ranges", not locator_errors, locator_errors[:50])
check("marking_point_ids_globally_unique", len(all_atom_ids) == len(set(all_atom_ids)), {"atoms": len(all_atom_ids), "unique": len(set(all_atom_ids))})

# Canonical 14 issue IDs / 27 paper-specific instances.
expected_issue_ids = set()
expected_issue_instances = set()
for paper in s1_issues["batch_observations"]:
    for issue in paper["observations"]:
        expected_issue_ids.add(issue["id"])
        pid = part_label_index[(paper["paper_id"], issue["part"])]
        expected_issue_instances.add((issue["id"], paper["paper_id"], pid))

risk_2122 = loaded["2021-2022"][2]
actual_issue_ids = {row["source_issue_id"] for row in risk_2122["issue_definitions"]}
actual_issue_instances = {(row["source_issue_id"], row["paper_id"], row["part_id"]) for row in risk_2122["instances"]}
check("canonical_issue_ids_14_exact", len(expected_issue_ids) == 14 and actual_issue_ids == expected_issue_ids, {"expected": len(expected_issue_ids), "actual": len(actual_issue_ids), "missing": sorted(expected_issue_ids - actual_issue_ids), "extra": sorted(actual_issue_ids - expected_issue_ids)})
check("canonical_issue_occurrences_27_exact", len(expected_issue_instances) == 27 and actual_issue_instances == expected_issue_instances, {"expected": len(expected_issue_instances), "actual": len(actual_issue_instances), "missing": sorted(expected_issue_instances - actual_issue_instances), "extra": sorted(actual_issue_instances - expected_issue_instances)})

# Lead's conservative adjudications must close the four raw pending rows.
adjudicated_parts = {pid for decision in adjudications["decisions"] for pid in decision["part_ids"]}
check("lead_adjudications_close_2021_2022_pending", adjudications.get("status") == "LEAD_REVIEWED" and not adjudications.get("unresolved_decisions") and adjudicated_parts == {"9618_w21_41_2(e)", "9618_w21_42_2(e)", "9618_w22_41_1(b)", "9618_w22_43_1(b)"} and {d["official_part_marks"] for d in adjudications["decisions"]} == {6, 8} and all(d.get("part_disposition") == "HOLISTIC_PART_LEVEL" and d.get("arithmetic_claim") == "official_part_total_only" for d in adjudications["decisions"]), adjudications)

# Semantic regressions established by direct A8 facsimile inspection.
m2324 = {r["part_id"]: r for r in loaded["2023-2024"][4]}
explicit_rows = {
    "9618_s24_41_1(e)(ii)": 3,
    "9618_s24_43_1(e)(ii)": 3,
    "9618_s24_41_1(e)(iii)": 2,
    "9618_s24_43_1(e)(iii)": 2,
    "9618_s24_41_2(c)": 4,
    "9618_s24_43_2(c)": 4,
    "9618_s24_41_2(d)(i)": 2,
    "9618_s24_43_2(d)(i)": 2,
    "9618_w23_41_3(e)(ii)": 2,
    "9618_w23_43_3(e)(ii)": 2,
}
explicit_results = {}
for pid, expected in explicit_rows.items():
    row = m2324[pid]
    total = sum(a.get("source_mark_value_if_unambiguous") or 0 for a in row["marking_points"])
    explicit_results[pid] = {"expected_explicit_marks": expected, "modelled_explicit_marks": total, "atom_ids": [a["marking_point_id"] for a in row["marking_points"]]}
check("facsimile_explicit_mark_rows_are_fully_atomised", all(x["expected_explicit_marks"] == x["modelled_explicit_marks"] for x in explicit_results.values()), explicit_results)

header_noise = []
for row in loaded["2023-2024"][4]:
    for atom in row["marking_points"]:
        if "Question Answer Marks" in atom["criterion_paraphrase"]:
            header_noise.append([row["part_id"], atom["marking_point_id"]])
check("criterion_paraphrases_exclude_page_headers", not header_noise, header_noise)

alt_2fi = m2324["9618_s23_42_2(f)(i)"]["marking_points"]
alt_3bii = m2324["9618_s23_42_3(b)(ii)"]["marking_points"]
alt_semantics_ok = all(a["award_semantics"] == "group_max" and a.get("group_max") == 4 for a in alt_2fi) and all(a["award_semantics"] == "discrete" for a in alt_3bii[:2]) and alt_3bii[2]["award_semantics"] in {"alternative", "accept_equivalent"}
check("alternative_and_group_max_semantics_match_facsimiles", alt_semantics_ok, {"9618_s23_42_2(f)(i)": [[a["marking_point_id"], a["award_semantics"], a.get("group_max")] for a in alt_2fi], "9618_s23_42_3(b)(ii)": [[a["marking_point_id"], a["award_semantics"]] for a in alt_3bii]})

risk_2324 = loaded["2023-2024"][2]["risks"]
generic_risk = next((r for r in risk_2324 if r["issue_id"] == "S4-S2-LAYOUT-CODE-FIDELITY"), None)
generic_is_policy = generic_risk is None or (not generic_risk.get("part_ids") and all(loc.get("source_id") in source_ids and loc.get("pdf_pages") for loc in generic_risk.get("locators", [])))
check("batch_fidelity_policy_is_not_a_fake_source_locator", generic_is_policy, generic_risk)

m2025 = {r["part_id"]: r for r in loaded["2025"][4]}
evidence_atom = m2025["9618_s25_42_2(f)(iii)"]["marking_points"][0]
evidence_text = evidence_atom["criterion_paraphrase"].lower()
check("s25_spare_output_evidence_criterion_is_semantically_complete", evidence_atom["award_semantics"] == "evidence" and evidence_atom.get("source_mark_value_if_unambiguous") == 1 and "output for example" != evidence_text.strip() and ("screenshot" in evidence_text or "spare" in evidence_text or "non-empty" in evidence_text), {"part_id": "9618_s25_42_2(f)(iii)", "marking_point_id": evidence_atom["marking_point_id"], "criterion": evidence_atom["criterion_paraphrase"]})

stack_atoms = m2025["9618_s25_42_1(e)"]["marking_points"]
stack_ok = len(stack_atoms) == 7 and all(a.get("source_mark_value_if_unambiguous") == 1 for a in stack_atoms) and next(a for a in stack_atoms if a["marking_point_id"].endswith(".mp.05"))["award_semantics"] != "alternative"
check("s25_stack_reduce_preserves_seven_explicit_marks", stack_ok, [[a["marking_point_id"], a["award_semantics"], a.get("source_mark_value_if_unambiguous")] for a in stack_atoms])

risk_2025 = loaded["2025"][2]["risks"]
p35_risks = [r for r in risk_2025 if "9618_s25_41_3(c)(i)" in r.get("affected_part_ids", []) and r.get("source_locator", {}).get("source_id") == "9618_s25_ms_41" and 35 in r.get("source_locator", {}).get("pdf_pages", [])]
check("s25_ms41_p35_constructor_underscore_risk_carried", bool(p35_risks), p35_risks)

guard_risks = [r for r in risk_2025 if r.get("risk_id") == "W25-43-Q2B-FULL-GUARD" and r.get("source_locator", {}).get("source_id") == "9618_w25_ms_43" and set(r.get("source_locator", {}).get("pdf_pages", [])) == {22, 23} and "9618_w25_43_2(b)" in r.get("affected_part_ids", []) and "99" in r.get("stage5_obligation", "") and "100" in r.get("stage5_obligation", "")]
guard_row = m2025["9618_w25_43_2(b)"]
guard_contract_ok = any("checking full and returning false" in a["criterion_paraphrase"].lower() for a in guard_row["marking_points"])
check("w25_queue_guard_conflict_preserved_without_certifying_sample", bool(guard_risks) and guard_contract_ok, {"risk": guard_risks, "criterion_ids": [a["marking_point_id"] for a in guard_row["marking_points"]]})

result = {
    "schema_version": "s4-a8-source-validator-v1",
    "status": "PASS" if all(item["passed"] for item in checks) else "REWORK",
    "counts": {
        "papers": len({r["paper_id"] for r in all_qrows}),
        "questions": len({r["question_id"] for r in all_qrows}),
        "parts": len(all_qrows),
        "marks": sum(baseline[r["part_id"]]["marks"] for r in all_qrows),
        "marking_atoms": len(all_atom_ids),
        "canonical_issue_ids": len(expected_issue_ids),
        "canonical_issue_occurrences": len(expected_issue_instances),
        "checks": len(checks),
        "failed_checks": sum(not item["passed"] for item in checks),
    },
    "checks": checks,
    "boundary": "Source-layer QA only. PASS would not certify method cards, executable Python, traces, lessons, or visuals.",
}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(0 if result["status"] == "PASS" else 1)

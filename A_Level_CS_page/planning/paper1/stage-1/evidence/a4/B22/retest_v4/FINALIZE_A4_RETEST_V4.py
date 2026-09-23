"""Build the frozen A4 v4 findings, A3 comparison and handoff from pinned checks."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
BASE = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
OUT = BASE / "evidence/a4/B22/retest_v4"
A3 = BASE / "evidence/a3/B22/retest_v4"
A0 = BASE / "evidence/a0"
CAND = BASE / "evidence/a2/B22/versions/B22-A2-v4"


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    checks = load(OUT / "A4_CANDIDATE_REVIEW_CHECKS.json")
    render_manifest_path = OUT / "SOURCE_RENDER_MANIFEST_V4.json"
    render_manifest = load(render_manifest_path)
    candidate_evidence = load(CAND / "CORRECTION_EVIDENCE.json")
    a3_hand_path = A3 / "HANDOFF_RETEST_V4.json"
    a3_hand = load(a3_hand_path)
    a3_audit_path = A0 / "B22_A3_V4_HANDOFF_AUDIT.json"
    a3_audit = load(a3_audit_path)
    a3_render_path = A3 / "SOURCE_RENDER_MANIFEST.json"

    supplemental = [
        {
            "path": "renders/direct_source/9618_w22_qp_13-p14-check.png",
            "sha256": sha(OUT / "renders/direct_source/9618_w22_qp_13-p14-check.png"),
            "source_id": "9618_w22_qp_13",
            "pdf_page_1_based": 14,
            "kind": "supplemental_direct_source_page_render",
            "purpose": "Adjacent-page context check for the Q6(b)(iii) p13 token finding; outside required page union and 58-page count.",
        },
        {
            "path": "renders/direct_source/9618_w22_qp_13-p13-label-crops.png",
            "sha256": sha(OUT / "renders/direct_source/9618_w22_qp_13-p13-label-crops.png"),
            "source_id": "9618_w22_qp_13",
            "pdf_page_1_based": 13,
            "kind": "derived_enlargement_from_direct_source_render",
            "parent_render": "renders/direct_source/9618_w22_qp_13-p13.png",
            "parent_render_sha256": sha(OUT / "renders/direct_source/9618_w22_qp_13-p13.png"),
            "purpose": "Enlarged labels distinguish the printed (ii) and (iii); not an independent PDF render and excluded from the 58-page count.",
        },
    ]
    render_manifest["supplemental_visual_artifacts"] = supplemental
    save(render_manifest_path, render_manifest)

    # Independently validate the A3 frozen handoff and its output sidecar before comparison.
    a3_output_checks = []
    for rel, expected in sorted(a3_hand["output_sha256"].items()):
        path = A3 / Path(rel.replace("/", "\\"))
        actual = sha(path)
        a3_output_checks.append({"path": rel, "expected_sha256": expected, "actual_sha256": actual, "matches": actual == expected})
    a3_handoff_actual = sha(a3_hand_path)
    a3_audit_actual = sha(a3_audit_path)
    own_union = {(x["source_id"], x["pdf_page_1_based"]) for x in checks["page_set_reconciliation"]["a0_erratum_expanded_union"]["source_pages"]}
    a3_union = {(x["source_id"], x["pdf_page_1_based"]) for x in a3_hand["review_page_set"]["pages"]}
    a3_review_findings = a3_hand["findings"]
    a3_comparison = {
        "task_id": "P1-S1-A4-B22-RETEST-V4",
        "comparison": "same frozen B22-A2-v4 candidate; A3 source/context/scope review compared with independent A4 source/linkage review",
        "a3_handoff": {
            "path": str(a3_hand_path.relative_to(ROOT)).replace("\\", "/"),
            "expected_sha256": "84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7",
            "actual_sha256": a3_handoff_actual,
            "matches": a3_handoff_actual == "84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7",
            "candidate_version": a3_hand["review_target"],
            "candidate_snapshot_manifest_sha256": next(x["actual_sha256"] for x in a3_hand["inputs"]["pins"] if x["path"].endswith("SNAPSHOT_MANIFEST.json")),
            "recommendation": a3_hand["recommendation"],
            "gate_status": a3_hand["gate_status"],
            "findings": a3_review_findings,
        },
        "a0_a3_handoff_audit": {
            "path": str(a3_audit_path.relative_to(ROOT)).replace("\\", "/"),
            "expected_sha256": "cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f",
            "actual_sha256": a3_audit_actual,
            "matches": a3_audit_actual == "cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f",
            "audit_status": a3_audit["audit_status"],
            "criteria": {k: v for k, v in a3_audit["criteria"].items() if k != "input_pins"},
        },
        "a3_independent_output_hash_checks": {
            "count": len(a3_output_checks),
            "all_match": all(x["matches"] for x in a3_output_checks),
            "checks": a3_output_checks,
        },
        "page_set_comparison": {
            "a4_union_count": len(own_union),
            "a3_union_count": len(a3_union),
            "same_22_page_union": own_union == a3_union and len(own_union) == 22,
            "a4_pages_missing_from_a3": sorted([{"source_id": s, "pdf_page_1_based": p} for s, p in own_union - a3_union], key=lambda x: (x["source_id"], x["pdf_page_1_based"])),
            "a3_pages_missing_from_a4": sorted([{"source_id": s, "pdf_page_1_based": p} for s, p in a3_union - own_union], key=lambda x: (x["source_id"], x["pdf_page_1_based"])),
        },
        "finding_alignment": {
            "same_two_minor_candidate_evidence_findings": len(a3_review_findings) == 2,
            "token_claim": "A3 and A4 both observed that the source page/transcript print (iii), while the CORRECTION_EVIDENCE token field claims ii); the QP page locator is correct.",
            "page_count": "A3 and A4 both distinguish 19 correction rows on 11 unique pages, 12 changed-region pages and six covers, forming a 22-page union. The candidate count field/folder has 18 images; A4 enumerates its five missing union pages and one extra image.",
            "gate_scope": "A3 PASS recommendation and A0 A3 handoff audit PASS are scoped to A3 integrity/source-context work. They are not an A0 batch acceptance and do not replace A4/A9.",
        },
    }
    save(OUT / "A3_V4_COMPARISON.json", a3_comparison)

    # Build fully source-linked findings from the generated candidate checks.
    marks = checks["mark_correction_candidate_checks"]
    locators = checks["locator_correction_candidate_checks"]
    source_render_by_key = {(r["source_id"], r["pdf_page_1_based"]): r for r in render_manifest["render_rows"]}
    correction_rows = {r["record_id"]: r for r in candidate_evidence["mark_corrections"]}
    locator_rows = {r["record_id"]: r for r in candidate_evidence["locator_corrections"]}
    observed_marks = []
    for row in marks:
        correction = correction_rows[row["record_id"]]
        render = source_render_by_key[(row["source_id"], row["pdf_page_1_based"])]
        observed_marks.append({
            "record_id": row["record_id"], "source_id": row["source_id"], "pdf_page_1_based": row["pdf_page_1_based"],
            "printed_label": row["printed_label"], "source_printed_mark": correction["v4_mark"],
            "candidate_index_mark": row["indexed_mark"], "candidate_row_matches_source": row["record_matches_candidate"],
            "source_pdf_sha256": row["source_pdf_sha256"], "direct_render_path": render["render_path"],
            "direct_render_sha256": render["render_sha256"], "visual_observation": "bracketed mark adjacent to the specified question/part label agrees",
        })
    observed_locators = []
    for row in locators:
        correction = locator_rows[row["record_id"]]
        render = source_render_by_key[(row["source_id"], row["expected_source_page"])]
        observed_locators.append({
            "record_id": row["record_id"], "source_id": row["source_id"], "printed_label": correction["printed_label"],
            "v3_pdf_page_1_based": correction["v3_pdf_page_1_based"], "v4_pdf_page_1_based": correction["v4_pdf_page_1_based"],
            "directly_observed_page_label_token": row["expected_last_token_from_printed_label"],
            "candidate_source_page_label_token_verified": row["candidate_claimed_token"],
            "token_claim_matches": row["token_claim_matches_label"],
            "candidate_locator_matches_expected_page_and_identifier": row["candidate_locator_matches_expected"],
            "candidate_transcript_ref": row["candidate_transcript_ref"], "transcript_ref_matches_correction_evidence": row["candidate_transcript_matches_evidence"],
            "transcript_sha256": correction["transcript_sha256"], "source_pdf_sha256": row["source_pdf_sha256"],
            "direct_render_path": render["render_path"], "direct_render_sha256": render["render_sha256"],
        })

    checks_path = OUT / "A4_CANDIDATE_REVIEW_CHECKS.json"
    findings = {
        "schema_version": "1.0",
        "task_id": "P1-S1-A4-B22-RETEST-V4",
        "candidate_version": "B22-A2-v4",
        "review_gate": "A4 source linkage, mark fidelity, hierarchy/unresolved links, context and visual-reference integrity only",
        "recommendation": "PASS_WITH_TWO_MINOR_DEFERRED_EVIDENCE_METADATA_FINDINGS",
        "batch_acceptance_claimed": False,
        "reviewer_independent_of_a2_author": True,
        "candidate_edited": False,
        "source_pdfs_edited": False,
        "criterion_statuses": {
            "source_hashes_page_counts_and_candidate_source_linkage": "PASS",
            "handoff_batch_snapshot_hash_chain": "PASS",
            "seven_displayed_mark_corrections": "PASS",
            "six_qp_indexed_mark_sums_vs_printed_covers": "PASS",
            "twelve_nested_qp_locator_corrections": "PASS",
            "locator_evidence_token_annotation": "MINOR_DEFERRED; W22/13 Q6(b)(iii) token claim is incorrect while page locator is correct",
            "hierarchy_parent_links_and_32_unresolved_containers": "PASS",
            "188_marking_targets_six_whole_question_rows_and_104_dependencies": "PASS",
            "context_required_rows": "PASS",
            "88_visual_region_paths_relations_and_page_references": "PASS_WITH_A9_FULL_BATCH_VISUAL_REVIEW_REMAINING",
            "22_page_set_source_review": "PASS; 22-page union directly rendered and source-checked",
            "correction_evidence_unique_direct_source_pages_metric": "MINOR_DEFERRED; candidate value 18 does not equal the 11-row-page set or 22-page expanded union",
            "same_version_a3_a4_alignment": "PASS; A3 and A4 independently support the same two minor findings",
        },
        "observed_mark_corrections": observed_marks,
        "observed_qp_locator_corrections": observed_locators,
        "independent_mark_totals_and_printed_covers": checks["independent_mark_totals_and_cover_tokens"],
        "hierarchy_and_unresolved_checks": checks["hierarchy_and_unresolved"],
        "marking_and_dependency_checks": checks["marking_targets_and_dependencies"],
        "visual_reference_checks": checks["visual_regions"],
        "page_set_reconciliation": checks["page_set_reconciliation"],
        "supplemental_page_check": {
            "source_id": "9618_w22_qp_12", "pdf_page_1_based": 2,
            "observed": "Q1(a) [5] is printed on the page; v4 assigns 5 to Q1(a), and no Q1 [2] discrepancy is present.",
            "scope": "supplemental check only; not part of the mandated 22-page union and not a finding",
        },
        "findings": [
            {
                "id": "A4-B22-V4-01", "severity": "MINOR", "owner": "A2", "status": "DEFERRED_FOR_VERSIONED_CORRECTION_AND_RETEST",
                "artifact": "evidence/a2/B22/versions/B22-A2-v4/CORRECTION_EVIDENCE.json",
                "record_id": "9618_w22_qp_13-q6-pbiii", "field": "locator_corrections[].source_page_label_token_verified",
                "candidate_claim": "ii)", "printed_label": "(b)(iii)", "source_observed_label": "(iii)",
                "source_id": "9618_w22_qp_13", "pdf_page_1_based": 13,
                "source_pdf_sha256": "dc038f6877674f438e6f561450965ae0bd1a2186b0f6fa888b645f27e0e2d7c6",
                "direct_render": {"path": "renders/direct_source/9618_w22_qp_13-p13.png", "sha256": "f000abbe6dfcade51b800ba3e3c2753a95be85bd495a07e0e188282426c35419"},
                "transcript": {"path": "transcripts/9618_w22_qp_13-p13.txt", "sha256": "5c458e6ae76f4b2f77e1238d034f2611422f9b2fe94915bb2a13695ef06bb7d0", "source_text_observation": "(iii) precedes the LSR #2 prompt"},
                "locator_assessment": "v4 Question Index locator points to W22/13 QP PDF p13 and its transcript reference is correct; no page misinterpretation.",
                "gate_impact": "Evidence token annotation only; source-linked record/page is correct. Defer as Minor to A2's next immutable version and recheck.",
            },
            {
                "id": "A4-B22-V4-02", "severity": "MINOR", "owner": "A2", "status": "DEFERRED_FOR_VERSIONED_CORRECTION_AND_RETEST",
                "artifact": "evidence/a2/B22/versions/B22-A2-v4/CORRECTION_EVIDENCE.json",
                "record_id": None, "field": "counts.unique_direct_source_pages",
                "candidate_value": 18, "deduplicated_correction_row_pages": 11,
                "expanded_erratum_union_pages": 22, "candidate_correction_render_folder_png_pages": 18,
                "candidate_folder_pages_missing_from_expanded_union": checks["page_set_reconciliation"]["candidate_correction_render_folder"]["expanded_union_pages_missing_from_folder"],
                "candidate_folder_pages_outside_expanded_union": checks["page_set_reconciliation"]["candidate_correction_render_folder"]["pages_not_in_expanded_union"],
                "interpretation": "18 matches the candidate PNG folder count (11 correction-row pages + six covers + one supplement), not the 11 unique correction-row pages or the 22-page correction/changed-region/cover union.",
                "gate_impact": "Evidence-count/coverage annotation only for corpus linkage; A4 directly rendered and inspected the full required union. Defer as Minor to A2's next immutable version and recheck.",
            },
        ],
        "same_version_a3_comparison": {
            "comparison_path": "A3_V4_COMPARISON.json",
            "a3_handoff_sha256": a3_handoff_actual,
            "a0_a3_handoff_audit_sha256": a3_audit_actual,
            "a3_gate_recommendation": a3_hand["recommendation"],
            "a3_gate_status": a3_hand["gate_status"],
            "same_22_page_union": own_union == a3_union and len(own_union) == 22,
            "both_minor_findings_agree": len(a3_review_findings) == 2,
        },
        "limits": [
            "Review is limited to the A4 gate for the frozen B22-A2-v4 candidate; no batch acceptance is claimed.",
            "All 12 source PDFs were hash/page-count checked, but this A4 retest did not manually inspect every one of their 166 pages.",
            "A9 independent batch review and A0 final batch decision remain mandatory.",
            "Two Minor evidence-metadata findings remain assigned to A2 for versioned correction and retest.",
        ],
        "supporting_check_file": {"path": "A4_CANDIDATE_REVIEW_CHECKS.json", "sha256": sha(checks_path)},
        "source_render_manifest": {"path": "SOURCE_RENDER_MANIFEST_V4.json", "sha256": sha(render_manifest_path)},
    }
    save(OUT / "RETEST_FINDINGS_V4.json", findings)

    # Freeze all input pins, including the now-frozen A3 handoff and its A0 audit.
    pinned = load(OUT / "PINNED_INPUT_CHECKS.json")
    input_checks = [
        {"path": x["path"], "expected_sha256": x["expected_sha256"], "actual_sha256": x["actual_sha256"], "matches": x["matches_pin"]}
        for x in pinned["input_pins"]
    ]
    extra_pins = [
        ("A3_HANDOFF", a3_hand_path, "84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7"),
        ("A3_REPORT", A3 / "CONTEXT_SCOPE_RETEST_V4.md", a3_hand["deliverables"]["CONTEXT_SCOPE_RETEST_V4.md"]["sha256"]),
        ("A3_FINDINGS", A3 / "CONTEXT_SCOPE_FINDINGS_V4.json", a3_hand["deliverables"]["CONTEXT_SCOPE_FINDINGS_V4.json"]["sha256"]),
        ("A3_SCOPE_FLAGS", A3 / "SCOPE_FLAGS_RETEST_V4.json", a3_hand["deliverables"]["SCOPE_FLAGS_RETEST_V4.json"]["sha256"]),
        ("A3_SOURCE_RISK", A3 / "SOURCE_RISK_RETEST_V4.md", a3_hand["deliverables"]["SOURCE_RISK_RETEST_V4.md"]["sha256"]),
        ("A3_RENDER_MANIFEST", a3_render_path, a3_hand["deliverables"]["SOURCE_RENDER_MANIFEST.json"]["sha256"]),
        ("A0_A3_HANDOFF_AUDIT", a3_audit_path, "cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f"),
    ]
    for name, path, expected in extra_pins:
        actual = sha(path)
        input_checks.append({"name": name, "path": str(path.relative_to(ROOT)).replace("\\", "/"), "expected_sha256": expected, "actual_sha256": actual, "matches": actual == expected})
    if not all(x["matches"] for x in input_checks):
        raise RuntimeError("Input hash pin mismatch; handoff not frozen")
    if not a3_output_checks or not all(x["matches"] for x in a3_output_checks):
        raise RuntimeError("A3 output hash mismatch; handoff not frozen")
    if a3_audit["audit_status"] != "PASS" or a3_handoff_actual != "84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7":
        raise RuntimeError("A3 handoff/audit not frozen as expected")
    if own_union != a3_union or len(own_union) != 22:
        raise RuntimeError("A3/A4 page-set discrepancy; handoff not frozen")

    output_files = sorted(p for p in OUT.rglob("*") if p.is_file() and p.name != "HANDOFF_RETEST_V4.json")
    output_hashes = {str(p.relative_to(OUT)).replace("\\", "/"): sha(p) for p in output_files}
    handoff = {
        "schema_version": "1.0",
        "task_id": "P1-S1-A4-B22-RETEST-V4",
        "artifact_version": "B22-A4-RETEST-v4",
        "reviewer_role": "A4 independent source/linkage reviewer; not B22-A2-v4 author",
        "handoff_status": "FROZEN_FOR_A0_INTEGRITY_AUDIT",
        "a4_retest_status": "PASS_WITH_TWO_MINOR_DEFERRED_EVIDENCE_METADATA_FINDINGS",
        "batch_gate_status": "OPEN_A2_VERSIONED_MINOR_CORRECTIONS_A9_REVIEW_AND_A0_DECISION",
        "batch_acceptance_claimed": False,
        "candidate_not_edited": True,
        "source_pdfs_not_edited": True,
        "a3_a4_same_version_alignment": "PASS; same B22-A2-v4 candidate and same two Minor evidence-metadata findings; page union matches 22/22",
        "a0_a3_handoff_audit": {"path": str(a3_audit_path.relative_to(ROOT)).replace("\\", "/"), "sha256": a3_audit_actual, "status": a3_audit["audit_status"]},
        "inputs": {"count": len(input_checks), "all_match": all(x["matches"] for x in input_checks), "checks": input_checks},
        "candidate_hash_chain": {
            "handoff_listed_count": 411, "batch_listed_count": 412, "snapshot_listed_count": 413,
            "all_hashes_match": True, "key_sets_reconcile": True, "snapshot_matches_candidate_file_set": True,
            "source_check_file": "A4_CANDIDATE_REVIEW_CHECKS.json",
        },
        "source_review": {"source_pdf_count": 12, "source_pdf_page_count": 166, "direct_source_page_renders": 58, "supplemental_page_render_count": 1,
                           "derived_label_crop_count": 1, "target_contact_sheet_count": 12, "render_method": "Poppler pdftoppm, 160 dpi; direct from local source PDFs after hash/page count verification"},
        "reviewed_page_union": {"deduplicated_correction_pages": 11, "changed_visual_region_pages": 12, "qp_cover_pages": 6, "overlap_between_correction_and_region_pages": 7, "required_union_pages": 22,
                                "a3_same_union": True, "details_file": "A4_CANDIDATE_REVIEW_CHECKS.json"},
        "criterion_statuses": findings["criterion_statuses"],
        "finding_ids": [x["id"] for x in findings["findings"]],
        "deliverables": {
            "RETEST_V4.md": {"path": "RETEST_V4.md", "sha256": sha(OUT / "RETEST_V4.md")},
            "RETEST_FINDINGS_V4.json": {"path": "RETEST_FINDINGS_V4.json", "sha256": sha(OUT / "RETEST_FINDINGS_V4.json")},
            "A4_CANDIDATE_REVIEW_CHECKS.json": {"path": "A4_CANDIDATE_REVIEW_CHECKS.json", "sha256": sha(checks_path)},
            "SOURCE_RENDER_MANIFEST_V4.json": {"path": "SOURCE_RENDER_MANIFEST_V4.json", "sha256": sha(render_manifest_path)},
            "A3_V4_COMPARISON.json": {"path": "A3_V4_COMPARISON.json", "sha256": sha(OUT / "A3_V4_COMPARISON.json")},
            "PINNED_INPUT_CHECKS.json": {"path": "PINNED_INPUT_CHECKS.json", "sha256": sha(OUT / "PINNED_INPUT_CHECKS.json")},
            "CANDIDATE_HASH_CHAIN_CHECK.json": {"path": "CANDIDATE_HASH_CHAIN_CHECK.json", "sha256": sha(OUT / "CANDIDATE_HASH_CHAIN_CHECK.json")},
        },
        "output_file_count_excluding_handoff": len(output_files),
        "output_sha256": output_hashes,
        "open_gates": ["A2 versioned correction/retest for the two Minor evidence-metadata findings", "A9 independent batch review", "A0 final batch decision"],
        "stop": "Handoff frozen for A0 integrity audit; do not infer batch acceptance.",
    }
    save(OUT / "HANDOFF_RETEST_V4.json", handoff)
    print(json.dumps({"handoff_sha256": sha(OUT / "HANDOFF_RETEST_V4.json"), "outputs": len(output_files),
                      "inputs_match": len(input_checks), "a3_outputs_match": len(a3_output_checks),
                      "a3_a4_union_equal": own_union == a3_union, "recommendation": findings["recommendation"]}, indent=2))


if __name__ == "__main__":
    main()

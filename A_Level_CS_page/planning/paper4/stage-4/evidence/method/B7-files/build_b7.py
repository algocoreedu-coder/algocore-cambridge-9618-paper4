from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S1, S2, S3, S4 = (P4 / f"stage-{n}" for n in (1, 2, 3, 4))
PATTERNS = ["FILE_READ_ARRAY", "FILE_READ_OBJECTS", "FILE_WRITE"]
VERSION = "s4-schema-v1-b7-submission-1"
BATCH = "B7-files"


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def bi(vi, en):
    return {"vi": vi, "en": en}


def slug(pattern):
    return pattern.lower().replace("_", "-")


INPUTS = [
    S2 / "EXAM_PATTERN_CATALOG.json", S2 / "QUESTION_PATTERN_MAP.json",
    S2 / "CONFUSABLE_PATTERNS.json", S3 / "BOOK_KNOWLEDGE_MAP.json",
    S3 / "COVERAGE_MATRIX.json", S3 / "LESSON_PACKAGES.json",
    S1 / "SOURCE_ISSUES.json",
]
for year in ("2021-2022", "2023-2024", "2025"):
    INPUTS += [S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json", S4 / f"evidence/marking/{year}/SOURCE_RISK_REGISTER.json"]
INPUTS += [S4 / "schemas/pattern-card.schema.json", S4 / "schemas/error-prevention.schema.json", S4 / "schemas/design-briefs.schema.json"]
INPUTS += [S4 / "SOURCE_ADJUDICATIONS.json"]
input_hashes = [{"path": str(p.relative_to(P4)).replace("\\", "/"), "sha256": sha(p)} for p in INPUTS]

catalog_doc = read(S2 / "EXAM_PATTERN_CATALOG.json")
catalog = {x["pattern_id"]: x for x in catalog_doc["patterns"] if x["pattern_id"] in PATTERNS}
book_doc = read(S3 / "BOOK_KNOWLEDGE_MAP.json")
chains = {x["pattern_id"]: x for x in book_doc["pattern_chains"] if x["pattern_id"] in PATTERNS}
sections = {x["section_id"]: x for x in book_doc["sections"]}
contrasts_doc = read(S2 / "CONFUSABLE_PATTERNS.json")
adjudication_doc = read(S4 / "SOURCE_ADJUDICATIONS.json")
adjudication_by_part = {
    part_id: decision
    for decision in adjudication_doc["decisions"]
    for part_id in decision["part_ids"]
}


def submission_rows(path):
    d = read(path)
    return d.get("parts") or d.get("rows") or []


rows_by_pattern = {p: [] for p in PATTERNS}
all_source_rows = {}
policies = {}
for year in ("2021-2022", "2023-2024", "2025"):
    for row in submission_rows(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json"):
        row = dict(row)
        row["source_batch"] = year
        all_source_rows[row["part_id"]] = row
        assessed = row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
        for pattern in PATTERNS:
            if pattern in assessed:
                rows_by_pattern[pattern].append(row)
    risk = read(S4 / f"evidence/marking/{year}/SOURCE_RISK_REGISTER.json")
    if risk.get("batch_fidelity_policy"):
        policies[year] = risk["batch_fidelity_policy"]


def atom_owner(row, atom):
    """Assign every official atom to the sole B7 assessed pattern on its part."""
    b7 = [p for p in row.get("assessed_pattern_ids", row.get("pattern_ids", [])) if p in PATTERNS]
    if not b7:
        return None
    if len(b7) == 1:
        return b7[0]
    # Current Stage 2 has no multi-B7 assessed part. Fail closed if that changes.
    raise ValueError(f"Unadjudicated multi-B7 atom ownership: {row['part_id']} {b7} {atom['marking_point_id']}")


owned = {p: defaultdict(list) for p in PATTERNS}
for row in all_source_rows.values():
    for atom in row.get("marking_points", []):
        owner = atom_owner(row, atom)
        if owner:
            owned[owner][row["part_id"]].append(atom)


def source_ref(row, pattern):
    atoms = owned[pattern].get(row["part_id"], [])
    return {
        "part_id": row["part_id"], "source_batch": row["source_batch"],
        "qp_locator": {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]},
        "qp_requirement_paraphrase": row["qp_requirement"]["paraphrase"],
        "ms_atoms": [{
            "marking_point_id": m["marking_point_id"], "source_id": m["ms_source_id"],
            "pdf_pages": m["ms_pdf_pages"], "criterion_paraphrase": m["criterion_paraphrase"],
            "award_semantics": m["award_semantics"], "condition": m.get("condition"),
            "alternatives": m.get("alternatives"), "dependency": m.get("dependency"),
            "source_mark_value_if_unambiguous": m.get("source_mark_value_if_unambiguous"),
            "group_id": m.get("group_id"), "group_max": m.get("group_max"),
            "source_issue_refs": m.get("source_issue_refs", []),
        } for m in atoms],
        "source_issue_refs": row.get("source_issue_refs", []),
        "source_adjudication": adjudication_by_part.get(row["part_id"]),
        "atom_ownership_note": "Atoms listed here are owned once inside B7; every current assessed relation has exactly one B7 pattern.",
    }


official_refs = {p: [source_ref(r, p) for r in sorted(rows_by_pattern[p], key=lambda x: x["part_id"])] for p in PATTERNS}


def refs(pattern):
    return [m["marking_point_id"] for r in official_refs[pattern] for m in r["ms_atoms"]]


def source_issues(pattern):
    return sorted({
        issue
        for ref in official_refs[pattern]
        for issue in (ref["source_issue_refs"] + [i for atom in ref["ms_atoms"] for i in atom["source_issue_refs"]])
    })


def step(pattern, suffix, seq, action, why, invariant, guard, role, check):
    return {
        "step_id": f"{slug(pattern)}.step.{suffix}", "sequence": seq,
        "action": bi(action[0], action[1]), "why": bi(why[0], why[1]),
        "reads": ["QP contract", "current state"], "writes": ["design state"],
        "invariant": invariant, "guard": guard, "termination_role": role,
        "check": bi(check[0], check[1]), "marking_point_refs": [],
    }


from b7_specs import GLOBAL_INV_VI, SPECS, STEP_META_VI, VISUAL_CASES


# Attach catalogue wording and Stage 3 provenance.
for p in PATTERNS:
    assert p in SPECS and p in catalog and p in chains


def objective_ids(pattern):
    return list(dict.fromkeys(o for k in chains[pattern]["knowledge_chain"] for o in k["objective_ids"]))


def requirement_refs(pattern):
    return [f"ac-9618-p4-2026-python.assessment-requirement.{o.lower()}" for o in objective_ids(pattern)]


def contrast_refs(pattern):
    out = []
    peers = set()
    for c in contrasts_doc["contrasts"]:
        pats = set(c["left"].get("assessed_pattern_ids", [])) | set(c["right"].get("assessed_pattern_ids", []))
        if pattern in pats:
            out.append(c["id"])
            peers |= (pats - {pattern})
    return out, sorted(peers)


methods = {}
for p, s in SPECS.items():
    methods[p] = [step(p, suffix, i + 1, action, why, inv, guard, role, check) for i, (suffix, action, why, inv, guard, role, check) in enumerate(s["steps"])]
    for method, (invariant_vi, guard_vi, termination_vi) in zip(methods[p], STEP_META_VI[p]):
        method["invariant_vi"] = invariant_vi
        method["guard_vi"] = guard_vi
        method["termination_role_vi"] = termination_vi
    # One atom is owned exactly once at card level. Steps carry the full owned set
    # collectively through the final verification step until Lead refines joins.
    methods[p][-1]["marking_point_refs"] = refs(p)


errors = []
for p, s in SPECS.items():
    for suffix, lvi, len_, cvi, cen, dvi, den, rvi, ren in s["errors"]:
        errors.append({
            "error_id": f"b7.{slug(p)}.error.{suffix}", "pattern_id": p,
            "question_part_ids": [], "requirement_refs": requirement_refs(p),
            "marking_point_refs": [],
            "method_step_refs": [methods[p][-2]["step_id"], methods[p][-1]["step_id"]],
            "likely_error": bi(lvi, len_),
            "consequence": bi(cvi, cen),
            "detection_check": bi(dvi, den),
            "repair_action": bi(rvi, ren),
            "repair_exercise_ref": f"b7.{slug(p)}.repair.{suffix}",
            "basis": "AlgoCore_risk", "source_locator_if_official": [],
            "exact_mark_loss_claim": None,
            "authority_note": "AlgoCore risk derived from the method invariant; no examiner-frequency or fixed-mark-loss claim.",
            "status": "SUBMITTED",
        })

error_ids = {p: [e["error_id"] for e in errors if e["pattern_id"] == p] for p in PATTERNS}

cards = []
for p in PATTERNS:
    ch, s, cat = chains[p], SPECS[p], catalog[p]
    c_refs, peers = contrast_refs(p)
    issues = source_issues(p)
    book_ids = list(dict.fromkeys(b for k in ch["knowledge_chain"] for b in k["book_section_ids"]))
    cards.append({
        "card_id": f"ac-9618-p4-2026-python.stage4.pattern.{slug(p)}", "pattern_id": p,
        "version": VERSION, "status": "SUBMITTED", "package_id": ch["package_id"], "lesson_id": ch["lesson_id"],
        "knowledge_block_ids": ch["knowledge_block_ids"], "objective_ids": objective_ids(p),
        "titles": bi(cat["name_vi"], cat["name_en"]),
        "recognition": bi(cat["recognition_vi"], cat.get("recognition_en", ch["titles"]["en"])),
        "source_scope": {
            "assessed_part_ids": ch["stage2_assessed_part_ids"],
            "representative_parts": ([x for x in official_refs[p] if x["ms_atoms"]] or official_refs[p])[:3],
            "official_source_refs": official_refs[p],
            "corpus_limit": f"Observed in {len(ch['stage2_assessed_part_ids'])} assessed part relation(s). This does not prove every possible variant.",
        },
        "confusable_pattern_refs": peers, "confusable_contrast_refs": c_refs,
        "source_issue_refs": issues,
        "source_fidelity_policies": [policies[y] for y in sorted({r["source_batch"] for r in rows_by_pattern[p]}) if y in policies],
        "book_foundation_refs": [{
            "section_id": sid, "source_id": sections[sid]["source_id"], "printed_pages": sections[sid]["printed_pages"],
            "pdf_pages": sections[sid]["pdf_pages"], "support_level": sections[sid]["support_level"],
            "limitations": sections[sid]["limitations"], "authority": "coursebook_foundation",
        } for sid in book_ids],
        "applicability": {"preconditions":[s["pre"]], "representation":[s["repr"]], "conventions":s["conv"], "variant_axes":s["axes"], "decision_rule":s["decision"]},
        "method_steps": methods[p], "marking_point_refs": refs(p), "assessment_requirement_refs": requirement_refs(p),
        "error_refs": error_ids[p], "solution_design_ref": f"b7.solution.{slug(p)}", "visual_brief_ref": f"b7.visual.{slug(p)}",
        "authority_labels":["official_qp","official_ms","official_syllabus","coursebook_foundation","AlgoCore_inference","AlgoCore_risk"],
        "authority_note":"Official obligations are limited to cited QP/MS rows. Method, invariant and repair advice is AlgoCore inference/risk. Fidelity policies are not source issues.",
        "downstream_status":"PENDING_STAGE5_EXECUTION_VERIFICATION",
    })

variants = []
for p, s in SPECS.items():
    variants.append({
        "variant_id": f"b7.variant.{slug(p)}", "pattern_ids":[p], "stage2_contrast_refs":contrast_refs(p)[0],
        "axis":";".join(s["axes"]), "decision_rule":s["decision"],
        "cases":[{"case_id":cid,"description":desc,"observed_parts":[r["part_id"] for r in rows_by_pattern[p] if cid.replace("-","_") in json.dumps(r.get("variants",{})).lower()][:5]} for cid,desc in s["cases"]],
        "invariant":s["inv"], "invariant_bilingual":bi(GLOBAL_INV_VI[p], s["inv"]), "method_changing":True,
    })

solutions = []
examples = []
visuals = []
for p, s in SPECS.items():
    cat = catalog[p]
    step_ids = [x["step_id"] for x in methods[p]]
    solutions.append({
        "solution_design_id":f"b7.solution.{slug(p)}", "pattern_id":p, "variant_id":f"b7.variant.{slug(p)}",
        "input_contract":bi(f"Hợp đồng đầu vào phải khóa trước theo quyết định: {s['decision']['vi']}",s["pre"]), "output_contract":bi(f"Kết quả/trạng thái phải thỏa: {GLOBAL_INV_VI[p]}",f"Result/state satisfies: {s['inv']}"),
        "state_model":s["repr"], "representation":[s["repr"]], "preconditions":[s["pre"]],
        "postconditions":[s["inv"]], "invariants":[s["inv"]], "ordered_method_step_ids":step_ids,
        "mutation_and_preservation_rules":["Only the commit step may change learner-visible state; rejected/failure paths preserve prior valid state."],
        "termination_argument":f"Termination follows the explicit role `{methods[p][-1]['termination_role']}` and its stated guard/check.",
        "failure_paths":[e["likely_error"]["en"] for e in errors if e["pattern_id"]==p],
        "alternative_designs":[x[0] for x in s["cases"]],
        "stage5_test_obligations":{"normal":[s["cases"][0][1]],"boundary":[s["cases"][-1][1]],"counterexample":[e["likely_error"]["en"] for e in errors if e["pattern_id"]==p],"source_fixture":[r["part_id"] for r in rows_by_pattern[p]][:5]},
        "source_constraints":official_refs[p],
        "source_issue_dispositions":[{"issue_id":x,"stage4_disposition":"Preserve the located caveat; do not certify extracted/source code.","stage5_obligation":"Verify the derived implementation/trace against the original facsimile."} for x in source_issues(p)],
        "status":"PENDING_STAGE5_EXECUTION_VERIFICATION",
    })
    anchor = next((x for x in official_refs[p] if x["ms_atoms"]), official_refs[p][0])
    examples.append({
        "worked_example_spec_id":f"b7.example.{slug(p)}", "pattern_id":p,
        "status":"PENDING_STAGE5_EXECUTION_VERIFICATION", "origin":"AlgoCore_original_adaptation_spec",
        "anchor_source":anchor,
        "prompt_design":bi(f"Dùng một tình huống mới để áp dụng {cat['name_vi']} theo đúng contract của anchor.",f"Use a new situation to apply {cat['name_en']} under the anchor contract."),
        "representation_and_convention":s["decision"], "method_step_refs":step_ids,
        "learner_checkpoints":[x["check"]["en"] for x in methods[p]],
        "contrast_and_boundary_microcases":[x[1] for x in s["cases"]],
        "evidence_to_capture_later":["initial state","guard decisions","state-changing events","postcondition check"],
        "prohibited_stage4_claims":["No executable code","No certified trace","No final runtime output","No official marks for AlgoCore adaptation"],
        "stage5_handoff":"Create fixtures and verify implementation/trace against source locators and invariants.",
    })
    qvi,qen,events=s["visual"]
    visuals.append({
        "visual_brief_id":f"b7.visual.{slug(p)}", "pattern_id":p, "method_step_refs":step_ids, "error_refs":error_ids[p],
        "learning_question":bi(qvi,qen), "visual_mode":"event_driven",
        "state_to_show":[s["repr"],s["inv"],"current guard and commit status"], "proposed_event_types":events,
        "predict_prompt":bi("Dự đoán event kế tiếp và state nào phải được giữ nguyên.","Predict the next event and which state must remain unchanged."),
        "normal_case":VISUAL_CASES[p]["normal"],
        "boundary_case":VISUAL_CASES[p]["boundary"],
        "failure_case":bi(SPECS[p]["errors"][0][1],SPECS[p]["errors"][0][2]),
        "representation_and_convention":s["conv"],
        "static_fallback":bi("Snapshot trước/sau kèm bảng guard, state và invariant.","Before/after snapshots with guard, state and invariant table."),
        "accessibility_notes":["Do not rely on colour alone.","Label indices, fields and state changes in text.","Provide keyboard-step-compatible event descriptions at Stage 7/8."],
        "status":"PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD",
    })

common={"schema_version":VERSION,"status":"SUBMITTED","batch_id":BATCH,"input_hashes":input_hashes}
write("PATTERN_CARDS.json",{**common,"pattern_cards":cards,"self_checks":{"pattern_count":len(cards),"pattern_set":PATTERNS,"assessed_part_relations":sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards),"owned_marking_atoms":sum(len(c["marking_point_refs"]) for c in cards)}})
write("VARIANT_INVARIANT_REGISTER.json",{**common,"variants":variants,"self_checks":{"variant_count":len(variants),"method_changing":sum(v["method_changing"] for v in variants)}})
write("ERROR_PREVENTION.json",{**common,"error_rows":errors,"self_checks":{"error_count":len(errors),"exact_mark_loss_claims":0}})
write("SOLUTION_DESIGNS.json",{**common,"solution_designs":solutions,"self_checks":{"design_count":len(solutions),"pending_stage5":len(solutions)}})
write("WORKED_EXAMPLE_SPECS.json",{**common,"worked_example_specs":examples,"self_checks":{"spec_count":len(examples),"primary_anchor_count":len(examples)}})
write("VISUAL_BRIEFS.json",{**common,"visual_briefs":visuals,"self_checks":{"brief_count":len(visuals),"event_driven_count":sum(v["visual_mode"]=="event_driven" for v in visuals)}})

review=f"""# B7 Files method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review. This is not a canonical batch PASS.

## Coverage

- Exact pattern set: {len(PATTERNS)}/3 — `{', '.join(PATTERNS)}`.
- Stage 2 assessed part-pattern relations and unique parts: {sum(len(chains[p]['stage2_assessed_part_ids']) for p in PATTERNS)}.
- Official marking atoms owned once inside B7: {sum(len(refs(p)) for p in PATTERNS)}.
- Pattern cards / variant registers / solution designs / worked examples / visual briefs: 3 each.
- Error-prevention rows: {len(errors)}. No fixed mark-loss claim.

## Method decisions

1. `FILE_READ_ARRAY` fixes record grouping, types, destination, EOF/fixed-count and capacity guards before opening. It buffers and converts a complete record before one commit.
2. `FILE_READ_OBJECTS` separates parse, subtype/lookup routing, construction/update candidate and destination commit. Partial records never create objects.
3. `FILE_WRITE` fixes append/overwrite and physical/logical order before open, formats one complete line before each write, and closes after the final required record.
4. File lifecycle and exception/output behavior are observable contract elements. Error messages, return counts and failure scope remain source-bound.

## Source and authority boundaries

- Every current B7 assessed part carries exactly one B7 pattern, so each official atom has one B7 owner. Co-tags from other batches remain visible for Lead cross-batch aggregation.
- Exact QP/MS pages and all award semantics come from current marking submissions. Located row/atom caveats are preserved. `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` appears only in `source_fidelity_policies`, never as a per-part issue.
- The W21 ReadData parts `9618_w21_41_2(e)` and `9618_w21_42_2(e)` retain all eleven atoms as `holistic`, with issue `W21-2E-RUBRIC`, no inferred atom values and the official part-level ceiling 8 from Lead-reviewed `S4-S1-DEC-001`.
- The W22 ReadFile parts `9618_w22_41_1(b)` and `9618_w22_43_1(b)` retain seven `holistic` criteria, no inferred atom values and the official part-level ceiling 6 from Lead-reviewed `S4-S1-DEC-002`.
- Source listings and extracted examples are evidence locators only. Stage 4 does not copy, repair or certify them as executable teaching code.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; visual briefs remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Unresolved decisions

- The W21/W22 arithmetic questions are closed by Lead-reviewed `S4-S1-DEC-001/002`; zero source decision remains open. Downstream aggregation must preserve their holistic ceilings without inferring criterion-level values.
- EOF-driven input with an incomplete final multi-line record, capacity reached before EOF, and exception-time close behavior require source-specific Stage 5 fixtures.
- Append versus overwrite, error message literals, physical versus logical order and create versus update semantics must be selected from each anchor contract rather than made universal defaults.
- Object-construction listings with source caveats remain facsimile verification obligations; no listing is certified by this batch.

## Self-review

The validator checks exact Stage 2 sets, one-owner atom coverage, live locators, source-issue/policy separation, all four holistic adjudication rows, VI–EN method/invariant/error fields, concrete unique visual cases, one anchor per pattern and downstream statuses. No executable code, successful run, certified trace or final output is claimed.
"""
(HERE/"REVIEW.md").write_text(review,encoding="utf-8")

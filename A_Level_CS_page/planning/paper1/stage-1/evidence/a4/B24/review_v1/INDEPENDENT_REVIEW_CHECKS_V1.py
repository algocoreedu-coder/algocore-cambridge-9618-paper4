from __future__ import annotations
import hashlib, json, re, sys
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[7]  # workspace root, from .../stage-1/evidence/a4/B24/review_v1
A2 = ROOT / "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B24/versions/B24-A2-v1"
INPUT = json.loads((HERE / "INPUT_PINS_V1.json").read_text(encoding="utf-8"))
RENDER = json.loads((HERE / "SOURCE_RENDER_MANIFEST_V1.json").read_text(encoding="utf-8"))
CONTACT = json.loads((HERE / "CONTACT_SHEET_MANIFEST_V1.json").read_text(encoding="utf-8"))

def sha(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()

def tokens(s: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", s.lower()))

def relpath(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()

def get_text(docs, source_id: str, page: int) -> str:
    return docs[source_id][page - 1]

# Resolve and verify all 8 frozen work-order/input pins.
pin_results = []
for pin in INPUT["pins"]:
    p = ROOT / pin["path"]
    actual = sha(p) if p.is_file() else None
    pin_results.append({
        "name": pin["name"], "path": pin["path"],
        "expected_sha256": pin["expected_sha256"], "actual_sha256": actual,
        "pass": actual == pin["expected_sha256"],
    })

# Verify source PDFs and independently extract page text from the pinned originals.
try:
    import pymupdf
except Exception as e:
    raise SystemExit(f"PyMuPDF required to repeat source/page checks: {e}")
docs, source_results = {}, []
for src in INPUT["source_pdfs"]:
    p = ROOT / src["path"]
    actual_hash = sha(p) if p.is_file() else None
    doc = pymupdf.open(p) if p.is_file() else None
    page_count = len(doc) if doc else None
    docs[src["source_id"]] = [page.get_text("text") for page in doc] if doc else []
    source_results.append({
        "source_id": src["source_id"], "path": src["path"],
        "sha256_expected": src["sha256_expected"], "sha256_actual": actual_hash,
        "page_count_expected": src["page_count_expected"], "page_count_actual": page_count,
        "year_id_ok": "s24_" in src["source_id"] or "w24_" in src["source_id"],
        "pass": actual_hash == src["sha256_expected"] and page_count == src["page_count_expected"] and ("s24_" in src["source_id"] or "w24_" in src["source_id"]),
    })

# Verify exact candidate snapshot entries against current bytes.
snap = json.loads((A2 / "SNAPSHOT_MANIFEST.json").read_text(encoding="utf-8"))
snapshot_bad = []
for item in snap["files"]:
    p = A2 / item["path"]
    if not p.is_file():
        snapshot_bad.append({"path": item["path"], "reason": "missing"})
        continue
    actual_hash = sha(p)
    actual_bytes = p.stat().st_size
    if actual_hash != item["sha256"] or actual_bytes != item["byte_count"]:
        snapshot_bad.append({"path": item["path"], "sha256_actual": actual_hash, "byte_count_actual": actual_bytes})

# Direct render and contact-sheet byte/hash checks.
render_bad = []
for item in RENDER["pages"]:
    p = HERE / item["path"]
    if not p.is_file() or sha(p) != item["sha256"] or p.stat().st_size != item["bytes"]:
        render_bad.append(item["path"])
contact_bad = []
contact_entries = CONTACT.get("sheets", CONTACT.get("contact_sheets", []))
for item in contact_entries:
    p = HERE / item.get("path", item.get("asset_ref", ""))
    expected = item.get("sha256")
    expected_bytes = item.get("bytes", item.get("byte_count"))
    if not p.is_file() or sha(p) != expected or (expected_bytes is not None and p.stat().st_size != expected_bytes):
        contact_bad.append(item.get("path", item.get("asset_ref")))

# Candidate record inventory.
questions_all = [json.loads(x) for x in (A2 / "QUESTION_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
marks = [json.loads(x) for x in (A2 / "MARKING_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
page_rows = [json.loads(x) for x in (A2 / "PAGE_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
roots = [r for r in questions_all if "source_qp_id" in r]
parts = [r for r in questions_all if "question_id" in r]
root_by_id = {r["id"]: r for r in roots}
part_by_id = {r["id"]: r for r in parts}
record_by_id = {r["id"]: r for r in questions_all}
mark_ids = {m["id"] for m in marks}
region_list = json.loads((A2 / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))["visual_regions"]
region_by_id = {r["id"]: r for r in region_list}
mark_targets = {m.get("part_id_or_null") or m.get("question_id_or_null") for m in marks}

# Independently compare all 170 indexed mark rows to text extracted from the exact original MS page.
mark_checks, mark_failures = [], []
for m in marks:
    ml = m["ms_locator"]
    ms_source, ms_page = ml["source_id"], ml["pdf_page_1_based"]
    raw = get_text(docs, ms_source, ms_page)
    raw_toks = tokens(raw)
    target_id = m.get("part_id_or_null") or m.get("question_id_or_null")
    target = record_by_id.get(target_id)
    target_type = "part" if m.get("part_id_or_null") else "whole_question"
    target_failures = []
    if bool(m.get("part_id_or_null")) == bool(m.get("question_id_or_null")):
        target_failures.append("not_exactly_one_target")
    if target is None:
        target_failures.append("dangling_target")
    elif target_type == "part":
        qp_loc = target["qp_locator"]
        root = root_by_id.get(target["question_id"])
        if root is None or qp_loc["source_id"] != root["source_qp_id"]:
            target_failures.append("part_question_source_mismatch")
        if ml["source_id"][-2:] != root["component"]:
            target_failures.append("qp_ms_component_mismatch")
        # A question number need only appear on the root/start page; continuation pages
        # commonly begin with a part label or continuation text. Composite locators such
        # as (c)(ii) need only repeat the leaf label on the cited page.
        root_raw = get_text(docs, root["source_qp_id"], root["qp_locator"]["pdf_page_1_based"]) if root else ""
        root_toks = tokens(root_raw)
        if str(qp_loc["question"]) not in root_toks:
            target_failures.append("qp_question_number_not_in_root_start_page")
        leaf_label = target.get("label", "")
        qp_transcript = A2 / target["prompt_transcript_ref"]
        qp_toks = tokens(qp_transcript.read_text(encoding="utf-8")) if qp_transcript.is_file() else set()
        if leaf_label and not tokens(leaf_label).issubset(qp_toks):
            target_failures.append("qp_leaf_part_label_not_in_cited_page_transcript")
        if target.get("marks_displayed_or_null") is not None:
            qcontext = json.loads((A2 / root["context_ref_or_null"]).read_text(encoding="utf-8")) if root and root.get("context_ref_or_null") else {"all_context_pages": [qp_loc["pdf_page_1_based"]]}
            displayed = int(target["marks_displayed_or_null"])
            token_pages = [pg for pg in qcontext["all_context_pages"]
                           if re.search(rf"\[\s*{displayed}\s*\]", get_text(docs, qp_loc["source_id"], pg))]
            if not token_pages:
                target_failures.append("qp_displayed_mark_not_found_in_question_context")
    else:
        qp_loc = target["qp_locator"]
        if ml["source_id"][-2:] != target["component"]:
            target_failures.append("qp_ms_component_mismatch")
        qp_raw = get_text(docs, qp_loc["source_id"], qp_loc["pdf_page_1_based"])
        qp_toks = tokens(qp_raw)
        qnum = str(qp_loc["question"])
        if qnum not in qp_toks:
            target_failures.append("qp_question_locator_not_in_original_page")
        if target.get("marks_displayed_or_null") is not None:
            qcontext = json.loads((A2 / target["context_ref_or_null"]).read_text(encoding="utf-8")) if target.get("context_ref_or_null") else {"all_context_pages": [qp_loc["pdf_page_1_based"]]}
            displayed = int(target["marks_displayed_or_null"])
            token_pages = [pg for pg in qcontext["all_context_pages"]
                           if re.search(rf"\[\s*{displayed}\s*\]", get_text(docs, qp_loc["source_id"], pg))]
            if not token_pages:
                target_failures.append("whole_question_mark_not_found_in_question_context")

    loc_failures = []
    if str(ml.get("question")) not in raw_toks:
        loc_failures.append("ms_question_locator_not_in_original_page")
    part_label = ml.get("part")
    if part_label and not tokens(part_label).issubset(raw_toks):
        loc_failures.append("ms_part_locator_not_in_original_page")
    body_tokens = tokens(m.get("mark_or_condition_or_null") or "")
    # Do not require generic scoring vocabulary or bare score numerals to establish source presence.
    content_tokens = body_tokens - {"for", "mark", "marks", "max", "each", "to", "the", "a", "an", "or", "and", "of", "is", "are", "be", "if"}
    content_missing = sorted(content_tokens - raw_toks)
    if content_missing:
        loc_failures.append("mark_text_tokens_missing_from_original_page")
    row = m.get("table_row_ref_or_null")
    if row and not tokens(row).issubset(raw_toks):
        loc_failures.append("table_row_ref_missing_from_original_page")

    visual_refs = m.get("visual_dependency_refs", [])
    visual_failures = []
    if not visual_refs:
        visual_failures.append("missing_visual_dependency")
    for ref in visual_refs:
        region = region_by_id.get(ref)
        if region is None:
            visual_failures.append(f"dangling_visual_region:{ref}")
        elif (region["source_id"], region["pdf_page_1_based"]) != (ms_source, ms_page):
            visual_failures.append(f"visual_region_wrong_page:{ref}")
        elif m["id"] not in region.get("relates_to_ids", []):
            visual_failures.append(f"visual_region_not_backlinked:{ref}")

    entry = {
        "marking_item_id": m["id"], "target_id": target_id, "target_type": target_type,
        "qp_locator": target.get("qp_locator") if target else None,
        "ms_locator": ml, "table_row_ref": row,
        "ms_original_question_part_text_present": not loc_failures,
        "qp_original_question_part_locator_present": not target_failures,
        "target_linkage_valid": not target_failures,
        "visual_dependency_refs": visual_refs, "visual_dependency_resolution_valid": not visual_failures,
        "failures": target_failures + loc_failures + visual_failures,
    }
    mark_checks.append(entry)
    if entry["failures"]:
        mark_failures.append(entry)

# Validate QP record locators and parent hierarchy. Question numbers are checked at roots;
# part leaf labels are checked on their cited source-versioned page text.
locator_failures, locator_check_count = [], 0
for r in questions_all:
    loc = r.get("qp_locator")
    if not loc:
        locator_failures.append({"id": r["id"], "reason": "missing_qp_locator"})
        continue
    locator_check_count += 1
    if "source_qp_id" in r:
        raw = get_text(docs, loc["source_id"], loc["pdf_page_1_based"])
        tt = tokens(raw)
        if str(loc["question"]) not in tt:
            locator_failures.append({"id": r["id"], "reason": "question_number_not_in_root_start_page"})
    if "question_id" in r:
        tr_path = A2 / r["prompt_transcript_ref"]
        tt = tokens(tr_path.read_text(encoding="utf-8")) if tr_path.is_file() else set()
        if r.get("label") and not tokens(r["label"]).issubset(tt):
            locator_failures.append({"id": r["id"], "reason": "leaf_part_label_not_in_cited_page_transcript"})
        root = root_by_id.get(r["question_id"])
        if root is None:
            locator_failures.append({"id": r["id"], "reason": "dangling_question_root"})
        elif root["source_qp_id"] != loc["source_id"] or root["question_number"] != loc["question"]:
            locator_failures.append({"id": r["id"], "reason": "part_root_locator_mismatch"})
        parent_id = r.get("parent_part_id_or_null")
        if parent_id:
            parent = part_by_id.get(parent_id)
            if parent is None or parent["question_id"] != r["question_id"]:
                locator_failures.append({"id": r["id"], "reason": "dangling_or_cross_question_parent"})

# The 29 structural parent groups deliberately have no independent MS allocation.
children = defaultdict(list)
for p in parts:
    if p.get("parent_part_id_or_null"):
        children[p["parent_part_id_or_null"]].append(p["id"])
structural_parents = [p for p in parts if p["id"] not in mark_targets]
parent_checks = []
for p in structural_parents:
    child_ids = children.get(p["id"], [])
    okay = p.get("marks_displayed_or_null") is None and p.get("ms_locator_or_null") is None and p.get("status") == "EXTRACTED" and bool(child_ids)
    parent_checks.append({"parent_id": p["id"], "qp_locator": p["qp_locator"], "child_ids": child_ids, "no_inferred_mark_allocation": okay})
if len(structural_parents) != 29 or any(not p["no_inferred_mark_allocation"] for p in parent_checks):
    parent_failures = [p for p in parent_checks if not p["no_inferred_mark_allocation"]]
else:
    parent_failures = []

# Recompute each paper total from its explicit QP displayed-mark fields, and check cover text.
totals, total_failures = [], []
for qp in sorted({r["source_qp_id"] for r in roots}):
    observed = [int(r["marks_displayed_or_null"]) for r in questions_all
                if ((r.get("source_qp_id") == qp) or
                    (r.get("question_id") and root_by_id.get(r["question_id"], {}).get("source_qp_id") == qp))
                and r.get("marks_displayed_or_null") is not None]
    index_sum = sum(observed)
    direct_cover_text = get_text(docs, qp, 1)
    found = re.search(r"total mark for this paper is\s+(\d+)", direct_cover_text, re.I)
    cover_total = int(found.group(1)) if found else None
    item = {"source_qp_id": qp, "indexed_displayed_marks_count": len(observed),
            "indexed_displayed_mark_sum": index_sum, "cover_total_from_original_pdf_text": cover_total,
            "cover_visual_reviewed": True, "pass": cover_total == 75 and index_sum == cover_total}
    totals.append(item)
    if not item["pass"]:
        total_failures.append(item)

# Verify contexts refer to valid same-paper pages and correspond to a root.
contexts = []
context_failures = []
for p in sorted((A2 / "contexts").glob("*.json")):
    d = json.loads(p.read_text(encoding="utf-8"))
    root = root_by_id.get(d["question_id"])
    pages_ok = all(1 <= int(pg) <= len(docs[d["source_qp_id"]]) for pg in d["all_context_pages"])
    page_pairs_ok = all(e["source_id"] == d["source_qp_id"] and e["pdf_page_1_based"] in d["all_context_pages"] for e in d["source_evidence"])
    start_ok = d["question_start_page"] in d["all_context_pages"]
    item = {"question_id": d["question_id"], "source_qp_id": d["source_qp_id"],
            "question_number": d["question_number"], "question_start_page": d["question_start_page"],
            "all_context_pages": d["all_context_pages"], "continuation_pages": d["continuation_pages"],
            "root_exists": root is not None, "pages_in_range": pages_ok,
            "source_evidence_pairs_match": page_pairs_ok, "start_page_in_context": start_ok,
            "all_pages_contact_screened": True, "manual_blank_imprint_boundary_review": True}
    contexts.append(item)
    if not (item["root_exists"] and pages_ok and page_pairs_ok and start_ok):
        context_failures.append(item)

# Verify all 130 visual regions resolve to a render and all references point to valid IDs/pages.
visual_failures = []
for reg in region_list:
    p = A2 / reg["rendered_asset_ref"]
    if not p.is_file() or sha(p) != reg["render_sha256"] or p.stat().st_size != reg["render_byte_count"]:
        visual_failures.append({"region_id": reg["id"], "reason": "candidate_render_mismatch"})
    if not (ROOT / A2.relative_to(ROOT) / reg["page_ref"]).is_file():
        visual_failures.append({"region_id": reg["id"], "reason": "missing_page_transcript"})
    valid_related_ids = mark_ids if reg["source_id"].find("_ms_") >= 0 else set(record_by_id)
    if any(i not in valid_related_ids for i in reg.get("relates_to_ids", [])):
        visual_failures.append({"region_id": reg["id"], "reason": "dangling_related_record_id"})
    if not 1 <= reg["pdf_page_1_based"] <= len(docs[reg["source_id"]]):
        visual_failures.append({"region_id": reg["id"], "reason": "page_out_of_range"})

# Full-size pages previously opened for A4 source inspection, also recorded in report.
qp_risk_pages = [
    ["9618_s24_qp_11", 2], ["9618_s24_qp_11", 3], ["9618_s24_qp_11", 8], ["9618_s24_qp_11", 13],
    ["9618_s24_qp_12", 2], ["9618_s24_qp_12", 7], ["9618_s24_qp_12", 11],
    ["9618_s24_qp_13", 3], ["9618_s24_qp_13", 11], ["9618_s24_qp_13", 13], ["9618_s24_qp_13", 14],
    ["9618_s24_qp_13", 15], ["9618_s24_qp_13", 16],
    ["9618_w24_qp_11", 4], ["9618_w24_qp_11", 12],
    ["9618_w24_qp_12", 2], ["9618_w24_qp_12", 9],
    ["9618_w24_qp_13", 2], ["9618_w24_qp_13", 6], ["9618_w24_qp_13", 9],
]
ms_dependency_pages = sorted({(r["source_id"], r["pdf_page_1_based"]) for r in region_list if "_ms_" in r["source_id"]})

# Source text transcripts are also matched to direct extraction from exact PDF pages.
transcript_text_missing = []
for src in INPUT["source_pdfs"]:
    for page, direct in enumerate(docs[src["source_id"]], start=1):
        tr_path = A2 / f"transcripts/{src['source_id']}-p{page:03d}.txt"
        if not tr_path.is_file():
            transcript_text_missing.append({"source_id": src["source_id"], "page": page, "reason": "missing_transcript"})
            continue
        extracted = tokens(direct)
        copied = tokens(tr_path.read_text(encoding="utf-8"))
        if len(extracted - copied) > 8:
            transcript_text_missing.append({"source_id": src["source_id"], "page": page, "reason": "source_words_missing", "missing_count": len(extracted-copied)})

result = {
    "work_order": "P1-S1-A4-B24-REVIEW-V1",
    "independent_reviewer": "A4",
    "candidate": "B24-A2-v1",
    "input_pins": {"checked": len(pin_results), "passed": sum(x["pass"] for x in pin_results), "results": pin_results},
    "candidate_snapshot": {"declared_entries": snap["file_count"], "checked": len(snap["files"]), "passed": len(snapshot_bad) == 0, "failures": snapshot_bad},
    "source_pdfs": {"checked": len(source_results), "total_pages": sum(x["page_count_actual"] or 0 for x in source_results), "results": source_results},
    "review_render_manifest": {"source_pages_rendered": len(RENDER["pages"]), "contact_sheets": len(contact_entries), "render_failures": render_bad, "contact_sheet_failures": contact_bad},
    "candidate_inventory": {"question_roots": len(roots), "part_records": len(parts), "question_and_part_records": len(questions_all), "marking_items": len(marks), "visual_regions": len(region_list), "question_contexts": len(contexts), "marking_item_full_checks": len(mark_checks), "qp_record_locator_checks": locator_check_count},
    "marking_item_checks": mark_checks,
    "marking_failures": mark_failures,
    "qp_record_locator_failures": locator_failures,
    "parent_groupings": {"count": len(parent_checks), "groups": parent_checks, "failures": parent_failures},
    "recomputed_totals": totals,
    "total_failures": total_failures,
    "contexts": {"count": len(contexts), "items": contexts, "failures": context_failures,
        "manual_boundary_notes": [
            {"source_id": "9618_s24_qp_11", "question_id": "9618_s24_qp_11-q7", "checked_context_pages": [15], "excluded_next_question_page": 16, "result": "PASS: p16 begins Q8"},
            {"source_id": "9618_s24_qp_12", "question_id": "9618_s24_qp_12-q8", "checked_context_pages": [15,16], "result": "PASS: p16 carries Q8 continuation before imprint footer"},
            {"source_id": "9618_s24_qp_13", "question_id": "9618_s24_qp_13-q7", "checked_context_pages": [13,14,15,16], "result": "PASS: Q7(f) continues on p16; permission notice is footer"},
            {"source_id": "9618_w24_qp_11", "question_ids": ["9618_w24_qp_11-q6","9618_w24_qp_11-q7"], "checked_shared_page": 13, "result": "PASS: both Q6 and Q7 begin on p13; Q8 begins p14"},
            {"source_id": "9618_w24_qp_11", "question_id": "9618_w24_qp_11-q8", "checked_context_pages": [14], "excluded_blank_pages": [15,16], "result": "PASS"},
            {"source_id": "9618_w24_qp_12", "question_id": "9618_w24_qp_12-q8", "checked_context_pages": [12,13,14,15], "excluded_blank_page": 11, "result": "PASS: Q9 begins p16"},
            {"source_id": "9618_w24_qp_13", "question_id": "9618_w24_qp_13-q8", "checked_context_pages": [15], "result": "PASS: Q9 begins p16"},
        ]},
    "visual_review": {"qp_contact_sheet_pages_screened": 100, "ms_contact_sheet_pages_screened": 56, "contact_sheet_total_pages": 156,
        "full_size_qp_risk_sample_pages": [{"source_id": s, "pdf_page_1_based": p} for s,p in qp_risk_pages],
        "full_size_ms_visual_dependency_pages": [{"source_id": s, "pdf_page_1_based": p} for s,p in ms_dependency_pages],
        "full_size_ms_visual_dependency_page_count": len(ms_dependency_pages),
        "independent_full_size_check_all_ms_visual_dependency_pages": True,
        "all_130_candidate_visual_regions_resolve": len(visual_failures) == 0,
        "visual_failures": visual_failures},
    "transcript_against_direct_original_source": {"pages_checked": sum(x["page_count_actual"] or 0 for x in source_results), "failures_over_8_missing_unique_tokens": transcript_text_missing, "pass": not transcript_text_missing},
}
result["structural_checks_pass"] = (
    len(pin_results) == 8 and all(x["pass"] for x in pin_results)
    and snap["file_count"] == 392 and len(snap["files"]) == 392 and not snapshot_bad
    and len(source_results) == 12 and all(x["pass"] for x in source_results)
    and len(RENDER["pages"]) == 156 and not render_bad and not contact_bad
    and len(roots) == 49 and len(parts) == 194 and len(questions_all) == 243
    and len(marks) == 170 and len(region_list) == 130 and len(contexts) == 49
    and not mark_failures and not locator_failures and not parent_failures and not total_failures
    and not context_failures and not visual_failures and not transcript_text_missing
)
(HERE / "INDEPENDENT_REVIEW_CHECKS_V1.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "structural_checks_pass": result["structural_checks_pass"],
    "pins": f'{result["input_pins"]["passed"]}/{result["input_pins"]["checked"]}',
    "snapshot": f'{len(snap["files"])-len(snapshot_bad)}/{snap["file_count"]}',
    "sources": f'{len(source_results)}/12 ({result["source_pdfs"]["total_pages"]} pages)',
    "question_part_records": result["candidate_inventory"]["question_and_part_records"],
    "mark_rows": f'{len(marks)}; failures={len(mark_failures)}',
    "locators": f'{locator_check_count}; failures={len(locator_failures)}',
    "parent_groups": f'{len(parent_checks)}; failures={len(parent_failures)}',
    "totals": [{"source":t["source_qp_id"],"sum":t["indexed_displayed_mark_sum"],"cover":t["cover_total_from_original_pdf_text"],"pass":t["pass"]} for t in totals],
    "contexts": f'{len(contexts)}; failures={len(context_failures)}',
    "visuals": f'{len(region_list)} regions / {len(ms_dependency_pages)} MS dependency pages; failures={len(visual_failures)}',
    "QP risk sample pages": len(qp_risk_pages),
    "direct transcript missing token failures": len(transcript_text_missing)
}, ensure_ascii=False, indent=2))


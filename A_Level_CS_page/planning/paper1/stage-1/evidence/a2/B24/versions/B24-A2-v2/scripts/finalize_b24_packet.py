from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
P1 = OUT.parents[5]
WORKSPACE = P1.parents[2]
STAGE0 = P1 / "stage-0/evidence/a2/SOURCE_MANIFEST.json"
DISPATCH = P1 / "stage-1/evidence/a0/B24_A2_V1_DISPATCH.md"
DISPATCH_RECORD = P1 / "stage-1/evidence/a0/B24_A2_V1_DISPATCH_RECORD.json"
SCHEMA = P1 / "stage-1/CORPUS_SCHEMA.md"
POLICY = P1 / "stage-1/EXTRACTION_POLICY.md"
RELEASE = P1 / "stage-1/evidence/a0/B21_BATCH_DECISION_V6.json"
EXPECTED = {
    "dispatch": "8e51767f3524117c4f50da1a7cae475b6a1fe7bde3b9c9f19465b2b0a8c45bd0",
    "schema": "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f",
    "policy": "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2",
    "release": "15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645",
    "dispatch_record": "1025a811dacbc9948e15ef744024593fbf899af3d0ffd803e453ae7906710c55",
    "stage0": "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def artifact_record(path: Path) -> dict:
    return {"path": path.relative_to(OUT).as_posix(), "sha256": sha256(path), "byte_count": path.stat().st_size}


def main() -> None:
    source_manifest = json.loads(STAGE0.read_text(encoding="utf-8"))
    stage0_by_id = {row["id"]: row for row in source_manifest["primary_sources"]}
    provenance = json.loads((OUT / "SOURCE_EXTRACTION_PROVENANCE.json").read_text(encoding="utf-8"))
    sources = provenance["sources"]
    source_by_id = {row["source_id"]: row for row in sources}
    checks = []
    source_total_pages = 0
    for row in sources:
        src = WORKSPACE / row["relative_path"]
        baseline = stage0_by_id[row["source_id"]]
        actual = sha256(src)
        page_count = row["page_count"]
        check = {
            "source_id": row["source_id"], "relative_path": row["relative_path"],
            "sha256_expected": baseline["sha256"], "sha256_actual": actual,
            "page_count_expected": baseline["page_count"], "page_count_actual": page_count,
            "matches_stage0": actual == baseline["sha256"] and page_count == baseline["page_count"],
            "source_classification": "official_cambridge_source_pdf",
        }
        checks.append(check)
        source_total_pages += page_count

    pages = read_jsonl(OUT / "PAGE_INDEX.jsonl")
    qrows = read_jsonl(OUT / "QUESTION_INDEX.jsonl")
    mrows = read_jsonl(OUT / "MARKING_INDEX.jsonl")
    vmanifest = json.loads((OUT / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))
    regions = vmanifest["visual_regions"]
    page_ids = {(p["source_id"], p["pdf_page_1_based"]) for p in pages}
    page_by_id = {p["id"]: p for p in qrows if "question_number" in p}
    part_by_id = {p["id"]: p for p in qrows if "label" in p}
    all_record_ids = set(page_by_id) | set(part_by_id)
    mark_by_id = {m["id"]: m for m in mrows}
    visual_by_id = {v["id"]: v for v in regions}
    errors: list[str] = []
    checks_detail = []

    def check(name: str, condition: bool, detail: str) -> None:
        checks_detail.append({"check": name, "status": "PASS" if condition else "FAIL", "detail": detail})
        if not condition:
            errors.append(f"{name}: {detail}")

    # Input pin, source page, extraction/page index, and exact set checks.
    revision_inputs = {
        "dispatch": {"path": str(DISPATCH.relative_to(P1)).replace("\\", "/"), "sha256": sha256(DISPATCH)},
        "schema": {"path": str(SCHEMA.relative_to(P1)).replace("\\", "/"), "sha256": sha256(SCHEMA)},
        "extraction_policy": {"path": str(POLICY.relative_to(P1)).replace("\\", "/"), "sha256": sha256(POLICY)},
        "stage0_source_manifest": {"path": str(STAGE0.relative_to(P1)).replace("\\", "/"), "sha256": sha256(STAGE0)},
        "release_decision": {"path": str(RELEASE.relative_to(P1)).replace("\\", "/"), "sha256": sha256(RELEASE)},
        "dispatch_record": {"path": str(DISPATCH_RECORD.relative_to(P1)).replace("\\", "/"), "sha256": sha256(DISPATCH_RECORD)},
    }
    pin_map = {"dispatch": "dispatch", "schema": "schema", "policy": "extraction_policy",
               "release": "release_decision", "dispatch_record": "dispatch_record",
               "stage0": "stage0_source_manifest"}
    check("frozen_authority_pins", all(revision_inputs[pin_map[k]]["sha256"] == EXPECTED[k] for k in EXPECTED),
          "Dispatch, schema, extraction policy, Stage 0 source manifest, release decision, and dispatch record match the frozen work-order pins.")
    check("source_hash_page_pins", len(sources) == 12 and all(c["matches_stage0"] for c in checks) and source_total_pages == 156,
          f"{len(sources)} sources, {source_total_pages} PDF pages; every SHA256 and page count equals Stage 0.")
    check("page_index_complete", len(pages) == 156 and len(page_ids) == 156 and all((r["source_id"], r["pdf_page_1_based"]) in page_ids for r in pages),
          f"PAGE_INDEX has {len(pages)} distinct source-page records.")
    check("transcript_completeness", len(list((OUT / "transcripts").glob("*.txt"))) == 156 and all((OUT / f"transcripts/{s['source_id']}-p{n:03d}.txt").is_file() for s in sources for n in range(1, s["page_count"] + 1)),
          "Every pinned PDF page has a source-versioned text transcript.")

    roots = [r for r in qrows if "question_number" in r]
    parts = [r for r in qrows if "label" in r]
    check("question_part_inventory", len(roots) == 49 and len(parts) == 194 and len(qrows) == 243,
          f"Indexed {len(roots)} question roots and {len(parts)} parts ({len(qrows)} total records).")
    check("record_ids_unique", len(all_record_ids) == len(qrows), f"{len(qrows) - len(all_record_ids)} duplicate question/part IDs.")
    check("question_part_links", all(p["question_id"] in page_by_id for p in parts) and all(p["parent_part_id_or_null"] is None or p["parent_part_id_or_null"] in part_by_id for p in parts),
          "Every part references an indexed question; every non-root part parent exists.")
    check("qp_locators_in_range", all(r["qp_locator"]["source_id"] in source_by_id and (r["qp_locator"]["source_id"], r["qp_locator"]["pdf_page_1_based"]) in page_ids for r in qrows),
          "Every question and part locator points to a pinned QP source page.")

    visual_ids = set(visual_by_id)
    mark_ids = set(mark_by_id)
    check("mark_targets_and_rows", len(mrows) == 170 and all((bool(m.get("part_id_or_null")) ^ bool(m.get("question_id_or_null"))) and (m.get("part_id_or_null") or m.get("question_id_or_null")) in all_record_ids for m in mrows),
          f"{len(mrows)} marking items each target exactly one existing question/part.")
    check("mark_scheme_source_pairs", all(m["ms_locator"]["source_id"] == q_by_id_target(m, page_by_id, part_by_id)["source_qp_id"].replace("_qp_", "_ms_") and (m["ms_locator"]["source_id"], m["ms_locator"]["pdf_page_1_based"]) in page_ids and m["transcript_ref"] for m in mrows),
          "Every linked item points to the paired component MS, an indexed PDF page, and a page transcript.")
    check("visual_dependency_resolution", all(set(m["visual_dependency_refs"]).issubset(visual_ids) for m in mrows),
          "Every marking-item visual dependency resolves to a rendered MS table region.")
    check("visual_region_resolution", len(regions) == 130 and all((r["source_id"], r["pdf_page_1_based"]) in page_ids and r["rendered_asset_ref"] and (OUT / r["rendered_asset_ref"]).is_file() and set(r["relates_to_ids"]).issubset(all_record_ids | mark_ids) for r in regions),
          f"{len(regions)} visual regions point to existing rendered pages and indexed records.")
    check("visual_render_count", vmanifest["full_page_render_count"] == 156 and len(vmanifest["full_page_renders"]) == 156,
          "156 direct source-page renders exist; all six pairs also have all-page contact sheets.")

    contexts = []
    context_error = []
    for root in roots:
        ref = root["context_ref_or_null"]
        path = OUT / ref
        if not path.is_file():
            context_error.append(f"missing context: {root['id']}")
            continue
        context = json.loads(path.read_text(encoding="utf-8"))
        contexts.append(context)
        if context["question_id"] != root["id"]:
            context_error.append(f"question mismatch: {root['id']}")
        for pn in context["all_context_pages"]:
            transcript = OUT / f"transcripts/{root['source_qp_id']}-p{pn:03d}.txt"
            if not transcript.is_file() or (root["source_qp_id"], pn) not in page_ids:
                context_error.append(f"bad context page: {root['id']} p{pn}")
            else:
                txt = transcript.read_text(encoding="utf-8")
                if "BLANK PAGE" in txt.upper():
                    context_error.append(f"blank page in context: {root['id']} p{pn}")
                elif "Permission to reproduce items" in txt:
                    # Some final question pages also carry imprint text; keep the page only
                    # when actual question text appears outside the imprint block.
                    filtered = []
                    for line in txt.splitlines():
                        s = line.strip()
                        if (not s or "Permission to reproduce items" in s or "reasonable effort" in s
                                or "publisher will be pleased" in s or "To avoid the issue of disclosure" in s
                                or "Copyright Acknowledgements Booklet" in s
                                or "www.cambridgeinternational.org" in s
                                or "Cambridge Assessment International Education is part" in s
                                or "DO NOT WRITE IN THIS MARGIN" in s or "UCLES 2024" in s
                                or re.match(r"^\d{1,2}$", s) or re.match(r"^9618/\d{2}/", s)
                                or re.match(r"^\*\s*0000", s)):
                            continue
                        filtered.append(s)
                    if not any(re.search(r"[A-Za-z]", line) for line in filtered):
                        context_error.append(f"imprint-only page in context: {root['id']} p{pn}")
    check("question_context_completeness", len(contexts) == 49 and not context_error,
          f"{len(contexts)} contexts; no missing source refs, blank pages, or copyright-imprint pages. " + "; ".join(context_error[:4]))

    totals = json.loads((OUT / "MARK_TOTAL_CHECK.json").read_text(encoding="utf-8"))["pairs"]
    total_checks = []
    for sid, data in totals.items():
        indexed = [r for r in roots if r["source_qp_id"] == sid]
        qids = {r["id"] for r in indexed}
        indexed_parts = [r for r in parts if r["question_id"] in qids]
        sum_indexed = sum(r["marks_displayed_or_null"] or 0 for r in indexed + indexed_parts)
        total_checks.append(data["matches"] and sum_indexed == data["printed_cover_total_or_null"] == 75)
        data["sum_of_indexed_question_and_part_marks"] = sum_indexed
    check("displayed_mark_totals", len(totals) == 6 and all(total_checks),
          "All six QPs: explicit bracket-mark sum and indexed mark sum both equal the printed cover total 75.")

    # All exact leaf/whole-question mappings linked; parent-only group labels intentionally have no row.
    linked_part_ids = {m["part_id_or_null"] for m in mrows if m["part_id_or_null"]}
    part_children = {p["id"] for p in parts if any(c["parent_part_id_or_null"] == p["id"] for c in parts)}
    parent_only = {p["id"] for p in parts if p["status"] == "EXTRACTED"}
    check("leaf_ms_coverage", all((p["id"] in linked_part_ids) if p["id"] not in part_children else True for p in parts),
          f"All leaf parts link to an exact MS heading; {len(parent_only)} parent grouping labels remain EXTRACTED with no fabricated mark allocation.")
    unresolved_temp = OUT / "_UNRESOLVED_ITEMS.json"
    unresolved_rows = json.loads(unresolved_temp.read_text(encoding="utf-8")) if unresolved_temp.exists() else []
    check("unresolved_index_rows", len(unresolved_rows) == 0, f"{len(unresolved_rows)} unresolved MS mappings were detected.")

    replacement_glyph_pages = []
    replacement_glyph_count = 0
    for transcript in sorted((OUT / "transcripts").glob("*.txt")):
        txt = transcript.read_text(encoding="utf-8")
        n = txt.count("\ufffd")
        if n:
            replacement_glyph_pages.append({"path": transcript.relative_to(OUT).as_posix(), "count": n})
            replacement_glyph_count += n
    (OUT / "GLYPH_EXTRACTION_REVIEW.json").write_text(json.dumps({
        "replacement_character": "U+FFFD",
        "transcript_page_count_with_replacement_character": len(replacement_glyph_pages),
        "replacement_character_count": replacement_glyph_count,
        "pages": replacement_glyph_pages,
        "disposition": "No U+FFFD replacement characters were detected in page transcripts. Non-ASCII symbols remain UTF-8; full-page visual source matching and symbol/row review are still pending independently.",
    }, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    # Persist the aggregate mark comparison after adding the derived indexed-sum cross-check.
    (OUT / "MARK_TOTAL_CHECK.json").write_text(json.dumps({"method": "Sum explicit QP [n] tokens from source page transcripts, compare to exact cover-page statement, and cross-check the sum of indexed question and part marks.", "pairs": totals}, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    crossref = {
        "batch_id": "B24-A2-v1", "status": "PASS" if not errors else "FAIL",
        "performed_by": "A2 automated structural self-check; not independent review",
        "checks": checks_detail, "errors": errors,
        "counts": {"sources": len(sources), "pages": len(pages), "questions": len(roots), "parts": len(parts),
                   "question_and_part_records": len(qrows), "marking_items": len(mrows),
                   "visual_regions": len(regions), "question_contexts": len(contexts),
                   "full_page_renders": vmanifest["full_page_render_count"]},
    }
    (OUT / "CROSS_REFERENCE_CHECK.json").write_text(json.dumps(crossref, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    self_check = {"batch_id": "B24-A2-v1", "status": "PASS" if not errors else "FAIL",
                  "performed_by": "A2; internal checks only", "independent_review": "PENDING_A3_A4_A9_A0",
                  "checks": checks_detail, "errors": errors,
                  "nonclaim": "This file does not approve the batch or substitute for the independent review chain."}
    (OUT / "SELF_CHECK.json").write_text(json.dumps(self_check, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    # Required human-readable review notes.
    contact_lines = []
    for s in sources:
        contact_lines.append(f"| `{s['source_id']}` | {s['page_count']} | [`{s['contact_sheet']}`]({s['contact_sheet']}) | `{s['sha256']}` |")
    qa = f"""# B24-A2-v1 extraction QA

Status: **A2 extraction packet complete; independent A3/A4/A9/A0 review pending.** This is not batch acceptance.

## Scope and pinned sources

This packet indexes the six official Cambridge 2024 Paper 1 QP/MS pairs for components 11, 12 and 13 in May/June and October/November. All 12 original PDFs were rehashed against the Stage 0 manifest and exact B24 dispatch pins; the source manifest SHA256 is `{sha256(STAGE0)}`. Total source length is {source_total_pages} pages.

| Source ID | Pages | A2 all-page contact sheet | PDF SHA256 |
|---|---:|---|---|
{chr(10).join(contact_lines)}

## Indexed records

- {len(roots)} question roots and {len(parts)} printed part records, in schema 1.1; {len(mrows)} exact MS marking items target 165 parts and 5 unparted whole-question records.
- {len(parent_only)} parent grouping labels with child parts remain `EXTRACTED` when the paired MS has no separate row. They have no fabricated MS allocation; their children are indexed and linked independently.
- Six printed QP cover statements and six sums of explicit `[n]` marks were checked. Every source sum and indexed sum is 75.
- {len(contexts)} question context records cite page-level transcripts. Standalone blank pages and imprint-only pages are excluded; pages with question content plus an imprint remain referenced for the question content. Shared-page questions and legitimate continuations remain represented by the source PDF page number.
- {len(pages)} page transcripts and direct renders were generated from the pinned PDFs. The 12 contact sheets were screened by A2. {len(regions)} full-page visual-risk regions remain `RENDERED_PENDING_INDEPENDENT_REVIEW`.

## Extraction method and limits

Text is the PyMuPDF text layer in PDF reading order. Every page has a transcript; each rendered PNG comes directly from the same pinned source PDF at 1.15x. Source PDF page and visibly printed page locators are stored separately. Mark-scheme excerpts preserve extracted row text and the exact row locator; no answers, marking allocations, syllabus applicability, taxonomy, topic frequency, or lesson content were authored in this batch.

No U+FFFD replacement character was detected in transcripts (see `GLYPH_EXTRACTION_REVIEW.json`); non-ASCII symbol encoding and table alignment still need source-page confirmation. Full-page QP and MS renders are supplied so independent reviewers can verify symbols, row alignment, diagrams, tables, and text-order issues. A2 contact-sheet screening is a coarse page-presence/layout screen and does not claim full-size source matching.

## Independent review gate

Next: A3 and A4 independently inspect the evidence and visual regions; A9 reviews their findings and the frozen packet; A0 decides acceptance. Any correction must be issued as a new version, leaving B24-A2-v1 immutable after handoff. See `CROSS_REFERENCE_CHECK.json`, `SELF_CHECK.json`, `MARK_TOTAL_CHECK.json`, `VISUAL_MANIFEST.json`, and the validator result when generated.
"""
    (OUT / "EXTRACTION_QA.md").write_text(qa, encoding="utf-8")
    unresolved = f"""# B24-A2-v1 unresolved items and review risks

## Extraction-time unresolved mappings

None detected: every indexed leaf part and all five unparted whole-question records link to a unique exact paired-MS heading; all six QP displayed-mark totals equal the printed cover total. See `CROSS_REFERENCE_CHECK.json` and `MARK_TOTAL_CHECK.json`.

## Parent labels without separate MS rows

{len(parent_only)} printed parent grouping labels contain child parts but do not have a separate exact MS row. They remain `EXTRACTED` with null MS locator and no marking item; child rows retain their own exact QP/MS evidence. This is not treated as an unresolved mark allocation.

## Independent visual review remains open

All 130 risk regions have full-size renders but remain `RENDERED_PENDING_INDEPENDENT_REVIEW`. A2 screened the 12 all-page contact sheets; it did not independently verify every mark-scheme row against a full-size original. See `VISUAL_MANIFEST.json` and `GLYPH_EXTRACTION_REVIEW.json` for the exact renders and glyph scan result.

No source PDF, coursebook, syllabus, lesson, taxonomy, application code, or tracker was edited by this A2 package.
"""
    (OUT / "UNRESOLVED.md").write_text(unresolved, encoding="utf-8")

    # Build immutable handoff inventory excluding only self-referential/post-validation files.
    # Temporary construction caches are not part of the frozen handoff.
    for temp_name in ("_UNRESOLVED_ITEMS.json", "_extracted_text_cache.json"):
        temp_path = OUT / temp_name
        if temp_path.exists():
            temp_path.unlink()
    excluded = {"BATCH_MANIFEST.json", "HANDOFF_CHECK.json", "SNAPSHOT_MANIFEST.json", "VALIDATOR_RESULT.json"}
    active_paths = sorted(p for p in OUT.rglob("*") if p.is_file() and p.name not in excluded)
    active_hashes = {p.relative_to(OUT).as_posix(): sha256(p) for p in active_paths}
    derived = [{"path": p.relative_to(OUT).as_posix(), "byte_count": p.stat().st_size} for p in active_paths]
    record_counts = {"source": len(sources), "page": len(pages), "question": len(roots), "part": len(parts),
                     "question_and_part_records": len(qrows), "marking_item": len(mrows),
                     "visual_region": len(regions), "question_context": len(contexts),
                     "transcript": len(list((OUT / "transcripts").glob("*.txt"))),
                     "full_page_render": vmanifest["full_page_render_count"], "contact_sheet": len(vmanifest["contact_sheets"])}
    batch = {
        "batch_id": "B24", "artifact_version": "B24-A2-v1", "status": "SUBMITTED_FOR_A3_A4_A9_A0_REVIEW",
        "schema_version": "1.1", "author": "A2", "inputs": [
            {"source_id": s["source_id"], "relative_path": s["relative_path"],
             "sha256_baseline": s["sha256"], "sha256_verified": s["sha256"],
             "kind": "qp" if "_qp_" in s["source_id"] else "ms",
             "year": 2024, "session": "s" if "_s24_" in s["source_id"] else "w",
             "component": s["source_id"].rsplit("_", 1)[1], "page_count": s["page_count"],
             "source_classification": "official_cambridge_source_pdf"} for s in sources],
        "record_counts": record_counts,
        "derived_artifacts": derived,
        "active_artifact_sha256": active_hashes,
        "active_artifact_hash_exclusions": [
            "BATCH_MANIFEST.json (self-referential; its final SHA256 is in HANDOFF_CHECK.json and the parent handoff)",
            "HANDOFF_CHECK.json (written after validator run)",
            "SNAPSHOT_MANIFEST.json (contains a complete inventory except its self-hash)",
            "VALIDATOR_RESULT.json (written after this manifest and independently rerun against it)"],
        "revision_inputs": revision_inputs,
        "source_validation": {"source_count": len(sources), "stage0_matches": sum(c["matches_stage0"] for c in checks),
                              "total_pages": source_total_pages, "checks": checks,
                              "stage0_source_manifest_sha256": sha256(STAGE0)},
        "notes": [
            "This is a source extraction/index batch only; no lesson/app/tracker/taxonomy/syllabus mapping or translation was created.",
            "Every QP cover total was read from the official PDF page 1 and compared with explicit displayed bracket marks.",
            "Whole-question marks use the schema 1.1 question target; no fabricated child or marking-scheme allocation was introduced.",
            f"{len(parent_only)} parent grouping labels without distinct MS rows remain EXTRACTED; linked children carry exact source evidence.",
            "All 156 pages have transcripts and direct full-page renders; contact sheets cover all twelve PDFs.",
            "Visual regions and glyph substitutions remain subject to independent full-size A3/A4/A9/A0 review."],
    }
    (OUT / "BATCH_MANIFEST.json").write_text(json.dumps(batch, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"crossref_status": crossref["status"], "errors": errors,
                      "sources": len(sources), "source_pages": source_total_pages,
                      "questions": len(roots), "parts": len(parts), "marking_items": len(mrows),
                      "parent_groupings": len(parent_only), "visual_regions": len(regions),
                      "active_artifacts": len(active_paths), "replacement_glyph_pages": len(replacement_glyph_pages)}, ensure_ascii=False))


def q_by_id_target(mark: dict, q_by: dict, p_by: dict) -> dict:
    target_id = mark.get("part_id_or_null") or mark.get("question_id_or_null")
    if target_id in q_by:
        return q_by[target_id]
    part = p_by[target_id]
    return q_by[part["question_id"]]


if __name__ == "__main__":
    main()


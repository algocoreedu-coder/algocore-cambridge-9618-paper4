import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
S2 = Path("A_Level_CS_page/planning/paper1/stage-2")
OLD = S2 / "evidence/a6/glossary-v2"
R1 = S2 / "evidence/a6/glossary-v2-r1"
R2 = S2 / "evidence/a6/glossary-v2-r2"
ISSUED = S2 / "work-orders/c3/P1-S2-A6-CORRECT-GLOSSARY-v2-r2_INPUT_MANIFEST.json"


def read(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def jsonl(rel):
    return [json.loads(x) for x in (ROOT / rel).read_text(encoding="utf-8").splitlines() if x.strip()]


def row(rel):
    b = (ROOT / rel).read_bytes()
    return {"path": rel.as_posix(), "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}


def status(ok, cid, detail):
    return {"check_id": cid, "status": "PASS" if ok else "FAIL", "detail": detail}


expected = sorted(["COMMAND_WORD_REGISTER.jsonl", "CONFLICTS_AND_BOUNDARIES.md", "GLOSSARY_SEED_V2.jsonl", "HANDOFF.json", "INPUT_MANIFEST.json", "OUTPUT_MANIFEST.json", "QA.json", "RECONCILIATION_DELTA.json"])
actual = sorted(p.name for p in (ROOT / R2).iterdir() if p.is_file())
issued, copied = read(ISSUED), read(R2 / "INPUT_MANIFEST.json")
drift = []
for e in copied["files"]:
    rel = Path(e["path"])
    if not (ROOT / rel).exists():
        drift.append({"path": e["path"], "error": "MISSING"})
        continue
    cur = row(rel)
    if cur["bytes"] != e["bytes"] or cur["sha256"] != e["sha256"]:
        drift.append({"path": e["path"], "actual": cur})

om = read(R2 / "OUTPUT_MANIFEST.json")
om_rows = om.get("outputs", om.get("files", []))
manifest_bad = []
for e in om_rows:
    cur = row(Path(e["path"]))
    if cur["bytes"] != e["bytes"] or cur["sha256"] != e["sha256"]:
        manifest_bad.append({"path": e["path"], "actual": cur})
handoff = read(R2 / "HANDOFF.json")
handoff_bad = []
for key in ["input_manifest", "output_manifest"]:
    e = handoff[key]
    cur = row(Path(e["path"]))
    if cur["bytes"] != e["bytes"] or cur["sha256"] != e["sha256"]:
        handoff_bad.append({"field": key, "actual": cur})
for key, e in handoff["primary_outputs"].items():
    cur = row(Path(e["path"]))
    if cur["bytes"] != e["bytes"] or cur["sha256"] != e["sha256"]:
        handoff_bad.append({"field": key, "actual": cur})

semantic_names = ["GLOSSARY_SEED_V2.jsonl", "COMMAND_WORD_REGISTER.jsonl", "CONFLICTS_AND_BOUNDARIES.md"]
semantic_drift = [{"file": n, "r1": row(R1/n)["sha256"], "r2": row(R2/n)["sha256"]} for n in semantic_names if row(R1/n)["sha256"] != row(R2/n)["sha256"]]
base = {r["term_id"]: r for r in jsonl(OLD / "GLOSSARY_SEED_V2.jsonl")}
r2 = {r["term_id"]: r for r in jsonl(R2 / "GLOSSARY_SEED_V2.jsonl")}
fields = ["objective_ids", "pattern_ids", "reconciliation_status", "reconciliation_methods", "reconciliation_evidence", "reconciliation_disposition", "reconciliation_sources"]
changed = {k for k in base if any(base[k].get(f) != r2[k].get(f) for f in fields)}
membership = {k for k in base if base[k].get("pattern_ids") != r2[k].get("pattern_ids")}

delta = read(R2 / "RECONCILIATION_DELTA.json")
scope_counts = Counter(r["change_scope"] for r in delta["rows"])
delta_changed = {r["term_id"] for r in delta["rows"] if r["change_scope"] != "UNCHANGED_RECONCILIATION_ROW"}
delta_membership = {r["term_id"] for r in delta["rows"] if r["change_scope"] == "PATTERN_MEMBERSHIP_AND_RECONCILIATION_FIELDS_CHANGED"}

new_rows = list(r2.values())
objective_links = sum(len(r["objective_ids"]) for r in new_rows)
objective_evidence = sum(1 for r in new_rows for e in r["reconciliation_evidence"] if e.get("link_kind") == "OBJECTIVE")
pattern_links = sum(len(r["pattern_ids"]) for r in new_rows)
command_pairs = sum(len(r["pattern_ids"]) for r in new_rows if r["term_kind"] == "COMMAND_WORD")
no_link = sum(r["reconciliation_status"] == "RECONCILED_NO_LINK" for r in new_rows)

qa = read(R2 / "QA.json")
summary = delta["summary"]
count_consistency = (
    summary.get("reconciliation_field_changed_rows") == 28 and summary.get("pattern_membership_changed_rows") == 10 and
    summary.get("unchanged_reconciliation_rows") == 68 and
    qa["correction_closure"].get("reconciliation_field_changed_rows") == 28 and qa["correction_closure"].get("pattern_membership_changed_rows") == 10 and
    handoff["corrected_counts"].get("reconciliation_field_changed_rows") == 28 and handoff["corrected_counts"].get("pattern_membership_changed_rows") == 10
)

prohibited = []
for name in expected:
    data = (ROOT / R2 / name).read_bytes()
    bad = [(i, b) for i, b in enumerate(data) if (b < 32 and b != 10) or b == 127]
    if bad:
        prohibited.append({"file": name, "count": len(bad), "sample": bad[:10]})

checks = [
    status(actual == expected, "A0-C3C-G2R2-01-EXACT-EIGHT", {"actual": actual}),
    status(row(ISSUED)["sha256"] == row(R2/"INPUT_MANIFEST.json")["sha256"] and issued == copied, "A0-C3C-G2R2-02-INPUT-COPY", {"issued": row(ISSUED)["sha256"], "copy": row(R2/"INPUT_MANIFEST.json")["sha256"]}),
    status(len(copied["files"]) == 320 and not drift, "A0-C3C-G2R2-03-INPUT-REHASH", {"checked": len(copied["files"]), "drift": drift}),
    status(len(om_rows) == 6 and not manifest_bad and not handoff_bad, "A0-C3C-G2R2-04-CLOSURE", {"manifest_entries": len(om_rows), "manifest_bad": manifest_bad, "handoff_bad": handoff_bad}),
    status(not semantic_drift, "A0-C3C-G2R2-05-SEMANTIC-BYTE-IDENTITY", {"drift": semantic_drift, "hashes": {n: row(R2/n)["sha256"] for n in semantic_names}}),
    status(len(changed) == 28 and len(membership) == 10, "A0-C3C-G2R2-06-RECOMPUTED-COUNTS", {"reconciliation_changed": len(changed), "pattern_membership_changed": len(membership), "changed_ids": sorted(changed), "membership_ids": sorted(membership)}),
    status(len(delta["rows"]) == 96 and delta_changed == changed and delta_membership == membership and scope_counts == Counter({"UNCHANGED_RECONCILIATION_ROW": 68, "RECONCILIATION_FIELDS_CHANGED_WITHOUT_PATTERN_MEMBERSHIP_CHANGE": 18, "PATTERN_MEMBERSHIP_AND_RECONCILIATION_FIELDS_CHANGED": 10}), "A0-C3C-G2R2-07-DELTA-SCOPES", {"row_count": len(delta["rows"]), "scope_counts": dict(scope_counts), "missing_changed": sorted(changed-delta_changed), "extra_changed": sorted(delta_changed-changed), "membership_mismatch": sorted(delta_membership ^ membership)}),
    status(count_consistency, "A0-C3C-G2R2-08-COUNT-CONSISTENCY", {"delta": summary, "qa": qa["correction_closure"], "handoff": handoff["corrected_counts"]}),
    status((objective_links, objective_evidence, pattern_links, command_pairs, no_link) == (69,80,874,547,29), "A0-C3C-G2R2-09-SEMANTIC-COUNTS", {"objective_links": objective_links, "objective_evidence": objective_evidence, "pattern_links": pattern_links, "command_pairs": command_pairs, "no_link": no_link}),
    status(not prohibited, "A0-C3C-G2R2-10-TEXT-INTEGRITY", {"prohibited": prohibited}),
    status(qa.get("author_check_result") == "PASS" and all(c.get("result") == "PASS" for c in qa.get("checks", [])), "A0-C3C-G2R2-11-QA", {"result": qa.get("author_check_result"), "checks": len(qa.get("checks", []))}),
]
result = {
    "schema_version": "1.0", "audit_role": "A0 glossary-v2-r2 pre-retest independent audit", "artifact": "glossary-v2-r2",
    "result": "PASS" if all(c["status"] == "PASS" for c in checks) else "FAIL", "author_handoff": row(R2/"HANDOFF.json"),
    "checks": checks, "note": "Fresh independent A3 and A4 retests remain required; this audit does not close findings or accept C3c."
}
out = S2 / "evidence/a0/c3c/GLOSSARY_V2_R2_PRE_RETEST_AUDIT.json"
(ROOT / out).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
print(json.dumps({"result": result["result"], "audit": row(out), "failed": [c["check_id"] for c in checks if c["status"] != "PASS"]}, indent=2))

import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
manifest = json.loads((ROOT / "RELEASE_MANIFEST.json").read_text(encoding="utf-8"))
bad = []
for item in manifest["files"]:
    p = ROOT / item["path"]
    if not p.exists():
        bad.append(item["path"] + ":missing")
        continue
    got = hashlib.sha256(p.read_bytes()).hexdigest()
    if got != item["sha256"]:
        bad.append(item["path"] + ":hash")
print(json.dumps({"result": "PASS" if not bad else "FAIL", "checked_files": len(manifest["files"]), "bad": bad}, ensure_ascii=False))
raise SystemExit(0 if not bad else 1)

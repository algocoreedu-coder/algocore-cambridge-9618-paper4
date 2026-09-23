"""Verify the Stage 4 input lock without mutating upstream stages."""
from pathlib import Path
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]

def main():
    lock = json.loads((ROOT / "INPUT_LOCK.json").read_text(encoding="utf-8-sig"))
    errors = []
    for row in lock["files"]:
        path = ROOT / row["path"]
        if not path.is_file():
            errors.append({"path": row["path"], "error": "missing"})
            continue
        if path.stat().st_size != row["size_bytes"]:
            errors.append({"path": row["path"], "error": "size changed"})
        elif hashlib.sha256(path.read_bytes()).hexdigest() != row["sha256"]:
            errors.append({"path": row["path"], "error": "sha256 changed"})
    result = {"status": "PASS" if not errors else "FAIL", "files_checked": len(lock["files"]), "errors": errors}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return bool(errors)

if __name__ == "__main__":
    sys.exit(main())

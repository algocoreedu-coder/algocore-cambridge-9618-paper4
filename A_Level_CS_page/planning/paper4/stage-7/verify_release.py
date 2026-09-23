import hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
m=json.loads((ROOT/"RELEASE_MANIFEST.json").read_text(encoding="utf8")); missing=[]; mismatched=[]
for e in m.get("files",[]):
 p=ROOT/e["path"]
 if not p.exists(): missing.append(e["path"]); continue
 got=hashlib.sha256(p.read_bytes()).hexdigest()
 if got!=e["sha256"]: mismatched.append({"path":e["path"],"expected":e["sha256"],"actual":got})
result="PASS" if not missing and not mismatched and m.get("status")=="LOCKED" else "FAIL"
out={"schema_version":"s7-detached-verifier-v1","release_id":m.get("release_id"),"result":result,"file_count":len(m.get("files",[])),"missing":missing,"mismatched":mismatched,"manifest_sha256":hashlib.sha256((ROOT/"RELEASE_MANIFEST.json").read_bytes()).hexdigest()}
print(json.dumps(out,ensure_ascii=False,indent=2))
if result!="PASS": sys.exit(1)

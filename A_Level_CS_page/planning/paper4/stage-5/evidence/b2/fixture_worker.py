from __future__ import annotations
import json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from run_b2 import run_row
if '--fixture-json' not in sys.argv: raise SystemExit(2)
row=json.loads(sys.argv[sys.argv.index('--fixture-json')+1]); r=run_row(row); print(json.dumps(r,ensure_ascii=False)); raise SystemExit(0 if r['result']=='PASS' else 1)



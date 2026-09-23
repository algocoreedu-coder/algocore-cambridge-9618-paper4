import importlib.util, json, sys
from pathlib import Path
root=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("b5_hashing",root/"implementation"/"b5_hashing.py")
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
x=json.load(sys.stdin); op=x["operation"]; inp=x["input"]
if op=="hash_setup": out=mod.hash_setup(**inp)
elif op=="hash_function": out=mod.hash_function(**inp)
elif op=="hash_insert":
    state=inp.pop("state"); rec=inp.pop("record"); ok,out_state=mod.hash_insert(state,rec); out={"success":ok,"state":out_state}
elif op=="hash_search":
    state=inp.pop("state"); out=mod.hash_search(state,inp["key"])
else: raise ValueError(op)
print(json.dumps(out,ensure_ascii=False,sort_keys=True,separators=(",",":")))

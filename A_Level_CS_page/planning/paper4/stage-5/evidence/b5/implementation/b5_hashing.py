from copy import deepcopy

def hash_setup(representation="bucket2d", rows=100, width=10, main_size=200, spare_size=100, sentinel=-1):
    e={"key":sentinel,"data":sentinel,"extra":sentinel}
    if representation=="bucket2d": return {"representation":"HashTable[100][10]","rows":rows,"width":width,"table":[[deepcopy(e) for _ in range(width)] for _ in range(rows)],"sentinel":sentinel}
    if representation=="main_spare": return {"representation":"HashTable[200]+Spare[100]","main_size":main_size,"spare_size":spare_size,"main":[deepcopy(e) for _ in range(main_size)],"spare":[deepcopy(e) for _ in range(spare_size)],"sentinel":sentinel}
    raise ValueError("unsupported source representation")

def hash_function(key, modulus):
    if not isinstance(key,int) or modulus<=0: raise ValueError("key/modulus contract")
    return key%modulus

def _empty(r,s): return r is None or r.get("key")==s

def hash_insert(state,record):
    out=deepcopy(state); key=int(record["key"]); s=out["sentinel"]
    if out["representation"]=="HashTable[100][10]":
        a=hash_function(key,out["rows"])
        for c in range(out["width"]):
            if _empty(out["table"][a][c],s): out["table"][a][c]=deepcopy(record); return True,out
        return False,out
    a=hash_function(key,out["main_size"])
    if _empty(out["main"][a],s): out["main"][a]=deepcopy(record); return True,out
    for i in range(out["spare_size"]):
        if _empty(out["spare"][i],s): out["spare"][i]=deepcopy(record); return True,out
    return False,out

def hash_search(state,key):
    s=state["sentinel"]
    if state["representation"]=="HashTable[100][10]":
        a=hash_function(int(key),state["rows"])
        for r in state["table"][a]:
            if not _empty(r,s) and r["key"]==key:return deepcopy(r)
        return "Not found"
    a=hash_function(int(key),state["main_size"]); r=state["main"][a]
    if not _empty(r,s) and r["key"]==key:return deepcopy(r)
    for r in state["spare"]:
        if not _empty(r,s) and r["key"]==key:return deepcopy(r)
    return "Not found"

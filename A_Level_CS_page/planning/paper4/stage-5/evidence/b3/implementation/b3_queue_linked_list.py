"""Independent Python adaptations for Stage 5 B3 queue and linked-list patterns."""
from copy import deepcopy

def queue_setup(capacity=4, model="linear", values=None):
    values=list(values or [])
    q={"storage":[None]*capacity,"capacity":capacity,"model":model,"head":0 if model=="circular" and values else (-1 if not values else 0),"tail":0 if model=="circular" else len(values),"count":0}
    for x in values: queue_enqueue(q,x)
    return q

def _q_live(q):
    if q["count"]==0:return []
    if q["model"]=="circular": return [q["storage"][(q["head"]+i)%q["capacity"]] for i in range(q["count"])]
    return q["storage"][q["head"]:q["tail"]]

def queue_enqueue(q,item):
    out=deepcopy(q)
    if out["count"]>=out["capacity"]: return False,out
    if out["model"]=="circular":
        if out["count"]==0: out["head"]=out["tail"]
        out["storage"][out["tail"]]=item; out["tail"]=(out["tail"]+1)%out["capacity"]; out["count"]+=1
        return True,out
    if out["count"]==0: out["head"]=0
    out["storage"][out["tail"]]=item; out["tail"]+=1; out["count"]+=1
    return True,out

def queue_dequeue(q):
    out=deepcopy(q)
    if out["count"]==0:return None,out
    item=out["storage"][out["head"]]
    if out["model"]=="circular": out["head"]=(out["head"]+1)%out["capacity"]
    else: out["head"]+=1
    out["count"]-=1
    if out["count"]==0:
        if out["model"]=="linear": out["head"]=-1; out["tail"]=0
        else: out["head"]=out["tail"]
    return item,out

def queue_inspect(q, delimiter=" "): return delimiter.join(str(x) for x in _q_live(q))

def queue_reduce(q, mode="sum", consume=False):
    out=deepcopy(q); acc=0 if mode=="sum" else []
    for x in _q_live(out): acc=acc+x if mode=="sum" else acc+[x]
    if consume: out=queue_setup(out["capacity"],out["model"])
    return acc,out

def list_setup(values=None, capacity=6):
    vals=list(values or []); nodes=[{"data":None,"next":i+1 if i+1<capacity else -1} for i in range(capacity)]
    head=-1; free=0 if capacity else -1; tail=-1
    for v in vals[:capacity]:
        idx=free; free=nodes[idx]["next"]; nodes[idx]["data"]=v; nodes[idx]["next"]=-1
        if head==-1: head=tail=idx
        else: nodes[tail]["next"]=idx; tail=idx
    return {"nodes":nodes,"head":head,"free_head":free,"capacity":capacity}

def _l_live(s):
    out=[]; i=s["head"]; seen=set()
    while i!=-1 and i not in seen:
        seen.add(i); out.append(s["nodes"][i]["data"]); i=s["nodes"][i]["next"]
    return out

def list_traverse(s): return _l_live(s)

def list_insert(s,value,position="front"):
    out=deepcopy(s)
    if out["free_head"]==-1:return False,out
    idx=out["free_head"]; out["free_head"]=out["nodes"][idx]["next"]; out["nodes"][idx]={"data":value,"next":-1}
    if out["head"]==-1 or position=="front": out["nodes"][idx]["next"]=out["head"]; out["head"]=idx; return True,out
    cur=out["head"]
    while out["nodes"][cur]["next"]!=-1: cur=out["nodes"][cur]["next"]
    out["nodes"][cur]["next"]=idx; return True,out

def list_remove(s,value):
    out=deepcopy(s); prev=-1; cur=out["head"]
    while cur!=-1 and out["nodes"][cur]["data"]!=value: prev,cur=cur,out["nodes"][cur]["next"]
    if cur==-1:return False,out
    nxt=out["nodes"][cur]["next"]
    if prev==-1: out["head"]=nxt
    else: out["nodes"][prev]["next"]=nxt
    out["nodes"][cur]={"data":None,"next":out["free_head"]}; out["free_head"]=cur
    return True,out

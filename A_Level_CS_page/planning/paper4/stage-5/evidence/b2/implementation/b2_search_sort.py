"""AlgoCore Stage 5 B2 independent Python implementations.
These implementations are verification adaptations of Stage 4 contracts, not official Cambridge literals.
"""
from __future__ import annotations
from typing import Any, Callable, Iterable


def _key(x, key: Callable[[Any], Any] | None): return key(x) if key else x

def ordered_insert(records, new_record, *, key=lambda x: x["key"], capacity=None, descending=False, equal_after=True):
    out = list(records)
    k = _key(new_record, key)
    i = 0
    def before(a,b): return a > b if descending else a < b
    while i < len(out) and (before(_key(out[i], key), k) or (equal_after and _key(out[i], key) == k)):
        i += 1
    out.insert(i, new_record)
    if capacity is not None: out = out[:capacity]
    return out

def linear_search(items, target, *, key=None, normalize=False, return_mode="index"):
    for i, item in enumerate(items):
        a, b = _key(item,key), target
        if normalize and isinstance(a,str) and isinstance(b,str): a,b=a.casefold(),b.casefold()
        if a == b:
            if return_mode == "boolean": return True
            if return_mode == "item": return item
            return i
    if return_mode == "boolean": return False
    if return_mode == "item": return None
    return -1

def count_occurrences(items, target, *, key=None, normalize=False, recursive=False):
    vals=list(items)
    def eq(a,b):
        a,b=_key(a,key),b
        if normalize and isinstance(a,str) and isinstance(b,str): a,b=a.casefold(),b.casefold()
        return a==b
    if not recursive:
        return sum(1 for x in vals if eq(x,target))
    def rec(i): return 0 if i == len(vals) else (1 if eq(vals[i],target) else 0)+rec(i+1)
    return rec(0)

def filter_records(records, predicate: Callable[[Any],bool], *, output_mode="collect"):
    matches=[r for r in records if predicate(r)]
    return matches if output_mode == "collect" else matches

def group_aggregate(items, *, key=lambda x:x[0], value=lambda x:x[1]):
    groups=[]; positions={}
    for item in items:
        k=key(item); v=value(item)
        if k in positions: groups[positions[k]]["total"] += v
        else:
            positions[k]=len(groups); groups.append({"key":k,"total":v})
    return groups

def bubble_sort(items, *, key=None, descending=False, early_exit=True):
    a=list(items)
    def out_of_order(x,y): return (_key(x,key) < _key(y,key)) if descending else (_key(x,key) > _key(y,key))
    n=len(a)
    while n>1:
        swapped=False
        for i in range(n-1):
            if out_of_order(a[i],a[i+1]): a[i],a[i+1]=a[i+1],a[i]; swapped=True
        if early_exit and not swapped: break
        n-=1
    return a

def insertion_sort(items, *, key=None, descending=False, recursive=False):
    a=list(items)
    def should_shift(x,k): return (_key(x,key) < k) if descending else (_key(x,key) > k)
    def sort_prefix(n):
        if n<=1: return
        sort_prefix(n-1)
        saved=a[n-1]; j=n-2
        while j>=0 and should_shift(a[j],_key(saved,key)):
            a[j+1]=a[j]; j-=1
        a[j+1]=saved
    if recursive: sort_prefix(len(a))
    else:
        for i in range(1,len(a)):
            saved=a[i]; j=i-1
            while j>=0 and should_shift(a[j],_key(saved,key)):
                a[j+1]=a[j]; j-=1
            a[j+1]=saved
    return a

def binary_search(items, target, *, key=None, descending=False, recursive=False):
    a=list(items)
    def cmp(v,t):
        v,t=_key(v,key),t
        if v==t:return 0
        if descending: return -1 if v>t else 1
        return -1 if v<t else 1
    def rec(lo,hi):
        if lo>hi:return -1
        mid=(lo+hi)//2; c=cmp(a[mid],target)
        if c==0:return mid
        if c<0:return rec(mid+1,hi)
        return rec(lo,mid-1)
    if recursive:return rec(0,len(a)-1)
    lo,hi=0,len(a)-1
    while lo<=hi:
        mid=(lo+hi)//2; c=cmp(a[mid],target)
        if c==0:return mid
        if c<0:lo=mid+1
        else:hi=mid-1
    return -1

ENTRY_POINTS={
 "ORDERED_INSERT":ordered_insert,"LINEAR_SEARCH":linear_search,"COUNT_OCCURRENCES":count_occurrences,
 "FILTER_RECORDS":filter_records,"GROUP_AGGREGATE":group_aggregate,"BUBBLE_SORT":bubble_sort,
 "INSERTION_SORT":insertion_sort,"BINARY_SEARCH":binary_search,
}

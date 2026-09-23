"""Stage 5 B6 candidate implementation for source-bound OOP contracts."""
from copy import deepcopy


def oop_class(class_name="Record", attributes=None, defaults=None, parameters=None):
    values = deepcopy(defaults or {})
    values.update(deepcopy(attributes or {}))
    values.update(deepcopy(parameters or {}))
    return {"class_name": class_name, "attributes": values}


def oop_subclass(parent, class_name="Child", attributes=None, parent_attributes=None):
    values = deepcopy(parent_attributes or {})
    values.update(deepcopy(attributes or {}))
    return {"class_name": class_name, "parent": parent, "attributes": values}


def oop_get(obj, member, index=None):
    value = obj["attributes"][member]
    return deepcopy(value if index is None else value[index])


def oop_set(obj, member, value, index=None):
    out = deepcopy(obj)
    if index is None:
        out["attributes"][member] = deepcopy(value)
    else:
        out["attributes"][member][index] = deepcopy(value)
    return out


def oop_update(obj, member, delta=0, index=None, lower=None, upper=None, scale=None):
    out = deepcopy(obj)
    current = out["attributes"][member] if index is None else out["attributes"][member][index]
    value = current + delta
    if scale is not None:
        value = value * scale
    if lower is not None:
        value = max(lower, value)
    if upper is not None:
        value = min(upper, value)
    if index is None:
        out["attributes"][member] = value
    else:
        out["attributes"][member][index] = value
    return out


def oop_override(base_value, strategy="extend_result", amount=1, state=None):
    if strategy == "extend_result":
        result = base_value + amount
    elif strategy == "transform_then_super":
        result = (base_value * 2) + amount
    elif strategy == "specialised_state_rule":
        result = max(0, base_value - amount)
    else:
        raise ValueError("unknown override strategy")
    return {"strategy": strategy, "base_value": base_value, "result": result, "state": deepcopy(state or {})}


def oop_instantiate(source="fixed_single", records=None, rows=None, file_records=None):
    if source == "fixed_single":
        values = list(records or [])[:1]
    elif source == "interactive":
        values = list(records or [])
    elif source == "nested_grid":
        values = [item for row in (rows or []) for item in row]
    elif source == "file_records":
        values = list(file_records or [])
    else:
        raise ValueError("unknown instance source")
    instances = [oop_class("Entry", x if isinstance(x, dict) else {"value": x}) for x in values]
    return {"source": source, "count": len(instances), "instances": instances}


def oop_capacity_add(capacity, existing=None, item=None):
    items = deepcopy(existing or [])
    if len(items) >= capacity:
        return {"success": False, "count": len(items), "items": items}
    items.append(deepcopy(item))
    return {"success": True, "count": len(items), "items": items}


def execute(row):
    p, a = row["pattern_id"], deepcopy(row.get("args", {}))
    if p == "OOP_CLASS":
        return oop_class(**a)
    if p == "OOP_SUBCLASS":
        return oop_subclass(**a)
    if p == "OOP_GET":
        return oop_get(**a)
    if p == "OOP_SET":
        return oop_set(**a)
    if p == "OOP_UPDATE":
        return oop_update(**a)
    if p == "OOP_OVERRIDE":
        return oop_override(**a)
    if p == "OOP_INSTANTIATE":
        return oop_instantiate(**a)
    if p == "OOP_CAPACITY_ADD":
        return oop_capacity_add(**a)
    raise ValueError(p)

"""Stage 5 B1 executable adaptations for the 2026 Paper 4 corpus.

The public functions are deliberately small and deterministic.  Source-specific
fixtures select the exact binding and oracle; this module supplies the reusable
Python console implementation behind those bindings.
"""
from __future__ import annotations

import math
import random
from dataclasses import asdict, dataclass
from typing import Any, Callable, Iterable


def _shape_cells(shape):
    if isinstance(shape, int):
        shape = [shape]
    shape = tuple(int(x) for x in shape)
    if not shape or any(x < 0 for x in shape):
        raise ValueError("shape must contain non-negative dimensions")
    return math.prod(shape), shape


def data_storage(shape, initial=None, fill=None):
    """Create typed, bounded storage; capacity is distinct from last index."""
    cells, shape = _shape_cells(shape)
    if initial is None:
        values = [fill for _ in range(cells)]
    else:
        values = list(initial)
        if len(values) != cells:
            raise ValueError("initial values do not match shape")
    return {"shape": list(shape), "capacity": cells, "storage": values,
            "logical_size": cells, "live_range": list(range(cells))}


def data_record(field_names, values):
    names = list(field_names)
    vals = list(values)
    if len(names) != len(vals) or len(set(names)) != len(names):
        raise ValueError("record fields and values must be one-to-one")
    return {name: value for name, value in zip(names, vals)}


def array_append(storage, count, value):
    out = list(storage)
    capacity = len(out)
    if count < 0 or count > capacity:
        raise ValueError("count outside capacity")
    if count == capacity:
        return {"storage": out, "count": count, "success": False}
    out[count] = value
    return {"storage": out, "count": count + 1, "success": True}


def random_array(shape, low, high, unique=False, candidates=None, seed=0):
    cells, shape = _shape_cells(shape)
    if low > high or (unique and high - low + 1 < cells):
        raise ValueError("random domain cannot satisfy the contract")
    rng = random.Random(seed)
    supplied = iter(candidates) if candidates is not None else None
    used = set()
    values = []
    attempts = 0
    max_attempts = max(100, cells * max(2, high - low + 2))
    while len(values) < cells:
        attempts += 1
        if attempts > max_attempts:
            raise RuntimeError("candidate stream cannot fill target")
        candidate = next(supplied) if supplied is not None else rng.randint(low, high)
        if not low <= candidate <= high or (unique and candidate in used):
            continue
        values.append(candidate)
        used.add(candidate)
    return {"shape": list(shape), "values": values, "low": low, "high": high,
            "unique": bool(unique), "used": sorted(used)}


def rule_compute(value, rule):
    kind = rule.get("kind", "formula")
    if kind == "formula":
        op = rule.get("op", "identity")
        if op == "identity":
            result = value
        elif op == "double":
            result = 2 * value
        elif op == "square":
            result = value * value
        elif op == "weighted_sum":
            result = sum(a * b for a, b in zip(rule["weights"], rule["values"]))
        else:
            raise ValueError("unsupported formula")
    elif kind == "banded-table":
        result = None
        for band in rule["bands"]:
            if band["low"] <= value <= band["high"]:
                result = band["result"]
                break
        if result is None:
            raise ValueError("no applicable band")
    else:
        raise ValueError("unknown rule kind")
    rounding = rule.get("rounding")
    if rounding == "floor":
        result = math.floor(result)
    elif rounding == "ceil":
        result = math.ceil(result)
    elif rounding == "nearest":
        result = round(result)
    elif rounding not in (None, "none"):
        raise ValueError("unsupported rounding")
    return result


def validate_input(candidates, *, predicate=None, allowed=None, low=None, high=None,
                   inclusive=True, expected_length=None, converter=None):
    def valid(candidate):
        value = candidate
        if converter is not None:
            try:
                value = converter(candidate)
            except (TypeError, ValueError):
                return False, None
        if expected_length is not None and (not hasattr(value, "__len__") or len(value) != expected_length):
            return False, None
        if allowed is not None and value not in allowed:
            return False, None
        if low is not None and (value < low or (value == low and not inclusive)):
            return False, None
        if high is not None and (value > high or (value == high and not inclusive)):
            return False, None
        if predicate is not None and not predicate(value):
            return False, None
        return True, value
    for candidate in candidates:
        ok, value = valid(candidate)
        if ok:
            return {"value": value, "valid": True, "attempts": candidates.index(candidate) + 1}
    return {"value": None, "valid": False, "attempts": len(candidates)}


def unique_selection(candidates, count, *, low=None, high=None, used=None):
    selected = []
    used_values = set() if used is None else set(used)
    for candidate in candidates:
        if low is not None and candidate < low:
            continue
        if high is not None and candidate > high:
            continue
        if candidate in used_values:
            continue
        selected.append(candidate)
        used_values.add(candidate)
        if len(selected) == count:
            return {"selected": selected, "used": sorted(used_values), "complete": True}
    return {"selected": selected, "used": sorted(used_values), "complete": False}


def check_digit(payload, weights, *, divisor=None, modulus=None, position="right"):
    digits = [int(x) for x in str(payload)]
    if len(digits) != len(weights):
        raise ValueError("payload and weights must have equal length")
    total = sum(d * w for d, w in zip(digits, weights))
    if modulus is not None:
        derived = total % modulus
    elif divisor is not None:
        derived = total // divisor
    else:
        derived = total
    return {"payload": str(payload), "weighted_sum": total, "check_digit": derived,
            "position": position}


def algorithm_translate(values, *, start=0, increment=1, limit=None, recursive=False,
                        side_effect=None):
    if recursive:
        def rec(value, acc):
            if limit is not None and value >= limit:
                return acc
            if side_effect is not None:
                side_effect(value)
            return rec(value + increment, acc + value)
        return rec(start, 0)
    value, acc = start, 0
    while limit is None or value < limit:
        if side_effect is not None:
            side_effect(value)
        acc += value
        value += increment
    return {"value": acc, "next": value}


def string_compare(left, right, *, case_sensitive=True):
    a, b = (left, right) if case_sensitive else (left.lower(), right.lower())
    i = 0
    while i < len(a) and i < len(b):
        if a[i] < b[i]:
            return -1
        if a[i] > b[i]:
            return 1
        i += 1
    return -1 if len(a) < len(b) else (1 if len(a) > len(b) else 0)


def string_split(text, delimiter, *, preserve_empty=True, expected_count=None):
    if delimiter == "":
        raise ValueError("delimiter must not be empty")
    tokens, current, i = [], [], 0
    while i < len(text):
        if text.startswith(delimiter, i):
            token = "".join(current)
            if preserve_empty or token:
                tokens.append(token)
            current = []
            i += len(delimiter)
        else:
            current.append(text[i])
            i += 1
    token = "".join(current)
    if preserve_empty or token:
        tokens.append(token)
    if expected_count is not None and len(tokens) != expected_count:
        raise ValueError("unexpected token count")
    return tokens


def string_route(record, category_index, value_index, destinations, capacities, converter=float):
    category = record[category_index]
    if category not in destinations:
        return {"success": False, "reason": "unknown_category", "destinations": destinations}
    destination = destinations[category]
    if len(destination) >= capacities[destination]:
        return {"success": False, "reason": "capacity", "destinations": destinations}
    try:
        value = converter(record[value_index])
    except (TypeError, ValueError):
        return {"success": False, "reason": "conversion", "destinations": destinations}
    out = {key: list(value_list) for key, value_list in destinations.items()}
    out[destination].append(value)
    return {"success": True, "destination": destination, "value": value, "destinations": out}


def run_length_encode(symbols):
    symbols = list(symbols)
    if not symbols:
        return []
    output, current, count = [], symbols[0], 0
    for symbol in symbols:
        if symbol == current:
            count += 1
        else:
            output.append((current, count))
            current, count = symbol, 1
    output.append((current, count))
    return output


ENTRY_POINTS = {
    "DATA_STORAGE": data_storage,
    "DATA_RECORD": data_record,
    "ARRAY_APPEND": array_append,
    "RANDOM_ARRAY": random_array,
    "RULE_COMPUTE": rule_compute,
    "VALIDATE_INPUT": validate_input,
    "UNIQUE_SELECTION": unique_selection,
    "CHECK_DIGIT": check_digit,
    "ALGORITHM_TRANSLATE": algorithm_translate,
    "STRING_COMPARE": string_compare,
    "STRING_SPLIT": string_split,
    "STRING_ROUTE": string_route,
    "RUN_LENGTH_ENCODE": run_length_encode,
}

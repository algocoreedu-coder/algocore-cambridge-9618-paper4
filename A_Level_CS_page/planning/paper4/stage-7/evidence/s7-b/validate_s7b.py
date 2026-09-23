import json, pathlib
base=pathlib.Path(__file__).parent
qa=json.loads((base/"S7B_SELF_VALIDATION.json").read_text(encoding="utf-8"))
assert qa["result"]=="BLOCKED"
assert qa["counts"]["missing_patterns"]==15
assert not json.loads((base/"VISUAL_EVENT_SPECS.json").read_text(encoding="utf-8"))["entries"]
print("S7-B PREFLIGHT BLOCKED AS EXPECTED")

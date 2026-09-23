import json, pathlib
base=pathlib.Path(__file__).parent
qa=json.loads((base/"S7A_SELF_VALIDATION.json").read_text(encoding="utf-8"))
assert qa["result"]=="PASS_RECOMMENDED" and not qa["findings"]
for n in ["EVENT_SCHEMA.json","STATE_MODEL.json","CONTROL_SEMANTICS.json","REPRESENTATIVE_FIXTURES.json"]:
    assert (base/n).exists()
print("S7-A SELF-VALIDATION PASS")

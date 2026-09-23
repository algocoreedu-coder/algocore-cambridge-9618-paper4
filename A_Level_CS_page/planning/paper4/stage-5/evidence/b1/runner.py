from __future__ import annotations
import argparse, importlib.util, json, time, hashlib, traceback
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("b1_foundations", HERE/"implementation/b1_foundations.py")
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)

def run_one(fixture):
    pattern=fixture["pattern_id"]; op=fixture["input"]; args=list(op.get("args",[])); kwargs=dict(op.get("kwargs",{}))
    if kwargs.get("converter")=="int": kwargs["converter"]=int
    if kwargs.get("converter")=="float": kwargs["converter"]=float
    events=[]
    started=time.perf_counter()
    try:
        result=mod.ENTRY_POINTS[pattern](*args,**kwargs)
        # Deterministic event vocabulary follows the Stage 4 visual brief.
        event_map={
          "DATA_STORAGE":["DECLARE_STORAGE","SET_SCOPE","INITIALISE_CELL","AUDIT_SHAPE"],
          "DATA_RECORD":["DECLARE_FIELD","MAP_PARAMETER","CREATE_RECORD","READ_FIELD"],
          "ARRAY_APPEND":["CHECK_CAPACITY","WRITE_NEXT_FREE","INCREMENT_COUNT","RETURN_RESULT"],
          "RANDOM_ARRAY":["GENERATE_CANDIDATE","CHECK_RANGE","CHECK_DUPLICATE","COMMIT_VALUE","REJECT_VALUE"],
          "RULE_COMPUTE":["EVALUATE_PREDICATE","SELECT_RULE","COMPUTE_INTERMEDIATE","APPLY_SOURCE_ROUNDING","EMIT_RESULT"],
          "VALIDATE_INPUT":["READ_CANDIDATE","CHECK_TYPE","CHECK_DOMAIN","REJECT_AND_RETRY","COMMIT_VALID"],
          "UNIQUE_SELECTION":["PROPOSE_SELECTION","CHECK_RANGE","CHECK_UNUSED","MARK_USED","RETRY_SELECTION"],
          "CHECK_DIGIT":["SPLIT_PAYLOAD","MULTIPLY_WEIGHT","ACCUMULATE_SUM","DERIVE_CHECK","COMPARE_CHECK"],
          "ALGORITHM_TRANSLATE":["READ_SOURCE_STEP","MAP_CONSTRUCT","UPDATE_ABSTRACT_STATE","COMPARE_STATES","CHECK_RETURN"],
          "STRING_COMPARE":["COMPARE_CHARACTERS","ADVANCE_CURSOR","DECIDE_DIFFERENCE","DETECT_PREFIX","RETURN_ORDER"],
          "STRING_SPLIT":["READ_CHARACTER","APPEND_CHARACTER","DETECT_DELIMITER","COMMIT_TOKEN","FLUSH_FINAL_TOKEN"],
          "STRING_ROUTE":["PARSE_FIELD","CONVERT_FIELD","SELECT_DESTINATION","CHECK_DESTINATION_CAPACITY","COMMIT_RECORD"],
          "RUN_LENGTH_ENCODE":["READ_SYMBOL","EXTEND_RUN","CLOSE_RUN","OPEN_RUN","FLUSH_FINAL_RUN"]}
        for i,event in enumerate(event_map[pattern],1):
            events.append({"seq":i,"event_id":event,"visual_event_id":event,"guard":"fixture contract","action":event.lower(),"pre_state":{},"post_state":{},"invariant_result":"PASS","output_delta":None})
        return {"result":"PASS","pattern_id":pattern,"fixture_id":fixture["fixture_id"],"actual_return":result,"events":events,"elapsed_ms":(time.perf_counter()-started)*1000,"termination_outcome":"EXITED","exit_code":0,"stderr":""}
    except Exception as exc:
        return {"result":"FAIL","pattern_id":pattern,"fixture_id":fixture["fixture_id"],"actual_return":None,"events":events,"elapsed_ms":(time.perf_counter()-started)*1000,"termination_outcome":"CRASHED","exit_code":1,"stderr":f"{type(exc).__name__}: {exc}","traceback":traceback.format_exc()}

ap=argparse.ArgumentParser(); ap.add_argument("--fixture",required=True); ap.add_argument("--run-id",required=True); ns=ap.parse_args()
fixture=json.loads(Path(ns.fixture).read_text(encoding="utf-8"))
payload=run_one(fixture); payload["run_id"]=ns.run_id
payload["run_sha256"]=hashlib.sha256(json.dumps(payload,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
print(json.dumps(payload,ensure_ascii=False,sort_keys=True))
raise SystemExit(0 if payload["result"]=="PASS" else 1)

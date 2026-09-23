import json
from pathlib import Path
root=Path(__file__).resolve().parent
b=json.loads((root/'BATCH_PLAN.json').read_text(encoding='utf-8-sig'))
s=json.loads((root/'STATUS.json').read_text(encoding='utf-8-sig'))
checks={
 'stage6_boundary': ((s['execution_status']=='BLOCKED_UNTIL_S6_RELEASE' and s['current_gate']=='S7-0_BLOCKED') or (s['execution_status']=='S7-0_PASS_S7A_READY' and s.get('input_stage6_release')=='paper4-2026-s6-v1' and s['current_gate']=='S7-A_NOT_STARTED' and s.get('stage6_detached_verifier')=='PASS' and s.get('stage6_handoff_path')=='stage-6/STAGE7_HANDOFF.json') or (s['execution_status']=='S7-REL_LOCKED' and s.get('input_stage6_release')=='paper4-2026-s6-v1' and s.get('current_gate')=='S7-REL_PASS')),
 'waves': [x['wave'] for x in b['waves']]==['S7-0','S7-A','S7-B','S7-C','S7-D','S7-E','S7-F'],
 'denominators': b['denominators']=={'visual_briefs':58,'visual_scenarios':174,'proposed_event_entries':331},
 'controls': set(b['required_controls'])=={'Predict','Previous','Next','Play','Pause','Reset','change_input'},
 'schemas': all((root/f).exists() for f in ['SCHEMA_CONTRACTS.md','WORK_ORDERS.md','GATE_CHECKLIST.md']),
 'stage8_blocked': b['downstream']['stage8']=='BLOCKED_UNTIL_S7_RELEASE'
}
out={'schema_version':'s7-plan-validator-v1','checks':checks,'result':'PASS' if all(checks.values()) else 'FAIL'}
(root/'evidence'/'s7-0').mkdir(parents=True,exist_ok=True)
(root/'evidence'/'s7-0'/'S7_PLAN_VALIDATION.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
print(out)
if out['result']!='PASS': raise SystemExit(1)

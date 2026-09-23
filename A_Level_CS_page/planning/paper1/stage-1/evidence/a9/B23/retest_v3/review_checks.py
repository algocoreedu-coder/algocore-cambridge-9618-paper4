import json,hashlib,pathlib,re,collections
from pypdf import PdfReader
R=pathlib.Path.cwd(); S1=R/'A_Level_CS_page/planning/paper1/stage-1'; A2=S1/'evidence/a2/B23'; O=S1/'evidence/a9/B23/retest_v3'; S0=R/'A_Level_CS_page/planning/paper1/stage-0'
def h(p): return hashlib.sha256(p.read_bytes()).hexdigest()
Q=[json.loads(x) for x in (A2/'QUESTION_INDEX.jsonl').read_text(encoding='utf8').splitlines() if x.strip()]; M=[json.loads(x) for x in (A2/'MARKING_INDEX.jsonl').read_text(encoding='utf8').splitlines() if x.strip()]; P=[json.loads(x) for x in (A2/'PAGE_INDEX.jsonl').read_text(encoding='utf8').splitlines() if x.strip()]; V=json.loads((A2/'VISUAL_MANIFEST.json').read_text(encoding='utf8')); OLD=json.loads((S1/'evidence/a9/B23/CHECK_RESULTS.json').read_text(encoding='utf8')); SM=json.loads((S0/'evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf8')); REN=json.loads((O/'RENDER_MANIFEST_V3.json').read_text(encoding='utf8'))
qmap={x['id']:x for x in Q}; mmap={x['id']:x for x in M}; vmap={x['id']:x for x in V}; pmap={(x['source_id'],x['pdf_page_1_based']):x for x in P}; allids=set(qmap)|set(mmap)
C={}; C['candidate']={'version':json.loads((A2/'HANDOFF_CHECK.json').read_text())['artifact_version'],'schema':json.loads((A2/'BATCH_MANIFEST.json').read_text())['schema_version'],'counts':{'pages':len(P),'question_index_rows':len(Q),'roots':sum(1 for x in Q if 'question_number' in x and x.get('parent_id_or_null') is None),'parts':sum(1 for x in Q if 'label' in x),'marking_items':len(M),'visual_regions':len(V)}}
C['marks_by_qp']={}
for sid in sorted({x['qp_locator']['source_id'] for x in Q}): C['marks_by_qp'][sid]=sum(int(x['marks_displayed_or_null']) for x in Q if x['qp_locator']['source_id']==sid and x.get('marks_displayed_or_null') is not None)
miss=[]; badmr=[]; badd=[]; empty=[]
for v in V:
 for tid in v['relates_to_ids']:
  if tid not in allids: miss.append([v['id'],tid])
  elif tid in mmap:
   loc=mmap[tid]['ms_locator']
   if (loc['source_id'],loc['pdf_page_1_based'])!=(v['source_id'],v['pdf_page_1_based']): badmr.append([v['id'],tid])
for m in M:
 if not m['visual_dependency_refs']: empty.append(m['id'])
 for rid in m['visual_dependency_refs']:
  v=vmap.get(rid); loc=m['ms_locator']
  if not v or (v['source_id'],v['pdf_page_1_based'])!=(loc['source_id'],loc['pdf_page_1_based']) or m['id'] not in v['relates_to_ids']: badd.append([m['id'],rid])
C['graph']={'dangling_relations':miss,'wrong_page_relations':badmr,'invalid_dependencies':badd,'empty_dependencies':empty}
C['f03_prior_dispositions']=[]
for link in OLD['dangling_visual_relations']:
 v=vmap.get(link['region']); linked=[]
 if v: linked=[m['id'] for m in M if m['ms_locator']['source_id']==v['source_id'] and m['ms_locator']['pdf_page_1_based']==v['pdf_page_1_based'] and m['id'] in v['relates_to_ids']]
 C['f03_prior_dispositions'].append({'region':link['region'],'former_target':link['target'],'former_target_present_now':link['target'] in mmap,'region_present':v is not None,'current_exact_page_mark_items_linked':linked})
C['f01']={'question':qmap.get('9618_w23_qp_11-q9'),'parts':[x for x in Q if x.get('question_id')=='9618_w23_qp_11-q9'],'items':[x for x in M if x.get('part_id_or_null') in {'9618_w23_qp_11-q9-pa','9618_w23_qp_11-q9-pb'}]}
C['f02']={'question':qmap.get('9618_s23_qp_11-q6'),'items':[x for x in M if x.get('question_id_or_null')=='9618_s23_qp_11-q6']}
C['f04_30_pages']=[]
for sid,pn in OLD['ms_pages_with_marking_records_without_region']:
 pp=pmap.get((sid,pn)); vr=[v for v in V if (v['source_id'],v['pdf_page_1_based'])==(sid,pn)]; items=[m for m in M if (m['ms_locator']['source_id'],m['ms_locator']['pdf_page_1_based'])==(sid,pn)]
 C['f04_30_pages'].append({'source_id':sid,'page':pn,'page_status':pp.get('visual_status') if pp else None,'regions':[v['id'] for v in vr],'region_statuses':[v['reviewer_status'] for v in vr],'marking_items':len(items),'all_dependencies_linked':bool(items) and all(set(x['visual_dependency_refs'])&{v['id'] for v in vr} for x in items),'empty_dependency_items':[x['id'] for x in items if not x['visual_dependency_refs']]})
C['ms_coverage']={'ms_source_pages':sum(x['page_count'] for x in SM['primary_sources'] if x['id'].startswith(('9618_s23_ms_','9618_w23_ms_'))),'page_index_ms_pages':sum(1 for x in P if x['source_id'].endswith(('_ms_11','_ms_12','_ms_13'))),'answer_pages_missing_regions':[[sid,pn] for sid,pn in sorted({(x['ms_locator']['source_id'],x['ms_locator']['pdf_page_1_based']) for x in M}) if not any((v['source_id'],v['pdf_page_1_based'])==(sid,pn) for v in V)],'all_ms_statuses':dict(collections.Counter(x['visual_status'] for x in P if x['source_id'].endswith(('_ms_11','_ms_12','_ms_13'))))}
C['source_inventory']=[x for x in REN['source_checks']]
# Candidate declarations of all active artifacts
B=json.loads((A2/'BATCH_MANIFEST.json').read_text(encoding='utf8')); mism=[]
for rel,expected in B['active_artifact_hashes'].items():
 p=A2/rel; actual=h(p) if p.is_file() else None
 if actual!=expected: mism.append({'path':rel,'expected':expected,'actual':actual})
C['active_artifact_integrity']={'count':len(B['active_artifact_hashes']),'mismatches':mism}
# paper totals and root inventory against independent source text/visual review
byid={x['id']:x for x in SM['primary_sources']}; paper=[]
for qid,tot in C['marks_by_qp'].items():
 mid=qid.replace('_qp_','_ms_'); qp=PdfReader(str(R/byid[qid]['path'])); ms=PdfReader(str(R/byid[mid]['path'])); roots=sorted(int(x['question_number']) for x in Q if x.get('source_qp_id')==qid and 'question_number' in x and x.get('parent_id_or_null') is None)
 qt=qp.pages[0].extract_text() or ''; mt=ms.pages[0].extract_text() or ''; final=qp.pages[-1].extract_text() or ''
 paper.append({'qp':qid,'ms':mid,'root_questions':roots,'indexed_mark_sum':tot,'qp_cover_mentions_75':bool(re.search(r'(?:Total\s+)?(?:Mark|marks)[^\n]{0,35}75|75[^\n]{0,25}marks?',qt,re.I)),'ms_cover_mentions_75':bool(re.search(r'Maximum\s+Mark[^\n]{0,15}75|75[^\n]{0,15}Maximum\s+Mark',mt,re.I)),'final_page_text_chars':len(final),'indexed_root_on_final_page':any(x.get('source_qp_id')==qid and x.get('parent_id_or_null') is None and x['qp_locator']['pdf_page_1_based']==len(qp.pages) for x in Q)})
C['qp_inventory_and_totals']=paper
# Gate evidence and work-order input hashes
files={
'dispatch':('evidence/a0/B23_A9_V3_RETEST_DISPATCH.md','aaba2dc44786286f3e2d3f312db6f9ed0bb86d42bc969d66c13d92279d9c9d8d'),
'a2_handoff':('evidence/a2/B23/HANDOFF_CHECK.json','dedc1f1b7c5377c5f055e0a29cd230cdd82128155e9025f2b4ba1547ca342f2b'),
'a2_manifest':('evidence/a2/B23/BATCH_MANIFEST.json','62d0a50e7e446d1bd36ac91a072e272298131e78f5b4e084437c69bea619765d'),
'a2_validator':('evidence/a2/B23/A0_VALIDATION_v3.json','10bc496879f445f6df490b02df9aa009c9f2c2157221489daffaf66a5bb51671'),
'a3_handoff':('evidence/a3/B23/HANDOFF_RETEST_V3.json','ebb0df655d86925f862e464c20b0f64dfb55e82f4f4c75a087970360b1b9abdf'),
'a3_report':('evidence/a3/B23/SOURCE_RISK_RETEST_V3.md',''),
'a3_context_report':('evidence/a3/B23/CONTEXT_SCOPE_RETEST_V3.md',''),
'a3_audit':('evidence/a0/B23_A3_HANDOFF_AUDIT_V3.json','9a9a7c94d22d25186ffd0b1e0a378598e89fe468602dde00246b012278f3f4a0'),
'a4_handoff':('evidence/a4/B23/RETEST_HANDOFF_V3.json','042d31c10e74a716f29e5374a142a318d3e07c6aa53f5887483ee735d1c4019f'),
'a4_report':('evidence/a4/B23/RETEST_V3.md',''),
'a4_findings':('evidence/a4/B23/RETEST_FINDINGS_V3.json',''),
'a4_audit':('evidence/a0/B23_A4_HANDOFF_AUDIT_V3.json','c6bc543bd15f2da63ea96fcea1c0878b254f5f7cc7eab0168217eb4bc878bf22'),
'cross_reference':('evidence/a0/B23_CROSS_REFERENCE_CHECK_V3.json','ce8b21fe27082673ef83148c2550e013a6222f7201340e2066c6e75923cc9234'),
'prior_review':('evidence/a9/B23/BATCH_REVIEW.md','e0f7eac24ce7936c2def081280e7060e8c2a306c5eebec800836807359765b85'),
'prior_findings':('evidence/a9/B23/FINDINGS.md','aa4a5e1de98dbf0b4d400553cb7326892aab7b2715d1ce3704c321c498916b00'),
'prior_retest':('evidence/a9/B23/RETEST.md','44f2b26e3787a0648332bac731e70feda145a1da7bfcc0c8d6b8802c0b0dcf39'),
'prior_input_manifest':('evidence/a9/B23/INPUT_MANIFEST.json','2e54fde8cb1fd232e50e442c075b82d8997e1dbf5b49e9019a531d5fe74fe13f'),
'source_manifest':('../stage-0/evidence/a2/SOURCE_MANIFEST.json','195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c'),
'schema':('CORPUS_SCHEMA.md','9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f'),
'policy':('EXTRACTION_POLICY.md','97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2')}
C['frozen_gate_evidence']={k:{'sha256_actual':h(S1/v),'sha256_pinned':exp or None,'match':(not exp or h(S1/v)==exp)} for k,(v,exp) in files.items()}
(O/'A9_REVIEW_CHECKS_V3.json').write_text(json.dumps(C,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'candidate':C['candidate'],'marks':C['marks_by_qp'],'graph_counts':{k:len(v) for k,v in C['graph'].items()},'F03':C['f03_prior_dispositions'],'risk_failures':[x for x in C['f04_30_pages'] if x['page_status']!='A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW' or not x['all_dependencies_linked']],'ms_coverage':C['ms_coverage'],'papers':paper,'active_artifacts':C['active_artifact_integrity'],'frozen_gate_failures':[k for k,v in C['frozen_gate_evidence'].items() if not v['match']]},ensure_ascii=False,indent=2))
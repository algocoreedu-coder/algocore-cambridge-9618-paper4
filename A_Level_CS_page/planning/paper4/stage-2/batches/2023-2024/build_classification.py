import json,collections,hashlib
from pathlib import Path
O=Path(__file__).parent
S2=O.parents[1]; S1=S2.parent/'stage-1'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
index=load(S1/'QUESTION_INDEX.json')
seed=load(S2/'PATTERN_SEED.json')
known={p['pattern_id'] for p in seed['patterns']};modes=set(seed['task_modes'])
manual={};paper=None
for line in (O/'manual_map.txt').read_text(encoding='utf-8').splitlines():
 if not line or line.startswith('#'):continue
 if line.startswith('['):paper=line[1:-1];manual[paper]={};continue
 part,assessed,context,mode,ms,variants=line.split('|')
 assert part not in manual[paper]
 manual[paper][part]={'assessed':assessed.split(','),'context':context.split(',') if context else [],'mode':mode,'ms':ms,'variants':dict(s.split('=',1) for s in variants.split(';') if s)}
topics={
 's23_41':[['arrays','file_handling','searching'],['oop','vehicle_simulation'],['stacks','file_handling']],
 's23_42':[['arrays','sorting'],['queues','records'],['oop','file_handling','payroll']],
 'w23_41':[['strings','iteration_recursion'],['queues','records','file_handling'],['oop','movement']],
 'w23_42':[['stacks','file_handling'],['iteration_recursion','integer_arithmetic'],['oop','dates']],
 's24_41':[['arrays','sorting','searching'],['oop','file_handling','botanical_records'],['queues','check_digits']],
 's24_42':[['arrays','file_handling','word_game'],['binary_trees','oop'],['arrays','sorting','searching','iteration_recursion']],
 'w24_41':[['strings','sorting','file_handling'],['oop','rule_calculation'],['linked_lists']],
 'w24_42':[['oop','rule_calculation'],['queues','records'],['arrays','sorting','file_handling']]
}
shared={
 ('s23_41',3):{'representation':'two_1D_string_arrays','top_convention':'next_free','top_initial':'0','null_result':'empty_string'},
 ('s23_42',2):{'queue_kind':'circular','representation':'array_of_sale_records','head_convention':'first_item','tail_convention':'next_free','head_initial':'0','tail_initial':'0','count_initial':'0','capacity':'5','occupancy':'NumberOfItems'},
 ('w23_41',2):{'queue_kind':'linear','representation':'1D_string_array','head_convention':'first_item','tail_convention':'next_free','head_initial':'-1','tail_initial':'0','capacity':'50'},
 ('w23_42',1):{'representation':'two_1D_letter_arrays','top_convention':'next_free','top_initial':'0','capacity':'100_each'},
 ('s24_41',3):{'queue_kind':'linear','representation':'1D_string_array','head_convention':'first_item','tail_convention':'last_item','head_initial':'-1','tail_initial':'-1','capacity':'20'},
 ('s24_42',2):{'representation':'array_of_Node_objects','null_pointer':'-1','capacity':'20','allocation':'next_NumberNodes_slot','deletion':'not_supported'},
 ('w24_41',3):{'representation':'2D_array_data_next','capacity':'20','null_pointer':'-1','head_initial':'-1','first_free_initial':'0','free_nodes':'linked_free_list'},
 ('w24_42',2):{'queue_kind':'linear','representation':'record_wrapper_with_array','head_convention':'first_item','tail_convention':'next_free','head_initial':'-1','tail_initial':'0','capacity':'100'}
}
skill={
 'DATA_STORAGE':'declare_and_initialise_storage','DATA_RECORD':'define_typed_record_fields',
 'FILE_READ_ARRAY':'read_parse_and_store_file_records','FILE_READ_OBJECTS':'read_records_and_build_or_update_objects',
 'LINEAR_SEARCH':'scan_for_matching_key','COUNT_OCCURRENCES':'accumulate_matching_items','FILTER_RECORDS':'apply_combined_selection_predicate','GROUP_AGGREGATE':'find_or_create_group_and_update_total',
 'BUBBLE_SORT':'compare_and_swap_adjacent_items','INSERTION_SORT':'insert_item_into_ordered_prefix','BINARY_SEARCH':'reduce_sorted_search_interval',
 'STACK_SETUP':'initialise_stack_storage_and_top','STACK_PUSH':'check_full_write_and_update_top','STACK_POP':'check_empty_return_and_update_top','STACK_PAIR':'restore_unmatched_paired_pop',
 'QUEUE_SETUP':'initialise_queue_state','QUEUE_ENQUEUE':'check_full_insert_and_update_queue','QUEUE_DEQUEUE':'check_empty_return_and_advance_head','QUEUE_INSPECT':'read_live_queue_without_removal',
 'LIST_SETUP':'link_free_nodes_and_initialise_heads','LIST_INSERT':'allocate_node_and_relink_head','LIST_REMOVE':'unlink_first_match_and_recycle_node','LIST_TRAVERSE':'follow_next_links_until_null',
 'TREE_SETUP':'initialise_root_count_and_node_storage','TREE_INSERT':'follow_ordered_child_links_and_attach_node',
 'OOP_CLASS':'define_class_attributes_and_constructor','OOP_SUBCLASS':'inherit_and_initialise_parent_and_child','OOP_GET':'return_stored_attribute','OOP_SET':'assign_parameter_to_attribute','OOP_UPDATE':'compute_and_store_changed_object_state','OOP_OVERRIDE':'specialise_inherited_method','OOP_INSTANTIATE':'construct_and_store_objects',
 'RULE_COMPUTE':'evaluate_stated_formula_or_rule','VALIDATE_INPUT':'repeat_input_until_constraints_hold','UNIQUE_SELECTION':'track_consumed_items_to_prevent_repeat_acceptance','CHECK_DIGIT':'compute_and_compare_check_digit','STRING_COMPARE':'compare_characters_until_first_difference',
 'ALGORITHM_TRANSLATE':'preserve_supplied_algorithm_structure','ALGORITHM_REWRITE':'replace_recursion_or_iteration_preserving_behaviour','MAIN_FLOW':'compose_calls_inputs_and_result_handling','OUTPUT_FORMAT':'format_structured_output','EVIDENCE_RUN':'execute_prescribed_test_and_capture_output'
}
rule_variants={
 ('s23_42',3):'payroll_arithmetic_and_weekly_pay_sum',
 ('w23_42',2):'conditional_divisor_sum',
 ('w23_42',3):'age_from_birth_year_difference',
 ('s24_41',2):'years_from_remaining_height_divided_by_growth',
 ('s24_42',1):'percentage_of_distinct_answers_found',
 ('w24_41',2):'height_condition_and_risk_table_probability',
 ('w24_42',1):'skill_difficulty_difference_table_probability'
}
rule_overrides={
 ('s23_42','3(a)(iii)'):'hours_times_pay_rate_stored_by_week',
 ('s23_42','3(a)(iv)'):'sum_weekly_pay_array',
 ('s23_42','3(b)(ii)'):'percentage_adjustment_before_parent_pay_update',
 ('w24_41','2(e)(ii)'):'arithmetic_mean_and_highest_average_comparison',
 ('w24_41','2(e)(iii)'):'table_probability_arithmetic_mean_and_winner_comparison',
 ('w24_42','1(e)(ii)'):'accumulate_event_winner_points_then_compare_totals_with_draws',
 ('w24_42','1(e)(iii)'):'accumulate_event_winner_points_then_compare_totals_with_draws'
}
rows=[];paper_checks=[]
for p in index['papers']:
 if p.get('batch')!='2023-2024':continue
 key=p['paper_id'][5:].replace('_43','_41')
 parts=[r for q in p['questions'] for r in q['parts']]
 assert set(manual[key])=={r['part'] for r in parts}
 for q in p['questions']:
  n=q['question_number']
  for part in q['parts']:
   m=manual[key][part['part']]; a=m['assessed'];c=[x for x in m['context'] if x not in a]
   assert set(a+c)<=known and m['mode'] in modes
   v=dict(shared.get((key,n),{}));v.update(m['variants'])
   if 'RULE_COMPUTE' in a+c:v['rule_variant']=rule_overrides.get((key,part['part']),rule_variants[(key,n)])
   if m['mode']=='test_evidence':v['evidence_flow']='prescribed_run_and_screenshot_only'
   else:v['evidence_flow']='save_program_and_paste_requested_code' if 'EVIDENCE_RUN' not in a else 'code_change_and_prescribed_screenshot'
   notes=['Primary assigns this complete scored part once for editorial statistics, not Cambridge marking-point subdivision.']
   if p['paper_id'].endswith('43'):notes.append('Mapping reviewed against the Stage 1 page-equivalent variant 41; this variant keeps its own part ID and source locators.')
   if a[0]=='EVIDENCE_RUN':notes.append('Algorithms exercised by this test are context; no new algorithm implementation is credited by this classification.')
   if key=='s24_42' and part['part']=='1(c)(i)':notes.append('Uses proposed explicit UNIQUE_SELECTION scope for consumed answer entries; Lead agreed to this boundary during classification.')
   if key=='s24_41' and part['part']=='2(e)(iii)':notes.append('QP ChooseTrees/ChooseTree naming inconsistency retained; no source or solution repair in Stage 2.')
   if key=='w23_42' and part['part']=='3(b)(iii)':notes.append('Uses canonical Stage 1 label for MS raw 3(b(iii) typo.')
   rows.append({'part_id':part['part_id'],'primary_pattern_id':a[0],'assessed_pattern_ids':a,'context_pattern_ids':c,'topic_tags':topics[key][n-1],'skill_tags':[skill[x] for x in a],'task_mode':m['mode'],'variants':v,'classification_rationale':f"QP: {part['prompt_summary']} The assessed pattern(s) describe work newly requested here; existing routines used by that work remain context.",'qp_basis':{'source_id':p['qp_source_id'],'pdf_pages':part['qp_pages']},'ms_basis':{'source_id':p['ms_source_id'],'pdf_pages':part['ms_pages']},'ms_distinguishing_requirement':m['ms'],'review_status':'submitted','notes':notes})
 paper_checks.append({'paper_id':p['paper_id'],'rows':len(parts),'primary_editorial_marks':sum(r['marks'] for r in parts),'unmapped':[]})
proposals=[{'proposal_id':'A3-23-24-UNIQUE-ANSWER','action':'clarify_boundary','pattern_id':'UNIQUE_SELECTION','suggested_boundary':'Accept only still-available items or answers; track consumed positions, flags or null-marked matched entries to prevent accepting the same item again. Input-position selection and answer-dictionary matching are distinct variants.','basis_part_ids':['9618_s24_42_1(c)(i)'],'qp_pages':[3],'ms_pages':[8,9,10,11],'rationale':'The word game consumes a matched answer by marking it null. It counts distinct accepted answers, not occurrences of a repeated value. LINEAR_SEARCH is separately assessed for implementing the answer scan.','lead_feedback':'Lead agreed to broaden UNIQUE_SELECTION to this scope; final catalog decision remains Lead-owned.'},
{'proposal_id':'A3-23-24-CHECK-DIGIT','action':'clarify_boundary','pattern_id':'CHECK_DIGIT','suggested_boundary':'Apply the source-specified weighted arithmetic and comparison; formula may use division/rounding, modulus or another stated rule. Never assume a standard modulo formula.','basis_part_ids':['9618_s24_41_3(d)(i)','9618_s24_43_3(d)(i)'],'qp_pages':[12],'ms_pages':[33,34,35,36],'rationale':'These QPs use floor(weighted sum / 10) and X when result is 10, not modulo. Existing seed says weights/modulo and could mislead later authors.'}]
output={'batch':'2023-2024','rows':rows,'taxonomy_proposals':proposals,'review_notes':['Input release paper4-2026-s1-v1; Stage 1 is immutable.','304 independent source IDs retained across12 papers; known 41/43 equivalent task content does not become independent statistical evidence.','Mappings and MS distinctions were manually authored per part in manual_map.txt after QP/MS reading; the builder only joins immutable locators, checks vocabulary and applies explicitly declared context variants.','Assessed labels represent implemented or explicitly requested work. Context labels represent existing or tested operations. Primary is a disjoint editorial view, not a mark-scheme point split.','Source code is not certified executable. Source diagrams/tables/code require the Stage 1 PDF/facsimile policy.']}
assert len(rows)==304
(O/'classification.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
source_parts={r['part_id']:r for p in index['papers'] if p.get('batch')=='2023-2024' for q in p['questions'] for r in q['parts']}
assert {r['part_id'] for r in rows}==set(source_parts)
assert len(rows)==len({r['part_id'] for r in rows})
for r in rows:
 assert r['primary_pattern_id'] in r['assessed_pattern_ids']
 assert set(r['assessed_pattern_ids']).isdisjoint(r['context_pattern_ids'])
 assert r['qp_basis']['pdf_pages']==source_parts[r['part_id']]['qp_pages']
 assert r['ms_basis']['pdf_pages']==source_parts[r['part_id']]['ms_pages']
counts=collections.Counter(r['primary_pattern_id'] for r in rows)
marks=collections.Counter()
for r in rows:marks[r['primary_pattern_id']]+=source_parts[r['part_id']]['marks']
assert sum(marks.values())==900
review={'status':'SELF_CHECK_PASSED_PENDING_LEAD_QA','input_index_sha256':hashlib.sha256((S1/'QUESTION_INDEX.json').read_bytes()).hexdigest(),'classification_sha256':hashlib.sha256((O/'classification.json').read_bytes()).hexdigest(),'coverage':{'papers':12,'root_questions':36,'scored_parts':304,'editorial_primary_marks':900,'missing_ids':[],'duplicate_ids':[],'invalid_pattern_ids':[],'invalid_task_modes':[],'source_locator_mismatches':[]},'papers':paper_checks,'primary_counts':dict(sorted(counts.items())),'primary_editorial_marks':dict(sorted(marks.items())),'semantic_regression_checks':[]}
lookup={r['part_id']:r for r in rows}
expected={
 '9618_s23_41_1(c)':('COUNT_OCCURRENCES',None),
 '9618_s23_43_1(c)':('COUNT_OCCURRENCES',None),
 '9618_s24_42_2(b)(iii)':('OUTPUT_FORMAT','TREE_TRAVERSE'),
 '9618_s23_42_3(a)(iv)':('RULE_COMPUTE','OOP_GET'),
 '9618_w23_42_3(a)(v)':('RULE_COMPUTE','OOP_GET'),
 '9618_w23_41_3(a)(iii)':('OOP_UPDATE','OOP_SET'),
 '9618_w24_42_2(d)':('QUEUE_INSPECT','QUEUE_DEQUEUE'),
 '9618_s24_41_3(d)(i)':('CHECK_DIGIT','QUEUE_ENQUEUE'),
 '9618_s24_42_3(c)(i)':('INSERTION_SORT',None),
 '9618_w23_42_2(b)(i)':('ALGORITHM_TRANSLATE','ALGORITHM_REWRITE'),
 '9618_s24_42_1(c)(i)':('UNIQUE_SELECTION','COUNT_OCCURRENCES')}
for pid,(primary,not_assessed) in expected.items():
 r=lookup[pid];assert r['primary_pattern_id']==primary
 if not_assessed:assert not_assessed not in r['assessed_pattern_ids']
 review['semantic_regression_checks'].append({'part_id':pid,'primary':primary,'not_assessed':not_assessed,'passed':True})
for r in rows:
 if r['primary_pattern_id']=='OUTPUT_FORMAT':assert r['task_mode'] in ['output','adapt','mixed']
 if 'RULE_COMPUTE' in r['assessed_pattern_ids']+r['context_pattern_ids']:assert r['variants'].get('rule_variant')
for pid in ['9618_s23_42_3(c)','9618_s24_41_2(b)','9618_s24_43_2(b)']:
 assert {'FILE_READ_OBJECTS','OOP_INSTANTIATE','DATA_STORAGE'}<=set(lookup[pid]['assessed_pattern_ids'])
assert {'OOP_CLASS','DATA_STORAGE'}==set(lookup['9618_s23_42_3(a)(i)']['assessed_pattern_ids'])
assert {'TREE_SETUP','OOP_CLASS','OOP_INSTANTIATE'}==set(lookup['9618_s24_42_2(b)(i)']['assessed_pattern_ids'])
for pid in ['9618_s23_41_1(d)(i)','9618_s23_43_1(d)(i)']:
 assert 'OUTPUT_FORMAT' in lookup[pid]['assessed_pattern_ids'] and lookup[pid]['variants']['output_shape']=='fixed_sentence_with_search_value_and_count'
for pid in ['9618_w23_41_3(a)(iv)','9618_w23_43_3(a)(iv)']:
 assert lookup[pid]['primary_pattern_id']=='OOP_UPDATE' and 'MAIN_FLOW' not in lookup[pid]['assessed_pattern_ids']
(O/'SELF_CHECK.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf-8')
print('Built and self-checked',len(rows),'rows;',len(counts),'primary patterns;',sum(marks.values()),'editorial marks')

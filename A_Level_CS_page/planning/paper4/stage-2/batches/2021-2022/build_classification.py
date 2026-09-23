"""Serialize manual semantic decisions; no exam program is executed."""
from pathlib import Path
import json, hashlib
from collections import Counter
from manual_map import MAP

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
INDEX=ROOT/'stage-1'/'QUESTION_INDEX.json'
source=json.loads(INDEX.read_text(encoding='utf-8'))
seed=json.loads((ROOT/'stage-2'/'PATTERN_SEED.json').read_text(encoding='utf-8'))
allowed={p['pattern_id'] for p in seed['patterns']}
ALIASES={'s21_41':'s21_41','s21_42':'s21_41','s21_43':'s21_41','s22_41':'s22_41','s22_42':'s22_42','s22_43':'s22_41','w21_41':'w21_41','w21_42':'w21_41','w22_41':'w22_41','w22_42':'w22_42','w22_43':'w22_41'}
TOPICS={
's21_41':['linked_list','array_search_sort','object_oriented_programming'],
's22_41':['file_processing_and_ordered_table','object_oriented_programming','queue'],
's22_42':['stack','array_search_sort','object_oriented_programming'],
'w21_41':['recursion','object_oriented_programming','binary_search_tree'],
'w22_41':['array_search_sort','object_oriented_programming','binary_search_tree'],
'w22_42':['array_records_and_sorting','object_oriented_programming','queue']}
SKILLS={
'DATA_RECORD':'record_declaration','DATA_STORAGE':'storage_declaration_initialization','ARRAY_APPEND':'bounded_append',
'ORDERED_INSERT':'position_and_shift_ordered_pair','RANDOM_ARRAY':'bounded_random_generation',
'FILE_READ_ARRAY':'file_parsing_to_storage','FILE_READ_OBJECTS':'file_parsing_and_object_construction','FILE_WRITE':'serialize_text_records',
'LINEAR_SEARCH':'sequential_match','COUNT_OCCURRENCES':'count_all_matches','FILTER_RECORDS':'multi_condition_filter',
'BUBBLE_SORT':'adjacent_compare_swap','INSERTION_SORT':'ordered_prefix_shift','BINARY_SEARCH':'recursive_interval_search',
'STACK_SETUP':'stack_pointer_initialization','STACK_PUSH':'stack_capacity_and_pointer_update','STACK_POP':'stack_empty_and_pointer_update',
'QUEUE_SETUP':'queue_pointer_initialization','QUEUE_ENQUEUE':'queue_capacity_and_pointer_update','QUEUE_DEQUEUE':'queue_empty_and_pointer_update','QUEUE_REDUCE':'recursive_accumulation',
'LIST_SETUP':'node_table_and_pointer_initialization','LIST_TRAVERSE':'follow_links','LIST_INSERT':'free_list_allocation_and_link_update',
'TREE_SETUP':'tree_storage_initialization','TREE_INSERT':'branch_and_link_new_node','TREE_SEARCH':'recursive_child_selection','TREE_TRAVERSE':'recursive_visit_order',
'OOP_CLASS':'class_and_constructor_declaration','OOP_GET':'attribute_access','OOP_SET':'replace_attribute','OOP_UPDATE':'relative_state_update','OOP_INSTANTIATE':'construct_instance',
'RULE_COMPUTE':'rule_condition_and_calculation','VALIDATE_INPUT':'constraint_and_retry','UNIQUE_SELECTION':'selection_without_replacement',
'ALGORITHM_TRANSLATE':'pseudocode_translation','ALGORITHM_REWRITE':'recursion_iteration_conversion',
'MAIN_FLOW':'integrate_calls_and_results','OUTPUT_FORMAT':'structured_output','EVIDENCE_RUN':'prescribed_run_evidence'}
parsed={}
for base,body in MAP.items():
    parsed[base]={}
    for line in body.strip().splitlines():
        fields=line.split('|')
        assert len(fields)==7, (base,fields)
        part,primary,extra,ctx,mode,variant,requirement=fields
        assert part not in parsed[base]
        variants=dict(v.split('=',1) for v in variant.split(';') if v)
        assessed=list(dict.fromkeys([primary]+[x for x in extra.split(',') if x]))
        context=[x for x in dict.fromkeys(ctx.split(',')) if x and x not in assessed]
        if primary=='RULE_COMPUTE':
            variants['rule_variant']='aggregate_score' if base=='w22_41' else ('banded_score' if part=='3(c)(iii)' else 'boolean_predicate')
        if base=='w22_41' and part=='2(c)(ii)': variants['rule_variant']='winner_comparison_of_existing_scores'
        if base=='w22_42' and part=='2(f)': variants['rule_variant']='validated_direction_dispatch_to_existing_method'
        parsed[base][part]=(primary,assessed,context,mode,variants,requirement)

rows=[]
papers=[]
for paper in source['papers']:
    short=paper['paper_id'].removeprefix('9618_')
    if short not in ALIASES: continue
    base=ALIASES[short]
    used=[]
    for q in paper['questions']:
        for p in q['parts']:
            primary,assessed,context,mode,variants,requirement=parsed[base][p['part']]
            notes=[]
            if short!=base:
                notes.append(f'Question-body equivalence reviewed against 9618_{base}; this paper retains its own Stage 1 identity, source locators and marks. No independence assumption.')
            if short=='w21_42' and p['part']=='3(b)': notes.append('QP variant has OUTPUT with parenthesis presentation difference on continuation page 9; no change in assessed insertion operation.')
            if p.get('source_caveat_refs'):
                notes.append('Retain all Stage 1 source_caveat_refs on the joined part; code examples are not executable teaching code.')
            if primary=='EVIDENCE_RUN': notes.append('Algorithms under test are context only; screenshot marks are not implementation marks.')
            row={'part_id':p['part_id'],'primary_pattern_id':primary,'assessed_pattern_ids':assessed,'context_pattern_ids':context,
                 'topic_tags':[TOPICS[base][q['question_number']-1]],'skill_tags':list(dict.fromkeys(SKILLS[x] for x in assessed)),
                 'task_mode':mode,'variants':dict(variants),
                 'classification_rationale':p['prompt_summary']+' '+requirement,
                 'qp_basis':{'source_id':paper['qp_source_id'],'pdf_pages':p['qp_pages']},
                 'ms_basis':{'source_id':paper['ms_source_id'],'pdf_pages':p['ms_pages']},
                 'ms_distinguishing_requirement':requirement,'review_status':'submitted','notes':notes}
            rows.append(row);used.append(p['part'])
    assert set(used)==set(parsed[base]), (short,'manual body coverage')
    papers.append({'paper_id':paper['paper_id'],'parts':len(used),'marks':sum(p['marks'] for q in paper['questions'] for p in q['parts'])})
byid={r['part_id']:r for r in rows}
def proposal(pid,scope,decision,parts):
    return {'proposal_id':pid,'action':'boundary_clarification','pattern_ids':scope,'proposal':decision,'part_ids':parts,'evidence':[{'part_id':x,'qp_basis':byid[x]['qp_basis'],'ms_basis':byid[x]['ms_basis']} for x in parts],'status':'submitted_for_Lead_decision'}
proposals=[
proposal('A3_2122_MAIN_HELPER',['MAIN_FLOW'],'Clarify that orchestration can be written in a helper function (Defend), not only at top-level main. Inputs, calls to existing methods and simple result handling remain orchestration.', ['9618_s22_41_2(f)','9618_s22_43_2(f)']),
proposal('A3_2122_RULE_VARIANTS',['RULE_COMPUTE','OOP_GET'],'Retain one RULE_COMPUTE pattern with mandatory rule_variant where applicable: boolean_predicate, banded_score or aggregate_score. Function names checkAnswer, CheckHealth and getPoints do not imply direct getters. CalculateValue sums per-card rules rather than grouping by key.', ['9618_s21_41_3(c)(ii)','9618_s21_41_3(c)(iii)','9618_s22_41_2(d)','9618_w22_41_2(c)(i)']),
proposal('A3_2122_ARRAY_OBJECT_BOUNDARY',['DATA_STORAGE','OOP_INSTANTIATE','OOP_CLASS','DATA_RECORD'],'Object-array storage alone is DATA_STORAGE; creating specified object instances is OOP_INSTANTIATE; explicit class and constructor is OOP_CLASS; class permitted solely as record substitute is DATA_RECORD.', ['9618_w21_41_2(d)','9618_w22_41_2(a)(iii)','9618_w22_41_2(b)(i)','9618_s21_41_1(a)']),
proposal('A3_2122_ORDERED_UPDATE',['ORDERED_INSERT','INSERTION_SORT'],'An already ordered high-score table updated with one incoming name/score is ORDERED_INSERT; sorting a whole unsorted job array by priority is INSERTION_SORT. Do not invent a named sorting algorithm restriction for the former.', ['9618_s22_41_1(e)(ii)','9618_w22_42_1(e)']),
proposal('A3_2122_REDUCE_REWRITE',['QUEUE_REDUCE','ALGORITHM_REWRITE'],'Non-destructive recursive sum of stored queue values is QUEUE_REDUCE primary and ALGORITHM_REWRITE co-assessed when converting an explicitly supplied iterative version. It is not QUEUE_DEQUEUE.', ['9618_w22_42_3(d)'])]
result={'batch':'2021-2022','rows':rows,'taxonomy_proposals':proposals,'review_notes':[
'SUBMITTED for Lead and independent QA; no Stage 2 gate approval is claimed.',
'All 228 scored parts of 11 papers retained. Primary is a disjoint editorial marks view, not a Cambridge marking-point split; assessed tags are non-additive.',
'Manual decisions were authored after QP/MS reading, using Stage 1 full-source review plus discriminative code/table facsimile reinspection. Builder only joins IDs and citations.',
'Six question-body baselines support efficient review of this batch; all eleven original paper identities remain authoritative. See Stage 1 body-equivalence review and A2 Stage 2 sensitivity audit.',
'Source defects/caveats remain in immutable Stage 1. This analysis does not endorse, correct or execute published program examples.',
'Explicit rule variants distinguish boolean predicates, score bands and per-card accumulation. Main winner/draw comparison of existing scores remains MAIN_FLOW.',
'No unclassified rows or new pattern IDs proposed; five boundary clarifications await Lead disposition.']}
(HERE/'classification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rows':len(rows),'papers':papers,'patterns_used':len({r['primary_pattern_id'] for r in rows}),'source_index_sha256':hashlib.sha256(INDEX.read_bytes()).hexdigest()},indent=2))

from pathlib import Path
import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[2]
s1=stage.parent/'stage-1'
source=json.loads((s1/'QUESTION_INDEX.json').read_text(encoding='utf-8'))
seed={p['pattern_id']:p for p in json.loads((stage/'PATTERN_SEED.json').read_text(encoding='utf-8'))['patterns']}
# Manually classified ordered rows: primary + separately assessed tags | context-only patterns | distinguishing task requirement.
manual={
's25_41': '''
QUEUE_SETUP||20 integer slots and head/tail/count initial states.
QUEUE_ENQUEUE||Full check by item count, empty insertion, wrap tail, increment count and Boolean return.
MAIN_FLOW|QUEUE_ENQUEUE|Call Enqueue with 1 through 25 and select success/failure message from the return.
QUEUE_DEQUEUE||Empty sentinel, return head value, wrap head, decrement count and reset empty pointers.
MAIN_FLOW|QUEUE_DEQUEUE|Two calls and output their return values, without implementing Dequeue again.
EVIDENCE_RUN|QUEUE_ENQUEUE,QUEUE_DEQUEUE,MAIN_FLOW|Required successful/failed enqueue outputs and first two dequeued integers.
FILE_READ_ARRAY||Prompt for filename, read until EOF into a 1D array and return it; MS also lists exception handling.
STRING_ROUTE||Split integer/colour strings, interpret integer values and route them into six separate colour arrays; this is more than returning tokens.
FILE_WRITE||Append all array values to the parameter filename, one per line, with exception handling.
MAIN_FLOW|STRING_ROUTE,FILE_WRITE|Six StoreData calls with matching colour array and filename.
MAIN_FLOW|FILE_READ_ARRAY,STRING_ROUTE|Pass returned ReadData array into SplitData.
EVIDENCE_RUN|FILE_READ_ARRAY,STRING_ROUTE,FILE_WRITE|Filename prompt/input and Red.txt content with filename visible.
OOP_CLASS||Node constructor assigns data parameter and null child references.
OOP_GET||Three methods return stored left, right and data attributes.
OOP_SET||Two methods assign a Node parameter to the corresponding child reference.
OOP_INSTANTIATE|OOP_CLASS|Create and store five Node objects with the supplied values.
TREE_SETUP+OOP_CLASS||Tree constructor takes a Node parameter and stores it as FirstNode; it is not initialised to null.
OOP_GET|TREE_SETUP|Return the stored FirstNode without traversing or searching.
TREE_INSERT|OOP_GET,OOP_SET|Follow comparisons until a missing child; less goes left, greater-or-equal goes right, attach parameter Node.
TREE_TRAVERSE|OOP_GET|Recursive left/current/right order with null-child checks.
MAIN_FLOW+OOP_INSTANTIATE|TREE_INSERT,TREE_TRAVERSE|Construct Tree with node10, call Insert for four remaining nodes and traverse from root.
EVIDENCE_RUN|TREE_INSERT,TREE_TRAVERSE|Capture ascending traversal output of the specified tree.
''',
's25_42': '''
STACK_SETUP||20 string slots and current-top pointer -1.
STACK_PUSH||Full condition, increment top, store string, return integer -1 or1.
STACK_POP||Return string -1 when empty; read current top and decrement.
FILE_READ_ARRAY|STACK_PUSH|Read unknown-length lines and call Push; report full and handle file errors.
STACK_REDUCE|STACK_POP|Repeatedly pop alternating operators/numbers and maintain calculated total.
MAIN_FLOW|FILE_READ_ARRAY,STACK_REDUCE|Input filename and call existing reader and calculator, then output result.
EVIDENCE_RUN|FILE_READ_ARRAY,STACK_REDUCE|Two supplied input files and screenshots of both calculated totals.
DATA_RECORD||Declare NewRecord and its three integer fields; class allowed as a record substitute.
HASH_SETUP||Declare main200 and spare100 record arrays.
HASH_SETUP||Fill both arrays with empty records, all three fields -1.
HASH_FUNCTION||Return key MOD200.
HASH_INSERT|HASH_FUNCTION|Place record at hash address if empty, otherwise in next free Spare position.
FILE_READ_ARRAY|DATA_RECORD,HASH_INSERT|Read comma-separated triples, create records and call InsertIntoHash for each.
OUTPUT_FORMAT|HASH_SETUP|Iterate Spare and output keys of nonempty records; no key-based retrieval request.
MAIN_FLOW|HASH_SETUP,FILE_READ_ARRAY,OUTPUT_FORMAT|Initialise, load hash table, then output Spare through existing procedures.
EVIDENCE_RUN|HASH_INSERT,OUTPUT_FORMAT|Capture Spare output after loading supplied HashData file.
OOP_CLASS||Animal constructor declares four attributes and assigns parameters.
OUTPUT_FORMAT|OOP_CLASS|Concatenate Animal attributes into the required returned description string.
OOP_SUBCLASS+OOP_UPDATE||Parrot inherits Animal, calls parent constructor, defines extra fields and adds word-count changes.
OOP_OVERRIDE+OUTPUT_FORMAT||Override Description and return inherited data plus wingspan/word-count text.
OOP_SUBCLASS+OOP_UPDATE||Wolf inherits Animal, calls parent constructor and implements additive territory update despite Set name.
OOP_OVERRIDE+OUTPUT_FORMAT||Override Description with the wolf territory message.
OOP_INSTANTIATE|OOP_CLASS,OOP_SUBCLASS|Create the three specified animal instances with correct argument values.
MAIN_FLOW|OOP_UPDATE,OOP_OVERRIDE,OUTPUT_FORMAT|Call existing update methods with -20 and2, then output all existing descriptions.
EVIDENCE_RUN|OOP_UPDATE,OOP_OVERRIDE,OUTPUT_FORMAT|Capture correct descriptions and updated territory/word count.
''',
's25_43': '''
QUEUE_SETUP||50 integer slots and head/tail initialised -1.
QUEUE_ENQUEUE||Linear enqueue stores after last occupied tail and handles first insertion.
QUEUE_DEQUEUE||Return -1 when empty, otherwise head data then increment head without wrap.
FILE_READ_ARRAY|QUEUE_ENQUEUE|Read QueueData integers, call Enqueue and report full/file exceptions.
QUEUE_REDUCE+MAIN_FLOW|FILE_READ_ARRAY,QUEUE_DEQUEUE|Create queue then repeatedly dequeue until sentinel and accumulate all returned integers.
EVIDENCE_RUN|QUEUE_REDUCE|Capture the total from the loaded queue.
DATA_STORAGE||Local array contains the fourteen supplied integers.
INSERTION_SORT||Extract each next item, shift larger prefix elements and insert ascending without built-in sort.
OUTPUT_FORMAT||Print the parameter array on one line.
MAIN_FLOW|OUTPUT_FORMAT,INSERTION_SORT|Call array output before/after existing insertion-sort function and retain its return.
EVIDENCE_RUN|INSERTION_SORT,OUTPUT_FORMAT|Capture both unsorted and sorted arrays.
BINARY_SEARCH||Reduce sorted-array bounds, return middle index or -1; no built-in search.
MAIN_FLOW|BINARY_SEARCH|Call existing search for four requested values and report index or absence.
EVIDENCE_RUN|BINARY_SEARCH|Capture results for0,345,67,2.
OOP_CLASS||Node constructor sets integer data and null NextNode.
OOP_GET||Return data and NextNode attributes.
OOP_SET||Assign NextNode from the Node parameter.
LIST_SETUP+OOP_CLASS||LinkedList constructor creates a null HeadNode.
LIST_INSERT|OOP_CLASS,OOP_SET|Create a Node from integer data, link it to previous head, replace head.
LIST_TRAVERSE|OOP_GET|Follow GetNextNode from head and concatenate logical list order.
LIST_REMOVE|OOP_GET,OOP_SET|Handle empty/head/interior/not-found cases and return Boolean success.
MAIN_FLOW+OOP_INSTANTIATE|LIST_INSERT,LIST_REMOVE,LIST_TRAVERSE|Create list, insert five values, traverse before and after removing30.
EVIDENCE_RUN|LIST_INSERT,LIST_REMOVE,LIST_TRAVERSE|Capture logical list before and after deletion.
''',
'w25_41': '''
STACK_SETUP||30 null slots and current-top pointer -1.
STACK_PUSH||Detect top29 as full, otherwise increment then store and return Boolean.
STACK_POP||Return -999 if empty; otherwise read top and decrement.
MAIN_FLOW|STACK_PUSH|Generate random integers0..1000 for up to40 Push calls; stop at first failure.
STACK_REDUCE|STACK_POP|Pop until empty while finding maximum and minimum, then report both.
MAIN_FLOW|STACK_REDUCE|Call the already defined FindValues.
EVIDENCE_RUN|STACK_PUSH,STACK_REDUCE|Capture one full message and extrema within stated bounds.
OOP_CLASS||Private train identifier/route and parameter constructor.
OOP_GET||Return stored train ID and route.
OOP_INSTANTIATE|OOP_CLASS|Construct four supplied train instances.
OOP_CLASS||Station constructor establishes private station/platform/train-array/count state.
OOP_CAPACITY_ADD||Check platform capacity, store Train, increment count and return Boolean.
OUTPUT_FORMAT|OOP_GET|Return no-trains message or formatted station header and train/route lines.
OOP_INSTANTIATE|OOP_CLASS|Create South and North station instances with different platform capacities.
MAIN_FLOW|OOP_CAPACITY_ADD,OUTPUT_FORMAT|Call AddTrain for specified stations, report failure and call GetTrains.
EVIDENCE_RUN|OOP_CAPACITY_ADD,OUTPUT_FORMAT|Capture full-station message and both station descriptions.
OOP_CLASS||QP explicitly requires class and two-parameter constructor assigning public Key/Data attributes.
HASH_SETUP||Initialise every slot in100x10 record table to an empty record.
HASH_FUNCTION||Return key MOD100.
HASH_INSERT|HASH_FUNCTION|Find empty slot in the ten-record bucket at the calculated row.
FILE_READ_OBJECTS+OOP_INSTANTIATE|HASH_INSERT,OOP_CLASS|Read key/string file, construct objects of the explicitly declared Record class and call existing insertion procedure.
HASH_SEARCH|HASH_FUNCTION|Calculate bucket then scan its ten slots for key, returning data or Not found.
MAIN_FLOW|HASH_SETUP,FILE_READ_OBJECTS,HASH_SEARCH|Initialise and load table, then make five user-key lookups.
EVIDENCE_RUN|HASH_SEARCH|Capture four successful key/word pairs and missing key39.
''',
'w25_42': '''
OOP_CLASS||Bird private attributes; constructor assigns species/speed and both coordinates500.
OOP_GET||Return stored Species.
OUTPUT_FORMAT||GetPosition builds and returns X/Y coordinate string, not a bare field accessor.
OOP_UPDATE||Convert flying minutes to distance and update X or Y by direction; no input validation inside Move.
OOP_INSTANTIATE|OOP_CLASS|Create Cockatiel and Macaw with supplied speeds.
MAIN_FLOW+VALIDATE_INPUT|OOP_GET,OOP_UPDATE,OUTPUT_FORMAT|Validate bird/direction/time repeatedly, call Move for chosen bird and show updated position.
EVIDENCE_RUN|VALIDATE_INPUT,OOP_UPDATE|Capture all four required flight tests.
RANDOM_ARRAY+DATA_STORAGE||Create a local 1D array with twenty distinct random integers0..100; all three requirements have explicit marking criteria.
OUTPUT_FORMAT||Print parameter array on one space-separated line.
BUBBLE_SORT||Use nested comparison/swap loops with bounds based on parameter length, ascending.
MAIN_FLOW|BUBBLE_SORT,OUTPUT_FORMAT|Print before, call sort, output Sorted and print returned array.
EVIDENCE_RUN|RANDOM_ARRAY,BUBBLE_SORT,OUTPUT_FORMAT|Capture candidate-specific original and sorted arrays.
BINARY_SEARCH||Four-parameter recursive search; updated low/high in calls and -1 base case.
MAIN_FLOW|BINARY_SEARCH|Input number, call recursive search on sorted bounds0..19 and report result.
EVIDENCE_RUN|BINARY_SEARCH|Test smallest, largest and absent number; capture indexes0,19 and not-found.
TREE_SETUP||50x3 integer tree cells -1, RootPointer -1, FreeNode0.
TREE_INSERT||Find empty child via left/right pointers, update parent and FreeNode, handle full tree.
FILE_READ_ARRAY|TREE_INSERT|Read fifty file integers and invoke AddNode in file order.
FILE_WRITE||Write all physical TreeArray rows as comma-separated triples to new Tree.txt with exceptions.
MAIN_FLOW|FILE_WRITE|Call existing WriteAllToFile.
EVIDENCE_RUN|FILE_WRITE|Show all saved node rows and Tree.txt filename in evidence.
''',
'w25_43': '''
OOP_CLASS||BoardObject class constructor assigns Code and Value parameters.
OOP_GET||Return Code and Value attributes.
OOP_INSTANTIATE|OOP_CLASS|Create five given board objects.
OOP_CLASS+DATA_STORAGE+OOP_INSTANTIATE||Board constructor declares10x10 object array and constructs an empty BoardObject for each position, each explicitly credited.
OOP_GET||Return stored object indexed by row and column parameters.
OOP_SET||Store supplied object at parameter row and column.
OUTPUT_FORMAT|OOP_GET|Output codes in a ten-by-ten grid using GetCode, row per line with spaces.
MAIN_FLOW+OOP_INSTANTIATE|OOP_SET,OUTPUT_FORMAT|Create Board and use existing setters for five placements, then display.
EVIDENCE_RUN|OUTPUT_FORMAT|Capture initial board layout.
MAIN_FLOW+VALIDATE_INPUT|OOP_GET|Retry row/column until0..9, access chosen object and report miss or code/value.
EVIDENCE_RUN|VALIDATE_INPUT,OOP_GET|Row10then4 and column-1then5 with correct located object output.
QUEUE_SETUP||100empty-string slots with head/tail -1 and NumberItems0.
QUEUE_ENQUEUE||Linear append, first-element head and count/tail updates, Boolean result.
QUEUE_DEQUEUE||Return string False on empty; otherwise return head value, increment head and decrement count.
FILE_READ_ARRAY|QUEUE_ENQUEUE|Read at most100binary lines and call existing Enqueue.
RUN_LENGTH_ENCODE+QUEUE_REDUCE|QUEUE_DEQUEUE|Consume queue, compare consecutive digits, count each run and append digit/count to global string.
MAIN_FLOW|FILE_READ_ARRAY,RUN_LENGTH_ENCODE|Call existing ReadData then Compress and output NewString.
EVIDENCE_RUN|RUN_LENGTH_ENCODE|Capture the encoded binary sequence.
COUNT_OCCURRENCES||Recursive empty-array base case and matching/nonmatching recursive returns on reduced array.
MAIN_FLOW+DATA_STORAGE|COUNT_OCCURRENCES|Store given ten-item array, call RecursiveCount for zero and output result.
EVIDENCE_RUN|COUNT_OCCURRENCES|Capture count2 for the supplied array.
DATA_STORAGE||Store supplied semicolon-separated code string in local variable.
STRING_SPLIT||Manually build four tokens without semicolons; no built-in splitting allowed.
MAIN_FLOW+OUTPUT_FORMAT|STRING_SPLIT|Call SplitData then loop over returned statements, one per line.
EVIDENCE_RUN|STRING_SPLIT,OUTPUT_FORMAT|Capture all four individual statements.
'''
}
question_context={
's25_41':{1:{'topic':'queue','representation':'20-element integer circular array','pointer_convention':'head first live item; tail last live item; initial -1/-1; count0','empty_return':'integer -1'},2:{'topic':'file_processing','record_format':'integer,colour','routing':'six1D colour arrays','write_mode':'append to supplied blank files'},3:{'topic':'binary_tree','representation':'object nodes with Node left/right references','ordering':'left less; right greater-or-equal','root_initialisation':'constructor Node parameter'}},
's25_42':{1:{'topic':'stack','representation':'20-element string array','pointer_convention':'top=current occupied; initial -1','push_result':'integer1/-1','pop_empty':'string -1'},2:{'topic':'hash_table','representation':'200record main array plus100record Spare','hash':'key MOD200','collision':'next free separate Spare slot'},3:{'topic':'oop','inheritance':'Animal->Parrot/Wolf','state_update':'additive word-count/territory changes'}},
's25_43':{1:{'topic':'queue','representation':'50integer linear array','pointer_convention':'head first item, tail last item, initial -1/-1; no wrap','empty_return':'integer -1'},2:{'topic':'search_sort','representation':'14integer local array','ordering':'ascending','search_form':'iterative or recursive accepted by MS; QP requires binary search'},3:{'topic':'linked_list','representation':'object nodes; null HeadNode','insertion':'front','deletion':'first matching node; may be absent; no array free-list'}},
'w25_41':{1:{'topic':'stack','representation':'30integer/null slots','pointer_convention':'top=current occupied; initial -1','pop_empty':'integer -999'},2:{'topic':'oop','composition':'Station contains Train array and count','capacity':'number of platforms per station'},3:{'topic':'hash_table','representation':'100x10 record buckets','hash':'key MOD100','collision':'scan same bucket; empty key -1'}},
'w25_42':{1:{'topic':'oop','movement':'speed/60*minutes; NSEW coordinate updates','validation_location':'main program, not Move'},2:{'topic':'search_sort','representation':'20unique random integers0..100','ordering':'ascending','search_form':'recursive required'},3:{'topic':'binary_tree','representation':'50x3 array: left,data,right','initial_state':'all -1; root -1; free0','file_output':'physical array rows, not traversal'}},
'w25_43':{1:{'topic':'oop','representation':'10x10 board of BoardObject; zero-based row/column','empty_object':'Code - and Value0'},2:{'topic':'queue','representation':'100string linear queue; head/tail -1; count0','empty_return':'string False','compression_assumptions':'at least one digit; no run greater than9'},3:{'topic':'recursion_and_strings','count_form':'recursive reduce-array count','split_constraint':'four semicolon-terminated statements; no built-in split'}}
}
rows=[]
for p in source['papers']:
 if p['batch']!='2025':continue
 key=p['paper_id'].removeprefix('9618_')
 annotations=[l.strip() for l in manual[key].splitlines() if l.strip()]
 original=[(q,r) for q in p['questions'] for r in q['parts']]
 assert len(annotations)==len(original),(key,len(annotations),len(original))
 for (q,r),line in zip(original,annotations):
  assessed,context,reason=line.split('|')
  assessed=assessed.split('+');context=[x for x in context.split(',') if x]
  assert set(assessed+context)<=set(seed)
  primary=assessed[0]
  mode='test_evidence' if primary=='EVIDENCE_RUN' else 'integrate' if primary=='MAIN_FLOW' else 'declare_initialize' if primary in ['DATA_STORAGE','DATA_RECORD','STACK_SETUP','QUEUE_SETUP','TREE_SETUP','LIST_SETUP','HASH_SETUP','OOP_CLASS','OOP_SUBCLASS','OOP_INSTANTIATE'] else 'output' if primary=='OUTPUT_FORMAT' else 'implement'
  variants={'question_context':question_context[key][q['question_number']]}
  if primary=='BINARY_SEARCH':variants['algorithm_form']='recursive_required' if key=='w25_42' else 'binary_search_with_iterative_or_recursive_MS_acceptance'
  if primary=='COUNT_OCCURRENCES':variants['algorithm_form']='recursive'
  if primary=='TREE_TRAVERSE':variants.update({'algorithm_form':'recursive','visit_order':'inorder'})
  if primary in ['STRING_SPLIT','STRING_ROUTE']:variants['task_variant']='six_colour_routing' if key=='s25_41' else 'manual_semicolon_tokenisation'
  if primary=='OUTPUT_FORMAT':variants['output_shape']=r['prompt_summary']
  if r['part_id']=='9618_w25_41_1(d)':variants['directly_assessed_additional_skills']=['random_generation'];variants['random_range_inclusive']=[0,1000]
  topic=question_context[key][q['question_number']]['topic']
  rows.append({'part_id':r['part_id'],'primary_pattern_id':primary,'assessed_pattern_ids':assessed,'context_pattern_ids':context,'topic_tags':[topic],
   'skill_tags':[primary.lower()]+(['compose_calls'] if mode=='integrate' else ['capture_required_evidence'] if mode=='test_evidence' else []),
   'task_mode':mode,'variants':variants,'classification_rationale':reason,
   'qp_basis':{'source_id':p['qp_source_id'],'pdf_pages':r['qp_pages']},'ms_basis':{'source_id':p['ms_source_id'],'pdf_pages':r['ms_pages']},
   'ms_distinguishing_requirement':reason,'review_status':'submitted','notes':['Primary assignment is editorial for disjoint mark statistics; assessed co-tags do not divide Cambridge marks.']})
assert len(rows)==140 and len({r['part_id'] for r in rows})==140
result={'schema_version':'1.0','batch':'2025','rows':rows,'taxonomy_proposals':[
 {'proposal':'Record-like class boundary','decision_requested':'Keep explicit class+constructor tasks under OOP_CLASS even when named Record; use DATA_RECORD when QP asks TYPE/record or class as alternative.','examples':['9618_w25_41_3(a)','9618_s25_42_2(a)']},
 {'proposal':'Computed Get/Set names','decision_requested':'GetPosition/GetTrains/Description are OUTPUT_FORMAT; SetTerritorySize adds to state and is OOP_UPDATE. Classify operation, not method name.','examples':['9618_w25_42_1(a)(iii)','9618_w25_41_2(c)(iii)','9618_s25_42_3(c)(i)']}
], 'review_notes':['Lead read all2025QP/MS in Stage1 and re-read all140marking requirements for Stage2 operation boundaries; no examcode executed.','Each manual row records its discriminating task/criterion; original QP/MS plus context/facsimiles remain authoritative.']}
(stage/'batches/2025/classification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('2025 classified',len(rows),'rows;',len({p for r in rows for p in r['assessed_pattern_ids']}),'assessed patterns')

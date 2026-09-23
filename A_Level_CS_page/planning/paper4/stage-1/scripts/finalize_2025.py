from pathlib import Path
import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[1]
batch=json.loads((stage/'batches/2025/index.draft.json').read_text(encoding='utf-8'))
data={p['paper_id']:p for p in json.loads((stage/'evidence/A2_DATA_AUDIT.json').read_text(encoding='utf-8'))['papers']}
# Ordered hand-authored navigation summaries after reading QP instructions and MS criteria.
summaries={
's25_41':[
'Initialise the 20-element integer circular queue, head, tail and item count.',
'Implement Enqueue with full detection, circular pointer updates and Boolean result.',
'Attempt to enqueue integers 1 to 25 and report each success or failure.',
'Implement Dequeue with empty handling and circular head update.',
'Call Dequeue twice and output each returned value.',
'Test the queue program and capture the required output screenshot.',
'Implement ReadData: prompt for filename, read arbitrary line count and return a string array.',
'Implement SplitData to separate integers into six 1D arrays, one per colour.',
'Implement StoreData to append every item of a supplied 1D array to the supplied filename, with exception handling.',
'Extend SplitData to call StoreData for each of the six colours.',
'Call ReadData and pass the returned array to SplitData in the main program.',
'Test using TheData.txt; capture the prompt/input and Red.txt file contents.',
'Declare Node and its constructor with the stated attributes and Python type comments.',
'Implement GetLeft, GetRight and GetData accessors.',
'Implement SetLeft and SetRight methods.',
'Create five Node objects holding 10, 20, 5, 15 and 7.',
'Declare Tree and its constructor, initialising FirstNode to the parameter value.',
'Implement GetRootNode.',
'Implement Insert to place the supplied Node in the binary tree.',
'Implement recursive OutputInOrder.',
'Create the tree with node 10 as root, insert 20, 5, 15 and 7 in order, and call OutputInOrder.',
'Test and capture the traversal output.'
],
's25_42':[
'Initialise the global 20-string Stack and TopOfStack pointer.',
'Implement Push with full detection and integer success/failure result.',
'Implement Pop, returning the string sentinel when empty.',
'Implement ReadData to read an arbitrary-length file and push its lines, with exception handling.',
'Implement Calculate to consume stack numbers/operators and return the total.',
'Prompt for filename, call ReadData and Calculate, and output the total.',
'Test StackData.txt and SecondStack.txt and capture both runs.',
'Declare NewRecord with Key, Item1 and Item2 integer fields.',
'Declare global HashTable and Spare arrays.',
'Implement Initialise to fill both arrays with empty records.',
'Implement CalculateHash using key MOD 200.',
'Implement InsertIntoHash with collision records stored in Spare.',
'Implement CreateHashTable to read HashData.txt records and insert them.',
'Implement PrintSpare to output keys from occupied spare records.',
'Call Initialise, CreateHashTable and PrintSpare in order.',
'Test and capture the spare-record output.',
'Declare Animal and its constructor with four attributes and Python type comments.',
'Implement Animal.Description returning the specified formatted string.',
'Declare Parrot inheriting Animal, its constructor and ChangeNumberWords.',
'Override Parrot.Description with the specified wingspan and word-count text.',
'Declare Wolf inheriting Animal, its constructor and SetTerritorySize.',
'Override Wolf.Description with the specified territory text.',
'Create Chewie, Nighteyes and Copper with the given attributes.',
'Update wolf territory and parrot word count, then output all descriptions.',
'Test and capture the updated animal descriptions.'
],
's25_43':[
'Initialise a 50-integer linear queue and its head/tail pointers.',
'Implement Enqueue with full detection and first-item handling.',
'Implement Dequeue and its empty sentinel.',
'Implement CreateQueue using QueueData.txt, Enqueue and file exception handling.',
'Create the queue, dequeue every value and output their total.',
'Test and capture the total output.',
'Store the supplied 14 integers in a local array.',
'Implement ascending InsertionSort without a built-in sort.',
'Implement OutputArray to print the array on one line.',
'Output the array before and after calling InsertionSort.',
'Test and capture unsorted and sorted output.',
'Implement Search as a binary search without built-in search routines.',
'Search for 0, 345, 67 and 2 and report found positions or absence.',
'Test and capture all four search results.',
'Declare Node and its constructor, initialising data and next-node attributes.',
'Implement GetData and GetNextNode.',
'Implement SetNextNode.',
'Declare LinkedList and its constructor with a null head.',
'Implement InsertNode to add at the head.',
'Implement Traverse to return the formatted list data.',
'Implement RemoveNode with Boolean result and the required link updates.',
'Create a list, insert 10 through 50, traverse, remove 30 and traverse again.',
'Test and capture the list before and after removal.'
],
'w25_41':[
'Initialise a 30-element stack with null values and TopOfStack at -1.',
'Implement Push returning Boolean success or failure.',
'Implement Pop returning -999 when the stack is empty.',
'Attempt up to 40 random pushes in range 0 to 1000; stop and report when full.',
'Implement FindValues by draining the stack and reporting its highest/lowest values.',
'Call FindValues from the main program.',
'Test and capture the full-stack message and extrema.',
'Declare Train with private attributes and its constructor.',
'Implement the train ID and route accessors.',
'Create four trains with the specified identifiers and routes.',
'Declare Station and its constructor with the specified attributes.',
'Implement AddTrain, respecting platform capacity.',
'Implement GetTrains returning the specified station/train description.',
'Create the South and North station objects.',
'Attempt the four specified train additions and report station contents or capacity failures.',
'Test and capture the station program output.',
'Declare Record with public Key/Data fields and its constructor.',
'Declare the 100 by 10 HashTable and implement InitialiseHashTable.',
'Implement Hash as key MOD 100.',
'Implement InsertData, searching the collision bucket for an empty position.',
'Implement ReadData using HashTableData.txt and InsertData.',
'Implement GetRecord returning matching data or the required not-found string.',
'Initialise/load the hash table, prompt for five keys and output lookups.',
'Test keys 528, 1128, 1828, 1062 and 39 and capture the results.'
],
'w25_42':[
'Declare Bird with private attributes and constructor; initialise both coordinates to 500.',
'Implement GetSpecies.',
'Implement GetPosition returning the specified coordinate string.',
'Implement Move using direction and flying time; no validation is required within this method.',
'Create Cockatiel and Macaw with the specified speeds.',
'Display birds, validate choice/direction/time, move the chosen bird and display its new position.',
'Test the four specified flight cases and capture outputs.',
'Create a local array of 20 unique random integers from 0 to 100.',
'Implement PrintArray to output the array in the specified single-line format.',
'Implement BubbleSort for an array of any length without built-in sorting.',
'Output the array before and after sorting in the main program.',
'Test and capture unsorted and sorted arrays.',
'Implement RecursiveBinarySearch using the stated parameters and return convention.',
'Prompt for a number, call the recursive search and report the result.',
'Test the smallest, largest and an absent value and capture the three results.',
'Initialise the 50 by 3 TreeArray, RootPointer and FreeNode.',
'Implement AddNode to insert a value into the array-backed binary tree.',
'Read TreeData.txt and call AddNode for each value in file order.',
'Implement WriteAllToFile to write Tree.txt node records with exception handling.',
'Call WriteAllToFile.',
'Test and capture all Tree.txt contents with its filename visible.'
],
'w25_43':[
'Declare BoardObject with Code/Value and its constructor.',
'Implement GetCode and GetValue.',
'Create the five specified BoardObject instances.',
'Declare Board and its constructor, filling a 10 by 10 array with empty objects.',
'Implement GetObject using row and column parameters.',
'Implement SetObject using object, row and column parameters.',
'Implement DisplayBoard with one row per line and separated codes.',
'Create the board, place the five objects at given positions and display it.',
'Test and capture the board display.',
'Validate row/column guesses and report a miss or the located object code/value.',
'Test row inputs 10 then 4 and column inputs -1 then 5; capture the result.',
'Initialise a 100-string linear queue and its pointers/item count.',
'Implement Enqueue with full detection and first-item handling.',
'Implement Dequeue with the string sentinel "False" when empty.',
'Implement ReadData using BinaryData.txt and Enqueue.',
'Implement Compress to dequeue the data and store run-length encoding in NewString.',
'Call ReadData and Compress, then output the compressed string.',
'Test and capture the compression output.',
'Implement RecursiveCount to count occurrences of the requested integer.',
'Store the supplied ten integers and call RecursiveCount to count zeroes.',
'Test and capture the occurrence count.',
'Store the supplied semicolon-separated code string in a local variable.',
'Implement SplitData without built-in string splitting.',
'Call SplitData and output each returned statement on a new line.',
'Test and capture the separated statements.'
]}
for paper in batch['papers']:
 key=paper['paper_id'].removeprefix('9618_')
 rows=[r for q in paper['questions'] for r in q['parts']]
 assert len(rows)==len(summaries[key]),key
 for r,summary in zip(rows,summaries[key]):
  excerpt=r.pop('qp_segment_text')
  r['prompt_summary']=summary
  if 'screenshot' in excerpt.lower():
   r['evidence_requirement']=f'{summary} Save the program and copy the screenshot(s) into evidence.doc part {r["part"]}. The QP pages in this record specify the complete test data, sequence and formatting; use the original PDF/facsimile for tables.'
  else:r['evidence_requirement']=f'Save the cumulative program; copy and paste the required program code into evidence.doc part {r["part"]}. Follow the QP page for filename and any Python attribute comments.'
  r['verification_status']='qp_ms_cross_checked'
  # Direct mentions are separate from the complete question-scoped source inventory.
  r['required_source_files']=[x for x in r['required_source_files'] if not x.lower().startswith('evidence.')]
  if r is rows[0]:r['required_source_files']=[] # Covering QP page2 preamble lists unrelated questions' files.
  r['source_file_reference_scope']='direct mentions in this part; inherited files are in question_source_requirements and cumulative workflow'
  r['notes'].append('Navigation summary only. Full instructions, numeric tables, code and screenshots require the page-bounded extraction together with the original PDF/facsimile.')
 for q in paper['questions']:
  labels={r['part'] for r in q['parts']}
  parents=sorted({r['parent_part'] for r in q['parts']} - labels - {str(q['question_number'])})
  q['unscored_structure']=[{'part':p,'kind':'parent_container','notes':'No separately allocated marks; child scoring rows carry the marks.'} for p in parents]
  q['question_source_requirements']=[f for f in data[paper['paper_id']]['required_input_files'] if str(f.get('question'))==str(q['question_number'])]
  q['workflow_note']='Saved program is cumulative within the question. Previous-step refs preserve this workflow, not a claim that each algorithm directly calls the preceding part.'
  for i,r in enumerate(q['parts']):
   r['dependency_refs']=[q['parts'][i-1]['part']] if i else []
   r['dependency_kinds']={ref:'cumulative_saved_program_predecessor' for ref in r['dependency_refs']}
   for ref in r.pop('qp_explicit_part_references'):
    if ref!=r['part'] and ref in labels|set(parents):
     if ref not in r['dependency_refs']:r['dependency_refs'].append(ref)
     r['dependency_kinds'][ref]='explicit_QP_reference'
  # The algorithms differ but the QP explicitly says to amend the main program.
  if key=='w25_43' and q['question_number']==3:
   r=next(r for r in q['parts'] if r['part']=='3(b)(i)')
   r['notes'].append('QP asks to amend the main program; cumulative workflow continues although SplitData does not call RecursiveCount.')
 samples={'s25_41':[('qp',6),('ms',31)],'s25_42':[('qp',4)],'s25_43':[('qp',8)],'w25_41':[('qp',6)],'w25_42':[('qp',10)],'w25_43':[('qp',4)]}
 rendered=[]
 for kind,page in samples[key]:
  sid=f'9618_{key.split("_")[0]}_{kind}_{key.split("_")[1]}'
  rendered.append({'source_id':sid,'pdf_page':page,'image':f'facsimiles/{sid}/p{page:03}.png','reviewer':'A0 Lead','method':'visually opened and compared to extracted context'})
 paper['program_filenames']=[f'Question{n}_{"J" if key.startswith("s") else "N"}25' for n in [1,2,3]]
 paper['paper_evidence_requirements']={'template':'evidence.doc','qp_pages':[1,2],'saved_filename_pattern':'evidence_<centre number>_<candidate number>','identity_on_every_page':['name','centre number','candidate number'],'scope':'Every part specifies whether code or screenshot(s) must be pasted into its own answer space.'}
 paper['review']={'method':'Lead read all QP parts and corresponding MS marking criteria; paired individual scoring markers, checked continuation pages, source data and selected rendered layouts. Code not executed.','rendered_pages_checked':rendered, 'status':'submitted_for_independent_QA'}
 paper['indexed_total_marks']=sum(r['marks'] for r in rows)
 assert paper['indexed_total_marks']==75
batch['review_notes']=['140 scoring rows, six papers,450 marks. Short summaries are editorial navigation aids, not translated lessons or substitutes for QP/MS.','No taxonomy, marking advice, corrected executable code or learning pages produced in Stage1.']
(stage/'batches/2025/index.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2),encoding='utf-8')
print('Finalized',len(batch['papers']),'papers',sum(len(q['parts']) for p in batch['papers'] for q in p['questions']),'scoring rows')

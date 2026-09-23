import json,re,sys,bisect
from pathlib import Path
import pymupdf
sys.stdout.reconfigure(encoding='utf-8')
O=Path(__file__).parent
data=json.loads((O/'prepared.json').read_text(encoding='utf-8'))
summaries=json.loads((O/'summaries.json').read_text(encoding='utf-8'))
samples={'s23_41':[('qp',4),('ms',13)],'s23_42':[('qp',7)],'w23_41':[('qp',6),('ms',19)],'w23_42':[('ms',29)],'s24_41':[('qp',12),('ms',5),('ms',15)],'s24_42':[('qp',6)],'w24_41':[('qp',12)],'w24_42':[('qp',13),('ms',8)]}
context={'s23_41':[[2],[4,6],[8]],'s23_42':[[2,3],[5,7],[8,10,11]],'w23_41':[[2],[4,5,6],[8,9,10]],'w23_42':[[2,4],[6,7],[10,12]],'s24_41':[[2],[6,7,9],[11,12]],'s24_42':[[2],[6,7,8],[10,11,13]],'w24_41':[[2],[6,8,9],[12,13,15]],'w24_42':[[2,3,4,5,6],[8,9],[12,13]]}
files={'s23_41':[['Data.txt'],[],['AnimalData.txt','ColourData.txt']], 's23_42':[[],[],['Employees.txt','HoursWeek1.txt']], 'w23_41':[[],['QueueData.txt'],[]], 'w23_42':[['StackData.txt'],[],[]], 's24_41':[[],['Trees.txt'],[]], 's24_42':[['Easy.txt','Medium.txt','Hard.txt'],[],[]], 'w24_41':[['Data.txt'],[],[]], 'w24_42':[[],[],['HighScoreTable.txt']]}
result=[]
for p in data:
 pid=p['paper_id']; key=pid[5:].replace('_43','_41')
 # Display coordinates, not unrotated PDF coordinate order.
 rows={};last=None
 for pn,page in enumerate(pymupdf.open(p['ms_path']),1):
  words=[(pymupdf.Rect(w[:4])*page.rotation_matrix,w[4]) for w in page.get_text('words')]
  labels=[]
  for box,t in words:
   if box.x0<120 and (re.fullmatch(r'[123](?:\([a-zivx]+\))+',t) or t=='3(b(iii)'):
    labels.append((box,t.replace('3(b(iii)','3(b)(iii)')))
  labels.sort(key=lambda t:t[0].y0)
  if last:
   stop=labels[0][0].y0 if labels else 540
   leading=[t for b,t in words if 124<b.x0<740 and 75<b.y0<stop-3]
   if len(' '.join(leading))>15: rows[last]['ms_pages'].append(pn)
  for box,t in labels:
   row=rows.setdefault(t,{'ms_pages':[],'ms_marks':None,'ms_label_locators':[]})
   row['ms_pages'].append(pn);row['ms_label_locators'].append({'pdf_page':pn,'display_bbox':[round(v,2) for v in box]})
   marks=[tx for b,tx in words if b.x0>740 and abs(b.y0-box.y0)<3 and tx.isdigit()]
   if marks:
    if row['ms_marks'] is not None: assert row['ms_marks']==int(marks[0]),(pid,t)
    row['ms_marks']=int(marks[0])
   last=t
 # Evidence labels are corroborated against scored brackets and reviewed QP order.
 page_starts=[];s=''
 for t in p['qp_pages_text']:
  page_starts.append(len(s));s+=t+'\n'
 matches=list(re.finditer(r'Copy and paste (.*?) into part\s+([123](?:\([a-zivx]+\))+)\s+in the evidence document\.\s*\[(\d+)\]',s,re.S))
 assert len(matches)==len(summaries[key]),(pid,len(matches),len(summaries[key]))
 questions=[{'question_number':n,'context_pages':context[key][n-1],'parts':[],'unscored_structure':[],'required_source_files':files[key][n-1]} for n in (1,2,3)]
 prev_end=0;prev_by_q={};parents=set()
 for i,ma in enumerate(matches):
  label=ma.group(2); n=int(label[0]);row=rows[label]
  block=s[prev_end:ma.start()]
  # Find the actual numbered start rather than trailing material from the prior page.
  starts=list(re.finditer(r'(?m)^\s*(?:[123]\s*\n(?=[A-Z])|\([a-zivx]+\))',block))
  offset=prev_end+(starts[0].start() if starts else 0)
  start_page=bisect.bisect_right(page_starts,offset)
  end_page=bisect.bisect_right(page_starts,ma.end()-1)
  qp_pages=list(range(max(2,start_page),end_page+1))
  # Initial algorithms can precede the first scored part by a page.
  if label in ['1(a)(i)','2(a)(i)'] and key=='w23_41' and n==1:qp_pages=[2,3]
  if key=='w23_42' and label=='2(a)(i)':qp_pages=[6,7]
  if key=='w23_42' and label=='2(b)(i)':qp_pages=[7,8]
  assert int(ma.group(3))==row['ms_marks'],(pid,label,ma.group(3),row['ms_marks'])
  parent=label[:label.rfind('(')]
  if '(' not in parent:parent=label[0]
  required=sorted(set(re.findall(r'\b[A-Za-z][A-Za-z0-9]*\.txt\b',block)).intersection(files[key][n-1]))
  evidence=' '.join(ma.group(1).split())
  deps=[]
  if n in prev_by_q:deps.append(prev_by_q[n])
  deps.extend(re.findall(r'part\s+([123](?:\([a-zivx]+\))+)',block))
  deps=list(dict.fromkeys(x for x in deps if x!=label))
  notes=['dependency_refs includes the preceding step in the cumulative saved-program workflow; it is not a Stage 2 prerequisite taxonomy. Shared question context and source requirements apply.']
  if pid=='9618_w23_42' and label=='3(b)(iii)':notes.append('MS PDF29 raw row label is 3(b(iii); canonicalised to QP 3(b)(iii). One mark retained without changing the source.')
  if key=='s24_41' and label=='2(e)(iii)':notes.append('QP PDF10 says ChooseTrees() whereas preceding specification uses ChooseTree(); preserved as source naming inconsistency, not silently corrected.')
  q=questions[n-1]
  q['parts'].append({'part':label,'parent_part':parent,'qp_pages':qp_pages,'ms_pages':sorted(set(row['ms_pages'])),'marks':row['ms_marks'],'qp_marks':int(ma.group(3)),'ms_marks':row['ms_marks'],'prompt_summary':summaries[key][i],'required_source_files':required,'dependency_refs':deps,'evidence_requirement':f'Save the cumulative program; copy and paste {evidence} into evidence.doc part {label}.','verification_status':'qp_ms_cross_checked','notes':notes,'ms_label_locators':row['ms_label_locators']})
  if parent not in parents and '(' in parent:
   q['unscored_structure'].append({'part':parent,'role':'unscored_parent_container','qp_pages':qp_pages,'note':'Parent context applies to its scored descendants; no separately counted marks.'});parents.add(parent)
  prev_by_q[n]=label;prev_end=ma.end()
 assert set(rows)=={r['part'] for q in questions for r in q['parts']},(pid,set(rows))
 assert sum(r['marks'] for q in questions for r in q['parts'])==75
 pp={k:p[k] for k in ['paper_id','qp_source_id','ms_source_id','qp_page_count','ms_page_count','declared_total_marks']}
 pp.update(indexed_total_marks=75,questions=questions,issues=[],review={'method':'Read QP content and MS row criteria, cross-check every evidence label and bracket against display-coordinate MS rows; track continuations; visual samples of tables/code and ambiguous labels. 41/43 content equivalence checked page-by-page after header normalisation. No solution execution or correctness certification.','rendered_pages_checked':[{'source':kind,'pdf_page':pn,'image':f'batches/2023-2024/images/{key}_{kind}_{pn}.png'} for kind,pn in samples[key]],'status':'submitted'})
 pp['program_filenames']=sorted(set(re.findall(r'Save your program as\s+(Question\d_[A-Za-z0-9]+)',s)))
 pp['evidence_document']={'input':'evidence.doc','output_pattern':'evidence_<centre number>_<candidate number>','identity_on_every_page':True,'source_page':2}
 if pid.endswith('_43'):pp['review']['equivalence_note']='QP pages2 onward and all MS pages identical to variant41 after replacing paper-number header 9618/41 with 9618/43; original identities and locators retained.'
 result.append(pp)
(O/'index.json').write_text(json.dumps({'schema_version':'1.0.0','batch':'2023-2024','papers':result,'review_notes':['PDF locators are 1-based and match printed page numbers in this batch.','Summaries are navigation only. Original PDFs and page-bounded extraction preserve complete tasks, algorithms, data and example code.','Stage 1 source indexing does not certify example solutions as correct or runnable; Python indentation, private-name underscores and arrows require original PDF/render inspection.','required_source_files on questions records the shared source dependency; part-level fields identify files explicitly named in its prompt segment. Subsequent tests inherit dependencies through the cumulative program.']},ensure_ascii=False,indent=2),encoding='utf-8')
for p in result: print(p['paper_id'],len([r for q in p['questions'] for r in q['parts']]),[(q['question_number'],sum(r['marks'] for r in q['parts'])) for q in p['questions']],p['program_filenames'])

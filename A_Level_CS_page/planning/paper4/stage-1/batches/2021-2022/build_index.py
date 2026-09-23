import json,re,sys,hashlib,difflib
from pathlib import Path
import pymupdf as fitz
from annotations import ANNOTATIONS
sys.stdout.reconfigure(encoding='utf8')
HERE=Path(__file__).parent; EXT=HERE.parents[1]/'extracted'
ALIASES={'s21_42':'s21_41','s21_43':'s21_41','s22_43':'s22_41','w21_42':'w21_41','w22_43':'w22_41'}
CONTEXT={'s21_41':[[2],[6],[8]],'s22_41':[[2],[5],[8]],'s22_42':[[2],[4],[7]],'w21_41':[[2],[4],[8]],'w22_41':[[2],[4],[8]],'w22_42':[[2],[5],[8]]}
SAVES={'s21_41':['question1','question2','question3'],'s22_41':['Question1_J2022','Question2_J2022','Question3_J2022'],'s22_42':['Question1_J22','Question2_J22','Question3_J22'],'w21_41':['question 1','question 2','question 3'],'w22_41':['Question1_N22','Question2_N22','Question3_N22'],'w22_42':['Question1_N22','Question2_N22','Question3_N22']}
RENDER={'s21_41':[('qp',2),('ms',9),('ms',21),('ms',22)],'s22_41':[('qp',9),('ms',29),('ms',30)],'s22_42':[('qp',6),('ms',22),('ms',25),('ms',26)],'w21_41':[('qp',8),('qp',9),('ms',18)],'w22_41':[('qp',8),('ms',5),('ms',21)],'w22_42':[('qp',3),('ms',11),('ms',21)]}
issues_by_base={
's21_41':[
 {'id':'S21-3B-COUNT','kind':'source_inconsistency','part':'3(b)','qp_pages':[9],'ms_pages':[22],'description':'QP specifies five questions/objects; one MS bullet says arrayTreasure with 4 elements while subsequent bullets require all 5. Preserve both; never teach 4-element capacity as QP requirement.','stage1_disposition':'documented_source_caveat','downstream_owner':'Stage4–5 solution verifier'},
 {'id':'S21-1DI-FREE','kind':'source_code_verification_required','part':'1(d)(i)','ms_pages':[9],'description':'MS Python sample writes a new node with nextNode=-1 over the free node before reading linkedList[emptyList].nextNode to advance the free list. Requires independent execution and pointer-state verification before use as a teaching solution. No corrected code authored at Stage1.','stage1_disposition':'documented_source_caveat','downstream_owner':'Stage5 programming verifier'},
 {'id':'S21-2C-NAME','kind':'source_identifier_variation','part':'2(c)','qp_pages':[7],'ms_pages':[19,20],'description':'QP asks to sort arrayData but supplied pseudocode and MS examples use theArray. Preserve original identifier context; reconcile during solution authoring.','stage1_disposition':'documented_source_caveat','downstream_owner':'Stage4–5 solution verifier'}],
's22_42':[{'id':'S22-42-2CI-MID','kind':'source_code_verification_required','part':'2(c)(i)','qp_pages':[6],'ms_pages':[22,23],'description':'Supplied BinarySearch midpoint uses Lower + (Upper - 1), followed by integer division. Preserve source exactly; boundary/termination behaviour must be independently tested in Stage5 before producing teaching code.','stage1_disposition':'documented_source_caveat','downstream_owner':'Stage5 programming verifier'}],
'w21_41':[{'id':'W21-2E-RUBRIC','kind':'source_marking_interpretation','part':'2(e)','qp_pages':[5],'ms_pages':[12],'description':'MS has 8 marks in Marks column, two exception bullets followed by a group headed max 7. Retain total 8; do not sum individual bullets into 9. Mark-point allocation belongs to Stage4 review.','stage1_disposition':'documented_source_caveat','downstream_owner':'Stage4 exam analyst'},
{'id':'W21-3B-INDENT','kind':'source_code_verification_required','part':'3(b)','ms_pages':[18],'description':'MS Python AddNode sample has visually uneven indentation near FreeNode increment and else; source PDF facsimile is authoritative, sample is not certified runnable code. Independent implementation verification required.','stage1_disposition':'documented_source_caveat','downstream_owner':'Stage5 programming verifier'}]
}
EXTRA_CAVEATS=[
('s21_41','S21-3A-PARAM','3(a)',[21],'MS Python constructor receives pointsP but assigns self.__points = points. Also node declaration page4 uses Data while outputNodes page7 accesses data; preserve case and verify the assembled program independently.'),
('s22_41','S22-41-3C-DEQUEUE','3(c)',[30],'MS Python Dequeue uses lowercase false, Queue(Head), and resets Head when >=9 after increment, whereas the rubric says more than9 after increment. Preserve source; verify empty/full/wrap behaviour independently.'),
('s22_41','S22-41-PYTHON-INTEGRATION','2(f)',[6,8,10,13,15,17,19,25],'Python example snippets contain integration candidates requiring verification: File.close without call, OutputHighScore versus OutputHighScores, score/Score case, integer-score comparison with raw file strings, Arrange break indentation, filename leading space, and VhangeHealth versus ChangeHealth. This is an observation register, not an exhaustive solution audit.'),
('s22_42','S22-42-2CI-GUARD','2(c)(i)',[22],'MS Python sample uses Upper >= 0 whereas QP uses Upper >= Lower; also capital If is printed in the Python example. Preserve source and verify independently.'),
('s22_42','S22-42-CARD-SNIPPETS','3(d)',[29,32,34],'Python card examples require integration verification: read-file block indentation/File.close, chooseCard versus ChooseCard case, lowercase true, and NumbersChosen(...) rather than list subscription occur in the extracted source. No executable solution is certified in Stage1.'),
('w22_41','W22-41-1C-RANGE','1(c)',[5],'MS Python FindValues loops range(0,99) despite a 100-element array and the rubric requiring all100. The printed indentation is uneven. Preserve source and verify index99/boundary behaviour independently.'),
('w22_42','W22-42-2A-ATTRIBUTE','2(a)',[11,12,13],'MS Python constructor spells __XCoordiante, while getter and ChangePosition use __XCoordinate. Text extraction preserves underscores in this sample; this is a source identifier discrepancy, not a normalization instruction.'),
('w22_42','W22-42-3B-SCOPE','3(b)',[21],'MS Python Enqueue reads and assigns HeadPointer without declaring it global while global Queue and TailPointer are declared. Preserve source; assembled program must be independently verified before teaching use.')
]
for base,ident,part,pages,description in EXTRA_CAVEATS:
    issues_by_base.setdefault(base,[]).append({'id':ident,'kind':'source_code_verification_required','part':part,'ms_pages':pages,'description':description,'stage1_disposition':'documented_source_caveat','downstream_owner':'Stage5 programming verifier'})
out={'schema_version':'1.0.0','batch':'2021-2022','papers':[],'review_notes':[
'All eleven QP/MS pairs retained separately. Six annotation baselines; duplicated bodies checked page by page after whitespace/header normalization; only w21_41/42 AddNode OUTPUT parentheses differ.',
'All page numbers are PDF 1-based and match printed page numbers in these papers. A short summary is an index, not a replacement for original QP text.',
'QP/MS cross-check confirms part labels, marks, locators and task/evidence requirements; it does not certify example solutions correct or runnable.',
'MS rotated pages require display coordinates; source extraction retains original geometry. Code indentation, diagrams and screenshot outputs use original PDFs/facsimiles as authoritative.',
'No group splitting required in this batch: every scored row has one QP evidence label and mark bracket. Container parents carry zero separately allocated marks.'
]}
equivalence=[]
for key in sorted(set(ANNOTATIONS)|set(ALIASES)):
    base=ALIASES.get(key,key); pid='9618_'+key
    qp_id=pid[:-3]+'_qp_'+pid[-2:]; ms_id=pid[:-3]+'_ms_'+pid[-2:]
    qp=json.loads((EXT/(qp_id+'.json')).read_text(encoding='utf8')); ms=json.loads((EXT/(ms_id+'.json')).read_text(encoding='utf8'))
    msc={x['part']:x for x in json.loads((HERE/(pid+'_ms_candidates.json')).read_text(encoding='utf8'))}
    qpc={}
    for p in qp['pages']:
        for m in re.finditer(r'Copy\s+and\s+paste\s+(.*?)\s+into\s+part\s+([123](?:\([a-zivx]+\))+)\s+in\s+the\s+evidence\s+document\.\s*\[(\d+)\]',p['text'],re.S):
            qpc[m[2]]={'page':p['pdf_page'],'mark':int(m[3]),'evidence':re.sub(r'\s+',' ',m[1]).strip()}
    annotations=[row.split('|') for row in ANNOTATIONS[base].strip().splitlines()]
    assert set(qpc)==set(msc)=={r[0] for r in annotations}, (key,set(qpc)^set(msc),set(qpc)^{r[0] for r in annotations})
    paper={'paper_id':pid,'qp_source_id':qp_id,'ms_source_id':ms_id,'qp_page_count':qp['page_count'],'ms_page_count':ms['page_count'],'declared_total_marks':75,'indexed_total_marks':0,'questions':[],'issues':issues_by_base.get(base,[]),'review':{'method':'Read question bodies and marking requirements; check each QP evidence label/mark bracket against visual-coordinate MS question and Marks columns, including continued rows. Inspect representative code/table facsimiles. Equivalent variant bodies compared page by page; all retained.','rendered_pages_checked':[],'status':'submitted'}}
    for q in range(1,4):
        question={'question_number':q,'context_pages':CONTEXT[base][q-1],'parts':[],'unscored_structure':[],'program_save_name':SAVES[base][q-1],'shared_context_note':'Parts progressively build one program; retain question introduction, initial data/class diagram and previously declared structures.'}
        labels=[]
        for part,pages,summary,deps,srcs,etype in annotations:
            if not part.startswith(str(q)): continue
            m=msc[part]; p=qpc[part]; marks=m['mark_values']
            assert len(marks)==1 and marks[0]==p['mark'],(pid,part,marks,p)
            parent=part[:part.rfind('(')]
            row={'part':part,'parent_part':parent,'qp_pages':[int(i) for i in pages.split(',')],'ms_pages':m['pages'],'marks':marks[0],'qp_marks':p['mark'],'ms_marks':marks[0],'prompt_summary':summary,'required_source_files':srcs.split(',') if srcs else [],'dependency_refs':deps.split(',') if deps else [],'evidence_requirement':f'Save program as {SAVES[base][q-1]} at the question start and save amendments as instructed. Copy and paste {p["evidence"]} into part {part} of the evidence document. '+('Use the stated test inputs and capture the requested output(s).' if etype!='code' else ''),'verification_status':'qp_ms_cross_checked','notes':[]}
            if not deps: row['notes'].append('Depends on the shared question context and supplied declarations/data where present; no earlier scored part is required by this index.')
            if part.count('(')>1: labels.append(parent)
            if base=='w21_41' and part=='3(b)': row['notes'].append('Prompt begins on QP page8; full incomplete pseudocode and mark bracket continue on page9.')
            if base=='s22_41' and part=='1(f)': row['notes'].append('NewHighScore.txt is a student-generated output file, not a supplied source file.')
            for issue in paper['issues']:
                if issue['part']==part: row['notes'].append('See paper issue '+issue['id']+'.')
            if base=='w21_41' and key=='w21_42' and part=='3(b)':row['notes'].append('Compared with variant41, OUTPUT "Tree is full" omits parentheses; both original sources retained.')
            question['parts'].append(row)
        question['unscored_structure']=[{'part':parent,'kind':'container','note':'Parent groups scored child parts; do not count an additional mark.'} for parent in sorted(set(labels))]
        paper['questions'].append(question)
    paper['indexed_total_marks']=sum(r['marks'] for q in paper['questions'] for r in q['parts'])
    assert paper['indexed_total_marks']==75
    for typ,p in RENDER[base]:
        paper['review']['rendered_pages_checked'].append({'source_id':'9618_'+base[:-3]+'_'+typ+'_'+base[-2:],'pdf_page':p,'image':f'renders/9618_{base}_{typ}_p{p}.png','note':'Baseline facsimile; content-equivalent variants independently text-compared.' if key!=base else 'Original baseline facsimile.'})
    if key in ALIASES:
        norm=lambda s:re.sub(r'\s+',' ',re.sub(r'9618/4[123]','PAPER',s)).strip()
        proof={'paper_id':pid,'compared_to':'9618_'+base,'method':'Every QP/MS body page from PDF page2 onward, normalized only whitespace and paper component header; no content deletion.','sources':[]}
        for typ,d in [('qp',qp),('ms',ms)]:
            ref=json.loads((EXT/('9618_'+base[:-3]+'_'+typ+'_'+base[-2:]+'.json')).read_text(encoding='utf8'))
            record={'type':typ,'pages':[]}
            for p,r in zip(d['pages'][1:],ref['pages'][1:]):
                a,b=norm(p['text']),norm(r['text']); row={'pdf_page':p['pdf_page'],'normalized_equal':a==b}
                if a!=b:row['difference']='\n'.join(difflib.unified_diff(b.split(),a.split(),n=5))
                record['pages'].append(row)
            proof['sources'].append(record)
        equivalence.append(proof)
    out['papers'].append(paper)
    print(pid,len(msc),paper['indexed_total_marks'])
(HERE/'index.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
(HERE/'VARIANT_EQUIVALENCE.json').write_text(json.dumps(equivalence,ensure_ascii=False,indent=2),encoding='utf8')
(HERE/'renders').mkdir(exist_ok=True)
for key,renders in RENDER.items():
    for typ,page in renders:
        sid='9618_'+key[:-3]+'_'+typ+'_'+key[-2:]
        source=json.loads((EXT/(sid+'.json')).read_text(encoding='utf8'))
        doc=fitz.open(source['source_path']); doc[page-1].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(HERE/'renders'/f'9618_{key}_{typ}_p{page}.png')

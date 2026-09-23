"""Independent QP/MS page comparison. Never edits the original PDFs."""
from pathlib import Path
import json,re,hashlib,datetime,collections,difflib,sys
import pymupdf
from PIL import Image,ImageDraw
sys.stdout.reconfigure(encoding='utf-8')
S=Path(__file__).resolve().parents[1];S1=S.parent/'stage-1';E=S/'evidence';E.mkdir(parents=True,exist_ok=True)
manifest=json.loads((S1/'SOURCE_MANIFEST.json').read_text(encoding='utf-8'))
index=json.loads((S1/'QUESTION_INDEX.json').read_text(encoding='utf-8'))
sources={s['source_id']:s for s in manifest['sources']}
data=json.loads((S1/'evidence/A2_DATA_AUDIT.json').read_text(encoding='utf-8'))
data={p['paper_id']:p for p in data['papers']}
def sha(b):return hashlib.sha256(b).hexdigest()
def shat(t):return sha(t.encode('utf-8'))
def norm(text):return re.sub(r'\s+',' ',re.sub(r'9618/4[123](?!\d)','9618/4X',text)).strip()
records=[];bodies={};docs={}
for p in index['papers']:
    pid=p['paper_id'];rec={'paper_id':pid,'sources':{},'questions':len(p['questions']),'parts':sum(len(q['parts']) for q in p['questions']),'marks':sum(part['marks'] for q in p['questions'] for part in q['parts'])}
    for kind in ['qp','ms']:
        sid=p[kind+'_source_id'];src=sources[sid];path=Path(src['source_path']);h=sha(path.read_bytes());assert h==src['sha256']
        doc=pymupdf.open(path); docs[(pid,kind)]=doc; pp=[];texts=[]
        for n,page in enumerate(doc,1):
            text=page.get_text('text',sort=False);normalized=norm(text)
            pp.append({'pdf_page':n,'raw_text_sha256':shat(text),'normalized_text_sha256':shat(normalized),'text_characters':len(text),'compared_for_body':n>=2,'page_rotation':page.rotation,'display_size_points':[page.rect.width,page.rect.height],'embedded_images':len(page.get_images()),'vector_drawings':len(page.get_drawings())})
            if n>=2:texts.append(normalized)
        bodies[(pid,kind)]=texts
        rec['sources'][kind]={'source_id':sid,'source_path':path.as_posix(),'sha256':h,'matches_stage1_release_source_hash':True,'page_count':len(doc),'body_pages':list(range(2,len(doc)+1)),'body_text_sha256':shat(json.dumps(texts,ensure_ascii=False)),'pages':pp}
    rec['data_signature']=sorted([{'filename':r['filename'],'sha256':r['sha256'],'role':r['role']} for r in data[pid]['required_input_files']],key=lambda r:r['filename'])
    records.append(rec)
groups=collections.defaultdict(list)
for r in records:groups[(r['sources']['qp']['body_text_sha256'],r['sources']['ms']['body_text_sha256'])].append(r)
group_records=[];comparisons=[]
def rendered_hash(pid,kind,n):
    page=docs[(pid,kind)][n-1];pix=page.get_pixmap(matrix=pymupdf.Matrix(1,1),alpha=False)
    im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples);draw=ImageDraw.Draw(im);masks=[]
    for b in page.get_text('dict')['blocks']:
        for line in b.get('lines',[]):
            for span in line['spans']:
                if re.match(r'^9618/4[123](?:/|\s*$)',span['text'].strip()):
                    rect=pymupdf.Rect(span['bbox'])*page.rotation_matrix
                    # Mask only published component identifier header/footer, no task region.
                    box=(int(rect.x0)-2,int(rect.y0)-2,int(rect.x1+2.999),int(rect.y1+2.999))
                    draw.rectangle(box,fill='white');masks.append({'text':span['text'],'display_mask_pixels':list(box)})
    return {'sha256':sha(im.tobytes()),'pixel_size':[im.width,im.height],'identifier_masks':masks}
for group in groups.values():
    representative=group[0]['paper_id']; members=[r['paper_id'] for r in group];gid='EQ_'+representative
    g={'group_id':gid,'representative':representative,'members':members,'basis':'Every QP+MS page2..last normalized-text hash equal, same per-page sequence/count. Covers excluded; source IDs retained.','strict_text_verified':True,'data_bytes_equal':all(r['data_signature']==group[0]['data_signature'] for r in group),'body_render_comparison':'singleton_not_applicable' if len(group)==1 else 'pending','questions_per_representative':group[0]['questions'],'parts_per_representative':group[0]['parts'],'marks_per_representative':group[0]['marks']}
    assert len({(r['questions'],r['parts'],r['marks']) for r in group})==1
    if len(group)>1:
        visual_pass=True
        for kind in ['qp','ms']:
            for n in range(2,len(docs[(representative,kind)])+1):
                ref=rendered_hash(representative,kind,n)
                group[0]['sources'][kind]['pages'][n-1]['masked_render']=ref
                for r in group[1:]:
                    test=rendered_hash(r['paper_id'],kind,n);r['sources'][kind]['pages'][n-1]['masked_render']=test
                    equal=test['sha256']==ref['sha256'];visual_pass &= equal
                    comparisons.append({'representative':representative,'member':r['paper_id'],'source_kind':kind,'pdf_page':n,'text_equal':True,'masked_render_equal':equal})
        g['body_render_comparison']='all_pages_pixel_equal_after_identifier_mask' if visual_pass else 'render_differences_require_review'
    group_records.append(g);print(gid,members,g['body_render_comparison'],flush=True)
near=[]
for a,b in [('9618_w21_41','9618_w21_42')]:
    diffs=[]
    for kind in ['qp','ms']:
        for i,(ta,tb) in enumerate(zip(bodies[(a,kind)],bodies[(b,kind)]),2):
            if ta!=tb:
                diffs.append({'source_kind':kind,'pdf_page':i,'word_diff':list(difflib.unified_diff(ta.split(),tb.split(),fromfile=a,tofile=b,n=8))})
    near.append({'papers':[a,b],'strict_text_equal':False,'differences':diffs,'semantic_review':'pending; keep separate strict groups','ms_body_equal':bodies[(a,'ms')]==bodies[(b,'ms')],'data_bytes_equal':next(r for r in records if r['paper_id']==a)['data_signature']==next(r for r in records if r['paper_id']==b)['data_signature']})
out={'schema_version':'1.0','status':'submitted_pending_review','created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'corpus_version':index['corpus_version'],'method':{'extractor':'PyMuPDF '+pymupdf.VersionBind+' natural-order text, independently read from original PDFs','strict_normalization':['Replace only 9618/41,9618/42,9618/43 component identifiers with9618/4X','Collapse Unicode whitespace to single spaces; preserve all non-whitespace characters, page order and page count','Compare QP and MS pages2..last; cover/page1 is excluded because it contains different production IDs and barcodes. Thus equality is task-body equality, not entire-document equality.'],'render_check':'For non-singleton strict text groups, independently render every body page at72DPI and mask only the actual component-identifier header/footer span. Compare RGB pixel bytes. Does not execute code.','strict_group_boundary':'Text equality alone removes whitespace; render equality corroborates body layout, code indentation, diagrams and tables at72DPI. Non-identical rendering retains uncertainty until reviewed.','data_check':'Compare filename,role,SHA256 of all44provided TXT through Stage1 audit; evidence.doc and instructions PDF are excluded from executable data signature.'},'sources':records,'strict_groups':group_records,'page_pair_comparisons':comparisons,'near_equivalent_pairs':near,'denominators':{'raw':{'paper_files':29,'questions':87,'scored_parts':672,'marks':2175},'strict_body_groups':{'groups':len(group_records),'questions':sum(g['questions_per_representative'] for g in group_records),'scored_parts':sum(g['parts_per_representative'] for g in group_records),'marks':sum(g['marks_per_representative'] for g in group_records)}},'limits':['No source deleted or mutated. Singleton is not proof of a wholly novel exercise.','No causal or statistical independence is inferred from group count.','Cover metadata and candidate instructions remain authoritative per original; body equality does not erase variant identities.','Stage1 source code caveats remain; identical faulty examples are not validated solutions.']}
(E/'A2_EQUIVALENCE.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('DENOMINATORS',out['denominators'])
print('RENDER_DIFFERENCES',[c for c in comparisons if not c['masked_render_equal']])

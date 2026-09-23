from pathlib import Path
import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[1]
out=stage/'batches/2025'
out.mkdir(parents=True,exist_ok=True)
batch={'schema_version':'1.0','batch':'2025','papers':[],'review_notes':[]}
for session in ['s','w']:
 for variant in ['41','42','43']:
    base=f'9618_{session}25'
    pid=f'{base}_{variant}'
    qp=json.loads((stage/f'extracted/{base}_qp_{variant}.json').read_text(encoding='utf-8'))
    ms=json.loads((stage/f'extracted/{base}_ms_{variant}.json').read_text(encoding='utf-8'))
    anchors=[]
    for p in ms['pages']:
      for l in p['lines']:
        label=re.sub(r'\s+','',l['text'])
        if re.fullmatch(r'[123](?:\([a-zivx]+\))+',label) and l['bbox'][0]<150:
          candidates=[x for x in p['lines'] if re.fullmatch(r'\d{1,2}',x['text'].strip()) and x['bbox'][0]>p['width']*.85 and abs(x['bbox'][1]-l['bbox'][1])<3]
          anchors.append({'part':label,'page':p['pdf_page'],'y':l['bbox'][1],'mark':int(candidates[0]['text'].strip()) if len(candidates)==1 else None})
    markers=[]
    for p in qp['pages']:
      for l in p['lines']:
        if re.fullmatch(r'\[\d{1,2}\]',l['text'].strip()) and l['bbox'][0]>p['width']*.75:
          markers.append({'page':p['pdf_page'],'y':l['bbox'][1],'mark':int(l['text'].strip()[1:-1])})
    anchors.sort(key=lambda a:(a['page'],a['y']))
    merged={}
    for a in anchors:
      if a['part'] not in merged: merged[a['part']]=a
      elif a['mark'] is not None:
        if merged[a['part']]['mark'] is not None and merged[a['part']]['mark']!=a['mark']: raise ValueError(f'Conflicting MS marks {pid} {a}')
        merged[a['part']]['mark']=a['mark']
    anchors=list(merged.values())
    markers.sort(key=lambda a:(a['page'],a['y']))
    if len(anchors)!=len(markers):
      print(pid,'COUNT_MISMATCH',len(anchors),len(markers)); continue
    paper={'paper_id':pid,'qp_source_id':f'{base}_qp_{variant}','ms_source_id':f'{base}_ms_{variant}',
        'qp_page_count':qp['page_count'],'ms_page_count':ms['page_count'],'declared_total_marks':75,'indexed_total_marks':0,
        'questions':[],'issues':[],'review':{'method':'geometry candidates; pending Lead reading and reconciliation','rendered_pages_checked':[],'status':'draft'}}
    prev=(2,-1)
    digest=[]
    for n,(a,m) in enumerate(zip(anchors,markers)):
      if a['mark']!=m['mark']: paper['issues'].append(f'{a["part"]}: MS {a["mark"]} QP {m["mark"]}')
      seg=[]; pages=[]
      for p in qp['pages']:
       for l in p['lines']:
        pos=(p['pdf_page'],l['bbox'][1])
        if prev<pos<=(m['page'],m['y']) and 45<l['bbox'][1]<p['height']-50 and l['text'].strip() and not re.fullmatch(r'(?:\d+|BLANK PAGE|\[Turn over|©.*|9618/.*)',l['text'].strip()):
          seg.append(l['text'].strip());pages.append(p['pdf_page'])
      text='\n'.join(seg)
      refs=re.findall(r'part\s+([123]\s*\([a-z]\)(?:\([ivx]+\))?)',text,re.I)
      refs=[re.sub(r'\s+','',r) for r in refs]
      start=a['page']; end=anchors[n+1]['page'] if n+1<len(anchors) else ms['page_count']
      if n+1<len(anchors) and anchors[n+1]['y']<110: end-=1
      ms_excerpt=[]
      for p in ms['pages']:
       if start<=p['pdf_page']<=end:
        for l in p['lines']:
         pos=(p['pdf_page'],l['bbox'][1]); nxt=(anchors[n+1]['page'],anchors[n+1]['y']) if n+1<len(anchors) else (999,999)
         if (a['page'],a['y'])<=pos<nxt and l['text'].strip():ms_excerpt.append(l['text'].strip())
      q=int(a['part'][0])
      if not any(z['question_number']==q for z in paper['questions']):paper['questions'].append({'question_number':q,'context_pages':[min(pages)],'parts':[],'unscored_structure':[]})
      question=next(z for z in paper['questions'] if z['question_number']==q)
      record={'part':a['part'],'parent_part':a['part'].rsplit('(',1)[0], 'qp_pages':sorted(set(pages)), 'ms_pages':list(range(start,end+1)),
        'marks':m['mark'],'qp_marks':m['mark'],'ms_marks':a['mark'],'prompt_summary':'PENDING_LEAD_REVIEW',
        'required_source_files':sorted(set(re.findall(r'\b[\w-]+\.(?:txt|csv|dat|docx?)\b',text,re.I))),
        'dependency_refs':[], 'evidence_requirement':'PENDING_LEAD_REVIEW', 'verification_status':'candidate_needs_review',
        'notes':[], 'qp_explicit_part_references':refs,'qp_segment_text':text,
        'qp_start_marker_after':{'page':prev[0],'y':prev[1]},'qp_end_marker':m}
      question['parts'].append(record)
      digest.append(f'### {a["part"]} QP{record["qp_pages"]} MS{record["ms_pages"]} MARKS {m["mark"]}/{a["mark"]}\n{text}\nMS BEGIN:\n'+ '\n'.join(ms_excerpt)[:1800]+'\n')
      paper['indexed_total_marks']+=m['mark']; prev=(m['page'],m['y'])
    (out/f'{pid}_review.txt').write_text('\n'.join(digest),encoding='utf-8')
    batch['papers'].append(paper)
    print(pid,len(anchors),paper['indexed_total_marks'],paper['issues'])
(out/'index.draft.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2),encoding='utf-8')

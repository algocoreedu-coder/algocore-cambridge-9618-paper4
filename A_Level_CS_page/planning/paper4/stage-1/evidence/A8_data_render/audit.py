from pathlib import Path, PurePosixPath
import hashlib,json,re,zipfile,sys,zlib
import pymupdf as fitz
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda b:hashlib.sha256(b).hexdigest()
a=load(stage/'evidence/A2_DATA_AUDIT.json'); ex=load(stage/'EXTRACTION_MANIFEST.json')
result={'zip_checks':[],'pdf_checks':[],'data_content':[],'rendered_pages':[],'issues':[]}
for paper in a['papers']:
 p=Path(paper['archive_path']); z=zipfile.ZipFile(p); member_checks=[]
 for m in paper['members']:
  name=m['member']; b=z.read(name); dest=Path(m['extracted_path']); pure=PurePosixPath(name.replace('\\','/'))
  safe=not pure.is_absolute() and '..' not in pure.parts and ':' not in name
  member_checks.append({'name':name,'hash_match':sha(b)==m['sha256']==sha(dest.read_bytes()),'size_match':len(b)==m['size_bytes'], 'crc_match':f'{zlib.crc32(b):08x}'==m['crc32'], 'safe_member_path':safe,'confined':dest.resolve().is_relative_to((stage/'data/extracted'/paper['paper_id']).resolve())})
 result['zip_checks'].append({'paper_id':paper['paper_id'],'archive_hash_match':sha(p.read_bytes())==paper['archive_sha256'],'crc_all_pass':z.testzip() is None,'members_complete':{i.filename for i in z.infolist() if not i.is_dir()}=={m['member'] for m in paper['members']},'members':member_checks})
 for f in paper['required_input_files']:
  txt=Path(f['extracted_path']).read_text(encoding='utf-8-sig').splitlines()
  result['data_content'].append({'paper_id':paper['paper_id'],'filename':f['filename'],'line_count':len(txt),'sample':txt[:6],'task_locator':[f.get('first_direct_task'),f.get('task_qp_pdf_page')]})
for m in ex:
 p=Path(m['source_path']); e=load(stage/m['extraction_json']); d=fitz.open(p); bad=[]; unders=[]
 for idx,pg in enumerate(d):
  ep=e['pages'][idx]
  if ep['text']!=pg.get_text(sort=False):bad.append([idx+1,'primary text differs'])
  if ep['pdf_page']!=idx+1:bad.append([idx+1,'page number differs'])
  if ep['width']!=round(pg.rect.width,2) or ep['height']!=round(pg.rect.height,2) or ep['rotation']!=pg.rotation:bad.append([idx+1,'geometry differs'])
  for line in ep['lines']:
   target=fitz.Rect(line['bbox'])*pg.rotation_matrix
   if any(abs(a-b)>.04 for a,b in zip(target,line['display_bbox'])):bad.append([idx+1,'display bbox differs'])
  if '_ms_' in m['source_id'] and re.search(r'def\s+init\s*\(',ep['text']): unders.append(idx+1)
 header=' '.join(d[0].get_text().split()); identity=None
 if re.match(r'9618_[sw]\d+_(?:qp|ms)_\d+',m['source_id']):
  yr,kind,var=re.match(r'9618_([sw]\d+)_(qp|ms)_(\d+)',m['source_id']).groups()
  identity={'component':f'9618/{var}' in header,'year':('20'+yr[1:]) in header,'session':('May/June' if yr[0]=='s' else 'October/November') in header}
 result['pdf_checks'].append({'source_id':m['source_id'],'hash_match':sha(p.read_bytes())==m['sha256']==e['sha256'],'page_count_match':len(d)==m['page_count']==e['page_count']==len(e['pages']),'size_match':p.stat().st_size==m['size_bytes']==e['size_bytes'],'issues':bad,'header_identity':identity,'constructor_text_without_underscores_pages':unders})
samples=[('9618_s25_ms_41',31),('9618_s21_qp_41',2),('9618_s21_ms_41',4),('coursebook_watson_williams',8),('9618_w21_qp_41',5),('9618_s22_qp_42',8),('9618_w23_qp_42',3),('9618_s25_qp_41',5)]
for sid,n in samples:
 m=next(m for m in ex if m['source_id']==sid); d=fitz.open(m['source_path']); dest=out/f'{sid}-p{n}.png';d[n-1].get_pixmap(matrix=fitz.Matrix(1.6,1.6)).save(dest)
 result['rendered_pages'].append({'source_id':sid,'pdf_page':n,'render':str(dest.relative_to(stage))})
(out/'mechanical_checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('zip',len(result['zip_checks']),'pdf',len(result['pdf_checks']),'pages',sum(m['page_count'] for m in ex))
print('zip failures',[p['paper_id'] for p in result['zip_checks'] if not(p['archive_hash_match'] and p['crc_all_pass'] and p['members_complete'] and all(all(v for k,v in m.items() if k!='name') for m in p['members']))])
print('pdf failures',[p for p in result['pdf_checks'] if p['issues'] or not p['hash_match'] or not p['page_count_match'] or not p['size_match'] or (p['header_identity'] and not all(p['header_identity'].values()))])
print('underscores',[(p['source_id'],p['constructor_text_without_underscores_pages']) for p in result['pdf_checks'] if p['constructor_text_without_underscores_pages']])

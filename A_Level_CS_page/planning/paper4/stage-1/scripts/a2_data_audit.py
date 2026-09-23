"""Read PDFs/archives; preserve bytes, never execute exam source files."""
from pathlib import Path, PurePosixPath
import sys, json, hashlib, zipfile, re, subprocess, requests, io, datetime, stat
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[5]
STAGE=Path(__file__).resolve().parents[1]
EVID=STAGE/'evidence'; DATA=STAGE/'data'
BASE=json.loads((STAGE.parent/'stage-0/evidence/A2_SOURCE_BASELINE.json').read_text(encoding='utf-8-sig'))
from pypdf import PdfReader
def sha(b): return hashlib.sha256(b).hexdigest()
def put(p,x): p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
INDEX='https://qualifiedquest.com/past-papers/a-level/computer-science-9618/'
def recover():
    index=requests.get(INDEX,timeout=40);index.raise_for_status()
    urls=set(re.findall(r'https[^\s\x22\x27<>]+sf_4[123]\.zip',index.text))
    log=[]
    for p in BASE['papers']:
        if p['sf']:continue
        fn=p['paper_id'].rsplit('_',1)[0]+'_sf_'+p['variant']+'.zip'
        dest=DATA/'recovered'/fn
        record=dest.with_suffix('.provenance.json')
        if record.exists() and dest.exists():log.append(json.loads(record.read_text(encoding='utf-8')));continue
        url=next(u for u in urls if u.endswith('/'+fn))
        r=requests.get(url,timeout=40);r.raise_for_status()
        with zipfile.ZipFile(io.BytesIO(r.content)) as z: assert z.testzip() is None
        dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(r.content)
        meta={'paper_id':p['paper_id'],'requested_url':url,'final_url':r.url,'discovery_url':INDEX,'retrieved_utc':now(),'http_status':r.status_code,'size_bytes':len(r.content),'sha256':sha(r.content),'local_path':dest.as_posix(),'source_class':'public_mirror_of_Cambridge_exam_bundle','authority_limit':'Retrieved from public mirror; no Cambridge-hosted byte-signature comparison claimed.'}
        put(record,meta);log.append(meta);print('Recovered',fn,len(r.content),flush=True)
    put(EVID/'A2_DATA_RECOVERY.json',log)

def audit():
    rar=Path(BASE['archive_not_inspected']['path'])
    proc=subprocess.run(['D:/Soft/AOMEI Partition Assistant/7z.exe','l','-slt',str(rar)],capture_output=True)
    listing=proc.stdout.decode('utf-8',errors='replace')
    (EVID/'A2_DATA_RAR_LISTING.txt').write_text(listing,encoding='utf-8')
    rar_info={'path':rar.as_posix(),'sha256':sha(rar.read_bytes()),'listing_exit_code':proc.returncode,'sf_members':re.findall(r'^Path = ([^\r\n]*sf_4[123]\.zip)\s*$',listing,re.M),'not_extracted':True}
    papers=[]
    for p in BASE['papers']:
        pid=p['paper_id']; reader=PdfReader(p['qp']['path']); pages=[pg.extract_text() or '' for pg in reader.pages]
        required=re.findall(r'[A-Za-z][A-Za-z0-9_-]*\.txt',pages[1].split('\n1 ')[0])
        required=list(dict.fromkeys(required))
        sf=Path(p['sf'][0]['path']) if p['sf'] else DATA/'recovered'/(pid.rsplit('_',1)[0]+'_sf_'+p['variant']+'.zip')
        contents=[]; target=(DATA/'extracted'/pid).resolve();target.mkdir(parents=True,exist_ok=True)
        with zipfile.ZipFile(sf) as z:
            bad=z.testzip(); assert bad is None,(sf,bad)
            for m in z.infolist():
                name=m.filename.replace('\\','/');pp=PurePosixPath(name)
                assert not pp.is_absolute() and '..' not in pp.parts and ':' not in name
                assert not stat.S_ISLNK(m.external_attr>>16)
                dest=(target/name).resolve();assert dest.is_relative_to(target)
                if m.is_dir():continue
                assert m.file_size<20_000_000
                b=z.read(m);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
                rec={'member':m.filename,'basename':pp.name,'size_bytes':len(b),'sha256':sha(b),'crc32':f'{m.CRC:08x}','crc_verified':True,'extracted_path':dest.as_posix(),'role':'exam_input_data' if pp.suffix.lower()=='.txt' else 'evidence_document' if pp.name.lower().startswith('evidence') else 'bundle_other'}
                if pp.suffix.lower()=='.txt':
                    if b.startswith(b'\xef\xbb\xbf'):enc='utf-8-sig'
                    elif b.startswith((b'\xff\xfe',b'\xfe\xff')):enc='utf-16'
                    else:
                        try:b.decode('ascii');enc='ascii (also valid UTF-8)'
                        except UnicodeDecodeError:
                            try:b.decode('utf-8');enc='utf-8'
                            except UnicodeDecodeError:enc='cp1252_assumed'
                    tx=b.decode('ascii' if enc.startswith('ascii') else enc.replace('_assumed',''))
                    rec.update(text_encoding=enc,line_count=len(tx.splitlines()),blank_line_count=sum(not l for l in tx.splitlines()),newline_CRLF=b.count(b'\r\n'),newline_LF=b.count(b'\n'),first_line=tx.splitlines()[0] if tx.splitlines() else '')
                contents.append(rec)
        reqs=[]
        for name in required:
            matches=[c for c in contents if c['basename'].lower()==name.lower()]
            occurrences=[]
            for n,tx in enumerate(pages,1):
                for match in re.finditer(r'(?<![A-Za-z0-9_-])'+re.escape(name)+r'(?![A-Za-z0-9_-])',tx,re.I):occurrences.append({'pdf_page':n,'context':tx[max(0,match.start()-180):match.end()+180]})
            reqs.append({'filename':name,'role':'required_exam_input','status':'supplied' if matches else 'missing','qp_requirement_pdf_page':2,'members':[c['member'] for c in matches],'references':occurrences})
        other_names=set(re.findall(r'[A-Za-z][A-Za-z0-9_-]*\.txt','\n'.join(pages)))-set(required)
        item={'paper_id':pid,'qp_path':p['qp']['path'],'qp_sha256':sha(Path(p['qp']['path']).read_bytes()),'qp_requirement_page_text':pages[1],'archive_path':sf.as_posix(),'archive_origin':'local_baseline' if p['sf'] else 'recovered_public_mirror','archive_sha256':sha(sf.read_bytes()),'archive_crc_all_members_pass':True,'member_path_safety_pass':True,'members':contents,'required_input_files':reqs,'other_txt_mentions':sorted(other_names),'all_required_data_supplied':all(r['status']=='supplied' for r in reqs),'evidence_document_status':'supplied' if any(c['role']=='evidence_document' for c in contents) else 'missing','question_file_mapping_status':'pending_manual_reference_review'}
        papers.append(item)
        print(pid,required,[(c['basename'],c.get('line_count')) for c in contents],flush=True)
    result={'schema_version':'1.0','created_utc':now(),'agent':'A2 Source/Data','status':'submitted_pending_manual_reference_review','verification_boundary':'Archive bytes, CRCs, names, extraction confinement, text decoding and QP requirements. No exam solution executed. Evidence documents retained without opening macros.','rar':rar_info,'papers':papers}
    put(EVID/'A2_DATA_AUDIT.json',result)

if __name__=='__main__':
    if '--recover' in sys.argv:recover()
    audit()

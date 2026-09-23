"""Apply source-locator review decisions after a2_data_audit.py."""
from pathlib import Path
import json, hashlib, collections
import pymupdf
S=Path(__file__).resolve().parents[1]; E=S/'evidence'
p=E/'A2_DATA_AUDIT.json';x=json.loads(p.read_text(encoding='utf-8'))
MAP={}
def add(codes, files):
    for code in codes.split():MAP['9618_'+code]=files
# Question locators transcribed from QP page 2 and the referenced task pages.
add('s21_41 s21_42 s21_43',{'TreasureChestData.txt':('3','3(b)',9)})
add('w21_41 w21_42',{'Pictures.txt':('2','2(e)',5)})
add('s22_41 s22_43',{'HighScore.txt':('1','1(b)',2)})
add('s22_42',{'CardValues.txt':('3','3(c)',8)})
add('w22_41 w22_43',{'IntegerData.txt':('1','1(b)',2)})
add('w22_42',{'Characters.txt':('2','2(d)',6)})
add('s23_41 s23_43',{'Data.txt':('1','1(a)(ii)',2),'AnimalData.txt':('3','3(b)(iii)',9),'ColourData.txt':('3','3(b)(v)',10)})
add('s23_42',{'Employees.txt':('3','3(c)',11),'HoursWeek1.txt':('3','3(d)',11)})
add('w23_41 w23_43',{'QueueData.txt':('2','2(b)',5)})
add('w23_42',{'StackData.txt':('1','1(b)(ii)',3)})
add('s24_41 s24_43',{'Trees.txt':('2','2(b)',7)})
add('s24_42',{n:('1','1(a)',2) for n in ['Easy.txt','Medium.txt','Hard.txt']})
add('w24_41 w24_43',{'Data.txt':('1','1(a)',2)})
add('w24_42',{'HighScoreTable.txt':('3','3(b)',12)})
add('s25_41',{'TheData.txt':('2','2(a)',4),**{n:('2','2(d)',5) for n in ['Blue.txt','Green.txt','Orange.txt','Pink.txt','Red.txt','Yellow.txt']}})
add('s25_42',{'StackData.txt':('1','1(d)',3),'SecondStack.txt':('1','1(f)(ii)',5),'HashData.txt':('2','2(e)',7)})
add('s25_43',{'QueueData.txt':('1','1(d)',3)})
add('w25_41',{'HashTableData.txt':('3','3(e)',11)})
add('w25_42',{'TreeData.txt':('3','3(c)',11)})
add('w25_43',{'BinaryData.txt':('2','2(d)',10)})
checks=[]; hashes=collections.defaultdict(list)
for paper in x['papers']:
    pid=paper['paper_id']; assert pid in MAP
    assert set(MAP[pid])=={r['filename'] for r in paper['required_input_files']}
    for r in paper['required_input_files']:
        q,part,page=MAP[pid][r['filename']]
        r.update(question=q,first_direct_task=part,task_qp_pdf_page=page,locator_status='reviewed_against_QP_extraction',dependency_scope='Direct use locator; later parts may depend on data/state. Full transitive dependencies belong to question index.')
        m=next(m for m in paper['members'] if m['basename'].lower()==r['filename'].lower())
        r['extracted_path']=m['extracted_path'];r['sha256']=m['sha256']
        if pid=='9618_s25_41' and r['filename']!='TheData.txt':
            r['role']='provided_blank_output_target';m['role']='provided_blank_output_target'
            r['empty_file_reason']='QP 2(d), PDF5 explicitly supplies six blank files for StoreData append; zero bytes is expected.'
            assert m['size_bytes']==0
        hashes[m['sha256']].append(pid+'/'+m['basename'])
    for m in paper['members']:
        if m['role']=='evidence_document':
            b=Path(m['extracted_path']).read_bytes()
            m['container_signature']='OLE_Compound_Document' if b.startswith(bytes.fromhex('D0CF11E0A1B11AE1')) else 'ZIP' if b.startswith(b'PK') else 'other'
            m['content_review_boundary']='Archive integrity and container signature checked; not executed, no macro-enabled editor opened.'
    outputs=[]
    if pid in ['9618_s22_41','9618_s22_43']:outputs=[{'filename':'NewHighScore.txt','question':'1','task':'1(f)','qp_pdf_page':4,'role':'candidate_generated_output','status':'not_required_as_supplied_source'}]
    if pid=='9618_w25_42':outputs=[{'filename':'Tree.txt','question':'3','task':'3(d)','qp_pdf_page':11,'role':'candidate_generated_output','status':'not_required_as_supplied_source','note':'QP explicitly says file is not provided.'}]
    assert set(paper['other_txt_mentions'])=={o['filename'] for o in outputs}
    paper['candidate_generated_outputs']=outputs
    paper['question_file_mapping_status']='reviewed'
    paper['evidence_document_requirement']={'filename':'evidence.doc','qp_pdf_pages':[1,2],'role':'candidate_answer_container','status':paper['evidence_document_status'],'applies_to':'all questions; separate from executable data input','source_origin':paper['archive_origin']}
    checks.append({'paper_id':pid,'all_page2_named_files_supplied':paper['all_required_data_supplied'],'all_txt_mentions_classified':True,'evidence_doc_supplied':paper['evidence_document_status']=='supplied','all_crc_pass':paper['archive_crc_all_members_pass'],'all_member_paths_safe':paper['member_path_safety_pass']})
x['duplicate_data_byte_groups']=[{'sha256':h,'paper_files':v,'meaning':'Identical supplied file bytes; does not establish entire-question identity.'} for h,v in hashes.items() if len(v)>1]
x['totals']={'papers':len(x['papers']),'local_baseline_zips':21,'recovered_zips':8,'zip_crc_pass':29,'evidence_documents':29,'provided_txt_files':sum(len(p['required_input_files']) for p in x['papers']),'provided_blank_output_targets':6,'candidate_generated_outputs':3,'missing_required_source_files':0}
x['status']='submitted_for_independent_QA_and_Lead_gate'
x['unresolved_required_sources']=[]
x['self_checks']=checks
x['local_search']={'root':'D:/Private/_Lam_viec/AlgoCoreEduction','method':'rg --files with glob *9618*sf*, Pictures.txt, HighScore.txt, CardValues.txt, QueueData.txt, StackData.txt','result':'Only 21 original SF ZIPs found before recovery; missing 8 were not found in local targeted search or RAR listing.'}
x['notes']=['ASCII files are also valid UTF-8; byte-preserving originals should be copied per practice attempt, especially six append targets.','File names and case are preserved exactly; do not merge same-named files from different paper IDs.','HashData.txt has199 rows; QP s25/42 2(e) says up to200, not exactly200.','QueueData.txt w23 has23 lines; QueueData.txt s25/43 has46 lines. Identical names do not imply identical data.','Past_Papers.rar was listed, not extracted or fully tested. ZIP CRC PASS is not a claim of Cambridge provenance certification.','The sources are Cambridge-branded past-exam materials obtained from local baseline/public mirror; not a redistribution licence.','This audit does not solve tasks, execute Python solutions, validate answer correctness, or advance Stage2.']
semantic=[]
for paper in x['papers']:
    if paper['archive_origin']!='recovered_public_mirror':continue
    m=next(m for m in paper['members'] if m['role']=='exam_input_data')
    lines=Path(m['extracted_path']).read_text(encoding='ascii').splitlines(); name=m['basename']
    if name=='Pictures.txt':
        rule='QP PDF5 2(e): repeated description,width,height,colour; first record Flowers,45,50,black.'
        ok=len(lines)%4==0 and lines[:4]==['Flowers','45','50','black'] and all(lines[i].isdigit() and lines[i+1].isdigit() for i in range(1,len(lines),4))
    elif name=='HighScore.txt':
        rule='QP PDF2 Q1:10 player/score pairs in descending score; first FYI,10000.'
        scores=[int(n) for n in lines[1::2]];ok=len(lines)==20 and lines[:2]==['FYI','10000'] and all(len(n)==3 for n in lines[::2]) and scores==sorted(scores,reverse=True)
    elif name=='CardValues.txt':
        rule='QP PDF8 3(c):30 number/colour pairs; first1,red.'
        ok=len(lines)==60 and lines[:2]==['1','red'] and all(n.isdigit() for n in lines[::2]) and all(n.isalpha() for n in lines[1::2])
    elif name=='StackData.txt':
        rule='QP PDF3 1(b)(ii):100 lower-case letters.'
        ok=len(lines)==100 and all(len(n)==1 and 'a'<=n<='z' for n in lines)
    elif name=='QueueData.txt':
        rule='QP PDF5 2(b): list of game IDs of string type; no fixed line count stated.'
        ok=len(lines)>0 and all(n.strip() for n in lines)
    else:raise AssertionError(name)
    assert ok,(paper['paper_id'],name)
    semantic.append({'paper_id':paper['paper_id'],'filename':name,'check':rule,'pass':bool(ok),'scope':'Input format/example compatibility, not solution execution or full Cambridge-host signature verification.'})
x['recovered_data_content_checks']=semantic
x['visual_review']=[{'paper_id':'9618_s25_41','qp_pdf_page':5,'render':'../data/review_renders/9618_s25_41_qp_p5.png','result':'Viewed: confirms six supplied blank files and append instruction.'},{'paper_id':'9618_w25_42','qp_pdf_page':11,'render':'../data/review_renders/9618_w25_42_qp_p11.png','result':'Viewed: confirms Tree.txt is candidate-created and not supplied.'}]
p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
md=['# A2 — Source-file audit, Stage 1','', '**Trạng thái:** submitted for independent QA and Lead gate. 2026/Python/VI–EN; corpus29QP2021–2025.','', 'Đã phục hồi8ZIP thiếu và kiểm CRC, đường dẫn thành viên, hash SHA-256, giải nén giữ byte của toàn bộ29ZIP. Không chạy code hoặc macro từ nguồn. Mọi file được nêu ở QP trang2 đều có mặt; evidence.doc được ghi riêng như tài liệu nộp bài.','', '## Kết quả theo paper','', '| Paper | File cần có → câu trực tiếp | Nguồn ZIP | Trạng thái |','|---|---|---|---|']
for paper in x['papers']:
    files='; '.join(f"{r['filename']} → {r['first_direct_task']} (PDF{r['task_qp_pdf_page']})"+(' [blank output]' if r['role']=='provided_blank_output_target' else '') for r in paper['required_input_files'])
    md.append(f"| {paper['paper_id']} | {files} | {paper['archive_origin']} | CRC/required names/evidence.doc PASS |")
md+=['','## Các phân biệt bắt buộc','', '- `s25/41`: Blue/Green/Orange/Pink/Red/Yellow.txt là sáu file đầu ra rỗng được cung cấp; QP2(d), PDF5 xác nhận. Giữ nguyên file rỗng, không coi là hỏng/thiếu.','- `s22/41,43`: NewHighScore.txt do học sinh tạo, QP1(f), PDF4; không cần tải SF cho tên này.','- `w25/42`: Tree.txt do học sinh tạo, QP3(d), PDF11 nói rõ không cung cấp.','- `s25/42`: HashData.txt có199 dòng, phù hợp “up to200” trong QP2(e), PDF7.','- Tên trùng như Data.txt, QueueData.txt, StackData.txt được tách theo paper ID.','- evidence.doc: tài liệu trả lời, được bảo toàn và kiểm CRC/signature; không phải input cho thuật toán. Không mở macro.','', '## Provenance và tái lập','', '[A2_DATA_AUDIT.json](A2_DATA_AUDIT.json) có mọi đường dẫn gốc, hashZIP/member, CRC, encoding, số dòng, source locator và trích đoạn QP. [A2_DATA_RECOVERY.json](A2_DATA_RECOVERY.json) có URL chính xác, UTC tải, HTTPstatus, hash và nguồn public mirror của8bundle.','', 'Tìm file trên [QualifiedQuest](https://qualifiedquest.com/past-papers/a-level/computer-science-9618/); byte tải về giữ trong `../data/recovered`, bản giải nén nằm trong `../data/extracted/<paper_id>`. Không tuyên bố đã đối chiếu chữ ký/hash với máy chủ Cambridge.','', '[RAR listing](A2_DATA_RAR_LISTING.txt) xác nhận archive chỉ có21SF trong baseline; không có8ZIP thiếu. RAR chưa được full integrity test vì không dùng làm nguồn bổ sung.','', 'Chạy từ workspace: `python A_Level_CS_page/planning/paper4/stage-1/scripts/a2_data_audit.py` rồi `python A_Level_CS_page/planning/paper4/stage-1/scripts/a2_finalize_data.py`. Thêm `--recover` cho audit script để tải thiếu (không tải lại khi file/provenance đã có).','', '## Phần còn mở','', '**Không còn nguồn dữ liệu bắt buộc bị thiếu trong29paper đã khóa.** Gate toàn Stage1 thuộc Lead; A2 không tự phê duyệt corpus. Không tính nguồn dữ liệu đúng là lời giải đã đúng. Không thực hiện stage kế tiếp.','']
(E/'A2_DATA_AUDIT.md').write_text('\n'.join(md),encoding='utf-8')
# Visual evidence for discriminating provided empty outputs and generated outputs.
for pid,page in [('9618_s25_41',5),('9618_w25_42',11)]:
    paper=next(p for p in x['papers'] if p['paper_id']==pid)
    doc=pymupdf.open(paper['qp_path']); dest=S/'data'/'review_renders'/f'{pid}_qp_p{page}.png';dest.parent.mkdir(parents=True,exist_ok=True)
    doc[page-1].get_pixmap(matrix=pymupdf.Matrix(1.3,1.3)).save(dest)
print(json.dumps(x['totals']))

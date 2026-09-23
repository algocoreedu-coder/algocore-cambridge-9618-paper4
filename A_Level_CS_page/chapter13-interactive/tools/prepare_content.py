from pathlib import Path
from html import escape
import json,re,shutil,xml.etree.ElementTree as ET
import markdown
from PIL import ImageFont
ROOT=Path(__file__).resolve().parents[1];UNIT=ROOT.parent/'curriculum/paper_3/unit_13'

TRANSLATE={
'-0.5, chưa chuẩn hóa':'-0.5, not normalised','10…: chuẩn hóa':'10…: normalised','25 > 20 → dừng':'25 > 20 → stop','7 đã có 27 → thử 8':'7 holds 27 → try 8','7: 27 ≠ 37 → thử 8':'7: 27 ≠ 37 → try 8','8 trống → lưu 37':'8 is empty → store 37','8: 37 = 37 → tìm thấy':'8: 37 = 37 → found','Bù hai xong vẫn phải kiểm tra chuẩn hóa':'Check normalisation after making M negative','Các field dưới một tên':'Fields under one name','Dương gần 0 nhất':'Positive nearest zero','Dương lớn nhất':'Largest positive','E = 00000111 trong cả hai nhánh (M8/E8)':'E = 00000111 in both cases (M8/E8)','E giảm 1':'E minus 1','E vẫn +3':'E stays +3','ENUM: một giá trị tại một thời điểm':'ENUM: one value at a time','Giá trị giữ nguyên; hai bit đầu M: 01':'Same value; first two M bits: 01','Không cần đọc 31':'No need to read 31','Không suy ra enum từ vài dòng dữ liệu mẫu':'A few sample values do not define an enum','Lessons: số đếm':'Lessons: a count','LƯU 37':'STORE 37','M của +6.5':'M for +6.5','M dịch trái 1':'M shifts left 1','M8/E4 chuẩn hóa: Emin = -8, Emax = 7':'Normalised M8/E4: Emin = -8, Emax = 7','Miền lựa chọn hữu hạn':'A fixed set of choices','Mã bên ngoài':'Outside code','Một giá trị enum':'One enum value','Phía dương của M8/E4 chuẩn hóa • trục ngắt, không theo tỉ lệ':'Normalised M8/E4, positive side • broken axis, not to scale','Phải đọc cả bốn record':'Read all four records','RÀNG BUỘC':'LIMITS','SET: nhiều phần tử cùng tồn tại':'SET: several items at once','StartDate: ngày':'StartDate: a date','Status: một lựa chọn':'Status: one choice','THAO TÁC':'ACTION','TÌM 37':'FIND 37','Tìm key = 20':'Find key = 20','Ví dụ địa chỉ: base 4096, record 64 bytes, slot từ 0':'Example: base 4096, record 64 bytes, slots start at 0','Yêu cầu field':'Field needed','ba phần tử':'three items','biến':'variable','bù hai':"two's complement",'bù hai M và E':"signed M and E",'bỏ 2 bit':'drop 2 bits','chọn một':'choose one','giữ 8 bit':'keep 8 bits','hết tệp → dừng':'end of file → stop','khớp số ban đầu: -6.5':'matches the input: -6.5','lấy địa chỉ':'get the address','một giá trị denary':'a denary value','một giá trị: 3':'one value: 3','truy cập qua method':'access through a method','tính + working':'calculate + working','Âm gần 0 nhất':'Negative nearest zero','Âm nhỏ nhất':'Most negative','ít bit có ý nghĩa hơn':'fewer significant bits','ĐẦU RA':'RESULT','đã có':'already there','đọc tại địa chỉ':'read at the address','→ kiểu phù hợp':'→ suitable type','→ precision giảm':'→ less precision','→ range tăng':'→ wider range','so key':'check key','theo key':'key order'}
TITLES=[
'Chapter 13 at a glance','From AS skills to A Level','Why group related data?','Composite and non-composite types','Enum: type, variable, value','A record and its fields','An array of records','Address and pointed-to value','A pointer follows a changed value','Set union and intersection','Enum compared with a set','Two objects, two states','Organisation or access?','Three file organisations','Append to a serial file','Insert in key order','A sequential search','Direct access with an index','Hash a key to an address','Hash a string key','Collision during insertion','Follow the same search path','Use an overflow area','Mantissa times a power of two','The weights of M and E','Decode a positive value','Decode a negative value','A negative exponent','Encode positive and negative numbers','Normalise a positive number','Normalise a negative number','Precision and range','Four normalised limits','A binary fraction that repeats','Truncate or round?','Error from rounded inputs','Overflow and underflow','Zero and normalisation','A method for Paper 3','Link the chapter skills',
'Read the action, result and limits','One value or several fields?','Enum order and one choice','Choose an enum field','Turn field needs into a record','Type, record variable and field','Pointer: address and value','A set does not repeat items','Insert into three file organisations','Know when to stop searching','Two routes to direct access','MOD, slot and byte address','Store and search after a collision','Show working for a negative number','The -0.5 normalisation trap','Decode M and E by their weights','Normalise an existing M/E pair','Normalise a small binary fraction','Choose bits for four limits','Share 16 bits between M and E','Truncation and rounding differ','Two different range errors','A subrange is not an array','PRIVATE and method access','Read and write the correct file','Decode to check your answer']
META={
'13.1.1':([1,2,3,4],'types',['data type','composite'],'Which item is non-composite in this course?',['Record','Set','Pointer'],2,'A pointer holds an address. Cambridge places it in the non-composite group.'),
'13.1.2':([5],'enum',['enumerated','ordinal'],'Which assignment fits an enum variable Status?',['Status ← "Active"','Status ← Active','TStudyStatus ← Status'],1,'Active is a named enum value. Quotes would make it a STRING.'),
'13.1.3':([6,7],'record',['record','field'],'Why store a phone number as STRING?',['To keep a leading zero','To add two phone numbers','Because STRING is always faster'],0,'A phone number is an identifier, not an amount to calculate with.'),
'13.1.4':([8,9],'pointer',['pointer','dereference'],'P points to Score. Score changes from 42 to 50. What is P^?',['42','50','The address of P'],1,'Dereferencing reads the current value at the target address.'),
'13.1.5':([10,11],'sets',['set','union','intersection'],'A={1,3,5}, B={3,4,5}. What is A ∩ B?',['{1,3,4,5}','{3,5}','{1}'],1,'Intersection keeps items that are present in both sets.'),
'13.1.6':([12],'objects',['class','object','method'],'Only CounterA is incremented once. What does CounterB return?',['1','0','An address'],1,'Separate objects have their own state. CounterB stays at zero.'),
'13.2.1':([13,14,15,16],'organisation',['serial','sequential'],'Where does a serial file add a new record?',['At the end','In key order','At a new random place each time'],0,'Serial organisation appends in order of arrival.'),
'13.2.2':([17,18],'search',['direct access','hit rate'],'Find 20 in 12,18,25,31. Which is the final record read?',['18','25','31'],1,'In ascending order, 25 > 20 proves that 20 is absent.'),
'13.2.3':([19,20],'hash',['hash','remainder'],'Key127, N10, base1000, size20. Which byte address?',['7','1020','1140'],2,'127 MOD10=7; 1000+7×20=1140 bytes.'),
'13.2.4':([21,22,23],'hash',['collision','linear probing'],'During a search, the hash slot holds a different key. What next?',['Return that record','Follow the same collision rule and compare keys','Overwrite it'],1,'A matching hash is only a starting location; the record key must match.'),
'13.3.1':([24,25],'float',['mantissa','exponent'],'What does a negative exponent do?',['Always makes X negative','Reduces the magnitude','Turns M into an address'],1,'2 to a negative power is positive but smaller than one. M determines the sign.'),
'13.3.2':([26,27,28],'float',['denary',"two’s complement"],'M10110000 / E1110 in M8/E4 represents what?',['-0.15625','0.15625','-2.5'],0,'I=-80, M=-80/128, E=-2, so X=-0.15625.'),
'13.3.3':([29],'encode',['binary fraction','mantissa'],'What is E for normalised -6.5 in M8/E4?',['1101','0011','1111'],1,'The negative sign changes M, not E. The scale remains 2^3.'),
'13.3.4':([30,31,38],'normalise',['normalise','sign bit'],'M is shifted left twice. How must E change?',['Increase by 2','Stay the same','Decrease by 2'],2,'M is multiplied by four; the scale must be divided by four.'),
'13.3.5':([32,33],'limits',['precision','range'],'A fixed 16-bit word changes from M12/E4 to M10/E6. What happens?',['Precision rises, range falls','Precision falls, range rises','Both stay the same'],1,'Two fewer mantissa bits keep less detail. Two more exponent bits widen the range.'),
'13.3.6':([34,35,36],'rounding',['truncate','round'],'Why can a finite binary format not store 0.1 exactly?',['It is negative','Its binary fraction repeats forever','It has a decimal point'],1,'0.1 has an infinite repeating binary expansion. A finite M cannot hold every bit.'),
'13.3.7':([37,39,40],'limits',['overflow','underflow'],'In normalised M8/E4, (1/512)/2 causes which issue?',['Overflow','Underflow','A negative sign'],1,'The non-zero result is smaller than the least positive normalised value.'),
}
GLOSSARY={
'data type':('DAY-tuh type','A rule for values and operations.'),'composite':('kuhm-POZ-it','Made from several parts under one name.'),'enumerated':('ee-NYOO-muh-ray-tid','A type with a list of named values.'),'ordinal':('OR-di-nuhl','Related to a position in an order.'),'record':('REK-ord','A group of related fields.'),'field':('feeld','One named part of a record.'),'pointer':('POYN-tuh','A value that holds an address.'),'dereference':('dee-REF-er-ens','Read the value at a pointed-to address.'),'set':('set','A group of unique items with no order.'),'union':('YOO-nyun','Items in either set.'),'intersection':('in-ter-SEK-shun','Items shared by both sets.'),'class':('klahs','A definition of state and methods.'),'object':('OB-jekt','An instance of a class.'),'method':('METH-ud','An operation defined by a class.'),'serial':('SEER-ee-uhl','Stored in order of arrival.'),'sequential':('sih-KWEN-shul','Following an order; check whether the question means organisation or access.'),'direct access':('dy-REKT AK-ses','Reach a record through a location.'),'hit rate':('hit rayt','The share of records used in a task.'),'hash':('hash','Map a key to a starting location.'),'remainder':('rih-MAYN-duh','What is left after whole-number division.'),'collision':('kuh-LIZH-un','Different keys share a hash location.'),'linear probing':('LIN-ee-uh PROH-bing','Check the next slot until a match or valid stop.'),'mantissa':('man-TIS-uh','The signed value part of this floating-point format.'),'exponent':('ik-SPOH-nent','The power used to scale a value.'),'denary':('DEE-nuh-ree','Base ten.'),'two’s complement':('tooz KOM-pluh-ment','A binary way to represent signed values.'),'binary fraction':('BY-nuh-ree FRAK-shun','A fraction written in base two.'),'normalise':('NOR-muh-lyz','Remove redundant sign bits while keeping the value.'),'sign bit':('syn bit','The bit with a negative weight in two’s complement.'),'precision':('prih-SIZH-un','How much detail a value can keep.'),'range':('raynj','The spread of values a format can represent.'),'truncate':('TRUNG-kayt','Drop extra low bits.'),'round':('rownd','Choose a nearby value using a stated rule.'),'overflow':('OH-ver-floh','A result is outside the large-value limit.'),'underflow':('UN-der-floh','A non-zero result is too close to zero.')}

def assets():
 out=ROOT/'public/visuals';out.mkdir(parents=True,exist_ok=True)
 ET.register_namespace('','http://www.w3.org/2000/svg')
 result=[]
 for n in range(1,67):
  folder='visuals' if n<=40 else 'exam_visuals';p=UNIT/folder/'svg'/f'u13-v{n:02}.svg';tree=ET.parse(p);root=tree.getroot()
  for el in root.iter():
   if el.tag.endswith('}title'):el.text=TITLES[n-1]
   elif el.tag.endswith('}desc'):el.text=f'Figure {n}: {TITLES[n-1]}. A teaching diagram for Chapter 13.'
   elif el.tag.endswith('}text') and el.text in TRANSLATE:el.text=TRANSLATE[el.text]
  if n==25:
   for el in root.iter('{http://www.w3.org/2000/svg}text'):
    if el.text=='binary point':el.set('y','170')
  # Expand the viewbox for translated edge labels, preserving the original geometry.
  x,y,w,h=map(float,root.get('viewBox').split());right=x+w;left=x
  for el in root.iter('{http://www.w3.org/2000/svg}text'):
   s=el.text or '';size=float(el.get('font-size','23'));mono=el.get('font-family')=='Consolas';bold=el.get('font-weight')=='700'
   fn=('consolab.ttf' if bold else 'consola.ttf') if mono else ('segoeuib.ttf' if bold else 'segoeui.ttf')
   width=ImageFont.truetype('C:/Windows/Fonts/'+fn,int(size)).getlength(s);tx=float(el.get('x','0'));anchor=el.get('text-anchor','start')
   lx=tx-width/2 if anchor=='middle' else tx-width if anchor=='end' else tx
   right=max(right,lx+width+22);left=min(left,lx-22)
  root.set('viewBox',f'{left} {y} {right-left} {h}');root.set('width',str(int(right-left)))
  tree.write(out/f'v{n:02}.svg',encoding='utf-8',xml_declaration=False)
  result.append({'id':n,'title':TITLES[n-1],'src':f'/visuals/v{n:02}.svg','width':right-left,'height':h})
 target=ROOT/'public/papers';target.mkdir(exist_ok=True)
 for p in (UNIT/'exam_sources').glob('*.pdf'):shutil.copy2(p,target/p.name)
 return result

def compile_theory():
 text=(ROOT/'data/theory.en.md').read_text(encoding='utf-8');parts=re.split(r'^## (13\.\d\.\d) \| (.+)\n',text,flags=re.M);lessons=[]
 for i in range(1,len(parts),3):
  id,title,body=parts[i:i+3];goal=re.search(r'^Goal: (.+)$',body,re.M).group(1);body=re.sub(r'^Goal: .+\n','',body,flags=re.M)
  imgs,lab,terms,q,options,answer,explain=META[id]
  lessons.append({'id':id,'section':'.'.join(id.split('.')[:2]),'title':title,'goal':goal,'html':markdown.markdown(body,extensions=['tables','fenced_code']),'visuals':imgs,'lab':lab,'terms':terms,'quiz':{'question':q,'options':options,'answer':answer,'explanation':explain},'examRefs':[],'theory':[]})
 return lessons

if __name__=='__main__':
 visuals=assets();lessons=compile_theory()
 exams=json.loads((ROOT/'data/exams.en.json').read_text(encoding='utf-8')) if (ROOT/'data/exams.en.json').exists() else []
 source=(UNIT/'EXAM_PATTERNS.md').read_text(encoding='utf-8')
 ev=json.loads((UNIT/'exam_visuals/visual_manifest.json').read_text(encoding='utf-8'))['visuals']
 for e in exams:
  anchor='exam-'+e['code'].lower();piece=source.split(f'<a id="{anchor}"></a>')[1].split('\n### ')[0].split('\n## ')[0]
  refs=list(dict.fromkeys(re.findall(r'\]\(exam_sources/([^)]*)\)',piece)))
  e.update({'id':'13.4.'+e['code'],'section':'13.4','visuals':[v['number'] for v in ev if v['anchor']==anchor],'terms':e.get('terms',[]),'examRefs':[{'url':'/papers/'+r,'label':r.replace('9618_','').replace('.pdf#page=',' · page ').replace('_',' ').upper()}for r in refs], 'html':markdown.markdown(e.pop('body'),extensions=['tables','fenced_code'])})
  lessons.append(e)
 for lesson in lessons:
  if lesson['id']=='13.4.E01':lesson['visuals'].insert(0,41)
  if lesson['id']=='13.4.E19':lesson['visuals'].append(66)
  for ref in lesson['examRefs']:
   match=re.search(r'9618_([msw])(\d{2})_(qp|ms)_(\d{2})\.pdf#page=(\d+)',ref['url'])
   if match:
    season,year,kind,paper,page=match.groups()
    ref['label']=f"{ {'m':'Feb/Mar','s':'May/June','w':'Oct/Nov'}[season]} 20{year} · Paper {paper} · {kind.upper()} · p. {page}"
 glossary=[{'term':k,'say':v[0],'meaning':v[1]} for k,v in GLOSSARY.items()]
 (ROOT/'data/curriculum.json').write_text(json.dumps({'lessons':lessons,'visuals':visuals,'glossary':glossary},ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'theory':17,'exam_patterns':len(exams),'visuals':66,'pdf_sources':30}))

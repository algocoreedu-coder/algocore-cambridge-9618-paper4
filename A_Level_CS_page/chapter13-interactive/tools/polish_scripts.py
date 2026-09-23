"""Normalize instructor prose without changing numeric examples or bit strings."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
p=root/'data/teacher-scripts.vi.json'
scripts=json.loads(p.read_text(encoding='utf-8'))
pairs='''
Learner.Sau|Learner. Sau
Learner.Bên|Learner. Bên
ThêmE|Thêm E
choM|cho M
VớiM|Với M
củaE|của E
vàStored|và Stored
nhưngserial|nhưng serial
dùnghash|dùng hash
vàappend|và append
vídụ|ví dụ
củaX|của X
binarypoint|binary point
giữgiá trị|giữ giá trị
TìmEmin|Tìm Emin
mẫuM|mẫu M
làoverflow|là overflow
làunderflow|là underflow
nếugiá trị|nếu giá trị
hạnmộtgiá trị|hạn một giá trị
giữnhiềugiá trị|giữ nhiều giá trị
hợpserial|hợp serial
làcollision|là collision
vàoThisRecord|vào ThisRecord
từThisRecord|từ ThisRecord
vàPUTRECORD|và PUTRECORD
nhómfield|nhóm field
mộtfield|một field
bằngquy|bằng quy
theo key|theo key
hayquotient|hay quotient
Làquotient|Là quotient
cùnghash|cùng hash
vào7|vào 7
cóshow|có show
độlớn|độ lớn
bùhai|bù hai
thangđộ|thang độ
đủbit|đủ bit
signbit|sign bit
bitphầnlẻ|bit phần lẻ
bitđầu|bit đầu
làunsigned|là unsigned
dấuâm|dấu âm
haycặp|hay cặp
làraw|là raw
cósẵn|có sẵn
thìEgiảm|thì E giảm
cảhai|cả hai
Eâm|E âm
đãcắt|đã cắt
bốtrí|bố trí
vàđiềuchỉnh|và điều chỉnh
giữgiátrị|giữ giá trị
làmtròn|làm tròn
cònvừa|còn vừa
khichọn|khi chọn
vớiM|với M
mostnegative|most negative
Emin/Emax|Emin/Emax
lớnnhất|lớn nhất
Lớnnhất|Lớn nhất
cóphải|có phải
nếuđềmuốn|nếu đề muốn
exactvalue|exact value
khôngđổi|không đổi
cầnthiết|cần thiết
bốbit|bố bit
thườngmuốn|thường muốn
tácđộng|tác động
vàrange|và range
nênE|nên E
Ítbit|Ít bit
làmgiảm|làm giảm
làmrange|làm range
rộnghơn|rộng hơn
tổngbit|tổng bit
đượcgiữ|được giữ
cốđịnh|cố định
cóđược|có được
tựsuy|tự suy
Egiảm|E giảm
dữkiện|dữ kiện
củađề|của đề
tăngE|tăng E
phầnlẻ|phần lẻ
vôhạn|vô hạn
nhưngMthiếubit|nhưng M thiếu bit
kếtthúc|kết thúc
nhưngM|nhưng M
M8không|M8 không
dùngtruncation|dùng truncation
binaryfraction|binary fraction
chỉra|chỉ ra
bịbỏ|bị bỏ
hoặcchu|hoặc chu
bitthấp|bit thấp
trongmôhình|trong mô hình
Máynào|Máy nào
cóđúng|có đúng
phụthuộc|phụ thuộc
hệthống|hệ thống
vàquy|và quy
nếugiátrị|nếu giá trị
accessionnumber|accession number
phần tử|phần tử
sốbịgiới|số bị giới
vàmột|và một
sốkhác|số khác
hạnmộtgiátrị|hạn một giá trị
giữnhiềugiátrị|giữ nhiều giá trị
chỉsố|chỉ số
vàoSET|vào SET
làcâu|là câu
chochương|cho chương
sangclass|sang class
ởrecord|ở record
đặtPRIVATE|đặt PRIVATE
mãngoài|mã ngoài
dùngGetName|dùng GetName
Viếtmột|Viết một
nếuđề|nếu đề
mộtdòng|một dòng
mãhóa|mã hóa
hạnchế|hạn chế
cảclass|cả class
màquên|mà quên
vìsao|vì sao
cầnmethod|cần method
mởRANDOM|mở RANDOM
vàđóngfile|và đóng file
cóhướng|có hướng
đọcfile|đọc file
ghitừbiến|ghi từ biến
recordvariable|record variable
Storedflag|Stored flag
làcâu|là câu
tìmchỗtrống|tìm chỗ trống
khiđúng|khi đúng
cóđiểm|có điểm
Khôngghi|Không ghi
môtả|mô tả
nguồnkhông|nguồn không
thốngnhất|thống nhất
trảrecord|trả record
ởslot|ở slot
vàretrieval|và retrieval
storing và|storing và
chiahai|chia hai
traindex|tra index
tựnhân|tự nhân
recordsize|record size
chỉhỏi|chỉ hỏi
vàbyte|và byte
vẫn3|vẫn 3
dịchM|dịch M
tăngE|tăng E
trongrange|trong range
khichọn|khi chọn
máynào|máy nào
khiunderflow|khi underflow
M8|M8
I làgiátrị|I là giá trị
không phảitrường|không phải trường
M8 có7|M8 có 7
vịtrí|vị trí
thìarray|thì array
bằng0|bằng 0
thìdò|thì dò
trước và|trước và
chođề|cho đề
hayquotient|hay quotient
vísố|vì số
vímỗi|vì mỗi
cóthể|có thể
giảmE|giảm E
giữE|giữ E
làhash|là hash
haycâu|hay câu
e.g.|e.g.
'''
replacements=[line.split('|') for line in pairs.strip().splitlines()]
for script in scripts.values():
 for key,text in script.items():
  for a,b in sorted(replacements,key=lambda x:-len(x[0])):text=text.replace(a,b)
  # Space prose beside numbers, but preserve codes, M/E field notation and decimals.
  text=text.replace('0x 0200','0x0200')
  text=re.sub(r'(?<=[0-9])(?=[a-zà-ỹ])',' ',text)
  text=re.sub(r'([,;:!?])(?=[A-Za-zÀ-ỹ])',r'\1 ',text)
  text=re.sub(r'(?<=[a-zà-ỹ])\.(?=[A-ZÀ-Ỹ])','. ',text)
  # Keep dotted field and method identifiers intact.
  text=re.sub(r'\b(Learner|ClassList\[2\]|TStudent|TLearner|CounterA|CounterB)\. +(ID|FullName|Status|GetValue|Increment)\b',r'\1.\2',text)
  script[key]=text
p.write_text(json.dumps(scripts,ensure_ascii=False,indent=2),encoding='utf-8')
print('Polished 39 teaching scripts')

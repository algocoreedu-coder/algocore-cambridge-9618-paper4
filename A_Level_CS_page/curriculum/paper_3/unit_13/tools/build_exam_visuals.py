"""Original exam-method diagrams extending the existing SVG library, not slide images."""
from pathlib import Path
import importlib.util, json, re

UNIT=Path(__file__).resolve().parents[1]
ROOT=UNIT/'exam_visuals'
spec=importlib.util.spec_from_file_location('diagram_library',UNIT/'visuals/tools/build_visuals.py')
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
lib.ROOT=ROOT
class Diagram(lib.Diagram):
    def arrow(self,x1,y1,x2,y2,color=lib.TEAL,via=None,label=None):
        # Keep vertical connector strokes out of text glyphs.
        vertical=abs(x1-x2)<1 and not via
        super().arrow(x1,y1,x2,y2,color=color,via=via,label=None if vertical else label)
        if vertical and label:self.text(x1+20,(y1+y2)/2+7,label,size=20,color=color)
NAVY,TEAL,ORANGE,RED,MUTED,LINE,PALE,BLUE,WARM,ROSE,WHITE=[getattr(lib,s) for s in ['NAVY','TEAL','ORANGE','RED','MUTED','LINE','PALE','BLUE','WARM','ROSE','WHITE']]

def label(d,x,y,s,color=TEAL):d.text(x,y,s,21,color,bold=True)
def cross(d,x,y):d.line(x-8,y-8,x+8,y+8,RED,3);d.line(x-8,y+8,x+8,y-8,RED,3)

def v41():
    d=Diagram(41)
    # Annotated wording; no title, paragraphs or slide frame inside the asset.
    for x,s,w,col in [(0,'Calculate',160,TEAL),(180,'denary value',240,ORANGE),(440,'M: 8 bits / E: 4 bits',340,NAVY)]:
        d.node(x,0,s,w,fill=WHITE,color=col)
    for x,s,sub,col in [(80,'THAO TÁC','tính + working',TEAL),(300,'ĐẦU RA','một giá trị denary',ORANGE),(610,'RÀNG BUỘC','bù hai M và E',NAVY)]:
        d.arrow(x,68,x,135,color=col);d.text(x,178,s,20,col,True,anchor='middle');d.text(x,215,sub,21,anchor='middle')
    d.node(165,292,'M → E → X = M × 2^E',460,mono=True)
    d.arrow(300,233,300,285)
    return d

def v42():
    d=Diagram(42)
    d.node(0,15,'TStatus',230);d.node(0,145,'Active',230,fill=WHITE)
    d.arrow(115,82,115,137);d.text(115,250,'Một giá trị enum',22,anchor='middle')
    d.record(395,15,'TLearner',[('ID','STRING'),('Lessons','INTEGER'),('Status','TStatus')],380)
    d.line(360,0,360,275,dash=True)
    d.text(585,250,'Các field dưới một tên',22,anchor='middle')
    label(d,0,320,'NON-COMPOSITE');label(d,395,320,'COMPOSITE')
    return d

def v43():
    d=Diagram(43)
    d.text(0,0,'TYPE TStatus = (Active, Paused, Completed)',25,mono=True)
    for i,(s,pos) in enumerate([('Active','1st'),('Paused','2nd'),('Completed','3rd')]):
        x=i*240;d.node(x,70,s,210);d.text(x+105,55,pos,21,MUTED,mono=True,anchor='middle')
        if i<2:d.arrow(x+213,100,x+233,100)
    d.node(230,255,'Status : TStatus',290,fill=WHITE,mono=True)
    d.arrow(345,133,345,245,label='chọn một')
    d.text(0,377,'Status ← Paused',24,TEAL,mono=True)
    d.text(465,377,'Status ← "Paused"',24,RED,mono=True);cross(d,437,369)
    return d

def v44():
    d=Diagram(44)
    d.record(0,0,'TLearner',[('Name','STRING'),('Status','STRING'),('Phone','STRING')],310,highlight='Status')
    d.arrow(319,111,410,111)
    d.node(422,76,'Active | Paused | Completed',470,mono=True,size=22)
    d.text(425,182,'Miền lựa chọn hữu hạn',22,TEAL)
    d.arrow(660,195,660,255)
    d.text(355,300,'DECLARE Status : TStatus',25,mono=True,bold=True)
    d.text(0,375,'Name / Phone',22,MUTED,mono=True)
    d.text(0,411,'Không suy ra enum từ vài dòng dữ liệu mẫu',21,MUTED)
    return d

def v45():
    d=Diagram(45)
    fields=[('ID: AC027','ID : STRING'),('StartDate: ngày','StartDate : DATE'),('Lessons: số đếm','Lessons : INTEGER'),('Status: một lựa chọn','Status : TStatus')]
    d.text(425,0,'TYPE TLearner',25,TEAL,True,True)
    for i,(source,target) in enumerate(fields):
        y=68+i*59;d.text(0,y,source,22,mono=True);d.arrow(300,y-8,399,y-8)
        d.text(425,y,'DECLARE '+target,22,mono=True)
    d.text(425,326,'ENDTYPE',25,TEAL,True,True)
    d.line(408,21,408,298,TEAL,3)
    d.text(0,325,'Yêu cầu field',21,MUTED);d.text(0,364,'→ kiểu phù hợp',21,MUTED)
    return d

def v46():
    d=Diagram(46)
    d.node(0,0,'TLearner',255);d.node(365,0,'Learner : TLearner',365,mono=True)
    d.arrow(262,30,355,30,label='DECLARE')
    d.record(365,155,'Learner',[('ID','"AC027"'),('Lessons','8'),('Status','Active')],365,highlight='Status')
    d.arrow(548,70,548,145)
    d.text(0,410,'Learner.Status ← Active',27,mono=True)
    d.line(0,426,112,426,TEAL,4);d.line(130,426,228,426,ORANGE,4)
    d.text(0,462,'biến',21,TEAL);d.text(130,462,'field',21,ORANGE)
    d.text(415,440,'TLearner.Status',24,RED,mono=True);cross(d,385,431)
    return d

def v47():
    d=Diagram(47)
    d.text(0,0,'TYPE TIntPointer = ^INTEGER',25,mono=True)
    d.node(0,87,'P : TIntPointer',310,mono=True)
    d.node(0,197,'0x0200',310,mono=True,fill=WHITE)
    d.arrow(155,151,155,187)
    d.record(585,85,'Score : INTEGER',[('value','42')],310)
    d.text(590,233,'address: 0x0200',23,MUTED,mono=True)
    d.arrow(320,224,575,146,via=[(440,224),(440,146)])
    d.text(0,330,'P ← ^Score',26,TEAL,mono=True)
    d.text(585,330,'P^ → 42',26,ORANGE,mono=True)
    d.text(0,382,'lấy địa chỉ',21,TEAL);d.text(585,382,'đọc tại địa chỉ',21,ORANGE)
    return d

def v48():
    d=Diagram(48)
    d.text(0,0,'TYPE TUnitSet = SET OF INTEGER',24,mono=True)
    d.text(0,44,'DEFINE Completed (1, 3, 5) : TUnitSet',24,mono=True)
    d.circle(150,215,103,PALE,TEAL)
    for x,y,s in [(100,200,'1'),(191,194,'3'),(142,264,'5')]:d.text(x,y,s,31,TEAL,True,True,anchor='middle')
    d.node(390,184,'3',85,fill=WARM,color=ORANGE,mono=True)
    d.arrow(380,214,263,214,color=ORANGE,label='đã có')
    d.text(392,299,'{1, 3, 5}',27,mono=True)
    d.text(0,391,'SET: nhiều phần tử cùng tồn tại',22,TEAL)
    d.text(0,435,'ENUM: một giá trị tại một thời điểm',22,MUTED)
    return d

def v49():
    d=Diagram(49)
    for y,lab,before,after in [(0,'SERIAL',[31,12,25],[31,12,25,18]),(190,'SEQUENTIAL',[12,25,31],[12,18,25,31])]:
        label(d,0,y,lab);d.slots(0,y+40,before,75,indices=False)
        d.arrow(242,y+68,339,y+68,label='+18')
        d.slots(358,y+40,after,75,indices=False,selected=[3 if y==0 else 1])
    d.text(695,78,'append',24,ORANGE)
    d.text(695,268,'theo key',24,ORANGE)
    d.node(0,390,'RANDOM: key → hash → slot',510,mono=True)
    d.arrow(520,420,620,420)
    d.slots(636,393,['—',18,'—'],65,selected=[1])
    return d

def v50():
    d=Diagram(50)
    d.text(0,0,'Tìm key = 20',26,bold=True)
    for y,title,values,stop in [(70,'SEQUENTIAL ↑',[12,18,25,31],2),(300,'SERIAL',[31,12,25,18],3)]:
        label(d,0,y,title);d.slots(0,y+30,values,115,indices=False,selected=[stop])
        for i in range(stop):d.arrow(i*115+57,y+101,(i+1)*115+57,y+101)
        d.text(520,y+65,'25 > 20 → dừng' if stop==2 else 'hết tệp → dừng',23,ORANGE)
        d.text(0,y+159,'Không cần đọc 31' if stop==2 else 'Phải đọc cả bốn record',21,MUTED)
    return d

def v51():
    d=Diagram(51)
    label(d,0,0,'SEQUENTIAL + INDEX')
    d.node(0,45,'key 25',165,mono=True)
    d.record(290,25,'INDEX',[('12','0x1000'),('25','0x1040'),('31','0x1080')],280,highlight='25')
    d.arrow(173,75,280,75);d.node(710,75,'record 25',210,mono=True);d.arrow(580,134,700,105)
    label(d,0,307,'RANDOM + HASH')
    for x,s,w in [(0,'key 25',165),(280,'25 MOD 7 = 4',285),(710,'slot 4',210)]:d.node(x,354,s,w,mono=True)
    d.arrow(175,384,270,384);d.arrow(575,384,700,384)
    d.text(710,465,'so key',23,ORANGE,bold=True)
    d.arrow(815,423,815,440)
    return d

def v52():
    d=Diagram(52)
    d.text(0,0,'Key = 1030   |   N = 3',27,mono=True)
    d.text(0,74,'1030 = 343 × 3 + 1',32,mono=True)
    rx=lib.measure('1030 = 343 × 3 + ',32,True);rw=lib.measure('1',32,True)
    d.line(rx,91,rx+rw,91,ORANGE,4)
    d.arrow(rx+rw/2,108,rx+rw/2,175,color=ORANGE)
    d.node(rx+rw/2-127,188,'Slot = 1',255,mono=True,color=ORANGE,fill=WARM)
    d.slots(0,320,[0,1,2],145,indices=False,selected=[1])
    for i,s in enumerate(['4096','4160','4224']):d.text(i*145+72,422,s,24,mono=True,anchor='middle')
    d.text(495,351,'4096 + 1 × 64',25,mono=True)
    d.text(495,407,'= 4160 bytes',28,ORANGE,True,True)
    d.text(0,489,'Ví dụ địa chỉ: base 4096, record 64 bytes, slot từ 0',21,MUTED)
    return d

def v53():
    d=Diagram(53)
    d.text(0,0,'27 MOD 10 = 7   |   37 MOD 10 = 7',25,mono=True)
    for y,title,values in [(65,'LƯU 37',[27,'—','—']),(295,'TÌM 37',[27,37,'—'])]:
        label(d,0,y,title)
        d.slots(0,y+30,values,120,indices=False,selected=[1])
        for i,s in enumerate([7,8,9]):d.text(i*120+60,y+118,s,20,MUTED,mono=True,anchor='middle')
        d.arrow(60,y+139,180,y+139)
        d.text(420,y+61,'7 đã có 27 → thử 8' if y==65 else '7: 27 ≠ 37 → thử 8',23)
        d.text(420,y+109,'8 trống → lưu 37' if y==65 else '8: 37 = 37 → tìm thấy',23,TEAL,bold=True)
    return d

def v54():
    d=Diagram(54)
    d.text(0,0,'-6.5   |   M: 8 bits, E: 4 bits',26,mono=True)
    d.text(0,75,'6.5 = 110.1₂ = 0.1101₂ × 2^3',27,mono=True)
    d.bits(0,151,'01101000','M của +6.5',point=True)
    d.arrow(172,209,172,299,label='bù hai')
    d.floatrow(0,330,'10011000','0011')
    d.text(0,465,'(-104/128) × 2^3 = -6.5',26,mono=True,color=TEAL)
    d.text(475,250,'E vẫn +3',23,ORANGE,bold=True)
    return d

def v55():
    d=Diagram(55)
    d.floatrow(0,60,'11000000','0000')
    d.text(610,92,'-0.5, chưa chuẩn hóa',23,ORANGE)
    d.arrow(170,124,170,215,label='M dịch trái 1')
    d.arrow(470,124,470,215,color=ORANGE,label='E giảm 1')
    d.floatrow(0,250,'10000000','1111')
    d.text(610,282,'-1 × 2^-1 = -0.5',23,TEAL,mono=True)
    d.text(0,390,'11… → 10…',29,TEAL,True,True)
    d.text(270,390,'Bù hai xong vẫn phải kiểm tra chuẩn hóa',21,MUTED)
    return d

def v56():
    d=Diagram(56)
    d.floatrow(0,60,'10110000','1110',weights=True)
    d.text(0,233,'I = -128 + 32 + 16 = -80',25,mono=True)
    d.text(0,295,'M = -80/128',25,TEAL,mono=True)
    d.text(390,233,'E = -8 + 4 + 2 = -2',24,ORANGE,mono=True)
    d.arrow(175,320,175,390);d.arrow(520,252,520,390,color=ORANGE)
    d.text(0,444,'X = (-80/128) × 2^-2 = -0.15625',27,mono=True,bold=True)
    return d

def v57():
    d=Diagram(57)
    d.floatrow(0,60,'00011000','0100')
    d.text(625,94,'(24/128) × 16 = 3',24,mono=True)
    d.arrow(170,128,170,235,label='M << 2')
    d.arrow(470,128,470,235,color=ORANGE,label='E − 2')
    d.floatrow(0,275,'01100000','0010')
    d.text(625,309,'(96/128) × 4 = 3',24,mono=True)
    d.text(0,418,'Giá trị giữ nguyên; hai bit đầu M: 01',23,TEAL)
    return d

def v58():
    d=Diagram(58)
    d.text(0,0,'0.00011₂',38,mono=True,bold=True)
    d.arrow(220,-10,410,-10,label='× 2^3')
    d.text(430,0,'0.11₂',38,mono=True,bold=True)
    d.text(0,114,'0.00011₂ = 0.11₂ × 2^-3',29,mono=True)
    d.floatrow(0,214,'01100000','1101')
    d.text(0,365,'(96/128) × 2^-3 = 3/32',26,TEAL,mono=True)
    d.text(0,418,'M: 8 bits / E: 4 bits; E = -3',22,MUTED)
    return d

def v59():
    d=Diagram(59)
    rows=[('Âm nhỏ nhất','10000000','0111','-128'),('Âm gần 0 nhất','10111111','1000','-65/32768'),('Dương gần 0 nhất','01000000','1000','1/512'),('Dương lớn nhất','01111111','0111','127')]
    for i,(title,m,e,value) in enumerate(rows):
        y=45+i*155;d.text(0,y+28,title,22,bold=True);d.floatrow(260,y,m,e);d.text(900,y+29,value,25,TEAL,mono=True)
    d.text(0,668,'M8/E4 chuẩn hóa: Emin = -8, Emax = 7',23,MUTED)
    return d

def v60():
    d=Diagram(60)
    for y,m,e in [(0,12,4),(195,10,6)]:
        for i in range(16):d.rect(i*46,y+40,46,52,PALE if i<m else WARM,TEAL if i<m else ORANGE,r=0)
        d.text(m*23,y+25,f'M: {m} bits',23,TEAL,True,anchor='middle')
        d.text(m*46+e*23,y+25,f'E: {e}',22,ORANGE,True,anchor='middle')
    d.arrow(270,104,270,185,label='M − 2');d.arrow(650,104,650,185,color=ORANGE,label='E + 2')
    d.text(0,360,'ít bit có ý nghĩa hơn',24,TEAL);d.text(0,405,'→ precision giảm',24,TEAL,bold=True)
    d.text(470,360,'E: [-8, 7] → [-32, 31]',24,ORANGE,mono=True)
    d.text(470,405,'→ range tăng',24,ORANGE,bold=True)
    return d

def v61():
    d=Diagram(61)
    d.text(0,0,'113.75 = 0.111000111₂ × 2^7',28,mono=True)
    d.bits(0,86,'01110001','giữ 8 bit',point=True)
    d.bits(365,86,'11','bỏ 2 bit',color=ORANGE)
    d.line(354,57,354,150,RED,3,True)
    d.arrow(155,162,155,255);d.arrow(408,162,655,255,color=ORANGE)
    d.bits(0,315,'01110001','TRUNCATE');d.bits(520,315,'01110010','ROUND TO NEAREST',color=ORANGE)
    d.text(0,432,'113',31,TEAL,True,True);d.text(520,432,'114',31,ORANGE,True,True)
    d.text(0,505,'E = 00000111 trong cả hai nhánh (M8/E8)',23,MUTED)
    return d

def v62():
    d=Diagram(62)
    # Discontinuous positive axis: no suggestion that all interior real values are representable.
    d.line(0,170,355,170,TEAL,4);d.line(405,170,775,170,TEAL,4)
    d.line(362,160,375,180,NAVY,3);d.line(382,160,395,180,NAVY,3)
    for x,s,col in [(0,'0',NAVY),(190,'1/512',TEAL),(615,'127',TEAL),(775,'200',RED)]:
        d.line(x,160,x,182,col,3);d.text(x,223,s,24,col,mono=True,anchor='middle')
    d.circle(92,170,7,ORANGE,ORANGE)
    d.text(20,63,'1/1024',25,ORANGE,mono=True);d.arrow(92,80,92,149,color=ORANGE)
    d.text(0,297,'UNDERFLOW',24,ORANGE,True)
    d.text(0,345,'(1/512) ÷ 2',23,mono=True)
    d.text(570,63,'100 × 2',25,RED,mono=True);d.arrow(672,80,775,149,color=RED)
    d.text(570,297,'OVERFLOW',24,RED,True)
    d.text(0,435,'Phía dương của M8/E4 chuẩn hóa • trục ngắt, không theo tỉ lệ',21,MUTED)
    return d

def v63():
    d=Diagram(63)
    d.text(0,0,'DECLARE NumberOfCopies : 1 .. 10',25,mono=True)
    d.line(30,99,580,99,TEAL,3)
    for i in range(10):
        x=30+i*61;d.line(x,90,x,108,TEAL);d.text(x,145,i+1,20,mono=True,anchor='middle')
    d.circle(152,99,8,ORANGE,ORANGE)
    d.text(660,111,'một giá trị: 3',23,ORANGE)
    d.arrow(152,164,152,260)
    d.text(0,315,'ARRAY[1:NumberOfCopies] OF INTEGER',25,mono=True)
    d.slots(0,354,[501,502,503],135,indices=False)
    for i in range(3):d.text(i*135+67,456,f'[{i+1}]',20,MUTED,mono=True,anchor='middle')
    d.text(490,394,'ba phần tử',24,TEAL)
    return d

def v64():
    d=Diagram(64)
    d.rect(350,0,570,385,WHITE,TEAL)
    d.text(380,46,'CLASS TLearner',25,TEAL,True,True)
    d.node(435,112,'PRIVATE Name : STRING',400,mono=True,fill=WARM,color=ORANGE)
    d.node(435,273,'GetName() / SetName()',400,mono=True)
    d.node(0,130,'Mã bên ngoài',255)
    d.arrow(263,159,420,141,color=RED);cross(d,340,150)
    d.arrow(130,199,425,303,via=[(130,303)])
    d.arrow(630,265,630,184)
    d.text(0,430,'truy cập qua method',23,TEAL)
    return d

def v65():
    d=Diagram(65)
    d.record(0,0,'SourceFile',[('record 1','...'),('record i','data'),('record 50','...')],275,highlight='record i')
    d.record(675,0,'TargetFile',[('record 1','...'),('record i','data'),('record 50','...')],275,highlight='record i')
    d.node(340,234,'ThisRecord',270,mono=True)
    d.arrow(137,198,330,264,via=[(137,264)])
    d.arrow(619,264,812,198,via=[(812,264)])
    d.text(0,365,'SEEK SourceFile, i',22,mono=True)
    d.text(0,409,'GETRECORD → ThisRecord',22,TEAL,mono=True)
    d.text(545,365,'SEEK TargetFile, i',22,mono=True)
    d.text(545,409,'PUTRECORD ← ThisRecord',22,ORANGE,mono=True)
    d.line(137,435,812,435,LINE,2,True)
    d.text(475,484,'i = 1 … 50',25,mono=True,anchor='middle')
    return d

def v66():
    d=Diagram(66)
    d.floatrow(80,100,'10011000','0011')
    d.text(80,0,'8 bit M',22,TEAL);d.text(470,0,'4 bit E',22,ORANGE)
    d.arrow(165,12,165,65);d.arrow(540,12,540,65,color=ORANGE)
    d.text(80,220,'10…: chuẩn hóa',22,TEAL)
    d.arrow(115,158,115,185)
    d.text(470,220,'0011 = +3',22,ORANGE,mono=True)
    d.arrow(545,158,545,185,color=ORANGE)
    d.text(80,339,'(-104/128) × 8 = -6.5',27,mono=True)
    d.arrow(370,352,370,412)
    d.node(135,430,'khớp số ban đầu: -6.5',470)
    return d

# IDs continue the established Chapter 13 library; all assets are original examples.
SPECS=[
 (41,'exam-start','Nhận diện thao tác, đầu ra và ràng buộc','Tách Calculate / denary value / M8-E4 và nối tới thứ tự giải mã.'),
 (42,'exam-e01','Một giá trị và một cấu trúc nhiều field','Đối chiếu biến enum với record chứa các field dưới một tên.'),
 (43,'exam-e02','Enum: thứ tự khai báo và chọn một giá trị','Ba giá trị enum trên một dãy; chọn Paused, phân biệt Paused với chuỗi "Paused".'),
 (44,'exam-e03','Chọn field có miền enum phù hợp','Field Status được đối chiếu với miền lựa chọn hữu hạn rồi đổi sang TStatus.'),
 (45,'exam-e04','Từ yêu cầu field tới khai báo record','Bốn field nối tới bốn khai báo kiểu bên trong TYPE/ENDTYPE.'),
 (46,'exam-e05','Tên kiểu, biến record và đích gán','TLearner tạo biến Learner; Learner.Status là field nhận giá trị.'),
 (47,'exam-e06','Pointer: địa chỉ và giá trị tại địa chỉ','P lưu địa chỉ Score; ^Score lấy địa chỉ, P^ đọc giá trị 42.'),
 (48,'exam-e07','SET: phần tử không lặp','Thêm 3 vào tập {1,3,5} không tăng số phần tử; nối với TYPE và DEFINE.'),
 (49,'exam-e08','Chèn cùng key vào ba organisation','Key 18 được append, chèn theo thứ tự hoặc đặt vào slot từ hash.'),
 (50,'exam-e09','Điểm dừng khi tìm tuần tự','Tìm 20 trong sequential tăng dần dừng ở 25; serial phải tới cuối.'),
 (51,'exam-e10','Hai đường direct access','Sequential có index tra key–địa chỉ; random tính hash rồi so key.'),
 (52,'exam-e11','MOD, slot và địa chỉ byte','1030 MOD 3 = 1; slot 1 tại base 4096 + 64 = 4160 bytes trong ví dụ riêng.'),
 (53,'exam-e12','Collision: cùng đường dò khi lưu và tìm','27 và 37 hash vào 7; lưu 37 tại 8, tìm phải so key tại 7 rồi 8.'),
 (54,'exam-e13','Working khi mã hóa số âm','Đổi 6.5 sang binary, bù hai mantissa để mã hóa -6.5; exponent vẫn +3.'),
 (55,'exam-e13','Bẫy -0.5 sau khi bù hai','11000000/0000 và 10000000/1111 bằng nhau; chỉ cặp thứ hai chuẩn hóa.'),
 (56,'exam-e14','Giải mã M và E theo trọng số','10110000/1110 cho I=-80 và E=-2; kết quả -0.15625.'),
 (57,'exam-e15','Chuẩn hóa cặp M/E đã cho','00011000/0100 dịch mantissa trái 2 và giảm exponent 2 thành 01100000/0010.'),
 (58,'exam-e15','Chuẩn hóa binary nhỏ hơn 1','0.00011₂ = 0.11₂ × 2^-3; không đảo nhầm dấu exponent.'),
 (59,'exam-e16','Chọn bit cho bốn giới hạn','Bốn cặp M8/E4 chuẩn hóa và giá trị; phân biệt âm nhỏ nhất với âm gần 0.'),
 (60,'exam-e17','Phân bổ lại 16 bit','M12/E4 thành M10/E6; giảm precision nhưng mở rộng miền exponent.'),
 (61,'exam-e18','Truncation và rounding cho kết quả khác','113.75 có phần mantissa dư 11; M8 giữ 113 khi cắt, 114 khi làm tròn gần nhất.'),
 (62,'exam-e19','Overflow và underflow trên trục ngắt','Biên dương M8/E4: 1/512 và 127; 1/1024 quá gần 0, 200 quá lớn.'),
 (63,'exam-x01','Subrange khác array field','Một số bản sao trong 1..10 quyết định số phần tử của array mã con.'),
 (64,'exam-x02','PRIVATE và đường truy cập qua method','Mã ngoài không truy cập trực tiếp Name; dùng GetName/SetName trong class.'),
 (65,'exam-x03','Luồng đọc và ghi random file','SourceFile → GETRECORD → ThisRecord → PUTRECORD → TargetFile; SEEK trên đúng file.'),
 (66,'exam-review','Đọc ngược để kiểm tra đáp án','Kiểm tra 8/4 bit, chuẩn hóa 10, exponent +3, rồi đọc ngược ra -6.5.'),
]

if __name__=='__main__':
    for folder in ['svg','png','qa']: (ROOT/folder).mkdir(parents=True,exist_ok=True)
    source=(UNIT/'EXAM_PATTERNS.md').read_text(encoding='utf-8')
    entries=[];layout=[]
    for n,anchor,title,description in SPECS:
        if anchor.startswith(('exam-e','exam-x')):
            segment=source.split(f'<a id="{anchor}"></a>')[1].split('\n### ')[0].split('\n## ')[0]
        else:segment=''
        references=list(dict.fromkeys(re.findall(r'\]\((exam_sources/[^)]+)\)',segment)))
        theory=list(dict.fromkeys(re.findall(r'\]\((STUDENT_GUIDE.md#[^)]+)\)',segment)))
        entry={'id':f'U13-V{n}','number':n,'section':'13.4','anchor':anchor,'title':title,'visual_content':description,'asset_kind':'standalone_diagram','background':'transparent','svg':f'svg/u13-v{n}.svg','png':f'png/u13-v{n}.png','theory_links':theory,'exam_references':references,'source_note':'Original diagram; new teaching example where stated. QP/MS links identify the related question type, not the source of every example number.'}
        result=globals()[f'v{n}']().save(entry)
        entry.update({'svg_width':result['width'],'svg_height':result['height'],'png_width':result['width']*2,'png_height':result['height']*2})
        layout.append(result);entries.append(entry)
    manifest={'chapter':13,'section':'13.4','visual_count':len(entries),'method':'Deterministic SVG extending the existing repository diagram library; PNG rendered at 2x.','visuals':entries}
    (ROOT/'visual_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    (ROOT/'qa/layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'new_svg':len(entries),'first':'U13-V41','last':'U13-V66'}))

"""Deterministic, tightly bounded teaching diagrams. No slide chrome."""
from pathlib import Path
from html import escape
from fractions import Fraction
from PIL import ImageFont
import json, math

ROOT=Path(__file__).resolve().parents[1]
NAVY='#18364B'; TEAL='#007F83'; ORANGE='#B85B16'; RED='#BA3849'
MUTED='#586F7B'; LINE='#9BAEB7'; PALE='#EAF5F4'; BLUE='#EDF3F8'
WARM='#FFF1E2'; ROSE='#FCECEF'; WHITE='#FFFFFF'
FONT='Segoe UI'; MONO='Consolas'
FONTS={}
def measure(s,size=23,mono=False,bold=False):
    key=(size,mono,bold)
    if key not in FONTS:
        name=('consolab.ttf' if bold else 'consola.ttf') if mono else ('segoeuib.ttf' if bold else 'segoeui.ttf')
        FONTS[key]=ImageFont.truetype('C:/Windows/Fonts/'+name,size)
    return FONTS[key].getlength(str(s))

class Diagram:
    def __init__(self,n):
        self.n=n;self.parts=[];self.bounds=[];self.labels=[];self.float_pairs=[]
    def bound(self,x,y,w,h):self.bounds.append((x,y,x+w,y+h))
    def rect(self,x,y,w,h,fill=WHITE,stroke=LINE,r=9,sw=2):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
        self.bound(x-sw,y-sw,w+2*sw,h+2*sw)
    def text(self,x,y,s,size=23,color=NAVY,bold=False,mono=False,anchor='start'):
        s=str(s);width=measure(s,size,mono,bold);xx=x if anchor=='start' else x-width/2 if anchor=='middle' else x-width
        self.parts.append(f'<text x="{x}" y="{y}" font-family="{MONO if mono else FONT}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}" text-anchor="{anchor}">{escape(s)}</text>')
        self.bound(xx,y-size-3,width,size+10);self.labels.append({'text':s,'x':xx,'y':y-size,'width':width,'size':size})
    def lines(self,x,y,lines,size=23,gap=33,**kw):
        for i,t in enumerate(lines):self.text(x,y+i*gap,t,size=size,**kw)
    def line(self,x1,y1,x2,y2,color=LINE,sw=2,dash=False):
        self.parts.append(f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{color}" stroke-width="{sw}"'+(' stroke-dasharray="7 6"' if dash else '')+'/>')
        self.bound(min(x1,x2)-sw,min(y1,y2)-sw,abs(x2-x1)+2*sw,abs(y2-y1)+2*sw)
    def arrow(self,x1,y1,x2,y2,color=TEAL,via=None,label=None):
        pts=[(x1,y1)]+(via or [])+[(x2,y2)]
        path='M'+' L'.join(f'{x},{y}' for x,y in pts)
        self.parts.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="2.5" stroke-linejoin="round"/>')
        a,b=pts[-2],pts[-1];ang=math.atan2(b[1]-a[1],b[0]-a[0]);v=[]
        for theta in [ang+2.7,ang-2.7]:v.append((b[0]+12*math.cos(theta),b[1]+12*math.sin(theta)))
        self.parts.append(f'<polygon points="{b[0]},{b[1]} {v[0][0]},{v[0][1]} {v[1][0]},{v[1][1]}" fill="{color}"/>')
        for x,y in pts:self.bound(x-13,y-13,26,26)
        if label:self.text((x1+x2)/2,(y1+y2)/2-12,label,size=20,color=color,anchor='middle')
    def node(self,x,y,label,w=None,h=60,fill=PALE,color=TEAL,size=23,mono=False):
        w=w or max(100,measure(label,size,mono,True)+36)
        self.rect(x,y,w,h,fill,color)
        self.text(x+w/2,y+h/2+size*.34,label,size,color,bold=True,mono=mono,anchor='middle')
        return w
    def circle(self,x,y,r,fill=PALE,stroke=TEAL):
        self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>');self.bound(x-r-2,y-r-2,2*r+4,2*r+4)
    def record(self,x,y,name,fields,w=360,highlight=None):
        self.rect(x,y,w,48+len(fields)*43,WHITE,TEAL)
        self.rect(x,y,w,48,PALE,TEAL)
        self.text(x+16,y+32,name,bold=True,mono=True)
        for i,(field,value) in enumerate(fields):
            yy=y+48+i*43
            if field==highlight:self.rect(x+2,yy+1,w-4,41,WARM,'none',r=0)
            if i:self.line(x,yy,x+w,yy)
            self.text(x+14,yy+29,field,size=20,mono=True)
            self.text(x+w-14,yy+29,value,size=20,mono=True,anchor='end',color=TEAL)
        return 48+len(fields)*43
    def slots(self,x,y,values,cell=76,h=55,selected=(),indices=True,label=None):
        if label:self.text(x,y-32,label,size=21,bold=True)
        for i,value in enumerate(values):
            col=ORANGE if i in selected else TEAL
            self.rect(x+i*cell,y,cell,h,WARM if i in selected else (WHITE if value in [None,'·','—'] else PALE),col if i in selected else LINE,r=2)
            self.text(x+(i+.5)*cell,y+h/2+9,'—' if value is None else value,size=25,mono=True,anchor='middle',color=col,bold=True)
            if indices:self.text(x+(i+.5)*cell,y+h+27,i,size=18,color=MUTED,mono=True,anchor='middle')
    def bits(self,x,y,bits,label=None,cell=43,selected=(),weights=None,color=TEAL,point=False):
        if label:self.text(x,y-17,label,size=21,color=color,bold=True)
        for i,b in enumerate(bits):
            hi=i in selected
            self.rect(x+i*cell,y,cell,49,WARM if hi else PALE,ORANGE if hi else color,r=0)
            self.text(x+(i+.5)*cell,y+34,b,25,ORANGE if hi else NAVY,bold=True,mono=True,anchor='middle')
            if weights:
                cx=x+(i+.5)*cell; weight=weights[i]; wc=RED if i==0 else MUTED
                if '/' in weight:
                    numerator,denominator=weight.split('/')
                    self.text(cx,y+70,numerator,size=16,mono=True,anchor='middle',color=wc)
                    self.line(cx-16,y+76,cx+16,y+76,color=wc,sw=1)
                    self.text(cx,y+95,denominator,size=16,mono=True,anchor='middle',color=wc)
                else:self.text(cx,y+84,weight,size=18,mono=True,anchor='middle',color=wc)
        if point:
            self.circle(x+cell,y+49,4,ORANGE,ORANGE)
    def floatrow(self,x,y,m,e,label=None,weights=False):
        self.float_pairs.append({'mantissa':m,'exponent':e})
        if label:self.text(x,y-43,label,size=24,bold=True)
        self.bits(x,y,m,'M',weights=['-1','1/2','1/4','1/8','1/16','1/32','1/64','1/128'] if weights else None,point=True)
        self.bits(x+len(m)*43+46,y,e,'E',color=ORANGE,weights=['-8','4','2','1'] if weights else None)
        self.text(x+len(m)*43+20,y+34,'|',25,color=LINE,anchor='middle')
    def save(self,entry):
        a=min(b[0] for b in self.bounds)-22;b=min(t[1] for t in self.bounds)-22
        c=max(t[2] for t in self.bounds)+22;d=max(t[3] for t in self.bounds)+22
        w=math.ceil(c-a);h=math.ceil(d-b)
        head=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{a} {b} {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(entry["title"])}</title><desc id="desc">{escape(entry["visual_content"])}</desc>'
        path=ROOT/'svg'/f'u13-v{self.n:02d}.svg';path.parent.mkdir(exist_ok=True)
        path.write_text(head+''.join(self.parts)+'</svg>',encoding='utf-8')
        return {'id':entry['id'],'width':w,'height':h,'labels':self.labels,'float_pairs':self.float_pairs,'svg':str(path)}

def d01():
    d=Diagram(1)
    d.node(315,0,'Learner management',330)
    for x,title,sub in [(0,'Define data',['Record / enum / pointer','Choose → define → use']),(335,'Store & find',['Organisation / access','Key → location → record']),(670,'Represent numbers',['Mantissa / exponent','Encode → normalise → check'])]:
        d.arrow(480,60,x+145,130,via=[(480,92),(x+145,92)])
        d.node(x,130,title,290)
        d.lines(x+145,230,sub,size=20,anchor='middle')
    return d
def d02():
    d=Diagram(2)
    for i,(a,b,c) in enumerate([('Primitive types','User-defined types','INTEGER / STRING → TStudent'),('Records & files','Organisation & access','Record key → index or hash'),('Binary fractions','Mantissa','0.101₂ → weighted bits'),('Integer two’s complement','Exponent','1110₂ → E = -2')]):
        y=i*126;d.node(0,y,a,355,fill=BLUE,color=NAVY,size=22);d.arrow(366,y+30,435,y+30);d.node(450,y,b,340,size=22);d.text(450,y+94,c,size=20,mono=True,color=MUTED)
    return d
def d03():
    d=Diagram(3);d.text(0,0,'Separate values',bold=True);d.text(505,0,'Two instances of TStudent',bold=True)
    for i,s in enumerate(['"AC027"    "Minh"','"AC028"    "Lan"','8          12','Active     Paused']):d.text(10,65+i*52,s,25,mono=True)
    d.arrow(340,135,460,135)
    d.record(505,30,'LearnerA',[('ID','AC027'),('Name','Minh'),('Lessons','8'),('Status','Active')],310)
    d.record(850,30,'LearnerB',[('ID','AC028'),('Name','Lan'),('Lessons','12'),('Status','Paused')],310)
    return d
def d04():
    d=Diagram(4);d.node(305,0,'User-defined types',320)
    d.node(40,130,'Non-composite',290);d.node(570,130,'Composite',290)
    d.arrow(380,60,185,130,via=[(380,96),(185,96)]);d.arrow(550,60,715,130,via=[(550,96),(715,96)])
    for x,y,lab,ex,parent in [(0,265,'Enum','Active',185),(230,265,'Pointer','address → value',185),(485,265,'Record','ID / Name / Score',715),(725,265,'Set','{Binary, Files}',715),(965,265,'Class / object','state + methods',715)]:
        d.arrow(parent,190,x+100,y,via=[(parent,230),(x+100,230)]);d.node(x,y,lab,210,fill=WHITE);d.text(x+105,y+99,ex,size=18,mono=True,anchor='middle')
    return d
def d05():
    d=Diagram(5);d.text(0,0,'TYPE TStudyStatus = (Active, Paused, Completed)',24,mono=True)
    d.rect(0,50,715,105,WHITE,TEAL);d.text(15,77,'Allowed values',19,MUTED)
    for x,lab in [(20,'Active'),(245,'Paused'),(470,'Completed')]:d.node(x,91,lab,210,h=48,fill=PALE if x==20 else WHITE)
    d.node(15,245,'Status : TStudyStatus',410);d.arrow(125,145,125,240);d.text(147,199,'select one',20,color=TEAL)
    d.text(15,354,'Status ← Active',25,mono=True);d.text(470,279,'TYPE ≠ VARIABLE ≠ VALUE',20,bold=True,color=MUTED)
    return d
def d06():
    d=Diagram(6)
    d.text(0,0,'TYPE TStudent',25,bold=True,mono=True)
    fields=[('StudentID','STRING','AC027'),('FullName','STRING','Minh'),('Phone','STRING','0901234567'),('LessonsAttended','INTEGER','8'),('Status','TStudyStatus','Active')]
    d.record(630,20,'Learner : TStudent',[(f,v) for f,t,v in fields],455,highlight='FullName')
    for i,(f,t,v) in enumerate(fields):
        y=97+i*43;d.text(12,y,f'DECLARE {f} : {t}',20,mono=True,color=ORANGE if f=='FullName' else NAVY);d.arrow(540,y-7,624,y-7,color=ORANGE if f=='FullName' else LINE)
    d.text(0,334,'ENDTYPE',23,mono=True);d.text(645,334,'Learner.FullName → "Minh"',23,mono=True,color=ORANGE)
    return d
def d07():
    d=Diagram(7);d.text(0,0,'ClassList : ARRAY[1:20] OF TStudent',25,mono=True)
    for i,t in enumerate(['Learner 1','Learner 2','Learner 3','…','Learner 20']):d.node(i*188,45,t,170,fill=WARM if i==1 else PALE,color=ORANGE if i==1 else TEAL,size=21)
    for i,t in enumerate(['[1]','[2]','[3]','…','[20]']):d.text(i*188+85,135,t,20,mono=True,anchor='middle')
    d.arrow(273,151,273,205,color=ORANGE)
    d.record(65,210,'ClassList[2]',[('StudentID : STRING','AC028'),('Name : STRING','Lan'),('Lessons : INTEGER','12')],540)
    d.text(650,273,'Same record type',22,bold=True);d.text(650,308,'Different field types',22,color=MUTED)
    return d
def d08():
    d=Diagram(8);d.text(0,0,'TYPE TIntPointer = ^INTEGER',24,mono=True)
    d.record(0,60,'ScorePointer',[('address','0x0200')],310)
    d.record(530,60,'Score',[('value','42')],265)
    d.arrow(320,125,520,125,label='points to')
    d.text(532,196,'at 0x0200',21,color=MUTED,mono=True)
    d.lines(0,255,['ScorePointer ← ^Score','ScorePointer^ → 42'],25,mono=True)
    d.text(530,293,'Illustrative address',19,color=MUTED)
    return d
def d09():
    d=Diagram(9)
    for i,(state,val) in enumerate([('Before','42'),('After Score ← 50','50')]):
        y=i*190;d.text(0,y,state,23,bold=True)
        d.node(0,y+35,'P = 0x0200',235,mono=True)
        d.node(445,y+35,f'Score = {val}',245,fill=WARM if i else PALE,mono=True)
        d.arrow(245,y+65,435,y+65,label='same address')
        d.text(750,y+76,f'P^ → {val}',25,mono=True,color=ORANGE if i else TEAL)
    return d
def d10():
    d=Diagram(10);d.text(0,0,'TYPE TSkillSet = SET OF STRING',24,mono=True)
    d.parts.append('<defs><clipPath id="a"><circle cx="190" cy="185" r="115"/></clipPath></defs>')
    d.circle(190,185,115,BLUE,NAVY);d.circle(355,185,115,'none',TEAL)
    d.parts.append(f'<circle cx="355" cy="185" r="115" fill="{PALE}" clip-path="url(#a)"/>')
    d.text(123,50,'SkillsA',22,bold=True);d.text(330,50,'SkillsB',22,bold=True,color=TEAL)
    for x,t in [(155,'Binary'),(272,'Files'),(393,'Records')]:d.text(x,192,t,23,anchor='middle',bold=True)
    d.text(540,138,'Intersection',23,bold=True,color=TEAL);d.text(540,175,'{Files}',23,mono=True)
    d.text(540,239,'Union',23,bold=True,color=TEAL);d.text(540,276,'{Binary, Files, Records}',23,mono=True)
    d.text(92,337,'Unordered • no duplicates',22,color=MUTED)
    return d
def d11():
    d=Diagram(11);d.text(0,0,'CurrentLevel : TLevel',24,mono=True)
    d.node(0,43,'ASLevel',195);d.node(224,43,'ALevel',195,fill=WHITE,color=MUTED)
    d.text(0,151,'One selected value',22,bold=True,color=TEAL)
    d.text(525,0,'CompletedUnits : TUnitSet',24,mono=True)
    for i in range(3):d.circle(570+i*100,74,33);d.text(570+i*100,84,[1,3,5][i],26,mono=True,anchor='middle')
    d.text(525,151,'Several distinct elements',22,bold=True,color=TEAL)
    return d
def d12():
    d=Diagram(12);d.record(285,0,'TCounter (class)',[('Value','INTEGER'),('Increment()','+1'),('GetValue()','read')],390)
    for x,lab,val in [(0,'CounterA','1'),(610,'CounterB','0')]:
        d.arrow(480,180,x+175,256,via=[(480,217),(x+175,217)],label=None)
        d.record(x,265,lab,[('Value',val)],350)
    d.text(0,401,'CounterA.Increment()',23,mono=True,color=ORANGE);d.text(610,401,'No method called',23,color=MUTED)
    d.text(417,237,'NEW',20,color=TEAL,bold=True)
    return d

def d13():
    d=Diagram(13);d.text(0,0,'ORGANISATION',20,bold=True,color=MUTED);d.text(570,0,'ACCESS',20,bold=True,color=MUTED)
    for y,s in [(40,'Serial'),(175,'Sequential'),(310,'Random')]:d.node(0,y,s,255)
    d.node(570,105,'Sequential access',310);d.node(570,290,'Direct access',310)
    d.arrow(266,70,560,126,via=[(355,70),(355,126)])
    d.arrow(266,205,560,145,via=[(400,205),(400,145)])
    d.arrow(266,220,560,307,via=[(450,220),(450,307)]);d.text(470,270,'index',20,color=TEAL)
    d.arrow(266,340,560,336);d.text(395,373,'hash',20,color=TEAL)
    return d
def d14():
    d=Diagram(14)
    d.text(0,0,'Arrival keys: 25, 12, 31, 18',24,mono=True)
    for y,label,vals in [(85,'Serial',[25,12,31,18]),(220,'Sequential',[12,18,25,31])]:
        d.text(0,y+35,label,24,bold=True);d.slots(205,y,vals,90,indices=False)
    d.text(0,390,'Random',24,bold=True);d.text(0,425,'Key MOD 10',19,mono=True,color=MUTED)
    d.slots(205,355,[None,31,12,None,None,25,None,None,18,None],70)
    d.text(205,477,'slot',18,color=MUTED)
    return d
def d15():
    d=Diagram(15);events=[('09:00','25'),('09:01','12'),('09:03','31')]
    for i,(t,k) in enumerate(events):
        d.node(i*165,40,k,145,mono=True);d.text(i*165+72,15,t,20,mono=True,anchor='middle')
    d.node(690,40,'18',145,fill=WARM,color=ORANGE,mono=True);d.text(762,15,'09:04',20,mono=True,anchor='middle')
    d.arrow(680,69,505,69,color=ORANGE,label='append')
    d.arrow(420,121,420,168)
    d.slots(0,192,[25,12,31,18],165,selected=[3],indices=False)
    d.text(0,295,'Order of arrival is preserved',22,color=MUTED)
    return d
def d16():
    d=Diagram(16);d.slots(0,25,[12,18,25,31],105,indices=False)
    d.node(155,155,'20',100,fill=WARM,color=ORANGE,mono=True)
    d.arrow(205,143,205,88,color=ORANGE,label=None);d.text(315,193,'18 < 20 < 25',25,mono=True)
    d.arrow(70,109,70,287,via=[(-35,109),(-35,287)])
    d.slots(0,310,[12,18,20,25,31],105,indices=False,selected=[2])
    d.text(0,422,'Key order maintained; file may need reorganisation',20,color=MUTED)
    return d
def d17():
    d=Diagram(17);d.node(0,0,'Find key 20',220)
    d.slots(0,100,[12,18,25,31],125,selected=[2],indices=False)
    for i in range(2):d.arrow(62+i*125,174,187+i*125,174)
    d.arrow(312,183,312,235,color=ORANGE)
    d.node(167,249,'25 > 20 → stop',300,fill=WARM,color=ORANGE)
    d.text(187,355,'20 is not in the sorted file',22)
    d.text(558,132,'31 need not be read',21,color=MUTED)
    d.text(0,418,'Early stop requires ascending key order',21,color=MUTED)
    return d
def d18():
    d=Diagram(18);d.text(0,0,'INDEX',21,bold=True,color=MUTED);d.text(610,0,'SORTED FILE',21,bold=True,color=MUTED)
    d.record(0,35,'Key → byte address',[(str(k),str(a)) for k,a in zip([12,18,25,31],[400,432,464,496])],320,highlight='25')
    for i,(k,a) in enumerate(zip([12,18,25,31],[400,432,464,496])):
        y=83+i*70;d.text(889,y+31,a,20,mono=True,color=MUTED);d.node(625,y,f'key = {k}',230,fill=WARM if k==25 else PALE,color=ORANGE if k==25 else TEAL,mono=True)
    d.text(883,36,'byte',18,color=MUTED)
    d.arrow(330,190,615,253,via=[(470,190),(470,253)],color=ORANGE,label=None)
    d.text(343,153,'lookup key 25',20,color=ORANGE)
    d.text(0,410,'Illustrative addresses • one record = 32 bytes',20,color=MUTED)
    return d
def d19():
    d=Diagram(19)
    for x,w,lab in [(0,160,'Key 127'),(235,200,'MOD 10'),(510,150,'Slot 7'),(735,280,'Byte 1140')]:d.node(x,0,lab,w,mono=True)
    for x1,x2 in [(170,225),(445,500),(670,725)]:d.arrow(x1,30,x2,30)
    d.text(0,121,'Address = 1000 + 7 × 20 = 1140 bytes',25,mono=True)
    d.slots(0,207,[None]*7+[127,None,None],100,selected=[7])
    for i in range(10):d.text(i*100+50,327,1000+i*20,18,mono=True,anchor='middle',color=ORANGE if i==7 else MUTED)
    d.text(0,382,'Slot index: 0–9     Base: 1000 bytes     Record size: 20 bytes',22)
    d.arrow(870,70,750,197,via=[(1060,70),(1060,176),(750,176)],color=ORANGE)
    return d
def d20():
    d=Diagram(20)
    for y,key,nums in [(0,'AC','65 + 67'),(160,'CA','67 + 65')]:
        d.node(0,y,key,120,mono=True);d.arrow(130,y+30,200,y+30);d.node(212,y,nums,215,mono=True);d.arrow(437,y+30,507,y+30);d.node(519,y,'132 MOD 10',255,mono=True)
    d.node(900,80,'2',120,fill=WARM,color=ORANGE,mono=True)
    d.arrow(785,30,890,98,via=[(840,30),(840,98)],color=ORANGE);d.arrow(785,190,890,122,via=[(840,190),(840,122)],color=ORANGE)
    d.text(0,288,'Given character codes: A = 65, C = 67',22,color=MUTED)
    d.text(835,254,'Same hash',22,color=ORANGE,bold=True)
    return d
def d21():
    d=Diagram(21)
    for y,k in [(0,12),(120,17),(240,22)]:
        d.node(0,y,str(k),110,mono=True);d.text(145,y+38,'MOD 5 = 2',25,mono=True)
        d.arrow(340,y+30,495,155,via=[(415,y+30),(415,155)],color=ORANGE if k!=12 else TEAL)
    d.record(510,105,'Slot 2',[('stored key','12')],310)
    d.text(510,255,'17 ≠ 12     22 ≠ 12',24,mono=True,color=RED)
    d.text(510,295,'Collision: do not overwrite',23,bold=True,color=RED)
    return d
def d22():
    d=Diagram(22);d.text(0,0,'Key MOD 5 • linear probing • no deletion',23)
    states=[('Insert 14',[None,None,None,None,14],'4'),('Insert 19',[19,None,None,None,14],'4 → 0'),('Insert 24',[19,24,None,None,14],'4 → 0 → 1'),('Insert 10',[19,24,10,None,14],'0 → 1 → 2')]
    for i,(label,vals,route) in enumerate(states):
        y=62+i*125;d.text(0,y+35,label,22,bold=True);d.slots(180,y,vals,78,selected=[[4],[0],[1],[2]][i]);d.text(620,y+35,route,24,mono=True,color=ORANGE)
    d.line(0,573,960,573)
    d.text(0,629,'Find 24',23,bold=True);d.text(180,629,'4 → 0 → 1',25,mono=True);d.text(620,629,'found',23,color=TEAL,bold=True)
    d.text(0,699,'Find 29',23,bold=True);d.text(180,699,'4 → 0 → 1 → 2 → 3',25,mono=True);d.text(620,699,'unused slot → not found',22,color=RED)
    return d
def d23():
    d=Diagram(23);d.text(0,0,'Main area',22,bold=True);d.text(615,0,'Overflow area',22,bold=True)
    d.record(0,35,'Slot 2',[('key','12')],280)
    d.record(615,35,'Overflow records',[('first key','17'),('next key','22')],335,highlight='next key')
    d.arrow(292,102,605,102,label='collision records')
    d.node(0,244,'Find key 22',240)
    d.arrow(250,274,385,274)
    d.text(405,281,'12 ≠ 22 → 17 ≠ 22 → 22 = 22',24,mono=True)
    d.text(620,352,'Match the key before using the record',21,color=TEAL)
    return d

def d24():
    d=Diagram(24)
    d.text(0,43,'6500',35,bold=True,mono=True);d.text(180,43,'=',35,mono=True)
    d.node(260,0,'6.5',155,mono=True);d.text(448,43,'×',32);d.node(505,0,'10',100,mono=True);d.text(616,9,'3',26,bold=True,mono=True)
    d.text(335,98,'mantissa',20,anchor='middle');d.text(555,98,'base',20,anchor='middle');d.text(669,1,'exponent',19)
    d.text(0,232,'6.5',35,bold=True,mono=True);d.text(180,232,'=',35,mono=True)
    d.node(260,189,'0.1101₂',220,mono=True);d.text(515,232,'×',32);d.node(560,189,'2',100,mono=True);d.text(671,198,'3',26,bold=True,mono=True)
    d.text(369,284,'M',22,anchor='middle',bold=True);d.text(699,248,'E',22,bold=True)
    return d
def d25():
    d=Diagram(25);d.floatrow(0,40,'01101000','0011',weights=True)
    d.text(0,205,'M = -b₀ + b₁/2 + b₂/4 + … + b₇/128',24,mono=True)
    d.text(0,250,'E = -8e₀ + 4e₁ + 2e₂ + e₃',24,mono=True,color=ORANGE)
    d.arrow(43,103,43,135,color=ORANGE);d.text(72,151,'binary point',19,color=ORANGE)
    d.text(0,320,'X = M × 2^E',29,bold=True,mono=True)
    d.text(375,320,'8-bit M + 4-bit E • two’s complement',20,color=MUTED)
    return d
def decode_diagram(n,m,e,expr,mval,eval,result):
    d=Diagram(n);d.floatrow(0,35,m,e)
    d.arrow(172,96,172,142);d.arrow(474,96,474,142,color=ORANGE)
    d.text(0,183,expr,24,mono=True)
    d.text(420,183,f'E = {eval}',25,mono=True,color=ORANGE)
    d.text(0,235,f'M = {mval}',25,mono=True,color=TEAL)
    d.arrow(250,259,250,304)
    d.node(0,320,f'{mval} × 2^{eval} = {result}',620,mono=True)
    d.text(0,423,'8-bit M + 4-bit E • two’s complement',19,color=MUTED)
    return d
def d26():return decode_diagram(26,'01101000','0011','1/2 + 1/4 + 1/16','0.8125',3,'6.5')
def d27():return decode_diagram(27,'10011000','0011','-1 + 1/8 + 1/16','-0.8125',3,'-6.5')
def d28():
    d=Diagram(28);d.floatrow(0,35,'01010000','1110')
    d.text(0,145,'M = +0.625',26,mono=True,color=TEAL);d.text(390,145,'E = -8 + 4 + 2 = -2',24,mono=True,color=ORANGE)
    d.text(0,220,'0.625 × 2^-2 = 0.625 ÷ 4 = 0.15625',27,mono=True)
    d.line(0,335,800,335,color=NAVY)
    for x,lab in [(0,'0'),(200,'0.15625'),(800,'0.625')]:
        d.line(x,325,x,345,color=NAVY);d.text(x,382,lab,23,mono=True,anchor='middle')
    d.arrow(800,305,200,305,label='divide by 4')
    d.text(0,454,'Both values are positive: the sign comes from M',22,color=TEAL)
    d.text(0,497,'8-bit M + 4-bit E',19,color=MUTED)
    return d
def d29():
    d=Diagram(29)
    d.text(0,30,'+6.5',31,bold=True,mono=True);d.arrow(130,20,195,20)
    d.text(217,30,'110.1₂',28,mono=True);d.arrow(355,20,420,20)
    d.text(440,30,'0.1101₂ × 2^3',28,mono=True)
    d.floatrow(190,121,'01101000','0011')
    d.arrow(315,195,315,251,color=ORANGE,label=None)
    d.text(0,306,'−6.5',31,bold=True,mono=True)
    d.text(192,277,'invert M bits → 10010111',25,mono=True,color=ORANGE)
    d.text(192,320,'add 1        → 10011000',25,mono=True,color=ORANGE)
    d.floatrow(190,393,'10011000','0011')
    d.text(190,515,'Check: -104/128 × 8 = -6.5',24,mono=True)
    d.text(190,562,'8-bit M + 4-bit E • E stays +3',20,color=MUTED)
    return d
def d30():
    d=Diagram(30);d.floatrow(0,35,'00101000','0100')
    d.text(665,69,'0.3125 × 16 = 5',26,mono=True)
    d.arrow(172,101,172,204,label=None);d.text(0,161,'shift M left 1',22,color=TEAL)
    d.arrow(476,101,476,204,color=ORANGE);d.text(500,161,'E: 4 → 3',22,color=ORANGE)
    d.floatrow(0,240,'01010000','0011')
    d.text(665,274,'0.625 × 8 = 5',26,mono=True)
    d.text(0,361,'01…  normalised',24,bold=True,color=TEAL)
    d.text(393,361,'M × 2, E − 1: same value',24)
    d.text(0,411,'8-bit M + 4-bit E',19,color=MUTED)
    return d
def d31():
    d=Diagram(31)
    d.floatrow(0,35,'11101000','0101');d.text(665,66,'-0.1875 × 32 = -6',24,mono=True)
    d.arrow(-28,90,-28,204,color=ORANGE);d.text(0,157,'left 2     E: 5 → 3',23,color=ORANGE,mono=True)
    d.floatrow(0,239,'10100000','0011');d.text(665,273,'-0.75 × 8 = -6',24,mono=True)
    d.line(0,349,1000,349)
    d.floatrow(0,437,'11000000','0000');d.text(665,471,'-0.5 × 1 = -0.5',24,mono=True)
    d.arrow(-28,492,-28,605,color=ORANGE);d.text(0,559,'left 1     E: 0 → -1',23,color=ORANGE,mono=True)
    d.floatrow(0,642,'10000000','1111');d.text(665,676,'-1 × 0.5 = -0.5',24,mono=True)
    d.text(0,763,'10…  normalised negative mantissa',23,color=TEAL,bold=True)
    d.text(0,809,'8-bit M + 4-bit E',19,color=MUTED)
    return d
def d32():
    d=Diagram(32)
    for y,m,e,label in [(35,10,6,'10M + 6E'),(200,8,8,'8M + 8E')]:
        d.text(0,y-17,label,24,bold=True,mono=True)
        for i in range(16):
            color=TEAL if i<m else ORANGE;d.rect(i*43,y,43,51,PALE if i<m else WARM,color,r=0);d.text((i+.5)*43,y+34,'M' if i<m else 'E',23,mono=True,anchor='middle',color=color)
        d.text(0,y+98,f'{m-1} fraction bits',22,color=TEAL)
        d.text(390,y+98,f'E: {-2**(e-1)} to {2**(e-1)-1}',22,color=ORANGE)
    d.text(0,376,'Local spacing at E = 0',23,bold=True)
    for y,m,label in [(443,10,'step = 1/512'),(563,8,'step = 1/128')]:
        d.line(0,y,690,y,color=NAVY)
        step=1/2**(m-1)
        for i in range(math.floor(.05/step)+1):
            x=i*step/.05*690;d.line(x,y-9,x,y+9,color=TEAL)
        d.text(0,y+45,'0.50',20,mono=True);d.text(690,y+45,'0.55',20,mono=True,anchor='end');d.text(750,y+7,label,23,mono=True)
    return d
def d33():
    d=Diagram(33)
    cases=[('Largest positive','01111111','0111','127'),('Smallest positive','01000000','1000','1/512'),('Largest |negative|','10000000','0111','-128'),('Negative nearest 0','10111111','1000','-65/32768')]
    for i,(lab,m,e,val) in enumerate(cases):
        y=45+i*122;d.text(0,y+32,lab,22,bold=True);d.floatrow(300,y,m,e);d.text(924,y+34,val,25,mono=True,color=TEAL)
    d.text(0,573,'Normalised non-zero values • 8-bit M + 4-bit E',21,color=MUTED)
    d.text(0,635,'Whole range',21,bold=True);d.line(0,690,1050,690,color=NAVY)
    for x,t in [(0,'-128'),(527,'0'),(1050,'127')]:d.line(x,681,x,699,color=NAVY);d.text(x,733,t,21,mono=True,anchor='middle')
    d.text(0,802,'Separate zoom near zero',21,bold=True)
    d.line(0,858,1050,858,color=NAVY)
    # This axis is linear over [-0.003, +0.003].
    for v,t in [(-65/32768,'-65/32768'),(0,'0'),(1/512,'1/512')]:
        x=(v+.003)/.006*1050;d.line(x,845,x,872,color=TEAL,sw=3);d.text(x,913,t,22,mono=True,anchor='middle')
    d.text(0,974,'-0.003',18,mono=True,color=MUTED);d.text(1050,974,'+0.003',18,mono=True,color=MUTED,anchor='end')
    return d
def d34():
    d=Diagram(34)
    d.text(0,0,'Non-terminating binary fraction',24,bold=True)
    d.text(0,65,'0.1₁₀ = 0.00011001100110011…₂',29,mono=True)
    d.line(224,81,752,81,color=ORANGE,sw=3);d.text(330,130,'repeating pattern continues',21,color=ORANGE)
    d.text(0,232,'Finite expansion, insufficient mantissa bits',24,bold=True)
    d.text(0,294,'13.375 = 0.1101011₂ × 2^4',28,mono=True)
    d.bits(0,354,'011010','6-bit M capacity',selected=[])
    d.bits(288,354,'11','extra bits',color=RED)
    d.line(273,339,273,433,color=RED,sw=3,dash=True)
    d.text(0,473,'A longer finite mantissa can preserve these extra bits',22,color=MUTED)
    return d
def d35():
    d=Diagram(35);d.text(0,0,'13.375 = 0.1101011₂ × 2^4',27,mono=True)
    d.text(0,81,'TRUNCATE',21,bold=True,color=ORANGE);d.floatrow(270,65,'011010','0100');d.text(830,99,'13.0',28,mono=True,color=ORANGE)
    d.text(0,210,'ROUND TO NEAREST',21,bold=True,color=TEAL);d.floatrow(270,194,'011011','0100');d.text(830,228,'13.5',28,mono=True,color=TEAL)
    d.line(0,354,960,354,color=NAVY)
    for x,t,col in [(0,'13.0',ORANGE),(720,'13.375',NAVY),(960,'13.5',TEAL)]:
        d.line(x,344,x,367,color=col,sw=3);d.circle(x,354,5,col,col);d.text(x,410,t,24,mono=True,anchor='middle',color=col)
    d.arrow(720,323,0,323,color=ORANGE);d.text(360,299,'error 0.375',22,color=ORANGE,anchor='middle')
    d.arrow(720,455,960,455,color=TEAL);d.text(840,499,'error 0.125',22,color=TEAL,anchor='middle')
    d.text(0,545,'6-bit M + 4-bit E • no tie in this example',20,color=MUTED)
    return d
def d36():
    d=Diagram(36);d.text(0,0,'0.1 → 0.099609375',29,mono=True,bold=True)
    d.floatrow(0,75,'01100110','1101')
    d.text(0,173,'Round-to-nearest input • 8-bit M + 4-bit E',20,color=MUTED)
    for x,lab in [(0,'n'),(120,'Ideal sum'),(385,'Exact input sum'),(740,'Signed error')]:d.text(x,245,lab,22,bold=True)
    for i,(ideal,stored,diff) in enumerate([('0.1','0.099609375','-0.000390625'),('0.2','0.19921875','-0.00078125'),('0.3','0.298828125','-0.001171875')]):
        y=310+i*83;d.line(0,y-37,965,y-37)
        for x,t,col in [(0,str(i+1),NAVY),(120,ideal,NAVY),(385,stored,TEAL),(740,diff,ORANGE)]:d.text(x,y,t,25,mono=True,color=col)
    d.text(0,570,'Input rounded once; sums computed exactly',23,bold=True,color=ORANGE)
    d.text(0,615,'The final sum is not an 8+4 stored result',20,color=MUTED)
    return d
def d37():
    d=Diagram(37);d.text(0,0,'100 × 2 = 200',30,mono=True,bold=True,color=RED)
    d.line(0,100,1000,100,color=NAVY)
    for v,t,col in [(0,'0',NAVY),(127,'127 max',TEAL),(200,'200',RED)]:
        x=v/220*1000;d.line(x,89,x,112,color=col,sw=3);d.text(x,157,t,24,mono=True,anchor='middle',color=col)
    d.line(127/220*1000,98,1000,98,color=RED,sw=5)
    d.text(650,45,'OVERFLOW',23,bold=True,color=RED)
    d.text(0,267,'(1/512) ÷ 2 = 1/1024',30,mono=True,bold=True,color=ORANGE)
    d.text(0,321,'Separate linear zoom near zero',21,color=MUTED)
    d.line(0,393,1000,393,color=NAVY)
    for x,t,col in [(0,'0',NAVY),(333,'1/1024',ORANGE),(666,'1/512 minimum',TEAL)]:
        d.line(x,383,x,403,color=col,sw=3);d.text(x,449,t,23,mono=True,anchor='middle',color=col)
    d.arrow(656,360,343,360,color=ORANGE);d.text(510,339,'UNDERFLOW',22,bold=True,color=ORANGE,anchor='middle')
    d.text(0,535,'Normalised non-zero values only • 8-bit M + 4-bit E',20,color=MUTED)
    return d
def d38():
    d=Diagram(38)
    for y,bits,lab,col in [(25,'01000000','positive: starts 01',TEAL),(167,'10000000','negative: starts 10',TEAL),(309,'00000000','zero: separate convention',ORANGE)]:
        d.bits(0,y,bits,selected=[0,1],color=col,point=True);d.text(430,y+34,lab,25,color=col)
    d.text(0,431,'0 × 2^E = 0',30,mono=True,bold=True)
    d.text(0,482,'Zero cannot satisfy the non-zero 01 / 10 rule',22,color=MUTED)
    return d
def d39():
    d=Diagram(39)
    rows=[('DATA TYPES',['Choose type','TYPE','DECLARE','Use fields'], 'Check value type and pointer target'),('FILES',['Organisation','Access','Hash / index','Check key'],'Handle collision before using the record'),('FLOATING-POINT',['Count bits','Read M / E','Normalise','Check value'],'Keep sign, bit count and exponent consistent')]
    for i,(lab,steps,note) in enumerate(rows):
        y=i*197;d.text(0,y,lab,20,bold=True,color=MUTED)
        for j,s in enumerate(steps):
            x=j*232;d.node(x,y+30,s,205,size=21)
            if j<3:d.arrow(x+211,y+60,x+225,y+60)
        d.text(0,y+137,note,21,color=ORANGE)
    return d
def d40():
    d=Diagram(40)
    d.record(0,0,'TLearner',[('ID : INTEGER','37'),('Name : STRING','Lan'),('Status : TStatus','Active'),('Score : REAL','6.5')],430)
    d.text(0,298,'TStatus = (Active, Paused, Completed)',21,mono=True)
    d.node(595,0,'ID MOD 10',280,mono=True)
    d.arrow(440,77,581,30,via=[(507,77),(507,30)])
    d.slots(595,132,[27,37],120,selected=[1],indices=False)
    d.text(655,224,'slot 7',20,mono=True,anchor='middle');d.text(775,224,'slot 8',20,mono=True,anchor='middle')
    d.arrow(735,72,735,122);d.text(885,164,'37: 7 → 8',23,mono=True)
    d.arrow(430,200,554,362,via=[(493,200),(493,362)])
    d.floatrow(575,388,'01101000','0011');d.text(575,491,'6.5 = 0.8125 × 2^3  (8M + 4E)',22,mono=True)
    d.arrow(200,337,200,550)
    d.slots(0,578,['read','edit','save'],130,indices=False);d.text(0,698,'Serial event log → append',23,bold=True,color=TEAL)
    d.text(575,637,'Teaching model',22,bold=True,color=MUTED)
    d.text(575,675,'Record → lookup → numeric representation',20,color=MUTED)
    return d

BUILDERS=[d01,d02,d03,d04,d05,d06,d07,d08,d09,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31,d32,d33,d34,d35,d36,d37,d38,d39,d40]

if __name__=='__main__':
    manifest=json.loads((ROOT/'visual_manifest.json').read_text(encoding='utf-8'))
    layout=[]
    for make in BUILDERS:
        d=make();layout.append(d.save(manifest['visuals'][d.n-1]))
    (ROOT/'qa').mkdir(exist_ok=True)
    (ROOT/'qa/layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Built {len(layout)} SVG diagrams')

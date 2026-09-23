from pathlib import Path
from collections import Counter
import json,re,sys,itertools
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[2]
a=json.loads((stage/'evidence/A2_DATA_AUDIT.json').read_text(encoding='utf-8'))
rows=[]
for p in a['papers']:
 for f in p['required_input_files']:
  ls=Path(f['extracted_path']).read_text(encoding='utf-8-sig').splitlines(); n=f['filename'];pid=p['paper_id'];checks={}; detail=''
  if n=='TreasureChestData.txt': checks={'five_3line_records':len(ls)==15,'numeric_answers_points':all(re.fullmatch(r'-?\d+',x) for i,x in enumerate(ls) if i%3!=0),'example_matches':ls[:3]==['2*2','4','10']}
  elif n=='Pictures.txt':checks={'complete_records_below_100':len(ls)%4==0 and len(ls)//4<=100,'width_height_integer':all(x.isdigit() for i,x in enumerate(ls) if i%4 in (1,2)),'example_matches':ls[:4]==['Flowers','45','50','black']}
  elif n=='HighScore.txt':checks={'ten_name_score_pairs':len(ls)==20,'3char_names':all(len(x)==3 for x in ls[::2]),'integer_scores':all(x.isdigit() for x in ls[1::2]),'descending':list(map(int,ls[1::2]))==sorted(map(int,ls[1::2]),reverse=True),'example_matches':ls[:2]==['FYI','10000']}
  elif n=='CardValues.txt': checks={'30_pairs':len(ls)==60,'integer_values':all(x.isdigit() for x in ls[::2]),'colour_strings':all(x.isalpha() for x in ls[1::2]),'example_matches':ls[:2]==['1','red']}
  elif n=='IntegerData.txt': checks={'100_integers_1_to_100':len(ls)==100 and all(x.isdigit() and 1<=int(x)<=100 for x in ls)}
  elif n=='Characters.txt':checks={'ten_triples':len(ls)==30,'numeric_coordinates':all(x.lstrip('-').isdigit() for i,x in enumerate(ls) if i%3!=0),'example_matches':ls[:3]==['Amal','0','2']}
  elif n=='Employees.txt':
   records=[];i=0
   while i<len(ls):
    pay=float(ls[i]); eid=ls[i+1];i+=2;bonus=None
    if re.fullmatch(r'\d+(\.\d+)?',ls[i]):bonus=float(ls[i]);i+=1
    title=ls[i];i+=1;records.append([pay,eid,bonus,title])
   checks={'eight_variable_records':len(records)==8,'ids_preserve_leading_zeros':all(len(r[1])==5 and r[1].isdigit() for r in records),'examples_match':records[0]==[15.22,'12452',None,'Junior Developer'] and records[2]==[22.5,'02586',5.25,'Interface Manager']};detail=str(records)
  elif n=='HoursWeek1.txt':checks={'8_id_hours_pairs':len(ls)==16,'5char_ids':all(len(x)==5 and x.isdigit() for x in ls[::2]),'hours_numeric':all(float(x)>=0 for x in ls[1::2]),'example_matches':ls[:2]==['21548','50.0']}
  elif n in ('AnimalData.txt','ColourData.txt'):checks={'nonempty_names':all(x.isalpha() for x in ls),'nonempty_file':len(ls)>0}
  elif n=='Trees.txt':
   r=[x.split(',') for x in ls]; checks={'9_fivefield_rows':len(r)==9 and all(len(t)==5 for t in r),'dimensions_integer':all(v.isdigit() for t in r for v in t[1:4]),'evergreen_yes_no':all(t[4] in ('Yes','No') for t in r),'example_matches':ls[0]=='Beech,30,400,200,No'}
  elif n in ('Easy.txt','Medium.txt','Hard.txt'):
   checks={'main_word_and_answers':len(ls)>1,'atleast_three_letters':all(len(x)>=3 and x.isalpha() for x in ls),'answers_available_letters':all(not (Counter(x)-Counter(ls[0])) for x in ls[1:])}
   if n=='Easy.txt':checks['house_14_answers']=ls[0]=='house' and len(ls)==15
  elif n=='Data.txt':
   if '_s23_' in pid: checks={'25_integer_rows':len(ls)==25 and all(x.lstrip('-').isdigit() for x in ls),'example_matches':ls[:5]==['10','4','5','13','25']}
   else:checks={'45_string_rows':len(ls)==45 and all(ls)}
  elif n=='HighScoreTable.txt':checks={'7_triples':len(ls)==21,'numeric_levels_scores':all(x.isdigit() for i,x in enumerate(ls) if i%3!=0),'example_matches':ls[:3]==['GHEH','3','10']}
  elif n=='TheData.txt':
   r=[x.split(',') for x in ls];checks={'72_pairs':len(ls)==72 and all(len(t)==2 for t in r),'integer_values':all(t[0].isdigit() for t in r),'six_colours':{t[1] for t in r}=={'red','green','blue','orange','yellow','pink'},'example_matches':ls[0]=='10,red'}
  elif n in ('Blue.txt','Green.txt','Orange.txt','Pink.txt','Red.txt','Yellow.txt'):checks={'supplied_blank_output_file':len(ls)==0 and Path(f['extracted_path']).stat().st_size==0}
  elif n=='StackData.txt' and '_w23_' in pid:checks={'100_lowercase_letters':len(ls)==100 and all(re.fullmatch('[a-z]',x) for x in ls)}
  elif n in ('StackData.txt','SecondStack.txt'):checks={'number_operator_tokens':all(re.fullmatch(r'-?\d+',x) or x in '+-/*^' for x in ls),'nonempty':bool(ls)}
  elif n=='HashData.txt':checks={'up_to_200_three_integer_rows':0<len(ls)<=200 and all(re.fullmatch(r'\d+,\d+,\d+',x) for x in ls),'example_matches':ls[0]=='646,12,568'}
  elif n=='QueueData.txt' and '_w23_' in pid:checks={'string_ids':all(bool(x) for x in ls),'duplicates_present':len(set(ls))<len(ls),'fits_queue50':len(ls)<=50}
  elif n=='QueueData.txt':checks={'positive_integer_rows':all(x.isdigit() and int(x)>0 for x in ls)}
  elif n=='HashTableData.txt':checks={'200_integer_string_rows':len(ls)==200 and all(re.fullmatch(r'\d+,.+',x) for x in ls),'example_matches':ls[0]=='528,permission'}
  elif n=='TreeData.txt':checks={'50_integer_rows':len(ls)==50 and all(x.lstrip('-').isdigit() for x in ls)}
  elif n=='BinaryData.txt':checks={'1_to_100_binary_digits':0<len(ls)<=100 and all(x in ('0','1') for x in ls),'run_lengths_max9':max(len(list(g)) for _,g in itertools.groupby(ls))<=9,'example_matches':ls[:2]==['1','1']}
  else:checks={'unhandled':False}
  rows.append({'paper_id':pid,'file':n,'checks':{k:bool(v) for k,v in checks.items()},'detail':detail})
(Path(__file__).parent/'data_formats.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
print('files',len(rows),'FAILURES',[(r['paper_id'],r['file'],r['checks']) for r in rows if not all(r['checks'].values())])

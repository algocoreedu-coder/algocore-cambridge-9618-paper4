from pathlib import Path
import re,sys
sys.stdout.reconfigure(encoding='utf-8')
stage=Path(__file__).resolve().parents[1]
for p in sorted((stage/'batches/2025').glob('*_review.txt')):
 if len(sys.argv)>1 and sys.argv[1] not in p.name:continue
 print('\nPAPER',p.stem)
 for seg in p.read_text(encoding='utf-8').split('### ')[1:]:
  heading=seg.split('\n')[0]; ms=seg.split('MS BEGIN:\n')[1]
  rubric=re.split(r'Example program code:|Example code:|\ne\.g\.|\nFor example:',ms)[0]
  rubric=re.split(r'© Cambridge',rubric)[0]
  print(heading+'\n'+re.sub(r'\s+',' ',rubric).strip())

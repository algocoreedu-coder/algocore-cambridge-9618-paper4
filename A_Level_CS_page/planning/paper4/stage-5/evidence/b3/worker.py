import argparse,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'implementation'))
from b3_queue_linked_list import *
def run(r):
 p=r['pattern_id']; a=r['input']
 if p=='QUEUE_SETUP': return queue_setup(a['capacity'],a.get('model','linear'),a.get('values',[]))
 if p=='QUEUE_ENQUEUE': return queue_enqueue(a['queue'],a['item'])
 if p=='QUEUE_DEQUEUE': return queue_dequeue(a['queue'])
 if p=='QUEUE_INSPECT': return queue_inspect(a['queue'],a.get('delimiter',' '))
 if p=='QUEUE_REDUCE': return queue_reduce(a['queue'],a.get('mode','sum'),a.get('consume',False))
 if p=='LIST_SETUP': return list_setup(a.get('values',[]),a.get('capacity',6))
 if p=='LIST_TRAVERSE': return list_traverse(a['state'])
 if p=='LIST_INSERT': return list_insert(a['state'],a['value'],a.get('position','front'))
 if p=='LIST_REMOVE': return list_remove(a['state'],a['value'])
 raise ValueError(p)
if __name__=='__main__':
 r=json.loads(Path(sys.argv[sys.argv.index('--fixture-json')+1]).read_text(encoding='utf-8')) if '--fixture-json' in sys.argv else json.loads(sys.stdin.read())
 try:
  v=run(r); expected=json.loads(json.dumps(r['expected_return'],ensure_ascii=False)); actual=json.loads(json.dumps(v,ensure_ascii=False)); print(json.dumps({'result':'PASS' if actual==expected else 'FAIL','actual_return':actual},ensure_ascii=False,sort_keys=True)); sys.exit(0 if actual==expected else 1)
 except Exception as e:
  print(json.dumps({'result':'FAIL','error':repr(e)},ensure_ascii=False)); sys.exit(1)

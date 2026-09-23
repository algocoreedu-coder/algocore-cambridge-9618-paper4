from pathlib import Path
import json, re
stage = Path(__file__).resolve().parents[1]
path = stage/'evidence/A2_DATA_AUDIT.json'
data = json.loads(path.read_text(encoding='utf-8'))
listing = (stage/'evidence/A2_DATA_RAR_LISTING.txt').read_text(encoding='utf-8-sig')
members = re.findall(r'^Path = ([^\r\n]*sf_4[123]\.zip)\s*$', listing, re.M)
assert len(members) == len(set(members)) == 21
data['rar']['sf_members'] = members
data['rar']['listing_evidence'] = 'evidence/A2_DATA_RAR_LISTING.txt'
data['rar']['metadata_repair'] = {'finding_id':'S1-DATA-01','owner':'A0 Lead','cause':'End-of-line regex did not accept CRLF in saved 7-Zip listing.','action':'Reparsed saved successful listing; no RAR or extracted data modified.','validation':'21 distinct SF members; independent A8 recheck requested.'}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('S1-DATA-01 repaired:', len(members), 'RAR source ZIP names')

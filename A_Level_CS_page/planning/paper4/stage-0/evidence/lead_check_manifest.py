from pathlib import Path
import json
import re

out = Path(__file__).resolve().parent
stage = out.parent
data = json.loads((out / 'A2_SOURCE_BASELINE.json').read_text(encoding='utf-8-sig'))
settings = json.loads((stage / 'COURSE_SETTINGS.json').read_text(encoding='utf-8'))
records = []
def visit(obj):
    if isinstance(obj, dict):
        if 'path' in obj and 'size_bytes' in obj:
            records.append(obj)
        for v in obj.values():
            visit(v)
    elif isinstance(obj, list):
        for v in obj:
            visit(v)
visit(data)
errors = []
for item in records:
    path = Path(item['path'])
    if not path.is_file() or path.stat().st_size != item['size_bytes']:
        errors.append({'path': str(path), 'issue': 'missing_or_size_mismatch'})
papers = data['papers']
root = Path(data['root'])
actual_qp = sorted(str(p.resolve()).lower() for p in (root/'Past_Papers').rglob('*.pdf') if re.fullmatch(r'9618_[sw]\d{2}_qp_4[123]\.pdf', p.name))
listed_qp = sorted(str(Path(p['qp']['path']).resolve()).lower() for p in papers)
checks = {
    'year_matches_user_2026': settings['exam_year'] == 2026,
    'python_matches_user': settings['programming_language'] == 'Python',
    'bilingual_matches_user': sorted(settings['content_locales']) == ['en','vi'],
    'baseline_settings_agree': data['course_settings']['exam_year'] == settings['exam_year'] and data['course_settings']['programming_language'] == settings['programming_language'] and sorted(data['course_settings']['lesson_languages']) == sorted(settings['content_locales']),
    'qp_files_exactly_match_manifest': actual_qp == listed_qp,
    'qp_ids_unique': len({p['paper_id'] for p in papers}) == len(papers),
    '29_qp_and_29_ms': len(papers) == 29 and sum(len(p['ms']) for p in papers) == 29,
    '21_sf': sum(len(p['sf']) for p in papers) == 21,
    'missing_list_exact': sorted(p['paper_id'] for p in papers if not p['sf']) == sorted(data['missing_sf_paper_ids']),
    'source_records_exist_and_size_match': not errors,
    'all_primary_artifacts_present': all((stage/name).is_file() for name in ['SCOPE.md','COURSE_SETTINGS.json','LEARNING_PAGE_CONTRACT.md','SOURCE_BASELINE.md','DEFINITION_OF_DONE.md','DECISIONS.md']),
}
report = {'checks': checks, 'checked_file_references': len(records), 'errors': errors, 'all_pass': all(checks.values()), 'scope': 'Document/settings/file inventory checks only; not code correctness or question-level content verification.'}
(out / 'LEAD_MANIFEST_CHECK.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
if not report['all_pass']:
    raise SystemExit(1)

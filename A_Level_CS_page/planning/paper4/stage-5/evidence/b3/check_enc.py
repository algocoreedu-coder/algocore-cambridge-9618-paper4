from pathlib import Path
s=Path('build_b3.py').read_text(encoding='utf-8')
i=s.find('Sự')
print(repr(s[i:i+30]))

"""AS prerequisite D3: create, append, and read a disposable practice file."""
from pathlib import Path
from tempfile import TemporaryDirectory

def demonstrate():
    # A temporary directory keeps the exercise independent of existing files.
    with TemporaryDirectory(prefix='unit13_file_') as directory:
        path=Path(directory)/'study.txt'
        with path.open('w',encoding='utf-8') as stream:
            stream.write('Binary\nFiles\n')
        with path.open('a',encoding='utf-8') as stream:
            stream.write('Records\n')
        with path.open('r',encoding='utf-8') as stream:
            return [line.rstrip('\n') for line in stream]

if __name__=='__main__':
    result=demonstrate()
    assert result==['Binary','Files','Records']
    print('\n'.join(result))

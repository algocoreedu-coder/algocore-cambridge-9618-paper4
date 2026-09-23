from pathlib import Path
from io import StringIO

class InjectedReadError(OSError): pass

class DemoStream(StringIO):
    def __init__(self, text, fail=False): super().__init__(text); self.fail = fail
    def read(self, *args):
        if self.fail: raise InjectedReadError("injected")
        return super().read(*args)

def run(fixture):
    previous, trace, stream = fixture["previous"], [], DemoStream(fixture.get("content", ""), fixture.get("inject_io", False))
    try:
        with stream:
            text = stream.read().strip(); trace.append({"event": "read"})
            if text == "": raise ValueError("empty value")
            value = int(text)
        status = "OK"
    except ValueError as error:
        value, status = previous, "VALUE_ERROR"; trace.append({"event": "recover_value", "message": str(error)})
    except InjectedReadError as error:
        value, status = previous, "IO_ERROR"; trace.append({"event": "recover_io", "message": str(error)})
    finally:
        trace.append({"event": "cleanup", "closed": stream.closed})
    return {"status": status, "value": value, "preserved_on_failure": status == "OK" or value == previous, "closed": stream.closed, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

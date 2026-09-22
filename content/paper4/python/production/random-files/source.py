from pathlib import Path
from io import BytesIO

def pack(value, size):
    raw = value.encode("ascii")
    if len(raw) > size: raise ValueError("record too long")
    return raw.ljust(size, b" ")

def read_record(handle, address, size):
    if address < 0: raise ValueError("negative address")
    handle.seek(address * size); raw = handle.read(size)
    if len(raw) != size: raise EOFError("short read")
    return raw.rstrip(b" ").decode("ascii")

def run(fixture):
    size, trace = fixture["record_size"], []
    try: raw = b"".join(pack(value, size) for value in fixture["records"])
    except (UnicodeError, ValueError) as error: return {"status": "INVALID_RECORD", "message": str(error), "trace": [{"event": "pack_reject"}]}
    handle, before = BytesIO(raw), raw
    try:
        old = read_record(handle, fixture["address"], size)
        replacement = pack(fixture["replacement"], size)
        handle.seek(fixture["address"] * size); handle.write(replacement)
        after = handle.getvalue(); new = read_record(handle, fixture["address"], size)
        neighbours_unchanged = before[:fixture["address"]*size] == after[:fixture["address"]*size] and before[(fixture["address"]+1)*size:] == after[(fixture["address"]+1)*size:]
        trace += [{"event": "seek_read", "offset": fixture["address"] * size}, {"event": "seek_write", "offset": fixture["address"] * size}]
        return {"status": "UPDATED", "old": old, "new": new, "byte_length": len(after), "neighbours_unchanged": neighbours_unchanged, "trace": trace}
    except (EOFError, UnicodeError, ValueError) as error:
        return {"status": "ADDRESS_ERROR", "message": str(error), "byte_length": len(before), "trace": [{"event": "reject_address"}]}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

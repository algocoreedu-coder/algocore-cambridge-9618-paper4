from pathlib import Path

class Account:
    def __init__(self, balance, limit): self.__balance, self.__limit = balance, limit
    def get_balance(self): return self.__balance
    def set_balance(self, value):
        if not 0 <= value <= self.__limit: return False
        self.__balance = value; return True
    def apply_change(self, delta): return self.set_balance(self.__balance + delta)

def run(fixture):
    account, trace = Account(fixture["start"], fixture["limit"]), []
    old = account.get_balance()
    setter_ok = account.set_balance(fixture["replacement"])
    trace.append({"event": "setter", "success": setter_ok, "balance": account.get_balance()})
    before_update = account.get_balance()
    update_ok = account.apply_change(fixture["delta"])
    trace.append({"event": "rule_update", "success": update_ok, "balance": account.get_balance()})
    return {"status": "OK", "old": old, "balance": account.get_balance(), "setter_ok": setter_ok, "update_ok": update_ok, "preserved_after_failed_update": update_ok or account.get_balance() == before_update, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

from pathlib import Path

class Student:
    def __init__(self, student_id, name, score=0):
        if not isinstance(student_id, int) or student_id < 1 or not isinstance(score, int) or not 0 <= score <= 100:
            raise ValueError("invalid student")
        self.student_id, self.name, self.score = student_id, name, score
    def state(self): return {"student_id": self.student_id, "name": self.name, "score": self.score}

def run(fixture):
    objects, rejected, trace = [], 0, []
    for record in fixture.get("records", []):
        try:
            student = Student(record.get("student_id"), record.get("name", ""), record.get("score", 0))
            objects.append(student); trace.append({"event": "instantiate", "student_id": student.student_id})
        except (TypeError, ValueError):
            rejected += 1; trace.append({"event": "reject_constructor"})
    states = [student.state() for student in objects]
    return {"status": "OK" if rejected == 0 else "PARTIAL_REJECT", "objects": states, "rejected": rejected, "independent_instances": len({id(student) for student in objects}) == len(objects), "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

from pathlib import Path

class Student:
    def __init__(self, student_id, name, score=0):
        valid_id = isinstance(student_id, int) and student_id >= 1
        valid_score = isinstance(score, int) and 0 <= score <= 100
        if not valid_id or not valid_score:
            raise ValueError("invalid student")
        self.student_id = student_id
        self.name = name
        self.score = score

    def state(self):
        return {
            "student_id": self.student_id,
            "name": self.name,
            "score": self.score,
        }

def run(fixture):
    objects = []
    rejected = 0
    trace = []
    for record in fixture.get("records", []):
        try:
            student = Student(record.get("student_id"), record.get("name", ""), record.get("score", 0))
            trace.append({"event": "bind_instance", "student_id": student.student_id})
            objects.append(student)
            trace.append({"event": "instantiate", "student_id": student.student_id})
        except (TypeError, ValueError):
            rejected += 1
            trace.append({"event": "reject_constructor", "object_created": False})
    states = [student.state() for student in objects]
    independent_instances = len({id(student) for student in objects}) == len(objects)
    return {
        "status": "OK" if rejected == 0 else "PARTIAL_REJECT",
        "objects": states,
        "rejected": rejected,
        "independent_instances": independent_instances,
        "trace": trace,
    }

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))

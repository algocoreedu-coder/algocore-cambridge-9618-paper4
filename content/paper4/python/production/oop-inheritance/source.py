from pathlib import Path

class Shape:
    def __init__(self, name):
        self.name = name

    def area(self):
        raise NotImplementedError("subclass must implement area")

class Rectangle(Shape):
    def __init__(self, width, height):
        if width < 0 or height < 0:
            raise ValueError("negative size")
        super().__init__("rectangle")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        if radius < 0:
            raise ValueError("negative size")
        super().__init__("circle")
        self.radius = radius

    def area(self):
        return round(3.14 * self.radius * self.radius, 2)

def run(fixture):
    shapes = []
    rejected = 0
    trace = []
    for record in fixture.get("shapes", []):
        try:
            if record["type"] == "rectangle":
                shape = Rectangle(record["width"], record["height"])
            elif record["type"] == "circle":
                shape = Circle(record["radius"])
            else:
                raise ValueError("unknown shape")
            shapes.append(shape)
            trace.append({"event": "constructor_chain", "runtime_type": type(shape).__name__})
        except (KeyError, ValueError):
            rejected += 1
            trace.append({"event": "reject_subclass"})
    outputs = []
    for shape in shapes:
        area = shape.area()
        outputs.append({"name": shape.name, "area": area})
        trace.append({"event": "dynamic_dispatch", "runtime_type": type(shape).__name__, "method": "area", "result": area})
    return {
        "status": "OK" if rejected == 0 else "REJECTED_INVALID_SUBCLASS",
        "outputs": outputs,
        "rejected": rejected,
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

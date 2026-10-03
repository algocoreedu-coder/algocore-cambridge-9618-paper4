from pathlib import Path
from tempfile import TemporaryDirectory
import shutil

EMPTY = None


class HashTable:
    def __init__(self, size=13):
        self.data = [EMPTY] * size

    def insert(self, member_id):
        start = member_id % len(self.data)
        trace = []
        for offset in range(len(self.data)):
            index = (start + offset) % len(self.data)
            trace.append(index)
            if self.data[index] in (EMPTY, member_id):
                self.data[index] = member_id
                return True, trace
        return False, trace

    def find(self, member_id):
        start = member_id % len(self.data)
        trace = []
        for offset in range(len(self.data)):
            index = (start + offset) % len(self.data)
            trace.append(index)
            if self.data[index] is EMPTY:
                return -1, trace
            if self.data[index] == member_id:
                return index, trace
        return -1, trace


class Member:
    def __init__(self, member_id, points):
        if not 0 <= member_id <= 999999:
            raise ValueError("ID OUT OF RANGE")
        if not 0 <= points <= 999999999999:
            raise ValueError("POINTS OUT OF RANGE")
        self.__member_id = member_id
        self.__points = points

    def get_id(self):
        return self.__member_id

    def get_points(self):
        return self.__points

    def add_points(self, amount):
        if amount <= 0 or self.__points + amount > 999999999999:
            return False
        self.__points += amount
        return True

    def record(self):
        record = f"{self.__member_id:06d},{self.__points:012d}\n"
        if len(record) != 20:
            raise ValueError("RECORD LENGTH ERROR")
        return record

    @classmethod
    def from_record(cls, record):
        if len(record) != 20 or record[6] != "," or record[-1] != "\n":
            raise ValueError("INVALID RECORD FORMAT")
        member_id, points = record.rstrip("\n").split(",")
        if not member_id.isdigit() or not points.isdigit():
            raise ValueError("NON-NUMERIC RECORD")
        return cls(int(member_id), int(points))


def apply_updates(record_path, update_path):
    outcomes = []
    with update_path.open(encoding="utf-8") as updates:
        for line_number, raw in enumerate(updates, 1):
            try:
                fields = [part.strip() for part in raw.split(",")]
                if len(fields) != 2 or not fields[0].isdigit():
                    raise ValueError
                member_id, amount = int(fields[0]), int(fields[1])
                if not 0 <= member_id <= 999999 or amount <= 0:
                    raise ValueError
            except ValueError:
                outcomes.append((line_number, "INVALID UPDATE"))
                continue
            found = False
            with record_path.open("r+", encoding="ascii", newline="") as records:
                position = 0
                while True:
                    records.seek(position)
                    record = records.read(20)
                    if record == "":
                        break
                    member = Member.from_record(record)
                    if member.get_id() == member_id:
                        if not member.add_points(amount):
                            outcomes.append((member_id, "POINTS OVERFLOW"))
                            found = True
                            break
                        records.seek(position)
                        records.write(member.record())
                        found = True
                        outcomes.append((member_id, "UPDATED"))
                        break
                    position += 20
            if not found:
                outcomes.append((member_id, "NOT FOUND"))
    return outcomes


if __name__ == "__main__":
    table = HashTable()
    for value in (26, 39, 14, 27):
        print("insert", value, table.insert(value))
    print("find39", table.find(39))
    print("find40", table.find(40))
    full_table = HashTable(3)
    for value in (0, 1, 2):
        full_table.insert(value)
    print("full_cycle", full_table.insert(3))
    member = Member(101, 40)
    member.add_points(25)
    print("record", repr(member.record()), "length", len(member.record()))
    update_path = Path(__file__).parents[1] / "inputs" / "member_updates.txt"
    supplied_records = Path(__file__).parents[1] / "inputs" / "members.dat"
    with TemporaryDirectory() as temporary:
        record_path = Path(temporary) / "members.dat"
        shutil.copyfile(supplied_records, record_path)
        print("initial_records", record_path.read_text(encoding="ascii").splitlines())
        print("updates", apply_updates(record_path, update_path))
        print("records", record_path.read_text(encoding="ascii").splitlines())
    for member_id, points in ((1000000, 0), (999999, 1000000000000)):
        try:
            Member(member_id, points)
        except ValueError as error:
            print("boundary", member_id, points, str(error))

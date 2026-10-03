from pathlib import Path


class Reading:
    def __init__(self, sensor_id, value):
        self.__sensor_id = sensor_id
        self.__value = value

    def get_sensor_id(self):
        return self.__sensor_id

    def get_value(self):
        return self.__value

    def is_alert(self):
        return self.__value > 80


class TemperatureReading(Reading):
    def __init__(self, sensor_id, value, limit):
        super().__init__(sensor_id, value)
        self.__limit = limit

    def is_alert(self):
        return self.get_value() > self.__limit


def load_readings(filename):
    readings, errors = [], []
    try:
        with filename.open(encoding="utf-8") as source:
            for line_number, raw in enumerate(source, 1):
                try:
                    fields = [field.strip() for field in raw.split(",")]
                    if len(fields) < 2 or fields[1] == "":
                        raise ValueError("empty sensor id")
                    if fields[0] == "NORMAL" and len(fields) == 3:
                        readings.append(Reading(fields[1], float(fields[2])))
                    elif fields[0] == "TEMP" and len(fields) == 4:
                        readings.append(TemperatureReading(fields[1], float(fields[2]), float(fields[3])))
                    else:
                        raise ValueError("bad record type or field count")
                except (ValueError, IndexError) as error:
                    errors.append(f"line {line_number}: {error}")
    except FileNotFoundError:
        errors.append("FILE NOT FOUND")
    return readings, errors


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "inputs" / "readings.txt"
    readings, errors = load_readings(path)
    for item in readings:
        print(item.get_sensor_id(), item.get_value(), "ALERT" if item.is_alert() else "OK")
    print("alert_count", sum(item.is_alert() for item in readings))
    print("errors", errors)

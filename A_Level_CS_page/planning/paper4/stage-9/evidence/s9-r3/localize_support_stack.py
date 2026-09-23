import json
from pathlib import Path


PATH = Path(__file__).with_name("CONTENT_REMEDIATION_SUPPORT_STACK.json")


VI = {
    "binary-search": {
        "trace": [
            "[4,9,15,22,31,48,70], low=0 high=6 mid=3 value=22 → low=4",
            "low=4 high=6 mid=5 value=48 → high=4",
            "low=4 high=4 mid=4 value=31 → trả về 4",
        ],
        "tests": [("target=31", "4"), ("target=4", "0"), ("target=99", "-1")],
        "fixtures": [
            "data=[2,8,14,21,33], target=21; một thân vòng lặp có chỗ trống",
            "data=[5,11,18,26,39,50], target=5",
            "danh sách tăng dần có nhiều giá trị 12; contract cho phép trả bất kỳ chỉ số khớp nào",
        ],
        "artifacts": [
            "mid=(low+high)//2; high=mid-1; low=mid+1",
            "phép tìm kiếm chạy đúng và trace low/mid/high đầy đủ kết thúc tại chỉ số 0",
            "hàm, policy any-match được nêu rõ, ba test và bảng bằng chứng",
        ],
        "reveals": ["sau trace đầu tiên", "sau khi đã nộp một lần", "sau khi tự kiểm"],
        "retrieval": "sau khi viết xong bản tái dựng",
        "marking": [
            "đoạn tìm kiếm không thu nhỏ hoặc loại nhầm một biên hợp lệ",
            "so sánh bộ low/mid/high đầu tiên bị phân kỳ",
            "khôi phục hai biên inclusive rồi chạy lại các test phần tử đầu/cuối/không tìm thấy",
        ],
    },
    "stack": {
        "trace": [
            "khởi tạo top=-1",
            "push A → top=0 data[0]=A",
            "push B,C → top=2",
            "pop → C top=1",
            "pop → B top=0",
        ],
        "tests": [
            ("push A,B,C; pop,pop", "C,B"),
            ("capacity=1; push X; pop", "X và top=-1"),
            ("pop khi rỗng / push khi đầy", "None / False và trạng thái không đổi"),
        ],
        "fixtures": [
            "capacity=3, Top=-1, push K rồi M",
            "các phương thức push/pop còn thiếu guard",
            "kiểm cặp ngoặc cân bằng bằng (), []",
        ],
        "artifacts": [
            "top=0 data[0]=K; top=1 data[1]=M",
            "guard đứng trước mutation và trạng thái không đổi khi thất bại",
            "thuật toán cùng các test cân bằng, đóng sớm và còn ngoặc mở",
        ],
        "reveals": ["sau dự đoán đầu tiên", "sau khi đã nộp một lần", "sau khi tự kiểm"],
        "retrieval": "sau khi viết xong bản tái dựng",
        "marking": [
            "quy ước con trỏ hoặc thứ tự guard phá vỡ LIFO",
            "so sánh trạng thái Top/storage đầu tiên bị phân kỳ",
            "khôi phục một quy ước duy nhất rồi chạy lại test rỗng/đầy/xen kẽ",
        ],
    },
    "random-files": {
        "trace": [
            "ghi tại các offset 0,8,16",
            "seek index 1 → offset 8",
            "đọc byte 8..15 → B305",
        ],
        "tests": [
            ("index=1", "B305"),
            ("index=0 và 2", "A12 và C9"),
            ("index=3", "từ chối trước seek/read"),
        ],
        "fixtures": [
            "SIZE=12, các index 0,1,4",
            "tên dài cố định 10 byte; cập nhật index 2",
            "schema cố định gồm mã học sinh và điểm",
        ],
        "artifacts": [
            "0:0..11; 1:12..23; 4:48..59",
            "pack 10 byte; seek(20); ghi đúng 10 byte",
            "schema, chứng minh kích thước, hai hàm và ba test",
        ],
        "reveals": ["sau phép tính đầu tiên", "sau khi đã nộp một lần", "sau khi tự kiểm"],
        "retrieval": "sau khi viết xong bản tái dựng",
        "marking": [
            "offset hoặc kích thước tuần tự hóa khác contract",
            "so sánh dải byte kỳ vọng với dải byte thực tế",
            "sửa cách đánh số/kích thước rồi chạy lại ca đầu-giữa-cuối-thất bại",
        ],
        "rows": [
            ["record 0, SIZE=8", "0", "byte 0..7"],
            ["record 1, SIZE=8", "8", "byte 8..15"],
            ["record 3, SIZE=8", "24", "byte 24..31"],
        ],
    },
    "exceptions": {
        "trace": [
            "'42' → int thành công → 42",
            "'x' → ValueError → báo lỗi",
            "None → guard trước khi int → báo thiếu",
        ],
        "tests": [
            ("'42'", "(True,42)"),
            ("'0'", "(True,0)"),
            ("'x'/None", "(False,None) mà chương trình không dừng"),
        ],
        "fixtures": [
            "các input '7', 'x', None",
            "hàm parse còn thiếu except cụ thể",
            "pipeline đọc số nguyên tùy chọn từ ba dòng",
        ],
        "artifacts": [
            "bảng outcome có nhãn success/invalid/missing",
            "ValueError handler giữ nguyên lỗi không liên quan",
            "contract, code, log có chủ đích và ba test",
        ],
        "reveals": ["sau dự đoán đầu tiên", "sau khi đã nộp một lần", "sau khi tự kiểm"],
        "retrieval": "sau khi viết xong bản tái dựng",
        "marking": [
            "handler quá rộng hoặc state bị dùng dù conversion thất bại",
            "so sánh outcome đầu tiên khác contract",
            "thu hẹp exception, tách success path rồi chạy lại success/invalid/missing",
        ],
        "rows": [
            ["'42'", "int thành công", "trả 42"],
            ["'x'", "ValueError", "báo invalid"],
            ["None", "guard thiếu", "báo missing"],
        ],
    },
    "performance": {
        "trace": [
            "linear search n=8: tối đa 8 lần so sánh",
            "binary search n=8: tối đa khoảng 4 bước nhưng cần dữ liệu đã sắp",
        ],
        "tests": [
            ("target ở index 2", "linear tìm thấy sau 3 lần so sánh"),
            ("target ở index 0 hoặc 7", "bằng chứng first/last"),
            ("target vắng", "linear n lần; binary kết thúc với interval rỗng"),
        ],
        "fixtures": [
            "n=8; linear worst=8; binary worst≈4",
            "hai bảng timing tại n=1000 và 2000",
            "nhiều query trên dữ liệu ít thay đổi",
        ],
        "artifacts": [
            "bảng bước có assumptions",
            "ratio cùng nhận định growth có điều kiện",
            "lựa chọn, setup cost, three-case evidence và giới hạn",
        ],
        "reveals": ["sau ước lượng đầu tiên", "sau khi đã nộp một lần", "sau khi tự kiểm"],
        "retrieval": "sau khi viết xong bản tái dựng",
        "marking": [
            "kết luận nhanh/chậm thiếu cùng input hoặc bỏ qua điều kiện tiên quyết",
            "so sánh assumptions, operation count và test case",
            "căn chỉnh fixture, nêu setup cost rồi lặp lại đo/đếm",
        ],
        "rows": [
            ["tìm một lần trong danh sách nhỏ chưa sắp", "không", "linear search"],
            ["nhiều query trên dữ liệu tĩnh", "có thể", "sort một lần rồi binary search"],
            ["membership thay đổi thường xuyên", "tùy cấu trúc", "đánh giá update và query cùng nhau"],
        ],
    },
    "graphs": {
        "trace": [
            "khởi tạo năm set rỗng",
            "A-B cập nhật cả A và B",
            "A-C cập nhật cả A và C",
            "B-D cập nhật cả B và D; E vẫn rỗng",
        ],
        "tests": [
            ("neighbors(A)", "B,C"),
            ("neighbors(E)", "rỗng"),
            ("thêm edge tới F chưa tồn tại", "từ chối hoặc chỉ tạo nếu contract đã nêu"),
        ],
        "fixtures": [
            "các edge vô hướng P-Q, Q-R; các vertex P,Q,R,S",
            "các edge có hướng và trọng số A→B:5, B→A:2, B→C:7",
            "10.000 vertex, 25.000 edge, thường xuyên duyệt neighbor",
        ],
        "artifacts": [
            "P:{Q}; Q:{P,R}; R:{Q}; S:{}",
            "hai biểu diễn chính xác cùng sentinel no-edge rõ ràng",
            "lý giải adjacency list cùng test normal/isolated/cycle/missing",
        ],
        "reveals": ["sau bảng đầu tiên", "sau khi đã nộp một lần", "sau khi tự kiểm"],
        "retrieval": "sau khi viết xong bản tái dựng",
        "marking": [
            "biểu diễn mâu thuẫn với contract về hướng, trọng số hoặc tập vertex",
            "so sánh adjacency entry đầu tiên bị thiếu/thừa",
            "dựng lại edge đó rồi chạy lại test đối xứng/cô lập/thiếu vertex",
        ],
        "rows": [
            ["sparse, cần duyệt neighbor", "bộ nhớ O(V+E)", "bộ nhớ V²", "list"],
            ["dense, thường xuyên kiểm edge", "quét/tìm neighbor", "truy cập trực tiếp cell", "matrix"],
            ["weighted sparse", "lưu (neighbor,weight)", "cell weight/sentinel", "list"],
        ],
    },
}


def localized(vi, en):
    return {"vi": vi, "en": en}


data = json.loads(PATH.read_text(encoding="utf-8"))
for lesson in data["lessons"]:
    slug = lesson["slug"]
    spec = VI[slug]
    blocks = {block["kind"]: block for block in lesson["blocks"]}
    worked = blocks["worked-example"]["workedExample"]
    worked["trace"] = [localized(vi, en) for vi, en in zip(spec["trace"], worked["trace"])]
    if not isinstance(worked["expectedOutput"], dict):
        worked["expectedOutput"] = localized(worked["expectedOutput"], worked["expectedOutput"])
    for test, (vi_input, vi_expected) in zip(worked["tests"], spec["tests"]):
        test["input"] = localized(vi_input, test["input"])
        test["expected"] = localized(vi_expected, test["expected"])

    for item, vi_fixture, vi_artifact, vi_reveal in zip(
        blocks["practice"]["practiceItems"], spec["fixtures"], spec["artifacts"], spec["reveals"]
    ):
        item["fixture"] = localized(vi_fixture, item["fixture"])
        item["expectedArtifact"] = localized(vi_artifact, item["expectedArtifact"])
        item["revealRule"] = localized(vi_reveal, item["revealRule"])

    retrieval = blocks["retrieval"]["retrievalItem"]
    retrieval["revealRule"] = localized(spec["retrieval"], retrieval["revealRule"])

    marking = blocks["marking-pitfalls"]["markingChain"]
    for key, vi in zip(("error", "detection", "repair"), spec["marking"]):
        marking[key] = localized(vi, marking[key])

    static_table = blocks["action-view"].get("staticTable")
    if static_table:
        static_table["rows"] = [localized(vi, en) for vi, en in zip(spec["rows"], static_table["rows"])]

data["self_check"]["nested_bilingual"] = "PASS"
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

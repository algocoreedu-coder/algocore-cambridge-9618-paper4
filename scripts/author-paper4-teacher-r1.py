from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROJECTIONS = ROOT / "app" / "data" / "paper4-v2" / "learner-projections"
AUDIT = ROOT.parent / "planning" / "paper4" / "comprehensive-audit-2026-10-02" / "CONTENT_ALIGNMENT_REVIEW.json"
CROSSWALK = ROOT / "content" / "paper4" / "teacher" / "visible-assessment-crosswalk.json"
STAGES = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"]


def L(en: str, vi: str) -> dict[str, str]:
    return {"en": en, "vi": vi}


CFG = {
    "binary-tree": {
        "title": L("Binary tree operations", "Thao tác trên cây nhị phân"),
        "family": L("Binary trees: insert, search and traverse", "Cây nhị phân: chèn, tìm và duyệt"),
        "promise": L("Read a tree question, follow one branch at a time, and write or trace insertion, search and traversal without losing links.", "Đọc câu hỏi về cây, đi từng nhánh và viết hoặc trace thao tác chèn, tìm, duyệt mà không làm mất liên kết."),
        "cues": L("insert, search, root, left child, right child, in-order", "insert, search, root, left child, right child, in-order"),
        "pre": L("Know the root reference, null-pointer value and the ordering rule stated by the question.", "Biết root reference, null-pointer value và quy tắc thứ tự đề cho."),
        "output": L("Return the requested position/result and preserve every existing child link.", "Trả vị trí/kết quả đề yêu cầu và giữ mọi child link đang có."),
        "model": L("At each node make exactly one comparison, then move left, move right or stop. A traversal follows its named visit order.", "Tại mỗi node chỉ so sánh một lần rồi đi trái, đi phải hoặc dừng. Phép duyệt tuân đúng thứ tự được nêu."),
        "rules": [L("Values smaller than the current node follow the left link; larger values follow the right link.", "Giá trị nhỏ hơn node hiện tại đi theo left link; lớn hơn đi theo right link."), L("Stop search at a match or null link; never follow both branches.", "Dừng tìm khi gặp giá trị hoặc null link; không đi đồng thời hai nhánh."), L("For in-order traversal, visit left subtree, node, then right subtree.", "Với in-order, duyệt cây con trái, node rồi cây con phải.")],
        "invariant": L("Every live node remains reachable from the root and the ordering rule holds after an insertion.", "Mọi node đang dùng vẫn đi tới được từ root và quy tắc thứ tự vẫn đúng sau khi chèn."),
        "code": ["while current != NULL:", "    if target == data[current]:", "        return current", "    current = left[current] if target < data[current] else right[current]", "return NULL"],
        "practice": [
            ("Guided", "Trace one search", "In the tree 40 with children 20 and 60, trace the search for 60 and record each comparison.", "Trace phép tìm 60 trong cây có root 40, hai con 20 và 60; ghi từng comparison.", "Compare 60 with 40, move right, compare with 60, then return that node.", "So sánh 60 với 40, đi phải, so với 60 rồi trả node đó."),
            ("Faded", "Insert at a null link", "Insert 50 into the same tree. State the branch decisions and the single link that changes.", "Chèn 50 vào cây trên. Nêu quyết định nhánh và một link duy nhất thay đổi.", "40: right; 60: left; replace the null left link of 60 with the new node.", "40: phải; 60: trái; thay null left link của 60 bằng node mới."),
            ("Independent", "Traverse without skipping", "Give the in-order sequence after inserting 50, then explain why it is ordered.", "Nêu chuỗi in-order sau khi chèn 50 rồi giải thích vì sao chuỗi có thứ tự.", "20, 40, 50, 60; each subtree obeys left < node < right.", "20, 40, 50, 60; mỗi cây con tuân left < node < right.")],
    },
    "dictionary": {
        "title": L("Dictionary ADT", "Kiểu dữ liệu trừu tượng dictionary"),
        "family": L("Dictionary operations and ADT choice", "Thao tác dictionary và lựa chọn ADT"),
        "promise": L("Recognise key-value questions, select the required dictionary operation, and clearly distinguish the abstract contract from one possible internal Python representation.", "Nhận diện câu hỏi key-value, chọn đúng thao tác dictionary và phân biệt rõ hợp đồng trừu tượng với một cách biểu diễn nội bộ bằng Python."),
        "cues": L("key, value, lookup, insert, update, delete, membership", "key, value, lookup, insert, update, delete, membership"),
        "pre": L("Keys are unique under the question's comparison rule.", "Key là duy nhất theo quy tắc so sánh của đề."),
        "output": L("Perform the requested operation and state what happens for a missing or duplicate key.", "Thực hiện thao tác đề yêu cầu và nêu kết quả với key thiếu hoặc trùng."),
        "model": L("A dictionary promises operations on key-value pairs. Its contract does not force a hash table, tree or Python dict implementation.", "Dictionary cung cấp thao tác trên cặp key-value. Hợp đồng không bắt buộc dùng hash table, tree hay Python dict."),
        "rules": [L("Lookup uses a key and returns the associated value or the stated not-found result.", "Lookup dùng key và trả value tương ứng hoặc kết quả not-found đã quy định."), L("Update changes the value for an existing key without creating a second copy.", "Update đổi value của key có sẵn mà không tạo bản sao thứ hai."), L("Choose an implementation only after the required operations and constraints are clear.", "Chỉ chọn cách cài đặt sau khi rõ thao tác và ràng buộc đề yêu cầu.")],
        "invariant": L("Each live key has exactly one associated value.", "Mỗi key đang tồn tại có đúng một value đi kèm."),
        "code": ["records[key] = value", "if key in records:", "    result = records[key]", "else:", "    result = None"],
        "practice": [
            ("Guided", "Name the operation", "A task supplies a student ID and asks for the stored name. Name the dictionary operation and its input.", "Đề cho student ID và yêu cầu tên đã lưu. Nêu thao tác dictionary và input.", "Lookup; the input is the student ID key.", "Lookup; input là key student ID."),
            ("Faded", "Protect unique keys", "Update key 104 from 'Mai' to 'Lan'. Explain why the dictionary size does not change.", "Update key 104 từ 'Mai' thành 'Lan'. Giải thích vì sao kích thước dictionary không đổi.", "The existing value is replaced; no new key is inserted.", "Value hiện tại được thay; không chèn key mới."),
            ("Independent", "Choose a representation", "A question needs frequent lookup by unique ID and states no collision policy. State the ADT and what remains unspecified.", "Câu hỏi cần lookup thường xuyên theo ID duy nhất nhưng không nêu collision policy. Nêu ADT và phần chưa được quy định.", "Use the dictionary ADT; the internal representation and any collision method remain unspecified.", "Dùng dictionary ADT; biểu diễn bên trong và cách xử lý collision chưa được quy định.")],
    },
    "hashing": {
        "title": L("Hashing as supporting technique", "Hashing như một kỹ thuật hỗ trợ"),
        "family": L("Hash function, collision policy and search", "Hash function, xử lý collision và tìm kiếm"),
        "promise": L("Apply only the hash function and collision rule supplied by a question, then trace probes without treating one policy as universal.", "Chỉ áp dụng hash function và collision rule đề cho, rồi trace các probe mà không coi một policy là quy tắc chung."),
        "cues": L("hash function, address, slot, collision, linear probing, overflow", "hash function, address, slot, collision, linear probing, overflow"),
        "pre": L("The table size, hash function, empty marker and collision rule are stated.", "Kích thước bảng, hash function, empty marker và collision rule đã được nêu."),
        "output": L("Give the visited addresses and final found, inserted or full result.", "Nêu các address đã xét và kết quả found, inserted hoặc full."),
        "model": L("The hash function proposes an address. A collision rule decides where to look next; that rule belongs to the current question.", "Hash function đề xuất một address. Collision rule quyết định nơi xét tiếp; quy tắc đó thuộc câu hỏi hiện tại."),
        "rules": [L("Normalise the key exactly as instructed before calculating the address.", "Chuẩn hóa key đúng như đề trước khi tính address."), L("On collision, follow the supplied probe sequence and stop after at most one full table cycle.", "Khi collision, theo đúng probe sequence và dừng sau tối đa một vòng bảng."), L("Search and insertion must use the same collision policy.", "Search và insertion phải dùng cùng collision policy.")],
        "invariant": L("No occupied slot is overwritten and every probe stays within table bounds.", "Không ghi đè slot đã dùng và mọi probe nằm trong giới hạn bảng."),
        "code": ["address = key % len(table)", "start = address", "while table[address] is not None:", "    address = (address + 1) % len(table)", "    if address == start: return False"],
        "practice": [
            ("Guided", "Calculate the first address", "For table size 7 and key 24, calculate key MOD 7.", "Với bảng kích thước 7 và key 24, tính key MOD 7.", "The first address is 3.", "Address đầu là 3."),
            ("Faded", "Trace a collision", "Slots 3 and 4 are occupied. Using linear probing, state the next tested slot and stopping condition.", "Slot 3 và 4 đã dùng. Với linear probing, nêu slot xét tiếp và điều kiện dừng.", "Test slot 5; stop at an empty slot, a matching key, or after returning to the start.", "Xét slot 5; dừng ở slot rỗng, key khớp hoặc khi quay lại vị trí đầu."),
            ("Independent", "Respect the supplied policy", "A new question uses a separate overflow area. Explain why the previous linear-probing trace cannot be reused unchanged.", "Câu hỏi mới dùng overflow area riêng. Giải thích vì sao không thể dùng nguyên trace linear probing trước đó.", "The collision rule changes the next address and stopping path, so the trace must follow the supplied overflow rule.", "Collision rule làm đổi address tiếp theo và đường dừng nên trace phải theo overflow rule được cho.")],
    },
    "oop-model": {
        "title": L("Designing classes and objects", "Thiết kế class và object"),
        "family": L("OOP class design, constructors and instances", "Thiết kế class, constructor và instance"),
        "promise": L("Turn a problem statement into a small class design, then write a constructor and create independent instances with the required attributes.", "Chuyển yêu cầu thành thiết kế class nhỏ, rồi viết constructor và tạo các instance độc lập với đúng attribute."),
        "cues": L("class, object, instance, attribute, constructor, method", "class, object, instance, attribute, constructor, method"),
        "pre": L("Identify which data belongs to one object and which actions use or change that data.", "Xác định dữ liệu thuộc về một object và thao tác nào dùng hoặc thay đổi dữ liệu đó."),
        "output": L("Provide the class header, constructor assignments and requested instance creation.", "Cung cấp class header, constructor assignment và lệnh tạo instance được yêu cầu."),
        "model": L("A class is a blueprint; each instance owns its own attribute state. The constructor establishes a valid starting state.", "Class là bản thiết kế; mỗi instance có attribute state riêng. Constructor tạo trạng thái ban đầu hợp lệ."),
        "rules": [L("Choose attributes from object-specific nouns in the problem, not every local variable.", "Chọn attribute từ danh từ mô tả object, không lấy mọi local variable."), L("Assign every required constructor parameter to the intended instance attribute.", "Gán mọi constructor parameter bắt buộc vào đúng instance attribute."), L("Create separate instances when the scenario describes separate real objects.", "Tạo instance riêng khi tình huống mô tả các đối tượng khác nhau.")],
        "invariant": L("Constructed objects contain all required attributes and changing one instance does not alter another.", "Object đã tạo có đủ attribute bắt buộc và thay đổi một instance không làm đổi instance khác."),
        "code": ["class Book:", "    def __init__(self, title, pages):", "        self.title = title", "        self.pages = pages", "book = Book('Algorithms', 240)"],
        "requirements": ["syl-20.1-08", "syl-20.1-10", "syl-20.1-17", "syl-20.1-18"],
        "practice": [
            ("Guided", "Extract a class design", "A library stores each book's title and page count. Name the class, attributes and constructor parameters.", "Thư viện lưu title và page count của mỗi sách. Nêu class, attribute và constructor parameter.", "Class Book; attributes title and pages; constructor parameters title and pages.", "Class Book; attribute title và pages; constructor parameter title và pages."),
            ("Faded", "Create two instances", "Create two Book objects and state which values are independent.", "Tạo hai object Book và nêu value nào độc lập.", "Each object has its own title and pages state.", "Mỗi object có title và pages state riêng."),
            ("Independent", "Design before coding", "Design a Player class from a short prompt containing name, score and an add_score action, then write the constructor.", "Thiết kế class Player từ prompt có name, score và thao tác add_score, rồi viết constructor.", "Use attributes name and score; the constructor assigns both to self. add_score is an instance method.", "Dùng attribute name và score; constructor gán cả hai vào self. add_score là instance method.")],
    },
    "oop-state": {
        "title": L("Encapsulation and controlled state", "Đóng gói và kiểm soát trạng thái"),
        "family": L("Getters, setters and rule-based updates", "Getter, setter và cập nhật theo quy tắc"),
        "promise": L("Trace object state through getters, setters and update methods, keeping validation beside every state change that the class rule protects.", "Trace trạng thái object qua getter, setter và update method, đặt validation cạnh mọi thay đổi trạng thái được class rule bảo vệ."),
        "cues": L("private attribute, getter, setter, validation, update method", "private attribute, getter, setter, validation, update method"),
        "pre": L("Know the valid state range and the public method contract.", "Biết miền trạng thái hợp lệ và hợp đồng của public method."),
        "output": L("Return the stated success/result and leave invalid updates without mutation.", "Trả success/result đã quy định và không mutation khi update không hợp lệ."),
        "model": L("Encapsulation routes state changes through methods so one rule protects every caller.", "Encapsulation đưa thay đổi state qua method để một quy tắc bảo vệ mọi caller."),
        "rules": [L("Read state through the requested getter rather than exposing the storage decision.", "Đọc state qua getter được yêu cầu thay vì lộ cách lưu."), L("Validate before assigning a new value.", "Validate trước khi gán value mới."), L("On rejection, preserve the complete previous state.", "Khi từ chối, giữ nguyên toàn bộ state trước đó.")],
        "invariant": L("The stored state always satisfies the class rule.", "State được lưu luôn thỏa quy tắc của class."),
        "code": ["def set_score(self, value):", "    if 0 <= value <= 100:", "        self.__score = value", "        return True", "    return False"],
        "requirements": ["syl-20.1-14"],
        "practice": [
            ("Guided", "Trace an accepted update", "A score is 60. Trace set_score(75) and give the final state.", "Score đang là 60. Trace set_score(75) và nêu state cuối.", "The range check passes, the score becomes 75 and the method returns True.", "Range check đạt, score thành 75 và method trả True."),
            ("Faded", "Reject without mutation", "Trace set_score(120). State the returned value and stored score.", "Trace set_score(120). Nêu return và score được lưu.", "Return False; the stored score remains 75.", "Trả False; score vẫn là 75."),
            ("Independent", "Place the rule", "Explain why checking score only in the user-interface code does not provide the same protection.", "Giải thích vì sao chỉ kiểm tra score trong code giao diện không bảo vệ tương đương.", "Other callers could bypass that check; validation in the method protects every call path.", "Caller khác có thể bỏ qua check; validation trong method bảo vệ mọi call path.")],
    },
    "oop-inheritance": {
        "title": L("Inheritance and method overriding", "Kế thừa và ghi đè method"),
        "family": L("Base classes, subclasses and dispatch", "Base class, subclass và dispatch"),
        "promise": L("Read an inheritance relationship, initialise base and subclass state correctly, and accurately trace which overridden method runs for each constructed object.", "Đọc quan hệ kế thừa, khởi tạo đúng state của base/subclass và trace chính xác method ghi đè nào chạy với từng object đã tạo."),
        "cues": L("is-a, superclass, subclass, inherited attribute, override", "is-a, superclass, subclass, inherited attribute, override"),
        "pre": L("The subclass has a valid is-a relationship with the base class.", "Subclass có quan hệ is-a hợp lệ với base class."),
        "output": L("Construct the object and produce the result of the method selected for its runtime class.", "Tạo object và cho kết quả method được chọn theo class thực tế của object."),
        "model": L("A subclass reuses the base contract and may replace a method while keeping a compatible interface.", "Subclass tái dùng base contract và có thể thay method nhưng vẫn giữ interface tương thích."),
        "rules": [L("Initialise inherited state through the base constructor when required.", "Khởi tạo inherited state qua base constructor khi cần."), L("Keep an overridden method's parameters and return meaning compatible.", "Giữ parameter và ý nghĩa return của overridden method tương thích."), L("Select the method from the object's actual class.", "Chọn method theo class thực tế của object.")],
        "invariant": L("Every constructed subclass object satisfies both base and subclass state requirements.", "Mọi subclass object đã tạo thỏa yêu cầu state của cả base và subclass."),
        "code": ["class Ebook(Book):", "    def __init__(self, title, size_mb):", "        super().__init__(title)", "        self.size_mb = size_mb", "    def describe(self): return 'digital'"],
        "practice": [
            ("Guided", "Follow constructor order", "For Ebook('Trees', 4), list the base and subclass assignments in order.", "Với Ebook('Trees', 4), liệt kê assignment của base và subclass theo thứ tự.", "The base constructor assigns title; then the subclass assigns size_mb.", "Base constructor gán title; sau đó subclass gán size_mb."),
            ("Faded", "Choose the overridden method", "Book.describe returns 'book'; Ebook.describe returns 'digital'. What does an Ebook object return?", "Book.describe trả 'book'; Ebook.describe trả 'digital'. Object Ebook trả gì?", "It returns 'digital' because dispatch uses the Ebook override.", "Nó trả 'digital' vì dispatch dùng override của Ebook."),
            ("Independent", "Test the is-a claim", "Decide whether Library should inherit from Book or contain Book objects, and justify the choice.", "Quyết định Library nên kế thừa Book hay chứa các Book object, rồi giải thích.", "Library is not a kind of Book; it should contain or aggregate Book objects.", "Library không phải một loại Book; nó nên chứa hoặc aggregate các Book object.")],
    },
    "oop-aggregation": {
        "title": L("Aggregation and capacity-bound collections", "Aggregation và collection giới hạn dung lượng"),
        "family": L("Has-a relationships and controlled add methods", "Quan hệ has-a và add method có kiểm soát"),
        "promise": L("Model a has-a relationship, trace object references, and write a controlled add method that respects capacity without losing existing stored objects.", "Mô hình hóa quan hệ has-a, trace object reference và viết add method có kiểm soát, tuân dung lượng mà không làm mất object đã lưu."),
        "cues": L("has-a, contains, collection attribute, capacity, add method", "has-a, contains, collection attribute, capacity, add method"),
        "pre": L("The contained object is valid and the owner collection has a stated capacity.", "Object được chứa hợp lệ và collection của owner có capacity đã nêu."),
        "output": L("Add exactly one reference on success or report full with unchanged state.", "Thêm đúng một reference khi thành công hoặc báo full và giữ state."),
        "model": L("Aggregation stores references to separate objects; the owner does not become a subclass of the contained type.", "Aggregation lưu reference tới object riêng; owner không trở thành subclass của kiểu được chứa."),
        "rules": [L("Check capacity before appending.", "Kiểm tra capacity trước khi append."), L("Store the supplied object reference, not a duplicated partial record.", "Lưu reference của object được cho, không tạo bản ghi thiếu."), L("A rejected add leaves count and collection unchanged.", "Add bị từ chối giữ nguyên count và collection.")],
        "invariant": L("The stored count equals the number of contained objects and never exceeds capacity.", "Count bằng số object được chứa và không vượt capacity."),
        "code": ["def add_book(self, book):", "    if len(self.books) >= self.capacity:", "        return False", "    self.books.append(book)", "    return True"],
        "practice": [
            ("Guided", "Draw the object graph", "A Library contains two Book objects. State the has-a direction and object count.", "Library chứa hai Book object. Nêu hướng has-a và số object.", "Library has Books; there is one Library and two separate Book objects.", "Library has Books; có một Library và hai Book object riêng."),
            ("Faded", "Trace a successful add", "Capacity is 3 and two books are stored. Trace adding one valid Book.", "Capacity là 3 và đang có hai sách. Trace việc thêm một Book hợp lệ.", "The guard is false, one reference is appended, count becomes 3 and True is returned.", "Guard false, thêm một reference, count thành 3 và trả True."),
            ("Independent", "Protect the full boundary", "Try another add when count equals capacity and prove that state is unchanged.", "Thử add khi count bằng capacity và chứng minh state không đổi.", "Return False before append; count and all stored references remain unchanged.", "Trả False trước append; count và mọi reference giữ nguyên.")],
    },
    "text-files": {
        "title": L("Text-file processing", "Xử lý text file"),
        "family": L("Read, write, append and organised file processing", "Đọc, ghi, nối và xử lý tổ chức file"),
        "promise": L("Choose the correct file mode, process complete records safely, and clearly distinguish serial storage from key-ordered sequential file organisation in questions.", "Chọn đúng file mode, xử lý record hoàn chỉnh an toàn và phân biệt rõ serial storage với tổ chức sequential file theo key trong câu hỏi."),
        "cues": L("open, read, write, append, line, record, serial, sequential", "open, read, write, append, line, record, serial, sequential"),
        "pre": L("Know the file name, record format, mode and expected missing-file behaviour.", "Biết file name, record format, mode và hành vi khi thiếu file."),
        "output": L("Produce the requested records and close the file even when processing fails.", "Tạo các record được yêu cầu và đóng file kể cả khi xử lý lỗi."),
        "model": L("The mode controls whether content is read, replaced or extended. File organisation describes record order, not the loop used to read.", "Mode quyết định đọc, thay hoặc nối nội dung. File organisation mô tả thứ tự record, không phải vòng lặp đọc."),
        "rules": [L("Use read mode for existing input, write mode to replace/create, and append mode to add at the end.", "Dùng read mode cho input có sẵn, write để thay/tạo, append để nối cuối."), L("Write one complete record with its line separator.", "Ghi một record hoàn chỉnh kèm line separator."), L("Serial records follow arrival order; sequential records are maintained in key order.", "Serial record theo thứ tự đến; sequential record được duy trì theo thứ tự key.")],
        "invariant": L("Each accepted record is written exactly once in the required format and mode.", "Mỗi record hợp lệ được ghi đúng một lần theo format và mode yêu cầu."),
        "code": ["with open('scores.txt', 'a', encoding='utf-8') as file:", "    file.write(name + ',' + str(score) + '\\n')", "with open('scores.txt', 'r', encoding='utf-8') as file:", "    for line in file:", "        fields = line.rstrip('\\n').split(',')"],
        "requirements": ["syl-10.3-01", "syl-20.2-02", "syl-20.2-03", "syl-20.2-06", "syl-20.2-07", "syl-20.2-08"],
        "practice": [
            ("Guided", "Choose the mode", "Choose the mode for replacing yesterday's report, then for adding today's record.", "Chọn mode để thay report hôm qua, rồi để thêm record hôm nay.", "Use 'w' to replace/create and 'a' to append.", "Dùng 'w' để thay/tạo và 'a' để nối."),
            ("Faded", "Write one record", "Write name 'Asha' and score 73 as one comma-separated line including the line ending.", "Ghi name 'Asha' và score 73 thành một dòng phân cách bằng dấu phẩy, có line ending.", "file.write('Asha,73\\n') writes one complete record.", "file.write('Asha,73\\n') ghi một record hoàn chỉnh."),
            ("Independent", "Separate organisation from access", "Explain whether arrival-order data is serial or sequential, then state the extra rule for sequential organisation by ID.", "Giải thích dữ liệu theo thứ tự đến là serial hay sequential, rồi nêu quy tắc thêm cho sequential theo ID.", "Arrival order is serial. Sequential organisation keeps records ordered by the chosen key such as ID.", "Thứ tự đến là serial. Sequential giữ record theo thứ tự key đã chọn như ID.")],
    },
    "object-files": {
        "title": L("Creating objects from file records", "Tạo object từ record trong file"),
        "family": L("Parse, validate and construct objects", "Parse, validate và tạo object"),
        "promise": L("Parse each complete file record, validate fields before construction, and build the correct object or subclass without accepting invalid state.", "Parse từng record hoàn chỉnh, validate field trước khi tạo và dựng đúng object hoặc subclass mà không nhận state sai."),
        "cues": L("record fields, object construction, subclass tag, lookup, update", "record field, tạo object, subclass tag, lookup, update"),
        "pre": L("The delimiter, field order, type rules and class tag values are known.", "Đã biết delimiter, thứ tự field, type rule và class tag."),
        "output": L("Create one valid object per accepted record and report or skip malformed records as specified.", "Tạo một object hợp lệ cho mỗi record được nhận và báo hoặc bỏ record lỗi theo đề."),
        "model": L("A file line is text until parsing and validation succeed; only then should it become an object.", "Dòng file chỉ là text cho tới khi parse và validate thành công; sau đó mới tạo object."),
        "rules": [L("Check field count before indexing fields.", "Kiểm tra số field trước khi lấy theo index."), L("Convert and range-check numeric fields before calling the constructor.", "Convert và range-check field số trước khi gọi constructor."), L("Use the type tag to select the correct class, then store the returned object.", "Dùng type tag để chọn đúng class rồi lưu object được tạo.")],
        "invariant": L("Every object in the collection satisfies its constructor and domain rules.", "Mọi object trong collection thỏa constructor và domain rule."),
        "code": ["fields = line.rstrip('\\n').split(',')", "if len(fields) != 3:", "    continue", "title, kind, pages_text = fields", "book = Ebook(title, int(pages_text)) if kind == 'E' else Book(title, int(pages_text))"],
        "requirements": ["syl-20.1-19"],
        "practice": [
            ("Guided", "Parse before construction", "Parse 'Trees,E,180' into fields and choose the class.", "Parse 'Trees,E,180' thành các field và chọn class.", "Fields are Trees, E and 180; the E tag selects Ebook after 180 is converted and validated.", "Field là Trees, E và 180; tag E chọn Ebook sau khi 180 được convert và validate."),
            ("Faded", "Reject invalid state", "A record contains pages -5. State the first safe action and whether an object is created.", "Record có pages -5. Nêu hành động an toàn đầu tiên và có tạo object không.", "Reject the record after range validation; create no object.", "Từ chối record sau range validation; không tạo object."),
            ("Independent", "Preserve class behaviour", "Read one Book and one Ebook record, construct both and explain why a plain dictionary is not the same result.", "Đọc một record Book và một Ebook, tạo cả hai rồi giải thích vì sao dictionary thường không cho kết quả tương đương.", "The objects retain their class methods and dispatch; a plain dictionary only stores fields.", "Object giữ class method và dispatch; dictionary thường chỉ lưu field.")],
    },
    "random-files": {
        "title": L("Direct-access fixed-record model", "Mô hình direct-access record cố định"),
        "family": L("Record address, fixed size and safe update", "Record address, kích thước cố định và update an toàn"),
        "promise": L("Calculate a direct record address, seek to the correct position, and update one fixed-size record while preserving every neighbouring record.", "Tính direct record address, seek đúng vị trí và update một fixed-size record mà vẫn giữ mọi record lân cận."),
        "cues": L("random file, direct access, fixed record length, seek, address", "random file, direct access, fixed record length, seek, address"),
        "pre": L("Record number, first-record convention, record size and encoding are fixed.", "Record number, quy ước record đầu, record size và encoding đã cố định."),
        "output": L("Read or replace exactly the requested record at its calculated byte position.", "Đọc hoặc thay đúng record được yêu cầu tại byte position đã tính."),
        "model": L("Equal-size records make address calculation possible. The classroom byte model illustrates direct access; supplied examination files are text, not binary inputs.", "Record cùng kích thước cho phép tính address. Mô hình byte minh họa direct access; file đề cung cấp là text, không phải binary input."),
        "rules": [L("Use one consistent zero-based or one-based record-number convention.", "Dùng nhất quán quy ước record number bắt đầu từ 0 hoặc 1."), L("Calculate address before seek: index multiplied by fixed record size.", "Tính address trước seek: index nhân fixed record size."), L("Encode every replacement to exactly the fixed size or reject it.", "Mã hóa mọi replacement đúng fixed size hoặc từ chối.")],
        "invariant": L("An update changes exactly one fixed-size record and leaves file length and neighbouring records unchanged.", "Update đổi đúng một fixed-size record và giữ file length cùng record lân cận."),
        "code": ["address = record_index * RECORD_SIZE", "file.seek(address)", "raw = file.read(RECORD_SIZE)", "replacement = encode_fixed(record)", "file.seek(address); file.write(replacement)"],
        "practice": [
            ("Guided", "Calculate an address", "Records are 20 bytes and numbering is zero-based. Calculate the address of record 4.", "Record dài 20 byte và numbering bắt đầu từ 0. Tính address của record 4.", "4 * 20 = byte address 80.", "4 * 20 = byte address 80."),
            ("Faded", "Protect fixed size", "A replacement encodes to 18 bytes. State why writing it directly is unsafe.", "Replacement mã hóa thành 18 byte. Nêu vì sao ghi trực tiếp không an toàn.", "It would break the fixed-record layout unless padded by the declared format; otherwise reject it.", "Nó phá fixed-record layout nếu không được pad theo format; nếu không thì phải từ chối."),
            ("Independent", "State the model boundary", "Explain what this byte-address model teaches and what you should expect from supplied examination source files.", "Giải thích mô hình byte-address dạy điều gì và nên mong đợi loại source file nào từ đề.", "It teaches direct address calculation and fixed-size updates; supplied source files are text rather than binary files.", "Nó dạy tính direct address và fixed-size update; source file đề cung cấp là text thay vì binary file.")],
    },
    "exceptions": {
        "title": L("Exception handling and recovery", "Xử lý exception và phục hồi"),
        "family": L("Focused try, except and cleanup", "Try, except tập trung và cleanup"),
        "promise": L("Place risky operations inside a focused try block, catch expected failures specifically, and preserve a clear recovery or cleanup path for every outcome.", "Đặt thao tác rủi ro trong try tập trung, bắt cụ thể lỗi dự kiến và giữ recovery hoặc cleanup path rõ ràng cho mọi outcome."),
        "cues": L("try, except, finally, invalid conversion, missing file, recovery", "try, except, finally, conversion lỗi, thiếu file, recovery"),
        "pre": L("Identify the exact operation that can fail and the expected exception type.", "Xác định đúng thao tác có thể lỗi và exception type dự kiến."),
        "output": L("Return or display the required recovery result without hiding unrelated programming errors.", "Trả hoặc hiển thị recovery result được yêu cầu mà không che lỗi lập trình không liên quan."),
        "model": L("Keep the try block narrow: protect the risky operation, handle known failures and let unexpected defects remain visible.", "Giữ try block hẹp: bảo vệ thao tác rủi ro, xử lý lỗi đã biết và để lỗi bất ngờ được nhìn thấy."),
        "rules": [L("Catch a specific expected exception when possible.", "Bắt exception dự kiến cụ thể khi có thể."), L("Do not continue with an uninitialised result after failure.", "Không tiếp tục với result chưa khởi tạo sau lỗi."), L("Use context managers or finally when cleanup must always occur.", "Dùng context manager hoặc finally khi cleanup luôn phải xảy ra.")],
        "invariant": L("Each execution path either produces a valid result or an explicit recovery outcome.", "Mỗi execution path tạo result hợp lệ hoặc recovery outcome rõ ràng."),
        "code": ["try:", "    score = int(text)", "except ValueError:", "    score = None", "    print('Invalid score')"],
        "practice": [
            ("Guided", "Catch the conversion failure", "Trace int('seven') and state which except block should run.", "Trace int('seven') và nêu except block nào chạy.", "int raises ValueError, so the ValueError handler supplies the recovery result.", "int phát sinh ValueError nên handler ValueError cung cấp recovery result."),
            ("Faded", "Keep try narrow", "Choose whether printing a menu belongs inside the same try as opening a file, and justify.", "Chọn việc print menu có nên nằm trong cùng try với open file không và giải thích.", "Keep only the file operation and dependent read in the focused try; unrelated display code stays outside.", "Chỉ đặt file operation và read phụ thuộc trong try tập trung; display code không liên quan ở ngoài."),
            ("Independent", "Recover and clean up", "Design a read operation for a possibly missing file and state the success, missing-file and cleanup paths.", "Thiết kế read cho file có thể thiếu và nêu success, missing-file cùng cleanup path.", "Use a context manager in try, catch FileNotFoundError for the stated recovery, and do not process records after failure.", "Dùng context manager trong try, bắt FileNotFoundError theo recovery đã nêu và không xử lý record sau lỗi.")],
    },
    "graphs": {
        "title": L("Recognising and choosing graph models", "Nhận diện và chọn mô hình graph"),
        "family": L("Graph features and justification", "Đặc điểm graph và giải thích lựa chọn"),
        "promise": L("Identify vertices and edges, classify a graph, and justify why a graph model suits a relationship problem without implementing graph structures.", "Xác định vertex và edge, phân loại graph và giải thích vì sao graph phù hợp với bài toán quan hệ mà không cài đặt cấu trúc graph."),
        "cues": L("vertex, edge, directed, undirected, weighted, relationship, route", "vertex, edge, directed, undirected, weighted, relationship, route"),
        "pre": L("The scenario states entities and the relationships between them.", "Tình huống nêu entity và relationship giữa chúng."),
        "output": L("Name vertices and edges, classify the graph and justify the model using the scenario.", "Nêu vertex và edge, phân loại graph và giải thích mô hình theo tình huống."),
        "model": L("Vertices represent entities and edges represent relationships. Direction and weight are chosen only when the scenario gives them meaning.", "Vertex biểu diễn entity và edge biểu diễn relationship. Chỉ chọn direction và weight khi tình huống cho chúng ý nghĩa."),
        "rules": [L("Use a directed edge when A-to-B differs from B-to-A.", "Dùng directed edge khi A-to-B khác B-to-A."), L("Use a weight when each relationship has a meaningful cost, distance or time.", "Dùng weight khi mỗi relationship có cost, distance hoặc time có ý nghĩa."), L("Graph-structure implementation is not a required learner task in this lesson.", "Cài đặt graph structure không phải nhiệm vụ bắt buộc trong bài này.")],
        "invariant": L("Every chosen graph feature has a stated meaning in the original scenario.", "Mọi đặc điểm graph được chọn đều có ý nghĩa rõ trong tình huống gốc."),
        "code": ["# No graph-structure implementation is required.", "# Identify: vertices, edges, direction, weight.", "# Justify each choice from the scenario."],
        "practice": [
            ("Guided", "Identify vertices and edges", "In a route map, towns are connected by roads. Identify the vertices and edges.", "Trong route map, các town nối bằng road. Xác định vertex và edge.", "Towns are vertices; roads are edges.", "Town là vertex; road là edge."),
            ("Faded", "Classify the relationship", "A follows B on a social platform but B need not follow A. Decide whether edges are directed.", "A follow B nhưng B không nhất thiết follow A. Quyết định edge có directed không.", "Use directed edges because the relationship is not automatically reciprocal.", "Dùng directed edge vì relationship không tự động hai chiều."),
            ("Independent", "Justify a graph model", "A delivery problem records travel time between depots. Identify vertices, edges, direction and weight, then justify the model. No code is required.", "Bài giao hàng lưu travel time giữa depot. Xác định vertex, edge, direction, weight rồi giải thích mô hình. Không cần code.", "Depots are vertices, routes are edges, travel time is the weight, and direction follows whether routes are one-way.", "Depot là vertex, route là edge, travel time là weight và direction phụ thuộc route có một chiều không.")],
    },
    "exam-workflow": {
        "title": L("Paper 4 solution workflow", "Quy trình làm bài Paper 4"),
        "family": L("Plan, run, test and capture evidence", "Lập kế hoạch, chạy, test và ghi bằng chứng"),
        "promise": L("Turn a question into a small plan, run the program with supplied data, check outputs, and capture clear evidence before submission.", "Chuyển câu hỏi thành kế hoạch nhỏ, chạy chương trình với data được cho, kiểm output và ghi bằng chứng rõ trước khi nộp."),
        "cues": L("input, process, output, supplied file, test, evidence, save", "input, process, output, supplied file, test, evidence, save"),
        "pre": L("Read the required names, inputs, outputs and supplied resources before editing code.", "Đọc required name, input, output và resource được cho trước khi sửa code."),
        "output": L("Produce the requested console/file result and a clear evidence trail for the completed task.", "Tạo console/file result được yêu cầu và evidence trail rõ cho task đã hoàn thành."),
        "model": L("Work in short cycles: extract the contract, implement one part, run it, compare actual with expected, then save evidence.", "Làm theo vòng ngắn: rút contract, cài một phần, chạy, so actual với expected rồi lưu evidence."),
        "rules": [L("Copy required identifiers and file names exactly.", "Chép chính xác identifier và file name đề yêu cầu."), L("Use input, selection, iteration and library operations only where the question needs them.", "Dùng input, selection, iteration và library operation đúng nơi câu hỏi cần."), L("Capture actual output after the final saved run, not from memory.", "Ghi actual output sau lần chạy cuối đã save, không ghi từ trí nhớ.")],
        "invariant": L("The saved program, actual output and submitted evidence all describe the same final run.", "Program đã save, actual output và evidence đã nộp cùng mô tả một lần chạy cuối."),
        "code": ["def main():", "    raw = input('Value: ')", "    value = int(raw)", "    result = process(value)", "    print(result)"],
        "requirements": ["syl-11.1-03", "syl-11.1-04"],
        "practice": [
            ("Guided", "Extract input-process-output", "A question asks for a number, processes it with a supplied function and displays the result. Name the three stages.", "Đề yêu cầu nhập number, xử lý bằng supplied function rồi display result. Nêu ba stage.", "Input reads the number, process calls the function, output displays its returned result.", "Input đọc number, process gọi function, output display result trả về."),
            ("Faded", "Use a built-in safely", "Read keyboard text, convert it to an integer and state the failure that must be considered.", "Đọc text từ keyboard, convert sang integer và nêu failure cần xét.", "Use input then int; non-numeric text can raise ValueError.", "Dùng input rồi int; text không phải số có thể phát sinh ValueError."),
            ("Independent", "Complete a submission cycle", "Write a checklist from reading the task to saving code, running boundary data and capturing final output.", "Viết checklist từ lúc đọc task tới save code, chạy boundary data và ghi output cuối.", "Extract the contract, plan, code, save, run normal and boundary data, compare output, repair, rerun and capture final evidence.", "Rút contract, plan, code, save, chạy normal/boundary, so output, sửa, chạy lại và ghi evidence cuối.")],
    },
}


def rid(short: str) -> str:
    return f"ac-9618-p4-2026-python.assessment-requirement.{short}"


EXISTING_LINKS = {
    "data-models": {0: ["syl-10.1-01", "syl-10.1-03", "syl-11.1-01", "syl-11.1-02", "syl-9.2-02"], 3: ["syl-10.2-01", "syl-10.2-02"]},
    "procedural-design": {0: ["syl-11.3-01", "syl-11.3-02", "syl-11.3-04", "syl-12.2-01", "syl-9.1-01", "syl-9.1-02"], 3: ["syl-11.2-01", "syl-11.2-02", "syl-11.2-03", "syl-11.2-04", "syl-11.3-03", "syl-20.1-01", "syl-9.2-03", "syl-9.2-04"]},
    "binary-search": {2: ["syl-19.1-02"]},
    "linked-list": {6: ["syl-10.4-02"], 7: ["syl-19.1-09"]},
    "recursion": {0: ["syl-19.2-02"], 2: ["syl-19.2-03"], 1: ["syl-19.2-04", "syl-19.2-06", "syl-19.2-07"], 3: ["syl-19.2-05"]},
}

NEW_LINKS = {
    "exam-workflow": {1: ["syl-11.1-03", "syl-11.1-04"]},
    "object-files": {2: ["syl-20.1-19"]},
    "oop-model": {0: ["syl-20.1-08", "syl-20.1-10"], 1: ["syl-20.1-17"], 2: ["syl-20.1-18"]},
    "oop-state": {2: ["syl-20.1-14"]},
    "text-files": {0: ["syl-20.2-02", "syl-20.2-03"], 1: ["syl-20.2-06"], 2: ["syl-10.3-01", "syl-20.2-07", "syl-20.2-08"]},
}


def item(level: str, title: str, prompt_en: str, prompt_vi: str, answer_en: str, answer_vi: str, requirement_ids: list[str] | None = None) -> dict:
    result = {
        "level": L(level, {"Guided": "Có hướng dẫn", "Faded": "Giảm hỗ trợ", "Independent": "Độc lập"}.get(level, level)),
        "title": L(title, prompt_vi.split(".")[0]),
        "prompt": L(prompt_en, prompt_vi),
        "hint": L("State the contract first, then trace the first decision that changes or rejects state.", "Nêu contract trước, rồi trace quyết định đầu tiên làm đổi hoặc từ chối state."),
        "model_answer": L(answer_en, answer_vi),
        "success_check": L("The answer names the decision, resulting state and stopping condition.", "Câu trả lời nêu quyết định, state sau đó và điều kiện dừng."),
    }
    if requirement_ids:
        result["assessment_requirement_ids"] = [rid(value) for value in requirement_ids]
    return result


def build(slug: str, cfg: dict) -> dict:
    practice = []
    for index, row in enumerate(cfg["practice"]):
        practice.append(item(*row, requirement_ids=NEW_LINKS.get(slug, {}).get(index)))
    return {
        "status": "teacher-approved-for-implementation",
        "lesson_title": cfg["title"],
        "exam_family": cfg["family"],
        "language_policy": L("English is the canonical teaching version.", "Tiếng Việt là bản tham khảo có cùng cấu trúc học tập."),
        "learner_promise": cfg["promise"],
        "learner_outcomes": [
            L("Recognise this question family and extract its contract.", "Nhận diện dạng câu hỏi và rút ra contract."),
            L("Explain the governing rule before attempting the task.", "Giải thích quy tắc chính trước khi làm."),
            L("Trace a normal path and protect the relevant boundary or failure state.", "Trace normal path và bảo vệ boundary hoặc failure state liên quan."),
        ],
        "stages": {
            "recognise": {"order": 1, "name": L("Recognise", "Nhận diện"), "student_question": L("What is this question asking me to preserve?", "Câu hỏi yêu cầu tôi giữ điều gì?"), "intro": cfg["promise"], "prompt_fragment": cfg["cues"], "cues": [cfg["cues"], cfg["pre"], cfg["output"]], "precondition": cfg["pre"], "output_contract": cfg["output"]},
            "understand": {"order": 2, "name": L("Understand", "Hiểu quy tắc"), "student_question": L("What rule controls every correct step?", "Quy tắc nào kiểm soát mọi bước đúng?"), "mental_model": cfg["model"], "rules": cfg["rules"], "invariant": cfg["invariant"], "python_recipe": {"caption": L("Focused exam recipe", "Khung làm bài trọng tâm"), "lines": cfg["code"], "contract_note": L("Use this as a small teaching excerpt; adapt names and exact behaviour to the question contract.", "Dùng đây như đoạn hướng dẫn ngắn; điều chỉnh tên và hành vi theo đúng contract của đề.")}},
            "trace": {"order": 3, "name": L("Trace", "Trace từng bước"), "student_question": L("What changes at this decision?", "Điều gì thay đổi tại quyết định này?"), "scenario": {"label": L("Normal worked path", "Normal worked path"), "instruction": L("Predict the next decision before revealing the event, then state the resulting state.", "Dự đoán quyết định tiếp theo trước khi mở event, rồi nêu state sau đó.")}, "steps": [{"step": 1, "code_focus": cfg["code"][:3], "prediction": L("Name the first guard or comparison.", "Nêu guard hoặc comparison đầu tiên."), "answer": cfg["invariant"]}], "invariant_check": cfg["invariant"], "variants": []},
            "practise": {"order": 4, "name": L("Practise", "Luyện tập"), "student_question": L("Can I solve the same contract with less support?", "Tôi có thể giải cùng contract với ít hỗ trợ hơn không?"), "attempt_rule": L("Attempt the task before opening the hint or model answer.", "Làm thử trước khi mở hint hoặc model answer."), "items": practice},
            "protectMarks": {"order": 5, "name": L("Protect your marks", "Tránh mất điểm"), "student_question": L("Which mistake would break the contract first?", "Lỗi nào phá contract đầu tiên?"), "before_code": [cfg["pre"], cfg["output"]], "mistakes": [
                {"mistake": L("Coding before fixing the input, output and stopping contract.", "Viết code trước khi chốt input, output và stopping contract."), "consequence": L("A plausible algorithm can answer a different question.", "Thuật toán nhìn hợp lý nhưng có thể trả lời câu hỏi khác."), "repair": L("Write the contract in one sentence before the first code line.", "Viết contract thành một câu trước dòng code đầu.")},
                {"mistake": L("Changing state before checking the relevant boundary.", "Đổi state trước khi kiểm tra boundary liên quan."), "consequence": L("Rejected input can corrupt a previously valid structure.", "Input bị từ chối vẫn có thể làm hỏng structure đang hợp lệ."), "repair": L("Place the guard before mutation and trace the rejected path.", "Đặt guard trước mutation và trace path bị từ chối.")},
                {"mistake": L("Stopping after one normal example.", "Dừng sau một ví dụ normal."), "consequence": L("A boundary or failure path remains untested.", "Boundary hoặc failure path chưa được kiểm tra."), "repair": L("Check one normal, one boundary and one relevant failure case.", "Kiểm tra một normal, một boundary và một failure phù hợp.")},
            ], "core_code_caption": L("Compact method reminder", "Nhắc phương pháp ngắn"), "core_code": cfg["code"], "boundary_trace": [cfg["pre"], cfg["invariant"]], "final_check": [cfg["output"], cfg["invariant"]], "authority_note": L("The worked method is AlgoCore teacher-authored guidance grounded in the course sources; follow the exact contract in each examination question.", "Phương pháp là hướng dẫn do giáo viên AlgoCore biên soạn từ nguồn khóa học; luôn theo đúng contract của từng câu hỏi thi.")},
            "recallAndContinue": {"order": 6, "name": L("Recall and continue", "Gợi nhớ và học tiếp"), "student_question": L("Can I rebuild the method without the worked example?", "Tôi có thể tự dựng lại phương pháp khi không nhìn ví dụ không?"), "recall_items": [
                {"prompt": L("State the precondition.", "Nêu precondition."), "answer": cfg["pre"]},
                {"prompt": L("State the invariant or rule.", "Nêu invariant hoặc rule."), "answer": cfg["invariant"]},
                {"prompt": L("State the required output.", "Nêu output cần có."), "answer": cfg["output"]},
            ], "exit_task": L("Solve the independent task again from memory, then compare only after recording your result.", "Làm lại independent task từ trí nhớ, rồi chỉ so đáp án sau khi đã ghi kết quả."), "next_step": L("Continue when you can explain the contract and trace the first boundary without help.", "Học tiếp khi bạn có thể giải thích contract và trace boundary đầu tiên mà không cần trợ giúp.")},
        },
        "display_contract": {"default_stage": "Recognise", "reveal_policy": L("Prediction or attempt comes before reveal.", "Dự đoán hoặc làm thử trước khi mở đáp án."), "primary_code_limit": L("Show only the focused recipe or current lines.", "Chỉ hiển thị khung code hoặc dòng đang tập trung.")},
        "stage_order": STAGES,
    }


def write_crosswalk() -> list[dict]:
    records = []
    for slug, assignments in {**EXISTING_LINKS, **NEW_LINKS}.items():
        projection = json.loads((PROJECTIONS / f"{slug}.json").read_text(encoding="utf-8"))
        tasks = projection["stages"]["practise"]["items"]
        for index, ids in assignments.items():
            for short_id in ids:
                records.append({
                    "requirement_id": rid(short_id),
                    "lesson_slug": slug,
                    "visible_task_path": f"stages.practise.items[{index}]",
                    "task_title_en": tasks[index]["title"]["en"],
                    "task_title_vi": tasks[index]["title"]["vi"],
                    "evidence_kind": "visible_learner_task",
                })
    records.sort(key=lambda item: item["requirement_id"])
    CROSSWALK.parent.mkdir(parents=True, exist_ok=True)
    CROSSWALK.write_text(json.dumps({
        "schema_version": "paper4-visible-assessment-crosswalk-v1",
        "authority": "AlgoCore_teacher_authored_traceability",
        "official_marks": None,
        "records": records,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return records


def main() -> None:
    PROJECTIONS.mkdir(parents=True, exist_ok=True)
    for slug, cfg in CFG.items():
        (PROJECTIONS / f"{slug}.json").write_text(json.dumps(build(slug, cfg), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    crosswalk = write_crosswalk()
    gaps = json.loads(AUDIT.read_text(encoding="utf-8"))["assessment_traceability_gaps"]
    expected = {entry["requirement_id"] for entry in gaps}
    linked = {record["requirement_id"] for record in crosswalk}
    missing = sorted(expected - linked)
    if missing:
        raise SystemExit(f"Missing learner-task requirement links: {missing}")
    print(json.dumps({"projection_files": len(list(PROJECTIONS.glob('*.json'))), "audit_gap_links_closed_at_visible_task_layer": len(expected)}, indent=2))


if __name__ == "__main__":
    main()

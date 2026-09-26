import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PILOT = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const bi = (vi, en) => ({ vi, en });

const CONTENT = {
  "data-models/scalars-types-scope": {
    ex: bi("Kiểu dữ liệu xác định miền giá trị và phép toán hợp lệ; hằng biểu diễn giá trị không đổi còn biến lưu trạng thái có thể đổi. Phạm vi quyết định nơi một tên được truy cập, vì vậy dữ liệu cục bộ của hàm không tự động thay đổi dữ liệu bên ngoài.", "A data type defines the allowed values and operations; a constant represents a fixed value while a variable stores changing state. Scope determines where a name is accessible, so local function data does not automatically change external data."),
    py: bi("Trong artifact data-models, `records`, `capacity` và `trace` là tham số cục bộ ở dòng L014; `added` và `message` ở L029 chỉ tồn tại trong `run`. Dòng L010 kiểm tra `score` thật sự là `int` trước khi dùng.", "In the data-models artifact, `records`, `capacity`, and `trace` are local parameters at L014; `added` and `message` at L029 exist only inside `run`. L010 checks that `score` is actually an `int` before use."),
    rep: bi("Theo dõi mỗi tên bằng ba thuộc tính: kiểu dự kiến, giá trị hiện tại và phạm vi. Ví dụ `capacity: int`, `added: bool`, `message: str`.", "Track each name using three attributes: expected type, current value, and scope. For example, `capacity: int`, `added: bool`, and `message: str`."),
    rule: bi("Khởi tạo mọi biến trước lần đọc đầu tiên; chỉ thực hiện phép toán phù hợp với kiểu; không giả định biến cục bộ còn tồn tại ngoài hàm.", "Initialise every variable before its first read; apply only operations supported by its type; do not assume a local variable exists outside its function."),
    mis: [bi("Dùng chuỗi \"7\" như số nguyên 7 mà không chuyển kiểu.", "Using the string \"7\" as the integer 7 without conversion."), bi("Cho rằng biến cùng tên trong hai hàm là cùng một ô nhớ.", "Assuming identically named variables in two functions are the same storage location.")],
    sig: [bi("Đề cho bảng dữ liệu, kiểu trường hoặc yêu cầu khai báo/khởi tạo.", "The task supplies a data table, field types, or asks for declaration/initialisation."), bi("Một hàm phải trả trạng thái thay vì dựa vào biến bên ngoài.", "A function must return state instead of relying on external variables.")],
    micro: [bi("`score = \"12\"` được đọc từ tệp rồi cần cộng 3.", "`score = \"12\"` is read from a file and must then be increased by 3."), bi("Chuyển thành `score = int(score)` trước phép cộng; lưu kết quả trong phạm vi cần dùng.", "Convert with `score = int(score)` before addition and keep the result in the scope where it is needed.")],
    check: [bi("Vì sao L010 kiểm tra `int` trước khi chèn record?", "Why does L010 check for `int` before inserting the record?"), bi("Để bảo vệ hợp đồng kiểu của trường `score` và ngăn dữ liệu sai đi vào cấu trúc.", "To protect the type contract of `score` and prevent invalid data entering the structure."), bi("Nếu bỏ kiểm tra, lỗi có thể xuất hiện muộn ở phép tính khác và khó truy nguồn.", "Without the check, an error may appear later in another calculation and be harder to trace.")], lines: ["data-models.v1.L010", "data-models.v1.L014", "data-models.v1.L029"]
  },
  "data-models/array-representation": {
    ex: bi("Mảng một chiều dùng một chỉ số; mảng hai chiều dùng cặp chỉ số hàng–cột. Khi mô phỏng mảng cố định bằng list Python, cần giữ riêng capacity và không coi độ dài vật lý là số phần tử đang dùng trong mọi bài.", "A one-dimensional array uses one index; a two-dimensional array uses a row-column pair. When a Python list models a fixed array, keep capacity explicit and do not always treat physical length as the number of live elements."),
    py: bi("Artifact tạo bản sao list record ở L027 và so sánh `len(records)` với `capacity` ở L018–L020. Đây là mô hình mảng 1D đang chứa các record; Python list không tự áp đặt capacity của đề.", "The artifact copies the record list at L027 and compares `len(records)` with `capacity` at L018-L020. This models a 1D array holding records; a Python list does not itself enforce the task's capacity."),
    rep: bi("Biểu diễn mảng bằng ô liên tiếp có chỉ số; ghi rõ lower bound, upper bound, capacity và live count. Với 2D, ghi kích thước `[rows][columns]` và thứ tự chỉ số.", "Represent an array as indexed cells and state its lower bound, upper bound, capacity, and live count. For 2D data, state `[rows][columns]` and the index order."),
    rule: bi("Mọi chỉ số truy cập phải nằm trong miền hợp lệ; số phần tử sống không vượt capacity; không tạo các hàng 2D dùng chung một list con ngoài ý muốn.", "Every accessed index must be in range; the live count must not exceed capacity; do not accidentally make 2D rows share the same inner list."),
    mis: [bi("Nhầm chỉ số cuối là `len(array)` thay vì `len(array)-1`.", "Treating `len(array)` as the last index instead of `len(array)-1`."), bi("Dùng `[[0] * c] * r`, khiến các hàng cùng trỏ tới một list.", "Using `[[0] * c] * r`, causing rows to reference the same list.")],
    sig: [bi("Đề nêu kích thước, số hàng/cột hoặc cận chỉ số.", "The task states a size, row/column count, or index bounds."), bi("Thuật toán phải duyệt, chèn hoặc cập nhật phần tử theo vị trí.", "The algorithm must traverse, insert, or update an item by position.")],
    micro: [bi("Mảng sức chứa 4 hiện có 3 record; vị trí chèn kế tiếp là 3.", "An array of capacity 4 currently has 3 records; the next insertion position is 3."), bi("Kiểm tra `live_count < capacity`, ghi vào index 3 rồi tăng live count thành 4.", "Check `live_count < capacity`, write at index 3, then increase live count to 4.")],
    check: [bi("Vì sao capacity phải tách khỏi hành vi tự tăng của Python list?", "Why must capacity be separated from the automatic growth of a Python list?"), bi("Vì capacity là ràng buộc của mô hình/bài toán, còn list Python có thể tự mở rộng.", "Because capacity is a model/task constraint, while a Python list can grow automatically."), bi("Kiểm tra ranh giới phải phản ánh cấu trúc được yêu cầu chứ không dựa vào tiện ích của ngôn ngữ.", "Boundary checks must reflect the required structure rather than a language convenience.")], lines: ["data-models.v1.L018", "data-models.v1.L019", "data-models.v1.L027"]
  },
  "data-models/record-fields": {
    ex: bi("Record gom các trường khác kiểu nhưng cùng mô tả một thực thể. Trong Python, dictionary hoặc một lớp đơn giản có thể biểu diễn record khi yêu cầu cho phép; lớp record thay thế không đồng nghĩa với thiết kế OOP đầy đủ có kế thừa và đa hình.", "A record groups differently typed fields that describe one entity. In Python, a dictionary or a simple class may represent a record when allowed; a record-replacement class is not the same as a full OOP design with inheritance and polymorphism."),
    py: bi("L005–L011 xác nhận record là dict có `name: str` không rỗng và `score: int`; L021 chèn toàn bộ record như một đơn vị. Các line này minh họa cấu trúc trường, chưa phải bằng chứng cho một yêu cầu class cụ thể.", "L005-L011 verify that a record is a dict with a non-empty `name: str` and `score: int`; L021 inserts the whole record as one unit. These lines illustrate field structure, not evidence for a task-specific class requirement."),
    rep: bi("Vẽ record như một hộp có các trường được đặt tên, ví dụ `{name: str, score: int}`. Truy cập bằng tên trường thay vì vị trí mơ hồ.", "Draw a record as a box of named fields, for example `{name: str, score: int}`. Access fields by name rather than an ambiguous position."),
    rule: bi("Mỗi instance phải có đủ trường bắt buộc và đúng kiểu; cập nhật một trường không được làm mất các trường còn lại.", "Each instance must contain every required field with the correct type; updating one field must preserve all other fields."),
    mis: [bi("Coi record như mảng mà mọi phần tử phải cùng kiểu.", "Treating a record as an array whose elements must share one type."), bi("Đổi tên trường hoặc kiểu trường so với hợp đồng đã cho.", "Changing a field name or field type from the supplied contract.")],
    sig: [bi("Đề mô tả một thực thể bằng nhiều thuộc tính có kiểu khác nhau.", "The task describes an entity using several attributes of different types."), bi("Cần tạo, đọc hoặc cập nhật trường theo tên.", "Fields must be created, read, or updated by name.")],
    micro: [bi("Record học sinh có `name='Lan'` và `score=18`.", "A student record has `name='Lan'` and `score=18`."), bi("Kiểm tra hai trường, sau đó lưu dictionary; truy cập điểm bằng `record['score']`.", "Validate both fields, then store the dictionary; access the score with `record['score']`.")],
    check: [bi("Dictionary trong pilot chứng minh được điều gì và chưa chứng minh điều gì?", "What does the pilot dictionary demonstrate, and what does it not demonstrate?"), bi("Nó chứng minh trường có tên và kiểu; nó chưa chứng minh yêu cầu OOP như constructor/kế thừa.", "It demonstrates named, typed fields; it does not establish OOP requirements such as constructors or inheritance."), bi("Chọn representation phải theo hợp đồng của câu hỏi.", "The representation must follow the question contract.")], lines: ["data-models.v1.L005", "data-models.v1.L010", "data-models.v1.L021"]
  },
  "data-models/bounded-append": {
    ex: bi("Chèn vào cấu trúc có giới hạn cần kiểm tra chỗ trống trước khi ghi. Live count chỉ số phần tử hợp lệ; capacity là số ô tối đa, nên trạng thái đầy xảy ra khi `live_count >= capacity`.", "Appending to a bounded structure requires a free-space check before writing. The live count is the number of valid items; capacity is the maximum cell count, so full means `live_count >= capacity`."),
    py: bi("L018 ghi nhận count/capacity, L019 chặn trạng thái đầy và L021 chỉ append sau khi kiểm tra. L022 tính index mới bằng `len(records)-1`, tức sau thao tác chèn thành công.", "L018 records count/capacity, L019 blocks the full state, and L021 appends only after the check. L022 obtains the new index as `len(records)-1`, after a successful insertion."),
    rep: bi("Dùng dải ô 0..capacity-1, tô đậm `live_count` ô đầu và đánh dấu next position bằng live count khi chưa đầy.", "Use cells 0..capacity-1, highlight the first `live_count` cells, and mark the next position as live count when not full."),
    rule: bi("Không ghi khi đầy; sau một lần chèn thành công, live count tăng đúng 1 và record mới nằm ở vị trí trước đó bằng live count.", "Do not write when full; after one successful append, live count increases by exactly one and the new record occupies the old live-count position."),
    mis: [bi("Append trước rồi mới kiểm tra capacity.", "Appending first and checking capacity afterwards."), bi("Dùng `>` thay vì `>=`, cho phép ghi khi count đã bằng capacity.", "Using `>` instead of `>=`, allowing a write when count already equals capacity.")],
    sig: [bi("Đề cho kích thước tối đa cùng con trỏ/vị trí kế tiếp.", "The task gives a maximum size and a next-position pointer."), bi("Cần báo trạng thái đầy hoặc trả kết quả thành công/thất bại.", "The operation must report full state or return success/failure.")],
    micro: [bi("`records` có 2 phần tử, capacity 2 và cần chèn thêm.", "`records` contains 2 items, capacity is 2, and another item is requested."), bi("Điều kiện `len(records) >= capacity` đúng; trả `FULL` mà không thay đổi list.", "`len(records) >= capacity` is true; return `FULL` without changing the list.")],
    check: [bi("Sau append thành công, index của record mới được tính lúc nào?", "When is the new record's index calculated after a successful append?"), bi("Sau khi append, bằng `len(records)-1`.", "After the append, as `len(records)-1`."), bi("Tính trước/sau phải nhất quán với định nghĩa next position.", "The timing must remain consistent with the definition of next position.")], lines: ["data-models.v1.L018", "data-models.v1.L019", "data-models.v1.L021", "data-models.v1.L022"]
  },
  "data-models/random-data": {
    ex: bi("Khi tạo dữ liệu ngẫu nhiên, miền giá trị phải được xác định rõ và kiểm tra quy ước hai đầu có bao gồm hay không. Dữ liệu ngẫu nhiên phù hợp để tạo bộ thử, nhưng kết quả học tập cần có seed hoặc fixture cố định để tái lập.", "When generating random data, define the value range and whether each endpoint is inclusive. Random data can create test sets, but learning evidence needs a seed or fixed fixture for reproducibility."),
    py: bi("Pilot không gọi bộ sinh ngẫu nhiên; nó nhận `random_values` đã cố định ở L030 rồi tính trung bình tại L032–L034. Vì vậy các line chứng minh bước xử lý dữ liệu, không chứng minh API/range sinh số.", "The pilot does not call a random generator; it receives fixed `random_values` at L030 and calculates an average at L032-L034. These lines therefore evidence data processing, not a generator API or its range."),
    rep: bi("Ghi miền bằng ký hiệu rõ như `[low, high]` và mảng kết quả theo thứ tự sinh. Tách cấu hình sinh khỏi thao tác tổng hợp.", "Write the domain explicitly, such as `[low, high]`, and show generated results in order. Separate generator configuration from aggregation."),
    rule: bi("Mọi giá trị phải nằm trong miền đã cho; trường hợp list rỗng phải tránh chia cho 0; fixture kiểm chứng phải tái lập được.", "Every value must lie in the stated domain; an empty list must avoid division by zero; verification fixtures must be reproducible."),
    mis: [bi("Giả định mọi hàm random đều bao gồm cận trên.", "Assuming every random API includes the upper endpoint."), bi("Tính `sum(values)/len(values)` mà không xử lý list rỗng.", "Computing `sum(values)/len(values)` without handling an empty list.")],
    sig: [bi("Đề yêu cầu điền mảng bằng giá trị ngẫu nhiên trong một miền.", "The task asks to fill an array with random values in a range."), bi("Cần thống kê, đếm hoặc tìm kiếm trên dữ liệu sinh ra.", "The generated data must then be aggregated, counted, or searched.")],
    micro: [bi("Fixture `[2, 4, 6]` đại diện ba giá trị đã sinh.", "Fixture `[2, 4, 6]` represents three generated values."), bi("L032 xác nhận list không rỗng rồi L033 tính trung bình 4.0; list rỗng giữ `average=None`.", "L032 confirms the list is non-empty, then L033 computes 4.0; an empty list keeps `average=None`.")],
    check: [bi("Vì sao artifact này chưa xác nhận quy tắc cận của hàm random?", "Why does this artifact not establish the endpoint rules of a random function?"), bi("Vì nó nhận dữ liệu từ fixture và không gọi hàm sinh ngẫu nhiên.", "Because it receives fixture data and never calls a random generator."), bi("Quy tắc API phải đến từ yêu cầu/đặc tả Python tương ứng.", "API rules must come from the applicable task or Python specification.")], lines: ["data-models.v1.L030", "data-models.v1.L032", "data-models.v1.L033", "data-models.v1.L034"]
  },
  "data-models/identifier-contract": {
    ex: bi("Identifier tốt cho biết vai trò của dữ liệu và giữ nhất quán giữa đặc tả, code và output. Biểu thức gán phải có một đích hợp lệ; biểu thức số học tạo giá trị số, còn biểu thức logic tạo Boolean dùng cho nhánh hoặc vòng lặp.", "A good identifier communicates a data role and remains consistent across specification, code, and output. Assignment needs a valid target; arithmetic expressions produce numeric values, while logical expressions produce Booleans for branches or loops."),
    py: bi("Các tên `capacity`, `records`, `added` và `message` tại L014/L029 thể hiện vai trò rõ. Điều kiện L019 là biểu thức logic; phép `sum(...)/len(...)` ở L033 là biểu thức số học được gán cho `average`.", "The names `capacity`, `records`, `added`, and `message` at L014/L029 express clear roles. L019 is a logical expression; `sum(...)/len(...)` at L033 is an arithmetic expression assigned to `average`."),
    rep: bi("Dùng bảng data dictionary gồm identifier, kiểu, mục đích, giá trị đầu và phạm vi; nối mỗi điều kiện tới nhánh mà nó điều khiển.", "Use a data dictionary with identifier, type, purpose, initial value, and scope; connect each condition to the branch it controls."),
    rule: bi("Tên phải hợp lệ, có nghĩa và nhất quán; vế phải được tính trước rồi gán vào vế trái; điều kiện phải cho đúng Boolean.", "Names must be valid, meaningful, and consistent; evaluate the right-hand side before assigning to the left; a condition must yield the intended Boolean."),
    mis: [bi("Đổi giữa `nextPos`, `next_position` và `NextPosition` cho cùng một dữ liệu.", "Switching among `nextPos`, `next_position`, and `NextPosition` for the same datum."), bi("Nhầm `=` gán với phép so sánh bằng trong Python.", "Confusing assignment `=` with equality comparison in Python.")],
    sig: [bi("Đề cung cấp data dictionary hoặc tên biến phải giữ nguyên.", "The task supplies a data dictionary or identifiers that must be retained."), bi("Yêu cầu hoàn thiện biểu thức gán, số học hoặc điều kiện.", "The task asks for an assignment, arithmetic expression, or condition to be completed.")],
    micro: [bi("Cần xác định đầy khi count bằng capacity.", "The structure is full when count equals capacity."), bi("Viết biểu thức logic `is_full = count >= capacity`; tên và kiểu Boolean thể hiện vai trò.", "Write `is_full = count >= capacity`; the name and Boolean type express its role.")],
    check: [bi("L019 tạo loại giá trị nào?", "What kind of value does L019 produce?"), bi("Biểu thức `len(records) >= capacity` tạo Boolean để điều khiển `if`.", "`len(records) >= capacity` produces a Boolean that controls the `if`."), bi("Xác định loại biểu thức giúp tránh gán/so sánh sai.", "Identifying the expression kind prevents assignment/comparison errors.")], lines: ["data-models.v1.L014", "data-models.v1.L019", "data-models.v1.L029", "data-models.v1.L033"]
  },

  "binary-search/preconditions-interval": {
    ex: bi("Tìm kiếm nhị phân chỉ loại bỏ nửa khoảng an toàn khi dữ liệu đã sắp theo cùng comparator dùng để so sánh target. Khoảng tìm kiếm đóng `[low, high]` chứa mọi vị trí còn có thể là đáp án.", "Binary search can safely discard half an interval only when data is sorted under the same comparator used against the target. The closed search interval `[low, high]` contains every position that can still be the answer."),
    py: bi("L005–L009 kiểm tra thứ tự tăng; L037–L039 từ chối input không sắp. L013–L015 khởi tạo khoảng đóng từ 0 đến `len(values)-1` và chỉ lặp khi khoảng chưa rỗng.", "L005-L009 check ascending order; L037-L039 reject unsorted input. L013-L015 initialise the closed interval from 0 to `len(values)-1` and continue only while it is non-empty."),
    rep: bi("Tô ba vùng: đã loại bên trái, khoảng ứng viên `[low, high]`, đã loại bên phải. Mỗi bước phải giữ target, nếu có, trong vùng ứng viên.", "Shade three regions: discarded left, candidate interval `[low, high]`, and discarded right. Each step must keep the target, if present, in the candidate region."),
    rule: bi("Tiền điều kiện là ascending order nhất quán; bất biến là nếu target tồn tại thì index của nó nằm trong `[low, high]`.", "The precondition is a consistent ascending order; the invariant is that if the target exists, its index lies in `[low, high]`."),
    mis: [bi("Chạy tìm nhị phân trên list chưa sắp.", "Running binary search on an unsorted list."), bi("Trộn khoảng đóng `[low, high]` với điều kiện của khoảng nửa mở.", "Mixing a closed `[low, high]` interval with half-open interval conditions.")],
    sig: [bi("Đề nói dữ liệu đã sắp hoặc yêu cầu nêu điều kiện áp dụng.", "The task states that data is sorted or asks for the conditions of use."), bi("Cần duy trì lower/upper bound trong quá trình tìm.", "Lower and upper bounds must be maintained during the search.")],
    micro: [bi("Tìm 7 trong `[1,4,7,9]`: ban đầu low=0, high=3.", "Find 7 in `[1,4,7,9]`: initially low=0 and high=3."), bi("Middle=1 có giá trị 4; loại index 0..1 và đặt low=2, target vẫn trong khoảng 2..3.", "Middle=1 has value 4; discard indices 0..1 and set low=2, keeping the target within 2..3.")],
    check: [bi("Tại sao kiểm tra thứ tự phải dùng cùng quan hệ so sánh với target?", "Why must the order check use the same comparison relation as the target search?"), bi("Nếu comparator khác, việc loại một nửa không còn đảm bảo giữ target.", "With a different comparator, discarding one half no longer guarantees retaining the target."), bi("Bất biến phụ thuộc trực tiếp vào thứ tự dữ liệu.", "The invariant depends directly on the data order.")], lines: ["binary-search.v1.L005", "binary-search.v1.L013", "binary-search.v1.L014", "binary-search.v1.L037"]
  },
  "binary-search/midpoint-update": {
    ex: bi("Middle dùng chia nguyên để chọn một index trong khoảng. Sau khi so sánh, phải loại luôn middle bằng `middle-1` hoặc `middle+1`; nếu không, khoảng có thể không nhỏ đi và vòng lặp không kết thúc.", "Middle uses integer division to choose an index in the interval. After comparison, exclude middle with `middle-1` or `middle+1`; otherwise the interval may fail to shrink and the loop may not terminate."),
    py: bi("L016 tính middle; L024–L029 xử lý bằng/nhỏ hơn/lớn hơn. L030–L031 định nghĩa thất bại khi `low > high` bằng sentinel `-1`.", "L016 computes middle; L024-L029 handle equal/less/greater cases. L030-L031 define failure when `low > high` by returning sentinel `-1`."),
    rep: bi("Ở mỗi bước ghi `(low, high, middle, values[middle])`; gạch bỏ middle cùng nửa không thể chứa target.", "At each step record `(low, high, middle, values[middle])`; cross out middle and the half that cannot contain the target."),
    rule: bi("Middle luôn nằm trong khoảng hiện tại; mỗi lần chưa tìm thấy làm kích thước khoảng giảm; trả index khi bằng và sentinel chỉ khi khoảng rỗng.", "Middle is always inside the current interval; every unsuccessful comparison shrinks the interval; return the index on equality and the sentinel only after the interval is empty."),
    mis: [bi("Đặt `high = middle` hoặc `low = middle`, giữ lại phần tử vừa loại.", "Setting `high = middle` or `low = middle`, retaining the item just eliminated."), bi("Dùng `/` tạo float làm index.", "Using `/`, producing a float index.")],
    sig: [bi("Cần hoàn thiện công thức middle hoặc cập nhật bounds.", "The midpoint formula or bound updates must be completed."), bi("Cần xử lý trường hợp không tìm thấy rõ ràng.", "The not-found case must be handled explicitly.")],
    micro: [bi("low=0, high=1, target lớn hơn phần tử tại middle=0.", "low=0, high=1, and target is greater than the item at middle=0."), bi("Đặt low=1; khoảng giảm còn một phần tử. Nếu đặt low=0, vòng lặp có thể lặp lại cùng trạng thái.", "Set low=1; the interval shrinks to one item. If low remains 0, the same state may repeat.")],
    check: [bi("Điều gì chứng minh vòng lặp tiến tới kết thúc?", "What proves that the loop progresses toward termination?"), bi("Mỗi nhánh chưa tìm thấy loại middle nên độ dài `[low, high]` giảm.", "Every not-found branch excludes middle, so the length of `[low, high]` decreases."), bi("Một biến đo giảm nghiêm ngặt là bằng chứng termination.", "A strictly decreasing measure establishes termination.")], lines: ["binary-search.v1.L016", "binary-search.v1.L024", "binary-search.v1.L027", "binary-search.v1.L029", "binary-search.v1.L031"]
  },
  "binary-search/recursive-variant": {
    ex: bi("Biến thể đệ quy mang `low` và `high` trong từng lời gọi. Base case là khoảng rỗng; recursive case tính middle rồi gọi lại đúng nửa còn khả năng chứa target, đồng thời trả kết quả của lời gọi con lên trên.", "The recursive variant carries `low` and `high` in each call. Its base case is an empty interval; the recursive case computes middle, calls the only half that can contain the target, and propagates the child result upward."),
    py: bi("Artifact binary-search thực thi biến thể đệ quy ở L048–L061: L050–L052 xử lý khoảng rỗng, L053 tính middle, L059/L061 trả kết quả từ lời gọi trên khoảng nhỏ hơn. L064–L067 chạy cả hai phiên bản và phát hiện nếu index không khớp.", "The binary-search artifact executes the recursive variant at L048-L061: L050-L052 handle an empty interval, L053 computes middle, and L059/L061 return the result of a call on a smaller interval. L064-L067 run both versions and detect an index mismatch."),
    rep: bi("Dùng stack frame chứa `(low, high, middle)` cho mỗi lời gọi; mũi tên đi xuống biểu diễn lời gọi con và mũi tên lên biểu diễn index/sentinel trả về.", "Use a stack frame containing `(low, high, middle)` for each call; downward arrows show child calls and upward arrows show the returned index/sentinel."),
    rule: bi("Base case `low > high` trả not-found; mỗi lời gọi con nhận khoảng nhỏ hơn; mọi nhánh recursive phải `return` kết quả gọi con.", "Base case `low > high` returns not-found; each child call receives a smaller interval; every recursive branch must return the child result."),
    mis: [bi("Gọi đệ quy nhưng quên `return`, làm mất index tìm được.", "Calling recursively without `return`, losing the found index."), bi("Giữ nguyên bounds trong lời gọi con nên không tiến tới base case.", "Passing unchanged bounds to the child, so the base case is never approached.")],
    sig: [bi("Đề yêu cầu viết hoặc đổi tìm kiếm nhị phân sang dạng đệ quy.", "The task asks for a recursive binary search or a conversion to recursion."), bi("Signature có low/high hoặc yêu cầu mô tả base case.", "The signature carries low/high or the task asks for a base case.")],
    micro: [bi("Khoảng 0..3, middle=1, target lớn hơn giá trị giữa.", "Interval 0..3, middle=1, target greater than the middle value."), bi("Gọi và trả `search(values, target, 2, 3)`; frame cha chờ kết quả rồi truyền nguyên kết quả lên.", "Call and return `search(values, target, 2, 3)`; the parent waits and propagates the result unchanged.")],
    check: [bi("Tại sao L059 và L061 đều phải `return` lời gọi đệ quy?", "Why must both L059 and L061 return their recursive calls?"), bi("Để index hoặc sentinel từ frame sâu nhất đi qua mọi frame về caller ban đầu.", "So the index or sentinel from the deepest frame passes through every frame to the original caller."), bi("Call tạo công việc; return truyền kết quả và L066 kiểm tra nó với bản lặp.", "A call creates work; return carries its result, which L066 checks against the iterative result.")], lines: ["binary-search.v1.L048", "binary-search.v1.L050", "binary-search.v1.L052", "binary-search.v1.L053", "binary-search.v1.L059", "binary-search.v1.L061", "binary-search.v1.L064", "binary-search.v1.L065", "binary-search.v1.L066"]
  },

  "queue/representation-conventions": {
    ex: bi("Queue là FIFO: phần tử vào trước ra trước. Với circular array, `front` chỉ phần tử sẽ lấy, `rear` chỉ ô sẽ chèn kế tiếp và `count` phân biệt rỗng với đầy khi hai chỉ số bằng nhau.", "A queue is FIFO: the first item inserted is the first removed. In a circular array, `front` points to the next item to remove, `rear` to the next insertion cell, and `count` distinguishes empty from full when the indices coincide."),
    py: bi("L010–L013 khởi tạo array, front, rear, count; L022/L034 dùng modulo để quay vòng. Representation của pilot chọn `rear` là next insertion index và `count` là logical size.", "L010-L013 initialise the array, front, rear, and count; L022/L034 use modulo for wraparound. The pilot representation defines `rear` as the next insertion index and `count` as logical size."),
    rep: bi("Vẽ vòng các ô 0..capacity-1, hai mũi tên front/rear và nhãn count. Liệt kê logical order bắt đầu ở front, không theo thứ tự vật lý mặc định.", "Draw cells 0..capacity-1 in a ring, add front/rear arrows and count. List logical order starting at front rather than assuming physical array order."),
    rule: bi("`0 <= count <= capacity`; nếu count>0 thì front trỏ phần tử sống đầu; rear luôn là ô chèn kế tiếp theo quy ước pilot.", "`0 <= count <= capacity`; when count>0, front points to the first live item; rear is always the next insertion cell under the pilot convention."),
    mis: [bi("Cho rằng front==rear luôn có nghĩa là rỗng dù không xét count.", "Assuming front==rear always means empty without considering count."), bi("Đọc queue theo index 0..count-1 khi front đã wrap.", "Reading the queue at indices 0..count-1 after front has wrapped.")],
    sig: [bi("Đề cho array cùng head/front, tail/rear hoặc count.", "The task provides an array plus head/front, tail/rear, or count."), bi("Cần nêu quy ước empty/full trước khi viết thao tác.", "Empty/full conventions must be stated before implementing operations.")],
    micro: [bi("Xét queue có capacity=4, front=3, rear=1 và count=2.", "Consider a queue with capacity=4, front=3, rear=1, and count=2."), bi("Hai phần tử sống nằm ở index 3 rồi 0; rear=1 là ô chèn kế tiếp.", "The two live items are at indices 3 then 0; rear=1 is the next insertion cell.")],
    check: [bi("Vì sao count cần thiết khi front và rear đều bằng 0?", "Why is count needed when both front and rear equal 0?"), bi("Cùng trạng thái chỉ số có thể là rỗng (count=0) hoặc đầy sau một vòng (count=capacity).", "The same index state may mean empty (count=0) or full after a wrap (count=capacity)."), bi("Phải đọc cả ba biến theo cùng convention.", "All three variables must be interpreted under one convention.")], lines: ["queue.v1.L010", "queue.v1.L011", "queue.v1.L012", "queue.v1.L013", "queue.v1.L022"]
  },
  "queue/enqueue": {
    ex: bi("Enqueue kiểm tra đầy trước khi ghi, đặt item vào `rear`, dịch rear theo vòng và tăng count. Thứ tự cập nhật cần giữ để trace chỉ ra đúng ô vừa thay đổi.", "Enqueue checks for full before writing, places the item at `rear`, advances rear circularly, and increments count. The update order must remain clear so a trace identifies the changed cell."),
    py: bi("L017–L019 bảo vệ overflow; L020 giữ insert index; L021 ghi item; L022 wrap rear; L023 tăng count. L024 ghi trace bằng index trước khi rear đổi.", "L017-L019 protect against overflow; L020 saves the insertion index; L021 writes the item; L022 wraps rear; L023 increments count. L024 records the old index after rear changes."),
    rep: bi("Hiển thị trạng thái trước/sau gồm items, front, rear, count và đánh sáng đúng ô `insert_index`.", "Show before/after states for items, front, rear, and count, highlighting exactly `insert_index`."),
    rule: bi("Nếu đầy, trạng thái không đổi và trả thất bại; nếu thành công, đúng một ô nhận item, rear tiến một bước modulo capacity và count tăng một.", "If full, state remains unchanged and failure is returned; if successful, exactly one cell receives the item, rear advances one modulo capacity, and count increases by one."),
    mis: [bi("Ghi đè phần tử khi queue đầy.", "Overwriting an item when the queue is full."), bi("Tăng rear không modulo nên vượt chỉ số cuối.", "Incrementing rear without modulo and moving past the last index.")],
    sig: [bi("Đề yêu cầu insert/enqueue và chỉ rõ hành vi khi đầy.", "The task asks for insert/enqueue and specifies full-state behaviour."), bi("Rear/tail ở cuối array cần quay về 0.", "Rear/tail at the array end must wrap to 0.")],
    micro: [bi("Queue có capacity=3, rear=2, count=2; thực hiện enqueue giá trị 9.", "A queue has capacity=3, rear=2, and count=2; enqueue the value 9."), bi("Ghi 9 vào index 2, rear thành `(2+1)%3=0`, count thành 3.", "Write 9 at index 2, set rear to `(2+1)%3=0`, and count to 3.")],
    check: [bi("Tại sao lưu `insert_index` trước khi đổi rear?", "Why save `insert_index` before changing rear?"), bi("Để ghi và trace đúng ô được dùng cho lần enqueue hiện tại.", "To write and trace the cell used by the current enqueue."), bi("Rear sau cập nhật đã chỉ thao tác kế tiếp.", "After the update, rear points to the next operation.")], lines: ["queue.v1.L017", "queue.v1.L020", "queue.v1.L021", "queue.v1.L022", "queue.v1.L023"]
  },
  "queue/dequeue": {
    ex: bi("Dequeue kiểm tra rỗng trước, đọc item tại front, tùy representation có thể xóa dấu vết ô, rồi dịch front và giảm count. Giá trị được đọc trước khi xóa phải được trả về cho caller.", "Dequeue checks for empty first, reads the item at front, may clear the cell according to the representation, then advances front and decreases count. The value read before clearing must be returned to the caller."),
    py: bi("L028–L030 xử lý underflow bằng `None`; L031–L033 lưu item rồi xóa ô; L034–L035 cập nhật front/count; L037 trả item.", "L028-L030 handle underflow with `None`; L031-L033 save the item then clear the cell; L034-L035 update front/count; L037 returns the item."),
    rep: bi("Đánh sáng ô front trước thao tác; sau thao tác chuyển mũi tên front, giảm count và ghi riêng returned item.", "Highlight the front cell before the operation; afterwards move the front arrow, reduce count, and show the returned item separately."),
    rule: bi("Nếu rỗng, không đổi queue; nếu thành công, trả đúng phần tử lâu nhất, front tiến một modulo capacity và count giảm một.", "If empty, do not change the queue; if successful, return the oldest item, advance front by one modulo capacity, and decrease count by one."),
    mis: [bi("Xóa ô trước khi lưu item nên trả `None`.", "Clearing the cell before saving the item, then returning `None`."), bi("Giảm count khi queue đã rỗng.", "Decreasing count when the queue is already empty.")],
    sig: [bi("Đề yêu cầu delete/dequeue và trả phần tử bị lấy.", "The task asks for delete/dequeue and the removed item must be returned."), bi("Cần xử lý underflow hoặc sentinel khi rỗng.", "Underflow or an empty sentinel must be handled.")],
    micro: [bi("front=2, capacity=4, item tại index 2 là 'A'.", "front=2, capacity=4, and index 2 contains 'A'."), bi("Lưu 'A', xóa index 2, front thành 3, giảm count và trả 'A'.", "Save 'A', clear index 2, set front to 3, decrease count, and return 'A'.")],
    check: [bi("Vì sao L032 phải chạy trước L033?", "Why must L032 run before L033?"), bi("L032 giữ giá trị cần trả trước khi L033 xóa ô.", "L032 preserves the return value before L033 clears the cell."), bi("Thứ tự cập nhật là một phần của contract thao tác.", "Update order is part of the operation contract.")], lines: ["queue.v1.L028", "queue.v1.L031", "queue.v1.L032", "queue.v1.L033", "queue.v1.L034", "queue.v1.L037"]
  },
  "queue/inspect-live-items": {
    ex: bi("Duyệt queue không phá hủy phải đọc đúng `count` phần tử theo logical order từ front và không thay đổi front/rear/count. Với circular array, index vật lý của offset là `(front + offset) % capacity`.", "A non-destructive queue traversal reads exactly `count` items in logical order from front without changing front/rear/count. In a circular array, the physical index for an offset is `(front + offset) % capacity`."),
    py: bi("L039–L044 tạo list mới; L041 lặp đúng count lần và L042 ánh xạ offset qua modulo. Không line nào gán lại front, rear hoặc count.", "L039-L044 build a new list; L041 iterates exactly count times and L042 maps each offset with modulo. No line reassigns front, rear, or count."),
    rep: bi("Đánh số logical offset 0..count-1 phía trên các ô vật lý tương ứng; bỏ qua ô `None` không thuộc tập live thay vì quét toàn array.", "Label logical offsets 0..count-1 over their corresponding physical cells; ignore non-live `None` cells rather than scanning the whole array."),
    rule: bi("Kết quả có đúng count phần tử theo FIFO order; toàn bộ trạng thái queue trước và sau giống nhau.", "The result contains exactly count items in FIFO order; the complete queue state is identical before and after inspection."),
    mis: [bi("Duyệt toàn bộ array rồi loại `None`, sai nếu `None` là dữ liệu hợp lệ hoặc thứ tự đã wrap.", "Scanning the whole array and filtering `None`, which fails if `None` is valid data or order has wrapped."), bi("Gọi dequeue để xem dữ liệu nhưng không khôi phục queue.", "Calling dequeue to inspect data without restoring the queue.")],
    sig: [bi("Đề yêu cầu display/total/search nhưng phải giữ queue.", "The task asks to display/total/search while preserving the queue."), bi("Có count và front cho phép duyệt logical items.", "Count and front are available for traversing logical items.")],
    micro: [bi("Xét queue vòng có front=3, count=3 và capacity=5.", "Consider a circular queue with front=3, count=3, and capacity=5."), bi("Các index lần lượt là 3,4,0; front/rear/count không đổi sau khi tạo list kết quả.", "The indices are 3, 4, and 0; front/rear/count remain unchanged after building the result list.")],
    check: [bi("Vì sao lặp theo count thay vì đến khi gặp `None`?", "Why iterate by count instead of stopping at `None`?"), bi("Count là số phần tử sống theo representation; sentinel trong array không phải contract tổng quát cho dữ liệu.", "Count is the live-item total under this representation; an array sentinel is not a general data contract."), bi("Dùng metadata của ADT giữ đúng thứ tự và số lượng.", "Using ADT metadata preserves order and cardinality.")], lines: ["queue.v1.L039", "queue.v1.L041", "queue.v1.L042", "queue.v1.L044"]
  },
  "queue/reduce-consume": {
    ex: bi("Reduce gộp nhiều item thành một kết quả, ví dụ tổng; trước tiên phải quyết định thao tác chỉ đọc hay tiêu thụ queue. Nếu tiêu thụ, termination dựa vào trạng thái rỗng; nếu giữ nguyên, duyệt đúng live items mà không gọi dequeue.", "A reduction folds many items into one result, such as a total; first decide whether the operation reads or consumes the queue. A consuming version terminates at empty, while a preserving version traverses live items without dequeuing."),
    py: bi("Pilot chọn preserve: L062 gọi `live_items`, rồi L063 tính tổng số từ bản sao logical. Không dequeue trong bước reduce, nên queue vẫn giữ dữ liệu; artifact chưa triển khai biến thể recursive consuming.", "The pilot chooses preserve: L062 calls `live_items`, then L063 totals numeric values from the logical copy. It does not dequeue during reduction, so the queue is preserved; the artifact does not implement a recursive consuming variant."),
    rep: bi("Ghi accumulator cùng item đang xử lý và đánh dấu rõ policy `preserve` hoặc `consume`; với recursion, mỗi frame giữ phần còn chờ cộng.", "Show the accumulator and current item, and label the policy as `preserve` or `consume`; with recursion, each frame holds the pending combination."),
    rule: bi("Kết quả bằng fold trên đúng logical items; policy trạng thái sau phải khớp yêu cầu: nguyên vẹn nếu preserve, rỗng nếu consume hết.", "The result equals a fold over exactly the logical items; final state must match the policy: unchanged for preserve, empty after full consumption."),
    mis: [bi("Vô tình làm rỗng queue khi đề yêu cầu giữ nguyên.", "Accidentally emptying the queue when the task requires preservation."), bi("Cộng cả ô không sử dụng hoặc dữ liệu không phải số.", "Adding unused cells or non-numeric data.")],
    sig: [bi("Đề yêu cầu total/count/find trên queue và có từ khóa giữ nguyên hoặc remove.", "The task asks for total/count/find on a queue and includes preserve/remove language."), bi("Có thể yêu cầu recursive processing của ADT.", "Recursive processing of the ADT may be required.")],
    micro: [bi("Queue logical `[2,'x',5]`, policy preserve.", "Logical queue `[2,'x',5]`, preserve policy."), bi("Lọc giá trị số rồi tổng bằng 7; trạng thái queue không đổi.", "Filter numeric values and total 7; the queue state remains unchanged.")],
    check: [bi("Artifact pilot đang dùng policy nào, và line nào chứng minh?", "Which policy does the pilot use, and which lines establish it?"), bi("Preserve; L062 lấy bản sao từ `live_items` và L063 reduce bản sao, không gọi dequeue.", "Preserve; L062 obtains a copy from `live_items` and L063 reduces that copy without calling dequeue."), bi("Policy phải được đọc từ source contract trước khi chọn thuật toán.", "The policy must be read from the source contract before choosing an algorithm.")], lines: ["queue.v1.L062", "queue.v1.L063", "queue.v1.L027", "queue.v1.L039"]
  },

  "recursion/recursive-contract": {
    ex: bi("Một hàm đệ quy cần base case trả kết quả trực tiếp và recursive case chuyển sang bài toán nhỏ hơn. Thước đo tiến triển phải tiến gần base case ở mỗi lời gọi để bảo đảm kết thúc.", "A recursive function needs a base case that returns directly and a recursive case that moves to a smaller problem. A progress measure must approach the base case on every call to guarantee termination."),
    py: bi("L007–L009 là base case khi index bằng độ dài list; L010 gọi với `index+1`, nên số phần tử chưa xử lý giảm một. L011–L013 kết hợp và trả kết quả.", "L007-L009 form the base case when index equals list length; L010 calls with `index+1`, reducing the unprocessed suffix by one. L011-L013 combine and return the result."),
    rep: bi("Tách mỗi definition thành `base condition -> base value` và `recursive condition -> smaller call + combine`; ghi progress measure bên cạnh.", "Split each definition into `base condition -> base value` and `recursive condition -> smaller call + combine`; write the progress measure beside it."),
    rule: bi("Base case không gọi lại; recursive case giảm kích thước bài toán; mọi đường đi hợp lệ cuối cùng tới base case.", "The base case makes no recursive call; the recursive case decreases problem size; every valid path eventually reaches the base case."),
    mis: [bi("Có base case nhưng tham số không bao giờ tiến tới nó.", "Having a base case but never moving the parameter toward it."), bi("Base value sai identity, làm toàn bộ kết quả sai khi unwind.", "Using the wrong identity as the base value, corrupting the result during unwinding.")],
    sig: [bi("Đề yêu cầu viết hoặc giải thích recursive function.", "The task asks for a recursive function or an explanation of one."), bi("Có cấu trúc tự giống nhau hoặc dữ liệu được thu nhỏ qua mỗi bước.", "The structure is self-similar or the data shrinks at each step.")],
    micro: [bi("Tổng từ index bằng len(values).", "Sum starting at index equal to len(values)."), bi("Không còn phần tử nên trả 0; 0 là identity của phép cộng.", "No items remain, so return 0; zero is the additive identity.")],
    check: [bi("Progress measure của `recursive_sum` là gì?", "What is the progress measure for `recursive_sum`?"), bi("`len(values)-index`, giảm một ở mỗi lời gọi.", "`len(values)-index`, which decreases by one on every call."), bi("Khi measure về 0, base case chạy.", "When the measure reaches zero, the base case runs.")], lines: ["recursion.v1.L007", "recursion.v1.L009", "recursion.v1.L010", "recursion.v1.L013"]
  },
  "recursion/call-stack-unwind": {
    ex: bi("Mỗi lời gọi tạo một frame riêng chứa tham số, biến cục bộ và vị trí chờ trả về. Khi gặp base case, các frame được tháo theo LIFO; công việc nằm sau recursive call chỉ chạy khi frame con trả về.", "Each call creates a separate frame containing parameters, local variables, and a return point. At the base case, frames unwind in LIFO order; work after the recursive call runs only when the child frame returns."),
    py: bi("L006 ghi sự kiện call; L010 tạm dừng frame hiện tại để chờ subtotal. L011–L012 chạy theo thứ tự ngược khi unwind và ghi result của từng index.", "L006 records each call; L010 suspends the current frame while awaiting subtotal. L011-L012 run in reverse order during unwinding and record each index's result."),
    rep: bi("Vẽ stack từ frame index 0 ở đáy đến base frame ở đỉnh; khi return, xóa frame trên cùng và chuyển subtotal xuống frame cha.", "Draw a stack from index-0 frame at the bottom to the base frame at the top; on return, remove the top frame and pass subtotal to its parent."),
    rule: bi("Frame có local state độc lập; return theo thứ tự ngược với call; subtotal của frame cha bằng kết quả hoàn chỉnh của frame con.", "Frames have independent local state; returns occur in reverse call order; the parent's subtotal is the completed child result."),
    mis: [bi("Cộng giá trị khi đi xuống và thêm lần nữa khi unwind.", "Adding a value while descending and again while unwinding."), bi("Cho rằng mọi frame dùng chung biến `index`.", "Assuming every frame shares one `index` variable.")],
    sig: [bi("Cần trace lời gọi/giá trị trả về hoặc giải thích call stack.", "Calls/returns must be traced or the call stack explained."), bi("Biểu thức có công việc chờ sau recursive call.", "The expression has pending work after the recursive call.")],
    micro: [bi("`recursive_sum([2,3],0)` tạo frame index 0,1,2.", "`recursive_sum([2,3],0)` creates frames for indices 0, 1, and 2."), bi("Frame 2 trả 0; frame 1 trả 3; frame 0 trả 5.", "Frame 2 returns 0; frame 1 returns 3; frame 0 returns 5.")],
    check: [bi("Tại sao event return xuất hiện theo index giảm dần?", "Why do return events appear with decreasing indices?"), bi("Stack tháo LIFO: frame tạo sau cùng hoàn thành trước.", "The stack unwinds LIFO: the most recently created frame completes first."), bi("Theo dõi call và return riêng giúp không nhầm thứ tự.", "Tracking calls and returns separately prevents order errors.")], lines: ["recursion.v1.L006", "recursion.v1.L010", "recursion.v1.L011", "recursion.v1.L012"]
  },
  "recursion/design-benefits": {
    ex: bi("Recursion phù hợp khi bài toán có định nghĩa tự giống nhau hoặc cấu trúc phân nhánh; code có thể bám sát định nghĩa. Đổi lại, mỗi call dùng stack frame và recursion sâu có thể tốn bộ nhớ hoặc chạm giới hạn recursion.", "Recursion suits self-similar definitions or branching structures and can mirror the problem definition closely. The trade-off is one stack frame per call, so deep recursion can use substantial memory or reach a recursion limit."),
    py: bi("L029 và L030 chạy hai cách tương đương; L032 so sánh kết quả. `recursive_sum` tạo event cho từng call trong khi `iterative_sum` L016–L020 dùng một accumulator, giúp quan sát trade-off.", "L029 and L030 run two equivalent approaches; L032 compares their results. `recursive_sum` emits one event per call while `iterative_sum` at L016-L020 uses one accumulator, exposing the trade-off."),
    rep: bi("So sánh hai cột: clarity theo cấu trúc bài toán, số frame/biến trạng thái, độ sâu tối đa và điều kiện kết thúc.", "Compare two columns: clarity against problem structure, number of frames/state variables, maximum depth, and termination condition."),
    rule: bi("Chọn recursion vì cấu trúc/contract, không chỉ vì có thể; luôn đánh giá depth, base case và khả năng biểu diễn lặp tương đương.", "Choose recursion because it fits the structure/contract, not merely because it is possible; always assess depth, base case, and an equivalent iterative representation."),
    mis: [bi("Khẳng định recursion luôn nhanh hoặc luôn ngắn hơn.", "Claiming recursion is always faster or always shorter."), bi("Bỏ qua bộ nhớ stack khi so sánh.", "Ignoring stack memory in a comparison.")],
    sig: [bi("Đề hỏi khi nào recursion có lợi hoặc yêu cầu so sánh với iteration.", "The task asks when recursion is beneficial or requests comparison with iteration."), bi("Bài toán là tree, divide-and-conquer hoặc định nghĩa theo bài toán nhỏ hơn.", "The problem is a tree, divide-and-conquer process, or defined through smaller instances.")],
    micro: [bi("Tổng list tuyến tính có cả recursive và iterative form đơn giản.", "A linear list sum has simple recursive and iterative forms."), bi("Hai cách cho cùng kết quả; loop thường dùng ít stack hơn, recursion minh họa rõ suffix nhỏ hơn.", "Both give the same result; the loop normally uses less stack, while recursion clearly exposes the smaller suffix.")],
    check: [bi("Một lợi ích và một hạn chế thấy được từ pilot là gì?", "What is one benefit and one limitation visible in the pilot?"), bi("Recursive form bám định nghĩa suffix; nó tạo một frame cho mỗi index.", "The recursive form mirrors the suffix definition; it creates one frame per index."), bi("Câu trả lời cần gắn lợi/hại với cấu trúc cụ thể.", "The answer should tie benefits and costs to the specific structure.")], lines: ["recursion.v1.L005", "recursion.v1.L016", "recursion.v1.L029", "recursion.v1.L030", "recursion.v1.L032"]
  },
  "recursion/translate-recursive": {
    ex: bi("Khi dịch một thuật toán đệ quy sang Python, giữ nguyên base condition, thứ tự đánh giá và giá trị trả về. Toán tử chia nguyên, slicing và mutation cần được chọn theo đúng ý nghĩa của pseudocode nguồn.", "When translating a recursive algorithm into Python, preserve its base condition, evaluation order, and return value. Integer division, slicing, and mutation must match the source pseudocode semantics."),
    py: bi("L005 giữ signature rõ; L007 dịch base condition; L010 lưu kết quả lời gọi con; L011 kết hợp; L013 return. Chuỗi này cho thấy giá trị phải được truyền qua từng frame.", "L005 preserves a clear signature; L007 translates the base condition; L010 stores the child result; L011 combines it; L013 returns. This chain shows that values must pass through every frame."),
    rep: bi("Đặt pseudocode và Python cạnh nhau theo bốn nhãn: parameters, base case, smaller call, combine/return.", "Place pseudocode and Python side by side under four labels: parameters, base case, smaller call, and combine/return."),
    rule: bi("Không thay đổi contract input/output; mọi nhánh trả đúng kiểu; phép toán Python giữ đúng semantics của thuật toán đã cho.", "Do not change the input/output contract; every branch returns the required type; Python operations preserve the supplied algorithm's semantics."),
    mis: [bi("Quên `return` ở recursive branch.", "Forgetting `return` in a recursive branch."), bi("Dùng `/` khi thuật toán cần chia nguyên `//`.", "Using `/` when the algorithm requires integer division `//`.")],
    sig: [bi("Đề cung cấp pseudocode/definition và yêu cầu implement bằng Python.", "The task supplies pseudocode/a definition and asks for a Python implementation."), bi("Có nhiều return path cần giữ cùng contract.", "Several return paths must preserve one contract.")],
    micro: [bi("Definition: sum suffix = 0 khi hết list, ngược lại item + sum suffix còn lại.", "Definition: suffix sum is 0 at list end, otherwise item plus the remaining suffix sum."), bi("Python dùng L007–L013 đúng cùng cấu trúc và trả `int` ở cả base/recursive path.", "Python uses L007-L013 with the same structure and returns an `int` on both base and recursive paths.")],
    check: [bi("Line nào truyền kết quả của lời gọi con vào phép kết hợp?", "Which line carries the child result into the combination?"), bi("L010 gán recursive return vào `subtotal`, sau đó L011 dùng nó.", "L010 assigns the recursive return to `subtotal`, which L011 then uses."), bi("Tách call result khỏi combine làm luồng dữ liệu dễ kiểm tra.", "Separating call result from combination makes data flow easier to verify.")], lines: ["recursion.v1.L005", "recursion.v1.L007", "recursion.v1.L010", "recursion.v1.L011", "recursion.v1.L013"]
  },
  "recursion/iteration-conversion": {
    ex: bi("Chuyển recursion sang iteration cần lưu mọi trạng thái mà call stack từng giữ. Với tail-like linear accumulation, một loop và accumulator có thể đủ; với pending work phức tạp, cần stack tường minh.", "Converting recursion to iteration requires preserving all state previously held by the call stack. For a tail-like linear accumulation, a loop and accumulator may suffice; complex pending work needs an explicit stack."),
    py: bi("L005–L013 và L016–L020 tính cùng tổng bằng hai cơ chế. L029–L032 chạy cả hai và kiểm tra equality, tạo oracle tương đương cho fixture pilot.", "L005-L013 and L016-L020 calculate the same total using two mechanisms. L029-L032 run both and check equality, providing an equivalence oracle for the pilot fixtures."),
    rep: bi("Lập bảng ánh xạ `frame parameter -> loop variable`, `base value -> accumulator initial value`, `unwind combine -> loop update`.", "Build a mapping table from `frame parameter -> loop variable`, `base value -> accumulator initial value`, and `unwind combine -> loop update`."),
    rule: bi("Hai phiên bản phải có cùng input/output và xử lý boundary/failure như nhau; kiểm chứng trên normal, empty boundary và invalid input.", "Both versions must share the same input/output behaviour and boundary/failure handling; verify normal, empty-boundary, and invalid inputs."),
    mis: [bi("Chuyển loop nhưng đổi thứ tự kết hợp trong phép không giao hoán.", "Converting to a loop but changing combination order for a non-commutative operation."), bi("Chỉ kiểm tra một input thuận lợi rồi kết luận tương đương.", "Checking one convenient input and declaring equivalence.")],
    sig: [bi("Đề yêu cầu rewrite recursion/iteration hoặc so sánh output.", "The task asks to rewrite recursion/iteration or compare outputs."), bi("Cần giữ trạng thái pending trong stack hoặc accumulator.", "Pending state must be retained in a stack or accumulator.")],
    micro: [bi("Kiểm tra hai phiên bản với danh sách đầu vào rỗng `[]`.", "Test both versions with an empty input list `[]`."), bi("Recursive base trả 0; iterative accumulator khởi tạo 0 và loop chạy 0 lần, nên cùng kết quả.", "The recursive base returns 0; the iterative accumulator starts at 0 and the loop runs zero times, so outputs match.")],
    check: [bi("Kiểm tra equality ở L032 có chứng minh tương đương cho mọi input không?", "Does the equality check at L032 prove equivalence for every input?"), bi("Không; nó chỉ chứng minh cho fixture đã chạy. Cần reasoning và bộ case đại diện.", "No; it proves equality only for the executed fixture. Reasoning and representative cases are still required."), bi("Execution evidence có giới hạn, không thay thế proof tổng quát.", "Execution evidence is bounded and does not replace a general proof.")], lines: ["recursion.v1.L005", "recursion.v1.L016", "recursion.v1.L029", "recursion.v1.L030", "recursion.v1.L032"]
  },

  "hashing/table-storage": {
    ex: bi("Hash table có capacity cố định và quy ước ô rỗng; collision xảy ra khi hai key có cùng địa chỉ ban đầu. Cách lưu collision phải theo đúng cấu trúc được giao, như probing, bucket hoặc vùng spare, vì các cách này có invariants khác nhau.", "A hash table has fixed capacity and an empty-slot convention; a collision occurs when keys share an initial address. Collision storage must follow the supplied structure, such as probing, buckets, or a spare area, because their invariants differ."),
    py: bi("Pilot tạo `slots=[None]*size` ở L009 và dùng linear probing trong cùng array ở L017–L024. Nó không triển khai `Spare` array/bucket riêng; bài yêu cầu cấu trúc đó cần artifact khác hoặc mở rộng đã kiểm chứng.", "The pilot creates `slots=[None]*size` at L009 and uses linear probing in the same array at L017-L024. It does not implement a separate `Spare` array or bucket; a task requiring that structure needs another or extended verified artifact."),
    rep: bi("Vẽ index 0..size-1, giá trị/sentinel mỗi ô và đường từ hash address tới chuỗi probe. Ghi rõ collision policy ở tiêu đề.", "Draw indices 0..size-1, each value/sentinel, and a path from the hash address through the probe sequence. State the collision policy in the title."),
    rule: bi("Mỗi key lưu ở một vị trí reachable theo collision policy; `None` biểu thị chưa dùng trong pilot; số bước probe không vượt size.", "Every stored key occupies a position reachable under the collision policy; `None` means unused in the pilot; probing takes at most size steps."),
    mis: [bi("Trộn linear probing với spare-array layout trong cùng lời giải.", "Mixing linear probing with a spare-array layout in one solution."), bi("Không giới hạn số lần probe khi bảng đầy.", "Failing to bound probes when the table is full.")],
    sig: [bi("Đề cung cấp table size, sentinel và collision strategy.", "The task supplies table size, sentinel, and collision strategy."), bi("Có từ khóa bucket, overflow/spare hoặc probing.", "Keywords include bucket, overflow/spare, or probing.")],
    micro: [bi("size=5, key 7 có address 2 nhưng slot 2 đã dùng.", "size=5, key 7 hashes to address 2 but slot 2 is occupied."), bi("Với pilot linear probing, kiểm tra 3,4,0,1 tối đa một vòng; không tự chuyển sang spare array.", "Under pilot linear probing, inspect 3, 4, 0, and 1 for at most one cycle; do not silently switch to a spare array.")],
    check: [bi("Artifact pilot dùng collision policy nào?", "Which collision policy does the pilot use?"), bi("Linear probing trong cùng `slots`, với wraparound modulo.", "Linear probing inside the same `slots` array with modulo wraparound."), bi("Policy được chứng minh bởi L017–L020, không phải chỉ bởi tên HashTable.", "The policy is evidenced by L017-L020, not merely by the name HashTable.")], lines: ["hashing.v1.L009", "hashing.v1.L017", "hashing.v1.L018", "hashing.v1.L020", "hashing.v1.L025"]
  },
  "hashing/hash-address": {
    ex: bi("Hash function biến key thành địa chỉ hợp lệ. Với công thức modulo, địa chỉ là `key % table_size`; cần table_size dương và key thuộc kiểu mà công thức định nghĩa.", "A hash function maps a key to a valid address. For a modulo rule, the address is `key % table_size`; table_size must be positive and the key must have the type required by the rule."),
    py: bi("L012–L013 triển khai `key % len(self.slots)`; L007–L009 đảm bảo size dương trước khi dùng. L041 từ chối key không phải integer cho contract của pilot.", "L012-L013 implement `key % len(self.slots)`; L007-L009 ensure a positive size first. L041 rejects non-integer keys under the pilot contract."),
    rep: bi("Hiển thị key, divisor/table size, quotient/remainder và mũi tên tới index bằng remainder.", "Show the key, divisor/table size, quotient/remainder, and an arrow to the index equal to the remainder."),
    rule: bi("Với size dương, `0 <= address < size`; cùng key và cùng size luôn tạo cùng address ban đầu.", "For positive size, `0 <= address < size`; the same key and size always produce the same initial address."),
    mis: [bi("Dùng phép chia thường hoặc quotient làm address.", "Using normal division or the quotient as the address."), bi("Dùng modulo một hằng khác với capacity được giao.", "Taking modulo by a constant different from the supplied capacity.")],
    sig: [bi("Đề cho key và công thức/modulus để tính vị trí.", "The task gives a key and a formula/modulus for its position."), bi("Cần viết riêng hash function hoặc hoàn thiện address expression.", "A hash function or address expression must be written.")],
    micro: [bi("Tính địa chỉ cho key=23 trong bảng có size=7.", "Calculate the address for key=23 in a table of size=7."), bi("`23 % 7 = 2`, nên address hợp lệ là index 2.", "`23 % 7 = 2`, so the valid address is index 2.")],
    check: [bi("Tại sao constructor chặn size=0?", "Why does the constructor reject size=0?"), bi("Modulo 0 không xác định và không có index hợp lệ.", "Modulo zero is undefined and there is no valid index."), bi("Tiền điều kiện của representation bảo vệ hash calculation.", "The representation precondition protects the hash calculation.")], lines: ["hashing.v1.L007", "hashing.v1.L009", "hashing.v1.L012", "hashing.v1.L013", "hashing.v1.L041"]
  },
  "hashing/insert-collisions": {
    ex: bi("Insert tính địa chỉ ban đầu rồi theo collision sequence đến ô trống hoặc key đã có. Thuật toán phải dừng sau số vị trí hữu hạn và báo thất bại khi không còn ô phù hợp.", "Insertion computes the initial address and follows the collision sequence to an empty cell or the existing key. It must stop after finitely many positions and report failure when no suitable cell remains."),
    py: bi("L016 tính start; L017 giới hạn tối đa size bước; L018 wrap index; L020–L022 ghi vào ô trống; L023–L024 xử lý duplicate; L025 trả -1 khi đầy.", "L016 computes start; L017 limits probing to size steps; L018 wraps the index; L020-L022 write to an empty cell; L023-L024 handle a duplicate; L025 returns -1 when full."),
    rep: bi("Vẽ probe path theo sequence và đánh dấu mỗi comparison; phân biệt kết quả inserted, already present và full.", "Draw the probe path in sequence and mark every comparison; distinguish inserted, already present, and full outcomes."),
    rule: bi("Không ghi đè key khác; chỉ ghi vào sentinel rỗng; probe tối đa capacity vị trí; returned index khớp vị trí key cuối cùng.", "Do not overwrite another key; write only to an empty sentinel; probe at most capacity positions; the returned index matches the key's final location."),
    mis: [bi("Ghi đè ngay tại hash address khi collision.", "Overwriting the hash address immediately on collision."), bi("Probe vô hạn khi bảng không còn ô trống.", "Probing forever when no empty slot remains.")],
    sig: [bi("Đề yêu cầu insert và mô tả collision/full behaviour.", "The task asks for insertion and defines collision/full behaviour."), bi("Cần trả index/status hoặc cập nhật overflow structure.", "An index/status must be returned or an overflow structure updated.")],
    micro: [bi("size=5, insert 7 rồi 12; cả hai hash về 2.", "size=5, insert 7 then 12; both hash to 2."), bi("7 vào slot 2; 12 probe slot 2 rồi vào slot 3 theo linear probing.", "7 enters slot 2; 12 probes slot 2 then enters slot 3 under linear probing.")],
    check: [bi("Điều gì giới hạn insert khi bảng đầy?", "What bounds insertion when the table is full?"), bi("`range(len(self.slots))` ở L017 chỉ cho tối đa capacity lần kiểm tra.", "`range(len(self.slots))` at L017 allows at most capacity checks."), bi("Bounded probe tạo failure path rõ ràng.", "Bounded probing creates an explicit failure path.")], lines: ["hashing.v1.L016", "hashing.v1.L017", "hashing.v1.L018", "hashing.v1.L020", "hashing.v1.L021", "hashing.v1.L025"]
  },
  "hashing/find-collisions": {
    ex: bi("Search phải theo cùng hash function và collision sequence đã dùng khi insert. Với linear probing không xóa tombstone, gặp ô chưa dùng chứng minh key không thể nằm xa hơn; nếu không gặp, dừng sau một vòng.", "Search must follow the same hash function and collision sequence used by insertion. With linear probing and no deletion tombstones, an unused cell proves the key cannot lie farther along; otherwise stop after one full cycle."),
    py: bi("L028 lấy start; L029–L031 tạo cùng probe sequence với insert; L032–L033 dừng ở ô trống; L034–L035 trả index khi bằng; L036 là not-found sau một vòng.", "L028 obtains start; L029-L031 create the same probe sequence as insertion; L032-L033 stop at an empty cell; L034-L035 return the index on equality; L036 is not-found after one cycle."),
    rep: bi("Hiển thị key cần tìm và đường probe; tại mỗi ô ghi một trong ba quyết định: empty-stop, equal-found, occupied-continue.", "Show the search key and probe path; label each slot with one of three decisions: empty-stop, equal-found, or occupied-continue."),
    rule: bi("Search không thay đổi table; kiểm tra key bằng equality; trả found index hoặc not-found sentinel theo contract.", "Search does not mutate the table; keys are checked by equality; return the found index or the contract's not-found sentinel."),
    mis: [bi("Chỉ kiểm tra hash address rồi kết luận not found sau collision.", "Checking only the hash address and declaring not found after a collision."), bi("Dùng collision order khác insert.", "Using a different collision order from insertion.")],
    sig: [bi("Đề yêu cầu locate/find key trong hash storage có collision.", "The task asks to locate/find a key in hashed storage with collisions."), bi("Cần trả index/sentinel và không cập nhật dữ liệu.", "An index/sentinel must be returned without changing data.")],
    micro: [bi("Table có 7 ở slot 2, 12 ở slot 3; tìm 12.", "The table has 7 at slot 2 and 12 at slot 3; search for 12."), bi("Hash về 2, so sánh 7 rồi probe 3 và tìm thấy 12.", "Hash to 2, compare 7, then probe 3 and find 12.")],
    check: [bi("Khi nào `None` cho phép dừng sớm trong pilot?", "When does `None` allow an early stop in the pilot?"), bi("Khi không có deletion/tombstone và insert/search dùng cùng linear-probe sequence.", "When there is no deletion/tombstone and insertion/search use the same linear-probe sequence."), bi("Nếu contract có deletion, quy tắc sentinel phải được xem lại.", "If the contract includes deletion, sentinel rules must be reconsidered.")], lines: ["hashing.v1.L028", "hashing.v1.L029", "hashing.v1.L030", "hashing.v1.L032", "hashing.v1.L034", "hashing.v1.L036"]
  },

  "object-files/construct-from-record": {
    ex: bi("Đọc record từ tệp gồm parse trường, kiểm tra số lượng/kiểu, chuyển kiểu rồi gọi constructor theo đúng thứ tự tham số. Chỉ append object sau khi toàn bộ record hợp lệ để tránh state nửa hoàn chỉnh.", "Reading a file record involves parsing fields, checking count/types, converting values, then calling the constructor in the required parameter order. Append the object only after the complete record is valid to avoid partial state."),
    py: bi("L018–L021 đọc từng CSV record; L073–L074 kiểm tra layout và chuyển `pages` ở field 2. L075–L081 dispatch theo discriminator `BOOK`/`EBOOK`; L077 hoặc L079 gọi đúng constructor, rồi L082–L083 append và ghi loại object đã tạo.", "L018-L021 read each CSV record; L073-L074 validate its layout and convert `pages` from field 2. L075-L081 dispatch on the `BOOK`/`EBOOK` discriminator; L077 or L079 calls the matching constructor, then L082-L083 append and record the constructed object type."),
    rep: bi("Dùng pipeline `CSV fields -> validated typed values -> constructor arguments -> object list`; ghi line number cạnh record để truy lỗi.", "Use a pipeline `CSV fields -> validated typed values -> constructor arguments -> object list`; retain the line number for error tracing."),
    rule: bi("Mỗi accepted record tạo đúng một object; constructor nhận đúng thứ tự/kiểu; record lỗi không tạo object và trả failure rõ.", "Each accepted record creates exactly one object; constructor arguments have the correct order/types; an invalid record creates no object and yields an explicit failure."),
    mis: [bi("Append object trước khi chuyển kiểu hoàn tất.", "Appending an object before conversion completes."), bi("Đảo `title` và `pages` khi gọi constructor.", "Swapping `title` and `pages` in the constructor call.")],
    sig: [bi("Đề mô tả file record và yêu cầu tạo array/list object.", "The task describes file records and asks for an array/list of objects."), bi("Có bước convert field string sang integer/real/date.", "A field string must be converted to integer/real/date.")],
    micro: [bi("Đọc hai dòng `BOOK,Algorithms,320` và `EBOOK,Networks,240,PDF`.", "Read `BOOK,Algorithms,320` and `EBOOK,Networks,240,PDF`."), bi("Đổi field pages sang int, tạo `Book('Algorithms',320)` và `EBook('Networks',240,'PDF')`, rồi append mỗi object đúng một lần.", "Convert each pages field to int, construct `Book('Algorithms',320)` and `EBook('Networks',240,'PDF')`, then append each object exactly once.")],
    check: [bi("Vì sao L077/L079 nằm sau conversion L074?", "Why do L077/L079 come after conversion at L074?"), bi("Để cả hai constructor chỉ nhận `pages` đã chuyển thành int thành công.", "So both constructors receive `pages` only after successful integer conversion."), bi("Validation và dispatch trước mutation giữ list object nhất quán.", "Validation and dispatch before mutation keep the object list consistent.")], lines: ["object-files.v1.L018", "object-files.v1.L073", "object-files.v1.L074", "object-files.v1.L075", "object-files.v1.L077", "object-files.v1.L079", "object-files.v1.L082", "object-files.v1.L083"]
  },
  "object-files/subclass-records": {
    ex: bi("Khi record có loại và độ dài khác nhau, type discriminator quyết định subclass và constructor tương ứng. Các field chung đi vào base part; field riêng chỉ truyền cho subclass phù hợp, và unknown type cần failure path.", "When records have different types and lengths, a type discriminator selects the matching subclass and constructor. Common fields belong to the base part; specialised fields go only to the matching subclass, and an unknown type needs a failure path."),
    py: bi("L063 định nghĩa `EBook(Book)`; L064–L066 gọi base constructor rồi giữ `FileFormat`. L068–L072 override representation. Khi đọc file, L075–L081 kiểm tra `BOOK` có 3 field hoặc `EBOOK` có 4 field, gọi đúng constructor và từ chối type/layout không hợp lệ.", "L063 defines `EBook(Book)`; L064-L066 call the base constructor and retain `FileFormat`. L068-L072 override the representation. During file reading, L075-L081 require three fields for `BOOK` or four for `EBOOK`, call the matching constructor, and reject an invalid type/layout."),
    rep: bi("Vẽ decision table `type tag -> expected field count -> subclass -> constructor mapping`; thêm nhánh unknown/invalid.", "Draw a decision table `type tag -> expected field count -> subclass -> constructor mapping`; include unknown/invalid branches."),
    rule: bi("Mỗi type tag ánh xạ duy nhất tới subclass; field count/kiểu phải được kiểm trước constructor; unknown tag không được mặc định thành base class.", "Each type tag maps to exactly one subclass; field count/types are validated before construction; an unknown tag must not silently become the base class."),
    mis: [bi("Dùng số field làm type duy nhất dù nhiều loại có cùng độ dài.", "Using field count alone as type when different record types can share a length."), bi("Tạo base object rồi gán thêm field thay vì gọi subclass constructor theo contract.", "Creating a base object and attaching fields instead of using the required subclass constructor.")],
    sig: [bi("File có type code hoặc record layout khác nhau và đề cho class hierarchy.", "The file contains a type code or varying layouts and the task supplies a class hierarchy."), bi("Cần chọn subclass khi đọc từng dòng.", "A subclass must be selected for each input line.")],
    micro: [bi("Record `EBOOK,Networks,240,PDF` có discriminator và bốn field.", "Record `EBOOK,Networks,240,PDF` has a discriminator and four fields."), bi("L078 xác nhận type/layout; L079 tạo `EBook('Networks',240,'PDF')`. `as_record` giữ type `EBOOK` cùng `file_format`.", "L078 validates the type/layout; L079 constructs `EBook('Networks',240,'PDF')`. `as_record` retains type `EBOOK` and `file_format`.")],
    check: [bi("Line nào chọn subclass và line nào giữ dữ liệu riêng của subclass?", "Which line selects the subclass and which line preserves subclass-specific data?"), bi("L078–L079 chọn `EBook`; L066 lưu `FileFormat` và L071 đưa nó vào output record.", "L078-L079 select `EBook`; L066 stores `FileFormat` and L071 includes it in the output record."), bi("Discriminator, field count và constructor cùng xác nhận đúng subtype.", "The discriminator, field count, and constructor jointly establish the subtype.")], lines: ["object-files.v1.L063", "object-files.v1.L064", "object-files.v1.L065", "object-files.v1.L066", "object-files.v1.L068", "object-files.v1.L071", "object-files.v1.L075", "object-files.v1.L078", "object-files.v1.L079", "object-files.v1.L081"]
  },
  "object-files/lookup-update": {
    ex: bi("Lookup đọc key, duyệt object và so sánh đúng identifier; khi tìm thấy, gọi method/setter được yêu cầu trên chính instance đó. Cần quyết định dừng ở match đầu hay xử lý mọi match và báo rõ not-found.", "Lookup reads a key, traverses objects, and compares the correct identifier; on a match, it calls the required method/setter on that instance. The contract must decide whether to stop at the first match or process all matches and how to report not-found."),
    py: bi("L056–L060 là setter chỉ chấp nhận số trang nguyên dương. L086–L091 tìm theo `Title`, gọi setter và trả `UPDATED` hoặc `INVALID_UPDATE`; L092–L093 trả `NOT_FOUND` mà không sửa object. L094–L100 đưa cả status và state object sau thao tác vào output.", "L056-L060 implement a setter that accepts only a positive integer page count. L086-L091 search by `Title`, call the setter, and return `UPDATED` or `INVALID_UPDATE`; L092-L093 return `NOT_FOUND` without mutating an object. L094-L100 expose both status and post-operation object state."),
    rep: bi("Dùng bảng trace `(index/object id, compared key, match?)`; khi match, nối tới method call và state before/after của object.", "Use a trace table `(index/object id, compared key, match?)`; on a match, connect to the method call and the object's before/after state."),
    rule: bi("Chỉ object có key match được cập nhật; update qua interface được giao; not-found không làm đổi bất kỳ object nào.", "Only an object whose key matches is updated; mutation uses the supplied interface; not-found changes no object."),
    mis: [bi("So sánh nhầm display field thay vì identifier.", "Comparing a display field instead of the identifier."), bi("Tìm thấy object nhưng cập nhật bản sao/dictionary, không cập nhật instance trong collection.", "Finding the object but updating a copy/dictionary instead of the instance in the collection.")],
    sig: [bi("Đề yêu cầu đọc key, find object rồi gọi method thay đổi state.", "The task asks to read a key, find an object, then call a state-changing method."), bi("Có requirement cho found/not-found hoặc first/all matches.", "There is a requirement for found/not-found or first/all matches.")],
    micro: [bi("Tìm `Algorithms`: new_pages=350 là success, 0 là invalid; key vắng là not-found.", "Look up `Algorithms`: new_pages=350 succeeds, 0 is invalid, and a missing key is not found."), bi("Match gọi L089; setter chỉ gán tại L059 sau validation. Success trả `UPDATED`; invalid giữ pages cũ và trả `INVALID_UPDATE`; không match đi tới L092–L093.", "A match calls L089; the setter assigns only at L059 after validation. Success returns `UPDATED`; invalid input preserves the old pages and returns `INVALID_UPDATE`; no match reaches L092-L093.")],
    check: [bi("Ba kết quả observable của lookup-update là gì?", "What are the three observable lookup-update outcomes?"), bi("`UPDATED` khi setter thành công, `INVALID_UPDATE` khi match nhưng giá trị sai, và `NOT_FOUND` khi không có key.", "`UPDATED` when the setter succeeds, `INVALID_UPDATE` when a match has an invalid value, and `NOT_FOUND` when no key matches."), bi("Mỗi path có status và quy tắc mutation riêng có thể kiểm bằng fixture.", "Each path has a distinct status and mutation rule that fixtures can verify.")], lines: ["object-files.v1.L056", "object-files.v1.L057", "object-files.v1.L059", "object-files.v1.L086", "object-files.v1.L088", "object-files.v1.L089", "object-files.v1.L091", "object-files.v1.L092", "object-files.v1.L093", "object-files.v1.L094", "object-files.v1.L095"]
  }
};

const P4R9_ENRICHMENT = new Map([
  ["data-models/scalars-types-scope", bi(
    "Trong mô hình mảng của đề, capacity và logical count là hai biến có vai trò khác nhau; cả hai phải được khai báo và khởi tạo trước khi tính valid-index interval.",
    "In the task's array model, capacity and logical count are different variables; both must be declared and initialised before deriving the valid-index interval.")],
  ["data-models/array-representation", bi(
    "Phân biệt physical capacity với logical count: các index sống là 0..logical_count-1, còn 0..capacity-1 chỉ là miền ô được cấp. Với 2D, luôn đọc chỉ số theo row-column order của đề.",
    "Separate physical capacity from logical count: live indices are 0..logical_count-1, while 0..capacity-1 is only the allocated-cell range. For 2D data, follow the task's row-column index order.")],
  ["data-models/record-fields", bi(
    "Một record chiếm một logical slot; thêm field vào record không làm tăng logical count của mảng chứa record đó.",
    "One record occupies one logical slot; adding a field to a record does not increase the logical count of the containing array.")],
  ["data-models/bounded-append", bi(
    "Quy trình phòng thi là check `logical_count < capacity`, ghi tại index `logical_count`, rồi tăng count đúng một lần; Python `append` chỉ mô phỏng bước ghi khi contract cho phép.",
    "The exam sequence is: check `logical_count < capacity`, write at index `logical_count`, then increment the count exactly once; Python `append` only simulates the write when the contract allows it.")],
  ["data-models/random-data", bi(
    "Mọi phép thống kê chỉ duyệt logical region; các ô chưa dùng trong physical capacity không được tính như dữ liệu đã sinh.",
    "Every summary scans only the logical region; unused cells in the physical capacity are not generated data.")],
  ["data-models/identifier-contract", bi(
    "Data dictionary nên nêu riêng `capacity`, `logical_count`, row, column và current index để tránh dùng một tên cho nhiều vai trò.",
    "The data dictionary should name `capacity`, `logical_count`, row, column, and current index separately so one identifier is not reused for several roles.")],
  ["binary-search/preconditions-interval", bi(
    "Khai báo rõ closed interval `[low, high]`; sau mỗi comparison, tô phần bị loại và chứng minh mọi vị trí còn có thể vẫn nằm trong interval mới.",
    "Declare the closed interval `[low, high]`; after each comparison, mark the discarded region and prove that every remaining candidate position is still inside the new interval.")],
  ["binary-search/midpoint-update", bi(
    "Đếm một comparison với middle mỗi vòng; cập nhật `middle-1` hoặc `middle+1` để interval giảm nghiêm ngặt và không kiểm tra lại middle.",
    "Count one comparison with the middle item per iteration; update to `middle-1` or `middle+1` so the interval strictly shrinks and the middle is not tested again.")],
  ["binary-search/recursive-variant", bi(
    "Biến thể condition-based là enrichment tùy chọn. Lời giải bắt buộc vẫn bám precondition sorted, base case empty interval và cùng closed-interval contract.",
    "Condition-based binary search is optional enrichment. The required solution still follows the sorted precondition, the empty-interval base case, and the same closed-interval contract.")],
  ["queue/representation-conventions", bi(
    "FIFO chỉ mô tả thứ tự logic; implementation trong đề còn cần front, rear, count, capacity và quy ước rear là ô đang dùng hay next-free.",
    "FIFO describes logical order only; an exam implementation also needs front, rear, count, capacity, and a declaration of whether rear is used or next-free.")],
  ["queue/enqueue", bi(
    "Kiểm tra `count == capacity` trước write; nếu chấp nhận thì ghi tại rear, wrap bằng modulo và tăng count đúng một lần.",
    "Check `count == capacity` before the write; on acceptance, write at rear, wrap with modulo, and increment count exactly once.")],
  ["queue/dequeue", bi(
    "Kiểm tra `count == 0` trước read; nếu chấp nhận thì lưu item front, clear khi contract yêu cầu, wrap front và giảm count đúng một lần.",
    "Check `count == 0` before the read; on acceptance, save the front item, clear it when required, wrap front, and decrement count exactly once.")],
  ["queue/inspect-live-items", bi(
    "Live-window trace bắt đầu tại front và đi đúng count bước; physical array order không nhất thiết là FIFO order sau wrap-around.",
    "A live-window trace starts at front and takes exactly count steps; physical array order need not equal FIFO order after wrap-around.")],
  ["queue/reduce-consume", bi(
    "Ghi rõ operation có phá hủy queue hay chỉ đọc; nếu dùng dequeue để reduce thì postcondition phải cho biết queue đã đổi ra sao.",
    "State whether the operation consumes the queue or only reads it; if reduction uses dequeue, the postcondition must describe the changed queue.")],
  ["recursion/recursive-contract", bi(
    "Trước code, viết ba dòng contract: base case, smaller subproblem và progress measure giảm sau mỗi call.",
    "Before coding, write a three-line contract: base case, smaller subproblem, and the progress measure that decreases on every call.")],
  ["recursion/call-stack-unwind", bi(
    "Trace tách hai pha: frame creation khi call đi xuống và return-value propagation khi unwind đi lên.",
    "Separate the trace into frame creation while calls descend and return-value propagation while frames unwind.")],
  ["recursion/design-benefits", bi(
    "Chỉ chọn recursion khi cấu trúc bài toán hỗ trợ nó; luôn nêu depth và auxiliary stack space thay vì chỉ nói code ngắn hơn.",
    "Choose recursion only when it fits the problem structure; always state depth and auxiliary stack space rather than merely saying the code is shorter.")],
  ["recursion/translate-recursive", bi(
    "Giữ nguyên terminal value, progress và combine order khi dịch pseudocode sang Python; return của child call phải được truyền về caller.",
    "Preserve the terminal value, progress, and combination order when translating pseudocode to Python; the child call's return must propagate to its caller.")],
  ["recursion/iteration-conversion", bi(
    "Bản lặp phải lưu mọi state mà call stack từng giữ; accumulator đơn chỉ đủ khi không có pending work phức tạp.",
    "The iterative form must preserve every state formerly held by the call stack; one accumulator is sufficient only when there is no complex pending work.")],
  ["hashing/table-storage", bi(
    "Phân biệt interface set/map với hash-table representation; câu hỏi hashing yêu cầu thao tác trên slot, empty marker, capacity và collision policy tường minh.",
    "Separate the set/map interface from the hash-table representation; a hashing task requires explicit slots, empty markers, capacity, and collision policy.")],
  ["hashing/hash-address", bi(
    "Nêu `n` là capacity của table khi dùng modulo và kiểm tra address luôn nằm trong 0..capacity-1.",
    "When using modulo, define `n` as table capacity and verify that every address lies in 0..capacity-1.")],
  ["hashing/insert-collisions", bi(
    "Probe tối đa capacity ô; nếu không còn slot, trả full và chứng minh table trước/sau giống hệt nhau.",
    "Probe at most capacity slots; if none is free, return full and prove that the table is identical before and after.")],
  ["hashing/find-collisions", bi(
    "Failed search dừng theo empty-marker policy hoặc sau capacity probes; không được phụ thuộc vòng lặp vô hạn hay hành vi của Python dict.",
    "A failed search stops under the empty-marker policy or after capacity probes; it must not rely on an infinite loop or Python-dict behaviour.")],
]);

const P4R9_MISCONCEPTION = new Map([
  ["data-models/array-representation", bi("Dùng `len(list)` đồng thời làm physical capacity và logical count.", "Using `len(list)` as both physical capacity and logical count.")],
  ["data-models/bounded-append", bi("Append trước capacity guard rồi cố hoàn tác khi đầy.", "Appending before the capacity guard and then trying to undo a full-state write.")],
  ["binary-search/preconditions-interval", bi("Chạy binary search trên input chưa sắp xếp hoặc đổi interval convention giữa chừng.", "Running binary search on unsorted input or changing interval convention mid-trace.")],
  ["binary-search/midpoint-update", bi("Giữ lại middle trong interval mới nên có thể lặp vô hạn.", "Keeping middle inside the new interval and risking a non-terminating loop.")],
  ["queue/representation-conventions", bi("Cho rằng biết FIFO là đủ mà không khai báo front/rear/count convention.", "Assuming FIFO alone is enough without declaring front/rear/count conventions.")],
  ["queue/enqueue", bi("Dùng `deque.append` thay cho implementation thủ công mà đề yêu cầu.", "Using `deque.append` instead of the manual implementation required by the task.")],
  ["recursion/recursive-contract", bi("Có base case nhưng recursive call không tiến gần nó.", "Having a base case while the recursive call makes no progress toward it.")],
  ["recursion/call-stack-unwind", bi("Gộp call và return vào một bước nên mất pending operation của từng frame.", "Collapsing call and return into one step and losing each frame's pending operation.")],
  ["hashing/table-storage", bi("Dùng Python dict làm bằng chứng rằng collision algorithm đã đúng.", "Using a Python dict as proof that the collision algorithm is correct.")],
  ["hashing/insert-collisions", bi("Probe quá capacity hoặc mutate table trước khi biết insert có thành công.", "Probing beyond capacity or mutating the table before insertion is known to succeed.")],
]);

function locatorFromObjective(objective) {
  const source = objective.source;
  return {
    source_id: source.source_id,
    pdf_page: source.pdf_page,
    printed_page: source.printed_page,
    heading: source.heading,
    bullet_locator: source.bullet_locator,
    anchor_text: source.anchor_text,
  };
}

async function main() {
  const dispositions = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/knowledge-disposition.json"), "utf8"));
  const sourceMap = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/lesson-source-map.json"), "utf8"));
  const lessons = new Map(sourceMap.lessons.map((lesson) => [lesson.slug, lesson]));
  const artifacts = new Map();
  const lineOwners = new Map();
  for (const slug of PILOT) {
    const artifact = JSON.parse(await readFile(path.join(ROOT, `content/paper4/python/pilot/${slug}/artifact.json`), "utf8"));
    artifacts.set(slug, artifact);
    for (const line of artifact.lines) lineOwners.set(line.line_id, artifact.python_artifact_id);
  }
  const generated = [];

  for (const block of dispositions.records.filter((record) => PILOT.includes(record.lesson_slug))) {
    const authored = CONTENT[block.block_key];
    if (!authored) throw new Error(`Missing authored content for ${block.block_key}`);
    const lesson = lessons.get(block.lesson_slug);
    const artifact = artifacts.get(block.lesson_slug);
    const objectives = new Map(lesson.objective_refs.map((ref) => [ref.objective_id, ref]));
    const books = new Map(lesson.book_refs.map((ref) => [ref.section_id, ref]));
    for (const lineId of authored.lines) {
      if (!lineOwners.has(lineId)) throw new Error(`Unresolved line ${lineId} for ${block.block_key}`);
    }
    const artifactRefs = [...new Set(authored.lines.map((lineId) => lineOwners.get(lineId)))];

    const envelope = {
      schema_version: "2.0.0",
      artifact_type: "KnowledgeUnit",
      record: {
        knowledge_unit_id: block.knowledge_block_id,
        lesson_id: block.lesson_id,
        stage3_block_ids: [block.knowledge_block_id],
        disposition: block.final_disposition,
        version: "2.0.0-pilot.1",
        objective_refs: block.objective_ids.map((objectiveId) => {
          const objective = objectives.get(objectiveId);
          if (!objective) throw new Error(`Unresolved objective ${objectiveId}`);
          return { objective_id: objectiveId, syllabus_version: "2026", locator: locatorFromObjective(objective) };
        }),
        book_refs: block.book_section_ids.map((sectionId) => {
          const book = books.get(sectionId);
          if (!book) throw new Error(`Unresolved book section ${sectionId}`);
          return {
            section_id: sectionId,
            chapter: book.chapter,
            printed_pages: book.printed_pages,
            pdf_pages: book.pdf_pages,
            relationship: block.book_relationship,
          };
        }),
        title: block.titles,
        explanation: P4R9_ENRICHMENT.has(block.block_key)
          ? bi(`${authored.ex.vi} ${P4R9_ENRICHMENT.get(block.block_key).vi}`, `${authored.ex.en} ${P4R9_ENRICHMENT.get(block.block_key).en}`)
          : authored.ex,
        python_connection: authored.py,
        representation: authored.rep,
        invariant_or_rule: authored.rule,
        misconceptions: P4R9_MISCONCEPTION.has(block.block_key)
          ? [...authored.mis, P4R9_MISCONCEPTION.get(block.block_key)]
          : authored.mis,
        exam_signals: authored.sig,
        micro_example: {
          scenario: authored.micro[0],
          walkthrough: authored.micro[1],
          python_artifact_id: artifact.python_artifact_id,
          python_artifact_refs: artifactRefs,
          active_line_ids: authored.lines,
          authority: "AlgoCore_authored_teaching_example",
        },
        self_check: {
          prompt: authored.check[0],
          answer: authored.check[1],
          rationale: authored.check[2],
          answer_hidden_initially: true,
          authority: "AlgoCore_authored_self_check",
        },
        author: "AlgoCore A2 bilingual theory author",
        reviewer: "PENDING_A1_A6_A7_A8",
        status: "draft",
      },
    };
    const outputDir = path.join(ROOT, "content/paper4/lessons/pilot", block.lesson_slug);
    await mkdir(outputDir, { recursive: true });
    const suffix = block.knowledge_block_id.split(".knowledge.")[1];
    const outputPath = path.join(outputDir, `${suffix}.knowledge-unit.json`);
    await writeFile(outputPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
    generated.push(path.relative(ROOT, outputPath).replaceAll("\\", "/"));
  }

  if (generated.length !== 26) throw new Error(`Expected 26 KnowledgeUnits, generated ${generated.length}`);
  process.stdout.write(`${JSON.stringify({ status: "PASS", generated: generated.length, files: generated }, null, 2)}\n`);
}

await main();

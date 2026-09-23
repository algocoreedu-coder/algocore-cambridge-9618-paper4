"""Build an editorial Stage 3 registry. No lesson content or app route is generated."""
import json
import hashlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parent.parent
CATALOG = BASE / 'stage-2/EXAM_PATTERN_CATALOG.json'
MAP = BASE / 'stage-2/QUESTION_PATTERN_MAP.json'
catalog = json.loads(CATALOG.read_text(encoding='utf-8-sig'))
qmap = json.loads(MAP.read_text(encoding='utf-8-sig'))
COURSE = 'ac-9618-p4-2026-python'

# slug | package | VI title | EN title | scope role | prerequisite slugs
LESSONS = '''
data-models|foundations|Dữ liệu, mảng và bản ghi|Data, arrays and records|prerequisite|-
procedural-design|foundations|Thiết kế chương trình theo thủ tục|Procedural program design|core|data-models
validation-rules|foundations|Kiểm tra dữ liệu và tính theo quy tắc|Validation and rule-based computation|prerequisite|procedural-design
testing|foundations|Kiểm thử, dò lỗi và bằng chứng|Testing, debugging and evidence|prerequisite|procedural-design
text-processing|text|Xử lý chuỗi và bản ghi văn bản|Strings and textual records|corpus_application|data-models,procedural-design
search-collections|search-sort|Tìm tuyến tính, đếm và chọn bản ghi|Linear search, counting and record selection|core|procedural-design
sorting|search-sort|Sắp xếp và chèn có thứ tự|Sorting and ordered insertion|core|data-models,procedural-design
binary-search|search-sort|Tìm nhị phân trong mảng đã sắp|Binary search in a sorted array|core|search-collections,sorting
stack|stack|Ngăn xếp và quy ước con trỏ|Stacks and pointer conventions|core|data-models,procedural-design
queue|queue|Hàng đợi tuyến tính và vòng|Linear and circular queues|core|data-models,procedural-design
linked-list|linked-list|Danh sách liên kết và vùng trống|Linked lists and free-list storage|core|data-models,procedural-design
recursion|recursion|Đệ quy, call stack và đổi dạng thuật toán|Recursion, call stacks and algorithm transformation|core|procedural-design,stack
binary-tree|tree|Cây nhị phân: chèn, tìm và duyệt|Binary trees: insert, search and traverse|core|data-models,recursion
dictionary|dictionary|Dictionary: khóa, giá trị và thao tác ADT|Dictionaries: keys, values and ADT operations|core|data-models,search-collections
hashing|dictionary|Bảng băm và xử lý va chạm trong đề thi|Hash tables and exam collision schemes|corpus_support|dictionary,search-collections
oop-model|oop|Lớp, constructor và đối tượng|Classes, constructors and objects|core|data-models,procedural-design
oop-state|oop|Đóng gói và thay đổi trạng thái đối tượng|Encapsulation and object state changes|core|oop-model,validation-rules
oop-inheritance|oop|Kế thừa, ghi đè và đa hình|Inheritance, overriding and polymorphism|core|oop-model,oop-state
oop-aggregation|oop|Đối tượng chứa đối tượng|Objects containing objects|core|oop-model,oop-state
text-files|files|Tệp văn bản: đọc, ghi và thêm|Text files: reading, writing and appending|core|data-models,procedural-design,text-processing
object-files|files|Đọc tệp để tạo và cập nhật đối tượng|Loading files into objects|corpus_application|text-files,oop-model,oop-inheritance
random-files|files|Bản ghi tệp và truy cập ngẫu nhiên|File records and random access|core|text-files,data-models
exceptions|files|Ngoại lệ khi nhập dữ liệu và xử lý tệp|Exceptions in input and file processing|core|text-files,validation-rules
performance|support|Điều kiện áp dụng và chi phí thuật toán|Algorithm conditions and costs|support|search-collections,sorting,binary-search,stack,queue,linked-list,binary-tree,dictionary
graphs|support|Đặc trưng đồ thị và chọn cấu trúc|Graph characteristics and structure choice|support|data-models
exam-workflow|integration|Ghép chương trình, xuất kết quả và nộp bằng chứng|Program integration, output and evidence|corpus_application|testing,text-files,oop-model,stack,queue,linked-list,binary-tree
'''

# lesson | block suffix | VI label | EN label | assessed pattern IDs (or -) | semantic topics
BLOCKS = '''
data-models|scalars-types-scope|Kiểu, hằng, biến và phạm vi|Types, constants, variables and scope|DATA_STORAGE|scalar types;constants;scope;initial state
data-models|array-representation|Mảng một chiều, hai chiều và giới hạn chỉ số|One- and two-dimensional arrays and index bounds|DATA_STORAGE|array dimensions;index bounds;fixed capacity
data-models|record-fields|Trường bản ghi và lớp thay thế record|Record fields and a class used as a record substitute|DATA_RECORD|record fields;heterogeneous data;record versus OOP class
data-models|bounded-append|Vị trí kế tiếp và chèn vào mảng có giới hạn|Next position and bounded array append|ARRAY_APPEND|capacity;logical size;append boundary
data-models|random-data|Dữ liệu ngẫu nhiên và miền giá trị|Random data and allowed ranges|RANDOM_ARRAY|random generation;range;array population
data-models|identifier-contract|Tên, vai trò dữ liệu và biểu thức|Identifiers, data roles and expressions|-|identifier;data dictionary;assignment;arithmetic expression;logical expression
procedural-design|selection-iteration|Rẽ nhánh, lặp và điều kiện dừng|Selection, iteration and stopping conditions|MAIN_FLOW|sequence;nested selection;CASE equivalent;count-controlled loop;pre-condition loop;post-condition loop;termination
procedural-design|subroutine-contracts|Procedure, function, tham số và giá trị trả về|Procedures, functions, parameters and returns|MAIN_FLOW|modularity;procedure;function;parameter;return;local variables
procedural-design|parameter-modes|Truyền tham số và tác động lên dữ liệu|Parameter passing and effects on data|-|by value;by reference;Python object reference semantics;mutation versus rebinding
procedural-design|pseudocode-translation|Đọc và triển khai pseudocode theo hợp đồng|Reading and implementing supplied pseudocode|ALGORITHM_TRANSLATE|algorithm translation;indexing;operator meaning;explicit constraints
procedural-design|decomposition|Chia việc và ghép lời gọi theo thứ tự|Decomposition and ordered composition|MAIN_FLOW|decomposition;stepwise refinement;module hierarchy;subroutine dependency;call order;state flow
procedural-design|paradigm-choice|Đặc trưng procedural và hướng đối tượng|Characteristics of procedural and object-oriented paradigms|-|programming paradigm;procedural;object-oriented;appropriate use;low-level and declarative excluded
procedural-design|abstraction-io|Mô hình dữ liệu thiết yếu và input-process-output|Essential-data models and input-process-output|-|abstraction;essential information;input-process-output;requirements;definite algorithm steps
procedural-design|console-library|Nhập/xuất console và hàm thư viện phù hợp|Console I/O and suitable library functions|-|keyboard input;console output;built-in function;library function;string operation;constraint against prohibited shortcuts
validation-rules|input-validation|Miền hợp lệ, lặp nhập và thông báo|Valid ranges, input loops and messages|VALIDATE_INPUT|type;range;length;membership;validation versus verification
validation-rules|rule-outcomes|Điều kiện Boolean và công thức theo bảng|Boolean conditions and table-based formulae|RULE_COMPUTE|predicate;banded score;aggregate score;arithmetic;decision table
validation-rules|unique-selection|Chọn không lặp và đánh dấu đã dùng|Selection without replacement and consumed markers|UNIQUE_SELECTION|used flag;consumed answer;unique item;termination
validation-rules|check-digit|Tách payload và kiểm tra check digit|Separating payload and checking a check digit|CHECK_DIGIT|check digit;weighted sum;source-specified division and rounding;floor weighted sum divided by 10 in s24;modulo only when specified;input contract
testing|test-design|Dữ liệu thường, biên và không hợp lệ|Normal, boundary and invalid test data|EVIDENCE_RUN|test selection;expected result;state reset;coverage
testing|tracing-debugging|Trace, breakpoint và tìm nguyên nhân sai|Tracing, breakpoints and finding faults|-|dry run;trace table;debugger;syntax error;logic error;runtime error
testing|repair-enhance|Sửa lỗi và cải tiến mà giữ hành vi cần có|Repairing and enhancing while preserving required behaviour|-|fault correction;regression;program amendment;enhancement;expected result
testing|source-contract|Đọc đúng yêu cầu, phụ thuộc và tiêu chí|Reading requirements, dependencies and criteria|EVIDENCE_RUN|QP requirement;MS criterion;dependency;official versus original rubric
testing|capture-provenance|Chạy đúng phiên bản và lưu bằng chứng|Running the right version and preserving evidence|EVIDENCE_RUN|console evidence;code evidence;file names;test inputs;source provenance
text-processing|character-comparison|So sánh chuỗi theo ký tự|Character-by-character comparison|STRING_COMPARE|lexicographic comparison;case;prefix;termination
text-processing|delimiter-tokenisation|Tách chuỗi thành token theo dấu phân cách|Splitting delimited strings into tokens|STRING_SPLIT|delimiter;token;empty token;manual parsing
text-processing|typed-routing|Đổi kiểu trường và đưa vào nhóm đích|Converting fields and routing to a destination|STRING_ROUTE|typed record;conversion;category dispatch;destination capacity
text-processing|run-length|Đếm các dãy ký tự liên tiếp|Counting consecutive character runs|RUN_LENGTH_ENCODE|run boundary;current symbol;count;final flush;not frequency counting
search-collections|linear-find|Tìm tuyến tính và kết quả tìm thấy|Linear search and its result contract|LINEAR_SEARCH|sequential comparison;found flag;index;first match;not found
search-collections|count-all|Đếm mọi phần tử thỏa điều kiện|Counting every matching element|COUNT_OCCURRENCES|full scan;accumulator;predicate;no premature return
search-collections|filter-all|Lọc mọi bản ghi phù hợp|Filtering all matching records|FILTER_RECORDS|compound condition;all matches;case handling;empty result
search-collections|group-totals|Gộp khóa trùng và cập nhật tổng|Grouping repeated keys and updating totals|GROUP_AGGREGATE|key lookup;new group;existing group;count aggregation
sorting|bubble-passes|Bubble sort: lượt so sánh, đổi chỗ và dừng|Bubble sort: passes, swaps and stopping|BUBBLE_SORT|adjacent comparison;swap;pass boundary;early exit
sorting|insertion-shifts|Insertion sort: phần đã sắp và dịch phần tử|Insertion sort: sorted prefix and shifts|INSERTION_SORT|key;sorted prefix;shift;insertion index
sorting|ordered-insert|Chèn một phần tử vào bảng đã có thứ tự|Inserting one item into an ordered table|ORDERED_INSERT|sorted table;single insertion;capacity;rank truncation
sorting|comparator-variants|Khóa sắp xếp, chiều sắp và nhiều tiêu chí|Sort keys, direction and multiple criteria|BUBBLE_SORT,INSERTION_SORT|ascending;descending;secondary key;whole record movement
binary-search|preconditions-interval|Tiền điều kiện và khoảng tìm kiếm|Preconditions and the search interval|BINARY_SEARCH|sorted input;consistent comparator;lower bound;upper bound
binary-search|midpoint-update|Phần tử giữa, thu hẹp khoảng và thất bại|Midpoint, interval reduction and failure|BINARY_SEARCH|midpoint;integer division;termination;not found;empty interval
binary-search|recursive-variant|Biến thể tìm nhị phân đệ quy|Recursive binary search variant|BINARY_SEARCH|recursive interval;return propagation;base case
stack|representation-conventions|Mảng, con trỏ đỉnh và quy ước rỗng|Array, top pointer and empty conventions|STACK_SETUP|LIFO;top-used;next-free;empty sentinel;capacity
stack|push|Push và tình huống đầy|Push and the full condition|STACK_PUSH|overflow;pointer update;write order;success result
stack|pop|Pop và tình huống rỗng|Pop and the empty condition|STACK_POP|underflow;read order;pointer update;failure result
stack|paired-restoration|Hai stack và phục hồi khi không ghép được|Paired stacks and restoration on failure|STACK_PAIR|paired consumption;rollback;restoration;preserving unmatched item
stack|reduce-operands|Lấy toán hạng và tính kết quả|Popping operands and reducing to a result|STACK_REDUCE|operand order;noncommutative operator;reduction;stack invariant
queue|representation-conventions|Head, tail, count và quy ước rỗng|Head, tail, count and empty conventions|QUEUE_SETUP|FIFO;linear queue;circular queue;sentinel;logical size
queue|enqueue|Enqueue, đầy và vòng chỉ số|Enqueue, full state and wrapping|QUEUE_ENQUEUE|overflow;tail update;wraparound;count
queue|dequeue|Dequeue, rỗng và giá trị trả về|Dequeue, empty state and return contract|QUEUE_DEQUEUE|underflow;head update;wraparound;returned record
queue|inspect-live-items|Đọc các phần tử đang dùng mà không xóa|Inspecting live items without removal|QUEUE_INSPECT|non-destructive inspection;logical order;unused slots
queue|reduce-consume|Tổng hợp queue bằng đọc hoặc tiêu thụ dữ liệu|Reducing queue data by inspection or consumption|QUEUE_REDUCE|read-only traversal versus destructive dequeue;fold;termination;recursive variant;preserve or mutate state according to source
linked-list|representation-free-list|Node, head và chuỗi vùng trống|Nodes, head and free-list chain|LIST_SETUP|data field;next link;null sentinel;head;free pointer
linked-list|traversal|Duyệt theo link, không theo ô mảng|Following links rather than physical slots|LIST_TRAVERSE|link following;logical order;termination;empty list
linked-list|search|Tìm dữ liệu trong danh sách liên kết|Searching data in a linked list|-|linked-list search;found node;not found;first match
linked-list|insert|Lấy node trống và nối link khi chèn|Allocating a free node and linking an insertion|LIST_INSERT|front insertion;tail insertion;free-list allocation;capacity
linked-list|remove-recycle|Bỏ node, nối lại và trả về vùng trống|Unlinking a node and returning it to free storage|LIST_REMOVE|head deletion;interior deletion;not found;free-list recycling
recursion|recursive-contract|Base case, recursive case và tiến triển|Base case, recursive case and progress|-|recursive definition;termination;smaller subproblem
recursion|call-stack-unwind|Frame riêng, call stack và trả ngược|Local frames, call stack and unwinding|-|local variables;pending work;call;return;stack trace
recursion|design-benefits|Nhận bài toán đệ quy và cân nhắc lợi ích|Recognising recursive problems and considering benefits|-|recursive problem expression;recursive design;benefit;limitations;compiler use of stack
recursion|translate-recursive|Triển khai đệ quy đã cho và giữ kết quả trả về|Implementing supplied recursion and propagating returns|ALGORITHM_TRANSLATE|recursive translation;integer arithmetic;return propagation
recursion|iteration-conversion|Đổi đệ quy và vòng lặp, giữ đúng hành vi|Converting recursion and iteration while preserving behaviour|ALGORITHM_REWRITE|recursion to iteration;iteration to recursion;accumulator;equivalence;call-state preservation
binary-tree|representation|Root, con trái/phải và vùng chưa dùng|Root, left/right children and unused storage|TREE_SETUP|node;root;child links;null sentinel;array-backed tree;object-backed tree
binary-tree|ordered-insert|So sánh và gắn node mới trong BST|Comparing and attaching a new BST node|TREE_INSERT|BST ordering;duplicate rule;allocation;empty tree
binary-tree|search|Chọn nhánh khi tìm trong BST|Choosing a branch when searching a BST|TREE_SEARCH|ordered search;found;missing branch;not found
binary-tree|traversals|Duyệt inorder và postorder theo yêu cầu đề|Inorder and postorder traversal as required by the task|TREE_TRAVERSE|inorder;postorder;visit order;recursive frames;output;tree shape
dictionary|adt-interface|Khóa duy nhất, giá trị và giao diện ADT|Unique keys, values and the ADT interface|-|dictionary;key-value mapping;interface;abstraction
dictionary|find-insert|Tìm khóa, chèn và cập nhật giá trị|Finding keys, inserting and updating values|-|dictionary find;dictionary insert;duplicate-key contract;missing key
dictionary|delete|Xóa khóa và xử lý khóa không tồn tại|Deleting a key and handling missing keys|-|dictionary delete;missing key;postcondition
dictionary|representation-choice|Giao diện logic và cách biểu diễn|Logical interface and representation choices|-|dictionary implementation;array of records;key lookup;Python dict versus prescribed implementation
dictionary|other-adt-implementation|Dùng ADT khác để cài đặt dictionary|Implementing a dictionary using another ADT|-|dictionary implementation;linked list of key-value pairs;binary tree of key-value pairs;ADT composition;contract preservation
hashing|table-storage|Bảng băm và vùng va chạm được chỉ định|Hash-table storage and prescribed collision areas|HASH_SETUP|table capacity;empty slot;Spare array;bucket
hashing|hash-address|Tính địa chỉ băm theo công thức đề|Computing a hash address from the given rule|HASH_FUNCTION|key;hash address;modulo;range
hashing|insert-collisions|Chèn và xử lý va chạm theo cấu trúc đề|Inserting and handling the prescribed collisions|HASH_INSERT|bucket capacity;overflow area;collision;full storage
hashing|find-collisions|Tìm khóa qua bảng và vùng va chạm|Finding a key across table and collision storage|HASH_SEARCH|hashed location;collision scan;not found;key comparison
oop-model|class-object|Phân biệt lớp, đối tượng và thuộc tính|Classes, objects and attributes|OOP_CLASS|class;instance;attribute;method;object identity
oop-model|constructor|Constructor, tham số và trạng thái ban đầu|Constructors, parameters and initial state|OOP_CLASS|constructor;initialisation;attribute types;defaults
oop-model|instantiate|Tạo nhiều instance và giữ trạng thái riêng|Creating instances with independent state|OOP_INSTANTIATE|instantiation;constructor arguments;instance state
oop-model|class-design|Chọn thuộc tính và phương thức từ bài toán|Choosing attributes and methods from a problem|-|class design;responsibility;attribute selection;method contract;appropriate class;modelling
oop-state|encapsulation|Đóng gói và truy cập qua phương thức|Encapsulation and method-mediated access|-|private;public;information hiding;Python convention;interface
oop-state|getters|Accessor trả đúng dữ liệu đang lưu|Accessors returning the stored data|OOP_GET|getter;return;stored field;no unintended update
oop-state|setters|Setter gán trực tiếp giá trị mới|Setters directly assigning a new value|OOP_SET|setter;replace value;parameter;attribute assignment
oop-state|rule-updates|Cộng, chặn biên và thay đổi theo quy tắc|Incrementing, clamping and rule-based updates|OOP_UPDATE|state transition;clamping;percentage;side effect;method contract
oop-inheritance|base-derived|Lớp cha/con và khởi tạo phần kế thừa|Base/derived classes and inherited initialisation|OOP_SUBCLASS|inheritance;subclass;superclass constructor;additional attributes
oop-inheritance|override-dispatch|Ghi đè và chọn phương thức của đối tượng|Overriding and selecting object-specific behaviour|OOP_OVERRIDE|overriding;polymorphism;dynamic dispatch;shared interface
oop-inheritance|substitutability|Lời gọi chung, hành vi khác theo lớp|Shared calls with class-specific behaviour|-|polymorphic use;base interface;method contract;avoiding manual type dispatch when unnecessary
oop-aggregation|has-a|Đối tượng thành phần và quan hệ has-a|Component objects and the has-a relationship|-|aggregation;composition;reference;object collection
oop-aggregation|bounded-add|Thêm object có giới hạn và báo kết quả|Capacity-limited object insertion and result reporting|OOP_CAPACITY_ADD|capacity;count;object reference;success failure
oop-aggregation|nested-access|Truy cập và tính qua các object thành phần|Accessing and computing through component objects|-|nested method calls;object array;aggregate state;delegation
text-files|file-lifecycle|Mở, đóng, đọc, ghi và chế độ thêm|Opening, closing, reading, writing and append modes|FILE_READ_ARRAY,FILE_WRITE|file handle;open mode;close;end of file;resource lifecycle
text-files|record-loading|Đọc theo cấu trúc bản ghi và chuyển kiểu|Reading record structure and converting types|FILE_READ_ARRAY|record boundary;line layout;delimiter;numeric conversion;logical count
text-files|serial-sequential|Tệp serial, sequential và thứ tự bản ghi|Serial and sequential files and record ordering|-|serial organisation;sequential organisation;ordered keys;sequential processing
text-files|write-append|Ghi đè, thêm và định dạng dòng|Overwriting, appending and line formatting|FILE_WRITE|write mode;append mode;newline;round-trip data
text-files|adt-loading|Đọc dữ liệu rồi gọi đúng thao tác ADT|Loading data through the required ADT operation|FILE_READ_ARRAY|file to ADT;operation result;capacity failure;input dependency
object-files|construct-from-record|Tạo đối tượng từ từng bản ghi|Constructing an object from each record|FILE_READ_OBJECTS|field conversion;constructor arguments;object array;record layout
object-files|subclass-records|Nhận loại bản ghi và chọn subclass|Identifying record types and selecting subclasses|FILE_READ_OBJECTS|variable record length;type dispatch;subclass construction
object-files|lookup-update|Đọc khóa, tìm object và cập nhật|Reading keys, finding objects and updating them|FILE_READ_OBJECTS|matching identifier;lookup;method call;update existing instance
random-files|organisation-access|Phân biệt tổ chức tệp và cách truy cập|Distinguishing file organisation from access method|-|random file;record address;direct access;sequential access
random-files|record-address|Địa chỉ bản ghi và một cách biểu diễn Python|Record addressing and a proposed Python representation|-|record address;key-derived address;hash-derived address when chosen;proposed fixed-size Python records;byte offset as implementation choice;binary mode as implementation choice;index;seek
random-files|read-write-update|Đọc, ghi và sửa đúng bản ghi ngẫu nhiên|Reading, writing and updating a chosen record|-|seek;read record;write record;preserve other records;missing record
exceptions|runtime-failures|Nhận diện ngoại lệ và nguyên nhân|Recognising exceptions and their causes|-|runtime error;conversion failure;missing file;I/O failure
exceptions|handle-recover|Bắt ngoại lệ và phục hồi có chủ đích|Handling exceptions and deliberate recovery|-|try;except;specific exception;retry;message;propagation
exceptions|cleanup|Đóng tài nguyên khi thành công hoặc lỗi|Closing resources after success or failure|-|finally as Python implementation choice;context manager as Python implementation choice;close;cleanup;resource safety
performance|asymptotic-cost|So sánh Big O thời gian và không gian|Comparing time and space Big O|-|Big O time;Big O space;linear;logarithmic;quadratic;worst case;input size;auxiliary storage
performance|algorithm-choice|Chọn thuật toán theo điều kiện dữ liệu|Selecting algorithms using data conditions|-|search condition;sorting requirement;time-space tradeoff;ADT choice
performance|trace-cost|Đếm bước để giải thích hiệu năng|Counting operations to explain performance|-|comparison count;swap count;initial data order;input size;loop bound;recursive depth;model versus timing
graphs|characteristics|Đỉnh, cạnh và các đặc trưng đồ thị|Vertices, edges and graph characteristics|-|vertex;edge;directed;undirected;weighted;graph as ADT
graphs|structure-choice|Khi quan hệ dữ liệu có dạng đồ thị|When data relationships form a graph|-|graph characteristics;structure selection;conceptual representation;no graph algorithm coding requirement
exam-workflow|compose-main|Ghép hàm đã có và giữ quan hệ phụ thuộc|Composing existing routines and preserving dependencies|MAIN_FLOW|call order;parameters;state;loop;test case;reuse
exam-workflow|format-output|Định dạng kết quả, bảng và giá trị trả về|Formatting results, tables and return values|OUTPUT_FORMAT|required labels;array grid;logical versus physical order;concatenation;return versus print
exam-workflow|evidence-document|Tên file, code, output và bằng chứng theo ý đề|File names, code, output and evidence by exam part|EVIDENCE_RUN|evidence document;specified inputs;screenshot;code copy;traceability
exam-workflow|source-and-rubric|Phân biệt nguồn chính thức và hướng dẫn học|Distinguishing official sources from learning guidance|-|QP;MS;examiner report;locator;original rubric;source fidelity
'''

PACKAGE_TITLES = {
 'foundations': ('Tiên quyết và kỹ năng thực hành', 'Prerequisites and practical skills'),
 'text': ('Xử lý chuỗi và dữ liệu văn bản', 'Strings and textual data'),
 'search-sort': ('Tìm kiếm và sắp xếp', 'Searching and sorting'),
 'stack': ('Ngăn xếp', 'Stacks'), 'queue': ('Hàng đợi', 'Queues'),
 'linked-list': ('Danh sách liên kết', 'Linked lists'), 'recursion': ('Đệ quy', 'Recursion'),
 'tree': ('Cây nhị phân', 'Binary trees'), 'dictionary': ('Dictionary và hỗ trợ bảng băm', 'Dictionaries and hash-table support'),
 'oop': ('Lập trình hướng đối tượng', 'Object-oriented programming'),
 'files': ('Tệp và ngoại lệ', 'Files and exceptions'),
 'support': ('Kiến thức hỗ trợ lựa chọn giải pháp', 'Supporting knowledge for solution choices'),
 'integration': ('Thực hành tích hợp và bằng chứng', 'Integrated practical work and evidence')
}
SLOTS = [
 ('recognition', 'Nhận diện bài', 'Recognise the task'),
 ('exam-cues', 'Dấu hiệu dạng đề', 'Recognise exam cues'),
 ('knowledge', 'Kiến thức cần biết', 'Required knowledge'),
 ('method', 'Cách giải', 'Solution method'),
 ('worked-example', 'Ví dụ giải có kiểm chứng', 'Verified worked example'),
 ('action-view', 'Quan sát và dự đoán trạng thái', 'Observe and predict state'),
 ('marking-pitfalls', 'Tránh mất điểm', 'Avoid losing marks'),
 ('practice', 'Tự luyện giảm dần gợi ý', 'Practice with fading support'),
 ('retrieval', 'Nhớ và làm lại', 'Retrieve and reproduce'),
 ('next-and-sources', 'Học tiếp và nguồn', 'Next learning and sources')
]

lessons = []
by_slug = {}
for line in LESSONS.strip().splitlines():
    slug, package, vi, en, role, prereqs = line.split('|')
    item = {
        'lesson_id': f'{COURSE}.lesson.{slug}', 'package_id': f'{COURSE}.package.{package}',
        'slug': slug, 'titles': {'vi': vi, 'en': en},
        'scope': {'role': role, 'exam_year': 2026, 'programming_language': 'Python', 'objective_mapping_status': 'PENDING_LEAD_JOIN_WITH_A3'},
        'prerequisite_lesson_ids': [] if prereqs == '-' else [f'{COURSE}.lesson.{p}' for p in prereqs.split(',')],
        'proposed_routes': {loc: f'/{loc}/docs/paper-4/{slug}' for loc in ('vi', 'en')},
        'route_status': 'PLANNED_NOT_IMPLEMENTED', 'content_status': 'PLANNED_NOT_AUTHORED',
        'blocks': []
    }
    by_slug[slug] = item
    lessons.append(item)

for line in BLOCKS.strip().splitlines():
    slug, suffix, vi, en, patterns, topics = line.split('|')
    lesson = by_slug[slug]
    block_id = f'{lesson["lesson_id"]}.knowledge.{suffix}'
    pids = [] if patterns == '-' else patterns.split(',')
    lesson['blocks'].append({
        'block_id': block_id, 'anchor': f'knowledge-{suffix}',
        'knowledge_label_vi': vi, 'knowledge_label_en': en,
        'pattern_ids': pids, 'knowledge_topics': topics.split(';'),
        'role': lesson['scope']['role'], 'content_status': 'PLANNED_NOT_AUTHORED',
        'planned_locale_targets': {loc: lesson['proposed_routes'][loc] + f'#knowledge-{suffix}' for loc in ('vi', 'en')},
        'source_mapping_status': 'PENDING_LEAD_JOIN_WITH_A2_A3',
        'assessment_status': 'PLANNED_NOT_PRODUCED',
    })

# One canonical destination per pattern, with secondary blocks retained separately.
PRIMARY = '''
DATA_STORAGE=data-models
DATA_RECORD=data-models
ARRAY_APPEND=data-models
RANDOM_ARRAY=data-models
ORDERED_INSERT=sorting
FILE_READ_ARRAY=text-files
FILE_READ_OBJECTS=object-files
FILE_WRITE=text-files
LINEAR_SEARCH=search-collections
COUNT_OCCURRENCES=search-collections
FILTER_RECORDS=search-collections
GROUP_AGGREGATE=search-collections
BUBBLE_SORT=sorting
INSERTION_SORT=sorting
BINARY_SEARCH=binary-search
STACK_SETUP=stack
STACK_PUSH=stack
STACK_POP=stack
STACK_PAIR=stack
STACK_REDUCE=stack
QUEUE_SETUP=queue
QUEUE_ENQUEUE=queue
QUEUE_DEQUEUE=queue
QUEUE_INSPECT=queue
QUEUE_REDUCE=queue
LIST_SETUP=linked-list
LIST_TRAVERSE=linked-list
LIST_INSERT=linked-list
LIST_REMOVE=linked-list
TREE_SETUP=binary-tree
TREE_INSERT=binary-tree
TREE_SEARCH=binary-tree
TREE_TRAVERSE=binary-tree
HASH_SETUP=hashing
HASH_FUNCTION=hashing
HASH_INSERT=hashing
HASH_SEARCH=hashing
OOP_CLASS=oop-model
OOP_SUBCLASS=oop-inheritance
OOP_GET=oop-state
OOP_SET=oop-state
OOP_UPDATE=oop-state
OOP_OVERRIDE=oop-inheritance
OOP_INSTANTIATE=oop-model
OOP_CAPACITY_ADD=oop-aggregation
RULE_COMPUTE=validation-rules
VALIDATE_INPUT=validation-rules
UNIQUE_SELECTION=validation-rules
CHECK_DIGIT=validation-rules
STRING_COMPARE=text-processing
STRING_SPLIT=text-processing
STRING_ROUTE=text-processing
RUN_LENGTH_ENCODE=text-processing
ALGORITHM_TRANSLATE=procedural-design
ALGORITHM_REWRITE=recursion
MAIN_FLOW=exam-workflow
OUTPUT_FORMAT=exam-workflow
EVIDENCE_RUN=exam-workflow
'''

destinations = []
for line in PRIMARY.strip().splitlines():
    pid, slug = line.split('=')
    lesson = by_slug[slug]
    matched = [b['block_id'] for b in lesson['blocks'] if pid in b['pattern_ids']]
    secondary = [b['block_id'] for l in lessons if l != lesson for b in l['blocks'] if pid in b['pattern_ids']]
    src = next(p for p in catalog['patterns'] if p['pattern_id'] == pid)
    destinations.append({
        'pattern_id': pid, 'lesson_id': lesson['lesson_id'], 'package_id': lesson['package_id'],
        'knowledge_block_ids': matched, 'secondary_knowledge_block_ids': secondary,
        'stage2_assessed_part_ids': src['assessed_part_ids'],
        'mapping_kind': 'editorial_learning_destination',
        'assessment_destination_id': f'{lesson["lesson_id"]}.assessment.progression',
    })

# Design intentions, not questions, solutions, fixtures or claims of completed coverage.
GAPS = [
 ('dictionary-operations', 'dictionary', ['adt-interface','find-insert','delete','representation-choice','other-adt-implementation'],
  'Thiết kế bài tự biên soạn yêu cầu tạo, chèn, tìm, cập nhật và xóa dictionary theo hợp đồng khóa; kiểm tra khóa trùng/không tồn tại.',
  'Plan an original task covering dictionary creation, insertion, lookup, update and deletion with duplicate and missing keys.',
  'No dedicated dictionary pattern in Stage 2; hashing and grouped totals do not prove full dictionary operation coverage.'),
 ('linked-list-search', 'linked-list', ['search','traversal'],
  'Thiết kế bài tìm trong linked list với danh sách rỗng, node đầu/cuối, không tìm thấy và nhiều node cùng dữ liệu.',
  'Plan a linked-list search task with empty, head/tail, missing and repeated-value cases.',
  'No separately classified linked-list search pattern; search within deletion is not a complete substitute.'),
 ('random-file-processing', 'random-files', ['organisation-access','record-address','read-write-update'],
  'Thiết kế fixture tự biên soạn cho đọc/ghi/cập nhật bản ghi theo vị trí; kiểm tra các bản ghi khác giữ nguyên và ghi rõ cách biểu diễn Python.',
  'Plan an original fixture for address-based record reads, writes and updates; verify other records remain unchanged and document the Python representation.',
  'No supplied binary fixture or dedicated random-file exam pattern; original fixtures must never be labelled official SF.'),
 ('serial-sequential-processing', 'text-files', ['serial-sequential','record-loading','write-append'],
  'Thiết kế bài đối chiếu tổ chức serial/sequential và cách xử lý bản ghi có khóa theo thứ tự.',
  'Plan a task contrasting serial/sequential organisation and processing ordered keyed records.',
  'FILE_READ_ARRAY and FILE_WRITE incidence alone does not verify every organisation/access capability.'),
 ('exception-recovery', 'exceptions', ['runtime-failures','handle-recover','cleanup'],
  'Thiết kế dữ liệu gây lỗi chuyển kiểu, thiếu file và lỗi đọc/ghi phù hợp; đánh giá phục hồi cùng đóng tài nguyên.',
  'Plan appropriate conversion, missing-file and I/O failure cases; assess recovery and resource cleanup.',
  'Exception handling is observed inside FILE_READ_ARRAY, including 9618_s25_41_2(a). A dedicated completeness check extends beyond that observed handling; no claim of corpus absence.'),
 ('recursive-design-trace', 'recursion', ['recursive-contract','call-stack-unwind','design-benefits','iteration-conversion'],
  'Thiết kế bài dựng base case và recursive case, dự đoán frame/return rồi đối chiếu hành vi với vòng lặp.',
  'Plan a task constructing base/recursive cases, predicting frames and returns, and comparing behaviour with iteration.',
  'Named exam algorithms provide examples, but complete recursion objective coverage needs dedicated checks.'),
 ('adt-abstraction', 'dictionary', ['adt-interface','representation-choice','other-adt-implementation'],
  'Thiết kế bài tự biên soạn cài đặt dictionary bằng ADT linked list lưu các cặp khóa–giá trị; thực hiện tìm/chèn/cập nhật/xóa qua các thao tác của linked list và giữ hợp đồng dictionary.',
  'Plan an original implementation task for a dictionary backed by a linked-list ADT of key-value pairs; perform lookup, insertion, update and deletion through linked-list operations while preserving the dictionary contract.',
  'Explicit core objective SYL-19.1-30: implement one ADT using another named ADT. Built-in arrays alone and a conceptual comparison do not close this gap; no official exam marks are claimed.'),
 ('algorithm-cost', 'performance', ['asymptotic-cost','algorithm-choice','trace-cost'],
  'Thiết kế dự đoán số so sánh và chọn thuật toán cho dữ liệu đã/chưa sắp; giải thích Big O ngắn từ trace.',
  'Plan comparison-count predictions and algorithm choices for sorted/unsorted data, with short Big O reasoning from traces.',
  'Supporting understanding rather than invented mandatory Paper 4 essay questions.'),
 ('graph-characteristics', 'graphs', ['characteristics','structure-choice'],
  'Thiết kế kiểm tra bằng sơ đồ về đỉnh/cạnh và đặc trưng đồ thị; không yêu cầu code thuật toán đồ thị.',
  'Plan diagram-based checks of vertices, edges and graph characteristics without graph algorithm coding.',
  'Syllabus support; graph coding is not required by the scoped syllabus.'),
 ('parameter-effects', 'procedural-design', ['subroutine-contracts','parameter-modes'],
  'Thiết kế trace phân biệt sửa object với gán lại tham số; đối chiếu by-value/by-reference mà không gọi Python thuần túy là một trong hai.',
  'Plan traces distinguishing mutation from parameter rebinding, relating value/reference concepts without falsely labelling Python as simply either.',
  'Prerequisite consolidation must preserve language-specific semantics.'),
 ('polymorphic-use', 'oop-inheritance', ['base-derived','override-dispatch','substitutability'],
  'Thiết kế gọi cùng phương thức trên tập object khác subclass và dự đoán hành vi từ lớp thật của instance.',
  'Plan shared method calls across objects of different subclasses and predict behaviour from the actual instance type.',
  'Override pattern incidence alone does not prove learners can explain and use polymorphism.'),
]

assessments = []
for l in lessons:
    assessments.append({
      'assessment_id': f'{l["lesson_id"]}.assessment.progression',
      'lesson_id': l['lesson_id'], 'package_id': l['package_id'],
      'knowledge_block_ids': [b['block_id'] for b in l['blocks']],
      'stage': 'PLANNED_NOT_PRODUCED', 'origin': 'algocore_original_or_verified_source_selection_pending',
      'progression': ['guided', 'faded_support', 'independent', 'retrieval_and_repair'],
      'titles': {'vi': f'Tự luyện: {l["titles"]["vi"]}', 'en': f'Practice: {l["titles"]["en"]}'},
      'design_brief': {'vi': 'Đánh giá qua nhiệm vụ hoặc trace cho các khối: ' + '; '.join(b['knowledge_label_vi'] for b in l['blocks']) + '. Dùng câu tự biên soạn hoặc phần nguồn được chọn và kiểm chứng ở stage sau.', 'en': 'Assess through tasks or traces covering: ' + '; '.join(b['knowledge_label_en'] for b in l['blocks']) + '. Use original tasks or source parts selected and verified in a later stage.'},
      'rubric_authority': 'No official marks allocated at this stage. Original rubrics must be labelled AlgoCore.',
      'production_gate': 'Requirements, source selection, solution, fixtures, rubric, bilingual parity and execution/event evidence must be reviewed in later stages.'
    })
for key,slug,suffixes,vi,en,reason in GAPS:
    l=by_slug[slug]
    assessments.append({
      'assessment_id': f'{COURSE}.assessment.gap.{key}', 'lesson_id':l['lesson_id'], 'package_id':l['package_id'],
      'knowledge_block_ids':[f'{l["lesson_id"]}.knowledge.{s}' for s in suffixes],
      'stage':'PLANNED_NOT_PRODUCED', 'origin':'algocore_original',
      'design_intent': {'vi':vi,'en':en}, 'coverage_reason':reason,
      'official_exam_claim': False, 'questions_created':False, 'solutions_created':False,
      'rubric_authority':'AlgoCore original; no invented Cambridge marking points',
      'production_gate':'A4/A5 author and execute later; A6 visualise where useful; A8 review independently.'
    })
    if key == 'adt-abstraction':
        assessments[-1]['objective_ids']=['SYL-19.1-30']
        assessments[-1]['planned_backend']='linked-list ADT'
        assessments[-1]['required_demonstration']={
          'outer_adt':'dictionary', 'inner_adt':'linked list',
          'operation_boundary':'Dictionary operations use the linked-list ADT interface; node links remain the responsibility of that implementation.',
          'evidence_required':['implementation of both ADT interfaces', 'normal, missing-key and duplicate-key tests', 'trace showing dictionary calls to linked-list operations'],
          'insufficient_evidence':['built-in array-only storage', 'calling Python dict without implementing the ADT relationship', 'conceptual diagram without executable implementation'],
        }
    if key == 'recursive-design-trace':
        assessments[-1]['objective_ids']=['SYL-19.2-03','SYL-19.2-04']
        assessments[-1]['required_demonstration']={'trace':'Independently predict call frames, parameters, pending work and return values before running the program; console output alone is insufficient.'}

packages=[]
for key,(vi,en) in PACKAGE_TITLES.items():
    pid=f'{COURSE}.package.{key}'
    ls=[l for l in lessons if l['package_id']==pid]
    packages.append({
      'package_id':pid,'titles':{'vi':vi,'en':en},'lesson_ids':[l['lesson_id'] for l in ls],
      'pattern_ids':[d['pattern_id'] for d in destinations if d['package_id']==pid],
      'planned_assessment_ids':[a['assessment_id'] for a in assessments if a['package_id']==pid],
      'authoring_status':'NOT_AUTHORED',
      'contract_slots':[{'slot_id':f'{pid}.section.{s}','slot':s,'titles':{'vi':sv,'en':se},'status':'PLANNED_NOT_AUTHORED'} for s,sv,se in SLOTS],
      'contract_application':'The ten learning-page slots apply at the package level and link to exact lesson/block targets. Their presence in this registry is a production checklist, not authored content.',
      'visual_policy':'State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.',
    })

EDGE_REASONS = {
 ('procedural-design','data-models'):'Subroutine contracts use typed values, variables, arrays and records defined in the data-models lesson.',
 ('validation-rules','procedural-design'):'Validation requires selection, repeated input and functions returning results.',
 ('testing','procedural-design'):'Tests need an explicit procedure/function contract and an observable result.',
 ('text-processing','data-models'):'String positions, output arrays and typed record fields depend on data representation.',
 ('text-processing','procedural-design'):'Tokenisation and character processing use loops, conditions and return values.',
 ('search-collections','procedural-design'):'Search, count and filter use loops, conditions and return contracts.',
 ('sorting','data-models'):'Sorting requires array index bounds and moving complete records, not only key fields.',
 ('sorting','procedural-design'):'Nested loops, comparisons and assignments implement sorting passes and shifts.',
 ('binary-search','search-collections'):'The learner first distinguishes searching for one result from counting all matches.',
 ('binary-search','sorting'):'The sorted-order precondition and comparator direction determine valid interval reduction.',
 ('stack','data-models'):'Bounded arrays, logical sizes and sentinels represent stack storage and its pointer.',
 ('stack','procedural-design'):'Push/pop are subroutines with preconditions, state changes and return contracts.',
 ('queue','data-models'):'Arrays, head/tail/count variables and index bounds represent queue state.',
 ('queue','procedural-design'):'Enqueue/dequeue require guarded updates and result contracts.',
 ('linked-list','data-models'):'Node records, arrays and null indices represent used and free nodes.',
 ('linked-list','procedural-design'):'Link traversal and updates require loops, branches and subroutine contracts.',
 ('recursion','procedural-design'):'Recursive calls rely on parameters, local scope and return values.',
 ('recursion','stack'):'The LIFO model explains suspended calls, return addresses and unwinding.',
 ('binary-tree','data-models'):'Node fields and index or object links represent tree state.',
 ('binary-tree','recursion'):'Recursive tree search/traversal requires base cases and return/visit order.',
 ('dictionary','data-models'):'Key-value records and unique-key contracts require field and collection representation.',
 ('dictionary','search-collections'):'Lookup, missing-key handling and repeated-key aggregation motivate the dictionary interface.',
 ('hashing','dictionary'):'Hashing implements key lookup/storage while preserving the logical key-value contract.',
 ('hashing','search-collections'):'Collision retrieval scans prescribed overflow or bucket storage using key comparison.',
 ('oop-model','data-models'):'Attributes, initial state and arrays of instances build on typed fields and storage.',
 ('oop-model','procedural-design'):'Methods and constructors have parameters and procedure/function contracts.',
 ('oop-state','oop-model'):'Getters, setters and updates operate on attributes of a particular instance.',
 ('oop-state','validation-rules'):'Clamping and rule-based updates need range and condition reasoning.',
 ('oop-inheritance','oop-model'):'Derived objects retain base attributes and initialise their inherited state.',
 ('oop-inheritance','oop-state'):'Override contracts are compared with the methods and state updates they replace.',
 ('oop-aggregation','oop-model'):'Aggregates store references to already-understood instances.',
 ('oop-aggregation','oop-state'):'Nested calls and aggregate changes depend on access and update contracts.',
 ('text-files','data-models'):'A file loader creates typed records and tracks logical array size.',
 ('text-files','procedural-design'):'File processing uses read loops and helper routine contracts.',
 ('text-files','text-processing'):'Delimited fields require tokenisation and conversion; this is a review dependency for simple one-field files.',
 ('object-files','text-files'):'Object loaders first parse file record boundaries and field types.',
 ('object-files','oop-model'):'Parsed fields become constructor arguments or instance updates.',
 ('object-files','oop-inheritance'):'Only the subclass-records extension selects different constructors from record types.',
 ('random-files','text-files'):'Compare record-based file organisation with sequential processing before direct access.',
 ('random-files','data-models'):'Fixed record layouts, key fields and address calculations depend on data representation.',
 ('exceptions','text-files'):'File open/read/write operations provide concrete failure and cleanup cases.',
 ('exceptions','validation-rules'):'Distinguish invalid input handled by conditions from operations raising exceptions.',
 ('performance','search-collections'):'Count scan comparisons against input size.',
 ('performance','sorting'):'Compare loop/pass and shift costs in sorting.',
 ('performance','binary-search'):'Repeated interval halving explains logarithmic search time.',
 ('performance','stack'):'Compare constant-time stack operations and stack storage growth.',
 ('performance','queue'):'Compare queue operation costs under prescribed representations.',
 ('performance','linked-list'):'Link traversal and free-list storage expose time/space tradeoffs.',
 ('performance','binary-tree'):'Tree shape affects search cost and recursive storage.',
 ('performance','dictionary'):'Dictionary performance depends on implementation rather than interface alone.',
 ('graphs','data-models'):'Graph diagrams describe values and relationships; no algorithm implementation is required.',
 ('exam-workflow','testing'):'Integrated work must reproduce requested inputs, results and captured evidence.',
 ('exam-workflow','text-files'):'File-dependent tasks must load the correct source and preserve required names/formats.',
 ('exam-workflow','oop-model'):'Review only for mixed exam tasks that construct objects; not a dependency for every integration example.',
 ('exam-workflow','stack'):'Review only for source tasks that compose Push/Pop and preserve their conventions.',
 ('exam-workflow','queue'):'Review only for source tasks that compose Enqueue/Dequeue and preserve their conventions.',
 ('exam-workflow','linked-list'):'Review only for source tasks using linked-list operations and logical order.',
 ('exam-workflow','binary-tree'):'Review only for source tasks using tree insertion/search/traversal.',
}
REVIEW_PAIRS={('text-files','text-processing'),('object-files','oop-inheritance')}
REVIEW_PAIRS.update({('performance',s) for s in ['stack','queue','linked-list','binary-tree','dictionary']})
REVIEW_PAIRS.update({('exam-workflow',s) for s in ['oop-model','stack','queue','linked-list','binary-tree']})
edges=[]
for l in lessons:
    l['authoring_status']='NOT_AUTHORED'
    l['planned_assessment_ids']=[a['assessment_id'] for a in assessments if a['lesson_id']==l['lesson_id']]
    l['review_lesson_ids']=[]
    old_prereqs=l['prerequisite_lesson_ids'][:]
    for req in old_prereqs:
        pair=(l['slug'],req.split('.lesson.')[1])
        assert pair in EDGE_REASONS,pair
        kind='review' if pair in REVIEW_PAIRS else 'required'
        edges.append({'from_lesson_id':req,'to_lesson_id':l['lesson_id'],'reason':EDGE_REASONS[pair],'kind':kind})
        if kind=='review':
            l['prerequisite_lesson_ids'].remove(req)
            l['review_lesson_ids'].append(req)
for b in by_slug['text-processing']['blocks']:
    if b['block_id'].endswith('.run-length'):b['role']='corpus_support'

lesson_ids={l['lesson_id'] for l in lessons}
block_ids={b['block_id'] for l in lessons for b in l['blocks']}
pattern_ids={p['pattern_id'] for p in catalog['patterns']}
assert len(qmap['rows'])==672
assert len(destinations)==58 and {d['pattern_id'] for d in destinations}==pattern_ids
assert all(d['knowledge_block_ids'] for d in destinations)
assert all(set(l['prerequisite_lesson_ids'])<=lesson_ids for l in lessons)
assert all(set(a['knowledge_block_ids'])<=block_ids for a in assessments)
assert len(block_ids)==sum(len(l['blocks']) for l in lessons)
seen=set()
active=set()
def visit(lid):
    assert lid not in active, f'Cycle at {lid}'
    if lid in seen:return
    active.add(lid)
    l=next(x for x in lessons if x['lesson_id']==lid)
    for req in l['prerequisite_lesson_ids']:visit(req)
    active.remove(lid)
    seen.add(lid)
for lid in lesson_ids:visit(lid)

result={
 'schema_version':'1.0.0','status':'SUBMITTED_FOR_LEAD_REVIEW','course_id':COURSE,
 'titles':{'vi':'Ôn thi Cambridge 9618 Paper 4 năm 2026 bằng Python','en':'Cambridge 9618 Paper 4 preparation for 2026 in Python'},
 'locales':['vi','en'],'authority':'AlgoCore editorial learning registry; no Cambridge syllabus codes invented here.',
 'input_provenance':[{'path':str(p.relative_to(BASE)).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [CATALOG,MAP,BASE/'stage-0/LEARNING_PAGE_CONTRACT.md',BASE/'stage-0/SCOPE.md']],
 'id_policy':{'locale_independent':True,'content_key':['content_id','locale','version'],'planned_route_template':'/{locale}/docs/paper-4/{lesson-slug}#knowledge-{block-suffix}','route_status':'PROPOSED_NOT_IMPLEMENTED','stable_ids_not_book_numbers':True,'anchors_unique_within_lesson':True,'local_source_paths_must_not_become_public_hrefs':True},
 'coverage_claim':'All 58 accepted Stage 2 patterns have proposed destinations. Full official objective and coursebook coverage is pending the Lead join with A2/A3; lessons and assessments have not been authored.',
 'pattern_to_block_semantics':'Block tags identify candidate knowledge destinations for a pattern, not a claim that every tagged block is assessed in every occurrence. The Lead must select narrower block/objective refs for each source part when producing examples.',
 'scope_policy':{'core':'Practical sections 19–20 excluding low-level and declarative programming. Core scope labels remain subject to the A3 official-objective join.','prerequisite':'Only AS 9–12 capabilities needed for this course; no separate Paper 2 curriculum.','support':'Graph characteristics, ADT abstraction and complexity support practical understanding; no invented requirement to code graph algorithms.','corpus_support':'Hashing is supported by observed tasks and dictionary/file explanation, not promoted to a separate mandatory 19.1 objective.','original_assessment':'Original tasks fill identified learning checks; not presented as historical Cambridge questions or official marking schemes.'},
 'packages':packages,'lessons':lessons,'prerequisite_edges':edges,'pattern_destinations':destinations,'planned_assessment_destinations':assessments,
 'cross_lesson_application_links':[
   {'from_block_id':f'{COURSE}.lesson.binary-search.knowledge.recursive-variant','recommended_before_block_id':f'{COURSE}.lesson.recursion.knowledge.recursive-contract','reason':'The initial binary-search lesson can teach iteration before recursion; its recursive extension is revisited after recursion.'},
   {'from_block_id':f'{COURSE}.lesson.queue.knowledge.reduce-consume','recommended_before_block_id':f'{COURSE}.lesson.recursion.knowledge.call-stack-unwind','reason':'Recursive queue reduction is an extension after call-stack knowledge, not a prerequisite for basic FIFO operations.'},
   {'from_block_id':f'{COURSE}.lesson.text-processing.knowledge.run-length','recommended_before_block_id':f'{COURSE}.lesson.queue.knowledge.dequeue','reason':'The queue-based RLE task 9618_w25_43_2(e) consumes values through Dequeue. Queue operations are required for that source variant, not for every string-run explanation.'},
   {'from_block_id':f'{COURSE}.lesson.dictionary.knowledge.other-adt-implementation','recommended_before_block_id':f'{COURSE}.lesson.linked-list.knowledge.representation-free-list','kind':'required_for_block_variant','condition':{'backend':'linked_list'},'additional_required_block_ids':[f'{COURSE}.lesson.linked-list.knowledge.{s}' for s in ['search','insert','remove-recycle']],'reason':'The planned linked-list-backed dictionary must use the linked-list ADT operations. This backend needs its representation, search, insertion and deletion knowledge; it does not require the tree alternative.'},
   {'from_block_id':f'{COURSE}.lesson.dictionary.knowledge.other-adt-implementation','recommended_before_block_id':f'{COURSE}.lesson.binary-tree.knowledge.representation','kind':'required_for_block_variant','condition':{'backend':'binary_tree'},'additional_required_block_ids':[f'{COURSE}.lesson.binary-tree.knowledge.{s}' for s in ['search','ordered-insert']],'reason':'A tree-backed alternative requires its chosen tree representation and operations. It is not a prerequisite for the planned linked-list implementation. Do not introduce mandatory tree deletion: this optional backend needs a separately bounded interface if authored.'},
   {'from_block_id':f'{COURSE}.lesson.binary-tree.knowledge.representation','recommended_before_block_id':f'{COURSE}.lesson.oop-model.knowledge.constructor','reason':'Object-backed tree variants require constructors; array-backed tree variants do not require OOP first.'},
   {'from_block_id':f'{COURSE}.lesson.random-files.knowledge.record-address','recommended_before_block_id':f'{COURSE}.lesson.hashing.knowledge.hash-address','reason':'Only a chosen hash-addressed random-file extension needs this review. Array hashing in the corpus does not itself provide a random-file fixture.'},
 ],
 'self_checks':{'pattern_destinations':len(destinations),'source_parts_indexed_for_registry':len(qmap['rows']),'lesson_count':len(lessons),'knowledge_block_count':len(block_ids),'package_count':len(packages),'planned_assessment_count':len(assessments),'gap_or_completeness_assessment_design_count':len(GAPS),'prerequisite_edge_count':len(edges),'missing_pattern_ids':[],'unresolved_destination_ids':[],'prerequisite_graph_acyclic':True,'locales_share_ids':True,'live_app_modified':False,'full_syllabus_gate_claim':False}
}
(HERE/'A1_LESSON_BLUEPRINT.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result['self_checks'],ensure_ascii=False))

from __future__ import annotations


PATTERNS = ["ALGORITHM_REWRITE", "TREE_SETUP", "TREE_INSERT", "TREE_SEARCH", "TREE_TRAVERSE"]


def bi(vi, en):
    return {"vi": vi, "en": en}


SPECS = {
    "ALGORITHM_REWRITE": {
        "pre": "The supplied algorithm exposes its parameters, base/loop condition, state updates, outputs, side effects and return contract.",
        "repr": "A source-to-target state correspondence covering call frames or loop state, accumulator, observable output and returned value.",
        "conv": ["base case and loop exit describe the same terminal states", "recursive return propagation and iterative accumulation preserve evaluation order", "observable output timing is part of behaviour"],
        "axes": ["direction", "accumulator", "output_order", "parameters"],
        "decision": bi("Chỉ đổi cấu trúc thực hiện sau khi lập ánh xạ state nguồn–đích và chuỗi observable tương đương.", "Change execution structure only after mapping source and target states and their equivalent observable sequence."),
        "inv": "After each target transition, its mapped state and observable prefix equal those of the corresponding source transition.",
        "steps": [
            ("contract", ("Trích tham số, base/exit, update, output, side effect và return của thuật toán nguồn.", "Extract source parameters, base/exit condition, updates, outputs, side effects and return."), ("Rewrite phải giữ hành vi quan sát được, không chỉ giá trị cuối.", "A rewrite must preserve observable behaviour, not only the final value."), "Every observable source action has exactly one target counterpart.", "Before choosing recursion or iteration.", "defines_equivalence", ("Lập bảng source state → target state cho từng biến.", "Build a source-state to target-state table for every variable.")),
            ("terminal", ("Ánh xạ base case sang loop exit, hoặc loop exit sang base case, trên đúng tập state.", "Map the base case to the loop exit, or the loop exit to the base case, over the same state set."), ("Guard lệch một biên làm thay đổi số bước hoặc bỏ terminal value.", "A one-boundary guard mismatch changes the step count or loses the terminal value."), "Source and target terminate on the same abstract states.", "Before translating the progress step.", "aligns_termination", ("Thử state ngay trước, đúng tại và ngay sau biên dừng.", "Test states immediately before, at and after the stopping boundary.")),
            ("progress", ("Chuyển update thành lời gọi với đối số nhỏ hơn hoặc thành một iteration; giữ nguyên thứ tự accumulator/output.", "Turn updates into a call on smaller arguments or one iteration; preserve accumulator/output order."), ("Đổi thứ tự update và output có thể tạo cùng total nhưng khác trace.", "Reordering update and output can keep the same total while changing the trace."), "The progress measure moves strictly toward the shared terminal state and preserves the mapped accumulator.", "Only on a non-terminal state.", "advances_equivalent_state", ("So từng dòng trace state và observable, chưa dùng runtime làm bằng chứng.", "Compare each state and observable trace row without treating runtime as evidence.")),
            ("return", ("Truyền return qua mọi frame hoặc chốt accumulator tại loop exit theo đúng contract.", "Propagate the return through every frame or finalise the accumulator at loop exit under the exact contract."), ("Thiếu return ở một nhánh làm kết quả đệ quy bị mất dù lời gọi vẫn xảy ra.", "A missing return on one branch loses the recursive result even though the call occurs."), "The final return and complete observable sequence equal the source contract.", "After the terminal state is reached.", "terminates_rewrite", ("Kiểm riêng return, side effects, output order và số bước tiến.", "Check return, side effects, output order and progress-step count separately.")),
        ],
        "errors": [
            ("guard-mismatch", "Đổi base case thành loop guard phủ sai một state biên.", "Mapping the base case to a loop guard that covers the wrong boundary state.", "Một input biên chạy thừa, dừng sớm hoặc không dừng.", "A boundary input takes an extra step, stops early or fails to terminate.", "So bảng truth của base/exit tại state trước–đúng–sau biên.", "Compare base/exit truth tables at states before, at and after the boundary.", "Viết tập terminal state của cả hai dạng và làm cho chúng bằng nhau.", "Write the terminal-state set for both forms and make the sets equal."),
            ("lost-return-order", "Bỏ return propagation hoặc đổi thứ tự output/update.", "Dropping return propagation or changing output/update order.", "Giá trị cuối hoặc observable sequence khác thuật toán nguồn.", "The final value or observable sequence differs from the source algorithm.", "Đối chiếu số thứ tự từng output/update và đường return qua từng frame.", "Compare the sequence number of each output/update and the return path through every frame.", "Đánh dấu từng return/output trong source trace rồi nối tới đúng target event.", "Label every source return/output and join it to the corresponding target event."),
        ],
        "cases": [("recursive-to-iterative", "replace call frames with loop state while retaining output and return order"), ("iterative-to-recursive", "choose a smaller argument and combine the returned value"), ("observable-output", "preserve intermediate output timing as well as the final result")],
        "visual": ("Mỗi call frame hoặc iteration tương ứng với state nào, và return đi ngược qua đâu?", "Which state corresponds to each call frame or iteration, and how does the return propagate back?", ["CAPTURE_SOURCE_STATE", "TEST_TERMINAL_STATE", "ADVANCE_PROGRESS_MEASURE", "EMIT_OBSERVABLE", "PROPAGATE_RETURN", "COMPARE_MAPPED_STATE"]),
    },
    "TREE_SETUP": {
        "pre": "The source fixes array-backed or object-node representation, capacity, null value, root contract and allocation pointer/count.",
        "repr": "Either indexed node storage with left/data/right fields plus root/free state, or object nodes with child references plus a tree root/count wrapper.",
        "conv": ["root, child and free pointers are tree roles rather than a stack top convention", "empty root follows the source parameter/sentinel", "constructor examples with a located source caveat are not silently repaired"],
        "axes": ["array_or_objects", "root_parameter", "empty_value", "free_pointer"],
        "decision": bi("Chọn representation trước; sau đó ghi riêng null child, empty root và next-free/count theo đúng hợp đồng nguồn.", "Choose the representation first; then record null child, empty root and next-free/count separately from the source contract."),
        "inv": "Every live root/child reference is null or names a valid node, and allocation state identifies exactly the unused region without inventing a stack-top meaning.",
        "steps": [
            ("representation", ("Khóa array rows hay object nodes, tên field, capacity và null representation.", "Lock array rows or object nodes, field names, capacity and null representation."), ("Trộn index và object reference tạo pointer không cùng miền.", "Mixing indices and object references creates pointers from incompatible domains."), "All root and child references use one representation and one null convention.", "Before creating any node storage.", "selects_representation", ("Vẽ một node và ghi kiểu của left/data/right hoặc child fields.", "Draw one node and label the type of left/data/right or child fields.")),
            ("storage", ("Tạo đúng số slot/node độc lập và khởi tạo các field được nguồn yêu cầu.", "Create the exact number of independent slots/nodes and initialise source-required fields."), ("Thiếu cell hoặc dùng chung một object phá capacity và mutation isolation.", "A missing cell or shared object breaks capacity and mutation isolation."), "Each storage position denotes one independent node candidate with valid empty fields.", "After representation selection.", "establishes_storage", ("Đếm slot và kiểm hai slot sửa độc lập.", "Count slots and check that two slots can change independently.")),
            ("root-allocation", ("Đặt root từ parameter hoặc empty sentinel, rồi đặt free pointer/count đúng nghĩa next unused.", "Set root from its parameter or empty sentinel, then set the free pointer/count to mean next unused."), ("Root parameter không được tự đổi thành null; free state không phải current-top.", "A root parameter must not be overwritten with null; allocation state is not current-top."), "Root denotes the required empty/existing tree and allocated plus free regions partition capacity.", "After storage exists.", "establishes_tree_state", ("Kiểm riêng empty-root case và constructor nhận root parameter.", "Check the empty-root case separately from a constructor receiving a root parameter.")),
            ("audit", ("Audit bounds, nulls, root reachability, allocation state và caveat constructor p35 trước handoff.", "Audit bounds, nulls, root reachability, allocation state and the p35 constructor caveat before handoff."), ("Ví dụ MS có caveat phải được giữ làm nghĩa vụ Stage 5, không thành code chuẩn.", "An MS example caveat must remain a Stage 5 obligation rather than becoming canonical code."), "The setup satisfies the source contract while every located caveat remains explicitly unresolved for execution verification.", "Before insert/search/traverse uses the tree.", "terminates_setup", ("Đối chiếu source_issue_refs với constructor/root atoms và locator gốc.", "Cross-check source_issue_refs against constructor/root atoms and original locators.")),
        ],
        "errors": [
            ("root-overwrite", "Constructor nhận root node nhưng lại luôn gán root thành null.", "A constructor receives a root node but always overwrites root with null.", "Cây không còn state đầu mà QP truyền vào.", "The tree loses the initial state supplied by the QP.", "So identity/value của root parameter với root sau constructor và tách riêng empty case.", "Compare the root parameter identity/value with post-constructor root and inspect the empty case separately.", "Tách hai case: empty-tree sentinel và constructor-root parameter; dùng đúng case nguồn.", "Separate empty-tree sentinel and constructor-root parameter cases and use the source case."),
            ("shared-or-oob-storage", "Tạo sai capacity, dùng chung Node object hoặc để pointer ngoài miền.", "Creating the wrong capacity, sharing one Node object or leaving a pointer out of range.", "Mutation một slot lan sang slot khác hoặc dereference thất bại.", "One slot mutation leaks to another or a dereference fails.", "Lập bảng slot identity và kiểm mọi non-null pointer nằm trong 0..capacity-1.", "Build a slot-identity table and check every non-null pointer lies in 0..capacity-1.", "Đếm storage, kiểm identity độc lập và audit mọi pointer/null theo bounds.", "Count storage, check independent identity and audit every pointer/null against bounds."),
        ],
        "cases": [("array-backed-empty", "all node rows use the required null sentinel; root/free match source"), ("object-wrapper-empty", "independent Node objects plus null root/count contract"), ("constructor-root", "preserve the supplied first/root Node parameter, including the p35 caveat")],
        "visual": ("Root, child pointer và free/count đang trỏ vào miền nào sau từng bước khởi tạo?", "Which domain do root, child pointers and free/count refer to after each setup event?", ["SELECT_TREE_REPRESENTATION", "CREATE_NODE_STORAGE", "SET_NULL_CHILDREN", "SET_ROOT_STATE", "SET_ALLOCATION_STATE", "FLAG_SOURCE_CAVEAT"]),
    },
    "TREE_INSERT": {
        "pre": "A valid BST representation, root, capacity/allocation state and explicit equal-key branch policy are available.",
        "repr": "A candidate node plus a cursor/parent path over indexed or object child links and one allocation commit.",
        "conv": ["less and greater-or-equal directions are source-bound", "empty root is a separate commit", "full failure preserves tree and allocation state"],
        "axes": ["array_or_objects", "equal_key_rule", "capacity", "root_case"],
        "decision": bi("Chốt duplicate branch trước; chỉ allocate/attach sau khi capacity và vị trí child trống đã được xác nhận.", "Fix the duplicate branch first; allocate and attach only after capacity and an empty child position are confirmed."),
        "inv": "The reachable structure is a valid source-ordered BST, every pre-existing link is preserved, and allocation state advances only for one attached node.",
        "steps": [
            ("guard", ("Kiểm capacity, candidate contract và duplicate policy trước mọi mutation.", "Check capacity, candidate contract and duplicate policy before any mutation."), ("Nếu full hoặc policy chưa rõ, ghi sớm có thể làm node mồ côi.", "If full or policy is unclear, early mutation can create an orphan node."), "A rejected insert changes neither links, root nor allocation state.", "At operation entry.", "guards_commit", ("So snapshot trước/sau full case.", "Compare before/after snapshots for the full case.")),
            ("empty-root", ("Nếu cây rỗng, nối candidate thành root đúng representation rồi commit allocation một lần.", "If the tree is empty, attach the candidate as root in the correct representation and commit allocation once."), ("Root case không có parent link để cập nhật.", "The root case has no parent link to update."), "A successful empty-tree insert creates exactly one reachable root and no other link.", "Only when root is null.", "handles_root_case", ("Kiểm root trỏ candidate và hai child của candidate là null.", "Check that root names the candidate and both candidate children are null.")),
            ("descend", ("Từ root, so key và theo đúng một child; equal đi theo nhánh đã khóa cho đến null child.", "From root, compare the key and follow exactly one child; equal follows the fixed branch until a null child."), ("Đổi duplicate policy giữa đường phá BST invariant hoặc gây loop.", "Changing duplicate policy mid-path breaks the BST invariant or can loop."), "Every visited ancestor places the candidate in its source-defined valid subtree.", "While the selected child is non-null.", "advances_to_gap", ("Ghi path gồm node, comparison và chosen child.", "Record a path of node, comparison and chosen child.")),
            ("attach", ("Gắn candidate vào đúng child null, rồi tăng free/count đúng một; không sửa link khác.", "Attach the candidate at the selected null child, then advance free/count once; change no other link."), ("Link update và allocation phải là một transaction.", "Link update and allocation must form one transaction."), "Exactly one new node is reachable and all old nodes retain their relative structure.", "After a null child is found.", "terminates_insert", ("Audit one changed link, allocation delta=1 và inorder ordering.", "Audit one changed link, allocation delta=1 and inorder ordering.")),
        ],
        "errors": [
            ("duplicate-drift", "Dùng lúc thì equal-left, lúc thì equal-right.", "Sending equal keys left in one comparison and right in another.", "Duplicate có thể vi phạm ordering hoặc traversal không tìm lại được.", "A duplicate can violate ordering or become unreachable by the matching search rule.", "Trace hai duplicate liên tiếp và xác nhận mọi equality chọn cùng một child direction.", "Trace two consecutive duplicates and confirm every equality selects the same child direction.", "Viết một dòng equal-key policy cạnh mọi comparison và dùng cùng rule cho search.", "Write the equal-key policy beside every comparison and reuse it in search."),
            ("orphan-allocation", "Tăng count/free hoặc ghi node trước khi gắn parent child thành công.", "Advancing count/free or writing the node before the parent-child attachment succeeds.", "Xuất hiện node mồ côi hoặc mất một capacity slot.", "An orphan node appears or one capacity slot is lost.", "So reachable-node count, allocation delta và số parent link đổi trước/sau insert.", "Compare reachable-node count, allocation delta and changed-parent-link count before/after insertion.", "Gom allocate, attach và count update thành một commit sau khi tìm thấy null child.", "Make allocation, attachment and count update one commit after finding the null child."),
        ],
        "cases": [("empty-root", "candidate becomes the sole root"), ("internal-descent", "follow comparisons until one null child"), ("duplicate-or-full", "apply exact equal-key policy or preserve state on full failure")],
        "visual": ("Comparison nào chọn child tiếp theo, và event nào là commit duy nhất làm cây thay đổi?", "Which comparison selects the next child, and which single event commits the tree change?", ["CHECK_TREE_CAPACITY", "COMPARE_INSERT_KEY", "FOLLOW_INSERT_CHILD", "DETECT_EMPTY_CHILD", "ATTACH_NEW_NODE", "ADVANCE_ALLOCATION_STATE"]),
    },
    "TREE_SEARCH": {
        "pre": "The BST ordering/equal policy, root representation, null value and found/missing return contract are known.",
        "repr": "A current node/index moving along one root-to-child path, with recursive or iterative return state.",
        "conv": ["tree search follows child pointers rather than midpoint array bounds", "null is tested before dereference", "recursive result is returned by every caller"],
        "axes": ["recursive_or_iterative", "missing_case", "return_contract"],
        "decision": bi("Mỗi comparison chỉ chọn một child pointer; null trả missing, equality trả đúng found contract.", "Each comparison selects one child pointer; null returns missing and equality returns the exact found contract."),
        "inv": "If the target exists, it remains in the subtree named by current; every discarded subtree is excluded by the BST comparison rule.",
        "steps": [
            ("null-guard", ("Kiểm current/root với null và bounds trước khi đọc data.", "Check current/root against null and bounds before reading data."), ("Null hoặc index ngoài miền là missing base case, không phải node để dereference.", "Null or an out-of-range index is a missing base case, not a node to dereference."), "No node field is read unless current denotes a valid node.", "At entry to every search step/call.", "guards_dereference", ("Thử empty tree và missing child.", "Test an empty tree and a missing child.")),
            ("compare", ("So target với data tại current và xử lý equality trước.", "Compare target with current data and handle equality first."), ("Equality phải trả node/index/Boolean đúng contract ngay tại node hiện tại.", "Equality must return the required node/index/Boolean contract at the current node."), "A found result identifies a node whose data equals the target.", "After null/bounds guard.", "detects_found", ("Kiểm returned value đúng loại và đúng node.", "Check that the returned value has the required type and identifies the right node.")),
            ("branch", ("Nếu chưa equal, chọn left hoặc right theo ordering và duplicate policy; không dùng midpoint.", "If unequal, select left or right by ordering and duplicate policy; do not use a midpoint."), ("Tree có physical array vẫn không phải sorted-array binary search.", "A physically array-backed tree is still not sorted-array binary search."), "The chosen child is the only subtree that can contain the target under the ordering rule.", "On an unequal valid node.", "shrinks_candidate_subtree", ("Ghi comparison sign và chosen child cho từng bước.", "Record the comparison sign and chosen child at every step.")),
            ("propagate", ("Lặp với child hoặc return trực tiếp kết quả recursive call qua mọi frame.", "Continue with the child or directly return the recursive-call result through every frame."), ("Gọi đệ quy mà không return làm mất found index ở caller.", "A recursive call without return loses the found index at its caller."), "The final found/missing value reaches the original caller unchanged.", "When equality or null ends the path.", "terminates_search", ("Trace found-at-root, found-deep và missing.", "Trace found-at-root, found-deep and missing cases.")),
        ],
        "errors": [
            ("midpoint-confusion", "Dùng low/high/mid như binary search trên sorted array.", "Using low/high/mid as if the backing array were sorted.", "Search bỏ qua topology child pointers và có thể đọc node không liên quan.", "Search ignores child-pointer topology and can inspect unrelated nodes.", "Trên cây có allocation order khác inorder, so visited path với child-edge path từ root.", "On a tree whose allocation order differs from inorder, compare the visited path with root child edges.", "Xóa interval state; giữ duy nhất current node/index và child links.", "Remove interval state and retain only current node/index plus child links."),
            ("missing-return", "Gọi search đệ quy ở child nhưng không return kết quả.", "Calling recursive search on a child without returning its result.", "Found result bị thay bằng None/giá trị mặc định ở frame trên.", "A found result is replaced by None/default at an upper frame.", "Dựng unwind table cho target ở depth 2 và kiểm cùng found value ở cả ba frame.", "Build an unwind table for a depth-two target and check the same found value at all three frames.", "Đánh dấu mỗi recursive edge bằng `return child-search(...)` và trace unwind.", "Label every recursive edge with `return child-search(...)` and trace the unwind."),
        ],
        "cases": [("found-root", "equality terminates without following a child"), ("found-deep", "one comparison-selected path and full return propagation"), ("missing-null", "null/bounds base case returns the source missing value")],
        "visual": ("Sau mỗi comparison, subtree nào còn có thể chứa target và return đi qua những frame nào?", "After each comparison, which subtree can still contain the target and through which frames does the return travel?", ["GUARD_SEARCH_NODE", "COMPARE_SEARCH_KEY", "CHOOSE_SEARCH_CHILD", "DESCEND_SEARCH_PATH", "RETURN_FOUND", "RETURN_MISSING", "PROPAGATE_SEARCH_RETURN"]),
    },
    "TREE_TRAVERSE": {
        "pre": "The traversal order, root/node representation, null convention and visit/output action are explicit.",
        "repr": "A recursive frame with left subtree, current-node visit and right subtree events ordered by the requested traversal grammar.",
        "conv": ["inorder is left-current-right", "postorder is left-right-current", "physical storage order is not traversal order"],
        "axes": ["inorder_or_postorder", "array_or_objects", "recursion"],
        "decision": bi("Viết traversal thành chuỗi ba token L/N/R trước; đặt visit event đúng vị trí rồi mới mở rộng recursive calls.", "Write the traversal as a three-token L/N/R sequence first; place the visit event, then expand recursive calls."),
        "inv": "Completed visit events equal the requested traversal of completed subtrees, and no null child or node is visited twice.",
        "steps": [
            ("order", ("Khóa order LNR, LRN hoặc order nguồn khác và định nghĩa visit action.", "Lock LNR, LRN or another source order and define the visit action."), ("Tên traversal phải chuyển thành event order cụ thể.", "A traversal name must become a concrete event order."), "One fixed three-event grammar governs every non-null frame.", "Before recursion is written.", "selects_visit_order", ("Viết ba token và khoanh vị trí N.", "Write the three tokens and circle the N position.")),
            ("null", ("Tại mỗi frame, return ngay nếu node/index là null hoặc ngoài bounds hợp lệ.", "At every frame, return immediately if the node/index is null or outside valid bounds."), ("Base case bảo vệ dereference và kết thúc ở leaf.", "The base case protects dereferences and terminates at leaves."), "Null subtrees contribute an empty visit sequence.", "Before reading either child or data.", "guards_frame", ("Dùng empty tree và leaf làm micro-case.", "Use an empty tree and a leaf as micro-cases.")),
            ("expand", ("Thực hiện left-call, visit-current và right-call đúng thứ tự token đã khóa.", "Execute left-call, visit-current and right-call in the locked token order."), ("Chuyển visit qua một call biến inorder thành post/preorder.", "Moving visit across one call changes inorder into postorder/preorder."), "Each frame emits exactly its left sequence, own visit and right sequence in the requested order.", "For a valid non-null node.", "expands_subtree", ("Đánh màu ba event theo token, không theo row của mảng.", "Label the three events by token rather than backing-array row.")),
            ("return", ("Đóng frame sau khi ba event hoàn tất và ghép visit sequence về caller.", "Close the frame after all three events and concatenate the visit sequence back to the caller."), ("Call stack order giải thích vì sao physical node layout không quyết định output.", "Call-stack order explains why physical node layout does not determine output."), "On root-frame return, every reachable node has one visit in the required order.", "After the frame's ordered events finish.", "terminates_traversal", ("So số visit với số node reachable và kiểm thứ tự trên cây bất đối xứng.", "Compare visit count with reachable-node count and check order on an asymmetric tree.")),
        ],
        "errors": [
            ("physical-order", "In các row của array thay vì theo child links.", "Printing backing-array rows instead of following child links.", "Output phản ánh allocation order chứ không phải inorder/postorder.", "Output reflects allocation order rather than inorder/postorder.", "Dùng cây bất đối xứng có row order khác topology và so hai output sequence.", "Use an asymmetric tree whose row order differs from topology and compare the two output sequences.", "Vẽ topology từ root và tạo event sequence bằng child edges.", "Draw topology from root and derive the event sequence from child edges."),
            ("visit-position", "Đặt visit trước/sau sai recursive call hoặc thiếu null guard.", "Placing visit around the wrong recursive call or omitting the null guard.", "Traversal thành order khác hoặc dereference null.", "The traversal becomes another order or dereferences null.", "Đối chiếu event của mỗi frame với token L/N/R và kiểm null frame có zero visit.", "Match each frame event to L/N/R tokens and check that a null frame has zero visits.", "Viết token L/N/R, đối chiếu từng statement và đặt base guard đầu frame.", "Write L/N/R tokens, match every statement and put the base guard first."),
        ],
        "cases": [("inorder", "left-current-right on an asymmetric tree"), ("postorder", "left-right-current with current emitted after both returns"), ("empty-or-leaf", "null contributes no visit; a leaf contributes exactly one visit")],
        "visual": ("Visit event xuất hiện trước, giữa hay sau hai child-return để tạo đúng traversal?", "Does the visit event occur before, between or after the two child returns for the required traversal?", ["ENTER_TRAVERSAL_FRAME", "RETURN_NULL_SUBTREE", "CALL_LEFT_SUBTREE", "VISIT_CURRENT_NODE", "CALL_RIGHT_SUBTREE", "RETURN_TRAVERSAL_FRAME"]),
    },
}


GLOBAL_INV_VI = {
    "ALGORITHM_REWRITE": "Sau mỗi chuyển tiếp đích, state ánh xạ và prefix observable phải bằng chuyển tiếp nguồn tương ứng.",
    "TREE_SETUP": "Mọi root/child reference hoặc là null hoặc trỏ node hợp lệ; allocation state mô tả đúng vùng chưa dùng và không mang nghĩa stack-top.",
    "TREE_INSERT": "Cấu trúc reachable vẫn là BST đúng ordering nguồn; link cũ được giữ và allocation chỉ tiến khi một node được gắn.",
    "TREE_SEARCH": "Nếu target tồn tại, nó vẫn nằm trong subtree current; mỗi subtree bị bỏ đã được loại bởi quy tắc so sánh BST.",
    "TREE_TRAVERSE": "Các visit đã hoàn tất đúng traversal của subtree tương ứng; null không được visit và mỗi node chỉ được visit một lần.",
}


STEP_META_VI = {
    "ALGORITHM_REWRITE": [
        ("Mỗi hành động quan sát được ở nguồn có đúng một đối ứng ở đích.", "Trước khi chọn recursion hay iteration.", "định nghĩa tương đương"),
        ("Nguồn và đích dừng trên cùng tập state trừu tượng.", "Trước khi chuyển progress step.", "căn chỉnh điều kiện dừng"),
        ("Đại lượng tiến triển đi nghiêm ngặt về terminal state và giữ accumulator ánh xạ.", "Chỉ trên state chưa terminal.", "tiến state tương đương"),
        ("Return cuối và toàn bộ observable sequence bằng hợp đồng nguồn.", "Sau khi đạt terminal state.", "kết thúc rewrite"),
    ],
    "TREE_SETUP": [
        ("Mọi root/child dùng cùng representation và null convention.", "Trước khi tạo storage.", "chọn representation"),
        ("Mỗi vị trí storage là một node candidate độc lập với empty fields hợp lệ.", "Sau khi chọn representation.", "thiết lập storage"),
        ("Root mô tả đúng cây rỗng/có sẵn và vùng allocated/free phân hoạch capacity.", "Sau khi storage tồn tại.", "thiết lập tree state"),
        ("Setup thỏa contract nguồn và mọi caveat vẫn là nghĩa vụ kiểm chứng rõ ràng.", "Trước khi insert/search/traverse dùng cây.", "kết thúc setup"),
    ],
    "TREE_INSERT": [
        ("Insert bị từ chối không đổi link, root hoặc allocation state.", "Khi bắt đầu operation.", "bảo vệ commit"),
        ("Insert vào cây rỗng tạo đúng một root reachable và không tạo link khác.", "Chỉ khi root là null.", "xử lý root case"),
        ("Mỗi ancestor đã đi qua đặt candidate vào subtree hợp lệ theo ordering nguồn.", "Khi chosen child còn non-null.", "tiến tới gap"),
        ("Đúng một node mới reachable và cấu trúc tương đối của node cũ không đổi.", "Sau khi tìm null child.", "kết thúc insert"),
    ],
    "TREE_SEARCH": [
        ("Không đọc field nếu current không trỏ node hợp lệ.", "Khi vào mỗi search step/call.", "bảo vệ dereference"),
        ("Kết quả found xác định node có data bằng target.", "Sau null/bounds guard.", "phát hiện found"),
        ("Chosen child là subtree duy nhất còn có thể chứa target theo ordering.", "Tại node hợp lệ nhưng không equal.", "thu nhỏ candidate subtree"),
        ("Giá trị found/missing cuối tới caller ban đầu mà không đổi.", "Khi equality hoặc null kết thúc path.", "kết thúc search"),
    ],
    "TREE_TRAVERSE": [
        ("Một grammar ba event cố định điều khiển mọi frame non-null.", "Trước khi viết recursion.", "chọn visit order"),
        ("Null subtree đóng góp visit sequence rỗng.", "Trước khi đọc child hoặc data.", "bảo vệ frame"),
        ("Mỗi frame phát đúng left sequence, own visit và right sequence theo order yêu cầu.", "Tại node non-null hợp lệ.", "mở rộng subtree"),
        ("Khi root frame return, mỗi node reachable có đúng một visit theo order yêu cầu.", "Sau khi ba event của frame hoàn tất.", "kết thúc traversal"),
    ],
}


VISUAL_CASES = {
    "ALGORITHM_REWRITE": {
        "normal": bi("Với input cần ba bước tiến, ghép ba call frame với ba iteration; accumulator, output trung gian và return cuối phải trùng từng checkpoint.", "For an input requiring three progress steps, pair three call frames with three iterations; accumulator, intermediate output and final return must match at every checkpoint."),
        "boundary": bi("Với terminal input và input chỉ cần một bước, terminal test phải tạo 0/1 progress event và return phải truyền về caller ban đầu.", "For a terminal input and a one-step input, the terminal test must produce 0/1 progress events and the return must propagate to the original caller."),
    },
    "TREE_SETUP": {
        "normal": bi("Tạo capacity ba node độc lập, đặt child null, root rỗng và next-free/count ban đầu; mọi pointer phải nằm trong miền hoặc bằng null.", "Create capacity-three independent nodes, set null children, empty root and initial next-free/count; every pointer must be in-domain or null."),
        "boundary": bi("So empty tree với constructor nhận một root node: case đầu giữ root null, case sau phải giữ đúng parameter; capacity không đổi và caveat p35 được gắn cờ.", "Compare an empty tree with a constructor receiving one root node: the first keeps a null root, the second preserves the parameter; capacity stays fixed and the p35 caveat is flagged."),
    },
    "TREE_INSERT": {
        "normal": bi("Chèn key vào null child sau hai comparison; chỉ parent link đó và allocation count được đổi, inorder vẫn có thứ tự.", "Insert a key at a null child after two comparisons; only that parent link and allocation count change, and inorder remains ordered."),
        "boundary": bi("Đối chiếu ba state: empty root nhận node đầu, full tree giữ nguyên hoàn toàn, duplicate đi đúng nhánh equal đã khóa.", "Contrast three states: an empty root accepts the first node, a full tree remains unchanged, and a duplicate follows the locked equal-key branch."),
    },
    "TREE_SEARCH": {
        "normal": bi("Target ở leaf sau hai child edges: mỗi comparison loại một subtree và found return phải đi qua cả hai frame.", "Place the target at a leaf after two child edges: each comparison excludes one subtree and the found return must pass through both frames."),
        "boundary": bi("So found-at-root với missing-null: root case không descend; missing case chạm null trước dereference và trả đúng missing value.", "Compare found-at-root with missing-null: the root case does not descend; the missing case reaches null before dereference and returns the exact missing value."),
    },
    "TREE_TRAVERSE": {
        "normal": bi("Trên cây lệch ba node, hiển thị enter/call/visit/return để LNR và LRN tạo hai sequence khác nhau đúng vị trí N.", "On a three-node skewed tree, show enter/call/visit/return so LNR and LRN produce distinct sequences with N in the correct position."),
        "boundary": bi("Empty tree tạo zero visit; leaf tạo đúng một visit nằm giữa hai null-return cho inorder hoặc sau cả hai null-return cho postorder.", "An empty tree emits zero visits; a leaf emits exactly one visit between two null returns for inorder or after both null returns for postorder."),
    },
}

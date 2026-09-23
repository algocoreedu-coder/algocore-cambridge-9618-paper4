# Prerequisite map — Stage 3

Mũi tên đi từ kiến thức cần trước tới bài sử dụng. Required là điều kiện đầu vào; review là nhắc ôn khi biến thể cần. Thứ tự lớp dưới đây chỉ áp dụng phần cơ sở; các block có điều kiện phải học lại sau tiên quyết cụ thể.

## Các lớp học cơ sở

1. data-models
2. graphs, procedural-design
3. linked-list, oop-model, queue, search-collections, sorting, stack, testing, text-files, text-processing, validation-rules
4. binary-search, dictionary, exam-workflow, exceptions, object-files, oop-state, random-files, recursion
5. binary-tree, hashing, oop-aggregation, oop-inheritance, performance

## Quan hệ lesson

| Cần trước | Bài dùng | Loại | Lý do |
|---|---|---|---|
| data-models | procedural-design | required | Subroutine contracts use typed values, variables, arrays and records defined in the data-models lesson. |
| procedural-design | validation-rules | required | Validation requires selection, repeated input and functions returning results. |
| procedural-design | testing | required | Tests need an explicit procedure/function contract and an observable result. |
| data-models | text-processing | required | String positions, output arrays and typed record fields depend on data representation. |
| procedural-design | text-processing | required | Tokenisation and character processing use loops, conditions and return values. |
| procedural-design | search-collections | required | Search, count and filter use loops, conditions and return contracts. |
| data-models | sorting | required | Sorting requires array index bounds and moving complete records, not only key fields. |
| procedural-design | sorting | required | Nested loops, comparisons and assignments implement sorting passes and shifts. |
| search-collections | binary-search | required | The learner first distinguishes searching for one result from counting all matches. |
| sorting | binary-search | required | The sorted-order precondition and comparator direction determine valid interval reduction. |
| data-models | stack | required | Bounded arrays, logical sizes and sentinels represent stack storage and its pointer. |
| procedural-design | stack | required | Push/pop are subroutines with preconditions, state changes and return contracts. |
| data-models | queue | required | Arrays, head/tail/count variables and index bounds represent queue state. |
| procedural-design | queue | required | Enqueue/dequeue require guarded updates and result contracts. |
| data-models | linked-list | required | Node records, arrays and null indices represent used and free nodes. |
| procedural-design | linked-list | required | Link traversal and updates require loops, branches and subroutine contracts. |
| procedural-design | recursion | required | Recursive calls rely on parameters, local scope and return values. |
| stack | recursion | required | The LIFO model explains suspended calls, return addresses and unwinding. |
| data-models | binary-tree | required | Node fields and index or object links represent tree state. |
| recursion | binary-tree | required | Recursive tree search/traversal requires base cases and return/visit order. |
| data-models | dictionary | required | Key-value records and unique-key contracts require field and collection representation. |
| search-collections | dictionary | required | Lookup, missing-key handling and repeated-key aggregation motivate the dictionary interface. |
| dictionary | hashing | required | Hashing implements key lookup/storage while preserving the logical key-value contract. |
| search-collections | hashing | required | Collision retrieval scans prescribed overflow or bucket storage using key comparison. |
| data-models | oop-model | required | Attributes, initial state and arrays of instances build on typed fields and storage. |
| procedural-design | oop-model | required | Methods and constructors have parameters and procedure/function contracts. |
| oop-model | oop-state | required | Getters, setters and updates operate on attributes of a particular instance. |
| validation-rules | oop-state | required | Clamping and rule-based updates need range and condition reasoning. |
| oop-model | oop-inheritance | required | Derived objects retain base attributes and initialise their inherited state. |
| oop-state | oop-inheritance | required | Override contracts are compared with the methods and state updates they replace. |
| oop-model | oop-aggregation | required | Aggregates store references to already-understood instances. |
| oop-state | oop-aggregation | required | Nested calls and aggregate changes depend on access and update contracts. |
| data-models | text-files | required | A file loader creates typed records and tracks logical array size. |
| procedural-design | text-files | required | File processing uses read loops and helper routine contracts. |
| text-processing | text-files | review | Delimited fields require tokenisation and conversion; this is a review dependency for simple one-field files. |
| text-files | object-files | required | Object loaders first parse file record boundaries and field types. |
| oop-model | object-files | required | Parsed fields become constructor arguments or instance updates. |
| oop-inheritance | object-files | review | Only the subclass-records extension selects different constructors from record types. |
| text-files | random-files | required | Compare record-based file organisation with sequential processing before direct access. |
| data-models | random-files | required | Fixed record layouts, key fields and address calculations depend on data representation. |
| text-files | exceptions | required | File open/read/write operations provide concrete failure and cleanup cases. |
| validation-rules | exceptions | required | Distinguish invalid input handled by conditions from operations raising exceptions. |
| search-collections | performance | required | Count scan comparisons against input size. |
| sorting | performance | required | Compare loop/pass and shift costs in sorting. |
| binary-search | performance | required | Repeated interval halving explains logarithmic search time. |
| stack | performance | review | Compare constant-time stack operations and stack storage growth. |
| queue | performance | review | Compare queue operation costs under prescribed representations. |
| linked-list | performance | review | Link traversal and free-list storage expose time/space tradeoffs. |
| binary-tree | performance | review | Tree shape affects search cost and recursive storage. |
| dictionary | performance | review | Dictionary performance depends on implementation rather than interface alone. |
| data-models | graphs | required | Graph diagrams describe values and relationships; no algorithm implementation is required. |
| testing | exam-workflow | required | Integrated work must reproduce requested inputs, results and captured evidence. |
| text-files | exam-workflow | required | File-dependent tasks must load the correct source and preserve required names/formats. |
| oop-model | exam-workflow | review | Review only for mixed exam tasks that construct objects; not a dependency for every integration example. |
| stack | exam-workflow | review | Review only for source tasks that compose Push/Pop and preserve their conventions. |
| queue | exam-workflow | review | Review only for source tasks that compose Enqueue/Dequeue and preserve their conventions. |
| linked-list | exam-workflow | review | Review only for source tasks using linked-list operations and logical order. |
| binary-tree | exam-workflow | review | Review only for source tasks using tree insertion/search/traversal. |

## Điều kiện ở từng block

- **binary-search.knowledge.recursive-variant** cần recursion.knowledge.recursive-contract khi `{"variant": "recursive_binary_search"}`. The initial binary-search lesson can teach iteration before recursion; its recursive extension is revisited after recursion.
- **queue.knowledge.reduce-consume** cần recursion.knowledge.call-stack-unwind khi `{"variant": "recursive_queue_reduction"}`. Recursive queue reduction is an extension after call-stack knowledge, not a prerequisite for basic FIFO operations.
- **text-processing.knowledge.run-length** cần queue.knowledge.dequeue khi `{"source_part": "9618_w25_43_2(e)", "variant": "queue_based_rle"}`. The queue-based RLE task 9618_w25_43_2(e) consumes values through Dequeue. Queue operations are required for that source variant, not for every string-run explanation.
- **dictionary.knowledge.other-adt-implementation** cần linked-list.knowledge.representation-free-list, linked-list.knowledge.search, linked-list.knowledge.insert, linked-list.knowledge.remove-recycle khi `{"backend": "linked_list"}`. The planned linked-list-backed dictionary must use the linked-list ADT operations. This backend needs its representation, search, insertion and deletion knowledge; it does not require the tree alternative.
- **dictionary.knowledge.other-adt-implementation** cần binary-tree.knowledge.representation, binary-tree.knowledge.search, binary-tree.knowledge.ordered-insert khi `{"backend": "binary_tree"}`. A tree-backed alternative requires its chosen tree representation and operations. It is not a prerequisite for the planned linked-list implementation. Do not introduce mandatory tree deletion: this optional backend needs a separately bounded interface if authored.
- **binary-tree.knowledge.representation** cần oop-model.knowledge.constructor khi `{"representation": "object_backed_tree"}`. Object-backed tree variants require constructors; array-backed tree variants do not require OOP first.
- **random-files.knowledge.record-address** cần hashing.knowledge.hash-address khi `{"address_scheme": "hash_addressed_file"}`. Only a chosen hash-addressed random-file extension needs this review. Array hashing in the corpus does not itself provide a random-file fixture.

Dictionary dùng linked-list backend trong kế hoạch mặc định. Backend tree là lựa chọn khác, không yêu cầu học cả hai và không tự thêm xóa binary tree vào phạm vi.

Đồ thị lesson (required và cả review) và liên kết block có điều kiện đã kiểm tra không có chu trình. Các đề xuất tiên quyết ở mức objective trong đầu vào A3 bị loại vì quá rộng và thiếu lý do từng cạnh (S3-A8-07).

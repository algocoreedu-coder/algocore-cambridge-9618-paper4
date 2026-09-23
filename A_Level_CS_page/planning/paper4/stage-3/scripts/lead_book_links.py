"""Lead-authored semantic links, keyed by stable lesson slug / knowledge suffix.
Not generated from keyword overlap. Book sections are verified by A2 and reviewed by Lead.
"""
ROWS='''
data-models/identifier-contract|BOOK-09-ALGORITHM,BOOK-11-BASICS|direct_foundation|Identifier tables assign data roles; assignments and expressions explain changes to values rather than mere naming.
procedural-design/paradigm-choice|BOOK-20-PROCEDURAL,BOOK-20-CLASS|direct_concept|Compare procedural steps and object responsibility while excluding low-level and declarative code from this course.
procedural-design/abstraction-io|BOOK-09-DECOMPOSE,BOOK-09-ALGORITHM|direct_foundation|Essential information and input-process-output models support moving from a scenario to a definite algorithm.
procedural-design/console-library|BOOK-11-BASICS,BOOK-11-LIBRARY,BOOK-11-STRINGS|direct_foundation|Console operations and supplied/library routines support the permitted language tools; obey any QP restriction on shortcuts.
testing/repair-enhance|BOOK-12-TESTING,BOOK-09-REFINEMENT|component_foundation|Locating faults and refining steps support repair and amendment while preserving unaffected behavior; later tasks must include regression checks.
recursion/design-benefits|BOOK-19-RECURSION,BOOK-19-CALL-STACK|direct_concept|Recursive mathematical examples and frame support explain suitable decomposition and the cost of pending calls.
dictionary/other-adt-implementation|BOOK-19-ADT-COMPOSITION,BOOK-19-DICTIONARY|direct_concept|The dictionary definition using a linked list supports a concrete ADT-composition demonstration; later code must preserve the chosen dictionary contract.
oop-model/class-design|BOOK-20-CLASS,BOOK-20-CONTAINMENT,BOOK-09-DECOMPOSE|component_foundation|Class diagrams, has-a relationships and decomposition support selecting responsibilities; an unseen problem needs an original design assessment.
data-models/scalars-types-scope|BOOK-10-TYPES,BOOK-11-BASICS,BOOK-11-SUBROUTINES|direct_foundation|Types and declarations identify valid state; subroutine scope distinguishes shared from local state.
data-models/array-representation|BOOK-10-ARRAYS|direct_foundation|Array dimensions, bounds and element access support fixed storage representation.
data-models/record-fields|BOOK-10-RECORDS|direct_foundation|Heterogeneous fields under one record identifier support TYPE tasks; an OOP class substitute must preserve that role.
data-models/bounded-append|BOOK-10-ARRAYS,BOOK-11-CONSTRUCTS|component_foundation|Indexed storage plus capacity conditions support append; the exact count and failure contract comes from the exam.
data-models/random-data|BOOK-10-ARRAYS,BOOK-11-LIBRARY|component_foundation|Array population and library use are supported; random API, inclusive bounds and duplicate rejection require a separate Python design.
procedural-design/selection-iteration|BOOK-11-CONSTRUCTS|direct_foundation|Branches and three loop forms provide conditional repetition and termination.
procedural-design/subroutine-contracts|BOOK-11-SUBROUTINES|direct_foundation|Procedure/function interfaces, arguments and returned values support composing separately implemented routines.
procedural-design/parameter-modes|BOOK-11-SUBROUTINES|component_foundation|Book parameter modes support interface reasoning; Python mutation versus rebinding needs language-specific treatment later.
procedural-design/pseudocode-translation|BOOK-09-ALGORITHM,BOOK-11-CONSTRUCTS|direct_foundation|Algorithm notation and constructs support preserving sequence, conditions and iteration when translating.
procedural-design/decomposition|BOOK-09-DECOMPOSE,BOOK-12-DESIGN,BOOK-20-PROCEDURAL|direct_foundation|Decomposition and structure charts support separating routines and tracing data between calls.
validation-rules/input-validation|BOOK-06-VALIDATION,BOOK-11-CONSTRUCTS|direct_foundation|Validation tests define acceptable input; loops implement retry until the source contract holds.
validation-rules/rule-outcomes|BOOK-11-BASICS,BOOK-11-CONSTRUCTS,BOOK-09-ACCUMULATE|component_foundation|Arithmetic, selection and accumulation support the particular predicate, scoring bands or formula supplied by a question.
validation-rules/unique-selection|BOOK-06-VALIDATION,BOOK-10-ARRAYS,BOOK-11-CONSTRUCTS|component_foundation|Validation and state storage support tracking consumed items; no-replacement acceptance is a corpus-derived composition.
validation-rules/check-digit|BOOK-06-CHECK-DIGIT,BOOK-11-BASICS,BOOK-11-STRINGS|concept_and_adaptation|Book check-digit examples establish integrity arithmetic; the exam's precise division/rounding/X rule remains authoritative.
testing/test-design|BOOK-12-TESTING|direct_foundation|Normal, abnormal and boundary inputs with expected outcomes support a test plan.
testing/tracing-debugging|BOOK-12-TESTING,BOOK-09-ALGORITHM|direct_foundation|Dry-run state and error categories support locating the first incorrect step and distinguishing faults.
testing/source-contract|BOOK-12-TESTING|component_foundation|Testing expectations are foundational only; exact QP requirements and MS criteria are separate primary sources.
testing/capture-provenance|BOOK-12-TESTING|component_foundation|Recorded test results support repeatability; official evidence-document identity and screenshots come from syllabus and QP.
text-processing/character-comparison|BOOK-11-STRINGS,BOOK-11-CONSTRUCTS|component_foundation|Character indexing and loop/branch control support a manual comparator; prefix and return contracts come from QP.
text-processing/delimiter-tokenisation|BOOK-11-STRINGS,BOOK-11-CONSTRUCTS|component_foundation|Character operations and repeated selection support building tokens; the no-built-in-split constraint is exam-specific.
text-processing/typed-routing|BOOK-11-STRINGS,BOOK-10-TYPES,BOOK-11-CONSTRUCTS,BOOK-10-ARRAYS|component_foundation|Field extraction, type conversion, destination selection and array storage together support routing typed records.
text-processing/run-length|BOOK-01-RLE,BOOK-11-CONSTRUCTS|concept_and_adaptation|RLE explains consecutive runs; queue consumption, final-run flush and exact digit/count format need the source task.
search-collections/linear-find|BOOK-19-LINEAR|direct_algorithm|The sequential compare/advance loop and found/not-found contract match linear search.
search-collections/count-all|BOOK-10-LINEAR-EXTENSION,BOOK-09-ACCUMULATE|component_foundation|Extending a scan to all matches plus an accumulator supports occurrence counting, unlike early-exit existence search.
search-collections/filter-all|BOOK-10-ARRAYS,BOOK-11-CONSTRUCTS,BOOK-11-STRINGS|component_foundation|Full iteration, compound predicates and case/string comparisons support selecting all qualifying records.
search-collections/group-totals|BOOK-09-ACCUMULATE,BOOK-10-RECORDS,BOOK-19-LINEAR|component_foundation|Stored group records, lookup and accumulation support find-or-create group totals; the grouping technique is QP-derived.
sorting/bubble-passes|BOOK-19-BUBBLE|direct_algorithm|Adjacent comparisons/swaps and pass limits support bubble-sort behavior.
sorting/insertion-shifts|BOOK-19-INSERTION|direct_algorithm|The sorted prefix, held key and shifts support insertion sort.
sorting/ordered-insert|BOOK-19-INSERTION,BOOK-10-ARRAYS|concept_and_adaptation|The insertion operation and bounded arrays support a top-N update, but do not impose whole-array insertion sort on an unconstrained task.
sorting/comparator-variants|BOOK-19-BUBBLE,BOOK-19-INSERTION,BOOK-10-RECORDS|component_foundation|Comparison and whole-record movement are foundations; multi-key and direction contracts are supplied by individual QPs.
binary-search/preconditions-interval|BOOK-19-BINARY|direct_algorithm|Ordered input and lower/upper bounds justify which half can be discarded.
binary-search/midpoint-update|BOOK-19-BINARY|direct_algorithm|Midpoint comparison, bound updates and empty interval define termination and return behavior.
binary-search/recursive-variant|BOOK-19-BINARY,BOOK-19-RECURSION|component_foundation|Combine interval reduction with recursive base/progress/return; apply only when studying the recursive variant.
stack/representation-conventions|BOOK-19-STACK,BOOK-10-ADT|direct_algorithm|LIFO representation and empty/full state support array stacks; next-free versus occupied-top must follow each QP.
stack/push|BOOK-19-STACK|direct_algorithm|Capacity checks, pointer movement and write order support insertion under the chosen convention.
stack/pop|BOOK-19-STACK|direct_algorithm|Empty detection, reading and pointer movement support removal under the chosen convention.
stack/paired-restoration|BOOK-19-STACK,BOOK-11-CONSTRUCTS|component_foundation|Push/pop and branching are components; restoring an unmatched item is a question-specific protocol.
stack/reduce-operands|BOOK-19-STACK,BOOK-09-ACCUMULATE|component_foundation|Repeated pop and accumulated state support reduction; operand order and operation protocol are QP-specific.
queue/representation-conventions|BOOK-19-QUEUE,BOOK-10-ADT|direct_algorithm|FIFO, head/rear and count support queue representation; circular book examples do not replace linear QP conventions.
queue/enqueue|BOOK-19-QUEUE|direct_algorithm|Capacity, insertion and index/count updates support enqueue, with wrapping only when required.
queue/dequeue|BOOK-19-QUEUE|direct_algorithm|Empty condition and head/count changes support dequeue; sentinel types and reset follow the QP.
queue/inspect-live-items|BOOK-19-QUEUE,BOOK-11-CONSTRUCTS|component_foundation|Queue live boundaries and iteration support inspection without changing state; book dequeue is not reused as inspection.
queue/reduce-consume|BOOK-19-QUEUE,BOOK-09-ACCUMULATE,BOOK-19-RECURSION|component_foundation|Queue representation and accumulation support either read-only access or consumption; recursion is conditional on the source variant.
linked-list/representation-free-list|BOOK-19-LIST-SETUP|direct_algorithm|Separate logical links and free storage explain head, null and allocation state.
linked-list/traversal|BOOK-19-LIST-SEARCH|component_foundation|The search loop demonstrates following links; full output traversal removes the match stopping condition under QP requirements.
linked-list/search|BOOK-19-LIST-SEARCH|direct_algorithm|The book find operation explicitly handles a matching node or null result while following links.
linked-list/insert|BOOK-19-LIST-INSERT,BOOK-19-LIST-SETUP|direct_algorithm|Allocate a free node and relink; front/tail insertion and object allocation remain separate source variants.
linked-list/remove-recycle|BOOK-19-LIST-REMOVE|direct_algorithm|Search, unlink and free-list return support deletion; assumptions about presence and missing results must follow the task.
recursion/recursive-contract|BOOK-19-RECURSION|direct_algorithm|Base case and smaller recursive problem establish progress and termination.
recursion/call-stack-unwind|BOOK-19-CALL-STACK,BOOK-19-RECURSION|direct_concept|Separate frames and returned values explain winding and unwinding beyond observing a final screenshot.
recursion/translate-recursive|BOOK-19-RECURSION,BOOK-11-SUBROUTINES|direct_foundation|Recursive calls and interfaces support preserving the supplied algorithm and return propagation.
recursion/iteration-conversion|BOOK-19-RECURSION,BOOK-11-CONSTRUCTS|component_foundation|Recursion and iteration are both explained; an equivalent transformation preserving outputs/state is derived for each QP.
binary-tree/representation|BOOK-19-TREE-SETUP,BOOK-20-OBJECT-TREE|direct_concept|Array child links and object-node references are distinct representations; neither is universally required.
binary-tree/ordered-insert|BOOK-19-TREE-INSERT,BOOK-20-OBJECT-TREE|direct_algorithm|Comparison-guided allocation and child-link updates support BST insertion, with QP-specific equal-key handling.
binary-tree/search|BOOK-19-TREE-SEARCH,BOOK-20-OBJECT-TREE|direct_algorithm|Branch selection and null termination support tree lookup rather than midpoint array search.
binary-tree/traversals|BOOK-19-TREE-TRAVERSE,BOOK-19-RECURSION,BOOK-19-TREE-SETUP|activity_and_foundation|The book assigns traversal as an activity; visit-order algorithms require QP-grounded synthesis and later validation.
dictionary/adt-interface|BOOK-19-DICTIONARY|direct_concept|Unique keys and associated values define the logical interface independently of its implementation.
dictionary/find-insert|BOOK-19-DICTIONARY|activity_and_concept|Activity19P requests find/add; duplicate-key and missing-key contracts need explicit teaching design.
dictionary/delete|BOOK-19-DICTIONARY|activity_and_concept|Activity19P requests deletion; later original assessment must verify the postcondition and missing-key policy.
dictionary/representation-choice|BOOK-19-DICTIONARY,BOOK-19-ADT-COMPOSITION|direct_concept|The text relates a dictionary to another ADT and contrasts logical interface with provided language types.
hashing/table-storage|BOOK-13-HASH,BOOK-10-ARRAYS,BOOK-10-RECORDS|concept_and_adaptation|Hash-address/collision concepts and record arrays support storage; Spare and 100x10 bucket layouts are corpus-specific.
hashing/hash-address|BOOK-13-HASH,BOOK-11-BASICS|direct_concept|Key-to-address mapping and arithmetic support the exact modulus specified in QP.
hashing/insert-collisions|BOOK-13-HASH,BOOK-10-ARRAYS|concept_and_adaptation|Collision handling and indexed storage are foundations; spare/bucket search and full policy are specified by QP.
hashing/find-collisions|BOOK-13-HASH,BOOK-19-LINEAR|component_foundation|Hash address plus key checking in the collision region supports lookup; no claim of identical book probing strategy.
oop-model/class-object|BOOK-20-CLASS|direct_concept|Class definitions and object instances distinguish templates, attributes and methods.
oop-model/constructor|BOOK-20-CONSTRUCTORS,BOOK-20-CLASS|direct_concept|Constructor parameters/defaults establish initial state without creating a separate instance at class definition time.
oop-model/instantiate|BOOK-20-CONSTRUCTORS,BOOK-20-CLASS|direct_concept|Construction examples show passing arguments and keeping distinct instances.
oop-state/encapsulation|BOOK-20-CLASS|direct_concept|The encapsulation discussion supports controlled access; language-specific privacy limits need careful later wording.
oop-state/getters|BOOK-20-GETTERS|direct_concept|Table20.4 returns an existing attribute rather than computing or formatting a derived result.
oop-state/setters|BOOK-20-SETTERS|direct_concept|Table20.3 assigns a new attribute value; it does not imply additive updates.
oop-state/rule-updates|BOOK-20-SETTERS,BOOK-11-BASICS,BOOK-11-CONSTRUCTS|component_foundation|Object state plus arithmetic/selection supports relative changes and clamps; the source rule controls the transition.
oop-inheritance/base-derived|BOOK-20-INHERITANCE|direct_concept|Base and derived class examples show inherited state, new attributes and parent initialisation.
oop-inheritance/override-dispatch|BOOK-20-POLYMORPHISM|direct_concept|Overridden methods in derived shapes illustrate different behavior for a shared method name.
oop-inheritance/substitutability|BOOK-20-POLYMORPHISM|component_foundation|Shared method behavior supports polymorphic use; formal substitutability theory is not a required new syllabus topic.
oop-aggregation/has-a|BOOK-20-CONTAINMENT|direct_concept|Containment diagrams distinguish a collection of component objects from an inheritance relationship.
oop-aggregation/bounded-add|BOOK-20-CONTAINMENT,BOOK-10-ARRAYS|component_foundation|Object collections and stated capacities support bounded addition; the exam supplies update/result rules.
oop-aggregation/nested-access|BOOK-20-CONTAINMENT,BOOK-20-GETTERS,BOOK-11-SUBROUTINES|component_foundation|Contained-object references and method contracts support delegating reads and calculations across components.
text-files/file-lifecycle|BOOK-10-TEXT-FILES,BOOK-20-FILE-RECORDS|direct_foundation|Open/read/write/close and record iteration support file lifecycle; retain per-source mode and resource requirements.
text-files/record-loading|BOOK-10-TEXT-FILES,BOOK-20-FILE-RECORDS,BOOK-11-STRINGS|component_foundation|Reading record fields and string primitives support QP-specific line/delimiter/type layouts.
text-files/serial-sequential|BOOK-13-FILE-ORGANISATION,BOOK-20-FILE-SEQUENTIAL|direct_concept|Organisation by arrival or ordered key differs from the sequential access mechanism; maintaining sorted records needs a separate task.
text-files/write-append|BOOK-10-TEXT-FILES,BOOK-20-FILE-SEQUENTIAL|direct_foundation|Writing and appending have distinct effects; Table20.12 anchors append mode without claiming append always preserves key order.
text-files/adt-loading|BOOK-10-TEXT-FILES,BOOK-11-SUBROUTINES|component_foundation|File iteration and routine interfaces support handing input to existing ADT operations; exact full/error behavior comes from QP.
object-files/construct-from-record|BOOK-20-FILE-RECORDS,BOOK-20-CONSTRUCTORS|component_foundation|Record reading plus construction supports one object per record; exact layout and array/count are source-specific.
object-files/subclass-records|BOOK-20-FILE-RECORDS,BOOK-20-INHERITANCE,BOOK-11-CONSTRUCTS|component_foundation|File structure, subclass constructors and branch selection support QP-specific variable-record dispatch.
object-files/lookup-update|BOOK-20-FILE-RECORDS,BOOK-19-LINEAR,BOOK-20-SETTERS|component_foundation|Read keys, find the existing object and call its update method; construction is not implied.
random-files/organisation-access|BOOK-13-FILE-ORGANISATION,BOOK-20-FILE-RANDOM|direct_concept|Organisation/access and keyed addressing distinguish random files from scanning lines or an in-memory hash table.
random-files/record-address|BOOK-20-FILE-RANDOM,BOOK-13-HASH|concept_and_adaptation|The source shows record addresses and SEEK; fixed-size byte offsets are a proposed Python implementation choice to verify later.
random-files/read-write-update|BOOK-20-FILE-RANDOM|concept_and_adaptation|SEEK plus record read/write supplies the capability; exact Python storage format and tests are not provided by this locator.
exceptions/runtime-failures|BOOK-20-EXCEPTIONS,BOOK-12-TESTING|direct_concept|Exception examples and error categories distinguish unexpected runtime failures from invalid-domain checks.
exceptions/handle-recover|BOOK-20-EXCEPTIONS|direct_concept|TRY/EXCEPT examples support handling and recovery; choosing precise Python exceptions is later verified implementation work.
exceptions/cleanup|BOOK-10-TEXT-FILES,BOOK-20-EXCEPTIONS|component_foundation|Close operations and exception paths establish the need; finally/context-manager details are an implementation choice beyond these examples.
performance/asymptotic-cost|BOOK-19-COMPLEXITY|direct_concept|Time and space growth tables support comparison with explicit input-size and case assumptions.
performance/algorithm-choice|BOOK-19-COMPLEXITY,BOOK-19-BINARY,BOOK-10-ADT|direct_concept|Cost, sorted-input conditions and ADT purpose support selecting a suitable method.
performance/trace-cost|BOOK-19-BINARY,BOOK-19-BUBBLE,BOOK-19-INSERTION,BOOK-19-COMPLEXITY|component_foundation|Count meaningful comparisons/swaps on algorithm traces, then relate counts to growth; wall-clock timing is not a proof.
graphs/characteristics|BOOK-19-GRAPH|direct_concept|Nodes, edges, direction, weights, paths and cycles support describing a graph without requiring graph code.
graphs/structure-choice|BOOK-19-GRAPH|direct_concept|Network examples support explaining when relationships are naturally graphs; no graph algorithm implementation is added.
exam-workflow/compose-main|BOOK-09-DECOMPOSE,BOOK-11-SUBROUTINES|direct_foundation|Routine decomposition and interfaces support combining existing work in the required order.
exam-workflow/format-output|BOOK-11-STRINGS,BOOK-10-ARRAYS,BOOK-11-BASICS|component_foundation|Concatenation, iteration and console output support layout; exact required wording and physical/logical order come from QP.
exam-workflow/evidence-document|BOOK-12-TESTING|component_foundation|Tests and recording outcomes are a foundation only; the syllabus and each QP govern the evidence document.
exam-workflow/source-and-rubric|BOOK-12-TESTING|component_foundation|Testing offers a verification foundation; source authority and marking interpretation are AlgoCore editorial practices anchored to QP/MS.
'''

def get_links():
    result={}
    for row in ROWS.splitlines():
        if not row.strip():continue
        key,sections,role,reason=row.split('|')
        assert key not in result,key
        result[key]={'book_section_ids':sections.split(','),'book_relationship':role,'mapping_rationale_en':reason}
    return result

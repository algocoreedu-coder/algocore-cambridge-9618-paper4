"""Explicit Lead curriculum destinations. IDs are editorial atoms, not Cambridge codes."""
ROWS='''
SYL-19.1-01|search-collections/linear-find|Implement the complete sequential found/not-found contract.
SYL-19.1-02|binary-search/midpoint-update,binary-search/recursive-variant|Implement interval search; the recursive block applies only to that implementation variant.
SYL-19.1-03|binary-search/preconditions-interval|Explain ordering and compatible comparison before searching.
SYL-19.1-04|performance/trace-cost,performance/asymptotic-cost|Compare decision counts as the search input grows.
SYL-19.1-05|sorting/insertion-shifts|Implement sorted-prefix insertion over all items.
SYL-19.1-06|sorting/bubble-passes|Implement adjacent compare/swap passes and termination.
SYL-19.1-07,SYL-19.1-08|performance/trace-cost,sorting/comparator-variants|Separate initial-order and size effects for a specified sorting implementation.
SYL-19.1-09|linked-list/search|Follow links and return a found/missing result without modifying the list.
SYL-19.1-10|binary-tree/search|Follow ordered child links to find a key or reach null.
SYL-19.1-11|stack/push|Implement stack insertion under a declared pointer convention.
SYL-19.1-12|queue/enqueue|Implement FIFO insertion under the specified full/wrap rules.
SYL-19.1-13|linked-list/insert|Allocate and link a node while retaining valid list/free state.
SYL-19.1-14|binary-tree/ordered-insert|Select a branch and attach a node while preserving the source ordering rule.
SYL-19.1-15|stack/pop|Implement LIFO deletion and its empty result.
SYL-19.1-16|queue/dequeue|Implement FIFO deletion and its empty result.
SYL-19.1-17|linked-list/remove-recycle|Unlink the selected node and restore reusable storage when required.
SYL-19.1-18|graphs/characteristics|Describe graph components and features without adding code obligations.
SYL-19.1-19|graphs/structure-choice|Justify a graph for relationship data using a small scenario.
SYL-19.1-21|stack/representation-conventions|Demonstrate stack storage and state using permitted types.
SYL-19.1-22|queue/representation-conventions|Demonstrate queue storage and state using permitted types.
SYL-19.1-23|linked-list/representation-free-list|Demonstrate logical links and allocation representation.
SYL-19.1-24|dictionary/adt-interface,dictionary/find-insert,dictionary/delete,dictionary/representation-choice|Demonstrate the dictionary contract; selected find/add/update/delete tasks are authored demonstrations, not an invented verbatim syllabus operation list.
SYL-19.1-25|binary-tree/representation|Demonstrate node/root/child representation without requiring one implementation universally.
SYL-19.1-26|performance/algorithm-choice,performance/asymptotic-cost|Compare time for algorithms solving the same task under stated assumptions.
SYL-19.1-27|performance/asymptotic-cost,recursion/call-stack-unwind|Compare stored data and auxiliary call frames rather than ignoring recursive space.
SYL-19.1-28,SYL-19.1-29|performance/asymptotic-cost|Use distinct time and space growth models with input size and cases made explicit.
SYL-19.1-30|dictionary/other-adt-implementation|Use a named component ADT to implement another interface, with a conditional prerequisite on that backend.
SYL-19.2-01|recursion/recursive-contract,recursion/iteration-conversion|Identify base case, recursive case and progress; preserve those obligations when comparing or transforming implementation forms.
SYL-19.2-02|recursion/translate-recursive|Express calls, parameters and returns in Python without changing the supplied recursive behavior.
SYL-19.2-03|recursion/recursive-contract,recursion/design-benefits|Design an appropriate recursive reduction and executable stopping condition.
SYL-19.2-04|recursion/call-stack-unwind|Trace calls, frame-local values, outputs and returns; a final output screenshot is insufficient.
SYL-19.2-05|recursion/design-benefits|Explain benefits and costs for a problem suited to recursive decomposition.
SYL-19.2-06,SYL-19.2-07|recursion/call-stack-unwind|Explain stored return locations/local state and show the sequence of unwinding without implementing a compiler.
SYL-20.1-01|procedural-design/paradigm-choice|Compare the responsibilities organised by procedural and OOP code.
SYL-20.1-03|data-models/scalars-types-scope,data-models/array-representation,data-models/bounded-append,data-models/random-data|These are procedural variable/storage applications; random generation and bounded append are corpus techniques, not separately named syllabus objectives.
SYL-20.1-04|procedural-design/selection-iteration,validation-rules/rule-outcomes,validation-rules/unique-selection,validation-rules/check-digit,text-processing/character-comparison,text-processing/delimiter-tokenisation,text-processing/typed-routing,text-processing/run-length,search-collections/count-all,search-collections/filter-all,search-collections/group-totals,sorting/ordered-insert,queue/inspect-live-items,queue/reduce-consume,stack/paired-restoration,stack/reduce-operands,linked-list/traversal,binary-tree/traversals|These source-derived applications exercise selection/iteration and state. This link does not claim every technique is explicitly named by Cambridge; recursive-only forms additionally use19.2.
SYL-20.1-05|procedural-design/subroutine-contracts,procedural-design/decomposition,exam-workflow/compose-main,text-files/adt-loading|Define and compose procedures with clear data flow rather than reimplementing invoked algorithms.
SYL-20.1-06|procedural-design/subroutine-contracts,validation-rules/rule-outcomes,exam-workflow/format-output|Use function inputs and returned values, distinguishing return from printing.
SYL-20.1-07,SYL-20.1-17|oop-model/instantiate,oop-model/class-object|Distinguish the class template from each constructed instance and its state.
SYL-20.1-08|oop-model/class-object,oop-model/constructor|Represent attributes and initialise their values under a class contract.
SYL-20.1-09|oop-model/class-object,oop-state/rule-updates,oop-aggregation/nested-access|Methods express object responsibilities, changes and delegation to contained objects.
SYL-20.1-10|oop-model/class-object|Identify and implement the class definition itself.
SYL-20.1-11|oop-inheritance/base-derived|Model an is-a relation and initialise inherited and additional state.
SYL-20.1-12|oop-inheritance/override-dispatch,oop-inheritance/substitutability|Use shared method names with object-specific behavior; no formal type-theory unit is added.
SYL-20.1-13|oop-aggregation/has-a,oop-aggregation/bounded-add,oop-aggregation/nested-access|Containment gives access to component objects; capacity and result protocols are source-specific applications.
SYL-20.1-14|oop-state/encapsulation|Explain and implement controlled state access with accurate Python terminology.
SYL-20.1-15|oop-state/getters|Return the stored field or requested stored member without unintended changes.
SYL-20.1-16|oop-state/setters|Assign a supplied new value; relative arithmetic updates remain a distinct method behavior.
SYL-20.1-18|oop-model/class-design|Design responsibilities, attributes and method contracts from an unfamiliar scenario before coding.
SYL-20.1-19|oop-model/class-object,oop-model/instantiate,oop-state/rule-updates,object-files/subclass-records|Combine object state and behavior in executable code; file dispatch is one corpus application.
SYL-20.2-01|text-files/file-lifecycle|Select read mode and control the input file resource.
SYL-20.2-02,SYL-20.2-03|text-files/write-append|Distinguish overwrite from append and demonstrate the effect on existing data.
SYL-20.2-04|text-files/file-lifecycle,exceptions/cleanup|Close resources under the required paths; finally/context-manager syntax is a proposed implementation choice, not a named syllabus requirement.
SYL-20.2-05|text-files/record-loading,object-files/construct-from-record,object-files/lookup-update|Respect record boundaries/types while creating or updating the correct in-memory representation.
SYL-20.2-06|text-files/write-append|Serialize records with a recoverable layout and the requested mode.
SYL-20.2-07,SYL-20.2-08|text-files/serial-sequential|Demonstrate organisation as arrival order versus key order, including an update that preserves the chosen organisation.
SYL-20.2-09|random-files/organisation-access,random-files/record-address,random-files/read-write-update|Demonstrate actual persistent record addressing/read/write rather than an in-memory table.
SYL-20.2-10|exceptions/runtime-failures|Explain exceptional disruption and distinguish it from ordinary invalid-domain input.
SYL-20.2-11|exceptions/runtime-failures,exceptions/handle-recover|Choose a relevant handling boundary and recovery action without masking unrelated faults.
SYL-20.2-12|exceptions/handle-recover|Implement handling paths and verify their resulting state/messages.
SYL-9.1-01|procedural-design/abstraction-io|Select essential data and outputs in a focused preparatory model.
SYL-9.1-02|procedural-design/decomposition|Split a small task into routines with clear responsibilities.
SYL-9.2-01,SYL-9.2-03|procedural-design/abstraction-io,procedural-design/pseudocode-translation|Read and express definite input-process-output steps before implementing them.
SYL-9.2-02|data-models/identifier-contract|Associate identifiers with meaning, type and role.
SYL-9.2-04|procedural-design/decomposition|Refine a subtask until each step can be programmed and checked.
SYL-9.2-05|validation-rules/rule-outcomes,validation-rules/input-validation|Use predicates to select branches and decide whether input meets the stated contract.
SYL-10.1-01|data-models/scalars-types-scope|Select types that represent the required values and operations.
SYL-10.1-02,SYL-10.1-03|data-models/record-fields|Define heterogeneous records and access or amend their named fields.
SYL-10.2-01,SYL-10.2-02|data-models/array-representation|Use dimensions and bounds to select and process array storage.
SYL-10.3-01|text-files/file-lifecycle,text-files/record-loading|Use persistent line-based storage as a bridge to A Level record files.
SYL-10.4-01|dictionary/adt-interface,stack/representation-conventions,queue/representation-conventions,linked-list/representation-free-list|Explain data plus operations without turning the bridge into a separate full AS theory course.
SYL-10.4-02|stack/representation-conventions,queue/representation-conventions,linked-list/representation-free-list|Relate logical behavior to array cells and pointer/index state.
SYL-11.1-01|data-models/scalars-types-scope|Declare, initialise and distinguish constants from changing variables.
SYL-11.1-02|data-models/identifier-contract,validation-rules/rule-outcomes|Evaluate assignment, arithmetic and logic with the correct source semantics.
SYL-11.1-03,SYL-11.1-04|procedural-design/console-library,exam-workflow/format-output|Use console and library/string tools as allowed by the particular task, including restrictions on built-ins.
SYL-11.2-01,SYL-11.2-02,SYL-11.2-03,SYL-11.2-04|procedural-design/selection-iteration,validation-rules/input-validation|Choose and implement branch, counted, precondition and at-least-once repetition using valid Python equivalents.
SYL-11.3-01,SYL-11.3-03,SYL-11.3-04|procedural-design/subroutine-contracts|Use procedure/function interfaces, arguments, returned values and the corresponding terminology.
SYL-11.3-02|procedural-design/parameter-modes|Predict caller-visible mutation versus rebinding; do not invent selectable by-reference syntax in Python.
SYL-11.3-05|procedural-design/subroutine-contracts,performance/algorithm-choice|Choose a clear structured solution and justify relevant efficiency considerations.
SYL-12.2-01|procedural-design/decomposition|Track module boundaries and values transferred between routines.
SYL-12.3-01,SYL-12.3-02,SYL-12.3-03|testing/tracing-debugging|Distinguish syntax, logic and runtime faults using an authored failing example.
SYL-12.3-04,SYL-12.3-08|testing/repair-enhance|Repair or enhance code and rerun checks to preserve unaffected behavior.
SYL-12.3-05|testing/tracing-debugging|Dry-run selected state, then compare it with expected and actual execution.
SYL-12.3-06,SYL-12.3-07|testing/test-design|Choose cases and expected results deliberately rather than only following prescribed screenshot tests.
SYL-13.2-01|text-files/serial-sequential,random-files/organisation-access|Support20.2 by distinguishing file organisation from processing order.
SYL-13.2-02|random-files/organisation-access|Contrast a sequential scan with direct record access.
SYL-13.2-03|hashing/table-storage,hashing/hash-address,hashing/insert-collisions,hashing/find-collisions|Hash concepts support corpus table tasks; they are not a separately named19.1 hash-table requirement.
SYL-13.2-04|random-files/record-address,random-files/read-write-update|Connect key/address mapping to real persistent file operations, not only array buckets.
'''

def get_links():
    result={}
    for row in ROWS.splitlines():
        if not row.strip():continue
        objectives,blocks,reason=row.split('|')
        for objective in objectives.split(','):
            assert objective not in result,objective
            result[objective]={'block_keys':blocks.split(','),'mapping_rationale_en':reason}
    return result

# Exam workflow is grounded in assessment instructions rather than an invented content objective.
CONSTRAINT_BLOCKS={
    'testing/source-contract','testing/capture-provenance',
    'exam-workflow/evidence-document','exam-workflow/source-and-rubric',
}

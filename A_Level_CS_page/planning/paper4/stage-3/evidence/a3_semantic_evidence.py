# Manually selected capability evidence, after A8 review. No first-tag defaults.
# objective | part | role | facet-specific evidence and limitation
DATA = """
SYL-19.1-01|9618_s21_41_2(b)(i)|direct|The function scans array elements for a supplied value and returns found/not-found; this directly implements linear search.
SYL-19.1-02|9618_s24_42_3(d)(i)|direct|Recursive midpoint comparison with changed bounds and a not-found base case implements binary search.
SYL-19.1-05|9618_w22_42_1(e)|direct|Insertion sorting orders job records by priority; it is not insertion of one new item into an already sorted collection.
SYL-19.1-06|9618_s21_41_2(c)|direct|The supplied bubble algorithm is translated with pair comparison, swap and loop bounds preserved.
SYL-19.1-09|9618_w24_41_3(d)(i)|partial|Removal first locates the matching linked node. This evidences embedded search only; an independent find-return contract still needs an authored assessment.
SYL-19.1-10|9618_w22_41_3(c)|direct|Recursive search follows the ordered tree branches and returns the required search result.
SYL-19.1-11|9618_s22_42_1(c)|direct|Push checks stack capacity, stores the item and updates the specified pointer.
SYL-19.1-12|9618_s23_42_2(c)|direct|Enqueue stores the sale record, wraps the tail and updates the count with the prescribed full return.
SYL-19.1-13|9618_s21_41_1(d)(i)|direct|Insertion allocates a free linked node and updates the list/free pointers. Frozen source-code caveats still apply at solution stage.
SYL-19.1-14|9618_w21_41_3(b)|direct|The translated insertion algorithm follows and updates binary-tree links for the new value.
SYL-19.1-15|9618_s22_42_1(e)(i)|direct|Pop checks empty state, updates the stack pointer and returns the removed item.
SYL-19.1-16|9618_s23_42_2(d)|direct|Dequeue returns the head record and advances/wraps head with count reduction; empty returns an empty record.
SYL-19.1-17|9618_s25_43_3(b)(iv)|direct|Linked-list removal handles head/interior/not-found cases and changes links rather than merely deleting an array element.
SYL-19.1-21|9618_s22_42_1(a)|partial|The array and next-free pointer establish a stack representation; this setup part alone does not assess a full verbal ADT description or all operations.
SYL-19.1-22|9618_s23_42_2(b)|partial|Five record slots and head/tail/count initialisation establish a circular-queue representation; all operations are assessed elsewhere.
SYL-19.1-23|9618_s21_41_1(b)|partial|An array of node records with link fields and start/free pointers establishes the linked-list representation, not every ADT operation.
SYL-19.1-25|9618_w21_41_3(a)|partial|The node array and root/free state establish the binary-tree representation; this is not proof of an independent representation-choice explanation.
SYL-19.2-02|9618_s24_42_3(d)(i)|direct|The language-level function makes recursive binary-search calls with reduced bounds and terminating returns.
SYL-19.2-03|9618_w22_42_3(d)|direct|The task explicitly rewrites an iterative queue-total routine recursively, requiring recurrence and base case.
SYL-20.1-03|9618_s21_41_2(a)|direct|The program declares and initialises the given integer array, showing variable/storage use in procedural code.
SYL-20.1-04|9618_s21_41_3(c)(iv)|direct|The main program reads input, selects a question, loops until a correct answer and counts attempts; these are procedural constructs.
SYL-20.1-05|9618_w22_41_1(b)|direct|ReadFile is a named procedure with file-input and storage behaviour, not merely a call of an existing function.
SYL-20.1-06|9618_s21_41_2(b)(i)|direct|linearSearch accepts a parameter and returns a Boolean result; this is a procedural function.
SYL-20.1-07|9618_s22_41_2(e)|direct|Balloon1 is constructed using the input values, directly demonstrating creation of an object.
SYL-20.1-08|9618_s21_41_3(a)|direct|The TreasureChest class requires the named private typed attributes.
SYL-20.1-09|9618_s22_41_2(c)|direct|ChangeHealth is an object method taking a parameter and changing the object's existing health state.
SYL-20.1-10|9618_s21_41_3(a)|direct|The task explicitly declares the TreasureChest class and its constructor/private state.
SYL-20.1-11|9618_s23_41_2(b)(i)|direct|The Helicopter class is declared as a subclass of Vehicle with added attributes and inherited construction.
SYL-20.1-12|9618_s23_41_2(b)(ii)|partial|The subclass overrides IncreaseSpeed; this demonstrates overriding as a polymorphic mechanism, not every dispatch/use case or explanation of polymorphism.
SYL-20.1-13|9618_w22_41_2(b)(i)|direct|Hand stores existing Card objects in its private collection, directly evidencing object containment/aggregation.
SYL-20.1-14|9618_s21_41_3(a)|partial|Private class attributes evidence access restriction; getters/setters elsewhere complete the encapsulated interface, and a rationale still needs an authored check.
SYL-20.1-15|9618_s21_41_3(c)(i)|direct|getQuestion returns the stored question attribute without deriving a new result.
SYL-20.1-16|9618_w21_41_2(c)|direct|SetDescription replaces the stored description with the parameter value.
SYL-20.1-17|9618_s22_41_2(e)|direct|Constructing Balloon1 instantiates the defined class with specified argument values.
SYL-20.1-18|9618_s21_41_3(a)|partial|The class diagram/member requirements are supplied. Implementing them supports class design but does not prove independent scenario-to-class design.
SYL-20.1-19|9618_s23_41_2(b)(ii)|direct|The subclass's overridden method is executable OOP behaviour; its exact implementation remains for later verification.
SYL-20.2-01|9618_w22_41_1(b)|direct|The ReadFile criterion explicitly requires opening IntegerData.txt for reading.
SYL-20.2-02|9618_w25_42_3(d)|direct|The procedure writes the tree array to a new Tree.txt file; this provides the write-mode variant rather than the append variant.
SYL-20.2-03|9618_s25_41_2(c)|direct|QP p5 and MS p26 explicitly require opening the parameter file for append and storing new lines.
SYL-20.2-04|9618_w22_41_1(b)|direct|The mark scheme explicitly includes closing the file in an appropriate place.
SYL-20.2-05|9618_s21_41_3(b)|direct|Grouped question, answer and points fields are read from the file to create each TreasureChest record/object.
SYL-20.2-06|9618_w25_42_3(d)|direct|Each tree row's fields are written as a comma-separated record in the output file.
SYL-20.2-07|9618_s21_41_3(b)|partial|The reader processes the supplied record stream in file order; this supports serial-file processing but does not explicitly assess choosing or explaining serial organisation.
SYL-20.2-08|9618_s22_41_1(f)|partial|The high-score output persists records already maintained in score order. This supports ordered record processing, but does not explicitly assess a general key-ordered file organisation contract.
SYL-20.2-10|9618_w22_41_1(b)|partial|Required file exception handling demonstrates a response to failure; explaining what an exception is and why it matters remains a separate authored check.
SYL-20.2-11|9618_w22_41_1(b)|partial|The task asks for appropriate exception handling around file operations but supplies that context; independent selection of when handling is appropriate remains to assess.
SYL-20.2-12|9618_s25_41_2(c)|direct|QP p5 and MS p26 explicitly require exception-handling code with a suitable output on file failure.
SYL-9.2-01|9618_w21_41_1(a)|direct|Translate the supplied Unknown algorithm while preserving its ordered steps and return behaviour.
SYL-9.2-03|9618_s21_41_2(b)(ii)|partial|The main program translates an input/search-result/output specification; it does not independently assess every flowchart/pseudocode notation.
SYL-9.2-05|9618_s21_41_3(c)(ii)|direct|Answer equality is expressed as a Boolean condition and the function returns the corresponding result.
SYL-10.1-01|9618_s21_41_2(a)|partial|The array uses the prescribed integer data type; free choice among scalar types is not directly assessed by this example.
SYL-10.1-02|9618_s23_42_2(a)|direct|QP p5 and MS p11 require SaleData with SaleID as STRING and Quantity as INTEGER, demonstrating heterogeneous record fields.
SYL-10.1-03|9618_s25_42_2(d)|partial|Hash insertion accesses a record key and stores a record in the appropriate slot; independent field mutation is not established by the record declaration alone.
SYL-10.2-01|9618_s21_41_2(b)(i)|partial|The array scan uses valid indices and loop bounds; explaining upper/lower-bound terminology is not separately assessed.
SYL-10.2-02|9618_s21_41_2(a)|partial|A prescribed 1D array is created; independently choosing 1D versus 2D representation remains a separate check.
SYL-10.3-01|9618_w22_41_1(b)|partial|ReadFile processes a line-based persistent file; explaining why persistence is needed is not directly assessed here.
SYL-10.4-02|9618_s21_41_1(b)|partial|Node records and pointers implement a linked list in an array; additional stack and queue behaviour are covered by their core operation objectives.
SYL-11.1-01|9618_s21_41_2(a)|partial|The variable array is declared and initialised; no constant declaration is established by this particular task.
SYL-11.1-02|9618_s21_41_3(c)(iii)|direct|The scoring method uses conditions and integer division to return the prescribed result.
SYL-11.1-03|9618_s21_41_2(b)(ii)|direct|The candidate reads a keyboard value and prints the found/not-found result to the console.
SYL-11.1-04|9618_s25_41_2(b)|partial|String parsing and integer conversion support use of built-in operations; the broad ability to choose library routines is not fully assessed.
SYL-11.2-01|9618_s21_41_3(c)(iii)|partial|The scoring bands require multiple conditional branches; the task does not specifically require CASE or every nested-selection form.
SYL-11.2-02|9618_w22_41_1(c)|partial|The count-occurrences routine traverses the fixed-size array; the candidate may choose an equivalent loop form, so a particular count-controlled syntax is not forced.
SYL-11.2-03|9618_s21_41_1(c)(i)|direct|The traversal checks the current link against the end sentinel before processing the next node.
SYL-11.2-04|9618_s21_41_3(c)(iv)|partial|QP p11 requires an answer attempt and repetition until correct. This provides an at-least-once behavioural context, but does not require a specific post-condition syntax or justify loop selection.
SYL-11.3-01|9618_w22_41_1(b)|partial|Defining ReadFile supplies the procedure-definition facet; calling procedures and independent interface design are evidenced separately, not by this part alone.
SYL-11.3-02|9618_w21_41_1(a)|partial|The translated recursive function passes arguments and receives returns; it does not assess contrasting Python caller-visible mutation with value/reference pseudocode semantics.
SYL-11.3-03|9618_s21_41_2(b)(i)|partial|The search function defines a Boolean return; use of that return at the call site is a separate part.
SYL-11.3-03|9618_s21_41_2(b)(ii)|direct|The main program calls linearSearch with the input value and branches on its returned Boolean.
SYL-12.3-05|9618_s21_41_2(b)(iii)|partial|Prescribed found/not-found execution tests provide black-box test evidence only, not a dry run or every testing method.
SYL-12.3-06|9618_s21_41_2(b)(iii)|partial|Executing supplied tests gives results against a provided expectation; independently designing a test plan is not assessed.
SYL-12.3-07|9618_s21_41_2(b)(iii)|partial|Both successful and unsuccessful search cases are prescribed. Choosing one's own normal/abnormal/boundary cases remains an authored check.
SYL-12.3-08|9618_w21_41_1(c)|partial|The existing recursive routine is rewritten iteratively while preserving results; functionality enhancement is not established by this behaviour-preserving rewrite.
SYL-13.2-03|9618_s25_42_2(c)|partial|The candidate implements a supplied arithmetic key-to-address function; this supports hashing but does not by itself assess explanation or persistent-file hashing.
"""
def apply(objectives,byid):
    selected={}
    for line in DATA.strip().splitlines():
        oid,pid,role,reason=line.split('|',3)
        assert pid in byid,(oid,pid)
        selected.setdefault(oid,[]).append((pid,role,reason))
    audit=[]
    for o in objectives:
        for link in o['candidate_pattern_links']:
            link['example_parts']=[]
            link['basis']='Capability-level candidate only. No occurrence is evidence unless explicitly selected by the A3 semantic audit.'
        corpus=[]
        for pid,role,reason in selected.get(o['objective_id'],[]):
            r=byid[pid]
            eligible=[l for l in o['candidate_pattern_links'] if l['pattern_id'] in r['assessed_pattern_ids']]
            # Exact part can cover an objective through an already-written routine call;
            # use its actual assessed MAIN_FLOW only if the objective explicitly includes use.
            if not eligible and o['objective_id'] in ['SYL-10.2-01','SYL-11.3-03']:
                pat=r['primary_pattern_id']
                link={'pattern_id':pat,'role':'partial','basis':'Explicit manually reviewed supporting implementation/use facet.','example_parts':[],'pattern_role_note':'Part-level coverage is stated separately.'}
                o['candidate_pattern_links'].append(link);eligible=[link]
            assert eligible,(o['objective_id'],pid,r['assessed_pattern_ids'])
            link=eligible[0]
            ex={'part_id':pid,'qp_basis':r['qp_basis'],'ms_basis':r['ms_basis'],'coverage_role':role,'reason':reason}
            link['example_parts'].append(ex)
            corpus.append(ex|{'pattern_id':link['pattern_id']})
        o['corpus_evidence']=corpus
        if o['scope']=='excluded':assert not corpus
        elif corpus:
            # A partial-only selection cannot assert full observed capability.
            if all(e['coverage_role']=='partial' for e in corpus):
                o['corpus_coverage']='partial';o['gap']['status']='authored_assessment_needed'
        elif o['corpus_coverage'] in ['observed','partial']:
            o['corpus_coverage']='absent';o['gap']['status']='authored_assessment_needed'
        note=('Explicit exclusion; no corpus evidence claimed.' if o['scope']=='excluded' else ('Manually selected exact-part facet; any incomplete capability is explicitly marked partial.' if corpus else 'No suitable exact-part assessment evidence asserted. Support pattern links retain empty examples and are teaching contexts only.'))
        o['semantic_evidence_review']={'status':'REVIEWED_AFTER_A8','note':note}
        audit.append({'objective_id':o['objective_id'],'capability':o['capability_en'],'scope':o['scope'],'corpus_coverage':o['corpus_coverage'],'selected_parts':[{'part_id':e['part_id'],'coverage_role':e['coverage_role'],'facet_reason':e['reason']} for e in corpus],'decision':note})
    assert set(selected)<={o['objective_id'] for o in objectives}
    return audit

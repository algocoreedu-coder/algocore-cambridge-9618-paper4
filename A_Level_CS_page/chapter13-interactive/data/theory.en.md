# Chapter 13 — Data Representation

## 13.1.1 | Why create a data type?

Goal: Choose a data type that fits the facts you need to store.

A **data type** states which values an item can hold and which operations make sense. INTEGER, REAL, CHAR, STRING, BOOLEAN and DATE are familiar examples. A **user-defined type** gives a new name to a useful set of values or a data structure.

Think of a school record. A name, a phone number and a lesson count belong to one learner. A record makes that link clear. A named type can be reused and can help the program check types. It does not replace input checks: a lesson count may still need a check that it is not negative.

| Type | Main job | Cambridge group |
|---|---|---|
| Enumerated | Choose one named value from a fixed list | Non-composite |
| Pointer | Hold the address of data of a given type | Non-composite |
| Record | Group related fields, which may have different types | Composite |
| Set | Hold unique items of one type, with no order | Composite |
| Class / object | Keep state and methods together | Composite |

**Composite** means that parts are grouped under one name. A pointer refers to another type, but this does not make it composite in this course.

Say it simply: “A new type gives our data a clear meaning.”

## 13.1.2 | Enumerated types

Goal: Define an enum, declare a variable and assign a valid value.

An **enumerated type**, or **enum**, lists all allowed named values in an order.

```text
TYPE TStudyStatus = (Active, Paused, Completed)
DECLARE Status : TStudyStatus
Status ← Active
```

TStudyStatus is a **type**. Status is a **variable**. Active is a **value**. Active is not the string "Active". Use an enum for a study status or a day of the week. A person's name is not a good enum field because the list of names is not fixed.

The list has a declared order and no repeated values. In the book's ordinal example, moving one place after Wednesday gives Thursday:

```text
TYPE TDay = (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
DECLARE Today : TDay
DECLARE Tomorrow : TDay
Today ← Wednesday
Tomorrow ← Today + 1
```

Do not assume that the list wraps by itself. To make Sunday lead to Monday, state the rule:

```text
IF Today = Sunday THEN
   Tomorrow ← Monday
ELSE
   Tomorrow ← Today + 1
ENDIF
```

This is the book's enum order model. A real language may provide a different enum operation. A program also needs its own rule for a change of status; Completed does not automatically become Active.

Exam habit: when asked to define a type, start with TYPE; when asked for a variable, use DECLARE.

## 13.1.3 | Records and fields

Goal: Define a record and use its fields without mixing up type and variable names.

A **record** groups related fields. Each field has a name and a type. Different fields can use different types.

```text
TYPE TStudent
   DECLARE StudentID : STRING
   DECLARE FullName : STRING
   DECLARE Phone : STRING
   DECLARE LessonsAttended : INTEGER
   DECLARE Status : TStudyStatus
ENDTYPE
DECLARE Learner : TStudent
Learner.StudentID ← "AC027"
Learner.FullName ← "Minh"
Learner.Phone ← "0901234567"
Learner.LessonsAttended ← 8
Learner.Status ← Active
OUTPUT Learner.FullName
```

The output is Minh. The dot selects a field: **variable.field**. Do not write TStudent.FullName when you mean a field of Learner.

Phone uses STRING to keep the leading zero and a possible + sign. We do not calculate with it. LessonsAttended is a count, so INTEGER fits. Dates use DATE, true/false values use BOOLEAN and a field with fixed choices can use an enum defined earlier.

One record represents one learner. **ARRAY[1:20] OF TStudent** holds 20 records. An array has items of one type; a record can have fields of different types. To access a field in an array of records, use ClassList[2].FullName.

Exam habit: check TYPE/ENDTYPE, DECLARE, every requested field, field types and exact names.

## 13.1.4 | Pointers

Goal: Tell an address apart from the value stored at that address.

A **pointer** stores a memory address. The data at that address has a given type.

```text
TYPE TIntPointer = ^INTEGER
DECLARE Score : INTEGER
DECLARE ScorePointer : TIntPointer
Score ← 42
ScorePointer ← ^Score
OUTPUT ScorePointer^
```

The output is 42. Read the three uses of ^ with care:

| Form | Meaning |
|---|---|
| ^INTEGER in TYPE | The pointer points to an INTEGER |
| ^Score | Get the address of Score |
| ScorePointer^ | Read the value at the address held by the pointer |

Reading through a pointer is called **dereferencing**. If Score changes to 50, ScorePointer^ now reads 50. The pointer is not a copy of the old value 42.

Set a valid target before reading through a pointer. Only use a numerical address when the question gives one; the addresses in diagrams are examples.

## 13.1.5 | Sets

Goal: Define a set and find its union and intersection.

A **set** holds items of the same type. There are no repeated items and no order.

```text
TYPE TSkillSet = SET OF STRING
DEFINE SkillsA ("Binary", "Files") : TSkillSet
DEFINE SkillsB ("Files", "Records") : TSkillSet
```

- **Intersection** means items in both sets: {Files}.
- **Union** means items in either set: {Binary, Files, Records}.
- **Difference A − B** means items in A but not B: {Binary}.
- Adding Files to SkillsA again does not add a second Files item.

Braces here are mathematical set notation, not a new pseudocode assignment rule. For exam declarations, use TYPE … = SET OF … and the DEFINE form required by the question.

An enum variable chooses **one** allowed value. A set can hold **several** items at once. Use an enum for one current status, and a set for several completed skills. CHAR items use single quotes; STRING items use double quotes.

## 13.1.6 | Classes and objects

Goal: Explain how an object keeps its own state and uses methods.

A record mainly groups data. A **class** also defines methods that work on that data. An **object** is an instance of a class. Each object has its own state.

```text
CLASS TCounter
   PRIVATE Value : INTEGER
   PUBLIC PROCEDURE NEW()
      Value ← 0
   ENDPROCEDURE
   PUBLIC PROCEDURE Increment()
      Value ← Value + 1
   ENDPROCEDURE
   PUBLIC FUNCTION GetValue() RETURNS INTEGER
      RETURN Value
   ENDFUNCTION
ENDCLASS
CounterA ← NEW TCounter()
CounterB ← NEW TCounter()
CounterA.Increment()
OUTPUT CounterA.GetValue()
OUTPUT CounterB.GetValue()
```

The outputs are 1 and 0. NEW sets the starting state. PRIVATE blocks direct access from code outside the class. Public methods provide controlled access. Putting state and methods together, with controlled access, is **encapsulation**; it is not encryption.

Chapter 13 needs simple class choices, definitions and traces. Inheritance and polymorphism are studied in more depth in Further Programming / Unit 20.

## 13.2.1 | File organisation

Goal: Choose how records should be stored for a task.

**Organisation** asks “How are records stored?” **Access** asks “How do we reach a record?” Keep these two questions separate.

| Organisation | Order | Add a record | Useful example |
|---|---|---|---|
| Serial | Order of arrival, not sorted by key | Add to the end (append) | An event log |
| Sequential | In key order | Insert in the right place; the file may need to be rebuilt | Process records in order |
| Random | A location is found from the key, often by a hash | Store at the calculated location; handle a collision | Find or update one record |

Random does not mean choosing a new random place on every search. The same hash rule gives the same starting location for a key.

For a new key 18: a serial file 31,12,25 becomes 31,12,25,18. A sequential file 12,25,31 becomes 12,18,25,31. State the reason for a choice, not just “it is fast”.

## 13.2.2 | File access and hit rate

Goal: Trace a search and explain when direct access helps.

**Sequential access** reads records one after another from the start. Stop when the key is found or the file ends. In a file sorted in ascending key order, also stop when the current key is greater than the target.

To find 20 in 12,18,25,31: read 12, then 18, then 25. Stop: 25 > 20. Do not use this early stop in an unsorted serial file. For descending order, reverse the comparison.

**Direct access** uses a location without reading every earlier record. A sequential file can have an **index** mapping key to address. A random file can use a **hash** to calculate a location. A collision may need extra reads; direct access does not promise exactly one read.

**File-processing hit rate** = records used in a task ÷ total records × 100. This is not cache hit rate.

| Task in a file of 1000 learners | Hit rate | Suitable access |
|---|---|---|
| Process all 1000 records | 100% | Sequential |
| Update 5 phone numbers | 0.5% | Direct, if an index/hash is available |

A high hit rate favours reading continuously. A low hit rate can favour finding selected addresses. Hit rate alone does not decide the file organisation; consider order, updates and available structures too.

## 13.2.3 | Hashing and addresses

Goal: Calculate a hash, then convert a slot into a byte address when asked.

A **hash function** maps a record key to a starting slot. MOD gives a remainder, not a quotient.

```text
Slot ← Key MOD N
Address ← BaseAddress + Slot * RecordSize
```

This formula assumes slots 0 to N−1. If the question numbers slots from 1, follow its rule instead. Base address and record size must use the same address units.

With key 127, 10 slots, base byte 1000 and 20 bytes per record:

```text
127 MOD 10 = 7
Address = 1000 + 7 × 20 = 1140 bytes
```

Slot 7 is not byte address 1140. Only calculate an address if that is requested. For MOD N, check that 0 ≤ result < N.

A simple string hash can add character codes then take MOD N. With A=65 and C=67, AC gives (65+67) MOD 10 = 2. CA also gives 2. Different keys can share a hash value.

## 13.2.4 | Collisions

Goal: Trace both insertion and search after a hash collision.

A **collision** occurs when different keys give the same hash location. With key MOD 5, the keys 12,17,22 all start at slot 2.

**Linear probing:** test the starting slot, then the next slot. Wrap to slot 0 after the last slot. Stop at an empty slot when inserting. After inserting 12,17,22 into an empty five-slot table:

| Slot | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Key | Empty | Empty | 12 | 17 | 22 |

To find 22: hash to 2 → compare 12 with 22 → try 3 → compare 17 → try 4 → match 22. Never use a record just because its hash matches.

**Overflow area:** keep colliding records in a separate area. A search checks the main location and then finds the matching key in the overflow area using the chosen structure. A chain can link records with the same hash.

Use the same hash and collision rule for storing and finding. Never overwrite a different key. Stop after a full loop if the table is full. In an insert-only table, a never-used empty slot means the key is absent. After deletion, special markers may be needed so the search path is not broken.

Some sources use open/closed hashing names differently. Explain the actual mechanism and follow a definition given in the question.

## 13.3.1 | The floating-point model

Goal: Read the mantissa and exponent without using the wrong number model.

**X = M × 2^E**. The **mantissa M** holds the signed value. The **exponent E** scales it by a power of two. Both parts use two's complement in this Cambridge model. The binary point in M is immediately after its leftmost bit.

This is like scientific notation: 4800 = 4.8 × 10^3 separates a value from its scale. Binary floating-point uses powers of 2 instead of powers of 10: 6.5 = 0.8125 × 2^3. The stored mantissa follows the binary point rule below.

Our small examples use 8 bits for M and 4 for E. Always read the actual question: it may use 8+8, 10+6, 12+6, 16+8 or another split. Do not replace this model with IEEE 754 rules.

| M bit | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Weight | −1 | 1/2 | 1/4 | 1/8 | 1/16 | 1/32 | 1/64 | 1/128 |

A four-bit E has weights −8,4,2,1, so −8 ≤ E ≤ 7. A negative E makes the magnitude smaller. It does not make X negative: the sign comes from M.

## 13.3.2 | Decode a floating-point number

Goal: Convert a given M/E pair to denary and show working.

Method: split the fields → calculate M → read E as a signed integer → multiply.

```text
M = 01101000 = 1/2 + 1/4 + 1/16 = 0.8125
E = 0011 = 3
X = 0.8125 × 8 = 6.5

M = 10011000 = -1 + 1/8 + 1/16 = -0.8125
E = 0011 = 3
X = -0.8125 × 8 = -6.5

M = 01010000 = 0.625
E = 1110 = -8 + 4 + 2 = -2
X = 0.625 × 2^-2 = 0.15625
```

**Quick method:** read the mantissa bit string as a signed integer I. With m mantissa bits, M = I / 2^(m−1). Then X = I × 2^(E−(m−1)). Still show I or M and E separately for method marks.

**Binary-point method:** for positive M, move the point right E places for a positive E, or left |E| places for a negative E. 0.1101000₂ with E=3 becomes 0110.1000₂ = 6.5. 0.1010000₂ with E=−2 becomes 0.001010000₂ = 0.15625.

For negative M, take its magnitude with two's complement, move the point, then keep the minus sign. 10110000/1110 gives −0.15625. Special case: M=10000000 means −1, whose positive magnitude does not fit this signed fractional field. Use −1 × 2^E directly.

## 13.3.3 | Encode a denary number

Goal: Build a normalised bit pattern from a number.

For +6.5 in M8/E4:

1. Convert to binary: 110.1₂.
2. Write 0.1101₂ × 2^3.
3. Fill M to eight bits: 01101000.
4. Write E=3 in four-bit two's complement: 0011.
5. Decode to check: 6.5.

For −6.5, invert the positive M and add one. Keep E=3.

```text
01101000 → invert: 10010111 → add 1: 10011000
Answer: 10011000 / 0011
```

Do not just change the sign bit. For 0.15625: 0.00101₂ = 0.101₂ × 2^-2, giving 01010000/1110. For −0.5, check normalisation after making M negative: 11000000/0000 must become 10000000/1111.

**Fraction method:** 6.5=13/2. Divide M by 2 and increase E until M fits the normalised interval: 13/2 at E0 → 13/4 at E1 → 13/8 at E2 → 13/16 at E3. The product stays 6.5. 13/16=0.1101₂. For 5/32, multiply M by 2 twice and reduce E twice: 5/32 → 5/16 → 5/8, with E0 → −1 → −2.

**Make fractional bits:** multiply the remaining fraction by two. Keep the integer part (0 or 1) as the next bit; repeat with the fraction left over.

| Fraction | ×2 | Next bit | Remainder |
|---|---|---|---|
| 0.375 | 0.75 | 0 | 0.75 |
| 0.75 | 1.5 | 1 | 0.5 |
| 0.5 | 1.0 | 1 | 0 |

So 0.375=0.011₂ and 13.375=1101.011₂. With 0.1, remainders repeat: 0.1 → 0.2 → 0.4 → 0.8 → 0.6 → 0.2… . Its binary digits continue forever. Decide which bits fit **after normalising** M. For rounding, inspect the discarded part too.

## 13.3.4 | Normalisation

Goal: Use significant bits well while keeping the same value.

For a non-zero normalised M, the first two bits differ: positive starts **01**, negative starts **10**. 00 or 11 means that redundant sign bits remain.

Shift M left k places, fill the right with zeros, and **decrease E by k**. M grows by 2^k, so 2^E must shrink by 2^k. Check that the new E still fits.

```text
Positive: 00101000 / 0100 → 01010000 / 0011
          0.3125 × 16 = 5 → 0.625 × 8 = 5

Negative: 11101000 / 0101 → 10100000 / 0011
          -0.1875 × 32 = -6 → -0.75 × 8 = -6
```

The negative example shifts M twice, so E falls from 5 to 3. A raw binary fraction is a different starting point: 0.00011₂ = 0.11₂ × 2^-3. Do not assume its E started at the value in a separate M/E question.

Normalisation frees space for useful bits. It cannot restore bits already lost. Zero cannot start 01 or 10, so it needs a separate rule, such as an all-zero mantissa. This does not mean a computer cannot store zero.

## 13.3.5 | Precision, range and limits

Goal: Explain a bit trade-off and find the limits for a stated format.

**Precision** is the detail a value can keep. More mantissa bits give a smaller gap between nearby values at a fixed E. **Range** is the spread of magnitudes. More exponent bits allow larger E and more negative E.

With a fixed total, more bits for one field leave fewer for the other. M12/E4 → M10/E6 reduces precision but increases range. More exponent bits do not make every fraction exact.

For m M bits and e E bits: **Emin = −2^(e−1)** and **Emax = 2^(e−1)−1**.

| Normalised limit | M pattern | E |
|---|---|---|
| Largest positive | 0 then all 1s | Emax |
| Smallest positive | 01 then all 0s | Emin |
| Most negative | 1 then all 0s | Emax |
| Negative nearest zero | 10 then all 1s | Emin |

For M8/E4 these give 127, 1/512, −128 and −65/32768. Positive and negative limits are not exactly symmetric. “Most negative” is different from “negative with the smallest magnitude”. If unnormalised numbers are allowed, the smallest non-zero value can differ.

Largest positive = (1−2^−(m−1)) × 2^Emax. Smallest normalised positive = 0.5 × 2^Emin.

| Format | Value | M | E |
|---|---|---|---|
| 8+8 | 6.5 | 01101000 | 00000011 |
| 12+6 | −8.375 | 101111010000 | 000100 |
| 16+8 | −0.15625 | 1011000000000000 | 11111110 |

For −8.375: 8.375=0.1000011₂×2^4. The positive 12-bit M is 010000110000; invert and add one to get 101111010000. Its signed integer is −1072; −1072/2048×16=−8.375. For the 16+8 example, E=−2 is 11111110, not 00000010. Both M and E are negative, but X is negative only once because 2^-2 is positive.

In M10/E6, Emin=−32 and Emax=31. The four limits are (511/512)×2^31, 2^-33, −2^31 and (−257/512)×2^-32. Knowing only “32-bit word” is not enough: M24/E8 and M16/E16 have different limits.

## 13.3.6 | Approximation and rounding

Goal: Explain why bits are lost and calculate the stored value.

Two common causes of approximation are different:

1. The binary fraction has no end, such as 0.1.
2. The binary fraction ends, but needs more M bits than available.

For 13.375 with six M bits: 13.375=0.1101011₂×2^4. Only five fractional bits fit. **Truncate** to 0.11010₂×16=13.0. **Round to nearest** to 0.11011₂×16=13.5. The absolute errors are 0.375 and 0.125. There is no tie here.

Follow the stated rounding rule. Do not silently round a question that uses truncation. In a selected past-paper example, M8/E8 truncates 113.75 to 113; rounding to nearest would give 114.

For negative numbers, dropping low bits from two's complement is not the same as rounding towards zero. In M10/E6, −5.38 with E3 has exact mantissa integer −344.32. Nearest chooses −344 (M1010101000), storing −5.375. Dropping low bits keeps −345 (M1010100111), storing −5.390625. For +2.88 at E2, nearest chooses 369 (M0101110001), storing 2.8828125; truncation chooses 368, storing 2.875.

**Accumulated error:** in M8/E4, the nearest value to 0.1 is 01100110/1101 = 0.099609375. If only the input is rounded once and sums are then exact:

| Additions | Ideal sum | Sum of rounded inputs | Error |
|---|---|---|---|
| 1 | 0.1 | 0.099609375 | −0.000390625 |
| 2 | 0.2 | 0.19921875 | −0.00078125 |
| 3 | 0.3 | 0.298828125 | −0.001171875 |

Do not claim the last exact sum fits M8/E4. If each addition is rounded again, the third sum is halfway between 0.296875 and 0.30078125. **Ties-to-even** chooses an even mantissa integer, giving 0.296875. Keep these two models separate.

Double and quadruple precision usually offer more bits, but layouts and support depend on the format. They are not automatically the Cambridge two's-complement M/E model. A finite binary format still cannot store 0.1 exactly. Reduce error by choosing enough precision, integer units where suitable, or exact decimal arithmetic when needed. Rounding the displayed text does not remove internal calculation error.

## 13.3.7 | Overflow and underflow

Goal: Link a calculation to the limit it crosses.

**Overflow:** a result is beyond the format's range. In normalised M8/E4, 100×2=200 is larger than the maximum positive value 127.

**Underflow:** a non-zero result is too close to zero for the stated format. (1/512)÷2=1/1024 is below the smallest normalised positive value.

Underflow does not mean “the result is negative”. Overflow does not mean “there was a carry” by itself. Name the calculation, compare the result with the limit, and explain that the valid representation does not fit.

The system may signal an error, use a special value or round according to its rules. Do not claim that every system always returns zero. Division by zero is a separate case, not an ordinary finite result crossing a range limit.

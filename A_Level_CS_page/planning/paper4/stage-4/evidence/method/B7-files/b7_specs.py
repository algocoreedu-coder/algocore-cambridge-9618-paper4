from __future__ import annotations


PATTERNS = ["FILE_READ_ARRAY", "FILE_READ_OBJECTS", "FILE_WRITE"]


def bi(vi, en):
    return {"vi": vi, "en": en}


SPECS = {
    "FILE_READ_ARRAY": {
        "pre": "The source fixes the input filename, record line grouping, field types, destination operation, capacity/count rule, termination and exception/output contract.",
        "repr": "An input-file lifecycle plus a record buffer, converted fields, destination array/record/ADT and committed-record count.",
        "conv": ["open before the first read and close on every required completion path", "group all lines of one record before conversion/commit", "EOF/fixed count and capacity are independent guards", "exception output remains source-bound"],
        "axes": ["line_count", "record_layout", "destination", "error_handling"],
        "decision": bi("Chốt record grammar và termination trước khi đọc; chỉ commit sau khi đủ line, convert đúng type và còn capacity.", "Fix record grammar and termination before reading; commit only after all lines exist, conversions succeed and capacity remains."),
        "inv": "Every committed destination element corresponds to one complete source record in file order, committed_count never exceeds capacity, and no read occurs outside the open-file interval.",
        "steps": [
            ("contract", ("Ghi filename, mode read, số line/record, thứ tự field, type, destination, capacity và success/error output.", "Record filename, read mode, lines per record, field order, types, destination, capacity and success/error output."), ("Những field này quyết định ranh giới record và điều kiện dừng.", "These fields determine record boundaries and termination."), "The record grammar and both EOF/count and capacity guards are explicit before I/O.", "Before opening the file.", "defines_read_contract", ("Dùng một record mẫu để đánh số line và field.", "Number every line and field in one sample record.")),
            ("open", ("Mở đúng input trong exception scope được yêu cầu; chưa đổi destination.", "Open the exact input inside the required exception scope; do not mutate the destination yet."), ("Open failure phải đi tới đúng error output mà không giả có file handle.", "Open failure must reach the exact error output without inventing a file handle."), "Before the first successful open, destination and committed_count retain their entry state.", "At lifecycle entry.", "opens_read_scope", ("Vẽ riêng open-success và open-failure edges.", "Draw separate open-success and open-failure edges.")),
            ("read-commit", ("Khi chưa EOF/fixed-count và còn capacity, đọc đủ group, convert từng field rồi commit một array/record/ADT item và tăng count một.", "While EOF/fixed-count and capacity permit, read the full group, convert each field, then commit one array/record/ADT item and increment count once."), ("Buffer trước commit ngăn half-record và count lệch.", "Buffering before commit prevents half-records and count drift."), "The committed prefix equals complete converted records consumed so far, in source order.", "Only when a complete record and destination space exist.", "advances_records", ("Theo dõi read-line, convert, destination-write và count-delta cho hai record liên tiếp.", "Track read-line, conversion, destination-write and count delta for two consecutive records.")),
            ("close-outcome", ("Đóng file ở vị trí bảo đảm lifecycle; trả/output đúng count hoặc error contract mà không tự thêm message.", "Close the file at the lifecycle-safe point; return/output the exact count or error contract without inventing messages."), ("Close và exception scope là phần của hành vi file, không phải trang trí.", "Close and exception scope are part of file behaviour rather than decoration."), "On exit, the file lifecycle is complete and the result describes exactly the committed records or required failure.", "At EOF/fixed count/capacity stop or handled exception.", "terminates_read_array", ("Audit event order OPEN→READ/CONVERT/COMMIT→CLOSE và mọi failure edge.", "Audit OPEN→READ/CONVERT/COMMIT→CLOSE order and every failure edge.")),
        ],
        "errors": [
            ("partial-record", "Commit field/array element trước khi đọc đủ mọi line của record.", "Committing a field/array element before all lines of the record have been read.", "EOF hoặc conversion lỗi để lại half-record và count sai.", "EOF or conversion failure leaves a half-record and wrong count.", "Dùng input có record cuối thiếu một line; destination và count phải dừng trước record thiếu.", "Use input whose final record lacks one line; destination and count must stop before that incomplete record.", "Buffer toàn bộ record, validate/convert hết rồi mới commit một lần.", "Buffer the whole record, validate/convert it fully, then commit once."),
            ("termination-scope", "Chỉ kiểm EOF mà bỏ capacity/count, hoặc đặt close/exception ngoài lifecycle phù hợp.", "Checking only EOF while ignoring capacity/count, or placing close/exception outside the required lifecycle.", "Có thể ghi quá destination, đọc thiếu/thừa hoặc rò/đóng sai file.", "The method can overrun the destination, under/over-read or mishandle the file lifecycle.", "Trace ba boundary: EOF trước capacity, capacity trước EOF và open failure; ghi state/file-handle tại mỗi exit.", "Trace EOF-before-capacity, capacity-before-EOF and open failure; record state/file-handle at every exit.", "Giữ EOF/count và capacity thành guard riêng, rồi đặt close/output trên mọi exit contract yêu cầu.", "Keep EOF/count and capacity as separate guards, then place close/output on every contract-required exit."),
        ],
        "cases": [("fixed-record-count", "read exactly the source-stated number of complete records"), ("eof-driven", "stop at EOF without committing a partial final record"), ("adt-destination", "call the supplied destination operation once per complete converted record")],
        "visual": ("Một group line trở thành đúng một destination item ở event nào, và guard nào chặn read/commit tiếp theo?", "At which event does one line group become exactly one destination item, and which guard blocks the next read/commit?", ["OPEN_INPUT_FILE", "READ_RECORD_LINE", "COMPLETE_RECORD_BUFFER", "CONVERT_RECORD_FIELD", "CHECK_DESTINATION_CAPACITY", "COMMIT_DESTINATION_ITEM", "CLOSE_INPUT_FILE", "EMIT_READ_ERROR"]),
    },
    "FILE_READ_OBJECTS": {
        "pre": "The source fixes the file record schema, constructor/subclass or lookup-update contract, destination capacity/count, termination and file-error behavior.",
        "repr": "A complete typed record buffer mapped to one object constructor/subclass or to one located existing object, followed by a single object commit/update.",
        "conv": ["construct only after complete typed record parsing", "subclass discriminator selects one source-permitted constructor", "create and update paths have distinct postconditions", "count increases only for created/stored objects"],
        "axes": ["fixed_or_variable_record", "subclass_dispatch", "create_or_update"],
        "decision": bi("Phân loại create, subclass-dispatch hay lookup-update trước; parse đủ typed record rồi mới construct/update và commit.", "Classify create, subclass-dispatch or lookup-update first; parse the complete typed record before constructing/updating and committing."),
        "inv": "Each successful record produces exactly one correctly typed source-permitted object creation or one update to the uniquely matched object; no partial object enters destination state.",
        "steps": [
            ("schema", ("Ghi line grouping, field order/type, discriminator/key, constructor/setter và destination/count contract.", "Record line grouping, field order/type, discriminator/key, constructor/setter and destination/count contract."), ("Object semantics nằm ở mapping field→parameter hoặc key→target.", "Object semantics live in field-to-parameter or key-to-target mapping."), "Every file field has one typed role and one create/update destination.", "Before opening or constructing.", "defines_object_record", ("Lập bảng line→field→type→constructor/setter argument.", "Build a line→field→type→constructor/setter-argument table.")),
            ("open-group", ("Mở input trong exception scope, đọc đủ một record group và dừng sạch tại EOF/fixed count.", "Open input inside the exception scope, read one complete record group and stop cleanly at EOF/fixed count."), ("Object không được tạo từ buffer thiếu field.", "An object must not be created from an incomplete buffer."), "Before construction, the buffer is complete or the operation exits without object mutation.", "At each record boundary.", "collects_object_record", ("Dùng record đủ và record cuối thiếu field để kiểm boundary.", "Use a complete record and a final record missing one field to check the boundary.")),
            ("construct-update", ("Convert field; chọn exact class/constructor hoặc tìm unique object bằng key; sau đó construct/set đúng parameter order.", "Convert fields; select the exact class/constructor or find the unique object by key; then construct/set in the exact parameter order."), ("Sai subtype, key hoặc parameter order tạo object hợp lệ cú pháp nhưng sai nghĩa.", "A wrong subtype, key or parameter order creates syntactically valid but semantically wrong state."), "The candidate object/update matches every typed field and the source create-or-update contract.", "Only after full parse and successful lookup when required.", "builds_object_candidate", ("Dùng các field có giá trị phân biệt và một discriminator/key cho từng route.", "Use distinct field values and one discriminator/key for every route.")),
            ("commit-close", ("Ghi object vào đúng slot hoặc apply đúng một update, tăng count chỉ khi contract nói, rồi close/return/output theo nguồn.", "Store the object in the correct slot or apply one update, advance count only when specified, then close/return/output under the source contract."), ("Construction và destination mutation cần một commit rõ ràng để tránh object mồ côi.", "Construction and destination mutation need one clear commit to avoid orphan objects."), "On exit, committed object/update count equals complete successful records and the file lifecycle is closed as required.", "After successful candidate construction/update or a handled file error.", "terminates_read_objects", ("So before/after destination identity, count, changed fields và file state.", "Compare before/after destination identity, count, changed fields and file state.")),
        ],
        "errors": [
            ("record-desync", "Đọc sai số line/record làm field record sau trượt sang record trước.", "Reading the wrong number of lines per record so a later field shifts into the previous record.", "Constructor nhận đúng type nhưng sai field và mọi record sau lệch ranh giới.", "The constructor receives type-compatible but wrong fields and every later record boundary shifts.", "Gắn record number/field label cho từng line và kiểm cursor trở về field đầu sau mỗi commit.", "Label every line with record number/field name and check the cursor returns to the first field after every commit.", "Dùng fixed-size record buffer và chỉ reset sau successful commit.", "Use a fixed-size record buffer and reset only after successful commit."),
            ("wrong-object-route", "Chọn sai subclass/key hoặc construct object trước khi convert/lookup hoàn tất.", "Selecting the wrong subclass/key or constructing before conversion/lookup completes.", "Sai object được lưu/cập nhật hoặc xuất hiện partial/orphan object.", "The wrong object is stored/updated or a partial/orphan object appears.", "Dùng discriminator/key cases khác nhau và kiểm class/target identity cùng parameter mapping trước commit.", "Use distinct discriminator/key cases and verify class/target identity plus parameter mapping before commit.", "Tách parse→route/lookup→construct/update candidate→commit thành bốn state.", "Separate parse→route/lookup→construct/update candidate→commit into four states."),
        ],
        "cases": [("fixed-object-record", "group fixed lines and construct one object in exact parameter order"), ("subclass-dispatch", "a discriminator selects one permitted subtype"), ("lookup-update", "a record key locates one existing object and changes source-stated fields")],
        "visual": ("Record buffer nào chọn constructor hoặc target object nào, và khi nào object state mới được commit?", "Which constructor or target object does the record buffer select, and when is object state committed?", ["OPEN_OBJECT_FILE", "BUFFER_OBJECT_RECORD", "CONVERT_OBJECT_FIELDS", "SELECT_OBJECT_ROUTE", "CONSTRUCT_OBJECT_CANDIDATE", "LOOKUP_UPDATE_TARGET", "COMMIT_OBJECT_STATE", "CLOSE_OBJECT_FILE"]),
    },
    "FILE_WRITE": {
        "pre": "The source fixes target filename, append/overwrite mode, record count/order/format, physical versus logical order and exception/output behavior.",
        "repr": "An output-file lifecycle plus an ordered stream of formatted record lines derived from source state.",
        "conv": ["append preserves existing content; write/overwrite starts the source-required new output", "field and newline grammar is source-bound", "physical storage rows and logical traversal/order are distinct", "close occurs after the final write or on the required handled path"],
        "axes": ["append_or_write", "provided_or_created_file", "physical_or_logical_order"],
        "decision": bi("Chốt append hay overwrite và physical hay logical order trước khi format bất kỳ dòng nào.", "Fix append versus overwrite and physical versus logical order before formatting any line."),
        "inv": "The emitted suffix contains exactly the source-selected records in required order and format; append preserves the prior prefix, while overwrite obeys the new-file contract.",
        "steps": [
            ("contract", ("Ghi target, mode, record subset/count, order, field separator/newline và error output.", "Record target, mode, record subset/count, order, field separator/newline and error output."), ("Chọn sai mode hoặc order có thể phá dữ liệu dù từng value đúng.", "Wrong mode or order can corrupt data even when each value is correct."), "One explicit output grammar and lifecycle contract exists before opening.", "Before target-file mutation.", "defines_write_contract", ("Viết một expected line và nêu prefix có được giữ hay không.", "Write one expected line and state whether the existing prefix is preserved.")),
            ("open", ("Mở đúng target bằng append hoặc write/overwrite trong exception scope được yêu cầu.", "Open the exact target in append or write/overwrite mode inside the required exception scope."), ("Mode là quyết định state transition của toàn file.", "Mode determines the state transition of the whole file."), "Before the first write, the file has either preserved prior content for append or the source-required fresh-output state.", "At lifecycle entry.", "opens_write_scope", ("So pre-file snapshot với state ngay sau open cho cả hai mode.", "Compare the pre-file snapshot with immediate post-open state for both modes.")),
            ("format-write", ("Duyệt đúng record subset/order, format đủ field và separator/newline, rồi phát đúng một write event mỗi record.", "Traverse the exact record subset/order, format all fields and separators/newline, then emit exactly one write event per record."), ("Format line trước write tách lỗi order khỏi lỗi I/O.", "Formatting a line before writing separates ordering defects from I/O defects."), "After k writes, the emitted suffix equals the first k required formatted records.", "While required records remain.", "advances_output", ("Đếm lines, fields/line và so first/last record với contract.", "Count lines and fields per line and compare the first/last record with the contract.")),
            ("close-outcome", ("Đóng sau final write; trên lỗi, phát đúng message/result trong scope và không tuyên bố phần chưa ghi.", "Close after the final write; on error, emit the exact message/result in scope and do not claim unwritten records."), ("Lifecycle hoàn tất và observable error output đều có thể được chấm.", "Lifecycle completion and observable error output can both be assessed."), "On normal exit the exact record stream is complete; handled failures report only the source-stated outcome and preserve known written-prefix semantics.", "After final record or handled write/open failure.", "terminates_write", ("Audit OPEN→FORMAT→WRITE×N→CLOSE và separate failure edge.", "Audit OPEN→FORMAT→WRITE×N→CLOSE and a separate failure edge.")),
        ],
        "errors": [
            ("wrong-mode", "Dùng overwrite khi phải append hoặc append khi phải tạo output mới.", "Using overwrite when append is required, or append when a new output is required.", "Nội dung cũ bị mất hoặc dữ liệu cũ bị giữ ngoài contract.", "Existing content is lost or stale content remains outside the contract.", "Đặt một prefix sentinel trong pre-file model và dự đoán nó phải còn/mất theo mode.", "Place a sentinel prefix in the pre-file model and predict whether it must remain or disappear under the mode.", "Ghi mode decision cạnh open event và liên kết trực tiếp với append/overwrite postcondition.", "Write the mode decision beside the open event and link it directly to the append/overwrite postcondition."),
            ("format-order", "Ghi thiếu field/newline hoặc nhầm physical row với logical traversal/order.", "Writing a missing field/newline or confusing physical rows with logical traversal/order.", "File có đúng values nhưng sai record boundaries hoặc sequence.", "The file contains the right values with wrong record boundaries or sequence.", "So line-by-line với output grammar, dùng state có physical order khác logical order.", "Compare line by line with the output grammar using state whose physical order differs from logical order.", "Tạo formatted-line candidate đầy đủ rồi write theo iterator/order được source chỉ định.", "Create a complete formatted-line candidate, then write through the source-specified iterator/order."),
        ],
        "cases": [("overwrite-new-file", "new target contains only the required formatted records"), ("append-existing", "existing prefix remains and new records form an exact suffix"), ("physical-tree-rows", "write backing rows as triples when explicitly required, not traversal order")],
        "visual": ("Open mode biến đổi pre-file state thế nào, và mỗi formatted line được commit theo order nào trước close?", "How does open mode transform pre-file state, and in what order is each formatted line committed before close?", ["SELECT_OUTPUT_MODE", "OPEN_OUTPUT_FILE", "SELECT_OUTPUT_RECORD", "FORMAT_OUTPUT_LINE", "WRITE_OUTPUT_LINE", "CLOSE_OUTPUT_FILE", "EMIT_WRITE_ERROR"]),
    },
}


GLOBAL_INV_VI = {
    "FILE_READ_ARRAY": "Mỗi destination item đã commit tương ứng đúng một record nguồn hoàn chỉnh theo file order; count không vượt capacity và không read ngoài khoảng file mở.",
    "FILE_READ_OBJECTS": "Mỗi record thành công tạo đúng một object hợp lệ hoặc cập nhật đúng một target; partial object không vào destination state.",
    "FILE_WRITE": "Output suffix chứa đúng records được chọn theo order/format nguồn; append giữ prefix cũ còn overwrite tuân hợp đồng file mới.",
}


STEP_META_VI = {
    "FILE_READ_ARRAY": [
        ("Record grammar cùng EOF/count và capacity guard phải rõ trước I/O.", "Trước open.", "định nghĩa read contract"),
        ("Trước open thành công đầu tiên, destination và count giữ state đầu.", "Khi bắt đầu lifecycle.", "mở read scope"),
        ("Committed prefix bằng các record hoàn chỉnh đã convert theo source order.", "Chỉ khi đủ record và còn capacity.", "tiến record"),
        ("Khi thoát, lifecycle đóng và result mô tả đúng committed records hoặc failure.", "Tại EOF/count/capacity stop hoặc exception.", "kết thúc read-array"),
    ],
    "FILE_READ_OBJECTS": [
        ("Mỗi field file có một typed role và một create/update destination.", "Trước open/construct.", "định nghĩa object record"),
        ("Trước construction, buffer hoặc complete hoặc thoát mà không mutation object.", "Tại mỗi record boundary.", "thu thập object record"),
        ("Object/update candidate khớp mọi typed field và create/update contract.", "Sau full parse và lookup nếu cần.", "dựng object candidate"),
        ("Committed count bằng successful complete records và lifecycle được close đúng contract.", "Sau commit hoặc handled file error.", "kết thúc read-objects"),
    ],
    "FILE_WRITE": [
        ("Output grammar và lifecycle contract duy nhất phải rõ trước open.", "Trước mutation target.", "định nghĩa write contract"),
        ("Ngay sau open, prior content được giữ cho append hoặc reset theo new-output contract.", "Khi bắt đầu lifecycle.", "mở write scope"),
        ("Sau k writes, emitted suffix bằng k formatted records đầu theo yêu cầu.", "Khi còn required records.", "tiến output"),
        ("Normal exit có stream hoàn chỉnh; failure chỉ báo outcome nguồn và written-prefix đã biết.", "Sau final record hoặc handled failure.", "kết thúc write"),
    ],
}


VISUAL_CASES = {
    "FILE_READ_ARRAY": {
        "normal": bi("File gồm hai record, mỗi record hai line name/score: mỗi cặp phải tạo READ×2→CONVERT→COMMIT, count đi 0→1→2 rồi CLOSE.", "Use a file with two two-line name/score records: each pair must produce READ×2→CONVERT→COMMIT, count moves 0→1→2, then CLOSE."),
        "boundary": bi("So EOF sau một record rưỡi, capacity đầy trước EOF và open failure; không path nào commit half-record hoặc vượt capacity, và error output đúng contract.", "Compare EOF after one-and-a-half records, capacity full before EOF and open failure; no path commits a half-record or exceeds capacity, and error output follows the contract."),
    },
    "FILE_READ_OBJECTS": {
        "normal": bi("Một record bốn field description/width/height/colour phải buffer đủ, convert hai số, construct đúng parameter order và commit một object/count.", "A four-field description/width/height/colour record must buffer fully, convert two numbers, construct in exact parameter order and commit one object/count."),
        "boundary": bi("Đối chiếu record subtype khác, lookup key không tồn tại và final record thiếu field; route/lookup phải rõ và không case thất bại nào tạo partial object.", "Contrast a different subtype record, a missing lookup key and a final record missing one field; route/lookup must be explicit and no failure creates a partial object."),
    },
    "FILE_WRITE": {
        "normal": bi("Ghi ba record name/score vào output mới: mỗi record tạo một formatted line theo order, WRITE×3 rồi CLOSE; file cuối chỉ có ba record mới.", "Write three name/score records to a new output: each forms one ordered line, WRITE×3 then CLOSE; the final file contains only the three new records."),
        "boundary": bi("Với pre-file có prefix sentinel, append phải giữ prefix còn overwrite phải bỏ; physical tree rows phải ra triples theo row dù inorder khác.", "With a pre-file sentinel prefix, append must preserve it while overwrite removes it; physical tree rows must emit row triples even when inorder differs."),
    },
}

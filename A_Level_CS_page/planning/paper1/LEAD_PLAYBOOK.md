# Playbook điều phối — A0 Lead, AlgoCore Paper 1

Phiên bản 1.0 — 19/09/2026. Đây là hướng dẫn vận hành; việc soạn playbook chưa khởi chạy các agent.

Kế hoạch chuyên môn: [AGENT_TEAM_PLAN.md](AGENT_TEAM_PLAN.md). Lệnh khởi động: [LEAD_START_PROMPT.md](LEAD_START_PROMPT.md). Giao việc đợt đầu: [STAGE0_WORK_ORDERS.md](STAGE0_WORK_ORDERS.md).

## 1. Sứ mệnh và quyền quyết định của Lead

A0 chịu trách nhiệm biến nguồn sách/đề thành khóa ôn Cambridge 9618 Paper 1 năm 2026, đầy đủ VI/EN, theo learning page AlgoCore trong `algocore-fumadocs`. Lead điều phối đến đầu ra đã được người dùng giao, đọc sản phẩm thật, xử lý dependency và đóng gate bằng bằng chứng.

Lead được quyết định cách chia lô, phân công, thứ tự triển khai, cấu trúc file và các lựa chọn kỹ thuật có thể đảo ngược trong phạm vi đã giao. Không cần hỏi lại năm thi, ngôn ngữ hoặc xin duyệt mỗi gate nội bộ. Gate là bước kiểm duyệt chất lượng, không phải mặc định một điểm chờ người dùng.

Chỉ hỏi khi có quyết định sản phẩm thực sự chưa biết mà không thể suy ra, cần mở rộng phạm vi đáng kể hoặc hành động cần quyền ngoài phạm vi đã giao. Trong khi chờ, tiếp tục các gói độc lập. Nếu người dùng chỉ giao Stage 0, hoàn thành Stage 0 rồi báo cáo, không tự triển khai toàn khóa.

Không giao một worker làm toàn chương trình. Không coi báo cáo “done” của worker là nghiệm thu. Không đổi năm, rút gọn một ngôn ngữ, bỏ objective hoặc giảm chất lượng để đạt số bài. Phát hành ra bên ngoài là trạng thái riêng với hoàn thành bản tích hợp tại máy.

## 2. Các vai trò Lead điều khiển

| Vai trò | Lead giao việc khi nào | Lead cần nhận lại |
|---|---|---|
| A1 Learning Page Architect | Khóa chuẩn; pilot; khi schema/block cần thay đổi | Audit, contract, schema proposal, quyết định UX có căn cứ |
| A2 Source Curator | Baseline; extraction; khi nguồn có vấn đề | Manifest, locator, index, extraction QA, danh sách thiếu |
| A3 Syllabus & Coursebook Specialist | Scope; coverage; outline; kiểm kiến thức | Objective map, prerequisites, book mapping, academic findings |
| A4 Exam Analyst | Nguồn QP/MS đủ xác minh; kiểm lời giải/rubric | Taxonomy, marking map, exam review, blueprint ôn tập |
| A5 Instructional Author | Outline và nguồn của bài đã đạt | Bản thảo, ví dụ, bài luyện, lời giải, source map |
| A6 VI/EN Editor | Bản nội dung gốc đã ổn định và qua kiểm học thuật | Hai bản VI/EN đầy đủ, glossary đề nghị, parity report |
| A7 Visual Designer | Nội dung và dữ kiện ví dụ đã duyệt | Storyboard, assets/state model, captions/alt VI/EN, kiểm chứng |
| A8 Integration Engineer | Pilot content đủ ổn định; từng lô đã đạt content gate | Trang chạy được, route/component map, build/typecheck evidence |
| A9 Independent Reviewer | Có gói hoàn chỉnh đúng version để review | Finding có locator và tiêu chí; PASS hoặc CHANGES_REQUIRED |

Role ID là vai trò chuyên môn, không phải định danh một tiến trình tồn tại vĩnh viễn. Lead ghi rõ agent thực thi nào giữ vai trò nào ở từng work order. Không tái sử dụng tác giả làm reviewer độc lập cho chính artifact đó, kể cả đổi tên vai trò.

## 3. Giới hạn đồng thời và vòng điều phối

Mặc định A0 + tối đa 3 worker đang chạy. Nếu môi trường ít slot hơn, giữ dependency và chạy ít worker hơn; không bỏ review. Mỗi lần chỉ giao gói có phạm vi rõ và có ích độc lập với phần Lead đang làm. Worker không tự sinh thêm agent; đề nghị Lead cấp gói mới để kiểm soát slot và quyền ghi.

Vòng điều phối:

1. Đọc bảng việc, dependency, issues và phiên bản đầu vào.
2. Chọn tối đa ba gói READY có quyền ghi không chồng nhau. Ưu tiên việc gỡ chặn nhiều gói nhất, reviewer cho hàng đợi đã đầy và lỗi chặn nghiệm thu.
3. Gửi work order đầy đủ; yêu cầu worker xác nhận phạm vi/đầu ra hoặc báo thiếu ngay.
4. Lead làm phần riêng: tổng hợp cấu hình, chuẩn bị checklist, đọc nguồn được tranh luận hoặc rà artifact đã nộp. Không cùng sửa file của worker.
5. Khi có bàn giao, mở file kiểm tra, đối chiếu manifest và giữ SUBMITTED trong hàng đợi review nếu đủ; thiếu thì trả về REWORK. Chuyển IN_REVIEW khi reviewer nhận gói.
6. Giao reviewer độc lập đúng artifact version; xử lý finding → sửa → retest.
7. Cập nhật gate, giải phóng quyền ghi và giao gói tiếp theo. Thông báo người dùng khi có kết quả hoặc quyết định có ý nghĩa.

Không giữ cả ba slot cho authoring trong khi review tồn đọng. Giới hạn khởi đầu: tối đa ba gói đã nộp nhưng chưa review; khi chạm mức này, ưu tiên reviewer và sửa lỗi trước khi mở thêm bản thảo. Sau pilot có thể điều chỉnh bằng số liệu rework, không lấy tốc độ sinh văn bản làm thước đo chất lượng.

## 4. Bảng điều phối và trạng thái

Khi bắt đầu thực thi, A0 tạo `OPERATIONS_BOARD.md`, `DECISIONS.md`, `ISSUES.md` trong `planning/paper1/`; các file này không được giả lập là đã hoàn thành trong task planning.

Mỗi dòng bảng việc cần:

```text
task_id | stage | package_id | role | assignee | state | dependency_ids
input_versions | allowed_write_paths | output_manifest | reviewer
open_issue_ids | next_action | updated_at
```

Trạng thái của gói việc:

```text
PLANNED → READY → RUNNING → SUBMITTED → IN_REVIEW → ACCEPTED
                                ↑          ↓
                                └─ REWORK ─┘
WAITING_DEPENDENCY: thiếu đầu vào cụ thể; ghi owner và hành động gỡ chặn.
CANCELLED: Lead hủy gói vì thay scope; giữ lý do và artifact đã có.
```

`SUBMITTED` chỉ là worker đã nộp, `ACCEPTED` chỉ áp dụng artifact version đã được review. Gate stage dùng `NOT_STARTED / IN_PROGRESS / CHANGES_REQUIRED / PASS`. Gói đang chờ nguồn không khiến cả chương trình dừng nếu còn việc độc lập.

## 5. Lịch giao việc theo stage

| Stage | Đợt worker và dependency | Lead làm song song | Gate do Lead đóng |
|---|---|---|---|
| 0 Khóa chuẩn | A1/A2/A3 độc lập → A0 tổng hợp → A9 review toàn bộ | Tạo bảng việc, cấu hình đã xác nhận, kiểm các kết luận xung đột | Chuẩn, scope và baseline rõ; độc lập review xong; không giả vờ đã audit toàn corpus |
| 1 Chuẩn hóa nguồn | A2 xử lý từng lô năm → A4 kiểm QP/MS và A3 kiểm sách theo gói đã có → A9 review | Quản manifest/version; chọn và bảo vệ holdout nếu cần; ưu tiên gỡ lỗi extraction | Nguồn đủ locator và trạng thái; dữ liệu cần dùng đã so bản gốc; lỗi ảnh hưởng đã đóng |
| 2 Coverage và dạng thi | A3 objective/book map + A4 pattern/marking catalog; A6 có thể làm glossary từ thuật ngữ đã duyệt → A9 | Kiểm mọi objective có nơi dạy/đánh giá; duyệt outline và ranh giới bài | Coverage và taxonomy có evidence; không dùng tần suất để bỏ nội dung ít xuất hiện |
| 3 Pilot nội dung | A5 soạn từng pilot → A3/A4 review học thuật → A6 và A7 làm trên bản đã duyệt → A9 | Khóa schema logic với A1, kiểm khả năng tái dùng cho ba kiểu bài | Ba pilot đủ nội dung, nguồn, lời giải, song ngữ và thiết kế hình |
| 4 Pilot UI | A8 tích hợp; A7 hỗ trợ asset riêng; A1 review trải nghiệm → A9 kiểm browser | Đọc trải nghiệm như học viên, chốt quyết định renderer/schema | Build/typecheck và hành vi học đạt; không còn lỗi nghiêm trọng |
| 5 Nhân rộng | Lặp pipeline theo lesson/package; tối đa ba worker các pha khác nhau | Cân bằng review/authoring, cập nhật coverage, quản thay đổi dùng chung | Mỗi lô đạt content + VI/EN + UI; không chỉ đếm trang |
| 6 Ôn tổng hợp | A4 blueprint → A5 bộ ôn/thi thử → A6 song ngữ → A9 review; A8 tích hợp sau đạt | Kiểm độ phủ, độ khó dự kiến, vai trò holdout và lộ trình ôn | Điểm/lời giải đúng; nội dung đánh giá và nội dung luyện được phân biệt |
| 7 Nghiệm thu khóa | A9 audit cuối; A8/A5/A6 sửa theo finding, đúng owner → A9 retest | Đối chiếu phạm vi đã giao, lập manifest bản nghiệm thu và báo cáo | Mọi yêu cầu bắt buộc đạt, issues chặn đã đóng; trạng thái phát hành minh bạch |

Hàng có nhiều vai trò là chuỗi đợt, không chỉ thị chạy tất cả cùng lúc. Việc chuẩn bị độc lập có thể thực hiện sớm, nhưng không dùng artifact chưa đạt để tuyên bố một stage downstream đã PASS.

## 6. Pipeline cụ thể cho một lesson

1. A3/A4 cung cấp **source packet**: objective, tiên quyết, sách, câu/ý QP/MS, dạng, marking points và hạn chế sử dụng.
2. A5 nộp **outline**: mục tiêu → block → ví dụ → bài tập → cách đánh giá. Lead kiểm contract; A3/A4 kiểm phạm vi và yêu cầu đề.
3. A5 viết **bản gốc đầy đủ** theo outline. Mặc định tiếng Anh để bám thuật ngữ câu thi; đây là thứ tự biên soạn, cả EN và VI vẫn là đầu ra bắt buộc.
4. A3/A4 kiểm kiến thức và lời giải; A5 sửa. Sau khi đạt, Lead đóng băng version nội dung cho hai nhánh A6/A7.
5. A6 hoàn thiện hai ngôn ngữ; A7 làm storyboard/asset. Hai nhánh dùng cùng dữ kiện, block IDs, đáp án và glossary; không sửa bản gốc dùng chung đồng thời.
6. A9 review gói nội dung + VI/EN + visual. A0 chỉ chuyển A8 khi đủ đầu vào của gói.
7. A8 render đúng nội dung đã duyệt. A9 kiểm trên UI: route, locale, đáp án, hình, link và thao tác học; lỗi quay đúng owner.
8. A0 đánh dấu lesson ACCEPTED và nối coverage matrix. Ghi version chính xác của nội dung, asset và app đã kiểm.

Ba pilot đã chọn: dung lượng ảnh/âm thanh; fetch–decode–execute; validation/verification. A3/A4 xác nhận objective và câu cụ thể trước khi dùng. Sau pilot, chia lô theo chủ đề và prerequisite đã duyệt; không tự đặt quota số trang cho một chương.

## 7. Quyền ghi và quản lý phiên bản

- A0 sở hữu hồ sơ điều phối, cấu hình đã khóa và quyết định gate. A1/A2/A3 nộp đề xuất trong vùng riêng; A0 tích hợp, không cho cùng ghi vào contract.
- A2 sở hữu source manifest/index. Nguồn PDF gốc chỉ đọc; extraction và metadata ghi riêng, không sửa đè nguồn.
- A5 sở hữu bản thảo; A6 sở hữu bản localized sau handoff; A7 sở hữu asset/storyboard. Work order phải nêu file cụ thể, không cấp quyền mơ hồ “sửa mọi thứ trong project”.
- A8 là owner app/routes/components dùng chung. A7 chỉ ghi các asset path được cấp; người khác gửi finding hoặc patch đề nghị cho A8.
- A9 ghi review riêng, không âm thầm sửa artifact đang review. Chỉ định rõ `reviewed_version` và hash/revision khi khả dụng.
- Đổi dữ kiện, lời giải, marking point hoặc objective làm mất hiệu lực review phần bị ảnh hưởng. A0 đánh dấu STALE trong manifest rồi giao retest; không giữ PASS của version trước.
- Khi giao lại owner, xác nhận worker cũ đã dừng ghi và snapshot đã lưu. Khi có chỉnh sửa ngoài dự kiến từ người dùng/agent khác, đọc diff và bảo toàn, không rollback hàng loạt.

## 8. Mẫu work order và bàn giao

```text
TASK: P1-S<stage>-<role>-<number>
ROLE / OWNER:
OUTCOME: một đầu ra cụ thể, có thể kiểm tra.
INPUTS: đường dẫn tuyệt đối + ID/version + trạng thái nguồn.
DEPENDENCIES: gói bắt buộc đạt; phần độc lập có thể làm ngay.
READ SCOPE:
WRITE ALLOWLIST: file/thư mục thuộc riêng gói; liệt kê shared files bị cấm sửa.
DELIVERABLES: artifact, source/evidence manifest, issues, self-review.
ACCEPTANCE: checklist theo nội dung thật, không chỉ kiểm file tồn tại.
REVIEWER: người khác với tác giả gói.
STOP CONDITION: khi nộp đủ gói; không tự chuyển stage hoặc sinh thêm worker.
RETURN: trạng thái, file paths, version, checks, findings, next dependency.
```

Khi nhận bàn giao, A0 phải kiểm: file có thật và đọc được; nội dung trả lời đúng work order; locator dẫn đúng nguồn; checks có kết quả thực; unresolved không bị che bởi lời “hoàn tất”; version khớp. Với tài liệu dài, reviewer kiểm toàn bộ phần quyết định chất lượng; spot-check của Lead không thay review chuyên môn.

## 9. Review và sửa lỗi

| Mức | Ví dụ | Xử lý |
|---|---|---|
| Critical | Sai phạm vi thi; đáp án/điểm sai; mất dữ kiện khiến học viên học sai | Chặn nghiệm thu bài và mọi artifact phụ thuộc; quay owner nguồn/học thuật, sửa rồi review lại |
| Major | Thiếu một block bắt buộc hoặc một ngôn ngữ; mô phỏng sai; route không dùng được | Chặn nghiệm thu gói bị ảnh hưởng; không đánh dấu hoàn thành bằng lời hứa |
| Minor | Chính tả/spacing không làm sai ý hoặc cản việc học | Ghi owner; sửa và retest; chỉ defer nếu không vi phạm DoD, A0 ghi lý do và tác động |

Mỗi finding: `id, artifact/version, locator, expected, observed, evidence, severity, owner, fix_version, retest_result`.

Ví dụ: A9 thấy lời giải dùng byte thay bit → A5 sửa phép tính; A3/A4 kiểm độc lập; A6 cập nhật cả VI/EN; A7/A8 cập nhật figure/UI có số liệu đó; A9 retest tất cả nơi ảnh hưởng. Không chỉ sửa câu bị comment rồi giữ hình cũ.

Sau hai vòng sửa cùng finding chưa đạt, Lead yêu cầu tái hiện nhỏ, đọc nguồn gốc, mời vai trò chuyên môn kiểm chéo và chia gói nhỏ hơn. Không tiếp tục gửi cùng một prompt “hãy sửa cho đúng”. Đây là trigger điều tra, không phải lý do tự động hỏi người dùng.

Khi hai agent bất đồng, yêu cầu cả hai nộp source locator và lập luận. A3 xử lý phạm vi/kiến thức; A4 xử lý diễn giải QP/MS; A1 xử lý learning contract; A8 xử lý kỹ thuật. A0 ghi quyết định và căn cứ; không lấy đa số phiếu thay bằng chứng. Nếu nguồn chưa đủ, cách ly claim chưa xác minh và tiếp tục phần độc lập.

## 10. Quy tắc đóng gate

A9 trả kết quả review; A0 chịu trách nhiệm quyết định gate. Gate report phải có: scope được kiểm; danh sách artifact/version; checks và evidence; findings đã đóng/còn mở; ảnh hưởng của ngoại lệ; PASS hoặc CHANGES_REQUIRED; các work order được mở tiếp.

Chỉ PASS khi: đủ đầu ra bắt buộc; nguồn và kết luận truy được; không còn Critical/Major; mọi yêu cầu DoD bắt buộc đạt; người review độc lập với tác giả gói. Review Stage 0 phải bao gồm cả tài liệu tổng hợp do A0 viết.

Nếu A9 chưa có slot hoặc chưa review, giữ IN_PROGRESS. Không để tác giả tự ký thay. Lỗi nhỏ chỉ được defer với trách nhiệm rõ và không làm thiếu yêu cầu bắt buộc; không dùng “PASS có điều kiện” để vượt lỗi chặn.

### Checkpoint bắt buộc với người dùng sau mỗi stage

Sau khi A0 đã đọc review độc lập và quyết định stage là `PASS` hoặc `CHANGES_REQUIRED`, A0 phải dừng toàn bộ worker/reviewer của stage, cập nhật board/resume/issues và đặt trạng thái `WAITING_FOR_USER_STAGE_CHECK`. Báo cáo phải có gate evidence, exact artifact versions/hashes, kiểm chứng đã chạy, giới hạn và việc còn mở. A0 không chuẩn bị, dispatch hoặc thực thi stage kế tiếp trong cùng lượt. Chỉ tiếp tục khi người dùng đã kiểm tra và đưa chỉ dẫn mới; một stage `PASS` không tự động cấp quyền chạy stage sau.

## 11. Báo cáo tiến độ và khôi phục khi ngắt quãng

Báo cáo người dùng ngắn, theo kết quả: stage hiện tại; artifact vừa đạt; vấn đề ảnh hưởng; hành động tiếp theo. Không gửi danh sách agent “đang suy nghĩ” hoặc tuyên bố phần trăm thiếu mẫu số.

Các số liệu hữu ích: nguồn đã xác minh/tổng nguồn đã chọn; objective có lesson và assessment đạt/tổng objective trong scope; lesson ACCEPTED theo cả VI/EN; số Critical/Major còn mở; số gói chờ review. Đếm verified, drafted và accepted riêng.

Sau mỗi handoff/gate, A0 cập nhật `RESUME_STATE.md`: cấu hình, stage, work orders đang chạy, agent owner, file locks, artifact versions, vấn đề mở và ba hành động tiếp theo. Trước khi giao việc sau gián đoạn, đọc file này và kiểm trạng thái worker thực; không suy rằng agent đã dừng hoặc làm lại artifact đã đạt.

## 12. Checklist khởi động của A0

1. Đọc kế hoạch, playbook, chỉ dẫn áp dụng trong workspace; xác định phạm vi người dùng giao lần này.
2. Kiểm tra hiện trạng và thay đổi chưa commit; bảo toàn công việc đang có. Tìm hồ sơ triển khai đã tồn tại trước khi tạo mới.
3. Tạo/cập nhật bảng việc và cấu hình 2026/VI+EN; đặt gates chưa thực hiện là NOT_STARTED.
4. Giao ba work order S0-A1/S0-A2/S0-A3 trong file đợt đầu; A0 làm S0-A0 song song.
5. Nhận và đọc từng gói; tích hợp baseline/contract/scope, giải quyết mâu thuẫn.
6. Giao S0-A9 review độc lập cả evidence và bộ tài liệu Lead tích hợp.
7. Sửa và retest; đóng Stage 0 theo bằng chứng. Tiếp tục Stage 1 nếu nằm trong phạm vi thực thi người dùng đã giao.

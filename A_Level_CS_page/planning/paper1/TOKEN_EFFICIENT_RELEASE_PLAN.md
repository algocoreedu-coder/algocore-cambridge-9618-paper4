# Lộ trình tiết kiệm token để hoàn thiện Paper 1

Ngày: 23/09/2026. Owner: A0 Lead. Trạng thái: **Stage 2 PASS — `WAITING_FOR_USER_STAGE_CHECK`**.

Mục tiêu của kế hoạch này là hoàn thiện khóa Cambridge 9618 Paper 1 năm 2026, đầy đủ VI/EN và đúng learning-page contract, đồng thời chỉ dùng Codex cho công việc cần truy cập workspace, nguồn gốc, code, kiểm chứng hoặc quyết định gate. ChatGPT Web có thể làm bản nháp cho các công việc biên tập đơn giản.

Kế hoạch này không khởi động Stage 3.

## 1. Nguyên tắc tiết kiệm token

1. Không audit lại Stage 0–2 nếu không có hash drift hoặc lỗi nguồn cụ thể.
2. A0 đọc `CURRENT_STATE`/gate decision và exact inputs của gói; không nạp toàn bộ lịch sử evidence cho mọi agent.
3. Agent mới dùng `fork_turns=none` và nhận một work order ngắn, có danh sách file chính xác.
4. Mặc định tối đa hai worker ngoài A0. Chỉ dùng slot thứ ba khi hai gói thực sự độc lập và cùng nằm trên critical path.
5. Một tác giả và một reviewer độc lập cho mỗi batch. Không chạy hai reviewer trùng phạm vi nếu reviewer đầu không tìm thấy lỗi hoặc không có yêu cầu chuyên môn khác biệt.
6. Máy kiểm việc xác định được bằng code: IDs, schema, parity fields, links, duplicate, coverage, build, typecheck và hashes. LLM chỉ kiểm phần ngữ nghĩa.
7. Chỉ hash toàn bộ ở input freeze và final gate. Handoff giữa các vòng dùng delta manifest cho file thay đổi.
8. Gộp review theo batch/domain; không tạo một agent hoặc một bộ hồ sơ cho từng lesson nhỏ.
9. Chỉ retest finding và vùng phụ thuộc. Không chạy lại review đã PASS khi protected fields không đổi và A0 có machine proof.
10. Mỗi stage chỉ giữ bộ hồ sơ tối thiểu: plan/work orders, current status, machine checks, reviewer handoff và gate decision.
11. Sau mỗi stage, A0 dừng ở `WAITING_FOR_USER_STAGE_CHECK`. Không dùng token chuẩn bị stage sau trước khi người dùng duyệt.

## 2. Phân việc giữa ChatGPT Web và Codex

### ChatGPT Web phù hợp

- Viết bản nháp giải thích khái niệm từ brief đã được A0 cung cấp.
- Dịch nháp VI↔EN khi IDs, thuật ngữ và dữ kiện đã khóa.
- Sửa ngữ pháp, rút gọn câu, thống nhất tone.
- Đề xuất caption, alt text, recap, flashcards và câu hỏi retrieval không tính điểm.
- Tạo biến thể luyện tập đơn giản từ một template AlgoCore đã có đáp án/rubric.
- Viết microcopy UI, hướng dẫn học và phần giới thiệu.

Mọi đầu ra Web có trạng thái `DRAFT_UNVERIFIED`; Web không được tự tuyên bố source-verified hoặc PASS.

### Codex bắt buộc

- Đọc PDF/syllabus/QP/MS/coursebook và giữ locator.
- Quyết định scope, marking point, đáp án, marks, adapted/original status.
- Kiểm công thức, trace, logic, calculation và rubric.
- Gắn output vào 99 learning units/205 requirements/893 assessment units.
- Sửa file trong repo, tạo registry/routes/components/assets.
- Chạy validator, typecheck, build và browser QA.
- Kiểm parity theo ID/version, source closure và coverage.
- Independent review, A0 gate và release manifest.
- Deploy/publish và production smoke test.

### Giao thức đưa draft Web vào repo

1. Codex tạo một `WEB_DRAFT_PACKET.md` ngắn cho batch, chỉ chứa brief, glossary, dữ kiện, IDs và format output cần thiết.
2. Người dùng đưa packet đó sang ChatGPT Web.
3. Kết quả Web được đặt trong `incoming/web-drafts/<batch-id>/` hoặc gửi lại trong chat.
4. Codex chạy schema/ID checks, đối chiếu dữ kiện và chuyển phần đạt sang candidate version.
5. Reviewer độc lập duyệt phần học thuật/parity có rủi ro. Draft Web không phải bằng chứng review.

Không đưa toàn bộ corpus hoặc lịch sử agent sang Web. Mỗi packet chỉ phục vụ một batch.

## 3. Lộ trình còn lại

Vẫn giữ năm stage sản phẩm để không hạ gate chất lượng. Cách thực hiện được rút gọn như sau.

| Stage | Việc làm bằng ChatGPT Web | Việc làm bằng Codex | Agent tối đa | Kết quả |
|---|---|---|---:|---|
| **3 — Ba pilot nội dung** | Draft giải thích, dịch nháp, recap/alt text | Khóa schema; tạo source packets; kiểm đáp án/marks; tích hợp ba pilot; một review học thuật/parity; final gate | 2 | Ba package VI/EN accepted, chưa sửa app |
| **4 — Pilot UI** | Microcopy và thông báo VI/EN | A8 làm pipeline/routes/components; A1 hoặc A9 review UI; typecheck/build/browser QA | 2 | Ba pilot chạy thật và schema app ổn định |
| **5 — Sản xuất toàn khóa** | Draft lesson/translation theo packet từng domain | Import/validate; kiểm high-risk content; tích hợp app; batch reviewer; coverage gate | 2, tối đa 3 khi cần | 205/205 requirements có content và assessment accepted |
| **6 — Ôn tổng hợp/thi thử** | Draft revision notes và câu retrieval | Blueprint, mock questions/solutions, marking, controlled-use rules, integration và review | 2 | Revision routes, diagnostic, mixed practice và mocks accepted |
| **7 — Final acceptance** | Chỉ sửa copy nhỏ nếu có | Một consolidated audit: academic/parity/source/UI/a11y/build/links; release manifest | 1 reviewer + A0 | Exact release candidate frozen |
| **Release Gate** | Không dùng | Deploy exact candidate, production smoke, version/hash/rollback và publish decision | A8 + A0 | Production release |

Kết luận về số bước không đổi:

- Còn **5 stage** để release-ready.
- Còn **6 checkpoint** nếu tính cả production Release Gate.

## 4. Stage 3 bản tối giản

Stage 3 chỉ cần bốn tài liệu điều phối, thay vì một cây evidence lớn:

1. `STAGE3_PLAN.md`: phạm vi, ba pilot, dependency và gate.
2. `WORK_ORDERS.md`: work order tác giả và reviewer.
3. `CURRENT_STATE.md`: trạng thái ngắn, exact accepted version và việc kế tiếp.
4. `GATE_DECISION.json`: quyết định cuối cùng của A0.

Artifact nội dung nằm trong ba thư mục pilot; machine checks và reviewer handoff nằm cạnh candidate đang kiểm.

### Vòng thực thi

- **S3-C0:** A0 tạo ba source packets từ Stage 2 và validator schema/parity.
- **S3-C1:** một content owner tạo ba canonical outlines/solutions; draft Web có thể bổ sung diễn giải và dịch.
- **S3-C2:** bilingual/visual owner hoàn thiện VI/EN và storyboard sau khi canonical facts đã khóa.
- **S3-C3:** một reviewer độc lập kiểm 100% đáp án, marks, source mapping và parity bắt buộc.
- **S3-C4:** tác giả sửa findings; reviewer retest đúng vùng đổi; A0 chạy final validator và quyết định gate.
- **Stop:** `WAITING_FOR_USER_STAGE_CHECK`.

Không cần ba author agent riêng cho ba pilot. Một owner giúp giữ schema/tone nhất quán và giảm lặp context; ba pilot vẫn có thể được chia thành ba candidate file độc lập.

## 5. Stage 5 bản tiết kiệm

Stage 5 là phần tiêu tốn nhiều nhất. Chia thành batch theo domain và prerequisite topology, không theo từng lesson:

- Mỗi batch có một compact source packet từ accepted Stage 2 data.
- Web tạo draft cho phần giải thích/dịch đơn giản.
- Codex kiểm và tích hợp theo IDs.
- Machine checks chạy 100% trên schema, IDs, coverage, parity presence, source references và links.
- Reviewer kiểm theo rủi ro, không đọc lại mọi boilerplate giống nhau.

### Mức review

| Risk | Ví dụ | Review |
|---|---|---|
| High | Đáp án, calculation, logic/trace, marking point, adapted/original question, official-source claim | 100% independent semantic review |
| Medium | Giải thích khái niệm, worked example không có marks, VI/EN semantic parity | 100% machine checks + reviewer kiểm các đoạn mới/khác template và sample mỗi batch |
| Low | Navigation copy, headings, recap wording, repeated component labels | Machine checks + batch spot check |

Nếu sample Medium/Low phát hiện lỗi hệ thống, mở rộng review cho toàn batch. Cách này giữ chất lượng ở phần ảnh hưởng kết quả học/điểm và giảm token ở boilerplate.

### Gate theo domain

Một domain chỉ PASS khi:

- Mọi requirement của domain có teaching và assessment destination thực.
- High-risk content đã review 100%.
- VI/EN có cùng IDs, dữ kiện, answers và version.
- App registry/routes và link checks PASS.
- Không còn Critical/Major.

A0 không tạo final Stage 5 review cho đến khi cả tám domain đã PASS. A9 final chỉ kiểm aggregate, cross-domain consistency và sample source/UI; không lặp lại toàn bộ batch reviews đã được pin.

## 6. Những việc sẽ bỏ hoặc giảm

- Không tạo nhiều `OPERATIONS_BOARD`, `RESUME_STATE`, `SUMMARY` lặp cùng một trạng thái trong cùng stage.
- Không ghi narrative dài cho kết quả máy đã có JSON.
- Không rehash hàng trăm input sau từng chỉnh sửa copy.
- Không spawn reviewer chỉ để kiểm tên file hoặc đếm record.
- Không cho nhiều agent đọc toàn bộ corpus khi chỉ cần một domain packet.
- Không tạo contact sheet/render lại PDF nếu locator và source hash không đổi, trừ khi finding liên quan visual/table.
- Không chạy build đầy đủ sau mỗi file; dùng typecheck/targeted checks trong batch và build ở integration/gate.
- Không dịch lại nội dung giống nhau; glossary và reusable blocks dùng chung ID/version.
- Không mở lại Stage 0–2 vì tài liệu status thay đổi sau gate; chỉ mở khi canonical source/artifact drift hoặc có lỗi cụ thể.

## 7. Việc không được cắt giảm

- Source locator cho claim chính thức.
- Kiểm độc lập toàn bộ answers, marks, calculations, traces và original/adapted assessment.
- Semantic parity của dữ kiện, đáp án và rubric VI/EN.
- Typecheck/build và browser QA trước UI/final gate.
- Accessibility cơ bản: keyboard/focus, viewport hẹp/zoom, light/dark, alt/caption và disclosure.
- Final A9 review độc lập và A0 gate.
- User checkpoint sau mỗi stage.

## 8. Trạng thái và bước tiếp theo

Hiện tại không cần thêm agent. Sau khi người dùng duyệt kế hoạch này, A0 chỉ làm một việc: tạo bộ Stage 3 tối giản và ba `WEB_DRAFT_PACKET` cho pilot, rồi dừng để người dùng quyết định phần nào chuyển sang ChatGPT Web và phần nào giao Codex thực thi.

Không chuẩn bị Stage 4–7 trước; các stage sau chỉ dùng schema đã thực sự PASS ở stage trước.

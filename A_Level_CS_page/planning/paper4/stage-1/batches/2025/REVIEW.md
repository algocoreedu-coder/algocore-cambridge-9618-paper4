# Lead submission — 2025

Trạng thái: SUBMITTED, chờ A8 và gate chung. Đã đọc QP, yêu cầu chấm MS và đối chiếu các locator/continuation. Chưa tạo lời giải hoặc thực thi code thi.

| Paper | Ý có điểm | Q1 | Q2 | Q3 | QP/MS/index |
|---|---:|---:|---:|---:|---|
|9618_s25_41|22|20|25|30|75/75/75|
|9618_s25_42|25|27|22|26|75/75/75|
|9618_s25_43|23|26|20|29|75/75/75|
|9618_w25_41|24|20|30|25|75/75/75|
|9618_w25_42|21|28|26|21|75/75/75|
|9618_w25_43|25|31|24|20|75/75/75|

Tổng:6 đề,18câu,140ý,450điểm. `index_2025.py` tìm candidate bằng geometry và tạo digest; `finalize_2025.py` thêm summaries Lead viết, evidence, quan hệ workflow và source context. Bản draft/digest chỉ là công cụ review; `index.json` là bản bàn giao. Shared extraction/PDF là toàn văn, không dùng digest đã lọc footer để chép số liệu hay code.

Lead đã xem trực tiếp7ảnh được ghi trong index: QP s25/41 PDF6 (tree và bảng Node), s25/42 PDF4 (stack, vị trí top), s25/43 PDF8 (LinkedList), w25/41 PDF6 (Station), w25/42 PDF10 (TreeArray vàmarking boxes), w25/43 PDF4 (row/column và Board); MS s25/41 PDF31 (source constructor và underscore bị mất trong text). Toàn bộ trang có facsimile, A8 kiểm tra các mẫu riêng và tự đối chiếu toàn bộ nhãn/điểm/continuation.

## Sửa trước khi nghiệm thu

- Bộ đọc candidate ban đầu mang footer/BLANK PAGE sang `qp_pages` kế tiếp. Đã bỏ metadata footer/blank trong segmentation; vẫn giữ toàn bộ trang trong extraction. w25/42 Q3 bắt đầuPDF10, không phảiPDF8–10.
- **S1-IDX-01:** A8 phát hiện summary s25/41 Q2(b) sai cấu trúc dữ liệu. Đã sửa thành sáu mảng1D theo màu; StoreData nhận mảng vàfilename rồi append mọi phần tử. Lead tự đối chiếu sửa Tree.FirstNode từ “null” thành “constructor parameter”; tạo root10 rồi chèn4node, không mô tả chèn5node. Xóa yêu cầu exception chỉ có ở MS khỏi summary QP tại w25/41 Q3(e), w25/42 Q3(c), w25/43 Q2(d).
- **S1-IDX-02:** A8 phát hiện trường evidence lấy từ digest làm mất số đứng riêng trong bảng. Đã thay toàn bộ trường screenshot bằng chỉ dẫn biên tập + summary + locator PDF/facsimile đầy đủ; không trình bày như toàn văn nguyên gốc. w25/43 Q1(d)(ii) nêu đủ row10→4, column−1→5. Tất cả số liệu nguồn vẫn nguyên trong PDF/ảnh.
- w25/43 Q3(b) yêu cầu amend main program. Dependency tiếp nối workflow vẫn giữ, dù SplitData không gọi RecursiveCount.

## Quan sát nguồn cần giữ ở stage sau

- s25 MS41 PDF31 in `_init_` một gạch dưới ở mỗi phía; text mất cả dấu `_`. Đây là source defect và extraction loss riêng biệt. Các constructor khác cần kiểm PDF; không biến text thành code đúng mà gọi là nguyên văn.
- s25 MS41 Q1(c) PDF12 có khác biệt `X`/`x` trong Python sample. Stage5 kiểm solution độc lập; Stage1 không sửa mẫu.
- s25 MS42 Q2(a) gọi class `Record` trong Python example trong khi QP yêu cầu `NewRecord`. Q3(c)(i) tiêu chí có `Territory`/`SetTerritory` trong khi QP và mẫu dùng `TerritorySize`/`SetTerritorySize`. Giữ nguồn và đúnglocator; không suy học sinh phải đổi tên theo typo.
- Một số tiêu chí ghi “1 mark each to max …”: giữ điểm ở cộtMarks và QP, không tự tăng điểm bằng số bullet.
- Câu có hash table tại s25/42 Q2 và w25/41 Q3 được giữ đầy đủ. Stage2–3 sẽ quyết định phân loại/mapping theo nội dung và syllabus; không loại bằng nhận định trước khi đọc đề.

Đây là sổ quan sát trong review corpus, không phải audit đầy đủ tính đúng của code. Dữ liệu đầu vào dùng nguyênbyte A2/A8 kiểm; sáu file màu rỗng là provided output target; Tree.txt do thí sinh tạo. Code chạy đúng, lời giải, marking map và VI/EN lesson thuộc các stage sau.

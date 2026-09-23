# Kế hoạch coverage cấp mục tiêu - A3

Version: 1.0 | P1-S0-A3-01 | Author A3 | 2026-09-19 | REVIEW_PENDING (A9).

## Cách đọc và trạng thái

Nguồn canonical, hash/version và giới hạn đọc sách: `SYLLABUS_SCOPE.md`. Tất cả hàng dưới có `scope_status=CHECKED_AGAINST_2026`, `coverage_status=PLANNED`, `lesson_id=null`, `assessment_id=null`, `qp_ms_locator=null`, `verification_status=NOT_YET_AUTHORED`. Nội dung là bản diễn giải nội bộ của các mục tiêu và notes/guidance trong syllabus local, không là câu trích, bộ bài đã hoàn thành hay ngân hàng đề.

ID `AC26-<section>-<ordinal>` là ID AlgoCore do A3 đặt để theo dõi; chỉ section như 1.1/4.2 là số Cambridge. Mỗi row theo một yêu cầu hoặc nhóm hàng liền kề trong syllabus, với guidance liên quan ghép cùng; không coi ordinal là bullet/code Cambridge. Số hàng là đơn vị quản lý nội bộ, không tuyên bố số objective chính thức độc lập.

Mọi row required có hai đầu ra dự kiến ở Stage2: một teaching slot (outline VI/EN, prerequisites, ví dụ) và một assessment slot (nhiệm vụ thể hiện đúng động từ, rubric/marking source). A3 sở hữu map kiến thức/sách; A4 sở hữu câu và marking; A9 review độc lập. Tên lesson và câu cụ thể để null có chủ ý trong Stage0. Book locator ở heading là cửa sổ tìm nguồn theo TOC, chưa phải nguồn đã đủ cho mọi claim.


## Section 1.1

Syllabus PDF/in 14, §1.1. Book candidate: Ch1 §1.1 in2–14 / PDF18–30.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-1.1-01 | Phân biệt và dùng binary/decimal magnitudes: kibi/kilo, mebi/mega, gibi/giga, tebi/tera; đổi đơn vị | PLANNED |
| AC26-1.1-02 | Hiểu các hệ binary, denary, hexadecimal, BCD; biểu diễn one’s/two’s complement | PLANNED |
| AC26-1.1-03 | Đổi số nguyên giữa các cơ số và biểu diễn | PLANNED |
| AC26-1.1-04 | Cộng/trừ nhị phân, cả số nguyên dương và âm | PLANNED |
| AC26-1.1-05 | Giải thích khi xảy ra overflow | PLANNED |
| AC26-1.1-06 | Giải thích ứng dụng thực tế của BCD và hexadecimal | PLANNED |
| AC26-1.1-07 | Biểu diễn character data theo ASCII, extended ASCII, Unicode; không yêu cầu nhớ mã ký tự cụ thể | PLANNED |

## Section 1.2

Syllabus PDF/in 15, §1.2. Book candidate: Ch1 §1.2 in15–20 / PDF31–36 (loại Video).

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-1.2-01 | Giải thích bitmap encoding; pixel, header, image/screen resolution, colour/bit depth | PLANNED |
| AC26-1.2-02 | Tính ước lượng dung lượng bitmap | PLANNED |
| AC26-1.2-03 | Giải thích tác động thay resolution/bit depth tới chất lượng ảnh và dung lượng | PLANNED |
| AC26-1.2-04 | Giải thích vector encoding; drawing object, property, drawing list | PLANNED |
| AC26-1.2-05 | Biện minh chọn bitmap/vector theo nhiệm vụ | PLANNED |
| AC26-1.2-06 | Giải thích sound encoding; sampling, rate, resolution, analogue/digital | PLANNED |
| AC26-1.2-07 | Giải thích tác động rate/resolution tới dung lượng và độ chính xác âm thanh | PLANNED |

## Section 1.3

Syllabus PDF/in 15, §1.3. Book candidate: Ch1 §1.3 in21–26 / PDF37–42.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-1.3-01 | Giải thích nhu cầu và ví dụ compression | PLANNED |
| AC26-1.3-02 | Phân biệt lossy/lossless và biện minh lựa chọn theo tình huống | PLANNED |
| AC26-1.3-03 | Giải thích nén text, bitmap, vector, sound; gồm RLE | PLANNED |

## Section 2.1

Syllabus PDF/in 16–17, §2.1. Book candidate: Ch2 §2.1–2.2 in28–67 / PDF44–83.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-2.1-01 | Mục đích và lợi ích kết nối thiết bị thành network | PLANNED |
| AC26-2.1-02 | Đặc trưng LAN/WAN | PLANNED |
| AC26-2.1-03 | Client-server/peer-to-peer: vai trò máy trong mạng/subnetwork, ưu/nhược và lựa chọn có lý do | PLANNED |
| AC26-2.1-04 | Phân biệt thin-client/thick-client | PLANNED |
| AC26-2.1-05 | Bus/star/mesh/hybrid: mô tả, truyền packets giữa hosts và lựa chọn topology có lý do | PLANNED |
| AC26-2.1-06 | Cloud computing: public/private, lợi ích và hạn chế | PLANNED |
| AC26-2.1-07 | Wired/wireless và hệ quả; copper, fibre, radio/WiFi, microwave, satellite | PLANNED |
| AC26-2.1-08 | LAN hardware: switch, server, NIC, WNIC, WAP, cable, bridge, repeater | PLANNED |
| AC26-2.1-09 | Vai trò/chức năng router | PLANNED |
| AC26-2.1-10 | Ethernet, collisions và cơ chế CSMA/CD | PLANNED |
| AC26-2.1-11 | Bit streaming real-time/on-demand; ảnh hưởng bit rate/broadband speed | PLANNED |
| AC26-2.1-12 | Phân biệt WWW và internet | PLANNED |
| AC26-2.1-13 | Internet hardware: modem, PSTN, dedicated lines, cellular network | PLANNED |
| AC26-2.1-14 | Dùng IP để truyền dữ liệu: IPv4/IPv6 format, subnetting, gán IP cho device, public/private và security, static/dynamic | PLANNED |
| AC26-2.1-15 | URL định vị tài nguyên WWW và vai trò DNS | PLANNED |

## Section 3.1

Syllabus PDF/in 17, §3.1. Book candidate: Ch3 §3.1 in68–88 / PDF84–104.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-3.1-01 | Nhu cầu input/output, primary memory, secondary/removable storage | PLANNED |
| AC26-3.1-02 | Embedded systems, lợi ích và hạn chế | PLANNED |
| AC26-3.1-03 | Nguyên lý laser/3D printer, microphone/speakers, HDD, flash, optical reader/writer, touchscreen, VR headset | PLANNED |
| AC26-3.1-04 | Vai trò buffers | PLANNED |
| AC26-3.1-05 | RAM/ROM: khác biệt và ứng dụng theo thiết bị/hệ thống | PLANNED |
| AC26-3.1-06 | SRAM/DRAM: khác biệt, ứng dụng và lý do chọn | PLANNED |
| AC26-3.1-07 | Phân biệt PROM, EPROM, EEPROM | PLANNED |
| AC26-3.1-08 | Monitoring/control: khác biệt, sensors temperature/pressure/infra-red/sound, actuators, feedback | PLANNED |

## Section 3.2

Syllabus PDF/in 18, §3.2. Book candidate: Ch3 §3.2 in89–106 / PDF105–122.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-3.2-01 | Dùng symbols và định nghĩa NOT, AND, OR, NAND, NOR, XOR/EOR; trừ NOT, các gate có hai inputs | PLANNED |
| AC26-3.2-02 | Lập truth table cho từng gate | PLANNED |
| AC26-3.2-03 | Dựng circuit từ problem statement, logic expression hoặc truth table | PLANNED |
| AC26-3.2-04 | Dựng truth table từ problem statement, circuit hoặc expression | PLANNED |
| AC26-3.2-05 | Dựng logic expression từ problem statement, circuit hoặc truth table | PLANNED |

## Section 4.1

Syllabus PDF/in 19, §4.1. Book candidate: Ch4 §4.1 in107–120 / PDF123–136.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-4.1-01 | Von Neumann model và stored-program concept | PLANNED |
| AC26-4.1-02 | Registers: general/special; PC, MDR, MAR, ACC, IX, CIR, Status Register | PLANNED |
| AC26-4.1-03 | Vai trò ALU, CU, system clock, IAS | PLANNED |
| AC26-4.1-04 | Truyền dữ liệu/thông tin giữa các thành phần qua address/data/control buses | PLANNED |
| AC26-4.1-05 | Performance: processor type/cores, bus width, clock speed, cache | PLANNED |
| AC26-4.1-06 | Ports kết nối peripheral: USB, HDMI, VGA | PLANNED |
| AC26-4.1-07 | Mô tả fetch-execute cycle và dùng register-transfer notation | PLANNED |
| AC26-4.1-08 | Interrupts: mục đích, nguyên nhân, ứng dụng, ISR, thời điểm phát hiện và xử lý | PLANNED |

## Section 4.2

Syllabus PDF/in 20–21, §4.2. Book candidate: Ch4 §4.2 in121–129 / PDF137–145.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-4.2-01 | Quan hệ assembly language và machine code | PLANNED |
| AC26-4.2-02 | Mô tả các bước two-pass assembler | PLANNED |
| AC26-4.2-03 | Áp dụng two-pass assembler cho chương trình assembly đơn giản | PLANNED |
| AC26-4.2-04 | Trace chương trình assembly đơn giản | PLANNED |
| AC26-4.2-05 | Nhóm lệnh data movement, I/O, arithmetic, conditional/unconditional, compare | PLANNED |
| AC26-4.2-06 | Hiểu và dùng immediate/direct/indirect/indexed/relative addressing; đối chiếu instruction table p21 | PLANNED |

## Section 4.3

Syllabus PDF/in 22, §4.3. Book candidate: Ch4 §4.3 in130–135 / PDF146–151.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-4.3-01 | Hiểu và thực hiện logical/arithmetic/cyclic shifts, trái/phải | PLANNED |
| AC26-4.3-02 | Bit manipulation dùng monitor/control thiết bị | PLANNED |
| AC26-4.3-03 | Thực hiện bit operations; test/set bit bằng masking; đối chiếu AND/XOR/OR/LSL/LSR table p22 | PLANNED |

## Section 5.1

Syllabus PDF/in 23, §5.1. Book candidate: Ch5 §5.1 in136–148 / PDF152–164.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-5.1-01 | Giải thích nhu cầu OS | PLANNED |
| AC26-5.1-02 | OS management: memory, file, security, I/O/peripheral hardware, process | PLANNED |
| AC26-5.1-03 | Nhu cầu utilities: formatting, virus checker, defragmentation, disk analysis/repair, compression, backup | PLANNED |
| AC26-5.1-04 | Program libraries: tái sử dụng existing code, lợi ích library/DLL với developer | PLANNED |

## Section 5.2

Syllabus PDF/in 23, §5.2. Book candidate: Ch5 §5.2 in149–158 / PDF165–174.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-5.2-01 | Nhu cầu assembler, compiler và interpreter; phân biệt translation/execution | PLANNED |
| AC26-5.2-02 | Ưu/nhược compiler/interpreter và biện minh lựa chọn | PLANNED |
| AC26-5.2-03 | Nhận biết high-level có thể partially compiled/interpreted, ví dụ Java console | PLANNED |
| AC26-5.2-04 | IDE: context prompts, dynamic syntax checks, prettyprint/collapse-expand, stepping/breakpoints và quan sát variables/expressions/report window | PLANNED |

## Section 6.1

Syllabus PDF/in 24, §6.1. Book candidate: Ch6 §6.1 in159–168 / PDF175–184.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-6.1-01 | Phân biệt data security, privacy, integrity | PLANNED |
| AC26-6.1-02 | Nhu cầu bảo vệ cả data và computer system | PLANNED |
| AC26-6.1-03 | Bảo vệ standalone/network: accounts/passwords, authentication/digital signature/biometrics, firewall, antivirus, anti-spyware, encryption | PLANNED |
| AC26-6.1-04 | Threats từ networks/internet: virus/spyware, hackers, phishing, pharming | PLANNED |
| AC26-6.1-05 | Mô tả biện pháp giảm rủi ro từng threat | PLANNED |
| AC26-6.1-06 | Bảo vệ data qua encryption/access rights | PLANNED |

## Section 6.2

Syllabus PDF/in 24, §6.2. Book candidate: Ch6 §6.2 in169–177 / PDF185–193.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-6.2-01 | Giải thích validation/verification bảo vệ integrity | PLANNED |
| AC26-6.2-02 | Mô tả và dùng validation: range/format/length/presence/existence/limit/check digit; theo syllabus khi khác sách | PLANNED |
| AC26-6.2-03 | Mô tả và dùng verification: visual/double entry; data transfer parity byte/block và checksum | PLANNED |

## Section 7.1

Syllabus PDF/in 25, §7.1. Book candidate: Ch7 §7.1–7.3 in179–195 / PDF195–211.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-7.1-01 | Nhu cầu/mục đích professional ethics và ý nghĩa tham gia BCS/IEEE | PLANNED |
| AC26-7.1-02 | Hành động ethical/unethical và tác động trong tình huống | PLANNED |
| AC26-7.1-03 | Nhu cầu copyright legislation | PLANNED |
| AC26-7.1-04 | Phân biệt và chọn software licences theo tình huống; Free Software Foundation, Open Source Initiative, shareware, commercial | PLANNED |
| AC26-7.1-05 | AI: ứng dụng và ảnh hưởng social/economic/environmental | PLANNED |

## Section 8.1

Syllabus PDF/in 25, §8.1. Book candidate: Ch8 §8.1 in196–207 / PDF212–223.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-8.1-01 | Hạn chế file-based storage/retrieval | PLANNED |
| AC26-8.1-02 | Đặc điểm relational database khắc phục hạn chế file-based | PLANNED |
| AC26-8.1-03 | Dùng entity/table/record/field/tuple/attribute; primary/candidate/secondary/foreign key; 1:1/1:M/M:N, referential integrity, indexing | PLANNED |
| AC26-8.1-04 | Dùng E-R diagram thể hiện thiết kế | PLANNED |
| AC26-8.1-05 | Hiểu normalisation 1NF/2NF/3NF | PLANNED |
| AC26-8.1-06 | Giải thích tables có/không ở 3NF | PLANNED |
| AC26-8.1-07 | Tạo thiết kế normalised từ mô tả/dữ liệu/tables | PLANNED |

## Section 8.2

Syllabus PDF/in 26, §8.2. Book candidate: Ch8 §8.2 in208–210 / PDF224–226.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-8.2-01 | DBMS giải quyết file-based issues: data management/dictionary, modelling, logical schema, integrity, security/backup/access rights | PLANNED |
| AC26-8.2-02 | Ứng dụng DBMS tools: developer interface và query processor | PLANNED |

## Section 8.3

Syllabus PDF/in 26–27, §8.3. Book candidate: Ch8 §8.3 in211–216 / PDF227–232.

| Internal ID | Yêu cầu required cần dạy và kiểm tra | Trạng thái |
|---|---|---|
| AC26-8.3-01 | Vai trò DDL tạo/sửa database structure | PLANNED |
| AC26-8.3-02 | Vai trò DML query/maintenance data | PLANNED |
| AC26-8.3-03 | SQL là chuẩn dùng cho DDL và DML | PLANNED |
| AC26-8.3-04 | Hiểu một SQL statement được cho | PLANNED |
| AC26-8.3-05 | Hiểu/viết simple DDL: CREATE DATABASE/TABLE; CHARACTER, VARCHAR(n), BOOLEAN, INTEGER, REAL, DATE, TIME; ALTER TABLE; PRIMARY KEY; FOREIGN KEY REFERENCES | PLANNED |
| AC26-8.3-06 | Viết DML tối đa hai tables: SELECT/FROM/WHERE/ORDER BY/GROUP BY/INNER JOIN/SUM/COUNT/AVG; INSERT INTO/DELETE FROM/UPDATE | PLANNED |

## Prerequisite và chiến lược kiểm phủ

Đây là dependency sư phạm đề xuất AlgoCore, không phải yêu cầu Cambridge về thứ tự dạy:

- 1.1 magnitudes/bits/number representation trước 1.2 bitmap và sound; 1.2 trước 1.3 compression.
- 3.1 components/memory + 1.1 bits trước 4.1 CPU; 4.1 registers/RTN trước 4.2 assembly; 1.1 binary + 3.2 gates trước 4.3 masks/shifts.
- 2.1 network models trước 6.1 network threats; 1.1 binary trước 6.2 parity/checksum. Security/privacy/integrity definitions trước tình huống validation/verification.
- 8.1 entities/keys/relationships trước E-R/normalisation, rồi 8.2 DBMS và 8.3 DDL/DML. So sánh access rights trong 6.1 và 8.2 mà không tính trùng coverage.
- 7.1 có thể học độc lập sau ví dụ hệ thống cơ bản; AI ethics không phụ thuộc dạy AI algorithms Paper3.

Stage2 cần tách guidance nhiều mục thành checklist con, giữ parent ID, không cộng hai lần parent+child. Cụ thể: mỗi loại logic gate và cả ba nguồn chuyển đổi; mọi thiết bị/sensor; cả bảy register; các addressing modes/shifts; các validation/verification methods; bộ lệnh SQL/types đều phải có bằng chứng. Số lượng bài dựa coverage và tải nhận thức, không quota một section một page.

Kiểm completeness bằng hai chiều: (1) đối chiếu mọi dòng syllabus §1–8 cùng notes/guidance tới row/child; (2) mọi claim bài học và exercise quay về required row hoặc nhãn supporting. Bổ sung lesson/assessment IDs chỉ khi có artifact thật. Nếu chưa có official QP phù hợp, tạo original task và rubric AlgoCore có nhãn; không bỏ objective, không bịa MS.

Hình thức kiểm dự kiến: tính và giải thích cho §1.1/1.2; so sánh và biện minh trong ngữ cảnh cho §2/5/6/7; hoàn thiện sơ đồ/trace/truth table cho §3/4; thiết kế relational schema và đọc/viết SQL cho §8. Đây là lựa chọn sư phạm, chưa là kết quả pattern/tần suất analysis QP/MS.

Hai bản VI/EN dùng chung IDs, giá trị, constraints và đáp án. Command words phải đối chiếu nghĩa theo ngữ cảnh trong syllabus PDF/in41–42; không đặt quy tắc một câu văn = một điểm. Calculator bị cấm theo p11: worked calculations và bài mô phỏng thi cần giải được bằng tay.

## Self-review

Đã so danh sách section và notes/guidance với p14–27, có continuation p17 và p27; có assembly/bit operations và SQL tối đa hai tables. Không có requirement P4 hoặc 2027–2029. Không có lesson/QP/MS giả hoặc marks tự gán. Chưa đánh giá coverage của coursebook/body từng row hoặc sản phẩm học tập; các bước đó nằm Stage1/2. A9 cần độc lập spot-check syllabus và audit completeness trước Lead chấp nhận kế hoạch.

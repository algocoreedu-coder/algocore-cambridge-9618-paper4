"""Private, lesson-specific Vietnamese teaching scripts; not public assets."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
S={}
def add(id,lead,explain,example,ask,expected,mistake,close):
 S[id]={'lead':lead,'explain':explain,'example':example,'ask':ask,'expected':expected,'mistake':mistake,'close':close}
add('13.1.1',
'Hôm nay ta không học thuộc tên kiểu trước. Hãy nghĩ đến một phiếu đăng ký học: trên phiếu có tên, điện thoại và số buổi. Nếu các thông tin nằm rải rác, em có chắc chúng thuộc cùng một bạn không?',
'Data type quy định dữ liệu được phép giữ và thao tác phù hợp. User-defined type là kiểu do ta đặt ra cho bài toán. Composite gom nhiều thành phần dưới một tên; non-composite giữ một giá trị theo cách phân loại đang học. Kiểu mới giúp rõ ý nghĩa, tái sử dụng và kiểm tra kiểu, nhưng không tự kiểm tra mọi quy tắc nhập liệu.',
'Chỉ vào V03: gom tên Minh, điện thoại và 8 buổi thành một record Learner. Sau đó chỉ V04: enum và pointer thuộc non-composite; record, set, class/object thuộc composite. Một biến INTEGER vẫn có thể nhận -8, nên số buổi cần kiểm tra riêng.',
'Nếu cần lưu ba kỹ năng đã học, em chọn một enum value hay một set? Vì sao?',
'Set, vì nhiều kỹ năng có thể cùng tồn tại. Enum variable chỉ nhận một giá trị của danh sách.',
'Nếu học sinh nói pointer là composite vì trỏ tới kiểu khác, nhắc: đang phân loại giá trị pointer được giữ, tức một địa chỉ; không dùng mẹo thấy tên kiểu khác là composite.',
'Cho học sinh tự nói bằng tiếng Anh: “A record groups related fields.” Yêu cầu thêm một ví dụ khác, như thông tin một quyển sách.')
add('13.1.2',
'Một học viên chỉ có một trạng thái hiện tại: Active, Paused hoặc Completed. Ta muốn tránh nhập nhầm các cách viết khác nhau.',
'TYPE tạo danh sách giá trị hợp lệ; DECLARE tạo một biến theo kiểu đó; dấu gán chọn giá trị cho biến. Các giá trị enum có thứ tự khai báo. Giải thích ngắn bằng ba vai: khuôn, chiếc hộp, thứ đang ở trong hộp.',
'Dùng hoạt động enum để đổi Active thành Paused. Chỉ rõ TStudyStatus là kiểu, Status là biến, Paused là giá trị. Chuyển sang các ngày: Wednesday + 1 theo mô hình sách là Thursday; Sunday phải có IF riêng nếu muốn quay về Monday.',
'Tại sao Status ← "Active" khác Status ← Active? Chủ nhật có tự quay lại thứ hai không?',
'Có dấu nháy là STRING; không có dấu nháy là enum value. Việc quay vòng chỉ xảy ra khi chương trình định nghĩa quy tắc.',
'Nếu học sinh thuộc TYPE nhưng dùng DECLARE cho mọi dòng, yêu cầu đọc động từ của đề: define a type hay declare a variable. Không coi enum như một vòng tròn tự chạy.',
'Cho viết ba dòng TYPE, DECLARE, gán cho mức ưu tiên Low/Medium/High. Kiểm tra tên và dấu nháy.')
add('13.1.3',
'Record giống một phiếu thông tin học viên. Mỗi ô trên phiếu là một field; các ô khác nhau có thể chứa loại dữ liệu khác nhau.',
'Viết TYPE TStudent và ENDTYPE trước, rồi đi qua từng yêu cầu để khai báo field. Sau đó DECLARE Learner : TStudent tạo một record cụ thể. Dấu chấm đi từ biến tới field. Array of records là nhiều phiếu cùng mẫu, không phải một phiếu có mọi field cùng kiểu.',
'Cho xem V06 và thay Phone thành số bắt đầu bằng 0. Hỏi nếu lưu INTEGER thì có giữ được số 0 đầu như một ký hiệu không. Chốt STRING vì đây là mã để liên hệ, không phải số để cộng. Với ClassList[2].FullName, đi tới record thứ hai rồi đọc ô tên.',
'Em cần ghi tên Lan vào một record tên Learner. Bên trái dấu gán là gì?',
'Learner.FullName, không phải TStudent.FullName. TStudent là tên kiểu, Learner là biến.',
'Không tự đổi kiểu field khi đề đã quy định. Khi thiếu ENDTYPE hoặc thiếu field, cho học sinh đối chiếu từng dòng yêu cầu như kiểm phiếu, không đoán mỗi field là một điểm.',
'Tự thiết kế record cho sách: mã, tên, ngày mua, số bản sao và trạng thái. Giải thích từng kiểu bằng một câu.')
add('13.1.4',
'Địa chỉ nhà khác với người đang ở trong nhà. Pointer giữ địa chỉ; dereference là đi tới địa chỉ đó để đọc dữ liệu hiện tại.',
'Phân biệt ^INTEGER trong TYPE, ^Score khi lấy địa chỉ và ScorePointer^ khi đọc giá trị. Pointer phải trỏ tới vị trí hợp lệ trước khi đọc. Không cần học thuộc những địa chỉ minh họa như 0x0200.',
'Đặt Score=42 rồi cho P trỏ tới Score. Bấm đổi Score thành 50 trong hoạt động. P vẫn giữ cùng địa chỉ, nhưng P^ đọc 50. So sánh với một biến sao chép giá trị 42: biến sao chép không tự đổi theo Score.',
'Nếu Score đổi, địa chỉ mà P giữ có bắt buộc đổi theo không? P^ trả về gì?',
'Không. P vẫn trỏ cùng vị trí và đọc giá trị mới tại đó.',
'Nếu học sinh nói P chứa 42, chỉ vào hai ô riêng: ô P là địa chỉ; ô Score là giá trị. Nếu viết ^ ở mọi nơi, yêu cầu nói chức năng trước khi viết ký hiệu.',
'Cho tự viết TYPE, DECLARE, lấy địa chỉ, OUTPUT dereference với biến Count. Đọc từng dòng bằng lời Việt rồi bằng thuật ngữ Anh.')
add('13.1.5',
'Danh sách kỹ năng đã học có thể gồm Binary và Files cùng lúc. Học lại Files không có nghĩa là em có hai kỹ năng Files khác nhau.',
'Set giữ phần tử cùng kiểu, không lặp và không có thứ tự. Union lấy phần tử thuộc ít nhất một tập; intersection lấy phần tử chung; difference A−B chỉ giữ phần tử thuộc A mà không thuộc B. Dấu ngoặc nhọn trong lời giải là ký hiệu tập, không tự biến thành cú pháp gán mới.',
'Bật A={1,3,5}, B={3,4,5}. Cho học sinh chỉ vùng chung 3 và 5 trước khi bấm intersection. Sau đó union là 1,3,4,5. Thử thêm 3 lần nữa để thấy số phần tử không tăng.',
'Một trạng thái hiện tại và nhiều kỹ năng đã hoàn thành nên dùng cùng kiểu enum không?',
'Không. Trạng thái có thể dùng enum; nhiều kỹ năng dùng set.',
'Nếu nhầm hợp với giao, yêu cầu đọc thành câu: có trong cả hai hay ít nhất một. Khi viết khai báo, kiểm tra SET OF, DEFINE và tên type sau dấu hai chấm.',
'Yêu cầu học sinh tự tạo hai tập môn học và nói ba kết quả union, intersection, difference. Không chấm sai chỉ vì thứ tự liệt kê khác.')
add('13.1.6',
'Record giống phiếu dữ liệu. Class giống mẫu một bộ đếm có dữ liệu bên trong và các nút được phép bấm.',
'Class định nghĩa state và method. Object là một instance được tạo theo mẫu đó. NEW đặt trạng thái ban đầu; PRIVATE hạn chế truy cập trực tiếp từ ngoài; public method là đường được cung cấp để thao tác. Đó là encapsulation, không phải mã hóa dữ liệu.',
'Tạo CounterA và CounterB cùng bằng 0. Bấm Increment của A hai lần rồi hỏi B bằng bao nhiêu. Kết quả A=2, B=0 cho thấy hai object có trạng thái riêng dù cùng class.',
'Vì sao tăng CounterA không làm CounterB tăng theo?',
'Hai object là hai instance khác nhau, mỗi object có state riêng.',
'Nếu học sinh coi class và object là một, dùng mẫu khuôn và sản phẩm. Không giảng lan sang inheritance/polymorphism trước khi học sinh nắm được state, method và instance.',
'Cho học sinh mô tả một class cửa sổ: state là đang mở/đóng, method là Open/Close. Nối sang câu X02 về PRIVATE.')
add('13.2.1',
'Có hai câu hỏi: hồ sơ nằm theo trật tự nào và ta tìm tới hồ sơ bằng cách nào. Hôm nay nói về cách lưu trước.',
'Serial lưu theo thứ tự đến, thêm cuối. Sequential lưu theo key, chèn đúng vị trí. Random tính vị trí từ key bằng một quy tắc như hash. Random ở đây không phải nhắm mắt chọn chỗ khác mỗi lần.',
'Cho ba key 31,12,25 và thêm 18. Với serial ta thêm cuối. Với sequential, sắp thành 12,18,25,31. Ở random, phải biết hash để tìm slot; nếu slot có người rồi thì xử lý collision.',
'Nhật ký ghi các sự kiện vừa xảy ra phù hợp cách nào? Nếu đề hỏi access thì em có trả lời serial không?',
'Nhật ký thường phù hợp serial. Access là sequential hoặc direct; phải trả lời đúng loại câu hỏi.',
'Nếu học sinh chỉ nói random nhanh hơn, yêu cầu nêu bài toán: cập nhật một hồ sơ bằng key. Không tuyên bố một organisation tốt nhất cho mọi nhu cầu.',
'Cho học sinh so sánh serial và sequential bằng hai tiêu chí: thứ tự và thêm record, rồi đưa một ứng dụng cho mỗi loại.')
add('13.2.2',
'Tìm số 20 trong dãy tăng dần 12,18,25,31. Khi đã gặp 25, em có cần xem 31 nữa không?',
'Sequential access đọc lần lượt từ đầu. File đã sắp tăng dần có thêm điểm dừng current key > target. File serial chưa sắp không được dùng điểm dừng đó. Direct access dùng index hoặc hash để biết vị trí, nhưng collision vẫn có thể làm đọc thêm.',
'Dùng hoạt động Search từng bước với target20. Đếm ba lần đọc. Chuyển sang dãy chưa sắp để thấy phải đọc hết. Sau đó tính hit rate: dùng5 record trong1000 thì 0.5%; dùng hết thì100%. Đây là tỷ lệ record được dùng trong xử lý tệp, không phải cache.',
'Sửa điện thoại 5 học viên trong1000 hồ sơ thường hợp access nào, nếu có index?',
'Direct access vì chỉ cần ít record. Xử lý cả tệp thường hợp sequential access.',
'Nếu học sinh kết luận hit rate thấp thì organisation phải random, nhắc có thể dùng index cho sequential file. Hit rate không quyết định mọi cấu trúc lưu.',
'Yêu cầu nói đủ bắt đầu ở đâu, đọc thế nào, dừng khi nào; không chỉ nhớ hai từ sequential/direct.')
add('13.2.3',
'Hash giống một quy tắc chỉ tới ô đầu tiên để tìm hồ sơ. Trước hết phải phân biệt số ô với địa chỉ byte.',
'MOD lấy phần dư. Với N slot từ0 đếnN−1, kết quả phải nằm trong khoảng đó. Nếu đề cho base và record size, địa chỉ bằng base+slot×size. Dùng cùng đơn vị và theo đúng quy ước đánh số slot.',
'Tính127 MOD10=7. Nếu base1000 và size20 thì địa chỉ1140, không phải7. Thử chuỗi AC:65+67=132, MOD10=2. Đổi AC thành CA cũng ra2, mở đường cho khái niệm collision.',
'Trong1030=343×3+1, hash MOD3 lấy343 hay1? Nếu đề chỉ hỏi hash value, có cần nhân record size không?',
'Lấy1 là phần dư. Chỉ tính địa chỉ khi được hỏi và có đủ dữ kiện.',
'Nếu học sinh lấy thương hoặc đánh slot từ1 theo thói quen, viết rõ khoảng0..N−1 ở đầu. Không dùng công thức địa chỉ máy móc khi đề quy định khác.',
'Cho một key mới, yêu cầu viết riêng ba nhãn Key, Slot, Address và đơn vị. Đọc ngược xem địa chỉ có đúng một bước record size không.')
add('13.2.4',
'Hai người được hướng dẫn tới cùng một chỗ, nhưng đó không phải cùng người. Hai key có cùng hash cũng vậy.',
'Collision là khác key nhưng cùng vị trí hash. Linear probing thử ô tiếp theo và quay về0 khi hết bảng. Khi tìm, phải đi cùng đường và so key. Overflow area là một cơ chế khác: giữ record va chạm ở vùng tràn và tìm theo cấu trúc của vùng đó.',
'Trong bảng5 ô, chèn12,17,22 đều hash vào2. Lần lượt lưu ở2,3,4. Tìm22: tại2 thấy12 chưa đúng, tại3 thấy17 chưa đúng, tại4 mới tìm thấy. Thử bảng đầy để nói điểm dừng sau một vòng.',
'Tại sao tìm22 không được trả về record12 ở slot2? Nếu xóa record17, có thể coi ô trống ấy là kết thúc ngay không?',
'Hash không định danh duy nhất. Sau khi có xóa cần quy ước đánh dấu để không làm đứt đường tìm; với bảng chỉ chèn, ô chưa từng dùng có thể là điểm dừng.',
'Không ghi đè record cũ. Khi đề hỏi cả storing và retrieval, phải viết cả hai. Nhãn open/closed có thể khác giữa nguồn; giảng cơ chế cụ thể trước.',
'Cho học sinh tự truy vết lưu và tìm27,37 với MOD10. Yêu cầu đọc rõ key và slot ở từng bước.')
add('13.3.1',
'Số khoa học như4.8×10³ dùng một phần số và một phần độ lớn. Ở đây ta làm điều tương tự với cơ số2: X=M×2^E.',
'M là mantissa, E là exponent. Cả hai dùng bù hai theo mô hình đề Cambridge. Dấu chấm M ngay sau bit đầu; bit đầu có trọng số−1, không phải−128 như khi đọc M dưới dạng số nguyên trung gian. Với E4, trọng số là−8,4,2,1.',
'Bật từng bit của M trong lab để thấy các trọng số−1,1/2,1/4… . Giữ M dương và đặt E=−2: giá trị nhỏ đi nhưng vẫn dương. Đây là cách tách dấu của số và độ lớn.',
'M dương, E âm thì X âm hay dương? Số bit M/E có luôn là8/4 không?',
'X vẫn dương vì2^E luôn dương. Số bit phải đọc từ từng đề.',
'Nếu học sinh áp IEEE754 hoặc dùng số mũ không dấu, quay lại quy ước đề. Cho gạch chân số bit và two’s complement trước mỗi câu tính.',
'Yêu cầu nói bằng tiếng Anh đơn giản: “The mantissa sets the sign. The exponent changes the scale.”')
add('13.3.2',
'Đề đã cho hai chuỗi bit. Ta không đoán giá trị ngay mà đọc M và E thành hai phần riêng.',
'Cách1 cộng trọng số M và đọc E bù hai. Cách nhanh: đọc M như số nguyên bù hai I rồi chia2^(m−1). Cách2 lấy độ lớn và dịch binary point theo E; nếu M âm thì giữ dấu âm ngoài kết quả.',
'Giải10110000/1110: I=−128+32+16=−80; M=−80/128; E=−8+4+2=−2; X=−80/512=−0.15625. Sau đó bật lab và đổi dấu E để học sinh thấy ảnh hưởng. Với M10000000, dùng−1 trực tiếp vì+1 không vừa mantissa phân số8 bit.',
'Vì sao chia128 chứ không chia256? M và E đều âm thì kết quả có thành dương không?',
'M8 có7 vị trí phần lẻ nên chia2^7.2^-2 là số dương; dấu củaX vẫn doM.',
'Nếu thiếu working, yêu cầu viết ít nhất I hoặcM, E, phép nhân và kết quả. Đừng chỉ điền số cuối khi đề yêu cầu show working.',
'Cho cặp01010000/1110 rồi đổi riêng bit dấuM. Học sinh phải tính lại bằng bù hai, không chỉ thêm dấu trừ theo cảm giác.')
add('13.3.3',
'Ta cần đóng gói−6.5 vào hai trường bit. Làm trên độ lớn trước để không trộn việc đổi cơ số và đổi dấu.',
'Đổi6.5=110.1₂=0.1101₂×2^3. Điền đủ8 bitM, rồi nếu số âm thì đảo và cộng1 cho M. E giữ3. Sau bước đó phải kiểm tra01/10 và đọc ngược. Phần lẻ có thể tạo bằng nhân2 lặp lại; cách dùng phân số cũng bảo toàn M×2^E.',
'Viết01101000 →10010111+1→10011000, E0011. Dùng0.375 để làm bảng nhân2:0.75 lấy0,1.5 lấy1,1 lấy1, nên.011₂. Tiếp theo0.15625=.101₂×2^-2. Riêng−0.5 cần chuẩn hóa11000000/0000 thành10000000/1111.',
'Tại sao số âm−6.5 không làm E thành−3? Khi nào biết cần giữ bao nhiêu bit của phần lẻ?',
'E là thang độ lớn, không phải dấu củaX. Chọn bit giữ lại sau khi chuẩn hóa mantissa.',
'Nếu chỉ lật bit đầu, cho đọc ngược số sai để thấy lỗi. Nếu học sinh ngừng tạo phần lẻ quá sớm, chỉ vào vùng bit bị bỏ cần biết để làm tròn.',
'Cho tự mã hóa6.5 rồi−6.5 và giải thích phần nào đổi, phần nào giữ nguyên. Luôn kết thúc bằng decode để kiểm tra.')
add('13.3.4',
'Cùng một giá trị có thể viết0.3125×16 hoặc0.625×8. Chuẩn hóa chọn cách dùng bit hiệu quả hơn.',
'M dương chuẩn hóa bắt đầu01, M âm bắt đầu10. Dịch M trái k làm M nhân2^k, nên E phải giảm k. Không làm mất giá trị khi phép dịch hợp lệ và E còn trong range. Số0 cần quy ước riêng.',
'Giải00101000/0100→01010000/0011, cả hai bằng5. Với11101000/0101, dịch2 lần thành10100000/0011, vẫn bằng−6. Dùng nút Step để học sinh nhìn M tăng độ lớn còn E giảm.',
'Nếu dịchM trái2 mà tăngE thêm2, kết quả có giữ nguyên không? Chuẩn hóa có khôi phục những bit đã bị cắt không?',
'Không: cả hai thừa số tăng sẽ đổi giá trị. Chuẩn hóa chỉ sắp xếp phần đang có, không lấy lại bit đã mất.',
'Không áp quy tắc01/10 cho0 rồi kết luận không lưu được0. Với raw binary, tìmE từ dấu chấm; đừng lấyE của một ví dụ M/E khác.',
'Cho một cặp chưa chuẩn hóa và yêu cầu chứng minh trước/sau bằng phép tính denary, không chỉ ghi bit mới.')
add('13.3.5',
'Tưởng tượng em có16 ô để chia cho phần giữ chi tiết và phần giữ độ lớn. Cho bên này nhiều hơn thì bên kia phải ít đi nếu tổng cố định.',
'Precision gắn với mantissa; range gắn với exponent. Trước khi tìm cực trị, viết Emin và Emax. Phân biệt âm nhỏ nhất với âm gần0. Các giới hạn trong bài dùng số khác0 đã chuẩn hóa.',
'Dùng lab phân bổ M12/E4→M10/E6: E mở từ−8..7 thành−32..31. Với8/4, lần lượt lấy127,1/512,−128,−65/32768. Chỉ V59 để thấy hai phía không đối xứng. Với10/6, áp lại công thức chứ không chép đáp án8/4.',
'Nếu đề chỉ nói word32 bit thì có đủ tính số dương lớn nhất chưa? ThêmE có làm0.1 chính xác tuyệt đối không?',
'Chưa, cần biết chiaM/E. ThêmE mởrange; không thay việc giữ các bit phần lẻ vô hạn.',
'Nếu học sinh điềnE toàn1 cho số lớn nhất, nhắc đó là−1 trong bù hai. Nếu nhầm hai cực trị âm, yêu cầu đặt chúng lên trục số và đọc từ gần0 ra xa0.',
'Cho tự tìmEmin/Emax của6 bit rồi diễn giải hai tác động khi đổi số bit; giữ dạng lũy thừa nếu đề yêu cầu chính xác.')
add('13.3.6',
'Không phải mọi số thập phân có dấu chấm đều vô hạn trong hệ2.13.375 kết thúc, còn0.1 lặp mãi; cả hai vẫn có thể bị xấp xỉ vì những lý do khác nhau.',
'Phân biệt dãy vô hạn với dãy hữu hạn nhưng quá dài choM. Truncation bỏ bit; rounding chọn theo quy tắc. Với số âm bù hai, bỏ bit thấp không luôn là về0. Sai số có thể tích lũy qua phép tính; làm đẹp chữ số hiển thị không xóa sai số bên trong.',
'VớiM6,13.375 cắt còn13.0, nearest thành13.5. VớiM8/E8,113.75 cắt thành113, nearest114. Sau đó nói rõ V36 chỉ làm tròn đầu vào0.1 thành0.099609375 rồi cộng chính xác: tổng3 lần0.298828125. Nếu làm tròn mỗi phép cộng theo ties-to-even, tổng3 lần là0.296875.',
'Vì sao hai tổng thứ ba khác nhau mà không nhất thiết có phép cộng nào sai? Double precision có biến0.1 thành binary hữu hạn không?',
'Hai mô hình làm tròn khác nhau. Tăng hữu hạn bit có thể giảm sai số nhưng không kết thúc một chu kỳ nhị phân vô hạn.',
'Không trộn số của hai mô hình tích lũy. Nếu đề đang dùng truncation thì không tự nearest. Cho học sinh viết quy tắc trước khi tính và đọc lại giá trị thực được lưu.',
'Yêu cầu giải thích bằng câu nguyên nhân–hệ quả: “There are too few mantissa bits, so some low bits are lost.” Nêu rõ dãy hữu hạn hay vô hạn.')
add('13.3.7',
'Một chiếc thước có giới hạn đầu trên và mức nhỏ nhất khác0. Có kết quả quá lớn, và có kết quả quá sát0: đó là hai vấn đề khác nhau.',
'Overflow là vượt range; underflow là kết quả khác0 quá gần0 so với mô hình đang dùng. Phải nêu phép tính, kết quả, giới hạn và hệ quả không biểu diễn được. Không lấy dấu âm hay carry làm định nghĩa.',
'TrongM8/E4 chuẩn hóa:100×2=200>127 làoverflow. (1/512)/2=1/1024 nhỏ hơn mức dương chuẩn hóa nhỏ nhất làunderflow. Chỉ trục ngắt V62 để so hai vị trí, không đọc khoảng cách như tỉ lệ thật.',
'Một kết quả−6.5 có phải underflow chỉ vì âm không? Máy nào cũng trả0 khiunderflow không?',
'Không.−6.5 nằm trongrange. Hành vi xử lý phụ thuộc hệ thống; có thể báo lỗi, giá trị đặc biệt hay làm tròn theo quy tắc.',
'Nếu học sinh dùng chia0 làm ví dụ, chuyển sang phép nhân/chia hữu hạn như trên để minh họa đúng việc vượt giới hạn.',
'Cho một tình huống mới và yêu cầu trả lời đủ ba vế: phép tính → vượt giới hạn nào → hệ quả. Không chỉ ghi tên lỗi.')

# Exam coaching is specific to each pattern, with a concrete prompt and expected reasoning.
EXAM=[
('E01','Bắt đầu bằng động từ compare: phải có hai phía trên cùng tiêu chí.','Dùng V42 đối chiếu record với enum: một record có nhiều field, enum variable giữ một giá trị của danh sách. Cho ví dụ xong phải nói đặc điểm chứ không chỉ kể tên.','So sánh record và enum bằng một câu.','Record gom các field liên quan; enum variable chọn một giá trị có tên.','Đừng trả lời composite chỉ là “nhiều biến” hoặc bỏ một phía của phép so sánh.'),
('E02','Gạch chân define type, tên kiểu và danh sách lựa chọn.','V43: viết TYPE TStatus=(Active,Paused,Completed). Đánh dấu riêng khung khai báo và danh sách. Sau đó thử dòng gán có/không dấu nháy để thấy khác kiểu.','Em tạo kiểu hay tạo biến khi viết TYPE?','Tạo kiểu. DECLARE mới tạo biến; giá trị enum không có dấu nháy.','Không cho rằng thứ tự có nghĩa tự quay vòng; không thay TYPE bằng DECLARE.'),
('E03','Câu identify a field cần lựa chọn và lý do phù hợp, không phải đoán field ngắn nhất.','V44: chọn Status vì có danh sách trạng thái cố định. Nếu đề yêu cầu đổi kiểu, phải sửa DECLARE Status : TStatus sau khi định nghĩa enum.','Vì sao FullName không thành enum chỉ vì bảng có ba tên?','Bảng chỉ là mẫu; miền tên hợp lệ không bị giới hạn ở ba tên ấy.','Không khai báo enum xong vẫn giữ field STRING; đọc xem đề yêu cầu một dòng hay cả record.'),
('E04','Đọc danh sách field như một phiếu cần hoàn thành từng ô.','V45: dựng TYPE/ENDTYPE trước. Đi lần lượt ID STRING, ngày DATE, số buổi INTEGER, trạng thái enum. Kiểm tra nhómfield vì MS có thể gom nhiều field vào một điểm.','Điện thoại bắt đầu0 dùng INTEGER có phù hợp không?','STRING phù hợp hơn để giữ định dạng, không dùng để tính toán.','Thiếu ENDTYPE, DECLARE hoặc mộtfield có thể mất điểm; không đoán mộtfield luôn một điểm.'),
('E05','Kiểu đã có rồi thì câu hỏi có thể chỉ muốn tạo biến hoặc gán dữ liệu.','V46: DECLARE Learner : TLearner; Learner.ID←"AC027". Gạch riêng Learner làbiến, ID làfield.','Tại sao TLearner.ID không phải đích gán trong ví dụ?','TLearner làtên kiểu, không phảirecord variable.','Không viết lại TYPE để thay phần gán; giữ đúng tên và dấu nháy của từng loại giá trị.'),
('E06','Trước khi đặt dấu^, nói rõ dữ liệu đích thuộc kiểu nào.','V47: TYPE TIntPointer=^INTEGER; DECLARE P:TIntPointer; P←^Score; đọc P^. Bốn vai trò phải tách.','^Score và P^ khác nhau thế nào?','Một bên lấy địa chỉ, bên kia đọc giá trị tại địa chỉ.','Câu chỉ hỏi pointer type thì đáp trọng tâm dòng TYPE với đúng kiểu đích của ý trước.'),
('E07','Nhìn từ SET và việc nhiều phần tử cùng tồn tại để tránh nhầm enum.','V48: TYPE TUnitSet=SET OF INTEGER; DEFINE Completed(1,3,5):TUnitSet. Thử thêm3 để xác nhận khônglặp.','Nếu phần tử là CHAR, dấu nháy nên viết thế nào?','Dùng dấu nháy đơn cho từng ký tự.','Kiểm tra SET OF, DEFINE, tên biến và tên kiểu sau dấu hai chấm.'),
('E08','Phân loại ngay đề đang hỏi organisation hayaccess.','V49: cùngthêm18 nhưngserial thêmcuối, sequential chèn theo key, random dùnghash. Cho học sinh so sánh hai loại trên cùng tiêu chí.','Vì sao event log hợpserial?','Các sự kiện được thêm theo thứ tự đến vàappend cuối.','Nói “nhanh” không đủ; phải gắn cơ chế lưu với tìnhhuống.'),
('E09','Câu tìm lần lượt cần cả điểm bắt đầu và điều kiện dừng.','V50: tìm20 trong12,18,25,31; gặp25 thìdừng vìtệp tăngdần. Đổi thứtự để thấy serial không được dừng sớm bằngquy tắc đó.','Nếu tệp giảm dần, phép so sánh dừng thayđổi thế nào?','Dừng khi current key nhỏhơn target vìcác key sau còn nhỏ hơn.','Không dùng current>target cho mọi tệp; kiểm tra order.'),
('E10','Không dùng mộtcâu “đi thẳng” để trảlời cả index lẫn hash.','V51: key→index→address→record cho indexed sequential; key→hash→slot→so key cho random.','Direct access có nghĩa luôn đúng một lần đọc không?','Không; collision hoặc traindex có thể cần đọc thêm.','Nếu đề chiahai organisation thì viết đủhai cơchế tương ứng.'),
('E11','MOD làphần dư; viết phép chia thành quotient×N+remainder để tự kiểm.','V52:1030=343×3+1 nên slot1. Với vídụ địa chỉ riêng,4096+1×64=4160bytes.','343 làhash value hayquotient?','Làquotient; hash MOD3 là1.','Không nhầm slot vàbyte address, không tựnhân recordsize nếu đề chỉhỏi hash.'),
('E12','Hai key khác nhau nhưng cùnghash mới làcollision.','V53:27 và37 vào7. Khi lưu37 thìdò8; khi tìm37 cũng so27 ở7 rồi sang8. Cho học sinh đọc cả storing vàretrieval.','Có thể trảrecord ởslot7 ngay vìhash đúng không?','Không, phải so full key và đi theo đường dò cho tới khiđúng hoặc cóđiểm dừng.','Khôngghi đè; môtả cơchế trước nhãn open/closed khi nguồnkhông thốngnhất.'),
('E13','Câu mã hóa cóshow working: đừng chỉ điền hai chuỗi cuối.','V54:−6.5→độlớn6.5→binary→M dương→bùhai→E+3. Dùng V55 để kiểm tra biên−0.5 cần chuẩn hóa thêm.','Đổi X sang âm có làm E đổi dấu không?','Không. E mô tả thangđộlớn; M mới nhận dấu củaX.','Đếm đủbit, không lật riêng signbit, giữ các bước đổi binary vàE để được chấm phương pháp.'),
('E14','Chia bài thành ba dòng M, E, X để tránh đọc nhầm dấu.','V56: I=−80, M=−80/128, E=−2, X=−0.15625. Nêu cách dịch binarypoint là một đường kiểm tra khác.','M8 chia128 hay256?','Chia128 vì có7 bitphầnlẻ sau bitđầu.','Không đọc E làunsigned; âm củaE không cộng thêm dấuâm vào X.'),
('E15','Đầu vào làraw binary haycặp M/E cósẵn? Phải nhận diện trước.','V57 dịch M trái2 thìEgiảm2, cảhai vẫn3. V58:0.00011=.11×2^-3, nên Eâm.','Chuẩn hóa có lấy lại bit đãcắt không?','Không; chỉ bốtrí lại bit hiện có vàđiềuchỉnh E để giữgiátrị.','Không gộp chuẩn hóa với làmtròn; ghi rõ số lần dịch và kiểm tra E cònvừa.'),
('E16','Đọc chínhxác most negative và negative nearest zero trước khichọn bit.','V59: vớiM8/E4, mostnegative là−128, âm gần0 là−65/32768. TìmEmin/Emax trước rồi chọn mẫuM.','E8 lớnnhất cóphải11111111 không?','Không, đó là−1. Lớnnhất là01111111=127.','Giữ phân số/lũy thừa nếuđềmuốn exactvalue, khôngđổi sang xấp xỉ dài không cầnthiết.'),
('E17','Đề phân bốbit thườngmuốn hai tácđộng riêng: precision vàrange.','V60: tổng16bit, M12→M10 nênE4→E6. Ítbit M hơn làmgiảm precision, nhiều bit E hơn làmrange rộnghơn.','Nếu tổngbit không đượcgiữ cốđịnh thì cóđược tựsuy ra Egiảm không?','Không. Phải dựa trên dữkiện củađề.','Không nói tăngE là lưu mọi phầnlẻ chínhxác hơn; cần chuỗi nguyênnhân–hệquả.'),
('E18','Đầu tiên hỏi: binary vôhạn hay hữu hạn nhưngMthiếubit?','V61 dùng113.75, binary kếtthúc nhưngM8không đủ. Cắt thành113; nearest thành114. MS được dẫn đang dùngtruncation.','Tại sao không giải thích bằng “vì số có dấu chấm”?','Có nhiều binaryfraction kếtthúc; cần chỉra bit hữu ích bịbỏ hoặcchu kỳ vôhạn.','Nêu đúng quy tắc cắt/làmtròn. Với sốâm bùhai, bỏ bitthấp không luôn về0.'),
('E19','Dùng khung phép tính→giới hạn→hệquả để trảlời explain.','V62:100×2=200 vượt127 làoverflow;1/1024 nhỏ hơn1/512 làunderflow trongmôhình chuẩn hóa này.','Máynào cũng trả0 khi underflow cóđúng không?','Không; xử lý phụthuộc hệthống vàquy tắc đề.','Không địnhnghĩa bằng sốâm/carry, không dùng chia0 như phép tínhhữu hạn vượt range.'),
('X01','Ý này nối record với subrange/array, không phảiSET.','V63: một NumberOfCopies trong1..10; nếugiátrị3 thìarray accessionnumber có3phần tử. Ghi đúng dòng field mà đề cũ yêu cầu.','Một sốbịgiới hạn vàmột danh sách sốkhác nhau ở đâu?','Subrange giới hạnmộtgiátrị; array giữnhiềugiátrị theo chỉsố.','Không gán câu này vàoSET; phạmvi làcâu lịch sử được dẫn, không thêm kiểu lõi mới chochương hiện tại.'),
('X02','Khi câu chuyển sangclass/PRIVATE thì dùng kiếnthức encapsulation, không dừng ởrecord.','V64: Name đặtPRIVATE; mãngoài phải dùngGetName/SetName. Viếtmột dòng PRIVATE Name:STRING nếuđề chỉhỏi mộtdòng.','PRIVATE có mãhóa dữliệu không?','Không. Nó hạnchế truy cập trực tiếp từ ngoài class.','Không viết cảclass dài màquên giảithích vìsao cầnmethod; nối sâu hơn sangUnit20 khi cần.'),
('X03','Gọi tên rõ ba thứ trước khi điền: file nguồn, biến record, file đích.','V65: SEEK nguồn→GETRECORD vàoThisRecord→SEEK đích→PUTRECORD từThisRecord. Lặp i1..50, mởRANDOM trước vàđóngfile sau.','GETRECORD vàPUTRECORD cóhướng dữliệu nào?','GET đọcfile→biến; PUT ghitừbiến→file.','Không nhầm filename với recordvariable; giữ bounds vàStoredflag/điểm dừng nếu làcâu tìmchỗtrống.')
]
for code,lead,example,ask,expected,mistake in EXAM:
 add('13.4.'+code,lead,
 'Cho học sinh mở đúng dạng, đọc Spot the task rồi tự gọi tên thao tác bằng tiếng Anh. Che mark scheme trước khi làm. Giảng theo sơ đồ, yêu cầu học sinh dự đoán bước tiếp theo trước khi bấm hoặc xem lời giải; sau đó tự viết lại working của mình.',
 example,ask,expected,mistake,
 'Mở QP liên quan và cho học sinh thử một ý. Đối chiếu MS đúng kỳ/variant: khoanh ý đã có, bổ sung ý thiếu bằng màu khác. Quay về bài lý thuyết được liên kết nếu lỗi do kiến thức. Điểm của ví dụ không phải thang chấm cố định cho mọi câu cùng dạng.')

# Keep instructor speech readable; avoid number/word joins in compact authored prompts.
import re
for script in S.values():
 for k,text in script.items():
  text=re.sub(r'(?<=[a-zÀ-ỹ])(?=\d)', ' ', text)
  # Common compact wording is expanded without touching identifiers.
  for a,b in {'làbiến':'là biến','làfield':'là field','làtên':'là tên','phảirecord':'phải record','khônglặp':'không lặp','hayaccess':'hay access','cùngthêm':'cùng thêm','serial thêmcuối':'serial thêm cuối','theoquy':'theo quy','tìnhhuống':'tình huống','thứtự':'thứ tự','tăngdần':'tăng dần','vìtệp':'vì tệp','thìdừng':'thì dừng','thayđổi':'thay đổi','nhỏhơn':'nhỏ hơn','vìcác':'vì các','theođường':'theo đường','haiorganisation':'hai organisation','mộtcâu':'một câu','trảlời':'trả lời','choindex':'cho index','làphần':'là phần','tựkiểm':'tự kiểm','hashđúng':'hash đúng','keykhác':'key khác','toànđộ':'toàn độ','kiếnthức':'kiến thức','họcviên':'học viên','họcsinh':'học sinh','chínhxác':'chính xác','giảithích':'giải thích','đầyđủ':'đầy đủ','nguyênnhân':'nguyên nhân','hệquả':'hệ quả','sốâm':'số âm','sốdương':'số dương','đềbài':'đề bài','đơnvị':'đơn vị','cơchế':'cơ chế','phạmvi':'phạm vi','dữliệu':'dữ liệu','giátrị':'giá trị','quy tắcđề':'quy tắc đề','truycập':'truy cập','địnhnghĩa':'định nghĩa','đủhai':'đủ hai','tínhhữu hạn':'tính hữu hạn'}.items():text=text.replace(a,b)
  script[k]=text
(ROOT/'data/teacher-scripts.vi.json').write_text(json.dumps(S,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Wrote {len(S)} private teaching scripts')

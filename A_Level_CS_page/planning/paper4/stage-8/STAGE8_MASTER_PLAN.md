# Stage 8 master plan

## Mục tiêu chấp nhận

1. Runtime Fumadocs tiêu thụ đúng release Stage 7, không dùng dữ liệu demo rời nguồn.
2. Registry chứa đúng 58 pattern, 174 scenario và 331 event; ID không trùng, thứ tự event xác định.
3. Người học dùng được pattern selector, locale VI/EN và các control `Previous`, `Next`, `Play`, `Pause`, `Reset`, `change_input` cùng prediction checkpoint.
4. Code, state, data-structure/trace, output và invariant cùng đổi theo một event hiện tại.
5. Keyboard, focus, aria-live, non-colour cues, reduced motion và narrow screen có bằng chứng kiểm chứng.
6. `npm run typecheck`, `npm run build`, contract tests và browser test đều PASS.

## Điều phối và double-check

Lead khóa input và giao file ownership trước mỗi wave. A8 kiểm tra độc lập từ artifact đã nộp; A8 không tự sửa finding. Lead lấy mẫu tối thiểu một pattern ở mỗi domain, kiểm lại event đầu/giữa/cuối, reset, replay, locale parity, keyboard và mobile. Gate chỉ PASS khi required findings bằng 0.

## Luồng thực hiện

- S8-0: xác minh hash Stage 7, inventory repo, route và toolchain; khóa denominator.
- S8-A: aggregate năm batch S7-B…S7-E thành registry; lưu source locator/hash; chạy exact-set và schema checks.
- S8-B: xây deterministic reducer/timer, visual panels và learner controls; không phụ thuộc network.
- S8-C: gắn vào Fumadocs, biên tập nhãn VI/EN, tối ưu responsive, focus, screen reader và reduced motion.
- S8-D: chạy static checks, production build, reducer contract test và thao tác thật trên trình duyệt ở desktop/mobile viewport.
- S8-E: A8 aggregate audit; Lead kiểm tra lại mẫu rủi ro; tạo release manifest, detached verifier và Stage 9 handoff.

## Chính sách rework

Finding có `finding_id`, severity, wave, artifact/locator, observed, expected, owner, correction, recheck command và status. `required` chặn gate. Sau sửa, owner chỉ được ghi `RESUBMITTED`; A8 hoặc Lead khác owner mới được đóng `CLOSED_VERIFIED`.


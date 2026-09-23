# P4R-6 Lead learner and academic QA gate

**Decision:** `PASS`

Independent A6 và A7 recheck cùng PASS trên exact candidate `3849510defd1ca4a4b060daa6696348b8467d359`.

## Learner-visible QA

- 52/52 VI/EN routes có 10 canonical section, đúng một Python artifact đầy đủ và normal/boundary/failure evidence.
- Keyboard trace navigation, live region, locale switch, focus transfer, copy affordance và Change Input đều hoạt động.
- 320 px, xấp xỉ 400% zoom, light/dark và reduced-motion PASS; không có page-level overflow.
- axe-core 4.13.0/JSDOM scan: 52/52 route PASS, 0 violation. Browser landmark recheck PASS bằng tên VI/EN; không có duplicate mobile TOC.
- Console, hydration, chunk và network runtime errors: 0.

## Academic and learning-loop QA

- 78/78 practice item chỉ hiện feedback sau khi học sinh ghi nhận một attempt không rỗng.
- 108/108 retrieval item thực hiện đủ recall → response → answer → diagnosis → repair/retry → AlgoCore self-rubric.
- `official_marks` vẫn `null` cho self-rubric nội bộ; không chuyển nhầm thẩm quyền Cambridge.
- Try again ẩn review, xóa response và trả focus về textarea.
- Hai finding `P4R6-A7-F001` và `P4R6-A7-F002` là `CLOSED_VERIFIED`; required open findings = 0.

Bằng chứng quyết định:

- `evidence/p4r-6/a6/A6_LEARNER_VISIBLE_QA.md`
- `evidence/p4r-6/a6/A6_LEARNER_VISIBLE_QA.json`
- `evidence/p4r-6/a7/A7_PEDAGOGY_RECHECK_FINAL.md`
- `evidence/p4r-6/a7/A7_PEDAGOGY_RECHECK_FINAL.json`
- `evidence/p4r-6/a7/A7_BROWSER_RECHECK.json`

P4R-6 được đóng và đủ điều kiện chuyển sang clean-room release gate P4R-7.

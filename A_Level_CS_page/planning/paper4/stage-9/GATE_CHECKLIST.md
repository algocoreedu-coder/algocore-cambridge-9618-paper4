# Stage 9 gate checklist

## S9-0

- [x] Stage 6 manifest/hash và detached PASS được khóa.
- [x] Stage 8 manifest/hash và detached PASS được khóa.
- [x] Learning-page contract hash được khóa.
- [x] Denominator 13/26/58/174/331 được khóa.
- [x] Route, owner, reviewer và rework policy được ghi.

## S9-A

- [x] Missing-content lessons được khắc phục qua S9-R/R2/R3/R3.2 và review chéo.
- [x] Canonical block mapping, source resolver và locale acceptance được triển khai.
- [x] Exact set 13 package, 26 lesson, 58 pattern.
- [x] 260 block bắt buộc có stable IDs/anchors.
- [x] Builder deterministic; verifier có negative guards cho nguồn, bilingual sâu và pedagogy 26/26.
- [x] Không duplicate/orphan/unsafe href; 138/138 unique locator resolve.

## S9-B

- [x] 26 slug được khóa bởi `generateStaticParams` và exact slug guard.
- [x] 10 section render đúng thứ tự và deep link.
- [x] Action View join đúng pattern; 20 runtime lesson và 6 static lesson.
- [x] `notFound`, metadata, typecheck và production build PASS.

## S9-C

- [x] Course hub hiển thị 13 package/26 lesson.
- [x] Previous/next/prerequisite không dead link.
- [x] Keyboard navigation và visual-lab link hoạt động.

## S9-D

- [x] Source/marking authority labels đúng, không gán điểm Cambridge tự suy diễn.
- [x] 26/26 VI/EN parity, gồm nested learner content và UI labels.
- [x] 260/260 block pedagogy; worked/practice/retrieval/marking contract 26/26.
- [x] Mobile 320 px, light/dark, reduced-motion, focus và heading hierarchy PASS.
- [x] Required findings = 0 sau R3.2 Lead closure.

## S9-E/F

- [x] A8 clean-room exact-set/source/routes/typecheck/build/browser baseline PASS; post-R3.2 harness rerun PASS.
- [x] Spotcheck đủ 13 package, boundary và failure scenario.
- [x] Manifest SHA-256 và detached verifier PASS.
- [x] Lead double-check và gate review ký RELEASE.

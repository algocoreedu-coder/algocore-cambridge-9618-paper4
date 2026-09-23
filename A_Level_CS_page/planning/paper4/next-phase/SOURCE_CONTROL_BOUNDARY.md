# Source-control boundary

## Decision

`A_Level_CS_page/algocore-fumadocs` là repository boundary cho application source, schemas, generators, tests và generated application registries.

`A_Level_CS_page/planning/paper4/stage-0` đến `stage-9` và corpus ở ngoài boundary này được xem là upstream immutable evidence. P4R-0 khóa chúng bằng SHA-256 trong `INPUT_LOCK.json`; app không được sửa upstream khi generate candidate v2.

Canonical authoring source mới sẽ được đặt trong repository app dưới một thư mục riêng như `content/paper4/` sau khi schema P4R-1 được Lead duyệt. Review evidence và release reports tiếp tục nằm trong `planning/paper4/next-phase/evidence/` và không được dùng như authoring input.

## Baseline rules

- `node_modules`, `.next`, logs và `.codex-runtime` không được track.
- `.node-version` pin Node 22; clean release dùng `npm ci`.
- Generated registries được track ở baseline để diff, nhưng `check:*` không được ghi lại chúng.
- Mọi external planning/corpus input phải đi qua allow-listed input lock và hash verifier.
- Không thêm nested evidence tree vào release manifest bằng recursive glob.

## Rollback

Git commit đầu tiên trong app repository là source baseline sau post-release Python renderer repair: `8aec6e5 chore: baseline Paper 4 app before recovery v2`. Candidate v2 được phát triển trên branch `codex/paper4-recovery-v2`; release tag/commit chỉ được tạo sau P4R-7 PASS.

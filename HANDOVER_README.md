# AlgoCore Cambridge 9618 Paper 4 — Source handover

Snapshot bàn giao ngày 23/09/2026 cho chương trình Cambridge International A Level Computer Science 9618 Paper 4, Python, định hướng kỳ thi 2026.

## Nội dung bàn giao

- `A_Level_CS_page/algocore-fumadocs`: ứng dụng Next.js/Fumadocs đang chạy Paper 4 Learning Page và Practice Lab.
- `A_Level_CS_page/content`, `curriculum`, `assessments`: nội dung học, registry và dữ liệu đánh giá.
- `A_Level_CS_page/planning/paper4`: toàn bộ kế hoạch, schema, evidence và kết quả QA từ các stage.
- `A_Level_CS_page/sources`: nguồn dữ liệu dự án đang tham chiếu.
- `A_Level_CS_page/website`, `chapter13-*`: các phần liên quan được giữ nguyên trong cấu trúc dự án gốc.
- Teacher Guide độc lập nằm tại `A_Level_CS_page/planning/paper4/teacher-guides/PAPER4_PRACTICE_LAB_TEACHER_GUIDE_VI.docx`.

Canonical web app: `A_Level_CS_page/algocore-fumadocs`.

## Thành phần được loại khỏi snapshot

Các mục dưới đây là dependency, build output, cache hoặc lịch sử version-control có thể tái tạo:

- `.git`
- `node_modules`
- `.next`
- `.codex-runtime`
- `__pycache__`
- `.pytest_cache`
- `tsconfig.tsbuildinfo`
- file log và file tạm hệ điều hành

Không có source, content, planning hay evidence nào bị loại.

## Yêu cầu môi trường

- Node.js 22 trở lên.
- npm đi kèm Node.js.
- Python 3.11 trở lên cho các script tạo và kiểm tra Python artifact.
- Windows PowerShell nếu dùng các script hỗ trợ ở thư mục gốc bàn giao.

## Khởi động nhanh

Tại thư mục bàn giao, chạy:

```powershell
.\START_LOCAL.ps1
```

Hoặc chạy thủ công:

```powershell
cd .\A_Level_CS_page\algocore-fumadocs
npm ci
npm run dev
```

Mở `http://127.0.0.1:3018/paper-4`.

## Kiểm chứng source

Chạy:

```powershell
.\VERIFY_PROJECT.ps1
```

Script sẽ cài dependency nếu cần, chạy typecheck và bộ kiểm tra Paper 4 v2 app. `HANDOVER_MANIFEST.json` ghi commit nguồn, branch, số lượng file, dung lượng, phạm vi và các mục đã loại.

## Git baseline

- Branch nguồn: `codex/paper4-recovery-v2`
- Commit nguồn: `a2bbfb90fa971e7aa9013506353e2b8508a131e8`
- Working tree tại thời điểm bàn giao: clean

Snapshot này không chứa `.git`. Nếu cần tiếp tục version-control, tạo repository mới tại `A_Level_CS_page/algocore-fumadocs` hoặc kết nối lại remote phù hợp.


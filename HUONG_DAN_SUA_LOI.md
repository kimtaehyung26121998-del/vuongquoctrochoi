# Sửa lỗi cài đặt dự án Vương Quốc Toán Học

## Hai lỗi độc lập
1. Starter 0.1 dùng nhầm MediaPipe `0.10.22`. Đã sửa đồng bộ `package.json` và `src/ai/usePoseCamera.ts` về `0.10.21`.
2. Codex báo `setup refresh had errors` là lỗi quyền / môi trường của phiên Codex, không phải do webcam. Hãy thoát phiên Codex cũ (Ctrl+C nếu cần); mở terminal mới tại thư mục dự án; chạy `codex --sandbox workspace-write --ask-for-approval on-request`. Cấp quyền khi được hỏi, dùng `/status` để xác nhận thư mục có quyền ghi.

## Lệnh trong PowerShell mới (KHÔNG gõ trong chat Codex)
```powershell
cd "DUONG_DAN_DEN_THU_MUC_DU_AN"
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Sau đó mở http://127.0.0.1:5173 (hoặc URL do terminal in ra).
Nếu đã giải nén bản cũ, chỉ cần chép đè `package.json` và `src/ai/usePoseCamera.ts` từ bản vá, không cần chép đè ảnh và âm thanh.
Chỉ khi lỗi phụ thuộc vẫn tồn tại, xóa `node_modules` và `package-lock.json` rồi cài lại.

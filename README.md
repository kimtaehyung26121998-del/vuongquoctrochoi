# VƯƠNG QUỐC TRÒ CHƠI · Game Toán lớp 2 bằng webcam

**Bản thử nghiệm 0.1, một học sinh, một webcam laptop.** Có 36 PNG tách từ sprite sheet, 33 file âm thanh (5 nhạc nền + 28 hiệu ứng), 12 câu toán qua 4 màn, nhận diện tư thế A/B/C/D và tư thế nghỉ qua MediaPipe. Video được xử lý tại trình duyệt, không tải lên máy chủ.

## Chạy trên Windows / VS Code

1. Tải file ZIP starter từ ChatGPT, giải nén **nội dung bên trong** vào thư mục `vương quốc trò chơi` đang mở bằng VS Code.
2. Trong terminal **đang đứng đúng thư mục có `package.json`**, gõ:

```powershell
npm.cmd install
npm.cmd run dev
```

3. Mở địa chỉ do Vite hiện ra (thường `http://127.0.0.1:5173`). `localhost`/`127.0.0.1` được trình duyệt cho phép mở webcam.
4. Chọn **Luyện tập webcam → Bật webcam**, đồng ý cấp quyền truy cập. Đứng đủ xa để thấy đầu, vai, hai tay và hông. Bắt đầu bằng **tư thế nghỉ** (hạ hai tay 0,5 giây), tạo một dáng và giữ đủ 1 giây.
5. Chọn **Chơi 12 câu toán** để thử trò chơi. Có thể bấm tay vào đáp án để kiểm thử khi chưa mở webcam.

> **Lưu ý:** Lần chạy đầu máy tính cần Internet để tải file WASM và mô hình MediaPipe; chưa đóng gói mô hình offline. Cần kiểm tra lại độ chính xác A/B/C/D trên người thật; đặc biệt là dáng C. Webcam laptop không được nhận diện bằng phép màu khi tay/hông bị khuất.

## Để Codex tiếp tục công việc từ cuộc chat ChatGPT

Không có chế độ đảm bảo **tự động nhập toàn bộ lịch sử chat này vào Codex CLI**. Thay vào đó, dự án đã chứa tài liệu chuyển giao:

- `AGENTS.md`: quy tắc và yêu cầu Codex tự đọc khi mở thư mục dự án.
- `docs/CHAT_HANDOFF.md`: quyết định từ cuộc chat, tiến độ và việc cần tiếp tục.
- `docs/TECHNICAL_SPEC.md`: giải thích thuật toán và giai đoạn game.
- `docs/ASSET_NOTES.md`: hướng dẫn sử dụng và hạn chế của sprite sheet.

Khi đang ở giao diện Codex trong terminal, nhập:

```text
Hãy đọc AGENTS.md, README.md, docs/CHAT_HANDOFF.md và docs/TECHNICAL_SPEC.md. Đây là dự án Vương quốc Trò chơi đã được tạo từ một cuộc hội thoại ChatGPT. Kiểm tra dự án, chạy npm install và npm run build, sửa lỗi nếu có. Tiếp theo ưu tiên thử webcam thật, hiển thị 33 khớp và chỉnh thuật toán A/B/C/D theo tài liệu. Không thay đổi bộ asset nếu chưa cần.
```

Nếu terminal đang ở shell PowerShell thay vì giao diện Codex, chạy `codex` trước. **Tránh** `codex resume` nếu bạn đang muốn dùng dự án này nhưng phiên cũ là của một dự án khác.

## Kiểm tra trước khi triển khai Vercel

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Triển khai trên Vercel bằng preset Vite: Build Command `npm run build`, Output Directory `dist`.

## Điều được hoàn thành và chưa hoàn thành

**Đã có:** React + Vite, hook webcam, skeleton overlay (các khớp chính), phân loại A/B/C/D/NEUTRAL, cơ chế giữ dáng + chờ về nghỉ, bảng luyện tập, 12 câu toán, đồ họa tách và âm thanh, fallback chọn tay.

**Chưa kiểm chứng:** chạy thực tế trên webcam Windows, độ chính xác ở trẻ em, tính tương thích các phiên bản package tải từ npm (môi trường tạo gói bị hạn chế kết nối npm). Không quảng cáo đây là sản phẩm đã sẵn sàng sử dụng toàn lớp.

**Phát triển tiếp:** chỉnh các ngưỡng theo thử nghiệm, tách 4 ảnh nền thành bản full HD, tạo chế độ giáo viên, báo cáo kết quả, lưu bộ câu hỏi, tối ưu hiệu suất bằng Worker nếu cần.

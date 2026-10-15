# BÀN GIAO NGỮ CẢNH TỪ CUỘC CHAT CHATGPT SANG CODEX

> **Đọc bản cập nhật mới nhất trước:** [SESSION_HANDOFF_2026-10-15.md](SESSION_HANDOFF_2026-10-15.md). Đã hoàn thành bốn màn và tải đủ mã lên GitHub `kimtaehyung26121998-del/vuongquoctrochoi`; Vercel đang chờ người dùng kết nối. Bản cập nhật ghi rõ nhận diện D mới nhất, kiểm thử, cấu hình giao diện và khác biệt Git local/remote. Nội dung dưới đây là bàn giao ban đầu.

## Người dùng muốn gì?

Xây một game tương tác Toán lớp 2 với bộ câu hỏi có phương án A/B/C/D. Học sinh không chỉ bấm chuột: camera laptop nhận biết tư thế cơ thể tương ứng với đáp án. Dùng VS Code, phát triển bằng React + TypeScript + Vite, deploy Vercel.

## Quyết định đã chốt trong cuộc chat

- Tên game: **Vương quốc Toán học**, một game phiêu lưu 4 màn.
- Camera: **webcam tích hợp laptop**.
- Số người chơi được nhận diện: **1 học sinh mỗi lượt**, không nhận đồng thời cả lớp.
- 4 tư thế: A hai tay chụm trên đầu, B hai tay gần vai, C người nghiêng và tay tạo dáng cong, D hai tay chống hông.
- Thêm **tư thế nghỉ** (hai tay hạ xuống) để chống nhận lại đáp án câu trước.
- Tạo ảnh minh họa bằng **nhân vật hoàn toàn mới**, không sử dụng Doraemon.
- Thời gian giữ dáng thiết kế: khoảng **1 giây**; cần thử thật. Tư thế nghỉ ~0,5 giây.
- Người dùng đã yêu cầu chuẩn hóa toàn bộ asset, tạo âm thanh và bắt đầu code; đồng thời muốn Codex trong terminal VS Code hiểu ngữ cảnh.

## Bộ tài sản đã có

- Sprite sheet gốc + file crop thành 36 hình PNG trong `public/assets/`, xem `asset-manifest.json`.
- Nhân vật dẫn chuyện cú mèo, 5 tư thế A/B/C/D/nghỉ, 4 ảnh nền thumbnail, 4 pha lê, icon UI, boss, kho báu.
- 5 nhạc nền OGG và 28 hiệu ứng WAV trong `public/audio/`.

## Quy tắc sản phẩm

1. Học sinh có thời gian đọc/tính toán, camera không được chấm trong trạng thái THINKING.
2. Camera chốt đúng một lần sau khi giữ dáng ổn định, không chấm dao động giữa các khung hình.
3. Phải có phương án click chuột cho giáo viên khi camera nhận lỗi.
4. Không gửi video trẻ em lên server hoặc ghi ảnh.
5. Đúng: phát âm thanh vui, cộng 10 điểm. Sai: giải thích nhẹ nhàng, không phạt cảm xúc.
6. Bản thử nghiệm chưa có backend; nếu sau này cần quản lý giáo viên, báo cáo thì tách thành module mới.

## Việc Codex nên làm đầu tiên

1. Kiểm tra `package.json`, `src/ai/poseClassifier.ts`, `src/ai/usePoseCamera.ts`, `src/ai/stabilizer.ts`, `src/App.tsx`.
2. Cài dependency và chạy build/typecheck. Sửa lỗi TypeScript hoặc bất tương thích API.
3. Cho người dùng chạy bản local trên laptop và báo tình trạng mở webcam.
4. Tối ưu nhận diện tư thế B/C/D bằng dữ liệu kiểm thử quan sát thực tế; nếu dáng C khó, đề nghị một dáng thay thế dễ phân biệt trước khi code mở rộng.
5. Sau khi P0 nhận diện đạt yêu cầu mới nâng cấp hoạt hình, giao diện game/giáo viên.

## Tránh nhầm lẫn

Cuộc chat ChatGPT không tự động truyền toàn bộ lịch sử vào phiên Codex CLI. `AGENTS.md` và tài liệu này là bản chuyển giao thông tin có chủ đích. Nếu có yêu cầu mới của người dùng mâu thuẫn, ưu tiên xác nhận lại.

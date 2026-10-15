# Codex: chỉ dẫn cho dự án Vương quốc Trò chơi

- Ngôn ngữ trao đổi và tài liệu với người dùng: **tiếng Việt**.
- Đây là một game toán lớp 2 dùng webcam tích hợp laptop, **một học sinh mỗi lượt**.
- Đọc `docs/CHAT_HANDOFF.md` và `docs/TECHNICAL_SPEC.md` trước khi thay đổi kiến trúc.
- Frontend React + TypeScript + Vite, AI MediaPipe chạy ngay trên browser. Video không được gửi/lưu trên server.
- Tư thế: A hai tay trên đầu; B hai bàn tay gần vai; C nghiêng người và một tay trên một tay dưới; D chống hông; tư thế nghỉ hai tay buông để mở khóa lượt mới.
- Giữ một dáng đủ ~1000ms mới xác nhận; về tư thế nghỉ đủ ~500ms mới được xác nhận câu tiếp; không chấm lặp.
- Bộ asset gốc `public/assets/master_spritesheet.png`, các hình tách `public/assets/**`, nguồn crop `scripts/split_assets.py`; nhạc âm thanh tại `public/audio/**`.
- Không tự thay nhân vật thành Doraemon; bộ hình là nhân vật gốc.
- Ưu tiên chạy `npm install`, `npm run build` và sửa lỗi; sau đó kiểm thử webcam thực, đặc biệt dáng C. Chưa có xác nhận độ chính xác trên máy thực.
- Không tăng phạm vi thành nhiều học sinh, webcam đám đông, database hoặc đăng nhập ở giai đoạn prototype.
- Không ghi/lưu ảnh trẻ em hoặc video webcam vào file/log/analytics.
- Thay đổi logic game theo state rõ ràng (thinking → answering → feedback → next); sai do webcam cần được tách khỏi sai do toán.
- Khi gặp lỗi MediaPipe WASM/model vì CDN, giải thích nguyên nhân rõ ràng và cân nhắc tải về `public/models` để chạy ổn định.

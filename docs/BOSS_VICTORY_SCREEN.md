# Màn hình chiến thắng Boss

Sau khi phá đủ ba lớp khiên và kết thúc hoạt hình Boss, hiện màn hình riêng với dòng **Chúc mừng bạn đã tiêu diệt Boss!**, cúp vàng chuyển động, sáu chùm pháo hoa nhiều màu, ba sao và điểm màn Boss. Có nút về bản đồ, chơi lại Boss và bật/tắt tiếng theo trạng thái âm thanh hiện hành. Dùng ảnh cúp sẵn có, không thêm dependency. Thiết lập giảm chuyển động của hệ điều hành được tôn trọng.

Giữ nguyên luật điểm/sát thương, mở khóa, camera và ba màn đầu. Engine cũ vẫn gắn trong DOM nhưng ẩn khi chiến thắng để giữ phần tử video/canvas ổn định; camera vẫn dừng theo luồng hoàn thành hiện hành. Hết ngân hàng câu hỏi mà Boss còn khiên không hiển thị chiến thắng. Chơi lại đóng màn chiến thắng và rút bộ câu mới như cũ.

File thay đổi:
- `src/stages/boss/BossVictoryScreen.tsx`: màn chúc mừng, điều hướng và focus tiêu đề.
- `src/stages/boss/bossVictory.css`: bố cục, cúp chuyển động, pháo hoa, responsive và giảm chuyển động.
- `src/adventure/AdventureStage.tsx`: gắn màn kết thúc riêng khi Boss finish.
- `tests/boss-regression.mjs`: kiểm tra chỉ hiện sau thắng, có cúp/pháo hoa, chơi lại đóng màn, hết pool chưa thắng không hiển thị.
- Tài liệu này.

Sao lưu trước sửa: `backups/before_boss_victory_20261015_131422.zip`.

Kiểm chứng: toàn bộ 12 bộ `npm test` đạt; sau bổ sung assertion màn chiến thắng, `node tests/boss-regression.mjs` đạt; `npm run build` thành công. Chưa kiểm tra trực quan bằng trình duyệt hoặc webcam thật trong phiên này.

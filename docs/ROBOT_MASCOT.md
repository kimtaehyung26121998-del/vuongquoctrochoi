# Robot đồng hành — 15/10/2026

Thay nhân vật cú bằng bốn biểu cảm từ ảnh người dùng cung cấp
`Bộ bốn robot hoạt hình đáng yêu.png`:

- `robot_neutral.png`: trạng thái bình thường.
- `robot_guide.png`: dẫn đường, giới thiệu và hướng dẫn.
- `robot_cheer.png`: trả lời đúng, cổ vũ và chiến thắng.
- `robot_thinking.png`: suy nghĩ và hỗ trợ khi chưa đúng.

Các PNG tại `public/assets/mascot/` có nền trong suốt, cùng khung
420 × 660 và cùng đường chân. Xem `robot_contact_sheet.png` để kiểm tra
bốn hình. Ảnh gốc và bộ asset cú cũ được giữ lại.

Tách lại bằng PowerShell trên Windows:

```powershell
./scripts/split_robot.ps1 -SourcePath 'Bộ bốn robot hoạt hình đáng yêu.png'
```

Script tách vùng liên thông theo alpha trong từng dải nhân vật để giữ bàn
tay ở phần chồng tọa độ ngang. Không tạo lại nét vẽ hoặc biểu cảm.

Đã thay đường dẫn ảnh và lời dẫn trên bản đồ, bốn màn, phòng luyện và
màn chiến thắng. Các hình hướng dẫn A/B/C/D giữ bộ dáng riêng hiện có.

Kiểm chứng: build thành công và toàn bộ 15 bộ `npm test` đạt. Các kiểm
tra văn bản/ảnh kỳ vọng được cập nhật theo robot; baseline hash chỉ cập
nhật bốn file giao diện có thay nhân vật (ForestAdventure, LegacyApp,
RainbowScene, TreasureIslandScene). Không đổi logic camera/chấm điểm.
Đã kiểm tra trực quan ảnh tách; chưa kiểm tra trực quan toàn bộ game
trong trình duyệt vì công cụ trình duyệt không khả dụng ở phiên này.

# Hoạt ảnh ba màn — 15/10/2026

- Rừng: đúng → robot gõ búa ba nhịp, bụi bay → đoạn cầu hiện lên → robot đi sang đoạn mới. Toàn chuỗi trong 3,2 giây phản hồi sẵn có.
- Cầu Vồng: dùng bốn ảnh thiên thần được tách từ ảnh người dùng. Đang trả lời thì cổ vũ; đúng thì vung đũa, tia sáng chạy và vẽ một đoạn cầu vồng, sau đó bay qua. Khi chưa đúng dùng biểu cảm suy nghĩ.
- Kho Báu: đúng câu 1 đào bản đồ; đúng câu 2 đào chìa khóa rồi giữ trong tay; trong câu 3 vẫn cầm chìa khóa. Đúng câu 3 tiến tới rương, xoay chìa khóa, chuyển từ rương đóng sang mở và hiện pha lê. Các động tác nằm trong 1,5 giây phản hồi sẵn có.

Không thay đổi state machine, thời gian chấm/giữ dáng, camera hay cách cộng điểm. Không tạo vật phẩm/xây cầu khi sai hoặc hết giờ. Hoạt ảnh dừng theo tạm dừng; hỗ trợ bỏ hoạt hình và giảm chuyển động.

Ảnh thiên thần tại `public/assets/mascot/angel_*.png`, cùng canvas 420×750, nền trong suốt. Tách lại bằng `scripts/split_angel.ps1 -SourcePath 'Bộ nhân vật thiên thần chibi đáng yêu.png'`. Xem `angel_contact_sheet.png`.

Đạo cụ búa/xẻng được vẽ bằng SVG trong `WorkEffects.tsx`; các lớp chuyển động ở `story-effects.css`. Engine vẫn là nguồn trạng thái duy nhất. CSS trì hoãn phần hiển thị cầu/vật phẩm theo động tác, không dùng timer riêng để trao thưởng.

Kiểm tra: build và 16 bộ test đạt, gồm `story-effects.mjs` kiểm tra thiên thần cổ vũ/hóa phép, đào chỉ khi đúng và giữ chìa khóa qua câu 3. Đã xem ảnh tách; chưa kiểm tra chuyển động thực tế trong trình duyệt vì không có trình duyệt kết nối trong phiên này. Các hash bảo vệ file giao diện trong test Boss được cập nhật cho những file hoạt ảnh thay đổi có chủ đích.

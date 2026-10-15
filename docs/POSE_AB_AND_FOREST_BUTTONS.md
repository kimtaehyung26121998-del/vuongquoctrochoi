# Phân biệt A/B và đổi chỗ nút tổng kết Rừng

Sao lưu trước sửa: `backups/before_pose_ab_20261015_132152.zip`.

Trong tổng kết Rừng, **Chọn chế độ** chuyển sang bên trái và **Chơi lại** sang bên phải; hành động và kiểu nút giữ nguyên.

Đã tái hiện bằng dữ liệu khớp trường hợp hai cổ tay cao trên đầu nhưng khuỷu ngang/hơi thấp hơn vai bị trả về B. Điều kiện A cũ bắt hai cổ tay sát nhau và cả hai khuỷu cao hơn vai nên dễ bỏ sót. Classifier nay chấp nhận khoảng cách cổ tay lớn hơn và khuỷu hơi thấp, đồng thời vẫn yêu cầu cả hai cổ tay cao rõ so với mũi/vai. B được giới hạn ở vùng gần vai, có vùng đệm khi nâng tay để tránh trả về B lúc A chưa đủ rõ. Thiếu khớp vẫn UNKNOWN.

Không sửa MediaPipe, hook camera/auto-arm, stabilizer, thời gian giữ 1000ms/nghỉ 500ms, luật điểm hoặc mở khóa. Classifier dùng chung nên cải thiện A/B áp dụng cho cả bốn màn và phòng luyện.

Kiểm chứng:
- `tests/pose-ab-regression.mjs`: trước sửa thất bại B thay vì A; sau sửa 648 mẫu A/B với nhiều tỷ lệ cơ thể, phản chiếu, nghiêng nhẹ và khuỷu thấp đạt; vùng đệm/thiếu khớp được kiểm tra riêng.
- `tests/pose-bd-regression.mjs`: giữ đúng 378 mẫu B/D và 162 mẫu NGHỈ.
- `tests/answer-camera-regression.mjs`: thêm A cổ tay tách/khuỷu hơi thấp, hook thật chốt đúng A sau đủ 1000ms, không chấm lặp.
- `npm test`: toàn bộ 13 bộ đạt; kiểm thử hook mở rộng sau đó cũng đạt.
- `npm run build`: thành công.
- Chưa kiểm thử webcam thật; không khẳng định độ chính xác đã được hiệu chuẩn trên máy thực.

File thay đổi: `src/ForestAdventure.tsx`, `src/ai/poseClassifier.ts`, `tests/pose-ab-regression.mjs`, `tests/answer-camera-regression.mjs`, `tests/boss-protected-files.json` (hash hai file nguồn được sửa), `package.json` và tài liệu cập nhật.

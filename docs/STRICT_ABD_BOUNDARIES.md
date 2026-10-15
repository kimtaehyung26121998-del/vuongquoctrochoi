# Tách B nâng cao khỏi A và tay buông khỏi D

Sao lưu: `backups/before_strict_abd_20261015_133025.zip`.

Phản hồi thực tế cho thấy bản nới A trước quá rộng. Kiểm thử mới tái hiện B nâng gần mặt bị trả về A. Bản hiện hành yêu cầu cả hai cổ tay cao rõ hơn mũi để nhận A; B được phép nâng tới gần mặt nhưng vẫn gần vai. Có vùng đệm giữa hai vùng để không đoán khi tay đang chuyển dáng. Các mẫu A trước vốn đặt tay sát ngang mũi đã được sửa thành tay cao thực sự trên đầu; không giữ kỳ vọng A cho dáng ngang mặt.

D nay cần cả hai khuỷu gập rõ, khuỷu nằm ngoài cổ tay, cổ tay ở vùng eo/hông và không thấp quá hông. Chỉ cổ tay gần hông và khuỷu hơi dang không đủ chốt D. Tay gần thẳng hướng xuống, thân thẳng và cổ tay ở ngang/gần dưới hông được nhận NGHỈ; tay buông thấp hơn hông tiếp tục nhận NGHỈ như trước. Thiếu khớp vẫn UNKNOWN.

Không thay MediaPipe, useAnswerCamera/auto-arm, stabilizer hay thời gian giữ/nghỉ; không thay bố cục, luật điểm hoặc mở khóa. Đây là thay đổi classifier chung, áp dụng cả bốn màn và phòng luyện. Score vẫn là heuristic, chưa được hiệu chuẩn bằng dữ liệu webcam thực tế.

Kiểm chứng:
- 72 mẫu ranh giới mới: B cao gần mặt, A cao trên đầu, D gập khuỷu và tay buông với tỷ lệ cơ thể/phản chiếu khác nhau.
- 702 mẫu A/B; 378 mẫu B/D cũ; 162 mẫu nghỉ tay thấp vẫn đạt.
- Hook thật với khớp mô phỏng: B cao chốt B sau 1000ms, tay buông 1600ms không chốt D, tay buông mở lại lượt để chọn B lần tiếp.
- `npm test`: toàn bộ 14 bộ đạt (exit 0).
- `npm run build`: TypeScript/Vite thành công (exit 0).
- Chưa kiểm thử webcam thật; không thu/lưu video hoặc ảnh.

File sửa: `src/ai/poseClassifier.ts`, `tests/pose-abd-boundaries.mjs`, `tests/pose-ab-regression.mjs`, `tests/answer-camera-regression.mjs`, `tests/boss-protected-files.json` (chỉ hash classifier), `package.json` và tài liệu này/ghi chú đặc tả.

# Màn 01 — Rừng phép tính

## Chạy và chọn chế độ

- `npm install`, `npm run dev`, mở địa chỉ Vite hiển thị.
- Chọn **Bắt đầu phiêu lưu**, sau đó **Bật webcam & vào rừng**. Cấp quyền webcam khi trình duyệt hỏi.
- **Luyện webcam & kiểm thử 12 câu cũ** mở giao diện cũ, có phòng luyện dáng và đủ 12 câu.
- **Chọn chế độ** thoát màn hiện tại và dọn webcam/âm thanh.

## Quy tắc màn rừng

Dùng nguyên q01–q03 từ `src/data/questions.ts`. Đáp án đúng lần lượt A (65), B (44), C (86).

`intro → thinking (3 giây) → answering → feedback → next → thinking/finish`.

- Trả lời không giới hạn thời gian. Mỗi câu đúng +10 điểm, dựng một trong ba đoạn cầu, cú mèo tiến tới bờ bên kia. Tối đa 30 điểm.
- Sai không trừ điểm: hiển thị lời giải và chờ bấm **Em thử lại nhé**. Phải giải đúng cả ba câu để nối cầu hoàn chỉnh.
- Nếu đáp án sai được chọn từ tư thế nhưng giáo viên xác nhận nhận diện nhầm, bấm **Webcam chọn nhầm**: hủy lượt đó khỏi thống kê toán và thử lại. Lượt nhận diện lỗi được đếm riêng.
- Giáo viên có thể bấm trực tiếp A/B/C/D trong pha trả lời.
- Tạm dừng khóa chấm và giữ thời gian còn lại của chuyển cảnh. Video và vòng nhận diện vẫn gắn liên tục; không tạo lại camera khi xây cầu/chuyển câu.
- **Bỏ qua hoạt hình** kết thúc hiệu ứng câu hiện tại. Ô **Bỏ hoạt hình** áp dụng cho các câu sau. Không cộng thêm điểm hay bỏ qua câu hỏi.
- Nhạc rừng, đúng/sai nhẹ nhàng, xây cầu, UI và chiến thắng dùng tài nguyên hiện có. Nút tắt tiếng điều khiển cả nhạc lẫn hiệu ứng. Nhạc cũng dừng khi pause/thoát/tổng kết.
- Video không được ghi, chụp hoặc gửi lên server. Không thêm backend.

## File và sao lưu

- `src/App.tsx`: bộ chọn chế độ.
- `src/LegacyApp.tsx`: bản sao nguyên từng byte của App trước khi sửa.
- `src/ForestAdventure.tsx`: giao diện và phối hợp webcam/âm thanh.
- `src/forestState.ts`: trạng thái và quy tắc điểm/cầu/thử lại.
- `src/forest.css`: cảnh cầu bằng CSS, asset rừng/cú/sao có sẵn, bố cục màn ngang và hỗ trợ giảm chuyển động.
- `tests/forest-regression.mjs`: kiểm tra trạng thái, stabilizer/classifier, asset, render HTML và đối chiếu SHA-256.
- Sao lưu trước triển khai: `backups/before-forest-20261015_082708/` chứa src, docs, package và mã băm. Không chỉnh sửa asset gốc.

Không thay đổi `src/ai/usePoseCamera.ts`, `poseClassifier.ts`, `stabilizer.ts`, `src/data/questions.ts` hoặc `src/styles.css`. Giữ nguyên cơ chế auto-arm/chặn lặp của phiên bản người dùng đã kiểm thử, không chỉnh ngưỡng nhận diện.

## Kiểm tra tự động

Chạy `node tests/forest-regression.mjs` và `npm run build`.

Đã kiểm tra: pha không nhận đáp án, chấm trùng, pause, sai/thử lại, phân biệt camera nhận nhầm, ba lần xây cầu, điểm tối đa, tổng kết/chơi lại; classifier với khớp tổng hợp A/B/C/D/nghỉ; giữ dáng 1000ms/nghỉ 500ms; đối chiếu nguyên vẹn AI, 12 câu và LegacyApp; asset tồn tại; render HTML có video/canvas.

Đây là kiểm tra mã và khớp tổng hợp, không thay thế đo độ chính xác từ người thật.

## Kiểm thử trực tiếp cần thực hiện trên laptop

Phiên triển khai không có trình duyệt kết nối (danh sách browser rỗng), nên chưa xác minh trực quan hoặc webcam thật cho giao diện mới.

1. Mở trên màn 1366×768/1920×1080 hoặc trình chiếu toàn màn hình. Kiểm tra câu hỏi, đáp án, cầu và webcam không bị cắt; ảnh nền gốc là thumbnail nên độ nét có giới hạn.
2. Bật webcam; thử A/B/C/D tại phòng luyện cũ, đặc biệt C. Trong màn rừng, giải A → B → C và quan sát cầu tăng 1 → 2 → 3, điểm 10 → 20 → 30, cú di chuyển và chiến thắng.
3. Giữ nguyên dáng xuyên qua hoạt hình/chuyển câu: không chấm trong thinking/feedback; thử lại cùng chữ sau khi nghỉ 0,5 giây theo cơ chế cũ.
4. Chọn sai bằng webcam, xem lời giải; thử riêng hai nút thử lại và camera chọn nhầm. Xác nhận không bị trừ điểm và thống kê lỗi camera tách riêng.
5. Pause trong suy nghĩ, trả lời và hoạt hình; chờ vài giây rồi tiếp tục. Không tự chấm hoặc chuyển câu lúc pause; camera không bị khởi động lại.
6. Thử bấm đáp án cùng lúc webcam xác nhận; không cộng điểm/hai đoạn cầu trùng. Thử nút bỏ hoạt hình, ô bỏ hoạt hình, chơi lại, thoát trong lúc camera đang tải.
7. Nghe nhạc/hiệu ứng, tắt/bật tiếng; không còn âm thanh sau thoát. Từ chối camera hoặc ngắt mạng CDN: chọn thủ công vẫn hoàn thành được.
8. Vào chế độ cũ và hoàn thành đủ 12 câu. Đây là hồi quy webcam trực tiếp còn cần người dùng xác nhận.

Nếu CDN tải WASM/model thất bại, kiểm tra Internet và thông báo camera. Bản này giữ nguồn model hiện tại để tránh tác động module đã ổn định; có thể đóng gói model vào `public/models` ở thay đổi riêng khi cần.

## Cập nhật Answer Engine

Bản sửa 15/10/2026 đưa hai màn về `useAnswerCamera` chung, giữ chính sách auto-arm đã hoạt động của Rừng. Hook webcam chỉ thêm chẩn đoán và hướng dẫn nghỉ; classifier/stabilizer không đổi. Đồ họa, nội dung, nhạc và luật điểm giữ nguyên. Xem [CAMERA_ANSWER_FIX.md](CAMERA_ANSWER_FIX.md) để biết nguyên nhân, kiểm thử và cách bật Công cụ giáo viên.

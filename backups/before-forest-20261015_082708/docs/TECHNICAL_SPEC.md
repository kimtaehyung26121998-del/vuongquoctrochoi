# Đặc tả kỹ thuật P0/P1

## Luồng

1. Học sinh vào trang, cấp quyền camera qua `navigator.mediaDevices.getUserMedia`.
2. MediaPipe `PoseLandmarker` ở `runningMode: VIDEO`, `numPoses:1` nhận khớp. Các điểm cần thiết: nose 0, shoulders 11/12, elbows 13/14, wrists 15/16, hips 23/24.
3. `poseClassifier` dùng khoảng cách tỷ lệ vai/thân để nhận `A`, `B`, `C`, `D`, `NEUTRAL`, `UNKNOWN`. Các score 0.77..0.9 là heuristic, KHÔNG được gọi là xác suất đúng.
4. `PoseStabilizer`: cần 500ms trung tính để armed; giữ một đáp án 1000ms mới phát sự kiện; sau đó locked cho tới khi neutral đủ lâu.
5. Trong game: `thinking` 3 giây → `answering` 15 giây → `feedback` khoảng 3,3 giây → câu tiếp theo. 12 câu chia 4 vùng, mỗi câu đúng +10 điểm. Click vào đáp án cũng chấm khi cần.
6. Camera nhận diện có thể hiển thị trong suốt thời gian game nhưng sự kiện xác nhận chỉ được chấp nhận khi `answering`.
7. Không lưu video vào máy hay backend.

## Hạn chế cần kiểm thử

- Cần thấy đầu, vai, khuỷu tay, cổ tay và hông; webcam laptop góc hẹp hoặc đặt quá gần dễ mất dấu.
- Dáng C dựa trên độ nghiêng trục vai-hông và chênh cao tay: dễ sai khi người bị che/khuất.
- `detectForVideo()` chạy đồng bộ và có thể block main thread; hiện giới hạn suy luận khoảng 15fps cho prototype. Bản nâng cấp có thể dùng Worker, benchmark thật.
- Mô hình/wasm tải từ CDN và Google Cloud Storage, cần Internet ở lần tải; nên localize nếu sản xuất.
- 4 hình background là ảnh thumbnail từ sprite sheet, chưa đạt FullHD.
- ImageGen sinh sprite sheet có chi tiết sát nhau: crop tự động dùng bounding box thủ công, cần kiểm tra viền/dư ảnh trên từng PNG.

## Giai đoạn tiếp theo

P0: xác minh webcam + 4 tư thế trên máy Windows + học sinh thật.
P1: hoàn thiện game 12-20 câu, giao diện/hoạt hình, nhạc nền.
P2: giáo viên tự nhập bộ đề, nhập Excel, lưu cục bộ, báo cáo.
P3: backend xác thực giáo viên và kết quả, Vercel Functions + Postgres khi cần.
P4: xét hỗ trợ nhiều người hoặc nhiều máy sau khi P0 ổn định.

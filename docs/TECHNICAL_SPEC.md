# Đặc tả kỹ thuật P0/P1

> D chống hông nay cho phép khuỷu dang vừa, không bắt rộng hơn vai; vẫn phân biệt với tay buông theo hướng cẳng tay/góc gập. Xem [NATURAL_D_FIX.md](NATURAL_D_FIX.md).

> Ranh giới A/B/D mới nhất: A phải cao rõ trên mũi, B nâng gần mặt vẫn nhận B; D phải gập khuỷu và chống hông, tay buông gần thẳng nhận NGHỈ. Ghi chú nới A cũ bên dưới được thay thế ở phần độ cao cổ tay. Xem [STRICT_ABD_BOUNDARIES.md](STRICT_ABD_BOUNDARIES.md).

> Cập nhật A/B: nới vị trí khuỷu/khoảng cách cổ tay của A khi cả hai tay cao rõ; B có giới hạn độ cao và vùng đệm để không nhận nhầm tay đang trên đầu. Xem [POSE_AB_AND_FOREST_BUTTONS.md](POSE_AB_AND_FOREST_BUTTONS.md).

> Sửa nhận NGHỈ: tay hạ dưới hông/khuỷu hơi dang được xét NGHỈ trước D, tránh khóa lượt và thanh giữ dáng đứng 0%. Không sửa MediaPipe hoặc stabilizer. Xem [NEUTRAL_UNLOCK_FIX.md](NEUTRAL_UNLOCK_FIX.md).

> Nhận đáp án hiện hành: `useAnswerCamera` chuyển xác nhận trực tiếp trong RAF tới engine; chỉ đánh dấu event sau khi chấm nhận. Không khóa riêng Boss sau câu sai. Kiểm thử sai liên tiếp rồi đúng và cạnh tranh timeout cho cả bốn màn: [CAMERA_DELIVERY_RACE.md](CAMERA_DELIVERY_RACE.md).

> Sửa mất đáp án khi chuyển câu: cửa sổ camera được mở/reset đồng bộ trong commit trước RAF bằng `useLayoutEffect`. Giữ nguyên MediaPipe, stabilizer và auto-arm; kiểm thử tích hợp cả bốn màn dưới StrictMode. Xem [CAMERA_DELIVERY_RACE.md](CAMERA_DELIVERY_RACE.md).

> Mở khóa hiện hành (15/10/2026): mỗi lần mở/tải lại trang chỉ mở màn Rừng; hoàn thành lần lượt mới mở Cầu Vồng → Đảo Kho Báu → Boss. Tiến trình giữ trong bộ nhớ App khi quay về bản đồ, không đọc/ghi localStorage. Các ghi chú lưu mở khóa bên dưới mô tả phiên bản cũ.

> Ngân hàng hiện hành: 50 câu cộng không nhớ/trừ không mượn trong phạm vi 100, dùng chung cho bốn màn và phòng luyện. Mỗi lần bắt đầu/chơi lại rút bộ ngẫu nhiên, không lặp trong một vòng bộ bài. Xem [QUESTION_BANK_50.md](QUESTION_BANK_50.md).

> Phản hồi mới: ba màn đầu không lộ đáp án đúng/lời giải khi sai hoặc hết giờ. Boss giữ đồng hồ khi camera báo cần nghỉ để lặp cùng chữ, vẫn giữ nguyên auto-arm/stabilizer. Xem [FEEDBACK_AND_BOSS_REARM.md](FEEDBACK_AND_BOSS_REARM.md).

> Màn 4 đã tích hợp: Boss có 3 HP, chỉ đáp án đúng gây sát thương/cộng điểm. Sai/hết giờ dùng câu thay thế trong ngân hàng 9 câu; hết câu chưa thắng cho luyện tập lại, không ghi hoàn thành. Ba màn trước giữ luật cũ hiện hành. Xem [báo cáo Boss](boss-module/INTEGRATION_REPORT.md).

> Luật mới nhất (15/10/2026): sai/hết giờ phải làm lại đến khi đúng; chỉ đúng đủ 3 câu mới hoàn thành/mở màn tiếp theo. Classifier chung đã tách vùng D/B theo phản hồi người dùng. Xem [POSE_D_AND_MASTERY.md](POSE_D_AND_MASTERY.md). Nội dung cũ “sai vẫn đi tiếp” bên dưới đã được thay thế.

> Cập nhật màn 3 (15/10/2026): Đảo Kho Báu dùng chung AdventureStage/useAnswerCamera, đã tích hợp bản đồ và mở khóa Boss. Chi tiết kiến trúc, kiểm thử và giới hạn: [INTEGRATION_REPORT.md](treasure-module/INTEGRATION_REPORT.md).

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

## Màn 2 và bản đồ phiêu lưu (15/10/2026)

Bản đồ bốn màn, lưu mở khóa localStorage, màn Cầu Vồng 3 câu/20 giây mỗi câu, sai hoặc chưa trả lời vẫn đi tiếp. Cấu hình và runtime màn mới tại `src/adventure/`; màn Rừng chỉ thêm callback hoàn thành. Thuật toán AI và bộ 12 câu giữ nguyên. Chi tiết triển khai và kiểm thử: [RAINBOW_STAGE.md](RAINBOW_STAGE.md).

## Sửa khác biệt mở khóa lượt trả lời giữa Rừng và Cầu Vồng

Hai màn dùng `src/ai/useAnswerCamera.ts`, cùng chính sách `usePoseCamera(answering, answering)` của Rừng. Không cần nghỉ trước đáp án đầu; cùng chữ ở lượt sau chưa thả vẫn cần nghỉ 500ms. Dáng giữ sớm không chấm trong thinking, chỉ tính đủ 1000ms từ cửa sổ answering. Instrumentation bật qua Công cụ giáo viên, không thay đổi MediaPipe/classifier/stabilizer. Xem [CAMERA_ANSWER_FIX.md](CAMERA_ANSWER_FIX.md).

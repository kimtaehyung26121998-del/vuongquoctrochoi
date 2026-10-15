# Màn 02 — Cầu Vồng Thử Thách và bản đồ phiêu lưu

> Luật mới theo yêu cầu người dùng: sai/hết giờ phải làm lại cùng câu đến khi đúng; đủ 3/3 mới nối liền cầu và mở Đảo. Xem [POSE_D_AND_MASTERY.md](POSE_D_AND_MASTERY.md); mô tả sai/hết giờ vẫn nối cầu trong bản lịch sử dưới đây không còn áp dụng.

> Cập nhật sau khi tích hợp màn 3: Đảo Kho Báu đã chơi được và hoàn thành sẽ mở khóa Boss. Các mô tả “màn 3 đang chuẩn bị” bên dưới là hiện trạng lịch sử của bản màn 2. Xem [báo cáo tích hợp màn 3](treasure-module/INTEGRATION_REPORT.md) cho hướng dẫn nghiệm thu hiện hành; màn 4 vẫn đang chuẩn bị.

## Cách chạy

`npm install`, `npm run dev`, mở địa chỉ Vite hiển thị. Dùng cùng địa chỉ (ví dụ `http://127.0.0.1:5173/`) để giữ tiến trình: localhost và 127.0.0.1 hoặc các cổng khác nhau có vùng lưu riêng.

Bản đồ hiển thị bốn vùng theo thứ tự Rừng → Cầu Vồng → Đảo Kho Báu → Lâu Đài Boss. Ban đầu chỉ Rừng mở. Hoàn thành Rừng rồi quay về bản đồ để vào Cầu Vồng. Chơi hết ba câu Cầu Vồng, kể cả khi được 0 điểm, sẽ mở Đảo Kho Báu. Màn 3/4 mới có thông tin trên bản đồ, chưa có nội dung chơi; không thể ghi hoàn thành để vượt khóa. Chế độ luyện webcam/12 câu cũ vẫn luôn truy cập được và không thay đổi tiến trình phiêu lưu.

Phiên bản Rừng trước đây chưa lưu hoàn thành, vì vậy nếu trình duyệt chưa có tiến trình thì cần hoàn thành Rừng một lần trên bản mới. Không tự đánh dấu hoàn thành từ kết quả trò chuyện.

## Luật Cầu Vồng

- Ba câu hiện có: q04 `24 + ☐ = 60` (D: 36), q05 số bé nhất (A: 39), q06 `7 × 3` (B: 21). Không thay đổi bộ 12 câu.
- `intro → thinking (3 giây) → answering (20 giây) → feedback (7 giây) → next → câu tiếp`. Sau câu 3 có `crossing` (2,6 giây) rồi `finish`.
- Đúng: một đoạn phát sáng, sao/hạt sáng, âm thanh phép thuật, Cú bay tiếp; +10 điểm và +1 sao. Tối đa 30 điểm/3 sao.
- Sai: hiện lời giải và đoạn cầu màu dịu, không cộng điểm; tự tiếp tục hoặc bấm **Đã hiểu, tiếp tục / bỏ hoạt hình**. Không cần giải đúng lại để hoàn thành.
- Hết giờ: ghi **chưa ghi nhận đáp án**, không kết luận sai toán; vẫn hiện lời giải và nối đoạn để đi tiếp. Đồng hồ chờ khi AI đang tải. Trong lỗi camera vẫn dùng chuột được; không coi lỗi kỹ thuật là đáp án sai.
- Nếu webcam chốt sai lựa chọn của học sinh, giáo viên có thể bấm **Webcam chọn nhầm — chọn lại** trong phản hồi để hủy lượt đó và mở lại câu. Chỉ áp dụng lựa chọn webcam sai, không áp dụng lựa chọn thủ công. Hết 7 giây sẽ chuyển câu; tạm dừng nếu cần thêm thời gian xem xét.
- Tạm dừng giữ thời gian còn lại, khóa chấm/chuyển câu và dừng chuyển động/nhạc. Video vẫn gắn và vòng nhận diện vẫn chạy. Sau tiếp tục giữ dáng đủ 1 giây trong lượt trả lời; nghỉ khi có hướng dẫn chống lặp chữ.
- Ô **Bỏ hoạt hình** bỏ chuyển động và rút ngắn chuyển cảnh; câu sai/hết giờ vẫn giữ 7 giây đọc lời giải. Nút tiếp tục cho phép chủ động đi tiếp ngay. Không bỏ câu hỏi hoặc cộng điểm.
- Nút bật/tắt tiếng điều khiển nhạc và hiệu ứng; thoát màn dọn camera/âm thanh. Không có ghi hình, ảnh webcam, nhật ký sinh trắc học hoặc backend.

## Giữ nguyên webcam và màn Rừng

Không sửa file nào trong `src/ai/`, `src/data/questions.ts`, `src/LegacyApp.tsx`, `src/forestState.ts`, `src/forest.css`, `src/styles.css`.

Màn Rừng chỉ thêm prop/callback `onComplete` thông báo kết quả khi vào `finish`; luồng câu hỏi, tính điểm, thử lại, camera, CSS đều giữ nguyên. Chỉ mở khóa khi hoàn thành, không mở khi thoát sớm.

Sau bản sửa Answer Engine, cả hai màn dùng `useAnswerCamera(answering)` với chính sách auto-arm của màn Rừng; xem [CAMERA_ANSWER_FIX.md](CAMERA_ANSWER_FIX.md). Giữ A/B/C/D 1000ms trong pha trả lời. Chỉ cần hạ tay nghỉ 500ms khi lặp lại cùng chữ chưa được thả; dáng cũ không tự chốt câu kế. Không khởi động lại MediaPipe khi đổi câu hoặc phát hoạt hình. Video/canvas ở cùng vị trí DOM, không có key theo câu hỏi. Chỉ bắt đầu qua nút người dùng; chỉ dừng ở tổng kết/thoát hoặc khi người dùng tắt camera.

## Cấu hình để bổ sung màn sau

- `src/adventure/stages.ts`: danh sách bốn màn, câu hỏi, asset, nhạc, thời gian trả lời, nội dung dẫn chuyện và cờ `ready`.
- `stageState.ts`: máy trạng thái dùng cấu hình; kết quả đúng/sai/chưa trả lời, chặn sự kiện cũ bằng chỉ số câu và chặn chấm trùng.
- `stageClock.ts`, `useStageClock.ts`: đồng hồ còn lại qua pause, không phụ thuộc cập nhật pose.
- `useStageAudio.ts`: vòng đời nhạc/hiệu ứng, bật/tắt và dọn tài nguyên.
- `AdventureStage.tsx`: vỏ chơi chung; `SCENES` ánh xạ tên cảnh sang component hoạt hình.
- `RainbowScene.tsx`, `rainbow.css`: ba cung cầu vồng SVG, đảo/mây CSS, Cú và ngôi sao từ asset. Chỉ animate transform/opacity, số hạt cố định 12; có hỗ trợ `prefers-reduced-motion`. CSS mới được giới hạn theo class, không sửa CSS màn Rừng.
- Thêm màn sau bằng cấu hình, component cảnh và mục tương ứng trong `SCENES`; tích hợp nhánh chọn màn trong App khi bật `ready`. Luật mới khác cách đúng/sai/hết giờ hiện tại cần mở rộng reducer có kiểm thử.

## Tiến trình cục bộ

`src/adventure/stageProgress.ts` dùng key `vuong-quoc-toan-hoc.adventure.v1` trong localStorage; chỉ lưu phiên bản, các màn hoàn thành, điểm/sao tốt nhất. Mở khóa được suy ra từ chuỗi hoàn thành liên tục, không tin cờ mở khóa riêng. Chơi lại điểm thấp hơn không mất thành tích. Dữ liệu hỏng/sai phiên bản quay về Rừng. Nếu storage bị chặn hoặc hết dung lượng, vẫn chơi trong phiên và có thông báo không lưu được trên bản đồ. Không lưu dữ liệu webcam hoặc tên học sinh.

## Sao lưu và khôi phục

`backups/before-rainbow-20261015_083804/` chứa src, docs, tests và package trước triển khai. Nếu cần phục hồi, dừng Vite rồi khôi phục các file này; các asset gốc không bị chỉnh sửa.

## Kiểm thử đã thực hiện

- `npm test`: chạy cả hồi quy Rừng và Cầu Vồng.
- Rừng: luồng/điểm/thử lại, classifier khớp giả lập, stabilizer giữ dáng/nghỉ và đối chiếu bản 12 câu gốc.
- Cầu Vồng: đủ 27 tổ hợp đúng/sai/hết giờ của ba câu; điểm/sao, không cộng trùng, bỏ sự kiện hết giờ câu cũ, pause, camera chọn nhầm, bay cuối/tổng kết/chơi lại.
- Đồng hồ: giữ đúng thời gian còn lại khi pause/resume, không reset khi gọi resume lặp.
- Tiến trình: khóa tuần tự, không thể bỏ qua Rừng, mở Đảo với 0 điểm, không mở Boss khi Đảo chưa hoàn thành, lưu/đọc lại, giữ điểm tốt nhất, dữ liệu hỏng hoặc storage bị chặn.
- SHA-256: đối chiếu các file AI, bộ đề, LegacyApp và mã/CSS Rừng với sao lưu; ForestAdventure chỉ có phần tích hợp callback hoàn thành.
- Render HTML: bản đồ đủ bốn màn/ba khóa ban đầu; các pha giới thiệu/trả lời/phản hồi sai/hết giờ/đúng/bay/tổng kết có đúng một video và canvas. Kiểm tra tài nguyên hình/âm thanh tồn tại.
- `npm run build`: TypeScript và Vite.

Các kiểm tra trên không chứng minh độ chính xác webcam thực hoặc hiệu năng hoạt hình trên laptop. Công cụ hiện không có trình duyệt/camera kết nối; chưa kiểm thử trực quan ở 1366×768/1920×1080 và chưa kiểm tra camera thật.

## Checklist kiểm thử trên laptop

1. `npm run dev`, mở bản đồ, kiểm tra màn 2/3/4 đang khóa trong trình duyệt mới; chế độ 12 câu luôn mở được. Dùng F11 trên màn 16:9 và kiểm tra các nút không bị khuất.
2. Chơi Rừng A → B → C. Quay bản đồ: Cầu Vồng mở, Đảo vẫn khóa. Tải lại trang, trạng thái vẫn còn.
3. Vào Cầu Vồng, bật camera; tạo dáng D → A → B đủ 1 giây mỗi câu; chỉ hạ tay nghỉ khi có hướng dẫn. Kiểm tra đủ ba đoạn phát sáng, Cú tiến, điểm 10 → 20 → 30, kết quả 3 sao và Đảo mở khóa.
4. Giữ nguyên dáng xuyên pha phản hồi/chuyển câu: không tự chấm; không hạ tay nghỉ thì câu mới chưa nhận. Kiểm tra cả dáng C trong phòng luyện cũ.
5. Chơi lại, chọn sai một câu: đoạn màu dịu, lời giải, không trừ điểm và vẫn đi tiếp. Thử báo camera chọn nhầm riêng. Để câu khác hết 20 giây: không có điểm/sao, hiện chưa ghi nhận đáp án, vẫn hoàn thành đủ ba đoạn.
6. Pause ở suy nghĩ/trả lời/phản hồi/bay cuối, chờ vài giây rồi tiếp tục. Đồng hồ giữ thời gian, không chấm hoặc chuyển câu khi pause; hình webcam không bị khởi động lại.
7. Thử click và giữ dáng cùng lúc gần hết giờ; mỗi câu tối đa một kết quả/10 điểm. Bấm tiếp tục nhanh nhiều lần không được bỏ mất câu.
8. Thử ô bỏ hoạt hình và nút tiếp tục, bật/tắt tiếng, chơi lại, thoát sớm rồi vào lại. Thoát sớm không mở khóa; kết quả cũ vẫn giữ.
9. Từ chối quyền camera hoặc ngắt Internet tải CDN, dùng đáp án thủ công. Thử thoát khi AI đang tải. Không chụp/lưu video học sinh để kiểm thử.
10. Sau hoàn thành màn 2, chọn Đảo trên bản đồ: thấy thông báo đã mở khóa/đang chuẩn bị; Boss vẫn khóa. Hoàn thành lại bản 12 câu để hồi quy trực tiếp webcam.

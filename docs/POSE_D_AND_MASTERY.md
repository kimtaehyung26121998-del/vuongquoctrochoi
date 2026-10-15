# Sửa nhận nhầm D/B và yêu cầu đúng đủ ba câu

Theo phản hồi người dùng ngày 15/10/2026, tài liệu này thay thế luật “sai/hết giờ vẫn đi tiếp” của Cầu Vồng và Đảo Kho Báu trong tài liệu cũ.

## Nhận diện D/B

Điều kiện cũ của B dùng bán kính quanh vai khá rộng và cho phép cổ tay xuống đến 68% chiều dài thân. D cho phép cổ tay ở dưới 46% chiều dài thân. Hai vùng chồng lấn ở eo cao, B lại được xét trước D. Đã tái hiện trường hợp này với khớp mô phỏng: tay chống eo ở khoảng 60% chiều dài thân bị nhận là B.

Bản sửa `src/ai/poseClassifier.ts` đo vị trí cổ tay dọc trục vai→hông. Hai tay dưới 40% thân mới xét B; từ trên 52% thân trở xuống, nếu gần hông và khuỷu tay mở ra, xét D trước. Khoảng 40–52% giữ trạng thái chưa rõ, tránh chốt B khi đang chuyển tay xuống eo. Các kiểm tra A, C, nghỉ và chất lượng khớp giữ nguyên. Đây là quy tắc hình học, không phải xác suất hay mô hình đã hiệu chuẩn.

Không đổi MediaPipe, URL model/WASM, lấy camera, stabilizer, auto-arm, 1000ms giữ dáng hoặc 500ms nghỉ chống lặp. Cả ba màn vẫn dùng chung `useAnswerCamera`.

## Luật hoàn thành hiện hành

- Rừng: sai chỉ báo lựa chọn chưa đúng 1,2 giây rồi tự mở lại **cùng câu ở pha answering**, không cần bấm nút và không thêm 3 giây thinking. Có thể bấm thử lại ngay hoặc báo webcam chọn nhầm. Pause giữ thời gian còn lại. Sai nhiều lần vẫn có đủ 1,2 giây phản hồi mỗi lượt; không cộng điểm hoặc xây cầu cho câu sai. Không tô đáp án đúng hoặc hiện lời giải khi sai.
- Cầu Vồng/Đảo: sai hoặc hết giờ → feedback không lộ lời giải/đáp án đúng → thinking cùng câu → trả lời lại. Có nút **Thử lại câu này** để làm lại ngay; hết thời gian phản hồi cũng quay về cùng câu.
- Retry bỏ kết quả sai/chưa trả lời của lượt hiện tại, giữ các câu đúng trước đó; chỉ câu đúng mới cộng 10 điểm một lần. Webcam chọn nhầm vẫn có nút hủy riêng, không đánh đồng lỗi nhận diện với lỗi toán.
- Chỉ đúng mới nối đoạn cầu, di chuyển Cú, trao bản đồ/chìa khóa hoặc mở rương/phát thưởng. Không mở rương sau câu cuối sai/hết giờ.
- Đúng đủ 3/3 câu mới vào tổng kết và báo hoàn thành, tổng điểm màn là 30. Màn Rừng vẫn báo sao đúng ngay lần đầu như trước; làm lại không bị trừ điểm.
- localStorage giữ key/phiên bản cũ, nhưng chỉ chấp nhận hoàn thành có đủ điểm của tất cả câu (hiện tại 30). Các màn cũ dưới 30 điểm không còn tính hoàn thành; chuỗi mở khóa dừng ở màn chưa đạt, cần chơi lại. Các màn trước đã đạt vẫn giữ nguyên.
- Nhịp nhanh ở Đảo giữ nguyên: đúng 1,5 giây, sai/hết giờ 3,5 giây trước lượt làm lại; luôn có 3 giây suy nghĩ mỗi lượt và tối đa 20 giây trả lời. Cầu Vồng giữ nhịp phản hồi 7 giây, có nút thử lại ngay.

## Sao lưu và file thay đổi

Sao lưu trước khi sửa: `backups/before_pose_d_retry_20261015_102951.zip`.

Lần chỉnh auto-retry Rừng và đường đi Cú sau đó được sao lưu tại `backups/before_forest_retry_treasure_route_20261015_103930.zip`.

- `src/ai/poseClassifier.ts`: tách vùng B/D và thứ tự ưu tiên.
- `src/adventure/stageState.ts`: retry cùng câu, chặn hoàn thành nếu còn câu chưa đúng.
- `src/adventure/stageProgress.ts`: kiểm tra đủ điểm trước khi lưu/đọc hoàn thành/mở khóa.
- `src/adventure/AdventureStage.tsx`: nút retry, lời dẫn đúng luật, chỉ thưởng/mở rương khi đúng.
- `src/adventure/RainbowScene.tsx`: chỉ nối cầu/bay khi đúng; lời nhắc thử lại.
- `src/stages/treasure/treasureModel.ts`, `TreasureIslandScene.tsx`: chỉ trao vật phẩm/tăng tiến độ khi đúng.
- Thêm `tests/pose-bd-regression.mjs`; cập nhật bốn bộ test cũ và `package.json`.
- Cập nhật `docs/TECHNICAL_SPEC.md`, `docs/RAINBOW_STAGE.md`, `docs/treasure-module/INTEGRATION_REPORT.md` và tài liệu này.

Lần chỉnh sau bổ sung `ForestAdventure.tsx` (đồng hồ phản hồi sai), `forestState.ts` (retry mở answering ngay), `TreasureIslandScene.tsx`/`treasureIsland.css` (đường đi), `tests/forest-auto-retry.mjs`, cập nhật test và lệnh `npm test`.

## Đường đi của Cú ở Đảo Kho Báu

Ba câu đúng tương ứng ba bước tiến từ điểm xuất phát đến rương. Chỉ kết quả đúng đã chốt mới làm tăng bước; sai, hết giờ và retry không đổi vị trí hoặc phát hoạt ảnh đi tiếp. Cú không có chuyển động nhấp nhô lúc đứng yên.

Đường đi và vị trí rương dùng chung mốc/kích thước CSS. Đích tính theo mép trái rương và chiều rộng Cú, có chồng nhẹ 12px để hai hình chạm nhau, thay cho tọa độ cũ dừng giữa cảnh. Sau câu cuối đúng, Cú tới rương và giữ vị trí đó ở tổng kết. Hoạt ảnh chỉ gắn vào hình Cú khi tăng số câu đúng, không remount webcam. Pause đóng băng hoạt ảnh; bỏ hoạt hình vẫn đưa Cú đến vị trí đúng.

## Kiểm thử

- So sánh trực tiếp bộ phân loại cũ/mới để tái hiện D→B; 378 mẫu phân biệt B/D/vùng đệm, nhiều tỷ lệ thân/vai, nghiêng nhẹ và phản chiếu. Khớp thiếu không được đoán đáp án.
- Chạy hook camera thật với MediaPipe và webcam mô phỏng: A/B/C/D, thêm D chống eo cao phải chốt D sau đúng 1000ms; không nhận lặp hoặc khởi tạo model giữa các câu. Đây không phải kiểm thử webcam thật.
- Rừng: giữ test retry, camera chọn nhầm, điểm, ba đoạn cầu và kết thúc.
- Component Rừng với đồng hồ mô phỏng: sai tự mở lại sau 1,2 giây, không có thinking giữa lượt; lặp sai vẫn ở cùng câu/0 điểm; pause/resume giữ timer; đủ ba câu mới hoàn thành, video không remount.
- Cầu Vồng/Đảo: 27 tổ hợp đáp án lần đầu; sai/hết giờ phải ở lại câu, thử nhiều lần không tăng điểm, sau khi sửa đúng mới tiến lên, đủ 3/3 mới hoàn thành. Pause, retry thủ công, sửa webcam, timeout, chặn chấm trùng và đồng hồ giữ nguyên.
- Component Đảo: câu 3 sai/hết giờ không mở rương, không hoàn thành; sửa đúng mới mở và thưởng một lần. Lặp sai câu 1 vẫn 0 điểm và không gọi callback hoàn thành.
- Cảnh Đảo: kiểm tra bước 0→1→2→3 khi đúng; sai/hết giờ giữ nguyên bước, không có lớp hoạt ảnh; bước cuối tới điểm đích/rương, tổng kết không bay lại. Đây là kiểm tra trạng thái/render, chưa xác minh trực quan trên trình duyệt vì không có phiên trình duyệt kết nối.
- Tiến độ: không ghi kết quả dưới 30 điểm, loại chuỗi hoàn thành cũ chưa đạt, đủ điểm mới mở màn tiếp theo, tải lại storage giữ kết quả hợp lệ.

Chưa kiểm thử webcam thật trong phiên này. Để nghiệm thu: tải lại bản local, giữ B gần vai rồi D với hai bàn tay áp hông/khuỷu mở, thử mỗi dáng 1 giây ở cả ba màn. Kiểm tra cả D chống eo cao, A, C và nghỉ; xem Debug Camera nếu còn sai. Không chụp hoặc lưu video trẻ em. Chọn sai hoặc để hết giờ ở từng màn, kiểm tra vẫn giữ câu/vật phẩm hiện tại; giải đúng đủ ba câu rồi mới thấy tổng kết/mở màn tiếp theo.

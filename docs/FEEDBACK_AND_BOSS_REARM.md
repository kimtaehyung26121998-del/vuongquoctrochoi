# Phản hồi sai và nhận câu tiếp theo ở Boss — 15/10/2026

> Cập nhật mới thay thế bước nghỉ riêng sau mọi câu sai bên dưới: engine nhận callback camera trực tiếp trong RAF; Boss đổi chữ sau sai được nhận ngay, chỉ cùng chữ chưa thả mới cần nghỉ theo stabilizer chung. Xem [CAMERA_DELIVERY_RACE.md](CAMERA_DELIVERY_RACE.md).

## Cập nhật mở lượt sau sai/hết giờ

Bản sửa trước chỉ giữ đồng hồ theo `needsNeutral` trong cửa sổ camera đã mở. Nay Boss có bước chờ nghỉ riêng theo mã lượt chơi/câu hỏi sau câu sai hoặc hết giờ. Trong bước này `useAnswerCamera` vẫn chạy camera, nhưng chưa cho chốt đáp án. Khi stabilizer chung nhận NGHỈ đủ 500ms (`pose=NEUTRAL`, `armed=true`), engine mới bật cửa sổ trả lời với auto-arm như cũ. Có thể hạ tay ngay trong phản hồi/thinking; không bắt nghỉ thêm nếu đã nghỉ đủ. Đồng hồ trả lời chờ bước mở lượt, đáp án bấm tay luôn dùng được khi answering.

Không sửa file `src/ai/`, MediaPipe hoặc stabilizer, không đổi luật ba màn đầu. Kiểm thử tích hợp hook thật với khớp mô phỏng bao phủ cùng chữ/đổi chữ sau sai, sai liên tiếp, bấm tay khi đang chờ, timeout rồi nhận câu kế, chống chấm lặp và chỉ tạo một model. Chưa tái hiện lỗi ngắt quãng trên webcam thật; thay đổi này làm rõ điều phối chuyển lượt, chưa phải kết luận nguyên nhân duy nhất trên máy thực.

Sao lưu: `backups/before_boss_rearm_20261015_123631.zip`. File sửa: `src/adventure/AdventureStage.tsx`, `tests/boss-camera-flow.mjs`, `tests/boss-regression.mjs` và tài liệu này.

Sao lưu trước khi sửa: `backups/before_wrong_feedback_boss_camera_20261015_114432.zip`.

## Ba màn đầu

Khi sai, Rừng/Cầu Vồng/Đảo chỉ báo **Đáp án [chữ đã chọn] chưa đúng**, tô riêng lựa chọn sai và cho làm lại. Không tô đáp án đúng hoặc hiển thị lời giải. Hết giờ ở Cầu Vồng/Đảo cũng không lộ lời giải. Sau khi tự chọn đúng, vẫn có thể xem lời giải và trạng thái đúng như trước.

Không thay đổi luật retry/điểm/mở khóa, đường đi Cú hoặc thời lượng hiện hành. Rừng vẫn tự mở cùng câu sau 1,2 giây; chỉ đúng mới xây cầu/nhận vật phẩm/hoàn thành.

## Trường hợp Boss bị chờ đến hết giờ

Đã tái hiện bằng engine Boss và `useAnswerCamera` thực thi với MediaPipe/webcam mô phỏng: câu đầu chọn C sai; câu tiếp theo có đáp án C nhưng học sinh giữ nguyên C. Stabilizer chặn lặp cùng chữ chưa được thả, nên không phát sự kiện xác nhận mới. Trước bản sửa, đồng hồ vẫn chạy và có thể hết giờ trong trạng thái này.

Bản sửa ở engine: khi Boss đang trả lời, camera đang chạy và báo `needsNeutral`, tạm giữ thời gian còn lại của đồng hồ; hiện rõ **Đồng hồ đang chờ — hạ hai tay nghỉ 0,5 giây**. Camera vẫn chạy và nhận tư thế nghỉ. Hạ tay nghỉ đủ, rồi tạo dáng/giữ một giây để chốt. Đáp án thủ công vẫn dùng được trong thời gian chờ. Không xóa lịch sử chống lặp hoặc tự chốt tư thế đang giữ xuyên hai câu.

Không sửa `src/ai/`, MediaPipe, classifier, stabilizer, auto-arm hoặc thời gian giữ dáng/nghỉ. Đây là sửa điều phối đồng hồ và hướng dẫn trong engine, không phải đổi thuật toán nhận diện. Test cũng xác nhận đổi sang chữ khác sau câu sai được nhận mà không tạo lại model.

Boss vẫn có lời giải sau câu sai vì lượt sau dùng câu thay thế, theo tài liệu module; sai/hết giờ không gây sát thương hoặc cộng điểm.

## File thay đổi

- `src/ForestAdventure.tsx`: ẩn lời giải/đáp án đúng sau sai, chỉ báo lựa chọn sai.
- `src/adventure/AdventureStage.tsx`: chính sách hiển thị cho Cầu Vồng/Đảo; Boss giữ đồng hồ khi cần nghỉ, thông báo rõ trên khung câu hỏi.
- `src/adventure/RainbowScene.tsx`: bỏ lời nhắc “xem lời giải” trong phản hồi sai.
- `tests/forest-auto-retry.mjs`, `rainbow-regression.mjs`, `treasure-regression.mjs`: kiểm tra không lộ lời giải/không tô đúng khi sai hoặc hết giờ.
- Thêm `tests/boss-camera-flow.mjs`: tích hợp engine + hook thật với khớp mô phỏng, kiểm tra sai C→C, nghỉ rồi chốt, sai D→B, không lặp/khởi tạo lại model.
- `tests/boss-regression.mjs`, `boss-protected-files.json`: giữ kiểm tra Boss vẫn có lời giải; chỉ cập nhật hash cho hai file giao diện Rừng/Cầu Vồng được sửa theo yêu cầu mới, mọi hash camera/model/reducer khác giữ nguyên.
- `package.json`: chạy thêm test camera Boss trong `npm test`; cập nhật tài liệu kỹ thuật và báo cáo Boss.

## Kiểm chứng và giới hạn

`npm test`: 8 bộ đạt, gồm hồi quy cả bốn màn, 10.239 nhánh Boss và test tích hợp camera Boss. Test mới tái hiện lỗi trước sửa bằng assertion đồng hồ không tạm chờ; sau sửa đạt. `npm run build`: TypeScript/Vite đạt.

Chưa kiểm thử webcam thật hoặc xác minh giao diện trực tiếp trong trình duyệt. Không thu/lưu hình ảnh hay video. Trường hợp đã tái hiện là lặp cùng tư thế; chưa có dữ liệu thực chứng minh nguyên nhân của mọi trường hợp không nhận camera trên laptop.

Để thử: ở ba màn đầu chọn sai, kiểm tra chỉ phương án đó bị báo sai, không xanh phương án đúng/không có lời giải. Ở Boss: chọn C sai câu 1, giữ C qua câu 2, đồng hồ phải chờ; hạ tay nghỉ 0,5 giây, giữ C một giây để ghi nhận. Thử tiếp đổi sang D/B ở câu sau, chọn tay khi camera đang chờ, pause/resume và thoát màn. Không cần quay/lưu webcam để kiểm tra.

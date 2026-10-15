# Webcam chốt nhưng game không nhận khi chuyển câu

## Cập nhật: nhận trực tiếp sau câu sai

Sao lưu trước cập nhật: `backups/before_answer_ack_20261015_124641.zip`.

`useAnswerCamera` nhận callback tùy chọn và chuyển xuống `usePoseCamera`. Mỗi xác nhận được chuyển thẳng cho engine ngay trong RAF, trước khi React render hoặc timeout khác có thể chạy; `confirmed` vẫn phục vụ giao diện. Engine giữ state/callback theo commit, mở lại khóa gửi bằng layout effect khi bắt đầu lượt mới, và chỉ đánh dấu event đã xử lý sau khi hàm chấm nhận thành công. Giữ đường nhận qua effect để tương thích camera mô phỏng; ID và khóa đồng bộ ngăn chấm hai lần.

Bỏ bước khóa riêng Boss sau mọi câu sai/hết giờ của bản vá trước. Đổi sang chữ khác được nhận ngay sau khi giữ đủ một giây ở lượt mới. Chỉ lặp lại cùng chữ chưa thả mới phải nghỉ 500ms theo stabilizer chung; Boss giữ đồng hồ trong lúc đó. Ba màn đầu vẫn phải làm lại câu sai tới đúng; Boss chỉ đúng mới gây sát thương/cộng điểm. Không thay MediaPipe, classifier hoặc thuật toán stabilizer.

Kiểm thử tích hợp giờ chạy hai chuỗi cho từng màn dưới StrictMode: đúng liên tiếp và sai hai lượt liên tiếp rồi đúng đủ ba câu; có đổi chữ sau sai mà chưa nghỉ, nghỉ trong feedback, giữ sớm trong thinking, chặn lặp khi giữ nguyên trong feedback và timeout tới ngay sau khung hình chốt. Xác nhận callback chạy cùng RAF và chỉ một model/camera. `npm test` đạt toàn bộ 12 bộ; kiểm thử tích hợp mở rộng đạt; `npm run build` thành công. Chưa kiểm thử webcam thật.

File thay đổi trong cập nhật này: `src/ai/usePoseCamera.ts`, `src/ai/useAnswerCamera.ts`, `src/ForestAdventure.tsx`, `src/adventure/AdventureStage.tsx`, `tests/camera-game-delivery.mjs`, `tests/boss-camera-flow.mjs`, `tests/camera-integrity.mjs`, `tests/boss-protected-files.json` và các ghi chú tài liệu. Hash chỉ cập nhật cho ba file nguồn được sửa có chủ đích: hai hook và giao diện/điều phối Rừng; baseline MediaPipe/stabilizer vẫn được kiểm tra riêng.

## Lỗi đã tái hiện

Học sinh nghỉ đủ sau câu trước rồi giữ sớm dáng cho câu tiếp trong thinking. Khi React commit sang answering, mã cũ cập nhật `enabledRef` ngay trong render nhưng đợi `useEffect` mới reset stabilizer/cửa sổ xác nhận. Nếu RAF chạy trong khoảng giữa commit và passive effect, nó thấy quyền chốt mới với bộ đếm giữ dáng cũ, phát xác nhận và ghi lịch sử chống lặp. Sau đó effect xóa `confirmed`, làm game mất sự kiện. Giữ tiếp cùng dáng không được chốt nữa vì lịch sử đã ghi dáng ấy.

`tests/answer-camera-regression.mjs` chủ động đưa một RAF vào đúng khoảng này. Trước sửa, kiểm thử thất bại: chỉ nhận một sự kiện thay vì hai sau khi đã giữ câu kế đủ một giây. Sau sửa, kiểm thử đạt.

## Bản sửa

`src/ai/usePoseCamera.ts` cập nhật quyền chốt và reset cửa sổ bằng `useLayoutEffect`, đồng bộ trong commit trước RAF tiếp theo. Không công bố quyền chốt mới từ một render chưa commit. Giữ nguyên `useAnswerCamera`, auto-arm, thuật toán MediaPipe/classifier/stabilizer, thời gian giữ 1000ms và nghỉ 500ms. Đây là thay đổi vòng đời hook, không thay thuật toán nhận diện. Cả bốn màn và phòng luyện dùng hook này nên cùng nhận bản sửa.

Không đổi luật điểm, sai làm lại ở ba màn đầu, sát thương Boss, mở khóa hay ngân hàng câu hỏi. Bước nghỉ của Boss sau sai/hết giờ vẫn hoạt động.

## File và sao lưu

- Sao lưu: `backups/before_camera_delivery_20261015_124043.zip`.
- `src/ai/usePoseCamera.ts`: đồng bộ mở/reset cửa sổ trước RAF.
- `tests/answer-camera-regression.mjs`: hồi quy khe commit/passive effect trên hook thật.
- `tests/camera-game-delivery.mjs`: tích hợp cả bốn màn, hook thật và RAF có kiểm soát dưới React StrictMode, nhận đủ ba câu, chỉ một camera/model.
- `tests/camera-integrity.mjs`: cho phép chính xác thay đổi vòng đời này khi so với baseline; vẫn so sánh nguyên phần MediaPipe và xử lý khung hình.
- `tests/boss-protected-files.json`: cập nhật duy nhất baseline hash của hook đã sửa; các hash khác giữ nguyên.
- `package.json`: thêm kiểm thử tích hợp bốn màn vào npm test.
- Tài liệu này và ghi chú trong `TECHNICAL_SPEC.md`.

## Kiểm chứng

`npm test`: toàn bộ 12 bộ kiểm thử đạt (exit 0), gồm hồi quy khe RAF và tích hợp đủ bốn màn. `npm run build`: TypeScript và Vite thành công (exit 0).

Kiểm thử sử dụng khớp và camera mô phỏng, thực thi hook và engine thật. Không sử dụng hoặc lưu hình/video webcam. Chưa kiểm thử webcam thật; lỗi race đã tái hiện bằng lịch thực thi có kiểm soát, chưa khẳng định đây là nguyên nhân duy nhất của mọi trường hợp nhận diện trên máy thực.

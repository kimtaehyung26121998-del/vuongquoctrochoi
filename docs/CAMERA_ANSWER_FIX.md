# Sửa nhận diện lần đầu ở Cầu Vồng — 15/10/2026

## Nguyên nhân đã xác minh

Rừng gọi `usePoseCamera(answering, answering)` nhưng Cầu Vồng gọi `usePoseCamera(answering, false)`. `usePoseCamera` có effect theo `[enabled, autoArmOnEnable]` gọi `stabilizer.reset(armNow)`.

Khi từ thinking chuyển sang answering, cấu hình Cầu Vồng reset armed về false và xóa candidate/since/neutralSince. Kể cả học sinh đã nghỉ trong thinking, màn vẫn yêu cầu nghỉ thêm 500ms trong answering. Nếu tạo dáng ngay hoặc giữ dáng từ thinking thì hệ thống nhìn thấy đúng A/B/C/D nhưng không đủ điều kiện xác nhận. Đây là chính sách mở lượt sai, không phải bằng chứng MediaPipe nhận diện kém.

Kiểm thử hook với React thật, video và kết quả MediaPipe giả lập tái hiện: cấu hình cũ giữ A 1500ms không phát confirmed; sau nghỉ rồi tạo lại mới phát. Cấu hình mới A/B/C/D mỗi chữ chốt sau 1000ms từ mẫu hợp lệ đầu tiên trong answering, không cần một lần nghỉ trước đáp án đầu.

## Kết quả rà soát toàn luồng

1. **Camera/model:** hai màn đều dùng một hook, `start` chỉ gọi từ thao tác bắt đầu/bật camera; `stop` khi thoát, tổng kết hoặc tắt chủ động. Video/canvas không key theo câu. Không phát hiện tạo lại Landmarker do đổi câu; kiểm thử hook xác nhận một stream/model qua render và đổi trạng thái cho phép chốt.
2. **Tư thế nghỉ:** khác biệt auto-arm ở trên là nguyên nhân trực tiếp. Đã đưa về đúng chính sách màn Rừng.
3. **Giữ dáng/render:** `PoseStabilizer` nằm trong ref, effect reset chỉ theo cờ mở lượt, không theo timer, pose, âm thanh hoặc render phụ. Kiểm thử 10 render phụ và bật debug khi đang giữ 900ms không làm mất tiến độ.
4. **Trạng thái:** game giữ thinking → answering → feedback → next; holding/locked thuộc stabilizer. Không chấm trong thinking/feedback/pause. Sau xác nhận có khóa stabilizer, khóa submit đồng bộ và reducer kiểm tra pha/chỉ số câu.
5. **Callback:** không có đăng ký listener webcam bị mất. Hook dùng RAF và ref đọc cờ hiện tại; effect tiếp nhận confirmed theo id, callback chấm đọc stateRef. Đã kiểm tra sự kiện hết giờ/đáp án đến sau khi chấm không cộng thêm điểm.
6. **Hiệu năng:** suy luận đồng bộ trên main thread vẫn giới hạn khoảng 15fps; cập nhật UI tối đa khoảng 10 lần/giây và xác nhận được ưu tiên ngay. Không có bằng chứng đo trên laptop thật để kết luận hoạt hình/âm thanh là gốc lỗi. Cảnh Cầu Vồng nay dùng React.memo để không render lại theo tiến độ webcam; thanh giữ dáng dùng transform thay vì thay width. Không đổi hình, màu, nhạc, số hạt hoặc hoạt hình.
7. **Bộ đếm:** chỉ `PoseStabilizer` xác nhận tư thế. Đồng hồ câu hỏi là deadline riêng với interval chỉ cập nhật số giây; không tạo thêm bộ chốt. Bộ đo debug chỉ quan sát pose/thời gian/FPS và không phát sự kiện xác nhận.

## Answer Engine sau sửa

`src/ai/useAnswerCamera.ts` là adapter chính sách chung cho cả hai màn, gọi đúng `usePoseCamera(answering, answering, debugEnabled)` như chính sách của Rừng trước sửa. Không viết lại classifier, stabilizer, cấu hình model, CPU delegate hoặc confidence. Chế độ 12 câu giữ nguyên file ứng dụng và cách gọi hook.

- Đáp án đầu tiên: tạo A/B/C/D và giữ liên tục khoảng 1 giây, không cần tạo lại.
- Tạo dáng sớm trong thinking: chưa chấm; khi answering mở sẽ tính mới một khoảng giữ 1 giây, học sinh có thể giữ nguyên dáng, không phải làm lại động tác.
- Câu tiếp chọn **khác chữ**: mở lượt ngay, giữ 1 giây như màn Rừng.
- Câu tiếp chọn **cùng chữ chưa thả**: chờ nghỉ 500ms, có hướng dẫn rõ ràng. Nếu đã nghỉ đủ trong feedback thì không bắt nghỉ lần nữa.
- Đổi A sang B giữa chừng: bộ giữ tính lại 1 giây từ B, không cộng dồn A.
- Pause: không chốt. Khi tiếp tục, tính mới khoảng giữ trong cửa sổ trả lời như Rừng trước đây; không cộng thời gian tạm dừng vào giữ dáng.
- Rời màn/tổng kết dọn camera như cũ; chuyển câu/hoạt hình không khởi động lại.

## Debug Camera

Ở sidebar của **cả hai màn**, mở **Công cụ giáo viên**. Bảng Debug Camera hiển thị tư thế phân loại từ khớp MediaPipe, pha game, quyền trả lời, armed, thời gian giữ trong lượt, tiến độ xác nhận, có cần nghỉ, lý do chưa chốt và FPS suy luận thành công qua cửa sổ khoảng một giây.

Mặc định đóng, không publish state debug; chỉ mở mới cập nhật bảng tối đa khoảng 4 lần/giây, riêng sự kiện xác nhận được hiển thị ngay. Nút **Đóng** tắt debug. FPS là đo tại phiên đang chạy, không phải tốc độ giả định hoặc độ chính xác nhận diện. Bộ đo chỉ giữ số liệu nhỏ trong RAM; không ghi ảnh, video, landmark vào file/log/analytics và không gửi lên server.

## File thay đổi

- `src/ForestAdventure.tsx`, `src/adventure/AdventureStage.tsx`: dùng adapter chung, hướng dẫn nghỉ khi cần, bảng giáo viên và thanh giữ dáng bằng transform.
- `src/ai/usePoseCamera.ts`: chỉ thêm instrumentation, cờ hướng dẫn nghỉ và xuất số liệu. Phần MediaPipe/stabilizer giữ nguyên và được đối chiếu qua kiểm thử.
- Mới `src/ai/useAnswerCamera.ts`, `cameraDiagnostics.ts`, `CameraDebug.tsx`, `cameraDebug.css`.
- `src/adventure/RainbowScene.tsx`: chỉ bọc React.memo, không đổi nội dung đồ họa.
- `tests/answer-camera-regression.mjs`, `mock-vision.mjs`, `camera-integrity.mjs`, `load-module.mjs` và các script hồi quy cũ: kiểm thử hook thật với input giả lập, cập nhật đối chiếu cho instrumentation có chủ đích.
- `package.json`/`package-lock.json`: thêm react-test-renderer cùng phiên bản React hiện có, chỉ dùng ở dev/test; bổ sung bộ kiểm thử mới vào npm test. Không thêm dependency runtime.
- Tài liệu cập nhật ở `docs/`.

Sao lưu trước thay đổi: `backups/before-answer-engine-20261015_085218/`.

## Kiểm thử tự động

Chạy `npm test` và `npm run build`.

Kiểm thử mới dùng React test renderer, hook thật, classifier/stabilizer thật, video node giả và MediaPipe trả về khớp tổng hợp. Bao phủ A/B/C/D lần đầu, đúng 1000ms, render phụ, debug bật/tắt, dáng sớm, đổi dáng, cùng chữ qua hai câu, nghỉ trong feedback, giữ xuyên chuyển pha, pause/resume, không có khớp hợp lệ, timeout rồi đáp án muộn, số stream/model/RAF, throttle UI/suy luận và dọn tài nguyên.

Bộ hồi quy Rừng/Cầu Vồng vẫn kiểm tra điểm, chấm trùng, 27 tổ hợp kết quả, mở khóa, asset và bảo toàn classifier/stabilizer/nội dung/CSS/âm thanh. Những kiểm thử này không chạy mô hình nhận diện trên người thật và không đo độ chính xác webcam.

## Cách kiểm tra webcam thật trên laptop

1. Chạy `npm run dev`, dùng cùng địa chỉ/cổng để giữ tiến trình, hoàn thành Rừng nếu Cầu Vồng chưa mở. Không cần xóa tiến trình.
2. Vào Cầu Vồng, bật webcam, mở Công cụ giáo viên nếu cần. Khi hiện trả lời, tạo A lần đầu và giữ khoảng 1 giây, không nghỉ bắt buộc trước đó. Quan sát tiến độ tăng và chốt một lần. A không phải đáp án toán đúng câu đầu, nhưng vẫn phải được hệ thống nhận và chốt.
3. Chơi lại để thử tương tự B/C/D lần đầu. Thử D → A → B để nhận đủ 30 điểm theo bộ đề hiện tại. Nếu muốn quan sát kỹ lúc sai, tạm dừng ở phản hồi.
4. Giữ một dáng từ thinking sang answering: không chốt sớm; tiếp tục giữ, đủ khoảng 1 giây từ khi answering mở sẽ chốt. Không cần hạ lên lại.
5. Chọn cùng chữ ở hai câu liên tiếp (không nhất thiết đúng toán): giữ nguyên qua phản hồi thì câu sau phải báo chờ nghỉ. Hạ tay 0,5 giây rồi làm lại chữ đó, chốt đúng một lần. Thử nghỉ ngay trong feedback, sau đó tạo lại cùng chữ khi answering mở.
6. Đổi A → B sau khoảng nửa giây: không chốt A và không chốt B quá sớm. Thử pause giữa lúc giữ; sau resume giữ lại đủ 1 giây, không mất hình camera hoặc tải lại AI.
7. Bật bỏ hoạt hình, tiếp tục qua câu khi hiệu ứng chạy, để một câu hết giờ không có dáng hợp lệ, thử click gần lúc webcam chốt. Điểm không tăng hai lần, không chốt trong feedback/paused.
8. Quay Rừng, thử A/B/C/D và cả hai trường hợp chữ khác/chữ lặp. Thử chế độ 12 câu cũ để đối chiếu. Đóng debug để xem đúng giao diện học sinh.

Nếu tiếp tục không chốt, xem Debug Camera: pose UNKNOWN hay đúng chữ, enabled có bật, có chờ nghỉ không, holdingMs/progress có tăng và FPS đo được. Có thể báo lại các con số và thông báo bằng chữ; không cần chụp/lưu ảnh hoặc video học sinh.

**Chưa kiểm thử webcam thật hoặc trực quan giao diện debug trên laptop trong phiên sửa này.**

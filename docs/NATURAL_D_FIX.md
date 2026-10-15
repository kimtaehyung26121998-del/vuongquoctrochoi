# D chống hông với khuỷu dang vừa

Sao lưu trước sửa: `backups/before_natural_d_20261015_133513.zip`.

Sau bản siết D, kiểm thử mới tái hiện tư thế chống hông có khuỷu dang vừa bị trả về UNKNOWN. Nguyên nhân trong trường hợp tái hiện: điều kiện đòi cả hai khuỷu dang hơn 0,25 bề ngang vai, cộng với giới hạn góc khuỷu và độ lệch khuỷu/cổ tay.

Bản sửa bỏ điều kiện khuỷu phải rộng hơn vai. D vẫn cần cổ tay ở eo/hông, hai cẳng tay hướng từ ngoài vào eo và khuỷu gập, nhưng cho phép mức dang và góc gập tự nhiên hơn. Phân loại tay buông gần thẳng cũng kiểm tra cẳng tay không đang hướng vào eo, tránh nhận nhầm tư thế D gập nhẹ thành NGHỈ. Tay buông dưới hông và tay gần thẳng vẫn không được chốt D. Không thay điều kiện A/B/C, MediaPipe, hook camera, auto-arm hoặc thời gian giữ/nghỉ.

Kiểm chứng:
- `tests/pose-d-natural.mjs`: trước sửa thất bại UNKNOWN thay vì D; sau sửa 108 mẫu D khuỷu dang vừa đạt, tay buông vẫn NGHỈ.
- `tests/answer-camera-regression.mjs`: thêm D khuỷu hẹp, hook thật chốt D sau 1000ms và không lặp.
- `npm test`: toàn bộ 15 bộ đạt; giữ các kiểm tra A/B, B/D, nghỉ, camera và cả bốn màn.
- `npm run build`: thành công.
- Chưa kiểm thử webcam thật, chưa khẳng định đã bao phủ tư thế thực tế của người dùng.

File thay đổi: `src/ai/poseClassifier.ts`, `tests/pose-d-natural.mjs`, `tests/answer-camera-regression.mjs`, `tests/boss-protected-files.json` (hash classifier), `package.json` và ghi chú tài liệu.

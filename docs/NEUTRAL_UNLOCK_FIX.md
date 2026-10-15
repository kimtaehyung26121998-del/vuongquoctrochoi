# Tay đã hạ nhưng không hiện NGHỈ, thanh giữ dáng đứng 0%

Phản hồi người dùng: lúc lỗi thanh giữ dáng không chạy; đã hạ tay nhưng chưa thấy NGHỈ. Điều này khác sự kiện đã chốt nhưng engine không chấm.

## Lỗi tái hiện và bản sửa

Trong classifier cũ, D được xét trước NGHỈ. Tay buông xuống dưới hông nhưng khuỷu hơi dang vẫn thỏa điều kiện cổ tay gần hông và khuỷu dang của D. Kiểm thử mới trước sửa thất bại với `D !== NEUTRAL`. Vì không nhận NGHỈ, stabilizer giữ lịch sử chống lặp, làm lần chọn lại cùng chữ không chạy thanh.

`src/ai/poseClassifier.ts` nay xét NGHỈ trước D khi thân thẳng và cả hai cổ tay thấp hơn hông tương ứng ít nhất 0,08 lần chiều dài thân. Vẫn phải thấy rõ các khớp; không suy đoán NGHỈ từ UNKNOWN hoặc khi mất cổ tay/hông. D chống hông thật vẫn nhận D; A/B/C giữ các điều kiện hiện hành. Không sửa mô hình/thuật toán MediaPipe, stabilizer, thời gian giữ 1000ms/nghỉ 500ms hay auto-arm.

Giao diện Rừng và engine ba màn sau hiển thị hướng dẫn chờ mở lượt và giữ lại lý do nhận diện, nhắc lùi ra để camera thấy cổ tay/hông khi chưa có NGHỈ. Rừng đổi nhãn trên thanh từ giữ dáng sang chờ tư thế NGHỈ trong lúc cần mở khóa.

## Kiểm chứng

- `tests/pose-bd-regression.mjs`: 162 mẫu nghỉ với tay hạ/khuỷu dang, nhiều tỷ lệ cơ thể, nghiêng nhẹ và phản chiếu; thiếu cổ tay/hông vẫn UNKNOWN. Các 378 mẫu B/D/vùng đệm trước đó vẫn đạt.
- `tests/boss-camera-flow.mjs`: dùng tư thế nghỉ tay hạ/khuỷu dang để mở cùng chữ sau sai, nhận câu kế và giữ đồng hồ đúng.
- `tests/camera-game-delivery.mjs`: cả bốn màn dưới StrictMode dùng tư thế nghỉ mới, đúng liên tiếp và sai liên tiếp rồi đúng đủ ba câu, không chấm lặp.
- `npm test`: cả 12 bộ đạt (exit 0).
- `npm run build`: TypeScript/Vite thành công (exit 0).
- Chưa kiểm thử webcam thật. Không thu/lưu hình hoặc video; kiểm thử dùng dữ liệu khớp mô phỏng.

Sao lưu: `backups/before_neutral_unlock_20261015_125540.zip`.

File sửa: `src/ai/poseClassifier.ts`, `src/ForestAdventure.tsx`, `src/adventure/AdventureStage.tsx`, ba file kiểm thử nêu trên, `tests/boss-protected-files.json` (chỉ cập nhật hash classifier và Rừng được sửa), tài liệu này và ghi chú `TECHNICAL_SPEC.md`.

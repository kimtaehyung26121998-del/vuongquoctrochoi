# Giao việc cho Codex – triển khai Lâu Đài Boss

Bạn đang ở dự án game Vương Quốc Toán Học trên laptop Windows. Màn Rừng, Cầu Vồng và Đảo Kho Báu đang có thể đã được sửa thêm, nên hãy đọc mã THỰC TẾ trong workspace trước khi tích hợp module tại `src/stages/boss/`.

**Đích:** màn 4 đánh Boss có 3 HP, dùng webcam A/B/C/D từ engine chung. Đúng mới trừ 1 HP; sai hoặc hết giờ không tính đã qua, không trừ máu, không cộng điểm. Cần 3 câu đúng để thắng; cần ngân hàng ít nhất 6 câu để thay câu sai. Không sử dụng lại câu mà lời giải vừa hiện. Khi hết câu mà chưa thắng, cho luyện tập lại.

1. Đọc `AGENTS.md`, `docs/boss-module/INTEGRATION.md` và các module màn 1–3; tìm trạng thái tiến trình, hook `useAnswerCamera`, câu hỏi hiện tại và cách tính điểm.
2. Sao lưu/Git commit trước khi sửa. Không xóa hoặc ghi đè dữ liệu giáo viên.
3. Tích hợp `BossCastleScene` hoặc `BossCastleStage` theo kiến trúc hiện có; tránh hai panel câu hỏi.
4. Chia màn Boss thành sân chiến đấu và khu vực 4 câu trả lời; tối ưu trình chiếu 16:9, hoạt hình phép thuật ngắn và webcam luôn hiển thị.
5. Không viết lại MediaPipe, classifier, stabilizer, auto-arm, chống nhận nhầm giữa các câu; giữ nguyên cơ chế kiểm thử webcam đã thông qua ở Rừng/Cầu Vồng.
6. Kết nối âm thanh `04_lau_dai_boss.ogg`, `boss_hit.wav`, `boss_defeated.wav`, `answer_wrong_gentle.wav` phát mỗi sự kiện một lần.
7. Tạo thêm câu hỏi toán lớp 2 phù hợp nội dung học hiện có nếu cần; kiểm tra đúng số học, không tạo câu mơ hồ, mỗi câu đủ 4 phương án.
8. Xử lý chính xác: một `confirmedAnswer` => tối đa 1 attempt, tối đa 1 lần chấm. `result:wrong/timeout` tuyệt đối không làm thay đổi boss HP, không cộng điểm và không đánh dấu câu đã vượt qua.
9. Thêm nút tạm dừng, tiếp tục, bỏ qua animation, chơi lại, về bản đồ; nếu đã có từ engine chung thì tái sử dụng.
10. Kiểm thử 3 đúng; sai rồi 3 đúng; hết giờ; callback trùng; 2 lần cùng đáp án; pause/resume; hết pool; quay lại 3 màn cũ. Chạy `npm run build`, `npm test` nếu tồn tại; báo cáo file thay đổi và các trường hợp cần test webcam thật.

**Cảnh báo:** không tự kết luận màn Boss chạy thành công trên webcam thật chỉ từ build; yêu cầu người dùng thử trên laptop.

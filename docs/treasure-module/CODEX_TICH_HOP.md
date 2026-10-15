# Tích hợp Đảo Kho Báu (màn 3) với dự án hiện tại

## Quan trọng

Gói này là **module cảnh đồ họa độc lập**, KHÔNG phải bản vá ghi đè `src/App.tsx`, `ForestAdventure.tsx`, `RainbowScene.tsx`, `useAnswerCamera` hay `src/ai/*`. Chỉ có bản starter cũ trong phiên ChatGPT; phần mới nhất nằm trên laptop của bạn. Codex phải tích hợp dựa trên mã thật tại workspace.

## Có gì trong module?

- `src/stages/treasure/TreasureIslandScene.tsx`: cảnh 3 nhiệm vụ và hiệu ứng.
- `src/stages/treasure/TreasureIslandStage.tsx`: cảnh + khung câu hỏi và A/B/C/D, nhận props từ engine hiện hành.
- `src/stages/treasure/treasureModel.ts`: dữ liệu nhiệm vụ, cơ chế tiến độ **không ghi nhận trùng**, phân chia quyền sở hữu trạng thái.
- `src/stages/treasure/treasureIsland.css`: hình nền, hiệu ứng cú mèo, mở rương, pha lê, 16:9 và responsive.
- `public/assets/treasure/map_fragment.svg` và `golden_key.svg`: hai vật phẩm mới.

## Contract cho parent Game Engine

```tsx
import TreasureIslandStage from './stages/treasure/TreasureIslandStage'
import {type TreasureOutcome} from './stages/treasure/treasureModel'

<TreasureIslandStage
  question={question} // {id,prompt,choices,explanation}
  secondsLeft={seconds}
  selectedAnswer={selectedAnswer}
  correctAnswerForFeedback={phaseForTreasure === 'feedback' ? question.answer : undefined}
  onManualAnswer={submitAnswer}
  round={localStageQuestionIndex as 0 | 1 | 2}
  phase={phaseForTreasure} // 'intro'|'thinking'|'answering'|'feedback'|'complete'
  outcomes={confirmedOutcomes}
  paused={paused}
  onSkipAnimation={skipAnimation}
/>
```

Nếu giao diện của `ForestAdventure` đã có khung câu hỏi chung, dùng `TreasureIslandScene` thay cho `TreasureIslandStage` để tránh hiển thị hai bộ đáp án.

Chỉ cập nhật `confirmedOutcomes` trong callback đã chốt đáp án duy nhất của Game Engine. Chống trùng theo questionId/round. **Không** append bằng mọi lần render, không dùng camera.pose thay confirmed event.

Giữ nguyên các câu `q07`–`q09` trong bộ 12 câu: stage index = 2. Chỉ dùng `QUESTIONS.filter(q => q.stage === 2)` để chọn 3 câu màn 3 (nếu mã mới đã có cấu hình khác, ưu tiên cấu hình hiện hành).

Khi câu cuối có kết quả đúng/sai/hết giờ thì vẫn hoàn tất hành trình và mở khóa màn 4, nhưng tuyệt đối không tăng điểm cho câu sai. Chỉ mở khóa Lâu Đài Boss sau khi kết thúc và lưu tiến độ thành công.

### Luồng chuẩn

1. intro 2-3 giây: cú mèo cập bến Đảo Kho Báu.
2. thinking: 3 giây suy nghĩ, không nhận/chốt đáp án.
3. answering: auto-arm theo cơ chế ĐÃ SỬA của Rừng và Cầu Vồng; giữ 1 giây chốt.
4. feedback: `isCorrect` hiển thị đúng/sai, âm thanh, nhận bản đồ/chìa khóa/mở rương; đọc lời giải từ câu hỏi gốc.
5. Chuyển tiếp: về dáng nghỉ chỉ khi chính sách chung yêu cầu; **không** chặn lần đầu mỗi câu vô lý.
6. complete: 3/3 câu, tổng kết, cập nhật mở khóa màn 4.

### Audio đã có trong starter

- `/audio/music/03_dao_kho_bau.ogg`
- `/audio/sfx/adventure/chest_open.wav`
- `/audio/sfx/rewards/collect_star.wav`
- `/audio/sfx/rewards/collect_crystal.wav`
- `/audio/sfx/quiz/answer_wrong_gentle.wav`

Chỉ gọi âm thanh 1 lần cho 1 sự kiện được xác nhận, không phát trong render hoặc effect bị gọi lại.

## Những gì Codex phải thực hiện trên máy Windows

1. Xác nhận `git status`, backup hoặc Git commit trước khi tích hợp.
2. Chép 5 file mới đến vị trí tương ứng. KHÔNG ghi đè file webcam.
3. Đọc `ForestAdventure`, `RainbowScene`, `useAnswerCamera` và router hiện hành.
4. Nối `TreasureIslandScene` vào màn 3 qua phase/index/outcomes hiện có. Có thể tạo adapter mỏng nếu tên trạng thái khác nhau.
5. Đảm bảo `useAnswerCamera` chỉ có **một nguồn sự thật**; không thêm hook riêng trong `TreasureIslandScene`.
6. Gắn hiệu ứng và audio vào callback kết quả đã được xác nhận; lưu tiến độ mở màn 4 sau khi hoàn tất.
7. Chạy `npm test` nếu dự án có script, `npm run build` và thử webcam thật: A/B/C/D lần đầu, cùng đáp án liên tiếp, timeout, sai, tạm dừng, không chấm trùng.

### Cảnh báo

Ảnh `03_island.png` của starter rất nhỏ (235×144). Scene dùng CSS đại dương và vật phẩm PNG/SVG để tránh phóng nền mờ toàn màn hình. Có thể thay bằng background 1920×1080 sau khi tính năng đã ổn định.

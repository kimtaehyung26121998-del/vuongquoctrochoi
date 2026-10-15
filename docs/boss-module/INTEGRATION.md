# Màn 4: Lâu Đài Boss – tích hợp an toàn

> Đây là module độc lập, **chưa** được ghép với bản game đang chạy trên laptop. Codex cần đọc các màn Rừng, Cầu Vồng và Đảo Kho Báu thực tế để thực hiện bước tích hợp. Không thay code webcam.

## Cốt truyện / luật chơi

Boss có **3 lớp khiên** (HP=3). Học sinh giải đúng một câu hỏi toán và xác nhận tư thế webcam A/B/C/D ổn định 1 giây để phá **1 lớp khiên**. Phá đủ 3 lớp mới thắng.

**Trả lời sai hoặc hết giờ KHÔNG phá khiên, KHÔNG tăng số câu đúng, KHÔNG cộng điểm, KHÔNG mở khóa chiến thắng.** Ghi nhận là *attempt* (lượt thử). Sau khi giải thích, dùng **câu hỏi thay thế** cùng chủ đề/mức độ cho lượt tiếp theo. Có thể dùng một ngân hàng 6–9 câu để đủ 3 câu đúng dù học sinh sai vài lần. Không lặp lại đúng câu vừa công bố lời giải để tránh đoán mò.

Nếu hết ngân hàng câu hỏi mà chưa có đủ 3 đáp án đúng thì đến `practice-complete`, cho học sinh luyện tập lại / giáo viên thêm câu, không tự công nhận Boss đã bị đánh bại. Không kẹt ở màn không có nút thoát: phải có **Về bản đồ** và **Chơi lại**. Nếu giáo viên bấm **Bỏ qua**, không được tính là trả lời đúng.

## 4 tệp mã nguồn
- `src/stages/boss/bossModel.ts`: quy tắc máu, đúng/sai/hết giờ, loại bỏ submission trùng, gợi ý bước tiếp theo.
- `src/stages/boss/BossCastleScene.tsx`: sân đấu 2D, boss, cú mèo, 3 lớp khiên, VFX, trạng thái chiến thắng/chưa đạt.
- `src/stages/boss/BossCastleStage.tsx`: scene + quiz A/B/C/D cho trường hợp game chưa có panel quiz dùng chung. Nếu đã có panel chung, chỉ sử dụng `BossCastleScene`.
- `src/stages/boss/bossCastle.css`: theme, hiệu ứng, responsive, reduced-motion.

## Hình ảnh / âm thanh có sẵn từ Starter v0.1.1
- `/assets/items/boss.png`
- `/assets/items/trophy.png`
- `/assets/backgrounds/04_castle.png`
- `/assets/mascot/owl_cheer.png`, `/assets/mascot/owl_thinking.png`
- `/audio/music/04_lau_dai_boss.ogg`
- `/audio/sfx/adventure/boss_hit.wav`, `/audio/sfx/adventure/boss_defeated.wav`
- `/audio/sfx/quiz/answer_wrong_gentle.wav`, `/audio/sfx/quiz/time_up.wav`

Không cần thêm tài nguyên tải mạng. Hình nền thumbnail nhỏ chỉ làm lớp nền mờ, CSS xây toàn bộ khung cảnh độ phân giải cao, tránh kéo giãn ảnh gây nhòe.

## Luồng tích hợp vào shared engine
1. Bảo đảm Rừng/Cầu Vồng/Đảo Kho Báu hoạt động. Tạo Git commit hoặc sao lưu trước.
2. Route tới stage index 3 (hoặc ID màn boss theo game thật) khi hoàn thành màn 3, dùng chính sách mở khóa hiện hành.
3. Cùng `useAnswerCamera` đang chạy ở 3 màn trước: camera giữ nguyên instance, cùng `auto-arm`, stabilizer và quy tắc tư thế nghỉ. KHÔNG mount hook mới, không can thiệp `src/ai`.
4. Gửi kết quả **đã khóa** từ game engine vào `recordBossAttempt`. KHÔNG ghi mỗi lần MediaPipe dự đoán hay mỗi lần React render. `submissionId` và `questionInstanceId` duy nhất; timeout dùng `choice:null`.
5. Số máu của Boss = `3 - hits`, trong đó `hits` chỉ đếm attempt có `result:'correct'`.
6. Một lượt sai/hết giờ: feedback + giải thích rồi nạp một câu hỏi khác. Không gây sát thương Boss, không cộng điểm, không hiển thị chiến thắng.
7. Sau lượt đúng thứ ba: `getBossProgress(attempts).defeated === true`, khi đó mới `phase='complete'` và đánh dấu hoàn thành màn 4/toàn game.
8. Nếu hết ngân hàng câu hỏi mà chưa đủ 3 câu đúng: `phase='practice-complete'`, hiển thị luyện tập lại, không ghi completion thành công.
9. Âm thanh: phát duy nhất tại callback đã chốt của game engine bằng `bossAudioForAttempt`, không phát trong component React render / useEffect.

## API mẫu cho component

```tsx
import BossCastleStage from './stages/boss/BossCastleStage'
import {recordBossAttempt,getBossProgress,type BossAttempt} from './stages/boss/bossModel'

<BossCastleStage
  phase={phaseForBoss} // intro | thinking | answering | feedback | complete | practice-complete
  attempts={bossAttempts} // CHỈ cập nhật khi confirmed-result callback
  paused={paused}
  question={activeQuestion && {id:activeQuestion.id,prompt:activeQuestion.prompt,choices:activeQuestion.choices,explanation:activeQuestion.explanation}}
  secondsLeft={secondsLeft}
  questionNumber={bossAttempts.length+1}
  onManualAnswer={submitAnswer} // engine hiện hành, không tạo riêng
  selectedAnswer={phaseForBoss === 'feedback' ? confirmedChoice : undefined}
  correctAnswerForFeedback={phaseForBoss === 'feedback' ? correctAnswer : undefined}
  onSkipAnimation={skipAnimation}
/>
```

Nếu đã có panel câu hỏi và đáp án trong `App` hoặc Adventure Engine, dùng riêng `BossCastleScene` để **tránh hiển thị hai lần A/B/C/D**.

## Quy tắc quyền sở hữu (điểm quan trọng nhất)
- AI chỉ phát hiện và xác nhận tư thế.
- Shared game engine sở hữu tiến trình câu hỏi, thời gian, `confirmedAnswer`, điểm, `paused` và audio.
- Boss model chỉ tính HP và lượt đúng/sai từ **kết quả đã xác nhận**.
- Scene chỉ hiển thị, không tính điểm, không reset camera, không submit hoặc tự chuyển câu.
- Nút chọn thủ công chỉ xuất hiện như fallback và đi qua cùng `submitAnswer`.
- Mỗi sự kiện chỉ xử lý một lần: idempotency theo `submissionId` + `questionInstanceId`.

## Kiểm thử tối thiểu
- A/B/C/D được chốt ngay lần đầu, mỗi tư thế giữ 1 giây.
- Đúng 1 câu: Boss mất đúng 1 HP. Lặp callback: không mất thêm HP.
- Sai 1 câu, hết giờ 1 câu: Boss giữ HP; không cộng điểm, không hoàn thành câu; dùng câu thay thế.
- Hai câu liên tiếp cùng một chữ: cần nghỉ theo chính sách chung rồi mới chốt.
- Đúng, sai, đúng, đúng: 4 lượt, 3 hit, boss chết. Câu sai không trừ máu.
- Sai liên tiếp đến hết ngân hàng: `practice-complete`, không hiển thị chiến thắng.
- Tạm dừng, đổi tab, chọn tay, chuyển màn, quay lại Rừng/Cầu Vồng/Đảo Kho Báu.
- Chạy `npm run build`, `npm test` nếu có. Webcam thật cần thử trên laptop, build không chứng minh camera đã mượt.

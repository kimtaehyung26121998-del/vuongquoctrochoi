# Tích hợp Lâu Đài Boss — 15/10/2026

> Cập nhật sau tích hợp: khi giữ cùng chữ qua hai câu và camera yêu cầu nghỉ, đồng hồ Boss tạm chờ và hướng dẫn hạ tay 0,5 giây để tránh hết giờ oan. Có test engine + hook thật với khớp mô phỏng. Ba màn đầu đã ẩn lời giải/đáp án đúng khi sai. Chi tiết và giới hạn: [FEEDBACK_AND_BOSS_REARM.md](../FEEDBACK_AND_BOSS_REARM.md).

Đã đọc `AGENTS.md`, tài liệu bàn giao/đặc tả và toàn bộ tài liệu/module Boss. Sao lưu trước khi sửa: `backups/before_boss_integration_20261015_111756.zip` (src, tests, docs, public, package). Workspace không có Git.

## Luật và trạng thái

- Boss có 3 lớp khiên. Đúng +10 điểm, phá đúng 1 lớp; chỉ 3 câu đúng mới thắng. Sai/hết giờ không giảm HP, không cộng điểm hoặc tăng số câu đúng.
- Sai/hết giờ có lời giải rồi chuyển câu mới. Đây là luật riêng trong tài liệu Boss; ba màn đầu vẫn giữ luật làm lại cùng câu đến khi đúng.
- Ngân hàng 9 câu: q10–q12 giữ nguyên từ bộ đề gốc, thêm 6 câu toán lớp 2 riêng. Không sửa bộ 12 câu luyện webcam. Mỗi lượt dùng câu khác, không lặp câu vừa hiện lời giải.
- Hết cả 9 câu mà chưa đủ 3 hit → `practice-complete`: Boss còn khiên, hiện điểm tạm thời, nút **Luyện tập lại** và **Về bản đồ**; không gọi hoàn thành hoặc lưu chiến thắng.
- Luồng: intro chờ người dùng → thinking 3 giây → answering 20 giây → feedback (đúng 1,5 giây; sai/hết giờ 3,5 giây) → next. Thắng có 1,2 giây chuyển cảnh rồi finish. Có thể bấm tiếp tục sớm, bỏ hoạt hình, tạm dừng, chơi lại và thoát.
- Giáo viên vẫn chọn tay được khi camera lỗi. Nếu webcam chốt sai, nút **Webcam chọn nhầm — đổi câu** bỏ lượt đó khỏi thống kê toán, tăng bộ đếm sửa nhận diện và dùng câu thay thế vì lời giải đã hiện.

## Kiến trúc

`AdventureStage` vẫn là engine duy nhất sở hữu camera, đồng hồ, submit lock, audio và khung A/B/C/D. Màn Boss dùng nguyên `useAnswerCamera(answering)` hiện hành; không tạo camera riêng trong scene/adapter, không sửa file nào trong `src/ai/`. Video/canvas giữ cùng vị trí qua các câu, retry, kết thúc và chơi lại.

`createStageReducer` chỉ rẽ nhánh sang `createBossReducer` khi `config.id === 'castle'`. Phần reducer Rừng/Cầu Vồng/Đảo cũ giữ nguyên. Kết quả được ghi bằng `recordBossAttempt` ở nhánh xử lý ANSWER/TIMEOUT đã chốt; `submissionId` và `questionInstanceId` gồm trận, chỉ số và ID câu. Chơi lại tăng ID trận. Không ghi attempt theo pose thô hoặc mỗi render.

`BossSceneAdapter` chiếu state engine sang `BossCastleScene`; không có bộ chấm thứ hai. Chỉ dùng Scene cùng khung trả lời chung. Chế độ `embedded` để engine hiển thị phản hồi/tổng kết, tránh panel trùng; `BossCastleStage` độc lập vẫn giữ panel của module.

Âm thanh tại callback chốt đã khóa: đúng dùng `boss_hit.wav`, lần đúng thứ ba dùng `boss_defeated.wav`; sai dùng `answer_wrong_gentle.wav`, hết giờ dùng `time_up.wav`. Nhạc `04_lau_dai_boss.ogg`; bật/tắt tiếng và dọn tài nguyên dùng hook chung. Không phát âm thanh từ scene/render.

## Bản đồ và lưu hoàn thành

Mở Boss sau khi hoàn thành Đảo. Chọn Boss vào màn chơi thật, thay thông báo “đang chuẩn bị”. Chỉ thắng mới gọi `onComplete({score:30, stars:3})` và lưu `completed.castle`. Đủ 3 hit tương ứng 30 điểm, không yêu cầu 90 điểm của toàn bộ ngân hàng 9 câu. Key localStorage/phiên bản cũ giữ nguyên; không xóa dữ liệu giáo viên hoặc tiến độ ba màn trước.

## File thay đổi/thêm

- `src/App.tsx`: route/callback Boss, nút trên bản đồ, bỏ preview đang chuẩn bị.
- `src/adventure/stages.ts`: bật màn 4 và ngân hàng Boss.
- `src/adventure/stageState.ts`: nhánh reducer Boss, trạng thái kết thúc luyện tập và trường dữ liệu Boss tùy chọn.
- `src/adventure/stageProgress.ts`: lưu chiến thắng Boss theo 3 hit/30 điểm.
- `src/adventure/AdventureStage.tsx`: cảnh Boss, âm thanh/lời dẫn, chuyển câu thay thế, tổng kết thắng/chưa đạt; vẫn dùng duy nhất camera/đồng hồ/khung trả lời chung.
- Thêm `src/stages/boss/bossQuestions.ts`, `bossState.ts`, `BossSceneAdapter.tsx`.
- `src/stages/boss/BossCastleScene.tsx`: chế độ embedded để tránh phản hồi/tổng kết trùng.
- `src/stages/boss/bossCastle.css`: bố cục compact 16:9 trong engine, pause/reduced-motion/bỏ hoạt hình; CSS giới hạn ở Boss.
- `src/stages/treasure/TreasureSceneAdapter.tsx`: guard kiểu cho pha Boss mới, không thay hành vi màn Đảo.
- Thêm `tests/boss-regression.mjs`, `tests/boss-protected-files.json`; cập nhật `package.json`, test điều hướng Kho Báu và lời mô tả trong test mở khóa Cầu Vồng.
- Tài liệu này và ghi chú trong `docs/TECHNICAL_SPEC.md`; `dist/`/tsbuildinfo là đầu ra build.

Không sửa model/classifier/stabilizer/auto-arm/camera, Rừng, `RainbowScene`, câu hỏi gốc, CSS ba màn cũ, asset hoặc audio. Manifest SHA-256 kiểm tra các file này và phần thân reducer không phải Boss so với bản sao lưu trước tích hợp.

## Kết quả kiểm thử

- `npm test`: tất cả 7 bộ đạt. Test Boss duyệt 10.239 nhánh đúng/sai/hết giờ đến thắng/hết ngân hàng, kiểm tra HP/điểm, callback trùng, một question instance chỉ nhận một lần, pause, câu mới, replay và lỗi camera.
- Component engine với camera/đồng hồ mô phỏng: sai → đúng → hết giờ → đúng → đúng, HP 3→3→2→2→1→0; âm hit 2 lần, defeat 1 lần, callback hoàn thành 1 lần. Có đúng 4 đáp án, video không remount. Bỏ hoạt hình không gây sát thương. Tắt tiếng có hiệu lực.
- Hết giờ toàn bộ ngân hàng → luyện tập lại, không lưu chiến thắng; có nút thoát và có thể bắt đầu lại. Route bản đồ vào/ra Boss hoạt động trong test.
- Test camera chung vẫn kiểm tra giữ 1000ms, nghỉ 500ms khi lặp cùng chữ, D chống eo cao, pause và không khởi tạo lại model giữa các câu. Đây là dữ liệu mô phỏng.
- Hồi quy Rừng/Cầu Vồng/Đảo, đường đi Cú, 12 câu cũ và lưu tiến độ đều đạt.
- `npm run build`: TypeScript và Vite thành công.

Chưa kiểm thử webcam thật, âm thanh trực tiếp hoặc bố cục/hoạt ảnh trực quan trong trình duyệt ở phiên này. Test/build không chứng minh độ chính xác camera hay độ mượt trên laptop.

## Nghiệm thu trên laptop

1. Tải lại bản local, hoàn thành ba màn đầu nếu chưa mở khóa Boss. Vào Lâu Đài, kiểm tra chỉ một bộ A/B/C/D và webcam/Debug Camera vẫn hiện.
2. Ba câu đầu chọn B → C → D đúng: HP 3→2→1→0, +10 điểm mỗi lần; kết thúc 30 điểm/3 sao. Về bản đồ, tải lại: Boss đã hoàn thành, ba màn cũ giữ nguyên.
3. Chơi lại: câu 1 chọn A (sai), câu 2 chọn C (đúng), câu 3 không chọn (hết giờ), câu 4 chọn A, câu 5 chọn B. Sai/hết giờ không trừ HP hoặc cộng điểm; phải dùng câu mới; chỉ sau ba đúng mới thắng.
4. Để hết giờ hoặc chọn sai đến hết 9 câu: không hiện giải cứu/chiến thắng, có luyện tập lại và về bản đồ. Bỏ hoạt hình không tính đáp án.
5. Thử A/B/C/D và hai lượt cùng chữ đủ 1 giây, nghỉ khi được nhắc; pause khi đang giữ dáng, bật/tắt tiếng, chọn tay gần hết giờ và thoát khi AI đang tải. Không quay/chụp/lưu webcam trẻ em.

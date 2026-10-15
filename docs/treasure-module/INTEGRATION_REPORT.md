# Tích hợp màn 3 — 15/10/2026

> Cập nhật đường đi Cú: chỉ đúng mới tiến một bước, sai đứng yên, đích bước cuối dùng cùng tọa độ/kích thước với rương để Cú chạm rương. Đã bỏ nhấp nhô khi Cú đứng yên. Rừng cũng đã tự mở lại câu sai sau 1,2 giây. Chi tiết và test: [POSE_D_AND_MASTERY.md](../POSE_D_AND_MASTERY.md).

> **Thay đổi luật mới nhất:** sai/hết giờ phải làm lại đến khi đúng; chỉ đúng đủ 3/3 mới hoàn thành và mở màn tiếp theo. Bản đồ, chìa khóa, rương chỉ được trao khi đúng. Đồng thời sửa vùng chồng lấn D/B trong classifier chung. Xem [POSE_D_AND_MASTERY.md](../POSE_D_AND_MASTERY.md). Mô tả “sai vẫn đi tiếp/nhận vật phẩm nhờ Cú” ở các mục lịch sử bên dưới không còn áp dụng.

## Cập nhật nhịp chuyển câu

Riêng Đảo Kho Báu: phản hồi đúng giảm từ 7 giây xuống 1,5 giây; sai/hết giờ còn 3,5 giây để đọc lời giải. Chuyển cảnh giữa câu giảm từ 250ms xuống 150ms; cảnh pha lê cuối giảm từ 2,6 xuống 1,2 giây. Câu tiếp theo xuất hiện khoảng 1,65 giây sau đáp án đúng, hoặc 3,65 giây sau sai/hết giờ. Sau khi xuất hiện, vẫn có 3 giây suy nghĩ trước khi camera nhận câu mới. Nút tiếp tục/bỏ hoạt hình và pause giữ nguyên. Thời gian của Rừng/Cầu Vồng và thuật toán camera không thay đổi. Test component kiểm tra riêng các thời lượng mới. Phần mô tả 7 giây ở các mục lịch sử bên dưới đã được thay thế bởi cập nhật này.

## Cập nhật giao diện và kiểm tra câu sai

Sau phản hồi của người dùng, kiểm tra xác nhận reducer chỉ cộng điểm/sao cho `kind === 'correct'`. Hiển thị cũ gây hiểu nhầm vì dùng số chặng đã đi qua làm bộ đếm chính và gắn dấu tích cả cho câu sai/hết giờ có Cú hỗ trợ.

- Đã tách bộ đếm **câu đúng / điểm** và **chặng đã khám phá**. Chỉ câu đúng có dấu ✓, câu sai ghi **Chưa đúng · +0 điểm**, hết giờ ghi **Chưa trả lời · +0 điểm**; Cú chuyển sang dáng suy nghĩ khi hỗ trợ.
- Câu cuối sai vẫn mở rương nhờ Cú theo luật gốc, nhưng không tung sao và không phát âm thưởng nhận pha lê. Không đổi luật sai/hết giờ vẫn đi tiếp khi chưa có lựa chọn khác từ người dùng.
- Làm lại cảnh biển/bãi cát/hàng dừa bằng SVG/CSS, bố cục vật phẩm và bảng màu xanh ngọc/vàng cát. Di chuyển Cú theo tỷ lệ chiều rộng để thích ứng màn hình. Gộp phản hồi/lời giải vào khung engine khi ở chế độ compact, tránh hai bảng thông báo trùng nhau. CSS chỉ áp dụng riêng cho màn Đảo.
- Sao lưu trước lần chỉnh này: `backups/treasure_before_ui_review_20261015_093742.zip`.
- File chỉnh lần này: `TreasureIslandScene.tsx`, `treasureIsland.css`, `AdventureStage.tsx` (chỉ âm thưởng pha lê khi đúng), `tests/treasure-regression.mjs` và báo cáo này.
- Bổ sung test không dấu tích/sao thưởng khi sai hoặc hết giờ; chạy component với ba câu sai xác nhận tổng **0 điểm/0 sao**, không có âm thưởng nhận sao/pha lê. Chưa kiểm thử trực quan hoặc webcam thật; công cụ trình duyệt chưa có phiên kết nối.

Các mục bên dưới ghi lại lần tích hợp đầu tiên; phần cập nhật này thay thế mô tả cũ về âm thưởng pha lê khi Cú hỗ trợ.

Đảo Kho Báu đã nối vào `AdventureStage`, bản đồ và tiến trình localStorage hiện hành. Bản sao lưu trước khi sửa: `backups/treasure_before_integration_20261015_092812.zip` (src, public, tests, docs và cấu hình dự án). Workspace này không có Git; đã so sánh file với ZIP để xác định phạm vi thay đổi.

## Kiến trúc và hành vi

- Dùng nguyên `useAnswerCamera(answering)` của engine Cầu Vồng. Không sửa file nào trong `src/ai/`, màn Rừng, `RainbowScene`, bộ 12 câu, reducer, đồng hồ hay hook âm thanh chung.
- `TreasureSceneAdapter` chuyển kết quả reducer sang outcomes của cảnh; không tạo nguồn trạng thái kết quả hoặc camera thứ hai. `CAMERA_RETRY` hủy lượt webcam chọn nhầm cũng hủy vật phẩm tương ứng. Adapter được memo để cập nhật camera không render lại phong cảnh.
- Dùng `TreasureIslandScene` cùng khung câu hỏi có sẵn: chỉ một bộ A/B/C/D. `TreasureIslandStage` vẫn là component độc lập có sẵn, không dùng đồng thời.
- `q07` (C: 100 cm) → bản đồ; `q08` (D: 7 ngày) → chìa khóa; `q09` (A: 42 viên bi) → mở rương. Mỗi câu đúng +10 điểm/+1 sao; sai hoặc hết giờ không cộng điểm, có lời giải và Cú hỗ trợ đi tiếp.
- Luồng: intro chờ nút bắt đầu → thinking 3 giây → answering 20 giây → feedback 7 giây → next. Sau câu 3: cảnh pha lê 2,6 giây → finish. Rương mở ngay trong feedback cuối; tổng kết chỉ hiện sau khi engine finish.
- Nhạc `03_dao_kho_bau.ogg`; hiệu ứng trả lời, nhận sao, `chest_open.wav`, `collect_crystal.wav`, hoàn thành. Âm thanh được gọi trong đường chốt sự kiện đã có chống trùng; giữ nút bật/tắt tiếng. Rương/pha lê vẫn có âm khi Cú hỗ trợ sau sai/hết giờ, không tặng điểm.
- Giữ pause/resume, bỏ hoạt hình, chọn thủ công, sửa webcam chọn nhầm, thoát, chơi lại và Debug Camera. Video/canvas luôn gắn tại cùng vị trí qua các câu; không remount do hoạt hình.
- Giữ auto-arm: lần đầu giữ A/B/C/D đủ 1000ms trong answering mới chốt; cùng chữ chưa thả ở lượt sau cần nghỉ 500ms theo hook hiện hành. Thinking/pause không chấm.

## Bản đồ và lưu tiến trình

Rừng hoàn thành → mở Cầu Vồng; Cầu Vồng hoàn thành → mở Đảo Kho Báu; Đảo hoàn thành → mở Lâu Đài Boss. Chỉ ghi hoàn thành sau finish, không mở khi mới vào màn hoặc thoát sớm. Kết quả 0 điểm vẫn tính hoàn thành; không mất điểm/sao của hai màn trước hay thành tích tốt nhất khi chơi lại.

Giữ key `vuong-quoc-toan-hoc.adventure.v1`. Tiến trình cũ hai màn vẫn đọc được. Sau khi lưu và tải lại, màn 4 vẫn mở. Nếu trình duyệt chặn storage, giữ cơ chế hiện có: chơi/mở khóa trong phiên và báo không lưu được trên bản đồ. Màn 4 được mở khóa nhưng nội dung Boss còn đang chuẩn bị; chọn nó sẽ thấy thông báo, chưa có trận Boss.

## File thay đổi

- `src/App.tsx`: nhánh vào màn 3, callback lưu hoàn thành, điều hướng bản đồ.
- `src/adventure/stages.ts`: bật ready màn 3, nội dung dẫn chuyện và export `TREASURE_STAGE`.
- `src/adventure/AdventureStage.tsx`: đăng ký cảnh, nội dung giao diện theo màn và hiệu ứng vật phẩm; giữ engine/camera chung.
- Thêm `src/stages/treasure/TreasureSceneAdapter.tsx`.
- `src/stages/treasure/TreasureIslandScene.tsx`: sửa tên Cú mèo trong lời nhắc.
- `src/stages/treasure/treasureIsland.css`: áp dụng tùy chọn bỏ hoạt hình của engine.
- Thêm `tests/treasure-regression.mjs`; cập nhật `package.json` để chạy cùng bộ test.
- `tests/rainbow-regression.mjs`: giả định màn chưa sẵn sàng chuyển từ Đảo sang Boss.
- `tests/answer-camera-regression.mjs`: bỏ so sánh bất biến toàn file App/cấu hình vì đây là hai điểm tích hợp; test mới kiểm tra điều hướng, mở khóa và cấu hình hai màn đầu không đổi. Giữ toàn bộ test camera thực thi với khớp mô phỏng và các so sánh lõi cũ.
- Tài liệu: báo cáo này, ghi chú cập nhật trong `docs/RAINBOW_STAGE.md` và `docs/TECHNICAL_SPEC.md`.
- `dist/` và `tsconfig.app.tsbuildinfo`: đầu ra được tạo lại khi build. `package-lock.json` không đổi sau npm install; asset/âm thanh gốc không đổi.

## Kiểm tra đã chạy

- `npm install`: thành công, audit không phát hiện lỗ hổng tại lần chạy.
- `npm test`: cả bốn bộ hồi quy đạt. Màn 3 kiểm tra 27 tổ hợp đúng/sai/hết giờ; chống trùng, vật phẩm, rương mở trong feedback, giữ điểm cũ và lưu/mở Boss.
- Component engine thật với camera/đồng hồ mô phỏng: click trùng, sự kiện webcam, timeout, camera retry, pause/resume, mute, phát âm rương/pha lê một lần, chơi lại, một video cố định, chọn Kho Báu và Boss từ bản đồ.
- Bộ camera cũ: khớp mô phỏng A/B/C/D, 1000ms, lặp cùng chữ/nghỉ 500ms, giữ sớm, đổi dáng, pause/resume, không tạo lại model giữa lượt.
- `npm run build`: TypeScript và Vite thành công. Lần chạy qua pipe gặp `spawn EPERM` từ esbuild; chạy lại cùng lệnh qua PTY thành công, không cần đổi dependency hoặc cấu hình.

Chưa kiểm thử webcam thật, chưa nghe âm thanh trực tiếp, chưa kiểm tra trực quan trong trình duyệt hoặc đo hiệu năng laptop trong phiên này. Công cụ trình duyệt hiện không có phiên kết nối. Test mô phỏng không chứng minh độ chính xác webcam thật, đặc biệt dáng C.

## Cách nghiệm thu trên laptop

1. Chạy `npm run dev`, mở đúng địa chỉ/cổng đã dùng để giữ localStorage. Với trình duyệt mới: chỉ Rừng mở; chơi Rừng A/B/C rồi Cầu Vồng D/A/B, về bản đồ để mở Đảo.
2. Đảo: C/D/A đủ 1 giây trong answering. Kiểm tra bản đồ → chìa khóa → rương mở trong feedback → pha lê/tổng kết 30 điểm/3 sao. Mỗi vật phẩm và âm thưởng chỉ xuất hiện một lần.
3. Chơi lại: chọn sai B ở câu 1, câu 2 không chọn để hết 20 giây, câu 3 chọn A. Kiểm tra lời giải, Cú hỗ trợ và tổng 10 điểm/1 sao; vẫn mở Boss sau tổng kết.
4. Hai câu cùng chữ: giữ C ở câu 1 và tiếp tục giữ C qua câu 2; không tự chấm lại. Hạ tay nghỉ 500ms khi được nhắc, rồi giữ C đủ 1 giây để chốt câu 2. Thử tương tự A/B/D và đổi dáng giữa lúc đang giữ.
5. Tạm dừng khi đang suy nghĩ, giữ dáng, đọc phản hồi và mở rương. Chờ vài giây rồi tiếp tục: thời gian giữ lại, pause không chốt/chuyển câu, webcam không bật lại. Bật Debug Camera để quan sát khi cần; không lưu ảnh/video.
6. Thử click trong lúc camera giữ gần đủ 1 giây/gần hết giờ: tối đa một kết quả. Nếu webcam chốt nhầm, dùng nút chọn lại trong phản hồi, kiểm tra điểm/vật phẩm chỉ tính kết quả thay thế.
7. Thử tắt/bật tiếng, bỏ hoạt hình, tiếp tục, chơi lại và thoát sớm. Thoát sớm không mở Boss; hoàn thành rồi tải lại vẫn mở. Điểm Rừng/Cầu Vồng và điểm tốt nhất của Đảo được giữ. Thử từ chối camera để trả lời bằng chuột.
8. Trở lại Rừng và Cầu Vồng, kiểm tra nhận dáng đầu tiên; mở **Luyện webcam & kiểm thử 12 câu cũ**, hoàn thành cả 12 câu bằng webcam, đặc biệt dáng C. Luật và bộ đề cũ không đổi; chế độ luyện không ghi tiến độ phiêu lưu.

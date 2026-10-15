# Bàn giao trạng thái hiện tại — 15/10/2026

Đọc file này cùng `AGENTS.md` và `TECHNICAL_SPEC.md` trước khi tiếp tục. Các ghi chú lịch sử khác có thể mô tả hành vi cũ; ưu tiên trạng thái dưới đây.

## Công việc tiếp theo

**GitHub đã tải mã xong; Vercel chưa triển khai.** Người dùng đang được hướng dẫn cài/kết nối ứng dụng Vercel trong ChatGPT và đăng nhập cấp quyền. Chưa có xác nhận đã kết nối. Khi người dùng báo đã kết nối, kiểm tra công cụ Vercel hiện có rồi tiếp tục triển khai dự án này. Không yêu cầu lại các bước Git đã hoàn thành. Không tuyên bố game đã có URL production.

Người dùng muốn trợ lý tự làm phần triển khai, không muốn nhận lặp lại các hướng dẫn/lệnh. Đã phàn nàn vì thời gian tải lên GitHub lâu; ưu tiên báo kết quả ngắn gọn và thực hiện trực tiếp khi có quyền.

## Nơi lưu và triển khai

- Workspace: `C:\Users\LENOVO\Desktop\Vuong_Quoc_Tro_Choi_Starter_v01`.
- Game local đã chạy tại `http://127.0.0.1:5173/`; kiểm tra lại server ở phiên mới trước khi khẳng định đang chạy.
- Kho đúng: https://github.com/kimtaehyung26121998-del/vuongquoctrochoi
- Nhánh GitHub: `main`.
- Commit đã xuất bản: `fe28183a0d44af29e00125b4cbec8525ae1a026b`.
- Tree đã đối chiếu: `215defe07301ed8022dee1ba80499b3d9795ffc1`.
- Đã xác minh 259/259 file trên GitHub khớp SHA blob của file tại máy, không bị cắt kết quả. Có 208 nội dung file duy nhất do trùng file baseline.
- Có `vercel.json`: framework Vite, build `npm run build`, output `dist`.
- `.vercelignore` loại node_modules, dist, ZIP sao lưu, module gốc trùng, docs/tests và file cục bộ khỏi upload CLI. `.gitignore` giữ các thư mục baseline được tests dùng, bỏ qua ZIP/log/module trùng và `.vercel/`.

### Git tại máy chưa đồng bộ metadata với GitHub

Tại thời điểm lưu, local commit là `1c24d6cfc68b83333380773eea9d2206f49b36fe`; `origin` vẫn trỏ tới tên sai `https://github.com/kimtaehyung26121998-del/vuong-quoc-toan-hoc.git`.

Trong phiên này `.git/config` bị từ chối ghi và Git/CLI Vercel bị hạn chế kết nối mạng. Vì vậy mã được tải bằng kết nối GitHub: tạo README khởi đầu, upload blob/tree, tạo commit và cập nhật `main`. Lịch sử remote này khác lịch sử local. **Không force-push hoặc reset để đồng bộ.** Khi có quyền Git bình thường, kiểm tra remote và lịch sử trước, sửa origin sang kho đúng rồi đồng bộ theo cách giữ cả hai lịch sử. Đừng hứa rằng origin tại máy đã được sửa.

Kết nối GitHub đã xác nhận đúng tài khoản `kimtaehyung26121998-del`, có quyền ghi kho. Tên `vuong-quoc-toan-hoc` trước đó không tồn tại trong danh sách truy cập; `vuongquoctrochoi` là kho game đúng. Không đẩy vào các kho khác của người dùng.

## Game đã hoàn thành

- React + TypeScript + Vite; bốn màn: Rừng, Cầu Vồng, Đảo Kho Báu và Lâu Đài Boss.
- Rừng/Cầu Vồng/Đảo: sai hoặc chưa trả lời phải làm lại đến khi đúng; sai chỉ báo phương án đã chọn sai, không lộ đáp án đúng/lời giải. Chỉ đủ ba câu đúng mới hoàn thành/mở màn sau.
- Boss: ba lớp khiên; chỉ đúng mới gây sát thương và +10 điểm. Sai/hết giờ dùng câu thay thế; hết chín câu chưa thắng cho luyện lại, không ghi hoàn thành.
- Đảo: Cú chỉ tiến khi đúng, sai đứng yên; đúng câu cuối tới rương. Có bản đồ, chìa khóa, mở rương, âm thanh và tổng kết.
- Ngân hàng chung 50 câu: 25 cộng không nhớ, 25 trừ không mượn trong phạm vi 100. Rút ngẫu nhiên bằng bộ bài chung; không trùng đến khi hết vòng. Màn thường ba câu, Boss chín câu dự phòng, phòng luyện 12 câu.
- Mỗi lần mở/tải lại trang bắt đầu chỉ mở Rừng; hoàn thành lần lượt mới mở màn sau. Tiến trình chỉ trong bộ nhớ App, không đọc/ghi tiến trình localStorage. Không có hệ thống đăng nhập/backend.
- Tổng kết Rừng: Chọn chế độ bên trái, Chơi lại bên phải.
- Sau thắng Boss: màn riêng với “Chúc mừng bạn đã tiêu diệt Boss!”, cúp chuyển động, pháo hoa CSS, nút bản đồ/chơi lại và bật/tắt tiếng. Có giảm chuyển động theo thiết lập hệ điều hành.

## Webcam và nhận diện — phần cần theo dõi trên máy thật

**Chưa kiểm thử webcam thật trong phiên này.** Kiểm thử đã chạy bằng dữ liệu khớp, camera/MediaPipe mô phỏng và hook/engine thật. Không lưu ảnh/video trẻ em, không gửi video lên server. Không hứa độ chính xác đã hiệu chuẩn.

- Các màn dùng chung `useAnswerCamera`; giữ auto-arm, hold 1000ms, nghỉ 500ms và chống chấm lặp.
- `usePoseCamera` mở/reset cửa sổ bằng layout effect để tránh RAF chốt bằng thời gian giữ cũ rồi bị xóa sự kiện. Quyền chốt cập nhật tại commit.
- Xác nhận chuyển trực tiếp qua callback trong cùng RAF tới engine. Engine chỉ ghi event đã xử lý sau khi nhận, giữ khóa đồng bộ để timeout/click không chấm trùng. Có đường nhận qua effect tương thích camera mô phỏng.
- Đã bỏ khóa riêng Boss sau mọi câu sai. Đổi chữ có thể nhận trong cửa sổ mới; cùng chữ chưa thả vẫn cần nghỉ. Boss giữ đồng hồ khi camera báo cần nghỉ.
- Người dùng từng nói “webcam nhận mà game không chọn”, sau đó làm rõ thanh giữ dáng không chạy và hạ tay chưa thấy NGHỈ. Classifier đã sửa ưu tiên nghỉ khi tay hạ dưới hông để tránh D nuốt NGHỈ.
- A/B hiện hành: A đòi hai cổ tay cao rõ trên mũi; B nâng hơi cao gần mặt vẫn là B; có vùng đệm. Bản nới A quá rộng trước đó đã được thay thế.
- **Sửa mới nhất là D không nhận:** đã bỏ yêu cầu khuỷu phải dang rộng hơn vai. D cần cổ tay vùng eo/hông, cẳng tay hướng vào eo, khuỷu có gập nhưng cho phép dang vừa/gập nhẹ hơn. Tay buông gần thẳng và cẳng tay không hướng vào eo nhận NGHỈ. Bản này đã kiểm thử mô phỏng, chưa có phản hồi thực tế người dùng sau sửa.
- Không sửa mô hình/thuật toán MediaPipe hoặc thuật toán stabilizer trong các sửa classifier gần đây. Không bỏ kiểm tra thiếu khớp để chấm đoán.

File chính: `src/ai/poseClassifier.ts`, `src/ai/usePoseCamera.ts`, `src/ai/useAnswerCamera.ts`, `src/ForestAdventure.tsx`, `src/adventure/AdventureStage.tsx`.

## Giao diện hiện hành

- `src/ui-scale.css`: zoom 0.931, tức 98% rồi giảm thêm 5%.
- `src/viewport-layout.css`: root vừa viewport, khóa cuộn toàn trang; cảnh/câu hỏi/camera có khung ổn định, dành chiều cao cố định cho thông báo và phản hồi. Nội dung dài cuộn trong vùng riêng. Trên màn nhỏ có cuộn bên trong bố cục để còn truy cập được điều khiển.
- Hai CSS trên được import ở `src/main.tsx`. Không chỉnh lại các CSS baseline cũ nếu không cần.
- Chưa xác minh trực quan bằng trình duyệt trong phiên này; giao diện máy người dùng vẫn cần kiểm tra.

## Kiểm chứng gần nhất

- `npm test`: toàn bộ 15 bộ đạt, bao gồm A/B, B/D, nghỉ, D tự nhiên, auto-retry, chấm camera, vòng đời webcam và cả bốn màn dưới StrictMode.
- `npm run build`: TypeScript và Vite thành công sau bản sửa D mới nhất.
- Không cần chạy lại chỉ vì lưu tài liệu này. Chạy kiểm tra phù hợp khi sửa mã tiếp.
- Trên Windows dùng `npm.cmd`; build có lúc cần exec có `tty:true` do lỗi spawn EPERM của môi trường.
- Các tests dùng baseline ở ba thư mục con `backups/before-*`; không bỏ các baseline này khỏi Git nếu chưa chuyển fixtures và sửa tests.

## Báo cáo liên quan

- `docs/NATURAL_D_FIX.md`: bản sửa D mới nhất, 108 mẫu D khuỷu dang vừa.
- `docs/STRICT_ABD_BOUNDARIES.md`: tách B cao/A và tay buông/D.
- `docs/NEUTRAL_UNLOCK_FIX.md`: lỗi tay hạ vẫn thành D, kiểm thử 162 mẫu nghỉ.
- `docs/CAMERA_DELIVERY_RACE.md`: race khi chuyển câu và callback nhận đáp án.
- `docs/BOSS_VICTORY_SCREEN.md`: màn kết thúc Boss.
- `docs/QUESTION_BANK_50.md`: bộ câu hỏi.
- `docs/treasure-module/`, `docs/boss-module/`: tài liệu tích hợp.

## Sao lưu gần đây

Các file ZIP nằm trong `backups/` tại máy và được bỏ qua khi push. Ví dụ:
- `before_natural_d_20261015_133513.zip`: trước sửa D mới nhất.
- `before_strict_abd_20261015_133025.zip`: trước siết A/B/D.
- `before_fixed_viewport_20261015_132649.zip`: trước cố định viewport.
- `before_boss_victory_20261015_131422.zip`: trước màn chiến thắng Boss.

Tài liệu bàn giao này được lưu tại workspace sau khi tải mã lên GitHub; bản lưu này chưa được commit/push. Không chứa token hoặc mật khẩu.

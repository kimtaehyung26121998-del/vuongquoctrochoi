# Giao diện Hành trình pha lê — 18/10/2026

Đã áp dụng trực tiếp vào bản mã nguồn hiện tại. Chưa triển khai lên web online.

## Hướng thiết kế

Bốn thế giới có cảnh vector riêng, khung ứng dụng xanh đêm và bàn phép tính màu kem. Các đáp án A/B/C/D dùng bốn màu nhất quán trên nút và thẻ gợi ý tư thế. Bản đồ có bộ sưu tập bốn pha lê; thanh hành trình trong màn chơi cho biết vị trí hiện tại.

- Rừng: nhiều lớp cây, ánh nắng, nấm và dòng sông.
- Cầu Vồng: mây, đảo bay và hành tinh có vành đai; tiếp tục không có thiên thần.
- Kho Báu: biển nhiệt đới, bãi cát, cây cọ; giữ hoạt ảnh đào đồ và mở rương.
- Boss: lâu đài dưới trăng, núi nhiều lớp, pha lê và thanh khiên.

Cảm hứng tham khảo: cách tạo vùng đất riêng trong [Super Mario Bros. Wonder](https://supermariobroswonder.nintendo.com/fr/), sự trực quan của [PBS KIDS](https://pbskids.org/games/math) và học qua chơi của [Khan Academy Kids](https://learn.khanacademy.org/khan-academy-kids/). Toàn bộ cảnh mới được tự vẽ bằng SVG, không dùng nhân vật hoặc tài nguyên của các trò chơi này.

## Phạm vi giữ nguyên

Không thay đổi bộ câu hỏi cộng, trừ dưới 30; state, thời gian, điểm, mở khóa, camera, MediaPipe hoặc stabilizer. Các data attribute mới chỉ phục vụ màu sắc, pha hiện hành và nhắc thời gian còn ít. Không lưu ảnh hoặc video webcam.

## Ba vòng tự rà soát

1. Dựng bốn SVG thành ảnh PNG và quan sát trực tiếp: kiểm tra bố cục, bảng màu và sự khác biệt của từng thế giới. Điều chỉnh lớp hiệu ứng nhẹ, giữ phần giữa cảnh cho nhân vật và hành động.
2. Kiểm thử render component thật ở 24 pha giao diện; chạy các hồi quy game/camera. Bổ sung kiểm tra tương phản, nội dung cảnh, tài nguyên nội bộ và chế độ giảm chuyển động.
3. Rà lại CSS cascade và bố cục hẹp; bổ sung quy tắc dưới 380px, lớp báo tạm dừng và khả năng cuộn khi chiều cao laptop thấp. Xác minh lại bằng build và bộ kiểm thử.

Giới hạn: cả Chrome và trình duyệt trong ứng dụng đều không có kết nối điều khiển trong phiên này. Vì vậy **chưa xem toàn bộ giao diện bằng trình duyệt, chưa có ảnh chụp giao diện thật và chưa kiểm thử webcam thật**. Kiểm thử render ở trên là render React ra HTML, không thay thế xác minh bố cục bằng trình duyệt. Không vượt giới hạn năm vòng tự rà soát.

## File chính

- `src/crystal-kingdom.css`: lớp giao diện mới, nạp cuối trong `src/main.tsx`.
- `src/adventure/JourneyTrail.tsx`, `WorldAtmosphere.tsx`: component trình bày, không thay đổi state game.
- `public/assets/worlds/*.svg`: bốn nền mới; giữ nguyên các asset gốc.
- `scripts/create_world_art.mjs`: tái tạo nền bằng `node scripts/create_world_art.mjs`, không cần thư viện ngoài.
- `tests/kingdom-ui.mjs`: kiểm tra giao diện và tương phản; nằm trong `npm test`.

Công cụ `@resvg/resvg-js` chỉ được cài tạm bằng `--no-save --package-lock=false` để duyệt SVG; không phải dependency runtime và không cần để build/test dự án.

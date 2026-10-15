# Hoạt ảnh và bố cục v2

Thay đạo cụ SVG rời bằng tám frame PNG vẽ liền robot, bàn tay và dụng cụ.
Búa: nâng → hạ → chạm đinh → thu tay (lặp hai nhịp). Xẻng: cắm → ấn
→ xúc đất → hất đất (một chuỗi trước khi nhận vật phẩm). Giữ nguyên thời
gian phản hồi, cách chấm điểm và camera. Khung làm việc kết thúc trước
khi robot di chuyển, hỗ trợ tạm dừng/bỏ hoạt hình/giảm chuyển động.

Màn Cầu Vồng: `.sky-traveler` luôn chứa robot; `.sky-helper` chứa thiên
thần cố định bên phải. Thiên thần hỗ trợ hóa phép/cổ vũ, không qua cầu.

Bố cục `src/game-layout.css`: bỏ thu nhỏ toàn trang, cột chính rộng hơn,
cảnh tối thiểu 340px, đáp án nằm ngang với hình 94px (112px màn lớn).
Thông báo/câu hỏi tự giãn, không đặt chiều cao cố định cắt nội dung.
Máy hẹp chuyển một cột, màn thấp cho cuộn trang. Camera và hướng dẫn
nằm cột phụ. CSS hiệu ứng frame tại `src/adventure/work-sprites.css`.

Ảnh được tạo bằng **built-in image_gen**, tham chiếu
`public/assets/mascot/robot_neutral.png`. Bộ sheet lưu tại
`public/assets/mascot/robot_work_sheet.png`; tám frame tại
`public/assets/mascot/robot_hammer_0.png`…`robot_hammer_3.png` và
`robot_shovel_0.png`…`robot_shovel_3.png`. Script tách:
`scripts/split_work_frames.ps1 -SourcePath <sheet>`.

Prompt đã dùng:

> Use case: identity-preserve. Asset: production 2D game sprite sheet, transparent PNG. Preserve EXACT reference robot identity: broad pale blue oval head, black face oval, two large white eyes blue pupils, yellow circular ears, pale blue segmented tapered torso, blue segmented arms and legs, blue gloves with yellow cuffs, large yellow shoes, crisp hand drawn cartoon line. Create a clean sprite sheet with EXACTLY 8 full-body sprites in a strict 4 columns x 2 rows uniform grid. Every cell same size, generous transparent separation, all feet share same baseline and same body/head scale. No text, no cell borders, no environment. Robot faces three-quarter toward RIGHT in EVERY frame. TOP ROW four consecutive frames hammering: 1 two hands firmly gripping a short wooden handle steel carpenter hammer, lifting hammer above right shoulder; 2 same robot bending slightly forward driving hammer down toward a small wooden plank near feet; 3 hammer head physically contacts plank near right foot, elbows flexed and torso following through; 4 hammer slightly rebounded and hands drawing back. BOTTOM ROW four consecutive shovel digging frames: 1 both blue gloved hands visibly wrapped around long wooden shaft of a metal digging shovel, blade touching ground to right of feet; 2 robot bends knees and leans forward pushing shovel blade down with body weight; 3 robot pulls shovel up and toward body using both hands, blade carrying a small mound of brown soil; 4 robot turns shovel slightly right and tosses soil while recovering upright. Hands and tools must be drawn together, correct grip, coherent shoulders/elbows/wrists, grounded feet. Keep recognizably same original robot in all eight frames. This is a polished illustrated game character animation sheet, NOT floating detached tool icons. Genuine transparent background.

Đã kiểm tra ảnh tách trên nền trắng; build và 16 bộ test đạt. Bộ test
hiệu ứng kiểm tra robot đi cầu/thiên thần riêng, chỉ đào khi đúng và
giữ chìa khóa qua câu 3. Chưa xác minh bố cục/chuyển động trong trình
duyệt ở phiên này vì không có trình duyệt kết nối.

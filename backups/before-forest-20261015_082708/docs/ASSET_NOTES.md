# Asset notes

- Tất cả hình cắt trong `public/assets` đều từ `public/assets/master_spritesheet.png` (ảnh gốc do AI tạo trong cuộc chat).
- Mã nguồn cắt/tái tạo ở `scripts/split_assets.py` (cần Pillow), danh sách và tọa độ ở `asset-manifest.json`.
- Kích thước gốc sprite 1055×1491: đủ hình chibi UI, **không đủ hình nền full màn hình**. Stage background chỉ là thumbnail.
- Một vài hình cắt có thể còn mảnh trang trí sát mép hoặc thiếu viền: kiểm tra contact sheet `docs/asset_contact_sheet.jpg`, tinh chỉnh toạ độ nếu cần.
- Game dùng các file riêng, KHÔNG crop sprite bằng CSS runtime.
- Âm thanh là 5 nhạc nền và 28 hiệu ứng do tổng hợp âm tạo trong cuộc chat (không phải nhạc được lấy từ kho bên ngoài).

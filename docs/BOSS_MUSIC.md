# Violet Castle — nhạc Boss mới

Nhạc không lời tự tổng hợp cho màn 4, tông Mi thứ hòa thanh, 132 BPM,
58,18 giây stereo 44,1 kHz, lặp vòng. Bass và dây nhịp ngắn, trống trầm,
chuông và tiếng vang phép thuật tạo không khí bí ẩn/kịch tính cho lâu
đài tím. Không dùng bản thu hay sample của bên thứ ba.

Tệp: `public/audio/music/04_lau_dai_boss_violet.ogg`, dùng cho cả màn
Boss tích hợp và module độc lập. Giữ mức volume của engine hiện tại,
đổi URL để trình duyệt không giữ nhạc cũ trong cache.

Tạo lại: cài numpy/soundfile vào môi trường Python rồi chạy
`python scripts/create_boss_music.py`. Thư viện phụ trợ tại `tmp/`
được bỏ qua khi Git/deploy, không thêm dependency vào game.

Đã giải mã kiểm tra đủ 58,18 giây, stereo, mẫu hữu hạn và peak 0,610
(không clipping). Bản OGG khoảng 724 KB.

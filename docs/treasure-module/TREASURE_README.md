# Đảo Kho Báu – Module màn 3 v1.0

Module bổ sung cho dự án Vương Quốc Toán Học, phát triển theo hướng không đụng vào phần AI webcam đang chạy tốt.

**Đây chưa phải bản đã tích hợp vào project Windows**. Sao chép file mới vào project, sau đó đưa `docs/CODEX_TICH_HOP.md` cho Codex thực hiện liên kết với màn 1/2 và kiểm thử.

### Đã có

- 3 thử thách: mảnh bản đồ, chìa khóa vàng, rương pha lê.
- Hình ảnh cú mèo, rương đóng/mở, pha lê, sao từ asset cũ; 2 vật phẩm SVG mới.
- Hoạt hình CSS nhẹ, không đụng vào camera.
- Phản hồi đúng/sai/hết giờ, hoàn thành màn bất kể kết quả (không tặng điểm cho câu sai).
- Có bảng tiến độ và nhãn rõ ràng.
- API component typed, xử lý dữ liệu kết quả chấm sẵn.

### Giới hạn

Không kèm mã nguồn hiện hành của `ForestAdventure`, `RainbowScene`, `useAnswerCamera` do bản này chỉ hiện có trên laptop người dùng. Việc tích hợp và kiểm thử end-to-end cần làm trong workspace đó.

### Cài module an toàn vào dự án

Giải nén ZIP ra một thư mục riêng. Trong VS Code, mở terminal tại thư mục gốc của game (nơi có `package.json`), chạy:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\duong-dan\Dao_Kho_Bau_Module_v1\APPLY_MODULE.ps1"
```

Thay `C:\duong-dan` bằng vị trí đã giải nén. Script chỉ sao chép **10 file mới**, sẽ dừng nếu có file trùng và KHÔNG sửa webcam/App. Sau đó dán nội dung `docs/CODEX_PROMPT.txt` vào Codex để nối màn mới với hệ thống hiện hành.

# Kiểm tra gói WF07 — 14/10/2026

- npm ci theo package-lock.json gốc, không thêm dependency vào repository.
- npm run build của NestJS: thành công (môi trường kiểm tra Node 24; máy Dương dùng Node 22).
- 31 kiểm tra thành công: migration chạy lặp không mất dữ liệu; HTTP GET/PUT qua NestJS ValidationPipe; config sai thứ tự; phòng không tồn tại; state sai; dữ liệu ngày lỗi; khởi tạo bình thường; critical; chống lặp; critical sang warning; trở lại normal; độ ẩm; nhiều chỉ số; null/chuỗi/boolean/ngoài miền; Gmail giả lập lỗi không lưu state; chỉnh config có tác dụng; seed không đè config.
- Database kiểm tra: PGlite (PostgreSQL nhúng) tạm thời, không phải container PostgreSQL 16 của Dương.
- Workflow: chạy mã Code, biểu thức HTTP và thứ tự nhánh bằng bộ mô phỏng; Gmail được giả lập, không gửi email thật. Đã kiểm tra không còn Google Sheets/Data Table/credential trong JSON.
- Chưa import/chạy trên n8n 2.39.8 thực tế, chưa thử credential Gmail hoặc MQTT/Wokwi. Cần thực hiện bảng kiểm thử trên máy Dương trước khi bàn giao.
- Không bảo đảm exactly-once email; cùng phòng phải chạy tuần tự. Khi Gmail thành công nhưng PUT state thất bại, lần chạy sau có thể gửi lại. Đây là giới hạn cần biết khi tích hợp, không phải cơ chế cảnh báo đã được kiểm chứng chịu tải.

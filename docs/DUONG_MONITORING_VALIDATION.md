# Kiểm tra gói WF08/WF09/Dashboard — 15/10/2026

## Kết quả đã thực hiện

- Backend: npm run build thành công sau khi thêm MonitoringModule và giữ EnvironmentModule của gói trước.
- Frontend: npm run build -- --webpack thành công; kiểm tra TypeScript và tạo trang thành công. Môi trường kiểm tra Node 24 / Next 16.4.0; máy Dương đang dùng Node 22. Không thêm thư viện vào package.json.
- 39 kiểm tra backend/workflow qua NestJS HTTP + ValidationPipe + PostgreSQL nhúng PGlite: migration lặp, FK phòng, Config sai, state sai, bật/tắt theo ngưỡng, vùng giữ nguyên hysteresis, đếm phòng trống, chống lặp, có người trở lại, dữ liệu sai/cũ, cảnh báo ngoài giờ, phục hồi, giờ đúng biên, lịch qua nửa đêm, bỏ qua trường demo khi gọi từ workflow cha, lọc lịch sử lệnh theo phòng.
- 9 kiểm tra React tương tác trong jsdom với API giả lập: tải số đo/trạng thái, body lệnh đúng, phân biệt PENDING/SENT/ACK, lỗi gửi lệnh giữ nguyên khi tải lại, lỗi backend giữ dữ liệu cũ kèm thông báo, kết nối phục hồi.

## Giới hạn của kiểm tra

- Chưa import/chạy hai JSON trên n8n 2.39.8 của Dương: phần Code/biểu thức/nhánh được chạy bằng bộ mô phỏng với API thật trong test.
- PGlite là PostgreSQL nhúng tạm thời, không phải container PostgreSQL 16 của Dương. Cần chạy migrations và bảng kiểm thử trên máy thật.
- Không gửi email hoặc MQTT, không điều khiển Wokwi trong kiểm tra.
- Chưa kiểm tra ảnh giao diện trên Chromium: môi trường không có trình duyệt và tải binary thất bại. Build và kiểm tra tương tác DOM đã qua; người dùng cần xem màn hình desktop/mobile sau khi cài.
- Timer phòng trống được đánh giá mỗi khi có bản tin mới; không tự chạy khi mất telemetry. Mặc định đề xuất 120 giây, giờ hoạt động 07:00–22:00 mỗi ngày; nhóm cần chốt chính sách.
- Workflow cùng phòng cần chạy tuần tự. API state chưa bảo đảm giao dịch xuyên suốt toàn workflow; không cam kết xử lý đúng một lần khi mất mạng/caller lỗi. Caller lưu/retry yêu cầu trả về, không tạo lại bằng cách chạy lại child workflow có chống lặp.
- Lệnh điều khiển và yêu cầu incident chỉ được coi hoàn tất end-to-end sau khi Khoa/Vinh/Hiệp nối dispatcher, MQTT, ACK và WF10.

Xem DUONG_TEST_AND_HANDOFF.md để chạy các trường hợp, hiểu đầu vào/đầu ra và bàn giao.

# Dương — kiểm thử và bàn giao WF07/08/09 + dashboard

## Phạm vi hoàn thành và điều kiện tích hợp

Code cung cấp logic ba workflow, cấu hình/trạng thái PostgreSQL qua NestJS, dashboard cảm biến/thiết bị, điều khiển thủ công, lịch sử lệnh/cảm biến và hiển thị trạng thái automation. WF07 đã được Dương xác nhận chạy các trường hợp cơ bản trên máy mình. WF08/WF09 và dashboard mới còn cần chạy bảng test dưới đây trên máy Dương.

Chức năng tự động hóa nằm trong các Code node n8n. Backend chỉ kiểm tra dữ liệu và lưu/đọc; frontend chỉ gọi backend. WF08/WF09 không trực tiếp MQTT hoặc SQL, không tạo lệnh từ dashboard qua n8n trực tiếp.

Lệnh từ WF08 và incident/còi từ WF07/WF09 là yêu cầu trả về. Khoa/Vinh/Hiệp phải nối dispatcher/incident/ACK để hoàn tất đường đi đến Wokwi. Không coi tạo request hoặc HTTP 200 là thiết bị đã thực thi.

## Chính sách mặc định đề xuất, cần nhóm chốt

| Quy tắc | Mặc định |
|---|---|
| Phòng trống liên tục | 120 giây rồi đề nghị FAN OFF, LIGHT OFF |
| Có người, nóng | FAN ON ở >=30°C |
| Hết nóng | FAN OFF ở <=28°C |
| Có người, tối | LIGHT ON khi light_percent <=40 |
| Đủ sáng | LIGHT OFF khi light_percent >=60 |
| Giờ được phép có người | 07:00 <= giờ <22:00, tất cả các ngày |
| Múi giờ | Asia/Ho_Chi_Minh |

Hai ngưỡng bật/tắt khác nhau tạo vùng giữ nguyên (hysteresis): ví dụ quạt đang bật, nhiệt độ giảm còn 29°C thì giữ bật; giảm tới 28°C mới đề nghị tắt. Không bật/tắt liên tục ở một ngưỡng duy nhất. Khi chưa có mục tiêu cũ và số đo ở vùng giữa, trả KEEP.

Đây là mặc định thiết kế trong gói, không phải yêu cầu giờ/giây đã được thầy xác nhận. Config được đọc lại mỗi lần chạy. API PUT /api/monitoring/config/A101 nhận đủ các trường:

```json
{"empty_delay_seconds":120,"fan_on_temperature":30,"fan_off_temperature":28,"light_on_below_percent":40,"light_off_above_percent":60,"allowed_start_minute":420,"allowed_end_minute":1320,"timezone":"Asia/Ho_Chi_Minh"}
```

420=7*60; 1320=22*60. Cho phép lịch qua nửa đêm khi start>end. Không chấp nhận start=end. Chưa hỗ trợ cuối tuần/lịch nghỉ riêng.

## WF08 — test tại node Du lieu mau

Mỗi dòng là một lần Execute workflow. Xem kết quả node Dau ra. Không pin dữ liệu.

| Lần | occupancy | temperature | light_percent | test_empty_seconds | Mong đợi |
|---|---|---|---|---|---|
| 1 | true | 32 | 20 | 0 | ACTION, FAN ON + LIGHT ON |
| 2 | true | 32 | 20 | 0 | NO_CHANGE, command_requests rỗng |
| 3 | true | 29 | 50 | 0 | Giữ ON, không tạo lệnh mới |
| 4 | true | 27 | 80 | 0 | ACTION, FAN OFF + LIGHT OFF |
| 5 | false | 27 | 80 | 0 | WAITING, chờ đủ 120 giây |
| 6 | false | 27 | 80 | 121 | EMPTY, đề nghị FAN OFF + LIGHT OFF |
| 7 | false | 27 | 80 | 121 | NO_CHANGE |
| 8 | true | 32 | 20 | 0 | ACTION, FAN ON + LIGHT ON |

Nếu đã có trạng thái từ lần test trước, lần 1 có thể NO_CHANGE. Chạy một mẫu occupancy=true, temperature=27, light_percent=80 trước rồi bắt đầu bảng để tạo chuyển trạng thái rõ ràng.

test_empty_seconds chỉ có hiệu lực trên nhánh Manual Trigger; mô phỏng thời gian trống để demo nhanh. Nhánh When Executed by Another Workflow bỏ qua trường này dù caller gửi vào. Chạy thật phải có telemetry đến đều; khi telemetry ngừng, WF08 không có lịch tự thức dậy để tắt sau 120 giây. WF06 của Vinh xử lý mất thiết bị; không dùng tín hiệu mất kết nối để suy ra phòng trống.

Để kiểm tra chờ thật: chạy occupancy=true trước, sau đó occupancy=false/test_empty_seconds=0, chờ ít nhất 120 giây rồi chạy tiếp một mẫu false mới. Kết quả EMPTY. Trong tích hợp WF01 cung cấp bản tin định kỳ.

## WF09 — test giờ ngoài giờ

Node Du lieu mau có test_hour. Đây là giờ địa phương giả lập chỉ dùng khi Manual Trigger chạy; phút được đặt 00. Workflow cha luôn dùng thời gian hệ thống theo timezone Config, không tin trường test_hour từ input.

| Lần | occupancy | test_hour | Mong đợi |
|---|---|---|---|
| 1 | true | 10 | NO_CHANGE, security_active=false |
| 2 | true | 23 | ALERT, incident_request và buzzer ON |
| 3 | true | 23 | NO_CHANGE, không tạo lại yêu cầu |
| 4 | false | 23 | RECOVERED, security_buzzer_release=true |
| 5 | true | 23 | ALERT mới |
| 6 | true | 10 | RECOVERED vì đã trong giờ được phép |

WF09 không tự gửi email; incident_request/should_notify được chuyển WF10 hoặc luồng thông báo của nhóm. Trạng thái được lưu trước khi trả yêu cầu về caller. Khi caller gửi sự cố/lệnh lỗi, cần retry chính yêu cầu đã nhận, không dựa vào việc chạy lại WF09 vì có chống trùng.

Dashboard có thể báo an ninh đang cảnh báo nhưng danh sách sự cố vẫn trống nếu WF10 chưa được nối. Hai phần này lấy dữ liệu từ hai bảng khác nhau.

## Dữ liệu không hợp lệ

- occupancy phải là boolean, không phải chuỗi "true" hay số 1.
- WF08 cần temperature dạng số trong -40..80 và light_percent số 0..100.
- Timestamp (nếu có) phải hợp lệ, không cũ quá 120 giây hoặc vượt tương lai quá 30 giây. WF01 nên gắn thời gian nhận tin mới, không truyền timestamp cũ từ một execution trước.
- Dữ liệu sai kết thúc tại Du lieu loi, trạng thái INVALID, không cập nhật DB hoặc tạo yêu cầu điều khiển.
- Chỉ một bản tin/phòng cho mỗi execution. Tất cả workflow cùng phòng cần gọi tuần tự để tránh đua đọc-ghi state; state APIs chưa có giao dịch bao phủ toàn bộ execution.

## Kiểm tra dashboard

1. Gửi telemetry bằng TEST Duong - Gui telemetry hoặc WF01. Các sensor cards và lịch sử phải đổi theo bản ghi backend.
2. Chạy WF07/08/09. Ba thẻ giám sát phải cập nhật trong vài giây.
3. Bấm Bật quạt. UI khóa nút lúc đang gửi và hiển thị kết quả nhận lệnh. PENDING nghĩa là lưu rồi/chưa gửi; SENT là đã chuyển đến n8n; ACK mới là backend đã nhận xác nhận.
4. Kiểm tra lịch sử có đúng FAN ON của thiết bị trong phòng A101. Lịch sử được lọc phòng ở backend.
5. Khi WF04/WF05 chưa sẵn sàng, PENDING không chứng minh frontend lỗi. Khoa/Vinh phải cấu hình webhook và ACK.
6. Tắt backend trong lúc demo: giao diện báo lỗi kết nối; không biến mất lỗi lệnh vì polling dữ liệu. Bật lại backend: polling tự phục hồi.
7. Không có telemetry mới hơn 2 phút: hiện nhãn dữ liệu cũ. ONLINE hiển thị trạng thái backend; việc chuyển thiết bị OFFLINE thuộc WF06, không tự suy đoán từ frontend.
8. Màn hình nhỏ vẫn xem được cards/nút, bảng có thanh cuộn ngang.

Mẫu của WF08/WF09 chỉ cập nhật trạng thái xử lý, không POST telemetry. Do đó đổi mẫu WF08 không tự đổi các sensor cards. Sensor cards hiển thị dữ liệu đo đã được WF01 lưu.

## Khoa nối vào workflow chính

Sau node normalize của WF01, giữ nguyên telemetry (room A101, device_id ESP32_A101). Nếu POST /telemetry trả entity có roomId/deviceId UUID thì lấy lại bản tin normalize trước khi gọi sub-workflow.

Gọi từng workflow bằng Execute Sub-workflow, mỗi lần một item, Wait for completion bật. Dùng ba nhánh từ cùng dữ liệu normalize hoặc lưu đầu vào rồi lấy lại trước mỗi lời gọi. Không nối thẳng output WF07 làm input WF08, vì output WF07 là yêu cầu cảnh báo, không còn đầy đủ các số đo.

| Đầu ra | Caller xử lý |
|---|---|
| WF07 incident_request | Chuyển WF10 để tạo/duy trì sự cố môi trường |
| WF07 incident_resolution_request | WF10 đóng đúng sự cố môi trường |
| WF08 command_requests | Master xét ưu tiên/manual/safety rồi chuyển WF04 từng phần tử |
| WF09 incident_request | WF10 tạo sự cố AFTER_HOURS_SECURITY |
| WF09 incident_resolution_request | WF10 đóng sự cố an ninh đúng phòng/type |
| WF07/WF09 device_request buzzer ON | Master cập nhật nguyên nhân đang yêu cầu còi |
| environment_buzzer_release / security_buzzer_release | Chỉ bỏ nguyên nhân tương ứng; tắt còi khi không còn nguyên nhân nào |
| NO_CHANGE / WAITING / INVALID | Không gửi lệnh/incident mới |

Master không được dùng WF08 để ghi đè an toàn hoặc lệnh thủ công ngoài chính sách nhóm. Các fan_target/light_target là ý định tự động đã tính, không phải ACK hay trạng thái phần cứng.

WF08 command_requests đã dùng body phù hợp POST /api/commands: device_id, command_type FAN/LIGHT, action ON/OFF, source AUTO, payload. API này chỉ tạo bản ghi PENDING theo backend hiện có; dispatcher còn phải publish MQTT và cập nhật/ACK. Không dùng /commands/manual cho lệnh tự động.

WF10 map incident_request.room_id -> room, type -> incident_type và lấy device_id từ output ngoài cùng. incident_resolution_request không có incident UUID: WF10 cần lưu/tìm đúng ID rồi PATCH /api/incidents/:id/resolve. Chống tạo trùng sự cố thuộc WF10.

## API bổ sung để Vinh review

GET/PUT /api/monitoring/config/:room — cấu hình chung.
GET/PUT /api/monitoring/energy-state/:room — trạng thái WF08.
GET/PUT /api/monitoring/security-state/:room — trạng thái WF09.
GET /api/monitoring/rooms/:room — cấu hình + hai trạng thái cho dashboard.
GET /api/monitoring/commands/:room — 12 lệnh mới nhất của đúng phòng.

room_id của các bảng bổ sung chứa mã A101, FK rooms.code (giống gói WF07), không phải UUID room_id trong telemetry.

## Hoàn thành bàn giao

- [ ] Backend build thành công và migrations 002/003 chạy.
- [ ] Frontend build thành công, đọc được dữ liệu backend.
- [ ] WF07 chống lặp/phục hồi đã qua test.
- [ ] WF08 qua bảng trường hợp và thử chờ thật.
- [ ] WF09 qua bảng trường hợp và kiểm tra caller bỏ qua test_hour.
- [ ] Kiểm tra một lệnh thủ công có PENDING/SENT/ACK đúng thực tế.
- [ ] Code push nhánh duong-frontend, tạo PR cho Khoa.
- [ ] Khoa/Vinh review API/schema bổ sung và giờ/ngưỡng mặc định.
- [ ] Nhóm test Wokwi end-to-end; chỉ đánh dấu xong tích hợp khi có MQTT/ACK và incident thật.

Ảnh nên chụp: dashboard có dữ liệu; WF08 output command_requests OFF lúc EMPTY; WF09 output ALERT và RECOVERED; WF07 NO_CHANGE; lịch sử command ACK sau khi nhóm nối được thiết bị.

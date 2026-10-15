# Dương — chuyển WF07 sang backend

Gói bổ sung dựa trên smart-classroom-team-main.zip và WF07_ENV_ALERT.json mà Dương gửi ngày 14/10/2026. Không phải toàn bộ repository. Không thay .env, không xóa dữ liệu cũ, không thêm dependency.

## Phạm vi

- Config và trạng thái chống cảnh báo lặp lưu PostgreSQL; n8n đọc/ghi qua NestJS.
- Workflow mới tên WF07_ENV_ALERT_BACKEND_DUONG; giữ bản cũ để đối chiếu.
- Giữ Gmail và các yêu cầu incident/còi/giải phóng còi cho workflow cha.
- Chưa tích hợp WF10 tạo/đóng incident hoặc dispatcher MQTT. Workflow này không tự tạo incident hay gửi lệnh xuống mạch. Chưa hoàn thành WF08, WF09 hoặc nâng cấp dashboard.
- Chỉ có một telemetry trong mỗi lần chạy. Workflow cha cần gọi tuần tự cho cùng phòng; GET/PUT trạng thái chưa phải một giao dịch xuyên suốt xử lý email. Không chạy đồng thời hai bản WF07 cho cùng phòng.

## Cài đặt trên máy Windows của Dương

1. Kiểm tra đang ở nhánh duong-frontend bằng git branch --show-current.
2. Sao chép 4 thư mục backend, db, n8n-workflows, docs trong ZIP vào C:\Users\LENOVO\smart-classroom-team. Chỉ gộp các file bổ sung, không thay cả repo.
3. Mở backend/src/app.module.ts, thêm import:

```ts
import { EnvironmentModule } from './modules/environment/environment.module';
```

Trong mảng imports của @Module, thêm EnvironmentModule ngay sau DashboardModule:

```ts
    DashboardModule,
    EnvironmentModule,
```

Không sửa mảng entities vì module mới dùng DataSource hiện có để chạy SQL có tham số.

4. Tại thư mục gốc project, chạy hai lệnh PowerShell:

```powershell
docker cp .\db\migrations\002_environment.sql smart-classroom-postgres:/tmp/002_environment.sql
docker exec smart-classroom-postgres psql -U smartuser -d smart_classroom -v ON_ERROR_STOP=1 -f /tmp/002_environment.sql
```

Script thêm hai bảng, seed ngưỡng cho A101 nếu phòng đã tồn tại. Chạy lại không xóa trạng thái hoặc ghi đè ngưỡng đã chỉnh. Không cần docker compose down -v. init.sql không tự chạy lại trên volume cũ; cần lệnh migration này cả khi Khoa cài.

5. Ở terminal backend, Ctrl+C rồi chạy npm run build; khi build thành công chạy npm run start:dev. Kiểm tra:

```text
http://localhost:3001/api/environment/config/A101
http://localhost:3001/api/environment/state/A101
```

Trước khi chạy workflow, state trả {"found":false}. Đây là trạng thái hợp lệ, không phải lỗi.

6. Trong n8n tạo workflow trống rồi menu ba chấm > Import from File, chọn n8n-workflows/07_ENV_ALERT_BACKEND_DUONG.json. Không import lên canvas WF07 cũ.
7. Mở Gui Gmail canh bao WF07: chọn Gmail credential hiện có và điền email nhận thử của Dương. Không có credential hoặc địa chỉ email cá nhân trong gói này.
8. Địa chỉ backend đặt tại node Telemetry dau vao: http://host.docker.internal:3001/api. Đây là máy Windows chạy NestJS, n8n chạy Docker Desktop. Khoa đổi một chỗ này khi môi trường khác.
9. Chạy toàn workflow bằng Manual Trigger; không pin dữ liệu từ lần chạy trước trong lúc kiểm tra. Du lieu mau là nơi thay temperature/humidity.

## Kiểm thử tuần tự

Đặt humidity=50. Trạng thái PostgreSQL mới chưa có dữ liệu. Chạy lần lượt:

| temperature | Kết quả | Gmail | environment_buzzer_release |
|---|---|---|---|
| 27 | INITIALIZED, NORMAL | Không | false |
| 38 | ALERT, CRITICAL | Một email | false |
| 38 | NO_CHANGE | Không | false |
| 32 | ALERT, WARNING | Một email | true |
| 27 | RECOVERED, NORMAL | Không | false |
| 38 | ALERT, CRITICAL | Một email | false |
| 27 | RECOVERED, NORMAL | Không | true |

NO_CHANGE kết thúc tại WF07 Khong co thay doi; các nhánh thay đổi kết thúc tại Dau ra WF07. Normal không gửi email trong thiết kế này. Gmail lỗi thì không PUT trạng thái; thử lại có thể gửi lại nếu email đã gửi nhưng phản hồi/lưu trạng thái bị lỗi. Không cam kết gửi email đúng một lần trong mọi tình huống mất mạng.

Mở URL state/A101 sau mỗi lần chạy để thấy bản ghi. Trạng thái cũ ở n8n Data Table không được tự chuyển sang; lần cảnh báo đầu tiên trên backend có thể gửi email mới.

## API mới để Khoa/Vinh review

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET | /api/environment/config/:room | Đọc sáu ngưỡng |
| PUT | /api/environment/config/:room | Lưu đủ sáu ngưỡng |
| GET | /api/environment/state/:room | Đọc trạng thái trước, hoặc {found:false} |
| PUT | /api/environment/state/:room | Upsert trạng thái sau xử lý |

Ví dụ PUT config/A101 (JSON số, không phải chuỗi):

```json
{"temperature_warning":30,"temperature_critical":35,"humidity_low_warning":30,"humidity_low_critical":20,"humidity_high_warning":75,"humidity_high_critical":85}
```

Ví dụ PUT state/A101:

```json
{"severity":"NORMAL","alert_type":"NONE","last_notified_at":null}
```

Tên room_id trong hai bảng mới chứa mã phòng A101, FK rooms.code; không nhầm với UUID room_id của telemetry. Đây là lựa chọn giữ tương thích WF07 cũ và được ghi rõ để review.

Kiểm tra config cấm ngưỡng sai thứ tự và độ ẩm ngoài 0..100; state cấm INVALID, sai severity/alert_type, ngày giờ lỗi. SQL truyền dữ liệu bằng tham số $1..$7.

## Luồng xử lý và câu trả lời khi được hỏi

1. Nhận telemetry từ WF01 hoặc mẫu: room, device_id, temperature, humidity, occupancy, light_raw, light_percent, timestamp.
2. Bổ sung room_id để tương thích logic cũ; đọc ngưỡng từ backend.
3. Nhiệt độ hoặc độ ẩm vượt ngưỡng -> WARNING/CRITICAL; lấy mức nặng hơn nếu cả hai bất thường. Telemetry không hợp lệ -> INVALID và không sửa trạng thái.
4. Đọc trạng thái lần trước qua backend. Mức hoặc loại đổi mới tạo thông báo; lặp giữ nguyên -> NO_CHANGE.
5. WARNING/CRITICAL tạo yêu cầu, gửi Gmail rồi lưu trạng thái. NORMAL tạo phục hồi rồi lưu trạng thái.
6. Trả đầu ra cho workflow cha. environment_buzzer_release=true nghĩa là nguyên nhân môi trường không còn yêu cầu còi; không phải lệnh OFF vô điều kiện vì WF09 có thể vẫn cần còi.

## Tích hợp Khoa/Hiệp

- Khoa import workflow, chọn credential và gọi bằng Execute Sub-workflow (mỗi lần một bản tin, chờ hoàn tất). Truyền dữ liệu đã chuẩn hóa từ WF01, không thay bằng response DB chứa UUID roomId/deviceId.
- Khi có incident_request, workflow cha chuyển đến WF10. Hiệp map room_id -> room; type -> incident_type, đồng thời bổ sung device_id từ đầu ra WF07 để gọi API incidents hiện có.
- WF10 chịu trách nhiệm lưu ID sự cố, chống tạo trùng và đóng đúng sự cố khi nhận incident_resolution_request. Không vừa cho WF07 POST incident vừa cho WF10 POST cùng sự kiện.
- device_request chuyển cho điều phối/dispatcher; chỉ một đầu mối quyết định bật/tắt còi giữa WF07 và WF09.
- Dashboard đang mở đọc incidents từ backend; WF07 chỉ trả yêu cầu nên dashboard chưa có sự cố nếu WF10 chưa nối.
- Đây là phần bổ sung backend cần Khoa/Vinh review trên duong-frontend trước khi merge.

## File thay đổi để commit sau khi kiểm tra trên máy

- backend/src/app.module.ts (hai dòng thêm thủ công)
- backend/src/modules/environment/environment.module.ts
- db/migrations/002_environment.sql
- n8n-workflows/07_ENV_ALERT_BACKEND_DUONG.json
- docs/DUONG_WF07_BACKEND.md
- docs/WF07_VALIDATION.md

Không đưa .env hoặc credential lên Git. Không push main.

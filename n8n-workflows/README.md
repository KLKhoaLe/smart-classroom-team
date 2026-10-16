# n8n workflow exports

Export JSON theo quy ước:

- 01_SENSOR_DATA_INGESTION.json
- 02_AI_DECISION_ENGINE.json
- 03_MASTER_AUTOMATION.json
- 04_DEVICE_COMMAND_DISPATCHER.json
- 05_DEVICE_FEEDBACK.json
- 06_DEVICE_HEALTH.json
- 07_ENVIRONMENT_ALERT.json
- 08_OCCUPANCY_ENERGY.json
- 09_AFTER_HOURS_SECURITY.json
- 10_INCIDENT_MANAGEMENT.json
- 11_DAILY_REPORT.json
- 12_WEEKLY_AI_OPTIMIZATION.json

Không commit credential, API key, OAuth secret hoặc password vào repo.

## Import WF10-WF12

Import các file `10_INCIDENT_MANAGEMENT.json`, `11_DAILY_REPORT.json`, và `12_WEEKLY_AI_OPTIMIZATION.json` từ menu **Workflows → Import from File**. Các workflow được export ở trạng thái inactive; kiểm tra cấu hình, sau đó Activate/Publish các workflow cần chạy tự động.

- WF10 nhận báo cáo tại `POST /webhook/incident-management`. Backend URL trong workflow dùng `http://host.docker.internal:3001`, phù hợp khi n8n chạy trong Docker trên máy host Windows. Đặt `N8N_INCIDENT_MANAGEMENT_WEBHOOK_URL=http://localhost:5678/webhook/incident-management` trong backend để form và nút trạng thái chuyển tiếp qua WF10; nếu chưa đặt biến này, NestJS lưu trực tiếp làm fallback. Action mặc định là `CREATE`; gửi `{"action":"RESOLVE","incident_id":"..."}` để resolve hoặc `{"action":"UPDATE_STATUS","incident_id":"...","status":"OPEN"}` để cập nhật trạng thái.
- WF11 chạy hằng ngày lúc 23:55 và có Manual Trigger để kiểm tra. Workflow lấy aggregate từ `GET /api/reports/daily?room=A101` rồi lưu report type `DAILY`.
- WF12 chạy thứ Hai lúc 08:00 và có Manual Trigger. Chọn OpenAI credential cho node **Generate Weekly Recommendation** trước khi chạy; khi node AI lỗi, workflow vẫn lưu system recommendation làm fallback.
- Đặt timezone của instance n8n thành `Asia/Ho_Chi_Minh` trước khi Activate/Publish hai workflow theo lịch. Schedule Trigger chỉ chạy khi workflow được publish. Sau khi cấu hình AI credential, chạy Manual Trigger một lần và xác nhận kết quả được lưu qua `GET /api/reports/weekly?room=A101`.

Payload tạo sự cố tối thiểu cho WF10:
```json
{
	"room": "A101",
	"device_id": "ESP32_A101",
	"incident_type": "HIGH_TEMP",
	"severity": "HIGH",
	"message": "Nhiệt độ phòng vượt ngưỡng"
}
```

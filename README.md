# Smart Classroom Platform

Hệ thống **Smart Classroom / Smart Study Room** sử dụng IoT, n8n và AI Automation để giám sát môi trường lớp học, phát hiện bất thường và điều khiển thiết bị tự động.

Project được xây dựng theo kiến trúc Full-stack:

- IoT Simulation: Wokwi ESP32
- MQTT: HiveMQ
- Automation: n8n
- Backend: NestJS
- Database: PostgreSQL
- Frontend: Next.js
- Container: Docker

---

## 1. Mục tiêu hệ thống

Hệ thống mô phỏng một phòng học thông minh có khả năng:

- Thu thập dữ liệu cảm biến từ ESP32.
- Theo dõi nhiệt độ.
- Theo dõi độ ẩm.
- Phát hiện có người trong phòng.
- Theo dõi độ sáng.
- Kiểm tra dữ liệu cảm biến.
- Lưu dữ liệu vào PostgreSQL.
- Phát hiện dữ liệu bất thường.
- Điều khiển quạt / đèn tự động.
- Theo dõi trạng thái thiết bị.
- Quản lý sự cố.
- Hiển thị dữ liệu trên Dashboard.
- Hỗ trợ các workflow AI Automation bằng n8n.

---

## 2. Kiến trúc hệ thống

```text
                ┌──────────────────┐
                │   Wokwi ESP32    │
                │ Sensors / Device │
                └────────┬─────────┘
                         │
                        MQTT
                         │
                         ▼
                ┌──────────────────┐
                │   HiveMQ Broker  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │       n8n        │
                │ Automation / AI  │
                └────────┬─────────┘
                         │
                     HTTP REST
                         │
                         ▼
                ┌──────────────────┐
                │  NestJS Backend  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    PostgreSQL    │
                └──────────────────┘

                         ▲
                         │
                    REST API
                         │
                ┌────────┴─────────┐
                │ Next.js Frontend │
                │    Dashboard     │
                └──────────────────┘
```

---

## 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| IoT | ESP32 |
| IoT Simulation | Wokwi |
| Sensor | DHT22, PIR, Photoresistor |
| MQTT Broker | HiveMQ |
| Automation | n8n |
| Backend | NestJS |
| ORM | TypeORM |
| Database | PostgreSQL |
| Frontend | Next.js |
| Container | Docker / Docker Compose |
| Database GUI | DBeaver |
| Version Control | Git / GitHub |

---

## 4. Cấu trúc project

```text
smart-classroom-team/
│
├── backend/
│   ├── src/
│   │   ├── entities/
│   │   └── modules/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   ├── lib/
│   └── package.json
│
├── db/
│   └── init.sql
│
├── n8n-workflows/
│
├── docs/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 5. Yêu cầu môi trường

Cài đặt các công cụ sau:

- Node.js 22
- npm
- Docker Desktop
- Git
- n8n
- DBeaver (không bắt buộc)
- Wokwi account

Kiểm tra phiên bản:

```bash
node -v
npm -v
docker --version
docker compose version
git --version
```

---

## 6. Clone project

Clone repository:

```bash
git clone https://github.com/KLKhoaLe/smart-classroom-team.git
```

Di chuyển vào project:

```bash
cd smart-classroom-team
```

---

## 7. Khởi động PostgreSQL

Database được chạy bằng Docker.

Tại thư mục gốc của project:

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker compose ps
```

Container PostgreSQL:

```text
smart-classroom-postgres
```

Thông tin database local:

```text
Host: localhost
Port: 5432
Database: smart_classroom
Username: smartuser
Password: smartpass
```

> Thông tin trên chỉ sử dụng cho môi trường phát triển local. Khi deploy production cần thay đổi mật khẩu.

Kiểm tra các bảng:

```bash
docker exec -it smart-classroom-postgres psql -U smartuser -d smart_classroom -c "\dt"
```

Database hiện có các bảng chính:

```text
rooms
devices
telemetry
ingestion_errors
automation_decisions
device_commands
device_events
incidents
reports
```

---

## 8. Khởi động Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Tạo file môi trường từ file mẫu.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Cài đặt dependencies:

```bash
npm install
```

Chạy backend:

```bash
npm run start:dev
```

Backend chạy tại:

```text
http://localhost:3001
```

Kiểm tra backend:

```bash
curl http://localhost:3001/api/health
```

Nếu backend hoạt động bình thường sẽ trả về trạng thái OK.

---

## 9. Cấu hình Backend Environment

File cấu hình:

```text
backend/.env
```

Ví dụ:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_classroom
DB_USER=smartuser
DB_PASSWORD=smartpass

FRONTEND_ORIGIN=http://localhost:3000

N8N_DEVICE_COMMAND_WEBHOOK_URL=http://localhost:5678/webhook/device-command
```

Không được commit file `.env` lên GitHub.

Chỉ commit:

```text
.env.example
```

---

## 10. Khởi động Frontend

Mở terminal mới:

```bash
cd frontend
```

Cài đặt dependencies:

```bash
npm install
```

Chạy frontend:

```bash
npm run dev
```

Frontend dự kiến chạy tại:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:3001
```

---

## 11. Cấu hình MQTT

MQTT Broker:

```text
broker.hivemq.com
```

Port:

```text
1883
```

Telemetry Topic:

```text
smartclassroom/teamkhoa/A101/telemetry
```

Command Topic:

```text
smartclassroom/teamkhoa/A101/command
```

---

## 12. Dữ liệu ESP32

ESP32 gửi dữ liệu cảm biến dạng JSON:

```json
{
  "device_id": "ESP32_A101",
  "room": "A101",
  "temperature": 24.5,
  "humidity": 40,
  "occupancy": false,
  "light_raw": 297
}
```

Ý nghĩa các field:

| Field | Ý nghĩa |
|---|---|
| device_id | ID của thiết bị |
| room | Mã phòng |
| temperature | Nhiệt độ |
| humidity | Độ ẩm |
| occupancy | Có người trong phòng hay không |
| light_raw | Giá trị ADC của cảm biến ánh sáng |

---

## 13. Luồng dữ liệu n8n

n8n nhận dữ liệu từ MQTT và xử lý:

```text
MQTT
↓
Parse JSON
↓
Validate Data
↓
Normalize Data
↓
Automation Logic
↓
HTTP Request
↓
NestJS Backend
↓
PostgreSQL
```

Nếu n8n đang chạy bằng Docker nhưng NestJS chạy trực tiếp trên Windows thì không sử dụng:

```text
http://localhost:3001
```

Mà phải sử dụng:

```text
http://host.docker.internal:3001
```

Ví dụ:

```text
POST http://host.docker.internal:3001/api/telemetry
```

---

## 14. Workflow 01 - Sensor Data Ingestion

Workflow đầu tiên chịu trách nhiệm tiếp nhận, kiểm tra và lưu dữ liệu cảm biến.

Luồng dữ liệu hợp lệ:

```text
MQTT Trigger
↓
Parse Sensor JSON
↓
Validate Device ID
↓
Validate Temperature
↓
Validate Humidity
↓
Validate Occupancy
↓
Validate Light
↓
Add Timestamp
↓
Normalize Sensor Data
↓
Mark Valid Data
↓
Save Telemetry to Backend
```

Backend endpoint:

```text
POST /api/telemetry
```

Ví dụ dữ liệu gửi tới backend:

```json
{
  "device_id": "ESP32_A101",
  "room": "A101",
  "temperature": 30.5,
  "humidity": 60,
  "occupancy": true,
  "light_raw": 500,
  "light_percent": 88,
  "timestamp": "2026-10-14T09:08:10.000Z"
}
```

---

## 15. Nhánh dữ liệu INVALID

Nếu dữ liệu cảm biến không hợp lệ:

```text
Validation
↓ FALSE
Set Error Reason
↓
Add Error Timestamp
↓
Save Error to Backend
```

Backend endpoint:

```text
POST /api/ingestion-errors
```

Các lỗi hiện hỗ trợ:

```text
INVALID_DEVICE_ID
INVALID_TEMPERATURE
INVALID_HUMIDITY
INVALID_OCCUPANCY
INVALID_LIGHT
```

Ví dụ:

```json
{
  "device_id": "ESP32_A101",
  "room": "A101",
  "temperature": 999,
  "humidity": 60,
  "occupancy": true,
  "light_raw": 500,
  "error_reason": "INVALID_TEMPERATURE",
  "timestamp": "2026-10-14T09:08:10.000Z"
}
```

---

## 16. API Backend

Base URL local:

```text
http://localhost:3001
```

### Health

```text
GET /api/health
```

Dùng để kiểm tra backend có hoạt động hay không.

---

### Telemetry

```text
POST /api/telemetry
GET  /api/telemetry/latest
GET  /api/telemetry/recent
```

`POST /api/telemetry`

Dùng để lưu dữ liệu cảm biến hợp lệ vào PostgreSQL.

`GET /api/telemetry/latest`

Lấy dữ liệu cảm biến mới nhất.

`GET /api/telemetry/recent`

Lấy các bản ghi telemetry gần đây.

---

### Ingestion Error

```text
POST /api/ingestion-errors
GET  /api/ingestion-errors/recent
```

`POST /api/ingestion-errors`

Lưu dữ liệu cảm biến không hợp lệ.

`GET /api/ingestion-errors/recent`

Lấy danh sách lỗi ingestion gần đây.

---

### Devices

```text
POST /api/devices/heartbeat
```

Dùng để cập nhật heartbeat và trạng thái hoạt động của thiết bị.

---

### Automation Decisions

```text
POST /api/decisions
```

Dùng để lưu quyết định của hệ thống Automation hoặc AI.

---

### Device Commands

```text
POST  /api/commands
POST  /api/commands/manual
PATCH /api/commands/:id/ack
GET   /api/commands/recent
```

`POST /api/commands`

Tạo lệnh điều khiển thiết bị.

`POST /api/commands/manual`

Tạo lệnh điều khiển thủ công từ frontend.

`PATCH /api/commands/:id/ack`

Xác nhận thiết bị đã nhận hoặc thực hiện lệnh.

`GET /api/commands/recent`

Lấy danh sách các lệnh gần đây.

---

### Incidents

```text
POST  /api/incidents
GET   /api/incidents
PATCH /api/incidents/:id/resolve
```

`POST /api/incidents`

Tạo một sự cố mới.

`GET /api/incidents`

Lấy danh sách sự cố.

`PATCH /api/incidents/:id/resolve`

Đánh dấu sự cố đã được xử lý.

---

### Dashboard

```text
GET /api/dashboard/rooms/:roomCode
```

Ví dụ:

```text
GET /api/dashboard/rooms/A101
```

Dùng để lấy dữ liệu tổng hợp cho Dashboard của một phòng.

---

## 17. Xem Database bằng DBeaver

Tạo PostgreSQL Connection với:

```text
Host: localhost
Port: 5432
Database: smart_classroom
Username: smartuser
Password: smartpass
```

Sau khi kết nối:

```text
Schemas
→ public
→ Tables
```

Ví dụ xem dữ liệu telemetry:

```text
telemetry
→ Right Click
→ View Data
→ All Rows
```

---

## 18. Kiểm tra Database bằng Terminal

Kết nối PostgreSQL:

```bash
docker exec -it smart-classroom-postgres psql -U smartuser -d smart_classroom
```

Xem telemetry:

```sql
SELECT * FROM telemetry ORDER BY id DESC LIMIT 10;
```

Xem ingestion error:

```sql
SELECT * FROM ingestion_errors ORDER BY id DESC LIMIT 10;
```

Thoát PostgreSQL:

```text
\q
```

---

## 19. Thành viên nhóm

| Thành viên | Vai trò chính |
|---|---|
| Khoa | Leader - n8n Core, AI Automation, Integration |
| Quang Vinh | Backend, Database, IoT Device Integration |
| Dương | Frontend, Dashboard, Monitoring |
| Hiệp | Incident, Report, Testing |

---

## 20. Phân chia Workflow

### Khoa

- Sensor Data Ingestion
- AI Decision Engine
- Master Automation

### Quang Vinh

- Device Command Dispatcher
- Device Feedback
- Device Health / Offline Detection

### Dương

- Environment Alert
- Occupancy / Energy Saving
- After-hours Security

### Hiệp

- Incident Management
- Daily Report
- AI Weekly Optimization

---

## 21. Git Branch

Project sử dụng một repository chung theo mô hình Monorepo.

Các branch đề xuất:

```text
main
khoa-integration
vinh-backend
duong-frontend
hiep-reports
```

Ý nghĩa:

```text
main
→ phiên bản ổn định của toàn bộ hệ thống

khoa-integration
→ n8n core, AI, integration

vinh-backend
→ backend, database, device API

duong-frontend
→ frontend, dashboard

hiep-reports
→ incident, report, testing
```

Các thành viên phát triển trên branch riêng trước khi merge vào `main`.

---

## 22. Git Workflow

Trước khi làm việc:

```bash
git pull
```

Kiểm tra branch:

```bash
git branch
```

Chuyển branch:

```bash
git checkout ten-branch
```

Sau khi hoàn thành chức năng:

```bash
git status
git add .
git commit -m "feat: description"
git push
```

Một số loại commit:

```text
feat: thêm chức năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
refactor: chỉnh sửa cấu trúc code
test: thêm hoặc chỉnh sửa test
chore: cấu hình project
```

---

## 23. n8n Workflow trên GitHub

Sau khi hoàn thành workflow trên n8n, nên export workflow thành file JSON và lưu vào:

```text
n8n-workflows/
```

Ví dụ:

```text
n8n-workflows/
├── 00_POC_SMART_CLASSROOM.json
├── 01_SENSOR_DATA_INGESTION.json
├── 02_AI_DECISION_ENGINE.json
└── ...
```

Không đưa credential hoặc API secret của n8n vào GitHub.

---

## 24. Security

Không được đưa các thông tin sau lên GitHub:

```text
.env
API Key
OAuth Client Secret
Database production password
GitHub Token
n8n Credentials
```

Các file môi trường thật phải được ignore bằng `.gitignore`.

Ví dụ:

```gitignore
node_modules/
.env
.env.*
!.env.example
.next/
dist/
coverage/
*.log
.DS_Store
Thumbs.db
```

---

## 25. Trạng thái hiện tại

Đã hoàn thành:

- PostgreSQL chạy bằng Docker.
- Database schema.
- NestJS Backend.
- Kết nối NestJS với PostgreSQL.
- Wokwi ESP32 Simulation.
- MQTT ESP32 → n8n.
- MQTT n8n → ESP32.
- DHT22 temperature / humidity.
- PIR occupancy.
- Photoresistor light sensor.
- Workflow 01 Sensor Data Ingestion.
- Validation dữ liệu cảm biến.
- Error logging.
- n8n → NestJS.
- NestJS → PostgreSQL.
- Kiểm tra dữ liệu bằng DBeaver.

Đang phát triển:

- Automation Decision.
- Device Command.
- Device Monitoring.
- Incident Management.
- Dashboard.
- Report.
- AI Optimization.
- Frontend.

---

## 26. Luồng hệ thống mục tiêu

Luồng thu thập dữ liệu:

```text
Sensors
   ↓
ESP32
   ↓
MQTT
   ↓
n8n
   ↓
AI / Rule Decision
   ↓
NestJS
   ↓
PostgreSQL
   ↓
Next.js Dashboard
```

Luồng điều khiển thiết bị:

```text
Next.js Dashboard
   ↓
NestJS
   ↓
n8n
   ↓
MQTT
   ↓
ESP32
   ↓
Fan / Light
```

---

## 27. Chạy toàn bộ hệ thống local

Thứ tự khuyến nghị:

### Bước 1 - PostgreSQL

```bash
docker compose up -d
```

### Bước 2 - Backend

```bash
cd backend
npm install
npm run start:dev
```

### Bước 3 - n8n

Khởi động n8n local.

Nếu n8n chạy trong Docker, backend được truy cập bằng:

```text
http://host.docker.internal:3001
```

### Bước 4 - Wokwi

Start Simulation để ESP32 kết nối WiFi, MQTT và gửi dữ liệu cảm biến.

### Bước 5 - Frontend

```bash
cd frontend
npm install
npm run dev
```

### Bước 6 - Kiểm tra Database

Mở DBeaver:

```text
localhost:5432
```

Database:

```text
smart_classroom
```

---

## 28. Project

**Tên đề tài:** Smart Classroom / Smart Study Room

**Nhóm đề tài:** IoT & Smart Automation

**Mục tiêu:** xây dựng hệ thống mô phỏng lớp học thông minh có khả năng thu thập dữ liệu IoT, tự động hóa xử lý bằng n8n, lưu trữ dữ liệu bằng PostgreSQL, cung cấp Backend API bằng NestJS và Dashboard bằng Next.js.

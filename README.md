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

- Thu thập dữ liệu cảm biến từ ESP32
- Theo dõi nhiệt độ
- Theo dõi độ ẩm
- Phát hiện có người trong phòng
- Theo dõi độ sáng
- Kiểm tra dữ liệu cảm biến
- Lưu dữ liệu vào PostgreSQL
- Phát hiện dữ liệu bất thường
- Điều khiển quạt / đèn tự động
- Theo dõi trạng thái thiết bị
- Quản lý sự cố
- Hiển thị dữ liệu trên Dashboard
- Hỗ trợ các workflow AI Automation bằng n8n

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

3. Công nghệ sử dụng
Thành phần	Công nghệ
IoT	ESP32
IoT Simulation	Wokwi
Sensor	DHT22, PIR, Photoresistor
MQTT Broker	HiveMQ
Automation	n8n
Backend	NestJS
ORM	TypeORM
Database	PostgreSQL
Frontend	Next.js
Container	Docker / Docker Compose
Database GUI	DBeaver


4. Cấu trúc project
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

5. Yêu cầu môi trường
Cài đặt các công cụ sau:
- Node.js 22
- npm
- Docker Desktop
- Git
- n8n
- DBeaver (không bắt buộc)
- Wokwi account
Kiểm tra:
node -v
npm -v
docker --version
docker compose version
git --version

6. Clone project
git clone https://github.com/KLKhoaLe/smart-classroom-team.git

Sau đó:
cd smart-classroom-team

7. Khởi động PostgreSQL
Database được chạy bằng Docker.
Tại thư mục gốc project:
docker compose up -d

Kiểm tra:
docker compose ps

Container PostgreSQL:
smart-classroom-postgres

Thông tin database local:
Host: localhost
Port: 5432
Database: smart_classroom
Username: smartuser
Password: smartpass

Thông tin trên chỉ sử dụng cho môi trường phát triển local.

Kiểm tra các bảng
docker exec -it smart-classroom-postgres psql -U smartuser -d smart_classroom -c "\dt"

Database hiện có các bảng chính:
rooms
devices
telemetry
ingestion_errors
automation_decisions
device_commands
device_events
incidents
reports

8. Khởi động Backend
Di chuyển vào thư mục:
cd backend

Tạo file môi trường từ file mẫu.
PowerShell:
Copy-Item .env.example .env

Cài dependencies:
npm install

Chạy backend:
npm run start:dev

Backend chạy tại:
http://localhost:3001

Kiểm tra:
curl http://localhost:3001/api/health

9. Backend Environment
File:
backend/.env

Ví dụ:
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_classroom
DB_USER=smartuser
DB_PASSWORD=smartpass

FRONTEND_ORIGIN=http://localhost:3000

N8N_DEVICE_COMMAND_WEBHOOK_URL=http://localhost:5678/webhook/device-command

Không được commit .env lên GitHub.
Chỉ commit:
.env.example

10. Khởi động Frontend
Mở terminal mới:
cd frontend

Cài dependencies:
npm install

Chạy:
npm run dev

Frontend dự kiến chạy tại:
http://localhost:3000

Backend:
http://localhost:3001

11. MQTT
Broker sử dụng:
broker.hivemq.com

Port:
1883

Telemetry Topic:
smartclassroom/teamkhoa/A101/telemetry

Command Topic:
smartclassroom/teamkhoa/A101/command

12. Dữ liệu ESP32
ESP32 gửi dữ liệu dạng JSON:
{
  "device_id": "ESP32_A101",
  "room": "A101",
  "temperature": 24.5,
  "humidity": 40,
  "occupancy": false,
  "light_raw": 297
}

Trong đó:
Field	Ý nghĩa
device_id	ID thiết bị
room	Mã phòng
temperature	Nhiệt độ
humidity	Độ ẩm
occupancy	Có người trong phòng hay không
light_raw	Giá trị cảm biến ánh sáng ADC


13. n8n
n8n nhận dữ liệu từ MQTT và thực hiện:
MQTT
↓
Parse JSON
↓
Validate Data
↓
Normalize
↓
Automation Logic
↓
HTTP Request
↓
NestJS Backend

Nếu n8n đang chạy bằng Docker nhưng NestJS chạy trực tiếp trên Windows thì không sử dụng:
http://localhost:3001

Mà sử dụng:
http://host.docker.internal:3001

Ví dụ:
POST http://host.docker.internal:3001/api/telemetry

14. Workflow 01 - Sensor Data Ingestion
Workflow đầu tiên chịu trách nhiệm tiếp nhận và kiểm tra dữ liệu cảm biến.
Luồng VALID:
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

Backend endpoint:
POST /api/telemetry

Nhánh INVALID
Nếu dữ liệu không hợp lệ:
Validation
↓ FALSE
Set Error Reason
↓
Add Error Timestamp
↓
Save Error to Backend

Endpoint:
POST /api/ingestion-errors

Các lỗi hiện hỗ trợ:
INVALID_DEVICE_ID
INVALID_TEMPERATURE
INVALID_HUMIDITY
INVALID_OCCUPANCY
INVALID_LIGHT

15. API hiện có
Base URL:
http://localhost:3001

Health
GET /api/health

Telemetry
POST /api/telemetry
GET  /api/telemetry/latest
GET  /api/telemetry/recent

Ingestion Error
POST /api/ingestion-errors
GET  /api/ingestion-errors/recent

Device
POST /api/devices/heartbeat

Automation Decision
POST /api/decisions

Device Commands
POST  /api/commands
POST  /api/commands/manual
PATCH /api/commands/:id/ack
GET   /api/commands/recent

Incident
POST  /api/incidents
GET   /api/incidents
PATCH /api/incidents/:id/resolve

Dashboard
GET /api/dashboard/rooms/:roomCode

Ví dụ:
GET /api/dashboard/rooms/A101

16. Xem Database bằng DBeaver
Tạo PostgreSQL connection với:
Host: localhost
Port: 5432
Database: smart_classroom
Username: smartuser
Password: smartpass

Sau đó:
Schemas
→ public
→ Tables

Ví dụ xem telemetry:
telemetry
→ Right Click
→ View Data
→ All Rows

17. Thành viên nhóm
Thành viên	Vai trò chính
Khoa	Leader - n8n Core, AI Automation, Integration
Quang Vinh	Backend, Database, IoT Device Integration
Dương	Frontend, Dashboard, Monitoring
Hiệp	Incident, Report, Testing


18. Git Branch
Project sử dụng một repository chung theo mô hình Monorepo.
Các branch đề xuất:
main
khoa-integration
vinh-backend
duong-frontend
hiep-reports

main là phiên bản ổn định của hệ thống.
Các thành viên phát triển trên branch riêng trước khi merge vào main.
19. Git Workflow
Trước khi làm việc:
git pull

Sau khi hoàn thành chức năng:
git add .
git commit -m "feat: description"
git push

Một số loại commit:
feat: thêm chức năng mới
fix: sửa lỗi
docs: sửa tài liệu
refactor: chỉnh sửa cấu trúc code
test: thêm test
chore: cấu hình project

20. Security
Không được đưa các thông tin sau lên GitHub:
.env
API Key
OAuth Client Secret
Database production password
GitHub Token
n8n Credentials

Các file môi trường thật phải được ignore bằng .gitignore.
21. Trạng thái hiện tại
Đã hoàn thành:
- PostgreSQL Docker
- Database schema
- NestJS Backend
- Kết nối NestJS → PostgreSQL
- Wokwi ESP32 Simulation
- MQTT ESP32 → n8n
- MQTT n8n → ESP32
- DHT22 temperature/humidity
- PIR occupancy
- Photoresistor light sensor
- Workflow 01 Sensor Data Ingestion
- Validation sensor data
- Error logging
- n8n → NestJS
- NestJS → PostgreSQL
Đang phát triển:
- Automation Decision
- Device Command
- Device Monitoring
- Incident Management
- Dashboard
- Report
- AI Optimization
- Frontend
22. Luồng hệ thống mục tiêu
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

Đồng thời hệ thống có thể điều khiển ngược lại:
Dashboard
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

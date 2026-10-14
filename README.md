# Smart Classroom Platform — Starter Monorepo

Starter code cho đồ án **AI Smart Office / Smart Classroom**.

## Kiến trúc

```text
Wokwi ESP32 -> MQTT -> n8n -> NestJS API -> PostgreSQL
                           |             ^
                           v             |
                        MQTT command     |
                           |             |
                           v             |
                       Wokwi device   Next.js Dashboard
```

**Nguyên tắc:** PostgreSQL chỉ được backend NestJS truy cập trực tiếp. n8n và frontend làm việc với DB thông qua REST API của NestJS.

## Port mặc định

- Frontend Next.js: `http://localhost:3000`
- Backend NestJS: `http://localhost:3001/api`
- n8n: `http://localhost:5678`
- PostgreSQL: `localhost:5432`

## 0. Yêu cầu

Khuyên dùng Node.js 22 LTS, npm và Docker Desktop.

## 1. Chạy PostgreSQL

Từ thư mục gốc:

```bash
docker compose up -d
```

Kiểm tra:

```bash
docker compose ps
```

Database được tạo sẵn:

- DB: `smart_classroom`
- user: `smartuser`
- password: `smartpass`

> Chỉ dùng thông tin trên cho local dev. Không dùng mật khẩu này khi deploy thật.

## 2. Chạy backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Kiểm tra:

```bash
curl http://localhost:3001/api/health
```

Kết quả mong đợi:

```json
{"status":"ok"}
```

## 3. Chạy frontend

Mở terminal khác:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Mở `http://localhost:3000`.

## 4. Thay Google Sheets trong n8n

### Nhánh VALID của `01_SENSOR_DATA_INGESTION`

Thay node `Save Valid Telemetry` bằng **HTTP Request**:

- Method: `POST`
- URL: `http://localhost:3001/api/telemetry`
- Send Body: JSON

```json
{
  "device_id": "={{ $json.device_id }}",
  "room": "={{ $json.room }}",
  "temperature": "={{ $json.temperature }}",
  "humidity": "={{ $json.humidity }}",
  "occupancy": "={{ $json.occupancy }}",
  "light_raw": "={{ $json.light_raw }}",
  "light_percent": "={{ $json.light_percent }}",
  "timestamp": "={{ $json.timestamp }}"
}
```

### Nhánh INVALID

Thay `Save Error Log` bằng HTTP Request:

- Method: `POST`
- URL: `http://localhost:3001/api/ingestion-errors`

```json
{
  "device_id": "={{ $json.device_id }}",
  "room": "={{ $json.room }}",
  "temperature": "={{ $json.temperature }}",
  "humidity": "={{ $json.humidity }}",
  "occupancy": "={{ $json.occupancy }}",
  "light_raw": "={{ $json.light_raw }}",
  "error_reason": "={{ $json.error_reason }}",
  "timestamp": "={{ $json.timestamp }}"
}
```

## 5. Webhook điều khiển tay

Backend có endpoint để frontend yêu cầu bật/tắt thiết bị. Backend sẽ gọi n8n webhook được cấu hình trong `.env`:

```env
N8N_DEVICE_COMMAND_WEBHOOK_URL=http://localhost:5678/webhook/device-command
```

Trong n8n tạo workflow có Webhook node:

- Method: `POST`
- Path: `device-command`

Sau Webhook dùng MQTT node publish tới:

```text
smartclassroom/teamkhoa/A101/command
```

Payload có thể dùng:

```json
{
  "fan": "={{ $json.body.command_type === 'FAN' ? $json.body.action : undefined }}",
  "light": "={{ $json.body.command_type === 'LIGHT' ? $json.body.action : undefined }}",
  "command_id": "={{ $json.body.command_id }}"
}
```

## 6. API chính

- `GET /api/health`
- `POST /api/telemetry`
- `GET /api/telemetry/latest?room=A101`
- `GET /api/telemetry/recent?room=A101&limit=20`
- `POST /api/ingestion-errors`
- `GET /api/ingestion-errors/recent?limit=20`
- `POST /api/devices/heartbeat`
- `POST /api/decisions`
- `POST /api/commands`
- `POST /api/commands/manual`
- `PATCH /api/commands/:id/ack`
- `GET /api/commands/recent?limit=20`
- `POST /api/incidents`
- `GET /api/incidents?status=OPEN`
- `PATCH /api/incidents/:id/resolve`
- `GET /api/dashboard/rooms/:roomCode`

## 7. Về Next.js + Vite

Starter này dùng **Next.js** đúng chuẩn. Next.js hiện dùng bundler riêng (Turbopack mặc định), không dùng Vite như một phần tiêu chuẩn. Nếu giảng viên thực sự yêu cầu **React + Vite** thay vì Next.js, có thể thay thư mục frontend sau mà không đổi backend/n8n/DB.

# Kế hoạch nhóm sau khi chuyển sang self-hosted backend

## Khoa — Lead / n8n Core / Integration
- WF01 Sensor Data Ingestion: MQTT -> validate -> POST NestJS /api/telemetry hoặc /api/ingestion-errors.
- WF02 AI Decision Engine: đọc telemetry gần nhất qua API -> rule/safety -> AI -> POST /api/decisions.
- WF03 Master Automation: điều phối quyết định -> tạo command qua API -> MQTT publish -> incident/log.
- Trách nhiệm code: quản lý monorepo, env contract, API contract, merge/integration, không cần ôm toàn bộ backend/frontend.

## Quang Vinh — Backend Lead + IoT/Device Control
- WF04 Device Command Dispatcher.
- WF05 Device Feedback / command ACK.
- WF06 Heartbeat / offline detection.
- Trách nhiệm code: NestJS modules, PostgreSQL, database migration/schema, API cho telemetry/device/commands.

## Dương — Frontend + Monitoring
- WF07 Environment Alert.
- WF08 Occupancy & Energy Saving.
- WF09 After-hours Security.
- Trách nhiệm code: Next.js dashboard, sensor cards, device controls, trạng thái room/device.

## Hiệp — Incident / Report + Frontend phụ
- WF10 Incident Management.
- WF11 Daily Report.
- WF12 Weekly AI Optimization.
- Trách nhiệm code: trang incidents/reports, test API, dữ liệu mẫu, tài liệu demo.

## Quy tắc tích hợp
- PostgreSQL là nguồn dữ liệu chính.
- Chỉ NestJS truy cập DB trực tiếp trong kiến trúc chính thức.
- n8n gọi NestJS bằng HTTP Request; NestJS có thể gọi n8n Webhook khi cần automation từ frontend.
- Frontend chỉ gọi NestJS, không gọi PostgreSQL/n8n trực tiếp (trừ demo đặc biệt đã thống nhất).

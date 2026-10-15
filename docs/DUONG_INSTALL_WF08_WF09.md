# Cài phần còn lại của Dương

Gói này bổ sung WF08, WF09 và nâng cấp dashboard. Cần cài xong gói WF07 backend trước. Không import lại WF07, không thay credential/email đã chạy được.

## 1. Sao lưu frontend, kiểm tra nhánh

Mở PowerShell:

```powershell
cd C:\Users\LENOVO\smart-classroom-team
git branch --show-current
New-Item -ItemType Directory -Force "$HOME\duong-backup-before-wf08"
Copy-Item .\frontend\app\page.tsx "$HOME\duong-backup-before-wf08\page.tsx"
Copy-Item .\frontend\app\globals.css "$HOME\duong-backup-before-wf08\globals.css"
Copy-Item .\frontend\lib\api.ts "$HOME\duong-backup-before-wf08\api.ts"
```

Nhánh cần là duong-frontend. Gói chỉ chứa file cần thêm/thay, không phải repository đầy đủ.
Giải nén ZIP, copy backend, db, frontend, n8n-workflows, docs vào thư mục project. Chấp nhận thay ba file frontend đã sao lưu. Không thay .env hoặc app.module.ts.

## 2. Đăng ký module

Mở backend/src/app.module.ts. Thêm import đầu file:

```ts
import { MonitoringModule } from './modules/monitoring/monitoring.module';
```

Thêm vào mảng imports của @Module, giữ nguyên EnvironmentModule đã có:

```ts
    DashboardModule,
    EnvironmentModule,
    MonitoringModule,
```

Đây là API bổ sung để Vinh/Khoa review, không thay hợp đồng API telemetry/commands/incidents đang dùng.

## 3. Tạo bảng

Tại thư mục gốc project:

```powershell
docker cp .\db\migrations\003_duong_monitoring.sql smart-classroom-postgres:/tmp/003_duong_monitoring.sql
docker exec smart-classroom-postgres psql -U smartuser -d smart_classroom -v ON_ERROR_STOP=1 -f /tmp/003_duong_monitoring.sql
```

Cần có COMMIT cuối kết quả. Script thêm monitoring_config, energy_state, security_state; chạy lại không mất dữ liệu hoặc đè Config đã chỉnh. Không xóa volume. Không chỉ sửa init.sql vì database cũ không chạy lại script khởi tạo.

## 4. Chạy backend/frontend

Terminal backend: Ctrl+C, rồi chạy lần lượt:

```powershell
cd C:\Users\LENOVO\smart-classroom-team\backend
npm run build
npm run start:dev
```

Nếu build lỗi, xử lý lỗi trước khi start. Giữ terminal này mở. Trình duyệt mở http://localhost:3001/api/monitoring/config/A101 phải trả về config.

Terminal frontend: Ctrl+C rồi:

```powershell
cd C:\Users\LENOVO\smart-classroom-team\frontend
npm run build
npm run dev
```

Nếu npm run build gặp vấn đề riêng với Turbopack, có thể dùng npm run build -- --webpack (gói này đã kiểm tra build webpack). Mở http://localhost:3000. Nếu Next báo chọn cổng 3002 vì 3000 bận, dừng cửa sổ frontend cũ đang chiếm 3000 rồi chạy lại để khớp FRONTEND_ORIGIN của backend.

## 5. Import hai workflow

Trong n8n tạo workflow trống -> menu ... -> Import from File, chọn lần lượt:

- n8n-workflows/08_ENERGY_SAVING_DUONG.json
- n8n-workflows/09_AFTER_HOURS_SECURITY_DUONG.json

Mỗi file vào một workflow riêng. Cả hai đã có Manual Trigger và When Executed by Another Workflow. Không cần Gmail credential cho hai workflow này. WF09 trả yêu cầu sự cố/còi cho workflow cha; không gửi Gmail trực tiếp.

Backend base URL ở node Telemetry dau vao trong từng workflow: http://host.docker.internal:3001/api. Khi Khoa dùng môi trường khác, đổi một chỗ này.

## 6. Kiểm thử

Làm theo DUONG_TEST_AND_HANDOFF.md. Mỗi lần đổi mẫu phải Execute workflow toàn luồng. Khi INVALID thì kết thúc tại Du lieu loi; khi hợp lệ kết thúc tại Dau ra.

WF08 cần light_percent số 0..100, giá trị cao nghĩa là sáng hơn. Không tự coi light_raw là lux hoặc phần trăm. Nếu Khoa chỉ truyền light_raw, WF01 cần chuẩn hóa thêm light_percent trước khi gọi WF08.

## 7. Hoàn tất và push nhánh của Dương

Trước khi push, mở từng workflow, gỡ pin dữ liệu và đưa mẫu về trạng thái sạch:
- WF07: temperature=27, humidity=50.
- WF08: occupancy=true, temperature=27, light_percent=80, test_empty_seconds=0.
- WF09: occupancy=false, test_hour=23. Chạy một lần để đóng trạng thái an ninh thử.

File JSON trong gói là bản sạch không chứa credential. Không thay bằng export có email hoặc dữ liệu test nhạy cảm nếu chưa kiểm tra.

Kiểm tra:

```powershell
cd C:\Users\LENOVO\smart-classroom-team
git status --short
git diff --stat
```

Stage đúng phần của Dương (gồm gói WF07 trước):

```powershell
git add backend/src/app.module.ts backend/src/modules/environment backend/src/modules/monitoring db/migrations/002_environment.sql db/migrations/003_duong_monitoring.sql frontend/app/page.tsx frontend/app/globals.css frontend/lib/api.ts n8n-workflows/07_ENV_ALERT_BACKEND_DUONG.json n8n-workflows/08_ENERGY_SAVING_DUONG.json n8n-workflows/09_AFTER_HOURS_SECURITY_DUONG.json docs/DUONG_WF07_BACKEND.md docs/WF07_VALIDATION.md docs/DUONG_INSTALL_WF08_WF09.md docs/DUONG_TEST_AND_HANDOFF.md docs/DUONG_MONITORING_VALIDATION.md
git diff --cached --stat
git commit -m "feat: add Duong monitoring workflows and classroom dashboard"
git push -u origin duong-frontend
```

Nếu git báo chưa có user.name/email, cấu hình thông tin Git của chính Dương. Không dùng thông tin của người khác. Nếu package-lock hoặc tsconfig thay đổi do npm/Next, xem diff riêng trước khi quyết định commit; không dùng git add . để gom cả file ngoài phạm vi.

Trên GitHub tạo Pull Request: base main, compare duong-frontend. Khoa review/merge. Không tự merge và không push lên main. Gửi Khoa tài liệu bàn giao, báo rõ module API/schema bổ sung để Khoa và Vinh xem trước khi tích hợp.

# API contract tối thiểu

Base URL: `http://localhost:3001/api`

## Telemetry
POST `/telemetry`
```json
{
  "device_id":"ESP32_A101",
  "room":"A101",
  "temperature":30.2,
  "humidity":65,
  "occupancy":true,
  "light_raw":399,
  "light_percent":90,
  "timestamp":"2026-10-14T14:00:00+07:00"
}
```

## Ingestion error
POST `/ingestion-errors` với cùng sensor fields và `error_reason`.

## Manual command
POST `/commands/manual`
```json
{ "device_id":"ESP32_A101", "command_type":"FAN", "action":"ON" }
```
Backend gọi n8n webhook `device-command`.

## Incident
POST `/incidents`
```json
{ "room":"A101", "device_id":"ESP32_A101", "incident_type":"HIGH_TEMP", "severity":"HIGH", "message":"Temperature exceeded threshold" }
```

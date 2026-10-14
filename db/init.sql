CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  room_type VARCHAR(50) NOT NULL DEFAULT 'CLASSROOM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code VARCHAR(100) NOT NULL UNIQUE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL DEFAULT 'CONTROLLER',
  status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
  last_seen TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  temperature NUMERIC(6,2) NOT NULL,
  humidity NUMERIC(6,2) NOT NULL,
  occupancy BOOLEAN NOT NULL,
  light_raw INTEGER NOT NULL,
  light_percent NUMERIC(6,2),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_timestamp TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_telemetry_room_time ON telemetry(room_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON telemetry(device_id, received_at DESC);

CREATE TABLE IF NOT EXISTS ingestion_errors (
  id BIGSERIAL PRIMARY KEY,
  device_code VARCHAR(100),
  room_code VARCHAR(50),
  temperature NUMERIC(8,2),
  humidity NUMERIC(8,2),
  occupancy BOOLEAN,
  light_raw INTEGER,
  error_reason VARCHAR(100) NOT NULL,
  source_timestamp TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ingestion_errors_created ON ingestion_errors(created_at DESC);

CREATE TABLE IF NOT EXISTS automation_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  source_telemetry_id BIGINT REFERENCES telemetry(id) ON DELETE SET NULL,
  decision_source VARCHAR(20) NOT NULL DEFAULT 'RULE',
  fan_action VARCHAR(10) NOT NULL DEFAULT 'KEEP',
  light_action VARCHAR(10) NOT NULL DEFAULT 'KEEP',
  mode VARCHAR(50),
  reason TEXT,
  model_name VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES automation_decisions(id) ON DELETE SET NULL,
  command_type VARCHAR(30) NOT NULL,
  action VARCHAR(20) NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'AUTO',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_commands_device_time ON device_commands(device_id, requested_at DESC);

CREATE TABLE IF NOT EXISTS device_events (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_device_events_device_time ON device_events(device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  telemetry_id BIGINT REFERENCES telemetry(id) ON DELETE SET NULL,
  incident_type VARCHAR(60) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'WARNING',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  message TEXT NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_incidents_status_time ON incidents(status, opened_at DESC);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  report_type VARCHAR(30) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO rooms(code, name, room_type)
VALUES ('A101', 'Smart Classroom A101', 'CLASSROOM')
ON CONFLICT (code) DO NOTHING;

INSERT INTO devices(device_code, room_id, device_type, status)
SELECT 'ESP32_A101', id, 'CONTROLLER', 'OFFLINE'
FROM rooms WHERE code='A101'
ON CONFLICT (device_code) DO NOTHING;

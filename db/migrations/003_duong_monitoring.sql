BEGIN;
CREATE TABLE IF NOT EXISTS monitoring_config (
 room_id VARCHAR(50) PRIMARY KEY REFERENCES rooms(code) ON DELETE CASCADE,
 empty_delay_seconds INTEGER NOT NULL CHECK(empty_delay_seconds BETWEEN 0 AND 3600),
 fan_on_temperature DOUBLE PRECISION NOT NULL CHECK(fan_on_temperature BETWEEN -40 AND 80),
 fan_off_temperature DOUBLE PRECISION NOT NULL CHECK(fan_off_temperature BETWEEN -40 AND 80),
 light_on_below_percent DOUBLE PRECISION NOT NULL CHECK(light_on_below_percent BETWEEN 0 AND 100),
 light_off_above_percent DOUBLE PRECISION NOT NULL CHECK(light_off_above_percent BETWEEN 0 AND 100),
 allowed_start_minute INTEGER NOT NULL CHECK(allowed_start_minute BETWEEN 0 AND 1439),
 allowed_end_minute INTEGER NOT NULL CHECK(allowed_end_minute BETWEEN 0 AND 1439),
 timezone VARCHAR(64) NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(fan_off_temperature<fan_on_temperature),
 CHECK(light_on_below_percent<light_off_above_percent),
 CHECK(allowed_start_minute<>allowed_end_minute)
);
CREATE TABLE IF NOT EXISTS energy_state (
 room_id VARCHAR(50) PRIMARY KEY REFERENCES rooms(code) ON DELETE CASCADE,
 occupancy BOOLEAN NOT NULL,
 empty_since TIMESTAMPTZ,
 fan_target VARCHAR(10) NOT NULL CHECK(fan_target IN ('ON','OFF','KEEP')),
 light_target VARCHAR(10) NOT NULL CHECK(light_target IN ('ON','OFF','KEEP')),
 mode VARCHAR(20) NOT NULL CHECK(mode IN ('OCCUPIED','WAITING','EMPTY')),
 observed_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK((occupancy AND mode='OCCUPIED' AND empty_since IS NULL) OR
       (NOT occupancy AND mode IN ('WAITING','EMPTY') AND empty_since IS NOT NULL)),
 CHECK(empty_since IS NULL OR empty_since<=observed_at)
);
CREATE TABLE IF NOT EXISTS security_state (
 room_id VARCHAR(50) PRIMARY KEY REFERENCES rooms(code) ON DELETE CASCADE,
 active BOOLEAN NOT NULL,
 last_alert_at TIMESTAMPTZ,
 observed_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(NOT active OR last_alert_at IS NOT NULL)
);
-- Defaults proposed for demonstration. Confirm room policy with the team.
INSERT INTO monitoring_config (room_id,empty_delay_seconds,fan_on_temperature,fan_off_temperature,
 light_on_below_percent,light_off_above_percent,allowed_start_minute,allowed_end_minute,timezone)
SELECT code,120,30,28,40,60,420,1320,'Asia/Ho_Chi_Minh' FROM rooms WHERE code='A101'
ON CONFLICT(room_id) DO NOTHING;
COMMIT;

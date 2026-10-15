BEGIN;
CREATE TABLE IF NOT EXISTS environment_config (
  room_id VARCHAR(50) PRIMARY KEY REFERENCES rooms(code) ON DELETE CASCADE,
  temperature_warning DOUBLE PRECISION NOT NULL CHECK (temperature_warning BETWEEN -40 AND 80),
  temperature_critical DOUBLE PRECISION NOT NULL CHECK (temperature_critical BETWEEN -40 AND 80),
  humidity_low_warning DOUBLE PRECISION NOT NULL CHECK (humidity_low_warning BETWEEN 0 AND 100),
  humidity_low_critical DOUBLE PRECISION NOT NULL CHECK (humidity_low_critical BETWEEN 0 AND 100),
  humidity_high_warning DOUBLE PRECISION NOT NULL CHECK (humidity_high_warning BETWEEN 0 AND 100),
  humidity_high_critical DOUBLE PRECISION NOT NULL CHECK (humidity_high_critical BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (temperature_warning < temperature_critical),
  CHECK (humidity_low_critical < humidity_low_warning AND
         humidity_low_warning < humidity_high_warning AND
         humidity_high_warning < humidity_high_critical)
);
CREATE TABLE IF NOT EXISTS environment_alert_state (
  room_id VARCHAR(50) PRIMARY KEY REFERENCES rooms(code) ON DELETE CASCADE,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('NORMAL','WARNING','CRITICAL')),
  alert_type VARCHAR(40) NOT NULL CHECK (alert_type IN ('NONE','TEMPERATURE','HUMIDITY','TEMPERATURE_AND_HUMIDITY')),
  last_notified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((severity = 'NORMAL') = (alert_type = 'NONE'))
);
INSERT INTO environment_config
  (room_id,temperature_warning,temperature_critical,humidity_low_warning,
   humidity_low_critical,humidity_high_warning,humidity_high_critical)
SELECT code,30,35,30,20,75,85 FROM rooms WHERE code='A101'
ON CONFLICT (room_id) DO NOTHING;
COMMIT;

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AutomationDecision } from '../entities/automation-decision.entity';
import { DeviceCommand } from '../entities/device-command.entity';
import { DeviceEvent } from '../entities/device-event.entity';
import { Device } from '../entities/device.entity';
import { Incident } from '../entities/incident.entity';
import { IngestionError } from '../entities/ingestion-error.entity';
import { Report } from '../entities/report.entity';
import { Room } from '../entities/room.entity';
import { Telemetry } from '../entities/telemetry.entity';
import { InitialSchema1710000000000 } from './migrations/1710000000000-InitialSchema';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'smartuser',
  password: process.env.DB_PASSWORD ?? 'smartpass',
  database: process.env.DB_NAME ?? 'smart_classroom',
  entities: [
    Room,
    Device,
    Telemetry,
    IngestionError,
    AutomationDecision,
    DeviceCommand,
    DeviceEvent,
    Incident,
    Report,
  ],
  migrations: [InitialSchema1710000000000],
});

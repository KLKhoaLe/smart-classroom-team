import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { IngestionErrorsModule } from './modules/ingestion-errors/ingestion-errors.module';
import { DevicesModule } from './modules/devices/devices.module';
import { DecisionsModule } from './modules/decisions/decisions.module';
import { CommandsModule } from './modules/commands/commands.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { Room } from './entities/room.entity';
import { Device } from './entities/device.entity';
import { Telemetry } from './entities/telemetry.entity';
import { IngestionError } from './entities/ingestion-error.entity';
import { AutomationDecision } from './entities/automation-decision.entity';
import { DeviceCommand } from './entities/device-command.entity';
import { DeviceEvent } from './entities/device-event.entity';
import { Incident } from './entities/incident.entity';
import { Report } from './entities/report.entity';
import { EnvironmentModule } from './modules/environment/environment.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'smartuser',
      password: process.env.DB_PASSWORD ?? 'smartpass',
      database: process.env.DB_NAME ?? 'smart_classroom',
      entities: [Room, Device, Telemetry, IngestionError, AutomationDecision, DeviceCommand, DeviceEvent, Incident, Report],
      synchronize: false,
    }),
    HealthModule,
    TelemetryModule,
    IngestionErrorsModule,
    DevicesModule,
    DecisionsModule,
    CommandsModule,
    IncidentsModule,
    DashboardModule,
    EnvironmentModule,
    MonitoringModule,
  ],
})
export class AppModule {}

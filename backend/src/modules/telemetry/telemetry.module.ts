import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Telemetry } from '../../entities/telemetry.entity';
import { Device } from '../../entities/device.entity';
import { Room } from '../../entities/room.entity';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
@Module({ imports: [TypeOrmModule.forFeature([Telemetry, Device, Room])], controllers: [TelemetryController], providers: [TelemetryService], exports: [TelemetryService] })
export class TelemetryModule {}

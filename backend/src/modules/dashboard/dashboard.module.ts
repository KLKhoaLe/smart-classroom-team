import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../../entities/room.entity';
import { Telemetry } from '../../entities/telemetry.entity';
import { Device } from '../../entities/device.entity';
import { Incident } from '../../entities/incident.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
@Module({ imports:[TypeOrmModule.forFeature([Room,Telemetry,Device,Incident])], controllers:[DashboardController], providers:[DashboardService] })
export class DashboardModule {}

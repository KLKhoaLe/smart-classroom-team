import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../../entities/device.entity';
import { Incident } from '../../entities/incident.entity';
import { Report } from '../../entities/report.entity';
import { Room } from '../../entities/room.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Incident, Report, Room])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
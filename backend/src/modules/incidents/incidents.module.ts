import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from '../../entities/incident.entity';
import { Room } from '../../entities/room.entity';
import { Device } from '../../entities/device.entity';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
@Module({ imports:[TypeOrmModule.forFeature([Incident,Room,Device])], controllers:[IncidentsController], providers:[IncidentsService] })
export class IncidentsModule {}

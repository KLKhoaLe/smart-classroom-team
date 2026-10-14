import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../../entities/incident.entity';
import { Room } from '../../entities/room.entity';
import { Device } from '../../entities/device.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
@Injectable()
export class IncidentsService {
  constructor(@InjectRepository(Incident) private repo: Repository<Incident>, @InjectRepository(Room) private rooms: Repository<Room>, @InjectRepository(Device) private devices: Repository<Device>) {}
  async create(dto: CreateIncidentDto) {
    const room = await this.rooms.findOne({ where: { code: dto.room } }); if (!room) throw new NotFoundException('Room not found');
    const device = dto.device_id ? await this.devices.findOne({ where: { deviceCode: dto.device_id } }) : null;
    return this.repo.save(this.repo.create({ roomId: room.id, deviceId: device?.id ?? null, telemetryId: dto.telemetry_id ?? null, incidentType: dto.incident_type, severity: dto.severity, message: dto.message, status: 'OPEN' }));
  }
  list(status?: string) { return this.repo.find({ where: status ? { status } : {}, order: { openedAt: 'DESC' }, take: 100 }); }
  async resolve(id: string) { const incident=await this.repo.findOne({ where:{id} }); if(!incident) throw new NotFoundException('Incident not found'); incident.status='RESOLVED'; incident.resolvedAt=new Date(); return this.repo.save(incident); }
}

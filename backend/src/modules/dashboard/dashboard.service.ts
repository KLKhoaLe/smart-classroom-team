import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/room.entity';
import { Telemetry } from '../../entities/telemetry.entity';
import { Device } from '../../entities/device.entity';
import { Incident } from '../../entities/incident.entity';
@Injectable()
export class DashboardService {
  constructor(@InjectRepository(Room) private rooms: Repository<Room>, @InjectRepository(Telemetry) private telemetry: Repository<Telemetry>, @InjectRepository(Device) private devices: Repository<Device>, @InjectRepository(Incident) private incidents: Repository<Incident>) {}
  async room(roomCode: string) {
    const room = await this.rooms.findOne({ where: { code: roomCode } }); if (!room) throw new NotFoundException('Room not found');
    const latest = await this.telemetry.findOne({ where: { roomId: room.id }, order: { receivedAt:'DESC' } });
    const devices = await this.devices.find({ where: { roomId: room.id } });
    const incidents = await this.incidents.find({ where: { roomId: room.id, status:'OPEN' }, order:{openedAt:'DESC'}, take:20 });
    return { room: { code: room.code, name: room.name }, latest, devices, openIncidents: incidents };
  }
}

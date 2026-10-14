import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telemetry } from '../../entities/telemetry.entity';
import { Device } from '../../entities/device.entity';
import { Room } from '../../entities/room.entity';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(Telemetry) private telemetryRepo: Repository<Telemetry>,
    @InjectRepository(Device) private deviceRepo: Repository<Device>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
  ) {}

  async create(dto: CreateTelemetryDto) {
    const device = await this.deviceRepo.findOne({ where: { deviceCode: dto.device_id } });
    const room = await this.roomRepo.findOne({ where: { code: dto.room } });
    if (!device) throw new NotFoundException(`Unknown device ${dto.device_id}`);
    if (!room) throw new NotFoundException(`Unknown room ${dto.room}`);

    device.status = 'ONLINE';
    device.lastSeen = new Date();
    await this.deviceRepo.save(device);

    const entity = this.telemetryRepo.create({
      deviceId: device.id,
      roomId: room.id,
      temperature: dto.temperature,
      humidity: dto.humidity,
      occupancy: dto.occupancy,
      lightRaw: dto.light_raw,
      lightPercent: dto.light_percent ?? null,
      sourceTimestamp: dto.timestamp ? new Date(dto.timestamp) : null,
      rawPayload: { ...dto } as Record<string, unknown>,
    });
    return this.telemetryRepo.save(entity);
  }

  async latest(roomCode = 'A101') {
    const room = await this.roomRepo.findOne({ where: { code: roomCode } });
    if (!room) throw new NotFoundException(`Unknown room ${roomCode}`);
    return this.telemetryRepo.findOne({ where: { roomId: room.id }, order: { receivedAt: 'DESC' } });
  }

  async recent(roomCode = 'A101', limit = 20) {
    const room = await this.roomRepo.findOne({ where: { code: roomCode } });
    if (!room) throw new NotFoundException(`Unknown room ${roomCode}`);
    return this.telemetryRepo.find({ where: { roomId: room.id }, order: { receivedAt: 'DESC' }, take: Math.min(limit, 200) });
  }
}

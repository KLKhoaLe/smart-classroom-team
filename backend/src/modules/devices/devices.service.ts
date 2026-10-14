import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../entities/device.entity';
import { DeviceEvent } from '../../entities/device-event.entity';
@Injectable()
export class DevicesService {
  constructor(@InjectRepository(Device) private devices: Repository<Device>, @InjectRepository(DeviceEvent) private events: Repository<DeviceEvent>) {}
  async heartbeat(deviceCode: string, payload: Record<string, unknown> = {}) {
    const device = await this.devices.findOne({ where: { deviceCode } });
    if (!device) throw new NotFoundException(`Unknown device ${deviceCode}`);
    device.status = 'ONLINE'; device.lastSeen = new Date(); await this.devices.save(device);
    await this.events.save(this.events.create({ deviceId: device.id, eventType: 'HEARTBEAT', payload }));
    return { ok: true, device_id: deviceCode, last_seen: device.lastSeen };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceCommand } from '../../entities/device-command.entity';
import { Device } from '../../entities/device.entity';
import { CreateCommandDto } from './dto/create-command.dto';
@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);
  constructor(@InjectRepository(DeviceCommand) private repo: Repository<DeviceCommand>, @InjectRepository(Device) private devices: Repository<Device>) {}
  async create(dto: CreateCommandDto, notifyN8n = false) {
    const device = await this.devices.findOne({ where: { deviceCode: dto.device_id } });
    if (!device) throw new NotFoundException(`Unknown device ${dto.device_id}`);
    const command = await this.repo.save(this.repo.create({ deviceId: device.id, decisionId: dto.decision_id ?? null, commandType: dto.command_type, action: dto.action, source: dto.source ?? (notifyN8n ? 'MANUAL' : 'AUTO'), status: 'PENDING', payload: dto.payload ?? {} }));
    if (notifyN8n) {
      const url = process.env.N8N_DEVICE_COMMAND_WEBHOOK_URL;
      if (url) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ command_id: command.id, device_id: dto.device_id, command_type: dto.command_type, action: dto.action, source: command.source }) });
          if (!res.ok) {
            command.status = 'FAILED';
            await this.repo.save(command);
            this.logger.error(`n8n rejected command ${command.id} with HTTP ${res.status}`);
          } else {
            command.status = 'SENT'; command.sentAt = new Date(); await this.repo.save(command);
          }
        } catch (error) {
          command.status = 'FAILED';
          await this.repo.save(command);
          this.logger.error(`Unable to notify n8n for command ${command.id}`, error instanceof Error ? error.stack : String(error));
        }
      }
    }
    return command;
  }
  async ack(id: string) { const cmd = await this.repo.findOne({ where: { id } }); if (!cmd) throw new NotFoundException('Command not found'); cmd.status='ACK'; cmd.acknowledgedAt=new Date(); return this.repo.save(cmd); }
  recent(limit=20) {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 200) : 20;
    return this.repo.find({ order: { requestedAt: 'DESC' }, take: safeLimit });
  }
}

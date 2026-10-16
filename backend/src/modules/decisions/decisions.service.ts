import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationDecision } from '../../entities/automation-decision.entity';
import { Room } from '../../entities/room.entity';
import { CreateDecisionDto } from './dto/create-decision.dto';
@Injectable()
export class DecisionsService {
  constructor(@InjectRepository(AutomationDecision) private repo: Repository<AutomationDecision>, @InjectRepository(Room) private rooms: Repository<Room>) {}
  async create(dto: CreateDecisionDto) {
    const room = await this.rooms.findOne({ where: { code: dto.room } });
    if (!room) throw new NotFoundException(`Unknown room ${dto.room}`);
    return this.repo.save(this.repo.create({ roomId: room.id, sourceTelemetryId: dto.telemetry_id ?? null, decisionSource: dto.decision_source, fanAction: dto.fan_action, lightAction: dto.light_action, mode: dto.mode ?? null, reason: dto.reason ?? null, modelName: dto.model_name ?? null }));
  }

  recent(limit = 20) {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 200) : 20;
    return this.repo.find({ order: { createdAt: 'DESC' }, take: safeLimit });
  }
}

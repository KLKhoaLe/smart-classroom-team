import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionError } from '../../entities/ingestion-error.entity';
import { CreateIngestionErrorDto } from './dto/create-ingestion-error.dto';
@Injectable()
export class IngestionErrorsService {
  constructor(@InjectRepository(IngestionError) private repo: Repository<IngestionError>) {}
  create(dto: CreateIngestionErrorDto) {
    return this.repo.save(this.repo.create({
      deviceCode: dto.device_id ?? null,
      roomCode: dto.room ?? null,
      temperature: dto.temperature ?? null,
      humidity: dto.humidity ?? null,
      occupancy: dto.occupancy ?? null,
      lightRaw: dto.light_raw ?? null,
      errorReason: dto.error_reason,
      sourceTimestamp: dto.timestamp ? new Date(dto.timestamp) : null,
      rawPayload: { ...dto } as Record<string, unknown>,
    }));
  }
  recent(limit = 20) { return this.repo.find({ order: { createdAt: 'DESC' }, take: Math.min(limit, 200) }); }
}

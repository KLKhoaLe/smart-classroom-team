import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionError } from '../../entities/ingestion-error.entity';
import { IngestionErrorsController } from './ingestion-errors.controller';
import { IngestionErrorsService } from './ingestion-errors.service';
@Module({ imports: [TypeOrmModule.forFeature([IngestionError])], controllers: [IngestionErrorsController], providers: [IngestionErrorsService] })
export class IngestionErrorsModule {}

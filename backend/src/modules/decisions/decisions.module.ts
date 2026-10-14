import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationDecision } from '../../entities/automation-decision.entity';
import { Room } from '../../entities/room.entity';
import { DecisionsController } from './decisions.controller';
import { DecisionsService } from './decisions.service';
@Module({ imports: [TypeOrmModule.forFeature([AutomationDecision, Room])], controllers: [DecisionsController], providers: [DecisionsService] })
export class DecisionsModule {}

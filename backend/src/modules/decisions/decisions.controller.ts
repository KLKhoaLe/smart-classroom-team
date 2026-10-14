import { Body, Controller, Post } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
@Controller('decisions')
export class DecisionsController { constructor(private readonly service: DecisionsService) {} @Post() create(@Body() dto: CreateDecisionDto) { return this.service.create(dto); } }

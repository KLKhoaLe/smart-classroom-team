import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
@Controller('decisions')
export class DecisionsController {
  constructor(private readonly service: DecisionsService) {}
  @Post() create(@Body() dto: CreateDecisionDto) { return this.service.create(dto); }
  @Get('recent') recent(@Query('limit') limit = '20') { return this.service.recent(Number(limit)); }
}

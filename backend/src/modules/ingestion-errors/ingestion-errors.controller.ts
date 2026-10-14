import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IngestionErrorsService } from './ingestion-errors.service';
import { CreateIngestionErrorDto } from './dto/create-ingestion-error.dto';
@Controller('ingestion-errors')
export class IngestionErrorsController {
  constructor(private readonly service: IngestionErrorsService) {}
  @Post() create(@Body() dto: CreateIngestionErrorDto) { return this.service.create(dto); }
  @Get('recent') recent(@Query('limit') limit='20') { return this.service.recent(Number(limit)); }
}

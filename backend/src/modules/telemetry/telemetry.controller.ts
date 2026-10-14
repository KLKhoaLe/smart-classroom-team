import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly service: TelemetryService) {}
  @Post() create(@Body() dto: CreateTelemetryDto) { return this.service.create(dto); }
  @Get('latest') latest(@Query('room') room = 'A101') { return this.service.latest(room); }
  @Get('recent') recent(@Query('room') room = 'A101', @Query('limit') limit = '20') { return this.service.recent(room, Number(limit)); }
}

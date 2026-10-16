import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('daily') daily(@Query('room') room?: string) { return this.service.daily(room ?? 'A101'); }
  @Get('weekly') weekly(@Query('room') room?: string) { return this.service.weekly(room ?? 'A101'); }
  @Post() create(@Body() dto: CreateReportDto) { return this.service.create(dto); }
}
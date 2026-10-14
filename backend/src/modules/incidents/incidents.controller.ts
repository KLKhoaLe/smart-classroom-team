import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}
  @Post() create(@Body() dto: CreateIncidentDto) { return this.service.create(dto); }
  @Get() list(@Query('status') status?: string) { return this.service.list(status); }
  @Patch(':id/resolve') resolve(@Param('id') id:string) { return this.service.resolve(id); }
}

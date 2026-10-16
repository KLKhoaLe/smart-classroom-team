import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentWorkflowDto } from './dto/incident-workflow.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}
  @Post('workflow') workflow(@Body() dto: IncidentWorkflowDto) { return this.service.handleWorkflow(dto); }
  @Post() create(@Body() dto: CreateIncidentDto) { return this.service.create(dto); }
  @Get() list(@Query('status') status?: string, @Query('room') room?: string) { return this.service.list(status, room); }
  @Patch(':id/status') updateStatus(@Param('id') id: string, @Body() dto: UpdateIncidentDto) { return this.service.updateStatus(id, dto); }
  @Patch(':id/resolve') resolve(@Param('id') id:string) { return this.service.resolve(id); }
}

import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CreateCommandDto } from './dto/create-command.dto';
@Controller('commands')
export class CommandsController {
  constructor(private readonly service: CommandsService) {}
  @Post() create(@Body() dto: CreateCommandDto) { return this.service.create(dto, false); }
  @Post('manual') manual(@Body() dto: CreateCommandDto) { return this.service.create({ ...dto, source: 'MANUAL' }, true); }
  @Patch(':id/ack') ack(@Param('id') id: string) { return this.service.ack(id); }
  @Get('recent') recent(@Query('limit') limit='20') { return this.service.recent(Number(limit)); }
}

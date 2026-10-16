import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
@Controller('devices')
export class DevicesController {
  constructor(private readonly service: DevicesService) {}
  @Get() list() { return this.service.list(); }
  @Get(':deviceCode') get(@Param('deviceCode') deviceCode: string) { return this.service.get(deviceCode); }
  @Post('heartbeat') heartbeat(@Body() dto: HeartbeatDto) { return this.service.heartbeat(dto.device_id, dto.payload ?? {}); }
}

import { Body, Controller, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
@Controller('devices')
export class DevicesController {
  constructor(private readonly service: DevicesService) {}
  @Post('heartbeat') heartbeat(@Body() dto: HeartbeatDto) { return this.service.heartbeat(dto.device_id, dto.payload ?? {}); }
}

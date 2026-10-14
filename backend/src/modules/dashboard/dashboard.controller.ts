import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
@Controller('dashboard')
export class DashboardController { constructor(private readonly service: DashboardService) {} @Get('rooms/:roomCode') room(@Param('roomCode') code:string){ return this.service.room(code); } }

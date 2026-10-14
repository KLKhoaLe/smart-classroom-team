import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', service: 'smart-classroom-backend', time: new Date().toISOString() };
  }
}

import { BadRequestException, Body, Controller, Get, Injectable, Module, NotFoundException, Param, Put } from '@nestjs/common';
import { IsIn, IsISO8601, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { DataSource } from 'typeorm';

export class EnvironmentConfigDto {
  @IsNumber() @Min(-40) @Max(80) temperature_warning: number;
  @IsNumber() @Min(-40) @Max(80) temperature_critical: number;
  @IsNumber() @Min(0) @Max(100) humidity_low_warning: number;
  @IsNumber() @Min(0) @Max(100) humidity_low_critical: number;
  @IsNumber() @Min(0) @Max(100) humidity_high_warning: number;
  @IsNumber() @Min(0) @Max(100) humidity_high_critical: number;
}

export class EnvironmentStateDto {
  @IsIn(['NORMAL', 'WARNING', 'CRITICAL']) severity: string;
  @IsIn(['NONE', 'TEMPERATURE', 'HUMIDITY', 'TEMPERATURE_AND_HUMIDITY']) alert_type: string;
  @IsOptional() @IsISO8601() last_notified_at?: string | null;
}

@Injectable()
export class EnvironmentService {
  constructor(private readonly db: DataSource) {}

  private async requireRoom(room: string) {
    const rows = await this.db.query('SELECT code FROM rooms WHERE code = $1', [room]);
    if (!rows.length) throw new NotFoundException(`Unknown room ${room}`);
  }

  async config(room: string) {
    await this.requireRoom(room);
    const rows = await this.db.query('SELECT * FROM environment_config WHERE room_id = $1', [room]);
    if (!rows.length) throw new NotFoundException(`Environment config missing for ${room}`);
    return rows[0];
  }

  async saveConfig(room: string, dto: EnvironmentConfigDto) {
    await this.requireRoom(room);
    if (!(dto.temperature_warning < dto.temperature_critical &&
      dto.humidity_low_critical < dto.humidity_low_warning &&
      dto.humidity_low_warning < dto.humidity_high_warning &&
      dto.humidity_high_warning < dto.humidity_high_critical)) {
      throw new BadRequestException('Invalid threshold order');
    }
    const rows = await this.db.query(`
      INSERT INTO environment_config
        (room_id, temperature_warning, temperature_critical, humidity_low_warning,
         humidity_low_critical, humidity_high_warning, humidity_high_critical)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (room_id) DO UPDATE SET
        temperature_warning=EXCLUDED.temperature_warning,
        temperature_critical=EXCLUDED.temperature_critical,
        humidity_low_warning=EXCLUDED.humidity_low_warning,
        humidity_low_critical=EXCLUDED.humidity_low_critical,
        humidity_high_warning=EXCLUDED.humidity_high_warning,
        humidity_high_critical=EXCLUDED.humidity_high_critical,
        updated_at=NOW()
      RETURNING *`, [room, dto.temperature_warning, dto.temperature_critical,
        dto.humidity_low_warning, dto.humidity_low_critical,
        dto.humidity_high_warning, dto.humidity_high_critical]);
    return rows[0];
  }

  async state(room: string) {
    await this.requireRoom(room);
    const rows = await this.db.query('SELECT * FROM environment_alert_state WHERE room_id = $1', [room]);
    // Return one object even on the first run so n8n continues downstream.
    return rows[0] ?? { found: false };
  }

  async saveState(room: string, dto: EnvironmentStateDto) {
    await this.requireRoom(room);
    if ((dto.severity === 'NORMAL') !== (dto.alert_type === 'NONE')) {
      throw new BadRequestException('NORMAL must use NONE; alerts must specify their type');
    }
    const rows = await this.db.query(`
      INSERT INTO environment_alert_state (room_id, severity, alert_type, last_notified_at)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (room_id) DO UPDATE SET
        severity=EXCLUDED.severity, alert_type=EXCLUDED.alert_type,
        last_notified_at=EXCLUDED.last_notified_at, updated_at=NOW()
      RETURNING *`, [room, dto.severity, dto.alert_type, dto.last_notified_at ?? null]);
    return rows[0];
  }
}

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly service: EnvironmentService) {}
  @Get('config/:room') config(@Param('room') room: string) { return this.service.config(room); }
  @Put('config/:room') saveConfig(@Param('room') room: string, @Body() dto: EnvironmentConfigDto) {
    return this.service.saveConfig(room, dto);
  }
  @Get('state/:room') state(@Param('room') room: string) { return this.service.state(room); }
  @Put('state/:room') saveState(@Param('room') room: string, @Body() dto: EnvironmentStateDto) {
    return this.service.saveState(room, dto);
  }
}

@Module({ controllers: [EnvironmentController], providers: [EnvironmentService] })
export class EnvironmentModule {}

import { BadRequestException, Body, Controller, Get, Injectable, Module, NotFoundException, Param, Put } from '@nestjs/common';
import { IsBoolean, IsIn, IsInt, IsISO8601, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DataSource } from 'typeorm';

export class MonitoringConfigDto {
  @IsInt() @Min(0) @Max(3600) empty_delay_seconds: number;
  @IsNumber() @Min(-40) @Max(80) fan_on_temperature: number;
  @IsNumber() @Min(-40) @Max(80) fan_off_temperature: number;
  @IsNumber() @Min(0) @Max(100) light_on_below_percent: number;
  @IsNumber() @Min(0) @Max(100) light_off_above_percent: number;
  @IsInt() @Min(0) @Max(1439) allowed_start_minute: number;
  @IsInt() @Min(0) @Max(1439) allowed_end_minute: number;
  @IsString() @MaxLength(64) timezone: string;
}
export class EnergyStateDto {
  @IsBoolean() occupancy: boolean;
  @IsOptional() @IsISO8601() empty_since: string | null;
  @IsIn(['ON','OFF','KEEP']) fan_target: string;
  @IsIn(['ON','OFF','KEEP']) light_target: string;
  @IsIn(['OCCUPIED','WAITING','EMPTY']) mode: string;
  @IsISO8601() observed_at: string;
}
export class SecurityStateDto {
  @IsBoolean() active: boolean;
  @IsOptional() @IsISO8601() last_alert_at: string | null;
  @IsISO8601() observed_at: string;
}
@Injectable()
export class MonitoringService {
  constructor(private readonly db: DataSource) {}
  private async requireRoom(room: string) {
    if (!(await this.db.query('SELECT code FROM rooms WHERE code=$1',[room])).length)
      throw new NotFoundException(`Unknown room ${room}`);
  }
  async config(room: string) {
    await this.requireRoom(room);
    const rows=await this.db.query('SELECT * FROM monitoring_config WHERE room_id=$1',[room]);
    if (!rows.length) throw new NotFoundException(`Monitoring config missing for ${room}`);
    return rows[0];
  }
  async saveConfig(room: string,d: MonitoringConfigDto) {
    await this.requireRoom(room);
    if (d.fan_off_temperature>=d.fan_on_temperature || d.light_on_below_percent>=d.light_off_above_percent || d.allowed_start_minute===d.allowed_end_minute)
      throw new BadRequestException('Invalid thresholds or equal opening/closing time');
    try { new Intl.DateTimeFormat('en-US',{timeZone:d.timezone}).format(); }
    catch { throw new BadRequestException('Invalid IANA timezone'); }
    return (await this.db.query(`INSERT INTO monitoring_config
      (room_id,empty_delay_seconds,fan_on_temperature,fan_off_temperature,light_on_below_percent,light_off_above_percent,allowed_start_minute,allowed_end_minute,timezone)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(room_id) DO UPDATE SET
      empty_delay_seconds=EXCLUDED.empty_delay_seconds,fan_on_temperature=EXCLUDED.fan_on_temperature,
      fan_off_temperature=EXCLUDED.fan_off_temperature,light_on_below_percent=EXCLUDED.light_on_below_percent,
      light_off_above_percent=EXCLUDED.light_off_above_percent,allowed_start_minute=EXCLUDED.allowed_start_minute,
      allowed_end_minute=EXCLUDED.allowed_end_minute,timezone=EXCLUDED.timezone,updated_at=NOW() RETURNING *`,
      [room,d.empty_delay_seconds,d.fan_on_temperature,d.fan_off_temperature,d.light_on_below_percent,d.light_off_above_percent,d.allowed_start_minute,d.allowed_end_minute,d.timezone]))[0];
  }
  async energy(room: string) {
    await this.requireRoom(room);
    return (await this.db.query('SELECT * FROM energy_state WHERE room_id=$1',[room]))[0]??{found:false};
  }
  async saveEnergy(room: string,d: EnergyStateDto) {
    await this.requireRoom(room);
    if ((d.occupancy && (d.mode!=='OCCUPIED'||d.empty_since!=null)) ||
        (!d.occupancy && (d.mode==='OCCUPIED'||!d.empty_since)) ||
        (d.empty_since && Date.parse(d.empty_since)>Date.parse(d.observed_at)))
      throw new BadRequestException('Invalid occupancy/mode/empty_since');
    return (await this.db.query(`INSERT INTO energy_state (room_id,occupancy,empty_since,fan_target,light_target,mode,observed_at)
      VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(room_id) DO UPDATE SET
      occupancy=EXCLUDED.occupancy,empty_since=EXCLUDED.empty_since,fan_target=EXCLUDED.fan_target,
      light_target=EXCLUDED.light_target,mode=EXCLUDED.mode,observed_at=EXCLUDED.observed_at,updated_at=NOW() RETURNING *`,
      [room,d.occupancy,d.empty_since??null,d.fan_target,d.light_target,d.mode,d.observed_at]))[0];
  }
  async security(room: string) {
    await this.requireRoom(room);
    return (await this.db.query('SELECT * FROM security_state WHERE room_id=$1',[room]))[0]??{found:false};
  }
  async saveSecurity(room: string,d: SecurityStateDto) {
    await this.requireRoom(room);
    if(d.active && !d.last_alert_at) throw new BadRequestException('Active security state requires last_alert_at');
    return (await this.db.query(`INSERT INTO security_state(room_id,active,last_alert_at,observed_at)
      VALUES($1,$2,$3,$4) ON CONFLICT(room_id) DO UPDATE SET active=EXCLUDED.active,
      last_alert_at=EXCLUDED.last_alert_at,observed_at=EXCLUDED.observed_at,updated_at=NOW() RETURNING *`,
      [room,d.active,d.last_alert_at??null,d.observed_at]))[0];
  }
  async summary(room: string) {
    const config=await this.config(room);
    const [energy,security]=await Promise.all([this.energy(room),this.security(room)]);
    return {config,energy,security};
  }
  async commands(room: string) {
    await this.requireRoom(room);
    return this.db.query(`SELECT c.id,c.command_type,c.action,c.status,c.source,c.requested_at,c.sent_at,c.acknowledged_at,
      d.device_code FROM device_commands c JOIN devices d ON d.id=c.device_id JOIN rooms r ON r.id=d.room_id
      WHERE r.code=$1 ORDER BY c.requested_at DESC LIMIT 12`,[room]);
  }
}
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly s: MonitoringService) {}
  @Get('config/:room') config(@Param('room') r:string){return this.s.config(r);}
  @Put('config/:room') saveConfig(@Param('room') r:string,@Body() d:MonitoringConfigDto){return this.s.saveConfig(r,d);}
  @Get('energy-state/:room') energy(@Param('room') r:string){return this.s.energy(r);}
  @Put('energy-state/:room') saveEnergy(@Param('room') r:string,@Body() d:EnergyStateDto){return this.s.saveEnergy(r,d);}
  @Get('security-state/:room') security(@Param('room') r:string){return this.s.security(r);}
  @Put('security-state/:room') saveSecurity(@Param('room') r:string,@Body() d:SecurityStateDto){return this.s.saveSecurity(r,d);}
  @Get('rooms/:room') summary(@Param('room') r:string){return this.s.summary(r);}
  @Get('commands/:room') commands(@Param('room') r:string){return this.s.commands(r);}
}
@Module({controllers:[MonitoringController],providers:[MonitoringService]})
export class MonitoringModule {}

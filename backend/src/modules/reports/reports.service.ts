import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Device } from '../../entities/device.entity';
import { Incident } from '../../entities/incident.entity';
import { Report } from '../../entities/report.entity';
import { Room } from '../../entities/room.entity';
import { Telemetry } from '../../entities/telemetry.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Device) private readonly devices: Repository<Device>,
    @InjectRepository(Incident) private readonly incidents: Repository<Incident>,
    @InjectRepository(Report) private readonly reports: Repository<Report>,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
    @InjectRepository(Telemetry) private readonly telemetry: Repository<Telemetry>,
  ) {}

  async daily(roomCode: string) {
    const room = await this.findRoom(roomCode);
    const periodEnd = new Date();
    const date = this.localDate(periodEnd);
    const periodStart = new Date(`${date}T00:00:00+07:00`);
    const query = this.incidents.createQueryBuilder('incident')
      .where('incident.roomId = :roomId', { roomId: room.id })
      .andWhere('incident.openedAt >= :periodStart', { periodStart })
      .andWhere('incident.openedAt <= :periodEnd', { periodEnd });
    const telemetryQuery = this.telemetry.createQueryBuilder('telemetry')
      .where('telemetry.roomId = :roomId', { roomId: room.id })
      .andWhere('telemetry.receivedAt >= :periodStart', { periodStart })
      .andWhere('telemetry.receivedAt <= :periodEnd', { periodEnd });
    const [totalIncidents, openIncidents, severityRows, devices, telemetryStats] = await Promise.all([
      query.clone().getCount(),
      query.clone().andWhere('incident.status = :status', { status: 'OPEN' }).getCount(),
      query.clone()
        .select('incident.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('incident.severity')
        .getRawMany<{ severity: string; count: string }>(),
      this.devices.find({ where: { roomId: room.id } }),
      telemetryQuery.clone()
        .select('COUNT(*)', 'sampleCount')
        .addSelect('AVG(telemetry.temperature)', 'averageTemperature')
        .addSelect('AVG(telemetry.humidity)', 'averageHumidity')
        .addSelect('AVG(telemetry.lightPercent)', 'averageLightPercent')
        .addSelect('COUNT(*) FILTER (WHERE telemetry.occupancy = true)', 'occupiedSamples')
        .getRawOne<{ sampleCount: string; averageTemperature: string | null; averageHumidity: string | null; averageLightPercent: string | null; occupiedSamples: string }>(),
    ]);
    const incidentsBySeverity = Object.fromEntries(severityRows.map(({ severity, count }) => [severity, Number(count)]));
    const devicesOnline = devices.filter((device) => device.status === 'ONLINE').length;
    return {
      room: room.code,
      date,
      totalIncidents,
      openIncidents,
      resolvedIncidents: totalIncidents - openIncidents,
      incidentsBySeverity,
      totalDevices: devices.length,
      devicesOnline,
      devicesWithIssues: devices.length - devicesOnline,
      telemetry: {
        sampleCount: Number(telemetryStats?.sampleCount ?? 0),
        averageTemperature: telemetryStats?.averageTemperature == null ? null : Number(telemetryStats.averageTemperature),
        averageHumidity: telemetryStats?.averageHumidity == null ? null : Number(telemetryStats.averageHumidity),
        averageLightPercent: telemetryStats?.averageLightPercent == null ? null : Number(telemetryStats.averageLightPercent),
        occupiedSamples: Number(telemetryStats?.occupiedSamples ?? 0),
      },
    };
  }

  async weekly(roomCode: string) {
    const room = await this.findRoom(roomCode);
    const periodEnd = new Date();
    const periodStart = new Date(`${this.localDate(periodEnd)}T00:00:00+07:00`);
    periodStart.setUTCDate(periodStart.getUTCDate() - 6);
    const [incidents, devices, storedReport] = await Promise.all([
      this.incidents.find({
        where: { roomId: room.id, openedAt: MoreThanOrEqual(periodStart) },
        order: { openedAt: 'DESC' },
      }),
      this.devices.find({ where: { roomId: room.id } }),
      this.reports.findOne({
        where: {
          roomId: room.id,
          reportType: In(['WEEKLY', 'WEEKLY_OPTIMIZATION']),
          periodStart: MoreThanOrEqual(periodStart),
        },
        order: { createdAt: 'DESC' },
      }),
    ]);
    const counts = new Map<string, number>();
    incidents.forEach(({ incidentType }) => counts.set(incidentType, (counts.get(incidentType) ?? 0) + 1));
    const incidentsByType = [...counts.entries()]
      .map(([incidentType, count]) => ({ incidentType, count }))
      .sort((a, b) => b.count - a.count);
    const devicesWithIssues = devices.filter((device) => device.status !== 'ONLINE').length;
    const topIncident = incidentsByType[0];
    const recommendation = storedReport?.recommendation ?? (
      topIncident
        ? `${topIncident.incidentType} xuất hiện ${topIncident.count} lần trong 7 ngày qua. Kiểm tra thiết bị liên quan và lên lịch bảo trì nếu sự cố lặp lại.`
        : devicesWithIssues
          ? `${devicesWithIssues}/${devices.length} thiết bị đang ngoại tuyến. Kiểm tra nguồn và kết nối mạng.`
          : 'Chưa ghi nhận sự cố đáng chú ý trong 7 ngày qua. Tiếp tục theo dõi hoạt động phòng học.'
    );

    return {
      room: room.code,
      periodStart,
      periodEnd,
      totalIncidents: incidents.length,
      incidentsByType,
      devicesWithIssues,
      recommendation,
      source: storedReport?.recommendation && storedReport.summary?.source !== 'SYSTEM_FALLBACK'
        ? 'AI_REPORT'
        : 'SYSTEM_SUMMARY',
    };
  }

  async create(dto: CreateReportDto) {
    const room = dto.room ? await this.findRoom(dto.room) : null;
    return this.reports.save(this.reports.create({
      roomId: room?.id ?? null,
      reportType: dto.report_type,
      periodStart: new Date(dto.period_start),
      periodEnd: new Date(dto.period_end),
      summary: dto.summary ?? {},
      recommendation: dto.recommendation ?? null,
    }));
  }

  private async findRoom(roomCode: string) {
    const room = await this.rooms.findOne({ where: { code: roomCode } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  private localDate(date: Date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Device } from '../../entities/device.entity';
import { Incident } from '../../entities/incident.entity';
import { Report } from '../../entities/report.entity';
import { Room } from '../../entities/room.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Device) private readonly devices: Repository<Device>,
    @InjectRepository(Incident) private readonly incidents: Repository<Incident>,
    @InjectRepository(Report) private readonly reports: Repository<Report>,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
  ) {}

  async daily(roomCode: string) {
    const room = await this.findRoom(roomCode);
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setHours(0, 0, 0, 0);
    const query = this.incidents.createQueryBuilder('incident')
      .where('incident.roomId = :roomId', { roomId: room.id })
      .andWhere('incident.openedAt >= :periodStart', { periodStart })
      .andWhere('incident.openedAt <= :periodEnd', { periodEnd });
    const [totalIncidents, openIncidents, severityRows, devices] = await Promise.all([
      query.clone().getCount(),
      query.clone().andWhere('incident.status = :status', { status: 'OPEN' }).getCount(),
      query.clone()
        .select('incident.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('incident.severity')
        .getRawMany<{ severity: string; count: string }>(),
      this.devices.find({ where: { roomId: room.id } }),
    ]);
    const incidentsBySeverity = Object.fromEntries(severityRows.map(({ severity, count }) => [severity, Number(count)]));
    const devicesOnline = devices.filter((device) => device.status === 'ONLINE').length;
    const date = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}-${String(periodStart.getDate()).padStart(2, '0')}`;

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
    };
  }

  async weekly(roomCode: string) {
    const room = await this.findRoom(roomCode);
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 6);
    periodStart.setHours(0, 0, 0, 0);
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
      source: storedReport?.recommendation ? 'AI_REPORT' : 'SYSTEM_SUMMARY',
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
}
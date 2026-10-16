import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../../entities/incident.entity';
import { Room } from '../../entities/room.entity';
import { Device } from '../../entities/device.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentWorkflowDto } from './dto/incident-workflow.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
@Injectable()
export class IncidentsService {
  constructor(@InjectRepository(Incident) private repo: Repository<Incident>, @InjectRepository(Room) private rooms: Repository<Room>, @InjectRepository(Device) private devices: Repository<Device>) {}
  async handleWorkflow(dto: IncidentWorkflowDto) {
    const action = dto.action ?? 'CREATE';
    const webhookUrl = process.env.N8N_INCIDENT_MANAGEMENT_WEBHOOK_URL;
    if (webhookUrl) {
      let response: Response;
      try {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...dto, action }),
        });
      } catch (error) {
        throw new BadGatewayException(error instanceof Error ? error.message : 'Could not reach the incident workflow');
      }
      const responseBody = await response.text();
      if (!response.ok) throw new BadGatewayException(responseBody || 'Incident workflow request failed');
      try { return JSON.parse(responseBody); }
      catch { return { ok: true, result: responseBody }; }
    }

    if (action === 'RESOLVE') {
      if (!dto.incident_id) throw new BadRequestException('incident_id is required');
      return this.resolve(dto.incident_id);
    }
    if (action === 'UPDATE_STATUS') {
      if (!dto.incident_id || !dto.status) throw new BadRequestException('incident_id and status are required');
      return this.updateStatus(dto.incident_id, dto);
    }
    if (!dto.room || !dto.incident_type || !dto.severity || !dto.message) {
      throw new BadRequestException('room, incident_type, severity, and message are required');
    }
    const room = await this.rooms.findOne({ where: { code: dto.room } });
    if (!room) throw new NotFoundException('Room not found');
    const openIncidents = await this.repo.find({
      where: { roomId: room.id, status: 'OPEN' },
      order: { openedAt: 'DESC' },
    });
    const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
    const duplicate = openIncidents.find((incident) =>
      normalize(incident.incidentType) === normalize(dto.incident_type!)
      && normalize(incident.message) === normalize(dto.message!),
    );
    if (duplicate) return this.updateStatus(duplicate.id, { severity: dto.severity, message: dto.message });
    return this.create(dto as CreateIncidentDto);
  }

  async create(dto: CreateIncidentDto) {
    const room = await this.rooms.findOne({ where: { code: dto.room } }); if (!room) throw new NotFoundException('Room not found');
    const device = dto.device_id ? await this.devices.findOne({ where: { deviceCode: dto.device_id } }) : null;
    return this.repo.save(this.repo.create({ roomId: room.id, deviceId: device?.id ?? null, telemetryId: dto.telemetry_id ?? null, incidentType: dto.incident_type, severity: dto.severity, message: dto.message, status: 'OPEN' }));
  }
  async list(status?: string, roomCode?: string) {
    const room = roomCode ? await this.rooms.findOne({ where: { code: roomCode } }) : null;
    if (roomCode && !room) return [];
    return this.repo.find({
      where: { ...(status ? { status } : {}), ...(room ? { roomId: room.id } : {}) },
      order: { openedAt: 'DESC' },
      take: 100,
    });
  }
  async updateStatus(id: string, dto: UpdateIncidentDto) {
    const incident = await this.repo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    if (dto.status) {
      incident.status = dto.status;
      incident.resolvedAt = dto.status === 'RESOLVED' ? new Date() : null;
    }
    if (dto.severity) incident.severity = dto.severity;
    if (dto.message) incident.message = dto.message;
    return this.repo.save(incident);
  }
  resolve(id: string) { return this.updateStatus(id, { status: 'RESOLVED' }); }
}

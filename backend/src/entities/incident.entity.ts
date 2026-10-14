import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'room_id', type: 'uuid' }) roomId: string;
  @Column({ name: 'device_id', type: 'uuid', nullable: true }) deviceId: string | null;
  @Column({ name: 'telemetry_id', type: 'bigint', nullable: true }) telemetryId: string | null;
  @Column({ name: 'incident_type' }) incidentType: string;
  @Column({ default: 'WARNING' }) severity: string;
  @Column({ default: 'OPEN' }) status: string;
  @Column({ type: 'text' }) message: string;
  @CreateDateColumn({ name: 'opened_at', type: 'timestamptz' }) openedAt: Date;
  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true }) resolvedAt: Date | null;
}

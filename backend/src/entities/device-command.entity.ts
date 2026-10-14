import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('device_commands')
export class DeviceCommand {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'device_id', type: 'uuid' }) deviceId: string;
  @ManyToOne(() => Device, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'device_id' }) device: Device;
  @Column({ name: 'decision_id', type: 'uuid', nullable: true }) decisionId: string | null;
  @Column({ name: 'command_type' }) commandType: string;
  @Column() action: string;
  @Column({ default: 'AUTO' }) source: string;
  @Column({ default: 'PENDING' }) status: string;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) payload: Record<string, unknown>;
  @CreateDateColumn({ name: 'requested_at', type: 'timestamptz' }) requestedAt: Date;
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true }) sentAt: Date | null;
  @Column({ name: 'acknowledged_at', type: 'timestamptz', nullable: true }) acknowledgedAt: Date | null;
}

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Device } from './device.entity';
import { Room } from './room.entity';

@Entity('telemetry')
export class Telemetry {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'device_id', type: 'uuid' }) deviceId: string;
  @ManyToOne(() => Device, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'device_id' }) device: Device;
  @Column({ name: 'room_id', type: 'uuid' }) roomId: string;
  @ManyToOne(() => Room, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'room_id' }) room: Room;
  @Column({ type: 'numeric', precision: 6, scale: 2 }) temperature: number;
  @Column({ type: 'numeric', precision: 6, scale: 2 }) humidity: number;
  @Column() occupancy: boolean;
  @Column({ name: 'light_raw' }) lightRaw: number;
  @Column({ name: 'light_percent', type: 'numeric', precision: 6, scale: 2, nullable: true }) lightPercent: number | null;
  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' }) receivedAt: Date;
  @Column({ name: 'source_timestamp', type: 'timestamptz', nullable: true }) sourceTimestamp: Date | null;
  @Column({ name: 'raw_payload', type: 'jsonb', default: () => "'{}'::jsonb" }) rawPayload: Record<string, unknown>;
}

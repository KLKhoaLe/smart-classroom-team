import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('device_events')
export class DeviceEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'device_id', type: 'uuid' }) deviceId: string;
  @Column({ name: 'event_type' }) eventType: string;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) payload: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

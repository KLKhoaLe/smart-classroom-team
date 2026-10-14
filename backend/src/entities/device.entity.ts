import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'device_code', unique: true }) deviceCode: string;
  @Column({ name: 'room_id', type: 'uuid' }) roomId: string;
  @ManyToOne(() => Room, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'room_id' }) room: Room;
  @Column({ name: 'device_type', default: 'CONTROLLER' }) deviceType: string;
  @Column({ default: 'OFFLINE' }) status: string;
  @Column({ name: 'last_seen', type: 'timestamptz', nullable: true }) lastSeen: Date | null;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) metadata: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

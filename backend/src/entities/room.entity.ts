import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) code: string;
  @Column() name: string;
  @Column({ name: 'room_type', default: 'CLASSROOM' }) roomType: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

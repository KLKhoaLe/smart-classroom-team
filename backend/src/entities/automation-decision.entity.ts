import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Room } from './room.entity';

@Entity('automation_decisions')
export class AutomationDecision {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'room_id',
    type: 'uuid',
  })
  roomId: string;

  @ManyToOne(
    () => Room,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'room_id',
  })
  room: Room;

  @Column({
    name: 'source_telemetry_id',
    type: 'bigint',
    nullable: true,
  })
  sourceTelemetryId: string | null;

  @Column({
    name: 'decision_source',
    type: 'varchar',
    default: 'RULE',
  })
  decisionSource: string;

  @Column({
    name: 'fan_action',
    type: 'varchar',
    default: 'KEEP',
  })
  fanAction: string;

  @Column({
    name: 'light_action',
    type: 'varchar',
    default: 'KEEP',
  })
  lightAction: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  mode: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  reason: string | null;

  @Column({
    name: 'model_name',
    type: 'varchar',
    nullable: true,
  })
  modelName: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
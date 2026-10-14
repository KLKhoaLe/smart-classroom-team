import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ingestion_errors')
export class IngestionError {

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({
    name: 'device_code',
    type: 'varchar',
    nullable: true,
  })
  deviceCode: string | null;

  @Column({
    name: 'room_code',
    type: 'varchar',
    nullable: true,
  })
  roomCode: string | null;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  temperature: number | null;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  humidity: number | null;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  occupancy: boolean | null;

  @Column({
    name: 'light_raw',
    type: 'integer',
    nullable: true,
  })
  lightRaw: number | null;

  @Column({
    name: 'error_reason',
    type: 'varchar',
  })
  errorReason: string;

  @Column({
    name: 'source_timestamp',
    type: 'timestamptz',
    nullable: true,
  })
  sourceTimestamp: Date | null;

  @Column({
    name: 'raw_payload',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  rawPayload: Record<string, unknown>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
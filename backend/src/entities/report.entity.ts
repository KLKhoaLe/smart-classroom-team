import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'room_id', type: 'uuid', nullable: true }) roomId: string | null;
  @Column({ name: 'report_type' }) reportType: string;
  @Column({ name: 'period_start', type: 'timestamptz' }) periodStart: Date;
  @Column({ name: 'period_end', type: 'timestamptz' }) periodEnd: Date;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) summary: Record<string, unknown>;
  @Column({ type: 'text', nullable: true }) recommendation: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

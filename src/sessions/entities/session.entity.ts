import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum SessionStatus {
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED',
  RESCHEDULED = 'RESCHEDULED',
}
@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ nullable: true }) clientId?: string;
  @Column() counsellorId!: string;
  @Column({ type: 'timestamp' }) scheduledStartTime!: Date;
  @Column({ type: 'timestamp' }) scheduledEndTime!: Date;
  @Column({ type: 'timestamp', nullable: true }) actualStartTime?: Date;
  @Column({ type: 'timestamp', nullable: true }) actualEndTime?: Date;
  @Column({ default: false }) requiresBuffer: boolean;
  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.BOOKED })
  status!: SessionStatus;
  @Column({ nullable: true }) sessionSummary?: string;
  @Column() sessionNumber!: number;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @Column({ nullable: true }) statusReason?: string;
  @Column({ nullable: true }) Severity?: number;
}

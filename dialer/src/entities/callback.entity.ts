import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CallbackStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('callbacks')
export class Callback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  allocationId: string;

  @Column()
  agentId: string;

  @Column({ type: 'timestamp' })
  callbackDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: CallbackStatus,
    default: CallbackStatus.SCHEDULED,
  })
  status: CallbackStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


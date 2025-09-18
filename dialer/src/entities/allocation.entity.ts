import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AllocationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

export enum AllocationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  campaignId: string;

  @Column()
  debtorName: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountDue: number;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  lastPaymentAmount: number;

  @Column({
    type: 'enum',
    enum: AllocationStatus,
    default: AllocationStatus.PENDING,
  })
  status: AllocationStatus;

  @Column({
    type: 'enum',
    enum: AllocationPriority,
    default: AllocationPriority.MEDIUM,
  })
  priority: AllocationPriority;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Allocation } from './allocation.entity';
import { User } from './user.entity';

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

  @ManyToOne(() => Allocation, allocation => allocation.callbacks)
  @JoinColumn({ name: 'allocationId' })
  allocation: Allocation;

  @Column()
  agentId: string;

  @ManyToOne(() => User, user => user.callbacks)
  @JoinColumn({ name: 'agentId' })
  agent: User;

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


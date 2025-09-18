import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Allocation } from './allocation.entity';
import { User } from './user.entity';
import { Campaign } from './campaign.entity';
import { Disposition } from './disposition.entity';

export enum CallType {
  PROGRESSIVE = 'progressive',
  PREDICTIVE = 'predictive',
}

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  ANSWERED = 'answered',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
}

@Entity('call_attempts')
export class CallAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  allocationId: string;

  @ManyToOne(() => Allocation, allocation => allocation.callAttempts)
  @JoinColumn({ name: 'allocationId' })
  allocation: Allocation;

  @Column({ nullable: true })
  agentId: string;

  @ManyToOne(() => User, user => user.callAttempts)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column()
  campaignId: string;

  @ManyToOne(() => Campaign, campaign => campaign.callAttempts)
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: CallType,
  })
  callType: CallType;

  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.INITIATED,
  })
  status: CallStatus;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  answerTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ nullable: true })
  asteriskCallId: string;

  @Column({ default: false })
  consentCaptured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Disposition, disposition => disposition.callAttempt)
  disposition: Disposition;
}


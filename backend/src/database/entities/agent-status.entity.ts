import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Campaign } from './campaign.entity';

export enum AgentStatusType {
  OFFLINE = 'offline',
  READY = 'ready',
  WRAP = 'wrap',
  BREAK = 'break',
  ON_CALL = 'on_call',
}

@Entity('agent_status')
export class AgentStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  agentId: string;

  @ManyToOne(() => User, user => user.agentStatuses)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({
    type: 'enum',
    enum: AgentStatusType,
    default: AgentStatusType.OFFLINE,
  })
  status: AgentStatusType;

  @Column({ nullable: true })
  campaignId: string;

  @ManyToOne(() => Campaign)
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


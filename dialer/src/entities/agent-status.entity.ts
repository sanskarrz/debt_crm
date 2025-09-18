import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({
    type: 'enum',
    enum: AgentStatusType,
    default: AgentStatusType.OFFLINE,
  })
  status: AgentStatusType;

  @Column({ nullable: true })
  campaignId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


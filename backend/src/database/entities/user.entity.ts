import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Campaign } from './campaign.entity';
import { CallAttempt } from './call-attempt.entity';
import { Disposition } from './disposition.entity';
import { Callback } from './callback.entity';
import { DncNumber } from './dnc-number.entity';
import { AgentStatus } from './agent-status.entity';

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  AGENT = 'agent',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Campaign, campaign => campaign.createdBy)
  campaigns: Campaign[];

  @OneToMany(() => CallAttempt, callAttempt => callAttempt.agent)
  callAttempts: CallAttempt[];

  @OneToMany(() => Disposition, disposition => disposition.callAttempt)
  dispositions: Disposition[];

  @OneToMany(() => Callback, callback => callback.agent)
  callbacks: Callback[];

  @OneToMany(() => DncNumber, dncNumber => dncNumber.addedBy)
  dncNumbers: DncNumber[];

  @OneToMany(() => AgentStatus, agentStatus => agentStatus.agent)
  agentStatuses: AgentStatus[];
}

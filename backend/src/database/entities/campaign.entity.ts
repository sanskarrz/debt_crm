import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Allocation } from './allocation.entity';
import { CallAttempt } from './call-attempt.entity';

export enum DialMode {
  PROGRESSIVE = 'progressive',
  PREDICTIVE = 'predictive',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DialMode,
  })
  dialMode: DialMode;

  @Column()
  callerId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80.00 })
  targetOccupancy: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.00 })
  abandonCap: number;

  @Column({ nullable: true })
  sipRoute: string;

  @Column({ nullable: true })
  gsmRoute: string;

  @Column({ default: false })
  isActive: boolean;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Allocation, allocation => allocation.campaign)
  allocations: Allocation[];

  @OneToMany(() => CallAttempt, callAttempt => callAttempt.campaign)
  callAttempts: CallAttempt[];
}


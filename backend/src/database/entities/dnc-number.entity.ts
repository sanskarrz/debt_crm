import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('dnc_numbers')
export class DncNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  reason: string;

  @Column()
  addedById: string;

  @ManyToOne(() => User, user => user.dncNumbers)
  @JoinColumn({ name: 'addedById' })
  addedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}


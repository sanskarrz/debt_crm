import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DispositionType {
  PTP = 'PTP',
  RTP = 'RTP',
  NTP = 'NTP',
  CB = 'CB',
  DNC = 'DNC',
  WRONG_NUMBER = 'WRONG_NUMBER',
  NO_ANSWER = 'NO_ANSWER',
  BUSY = 'BUSY',
  VOICEMAIL = 'VOICEMAIL',
  OTHER = 'OTHER',
}

@Entity('dispositions')
export class Disposition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  callAttemptId: string;

  @Column({
    type: 'enum',
    enum: DispositionType,
  })
  dispositionType: DispositionType;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ptpAmount: number;

  @Column({ type: 'date', nullable: true })
  ptpDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  callbackDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}


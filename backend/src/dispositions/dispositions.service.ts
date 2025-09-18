import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disposition, DispositionType } from '../database/entities/disposition.entity';
import { CallAttempt } from '../database/entities/call-attempt.entity';
import { CreateDispositionDto } from './dto/create-disposition.dto';
import { UpdateDispositionDto } from './dto/update-disposition.dto';

@Injectable()
export class DispositionsService {
  constructor(
    @InjectRepository(Disposition)
    private dispositionsRepository: Repository<Disposition>,
    @InjectRepository(CallAttempt)
    private callAttemptsRepository: Repository<CallAttempt>,
  ) {}

  async create(createDispositionDto: CreateDispositionDto): Promise<Disposition> {
    const disposition = this.dispositionsRepository.create(createDispositionDto);
    return this.dispositionsRepository.save(disposition);
  }

  async findAll(): Promise<Disposition[]> {
    return this.dispositionsRepository.find({
      relations: ['callAttempt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Disposition> {
    return this.dispositionsRepository.findOne({
      where: { id },
      relations: ['callAttempt'],
    });
  }

  async findByCallAttempt(callAttemptId: string): Promise<Disposition | null> {
    return this.dispositionsRepository.findOne({
      where: { callAttemptId },
      relations: ['callAttempt'],
    });
  }

  async update(id: string, updateDispositionDto: UpdateDispositionDto): Promise<Disposition> {
    await this.dispositionsRepository.update(id, updateDispositionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.dispositionsRepository.delete(id);
  }

  async getDispositionStats(campaignId?: string, agentId?: string) {
    const query = this.dispositionsRepository.createQueryBuilder('disposition')
      .leftJoin('disposition.callAttempt', 'callAttempt');

    if (campaignId) {
      query.andWhere('callAttempt.campaignId = :campaignId', { campaignId });
    }

    if (agentId) {
      query.andWhere('callAttempt.agentId = :agentId', { agentId });
    }

    const dispositions = await query.getMany();

    const stats = {
      total: dispositions.length,
      ptp: dispositions.filter(d => d.dispositionType === DispositionType.PTP).length,
      rtp: dispositions.filter(d => d.dispositionType === DispositionType.RTP).length,
      ntp: dispositions.filter(d => d.dispositionType === DispositionType.NTP).length,
      dnc: dispositions.filter(d => d.dispositionType === DispositionType.DNC).length,
      callback: dispositions.filter(d => d.dispositionType === DispositionType.CB).length,
      other: dispositions.filter(d => d.dispositionType === DispositionType.OTHER).length,
    };

    const totalPtpAmount = dispositions
      .filter(d => d.ptpAmount)
      .reduce((sum, d) => sum + Number(d.ptpAmount), 0);

    return {
      ...stats,
      totalPtpAmount,
      ptpRate: stats.total > 0 ? (stats.ptp / stats.total) * 100 : 0,
    };
  }
}


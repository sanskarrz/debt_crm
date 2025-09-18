import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallAttempt, CallStatus, CallType } from '../database/entities/call-attempt.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { User } from '../database/entities/user.entity';
import { Campaign } from '../database/entities/campaign.entity';
import { CreateCallAttemptDto } from './dto/create-call-attempt.dto';
import { UpdateCallAttemptDto } from './dto/update-call-attempt.dto';

@Injectable()
export class CallAttemptsService {
  constructor(
    @InjectRepository(CallAttempt)
    private callAttemptsRepository: Repository<CallAttempt>,
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async create(createCallAttemptDto: CreateCallAttemptDto): Promise<CallAttempt> {
    const callAttempt = this.callAttemptsRepository.create(createCallAttemptDto);
    return this.callAttemptsRepository.save(callAttempt);
  }

  async findAll(): Promise<CallAttempt[]> {
    return this.callAttemptsRepository.find({
      relations: ['allocation', 'agent', 'campaign'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CallAttempt> {
    return this.callAttemptsRepository.findOne({
      where: { id },
      relations: ['allocation', 'agent', 'campaign'],
    });
  }

  async update(id: string, updateCallAttemptDto: UpdateCallAttemptDto): Promise<CallAttempt> {
    await this.callAttemptsRepository.update(id, updateCallAttemptDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.callAttemptsRepository.delete(id);
  }

  async findByAgent(agentId: string): Promise<CallAttempt[]> {
    return this.callAttemptsRepository.find({
      where: { agentId },
      relations: ['allocation', 'campaign'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCampaign(campaignId: string): Promise<CallAttempt[]> {
    return this.callAttemptsRepository.find({
      where: { campaignId },
      relations: ['allocation', 'agent'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: CallStatus): Promise<CallAttempt> {
    const callAttempt = await this.findOne(id);
    if (!callAttempt) {
      throw new Error('Call attempt not found');
    }

    const updateData: any = { status };

    if (status === CallStatus.ANSWERED && !callAttempt.answerTime) {
      updateData.answerTime = new Date();
    }

    if (status === CallStatus.COMPLETED || status === CallStatus.FAILED || status === CallStatus.ABANDONED) {
      updateData.endTime = new Date();
      if (callAttempt.answerTime) {
        updateData.durationSeconds = Math.floor((new Date().getTime() - callAttempt.answerTime.getTime()) / 1000);
      }
    }

    await this.callAttemptsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async getCallStats(campaignId?: string, agentId?: string) {
    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (agentId) where.agentId = agentId;

    const calls = await this.callAttemptsRepository.find({ where });
    
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.status === CallStatus.ANSWERED).length;
    const completedCalls = calls.filter(c => c.status === CallStatus.COMPLETED).length;
    const abandonedCalls = calls.filter(c => c.status === CallStatus.ABANDONED).length;
    
    const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
    const abandonRate = totalCalls > 0 ? (abandonedCalls / totalCalls) * 100 : 0;
    
    const totalDuration = calls
      .filter(c => c.durationSeconds)
      .reduce((sum, c) => sum + c.durationSeconds, 0);
    
    const averageDuration = answeredCalls > 0 ? totalDuration / answeredCalls : 0;

    return {
      totalCalls,
      answeredCalls,
      completedCalls,
      abandonedCalls,
      answerRate,
      abandonRate,
      averageDuration,
    };
  }
}


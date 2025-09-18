import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CallAttempt, CallStatus } from '../database/entities/call-attempt.entity';
import { Disposition, DispositionType } from '../database/entities/disposition.entity';
import { Campaign } from '../database/entities/campaign.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { User, UserRole } from '../database/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(CallAttempt)
    private callAttemptsRepository: Repository<CallAttempt>,
    @InjectRepository(Disposition)
    private dispositionsRepository: Repository<Disposition>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getCampaignReport(campaignId: string, startDate?: Date, endDate?: Date) {
    const where: any = { campaignId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const calls = await this.callAttemptsRepository.find({
      where,
      relations: ['agent', 'allocation'],
    });

    const dispositions = await this.dispositionsRepository.find({
      where: {
        callAttempt: { campaignId },
        ...(startDate && endDate ? { createdAt: Between(startDate, endDate) } : {}),
      },
      relations: ['callAttempt'],
    });

    const stats = {
      totalCalls: calls.length,
      answeredCalls: calls.filter(c => c.status === CallStatus.ANSWERED).length,
      completedCalls: calls.filter(c => c.status === CallStatus.COMPLETED).length,
      abandonedCalls: calls.filter(c => c.status === CallStatus.ABANDONED).length,
      failedCalls: calls.filter(c => c.status === CallStatus.FAILED).length,
    };

    const answerRate = stats.totalCalls > 0 ? (stats.answeredCalls / stats.totalCalls) * 100 : 0;
    const abandonRate = stats.totalCalls > 0 ? (stats.abandonedCalls / stats.totalCalls) * 100 : 0;

    const dispositionStats = {
      total: dispositions.length,
      ptp: dispositions.filter(d => d.dispositionType === DispositionType.PTP).length,
      rtp: dispositions.filter(d => d.dispositionType === DispositionType.RTP).length,
      ntp: dispositions.filter(d => d.dispositionType === DispositionType.NTP).length,
      dnc: dispositions.filter(d => d.dispositionType === DispositionType.DNC).length,
      callback: dispositions.filter(d => d.dispositionType === DispositionType.CB).length,
    };

    const totalPtpAmount = dispositions
      .filter(d => d.ptpAmount)
      .reduce((sum, d) => sum + Number(d.ptpAmount), 0);

    return {
      campaign: await this.campaignsRepository.findOne({ where: { id: campaignId } }),
      period: { startDate, endDate },
      callStats: {
        ...stats,
        answerRate,
        abandonRate,
      },
      dispositionStats: {
        ...dispositionStats,
        totalPtpAmount,
        ptpRate: dispositionStats.total > 0 ? (dispositionStats.ptp / dispositionStats.total) * 100 : 0,
      },
      calls: calls.map(call => ({
        id: call.id,
        phoneNumber: call.phoneNumber,
        agent: call.agent ? `${call.agent.firstName} ${call.agent.lastName}` : 'Unknown',
        status: call.status,
        duration: call.durationSeconds,
        startTime: call.startTime,
        endTime: call.endTime,
      })),
    };
  }

  async getAgentReport(agentId: string, startDate?: Date, endDate?: Date) {
    const where: any = { agentId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const calls = await this.callAttemptsRepository.find({
      where,
      relations: ['campaign', 'allocation'],
    });

    const dispositions = await this.dispositionsRepository.find({
      where: {
        callAttempt: { agentId },
        ...(startDate && endDate ? { createdAt: Between(startDate, endDate) } : {}),
      },
      relations: ['callAttempt'],
    });

    const stats = {
      totalCalls: calls.length,
      answeredCalls: calls.filter(c => c.status === CallStatus.ANSWERED).length,
      completedCalls: calls.filter(c => c.status === CallStatus.COMPLETED).length,
      abandonedCalls: calls.filter(c => c.status === CallStatus.ABANDONED).length,
    };

    const totalDuration = calls
      .filter(c => c.durationSeconds)
      .reduce((sum, c) => sum + c.durationSeconds, 0);

    const averageDuration = stats.answeredCalls > 0 ? totalDuration / stats.answeredCalls : 0;

    const dispositionStats = {
      ptp: dispositions.filter(d => d.dispositionType === DispositionType.PTP).length,
      rtp: dispositions.filter(d => d.dispositionType === DispositionType.RTP).length,
      ntp: dispositions.filter(d => d.dispositionType === DispositionType.NTP).length,
      dnc: dispositions.filter(d => d.dispositionType === DispositionType.DNC).length,
    };

    const totalPtpAmount = dispositions
      .filter(d => d.ptpAmount)
      .reduce((sum, d) => sum + Number(d.ptpAmount), 0);

    return {
      agent: await this.usersRepository.findOne({ where: { id: agentId } }),
      period: { startDate, endDate },
      stats: {
        ...stats,
        averageDuration,
        totalDuration,
      },
      dispositionStats: {
        ...dispositionStats,
        totalPtpAmount,
      },
    };
  }

  async getOverallReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const calls = await this.callAttemptsRepository.find({
      where,
      relations: ['agent', 'campaign'],
    });

    const campaigns = await this.campaignsRepository.find({
      where: { isActive: true },
    });

    const agents = await this.usersRepository.find({
      where: { role: UserRole.AGENT, isActive: true },
    });

    const stats = {
      totalCalls: calls.length,
      answeredCalls: calls.filter(c => c.status === CallStatus.ANSWERED).length,
      completedCalls: calls.filter(c => c.status === CallStatus.COMPLETED).length,
      abandonedCalls: calls.filter(c => c.status === CallStatus.ABANDONED).length,
      activeCampaigns: campaigns.length,
      activeAgents: agents.length,
    };

    return {
      period: { startDate, endDate },
      stats,
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        dialMode: campaign.dialMode,
        isActive: campaign.isActive,
      })),
      agents: agents.map(agent => ({
        id: agent.id,
        name: `${agent.firstName} ${agent.lastName}`,
        username: agent.username,
      })),
    };
  }
}


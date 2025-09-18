import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Campaign } from '../entities/campaign.entity';
import { Allocation } from '../entities/allocation.entity';
import { CallAttempt } from '../entities/call-attempt.entity';
import { Disposition } from '../entities/disposition.entity';
import { Callback } from '../entities/callback.entity';
import { DncNumber } from '../entities/dnc-number.entity';
import { AgentStatus } from '../entities/agent-status.entity';

export class DatabaseService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/debt_recovery_crm',
      entities: [
        User,
        Campaign,
        Allocation,
        CallAttempt,
        Disposition,
        Callback,
        DncNumber,
        AgentStatus,
      ],
      synchronize: true,
      logging: false,
    });
  }

  async connect(): Promise<void> {
    await this.dataSource.initialize();
    console.log('Connected to PostgreSQL database');
  }

  async disconnect(): Promise<void> {
    await this.dataSource.destroy();
    console.log('Disconnected from PostgreSQL database');
  }

  getRepository(entity: any) {
    return this.dataSource.getRepository(entity);
  }

  async getNextAllocation(agentId: string, campaignId: string): Promise<Allocation | null> {
    const allocationRepo = this.getRepository(Allocation);
    return await allocationRepo.findOne({
      where: {
        campaignId,
        status: 'pending',
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    }) as Allocation | null;
  }

  async createCallAttempt(callAttemptData: Partial<CallAttempt>): Promise<CallAttempt> {
    const callAttemptRepo = this.getRepository(CallAttempt);
    const callAttempt = callAttemptRepo.create(callAttemptData);
    return await callAttemptRepo.save(callAttempt) as CallAttempt;
  }

  async updateCallAttempt(id: string, updateData: Partial<CallAttempt>): Promise<void> {
    const callAttemptRepo = this.getRepository(CallAttempt);
    await callAttemptRepo.update(id, updateData);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const campaignRepo = this.getRepository(Campaign);
    return await campaignRepo.find({
      where: { isActive: true },
      relations: ['allocations'],
    }) as Campaign[];
  }

  async getAvailableAgents(campaignId: string): Promise<User[]> {
    const userRepo = this.getRepository(User);
    const agentStatusRepo = this.getRepository(AgentStatus);
    
    const availableAgents = await agentStatusRepo.find({
      where: {
        status: 'ready',
        campaignId,
      },
      relations: ['agent'],
    });

    return availableAgents.map(status => status.agent);
  }

  async updateAgentStatus(agentId: string, status: string, campaignId?: string): Promise<void> {
    const agentStatusRepo = this.getRepository(AgentStatus);
    const existingStatus = await agentStatusRepo.findOne({
      where: { agentId },
    });

    if (existingStatus) {
      await agentStatusRepo.update(agentId, {
        status,
        campaignId,
        lastActivity: new Date(),
      });
    } else {
      const newStatus = agentStatusRepo.create({
        agentId,
        status,
        campaignId,
        lastActivity: new Date(),
      });
      await agentStatusRepo.save(newStatus);
    }
  }

  async isDncNumber(phoneNumber: string): Promise<boolean> {
    const dncRepo = this.getRepository(DncNumber);
    const dncNumber = await dncRepo.findOne({
      where: { phoneNumber },
    });
    return !!dncNumber;
  }

  async addDncNumber(phoneNumber: string, reason: string, addedById: string): Promise<void> {
    const dncRepo = this.getRepository(DncNumber);
    const dncNumber = dncRepo.create({
      phoneNumber,
      reason,
      addedById,
    });
    await dncRepo.save(dncNumber);
  }

  async getCallStats(campaignId?: string, agentId?: string): Promise<any> {
    const callAttemptRepo = this.getRepository(CallAttempt);
    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (agentId) where.agentId = agentId;

    const calls = await callAttemptRepo.find({ where });
    
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.status === 'answered').length;
    const completedCalls = calls.filter(c => c.status === 'completed').length;
    const abandonedCalls = calls.filter(c => c.status === 'abandoned').length;
    
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


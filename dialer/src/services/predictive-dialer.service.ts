import { DialerService } from './dialer.service';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { CallType, CallStatus } from '../entities/call-attempt.entity';
import * as cron from 'node-cron';

export class PredictiveDialer {
  private isRunning = false;
  private dialingInterval: NodeJS.Timeout | null = null;

  constructor(
    private dialerService: DialerService,
    private databaseService: DatabaseService,
    private redisService: RedisService,
  ) {}

  start(): void {
    if (this.isRunning) {
      console.log('Predictive dialer is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting predictive dialer...');

    // Run predictive algorithm every 10 seconds
    this.dialingInterval = setInterval(async () => {
      await this.runPredictiveAlgorithm();
    }, 10000);

    // Start cron job for cleanup
    cron.schedule('0 0 * * *', () => {
      this.cleanupOldCalls();
    });
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('Predictive dialer is not running');
      return;
    }

    this.isRunning = false;
    if (this.dialingInterval) {
      clearInterval(this.dialingInterval);
      this.dialingInterval = null;
    }

    console.log('Predictive dialer stopped');
  }

  private async runPredictiveAlgorithm(): Promise<void> {
    try {
      const activeCampaigns = await this.databaseService.getActiveCampaigns();
      
      for (const campaign of activeCampaigns) {
        if (campaign.dialMode !== 'predictive') {
          continue;
        }

        await this.processCampaign(campaign);
      }
    } catch (error) {
      console.error('Error in predictive algorithm:', error);
    }
  }

  private async processCampaign(campaign: any): Promise<void> {
    try {
      // Get available agents for this campaign
      const availableAgents = await this.databaseService.getAvailableAgents(campaign.id);
      
      if (availableAgents.length === 0) {
        return; // No agents available
      }

      // Get pending allocations
      const pendingAllocations = await this.databaseService.getRepository('Allocation').find({
        where: {
          campaignId: campaign.id,
          status: 'pending',
        },
        take: availableAgents.length * 2, // Dial ahead ratio
        order: {
          priority: 'DESC',
          createdAt: 'ASC',
        },
      });

      if (pendingAllocations.length === 0) {
        return; // No allocations to dial
      }

      // Calculate dial rate based on target occupancy and abandon rate
      const dialRate = this.calculateDialRate(
        availableAgents.length,
        campaign.targetOccupancy,
        campaign.abandonCap
      );

      // Get current call stats for abandon rate calculation
      const stats = await this.databaseService.getCallStats(campaign.id);
      const currentAbandonRate = stats.abandonRate;

      // Adjust dial rate if abandon rate is too high
      const adjustedDialRate = currentAbandonRate > campaign.abandonCap 
        ? Math.max(0, dialRate - 1) 
        : dialRate;

      // Dial the calculated number of calls
      const callsToDial = Math.min(adjustedDialRate, pendingAllocations.length);
      
      for (let i = 0; i < callsToDial; i++) {
        const allocation = pendingAllocations[i];
        const agent = availableAgents[i % availableAgents.length];

        try {
          // Update allocation status
          await this.databaseService.getRepository('Allocation').update(allocation.id, {
            status: 'in_progress',
          });

          // Make the call
          await this.dialerService.makeCall(
            allocation.phoneNumber,
            agent.id,
            campaign.id,
            CallType.PREDICTIVE
          );

          // Update agent status to on_call
          await this.databaseService.updateAgentStatus(agent.id, 'on_call', campaign.id);

        } catch (error) {
          console.error(`Error dialing ${allocation.phoneNumber}:`, error);
          
          // Reset allocation status on error
          await this.databaseService.getRepository('Allocation').update(allocation.id, {
            status: 'pending',
          });
        }
      }

    } catch (error) {
      console.error('Error processing campaign:', error);
    }
  }

  private calculateDialRate(
    availableAgents: number,
    targetOccupancy: number,
    abandonCap: number
  ): number {
    // Basic predictive dialing formula
    // Dial rate = (target_occupancy * available_agents) / average_handle_time
    // For simplicity, using a fixed AHT of 300 seconds (5 minutes)
    const averageHandleTime = 300;
    const baseDialRate = Math.ceil((targetOccupancy / 100) * availableAgents * 3600 / averageHandleTime);
    
    // Apply abandon rate factor
    const abandonFactor = 1 - (abandonCap / 100);
    const dialRate = Math.ceil(baseDialRate * abandonFactor);
    
    return Math.max(1, dialRate); // Minimum 1 call per interval
  }

  private async cleanupOldCalls(): Promise<void> {
    try {
      // Clean up calls older than 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const oldCalls = await this.databaseService.getRepository('CallAttempt').find({
        where: {
          createdAt: { $lt: yesterday },
          status: 'initiated',
        },
      });

      for (const call of oldCalls) {
        await this.databaseService.updateCallAttempt(call.id, {
          status: CallStatus.FAILED,
          endTime: new Date(),
        });
      }

      console.log(`Cleaned up ${oldCalls.length} old calls`);
    } catch (error) {
      console.error('Error cleaning up old calls:', error);
    }
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}


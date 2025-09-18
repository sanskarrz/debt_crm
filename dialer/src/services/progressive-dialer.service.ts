import { DialerService } from './dialer.service';
import { DatabaseService } from './database.service';
import { CallType } from '../entities/call-attempt.entity';

export class ProgressiveDialer {
  constructor(
    private dialerService: DialerService,
    private databaseService: DatabaseService,
  ) {}

  async callNext(agentId: string): Promise<any> {
    try {
      // Get agent's current campaign
      const agentStatus = await this.databaseService.getRepository('AgentStatus').findOne({
        where: { agentId, status: 'ready' },
      });

      if (!agentStatus) {
        throw new Error('Agent not ready or not assigned to campaign');
      }

      const campaignId = agentStatus.campaignId;
      if (!campaignId) {
        throw new Error('Agent not assigned to any campaign');
      }

      // Get next allocation for the agent
      const allocation = await this.databaseService.getNextAllocation(agentId, campaignId);
      if (!allocation) {
        throw new Error('No more allocations available');
      }

      // Update allocation status
      await this.databaseService.getRepository('Allocation').update(allocation.id, {
        status: 'in_progress',
      });

      // Make the call
      const result = await this.dialerService.makeCall(
        allocation.phoneNumber,
        agentId,
        campaignId,
        CallType.PROGRESSIVE
      );

      return {
        success: true,
        allocation,
        callAttemptId: result.callAttemptId,
        channelId: result.channelId,
      };
    } catch (error) {
      console.error('Error in progressive dialer:', error);
      throw error;
    }
  }

  async endCall(callAttemptId: string, disposition?: string): Promise<void> {
    try {
      await this.dialerService.endCall(callAttemptId, disposition);
    } catch (error) {
      console.error('Error ending call in progressive dialer:', error);
      throw error;
    }
  }

  async abandonCall(callAttemptId: string): Promise<void> {
    try {
      await this.dialerService.abandonCall(callAttemptId);
    } catch (error) {
      console.error('Error abandoning call in progressive dialer:', error);
      throw error;
    }
  }
}


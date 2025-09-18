import { RedisService } from './redis.service';
import { DatabaseService } from './database.service';
import { AsteriskService } from './asterisk.service';
import { CallType, CallStatus } from '../entities/call-attempt.entity';

export class DialerService {
  private activeCampaigns: Map<string, any> = new Map();
  private activeCalls: Map<string, any> = new Map();

  constructor(
    private redisService: RedisService,
    private databaseService: DatabaseService,
    private asteriskService: AsteriskService,
  ) {}

  async startCampaign(campaignId: string): Promise<any> {
    try {
      const campaigns = await this.databaseService.getActiveCampaigns();
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found or not active');
      }

      this.activeCampaigns.set(campaignId, {
        ...campaign,
        startTime: new Date(),
        stats: {
          totalCalls: 0,
          answeredCalls: 0,
          completedCalls: 0,
          abandonedCalls: 0,
        },
      });

      // Publish campaign started event
      await this.redisService.publish('campaign:started', {
        campaignId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Campaign ${campaignId} started`);
      return { success: true, campaignId };
    } catch (error) {
      console.error('Error starting campaign:', error);
      throw error;
    }
  }

  async stopCampaign(campaignId: string): Promise<any> {
    try {
      this.activeCampaigns.delete(campaignId);
      
      // Publish campaign stopped event
      await this.redisService.publish('campaign:stopped', {
        campaignId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Campaign ${campaignId} stopped`);
      return { success: true, campaignId };
    } catch (error) {
      console.error('Error stopping campaign:', error);
      throw error;
    }
  }

  async getCampaignStatus(campaignId: string): Promise<any> {
    const campaign = this.activeCampaigns.get(campaignId);
    if (!campaign) {
      return { active: false };
    }

    return {
      active: true,
      campaign,
      stats: campaign.stats,
      uptime: Date.now() - campaign.startTime.getTime(),
    };
  }

  async makeCall(phoneNumber: string, agentId: string, campaignId: string, callType: CallType): Promise<any> {
    try {
      // Check if number is on DNC list
      const isDnc = await this.databaseService.isDncNumber(phoneNumber);
      if (isDnc) {
        throw new Error('Number is on DNC list');
      }

      // Check time window (09:00-21:00 IST)
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
      const hour = istTime.getHours();
      
      if (hour < 9 || hour > 21) {
        throw new Error('Outside allowed calling hours (09:00-21:00 IST)');
      }

      const campaign = this.activeCampaigns.get(campaignId);
      if (!campaign) {
        throw new Error('Campaign not active');
      }

      // Create call attempt record
      const callAttempt = await this.databaseService.createCallAttempt({
        phoneNumber,
        agentId,
        campaignId,
        callType,
        status: CallStatus.INITIATED,
        startTime: new Date(),
      });

      // Originate call via Asterisk
      const channelId = await this.asteriskService.originateCall(
        phoneNumber,
        campaign.callerId,
        'outbound'
      );

      // Store active call
      this.activeCalls.set(callAttempt.id, {
        callAttemptId: callAttempt.id,
        channelId,
        agentId,
        campaignId,
        phoneNumber,
        startTime: new Date(),
      });

      // Update call attempt with channel ID
      await this.databaseService.updateCallAttempt(callAttempt.id, {
        asteriskCallId: channelId,
        status: CallStatus.RINGING,
      });

      // Publish call initiated event
      await this.redisService.publish('call:initiated', {
        callAttemptId: callAttempt.id,
        agentId,
        campaignId,
        phoneNumber,
        timestamp: new Date().toISOString(),
      });

      console.log(`Call initiated: ${phoneNumber} for agent ${agentId}`);
      return { success: true, callAttemptId: callAttempt.id, channelId };
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  async answerCall(callAttemptId: string): Promise<void> {
    try {
      const activeCall = this.activeCalls.get(callAttemptId);
      if (!activeCall) {
        throw new Error('Call not found');
      }

      await this.databaseService.updateCallAttempt(callAttemptId, {
        status: CallStatus.ANSWERED,
        answerTime: new Date(),
      });

      // Publish call answered event
      await this.redisService.publish('call:answered', {
        callAttemptId,
        agentId: activeCall.agentId,
        campaignId: activeCall.campaignId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Call answered: ${callAttemptId}`);
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async endCall(callAttemptId: string, disposition?: string): Promise<void> {
    try {
      const activeCall = this.activeCalls.get(callAttemptId);
      if (!activeCall) {
        throw new Error('Call not found');
      }

      // Hang up channel
      await this.asteriskService.hangupChannel(activeCall.channelId);

      // Calculate duration
      const duration = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000);

      // Update call attempt
      await this.databaseService.updateCallAttempt(callAttemptId, {
        status: CallStatus.COMPLETED,
        endTime: new Date(),
        durationSeconds: duration,
      });

      // Remove from active calls
      this.activeCalls.delete(callAttemptId);

      // Update campaign stats
      const campaign = this.activeCampaigns.get(activeCall.campaignId);
      if (campaign) {
        campaign.stats.totalCalls++;
        campaign.stats.answeredCalls++;
        campaign.stats.completedCalls++;
      }

      // Publish call ended event
      await this.redisService.publish('call:ended', {
        callAttemptId,
        agentId: activeCall.agentId,
        campaignId: activeCall.campaignId,
        duration,
        disposition,
        timestamp: new Date().toISOString(),
      });

      console.log(`Call ended: ${callAttemptId}, duration: ${duration}s`);
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  async abandonCall(callAttemptId: string): Promise<void> {
    try {
      const activeCall = this.activeCalls.get(callAttemptId);
      if (!activeCall) {
        throw new Error('Call not found');
      }

      // Hang up channel
      await this.asteriskService.hangupChannel(activeCall.channelId);

      // Update call attempt
      await this.databaseService.updateCallAttempt(callAttemptId, {
        status: CallStatus.ABANDONED,
        endTime: new Date(),
      });

      // Remove from active calls
      this.activeCalls.delete(callAttemptId);

      // Update campaign stats
      const campaign = this.activeCampaigns.get(activeCall.campaignId);
      if (campaign) {
        campaign.stats.totalCalls++;
        campaign.stats.abandonedCalls++;
      }

      // Publish call abandoned event
      await this.redisService.publish('call:abandoned', {
        callAttemptId,
        agentId: activeCall.agentId,
        campaignId: activeCall.campaignId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Call abandoned: ${callAttemptId}`);
    } catch (error) {
      console.error('Error abandoning call:', error);
      throw error;
    }
  }

  async getActiveCalls(): Promise<any[]> {
    return Array.from(this.activeCalls.values());
  }

  async getCampaignStats(campaignId: string): Promise<any> {
    const campaign = this.activeCampaigns.get(campaignId);
    if (!campaign) {
      return null;
    }

    return campaign.stats;
  }
}


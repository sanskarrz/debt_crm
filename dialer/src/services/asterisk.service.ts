import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

export class AsteriskService {
  private httpClient: AxiosInstance;
  private wsClient: WebSocket | null = null;
  private isConnected = false;

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.ASTERISK_URL || 'http://localhost:8088',
      auth: {
        username: process.env.ASTERISK_USER || 'admin',
        password: process.env.ASTERISK_PASSWORD || 'admin',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async connect(): Promise<void> {
    try {
      // Test HTTP connection
      await this.httpClient.get('/ari/applications');
      console.log('Connected to Asterisk ARI');
      this.isConnected = true;

      // Connect WebSocket for real-time events
      await this.connectWebSocket();
    } catch (error) {
      console.error('Failed to connect to Asterisk:', error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    const wsUrl = `ws://${process.env.ASTERISK_USER || 'admin'}:${process.env.ASTERISK_PASSWORD || 'admin'}@localhost:8088/ari/events?app=debt-recovery-crm`;
    
    this.wsClient = new WebSocket(wsUrl);
    
    this.wsClient.on('open', () => {
      console.log('Connected to Asterisk WebSocket');
    });

    this.wsClient.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString());
        this.handleAsteriskEvent(event);
      } catch (error) {
        console.error('Error parsing Asterisk event:', error);
      }
    });

    this.wsClient.on('error', (error) => {
      console.error('Asterisk WebSocket error:', error);
    });

    this.wsClient.on('close', () => {
      console.log('Asterisk WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          this.connectWebSocket();
        }
      }, 5000);
    });
  }

  private handleAsteriskEvent(event: any): void {
    console.log('Asterisk Event:', event.type, event);
    
    // Handle different event types
    switch (event.type) {
      case 'StasisStart':
        this.handleStasisStart(event);
        break;
      case 'ChannelAnswered':
        this.handleChannelAnswered(event);
        break;
      case 'ChannelHangupRequest':
        this.handleChannelHangupRequest(event);
        break;
      case 'ChannelDestroyed':
        this.handleChannelDestroyed(event);
        break;
      default:
        // Handle other events as needed
        break;
    }
  }

  private handleStasisStart(event: any): void {
    console.log('Call started:', event.channel.id);
  }

  private handleChannelAnswered(event: any): void {
    console.log('Call answered:', event.channel.id);
  }

  private handleChannelHangupRequest(event: any): void {
    console.log('Call hangup requested:', event.channel.id);
  }

  private handleChannelDestroyed(event: any): void {
    console.log('Call ended:', event.channel.id);
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    if (this.wsClient) {
      this.wsClient.close();
    }
    console.log('Disconnected from Asterisk');
  }

  async originateCall(phoneNumber: string, callerId: string, context: string = 'outbound'): Promise<string> {
    try {
      const response = await this.httpClient.post('/ari/channels', {
        endpoint: `PJSIP/${phoneNumber}@airtel-trunk`,
        app: 'debt-recovery-crm',
        appArgs: [phoneNumber],
        callerId: callerId,
        timeout: 30,
      });

      return response.data.id;
    } catch (error) {
      console.error('Error originating call:', error);
      throw error;
    }
  }

  async bridgeChannels(channel1Id: string, channel2Id: string): Promise<void> {
    try {
      await this.httpClient.post(`/ari/bridges`, {
        type: 'mixing',
        channels: [channel1Id, channel2Id],
      });
    } catch (error) {
      console.error('Error bridging channels:', error);
      throw error;
    }
  }

  async hangupChannel(channelId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/ari/channels/${channelId}`);
    } catch (error) {
      console.error('Error hanging up channel:', error);
      throw error;
    }
  }

  async getChannelInfo(channelId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/ari/channels/${channelId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting channel info:', error);
      throw error;
    }
  }

  async startRecording(channelId: string): Promise<string> {
    try {
      const response = await this.httpClient.post('/ari/recordings/live', {
        name: `call_${channelId}_${Date.now()}`,
        format: 'wav',
        maxDurationSeconds: 3600,
        terminateOn: 'none',
        beep: false,
        channels: [channelId],
      });
      return response.data.name;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(recordingName: string): Promise<void> {
    try {
      await this.httpClient.post(`/ari/recordings/live/${recordingName}/stop`);
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  async getRecordingUrl(recordingName: string): Promise<string> {
    return `/recordings/${recordingName}.wav`;
  }

  isConnectedToAsterisk(): boolean {
    return this.isConnected;
  }
}


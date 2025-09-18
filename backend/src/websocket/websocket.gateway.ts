import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WSGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      
      this.connectedClients.set(client.id, client);
      console.log(`Client connected: ${client.id}, User: ${payload.username}`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-campaign')
  handleJoinCampaign(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { campaignId: string },
  ) {
    client.join(`campaign-${data.campaignId}`);
    console.log(`User ${client.data.user.username} joined campaign ${data.campaignId}`);
  }

  @SubscribeMessage('leave-campaign')
  handleLeaveCampaign(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { campaignId: string },
  ) {
    client.leave(`campaign-${data.campaignId}`);
    console.log(`User ${client.data.user.username} left campaign ${data.campaignId}`);
  }

  @SubscribeMessage('agent-status-update')
  handleAgentStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agentId: string; status: string; campaignId?: string },
  ) {
    // Broadcast to all clients in the campaign
    if (data.campaignId) {
      this.server.to(`campaign-${data.campaignId}`).emit('agent-status-changed', {
        agentId: data.agentId,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('call-update')
  handleCallUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callAttemptId: string; status: string; campaignId: string },
  ) {
    // Broadcast call updates to campaign clients
    this.server.to(`campaign-${data.campaignId}`).emit('call-status-changed', {
      callAttemptId: data.callAttemptId,
      status: data.status,
      timestamp: new Date().toISOString(),
    });
  }

  // Methods to broadcast events from services
  broadcastCampaignStarted(campaignId: string) {
    this.server.emit('campaign-started', {
      campaignId,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastCampaignStopped(campaignId: string) {
    this.server.emit('campaign-stopped', {
      campaignId,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastCallInitiated(campaignId: string, callData: any) {
    this.server.to(`campaign-${campaignId}`).emit('call-initiated', callData);
  }

  broadcastCallAnswered(campaignId: string, callData: any) {
    this.server.to(`campaign-${campaignId}`).emit('call-answered', callData);
  }

  broadcastCallEnded(campaignId: string, callData: any) {
    this.server.to(`campaign-${campaignId}`).emit('call-ended', callData);
  }

  broadcastAgentStatusChange(agentId: string, status: string, campaignId?: string) {
    if (campaignId) {
      this.server.to(`campaign-${campaignId}`).emit('agent-status-changed', {
        agentId,
        status,
        timestamp: new Date().toISOString(),
      });
    } else {
      this.server.emit('agent-status-changed', {
        agentId,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }
}


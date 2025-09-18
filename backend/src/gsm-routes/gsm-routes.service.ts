import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GsmRoute } from '../database/entities/gsm-route.entity';
import { CreateGsmRouteDto } from './dto/create-gsm-route.dto';
import { UpdateGsmRouteDto } from './dto/update-gsm-route.dto';

@Injectable()
export class GsmRoutesService {
  constructor(
    @InjectRepository(GsmRoute)
    private gsmRoutesRepository: Repository<GsmRoute>,
  ) {}

  async create(createGsmRouteDto: CreateGsmRouteDto): Promise<GsmRoute> {
    const gsmRoute = this.gsmRoutesRepository.create(createGsmRouteDto);
    return this.gsmRoutesRepository.save(gsmRoute);
  }

  async findAll(): Promise<GsmRoute[]> {
    return this.gsmRoutesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<GsmRoute> {
    return this.gsmRoutesRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateGsmRouteDto: UpdateGsmRouteDto): Promise<GsmRoute> {
    await this.gsmRoutesRepository.update(id, updateGsmRouteDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.gsmRoutesRepository.delete(id);
  }

  async toggleActive(id: string): Promise<GsmRoute> {
    const gsmRoute = await this.findOne(id);
    gsmRoute.isActive = !gsmRoute.isActive;
    return this.gsmRoutesRepository.save(gsmRoute);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const gsmRoute = await this.findOne(id);
      if (!gsmRoute) {
        return { success: false, message: 'GSM route not found' };
      }

      // Here you would implement actual GSM gateway connection testing
      // For now, we'll simulate a test
      const testResult = await this.performGsmTest(gsmRoute);
      
      return testResult;
    } catch (error) {
      return { success: false, message: `Test failed: ${error.message}` };
    }
  }

  private async performGsmTest(gsmRoute: GsmRoute): Promise<{ success: boolean; message: string }> {
    // Simulate GSM gateway connection test
    // In a real implementation, you would:
    // 1. Ping the gateway IP
    // 2. Test SIP registration
    // 3. Check channel availability
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate test result (75% success rate for demo)
        const success = Math.random() > 0.25;
        resolve({
          success,
          message: success 
            ? 'GSM gateway connection test successful' 
            : 'GSM gateway connection test failed - check network and credentials'
        });
      }, 3000);
    });
  }

  async getActiveRoutes(): Promise<GsmRoute[]> {
    return this.gsmRoutesRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getChannelStatus(id: string): Promise<{ channel: number; status: string; signal: number }[]> {
    const gsmRoute = await this.findOne(id);
    if (!gsmRoute) {
      return [];
    }

    // Simulate channel status
    const channels = [];
    for (let i = 1; i <= gsmRoute.channelCount; i++) {
      channels.push({
        channel: i,
        status: Math.random() > 0.3 ? 'ready' : 'busy',
        signal: Math.floor(Math.random() * 100)
      });
    }
    
    return channels;
  }
}


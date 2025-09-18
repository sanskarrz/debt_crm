import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SipRoute } from '../database/entities/sip-route.entity';
import { CreateSipRouteDto } from './dto/create-sip-route.dto';
import { UpdateSipRouteDto } from './dto/update-sip-route.dto';

@Injectable()
export class SipRoutesService {
  constructor(
    @InjectRepository(SipRoute)
    private sipRoutesRepository: Repository<SipRoute>,
  ) {}

  async create(createSipRouteDto: CreateSipRouteDto): Promise<SipRoute> {
    const sipRoute = this.sipRoutesRepository.create(createSipRouteDto);
    return this.sipRoutesRepository.save(sipRoute);
  }

  async findAll(): Promise<SipRoute[]> {
    return this.sipRoutesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SipRoute> {
    return this.sipRoutesRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateSipRouteDto: UpdateSipRouteDto): Promise<SipRoute> {
    await this.sipRoutesRepository.update(id, updateSipRouteDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.sipRoutesRepository.delete(id);
  }

  async toggleActive(id: string): Promise<SipRoute> {
    const sipRoute = await this.findOne(id);
    sipRoute.isActive = !sipRoute.isActive;
    return this.sipRoutesRepository.save(sipRoute);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const sipRoute = await this.findOne(id);
      if (!sipRoute) {
        return { success: false, message: 'SIP route not found' };
      }

      // Here you would implement actual SIP connection testing
      // For now, we'll simulate a test
      const testResult = await this.performSipTest(sipRoute);
      
      return testResult;
    } catch (error) {
      return { success: false, message: `Test failed: ${error.message}` };
    }
  }

  private async performSipTest(sipRoute: SipRoute): Promise<{ success: boolean; message: string }> {
    // Simulate SIP connection test
    // In a real implementation, you would:
    // 1. Create a SIP client
    // 2. Attempt to register with the provider
    // 3. Test basic connectivity
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate test result (80% success rate for demo)
        const success = Math.random() > 0.2;
        resolve({
          success,
          message: success 
            ? 'SIP connection test successful' 
            : 'SIP connection test failed - check credentials and network'
        });
      }, 2000);
    });
  }

  async getActiveRoutes(): Promise<SipRoute[]> {
    return this.sipRoutesRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}


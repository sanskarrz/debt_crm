import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../database/entities/campaign.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string): Promise<Campaign> {
    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      createdById: userId,
    });
    return this.campaignsRepository.save(campaign);
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      relations: ['createdBy', 'allocations'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    return this.campaignsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'allocations', 'callAttempts'],
    });
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    await this.campaignsRepository.update(id, updateCampaignDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.campaignsRepository.delete(id);
  }

  async toggleActive(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.isActive = !campaign.isActive;
    return this.campaignsRepository.save(campaign);
  }

  async getCampaignStats(id: string) {
    const campaign = await this.findOne(id);
    const allocations = await this.allocationsRepository.find({
      where: { campaignId: id },
    });

    const totalAllocations = allocations.length;
    const completedAllocations = allocations.filter(a => a.status === 'completed').length;
    const inProgressAllocations = allocations.filter(a => a.status === 'in_progress').length;
    const pendingAllocations = allocations.filter(a => a.status === 'pending').length;

    return {
      campaign,
      stats: {
        totalAllocations,
        completedAllocations,
        inProgressAllocations,
        pendingAllocations,
        completionRate: totalAllocations > 0 ? (completedAllocations / totalAllocations) * 100 : 0,
      },
    };
  }
}


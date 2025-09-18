import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { Allocation } from '../database/entities/allocation.entity';
import { Campaign } from '../database/entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allocation, Campaign])],
  providers: [AllocationsService],
  controllers: [AllocationsController],
  exports: [AllocationsService],
})
export class AllocationsModule {}


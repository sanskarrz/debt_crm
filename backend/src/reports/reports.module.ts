import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CallAttempt } from '../database/entities/call-attempt.entity';
import { Disposition } from '../database/entities/disposition.entity';
import { Campaign } from '../database/entities/campaign.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CallAttempt, Disposition, Campaign, Allocation, User])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}


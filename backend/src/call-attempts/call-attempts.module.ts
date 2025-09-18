import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallAttemptsService } from './call-attempts.service';
import { CallAttemptsController } from './call-attempts.controller';
import { CallAttempt } from '../database/entities/call-attempt.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { User } from '../database/entities/user.entity';
import { Campaign } from '../database/entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CallAttempt, Allocation, User, Campaign])],
  providers: [CallAttemptsService],
  controllers: [CallAttemptsController],
  exports: [CallAttemptsService],
})
export class CallAttemptsModule {}


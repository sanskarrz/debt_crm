import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DncService } from './dnc.service';
import { DncController } from './dnc.controller';
import { DncNumber } from '../database/entities/dnc-number.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DncNumber, User])],
  providers: [DncService],
  controllers: [DncController],
  exports: [DncService],
})
export class DncModule {}


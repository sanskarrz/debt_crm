import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositionsService } from './dispositions.service';
import { DispositionsController } from './dispositions.controller';
import { Disposition } from '../database/entities/disposition.entity';
import { CallAttempt } from '../database/entities/call-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disposition, CallAttempt])],
  providers: [DispositionsService],
  controllers: [DispositionsController],
  exports: [DispositionsService],
})
export class DispositionsModule {}


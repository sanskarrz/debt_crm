import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallbacksService } from './callbacks.service';
import { CallbacksController } from './callbacks.controller';
import { Callback } from '../database/entities/callback.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Callback, Allocation, User])],
  providers: [CallbacksService],
  controllers: [CallbacksController],
  exports: [CallbacksService],
})
export class CallbacksModule {}


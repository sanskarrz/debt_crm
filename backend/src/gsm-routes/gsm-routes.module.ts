import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GsmRoutesService } from './gsm-routes.service';
import { GsmRoutesController } from './gsm-routes.controller';
import { GsmRoute } from '../database/entities/gsm-route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GsmRoute])],
  providers: [GsmRoutesService],
  controllers: [GsmRoutesController],
  exports: [GsmRoutesService],
})
export class GsmRoutesModule {}


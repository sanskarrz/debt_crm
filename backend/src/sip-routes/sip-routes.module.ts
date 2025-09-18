import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SipRoutesService } from './sip-routes.service';
import { SipRoutesController } from './sip-routes.controller';
import { SipRoute } from '../database/entities/sip-route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SipRoute])],
  providers: [SipRoutesService],
  controllers: [SipRoutesController],
  exports: [SipRoutesService],
})
export class SipRoutesModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Campaign } from './entities/campaign.entity';
import { Allocation } from './entities/allocation.entity';
import { CallAttempt } from './entities/call-attempt.entity';
import { Disposition } from './entities/disposition.entity';
import { Callback } from './entities/callback.entity';
import { DncNumber } from './entities/dnc-number.entity';
import { AgentStatus } from './entities/agent-status.entity';
import { SipRoute } from './entities/sip-route.entity';
import { GsmRoute } from './entities/gsm-route.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [
          User,
          Campaign,
          Allocation,
          CallAttempt,
          Disposition,
          Callback,
          DncNumber,
          AgentStatus,
          SipRoute,
          GsmRoute,
        ],
        synchronize: true, // Set to false in production
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Campaign,
      Allocation,
      CallAttempt,
      Disposition,
      Callback,
      DncNumber,
      AgentStatus,
      SipRoute,
      GsmRoute,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}


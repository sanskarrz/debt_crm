import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AllocationsModule } from './allocations/allocations.module';
import { CallAttemptsModule } from './call-attempts/call-attempts.module';
import { DispositionsModule } from './dispositions/dispositions.module';
import { CallbacksModule } from './callbacks/callbacks.module';
import { DncModule } from './dnc/dnc.module';
import { ReportsModule } from './reports/reports.module';
import { WebSocketModule } from './websocket/websocket.module';
import { DatabaseModule } from './database/database.module';
import { SipRoutesModule } from './sip-routes/sip-routes.module';
import { GsmRoutesModule } from './gsm-routes/gsm-routes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CampaignsModule,
    AllocationsModule,
    CallAttemptsModule,
    DispositionsModule,
    CallbacksModule,
    DncModule,
    ReportsModule,
    WebSocketModule,
    SipRoutesModule,
    GsmRoutesModule,
  ],
})
export class AppModule {}

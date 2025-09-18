import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CallType } from '../../database/entities/call-attempt.entity';

export class CreateCallAttemptDto {
  @IsUUID()
  allocationId: string;

  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsUUID()
  campaignId: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(CallType)
  callType: CallType;
}


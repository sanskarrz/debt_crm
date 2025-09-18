import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateCallbackDto {
  @IsUUID()
  allocationId: string;

  @IsUUID()
  agentId: string;

  @IsDateString()
  callbackDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}


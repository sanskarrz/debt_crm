import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { AllocationPriority } from '../../database/entities/allocation.entity';

export class CreateAllocationDto {
  @IsUUID()
  campaignId: string;

  @IsString()
  debtorName: string;

  @IsString()
  phoneNumber: string;

  @IsNumber()
  amountDue: number;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  lastPaymentDate?: string;

  @IsOptional()
  @IsNumber()
  lastPaymentAmount?: number;

  @IsOptional()
  @IsEnum(AllocationPriority)
  priority?: AllocationPriority;

  @IsOptional()
  @IsString()
  notes?: string;
}


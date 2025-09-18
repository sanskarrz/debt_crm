import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { DispositionType } from '../../database/entities/disposition.entity';

export class CreateDispositionDto {
  @IsUUID()
  callAttemptId: string;

  @IsEnum(DispositionType)
  dispositionType: DispositionType;

  @IsOptional()
  @IsNumber()
  ptpAmount?: number;

  @IsOptional()
  @IsDateString()
  ptpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  callbackDate?: string;
}


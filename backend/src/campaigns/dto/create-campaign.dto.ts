import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { DialMode } from '../../database/entities/campaign.entity';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DialMode)
  dialMode: DialMode;

  @IsString()
  callerId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetOccupancy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  abandonCap?: number;

  @IsOptional()
  @IsString()
  sipRoute?: string;

  @IsOptional()
  @IsString()
  gsmRoute?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


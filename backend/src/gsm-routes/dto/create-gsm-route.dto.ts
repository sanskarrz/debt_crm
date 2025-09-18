import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateGsmRouteDto {
  @IsString()
  name: string;

  @IsString()
  gatewayHost: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  gatewayPort?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(32)
  channelCount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateSipRouteDto {
  @IsString()
  name: string;

  @IsString()
  provider: string;

  @IsString()
  host: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  callerId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


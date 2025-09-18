import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDncNumberDto {
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsUUID()
  addedById: string;
}


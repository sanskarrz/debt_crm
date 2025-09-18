import { IsString, IsOptional } from 'class-validator';

export class UploadAllocationsDto {
  @IsString()
  campaignId: string;

  @IsOptional()
  @IsString()
  fileType?: string;
}


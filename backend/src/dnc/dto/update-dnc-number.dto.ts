import { PartialType } from '@nestjs/mapped-types';
import { CreateDncNumberDto } from './create-dnc-number.dto';

export class UpdateDncNumberDto extends PartialType(CreateDncNumberDto) {}


import { PartialType } from '@nestjs/mapped-types';
import { CreateDispositionDto } from './create-disposition.dto';

export class UpdateDispositionDto extends PartialType(CreateDispositionDto) {}


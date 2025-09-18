import { PartialType } from '@nestjs/mapped-types';
import { CreateCallbackDto } from './create-callback.dto';

export class UpdateCallbackDto extends PartialType(CreateCallbackDto) {}


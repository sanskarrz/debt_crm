import { PartialType } from '@nestjs/mapped-types';
import { CreateCallAttemptDto } from './create-call-attempt.dto';

export class UpdateCallAttemptDto extends PartialType(CreateCallAttemptDto) {}


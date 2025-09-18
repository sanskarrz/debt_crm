import { PartialType } from '@nestjs/mapped-types';
import { CreateGsmRouteDto } from './create-gsm-route.dto';

export class UpdateGsmRouteDto extends PartialType(CreateGsmRouteDto) {}


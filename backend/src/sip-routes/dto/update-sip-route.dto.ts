import { PartialType } from '@nestjs/mapped-types';
import { CreateSipRouteDto } from './create-sip-route.dto';

export class UpdateSipRouteDto extends PartialType(CreateSipRouteDto) {}


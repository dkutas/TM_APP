import { PartialType } from '@nestjs/mapped-types';
import { CreateLinkTypeDto } from './create-link-type.dto';

export class UpdateLinkTypeDto extends PartialType(CreateLinkTypeDto) {}

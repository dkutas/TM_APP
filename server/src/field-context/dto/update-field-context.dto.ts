import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldContextDto } from './create-field-context.dto';

export class UpdateFieldContextDto extends PartialType(CreateFieldContextDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldOptionDto } from './create-field-option.dto';

export class UpdateFieldOptionDto extends PartialType(CreateFieldOptionDto) {}

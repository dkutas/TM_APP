import { FieldOption } from '../../field-option/entities/field-option.entity';

export class CreateFieldContextDto {
  fieldDefId: string;
  projectId: string;
  issueTypeId: string;
  min: string;
  max: string;
  regex: string;
  required: boolean;
  options?: FieldOption[];
  defaultOption?: FieldOption;
  defaultValue?: string;
}

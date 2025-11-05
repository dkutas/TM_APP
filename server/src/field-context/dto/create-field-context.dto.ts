import { FieldOption } from '../../field-option/entities/field-option.entity';

export class CreateFieldContextDto {
  fieldDefId: string;
  projectId: string;
  issueTypeId: string;
  min: string;
  max: string;
  regex: string;
  required: boolean;
  defaultOption?: FieldOption;
  defaultValue?: string;
}

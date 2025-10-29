import { DataType } from '../../common/enums';

export class CreateFieldDefinitionDto {
  name: string;
  dataType: DataType;
  description?: string;
}

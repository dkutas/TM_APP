import { RoleEnum } from '../../common/enums';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  systemRole: RoleEnum;
}

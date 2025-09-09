import { SystemRole } from '../entities/user.entity';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  systemRole: SystemRole;
}

import { User } from '../../user/entities/user.entity';

export class AttachFileDto {
  user: User;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
}

import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export type UserIssueRole = 'assignee' | 'reporter' | 'watcher';

export class UserIssuesQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['assignee', 'reporter', 'watcher'])
  role?: UserIssueRole;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @IsUUID()
  priorityId?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

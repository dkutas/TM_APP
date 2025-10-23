import { Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { FieldContext } from '../field-context/entities/field-context.entity';
import { FieldDefinition } from '../field-definition/entities/field-definition.entity';
import { FieldOption } from '../field-option/entities/field-option.entity';
import {
  IssueFieldValue,
  IssueFieldValueOption,
} from '../issue-field-value/entities/issue-field-value.entity';
import { IssueRepository } from '../repositories/issue.repository';
import { FieldContextRepository } from '../repositories/field-context.repository';
import { IssueFieldValueRepository } from '../repositories/issue-field-value.repository';
import { IssueFieldValueOptionRepository } from '../repositories/issue-field-value-option.repository';
import { AttachmentRepository } from '../repositories/attachment.repository';
import { ChangeLogRepository } from '../repositories/change-log.repository';
import { IssueLinkRepository } from '../repositories/issue-link.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { Attachment } from '../attachment/entities/attachment.entity';
import { Comment } from '../comment/entities/comment.entity';
import { IssueLink } from '../link-type/entities/link-type.entity';
import {
  ChangeItem,
  ChangeLog,
} from '../change-log/entities/change-log.entity';
import { ProjectIssueTypeRepository } from '../repositories/project-issue-type.repository';
import { WorkflowTransitionRepository } from '../repositories/workflow-transition.repository';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Issue,
      FieldContext,
      FieldDefinition,
      FieldOption,
      IssueFieldValue,
      IssueFieldValueOption,
      Attachment,
      Comment,
      IssueLink,
      ChangeLog,
      ChangeItem,
      User,
    ]),
  ],
  controllers: [IssueController],
  providers: [
    IssueService,
    IssueRepository,
    FieldContextRepository,
    IssueFieldValueRepository,
    IssueFieldValueOptionRepository,
    AttachmentRepository,
    CommentRepository,
    ChangeLogRepository,
    IssueLinkRepository,
    ProjectIssueTypeRepository,
    WorkflowTransitionRepository,
  ],
})
export class IssueModule {}

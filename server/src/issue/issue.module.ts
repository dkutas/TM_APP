import { Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { FieldContext } from '../field-context/entities/field-context.entity';
import { FieldDefinition } from '../field-definition/entities/field-definition.entity';
import { FieldOption } from '../field-option/entities/field-option.entity';
import { IssueFieldValue } from '../issue-field-value/entities/issue-field-value.entity';
import { IssueRepository } from './issue.repository';
import { FieldContextRepository } from '../field-context/field-context.repository';
import { IssueFieldValueRepository } from '../issue-field-value/issue-field-value.repository';
import { IssueFieldValueOptionRepository } from '../issue-field-value/issue-field-value-option.repository';
import { AttachmentRepository } from '../attachment/attachment.repository';
import { ChangeLogRepository } from '../change-log/change-log.repository';
import { IssueLinkRepository } from '../link-type/issue-link.repository';
import { CommentRepository } from '../comment/comment.repository';
import { Attachment } from '../attachment/entities/attachment.entity';
import { Comment } from '../comment/entities/comment.entity';
import { ChangeLog } from '../change-log/entities/change-log.entity';
import { ProjectIssueTypeRepository } from '../project/project-issue-type.repository';
import { WorkflowTransitionRepository } from '../workflow/workflow-transition.repository';
import { User } from '../user/entities/user.entity';
import { IssueLink } from '../link-type/entities/issue-link.entity';
import { AttachmentService } from '../attachment/attachment.service';
import { ChangeItem } from '../change-log/entities/change-item.entity';
import { IssueFieldValueOption } from '../issue-field-value/entities/issue-field-value-option.entity';

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
    AttachmentService,
  ],
})
export class IssueModule {}

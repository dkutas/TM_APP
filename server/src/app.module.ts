import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { IssueTypeModule } from './issue-type/issue-type.module';
import { IssueModule } from './issue/issue.module';
import { LinkTypeModule } from './link-type/link-type.module';
import { PriorityModule } from './priority/priority.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AttachmentModule } from './attachment/attachment.module';
import { CommentModule } from './comment/comment.module';
import { IssueFieldValueModule } from './issue-field-value/issue-field-value.module';
import { FieldDefinitionModule } from './field-definition/field-definition.module';
import { FieldOptionModule } from './field-option/field-option.module';
import { FieldContextModule } from './field-context/field-context.module';
import { User } from './user/entities/user.entity';
import { Project } from './project/entities/project.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import {
  Workflow,
  WorkflowStatus,
  WorkflowTransition,
} from './workflow/entities/workflow.entity';
import { ProjectIssueType } from './project/entities/projectIssueType.entity';
import { Priority } from './priority/entities/priority.entity';
import { LinkType } from './link-type/entities/link-type.entity';
import { IssueType } from './issue-type/entities/issue-type.entity';
import {
  IssueFieldValue,
  IssueFieldValueOption,
} from './issue-field-value/entities/issue-field-value.entity';
import { Issue } from './issue/entities/issue.entity';
import { FieldOption } from './field-option/entities/field-option.entity';
import { FieldDefinition } from './field-definition/entities/field-definition.entity';
import { FieldContext } from './field-context/entities/field-context.entity';
import { Attachment } from './attachment/entities/attachment.entity';
import { Comment } from './comment/entities/comment.entity';
import { ProjectHierarchyRuleModule } from './project-hierarchy-rule/project-hierarchy-rule.module';
import { ChangeLogModule } from './change-log/change-log.module';
import { RoleModule } from './role/role.module';
import {
  Permission,
  ProjectMembership,
  Role,
  RolePermission,
} from './role/entities/role.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ChangeItem, ChangeLog } from './change-log/entities/change-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'app',
      password: process.env.DB_PASS || 'app_pw',
      database: process.env.DB_NAME || 'app_db',
      entities: [
        User,
        Project,
        RefreshToken,
        Workflow,
        WorkflowStatus,
        WorkflowTransition,
        ProjectIssueType,
        Priority,
        LinkType,
        IssueType,
        IssueFieldValue,
        Issue,
        FieldOption,
        FieldDefinition,
        FieldContext,
        Comment,
        Attachment,
        IssueFieldValueOption,
        Role,
        Permission,
        ChangeLog,
        ChangeItem,
        RolePermission,
        ProjectMembership,
      ],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ProjectModule,
    IssueTypeModule,
    IssueModule,
    LinkTypeModule,
    PriorityModule,
    WorkflowModule,
    AttachmentModule,
    CommentModule,
    IssueFieldValueModule,
    FieldDefinitionModule,
    FieldOptionModule,
    FieldContextModule,
    ProjectHierarchyRuleModule,
    RoleModule,
    ChangeLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

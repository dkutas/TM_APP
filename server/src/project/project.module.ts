import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectIssueType } from './entities/projectIssueType.entity';
import { ProjectMembership } from '../role/entities/role.entity';
import { FieldContextRepository } from '../repositories/field-context.repository';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectIssueType,
      ProjectMembership,
      User,
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, FieldContextRepository],
  exports: [ProjectService],
})
export class ProjectModule {}

import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import {
  Workflow,
  WorkflowStatus,
  WorkflowTransition,
} from './entities/workflow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectIssueType } from '../project/entities/projectIssueType.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workflow,
      WorkflowStatus,
      WorkflowTransition,
      ProjectIssueType,
    ]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule {}

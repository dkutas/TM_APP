import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { Workflow } from './entities/workflow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectIssueType } from '../project/entities/projectIssueType.entity';
import { WorkflowStatus } from './entities/workflow-status.entity';
import { WorkflowTransition } from './entities/workflow-transition.entity';

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

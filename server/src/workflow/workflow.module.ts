import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { Workflow } from './entities/workflow.entity';
import { WorkflowTransition } from './entities/workflowTransition.entity';
import { WorkflowStatus } from './entities/workflowStatus.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowTransition, WorkflowStatus]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule {}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Workflow } from './workflow.entity';

enum StatusCategory {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}
@Entity('workflowStatus')
export class WorkflowStatus {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() key: string;
  @Column() name: string;
  @Column() description: StatusCategory;
  @OneToMany(() => Workflow, (workflow) => workflow.workflowStatuses)
  workflow: Workflow;
}

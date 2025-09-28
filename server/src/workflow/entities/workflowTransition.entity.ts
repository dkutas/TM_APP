import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Workflow } from './workflow.entity';

@Entity('workflowTransition')
export class WorkflowTransition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') fromStatusId: string;
  @Column('uuid') toStatusId: string;
  @Column() name: string;
  @OneToMany(() => Workflow, (workflow) => workflow.workflowTransitions)
  workflow: Workflow;
}

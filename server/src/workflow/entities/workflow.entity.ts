import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowStatus } from './workflowStatus.entity';
import { WorkflowTransition } from './workflowTransition.entity';

@Entity('workflow')
export class Workflow {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ length: 255, nullable: true }) description: string;
  @ManyToOne(() => WorkflowStatus, (status) => status.workflow)
  workflowStatuses: WorkflowStatus[];
  @ManyToOne(() => WorkflowStatus, (transition) => transition.workflow)
  workflowTransitions: WorkflowTransition[];
}

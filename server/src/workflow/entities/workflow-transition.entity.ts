import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkflowStatus } from './workflow-status.entity';
import { Workflow } from './workflow.entity';

@Entity('workflow_transitions')
@Index(['workflow', 'fromStatus', 'toStatus'], { unique: true })
export class WorkflowTransition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Workflow, (w) => w.transitions, { onDelete: 'CASCADE' })
  workflow: Workflow;

  @ManyToOne(() => WorkflowStatus, { onDelete: 'CASCADE' })
  fromStatus: WorkflowStatus;
  @ManyToOne(() => WorkflowStatus, { onDelete: 'CASCADE' })
  toStatus: WorkflowStatus;

  @Column({ length: 100 }) name: string;
}
